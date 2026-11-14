import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, ChevronDown, ChevronUp, Stethoscope } from 'lucide-react';

export interface MedicalDisclaimerProps {
  variant?: 'inline' | 'banner' | 'compact';
  className?: string;
  showEmergencyNotice?: boolean;
}

export const OFFICIAL_CLINICAL_DISCLAIMER =
  'Doctorian AI provides healthcare information and clinical decision support. It does not replace professional medical judgment, physical examination, or diagnosis by a qualified healthcare professional. In an emergency, seek immediate medical attention.';

export const MedicalDisclaimer: React.FC<MedicalDisclaimerProps> = ({
  variant = 'inline',
  className = '',
  showEmergencyNotice = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (variant === 'compact') {
    return (
      <div className={`text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-900/70 ${className}`}>
        <div
          className="flex items-center justify-between gap-2 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2 font-medium min-w-0">
            <ShieldAlert size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="truncate">
              Clinical decision support only — does not replace a qualified healthcare professional.
            </span>
          </div>
          <button
            type="button"
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-0.5 shrink-0"
            aria-label="Toggle medical disclaimer details"
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {isExpanded && (
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-200 dark:border-slate-800 pt-2">
            {OFFICIAL_CLINICAL_DISCLAIMER}
          </p>
        )}
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <aside
        role="note"
        aria-label="Clinical Safety Disclaimer"
        className={`w-full rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/70 p-4 text-slate-800 dark:text-slate-200 ${className}`}
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
            <AlertTriangle size={18} />
          </div>
          <div className="space-y-1 text-sm">
            <h4 className="font-semibold text-slate-900 dark:text-white">
              Clinical Decision Support &amp; Safety Notice
            </h4>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {OFFICIAL_CLINICAL_DISCLAIMER}
            </p>
            {showEmergencyNotice && (
              <p className="font-semibold text-red-700 dark:text-red-400 text-xs pt-1">
                Emergency guidance: Seek immediate hospital care for chest pain, severe difficulty breathing, confusion, seizures, heavy bleeding, or pregnancy danger signs.
              </p>
            )}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <div
      role="note"
      className={`mt-3 pt-2.5 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl ${className}`}
    >
      <Stethoscope size={15} className="text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
      <div className="leading-relaxed">
        <strong className="text-slate-900 dark:text-white font-semibold">Clinical Safety Notice: </strong>
        <span>{OFFICIAL_CLINICAL_DISCLAIMER}</span>
      </div>
    </div>
  );
};

export default MedicalDisclaimer;
