/**
 * Utility functions for safely handling and rendering Doctorian credits (Neural Energy units).
 * Prevents NaN propagation in full-stack state synchronization or offline failover transitions.
 */

export const isCreditsUnlimited = (credits: any): boolean => {
  if (!credits) return false;
  const str = String(credits).toLowerCase();
  return (
    str.includes("unlimited") ||
    str.includes("infinite") ||
    str.includes("failover") ||
    str.includes("fallback") ||
    str.includes("back-up") ||
    str.includes("∞") ||
    parseFloat(str) >= 99999
  );
};

export const parseCreditsToNumber = (credits: any, fallback = 400): number => {
  if (credits === undefined || credits === null) return fallback;
  if (typeof credits === "number") {
    return isNaN(credits) ? fallback : credits;
  }
  if (isCreditsUnlimited(credits)) return 999999;
  const parsed = parseFloat(String(credits));
  return isNaN(parsed) ? fallback : parsed;
};

export const formatCredits = (credits: any): string => {
  if (isCreditsUnlimited(credits)) return "Unlimited";
  const num = parseCreditsToNumber(credits);
  return String(Math.round(num));
};

export const safeDeductCredits = (currentCredits: any, amount: number): number | string => {
  if (isCreditsUnlimited(currentCredits)) return "Unlimited";
  const num = parseCreditsToNumber(currentCredits);
  return Math.max(0, num - amount);
};

export const parseResponseCredits = (creditsRemaining: any): number | string => {
  if (creditsRemaining === undefined || creditsRemaining === null) return 400;
  if (isCreditsUnlimited(creditsRemaining)) return "Unlimited";
  const num = parseFloat(String(creditsRemaining));
  return isNaN(num) ? "Unlimited" : num;
};
