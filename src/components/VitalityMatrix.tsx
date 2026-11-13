import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Heart,
  Thermometer,
  Droplet,
  Wind,
  Scale,
  Plus,
  Sparkles,
  RefreshCw,
  ShieldAlert,
  X,
  MessageSquare
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { useArduinoContext } from '../ArduinoContext';
import { api, User as UserType } from '../api';
import { sendChatMessage } from '../services/aiService';
import { MedicalDisclaimer } from './common/MedicalDisclaimer';

interface VitalityMatrixProps {
  onNavigate?: (view: string) => void;
  user?: UserType | null;
  addToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

type ClinicalProfile = 'Adult' | 'Pediatric' | 'Pregnancy' | 'Elderly';
type GlucoseUnit = 'mg/dL' | 'mmol/L';

const PROFILE_RANGES: Record<
  ClinicalProfile,
  {
    hr: [number, number];
    sys: [number, number];
    dia: [number, number];
    temp: [number, number];
    spo2Min: number;
    rr: [number, number];
    glucoseMgDl: [number, number];
  }
> = {
  Adult: { hr: [60, 100], sys: [90, 129], dia: [60, 84], temp: [36.1, 37.4], spo2Min: 95, rr: [12, 20], glucoseMgDl: [70, 125] },
  Pediatric: { hr: [75, 130], sys: [80, 115], dia: [50, 75], temp: [36.3, 37.5], spo2Min: 95, rr: [18, 30], glucoseMgDl: [65, 115] },
  Pregnancy: { hr: [65, 110], sys: [90, 135], dia: [60, 85], temp: [36.2, 37.5], spo2Min: 95, rr: [14, 22], glucoseMgDl: [65, 105] },
  Elderly: { hr: [55, 95], sys: [95, 139], dia: [60, 89], temp: [35.8, 37.2], spo2Min: 94, rr: [12, 22], glucoseMgDl: [75, 130] }
};

export const VitalityMatrix: React.FC<VitalityMatrixProps> = ({ user, addToast }) => {
  const arduino = useArduinoContext();
  const hardwareVitals = arduino?.isConnected ? arduino.vitals : null;

  const role = (user?.role || 'guest').toLowerCase();
  const isGuest = !user || role === 'guest';
  const isClinician = ['doctor', 'nurse', 'admin'].includes(role);

  const [profile, setProfile] = useState<ClinicalProfile>('Adult');
  const [glucoseUnit, setGlucoseUnit] = useState<GlucoseUnit>('mmol/L');
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('pat-101');
  const [readings, setReadings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Record Vitals Modal
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [savingVitals, setSavingVitals] = useState(false);
  const [vitalsForm, setVitalsForm] = useState({
    hr: '76',
    systolicBp: '120',
    diastolicBp: '78',
    tempC: '36.7',
    spo2: '98',
    respRate: '16',
    glucoseMgDl: '96',
    weightKg: '68',
    heightCm: '172',
    sourceType: 'Manual Entry' as 'Hardware Sensor' | 'Manual Entry' | 'Imported EHR',
    notes: ''
  });

  // Clinical Vitals AI Guidance Modal
  const [showAdviceModal, setShowAdviceModal] = useState(false);
  const [adviceQuestion, setAdviceQuestion] = useState('');
  const [adviceResponse, setAdviceResponse] = useState('');
  const [askingAi, setAskingAi] = useState(false);

  useEffect(() => {
    const loadVitals = async () => {
      setLoading(true);
      try {
        if (isClinician && !isGuest) {
          const pts = await api.clinical.listPatients();
          setPatients(pts);
        }
        const res = await api.clinical.listVitals(isClinician && !isGuest ? selectedPatientId : undefined);
        setReadings(res.readings || []);
      } catch (err) {
        console.warn('[VitalityMatrix] Error loading vitals:', err);
      } finally {
        setLoading(false);
      }
    };
    loadVitals();
  }, [isGuest, isClinician, selectedPatientId]);

  const latestReading = readings[0] || null;
  const activeVitals = useMemo(() => {
    if (hardwareVitals) {
      return {
        hr: hardwareVitals.heartRate,
        systolicBp: hardwareVitals.systolicBP,
        diastolicBp: hardwareVitals.diastolicBP,
        tempC: hardwareVitals.temperature,
        spo2: hardwareVitals.spo2,
        respRate: latestReading?.respRate ?? 16,
        glucoseMgDl: latestReading?.glucoseMgDl ?? 96,
        weightKg: latestReading?.weightKg ?? 68,
        bmi: latestReading?.bmi ?? 22.9,
        sourceType: 'Hardware Sensor',
        createdAt: new Date().toISOString()
      };
    }
    if (latestReading) {
      return latestReading;
    }
    return {
      hr: 76,
      systolicBp: 120,
      diastolicBp: 78,
      tempC: 36.7,
      spo2: 98,
      respRate: 16,
      glucoseMgDl: 96,
      weightKg: 68,
      bmi: 22.9,
      sourceType: isGuest ? 'Simulated Demo' : 'Manual Entry',
      createdAt: new Date().toISOString()
    };
  }, [hardwareVitals, latestReading, isGuest]);

  const bands = PROFILE_RANGES[profile];

  const getStatusBadge = (ok: boolean, critical = false) => {
    if (critical) {
      return (
        <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[11px] font-semibold">
          Critical
        </span>
      );
    }
    return ok ? (
      <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold">
        Normal
      </span>
    ) : (
      <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[11px] font-semibold">
        Attention
      </span>
    );
  };

  const chartData = useMemo(() => {
    const ordered = [...readings].slice(0, 12).reverse();
    return ordered.map((r, idx) => ({
      label: r.createdAt ? new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : `R${idx + 1}`,
      HR: r.hr ?? null,
      SpO2: r.spo2 ?? null,
      RR: r.respRate ?? null,
      SysBP: r.systolicBp ?? null
    }));
  }, [readings]);

  const handleRecordVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) {
      addToast?.('Sign in to save clinical vital signs to a patient chart.', 'info');
      return;
    }
    setSavingVitals(true);
    try {
      const saved = await api.clinical.recordVitals({
        patientId: isClinician ? selectedPatientId : 'pat-101',
        hr: Number(vitalsForm.hr),
        systolicBp: Number(vitalsForm.systolicBp),
        diastolicBp: Number(vitalsForm.diastolicBp),
        tempC: Number(vitalsForm.tempC),
        spo2: Number(vitalsForm.spo2),
        respRate: Number(vitalsForm.respRate),
        glucoseMgDl: Number(vitalsForm.glucoseMgDl),
        weightKg: Number(vitalsForm.weightKg),
        heightCm: Number(vitalsForm.heightCm),
        sourceType: hardwareVitals ? 'Hardware Sensor' : vitalsForm.sourceType,
        notes: vitalsForm.notes
      });
      setReadings((prev) => [saved, ...prev]);
      setShowRecordModal(false);
      addToast?.('Vital signs saved with source audit metadata.', 'success');
    } catch (err: any) {
      addToast?.(err?.message || 'Unable to record vital signs.', 'error');
    } finally {
      setSavingVitals(false);
    }
  };

  const handleAskAdvice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adviceQuestion.trim()) return;
    setAskingAi(true);
    try {
      const contextSummary = `Patient profile: ${profile}. Latest vitals (${activeVitals.sourceType}): HR ${activeVitals.hr} bpm, BP ${activeVitals.systolicBp}/${activeVitals.diastolicBp} mmHg, Temp ${activeVitals.tempC} °C, SpO2 ${activeVitals.spo2}%, RR ${activeVitals.respRate}/min, Glucose ${activeVitals.glucoseMgDl} mg/dL. Question: ${adviceQuestion}`;
      const res = await sendChatMessage(
        [{ id: 'vit-q', role: 'user', text: contextSummary, timestamp: new Date().toISOString() }],
        { userRole: role, specialty: 'General Medicine', patientVitals: activeVitals }
      );
      setAdviceResponse(res.text);
    } catch (err: any) {
      setAdviceResponse(err?.message || 'Unable to generate clinical guidance right now.');
    } finally {
      setAskingAi(false);
    }
  };

  const displayedGlucose =
    activeVitals.glucoseMgDl != null
      ? glucoseUnit === 'mmol/L'
        ? (Number(activeVitals.glucoseMgDl) / 18).toFixed(1)
        : String(Math.round(Number(activeVitals.glucoseMgDl)))
      : '--';

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <Activity size={22} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Vital Signs &amp; Physiological Monitoring
              </h1>
              <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Source: {activeVitals.sourceType || 'Manual Entry'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Track cardiovascular, respiratory, metabolic, and anthropometric measurements against clinical reference bands.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isClinician && patients.length > 0 && (
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.id})
                </option>
              ))}
            </select>
          )}

          <select
            value={profile}
            onChange={(e) => setProfile(e.target.value as ClinicalProfile)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
            aria-label="Clinical reference range profile"
          >
            <option value="Adult">Range: Adult</option>
            <option value="Pediatric">Range: Pediatric</option>
            <option value="Pregnancy">Range: Pregnancy / Maternal</option>
            <option value="Elderly">Range: Elderly (65+)</option>
          </select>

          <button
            type="button"
            onClick={() => setShowAdviceModal(true)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles size={14} className="text-teal-600" />
            <span>AI Vitals Interpretation</span>
          </button>

          {!isGuest && (
            <button
              type="button"
              onClick={() => setShowRecordModal(true)}
              className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Record Vitals</span>
            </button>
          )}
        </div>
      </div>

      {isGuest && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
          <ShieldAlert size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Guest Demonstration Mode — Simulated Vitals</span>
            <span>
              Displaying sample vital measurements labeled Simulated Demo. Sign in to record and monitor real patient measurements.
            </span>
          </div>
        </div>
      )}

      {/* 7-Parameter Clinical KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Heart Rate */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Heart size={15} className="text-rose-600" /> Heart Rate
            </span>
            {getStatusBadge(
              activeVitals.hr >= bands.hr[0] && activeVitals.hr <= bands.hr[1],
              activeVitals.hr > 130 || activeVitals.hr < 45
            )}
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tabular-nums text-slate-900 dark:text-white">{activeVitals.hr ?? '--'}</span>
            <span className="text-xs text-slate-500">bpm</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {profile} target: {bands.hr[0]}–{bands.hr[1]} bpm
          </p>
        </div>

        {/* Blood Pressure */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Activity size={15} className="text-sky-600" /> Blood Pressure
            </span>
            {getStatusBadge(
              activeVitals.systolicBp <= bands.sys[1] && activeVitals.diastolicBp <= bands.dia[1],
              activeVitals.systolicBp >= 160 || activeVitals.diastolicBp >= 100
            )}
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tabular-nums text-slate-900 dark:text-white">
              {activeVitals.systolicBp ?? '--'}/{activeVitals.diastolicBp ?? '--'}
            </span>
            <span className="text-xs text-slate-500">mmHg</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Target: &lt; {bands.sys[1]}/{bands.dia[1]} mmHg
          </p>
        </div>

        {/* Temperature */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Thermometer size={15} className="text-amber-600" /> Temperature
            </span>
            {getStatusBadge(
              activeVitals.tempC >= bands.temp[0] && activeVitals.tempC <= bands.temp[1],
              activeVitals.tempC >= 39.0 || activeVitals.tempC < 35.0
            )}
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tabular-nums text-slate-900 dark:text-white">
              {activeVitals.tempC != null ? Number(activeVitals.tempC).toFixed(1) : '--'}
            </span>
            <span className="text-xs text-slate-500">°C</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Target: {bands.temp[0]}–{bands.temp[1]} °C
          </p>
        </div>

        {/* SpO2 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Droplet size={15} className="text-teal-600" /> Oxygen Saturation (SpO2)
            </span>
            {getStatusBadge(activeVitals.spo2 >= bands.spo2Min, activeVitals.spo2 < 92)}
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tabular-nums text-slate-900 dark:text-white">{activeVitals.spo2 ?? '--'}</span>
            <span className="text-xs text-slate-500">%</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Target: ≥ {bands.spo2Min}% (Seek urgent care if &lt; 92%)
          </p>
        </div>

        {/* Respiratory Rate */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Wind size={15} className="text-cyan-600" /> Respiratory Rate
            </span>
            {getStatusBadge(
              (activeVitals.respRate ?? 16) >= bands.rr[0] && (activeVitals.respRate ?? 16) <= bands.rr[1],
              (activeVitals.respRate ?? 16) >= 28
            )}
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tabular-nums text-slate-900 dark:text-white">{activeVitals.respRate ?? '--'}</span>
            <span className="text-xs text-slate-500">breaths/min</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {profile} target: {bands.rr[0]}–{bands.rr[1]} br/min
          </p>
        </div>

        {/* Blood Glucose */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Droplet size={15} className="text-indigo-600" /> Blood Glucose
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setGlucoseUnit((u) => (u === 'mmol/L' ? 'mg/dL' : 'mmol/L'))}
                className="px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-[10px] font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                {glucoseUnit}
              </button>
              {getStatusBadge(
                (activeVitals.glucoseMgDl ?? 96) >= bands.glucoseMgDl[0] && (activeVitals.glucoseMgDl ?? 96) <= bands.glucoseMgDl[1],
                (activeVitals.glucoseMgDl ?? 96) < 60 || (activeVitals.glucoseMgDl ?? 96) >= 220
              )}
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tabular-nums text-slate-900 dark:text-white">{displayedGlucose}</span>
            <span className="text-xs text-slate-500">{glucoseUnit}</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Fasting target: {glucoseUnit === 'mmol/L' ? '3.9–6.9 mmol/L' : `${bands.glucoseMgDl[0]}–${bands.glucoseMgDl[1]} mg/dL`}
          </p>
        </div>

        {/* Weight & BMI */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2 shadow-xs sm:col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Scale size={15} className="text-emerald-600" /> Weight &amp; Body Mass Index (BMI)
            </span>
            {getStatusBadge((activeVitals.bmi ?? 22.4) >= 18.5 && (activeVitals.bmi ?? 22.4) <= 24.9)}
          </div>
          <div className="flex flex-wrap items-baseline gap-6">
            <div>
              <span className="text-3xl font-bold tabular-nums text-slate-900 dark:text-white">{activeVitals.weightKg ?? '--'}</span>
              <span className="text-xs text-slate-500 ml-1">kg</span>
            </div>
            <div>
              <span className="text-2xl font-bold tabular-nums text-teal-700 dark:text-teal-400">{activeVitals.bmi ?? '--'}</span>
              <span className="text-xs text-slate-500 ml-1">kg/m² BMI</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            WHO adult healthy BMI reference band: 18.5–24.9 kg/m²
          </p>
        </div>
      </div>

      {/* Recharts Trend Visualization & History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Multi-Parameter Trend</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Chronological heart rate, systolic BP, SpO2, and respiratory rate</p>
            </div>
            {loading && <RefreshCw size={15} className="animate-spin text-slate-400" />}
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="HR" stroke="#0284c7" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="SysBP" stroke="#0d9488" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="SpO2" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="RR" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recorded Vitals Audit Ledger */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Measurements Log</h2>
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {readings.length === 0 ? (
              <p className="text-xs text-slate-500">No measurements recorded yet.</p>
            ) : (
              readings.map((r) => (
                <div
                  key={r.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold text-[11px] text-slate-700 dark:text-slate-300">
                      {r.sourceType || 'Manual Entry'}
                    </span>
                    <span className="font-mono tabular-nums text-[11px] text-slate-400">
                      {r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}
                    </span>
                  </div>
                  <div className="font-mono tabular-nums text-slate-800 dark:text-slate-200">
                    HR {r.hr ?? '--'} • BP {r.systolicBp ?? '--'}/{r.diastolicBp ?? '--'} • Temp {r.tempC ?? '--'}°C • SpO2 {r.spo2 ?? '--'}% • RR {r.respRate ?? '--'}
                  </div>
                  {r.recordedBy && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Recorded by: {r.recordedBy}{r.notes ? ` — ${r.notes}` : ''}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <MedicalDisclaimer variant="compact" />

      {/* Record Vitals Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Record Vital Signs</h3>
              <button type="button" onClick={() => setShowRecordModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleRecordVitals} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Heart Rate (bpm)</label>
                  <input type="number" value={vitalsForm.hr} onChange={(e) => setVitalsForm({ ...vitalsForm, hr: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" required />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Systolic BP</label>
                  <input type="number" value={vitalsForm.systolicBp} onChange={(e) => setVitalsForm({ ...vitalsForm, systolicBp: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" required />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Diastolic BP</label>
                  <input type="number" value={vitalsForm.diastolicBp} onChange={(e) => setVitalsForm({ ...vitalsForm, diastolicBp: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" required />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Temp (°C)</label>
                  <input type="number" step="0.1" value={vitalsForm.tempC} onChange={(e) => setVitalsForm({ ...vitalsForm, tempC: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" required />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">SpO2 (%)</label>
                  <input type="number" value={vitalsForm.spo2} onChange={(e) => setVitalsForm({ ...vitalsForm, spo2: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" required />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Resp Rate (/min)</label>
                  <input type="number" value={vitalsForm.respRate} onChange={(e) => setVitalsForm({ ...vitalsForm, respRate: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" required />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Glucose (mg/dL)</label>
                  <input type="number" value={vitalsForm.glucoseMgDl} onChange={(e) => setVitalsForm({ ...vitalsForm, glucoseMgDl: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Weight (kg)</label>
                  <input type="number" step="0.1" value={vitalsForm.weightKg} onChange={(e) => setVitalsForm({ ...vitalsForm, weightKg: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Height (cm)</label>
                  <input type="number" value={vitalsForm.heightCm} onChange={(e) => setVitalsForm({ ...vitalsForm, heightCm: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Measurement Data Source</label>
                <select
                  value={vitalsForm.sourceType}
                  onChange={(e) => setVitalsForm({ ...vitalsForm, sourceType: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <option value="Manual Entry">Manual Entry (Cuff / Thermometer / Oximeter)</option>
                  <option value="Hardware Sensor">Hardware Sensor</option>
                  <option value="Imported EHR">Imported EHR</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Clinical Notes</label>
                <input
                  type="text"
                  value={vitalsForm.notes}
                  onChange={(e) => setVitalsForm({ ...vitalsForm, notes: e.target.value })}
                  placeholder="Optional observation (e.g., seated at rest 5 min)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <button
                type="submit"
                disabled={savingVitals}
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold cursor-pointer disabled:opacity-50"
              >
                {savingVitals ? 'Saving...' : 'Save Measurements'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* AI Vitals Guidance Modal */}
      {showAdviceModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <MessageSquare size={18} className="text-teal-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Clinical Vitals Decision Support</h3>
              </div>
              <button type="button" onClick={() => setShowAdviceModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAskAdvice} className="space-y-3 text-xs">
              <textarea
                rows={3}
                value={adviceQuestion}
                onChange={(e) => setAdviceQuestion(e.target.value)}
                placeholder="Ask about these vital trends (e.g., Should I recheck BP later today, or what warning signs require clinic review?)"
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 resize-none text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={askingAi || !adviceQuestion.trim()}
                className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold cursor-pointer disabled:opacity-50"
              >
                {askingAi ? 'Reviewing Guidelines...' : 'Request Structured Clinical Guidance'}
              </button>
            </form>
            {adviceResponse && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs leading-relaxed whitespace-pre-wrap text-slate-800 dark:text-slate-200">
                  {adviceResponse}
                </div>
                <MedicalDisclaimer variant="compact" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VitalityMatrix;
