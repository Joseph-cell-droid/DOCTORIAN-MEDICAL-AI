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
