// Utility for strong password validation, zero-leak credential masking, and 2FA TOTP / Recovery keys

export interface PasswordStrengthResult {
  isStrong: boolean;
  score: number; // 0 - 100
  level: 'Weak' | 'Fair' | 'Strong' | 'Ultra-Secure';
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  missingRequirements: string[];
}

export const validatePasswordStrength = (password: string): PasswordStrengthResult => {
  if (!password) {
    return {
      isStrong: false,
      score: 0,
      level: 'Weak',
      hasMinLength: false,
      hasUppercase: false,
      hasLowercase: false,
      hasNumber: false,
      hasSpecialChar: false,
      missingRequirements: [
        'At least 8 characters long',
        'At least one uppercase letter (A-Z)',
        'At least one lowercase letter (a-z)',
        'At least one number (0-9)',
        'At least one special character (!@#$%^&*)'
      ]
    };
  }

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-\+=/\\]/.test(password);

  const missingRequirements: string[] = [];
  if (!hasMinLength) missingRequirements.push('At least 8 characters long');
  if (!hasUppercase) missingRequirements.push('At least one uppercase letter (A-Z)');
  if (!hasLowercase) missingRequirements.push('At least one lowercase letter (a-z)');
  if (!hasNumber) missingRequirements.push('At least one number (0-9)');
  if (!hasSpecialChar) missingRequirements.push('At least one special character (!@#$%^&*)');

  let score = 0;
  if (hasMinLength) score += 25;
  if (hasUppercase) score += 20;
  if (hasLowercase) score += 15;
  if (hasNumber) score += 20;
  if (hasSpecialChar) score += 20;

  let level: 'Weak' | 'Fair' | 'Strong' | 'Ultra-Secure' = 'Weak';
  if (score >= 90) level = 'Ultra-Secure';
  else if (score >= 70) level = 'Strong';
  else if (score >= 45) level = 'Fair';

  const isStrong = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;

  return {
    isStrong,
    score,
    level,
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
    missingRequirements
  };
};

/**
 * Zero Password Leakage Masking
 * Always masks sensitive password strings so they are never displayed in raw plaintext.
 */
export const maskPassword = (password?: string): string => {
  if (!password) return '••••••••••••';
  return '••••••••••••';
};

/**
 * Generates a random Base32 TOTP secret string for authenticator apps
 */
export const generate2FASecret = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  for (let i = 0; i < 16; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
};

/**
 * Generates 8 single-use emergency backup recovery keys
 */
export const generateEmergencyRecoveryCodes = (): string[] => {
  const codes: string[] = [];
  for (let i = 0; i < 8; i++) {
    const part1 = Math.floor(1000 + Math.random() * 9000);
    const part2 = Math.floor(1000 + Math.random() * 9000);
    codes.push(`${part1}-${part2}`);
  }
  return codes;
};

/**
 * Generates a TOTP URL for QR Code Rendering
 */
export const getTotpQrUrl = (userEmail: string, secret: string): string => {
  const issuer = encodeURIComponent('Doctorian Medical AI');
  const account = encodeURIComponent(userEmail || 'user@doctorian.ai');
  return `otpauth://totp/${issuer}:${account}?secret=${secret}&issuer=${issuer}`;
};

const BLOCKED_DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'tempmail.com', 'temp-mail.org', '10minutemail.com', '10minutemail.net',
  'guerrillamail.com', 'guerrillamail.org', 'sharklasers.com', 'yopmail.com', 'yopmail.fr',
  'throwawaymail.com', 'trashmail.com', 'getnada.com', 'maildrop.cc', 'dispostable.com',
  'fakeinbox.com', 'mintemail.com', 'mytemp.email', 'mohmal.com', 'emailondeck.com',
  'burnermail.io', 'tempr.email', 'tempail.com', 'tmpmail.org', 'tmpmail.net',
  'discard.email', 'example.com', 'example.org', 'example.net', 'test.com', 'fake.com'
]);

export const isDisposableEmail = (email: string): boolean => {
  const domain = String(email || '').trim().toLowerCase().split('@')[1];
  return Boolean(!domain || BLOCKED_DISPOSABLE_DOMAINS.has(domain));
};

export const isValidClinicianLicense = (licenseNumber: string): boolean => {
  const clean = String(licenseNumber || '').trim();
  return /^(UMDPC|UNMC|AHPC|MD|RN|CO|DR)[-_A-Za-z0-9]{3,24}$/i.test(clean);
};

async function sha256Hex(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // Minimal deterministic fallback if crypto.subtle unavailable in insecure context
  let h1 = 0x811c9dc5;
  for (let i = 0; i < bytes.length; i++) {
    h1 ^= bytes[i];
    h1 = Math.imul(h1, 0x01000193);
  }
  return (h1 >>> 0).toString(16).padStart(8, '0');
}

export async function solveRegistrationPow(challengeId: string, salt: string, difficulty = 3): Promise<string> {
  const targetPrefix = '0'.repeat(Math.max(1, difficulty));
  for (let nonce = 0; nonce < 250000; nonce++) {
    const hash = await sha256Hex(`${challengeId}:${salt}:${nonce}`);
    if (hash.startsWith(targetPrefix)) {
      return String(nonce);
    }
  }
  throw new Error('Could not complete Proof-of-Work security computation.');
}

