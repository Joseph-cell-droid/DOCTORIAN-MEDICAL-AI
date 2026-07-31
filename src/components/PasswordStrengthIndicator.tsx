import React from 'react';
import { Check, X, Shield, Lock, Eye, EyeOff } from 'lucide-react';
import { validatePasswordStrength } from '../utils/security';

interface PasswordStrengthIndicatorProps {
  password?: string;
  showRequirements?: boolean;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password = '',
  showRequirements = true
}) => {
  const result = validatePasswordStrength(password);

  const getBarColor = () => {
    if (result.score >= 90) return 'bg-emerald-500';
    if (result.score >= 70) return 'bg-blue-500';
    if (result.score >= 45) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getTextColor = () => {
    if (result.score >= 90) return 'text-emerald-600 dark:text-emerald-400';
    if (result.score >= 70) return 'text-blue-600 dark:text-blue-400';
    if (result.score >= 45) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-3 font-sans animate-fade-in">
      {/* Progress Bar & Rating Header */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
            Password Security Enforcer
          </span>
          <span className={`font-black uppercase tracking-wider text-[10px] ${getTextColor()}`}>
            {result.level} ({result.score}%)
          </span>
        </div>
        
        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-800">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${getBarColor()}`}
            style={{ width: `${Math.max(result.score, 5)}%` }}
          />
        </div>
      </div>

      {/* Zero-Leak Security Notice */}
      <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/80 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
        <Lock size={12} className="text-indigo-500 shrink-0" />
        <span>Zero-Leak Encryption: Passwords are salted with AES-256 and never stored or exposed in plaintext.</span>
      </div>

      {/* Requirement Checklist */}
      {showRequirements && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
          <div className="flex items-center gap-2">
            {result.hasMinLength ? (
              <Check size={14} className="text-emerald-500 shrink-0" />
            ) : (
              <X size={14} className="text-slate-300 dark:text-slate-600 shrink-0" />
            )}
            <span className={result.hasMinLength ? 'text-slate-800 dark:text-slate-200 font-bold' : 'text-slate-400'}>
              8+ Characters
            </span>
          </div>

          <div className="flex items-center gap-2">
            {result.hasUppercase ? (
              <Check size={14} className="text-emerald-500 shrink-0" />
            ) : (
              <X size={14} className="text-slate-300 dark:text-slate-600 shrink-0" />
            )}
            <span className={result.hasUppercase ? 'text-slate-800 dark:text-slate-200 font-bold' : 'text-slate-400'}>
              Uppercase (A-Z)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {result.hasLowercase ? (
              <Check size={14} className="text-emerald-500 shrink-0" />
            ) : (
              <X size={14} className="text-slate-300 dark:text-slate-600 shrink-0" />
            )}
            <span className={result.hasLowercase ? 'text-slate-800 dark:text-slate-200 font-bold' : 'text-slate-400'}>
              Lowercase (a-z)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {result.hasNumber ? (
              <Check size={14} className="text-emerald-500 shrink-0" />
            ) : (
              <X size={14} className="text-slate-300 dark:text-slate-600 shrink-0" />
            )}
            <span className={result.hasNumber ? 'text-slate-800 dark:text-slate-200 font-bold' : 'text-slate-400'}>
              Number (0-9)
            </span>
          </div>

          <div className="flex items-center gap-2 sm:col-span-2">
            {result.hasSpecialChar ? (
              <Check size={14} className="text-emerald-500 shrink-0" />
            ) : (
              <X size={14} className="text-slate-300 dark:text-slate-600 shrink-0" />
            )}
            <span className={result.hasSpecialChar ? 'text-slate-800 dark:text-slate-200 font-bold' : 'text-slate-400'}>
              Special Character (!@#$%^&*)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
