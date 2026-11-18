import crypto from 'crypto';
import type express from 'express';
import { db, logAudit } from './db.ts';
import { getClientIp, recordSecurityEvent } from './security.ts';

export interface AbuseInspectionResult {
  isAbusive: boolean;
  severity: 'none' | 'moderate' | 'severe';
  matchedCategory: string;
  reason: string;
}

const SEVERE_ABUSE_PATTERNS: Array<{ category: string; regex: RegExp; reason: string }> = [
  {
    category: 'violent_threat',
    regex: /\b(kill\s+you|murder\s+you|stab\s+you|shoot\s+you|hurt\s+you|burn\s+your|beat\s+you|i\s+will\s+destroy\s+you|drop\s+dead|go\s+die|wish\s+you\s+were\s+dead)\b/i,
    reason: 'Direct threat of physical violence or self-harm incitement detected'
  },
  {
    category: 'severe_profanity_harassment',
    regex: /\b(fuck\s*you|fuck\s*off|motherfucker|bitch+|asshole|bastard|slut|whore|cunt|dickhead|dumbass|piece\s+of\s+shit|eat\s+shit)\b/i,
    reason: 'Severe abusive profanity and targeted harassment detected'
  },
  {
    category: 'hate_dehumanization',
    regex: /\b(nigger|faggot|retard(?:ed)?|subhuman|worthless\s+(?:trash|scum|idiot)|scumbag)\b/i,
    reason: 'Hate slur or dehumanizing verbal abuse detected'
  },
  {
    category: 'extortion_coercion',
    regex: /\b(send\s+nudes|blackmail|extort|leak\s+your\s+records|pay\s+me\s+or\s+else)\b/i,
    reason: 'Sexual coercion, blackmail, or patient record extortion threat detected'
  }
];

const MODERATE_ABUSE_REGEX =
  /\b(stupid\s+doctor|idiot|moron|shut\s+up|you\s+are\s+useless|pathetic\s+loser|scammer|fraudster|fake\s+doctor|harass)\b/i;

export function inspectContentForAbuse(text: string): AbuseInspectionResult {
  const clean = String(text || '').trim();
  if (!clean) {
    return { isAbusive: false, severity: 'none', matchedCategory: '', reason: '' };
  }

  for (const rule of SEVERE_ABUSE_PATTERNS) {
    if (rule.regex.test(clean)) {
      return {
        isAbusive: true,
        severity: 'severe',
        matchedCategory: rule.category,
        reason: rule.reason
      };
    }
  }

  if (MODERATE_ABUSE_REGEX.test(clean)) {
    return {
      isAbusive: true,
      severity: 'moderate',
      matchedCategory: 'verbal_abuse',
      reason: 'Targeted insulting or hostile language detected'
    };
  }

  // Hostile excessive shouting flood check (>24 uppercase letters and multiple exclamation bursts)
  const upperLetters = (clean.match(/[A-Z]/g) || []).length;
  const totalLetters = (clean.match(/[A-Za-z]/g) || []).length;
  const exclamationBursts = (clean.match(/!{3,}/g) || []).length;
  if (totalLetters >= 25 && upperLetters / totalLetters > 0.88 && exclamationBursts >= 2) {
    return {
      isAbusive: true,
      severity: 'moderate',
      matchedCategory: 'hostile_flooding',
      reason: 'Hostile shouting flood pattern detected'
    };
  }

  return { isAbusive: false, severity: 'none', matchedCategory: '', reason: '' };
}

export function getPairKey(userA: string, userB: string): string {
  return [String(userA).trim(), String(userB).trim()].sort().join('::');
}

export function getConnectionBetween(userA: string, userB: string): any | null {
  if (!userA || !userB || userA === userB) return null;
  const pairKey = getPairKey(userA, userB);
  return db.prepare('SELECT * FROM account_connections WHERE pair_key = ?').get(pairKey) || null;
}

export function blockConversationForAbuse(params: {
  offenderId: string;
  offenderEmail?: string;
  offenderRole?: string;
  targetId: string;
  channel: string;
  category: string;
  severity: string;
  reason: string;
  excerpt: string;
  ip?: string;
}) {
  const pairKey = getPairKey(params.offenderId, params.targetId);
  const nowIso = new Date().toISOString();
  const existing = db.prepare('SELECT * FROM account_connections WHERE pair_key = ?').get(pairKey) as any;

  let connectionId = existing?.id || `conn-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  if (existing) {
    db.prepare(`
      UPDATE account_connections
      SET status = 'blocked_abuse', blocked_by = ?, block_reason = ?, patient_data_consent = 0, updated_at = ?
      WHERE id = ?
    `).run(params.offenderId, params.reason, nowIso, existing.id);
  } else {
    db.prepare(`
      INSERT INTO account_connections (
        id, pair_key, requester_id, recipient_id, status, request_note,
        initiated_by, blocked_by, block_reason, patient_data_consent, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'blocked_abuse', 'Auto-locked by abuse shield', ?, ?, ?, 0, ?, ?)
    `).run(
      connectionId,
      pairKey,
      params.offenderId,
      params.targetId,
      params.offenderId,
      params.offenderId,
      params.reason,
      nowIso,
      nowIso
    );
  }

  const incidentId = `mod-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  db.prepare(`
    INSERT INTO moderation_incidents (
      id, offender_id, target_id, pair_key, channel, matched_category, severity, excerpt, auto_blocked, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
  `).run(
    incidentId,
    params.offenderId,
    params.targetId,
    pairKey,
    params.channel,
    params.category,
    params.severity,
    String(params.excerpt || '').slice(0, 140),
    nowIso
  );

  logAudit(
    params.offenderId,
    params.offenderEmail || 'system@doctorian.org',
    params.offenderRole || 'user',
    'CONVERSATION_BLOCKED_ABUSE',
    connectionId,
    `Auto-blocked conversation ${pairKey}: ${params.reason}`
  );
  recordSecurityEvent(
    'ABUSE_CONVERSATION_LOCKED',
    'high',
    params.ip || '127.0.0.1',
    params.offenderEmail || params.offenderId,
    `Blocked ${pairKey} (${params.category})`
  );

  return { connectionId, incidentId, pairKey, status: 'blocked_abuse', reason: params.reason };
}

export function canUsersConverse(senderId: string, recipientId: string): {
  allowed: boolean;
  status: string;
  reason?: string;
  connection?: any;
} {
  if (!senderId || !recipientId || senderId === recipientId) {
    return { allowed: false, status: 'invalid', reason: 'Invalid sender or recipient account.' };
  }

  const sender = db.prepare('SELECT id, role, status FROM users WHERE id = ?').get(senderId) as any;
  const recipient = db.prepare('SELECT id, role, status FROM users WHERE id = ?').get(recipientId) as any;

  if (!sender || sender.role === 'guest' || sender.status !== 'active') {
    return { allowed: false, status: 'unregistered', reason: 'Only active registered accounts may communicate.' };
  }
  if (!recipient || recipient.role === 'guest' || recipient.status !== 'active') {
    return { allowed: false, status: 'unregistered_target', reason: 'Target account must be an active registered member.' };
  }

  const conn = getConnectionBetween(senderId, recipientId);
  if (!conn) {
    return {
      allowed: false,
      status: 'none',
      reason: 'Friend request must be sent and accepted before messaging this registered account.'
    };
  }

  if (conn.status === 'blocked_abuse') {
    return {
      allowed: false,
      status: 'blocked_abuse',
      reason: `Conversation locked due to abusive activity (${conn.block_reason || 'safety violation'}).`,
      connection: conn
    };
  }

  if (conn.status === 'blocked_manual') {
    return {
      allowed: false,
      status: 'blocked_manual',
      reason: 'Conversation is blocked between these two accounts.',
      connection: conn
    };
  }

  if (conn.status === 'pending') {
    return {
      allowed: false,
      status: 'pending',
      reason: 'Friend request is pending acceptance. Messaging unlocks once accepted.',
      connection: conn
    };
  }

  if (conn.status === 'declined') {
    return {
      allowed: false,
      status: 'declined',
      reason: 'Connection request was declined.',
      connection: conn
    };
  }

  return { allowed: conn.status === 'accepted', status: conn.status, connection: conn };
}

export function canAccessPatientRecord(viewer: any, patientRow: any): boolean {
  if (!viewer || viewer.role === 'guest' || !patientRow) return false;
  if (viewer.role === 'admin') return true;

  // Owner (registered patient matching user_id or full_name if user_id unassigned)
  if (patientRow.user_id && patientRow.user_id === viewer.id) return true;
  if (viewer.role === 'patient') {
    return Boolean(
      patientRow.full_name &&
      viewer.displayName &&
      patientRow.full_name.trim().toLowerCase() === viewer.displayName.trim().toLowerCase()
    );
  }

  // Assigned clinician OR accepted unblocked connection with patient user account
  if (patientRow.assigned_clinician_id && patientRow.assigned_clinician_id === viewer.id) {
    if (patientRow.user_id) {
      const conn = getConnectionBetween(viewer.id, patientRow.user_id);
      if (conn && (conn.status === 'blocked_abuse' || conn.status === 'blocked_manual')) {
        return false;
      }
    }
    return true;
  }

  if (patientRow.user_id) {
    const conn = getConnectionBetween(viewer.id, patientRow.user_id);
    return Boolean(conn && conn.status === 'accepted' && Number(conn.patient_data_consent) === 1);
  }

  return false;
}

export function resolveOrRememberPatientProfile(user: any) {
  if (!user || user.role === 'guest') return null;

  let patient = db
    .prepare('SELECT * FROM patients WHERE user_id = ? LIMIT 1')
    .get(user.id) as any;

  if (!patient && user.role === 'patient') {
    patient = db
      .prepare('SELECT * FROM patients WHERE LOWER(full_name) = LOWER(?) LIMIT 1')
      .get(user.displayName) as any;
    if (patient && !patient.user_id) {
      db.prepare('UPDATE patients SET user_id = ? WHERE id = ?').run(user.id, patient.id);
      db.prepare('UPDATE users SET linked_patient_id = ? WHERE id = ?').run(patient.id, user.id);
      patient.user_id = user.id;
    }
  }

  // Auto-provision remembered clinical record for any newly registered patient account
  if (!patient && user.role === 'patient') {
    const patId = `pat-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`;
    const mrn = `DAI-${new Date().getFullYear()}-${crypto.randomInt(2000, 9999)}`;
    db.prepare(`
      INSERT INTO patients (
        id, mrn, user_id, full_name, age, gender, district, phone, blood_group,
        allergies, chronic_conditions, risk_tier, assigned_clinician_id
      ) VALUES (?, ?, ?, ?, 28, 'Unspecified', ?, ?, 'Unknown', 'None documented', 'None documented', 'Stable', 'usr-doctor-01')
    `).run(
      patId,
      mrn,
      user.id,
      user.displayName,
      user.facility || 'Kampala',
      user.phone || null
    );
    db.prepare('UPDATE users SET linked_patient_id = ? WHERE id = ?').run(patId, user.id);
    patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(patId);
  }

  if (!patient) return null;

  const vitals = db
    .prepare('SELECT * FROM vital_signs WHERE patient_id = ? ORDER BY recorded_at DESC LIMIT 12')
    .all(patient.id);
  const prescriptions = db
    .prepare('SELECT * FROM prescriptions WHERE patient_id = ? ORDER BY created_at DESC LIMIT 20')
    .all(patient.id);
  const labs = db
    .prepare('SELECT * FROM lab_results WHERE patient_id = ? ORDER BY created_at DESC LIMIT 20')
    .all(patient.id);
  const appointments = db
    .prepare('SELECT * FROM appointments WHERE patient_id = ? ORDER BY scheduled_for DESC LIMIT 12')
    .all(patient.id);

  return {
    patient,
    vitals,
    prescriptions,
    labs,
    appointments
  };
}

export function setupConnectionsRoutes(
  app: express.Application,
  dispatchNeuralSignal?: (signal: any) => any
) {
  // 1. Registered Accounts Directory + Friend Request / Block Statuses
  app.get('/api/connections/directory', (req: any, res) => {
    if (!req.user || req.user.role === 'guest') {
      return res.status(401).json({
        error: 'Registered account sign-in required. Guests cannot view registered user directories.'
      });
    }

    const meId = req.user.id;
    const users = db
      .prepare(`
        SELECT u.id, u.email, u.display_name, u.role, u.specialty, u.facility, u.phone, u.license_verified,
               p.id as patient_id, p.mrn as patient_mrn, p.district as patient_district, p.risk_tier as patient_risk_tier
        FROM users u
        LEFT JOIN patients p ON p.user_id = u.id
        WHERE u.status = 'active' AND u.role != 'guest' AND u.id != ?
        ORDER BY CASE u.role WHEN 'doctor' THEN 1 WHEN 'nurse' THEN 2 WHEN 'admin' THEN 3 ELSE 4 END, u.display_name ASC
      `)
      .all(meId) as any[];

    const myConns = db
      .prepare('SELECT * FROM account_connections WHERE requester_id = ? OR recipient_id = ? ORDER BY updated_at DESC')
      .all(meId, meId) as any[];

    const connByPeer = new Map<string, any>();
    for (const c of myConns) {
      const peerId = c.requester_id === meId ? c.recipient_id : c.requester_id;
      connByPeer.set(peerId, c);
    }

    const accounts = users.map((u) => {
      const c = connByPeer.get(u.id);
      let uiStatus: 'none' | 'pending_outgoing' | 'pending_incoming' | 'accepted' | 'declined' | 'blocked_abuse' | 'blocked_manual' = 'none';
      if (c) {
        if (c.status === 'pending') {
          uiStatus = c.requester_id === meId ? 'pending_outgoing' : 'pending_incoming';
        } else {
          uiStatus = c.status;
        }
      }
      const isConnected = uiStatus === 'accepted';
      return {
        id: u.id,
        displayName: u.display_name,
        role: u.role,
        specialty: u.specialty || (u.role === 'patient' ? 'Registered Patient' : 'Healthcare Staff'),
        facility: u.facility || 'Doctorian Network',
        licenseVerified: Boolean(u.license_verified),
        // Restrict phone & patient details unless accepted friend/care connection or admin
        phone: isConnected || req.user.role === 'admin' ? u.phone : undefined,
        email: isConnected || req.user.role === 'admin' ? u.email : undefined,
        patientRecordId: isConnected || req.user.role === 'admin' ? u.patient_id : undefined,
        patientMrn: isConnected || req.user.role === 'admin' ? u.patient_mrn : undefined,
        patientDistrict: isConnected || req.user.role === 'admin' ? u.patient_district : undefined,
        patientRiskTier: isConnected || req.user.role === 'admin' ? u.patient_risk_tier : undefined,
        connectionId: c?.id || null,
        connectionStatus: uiStatus,
        requestNote: c?.request_note || null,
        blockReason: c?.block_reason || null,
        blockedByMe: c?.blocked_by === meId,
        updatedAt: c?.updated_at || null
      };
    });

    const incidents = db
      .prepare('SELECT * FROM moderation_incidents WHERE offender_id = ? OR target_id = ? ORDER BY created_at DESC LIMIT 20')
      .all(meId, meId) as any[];

    return res.json({
      success: true,
      accounts,
      summary: {
        totalRegistered: accounts.length,
        accepted: accounts.filter((a) => a.connectionStatus === 'accepted').length,
        pendingIncoming: accounts.filter((a) => a.connectionStatus === 'pending_incoming').length,
        pendingOutgoing: accounts.filter((a) => a.connectionStatus === 'pending_outgoing').length,
        blocked: accounts.filter((a) => a.connectionStatus === 'blocked_abuse' || a.connectionStatus === 'blocked_manual').length
      },
      moderationIncidents: incidents
    });
  });

  // 2. Interested User Sends Friend Request to a Registered Account
  app.post('/api/connections/request', (req: any, res) => {
    if (!req.user || req.user.role === 'guest') {
      return res.status(401).json({ error: 'You must register and sign in to send a friend request.' });
    }
    const { targetUserId, note = '' } = req.body || {};
    if (!targetUserId || targetUserId === req.user.id) {
      return res.status(400).json({ error: 'Valid target registered account is required.' });
    }

    const target = db
      .prepare("SELECT id, email, display_name, role, status FROM users WHERE id = ? AND status = 'active' AND role != 'guest'")
      .get(String(targetUserId)) as any;
    if (!target) {
      return res.status(404).json({ error: 'Target registered account not found.' });
    }

    const cleanNote = String(note || '').trim().slice(0, 220);
    if (cleanNote) {
      const abuseCheck = inspectContentForAbuse(cleanNote);
      if (abuseCheck.isAbusive) {
        blockConversationForAbuse({
          offenderId: req.user.id,
          offenderEmail: req.user.email,
          offenderRole: req.user.role,
          targetId: target.id,
          channel: 'friend_request',
          category: abuseCheck.matchedCategory,
          severity: abuseCheck.severity,
          reason: abuseCheck.reason,
          excerpt: cleanNote,
          ip: getClientIp(req)
        });
        return res.status(403).json({
          error: `Abusive language detected in connection note (${abuseCheck.reason}). Conversation locked.`,
          blockedForAbuse: true
        });
      }
    }

    const pairKey = getPairKey(req.user.id, target.id);
    const existing = db.prepare('SELECT * FROM account_connections WHERE pair_key = ?').get(pairKey) as any;
    const nowIso = new Date().toISOString();

    if (existing) {
      if (existing.status === 'blocked_abuse' || existing.status === 'blocked_manual') {
        return res.status(403).json({
          error: 'Cannot send friend request: conversation between these two accounts is blocked.'
        });
      }
      if (existing.status === 'accepted') {
        return res.json({ success: true, alreadyConnected: true, connection: existing });
      }
      if (existing.status === 'pending') {
        if (existing.requester_id === target.id) {
          // Mutual interest -> auto-accept cleanly!
          db.prepare("UPDATE account_connections SET status = 'accepted', updated_at = ? WHERE id = ?").run(nowIso, existing.id);
          return res.json({
            success: true,
            autoAccepted: true,
            message: `Both accounts requested connection — you are now connected with ${target.display_name}!`
          });
        }
        return res.status(409).json({ error: 'Friend request already pending approval.' });
      }
      // Re-open previously declined request
      db.prepare(`
        UPDATE account_connections
        SET requester_id = ?, recipient_id = ?, status = 'pending', request_note = ?, initiated_by = ?, updated_at = ?
        WHERE id = ?
      `).run(req.user.id, target.id, cleanNote || null, req.user.id, nowIso, existing.id);
    } else {
      const connId = `conn-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
      db.prepare(`
        INSERT INTO account_connections (
          id, pair_key, requester_id, recipient_id, status, request_note,
          initiated_by, patient_data_consent, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 'pending', ?, ?, 1, ?, ?)
      `).run(connId, pairKey, req.user.id, target.id, cleanNote || null, req.user.id, nowIso, nowIso);
    }

    if (dispatchNeuralSignal) {
      try {
        dispatchNeuralSignal({
          channel: 'friend_requests',
          eventType: 'alert',
          senderId: req.user.id,
          senderName: req.user.displayName,
          senderRole: req.user.role,
          targetRole: target.role,
          targetUserId: target.id,
          recipientName: target.display_name,
          subject: `New Connection Request from ${req.user.displayName}`,
          content: cleanNote || `${req.user.displayName} (${req.user.role}) wants to connect for secure Doctorian SMS & messaging.`,
          priority: 'normal'
        });
      } catch {}
    }

    logAudit(req.user.id, req.user.email, req.user.role, 'FRIEND_REQUEST_SENT', target.id, `Sent connection request to ${target.display_name}`);
    const saved = db.prepare('SELECT * FROM account_connections WHERE pair_key = ?').get(pairKey);
    return res.status(201).json({
      success: true,
      message: `Friend request sent to ${target.display_name}. Messaging unlocks once they accept.`,
      connection: saved
    });
  });

  // 3. Accept Friend Request
  app.post('/api/connections/:id/accept', (req: any, res) => {
    if (!req.user || req.user.role === 'guest') {
      return res.status(401).json({ error: 'Registered sign-in required.' });
    }
    const row = db.prepare('SELECT * FROM account_connections WHERE id = ?').get(req.params.id) as any;
    if (!row) return res.status(404).json({ error: 'Connection request not found.' });
    if (row.recipient_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the receiving account can accept this friend request.' });
    }
    if (row.status === 'blocked_abuse' || row.status === 'blocked_manual') {
      return res.status(403).json({ error: 'Cannot accept a blocked conversation.' });
    }

    const nowIso = new Date().toISOString();
    db.prepare("UPDATE account_connections SET status = 'accepted', updated_at = ? WHERE id = ?").run(nowIso, row.id);

    const requester = db.prepare('SELECT id, display_name, role FROM users WHERE id = ?').get(row.requester_id) as any;
    if (dispatchNeuralSignal && requester) {
      try {
        dispatchNeuralSignal({
          channel: 'friend_requests',
          eventType: 'signal',
          senderId: req.user.id,
          senderName: req.user.displayName,
          senderRole: req.user.role,
          targetRole: requester.role,
          targetUserId: requester.id,
          recipientName: requester.display_name,
          subject: `${req.user.displayName} Accepted Your Request`,
          content: `Your connection with ${req.user.displayName} is now active. Secure SMS & chat enabled.`,
          priority: 'normal'
        });
      } catch {}
    }

    logAudit(req.user.id, req.user.email, req.user.role, 'FRIEND_REQUEST_ACCEPTED', row.id, `Accepted connection with ${row.requester_id}`);
    return res.json({ success: true, connection: db.prepare('SELECT * FROM account_connections WHERE id = ?').get(row.id) });
  });

  // 4. Decline / Cancel Friend Request
  app.post('/api/connections/:id/decline', (req: any, res) => {
    if (!req.user || req.user.role === 'guest') {
      return res.status(401).json({ error: 'Registered sign-in required.' });
    }
    const row = db.prepare('SELECT * FROM account_connections WHERE id = ?').get(req.params.id) as any;
    if (!row) return res.status(404).json({ error: 'Connection not found.' });
    if (row.requester_id !== req.user.id && row.recipient_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    db.prepare("UPDATE account_connections SET status = 'declined', updated_at = ? WHERE id = ?").run(new Date().toISOString(), row.id);
    return res.json({ success: true, status: 'declined' });
  });

  // 5. Block / Report Abusive Conversation Between Two Accounts
  app.post('/api/connections/block', (req: any, res) => {
    if (!req.user || req.user.role === 'guest') {
      return res.status(401).json({ error: 'Registered sign-in required.' });
    }
    const { targetUserId, reason = 'Reported abusive or unwanted conversation', isAbuseReport = true } = req.body || {};
    if (!targetUserId || targetUserId === req.user.id) {
      return res.status(400).json({ error: 'Valid target user required.' });
    }
    const pairKey = getPairKey(req.user.id, String(targetUserId));
    const existing = db.prepare('SELECT * FROM account_connections WHERE pair_key = ?').get(pairKey) as any;
    const nowIso = new Date().toISOString();
    const blockStatus = isAbuseReport ? 'blocked_abuse' : 'blocked_manual';

    if (existing) {
      db.prepare(`
        UPDATE account_connections
        SET status = ?, blocked_by = ?, block_reason = ?, patient_data_consent = 0, updated_at = ?
        WHERE id = ?
      `).run(blockStatus, req.user.id, String(reason).slice(0, 220), nowIso, existing.id);
    } else {
      const connId = `conn-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
      db.prepare(`
        INSERT INTO account_connections (
          id, pair_key, requester_id, recipient_id, status, request_note,
          initiated_by, blocked_by, block_reason, patient_data_consent, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, 'Safety Block', ?, ?, ?, 0, ?, ?)
      `).run(connId, pairKey, req.user.id, String(targetUserId), blockStatus, req.user.id, req.user.id, String(reason).slice(0, 220), nowIso, nowIso);
    }

    if (isAbuseReport) {
      db.prepare(`
        INSERT INTO moderation_incidents (
          id, offender_id, target_id, pair_key, channel, matched_category, severity, excerpt, auto_blocked, created_at
        ) VALUES (?, ?, ?, ?, 'user_report', 'manual_abuse_report', 'high', ?, 1, ?)
      `).run(`mod-${Date.now()}`, String(targetUserId), req.user.id, pairKey, String(reason).slice(0, 140), nowIso);
    }

    logAudit(req.user.id, req.user.email, req.user.role, 'CONVERSATION_BLOCKED', String(targetUserId), `${blockStatus}: ${reason}`);
    return res.json({ success: true, status: blockStatus, reason });
  });

  // 6. Unblock Manually Blocked Conversation (Abuse blocks require admin review)
  app.post('/api/connections/:id/unblock', (req: any, res) => {
    if (!req.user || req.user.role === 'guest') {
      return res.status(401).json({ error: 'Registered sign-in required.' });
    }
    const row = db.prepare('SELECT * FROM account_connections WHERE id = ?').get(req.params.id) as any;
    if (!row) return res.status(404).json({ error: 'Connection record not found.' });
    if (row.status === 'blocked_abuse' && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Abuse-locked conversations are strictly sealed and require Administrator safety clearance to lift.'
      });
    }
    if (row.blocked_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only the account that initiated the block may lift it.' });
    }
    db.prepare("UPDATE account_connections SET status = 'accepted', blocked_by = NULL, block_reason = NULL, updated_at = ? WHERE id = ?")
      .run(new Date().toISOString(), row.id);
    return res.json({ success: true, status: 'accepted' });
  });

  // 7. Remembered Patient Dossier for Authenticated User
  app.get('/api/patient-memory/me', (req: any, res) => {
    if (!req.user || req.user.role === 'guest') {
      return res.status(401).json({ error: 'Sign in with a registered account to view remembered patient records.' });
    }
    const dossier = resolveOrRememberPatientProfile(req.user);
    return res.json({
      success: true,
      remembered: Boolean(dossier),
      patientMemory: dossier,
      dossier
    });
  });

  app.put('/api/patient-memory/me', (req: any, res) => {
    if (!req.user || req.user.role === 'guest') {
      return res.status(401).json({ error: 'Sign in with a registered account to update your remembered medical profile.' });
    }
    const { district, phone, bloodGroup, allergies, chronicConditions, age, gender } = req.body || {};
    const dossier = resolveOrRememberPatientProfile(req.user);
    if (!dossier?.patient) {
      return res.status(404).json({ error: 'No editable patient profile bound to this clinician/admin account.' });
    }
    const p = dossier.patient;
    db.prepare(`
      UPDATE patients
      SET district = ?, phone = ?, blood_group = ?, allergies = ?, chronic_conditions = ?,
          age = ?, gender = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      district !== undefined ? String(district).trim().slice(0, 80) : p.district,
      phone !== undefined ? String(phone).trim().slice(0, 30) : p.phone,
      bloodGroup !== undefined ? String(bloodGroup).trim().slice(0, 12) : p.blood_group,
      allergies !== undefined ? String(allergies).trim().slice(0, 240) : p.allergies,
      chronicConditions !== undefined ? String(chronicConditions).trim().slice(0, 240) : p.chronic_conditions,
      age !== undefined && Number(age) > 0 ? Math.min(130, Number(age)) : p.age,
      gender !== undefined ? String(gender).trim().slice(0, 24) : p.gender,
      p.id
    );
    if (phone !== undefined) {
      db.prepare('UPDATE users SET phone = ? WHERE id = ?').run(String(phone).trim().slice(0, 30), req.user.id);
    }
    logAudit(req.user.id, req.user.email, req.user.role, 'PATIENT_MEMORY_UPDATED', p.id, 'Updated remembered patient medical details');
    const updatedDossier = resolveOrRememberPatientProfile(req.user);
    return res.json({ success: true, patientMemory: updatedDossier, dossier: updatedDossier });
  });

  // 8. Restricted Cross-User Patient Dossier Inspection (Requires Connection or Ownership)
  app.get('/api/patient-memory/:patientId', (req: any, res) => {
    if (!req.user || req.user.role === 'guest') {
      return res.status(401).json({ error: 'Unregistered or guest users cannot access patient clinical details.' });
    }
    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.patientId) as any;
    if (!patient) {
      return res.status(404).json({ error: 'Patient record not found.' });
    }
    if (!canAccessPatientRecord(req.user, patient)) {
      recordSecurityEvent(
        'PATIENT_RECORD_ACCESS_DENIED',
        'warning',
        getClientIp(req),
        req.user.email,
        `Denied unconnected access to patient ${patient.id}`
      );
      return res.status(403).json({
        error: 'Access Restricted: Connect with this patient via an accepted friend request before viewing their medical data.',
        connectionRequired: true,
        targetUserId: patient.user_id || null
      });
    }

    const vitals = db.prepare('SELECT * FROM vital_signs WHERE patient_id = ? ORDER BY recorded_at DESC LIMIT 12').all(patient.id);
    const prescriptions = db.prepare('SELECT * FROM prescriptions WHERE patient_id = ? ORDER BY created_at DESC LIMIT 20').all(patient.id);
    const labs = db.prepare('SELECT * FROM lab_results WHERE patient_id = ? ORDER BY created_at DESC LIMIT 20').all(patient.id);
    return res.json({
      success: true,
      dossier: { patient, vitals, prescriptions, labs }
    });
  });
}
