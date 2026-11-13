import React from 'react';
import { Lock, ArrowLeft } from 'lucide-react';

interface AccessRestrictionProps {
  requiredRole?: string;
  onReturnHome?: () => void;
}

export const AccessRestriction: React.FC<AccessRestrictionProps> = ({
  requiredRole = 'authorized clinical or administrative account',
  onReturnHome
}) => {
  return (
    <div className="flex-1 flex items-center justify-center p-6 min-h-[65vh] bg-[#F8FAFC] dark:bg-slate-950">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-5 shadow-xs">
        <div className="w-12 h-12 mx-auto rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <Lock size={22} />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Role Authorization Required
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Access to this section requires an {requiredRole}. Guest and patient sessions are restricted from viewing confidential clinical registries and facility administration controls.
          </p>
        </div>

        <button
          type="button"
          onClick={() => (onReturnHome ? onReturnHome() : (window.location.href = '/'))}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors"
        >
          <ArrowLeft size={15} />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
};

export default AccessRestriction;
