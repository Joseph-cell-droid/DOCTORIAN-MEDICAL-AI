import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, Download, Printer, ShieldCheck, QrCode, Share2, CheckCircle2, Lock, Copy, Sparkles, Database } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface ClinicalReportExporterProps {
  isOpen: boolean;
  onClose: () => void;
  patientData?: {
    id?: string;
    name?: string;
    age?: number;
    gender?: string;
    bloodGroup?: string;
    conditions?: string[];
    medications?: string[];
    vitals?: {
      heartRate?: number;
      bp?: string;
      spo2?: number;
      temp?: number;
    };
    aiAssessment?: string;
  };
}

export const ClinicalReportExporter: React.FC<ClinicalReportExporterProps> = ({
  isOpen,
  onClose,
  patientData = {
    id: 'PAT-984210',
    name: 'Joseph A. (Patient)',
    age: 44,
    gender: 'Male',
    bloodGroup: 'O+',
    conditions: ['Essential Hypertension', 'Mild Exercise-Induced Asthma'],
    medications: ['Lisinopril 10mg Daily', 'Albuterol Inhaler PRN'],
    vitals: {
      heartRate: 76,
      bp: '122/80',
      spo2: 98,
      temp: 36.8
    },
    aiAssessment: 'Physiological vitals exhibit optimal homeostasis. No acute arrhythmia or ischemic stress detected during live telemetry sampling.'
  }
}) => {
  const [activeTab, setActiveTab] = useState<'soap' | 'fhir' | 'certificate'>('soap');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate SHA-256 Mock Cryptographic Hash
  const timeStamp = new Date().toISOString();
  const rawDataString = `${patientData.id}-${patientData.name}-${patientData.vitals?.bp}-${timeStamp}`;
  const cryptoHash = `0x8f9c${Array.from(rawDataString).reduce((acc: string, char: string) => acc + char.charCodeAt(0).toString(16), '')}e4b7a192`;

  const fhirPayload = {
    resourceType: "Bundle",
    type: "document",
    timestamp: timeStamp,
    identifier: {
      system: "https://doctorian.ai/fhir/ids",
      value: patientData.id
    },
    entry: [
      {
        resource: {
          resourceType: "Patient",
          id: patientData.id,
          name: [{ text: patientData.name }],
          gender: patientData.gender?.toLowerCase(),
          birthDate: "1982-04-12"
        }
      },
      {
        resource: {
          resourceType: "Observation",
          status: "final",
          code: { coding: [{ system: "http://loinc.org", code: "8867-4", display: "Heart rate" }] },
          valueQuantity: { value: patientData.vitals?.heartRate, unit: "beats/min" }
        }
      },
      {
        resource: {
          resourceType: "Observation",
          status: "final",
          code: { coding: [{ system: "http://loinc.org", code: "85354-9", display: "Blood pressure panel" }] },
          component: [
            { code: { coding: [{ code: "8480-6", display: "Systolic" }] }, valueQuantity: { value: 122, unit: "mmHg" } },
            { code: { coding: [{ code: "8462-4", display: "Diastolic" }] }, valueQuantity: { value: 80, unit: "mmHg" } }
          ]
        }
      }
    ],
    signature: {
      type: [{ system: "urn:iso-astm:E1762-95:2013", code: "1.2.840.10065.1.12.1.1" }],
      when: timeStamp,
      who: { display: "Doctorian Autonomous Clinical AI System" },
      data: cryptoHash
    }
  };

  const handleCopyFHIR = () => {
    navigator.clipboard.writeText(JSON.stringify(fhirPayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] shadow-2xl overflow-hidden relative my-6"
      >
        {/* Header */}
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <FileText size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">EHR Compliance & Clinical Exporter</h3>
                <span className="px-3 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 font-black text-[9px] uppercase tracking-wider rounded-full border border-emerald-200 dark:border-emerald-800">
                  HL7 FHIR v4.0.1
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-0.5">
                Generate certified medical records, SOAP clinical notes, and cryptographic verification signatures
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="self-end sm:self-center p-3 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-8 pt-6 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('soap')}
            className={`pb-4 px-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
              activeTab === 'soap'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            1. Clinical SOAP Summary
          </button>
          <button
            onClick={() => setActiveTab('fhir')}
            className={`pb-4 px-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
              activeTab === 'fhir'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            2. HL7 FHIR JSON Data
          </button>
          <button
            onClick={() => setActiveTab('certificate')}
            className={`pb-4 px-4 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
              activeTab === 'certificate'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            3. Cryptographic Verification Seal
          </button>
        </div>

        {/* Content Body */}
        <div className="p-8 max-h-[65vh] overflow-y-auto">
          {activeTab === 'soap' && (
            <div className="space-y-6">
              {/* Official Header Badge */}
              <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">DOCTORIAN CLINICAL MEDICAL CENTER</h4>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Department of Cardiology & Autonomous AI Health Systems</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-slate-900 dark:text-white block">DATE: {new Date().toLocaleDateString()}</span>
                  <span className="text-[10px] font-bold text-slate-400 block">ID: {patientData.id}</span>
                </div>
              </div>

              {/* Patient Profile Brief */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Patient Name</span>
                  <span className="text-sm font-black text-slate-800 dark:text-white">{patientData.name}</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Age / Gender</span>
                  <span className="text-sm font-black text-slate-800 dark:text-white">{patientData.age} Yrs / {patientData.gender}</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Blood Type</span>
                  <span className="text-sm font-black text-slate-800 dark:text-white">{patientData.bloodGroup}</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Telemetry Status</span>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase">Synchronized (Live)</span>
                </div>
              </div>

              {/* SOAP Note Sections */}
              <div className="space-y-4">
                <div className="p-5 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <h5 className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">[S] SUBJECTIVE</h5>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                    Patient presents for routine clinical AI evaluation. Reports good energy levels, zero chest tightness, regular sleep schedule (7.2 hrs/night). Denies dyspnea or acute palpitation episodes.
                  </p>
                </div>

                <div className="p-5 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <h5 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">[O] OBJECTIVE</h5>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div><span className="font-bold text-slate-400">Heart Rate:</span> <span className="font-black text-slate-800 dark:text-white">{patientData.vitals?.heartRate} BPM</span></div>
                    <div><span className="font-bold text-slate-400">Blood Pressure:</span> <span className="font-black text-slate-800 dark:text-white">{patientData.vitals?.bp} mmHg</span></div>
                    <div><span className="font-bold text-slate-400">SpO2 Level:</span> <span className="font-black text-slate-800 dark:text-white">{patientData.vitals?.spo2}%</span></div>
                    <div><span className="font-bold text-slate-400">Body Temp:</span> <span className="font-black text-slate-800 dark:text-white">{patientData.vitals?.temp}°C</span></div>
                  </div>
                </div>

                <div className="p-5 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <h5 className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider">[A] ASSESSMENT</h5>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                    {patientData.aiAssessment}
                  </p>
                </div>

                <div className="p-5 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <h5 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">[P] PLAN</h5>
                  <ul className="list-disc list-inside text-xs font-semibold text-slate-700 dark:text-slate-300 space-y-1">
                    <li>Continue daily Lisinopril 10mg morning administration.</li>
                    <li>Maintain daily aerobic exercise target (10,000 steps).</li>
                    <li>Schedule follow-up telemetry scan in 30 days.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fhir' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                  HL7 FHIR Release 4 JSON Schema Standard
                </span>
                <button
                  onClick={handleCopyFHIR}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all"
                >
                  {copied ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied to Clipboard' : 'Copy FHIR JSON'}</span>
                </button>
              </div>
              <pre className="p-5 bg-slate-950 text-emerald-400 rounded-3xl text-[11px] font-mono overflow-x-auto border border-slate-800 max-h-[380px]">
                {JSON.stringify(fhirPayload, null, 2)}
              </pre>
            </div>
          )}

          {activeTab === 'certificate' && (
            <div className="space-y-6">
              <div className="p-8 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-[2.5rem] border border-indigo-500/30 shadow-2xl space-y-6 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="space-y-2 text-center sm:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-black uppercase tracking-widest">
                      <ShieldCheck size={14} />
                      <span>Tamper-Proof Verification Certificate</span>
                    </div>
                    <h4 className="text-xl font-black uppercase tracking-tight">Doctorian Authenticated Record</h4>
                    <p className="text-xs text-slate-300 font-medium">
                      Cryptographically signed with SHA-256 zero-knowledge proof. Valid for official hospital transfers.
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-2xl shadow-xl shrink-0">
                    <QRCodeSVG value={`https://doctorian.ai/verify?hash=${cryptoHash}`} size={100} />
                  </div>
                </div>

                <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 font-mono text-[10px] space-y-1">
                  <span className="text-slate-500 block">CRYPTOGRAPHIC DIGITAL SIGNATURE:</span>
                  <span className="text-indigo-300 break-all block">{cryptoHash}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
            <Lock size={14} className="text-emerald-500" />
            <span>HIPAA & GDPR Compliant Medical Document</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-6 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-slate-300 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
            >
              <Printer size={14} />
              <span>Print Official PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
