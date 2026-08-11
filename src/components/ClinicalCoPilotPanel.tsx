import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, ShieldAlert, Zap, Compass, CheckCircle2, AlertTriangle, Activity, Send, Pill, Shield, Users, Sparkles } from 'lucide-react';
import { Vitals, HealthStatus } from '../hooks/useArduino';
import { checkDrugInteractions, WHO_ESSENTIAL_MEDICINES } from '../utils/clinicalDatasets';
import { SpecialistPanelModal } from './SpecialistPanelModal';

interface ClinicalCoPilotPanelProps {
  patient: any;
  vitals: Vitals | null;
  healthStatus: HealthStatus | null;
  onSendProtocol: (protocolName: string) => void;
}

export const ClinicalCoPilotPanel: React.FC<ClinicalCoPilotPanelProps> = ({
  patient,
  vitals,
  healthStatus,
  onSendProtocol
}) => {
  const [activeTab, setActiveTab] = useState<'assess' | 'rules' | 'predict' | 'drugcheck'>('assess');
  const [diagnosticsLogs, setDiagnosticsLogs] = useState<string[]>([]);
  const [drug1, setDrug1] = useState('Aspirin');
  const [drug2, setDrug2] = useState('Warfarin');
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);

  useEffect(() => {
    if (vitals) {
      const timestamp = new Date().toLocaleTimeString();
      setDiagnosticsLogs(prev => [
        `[${timestamp}] Live biometric frame ingested: HR ${Math.round(vitals.heartRate)} | SpO2 ${Math.round(vitals.spo2)}%`,
        ...prev.slice(0, 4)
      ]);
    }
  }, [vitals?.heartRate]);

  // Derive correlations and warnings based on patient's specific conditions & active telemetry
  const getCorrelations = () => {
    const risks: { title: string; desc: string; severity: 'high' | 'warn' | 'stable' }[] = [];
    
    if (!vitals) {
      return { risks };
    }

    const hr = vitals.heartRate;
    const bpSystolic = vitals.systolicBP;
    const bpDiastolic = vitals.diastolicBP;
    const spo2 = vitals.spo2;

    // Condition based risks mapping
    if (patient.conditions.toLowerCase().includes('heart') || patient.conditions.toLowerCase().includes('arrhythmia') || patient.conditions.toLowerCase().includes('valve')) {
      if (hr > 100) {
        risks.push({
          title: 'Tachycardia / Arrhythmia Strains',
          desc: 'High baseline rates paired with valve/mitral disease increases myocardial workload.',
          severity: 'high'
        });
      } else if (hr < 60) {
        risks.push({
          title: 'Autonomic Bradycardia Trend',
          desc: 'Lower pacing range. Monitor physiological pacing indexes closely.',
          severity: 'warn'
        });
      } else {
        risks.push({
          title: 'Autonomic Rhythm Stabilized',
          desc: 'Standard physical pacing. No ectopic rhythm spikes detected.',
          severity: 'stable'
        });
      }
    }

    if (patient.conditions.toLowerCase().includes('preeclampsia') || patient.conditions.toLowerCase().includes('hypertension') || patient.conditions.toLowerCase().includes('eclampsia')) {
      if (bpSystolic > 140 || bpDiastolic > 90) {
        risks.push({
          title: 'Severity Hypertensive Spike',
          desc: 'Systolic values surpassed gestational safe bounds. Critical risk of seizure activation.',
          severity: 'high'
        });
      } else {
        risks.push({
          title: 'Gestational BP Regulated',
          desc: 'Mean systemic arterial pressures remain controlled within bounds.',
          severity: 'stable'
        });
      }
    }

    if (spo2 < 92) {
      risks.push({
        title: 'Mild Hypoxemia / Ventilation Deficit',
        desc: 'Inadequate blood oxygenation mapping. Consider high-flow nasal cannula therapy.',
        severity: 'high'
      });
    }

    return { risks };
  };

  const { risks } = getCorrelations();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl flex flex-col justify-between">
      {/* Dynamic Background Grid Decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-500/10 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative z-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-0.5">
            <h4 className="text-[9px] font-black text-teal-400 uppercase tracking-[0.34em] mb-1 flex items-center gap-1.5 animate-pulse">
              <Compass size={12} className="text-teal-400 rotate-45" /> Active Co-Pilot Nexus
            </h4>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">
              Clinical Co-Pilot
            </h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsBoardModalOpen(true)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-indigo-500/20 transition-all active:scale-95 cursor-pointer"
            >
              <Users size={12} />
              <span>AI Board Review</span>
            </button>
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
              {(['assess', 'rules', 'predict', 'drugcheck'] as const).map((tab, mapIdx_127) => (
                <button
                  type="button"
                  key={`clinicalcopilotpanel-l131-${mapIdx_127}`}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-[8.5px] font-black uppercase tracking-wider rounded-lg transition-all select-none cursor-pointer ${
                    activeTab === tab ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab === 'drugcheck' ? 'Meds & Interactions' : tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'assess' && (
            <motion.div
              key="assess"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 text-left"
            >
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">Continuous Physiological Diagnostics</p>
              
              <div className="space-y-3">
                {risks.length === 0 ? (
                  <div className="p-4 bg-slate-950/50 border border-slate-800/80 rounded-2xl flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-teal-405" />
                    <p className="text-xs font-bold text-slate-400">All co-pilot diagnostic vectors reporting systemic homeostasis.</p>
                  </div>
                ) : (
                  risks.map((risk, index) => (
                    <div 
                      key={`clinicalcopilotpanel-l164-index-${index}`} 
                      className={`p-4 border rounded-2xl flex gap-3 transition-all ${
                        risk.severity === 'high' ? 'bg-rose-955/20 border-rose-900/30 text-rose-100' :
                        risk.severity === 'warn' ? 'bg-amber-955/20 border-amber-900/35 text-amber-200' :
                        'bg-emerald-955/20 border-emerald-900/30 text-emerald-100'
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {risk.severity === 'high' ? <ShieldAlert size={16} className="text-rose-450" /> :
                         risk.severity === 'warn' ? <AlertTriangle size={16} className="text-amber-450" /> :
                         <CheckCircle2 size={16} className="text-emerald-450" />}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-black uppercase tracking-tight">{risk.title}</h4>
                        <p className="text-[11px] leading-relaxed text-slate-400 font-medium">{risk.desc}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'rules' && (
            <motion.div
              key="rules"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 text-left"
            >
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">Uganda MOH Guideline Anchors</p>
              
              <div className="p-4 bg-slate-955 border border-slate-800/60 rounded-2xl space-y-3.5">
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-[9px] font-mono shrink-0">1</div>
                  <div>
                    <h5 className="text-[10.5px] font-black text-slate-200 uppercase tracking-wide">Maternal Care Delivery Protocol</h5>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-semibold mt-0.5">Severe pre-eclampsia cases require automated loading and scaling of IV Magnesium Sulphate parameters.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-[9px] font-mono shrink-0">2</div>
                  <div>
                    <h5 className="text-[10.5px] font-black text-slate-200 uppercase tracking-wide">Severe Malnutrition (SAM) Matrix</h5>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-semibold mt-0.5">Underweight beds combined with thermal dips trigger direct glucose and ReSomal infusion guides.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-[9px] font-mono shrink-0">3</div>
                  <div>
                    <h5 className="text-[10.5px] font-black text-slate-200 uppercase tracking-wide">Fever Malaria Syndromic Guide</h5>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-semibold mt-0.5">Severe diagnostic signs in febrile cases dictate fast IV Artesunate therapy allocations.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'predict' && (
            <motion.div
              key="predict"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 text-left font-sans"
            >
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">Biometric Frame Drift Logs</p>
              <div className="p-4 bg-slate-955 border border-slate-800 rounded-2xl font-mono text-[9px] text-teal-300 space-y-2 max-h-40 overflow-y-auto leading-relaxed">
                {diagnosticsLogs.length === 0 ? (
                  <p className="text-slate-500 italic">Synchronizing live baseline signals...</p>
                ) : (
                  diagnosticsLogs.map((log, i) => (
                    <div key={`clinicalcopilotpanel-l239-i-${i}`} className="border-b border-slate-900/35 pb-1 flex items-start gap-1.5">
                      <span className="text-emerald-500 shrink-0">»</span>
                      <span className="font-semibold text-slate-350">{log}</span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
          {activeTab === 'drugcheck' && (
            <motion.div
              key="drugcheck"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 text-left"
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest block flex items-center gap-1.5">
                  <Shield size={12} className="text-teal-400" /> WHO Essential Medicines & Drug Matrix
                </p>
                <span className="text-[9px] bg-teal-950 text-teal-300 font-mono px-2 py-0.5 rounded border border-teal-800/50 font-bold">Offline Local Database</span>
              </div>

              {/* Quick Drug Interaction Tester */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-300 block">Contraindication Matrix Evaluator</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={drug1}
                    onChange={e => setDrug1(e.target.value)}
                    placeholder="Drug 1 (e.g. Aspirin)"
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-teal-500"
                  />
                  <input
                    type="text"
                    value={drug2}
                    onChange={e => setDrug2(e.target.value)}
                    placeholder="Drug 2 (e.g. Warfarin)"
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-teal-500"
                  />
                </div>

                {(() => {
                  const interactions = checkDrugInteractions([drug1, drug2]);
                  if (interactions.length === 0) {
                    return (
                      <div className="p-2.5 bg-emerald-950/50 border border-emerald-800/40 rounded-xl flex items-center gap-2 text-[11px] text-emerald-300 font-bold">
                        <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                        <span>No major contraindications found between {drug1} and {drug2}.</span>
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-2">
                      {interactions.map((inter, i) => (
                        <div key={`clinicalcopilotpanel-l296-i-${i}`} className={`p-3 rounded-xl border text-[11px] font-medium space-y-1 ${
                          inter.severity === 'CRITICAL' || inter.severity === 'HIGH' ? 'bg-rose-950/60 border-rose-800/80 text-rose-200' : 'bg-amber-950/60 border-amber-800/80 text-amber-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className="font-black uppercase tracking-wider text-[10px]">{inter.drugA} + {inter.drugB}</span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-rose-900 text-rose-100">{inter.severity} risk</span>
                          </div>
                          <p className="text-[10px] leading-tight text-slate-300">{inter.clinicalEffect}</p>
                          <p className="text-[10px] font-bold text-teal-300">Rec: {inter.recommendedAction}</p>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* WHO Essential Medicines Quick List */}
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">WHO Essential Medicines Catalogue</span>
                <div className="max-h-28 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                  {WHO_ESSENTIAL_MEDICINES.slice(0, 6).map((med, idx) => (
                    <div key={`clinicalcopilotpanel-l317-idx-${idx}`} className="p-2 bg-slate-950/40 border border-slate-800/60 rounded-xl flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <Pill size={12} className="text-teal-400" />
                        <span className="text-slate-200">{med.innName}</span>
                      </div>
                      <span className="text-[9px] font-mono bg-slate-900 text-slate-400 px-2 py-0.5 rounded">{med.category}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dynamic Interactive Action Buttons */}
      <div className="mt-8 pt-6 border-t border-slate-800 text-left">
        <p className="text-[9px] font-black uppercase text-slate-450 tracking-wider mb-2.5">Transmit Supportive Protocol to Ward EMR</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              onSendProtocol("Magnesium Sulphate Bolus E-Protocol");
            }}
            className="flex-1 py-3 bg-slate-950 hover:bg-slate-800 text-[9px] font-black uppercase tracking-wider rounded-xl border border-slate-800 flex items-center justify-center gap-1.5 transition-all select-none cursor-pointer"
          >
            <Zap size={11} className="text-teal-400" /> MgSO4
          </button>
          <button
            type="button"
            onClick={() => {
              onSendProtocol("IV Artesunate Heavy Infection E-Protocol");
            }}
            className="flex-1 py-3 bg-slate-950 hover:bg-slate-800 text-[9px] font-black uppercase tracking-wider rounded-xl border border-slate-800 flex items-center justify-center gap-1.5 transition-all select-none cursor-pointer"
          >
            <Activity size={11} className="text-teal-400" /> Artesunate
          </button>
          <button
            type="button"
            onClick={() => {
              onSendProtocol("Paediatric SAM ReSomal Oral Fluid Protocol");
            }}
            className="flex-1 py-3 bg-slate-950 hover:bg-slate-800 text-[9px] font-black uppercase tracking-wider rounded-xl border border-slate-800 flex items-center justify-center gap-1.5 transition-all select-none cursor-pointer"
          >
            <Send size={11} className="text-teal-400" /> ReSomal
          </button>
        </div>
      </div>

      {/* Specialist Board Review Modal */}
      <SpecialistPanelModal
        isOpen={isBoardModalOpen}
        onClose={() => setIsBoardModalOpen(false)}
        patientData={{
          name: patient?.name || "Joseph A.",
          age: patient?.age || 44,
          gender: patient?.gender || "Male",
          conditions: patient?.conditions || "Hypertension, Mild Asthma",
          medications: patient?.medications || "Lisinopril 10mg, Albuterol Inhaler",
          vitals: vitals ? { hr: vitals.heartRate, bp: `${vitals.systolicBP}/${vitals.diastolicBP}`, spo2: vitals.spo2 } : { hr: 78, bp: "124/82", spo2: 98 }
        }}
      />
    </div>
  );
};
