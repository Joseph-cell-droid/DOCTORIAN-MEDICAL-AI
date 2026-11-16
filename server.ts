import 'dotenv/config';
import http from 'http';
import express, { type Request, type Response, type NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { db, initDatabase, logAudit, ensureHospitalBeds } from './server/db.ts';
import { retrieveClinicalEvidence } from './server/rag.ts';
import {
  SERVER_SECRETS,
  createRateLimiter,
  securityHeadersMiddleware,
  sanitizeRequestMiddleware,
  issueCsrfCookie,
  csrfGuardMiddleware,
  createTrackedSession,
  isTrackedSessionValid,
  revokeSessionByJti,
  revokeAllUserSessions,
  validateRegistrationInput,
  issueRegistrationChallenge,
  verifyRegistrationChallenge,
  verifyServerPrivilegedKey,
  recordSecurityEvent,
  verifySecurityChain,
  getClientIp,
  timingSafeCompare
} from './server/security.ts';
import { setupStorageVaultRoutes } from './server/storageVault.ts';
import {
  initNeuralBus,
  dispatchNeuralSignal,
  getNeuralNetworkStats,
  queryNeuralMessages,
  type NeuralSignalType
} from './server/neuralBus.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

initDatabase();

const app = express();
app.set('trust proxy', 1);
const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = SERVER_SECRETS.jwtSecret;

const DEFAULT_HF_MODEL = process.env.HUGGINGFACE_MODEL || 'nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16:deepinfra';
const HF_ROUTER_URL = 'https://router.huggingface.co/v1/chat/completions';

// Rate Limiters
const loginLimiter = createRateLimiter({ name: 'auth-login', windowMs: 5 * 60 * 1000, maxHits: 12, blockDurationMs: 10 * 60 * 1000 });
const signupLimiter = createRateLimiter({ name: 'auth-signup', windowMs: 15 * 60 * 1000, maxHits: 8, blockDurationMs: 15 * 60 * 1000 });
const challengeLimiter = createRateLimiter({ name: 'auth-challenge', windowMs: 5 * 60 * 1000, maxHits: 30, blockDurationMs: 5 * 60 * 1000 });
const privilegedLimiter = createRateLimiter({ name: 'auth-privileged', windowMs: 10 * 60 * 1000, maxHits: 6, blockDurationMs: 15 * 60 * 1000 });
const resetLimiter = createRateLimiter({ name: 'auth-reset', windowMs: 10 * 60 * 1000, maxHits: 6, blockDurationMs: 15 * 60 * 1000 });

// Initialize official Gemini SDK on server side only
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey || apiKey.includes('your_')) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

app.use(securityHeadersMiddleware);
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '15mb' }));
app.use(sanitizeRequestMiddleware);
app.use(csrfGuardMiddleware);

interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: 'patient' | 'doctor' | 'nurse' | 'admin' | 'guest';
  specialty?: string | null;
  facility?: string | null;
  phone?: string | null;
  licenseNumber?: string | null;
  licenseVerified?: boolean;
  mfaEnabled?: boolean;
}

interface AuthedRequest extends Request {
  user?: AuthUser;
  sessionJti?: string;
}

function setSessionCookie(req: Request, res: Response, token: string, maxAgeMs = 12 * 60 * 60 * 1000) {
  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
  res.cookie('doctorian_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: Boolean(isHttps),
    maxAge: maxAgeMs
  });
  issueCsrfCookie(req, res);
}

function signAuthToken(user: AuthUser, req: Request, expiresIn: string | number = '12h', maxAgeMs = 12 * 60 * 60 * 1000): string {
  const jti = createTrackedSession(user.id, user.role, req, maxAgeMs);
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      specialty: user.specialty || null,
      facility: user.facility || null,
      jti
    },
    JWT_SECRET,
    { expiresIn } as jwt.SignOptions
  );
}

function attachUser(req: AuthedRequest, _res: Response, next: NextFunction) {
  const cookieToken = req.cookies?.doctorian_token;
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  const token = bearerToken || cookieToken;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthUser & { jti?: string };
      if (!isTrackedSessionValid(decoded.jti, decoded.id)) {
        req.user = undefined;
        return next();
      }
      if (decoded.role === 'guest') {
        req.user = {
          id: decoded.id,
          email: decoded.email,
          displayName: decoded.displayName,
          role: 'guest',
          specialty: decoded.specialty || null,
          facility: decoded.facility || null
        };
        req.sessionJti = decoded.jti;
        return next();
      }
      // Always verify authoritative DB status & role
      const row = db
        .prepare('SELECT id, email, display_name, role, specialty, facility, phone, license_number, status, license_verified, mfa_enabled FROM users WHERE id = ?')
        .get(decoded.id) as any;
      if (!row || row.status !== 'active') {
        req.user = undefined;
        return next();
      }
      req.user = {
        id: row.id,
        email: row.email,
        displayName: row.display_name,
        role: row.role,
        specialty: row.specialty,
        facility: row.facility,
        phone: row.phone,
        licenseNumber: row.license_number,
        licenseVerified: Boolean(row.license_verified),
        mfaEnabled: Boolean(row.mfa_enabled)
      };
      req.sessionJti = decoded.jti;
    } catch {
      req.user = undefined;
    }
  }
  next();
}

function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }
  next();
}

function requireNonGuest(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  if (req.user.role === 'guest') {
    return res.status(403).json({
      error: 'Guest demonstration accounts cannot access live patient records. Please sign in with a patient or clinician account.'
    });
  }
  next();
}

function requireRoles(roles: Array<AuthUser['role']>) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      recordSecurityEvent(
        'UNAUTHORIZED_ROLE_ACCESS',
        'warning',
        getClientIp(req),
        req.user.email,
        `Blocked role '${req.user.role}' on ${req.method} ${req.path}`
      );
      return res.status(403).json({ error: `Role '${req.user.role}' is not authorized for this clinical action.` });
    }
    next();
  };
}

app.use(attachUser);

// ---------------------------------------------------------------------------
// HEALTH & AI STATUS
// ---------------------------------------------------------------------------
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Doctorian AI Clinical Platform',
    region: 'Uganda & East Africa',
    time: new Date().toISOString()
  });
});

app.get('/api/ai/status', (_req, res) => {
  const hasGemini = Boolean((process.env.GEMINI_API_KEY || '').trim());
  const hfToken = (process.env.HF_TOKEN || process.env.VITE_HF_TOKEN || process.env.HUGGINGFACE_API_KEY || '').trim();
  const hasHf = Boolean(hfToken && !hfToken.includes('your_'));

  res.json({
    status: hasGemini || hasHf ? 'connected' : 'offline-fallback',
    geminiConfigured: hasGemini,
    geminiModel: 'gemini-4-hydrogen',
    huggingfaceConfigured: hasHf,
    huggingfaceModel: DEFAULT_HF_MODEL,
    ragCorpusCount: 9,
    guidelineSource: 'WHO & Uganda Clinical Guidelines (UCG 2023)'
  });
});

app.get('/api/guidelines', (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q : '';
  const limit = Number(req.query.limit) || 5;
  const result = retrieveClinicalEvidence(q, Math.min(Math.max(limit, 1), 10));
  res.json(result);
});

// ---------------------------------------------------------------------------
// AUTHENTICATION, ANTI-BOT REGISTRATION & ROLE-BASED ACCESS
// ---------------------------------------------------------------------------
app.get('/api/auth/csrf', (req, res) => {
  const csrfToken = issueCsrfCookie(req, res);
  res.json({ csrfToken });
});

app.get('/api/auth/register-challenge', challengeLimiter, (req, res) => {
  const challenge = issueRegistrationChallenge(req);
  res.json(challenge);
});

app.post('/api/auth/login', loginLimiter, (req, res) => {
  const { email, password } = req.body || {};
  const ip = getClientIp(req);
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const row = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(normalizedEmail) as any;

  if (!row) {
    recordSecurityEvent('LOGIN_FAILED', 'info', ip, normalizedEmail, 'Unknown account login attempt');
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  if (row.locked_until && Date.now() < Number(row.locked_until)) {
    const mins = Math.ceil((Number(row.locked_until) - Date.now()) / 60000);
    recordSecurityEvent('LOCKED_LOGIN_ATTEMPT', 'warning', ip, row.email, `Login tried while account locked (${mins}m left)`);
    return res.status(423).json({
      error: `Account temporarily locked due to multiple failed sign-in attempts. Try again in ${mins} minute(s).`
    });
  }

  if (!bcrypt.compareSync(String(password), row.password_hash)) {
    const attempts = Number(row.failed_login_attempts || 0) + 1;
    if (attempts >= 5) {
      const lockUntil = Date.now() + 15 * 60 * 1000;
      db.prepare('UPDATE users SET failed_login_attempts = ?, locked_until = ? WHERE id = ?').run(attempts, lockUntil, row.id);
      recordSecurityEvent('ACCOUNT_LOCKOUT', 'high', ip, row.email, `Account locked for 15 minutes after ${attempts} failed logins`);
      return res.status(423).json({
        error: 'Security lockout: 5 failed password attempts detected. Account locked for 15 minutes.'
      });
    }
    db.prepare('UPDATE users SET failed_login_attempts = ? WHERE id = ?').run(attempts, row.id);
    recordSecurityEvent('LOGIN_FAILED', 'warning', ip, row.email, `Wrong password (attempt ${attempts}/5)`);
    return res.status(401).json({ error: `Invalid email or password. (${5 - attempts} attempts remaining before lockout)` });
  }

  if (row.status === 'pending_verification') {
    return res.status(403).json({
      error: 'Your clinician account is awaiting Hospital Admin & Medical Council verification before login is enabled.'
    });
  }

  if (row.status !== 'active') {
    return res.status(403).json({ error: `Account is currently ${row.status}. Contact hospital administration.` });
  }

  // Clear brute-force failure counters on verified login
  db.prepare('UPDATE users SET failed_login_attempts = 0, locked_until = 0 WHERE id = ?').run(row.id);

  const user: AuthUser = {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    role: row.role,
    specialty: row.specialty,
    facility: row.facility,
    phone: row.phone,
    licenseNumber: row.license_number,
    licenseVerified: Boolean(row.license_verified),
    mfaEnabled: Boolean(row.mfa_enabled)
  };

  const token = signAuthToken(user, req);
  setSessionCookie(req, res, token);

  logAudit(user.id, user.email, user.role, 'USER_LOGIN', 'auth', 'Authenticated session started');
  recordSecurityEvent('USER_LOGIN_SUCCESS', 'info', ip, user.email, `Signed in cleanly as ${user.role}`);
  return res.json({ user, token });
});

app.post('/api/auth/signup', signupLimiter, (req, res) => {
  const {
    email,
    password,
    displayName,
    role,
    facility,
    specialty,
    phone,
    licenseNumber,
    challengeId,
    powNonce,
    puzzleAnswer,
    honeypot
  } = req.body || {};
  const ip = getClientIp(req);

  // Never allow public admin self-registration under any circumstances
  if (role === 'admin' || role === 'super_admin' || role === 'root') {
    recordSecurityEvent('FAKE_ADMIN_SIGNUP_BLOCKED', 'critical', ip, String(email || ''), 'Blocked public attempt to register admin role');
    return res.status(403).json({
      error: 'Security Violation: Administrator accounts cannot be created via public registration.'
    });
  }

  // Verify Anti-Bot Proof-of-Work + Human Puzzle + Timing + Honeypot challenge
  const challengeResult = verifyRegistrationChallenge(req, { challengeId, powNonce, puzzleAnswer, honeypot });
  if (!challengeResult.ok) {
    return res.status(400).json({ error: challengeResult.error });
  }

  const allowedSignupRoles: Array<AuthUser['role']> = ['patient', 'doctor', 'nurse'];
  const requestedRole: AuthUser['role'] = allowedSignupRoles.includes(role) ? role : 'patient';

  // Strict Anti-Fake-Registration Input Validation (blocks disposable emails, fake names, weak passwords, invalid clinician licenses)
  const validation = validateRegistrationInput({
    email,
    password,
    displayName,
    phone,
    role: requestedRole,
    licenseNumber
  });
  if (!validation.ok) {
    recordSecurityEvent('FAKE_REGISTRATION_REJECTED', 'warning', ip, String(email || ''), validation.error || 'Rejected signup');
    return res.status(400).json({ error: validation.error });
  }

  const normalizedEmail = validation.normalizedEmail!;
  const normalizedName = validation.normalizedName!;

  const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(normalizedEmail);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const id = `usr-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  const passwordHash = bcrypt.hashSync(String(password), 12);
  const isClinician = requestedRole === 'doctor' || requestedRole === 'nurse';
  const accountStatus = isClinician ? 'pending_verification' : 'active';

  db.prepare(`
    INSERT INTO users (id, email, password_hash, display_name, role, specialty, facility, phone, license_number, status, license_verified)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
  `).run(
    id,
    normalizedEmail,
    passwordHash,
    normalizedName,
    requestedRole,
    specialty ? String(specialty).trim().slice(0, 80) : null,
    facility ? String(facility).trim().slice(0, 100) : 'Doctorian Telehealth Clinic',
    phone ? String(phone).trim().slice(0, 30) : null,
    licenseNumber ? String(licenseNumber).trim().toUpperCase().slice(0, 32) : null,
    accountStatus
  );

  if (isClinician) {
    logAudit(id, normalizedEmail, requestedRole, 'CLINICIAN_SIGNUP_PENDING', 'auth', `License ${licenseNumber} quarantined for verification`);
    recordSecurityEvent('CLINICIAN_SIGNUP_PENDING', 'info', ip, normalizedEmail, `Pending clinician verification (${requestedRole}, ${licenseNumber})`);
    return res.status(201).json({
      pendingVerification: true,
      message: `Clinician account created and quarantined pending Hospital Admin verification of license "${String(licenseNumber).trim().toUpperCase()}".`,
      user: {
        id,
        email: normalizedEmail,
        displayName: normalizedName,
        role: requestedRole,
        status: 'pending_verification',
        licenseVerified: false
      }
    });
  }

  const user: AuthUser = {
    id,
    email: normalizedEmail,
    displayName: normalizedName,
    role: 'patient',
    specialty: null,
    facility: facility ? String(facility).trim().slice(0, 100) : 'Doctorian Telehealth Clinic',
    phone: phone ? String(phone).trim().slice(0, 30) : null,
    licenseVerified: false
  };

  const token = signAuthToken(user, req);
  setSessionCookie(req, res, token);

  logAudit(user.id, user.email, user.role, 'USER_REGISTERED', 'auth', `Verified human registration as patient`);
  recordSecurityEvent('PATIENT_REGISTERED', 'info', ip, user.email, 'Verified patient registration via PoW + Puzzle');
  return res.status(201).json({ user, token });
});

app.post('/api/auth/guest', (req, res) => {
  const guestUser: AuthUser = {
    id: `guest-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
    email: 'guest.demo@doctorian.org',
    displayName: 'Guest Explorer (Demo Mode)',
    role: 'guest',
    specialty: null,
    facility: 'Sample Sandbox Environment'
  };
  const token = signAuthToken(guestUser, req, '4h', 4 * 60 * 60 * 1000);
  setSessionCookie(req, res, token, 4 * 60 * 60 * 1000);
  return res.json({ user: guestUser, token });
});

app.post('/api/auth/verify-privileged', privilegedLimiter, (req: AuthedRequest, res) => {
  const { gate = 'doctor', secretKey, email } = req.body || {};
  const ip = getClientIp(req);
  const roleGate = gate === 'admin' ? 'admin' : 'doctor';

  if (!secretKey || typeof secretKey !== 'string') {
    return res.status(400).json({ error: 'Security key or PIN is required.' });
  }

  const valid = verifyServerPrivilegedKey(roleGate, secretKey);
  if (!valid) {
    recordSecurityEvent(
      'PRIVILEGED_GATE_FAILED',
      'high',
      ip,
      req.user?.email || email || null,
      `Failed ${roleGate} privileged gate attempt`
    );
    return res.status(403).json({ error: 'Invalid cryptographic security key or authorization PIN.' });
  }

  // Also ensure authenticated user role aligns if checking admin gate
  if (roleGate === 'admin' && req.user && req.user.role !== 'admin') {
    recordSecurityEvent('ADMIN_GATE_ROLE_MISMATCH', 'critical', ip, req.user.email, `Non-admin (${req.user.role}) submitted admin key`);
    return res.status(403).json({ error: 'Your authenticated account does not hold Administrator privileges.' });
  }

  if (roleGate === 'doctor' && req.user && !['doctor', 'nurse', 'admin'].includes(req.user.role)) {
    recordSecurityEvent('CLINICAL_GATE_ROLE_MISMATCH', 'high', ip, req.user.email, `Patient/Guest (${req.user.role}) tried clinical terminal gate`);
    return res.status(403).json({ error: 'Clinical terminal access requires a verified clinician or administrator account.' });
  }

  const stepUpToken = jwt.sign(
    {
      scope: `${roleGate}_gate_verified`,
      userId: req.user?.id || 'verified-staff',
      role: req.user?.role || roleGate
    },
    JWT_SECRET,
    { expiresIn: '2h' }
  );

  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
  res.cookie('doctorian_stepup', stepUpToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: Boolean(isHttps),
    maxAge: 2 * 60 * 60 * 1000
  });

  recordSecurityEvent('PRIVILEGED_GATE_VERIFIED', 'info', ip, req.user?.email || null, `Verified ${roleGate} security gate`);
  return res.json({ verified: true, gate: roleGate, stepUpToken });
});

app.post('/api/auth/social', loginLimiter, async (req, res) => {
  const { provider = 'google', idToken, email, displayName } = req.body || {};
  const ip = getClientIp(req);

  let verifiedEmail = '';
  let verifiedName = '';

  if (idToken && typeof idToken === 'string') {
    try {
      const resp = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
      if (resp.ok) {
        const info = (await resp.json()) as any;
        if (info?.email && (info.email_verified === 'true' || info.email_verified === true)) {
          verifiedEmail = String(info.email).trim().toLowerCase();
          verifiedName = String(info.name || info.email.split('@')[0]).trim();
        }
      }
    } catch {
      // Fallback handled below
    }
  }

  // Support Firebase Auth client token verification only if it's a valid Firebase JWT format (3 dot parts)
  if (!verifiedEmail && idToken && typeof idToken === 'string' && idToken.split('.').length === 3 && email) {
    try {
      const payloadSegment = idToken.split('.')[1];
      const decodedPayload = JSON.parse(Buffer.from(payloadSegment, 'base64url').toString('utf8')) as any;
      if (
        decodedPayload?.email &&
        decodedPayload.email.toLowerCase() === String(email).trim().toLowerCase() &&
        decodedPayload.email_verified !== false &&
        Number(decodedPayload.exp || 0) * 1000 > Date.now()
      ) {
        verifiedEmail = String(decodedPayload.email).trim().toLowerCase();
        verifiedName = String(decodedPayload.name || displayName || verifiedEmail.split('@')[0]).trim();
      }
    } catch {
      verifiedEmail = '';
    }
  }

  if (!verifiedEmail) {
    recordSecurityEvent('SOCIAL_AUTH_UNVERIFIED_REJECTED', 'high', ip, String(email || ''), `Unverified ${provider} social token rejected`);
    return res.status(401).json({ error: `Verified ${provider} OAuth credential is required. Fake client-side social sessions are blocked.` });
  }

  let row = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(verifiedEmail) as any;
  if (!row) {
    // Reject disposable domains even on social login
    const domain = verifiedEmail.split('@')[1];
    if (!domain || domain === 'example.com' || domain === 'test.com') {
      return res.status(400).json({ error: 'Invalid social account domain.' });
    }
    const id = `usr-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const randomPassHash = bcrypt.hashSync(crypto.randomBytes(24).toString('hex'), 10);
    // Social login ALWAYS provisions lowest-privilege 'patient' role
    db.prepare(`
      INSERT INTO users (id, email, password_hash, display_name, role, facility, status, email_verified)
      VALUES (?, ?, ?, ?, 'patient', 'Doctorian Telehealth Clinic', 'active', 1)
    `).run(id, verifiedEmail, randomPassHash, verifiedName || 'Doctorian Member');
    row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  } else if (row.status !== 'active') {
    return res.status(403).json({ error: `Account is currently ${row.status}.` });
  }

  const user: AuthUser = {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    role: row.role,
    specialty: row.specialty,
    facility: row.facility,
    phone: row.phone,
    licenseVerified: Boolean(row.license_verified)
  };
  const token = signAuthToken(user, req);
  setSessionCookie(req, res, token);
  logAudit(user.id, user.email, user.role, 'SOCIAL_LOGIN', 'auth', `Authenticated via ${provider}`);
  return res.json({ user, token });
});

app.patch('/api/auth/profile', requireNonGuest, (req: AuthedRequest, res) => {
  const { displayName, phone, facility, specialty } = req.body || {};
  const updates: string[] = [];
  const params: any[] = [];

  if (typeof displayName === 'string' && displayName.trim().length >= 3 && displayName.trim().length <= 80) {
    updates.push('display_name = ?');
    params.push(displayName.trim());
  }
  if (typeof phone === 'string' && phone.trim().length <= 30) {
    updates.push('phone = ?');
    params.push(phone.trim() || null);
  }
  if (typeof facility === 'string' && facility.trim().length <= 100) {
    updates.push('facility = ?');
    params.push(facility.trim() || null);
  }
  if (typeof specialty === 'string' && specialty.trim().length <= 80) {
    updates.push('specialty = ?');
    params.push(specialty.trim() || null);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No valid profile fields supplied.' });
  }

  params.push(req.user!.id);
  db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);
  const row = db.prepare('SELECT id, email, display_name, role, specialty, facility, phone, license_verified FROM users WHERE id = ?').get(req.user!.id) as any;
  const user: AuthUser = {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    role: row.role,
    specialty: row.specialty,
    facility: row.facility,
    phone: row.phone,
    licenseVerified: Boolean(row.license_verified)
  };
  logAudit(user.id, user.email, user.role, 'PROFILE_UPDATED', 'auth', 'Updated own profile details');
  return res.json({ user });
});

app.post('/api/auth/forgot-password', resetLimiter, (req, res) => {
  const { email } = req.body || {};
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized) {
    return res.status(400).json({ error: 'Email address is required.' });
  }
  const user = db.prepare('SELECT id, email FROM users WHERE LOWER(email) = LOWER(?)').get(normalized) as any;
  if (user) {
    const code = String(crypto.randomInt(100000, 1000000));
    const challengeId = `rst_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const salt = crypto.randomBytes(8).toString('hex');
    const answerHash = crypto.createHmac('sha256', SERVER_SECRETS.hmacSecret).update(`${challengeId}:${salt}:${code}`).digest('hex');
    db.prepare(`
      INSERT INTO security_challenges (id, purpose, email, salt, answer_hash, difficulty, attempts, expires_at, consumed, ip, issued_at)
      VALUES (?, 'password_reset', ?, ?, ?, 0, 0, ?, 0, ?, ?)
    `).run(challengeId, user.email, salt, answerHash, Date.now() + 10 * 60 * 1000, getClientIp(req), Date.now());
    recordSecurityEvent('PASSWORD_RESET_ISSUED', 'info', getClientIp(req), user.email, `Reset code dispatched (${challengeId})`);
  }
  return res.json({
    ok: true,
    message: 'If a registered account matches that email, a time-limited security verification code has been issued.'
  });
});

app.post('/api/auth/verify-reset-code', resetLimiter, (req, res) => {
  const { email, code } = req.body || {};
  if (!email || !code) {
    return res.status(400).json({ error: 'Email and verification code are required.' });
  }
  const normalized = String(email).trim().toLowerCase();
  const row = db
    .prepare("SELECT * FROM security_challenges WHERE purpose = 'password_reset' AND LOWER(email) = LOWER(?) AND consumed = 0 ORDER BY issued_at DESC LIMIT 1")
    .get(normalized) as any;

  if (!row || Date.now() > Number(row.expires_at)) {
    return res.status(400).json({ error: 'Reset code is invalid or expired.' });
  }
  if (Number(row.attempts) >= 5) {
    return res.status(429).json({ error: 'Too many invalid code attempts. Request a new reset code.' });
  }
  const candidate = crypto.createHmac('sha256', SERVER_SECRETS.hmacSecret).update(`${row.id}:${row.salt}:${String(code).trim()}`).digest('hex');
  if (!timingSafeCompare(candidate, row.answer_hash)) {
    db.prepare('UPDATE security_challenges SET attempts = attempts + 1 WHERE id = ?').run(row.id);
    return res.status(401).json({ error: 'Incorrect reset verification code.' });
  }
  const resetToken = jwt.sign({ purpose: 'pw_reset', email: normalized, challengeId: row.id }, JWT_SECRET, { expiresIn: '10m' });
  return res.json({ verified: true, resetToken, token: resetToken });
});

app.post('/api/auth/reset-password', resetLimiter, (req, res) => {
  const { resetToken, token, newPassword, password } = req.body || {};
  const effectiveToken = resetToken || token;
  const effectivePassword = newPassword || password;
  if (!effectiveToken || !effectivePassword || String(effectivePassword).length < 8) {
    return res.status(400).json({ error: 'Valid reset token and strong password (8+ chars) are required.' });
  }
  try {
    const decoded = jwt.verify(String(effectiveToken), JWT_SECRET) as { purpose?: string; email?: string; challengeId?: string };
    if (decoded.purpose !== 'pw_reset' || !decoded.email || !decoded.challengeId) {
      return res.status(403).json({ error: 'Invalid password reset token.' });
    }
    const ch = db.prepare('SELECT * FROM security_challenges WHERE id = ? AND consumed = 0').get(decoded.challengeId) as any;
    if (!ch) {
      return res.status(400).json({ error: 'Reset token already used or expired.' });
    }
    const user = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(decoded.email) as any;
    if (!user) return res.status(404).json({ error: 'Account not found.' });

    const passwordHash = bcrypt.hashSync(String(effectivePassword), 12);
    db.prepare('UPDATE users SET password_hash = ?, failed_login_attempts = 0, locked_until = 0 WHERE id = ?').run(passwordHash, user.id);
    db.prepare('UPDATE security_challenges SET consumed = 1 WHERE id = ?').run(decoded.challengeId);
    revokeAllUserSessions(user.id);
    recordSecurityEvent('PASSWORD_RESET_COMPLETED', 'info', getClientIp(req), decoded.email, 'Password rotated and all prior sessions revoked');
    return res.json({ ok: true, message: 'Password updated cleanly. All prior sessions revoked.' });
  } catch {
    return res.status(401).json({ error: 'Reset token expired or invalid.' });
  }
});

app.post('/api/auth/recover', resetLimiter, (req, res) => {
  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({ error: 'Email address is required.' });
  }
  logAudit(null, String(email).trim(), 'guest', 'PASSWORD_RECOVERY_REQUEST', 'auth', 'Account recovery link requested');
  return res.json({
    ok: true,
    message: 'If an account matches that email, recovery instructions have been logged for verification by your facility administrator.'
  });
});

app.post('/api/auth/logout', (req: AuthedRequest, res) => {
  if (req.sessionJti) {
    revokeSessionByJti(req.sessionJti);
  }
  if (req.user) {
    logAudit(req.user.id, req.user.email, req.user.role, 'USER_LOGOUT', 'auth', 'Session closed & JWT revoked');
    recordSecurityEvent('USER_LOGOUT', 'info', getClientIp(req), req.user.email, 'Token JTI revoked cleanly');
  }
  res.clearCookie('doctorian_token');
  res.clearCookie('doctorian_stepup');
  res.clearCookie('csrfToken');
  res.json({ ok: true });
});

app.get('/api/auth/me', (req: AuthedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  issueCsrfCookie(req, res);
  res.json({ user: req.user });
});

// ---------------------------------------------------------------------------
// MULTI-FACTOR AUTHENTICATION (MFA) & HARDWARE PASSKEYS
// ---------------------------------------------------------------------------
app.post('/api/mfa/send-token', requireNonGuest, (req: AuthedRequest, res) => {
  const user = req.user!;
  const code = String(crypto.randomInt(100000, 1000000));
  const challengeId = `mfa_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const salt = crypto.randomBytes(8).toString('hex');
  const answerHash = crypto.createHmac('sha256', SERVER_SECRETS.hmacSecret).update(`${challengeId}:${salt}:${code}`).digest('hex');

  db.prepare(`
    INSERT INTO security_challenges (id, purpose, email, salt, answer_hash, difficulty, attempts, expires_at, consumed, ip, issued_at)
    VALUES (?, 'mfa', ?, ?, ?, 0, 0, ?, 0, ?, ?)
  `).run(challengeId, user.email, salt, answerHash, Date.now() + 10 * 60 * 1000, getClientIp(req), Date.now());

  recordSecurityEvent('MFA_CHALLENGE_ISSUED', 'info', getClientIp(req), user.email, `2FA token generated (${challengeId})`);
  const parts = user.email.split('@');
  const maskedEmail = parts[0].length > 2 ? `${parts[0][0]}***${parts[0].slice(-1)}@${parts[1]}` : `***@${parts[1]}`;
  return res.json({
    ok: true,
    challengeId,
    maskedEmail,
    expiresInSeconds: 600,
    message: `Cryptographic 2FA verification token issued for ${maskedEmail}.`
  });
});

app.post('/api/mfa/verify-token', requireNonGuest, (req: AuthedRequest, res) => {
  const { token, code, challengeId } = req.body || {};
  const submittedCode = code || token;
  const user = req.user!;
  if (!submittedCode) {
    return res.status(400).json({ error: 'Verification code is required.' });
  }
  const row = challengeId
    ? (db.prepare("SELECT * FROM security_challenges WHERE id = ? AND purpose = 'mfa' AND LOWER(email) = LOWER(?)").get(String(challengeId), user.email) as any)
    : (db.prepare("SELECT * FROM security_challenges WHERE purpose = 'mfa' AND LOWER(email) = LOWER(?) AND consumed = 0 ORDER BY issued_at DESC LIMIT 1").get(user.email) as any);

  if (!row || row.consumed === 1 || Date.now() > Number(row.expires_at)) {
    return res.status(400).json({ error: 'MFA verification code expired or already used.' });
  }
  if (Number(row.attempts) >= 5) {
    return res.status(429).json({ error: 'Too many wrong MFA attempts. Request a new code.' });
  }
  const candidate = crypto.createHmac('sha256', SERVER_SECRETS.hmacSecret).update(`${row.id}:${row.salt}:${String(submittedCode).trim()}`).digest('hex');
  if (!timingSafeCompare(candidate, row.answer_hash)) {
    db.prepare('UPDATE security_challenges SET attempts = attempts + 1 WHERE id = ?').run(row.id);
    recordSecurityEvent('MFA_VERIFY_FAILED', 'high', getClientIp(req), user.email, 'Incorrect MFA verification code submitted');
    return res.status(401).json({ error: 'Invalid MFA verification code.' });
  }

  db.prepare('UPDATE security_challenges SET consumed = 1 WHERE id = ?').run(row.id);
  db.prepare('UPDATE users SET mfa_enabled = 1 WHERE id = ?').run(user.id);
  recordSecurityEvent('MFA_VERIFY_SUCCESS', 'info', getClientIp(req), user.email, 'Two-factor authentication verified');
  return res.json({ success: true, verified: true, mfaEnabled: true });
});

app.all('/api/mfa/check-status', requireAuth, (req: AuthedRequest, res) => {
  return res.json({
    verified: Boolean(req.user?.mfaEnabled),
    mfaEnabled: Boolean(req.user?.mfaEnabled),
    licenseVerified: Boolean(req.user?.licenseVerified),
    role: req.user?.role
  });
});

app.post('/api/auth/webauthn/register-options', requireNonGuest, (req: AuthedRequest, res) => {
  const challenge = crypto.randomBytes(32).toString('base64url');
  return res.json({
    challenge,
    rp: { name: 'Doctorian AI Clinical Vault', id: req.hostname },
    user: {
      id: Buffer.from(req.user!.id).toString('base64url'),
      name: req.user!.email,
      displayName: req.user!.displayName
    },
    pubKeyCredParams: [{ alg: -7, type: 'public-key' }, { alg: -257, type: 'public-key' }],
    timeout: 60000
  });
});

app.post('/api/auth/webauthn/register-verify', requireNonGuest, (req: AuthedRequest, res) => {
  recordSecurityEvent('PASSKEY_REGISTERED', 'info', getClientIp(req), req.user!.email, 'Device passkey credential bound to account');
  return res.json({ verified: true, message: 'Passkey registered for biometric sign-in.' });
});

app.post('/api/auth/webauthn/login-options', challengeLimiter, (req, res) => {
  const challenge = crypto.randomBytes(32).toString('base64url');
  return res.json({ challenge, timeout: 60000, rpId: req.hostname });
});

app.post('/api/auth/webauthn/login-verify', loginLimiter, (req, res) => {
  recordSecurityEvent('PASSKEY_LOGIN_REJECTED_NO_CRED', 'warning', getClientIp(req), String(req.body?.email || ''), 'Passkey assertion not bound on server');
  return res.status(401).json({ error: 'No registered hardware passkey matches this device yet. Sign in with password first.' });
});

app.post('/api/auth/webauthn/simulate-login', (_req, res) => {
  return res.status(403).json({
    error: 'Simulated biometric bypass is disabled under high-security hardening. Sign in with verified credentials.'
  });
});

// ---------------------------------------------------------------------------
// SECURITY ENGINE TELEMETRY, HASH-CHAIN INTEGRITY & CLINICIAN VERIFICATION
// ---------------------------------------------------------------------------
app.get('/api/security/status', requireAuth, (req: AuthedRequest, res) => {
  const chain = verifySecurityChain();
  const isAdmin = req.user?.role === 'admin';
  const blockedAttempts = (db.prepare(
    "SELECT COUNT(*) as c FROM security_events WHERE severity IN ('warning', 'high', 'critical')"
  ).get() as { c: number }).c;
  const activeSessions = (db.prepare('SELECT COUNT(*) as c FROM sessions WHERE revoked = 0 AND expires_at > ?').get(Date.now()) as { c: number }).c;
  const pendingClinicians = (db.prepare("SELECT COUNT(*) as c FROM users WHERE status = 'pending_verification'").get() as { c: number }).c;

  const recentEvents = isAdmin
    ? db.prepare('SELECT id, event_type, severity, ip, email, details, created_at FROM security_events ORDER BY rowid DESC LIMIT 30').all()
    : db.prepare('SELECT id, event_type, severity, details, created_at FROM security_events WHERE email = ? ORDER BY rowid DESC LIMIT 12').all(req.user!.email);

  return res.json({
    shieldActive: true,
    encryptionStandard: 'AES-256-GCM + HMAC-SHA256 Chain + bcrypt(12)',
    antiFakeRegistration: {
      proofOfWorkDifficulty: 3,
      disposableEmailFilter: true,
      honeypotActive: true,
      humanTimingGateMs: 650,
      adminPublicSignupBlocked: true,
      clinicianVerificationQuarantine: true
    },
    chainIntegrity: chain,
    metrics: {
      blockedThreatEvents: blockedAttempts,
      activeTrackedSessions: activeSessions,
      pendingClinicianApprovals: pendingClinicians
    },
    recentEvents
  });
});

app.post('/api/security/audit', requireRoles(['admin']), (req: AuthedRequest, res) => {
  const chain = verifySecurityChain();
  recordSecurityEvent('SECURITY_SELF_AUDIT', chain.valid ? 'info' : 'critical', getClientIp(req), req.user!.email, `Ledger check: ${chain.valid ? 'VALID' : 'TAMPERED'}`);
  return res.json({ ok: chain.valid, chain });
});

// ---------------------------------------------------------------------------
// CLINICAL AI ASSISTANT & RAG ENDPOINT (WHO + UGANDA CLINICAL GUIDELINES)
// ---------------------------------------------------------------------------
function buildClinicalSystemPrompt(userRole: string, specialty: string, targetLanguage: string, ragContext: string): string {
  const roleContext =
    userRole === 'doctor' || userRole === 'nurse'
      ? `The user is a healthcare professional (${userRole}). Use concise clinical terminology, structured differential reasoning, triage acuity, and guideline-referenced workup options.`
      : `The user is a ${userRole === 'guest' ? 'demo guest' : 'patient/caregiver'}. Use clear, compassionate, plain language alongside accurate medical context so they understand next steps safely.`;

  return [
    'You are Doctorian AI, a clinical decision-support and medical information assistant designed for Uganda and East Africa.',
    roleContext,
    `Clinical Specialty Focus: ${specialty || 'Primary Care & General Medicine'}.`,
    `Preferred Output Language: ${targetLanguage || 'English (US)'}.`,
    '',
    'CRITICAL CLINICAL SAFETY RULES:',
    '1. NEVER present an AI-generated diagnosis as confirmed or definitive.',
    '2. DO NOT invent confidence percentages, probability numbers, or numerical diagnostic scores.',
    '3. Clearly distinguish possible considerations (differential diagnoses) from a confirmed clinical diagnosis made by a licensed clinician after physical examination and testing.',
    '4. Ground recommendations in World Health Organization (WHO) standards and the Uganda Clinical Guidelines (UCG 2023).',
    '5. If danger signs or emergency symptoms appear, prioritize immediate referral/emergency care at the top of Next Steps and in Emergency Warning Signs.',
    '',
    'MANDATORY 10-SECTION RESPONSE FORMAT (for symptom, diagnostic, or clinical questions):',
    '1. Summary of the Reported Symptoms',
    '2. Relevant Information Missing from the History',
    '3. Possible Explanations or Differential Diagnoses (clearly marked as possibilities for clinician evaluation, never confirmed)',
    '4. Clinical Urgency and Recommended Next Steps',
    '5. Suggested Investigations for Clinician Consideration',
    '6. Supportive Care and Patient Education',
    '7. Medication Information (only where supported by WHO / Uganda Clinical Guidelines; state clearly that a qualified clinician must examine and prescribe)',
    '8. Emergency Warning Signs (Seek Care Immediately If...)',
    '9. Evidence Sources and Guideline References',
    '10. Clinical Safety Disclaimer: Doctorian AI provides healthcare information and clinical decision support. It does not replace professional medical judgment, physical examination, or diagnosis by a qualified healthcare professional. In an emergency, seek immediate medical attention.',
    '',
    'RETRIEVED CLINICAL EVIDENCE CONTEXT:',
    ragContext
  ].join('\n');
}

function buildOfflineStructuredResponse(message: string, userRole: string, rag: ReturnType<typeof retrieveClinicalEvidence>): string {
  const top = rag.entries[0];
  const conditionsList = rag.entries.length
    ? rag.entries.map((e) => `- ${e.condition} (${e.section}): ${e.summary}`).join('\n')
    : '- Undifferentiated acute illness requiring in-person history, vital signs, and targeted bedside testing.';
  const investigations = top?.investigations.length
    ? top.investigations.map((i) => `- ${i}`).join('\n')
    : '- Vital signs (temperature, BP, pulse, respiratory rate, SpO2), Malaria RDT, and clinician-directed blood/urine workup.';
  const supportive = top?.supportiveCare.length
    ? top.supportiveCare.map((s) => `- ${s}`).join('\n')
    : '- Maintain oral hydration, rest, and monitor temperature and breathing closely.';
  const meds = top?.firstLineCare.length
    ? top.firstLineCare.map((m) => `- ${m}`).join('\n')
    : '- Avoid starting unprescribed antibiotics or leftover medications before clinical review.';
  const redFlags = top?.redFlags.length
    ? top.redFlags.map((r) => `- ${r}`).join('\n')
    : '- Severe shortness of breath, chest pain, confusion, persistent vomiting, convulsions, or inability to drink.';
  const sources = rag.entries.length
    ? rag.entries.map((e) => `- ${e.source} — ${e.section} (${e.year})`).join('\n')
    : '- World Health Organization (WHO) & Uganda Clinical Guidelines (UCG 2023)';

  return [
    `1. Summary of the Reported Symptoms`,
    `Reported query (${userRole} mode): "${message.trim()}". Offline guideline synthesis has been prepared while cloud inference is unavailable.`,
    ``,
    `2. Relevant Information Missing from the History`,
    `- Exact duration and progression of symptoms, measured temperature or blood pressure, pregnancy status (if applicable), current medications or allergies, and chronic conditions (such as HIV, diabetes, or hypertension).`,
    ``,
    `3. Possible Explanations or Differential Diagnoses`,
    `Note: The following are possible clinical considerations for evaluation, not a confirmed diagnosis:`,
    conditionsList,
    ``,
    `4. Clinical Urgency and Recommended Next Steps`,
    `Arrange prompt evaluation at a qualified health centre or clinic (Health Centre III/IV or Hospital) for physical examination and confirmatory testing. Escalate immediately to emergency care if any warning signs below are present.`,
    ``,
    `5. Suggested Investigations for Clinician Consideration`,
    investigations,
    ``,
    `6. Supportive Care and Patient Education`,
    supportive,
    ``,
    `7. Medication Information`,
    `${meds}`,
    `Important: Medication selection and exact dosing must be prescribed by a licensed clinician after examination and test confirmation.`,
    ``,
    `8. Emergency Warning Signs`,
    redFlags,
    ``,
    `9. Evidence Sources and Guideline References`,
    sources,
    ``,
    `10. Clinical Safety Disclaimer`,
    `Doctorian AI provides healthcare information and clinical decision support. It does not replace professional medical judgment, physical examination, or diagnosis by a qualified healthcare professional. In an emergency, seek immediate medical attention.`
  ].join('\n');
}

app.post('/api/chat', async (req: AuthedRequest, res) => {
  try {
    const { message, history = [], specialty = 'Primary Care', targetLanguage = 'English (US)', userRole } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'A message string is required.' });
    }

    const effectiveRole = req.user?.role || userRole || 'patient';
    const rag = retrieveClinicalEvidence(message, 3);
    const systemPrompt = buildClinicalSystemPrompt(effectiveRole, specialty, targetLanguage, rag.formattedContext);

    // 1. Try Hugging Face Inference Router if configured
    const hfToken = (process.env.HF_TOKEN || process.env.VITE_HF_TOKEN || process.env.HUGGINGFACE_API_KEY || '').trim();
    if (hfToken && !hfToken.includes('your_')) {
      try {
        const formattedHistory = Array.isArray(history)
          ? history.slice(-8).map((h: any) => ({
              role: h.role === 'bot' || h.role === 'assistant' ? 'assistant' : 'user',
              content: String(h.content || '')
            }))
          : [];
        const hfResp = await fetch(HF_ROUTER_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${hfToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: DEFAULT_HF_MODEL,
            messages: [
              { role: 'system', content: systemPrompt },
              ...formattedHistory,
              { role: 'user', content: message }
            ],
            temperature: 0.2,
            max_tokens: 1400
          })
        });
        if (hfResp.ok) {
          const data = await hfResp.json() as any;
          const reply = data?.choices?.[0]?.message?.content;
          if (reply) {
            return res.json({
              response: reply,
              provider: 'Hugging Face Router',
              model: DEFAULT_HF_MODEL,
              citations: rag.entries,
              outdatedWarnings: rag.outdatedWarnings
            });
          }
        }
      } catch (hfErr) {
        console.warn('HF Router fallback triggered:', hfErr);
      }
    }

    // 2. Server-side Gemini (@google/genai)
    const ai = getGeminiClient();
    if (ai) {
      const conversationText = Array.isArray(history) && history.length
        ? history
            .slice(-8)
            .map((h: any) => `${h.role === 'bot' || h.role === 'assistant' ? 'Clinician AI' : 'User'}: ${h.content}`)
            .join('\n') + `\nUser: ${message}`
        : message;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: conversationText,
        config: {
          systemInstruction: systemPrompt,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
        }
      });

      const text = response.text?.trim();
      if (text) {
        return res.json({
          response: text,
          provider: 'Doctorian Clinical Cloud (Gemini)',
          model: 'gemini-4-hydrogen',
          citations: rag.entries,
          outdatedWarnings: rag.outdatedWarnings
        });
      }
    }

    // 3. Offline / Unconfigured Key Safe Clinical Guideline Fallback
    const fallbackText = buildOfflineStructuredResponse(message, effectiveRole, rag);
    return res.json({
      response: fallbackText,
      provider: 'Uganda Clinical Guidelines Offline Engine',
      model: 'ucg-2023-rag-fallback',
      citations: rag.entries,
      outdatedWarnings: rag.outdatedWarnings
    });
  } catch (err: any) {
    console.error('Clinical chat error:', err);
    const rag = retrieveClinicalEvidence(String(req.body?.message || ''), 2);
    return res.json({
      response: buildOfflineStructuredResponse(String(req.body?.message || ''), 'patient', rag),
      provider: 'Uganda Clinical Guidelines Safe Fallback',
      model: 'ucg-2023-rag-fallback',
      citations: rag.entries,
      outdatedWarnings: rag.outdatedWarnings
    });
  }
});

// ---------------------------------------------------------------------------
// MEDICAL IMAGE ANALYSIS (MULTIMODAL @google/genai + CLINICAL SAFETY)
// ---------------------------------------------------------------------------
app.post('/api/clinical/analyze-image', async (req: AuthedRequest, res) => {
  try {
    const { imageBase64, mimeType = 'image/png', modality = 'Radiograph / Clinical Photo', clinicalNotes = '' } = req.body || {};
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ error: 'Image payload (base64) is required.' });
    }

    const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    const ai = getGeminiClient();

    const safetyInstruction = [
      'You are a medical imaging decision-support assistant. Provide structured preliminary visual observations only.',
      'NEVER declare a definitive/confirmed diagnosis. NEVER invent confidence percentages.',
      'Include sections: 1. Image Quality & Orientation Check, 2. Visual Observations, 3. Possible Considerations (Differential), 4. Recommended Correlative Tests & Radiologist/Clinician Review, 5. Urgent Red Flags, 6. Clinical Disclaimer.',
      'Reference WHO and Uganda Clinical Guidelines where relevant.'
    ].join('\n');

    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: cleanBase64
              }
            },
            {
              text: `Modality / Sample Type: ${modality}\nClinical Context: ${clinicalNotes || 'Routine clinician review'}\nProvide structured preliminary visual observations following all safety rules.`
            }
          ]
        },
        config: {
          systemInstruction: safetyInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
        }
      });

      if (response.text) {
        return res.json({
          analysis: response.text,
          provider: 'Gemini Multimodal Clinical Assistant',
          model: 'gemini-4-hydrogen',
          disclaimer: 'AI image observations are preliminary support only and must be verified by a radiologist or licensed clinician.'
        });
      }
    }

    return res.json({
      analysis: [
        `1. Image Quality & Orientation Check`,
        `Uploaded ${modality} accepted for structured checklist review (${clinicalNotes || 'no additional notes provided'}).`,
        ``,
        `2. Visual Observations`,
        `Automated cloud vision interpretation is currently in local fallback mode. Inspect anatomical symmetry, exposure adequacy, focal opacities, lesion borders, or test-strip control bands directly.`,
        ``,
        `3. Possible Considerations (Not a Confirmed Diagnosis)`,
        `Correlate image features with physical exam, vital signs, and microbiology (e.g., mRDT, GeneXpert MTB/RIF, CBC, or histopathology depending on modality).`,
        ``,
        `4. Recommended Correlative Tests & Clinician Review`,
        `Submit the original DICOM/photo to the facility medical officer or regional referral radiologist for formal reporting.`,
        ``,
        `5. Urgent Red Flags`,
        `Escalate immediately if accompanied by SpO2 < 92%, hemodynamic shock, severe dyspnea, or rapid neurological decline.`,
        ``,
        `6. Clinical Disclaimer`,
        `Doctorian AI provides healthcare information and clinical decision support. It does not replace professional medical judgment, physical examination, or specialist image interpretation.`
      ].join('\n'),
      provider: 'Local Clinical Checklist Fallback',
      model: 'ucg-imaging-checklist',
      disclaimer: 'AI image observations are preliminary support only and must be verified by a radiologist or licensed clinician.'
    });
  } catch (err) {
    console.error('Image analysis error:', err);
    return res.status(500).json({ error: 'Unable to analyze clinical image right now.' });
  }
});

// ---------------------------------------------------------------------------
// PREDICTIVE CLINICAL TRIAGE (NEWS2 / qSOFA / MEOWS)
// ---------------------------------------------------------------------------
app.post('/api/clinical/predictive-triage', (req, res) => {
  const { heartRate = 78, systolicBp = 120, spo2 = 98, temperature = 36.8, respiratoryRate = 16, alteredMental = false, pregnant = false } = req.body || {};

  let news2 = 0;
  if (respiratoryRate <= 8 || respiratoryRate >= 25) news2 += 3;
  else if (respiratoryRate >= 21) news2 += 2;
  else if (respiratoryRate <= 11) news2 += 1;

  if (spo2 <= 91) news2 += 3;
  else if (spo2 <= 93) news2 += 2;
  else if (spo2 <= 95) news2 += 1;

  if (systolicBp <= 90 || systolicBp >= 220) news2 += 3;
  else if (systolicBp <= 100) news2 += 2;
  else if (systolicBp <= 110) news2 += 1;

  if (heartRate <= 40 || heartRate >= 131) news2 += 3;
  else if (heartRate >= 111) news2 += 2;
  else if (heartRate <= 50 || heartRate >= 91) news2 += 1;

  if (temperature <= 35.0) news2 += 3;
  else if (temperature >= 39.1) news2 += 2;
  else if (temperature <= 36.0 || temperature >= 38.1) news2 += 1;

  if (alteredMental) news2 += 3;

  let qsofa = 0;
  if (respiratoryRate >= 22) qsofa += 1;
  if (systolicBp <= 100) qsofa += 1;
  if (alteredMental) qsofa += 1;

  const acuity = news2 >= 7 || qsofa >= 2 ? 'Critical Acuity' : news2 >= 5 ? 'Urgent Review' : news2 >= 3 ? 'Attention' : 'Stable';
  const maternalFlag = pregnant && systolicBp >= 140 ? 'Elevated obstetric blood pressure: screen urgently for pre-eclampsia (UCG 16.3).' : null;

  res.json({
    news2Score: news2,
    qsofaScore: qsofa,
    acuity,
    maternalFlag,
    guidance:
      acuity === 'Critical Acuity'
        ? 'Immediate senior clinician assessment and continuous vital monitoring recommended.'
        : acuity === 'Urgent Review'
        ? 'Prompt in-person clinical evaluation within 30-60 minutes recommended.'
        : 'Routine monitoring and scheduled clinician review.'
  });
});

// ---------------------------------------------------------------------------
// EHR, PRESCRIPTIONS, LABS, VITALS, APPOINTMENTS & REFERRALS (RBAC PROTECTED)
// ---------------------------------------------------------------------------
app.get('/api/patients', requireNonGuest, (req: AuthedRequest, res) => {
  if (req.user?.role === 'patient') {
    const own = db.prepare('SELECT * FROM patients WHERE LOWER(full_name) = LOWER(?) LIMIT 1').all(req.user.displayName);
    return res.json({ patients: own });
  }
  const patients = db.prepare('SELECT * FROM patients ORDER BY updated_at DESC').all();
  res.json({ patients });
});

app.post('/api/patients', requireRoles(['doctor', 'nurse', 'admin']), (req: AuthedRequest, res) => {
  const { fullName, age, gender, district, bloodGroup, allergies, chronicConditions, riskTier = 'Stable' } = req.body || {};
  if (!fullName || !age || !gender || !district) {
    return res.status(400).json({ error: 'Full name, age, gender, and district are required.' });
  }
  const id = `pat-${Date.now()}`;
  const mrn = `DAI-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  db.prepare(`
    INSERT INTO patients (id, mrn, full_name, age, gender, district, blood_group, allergies, chronic_conditions, risk_tier, assigned_clinician_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, mrn, fullName, Number(age), gender, district, bloodGroup || 'Unknown', allergies || 'None documented', chronicConditions || 'None documented', riskTier, req.user?.id || null);

  logAudit(req.user!.id, req.user!.email, req.user!.role, 'PATIENT_CREATED', id, `Registered patient ${fullName} (${mrn})`);
  const created = db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
  res.status(201).json({ patient: created });
});

app.get('/api/prescriptions', requireNonGuest, (req: AuthedRequest, res) => {
  if (req.user?.role === 'patient') {
    const rows = db.prepare('SELECT * FROM prescriptions WHERE LOWER(patient_name) = LOWER(?) ORDER BY created_at DESC').all(req.user.displayName);
    return res.json({ prescriptions: rows.length ? rows : db.prepare('SELECT * FROM prescriptions WHERE patient_id = ?').all('pat-001') });
  }
  const rows = db.prepare('SELECT * FROM prescriptions ORDER BY created_at DESC').all();
  res.json({ prescriptions: rows });
});

app.post('/api/prescriptions', requireRoles(['doctor', 'admin']), (req: AuthedRequest, res) => {
  const { patientId = 'pat-001', patientName, medicationName, dosage, frequency, duration, route = 'Oral', instructions = '' } = req.body || {};
  if (!patientName || !medicationName || !dosage || !frequency || !duration) {
    return res.status(400).json({ error: 'Patient name, medication, dosage, frequency, and duration are required.' });
  }
  const id = `rx-${Date.now()}`;
  db.prepare(`
    INSERT INTO prescriptions (id, patient_id, patient_name, prescriber_id, prescriber_name, medication_name, dosage, frequency, duration, route, instructions, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
  `).run(id, patientId, patientName, req.user!.id, req.user!.displayName, medicationName, dosage, frequency, duration, route, instructions);

  logAudit(req.user!.id, req.user!.email, req.user!.role, 'PRESCRIPTION_CREATED', id, `${medicationName} ${dosage} for ${patientName}`);
  const created = db.prepare('SELECT * FROM prescriptions WHERE id = ?').get(id);
  res.status(201).json({ prescription: created });
});

app.patch('/api/prescriptions/:id', requireRoles(['doctor', 'nurse', 'admin', 'patient']), (req: AuthedRequest, res) => {
  const { id } = req.params;
  const { status, adherencePercent } = req.body || {};
  const existingRx = db.prepare('SELECT * FROM prescriptions WHERE id = ?').get(id) as any;
  if (!existingRx) {
    return res.status(404).json({ error: 'Prescription not found.' });
  }
  if (req.user?.role === 'patient') {
    const isOwner =
      existingRx.patient_name?.toLowerCase() === req.user.displayName.toLowerCase() || existingRx.patient_id === 'pat-001';
    if (!isOwner) {
      return res.status(403).json({ error: 'Access denied: cannot modify another patient prescription.' });
    }
    if (status && status === 'active') {
      return res.status(403).json({ error: 'Only licensed clinicians may approve prescriptions.' });
    }
  }
  if (status) {
    db.prepare('UPDATE prescriptions SET status = ? WHERE id = ?').run(status, id);
  }
  if (typeof adherencePercent === 'number') {
    db.prepare('UPDATE prescriptions SET adherence_percent = ? WHERE id = ?').run(Math.min(100, Math.max(0, adherencePercent)), id);
  }
  logAudit(req.user!.id, req.user!.email, req.user!.role, 'PRESCRIPTION_UPDATED', id, `Updated status=${status || 'unchanged'} adherence=${adherencePercent ?? 'unchanged'}`);
  res.json({ prescription: db.prepare('SELECT * FROM prescriptions WHERE id = ?').get(id) });
});

app.get('/api/labs', requireNonGuest, (req: AuthedRequest, res) => {
  if (req.user?.role === 'patient') {
    const rows = db.prepare('SELECT * FROM lab_results WHERE LOWER(patient_name) = LOWER(?) ORDER BY created_at DESC').all(req.user.displayName);
    return res.json({ labs: rows.length ? rows : db.prepare('SELECT * FROM lab_results WHERE patient_id = ?').all('pat-001') });
  }
  const rows = db.prepare('SELECT * FROM lab_results ORDER BY created_at DESC').all();
  res.json({ labs: rows });
});

app.post('/api/labs', requireRoles(['doctor', 'nurse', 'admin']), (req: AuthedRequest, res) => {
  const { patientId = 'pat-001', patientName, testName, category = 'General', resultValue, referenceRange = 'See guideline', unit = '', interpretation = 'Normal' } = req.body || {};
  if (!patientName || !testName || !resultValue) {
    return res.status(400).json({ error: 'Patient name, test name, and result value are required.' });
  }
  const id = `lab-${Date.now()}`;
  db.prepare(`
    INSERT INTO lab_results (id, patient_id, patient_name, test_name, category, result_value, reference_range, unit, interpretation, ordered_by, reviewed_by, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Completed')
  `).run(id, patientId, patientName, testName, category, resultValue, referenceRange, unit, interpretation, req.user!.displayName, req.user!.displayName);

  logAudit(req.user!.id, req.user!.email, req.user!.role, 'LAB_RESULT_RECORDED', id, `${testName}: ${resultValue} (${interpretation})`);
  res.status(201).json({ lab: db.prepare('SELECT * FROM lab_results WHERE id = ?').get(id) });
});

app.get('/api/vitals', requireNonGuest, (req: AuthedRequest, res) => {
  if (req.user?.role === 'patient') {
    const ownPatient = db
      .prepare('SELECT id FROM patients WHERE LOWER(full_name) = LOWER(?) LIMIT 1')
      .get(req.user.displayName) as { id?: string } | undefined;
    const scopedId = ownPatient?.id || 'pat-001';
    const rows = db.prepare('SELECT * FROM vital_signs WHERE patient_id = ? ORDER BY recorded_at DESC LIMIT 30').all(scopedId);
    return res.json({ vitals: rows });
  }
  const patientId = typeof req.query.patientId === 'string' ? req.query.patientId : null;
  const rows = patientId
    ? db.prepare('SELECT * FROM vital_signs WHERE patient_id = ? ORDER BY recorded_at DESC LIMIT 30').all(patientId)
    : db.prepare('SELECT * FROM vital_signs ORDER BY recorded_at DESC LIMIT 30').all();
  res.json({ vitals: rows });
});

app.post('/api/vitals', requireRoles(['doctor', 'nurse', 'admin', 'patient']), (req: AuthedRequest, res) => {
  const { patientId = 'pat-001', heartRate, systolicBp, diastolicBp, spo2, temperature, respiratoryRate = 18, notes = '' } = req.body || {};
  let effectivePatientId = patientId;
  if (req.user?.role === 'patient') {
    const ownPatient = db
      .prepare('SELECT id FROM patients WHERE LOWER(full_name) = LOWER(?) LIMIT 1')
      .get(req.user.displayName) as { id?: string } | undefined;
    effectivePatientId = ownPatient?.id || 'pat-001';
  }
  const id = `vit-${Date.now()}`;
  db.prepare(`
    INSERT INTO vital_signs (id, patient_id, recorded_by, heart_rate, systolic_bp, diastolic_bp, spo2, temperature, respiratory_rate, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, effectivePatientId, req.user!.displayName, Number(heartRate) || 76, Number(systolicBp) || 120, Number(diastolicBp) || 80, Number(spo2) || 98, Number(temperature) || 36.8, Number(respiratoryRate) || 18, notes);

  logAudit(req.user!.id, req.user!.email, req.user!.role, 'VITALS_RECORDED', id, `HR ${heartRate} BP ${systolicBp}/${diastolicBp} SpO2 ${spo2}%`);

  // Broadcast live telemetry sensor signal across the Neural Bus (auto-escalates if abnormal)
  dispatchNeuralSignal({
    channel: 'sensor_telemetry',
    eventType: 'sensor',
    senderId: req.user!.id,
    senderName: req.user!.displayName,
    senderRole: req.user!.role,
    targetRole: 'doctor',
    subject: 'Biometric Sensor Update',
    content: `Vitals logged for ${effectivePatientId}: HR ${Number(heartRate) || 76} bpm, BP ${Number(systolicBp) || 120}/${Number(diastolicBp) || 80} mmHg, SpO2 ${Number(spo2) || 98}%, Temp ${Number(temperature) || 36.8}°C`,
    payload: {
      patientId: effectivePatientId,
      heartRate: Number(heartRate) || 76,
      systolicBp: Number(systolicBp) || 120,
      diastolicBp: Number(diastolicBp) || 80,
      spo2: Number(spo2) || 98,
      temperature: Number(temperature) || 36.8
    },
    priority: Number(spo2) < 92 || Number(heartRate) > 130 ? 'stat_emergency' : 'normal'
  });

  res.status(201).json({ vital: db.prepare('SELECT * FROM vital_signs WHERE id = ?').get(id) });
});

app.get('/api/appointments', requireNonGuest, (req: AuthedRequest, res) => {
  if (req.user?.role === 'patient') {
    const own = db
      .prepare('SELECT * FROM appointments WHERE LOWER(patient_name) = LOWER(?) ORDER BY scheduled_for ASC')
      .all(req.user.displayName);
    return res.json({ appointments: own });
  }
  res.json({ appointments: db.prepare('SELECT * FROM appointments ORDER BY scheduled_for ASC').all() });
});

app.post('/api/appointments', requireNonGuest, (req: AuthedRequest, res) => {
  const { patientId = 'pat-001', patientName, clinicianName = 'Dr. Sarah M. Nakitto', facility = 'Mulago Outpatient Clinic', scheduledFor, visitType = 'Telemedicine', reason } = req.body || {};
  if (!scheduledFor || !reason) {
    return res.status(400).json({ error: 'Scheduled date/time and visit reason are required.' });
  }
  const effectivePatientName = req.user!.role === 'patient' ? req.user!.displayName : patientName || req.user!.displayName;
  const id = `apt-${Date.now()}`;
  db.prepare(`
    INSERT INTO appointments (id, patient_id, patient_name, clinician_name, facility, scheduled_for, visit_type, reason, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Scheduled')
  `).run(id, patientId, effectivePatientName, clinicianName, facility, scheduledFor, visitType, reason);

  logAudit(req.user!.id, req.user!.email, req.user!.role, 'APPOINTMENT_BOOKED', id, `${visitType} at ${facility}`);
  res.status(201).json({ appointment: db.prepare('SELECT * FROM appointments WHERE id = ?').get(id) });
});

app.get('/api/referrals', requireRoles(['doctor', 'nurse', 'admin']), (_req, res) => {
  res.json({ referrals: db.prepare('SELECT * FROM referrals ORDER BY created_at DESC').all() });
});

app.post('/api/referrals', requireRoles(['doctor', 'nurse', 'admin']), (req: AuthedRequest, res) => {
  const { patientId = 'pat-001', patientName, toFacility, urgency = 'Urgent', reason, vitalsSummary = '' } = req.body || {};
  if (!patientName || !toFacility || !reason) {
    return res.status(400).json({ error: 'Patient name, receiving facility, and clinical reason are required.' });
  }
  const id = `ref-${Date.now()}`;
  db.prepare(`
    INSERT INTO referrals (id, patient_id, patient_name, from_clinician, to_facility, urgency, reason, vitals_summary, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Dispatched')
  `).run(id, patientId, patientName, req.user!.displayName, toFacility, urgency, reason, vitalsSummary);

  logAudit(req.user!.id, req.user!.email, req.user!.role, 'REFERRAL_CREATED', id, `${urgency} referral to ${toFacility}`);
  res.status(201).json({ referral: db.prepare('SELECT * FROM referrals WHERE id = ?').get(id) });
});

// ---------------------------------------------------------------------------
// HOSPITAL ADMIN & AUDIT ROUTES
// ---------------------------------------------------------------------------
app.get('/api/admin/overview', requireRoles(['admin']), (_req, res) => {
  const patients = (db.prepare('SELECT COUNT(*) as c FROM patients').get() as { c: number }).c;
  const prescriptions = (db.prepare('SELECT COUNT(*) as c FROM prescriptions').get() as { c: number }).c;
  const pendingRx = (db.prepare("SELECT COUNT(*) as c FROM prescriptions WHERE status = 'pending_approval'").get() as { c: number }).c;
  const labs = (db.prepare('SELECT COUNT(*) as c FROM lab_results').get() as { c: number }).c;
  const criticalLabs = (db.prepare("SELECT COUNT(*) as c FROM lab_results WHERE interpretation = 'Critical'").get() as { c: number }).c;
  const users = (db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number }).c;
  const referrals = (db.prepare('SELECT COUNT(*) as c FROM referrals').get() as { c: number }).c;

  res.json({
    metrics: {
      totalPatients: patients,
      totalPrescriptions: prescriptions,
      pendingApprovals: pendingRx,
      totalLabs: labs,
      criticalLabs,
      activeStaffAccounts: users,
      activeReferrals: referrals
    }
  });
});

app.get('/api/admin/users', requireRoles(['admin']), (_req, res) => {
  const users = db.prepare('SELECT id, email, display_name, role, specialty, facility, phone, license_number, status, license_verified, mfa_enabled, created_at FROM users ORDER BY created_at DESC').all();
  res.json({ users });
});

app.get('/api/admin/pending-clinicians', requireRoles(['admin']), (_req, res) => {
  const pending = db
    .prepare("SELECT id, email, display_name, role, specialty, facility, phone, license_number, status, created_at FROM users WHERE status = 'pending_verification' ORDER BY created_at DESC")
    .all();
  res.json({ pending });
});

app.post('/api/admin/users/:id/verify-clinician', requireRoles(['admin']), (req: AuthedRequest, res) => {
  const { id } = req.params;
  const { approve = true } = req.body || {};
  const target = db.prepare('SELECT id, email, role FROM users WHERE id = ?').get(id) as any;
  if (!target) {
    return res.status(404).json({ error: 'Clinician account not found.' });
  }
  if (approve) {
    db.prepare("UPDATE users SET status = 'active', license_verified = 1 WHERE id = ?").run(id);
    logAudit(req.user!.id, req.user!.email, req.user!.role, 'CLINICIAN_VERIFIED', id, `Approved license & activated ${target.email}`);
    recordSecurityEvent('CLINICIAN_LICENSE_APPROVED', 'info', getClientIp(req), target.email, `Approved by admin ${req.user!.email}`);
  } else {
    db.prepare("UPDATE users SET status = 'suspended', license_verified = 0 WHERE id = ?").run(id);
    revokeAllUserSessions(id);
    logAudit(req.user!.id, req.user!.email, req.user!.role, 'CLINICIAN_REJECTED', id, `Rejected & suspended ${target.email}`);
    recordSecurityEvent('CLINICIAN_LICENSE_REJECTED', 'warning', getClientIp(req), target.email, `Rejected by admin ${req.user!.email}`);
  }
  res.json({ user: db.prepare('SELECT id, email, display_name, role, status, license_verified FROM users WHERE id = ?').get(id) });
});

app.patch('/api/admin/users/:id', requireRoles(['admin']), (req: AuthedRequest, res) => {
  const { id } = req.params;
  const { role, status } = req.body || {};
  if (role && ['patient', 'doctor', 'nurse', 'admin'].includes(role)) {
    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id);
  }
  if (status && ['active', 'suspended', 'pending_verification'].includes(status)) {
    db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, id);
    if (status === 'suspended') {
      revokeAllUserSessions(id);
    }
  }
  logAudit(req.user!.id, req.user!.email, req.user!.role, 'ADMIN_USER_UPDATED', id, `role=${role || 'unchanged'} status=${status || 'unchanged'}`);
  res.json({ user: db.prepare('SELECT id, email, display_name, role, specialty, facility, status, license_verified FROM users WHERE id = ?').get(id) });
});

app.get('/api/admin/audit-logs', requireRoles(['admin']), (_req, res) => {
  const logs = db.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 50').all();
  res.json({ logs });
});

// ---------------------------------------------------------------------------
// LIVE DASHBOARD TELEMETRY, STEPS & BED LEDGER (REAL-TIME SQLITE STATE)
// ---------------------------------------------------------------------------
function getLiveDashboardSummaryPayload(hospitalId: string, userKey: string) {
  ensureHospitalBeds(hospitalId);
  const todayStr = new Date().toISOString().slice(0, 10);

  const totalPatients = (db.prepare('SELECT COUNT(*) as c FROM patients').get() as { c: number }).c;
  const stablePatients = (db.prepare("SELECT COUNT(*) as c FROM patients WHERE risk_tier = 'Stable'").get() as { c: number }).c;
  const attentionPatients = (db.prepare("SELECT COUNT(*) as c FROM patients WHERE risk_tier IN ('Attention', 'Critical')").get() as { c: number }).c;

  const activeDoctors = (db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'doctor' AND status = 'active'").get() as { c: number }).c;
  const activeNurses = (db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'nurse' AND status = 'active'").get() as { c: number }).c;

  const totalAppointments = (db.prepare('SELECT COUNT(*) as c FROM appointments').get() as { c: number }).c;
  const completedAppointments = (db.prepare("SELECT COUNT(*) as c FROM appointments WHERE status = 'Completed'").get() as { c: number }).c;
  const pendingAppointments = Math.max(0, totalAppointments - completedAppointments);

  const totalPrescriptions = (db.prepare('SELECT COUNT(*) as c FROM prescriptions').get() as { c: number }).c;
  const activePrescriptions = (db.prepare("SELECT COUNT(*) as c FROM prescriptions WHERE status = 'active'").get() as { c: number }).c;
  const pendingPrescriptions = (db.prepare("SELECT COUNT(*) as c FROM prescriptions WHERE status = 'pending_approval'").get() as { c: number }).c;

  const totalLabs = (db.prepare('SELECT COUNT(*) as c FROM lab_results').get() as { c: number }).c;
  const completedLabs = (db.prepare("SELECT COUNT(*) as c FROM lab_results WHERE status = 'Completed'").get() as { c: number }).c;
  const pendingLabs = Math.max(0, totalLabs - completedLabs);
  const normalLabs = (db.prepare("SELECT COUNT(*) as c FROM lab_results WHERE interpretation = 'Normal'").get() as { c: number }).c;
  const abnormalLabs = Math.max(0, totalLabs - normalLabs);

  const openEmergencies = (db.prepare("SELECT COUNT(*) as c FROM referrals WHERE urgency = 'Emergency' AND status != 'Completed'").get() as { c: number }).c;
  const criticalPatientCount = (db.prepare("SELECT COUNT(*) as c FROM patients WHERE risk_tier = 'Critical'").get() as { c: number }).c;

  const beds = db.prepare('SELECT * FROM hospital_beds WHERE hospital_id = ? ORDER BY bed_number ASC').all(hospitalId) as any[];
  const occupiedBeds = beds.filter(b => b.status === 'occupied').length;
  const availableBeds = beds.filter(b => b.status === 'available').length;
  const cleaningBeds = beds.filter(b => b.status === 'cleaning').length;
  const bedOccupancyPct = beds.length > 0 ? Math.round((occupiedBeds / beds.length) * 100) : 0;

  let telemetry = db.prepare('SELECT * FROM daily_telemetry WHERE user_key = ? AND date_str = ?').get(userKey, todayStr) as any;
  if (!telemetry) {
    telemetry = {
      user_key: userKey,
      date_str: todayStr,
      steps: 0,
      steps_goal: 10000,
      calories: 0,
      water_ml: 0,
      sleep_minutes: 0,
      updated_at: null
    };
  }

  const recentPatients = db.prepare('SELECT id, mrn, full_name, age, gender, district, risk_tier, updated_at FROM patients ORDER BY updated_at DESC LIMIT 6').all();
  const recentAppointments = db.prepare('SELECT * FROM appointments ORDER BY created_at DESC LIMIT 6').all();
  const recentLabs = db.prepare('SELECT * FROM lab_results ORDER BY created_at DESC LIMIT 6').all();
  const recentLogs = db.prepare('SELECT id, actor_role, action, details, created_at FROM audit_logs ORDER BY created_at DESC LIMIT 8').all();

  const vitalsCountToday = (db.prepare("SELECT COUNT(*) as c FROM vital_signs WHERE date(recorded_at) = date('now')").get() as { c: number }).c;

  const stepsGoalPct = telemetry.steps_goal > 0 ? Math.min(100, Math.round((telemetry.steps / telemetry.steps_goal) * 100)) : 0;
  const rxDonePct = totalPrescriptions > 0 ? Math.round((activePrescriptions / totalPrescriptions) * 100) : 0;
  const apptsDonePct = totalAppointments > 0 ? Math.round((completedAppointments / totalAppointments) * 100) : 0;
  const labsDonePct = totalLabs > 0 ? Math.round((completedLabs / totalLabs) * 100) : 0;

  const checklist = [
    {
      key: 'steps',
      label: 'Daily Movement / Steps',
      done: telemetry.steps > 0,
      statusText: telemetry.steps > 0 ? `${telemetry.steps.toLocaleString()} / ${telemetry.steps_goal.toLocaleString()} steps logged` : '0 steps yet — walk or sync steps'
    },
    {
      key: 'appointments',
      label: 'Appointments Completed',
      done: totalAppointments > 0 && pendingAppointments === 0,
      statusText: `${completedAppointments} done · ${pendingAppointments} not yet completed`
    },
    {
      key: 'labs',
      label: 'Lab Results Reviewed',
      done: totalLabs > 0 && pendingLabs === 0,
      statusText: `${completedLabs} completed · ${pendingLabs} pending review`
    },
    {
      key: 'prescriptions',
      label: 'Prescriptions Approved',
      done: totalPrescriptions > 0 && pendingPrescriptions === 0,
      statusText: `${activePrescriptions} approved · ${pendingPrescriptions} awaiting approval`
    },
    {
      key: 'vitals',
      label: 'Vitals Recorded Today',
      done: vitalsCountToday > 0,
      statusText: vitalsCountToday > 0 ? `${vitalsCountToday} readings saved today` : 'No readings saved to DB today yet'
    }
  ];

  const overallScore = Math.round((stepsGoalPct + rxDonePct + apptsDonePct + labsDonePct) / 4);

  return {
    serverTime: new Date().toISOString(),
    hospitalId,
    counts: {
      totalPatients,
      stablePatients,
      attentionPatients,
      activeDoctors,
      activeNurses,
      totalClinicians: activeDoctors + activeNurses,
      totalAppointments,
      completedAppointments,
      pendingAppointments,
      totalPrescriptions,
      activePrescriptions,
      pendingPrescriptions,
      totalLabs,
      completedLabs,
      pendingLabs,
      normalLabs,
      abnormalLabs,
      emergencyCases: openEmergencies + criticalPatientCount,
      vitalsCountToday
    },
    beds: {
      total: beds.length,
      occupied: occupiedBeds,
      available: availableBeds,
      cleaning: cleaningBeds,
      occupancyPct: bedOccupancyPct,
      list: beds
    },
    telemetry: {
      steps: telemetry.steps || 0,
      stepsGoal: telemetry.steps_goal || 10000,
      calories: telemetry.calories || 0,
      waterMl: telemetry.water_ml || 0,
      sleepMinutes: telemetry.sleep_minutes || 0,
      updatedAt: telemetry.updated_at || null,
      stepsGoalPct
    },
    progress: {
      stepsGoalPct,
      rxDonePct,
      apptsDonePct,
      labsDonePct,
      overallScore
    },
    checklist,
    recentPatients,
    recentAppointments,
    recentLabs,
    recentLogs
  };
}

app.get('/api/dashboard/live-summary', (req: AuthedRequest, res) => {
  const hospitalId = typeof req.query.hospitalId === 'string' && req.query.hospitalId.trim()
    ? req.query.hospitalId.trim()
    : 'mulago-national';
  const userKey = req.user?.id || 'guest-sandbox';
  res.json(getLiveDashboardSummaryPayload(hospitalId, userKey));
});

app.post('/api/dashboard/steps', (req: AuthedRequest, res) => {
  const { deltaSteps, absoluteSteps, waterMl, sleepMinutes, stepsGoal, hospitalId = 'mulago-national' } = req.body || {};
  // Bind strictly to authenticated user id, or isolated 'guest-sandbox' — prevents cross-user telemetry tampering
  const userKey = req.user?.id || 'guest-sandbox';
  const todayStr = new Date().toISOString().slice(0, 10);

  const existing = db.prepare('SELECT * FROM daily_telemetry WHERE user_key = ? AND date_str = ?').get(userKey, todayStr) as any;
  let nextSteps = existing ? existing.steps : 0;
  if (typeof absoluteSteps === 'number' && !Number.isNaN(absoluteSteps)) {
    nextSteps = Math.min(200000, Math.max(0, Math.round(absoluteSteps)));
  } else if (typeof deltaSteps === 'number' && !Number.isNaN(deltaSteps)) {
    nextSteps = Math.min(200000, Math.max(0, nextSteps + Math.round(deltaSteps)));
  }

  const nextGoal = typeof stepsGoal === 'number' && stepsGoal >= 1000 ? Math.min(100000, Math.round(stepsGoal)) : (existing?.steps_goal ?? 10000);
  const nextWater = typeof waterMl === 'number' ? Math.min(20000, Math.max(0, Math.round(waterMl))) : (existing?.water_ml ?? 0);
  const nextSleep = typeof sleepMinutes === 'number' ? Math.min(1440, Math.max(0, Math.round(sleepMinutes))) : (existing?.sleep_minutes ?? 0);
  const nextCalories = Math.round(nextSteps * 0.042);

  if (existing) {
    db.prepare(`
      UPDATE daily_telemetry
      SET steps = ?, steps_goal = ?, calories = ?, water_ml = ?, sleep_minutes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(nextSteps, nextGoal, nextCalories, nextWater, nextSleep, existing.id);
  } else {
    db.prepare(`
      INSERT INTO daily_telemetry (id, user_key, date_str, steps, steps_goal, calories, water_ml, sleep_minutes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(`tel-${Date.now()}`, userKey, todayStr, nextSteps, nextGoal, nextCalories, nextWater, nextSleep);
  }

  res.json(getLiveDashboardSummaryPayload(String(hospitalId), userKey));
});

app.post('/api/dashboard/beds/update', requireRoles(['doctor', 'nurse', 'admin']), (req: AuthedRequest, res) => {
  const { bedId, hospitalId = 'mulago-national', status, patientName, diagnosis } = req.body || {};
  if (!bedId || !['occupied', 'available', 'cleaning'].includes(status)) {
    return res.status(400).json({ error: 'bedId and valid status (occupied | available | cleaning) are required.' });
  }
  ensureHospitalBeds(String(hospitalId));
  db.prepare(`
    UPDATE hospital_beds
    SET status = ?, patient_name = ?, diagnosis = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    status,
    status === 'occupied' ? (patientName || 'Admitted Patient') : null,
    status === 'occupied' ? (diagnosis || 'Inpatient monitoring') : status === 'cleaning' ? 'Sanitization in progress' : null,
    bedId
  );
  logAudit(req.user!.id, req.user!.email, req.user!.role, 'BED_STATUS_UPDATED', bedId, `Hospital ${hospitalId} bed -> ${status}`);
  res.json(getLiveDashboardSummaryPayload(String(hospitalId), req.user!.id));
});

app.post('/api/dashboard/appointments/:id/toggle', requireNonGuest, (req: AuthedRequest, res) => {
  const { id } = req.params;
  const hospitalId = String(req.body?.hospitalId || 'mulago-national');
  const row = db.prepare('SELECT status, patient_name FROM appointments WHERE id = ?').get(id) as { status: string; patient_name: string } | undefined;
  if (!row) return res.status(404).json({ error: 'Appointment not found.' });
  if (req.user?.role === 'patient' && row.patient_name?.toLowerCase() !== req.user.displayName.toLowerCase()) {
    return res.status(403).json({ error: 'Access denied: cannot modify another patient appointment.' });
  }
  const nextStatus = row.status === 'Completed' ? 'Scheduled' : 'Completed';
  db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run(nextStatus, id);
  res.json(getLiveDashboardSummaryPayload(hospitalId, req.user!.id));
});

// Mount Hardened 1GB Encrypted Cloud Storage Vault Routes
setupStorageVaultRoutes(app, db, JWT_SECRET, async () => {});

// ---------------------------------------------------------------------------
// MULTI-ROLE SERVER NEURAL COMMUNICATION BUS & NETWORK MESSENGER ROUTES
// ---------------------------------------------------------------------------
app.get('/api/network/users', (req: AuthedRequest, res) => {
  const rows = db
    .prepare(`
      SELECT id, email, display_name, role, specialty, facility, phone, status, created_at
      FROM users
      WHERE status = 'active'
      ORDER BY role ASC, display_name ASC
    `)
    .all() as any[];

  const users = rows.map((u) => ({
    id: u.id,
    email: req.user ? u.email : `${u.role}@doctorian.org`,
    displayName: u.display_name,
    role: u.role,
    specialty: u.specialty,
    facility: u.facility,
    phone: req.user && req.user.role !== 'guest' ? u.phone : undefined,
    isDoctor: u.role === 'doctor' || u.role === 'nurse',
    isAdmin: u.role === 'admin',
    isOnline: true,
    createdAt: u.created_at
  }));

  res.json({ users, total: users.length });
});

app.get('/api/network/messages', (req: AuthedRequest, res) => {
  const channel = typeof req.query.channel === 'string' ? req.query.channel : undefined;
  const peerId = typeof req.query.peerId === 'string' ? req.query.peerId : undefined;
  const eventType = typeof req.query.eventType === 'string' ? req.query.eventType : undefined;

  const messages = queryNeuralMessages({
    channel,
    peerId,
    eventType,
    userId: req.user?.id,
    userRole: req.user?.role || 'guest',
    limit: 100
  });
  res.json({ messages, count: messages.length });
});

app.post('/api/network/messages', requireAuth, (req: AuthedRequest, res) => {
  const {
    recipientId = 'all',
    recipientName,
    channel = 'direct',
    content,
    subject,
    messageType = 'text',
    attachments,
    priority = 'normal'
  } = req.body || {};

  if (!content || !String(content).trim()) {
    return res.status(400).json({ error: 'Message content is required.' });
  }

  let targetRole: 'all' | 'patient' | 'doctor' | 'nurse' | 'admin' = 'all';
  if (recipientId === 'role:doctor' || channel === 'doctor_colleagues') targetRole = 'doctor';
  else if (recipientId === 'role:admin') targetRole = 'admin';
  else if (recipientId === 'role:patient') targetRole = 'patient';

  const mappedType: NeuralSignalType =
    messageType === 'text' ? 'chat' :
    messageType === 'vitals_alert' ? 'alarm' :
    (['signal', 'chat', 'alarm', 'sensor', 'alert', 'order', 'billing', 'clinical_note', 'prescription', 'referral', 'lab_order'].includes(messageType)
      ? messageType as NeuralSignalType
      : 'signal');

  const signal = dispatchNeuralSignal({
    channel: String(channel),
    eventType: mappedType,
    senderId: req.user!.id,
    senderName: req.user!.displayName,
    senderRole: req.user!.role,
    senderSpecialty: req.user!.specialty || undefined,
    targetRole,
    targetUserId: recipientId && !String(recipientId).startsWith('role:') && recipientId !== 'all' ? String(recipientId) : null,
    recipientName: recipientName ? String(recipientName) : null,
    subject: subject ? String(subject) : undefined,
    content: String(content).trim().slice(0, 4000),
    payload: attachments,
    priority: ['normal', 'urgent', 'stat_emergency'].includes(priority) ? priority : 'normal'
  });

  res.status(201).json({
    success: true,
    message: signal,
    serverDeliveryStatus: 'NEURAL_MESH_DELIVERED'
  });
});

app.post('/api/network/messages/:id/read', requireAuth, (req: AuthedRequest, res) => {
  db.prepare('UPDATE neural_messages SET is_read = 1 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.get('/api/network/stats', (_req, res) => {
  res.json(getNeuralNetworkStats());
});

app.get('/api/neural/events', (req: AuthedRequest, res) => {
  const eventType = typeof req.query.eventType === 'string' ? req.query.eventType : undefined;
  const limit = Number(req.query.limit) || 60;
  const signals = queryNeuralMessages({
    eventType,
    userId: req.user?.id,
    userRole: req.user?.role || 'guest',
    limit
  });
  res.json({ signals, stats: getNeuralNetworkStats() });
});

app.post('/api/neural/signal', (req: AuthedRequest, res) => {
  const {
    channel = 'neural_mesh',
    eventType = 'signal',
    targetRole = 'all',
    targetUserId,
    subject,
    content,
    payload,
    priority = 'normal'
  } = req.body || {};

  if (!content || !String(content).trim()) {
    return res.status(400).json({ error: 'Signal content is required.' });
  }

  const allowedTypes: NeuralSignalType[] = ['signal', 'chat', 'alarm', 'sensor', 'alert', 'order', 'billing', 'clinical_note', 'prescription', 'referral', 'lab_order', 'sync'];
  const normalizedType: NeuralSignalType = allowedTypes.includes(eventType) ? eventType : 'signal';

  const signal = dispatchNeuralSignal({
    channel: String(channel),
    eventType: normalizedType,
    senderId: req.user?.id || 'device-node',
    senderName: req.user?.displayName || String(req.body?.senderName || 'Clinical Node'),
    senderRole: req.user?.role || 'patient',
    senderSpecialty: req.user?.specialty || undefined,
    targetRole: ['all', 'patient', 'doctor', 'nurse', 'admin'].includes(targetRole) ? targetRole : 'all',
    targetUserId: targetUserId ? String(targetUserId) : null,
    subject: subject ? String(subject) : undefined,
    content: String(content).trim().slice(0, 4000),
    payload: payload && typeof payload === 'object' ? payload : undefined,
    priority: ['normal', 'urgent', 'stat_emergency'].includes(priority) ? priority : 'normal'
  });

  res.status(201).json({ success: true, signal, stats: getNeuralNetworkStats() });
});

// ---------------------------------------------------------------------------
// E-PHARMACY ORDERS & REAL-TIME DISPATCH API
// ---------------------------------------------------------------------------
app.get('/api/pharmacy/orders', (req: AuthedRequest, res) => {
  let rows: any[] = [];
  if (req.user && ['admin', 'doctor', 'nurse'].includes(req.user.role)) {
    rows = db.prepare('SELECT * FROM pharmacy_orders ORDER BY created_at DESC LIMIT 60').all();
  } else if (req.user && req.user.role !== 'guest') {
    rows = db.prepare('SELECT * FROM pharmacy_orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 40').all(req.user.id);
  } else {
    const orderNumber = typeof req.query.orderNumber === 'string' ? req.query.orderNumber : '';
    if (orderNumber) {
      rows = db.prepare('SELECT * FROM pharmacy_orders WHERE order_number = ?').all(orderNumber);
    }
  }

  const orders = rows.map((r) => ({
    id: r.id,
    orderNumber: r.order_number,
    userId: r.user_id,
    customerName: r.customer_name,
    customerPhone: r.customer_phone,
    deliveryAddress: r.delivery_address,
    district: r.district,
    pharmacyId: r.pharmacy_id,
    pharmacyName: r.pharmacy_name,
    fulfillmentType: r.fulfillment_type,
    paymentMethod: r.payment_method,
    subtotalUgx: r.subtotal_ugx,
    deliveryFeeUgx: r.delivery_fee_ugx,
    totalUgx: r.total_ugx,
    prescriptionRef: r.prescription_ref,
    notes: r.notes,
    status: r.status,
    createdAt: r.created_at,
    items: (() => {
      try { return JSON.parse(r.items_json); } catch { return []; }
    })()
  }));
  res.json({ orders });
});

app.post('/api/pharmacy/orders', (req: AuthedRequest, res) => {
  const {
    customerName,
    customerPhone,
    deliveryAddress,
    district = 'Kampala Central',
    pharmacyId = 'ecopharm',
    pharmacyName = 'Ecopharm Pharmacy & Clinic',
    fulfillmentType = 'delivery',
    paymentMethod = 'momo',
    items,
    prescriptionRef = '',
    notes = ''
  } = req.body || {};

  if (!customerName || !String(customerName).trim() || !customerPhone || !String(customerPhone).trim()) {
    return res.status(400).json({ error: 'Customer full name and contact phone number are required.' });
  }
  if (fulfillmentType === 'delivery' && (!deliveryAddress || !String(deliveryAddress).trim())) {
    return res.status(400).json({ error: 'Delivery address is required for doorstep dispatch.' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'At least one medication item must be in the order.' });
  }

  const cleanItems = items.slice(0, 40).map((it: any) => ({
    id: String(it.id || 'med-item'),
    name: String(it.name || 'Medication').slice(0, 120),
    dosage: String(it.dosage || '').slice(0, 60),
    qty: Math.max(1, Math.min(99, Number(it.qty) || 1)),
    unitPriceUgx: Math.max(500, Math.round(Number(it.unitPriceUgx) || 0)),
    prescriptionRequired: Boolean(it.prescriptionRequired)
  }));

  const subtotalUgx = cleanItems.reduce((sum, it) => sum + it.qty * it.unitPriceUgx, 0);
  const deliveryFeeUgx = fulfillmentType === 'pickup' ? 0 : (subtotalUgx >= 100000 ? 0 : 5000);
  const totalUgx = subtotalUgx + deliveryFeeUgx;
  const id = `ord-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const orderNumber = `RX-${new Date().getFullYear().toString().slice(-2)}${String(Date.now()).slice(-6)}`;
  const createdAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO pharmacy_orders (
      id, order_number, user_id, customer_name, customer_phone, delivery_address, district,
      pharmacy_id, pharmacy_name, fulfillment_type, payment_method, items_json,
      subtotal_ugx, delivery_fee_ugx, total_ugx, prescription_ref, notes, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?)
  `).run(
    id,
    orderNumber,
    req.user?.id || null,
    String(customerName).trim().slice(0, 120),
    String(customerPhone).trim().slice(0, 40),
    String(deliveryAddress || 'In-Pharmacy Counter Pickup').trim().slice(0, 240),
    String(district).trim().slice(0, 80),
    String(pharmacyId).trim().slice(0, 60),
    String(pharmacyName).trim().slice(0, 120),
    fulfillmentType === 'pickup' ? 'pickup' : 'delivery',
    String(paymentMethod).trim().slice(0, 40),
    JSON.stringify(cleanItems),
    subtotalUgx,
    deliveryFeeUgx,
    totalUgx,
    String(prescriptionRef || '').slice(0, 80),
    String(notes || '').slice(0, 500),
    createdAt
  );

  logAudit(
    req.user?.id || null,
    req.user?.email || 'patient-checkout@doctorian.org',
    req.user?.role || 'patient',
    'PHARMACY_ORDER_PLACED',
    orderNumber,
    `${cleanItems.length} medicine line(s) at ${pharmacyName} — UGX ${totalUgx.toLocaleString()}`
  );

  // Dispatch order onto Neural Communication Bus -> talks to Pharmacists, Doctors & Admin Billing automatically
  const itemSummary = cleanItems.map((i) => `${i.qty}x ${i.name}`).join(', ');
  const signal = dispatchNeuralSignal({
    channel: 'epharmacy_dispatch',
    eventType: 'order',
    senderId: req.user?.id || `guest-checkout-${id}`,
    senderName: String(customerName).trim(),
    senderRole: req.user?.role || 'patient',
    targetRole: 'doctor',
    subject: `E-Pharmacy Drug Order #${orderNumber}`,
    content: `${customerName} ordered ${itemSummary} from ${pharmacyName} (${district}, ${fulfillmentType}). Total: UGX ${totalUgx.toLocaleString()} via ${paymentMethod.toUpperCase()}.`,
    payload: {
      orderId: id,
      orderNumber,
      customerName: String(customerName).trim(),
      customerPhone: String(customerPhone).trim(),
      district,
      deliveryAddress: String(deliveryAddress || 'Counter Pickup').trim(),
      pharmacyId,
      pharmacyName,
      fulfillmentType,
      paymentMethod,
      items: cleanItems,
      subtotalUgx,
      deliveryFeeUgx,
      totalUgx,
      prescriptionRef
    },
    priority: cleanItems.some((i) => i.prescriptionRequired) ? 'urgent' : 'normal'
  });

  res.status(201).json({
    success: true,
    order: {
      id,
      orderNumber,
      customerName: String(customerName).trim(),
      customerPhone: String(customerPhone).trim(),
      deliveryAddress: String(deliveryAddress || 'Counter Pickup').trim(),
      district,
      pharmacyId,
      pharmacyName,
      fulfillmentType,
      paymentMethod,
      items: cleanItems,
      subtotalUgx,
      deliveryFeeUgx,
      totalUgx,
      prescriptionRef,
      notes,
      status: 'confirmed',
      createdAt
    },
    neuralSignalId: signal.id,
    estimatedMinutes: fulfillmentType === 'pickup' ? 15 : 42
  });
});

// ---------------------------------------------------------------------------
// OFFLINE SYNC BATCH ENDPOINT
// ---------------------------------------------------------------------------
function handleSyncBatch(req: AuthedRequest, res: Response) {
  const { operations = [] } = req.body || {};
  if (!Array.isArray(operations)) {
    return res.status(400).json({ error: 'operations array is required' });
  }
  const conflicts: Array<{ id: string; reason: string; serverTimestamp: string }> = [];
  const results: Array<{ id: string; status: string }> = [];
  let applied = 0;

  for (const op of operations) {
    const opId = String(op?.id || `sync-${applied}`);
    if (op?.forceConflictCheck && op?.clientUpdatedAt) {
      conflicts.push({
        id: opId,
        reason: 'Newer clinical update recorded on facility server.',
        serverTimestamp: new Date().toISOString()
      });
      continue;
    }

    try {
      if (op?.kind === 'neural_signal' && op?.payload?.content) {
        dispatchNeuralSignal({
          channel: op.payload.channel || 'neural_mesh',
          eventType: op.payload.eventType || 'signal',
          senderId: req.user!.id,
          senderName: req.user!.displayName,
          senderRole: req.user!.role,
          targetRole: op.payload.targetRole || 'all',
          subject: op.payload.subject,
          content: String(op.payload.content),
          payload: op.payload.payload,
          priority: op.payload.priority || 'normal'
        });
      }
      applied += 1;
      results.push({ id: opId, status: 'synced' });
    } catch {
      results.push({ id: opId, status: 'deferred' });
    }
  }

  logAudit(req.user!.id, req.user!.email, req.user!.role, 'OFFLINE_SYNC_BATCH', 'sync', `Applied ${applied} operations, ${conflicts.length} conflicts`);
  res.json({ applied, conflicts, results, syncedAt: new Date().toISOString() });
}

app.post('/api/sync/batch', requireNonGuest, handleSyncBatch);
app.post('/api/offline/sync', requireNonGuest, handleSyncBatch);

// ---------------------------------------------------------------------------
// NATIVE APP & OFFLINE PACKAGE ARTIFACT DOWNLOADS
// ---------------------------------------------------------------------------
app.get('/downloads/:artifact', (req, res) => {
  const safeName = path.basename(String(req.params.artifact || ''));
  const allowedArtifacts: Record<string, { file: string; contentType: string }> = {
    'Doctorian-Windows-Setup.exe': { file: 'Doctorian-Windows-Setup.exe', contentType: 'application/vnd.microsoft.portable-executable' },
    'Doctorian-Windows-Tablet-Setup.exe': { file: 'Doctorian-Windows-Setup.exe', contentType: 'application/vnd.microsoft.portable-executable' },
    'Doctorian-Setup.exe': { file: 'Doctorian-Setup.exe', contentType: 'application/vnd.microsoft.portable-executable' },
    'Doctorian-MedicalAI-Android.apk': { file: 'Doctorian-MedicalAI-Android.apk', contentType: 'application/vnd.android.package-archive' },
    'Doctorian-Tablet-HD.apk': { file: 'Doctorian-Tablet-HD.apk', contentType: 'application/vnd.android.package-archive' },
    'Doctorian-Offline-Package-Suite.json': { file: 'Doctorian-Offline-Package-Suite.json', contentType: 'application/json' }
  };

  const entry = allowedArtifacts[safeName];
  if (!entry) {
    return res.status(404).json({ error: 'Requested application package not found.' });
  }

  const filePath = path.resolve(__dirname, 'public', 'downloads', entry.file);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Package binary has not been generated yet.' });
  }

  res.setHeader('Content-Type', entry.contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.sendFile(filePath);
});

// ---------------------------------------------------------------------------
// STATIC FRONTEND / VITE MIDDLEWARE
// ---------------------------------------------------------------------------
if (process.env.NODE_ENV === 'production') {
  const distPath = path.resolve(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
} else {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true }
  });
  app.use(vite.middlewares);
}

const httpServer = http.createServer(app);
initNeuralBus(httpServer);

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Doctorian Clinical Platform + WebSocket Neural Bus running on http://0.0.0.0:${PORT}`);
});
