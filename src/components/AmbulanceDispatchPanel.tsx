import React, { useState, useEffect } from 'react';
import { 
  Truck, Navigation, User, MapPin, Clock, HeartPulse, Activity, 
  ShieldAlert, Wrench, Plus, Trash2, CheckCircle2, Sliders, 
  Smartphone, AlertTriangle, RefreshCw, Send, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../api';

interface AmbulanceDispatchPanelProps {
  selectedPatientId?: string;
  selectedPatientName?: string;
  addToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const AmbulanceDispatchPanel: React.FC<AmbulanceDispatchPanelProps> = ({
  selectedPatientId = 'patient-joseph',
  selectedPatientName = 'Joseph Brian Obote',
  addToast
}) => {
  const [dispatches, setDispatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAutoDispatchEnabled, setIsAutoDispatchEnabled] = useState<boolean>(() => {
    const stored = localStorage.getItem('ambulance_auto_dispatch_enabled');
    return stored === null ? true : stored === 'true';
  });

  // Manual Dispatch Form States
  const [formPatientName, setFormPatientName] = useState<string>(selectedPatientName);
  const [formSeverity, setFormSeverity] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [formAmbulanceUnit, setFormAmbulanceUnit] = useState<string>('Kampala Cardiac Rescue #09');
  const [formParamedics, setFormParamedics] = useState<string>('Senior Paramedic Joseph Akora, EMT Gloria');
  const [formHospital, setFormHospital] = useState<string>('Mulago National Referral Hospital');
  const [formEquipment, setFormEquipment] = useState<string>('Ventilator Active, AED Charged, 15L O2 Tank Full');
  const [formEta, setFormEta] = useState<number>(10);
  const [formDistance, setFormDistance] = useState<number>(4.2);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Load dispatches
  const loadDispatches = async () => {
    setIsLoading(true);
    try {
      const data = await api.alerts.getAmbulanceDispatches();
      setDispatches(data || []);
    } catch (err) {
      console.error("Failed to load dispatches:", err);
      if (addToast) addToast("Failed to sync dispatch center with server.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDispatches();
    const interval = setInterval(loadDispatches, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleAutoDispatch = (val: boolean) => {
    setIsAutoDispatchEnabled(val);
    localStorage.setItem('ambulance_auto_dispatch_enabled', String(val));
    if (addToast) {
      addToast(
        val 
          ? "Ambulance Auto-Dispatch integrated with Alarming System." 
          : "Auto-Dispatch disabled. Only manual dispatch overrides will route.",
        "info"
      );
    }
  };

  const handleManualDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const code = formSeverity === 'HIGH' ? 'CODE_RED_CARDIAC' : formSeverity === 'MEDIUM' ? 'CODE_YELLOW_TRAUMA' : 'CODE_GREEN_TRANSFER';
      await api.alerts.createAmbulanceDispatch({
        patientId: selectedPatientId,
        patientName: formPatientName,
        vitalAlertSource: "Manual Dispatch Override",
        severity: formSeverity,
        dispatchCode: code,
        ambulanceUnit: formAmbulanceUnit,
        paramedicTeam: formParamedics,
        destinationHospital: formHospital,
        status: 'DISPATCHED',
        equipmentStatus: formEquipment,
        etaMinutes: formEta,
        distanceKm: formDistance
      });
      if (addToast) addToast(`Ambulance unit successfully dispatched for ${formPatientName}!`, "success");
      await loadDispatches();
    } catch (err) {
      console.error("Manual dispatch failed:", err);
      if (addToast) addToast("Failed to issue manual ambulance dispatch.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    let nextStatus = 'PENDING_TRIAGE';
    let nextEta = undefined;

    switch (currentStatus) {
      case 'PENDING_TRIAGE':
        nextStatus = 'DISPATCHED';
        break;
      case 'DISPATCHED':
        nextStatus = 'EN_ROUTE';
        break;
      case 'EN_ROUTE':
        nextStatus = 'PATIENT_LOCATED';
        break;
      case 'PATIENT_LOCATED':
        nextStatus = 'ARRIVED_AT_HOSPITAL';
        nextEta = 0;
        break;
      default:
        nextStatus = 'ARRIVED_AT_HOSPITAL';
        break;
    }

    try {
      await api.alerts.updateAmbulanceDispatchStatus(id, nextStatus, nextEta);
      if (addToast) addToast(`Ambulance dispatch status updated to: ${nextStatus.replace(/_/g, ' ')}`, "success");
      await loadDispatches();
    } catch (err) {
      console.error("Failed to update status:", err);
      if (addToast) addToast("Failed to update ambulance status.", "error");
    }
  };

  const handleCancelDispatch = async (id: string) => {
    try {
      await api.alerts.cancelAmbulanceDispatch(id);
      if (addToast) addToast("Ambulance dispatch archived successfully.", "info");
      await loadDispatches();
    } catch (err) {
      console.error("Failed to cancel dispatch:", err);
      if (addToast) addToast("Failed to archive ambulance dispatch.", "error");
    }
  };

  return (
    <div className="space-y-8 text-slate-900 dark:text-slate-100 animate-fade-in">
      
      {/* Configuration Header Row */}
      <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-lg relative shrink-0">
            <Truck size={24} className="animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-950" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Ambulance Dispatch Control</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">MOH Emergency Response Interface</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Link Status */}
          <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-xl">
            <div className={`w-2.5 h-2.5 rounded-full ${isAutoDispatchEnabled ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
            <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">
              Alarm Link: {isAutoDispatchEnabled ? "ACTIVE (AUTO)" : "MANUAL BYPASS"}
            </span>
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Auto-Dispatch on Alarms</span>
            <button
              onClick={() => handleToggleAutoDispatch(!isAutoDispatchEnabled)}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer outline-none ${isAutoDispatchEnabled ? 'bg-red-600' : 'bg-slate-300 dark:bg-slate-700'}`}
            >
              <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${isAutoDispatchEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Dispatches Timeline */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 sm:p-10 border border-slate-100 dark:border-slate-800 shadow-xl min-h-[500px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-sm font-black uppercase tracking-wider text-slate-400">
                  Live Dispatch Ledger ({dispatches.length})
                </h4>
                <button 
                  onClick={loadDispatches}
                  disabled={isLoading}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800"
                >
                  <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                </button>
              </div>

              <div className="space-y-6">
                {dispatches.length === 0 ? (
                  <div className="text-center py-20 text-slate-300 dark:text-slate-700">
                    <Truck className="mx-auto mb-4 opacity-50" size={48} />
                    <p className="text-sm font-black uppercase">No Emergency Dispatches Active</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">Critical vital deviations will trigger automated dispatch protocols instantly.</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {dispatches.map((dispatch, mapIdx_210) => {
                      const isHigh = dispatch.severity === 'HIGH';
                      const isMedium = dispatch.severity === 'MEDIUM';
                      
                      let statusText = dispatch.status.replace(/_/g, ' ');
                      let statusBg = 'bg-slate-100 text-slate-700';
                      if (dispatch.status === 'DISPATCHED') statusBg = 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400';
                      if (dispatch.status === 'EN_ROUTE') statusBg = 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400';
                      if (dispatch.status === 'PATIENT_LOCATED') statusBg = 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400';
                      if (dispatch.status === 'ARRIVED_AT_HOSPITAL') statusBg = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400';

                      return (
                        <motion.div
                          key={dispatch.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className={`rounded-2xl border p-5 transition-all shadow-sm ${
                            isHigh 
                              ? 'bg-red-50/20 dark:bg-red-950/5 border-red-100 dark:border-red-900/30' 
                              : isMedium
                              ? 'bg-amber-50/20 dark:bg-amber-950/5 border-amber-100 dark:border-amber-900/30'
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] px-2 py-0.5 font-black uppercase rounded-md tracking-wider ${
                                  isHigh 
                                    ? 'bg-red-600 text-white' 
                                    : isMedium 
                                    ? 'bg-amber-500 text-white' 
                                    : 'bg-emerald-600 text-white'
                                }`}>
                                  {dispatch.dispatchCode}
                                </span>
                                <span className="font-mono text-[9px] text-slate-400 font-bold">{dispatch.id}</span>
                              </div>
                              <h5 className="text-sm font-black text-slate-800 dark:text-slate-100">
                                Patient: <span className="text-red-600 dark:text-red-400">{dispatch.patientName}</span>
                              </h5>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] px-2.5 py-1 font-black uppercase rounded-lg tracking-wider ${statusBg}`}>
                                {statusText}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-slate-600 dark:text-slate-300">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Truck size={14} className="text-slate-400 shrink-0" />
                                <span>Unit: <strong className="text-slate-800 dark:text-white">{dispatch.ambulanceUnit}</strong></span>
                              </div>
                              <div className="flex items-center gap-2">
                                <User size={14} className="text-slate-400 shrink-0" />
                                <span>Team: <strong className="text-slate-700 dark:text-slate-200">{dispatch.paramedicTeam}</strong></span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Wrench size={14} className="text-slate-400 shrink-0" />
                                <span>Payload: <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">{dispatch.equipmentStatus}</span></span>
                              </div>
                            </div>

                            <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-3 md:pt-0 md:pl-4">
                              <div className="flex items-center gap-2">
                                <MapPin size={14} className="text-red-500 shrink-0 animate-bounce" />
                                <span className="truncate">Hospital: <strong className="text-slate-800 dark:text-white">{dispatch.destinationHospital}</strong></span>
                              </div>
                              <div className="flex items-center gap-2 font-mono text-[11px]">
                                <Clock size={14} className="text-slate-400 shrink-0" />
                                <span>ETA: <strong className="text-slate-800 dark:text-white">{dispatch.etaMinutes} mins</strong></span>
                                <span className="text-slate-300">|</span>
                                <span>Distance: <strong className="text-slate-800 dark:text-white">{dispatch.distanceKm} km</strong></span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <Activity size={10} className="text-rose-500 shrink-0" />
                                Source: {dispatch.vitalAlertSource}
                              </div>
                            </div>
                          </div>

                          {/* Quick Action Buttons */}
                          <div className="flex justify-between items-center mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="text-[9px] text-slate-400 font-bold uppercase">
                              Registered: {new Date(dispatch.createdAt).toLocaleTimeString()}
                            </div>
                            <div className="flex gap-2">
                              {dispatch.status !== 'ARRIVED_AT_HOSPITAL' && (
                                <button
                                  onClick={() => handleUpdateStatus(dispatch.id, dispatch.status)}
                                  className="px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  <Navigation size={10} />
                                  Advance Status
                                </button>
                              )}
                              <button
                                onClick={() => handleCancelDispatch(dispatch.id)}
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 size={10} />
                                Archive
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>
            </div>

            <div className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-6 border-t border-slate-100 dark:border-slate-800">
              🚨 NATIONAL EMERGENCY DISPATCH RELAY NODE #04-MOH
            </div>
          </div>
        </div>

        {/* Right Column: Manual Dispatch Request / Simulation */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 sm:p-10 border border-slate-100 dark:border-slate-800 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-2xl">
                <ShieldAlert size={24} />
              </div>
              <div>
                <h4 className="text-lg font-black uppercase tracking-tight">Manual Dispatch Override</h4>
                <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Bypass Automated Rules</p>
              </div>
            </div>

            <form onSubmit={handleManualDispatch} className="space-y-4">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Patient Subject</label>
                <input 
                  type="text" 
                  required
                  value={formPatientName}
                  onChange={(e) => setFormPatientName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-bold outline-none text-slate-900 dark:text-white focus:border-red-500"
                  placeholder="Patient Full Name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Severity / Code</label>
                  <select 
                    value={formSeverity} 
                    onChange={(e) => setFormSeverity(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-black outline-none text-slate-900 dark:text-white focus:border-red-500"
                  >
                    <option value="HIGH">CODE RED (Critical)</option>
                    <option value="MEDIUM">CODE YELLOW (Urgent)</option>
                    <option value="LOW">CODE GREEN (Routine)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">ETA Minutes</label>
                  <input 
                    type="number" 
                    required
                    min={1}
                    value={formEta}
                    onChange={(e) => setFormEta(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-bold outline-none text-slate-900 dark:text-white focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Ambulance Provider & Unit</label>
                <select
                  value={formAmbulanceUnit}
                  onChange={(e) => {
                    setFormAmbulanceUnit(e.target.value);
                    if (e.target.value.includes("Cardiac")) {
                      setFormParamedics("Senior Paramedic Joseph Akora, EMT Gloria");
                      setFormEquipment("Ventilator Active, AED Charged, 15L O2 Tank Full");
                    } else if (e.target.value.includes("Red Cross")) {
                      setFormParamedics("EMT Ronald Kaggwa, Responder Susan");
                      setFormEquipment("Spinal Board Seated, Trauma Kit, Oxygen Admin Kit");
                    } else {
                      setFormParamedics("Village Health Team Responder, Boda Pilot");
                      setFormEquipment("Maternal Emergency Voucher, Basic Delivery Kit");
                    }
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-black outline-none text-slate-900 dark:text-white focus:border-red-500"
                >
                  <option value="Kampala Cardiac Rescue #09">Kampala Cardiac Rescue #09</option>
                  <option value="Red Cross Emergency Unit #12">Red Cross Emergency Unit #12</option>
                  <option value="Boda-Boda Obstetric Voucher Unit #45">Boda-Boda Obstetric Voucher Unit #45</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Ambulance Team / EMTs</label>
                <input 
                  type="text" 
                  required
                  value={formParamedics}
                  onChange={(e) => setFormParamedics(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-bold outline-none text-slate-900 dark:text-white focus:border-red-500"
                  placeholder="EMT Names"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Loaded Equipment Payload</label>
                <input 
                  type="text" 
                  required
                  value={formEquipment}
                  onChange={(e) => setFormEquipment(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-bold outline-none text-slate-900 dark:text-white focus:border-red-500"
                  placeholder="Equipment Details"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Destination Hospital Preference</label>
                <input 
                  type="text" 
                  required
                  value={formHospital}
                  onChange={(e) => setFormHospital(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-bold outline-none text-slate-900 dark:text-white focus:border-red-500"
                  placeholder="e.g. Mulago Referral Hospital"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Transit Distance (Km)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    required
                    value={formDistance}
                    onChange={(e) => setFormDistance(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-bold outline-none text-slate-900 dark:text-white focus:border-red-500"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? <RefreshCw className="animate-spin" size={12} /> : <Send size={12} />}
                    Issue Dispatch
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="bg-red-600/5 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 p-6 rounded-2xl space-y-2">
            <h5 className="text-[10px] font-black uppercase text-red-700 dark:text-red-400 tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={14} />
              Professional Response Protocol
            </h5>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-normal">
              This terminal is directly synchronized with the Ministry of Health Emergency Dispatch Network. Triggered dispatches activate secure sat-links to designated responders and feed into the global emergency response roster.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
