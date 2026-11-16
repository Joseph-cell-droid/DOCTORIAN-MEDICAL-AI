import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import type { Request, Response, NextFunction } from 'express';
import { db } from './db.ts';

// ---------------------------------------------------------------------------
// PERSISTENT CRYPTOGRAPHIC ROOT SECRETS (NEVER HARDCODED IN CLIENT BUNDLE)
// ---------------------------------------------------------------------------
const DATA_DIR = path.resolve(process.cwd(), '.data');
const SECRET_FILE = path.join(DATA_DIR, '.server_secret');

export function resolveServerSecrets(): { jwtSecret: string; hmacSecret: string } {
  const envJwt = (process.env.JWT_SECRET || '').trim();
  if (envJwt && envJwt !== 'your_jwt_secret_here' && envJwt.length >= 32) {
    const hmacSecret = crypto.createHmac('sha256', envJwt).update('doctorian-hmac-v2').digest('hex');
    return { jwtSecret: envJwt, hmacSecret };
  }

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o700 });
    }
    if (fs.existsSync(SECRET_FILE)) {
      const existing = fs.readFileSync(SECRET_FILE, 'utf8').trim();
      if (existing.length >= 64) {
        const hmacSecret = crypto.createHmac('sha256', existing).update('doctorian-hmac-v2').digest('hex');
        return { jwtSecret: existing, hmacSecret };
      }
    }
    const generated = crypto.randomBytes(48).toString('hex');
    fs.writeFileSync(SECRET_FILE, generated, { mode: 0o600 });
    const hmacSecret = crypto.createHmac('sha256', generated).update('doctorian-hmac-v2').digest('hex');
    return { jwtSecret: generated, hmacSecret };
  } catch {
    const fallback = crypto.randomBytes(48).toString('hex');
    const hmacSecret = crypto.createHmac('sha256', fallback).update('doctorian-hmac-v2').digest('hex');
    return { jwtSecret: fallback, hmacSecret };
  }
}

export const SERVER_SECRETS = resolveServerSecrets();

// Server-side privileged verification key hashes (resolved strictly on server; optional env override)
const SERVER_ADMIN_KEY = (process.env.ADMIN_MASTER_KEY || 'DOC-ADM-2026-ROOT').trim();
const SERVER_CLINICAL_PIN = (process.env.CLINICAL_GATE_PIN || '2026').trim();

export function timingSafeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(crypto.createHash('sha256').update(a).digest());
  const bufB = Buffer.from(crypto.createHash('sha256').update(b).digest());
  return crypto.timingSafeEqual(bufA, bufB);
}

export function verifyServerPrivilegedKey(role: 'admin' | 'doctor', candidate: string): boolean {
  const clean = String(candidate || '').trim();
  if (!clean || clean.length < 4) return false;
  if (role === 'admin') {
    const allowedEnvKeys = (process.env.ADMIN_MASTER_KEYS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const validSet = [SERVER_ADMIN_KEY, ...allowedEnvKeys];
    return validSet.some((k) => timingSafeCompare(clean, k));
  }
  const allowedPins = (process.env.CLINICAL_GATE_PINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return [SERVER_CLINICAL_PIN, ...allowedPins].some((p) => timingSafeCompare(clean, p));
}

// ---------------------------------------------------------------------------
// CLIENT METADATA & TAMPER-EVIDENT SECURITY EVENT CHAIN
// ---------------------------------------------------------------------------
export function getClientIp(req: Request): string {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.trim()) {
    return fwd.split(',')[0].trim().slice(0, 64);
  }
  return (req.socket?.remoteAddress || req.ip || '127.0.0.1').slice(0, 64);
}

export function hashUserAgent(req: Request): string {
  const ua = String(req.headers['user-agent'] || 'unknown');
  return crypto.createHash('sha256').update(ua).digest('hex').slice(0, 32);
}

export function recordSecurityEvent(
  eventType: string,
  severity: 'info' | 'warning' | 'high' | 'critical',
  ip: string,
  email: string | null,
  details: string
) {
  try {
    const prevRow = db
      .prepare('SELECT entry_hash FROM security_events ORDER BY rowid DESC LIMIT 1')
      .get() as { entry_hash?: string } | undefined;
    const prevHash = prevRow?.entry_hash || 'GENESIS_DOCTORIAN_SEC_CHAIN';
    const id = `sec-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const payload = `${prevHash}|${id}|${eventType}|${severity}|${ip}|${email || ''}|${details}`;
    const entryHash = crypto.createHmac('sha256', SERVER_SECRETS.hmacSecret).update(payload).digest('hex');

    db.prepare(`
      INSERT INTO security_events (id, event_type, severity, ip, email, details, prev_hash, entry_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, eventType, severity, ip, email, details.slice(0, 500), prevHash, entryHash);
  } catch (err) {
    console.warn('[Security Ledger] Failed to record security event:', err);
  }
}

export function verifySecurityChain(): { valid: boolean; totalEvents: number; brokenAtId: string | null } {
  const rows = db.prepare('SELECT * FROM security_events ORDER BY rowid ASC').all() as Array<{
    id: string;
    event_type: string;
    severity: string;
    ip: string | null;
    email: string | null;
    details: string | null;
    prev_hash: string;
    entry_hash: string;
  }>;

  let expectedPrev = 'GENESIS_DOCTORIAN_SEC_CHAIN';
  for (const row of rows) {
    if (row.prev_hash !== expectedPrev) {
      return { valid: false, totalEvents: rows.length, brokenAtId: row.id };
    }
    const payload = `${row.prev_hash}|${row.id}|${row.event_type}|${row.severity}|${row.ip || ''}|${row.email || ''}|${row.details || ''}`;
    const expectedHash = crypto.createHmac('sha256', SERVER_SECRETS.hmacSecret).update(payload).digest('hex');
    if (row.entry_hash !== expectedHash) {
      return { valid: false, totalEvents: rows.length, brokenAtId: row.id };
    }
    expectedPrev = row.entry_hash;
  }

  return { valid: true, totalEvents: rows.length, brokenAtId: null };
}

// ---------------------------------------------------------------------------
// SLIDING-WINDOW RATE LIMITER (MEMORY-BOUNDED ANTI-BRUTE-FORCE & ANTI-BOT)
// ---------------------------------------------------------------------------
interface RateBucket {
  hits: number[];
  blockedUntil: number;
}

const rateBuckets = new Map<string, RateBucket>();

// Periodically prune expired buckets to avoid memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [k, bucket] of rateBuckets.entries()) {
    const active = bucket.hits.filter((t) => now - t < 15 * 60 * 1000);
    if (active.length === 0 && bucket.blockedUntil < now) {
      rateBuckets.delete(k);
    } else {
      bucket.hits = active;
    }
  }
}, 5 * 60 * 1000).unref();

export function createRateLimiter(opts: {
  name: string;
  windowMs: number;
  maxHits: number;
  blockDurationMs?: number;
  keyFn?: (req: Request) => string;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = getClientIp(req);
    const keyPart = opts.keyFn ? opts.keyFn(req) : ip;
    const key = `${opts.name}:${keyPart}`;
    const now = Date.now();

    let bucket = rateBuckets.get(key);
    if (!bucket) {
      bucket = { hits: [], blockedUntil: 0 };
      rateBuckets.set(key, bucket);
    }

    if (bucket.blockedUntil > now) {
      const retrySec = Math.ceil((bucket.blockedUntil - now) / 1000);
      res.setHeader('Retry-After', String(retrySec));
      recordSecurityEvent('RATE_LIMIT_BLOCKED', 'warning', ip, null, `Limiter ${opts.name} blocked key (${retrySec}s remaining)`);
      return res.status(429).json({
        error: `Too many requests detected. Security shield temporarily locked this action for ${retrySec}s.`,
        retryAfterSeconds: retrySec
      });
    }

    bucket.hits = bucket.hits.filter((ts) => now - ts < opts.windowMs);
    bucket.hits.push(now);

    if (bucket.hits.length > opts.maxHits) {
      bucket.blockedUntil = now + (opts.blockDurationMs || 5 * 60 * 1000);
      const retrySec = Math.ceil((bucket.blockedUntil - now) / 1000);
      res.setHeader('Retry-After', String(retrySec));
      recordSecurityEvent('BRUTE_FORCE_THROTTLE', 'high', ip, null, `Exceeded ${opts.maxHits} hits in ${opts.name}`);
      return res.status(429).json({
        error: `Rate limit exceeded. Too many attempts. Please wait ${retrySec} seconds before retrying.`,
        retryAfterSeconds: retrySec
      });
    }

    next();
  };
}

// ---------------------------------------------------------------------------
// SECURITY HEADERS, ANTI-PROTOTYPE-POLLUTION & DOUBLE-SUBMIT CSRF GUARD
// ---------------------------------------------------------------------------
export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(self), microphone=(self), camera=(self), payment=(), usb=(self), bluetooth=(self)'
  );
  // Protect against base-URI injection, Flash/object plugins, and unauthorized form exfiltration
  // while remaining compatible with Vite dev/HMR-disabled inline preamble and preview iframes.
  res.setHeader(
    'Content-Security-Policy',
    "base-uri 'self'; object-src 'none'; form-action 'self';"
  );

  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
  if (isHttps) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // Hide Express fingerprint
  res.removeHeader('X-Powered-By');
  next();
}

const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function sanitizeDeep(value: unknown, depth = 0): unknown {
  if (depth > 10 || value === null || value === undefined) return value;
  if (typeof value === 'string') {
    // Remove null bytes that can truncate paths or SQL strings
    return value.replace(/\0/g, '');
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeDeep(item, depth + 1));
  }
  if (typeof value === 'object') {
    const clean: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (DANGEROUS_KEYS.has(k)) continue;
      clean[k] = sanitizeDeep(v, depth + 1);
    }
    return clean;
  }
  return value;
}

export function sanitizeRequestMiddleware(req: Request, _res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeDeep(req.body);
  }
  next();
}

export function issueCsrfCookie(req: Request, res: Response): string {
  const existing = req.cookies?.csrfToken;
  const token =
    typeof existing === 'string' && /^[a-f0-9]{32,64}$/.test(existing)
      ? existing
      : crypto.randomBytes(24).toString('hex');
  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
  res.cookie('csrfToken', token, {
    httpOnly: false,
    sameSite: 'lax',
    secure: Boolean(isHttps),
    maxAge: 12 * 60 * 60 * 1000
  });
  return token;
}

const CSRF_EXEMPT_PATHS = new Set([
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/guest',
  '/api/auth/recover',
  '/api/auth/forgot-password',
  '/api/auth/verify-reset-code',
  '/api/auth/reset-password',
  '/api/auth/social',
  '/api/auth/register-challenge',
  '/api/auth/csrf',
  '/api/auth/webauthn/login-options',
  '/api/auth/webauthn/login-verify',
  '/api/auth/webauthn/simulate-login',
  '/api/chat',
  '/api/clinical/predictive-triage',
  '/api/clinical/analyze-image'
]);

export function csrfGuardMiddleware(req: Request, res: Response, next: NextFunction) {
  const method = req.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return next();
  }
  if (!req.path.startsWith('/api/')) {
    return next();
  }
  if (CSRF_EXEMPT_PATHS.has(req.path)) {
    return next();
  }

  // Only enforce strict double-submit check when the browser carries a cookie session and csrfToken cookie exists.
  // Bearer-authenticated API callers without cookies are immune to ambient CSRF.
  const hasSessionCookie = Boolean(req.cookies?.doctorian_token);
  const cookieCsrf = req.cookies?.csrfToken;
  const headerCsrf = req.headers['x-csrf-token'];

  if (hasSessionCookie && cookieCsrf) {
    if (!headerCsrf || typeof headerCsrf !== 'string' || !timingSafeCompare(cookieCsrf, headerCsrf)) {
      recordSecurityEvent('CSRF_VALIDATION_FAILED', 'high', getClientIp(req), null, `CSRF mismatch on ${method} ${req.path}`);
      return res.status(403).json({
        error: 'Security verification failed (CSRF token mismatch). Refresh the page and try again.'
      });
    }
  }
  next();
}

// ---------------------------------------------------------------------------
// SESSION REGISTRY & REVOCATION
// ---------------------------------------------------------------------------
export function createTrackedSession(userId: string, role: string, req: Request, expiresMs = 12 * 60 * 60 * 1000): string {
  const jti = `jti_${crypto.randomBytes(16).toString('hex')}`;
  const expiresAt = Date.now() + expiresMs;
  db.prepare(`
    INSERT INTO sessions (jti, user_id, role, ip, ua_hash, expires_at, revoked)
    VALUES (?, ?, ?, ?, ?, ?, 0)
  `).run(jti, userId, role, getClientIp(req), hashUserAgent(req), expiresAt);
  return jti;
}

export function isTrackedSessionValid(jti: string | undefined, userId: string): boolean {
  if (!jti) return false;
  const row = db
    .prepare('SELECT jti, user_id, expires_at, revoked FROM sessions WHERE jti = ?')
    .get(jti) as { jti: string; user_id: string; expires_at: number; revoked: number } | undefined;
  if (!row) return false;
  if (row.revoked === 1) return false;
  if (row.user_id !== userId) return false;
  if (Date.now() > row.expires_at) return false;
  return true;
}

export function revokeSessionByJti(jti: string | undefined) {
  if (!jti) return;
  db.prepare('UPDATE sessions SET revoked = 1 WHERE jti = ?').run(jti);
}

export function revokeAllUserSessions(userId: string) {
  db.prepare('UPDATE sessions SET revoked = 1 WHERE user_id = ?').run(userId);
}

// ---------------------------------------------------------------------------
// ANTI-FAKE-REGISTRATION ENGINE (DISPOSABLE BLOCK + POW + HUMAN PUZZLE)
// ---------------------------------------------------------------------------
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  'temp-mail.org',
  '10minutemail.com',
  '10minutemail.net',
  'guerrillamail.com',
  'guerrillamail.org',
  'sharklasers.com',
  'yopmail.com',
  'yopmail.fr',
  'throwawaymail.com',
  'trashmail.com',
  'getnada.com',
  'maildrop.cc',
  'dispostable.com',
  'fakeinbox.com',
  'mintemail.com',
  'mytemp.email',
  'mohmal.com',
  'emailondeck.com',
  'burnermail.io',
  'tempr.email',
  'tempail.com',
  'tmpmail.org',
  'tmpmail.net',
  'discard.email',
  'spambox.us',
  'spamgourmet.com',
  'mailnesia.com',
  'anonbox.net',
  'crazymailing.com',
  'deadaddress.com',
  'dodgeit.com',
  'filzmail.com',
  'incognitomail.org',
  'jetable.org',
  'kurzepost.de',
  'mailexpire.com',
  'mailfreeonline.com',
  'mailinator2.com',
  'mailnull.com',
  'nomail.xl.cx',
  'nowmymail.com',
  'objectmail.com',
  'proxymail.eu',
  'rcpt.at',
  'trash-mail.at',
  'wegwerfmail.de',
  'example.com',
  'example.org',
  'example.net',
  'test.com',
  'fake.com'
]);

const FAKE_NAME_PATTERNS = [
  /^(test|fake|asdf|qwerty|admin|root|hacker|bot|spam|null|undefined|user\d*)$/i,
  /[<>`{}[\]$;\\]/,
  /(.)\1{4,}/
];

export function validateRegistrationInput(input: {
  email?: string;
  password?: string;
  displayName?: string;
  phone?: string;
  role?: string;
  licenseNumber?: string;
}): { ok: boolean; error?: string; normalizedEmail?: string; normalizedName?: string } {
  const email = String(input.email || '').trim().toLowerCase();
  const password = String(input.password || '');
  const displayName = String(input.displayName || '').trim().replace(/\s+/g, ' ');
  const phone = input.phone ? String(input.phone).trim() : '';

  if (!email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,24}$/.test(email) || email.length > 120) {
    return { ok: false, error: 'Please provide a valid, real email address.' };
  }

  const domain = email.split('@')[1];
  if (!domain || DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return {
      ok: false,
      error: 'Disposable, temporary, or test email domains are blocked to prevent fake registrations.'
    };
  }

  const localPart = email.split('@')[0];
  if (localPart.length < 2 || /^(fake|spam|bot|throwaway)\d*$/i.test(localPart)) {
    return { ok: false, error: 'Suspicious email pattern rejected by anti-fake-registration filter.' };
  }

  if (displayName.length < 3 || displayName.length > 80) {
    return { ok: false, error: 'Full name must be between 3 and 80 characters.' };
  }

  if (FAKE_NAME_PATTERNS.some((re) => re.test(displayName)) || !/[a-zA-Z]{2,}/.test(displayName)) {
    return { ok: false, error: 'Please enter a genuine full name without script symbols or placeholder text.' };
  }

  if (
    password.length < 8 ||
    password.length > 128 ||
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/[0-9]/.test(password) ||
    !/[!@#$%^&*(),.?":{}|<>_\-+=/\\]/.test(password)
  ) {
    return {
      ok: false,
      error: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.'
    };
  }

  if (phone) {
    const digits = phone.replace(/[^\d]/g, '');
    if (digits.length < 9 || digits.length > 15 || /^(\d)\1+$/.test(digits)) {
      return { ok: false, error: 'Please enter a valid reachable phone number (e.g., +256 7XX XXX XXX).' };
    }
  }

  if (input.role === 'doctor' || input.role === 'nurse') {
    const lic = String(input.licenseNumber || '').trim();
    if (!lic || !/^(UMDPC|UNMC|AHPC|MD|RN|CO|DR)[-_A-Za-z0-9]{3,24}$/i.test(lic)) {
      return {
        ok: false,
        error: 'Clinician registration requires a valid medical council license ID (e.g. UMDPC-MD-12345 or UNMC-RN-4567).'
      };
    }
  }

  return { ok: true, normalizedEmail: email, normalizedName: displayName };
}

export function issueRegistrationChallenge(req: Request): {
  challengeId: string;
  salt: string;
  difficulty: number;
  puzzleQuestion: string;
  expiresAt: number;
  signature: string;
} {
  const challengeId = `reg_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  const salt = crypto.randomBytes(12).toString('hex');
  const difficulty = 3; // SHA-256 hex starts with '000' (~20ms browser WebCrypto, blocks blind bot spam)

  const a = 3 + crypto.randomInt(1, 14);
  const b = 2 + crypto.randomInt(1, 11);
  const op = crypto.randomInt(0, 2) === 0 ? '+' : '×';
  const expected = op === '+' ? a + b : a * b;
  const puzzleQuestion = `${a} ${op} ${b} = ?`;

  const answerHash = crypto
    .createHmac('sha256', SERVER_SECRETS.hmacSecret)
    .update(`${challengeId}:${expected}`)
    .digest('hex');

  const issuedAt = Date.now();
  const expiresAt = issuedAt + 10 * 60 * 1000;

  db.prepare(`
    INSERT INTO security_challenges (id, purpose, email, salt, answer_hash, difficulty, attempts, expires_at, consumed, ip, issued_at)
    VALUES (?, 'registration', NULL, ?, ?, ?, 0, ?, 0, ?, ?)
  `).run(challengeId, salt, answerHash, difficulty, expiresAt, getClientIp(req), issuedAt);

  const signature = crypto
    .createHmac('sha256', SERVER_SECRETS.hmacSecret)
    .update(`${challengeId}:${salt}:${difficulty}:${expiresAt}`)
    .digest('hex');

  return { challengeId, salt, difficulty, puzzleQuestion, expiresAt, signature };
}

export function verifyRegistrationChallenge(
  req: Request,
  payload: {
    challengeId?: string;
    powNonce?: string | number;
    puzzleAnswer?: string | number;
    honeypot?: string;
  }
): { ok: boolean; error?: string } {
  const ip = getClientIp(req);

  // 1. Silent bot honeypot check
  if (payload.honeypot && String(payload.honeypot).trim().length > 0) {
    recordSecurityEvent('BOT_HONEYPOT_TRIGGERED', 'high', ip, null, 'Hidden registration honeypot field populated');
    return { ok: false, error: 'Automated bot submission rejected.' };
  }

  const challengeId = String(payload.challengeId || '').trim();
  const powNonce = String(payload.powNonce ?? '').trim();
  const puzzleAnswer = String(payload.puzzleAnswer ?? '').trim();

  if (!challengeId || !powNonce || !puzzleAnswer) {
    return { ok: false, error: 'Anti-bot security verification challenge is required before creating an account.' };
  }

  const row = db
    .prepare("SELECT * FROM security_challenges WHERE id = ? AND purpose = 'registration'")
    .get(challengeId) as any;

  if (!row) {
    recordSecurityEvent('INVALID_REG_CHALLENGE', 'warning', ip, null, `Unknown challenge ${challengeId}`);
    return { ok: false, error: 'Invalid or expired security challenge. Please refresh and try again.' };
  }

  if (row.consumed === 1) {
    recordSecurityEvent('CHALLENGE_REPLAY_ATTEMPT', 'high', ip, null, `Replay on consumed challenge ${challengeId}`);
    return { ok: false, error: 'Security challenge already used. Please request a fresh verification challenge.' };
  }

  if (Date.now() > Number(row.expires_at)) {
    return { ok: false, error: 'Security challenge expired. Please refresh verification and submit again.' };
  }

  if (Number(row.attempts) >= 5) {
    return { ok: false, error: 'Too many failed verification attempts. Please request a new security challenge.' };
  }

  // 2. Minimum human timing gate (reject sub-650ms automated scripts)
  if (Date.now() - Number(row.issued_at) < 650) {
    recordSecurityEvent('BOT_FAST_SUBMIT_BLOCKED', 'high', ip, null, `Registration submitted in <650ms (${challengeId})`);
    return { ok: false, error: 'Submission occurred too quickly for human verification. Please wait a moment and try again.' };
  }

  // 3. Proof-of-Work SHA-256 verification
  const digest = crypto
    .createHash('sha256')
    .update(`${row.challenge_id || row.id}:${row.salt}:${powNonce}`)
    .digest('hex');
  const requiredPrefix = '0'.repeat(Math.max(1, Number(row.difficulty) || 3));
  if (!digest.startsWith(requiredPrefix)) {
    db.prepare('UPDATE security_challenges SET attempts = attempts + 1 WHERE id = ?').run(challengeId);
    recordSecurityEvent('POW_VERIFICATION_FAILED', 'high', ip, null, `Invalid PoW nonce on ${challengeId}`);
    return { ok: false, error: 'Client proof-of-work security check failed. Please retry.' };
  }

  // 4. Human puzzle verification
  const expectedHash = crypto
    .createHmac('sha256', SERVER_SECRETS.hmacSecret)
    .update(`${challengeId}:${puzzleAnswer}`)
    .digest('hex');

  if (!timingSafeCompare(expectedHash, row.answer_hash)) {
    db.prepare('UPDATE security_challenges SET attempts = attempts + 1 WHERE id = ?').run(challengeId);
    return { ok: false, error: 'Human verification answer is incorrect. Please check and retry.' };
  }

  // Consume single-use challenge atomically
  db.prepare('UPDATE security_challenges SET consumed = 1 WHERE id = ?').run(challengeId);
  return { ok: true };
}
