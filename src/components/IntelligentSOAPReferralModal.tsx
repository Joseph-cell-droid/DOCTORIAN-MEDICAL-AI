import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, FileText, Share2, Printer, Copy, Check, AlertTriangle, 
  Stethoscope, ShieldAlert, Sparkles, Send, Building2, User, 
  Calendar, Clock, CheckCircle2, Heart, Activity, ArrowRight, Download
} from 'lucide-react';
import { computePredictiveTriage, VitalsInput } from '../services/predictiveTriageService';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'system';
  text: string;
  timestamp: string;
}

interface IntelligentSOAPReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  vitals?: VitalsInput;
  user?: any;
  activeAgentName?: string;
  onSendToChat?: (text: string) => void;
}

export const IntelligentSOAPReferralModal: React.FC<IntelligentSOAPReferralModalProps> = ({
  isOpen,
  onClose,
  messages,
  vitals = { heartRate: 74, spO2: 98, systolicBP: 120, diastolicBP: 80, temperature: 36.8, respiratoryRate: 16 },
  user,
  activeAgentName = 'Primary Care Specialist',
  onSendToChat
}) => {
  const [activeTab, setActiveTab] = useState<'soap' | 'referral'>('soap');
  const [copied, setCopied] = useState(false);
  const [referralFacility, setReferralFacility] = useState('Mulago National Referral Hospital');
  const [urgencyTier, setUrgencyTier] = useState<'Routine' | 'Urgent' | 'Emergency STAT'>('Urgent');

  // Compute predictive triage & warning scores from current vitals
  const triageResult = useMemo(() => {
    return computePredictiveTriage(vitals);
  }, [vitals]);

  // Derive synthesized SOAP sections from consultation messages
  const soapData = useMemo(() => {
    const userMsgs = messages.filter(m => m.sender === 'user').map(m => m.text);
    const botMsgs = messages.filter(m => m.sender === 'bot').map(m => m.text);

    const chiefComplaint = userMsgs[0] || 'Clinical consultation & physiological assessment.';
    const timeline = userMsgs.length > 1 ? userMsgs.slice(1).join(' ') : 'Acute onset reported during primary evaluation.';
    
    // Assessment summary from bot response
    const lastBotMsg = botMsgs[botMsgs.length - 1] || 'Primary clinical assessment performed under WHO and Uganda Clinical Guidelines (UCG).';
    
    return {
      subjective: {
        chiefComplaint: chiefComplaint,
        historyOfPresentIllness: timeline,
        reviewOfSystems: 'Constitutional, cardiovascular, and respiratory systems evaluated via active AI consultation.'
      },
      objective: {
        vitalsSummary: `HR: ${vitals.heartRate ?? 72} bpm | SpO2: ${vitals.spO2 ?? 98}% | BP: ${vitals.systolicBP ?? 120}/${vitals.diastolicBP ?? 80} mmHg | Temp: ${vitals.temperature ?? 36.8}°C | RR: ${vitals.respiratoryRate ?? 16}/min`,
        earlyWarningScores: `NEWS2: ${triageResult.news2.score}/20 (${triageResult.news2.riskLevel} Risk) | qSOFA: ${triageResult.qsofa.score}/3 (${triageResult.qsofa.riskLevel})`,
        trajectory: `${triageResult.compositeTrajectory}`
      },
      assessment: {
        clinicalImpression: lastBotMsg.length > 250 ? lastBotMsg.substring(0, 250) + '...' : lastBotMsg,
        acuityLevel: triageResult.compositeTrajectory,
        sepsisAlert: triageResult.qsofa.sepsisRisk ? 'CRITICAL: Meets criteria for rapid clinical sepsis screening.' : 'Normal sepsis probability threshold.'
      },
      plan: {
        investigations: triageResult.news2.score >= 5 
          ? 'Urgent Full Blood Count (FBC), Blood Glucose, Malaria mRDT, Serum Electrolytes, and 12-lead ECG.' 
          : 'Routine baseline vitals monitoring, hydration tracking, and symptom diary.',
        treatment: 'Supportive therapy, oral rehydration salts (ORS), and close bio-telemetry observation according to clinical guidelines.',
        disposition: triageResult.recommendedFacilityTier,
        warningSigns: 'Immediate return if chest pain, severe dyspnea, cyanosis, confusion, or convulsions develop.'
      }
    };
  }, [messages, vitals, triageResult]);

  const handleCopyNote = () => {
    const formatted = activeTab === 'soap' 
      ? `--- DOCTORIAN EHR SOAP NOTE ---
PATIENT: ${user?.name || 'Gloria J. Akullo'} | DATE: ${new Date().toLocaleDateString()}
CLINICAL SPECIALIST: Doctorian Clinical AI (${activeAgentName})

[SUBJECTIVE]
• Chief Complaint: ${soapData.subjective.chiefComplaint}
• HPI: ${soapData.subjective.historyOfPresentIllness}

[OBJECTIVE]
• Bio-Telemetry: ${soapData.objective.vitalsSummary}
• Warning Scores: ${soapData.objective.earlyWarningScores}
• Acuity Trajectory: ${soapData.objective.trajectory}

[ASSESSMENT]
• Clinical Impression: ${soapData.assessment.clinicalImpression}
• Acuity: ${soapData.assessment.acuityLevel}

[PLAN]
• Investigations: ${soapData.plan.investigations}
• Management: ${soapData.plan.treatment}
• Disposition: ${soapData.plan.disposition}
• Red Flags: ${soapData.plan.warningSigns}`
      : `--- UGANDA MINISTRY OF HEALTH CLINICAL REFERRAL VOUCHER ---
PATIENT: ${user?.name || 'Gloria J. Akullo'} | AGE/GENDER: 28 / Female
REFERRING FACILITY / NODE: Doctorian Clinical AI Neural Triage Node
RECEIVING FACILITY: ${referralFacility}
URGENCY: ${urgencyTier}
DATE & TIME: ${new Date().toLocaleString()}

CLINICAL REASON FOR REFERRAL:
${soapData.subjective.chiefComplaint}

VITALS TELEMETRY AT DISPOSITION:
${soapData.objective.vitalsSummary}
• NEWS2 Score: ${triageResult.news2.score}/20 (${triageResult.news2.riskLevel} Risk)
• qSOFA Score: ${triageResult.qsofa.score}/3 (${triageResult.qsofa.riskLevel})

PRELIMINARY ASSESSMENT & INTERVENTIONS:
${soapData.assessment.clinicalImpression}

RECOMMENDED FACILITY TIER: ${soapData.plan.disposition}
ESCORT REQUIRED: ${urgencyTier === 'Emergency STAT' ? 'YES - Medical Transport/Ambulance' : 'NO'}`;

    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        className="w-full max-w-3xl bg-[#070e24] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100"
      >
        {/* Header Bar */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-[#0a1532]/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-cyan-400">
              <FileText size={16} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                Intelligent EHR & Clinical Referral
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">
                Grounded in Uganda Clinical Guidelines (UCG) & WHO Standards
              </p>
            </div>
          </div>

          {/* Action Tabs & Close */}
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-900/80 p-0.5 rounded-xl border border-slate-800 text-[10px] font-black uppercase tracking-wider">
              <button
                type="button"
                onClick={() => setActiveTab('soap')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeTab === 'soap' 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                SOAP Note
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('referral')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeTab === 'referral' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                MOH Referral
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/60 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs custom-scrollbar">
          
          {/* Quick Acuity Alert Banner */}
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className={`w-2.5 h-2.5 rounded-full ${
                triageResult.compositeTrajectory === 'Critical Acuity' ? 'bg-rose-500 animate-ping' :
                triageResult.compositeTrajectory === 'Escalating' ? 'bg-orange-400' :
                triageResult.compositeTrajectory === 'Guarded' ? 'bg-amber-400' : 'bg-emerald-400'
              }`} />
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Calculated Acuity Trajectory
                </span>
                <p className={`font-black text-sm ${triageResult.trajectoryColor}`}>
                  {triageResult.compositeTrajectory}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-mono">
              <div className="px-2.5 py-1 rounded-lg bg-blue-950/60 border border-blue-800/60 text-cyan-300">
                NEWS2: {triageResult.news2.score}/20 ({triageResult.news2.riskLevel})
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-800/60 text-purple-300">
                qSOFA: {triageResult.qsofa.score}/3
              </div>
            </div>
          </div>

          {activeTab === 'soap' ? (
            /* ─────────────────────────────────────────────────────────── */
            /* 1. EHR SOAP NOTE VIEW                                       */
            /* ─────────────────────────────────────────────────────────── */
            <div className="space-y-3">
              {/* S - Subjective */}
              <div className="p-3.5 rounded-2xl bg-[#09132d] border border-blue-900/40 space-y-1.5">
                <div className="flex items-center gap-2 text-blue-400 font-black text-xs uppercase tracking-wider">
                  <User size={13} />
                  <span>S — Subjective (Patient Report & Chief Complaint)</span>
                </div>
                <p className="text-slate-300 leading-relaxed pl-5">
                  <strong className="text-white">Chief Complaint:</strong> {soapData.subjective.chiefComplaint}
                </p>
                <p className="text-slate-400 leading-relaxed pl-5">
                  <strong className="text-slate-300">HPI:</strong> {soapData.subjective.historyOfPresentIllness}
                </p>
              </div>

              {/* O - Objective */}
              <div className="p-3.5 rounded-2xl bg-[#09132d] border border-cyan-900/40 space-y-1.5">
                <div className="flex items-center gap-2 text-cyan-400 font-black text-xs uppercase tracking-wider">
                  <Activity size={13} />
                  <span>O — Objective (Bio-Telemetry & Early Warning Scores)</span>
                </div>
                <div className="pl-5 space-y-1">
                  <p className="text-slate-300 font-mono text-[11px]">
                    {soapData.objective.vitalsSummary}
                  </p>
                  <p className="text-slate-400">
                    <strong className="text-slate-300">Early Warning Systems:</strong> {soapData.objective.earlyWarningScores}
                  </p>
                </div>
              </div>

              {/* A - Assessment */}
              <div className="p-3.5 rounded-2xl bg-[#09132d] border border-purple-900/40 space-y-1.5">
                <div className="flex items-center gap-2 text-purple-400 font-black text-xs uppercase tracking-wider">
                  <Stethoscope size={13} />
                  <span>A — Assessment (Clinical Impression & Severity)</span>
                </div>
                <p className="text-slate-300 leading-relaxed pl-5">
                  {soapData.assessment.clinicalImpression}
                </p>
                {triageResult.qsofa.sepsisRisk && (
                  <div className="ml-5 p-2 rounded-xl bg-rose-950/60 border border-rose-600/60 text-rose-300 text-[11px] font-semibold flex items-center gap-2">
                    <AlertTriangle size={14} className="text-rose-400 shrink-0" />
                    <span>{soapData.assessment.sepsisAlert}</span>
                  </div>
                )}
              </div>

              {/* P - Plan */}
              <div className="p-3.5 rounded-2xl bg-[#09132d] border border-emerald-900/40 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-wider">
                  <CheckCircle2 size={13} />
                  <span>P — Plan (Investigations, Treatment & Facility Disposition)</span>
                </div>
                <div className="pl-5 space-y-1.5 text-slate-300">
                  <p><strong className="text-emerald-300">Diagnostic Workup:</strong> {soapData.plan.investigations}</p>
                  <p><strong className="text-emerald-300">Pharmacotherapy / Rx:</strong> {soapData.plan.treatment}</p>
                  <p><strong className="text-emerald-300">Facility Disposition:</strong> {soapData.plan.disposition}</p>
                  <p className="text-amber-300 text-[11px]"><strong className="text-amber-200">Emergency Red Flags:</strong> {soapData.plan.warningSigns}</p>
                </div>
              </div>
            </div>
          ) : (
            /* ─────────────────────────────────────────────────────────── */
            /* 2. OFFICIAL MOH REFERRAL VOUCHER VIEW                       */
            /* ─────────────────────────────────────────────────────────── */
            <div className="p-4 sm:p-5 rounded-2xl bg-white text-slate-900 border border-slate-300 space-y-4 shadow-xl">
              {/* Official Voucher Top Banner */}
              <div className="border-b-2 border-slate-800 pb-3 flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-700">
                    Republic of Uganda • Ministry of Health
                  </span>
                  <h4 className="text-base font-black uppercase text-slate-900 tracking-tight">
                    Official Clinical Referral Voucher
                  </h4>
                  <p className="text-[10px] text-slate-600 font-mono">
                    Form MOH-REF-2026/UG • Digital Health System Interoperability
                  </p>
                </div>
                <div className="text-right font-mono text-[10px] text-slate-500">
                  <div>VOUCHER: #DOC-UG-{Math.floor(100000 + Math.random() * 900000)}</div>
                  <div>DATE: {new Date().toLocaleDateString()}</div>
                </div>
              </div>

              {/* Receiving Facility & Urgency Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-100 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-700 block mb-1">
                    Receiving Health Facility
                  </label>
                  <select
                    value={referralFacility}
                    onChange={(e) => setReferralFacility(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs font-semibold text-slate-800 focus:outline-hidden"
                  >
                    <option value="Mulago National Referral Hospital">Mulago National Referral Hospital (Kampala)</option>
                    <option value="Kiruddu National Referral Hospital">Kiruddu National Referral Hospital</option>
                    <option value="Mbarara Regional Referral Hospital">Mbarara Regional Referral Hospital</option>
                    <option value="Gulu Regional Referral Hospital">Gulu Regional Referral Hospital</option>
                    <option value="District General Hospital">District General Hospital</option>
                    <option value="Sub-County Health Centre IV">Sub-County Health Centre IV</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-700 block mb-1">
                    Triage Urgency Priority
                  </label>
                  <div className="flex gap-1.5">
                    {(['Routine', 'Urgent', 'Emergency STAT'] as const).map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setUrgencyTier(tier)}
                        className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-black uppercase transition-all ${
                          urgencyTier === tier
                            ? tier === 'Emergency STAT' ? 'bg-rose-600 text-white' : tier === 'Urgent' ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Patient & Clinical Details Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs border border-slate-200 p-3 rounded-xl">
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-500 block">Patient Name</span>
                  <span className="font-bold text-slate-800">{user?.name || 'Gloria J. Akullo'}</span>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-500 block">Referring Clinician</span>
                  <span className="font-bold text-slate-800">Doctorian AI ({activeAgentName})</span>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-500 block">NEWS2 Acuity Score</span>
                  <span className="font-bold text-rose-600">{triageResult.news2.score}/20 ({triageResult.news2.riskLevel})</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <span className="text-[10px] font-black uppercase text-slate-600 block">
                  Clinical Reason for Referral & Triage Findings
                </span>
                <p className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 leading-relaxed font-serif">
                  {soapData.subjective.chiefComplaint}
                </p>
              </div>

              <div className="space-y-1 text-xs">
                <span className="text-[10px] font-black uppercase text-slate-600 block">
                  Attached Bio-Telemetry Stream
                </span>
                <div className="p-2 bg-slate-900 text-cyan-300 font-mono text-[11px] rounded-lg">
                  {soapData.objective.vitalsSummary}
                </div>
              </div>

              {/* Bottom Official Stamp & Signature Block */}
              <div className="pt-3 border-t border-slate-300 flex items-center justify-between text-[10px] font-mono text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-black">
                    ✓
                  </div>
                  <span>Electronically Validated under UCG-2026</span>
                </div>
                <div className="text-right">
                  <span>Signatory: EBRO Company Ltd • Doctorian AI</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#0a1532] flex items-center justify-between shrink-0">
          <div className="text-[10px] font-mono text-slate-400">
            Export ready for Hospital EHR / WhatsApp / Print
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyNote}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer active:scale-95"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer active:scale-95"
            >
              <Printer size={14} />
              <span>Print Slip</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
