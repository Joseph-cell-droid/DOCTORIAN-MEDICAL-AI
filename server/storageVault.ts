import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { SERVER_SECRETS, getClientIp, recordSecurityEvent } from './security.ts';
import { executeVerifiedCheckout } from './billing.ts';

// 1 GB allocated in bytes (1024 * 1024 * 1024 bytes)
export const FREE_STORAGE_QUOTA_BYTES = 1073741824; // 1,073,741,824 bytes = 1 GB

export interface StoragePolicy {
  tier: 'free_1gb' | 'expanded_clinical' | 'enterprise_archive';
  label: string;
  totalQuotaBytes: number;
  maxFileSizeBytes: number;
  maxFiles: number;
  uploadsPer10Min: number;
  guestBlocked: boolean;
  encryptionAtRest: 'AES-256-GCM';
  magicByteFirewall: boolean;
}

export function computeStoragePolicy(totalQuotaBytes: number): StoragePolicy {
  if (totalQuotaBytes > 25 * 1024 * 1024 * 1024) {
    return {
      tier: 'enterprise_archive',
      label: 'Enterprise Medical Repository',
      totalQuotaBytes,
      maxFileSizeBytes: 250 * 1024 * 1024, // 250 MB single file
      maxFiles: 25000,
      uploadsPer10Min: 80,
      guestBlocked: true,
      encryptionAtRest: 'AES-256-GCM',
      magicByteFirewall: true
    };
  }
  if (totalQuotaBytes > FREE_STORAGE_QUOTA_BYTES) {
    return {
      tier: 'expanded_clinical',
      label: 'Paid Clinical Expansion Vault',
      totalQuotaBytes,
      maxFileSizeBytes: 100 * 1024 * 1024, // 100 MB single file
      maxFiles: 5000,
      uploadsPer10Min: 60,
      guestBlocked: true,
      encryptionAtRest: 'AES-256-GCM',
      magicByteFirewall: true
    };
  }
  return {
    tier: 'free_1gb',
    label: 'Free 1.00 GB Restricted Vault',
    totalQuotaBytes: FREE_STORAGE_QUOTA_BYTES,
    maxFileSizeBytes: 25 * 1024 * 1024, // Strict 25 MB max per file on Free 1 GB tier
    maxFiles: 150, // Strict 150 file objects cap on Free 1 GB tier
    uploadsPer10Min: 15, // Strict 15 uploads per 10 minutes on Free 1 GB tier
    guestBlocked: true,
    encryptionAtRest: 'AES-256-GCM',
    magicByteFirewall: true
  };
}

export interface StorageVaultFile {
  id: string;
  userId: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  category: 'document' | 'scan' | 'lab_report' | 'user_data' | 'media';
  filePath: string;
  sha256?: string;
  encryption?: string;
  encryptionMeta?: string;
  metadata?: string;
  createdAt: string;
  updatedAt: string;
}

export function setupStorageVaultRoutes(
  app: express.Application,
  db: any,
  jwtSecret: string,
  sendEmail: (to: string, subject: string, text: string, html?: string) => Promise<void>
) {
  const UPLOADS_DIR = path.join(process.cwd(), 'data', 'storage_vault');
  try {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  } catch (err) {
    console.error('[Storage Vault] Error creating uploads dir:', err);
  }

  // Create tables for 1GB Vault Files, 2-Way Verification & Security Audit Logs
  try {
    try {
      db.exec(`ALTER TABLE users ADD COLUMN storageQuotaBytes INTEGER DEFAULT 1073741824;`);
    } catch {}

    try {
      db.exec(`UPDATE users SET storageQuotaBytes = 1073741824 WHERE storageQuotaBytes IS NULL OR storageQuotaBytes <= 0;`);
    } catch {}

    db.exec(`
      CREATE TABLE IF NOT EXISTS user_storage_files (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        name TEXT NOT NULL,
        originalName TEXT NOT NULL,
        mimeType TEXT NOT NULL,
        size INTEGER NOT NULL,
        category TEXT DEFAULT 'document',
        filePath TEXT NOT NULL,
        sha256 TEXT,
        encryption TEXT DEFAULT 'AES-256-GCM',
        encryption_meta TEXT,
        metadata TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY(userId) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS storage_2fa_challenges (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        email TEXT NOT NULL,
        code TEXT NOT NULL,
        expiresAt INTEGER NOT NULL,
        verified INTEGER DEFAULT 0,
        attempts INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS storage_audit_logs (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        action TEXT NOT NULL,
        details TEXT,
        ip TEXT,
        userAgent TEXT,
        timestamp TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS storage_purchases (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        tierId TEXT NOT NULL,
        tierName TEXT NOT NULL,
        addedBytes INTEGER NOT NULL,
        previousQuotaBytes INTEGER NOT NULL,
        newQuotaBytes INTEGER NOT NULL,
        amount INTEGER NOT NULL,
        currency TEXT DEFAULT 'UGX',
        paymentMethod TEXT NOT NULL,
        phone TEXT,
        transactionId TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY(userId) REFERENCES users(id)
      );
    `);

    try { db.exec(`ALTER TABLE user_storage_files ADD COLUMN sha256 TEXT;`); } catch {}
    try { db.exec(`ALTER TABLE user_storage_files ADD COLUMN encryption TEXT DEFAULT 'AES-256-GCM';`); } catch {}
    try { db.exec(`ALTER TABLE user_storage_files ADD COLUMN encryption_meta TEXT;`); } catch {}
    try { db.exec(`ALTER TABLE storage_2fa_challenges ADD COLUMN attempts INTEGER DEFAULT 0;`); } catch {}

    console.log('[Storage Vault] Hardened AES-256-GCM Vault initialized: strict 1GB Free Cloud allocation per registered user.');
  } catch (err: any) {
    console.error('[Storage Vault] Schema initialization error:', err.message);
  }

  // Security & Audit Log Helper
  function logAudit(userId: string, action: string, details: string, req: express.Request) {
    try {
      const id = 'aud_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const userAgent = (req.headers['user-agent'] || 'Doctorian Cloud Client').substring(0, 255);
      db.prepare(`
        INSERT INTO storage_audit_logs (id, userId, action, details, ip, userAgent, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, userId, action, details, String(ip).split(',')[0].trim(), userAgent, new Date().toISOString());
    } catch (err) {
      console.warn('[Storage Audit Log Warning]:', err);
    }
  }

  // File Security & Magic-Byte Signature Firewall
  const DANGEROUS_EXTENSIONS = new Set([
    '.exe', '.bat', '.cmd', '.sh', '.vbs', '.msi', '.scr', '.pif', '.ps1', '.jar', '.com',
    '.dll', '.so', '.dylib', '.apk', '.deb', '.rpm', '.php', '.jsp', '.asp', '.hta', '.wsf'
  ]);
  const ALLOWED_EXTENSIONS = new Set([
    '.pdf', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.tif', '.tiff',
    '.dcm', '.dicom', '.txt', '.csv', '.json', '.xml', '.md', '.rtf',
    '.mp3', '.wav', '.ogg', '.webm', '.mp4', '.m4a', '.doc', '.docx', '.xls', '.xlsx'
  ]);

  function inspectMagicBytes(filename: string, buffer: Buffer): { ok: boolean; reason?: string } {
    const ext = path.extname(filename).toLowerCase();
    if (DANGEROUS_EXTENSIONS.has(ext) || !ALLOWED_EXTENSIONS.has(ext)) {
      return {
        ok: false,
        reason: `Extension '${ext || '(none)'}' is blocked by the Medical Vault Firewall.`
      };
    }
    if (!buffer || buffer.length === 0) {
      return { ok: false, reason: 'Empty zero-byte files are not permitted.' };
    }

    const head = buffer.subarray(0, 16);
    // Reject executable signatures (PE/MZ, ELF, Mach-O, shell shebang) regardless of extension
    if (head[0] === 0x4d && head[1] === 0x5a) {
      return { ok: false, reason: 'Windows PE executable signature (MZ) blocked.' };
    }
    if (head[0] === 0x7f && head[1] === 0x45 && head[2] === 0x4c && head[3] === 0x46) {
      return { ok: false, reason: 'Linux ELF binary executable blocked.' };
    }
    if (
      (head[0] === 0xcf && head[1] === 0xfa && head[2] === 0xed && head[3] === 0xfe) ||
      (head[0] === 0xfe && head[1] === 0xed && head[2] === 0xfa && head[3] === 0xce) ||
      (head[0] === 0x23 && head[1] === 0x21)
    ) {
      return { ok: false, reason: 'Native binary or executable script shebang blocked.' };
    }

    // Strict header verification for critical formats
    if (ext === '.pdf' && head.subarray(0, 5).toString('ascii') !== '%PDF-') {
      return { ok: false, reason: 'PDF header signature (%PDF-) mismatch — spoofed file rejected.' };
    }
    if (ext === '.png' && !(head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47)) {
      return { ok: false, reason: 'PNG binary signature mismatch — spoofed image rejected.' };
    }
    if ((ext === '.jpg' || ext === '.jpeg') && !(head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff)) {
      return { ok: false, reason: 'JPEG binary signature mismatch — spoofed image rejected.' };
    }
    return { ok: true };
  }

  // AES-256-GCM Master Vault Key derived from persistent server root secret
  const VAULT_MASTER_KEY = crypto
    .createHash('sha256')
    .update(`${SERVER_SECRETS.jwtSecret}:doctorian-vault-aes256-gcm-v2`)
    .digest();

  function encryptVaultBuffer(plainBuffer: Buffer): { ciphertext: Buffer; encryptionMeta: string } {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', VAULT_MASTER_KEY, iv);
    const encrypted = Buffer.concat([cipher.update(plainBuffer), cipher.final()]);
    const tag = cipher.getAuthTag();
    return {
      ciphertext: encrypted,
      encryptionMeta: JSON.stringify({
        alg: 'aes-256-gcm',
        iv: iv.toString('hex'),
        tag: tag.toString('hex'),
        plaintextBytes: plainBuffer.length
      })
    };
  }

  function decryptVaultBuffer(storedBuffer: Buffer, encryptionMetaJson?: string | null): Buffer {
    if (!encryptionMetaJson) return storedBuffer; // Legacy plaintext fallback
    try {
      const meta = JSON.parse(encryptionMetaJson);
      if (!meta?.iv || !meta?.tag) return storedBuffer;
      const decipher = crypto.createDecipheriv(
        'aes-256-gcm',
        VAULT_MASTER_KEY,
        Buffer.from(meta.iv, 'hex')
      );
      decipher.setAuthTag(Buffer.from(meta.tag, 'hex'));
      return Buffer.concat([decipher.update(storedBuffer), decipher.final()]);
    } catch (err) {
      throw new Error('Cryptographic integrity check failed while decrypting vault object.');
    }
  }

  function readDecryptedVaultFile(fileRecord: any): Buffer {
    const raw = fs.readFileSync(fileRecord.filePath);
    return decryptVaultBuffer(raw, fileRecord.encryption_meta);
  }

  // Sliding upload window limiter per userId
  const uploadRateMap = new Map<string, number[]>();
  function checkUploadRateLimit(userId: string, policy: StoragePolicy): { allowed: boolean; retrySec?: number } {
    const now = Date.now();
    const windowMs = 10 * 60 * 1000;
    const prev = (uploadRateMap.get(userId) || []).filter((ts) => now - ts < windowMs);
    if (prev.length >= policy.uploadsPer10Min) {
      const oldest = prev[0] || now;
      const retrySec = Math.max(5, Math.ceil((oldest + windowMs - now) / 1000));
      uploadRateMap.set(userId, prev);
      return { allowed: false, retrySec };
    }
    prev.push(now);
    uploadRateMap.set(userId, prev);
    return { allowed: true };
  }

  // Compute Cryptographic SHA-256 Checksum
  function computeBufferHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  // Configure Multer for File Uploads
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const user = (req as any).vaultUser;
      const userDir = path.join(UPLOADS_DIR, user?.id || 'common');
      try {
        fs.mkdirSync(userDir, { recursive: true });
      } catch {}
      cb(null, userDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      cb(null, `${uniqueSuffix}-${safeName}.enc`);
    },
  });

  const upload = multer({
    storage,
    limits: {
      fileSize: 250 * 1024 * 1024, // Hard ceiling; tighter tier cap enforced right below
    },
  });

  // Helper to calculate used bytes & strict tier policy with dynamic account quota
  function getUserStorageUsage(userId: string) {
    try {
      let totalQuotaBytes = FREE_STORAGE_QUOTA_BYTES;
      try {
        const userRow: any = db.prepare('SELECT storageQuotaBytes FROM users WHERE id = ?').get(userId);
        if (userRow && userRow.storageQuotaBytes && Number(userRow.storageQuotaBytes) > 0) {
          totalQuotaBytes = Number(userRow.storageQuotaBytes);
        }
      } catch {}

      const row: any = db
        .prepare(
          'SELECT COALESCE(SUM(size), 0) as usedBytes, COUNT(*) as fileCount FROM user_storage_files WHERE userId = ?'
        )
        .get(userId);
      const usedBytes = Number(row?.usedBytes || 0);
      const fileCount = Number(row?.fileCount || 0);
      const freeBytes = Math.max(0, totalQuotaBytes - usedBytes);
      const percentUsed = Math.min(100, Number(((usedBytes / totalQuotaBytes) * 100).toFixed(2)));
      const policy = computeStoragePolicy(totalQuotaBytes);
      const isFull = usedBytes >= totalQuotaBytes || percentUsed >= 100 || fileCount >= policy.maxFiles;

      return {
        totalQuotaBytes,
        usedBytes,
        freeBytes,
        fileCount,
        percentUsed,
        isFull,
        maxFiles: policy.maxFiles,
        maxFileSizeBytes: policy.maxFileSizeBytes,
        tier: policy.tier
      };
    } catch {
      const policy = computeStoragePolicy(FREE_STORAGE_QUOTA_BYTES);
      return {
        totalQuotaBytes: FREE_STORAGE_QUOTA_BYTES,
        usedBytes: 0,
        freeBytes: FREE_STORAGE_QUOTA_BYTES,
        fileCount: 0,
        percentUsed: 0,
        isFull: false,
        maxFiles: policy.maxFiles,
        maxFileSizeBytes: policy.maxFileSizeBytes,
        tier: policy.tier
      };
    }
  }

  // Middleware: Require Vault 2FA Unlock Token
  function requireVaultAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
    let token = '';
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.query.token) {
      token = req.query.token as string;
    } else if (req.cookies && req.cookies.vault_token) {
      token = req.cookies.vault_token;
    }

    if (!token) {
      return res.status(401).json({
        error: 'Vault is locked. Enter account password or two-way verification to unlock.',
        locked: true,
      });
    }

    try {
      const decoded: any = jwt.verify(token, jwtSecret);
      if (!decoded.userId || decoded.scope !== '1gb_vault_unlocked') {
        return res.status(403).json({ error: 'Invalid vault access credentials', locked: true });
      }

      const user: any = db.prepare('SELECT id, email, display_name as displayName, role, status FROM users WHERE id = ?').get(decoded.userId);
      if (!user || user.status !== 'active' || user.role === 'guest') {
        return res.status(403).json({ error: 'Verified registered account required for encrypted vault access.', locked: true });
      }

      (req as any).vaultUser = user;
      next();
    } catch {
      return res.status(401).json({
        error: 'Vault session expired. Please re-authenticate with credentials or two-way verification.',
        locked: true,
      });
    }
  }

  function isPathContainedInVault(filePath: string): boolean {
    const resolvedFile = path.resolve(filePath);
    const resolvedRoot = path.resolve(UPLOADS_DIR);
    return resolvedFile === resolvedRoot || resolvedFile.startsWith(resolvedRoot + path.sep);
  }

  function hashVaultCode(challengeId: string, code: string): string {
    return crypto.createHash('sha256').update(`${challengeId}:${code}`).digest('hex');
  }

  // =========================================================================
  // 0. PUBLIC / SESSION STORAGE GOVERNANCE POLICY SPECIFICATION
  // =========================================================================
  app.get('/api/storage/policies', (req: express.Request, res: express.Response) => {
    const totalQuota = FREE_STORAGE_QUOTA_BYTES;
    res.json({
      success: true,
      freePolicy: computeStoragePolicy(totalQuota),
      expandedPolicy: computeStoragePolicy(5 * 1024 * 1024 * 1024),
      enterprisePolicy: computeStoragePolicy(100 * 1024 * 1024 * 1024),
      allowedExtensions: Array.from(ALLOWED_EXTENSIONS)
    });
  });

  // =========================================================================
  // 1. QUICK UNLOCK VIA ACTIVE AUTHENTICATED SESSION OR DEVICE BIOMETRIC KEY
  // =========================================================================
  app.post('/api/storage/quick-unlock', async (req: express.Request, res: express.Response) => {
    try {
      let token = '';
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      } else if (req.cookies?.doctorian_token) {
        token = req.cookies.doctorian_token;
      } else if (req.cookies?.token) {
        token = req.cookies.token;
      } else if (req.body?.token) {
        token = req.body.token;
      }

      if (!token) {
        return res.status(401).json({ error: 'No active authenticated session detected. Please enter password or 2FA.' });
      }

      let decoded: any;
      try {
        decoded = jwt.verify(token, jwtSecret);
      } catch {
        return res.status(401).json({ error: 'Session token invalid or expired. Please sign in.' });
      }

      if (decoded.role === 'guest') {
        return res.status(403).json({ error: 'Guest sandbox sessions cannot unlock the encrypted medical vault.' });
      }

      const userId = decoded.id || decoded.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Invalid user session token.' });
      }

      const user: any = db.prepare('SELECT id, email, display_name as displayName, role, status FROM users WHERE id = ?').get(userId);
      if (!user || user.status !== 'active') {
        return res.status(404).json({ error: 'Active account not found in cloud registry.' });
      }

      // Issue Vault Unlock Token (4 hours session)
      const vaultToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          displayName: user.displayName,
          scope: '1gb_vault_unlocked',
          authMethod: 'verified_session',
        },
        jwtSecret,
        { expiresIn: '4h' }
      );

      logAudit(user.id, 'QUICK_SESSION_UNLOCK', `User unlocked 1GB Vault via verified credentials (${req.body.method || 'session_key'})`, req);

      const usage = getUserStorageUsage(user.id);
      const policy = computeStoragePolicy(usage.totalQuotaBytes);

      return res.json({
        success: true,
        message: '1GB Secure Cloud Storage Vault unlocked via verified active credentials.',
        vaultToken,
        quota: usage,
        policy,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
        },
      });
    } catch (err: any) {
      console.error('[Storage Quick Unlock Error]:', err);
      return res.status(500).json({ error: 'Quick unlock failed: ' + err.message });
    }
  });

  // ==========================================
  // 2. STEP 1: REQUEST 2-WAY VERIFICATION
  // ==========================================
  app.post('/api/storage/request-2fa', async (req: express.Request, res: express.Response) => {
    try {
      const { email, password } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Account email is required' });
      }

      const user: any = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email.trim());
      if (!user) {
        return res.status(404).json({ error: 'Account not found. Please register or verify email.' });
      }

      // Check if user is already authenticated via valid session token
      let isSessionAuth = false;
      const authHeader = req.headers.authorization;
      const sessionToken =
        authHeader && authHeader.startsWith('Bearer ')
          ? authHeader.split(' ')[1]
          : req.cookies?.doctorian_token || req.cookies?.token;
      if (sessionToken) {
        try {
          const decoded: any = jwt.verify(sessionToken, jwtSecret);
          if (
            decoded &&
            decoded.role !== 'guest' &&
            (decoded.id === user.id || decoded.userId === user.id || decoded.email?.toLowerCase() === user.email.toLowerCase())
          ) {
            isSessionAuth = true;
          }
        } catch {}
      }

      // If password provided, validate account password against password_hash
      if (password) {
        const storedHash = user.password_hash || user.password || '';
        const isPasswordValid = storedHash ? await bcrypt.compare(String(password), storedHash) : false;
        if (!isPasswordValid && !isSessionAuth) {
          return res.status(401).json({ error: 'Incorrect account password. Access denied.' });
        }
      } else if (!isSessionAuth) {
        return res.status(400).json({ error: 'Account password or active session is required to request two-way verification.' });
      }

      // Generate a cryptographically random 6-digit verification code and store only its hash
      const verificationCode = String(crypto.randomInt(100000, 1000000));
      const challengeId = 'ch_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex');
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
      const codeHash = hashVaultCode(challengeId, verificationCode);

      // Save hashed challenge to database
      db.prepare(
        'INSERT INTO storage_2fa_challenges (id, userId, email, code, expiresAt, verified, attempts, createdAt) VALUES (?, ?, ?, ?, ?, 0, 0, ?)'
      ).run(challengeId, user.id, user.email, codeHash, expiresAt, new Date().toISOString());

      logAudit(user.id, '2FA_CHALLENGE_DISPATCHED', `2-Way verification code dispatched for vault unlock (Challenge: ${challengeId})`, req);

      // Mask email for security display (e.g. j***@example.com)
      const parts = user.email.split('@');
      const maskedEmail =
        parts[0].length > 2
          ? `${parts[0][0]}***${parts[0][parts[0].length - 1]}@${parts[1]}`
          : `***@${parts[1]}`;

      // Dispatch 2-way verification email notification
      const emailText = `Hello ${user.display_name || 'Doctorian User'},\n\nYour two-way verification code to access your 1GB Free Cloud Document & File Vault is:\n\n🔑 ${verificationCode}\n\nThis security code is valid for 10 minutes.\nIf you did not initiate this request, please change your account password immediately.\n\nDoctorian Secure Core Team`;

      sendEmail(
        user.email,
        '🔑 1GB Vault Two-Way Verification Code: ' + verificationCode,
        emailText
      ).catch((e) => console.warn('[Storage Vault 2FA] Email dispatch log:', e.message));

      return res.json({
        success: true,
        message: `Two-way verification code sent to ${maskedEmail}`,
        challengeId,
        maskedEmail,
        expiresInSeconds: 600,
      });
    } catch (err: any) {
      console.error('[Storage Vault 2FA Request Error]:', err);
      return res.status(500).json({ error: 'Failed to process security gateway: ' + err.message });
    }
  });

  // ==========================================
  // 3. STEP 2: VERIFY 2-WAY CODE & UNLOCK VAULT
  // ==========================================
  app.post('/api/storage/verify-2fa', async (req: express.Request, res: express.Response) => {
    try {
      const { email, password, code, challengeId } = req.body;
      if (!email || !code) {
        return res.status(400).json({ error: 'Email and two-way verification code are required' });
      }

      const user: any = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email.trim());
      if (!user) {
        return res.status(404).json({ error: 'Account not found' });
      }

      // Verify code
      let challenge: any = null;
      if (challengeId) {
        challenge = db
          .prepare('SELECT * FROM storage_2fa_challenges WHERE id = ? AND userId = ?')
          .get(challengeId, user.id);
      } else {
        challenge = db
          .prepare(
            'SELECT * FROM storage_2fa_challenges WHERE userId = ? ORDER BY expiresAt DESC LIMIT 1'
          )
          .get(user.id);
      }

      if (!challenge) {
        return res.status(400).json({ error: 'No active two-way verification request found. Please request a new code.' });
      }

      // Check brute force attempts (max 5)
      if (challenge.attempts >= 5) {
        return res.status(403).json({ error: 'Security alert: Too many incorrect attempts. Code revoked. Please request a new code.' });
      }

      if (challenge.verified === 1) {
        return res.status(400).json({ error: 'Verification code already used. Please request a new code.' });
      }

      if (Date.now() > challenge.expiresAt) {
        return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
      }

      const candidateHash = hashVaultCode(challenge.id, String(code).trim());
      const a = Buffer.from(candidateHash, 'utf8');
      const b = Buffer.from(String(challenge.code || ''), 'utf8');
      if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
        db.prepare('UPDATE storage_2fa_challenges SET attempts = attempts + 1 WHERE id = ?').run(challenge.id);
        logAudit(user.id, '2FA_VERIFICATION_FAILED', `Incorrect 2FA code entered. Attempt ${challenge.attempts + 1} of 5.`, req);
        return res.status(401).json({ error: `Invalid two-way verification code (${4 - challenge.attempts} attempts remaining).` });
      }

      // Mark challenge as verified
      db.prepare('UPDATE storage_2fa_challenges SET verified = 1 WHERE id = ?').run(challenge.id);

      // Issue Vault Unlock Token (4 hours session)
      const displayName = user.display_name || user.displayName || 'Doctorian User';
      const vaultToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          displayName,
          scope: '1gb_vault_unlocked',
        },
        jwtSecret,
        { expiresIn: '4h' }
      );

      logAudit(user.id, '2FA_VERIFICATION_SUCCESS', `1GB Vault unlocked via two-way verification.`, req);

      const usage = getUserStorageUsage(user.id);
      const policy = computeStoragePolicy(usage.totalQuotaBytes);

      return res.json({
        success: true,
        message: '1GB Secure Cloud Vault unlocked successfully!',
        vaultToken,
        quota: usage,
        policy,
        user: {
          id: user.id,
          email: user.email,
          displayName,
        },
      });
    } catch (err: any) {
      console.error('[Storage Vault 2FA Verify Error]:', err);
      return res.status(500).json({ error: 'Verification error: ' + err.message });
    }
  });

  // ==========================================
  // 4. GET VAULT STATUS & CLOUD TELEMETRY
  // ==========================================
  app.get('/api/storage/status', requireVaultAuth, (req: express.Request, res: express.Response) => {
    const user = (req as any).vaultUser;
    const usage = getUserStorageUsage(user.id);
    const policy = computeStoragePolicy(usage.totalQuotaBytes);

    const categories = db
      .prepare(
        'SELECT category, COUNT(*) as count, COALESCE(SUM(size), 0) as bytes FROM user_storage_files WHERE userId = ? GROUP BY category'
      )
      .all(user.id);

    return res.json({
      success: true,
      quota: usage,
      policy,
      categories,
      cloudInfrastructure: {
        node: 'Doctorian Cloud Node West (AES-256-GCM Encrypted Cluster)',
        encryption: 'AES-256-GCM At-Rest + SHA-256 Bit-Level Integrity',
        sla: '99.99% Availability',
        tlsVersion: 'TLS 1.3 Strict Transport Security',
        accountIsolation: 'Isolated Tenant Namespace',
      },
    });
  });

  // ==========================================
  // 5. LIST FILES IN 1GB VAULT
  // ==========================================
  app.get('/api/storage/files', requireVaultAuth, (req: express.Request, res: express.Response) => {
    const user = (req as any).vaultUser;
    const { category, search } = req.query;

    let query = 'SELECT id, userId, name, originalName, mimeType, size, category, sha256, encryption, metadata, createdAt, updatedAt FROM user_storage_files WHERE userId = ?';
    const params: any[] = [user.id];

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search && typeof search === 'string' && search.trim()) {
      query += ' AND (name LIKE ? OR originalName LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }

    query += ' ORDER BY createdAt DESC';

    const files = db.prepare(query).all(...params);
    const usage = getUserStorageUsage(user.id);
    const policy = computeStoragePolicy(usage.totalQuotaBytes);

    return res.json({
      success: true,
      files,
      quota: usage,
      policy,
    });
  });

  // ==========================================
  // 6. UPLOAD FILE INTO 1GB VAULT (HIGH RESTRICTIONS + AES-256-GCM)
  // ==========================================
  app.post(
    '/api/storage/upload',
    requireVaultAuth,
    upload.single('file'),
    async (req: express.Request, res: express.Response) => {
      try {
        const user = (req as any).vaultUser;
        const file = req.file;

        if (!file) {
          return res.status(400).json({ error: 'No file uploaded' });
        }

        const usage = getUserStorageUsage(user.id);
        const policy = computeStoragePolicy(usage.totalQuotaBytes);
        const fileSize = file.size;

        // 1. Sliding Rate Limit Restriction
        const rateCheck = checkUploadRateLimit(user.id, policy);
        if (!rateCheck.allowed) {
          try { fs.unlinkSync(file.path); } catch {}
          return res.status(429).json({
            error: `Upload velocity limit exceeded (${policy.uploadsPer10Min} files / 10 min for ${policy.label}). Retry in ${rateCheck.retrySec}s.`,
            policyViolation: true,
            retryAfterSeconds: rateCheck.retrySec,
            policy,
          });
        }

        // 2. Strict Object Count Restriction
        if (usage.fileCount >= policy.maxFiles) {
          try { fs.unlinkSync(file.path); } catch {}
          return res.status(400).json({
            error: `Vault object count limit reached (${policy.maxFiles} files max on ${policy.label}). Delete old files or expand storage.`,
            quotaExceeded: true,
            requiresBilling: true,
            policyViolation: true,
            quota: usage,
            policy,
          });
        }

        // 3. Strict Per-File Byte Cap Restriction (25 MB Free vs 100/250 MB Paid)
        if (fileSize > policy.maxFileSizeBytes) {
          try { fs.unlinkSync(file.path); } catch {}
          const maxMb = (policy.maxFileSizeBytes / (1024 * 1024)).toFixed(0);
          const gotMb = (fileSize / (1024 * 1024)).toFixed(2);
          return res.status(400).json({
            error: `Single-file restriction: "${file.originalname}" (${gotMb} MB) exceeds the ${maxMb} MB per-file cap on ${policy.label}. Upgrade storage to unlock 100–250 MB uploads.`,
            policyViolation: true,
            requiresBilling: policy.tier === 'free_1gb',
            quota: usage,
            policy,
          });
        }

        // 4. Total Quota Restriction
        if (usage.usedBytes + fileSize > usage.totalQuotaBytes) {
          try { fs.unlinkSync(file.path); } catch {}
          const remainingMB = (usage.freeBytes / (1024 * 1024)).toFixed(2);
          const requestedMB = (fileSize / (1024 * 1024)).toFixed(2);
          return res.status(400).json({
            error: `Storage quota exceeded! Available: ${remainingMB} MB, Requested: ${requestedMB} MB. Purchase an expansion pack to continue uploading.`,
            quotaExceeded: true,
            isFull: true,
            requiresBilling: true,
            quota: usage,
            policy,
          });
        }

        // 5. Magic-Byte Signature & Extension Firewall
        const plainBuffer = fs.readFileSync(file.path);
        const magicCheck = inspectMagicBytes(file.originalname, plainBuffer);
        if (!magicCheck.ok) {
          try { fs.unlinkSync(file.path); } catch {}
          logAudit(user.id, 'MALICIOUS_FILE_BLOCKED', `${file.originalname}: ${magicCheck.reason}`, req);
          recordSecurityEvent('VAULT_FIREWALL_BLOCKED', 'high', getClientIp(req), user.email, `${file.originalname} -> ${magicCheck.reason}`);
          return res.status(400).json({
            error: `Security Firewall Rejected Upload: ${magicCheck.reason}`,
            policyViolation: true,
          });
        }

        // 6. Compute SHA-256 checksum on plaintext, then encrypt at rest with AES-256-GCM
        const sha256Hash = computeBufferHash(plainBuffer);
        const encrypted = encryptVaultBuffer(plainBuffer);
        fs.writeFileSync(file.path, encrypted.ciphertext);

        const fileId = 'vf_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
        const category = (req.body.category as string) || determineCategory(file.mimetype, file.originalname);
        const customName = req.body.name ? req.body.name.trim() : file.originalname;
        const now = new Date().toISOString();

        db.prepare(`
          INSERT INTO user_storage_files (
            id, userId, name, originalName, mimeType, size, category, filePath, sha256, encryption, encryption_meta, metadata, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          fileId,
          user.id,
          customName,
          file.originalname,
          file.mimetype,
          fileSize,
          category,
          file.path,
          sha256Hash,
          'AES-256-GCM',
          encrypted.encryptionMeta,
          JSON.stringify({ encoding: file.encoding, tierAtUpload: policy.tier }),
          now,
          now
        );

        logAudit(user.id, 'FILE_UPLOADED_AES256', `Encrypted & stored "${customName}" (${fileSize} bytes, SHA256: ${sha256Hash.substring(0, 16)}...)`, req);

        const updatedUsage = getUserStorageUsage(user.id);

        return res.json({
          success: true,
          message: `File encrypted (AES-256-GCM) and stored safely (${policy.label}).`,
          file: {
            id: fileId,
            userId: user.id,
            name: customName,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: fileSize,
            category,
            sha256: sha256Hash,
            encryption: 'AES-256-GCM',
            createdAt: now,
          },
          quota: updatedUsage,
          policy: computeStoragePolicy(updatedUsage.totalQuotaBytes),
        });
      } catch (err: any) {
        console.error('[Storage Vault Upload Error]:', err);
        return res.status(500).json({ error: 'Failed to upload file: ' + err.message });
      }
    }
  );

  // ==========================================
  // 7. SAVE STRUCTURED USER DATA / TEXT DOCUMENT (AES-256-GCM)
  // ==========================================
  app.post('/api/storage/save-data', requireVaultAuth, (req: express.Request, res: express.Response) => {
    try {
      const user = (req as any).vaultUser;
      const { name, content, category = 'user_data', mimeType = 'application/json' } = req.body;

      if (!name || content === undefined) {
        return res.status(400).json({ error: 'Document name and content are required' });
      }

      const stringContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
      const plainBuffer = Buffer.from(stringContent, 'utf8');
      const byteSize = plainBuffer.length;

      const usage = getUserStorageUsage(user.id);
      const policy = computeStoragePolicy(usage.totalQuotaBytes);

      if (usage.fileCount >= policy.maxFiles) {
        return res.status(400).json({
          error: `Vault object count limit reached (${policy.maxFiles} files max). Upgrade storage or prune older files.`,
          quotaExceeded: true,
          requiresBilling: true,
          policyViolation: true,
          quota: usage,
          policy,
        });
      }
      if (byteSize > policy.maxFileSizeBytes) {
        return res.status(400).json({
          error: `Document exceeds ${(policy.maxFileSizeBytes / (1024 * 1024)).toFixed(0)} MB per-file cap on ${policy.label}.`,
          policyViolation: true,
          quota: usage,
          policy,
        });
      }
      if (usage.usedBytes + byteSize > usage.totalQuotaBytes) {
        return res.status(400).json({
          error: 'Storage quota exceeded! Your cloud vault is full. Please purchase an expansion pack to continue saving clinical records.',
          quotaExceeded: true,
          isFull: true,
          requiresBilling: true,
          quota: usage,
          policy,
        });
      }

      const userDir = path.join(UPLOADS_DIR, user.id);
      fs.mkdirSync(userDir, { recursive: true });

      const fileId = 'vf_data_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      const safeFilename = `${fileId}_${name.replace(/[^a-zA-Z0-9._-]/g, '_')}.enc`;
      const filePath = path.join(userDir, safeFilename);

      const sha256Hash = computeBufferHash(plainBuffer);
      const encrypted = encryptVaultBuffer(plainBuffer);
      fs.writeFileSync(filePath, encrypted.ciphertext);

      const now = new Date().toISOString();
      db.prepare(`
        INSERT INTO user_storage_files (
          id, userId, name, originalName, mimeType, size, category, filePath, sha256, encryption, encryption_meta, metadata, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        fileId,
        user.id,
        name,
        name,
        mimeType,
        byteSize,
        category,
        filePath,
        sha256Hash,
        'AES-256-GCM',
        encrypted.encryptionMeta,
        JSON.stringify({ type: 'structured_user_data', tier: policy.tier }),
        now,
        now
      );

      logAudit(user.id, 'DATA_SAVED_AES256', `Encrypted & saved structured record "${name}" (${byteSize} bytes)`, req);

      const updatedUsage = getUserStorageUsage(user.id);

      return res.json({
        success: true,
        message: 'Data encrypted (AES-256-GCM) and recorded in your Vault',
        file: {
          id: fileId,
          name,
          mimeType,
          size: byteSize,
          category,
          sha256: sha256Hash,
          encryption: 'AES-256-GCM',
          createdAt: now,
        },
        quota: updatedUsage,
        policy,
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to save data: ' + err.message });
    }
  });

  // =========================================================================
  // 8. 1-CLICK CLINICAL DATA SYNC (BACKUP EHR / VITALS / RECORDS INTO CLOUD)
  // =========================================================================
  app.post('/api/storage/sync-clinical-record', requireVaultAuth, async (req: express.Request, res: express.Response) => {
    try {
      const user = (req as any).vaultUser;
      const { title, recordType = 'clinical_telemetry', data } = req.body;
      if (!data) {
        return res.status(400).json({ error: 'No clinical data payload provided' });
      }

      const payloadString = JSON.stringify({
        title: title || 'Clinical Record Snapshot',
        recordType,
        patientId: user.id,
        patientEmail: user.email,
        timestamp: new Date().toISOString(),
        cloudNode: 'Doctorian Secure Healthcare Cloud Storage Node',
        encryption: 'AES-256-GCM',
        clinicalData: data,
      }, null, 2);

      const plainBuffer = Buffer.from(payloadString, 'utf8');
      const byteSize = plainBuffer.length;
      const usage = getUserStorageUsage(user.id);
      const policy = computeStoragePolicy(usage.totalQuotaBytes);

      if (usage.fileCount >= policy.maxFiles || usage.usedBytes + byteSize > usage.totalQuotaBytes) {
        return res.status(400).json({
          error: 'Storage quota or object count limit reached! Expansion required.',
          quotaExceeded: true,
          requiresBilling: true,
          quota: usage,
          policy,
        });
      }

      const userDir = path.join(UPLOADS_DIR, user.id);
      fs.mkdirSync(userDir, { recursive: true });

      const fileId = 'vf_rec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
      const safeTitle = (title || recordType).replace(/[^a-zA-Z0-9._-]/g, '_');
      const filename = `${fileId}_${safeTitle}.json.enc`;
      const filePath = path.join(userDir, filename);

      const sha256Hash = computeBufferHash(plainBuffer);
      const encrypted = encryptVaultBuffer(plainBuffer);
      fs.writeFileSync(filePath, encrypted.ciphertext);
      const now = new Date().toISOString();

      db.prepare(`
        INSERT INTO user_storage_files (
          id, userId, name, originalName, mimeType, size, category, filePath, sha256, encryption, encryption_meta, metadata, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        fileId,
        user.id,
        `${title || 'Clinical Record Snapshot'}.json`,
        `${safeTitle}.json`,
        'application/json',
        byteSize,
        'user_data',
        filePath,
        sha256Hash,
        'AES-256-GCM',
        encrypted.encryptionMeta,
        JSON.stringify({ type: 'clinical_sync', recordType }),
        now,
        now
      );

      logAudit(user.id, 'CLINICAL_RECORD_SYNCED_AES256', `Record encrypted & synced: ${title} (${byteSize} bytes)`, req);

      const updatedUsage = getUserStorageUsage(user.id);
      return res.json({
        success: true,
        message: `Clinical record encrypted (AES-256-GCM) & synced to Cloud Vault.`,
        file: {
          id: fileId,
          name: `${title || 'Clinical Record Snapshot'}.json`,
          mimeType: 'application/json',
          size: byteSize,
          sha256: sha256Hash,
          encryption: 'AES-256-GCM',
          category: 'user_data',
          createdAt: now,
        },
        quota: updatedUsage,
        policy,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // =========================================================================
  // 9. GENERATE SAMPLE CLINICAL FILE (INSTANT REAL TEST FILE IN CLOUD VAULT)
  // =========================================================================
  app.post('/api/storage/generate-sample', requireVaultAuth, async (req: express.Request, res: express.Response) => {
    try {
      const user = (req as any).vaultUser;
      const sampleType = req.body.sampleType || 'dicom_mri'; // 'dicom_mri' | 'lab_panel' | 'cardiac_ecg'

      let filename = '';
      let category: any = 'scan';
      let mimeType = 'application/json';
      let contentObject: any = {};

      if (sampleType === 'dicom_mri') {
        filename = `MRI_Brain_T1_Axial_Diagnostic_Scan.json`;
        category = 'scan';
        contentObject = {
          modality: 'MR',
          protocolName: 'BRAIN_NEURO_3D_VOLUMETRIC',
          patientID: user.id,
          patientName: user.displayName || 'Anonymized Patient',
          acquisitionDate: new Date().toISOString(),
          sliceThickness: 1.0,
          magneticFieldStrength: '3.0T High Field',
          repetitionTime: 2000,
          echoTime: 25,
          resolution: '512x512x176 voxels',
          findingsSummary: 'Normal cortical thickness, no intracranial hemorrhage, ventricular system symmetric within normal limits.',
          dicomTransferSyntaxUID: '1.2.840.10008.1.2.4.70',
          cloudStorageTier: '1GB Free Cloud Allocation - Verified Secure',
          checksumVerification: 'SHA-256 Bit-Level Provenance'
        };
      } else if (sampleType === 'lab_panel') {
        filename = `Comprehensive_Metabolic_Panel_CMP14.json`;
        category = 'lab_report';
        contentObject = {
          testSuite: 'Comprehensive Metabolic Panel (CMP-14) + Lipid Biomarkers',
          orderingPhysician: 'Dr. Gloria J. Akullo, MD',
          patient: { id: user.id, name: user.displayName },
          collectionTime: new Date().toISOString(),
          results: [
            { analyte: 'Glucose', value: 92, unit: 'mg/dL', referenceRange: '70-99', flag: 'NORMAL' },
            { analyte: 'BUN (Blood Urea Nitrogen)', value: 14, unit: 'mg/dL', referenceRange: '7-20', flag: 'NORMAL' },
            { analyte: 'Creatinine', value: 0.9, unit: 'mg/dL', referenceRange: '0.6-1.2', flag: 'NORMAL' },
            { analyte: 'eGFR', value: '>90', unit: 'mL/min/1.73m2', referenceRange: '>60', flag: 'OPTIMAL' },
            { analyte: 'Sodium', value: 140, unit: 'mEq/L', referenceRange: '136-145', flag: 'NORMAL' },
            { analyte: 'Potassium', value: 4.2, unit: 'mEq/L', referenceRange: '3.5-5.0', flag: 'NORMAL' },
            { analyte: 'Total Cholesterol', value: 178, unit: 'mg/dL', referenceRange: '<200', flag: 'DESIRABLE' },
            { analyte: 'HDL Cholesterol', value: 58, unit: 'mg/dL', referenceRange: '>40', flag: 'PROTECTIVE' },
            { analyte: 'LDL Cholesterol', value: 98, unit: 'mg/dL', referenceRange: '<100', flag: 'OPTIMAL' }
          ],
          labAccreditation: 'CAP / CLIA Clinical Certification #UG-882103'
        };
      } else {
        filename = `Holter_12Lead_ECG_Telemetry_Waveform.json`;
        category = 'user_data';
        contentObject = {
          telemetryType: 'Continuous 12-Lead Ambulatory Electrocardiogram',
          samplingFrequency: '500 Hz',
          recordingDurationHours: 24,
          leadConfiguration: ['I', 'II', 'III', 'aVR', 'aVL', 'aVF', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6'],
          heartRateAverageBPM: 72,
          heartRateMinBPM: 58,
          heartRateMaxBPM: 118,
          rhythmInterpretation: 'Normal Sinus Rhythm without ectopic runs, PR interval 148ms, QTc 410ms.',
          stSegmentAnalysis: 'Zero ischemic ST depression or elevation detected.'
        };
      }

      const payloadString = JSON.stringify(contentObject, null, 2);
      const plainBuffer = Buffer.from(payloadString, 'utf8');
      const byteSize = plainBuffer.length;

      const usage = getUserStorageUsage(user.id);
      const policy = computeStoragePolicy(usage.totalQuotaBytes);
      if (usage.fileCount >= policy.maxFiles || usage.usedBytes + byteSize > usage.totalQuotaBytes) {
        return res.status(400).json({
          error: 'Storage limit reached! Expansion required.',
          quotaExceeded: true,
          requiresBilling: true,
          quota: usage,
          policy,
        });
      }

      const userDir = path.join(UPLOADS_DIR, user.id);
      fs.mkdirSync(userDir, { recursive: true });

      const fileId = 'vf_smp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const filePath = path.join(userDir, `${fileId}_${filename}.enc`);
      const sha256Hash = computeBufferHash(plainBuffer);
      const encrypted = encryptVaultBuffer(plainBuffer);
      fs.writeFileSync(filePath, encrypted.ciphertext);

      const now = new Date().toISOString();

      db.prepare(`
        INSERT INTO user_storage_files (
          id, userId, name, originalName, mimeType, size, category, filePath, sha256, encryption, encryption_meta, metadata, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        fileId,
        user.id,
        filename,
        filename,
        mimeType,
        byteSize,
        category,
        filePath,
        sha256Hash,
        'AES-256-GCM',
        encrypted.encryptionMeta,
        JSON.stringify({ isSample: true, sampleType }),
        now,
        now
      );

      logAudit(user.id, 'SAMPLE_CLINICAL_FILE_GENERATED', `Encrypted sample ${filename} (${byteSize} bytes)`, req);

      const updatedUsage = getUserStorageUsage(user.id);
      return res.json({
        success: true,
        message: `Generated encrypted clinical record "${filename}" with SHA-256 checksum!`,
        file: {
          id: fileId,
          name: filename,
          originalName: filename,
          mimeType,
          size: byteSize,
          category,
          sha256: sha256Hash,
          encryption: 'AES-256-GCM',
          createdAt: now,
        },
        quota: updatedUsage,
        policy,
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Sample generation failed: ' + err.message });
    }
  });

  // =========================================================================
  // 10. GET AUDIT LOGS FOR HEALTHCARE COMPLIANCE & SECURITY INSPECTION
  // =========================================================================
  app.get('/api/storage/audit-logs', requireVaultAuth, (req: express.Request, res: express.Response) => {
    try {
      const user = (req as any).vaultUser;
      const logs = db.prepare(`
        SELECT id, action, details, ip, userAgent, timestamp
        FROM storage_audit_logs
        WHERE userId = ?
        ORDER BY timestamp DESC
        LIMIT 30
      `).all(user.id);
      return res.json({ success: true, logs });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // =========================================================================
  // 11. DOWNLOAD / STREAM DECRYPTED FILE WITH RANGE REQUESTS & SHA-256 HEADER
  // =========================================================================
  app.get('/api/storage/download/:fileId', requireVaultAuth, (req: express.Request, res: express.Response) => {
    try {
      const user = (req as any).vaultUser;
      const fileId = req.params.fileId;

      const file: any = db
        .prepare('SELECT * FROM user_storage_files WHERE id = ? AND userId = ?')
        .get(fileId, user.id);

      if (!file || !isPathContainedInVault(file.filePath)) {
        return res.status(404).json({ error: 'File not found in your vault' });
      }

      if (!fs.existsSync(file.filePath)) {
        return res.status(404).json({ error: 'File content does not exist on disk' });
      }

      const plainBuffer = readDecryptedVaultFile(file);
      const totalSize = plainBuffer.length;

      res.setHeader('X-SHA256-Checksum', file.sha256 || '');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'private, no-transform');

      const range = req.headers.range;
      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;
        const slice = plainBuffer.subarray(start, end + 1);

        res.status(206);
        res.setHeader('Content-Range', `bytes ${start}-${end}/${totalSize}`);
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Content-Length', slice.length);
        res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
        return res.send(slice);
      }

      res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(file.originalName || file.name)}"`
      );
      res.setHeader('Content-Length', totalSize);

      logAudit(user.id, 'FILE_DOWNLOADED_DECRYPTED', `Decrypted & downloaded: ${file.name}`, req);
      return res.send(plainBuffer);
    } catch (err: any) {
      res.status(500).json({ error: 'Download error: ' + err.message });
    }
  });

  // ==========================================
  // 12. PREVIEW / VIEW DECRYPTED FILE CONTENT
  // ==========================================
  app.get('/api/storage/preview/:fileId', requireVaultAuth, (req: express.Request, res: express.Response) => {
    try {
      const user = (req as any).vaultUser;
      const fileId = req.params.fileId;

      const file: any = db
        .prepare('SELECT * FROM user_storage_files WHERE id = ? AND userId = ?')
        .get(fileId, user.id);

      if (!file || !isPathContainedInVault(file.filePath)) {
        return res.status(404).json({ error: 'File not found' });
      }

      if (!fs.existsSync(file.filePath)) {
        return res.status(404).json({ error: 'File not found on disk' });
      }

      const plainBuffer = readDecryptedVaultFile(file);
      res.setHeader('X-SHA256-Checksum', file.sha256 || '');

      if (
        file.size < 2 * 1024 * 1024 &&
        (file.mimeType.startsWith('text/') || file.mimeType.includes('json') || file.mimeType.includes('xml'))
      ) {
        return res.json({
          success: true,
          file,
          previewType: 'text',
          content: plainBuffer.toString('utf8'),
        });
      }

      if (file.mimeType.startsWith('image/')) {
        res.setHeader('Content-Type', file.mimeType);
        res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.name)}"`);
        return res.send(plainBuffer);
      }

      if (file.mimeType === 'application/pdf') {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.name)}"`);
        return res.send(plainBuffer);
      }

      return res.json({
        success: true,
        file,
        previewType: 'binary',
        message: 'Decrypted binary ready for download',
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Preview error: ' + err.message });
    }
  });

  // ==========================================
  // 13. DELETE FILE & RECLAIM 1GB QUOTA
  // ==========================================
  app.delete('/api/storage/files/:fileId', requireVaultAuth, (req: express.Request, res: express.Response) => {
    try {
      const user = (req as any).vaultUser;
      const fileId = req.params.fileId;

      const file: any = db
        .prepare('SELECT * FROM user_storage_files WHERE id = ? AND userId = ?')
        .get(fileId, user.id);

      if (!file) {
        return res.status(404).json({ error: 'File not found in your vault' });
      }

      // Delete file from disk (only within confined UPLOADS_DIR)
      try {
        if (isPathContainedInVault(file.filePath) && fs.existsSync(file.filePath)) {
          fs.unlinkSync(file.filePath);
        }
      } catch (err) {
        console.warn('[Storage Vault] Could not delete disk file:', err);
      }

      // Delete file record from DB
      db.prepare('DELETE FROM user_storage_files WHERE id = ? AND userId = ?').run(fileId, user.id);

      logAudit(user.id, 'FILE_DELETED', `Deleted "${file.name}" - reclaimed ${(file.size / (1024 * 1024)).toFixed(2)} MB`, req);

      const updatedUsage = getUserStorageUsage(user.id);

      return res.json({
        success: true,
        message: `File deleted. Reclaimed ${(file.size / (1024 * 1024)).toFixed(2)} MB.`,
        deletedFileId: fileId,
        quota: updatedUsage,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to delete file: ' + err.message });
    }
  });

  // ==========================================
  // 14. GET AVAILABLE STORAGE EXPANSION PLANS
  // ==========================================
  const STORAGE_EXPANSION_TIERS: Record<string, {
    id: string;
    name: string;
    addedBytes: number;
    formattedSize: string;
    amount: number;
    price: string;
    description: string;
    features: string[];
    popular?: boolean;
  }> = {
    storage_5gb: {
      id: 'storage_5gb',
      name: '+5 GB Clinical Expansion',
      addedBytes: 5 * 1024 * 1024 * 1024,
      formattedSize: '+5 GB',
      amount: 5000,
      price: '5,000 UGX',
      description: 'Ideal for extended high-res medical records, lab reports, and vitals history.',
      features: ['+5 GB Encrypted Cloud Vault', 'Fast Two-Way Verification', 'Full DICOM & PDF support', 'Instant Quota Activation'],
    },
    storage_20gb: {
      id: 'storage_20gb',
      name: '+20 GB Diagnostic & Imaging Archive',
      addedBytes: 20 * 1024 * 1024 * 1024,
      formattedSize: '+20 GB',
      amount: 18000,
      price: '18,000 UGX',
      popular: true,
      description: 'Designed for radiology scans, MRI/CT archives, and high-frequency sensor telemetry.',
      features: ['+20 GB High-Speed Cloud Storage', 'Continuous Neural Sync', 'Priority Backup Encryption', 'Multi-Device Access'],
    },
    storage_100gb: {
      id: 'storage_100gb',
      name: '+100 GB Multi-Patient & Clinic Cloud',
      addedBytes: 100 * 1024 * 1024 * 1024,
      formattedSize: '+100 GB',
      amount: 65000,
      price: '65,000 UGX',
      description: 'Comprehensive capacity for multiple patient profiles, video consultations, and deep clinical data.',
      features: ['+100 GB Hospital-Grade Storage', 'Audit-Ready Retention', 'Zero Compression Loss', 'Dedicated Sync Node'],
    },
    storage_1tb: {
      id: 'storage_1tb',
      name: '+1 TB Enterprise Medical Repository',
      addedBytes: 1024 * 1024 * 1024 * 1024,
      formattedSize: '+1 TB',
      amount: 250000,
      price: '250,000 UGX',
      description: 'Maximum cloud archival tier for enterprise institutions and research facilities.',
      features: ['+1 TB Unlimited Archival Quota', 'Custom Data Governance', 'Institutional Escrow', '24/7 Priority Support'],
    },
  };

  app.get('/api/storage/plans', (req: express.Request, res: express.Response) => {
    return res.json({
      success: true,
      plans: Object.values(STORAGE_EXPANSION_TIERS),
    });
  });

  // ==========================================
  // 15. PURCHASE ADDITIONAL STORAGE (AUTHORITATIVE BILLING LEDGER)
  // ==========================================
  app.post('/api/storage/purchase', async (req: express.Request, res: express.Response) => {
    try {
      const { tierId, paymentMethod = 'momo', phone, transactionId, idempotencyKey } = req.body;

      const tier = STORAGE_EXPANSION_TIERS[tierId];
      if (!tier) {
        return res.status(400).json({ error: 'Invalid storage expansion tier selected' });
      }

      let targetUserId: string | null = null;
      let targetUserEmail: string | null = null;
      let targetDisplayName: string = 'Doctorian User';

      const authHeader = req.headers.authorization;
      const token =
        authHeader && authHeader.startsWith('Bearer ')
          ? authHeader.split(' ')[1]
          : req.cookies?.doctorian_token || req.cookies?.vault_token || req.body?.token;

      if (token) {
        try {
          const decoded: any = jwt.verify(token, jwtSecret);
          const resolvedId = decoded?.userId || decoded?.id;
          if (resolvedId && decoded?.role !== 'guest') {
            const dbUser: any = db
              .prepare('SELECT id, email, display_name as displayName, status FROM users WHERE id = ?')
              .get(resolvedId);
            if (dbUser && dbUser.status === 'active') {
              targetUserId = dbUser.id;
              targetUserEmail = dbUser.email;
              targetDisplayName = dbUser.displayName || 'Doctorian User';
            }
          }
        } catch {}
      }

      if (!targetUserId) {
        return res.status(401).json({ error: 'Authenticated account required to complete storage expansion.' });
      }

      const checkoutResult = executeVerifiedCheckout({
        userId: targetUserId,
        kind: 'storage',
        itemId: tier.id,
        paymentMethod: String(paymentMethod),
        payerPhone: phone ? String(phone) : undefined,
        externalRef: transactionId ? String(transactionId) : undefined,
        idempotencyKey: idempotencyKey ? String(idempotencyKey) : undefined,
        ip: getClientIp(req),
      });

      const updatedUsage = getUserStorageUsage(targetUserId);
      const updatedPolicy = computeStoragePolicy(updatedUsage.totalQuotaBytes);
      const newQuota = updatedUsage.totalQuotaBytes;

      logAudit(targetUserId, 'STORAGE_EXPANSION_PURCHASED', `Added ${tier.formattedSize} (${tier.name}) - Invoice ${checkoutResult.transaction.invoiceNumber}`, req);

      if (targetUserEmail) {
        const emailBody = `Hello ${targetDisplayName},\n\n` +
          `Your Cloud Storage Expansion has been activated!\n\n` +
          `Package: ${tier.name} (${tier.formattedSize})\n` +
          `Amount Paid: ${tier.price}\n` +
          `New Total Vault Capacity: ${(newQuota / (1024 * 1024 * 1024)).toFixed(2)} GB\n` +
          `Invoice: ${checkoutResult.transaction.invoiceNumber}\n\n` +
          `Doctorian Billing & Infrastructure Team`;

        sendEmail(
          targetUserEmail,
          `Storage Activated: ${tier.name} (${tier.formattedSize}) Added!`,
          emailBody
        ).catch(() => {});
      }

      return res.json({
        success: true,
        message: `Successfully expanded storage! Added ${tier.formattedSize} (${tier.name}). New total capacity: ${(newQuota / (1024 * 1024 * 1024)).toFixed(2)} GB.`,
        purchaseId: checkoutResult.transaction.id,
        transaction: checkoutResult.transaction,
        tier,
        quota: updatedUsage,
        policy: updatedPolicy,
      });
    } catch (err: any) {
      console.error('[Storage Purchase Error]:', err);
      return res.status(500).json({ error: 'Failed to process storage purchase: ' + err.message });
    }
  });

  // ==========================================
  // 16. SIMULATE / TOGGLE STORAGE FULL STATE (AUTH REQUIRED)
  // ==========================================
  app.post('/api/storage/simulate-full', async (req: express.Request, res: express.Response) => {
    try {
      const { setFull = true } = req.body;
      let targetUser: any = null;

      const authHeader = req.headers.authorization;
      const token =
        authHeader && authHeader.startsWith('Bearer ')
          ? authHeader.split(' ')[1]
          : req.cookies?.doctorian_token || req.cookies?.vault_token || req.body?.token;

      if (token) {
        try {
          const decoded: any = jwt.verify(token, jwtSecret);
          const resolvedId = decoded?.userId || decoded?.id;
          if (resolvedId && decoded?.role !== 'guest') {
            targetUser = db
              .prepare('SELECT id, email, display_name as displayName, storageQuotaBytes FROM users WHERE id = ?')
              .get(resolvedId);
          }
        } catch {}
      }

      if (!targetUser) {
        return res.status(401).json({ error: 'Authentication required to toggle storage simulation.' });
      }

      if (setFull) {
        const row: any = db.prepare('SELECT COALESCE(SUM(size), 0) as usedBytes FROM user_storage_files WHERE userId = ?').get(targetUser.id);
        const used = Number(row?.usedBytes || 0);
        const simulatedQuota = used > 0 ? used : 1024;
        db.prepare('UPDATE users SET storageQuotaBytes = ? WHERE id = ?').run(simulatedQuota, targetUser.id);
      } else {
        db.prepare('UPDATE users SET storageQuotaBytes = ? WHERE id = ?').run(FREE_STORAGE_QUOTA_BYTES, targetUser.id);
      }

      logAudit(targetUser.id, 'STORAGE_SIMULATION_TOGGLED', setFull ? 'Simulated 100% full' : 'Reset to standard quota', req);

      const updatedUsage = getUserStorageUsage(targetUser.id);

      return res.json({
        success: true,
        message: setFull ? 'Storage is now simulated as 100% full.' : 'Storage reset to standard 1GB quota.',
        quota: updatedUsage,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Helper to categorize MIME types
  function determineCategory(
    mimeType: string,
    filename: string
  ): 'document' | 'scan' | 'lab_report' | 'user_data' | 'media' {
    const ext = path.extname(filename).toLowerCase();
    if (ext === '.dcm' || filename.toLowerCase().includes('mri') || filename.toLowerCase().includes('ct_scan')) {
      return 'scan';
    }
    if (filename.toLowerCase().includes('lab') || filename.toLowerCase().includes('blood') || filename.toLowerCase().includes('biopsy')) {
      return 'lab_report';
    }
    if (mimeType.startsWith('image/') || mimeType.startsWith('video/') || mimeType.startsWith('audio/')) {
      return 'media';
    }
    if (mimeType.includes('json') || ext === '.json' || ext === '.csv') {
      return 'user_data';
    }
    return 'document';
  }
}
