import React, { useState } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { EPharmacyAndMedics } from './components/EPharmacyAndMedics';
import { SensorHardwareModal, VitalsData } from './components/SensorHardwareModal';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  X,
  Stethoscope,
  ShieldCheck,
  Bell,
  Settings,
  FolderHeart,
  FileText
} from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<NavTab>('pharmacy');
  const [isSensorModalOpen, setIsSensorModalOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Real-time sensor vitals state
  const [vitals, setVitals] = useState<VitalsData>({
    heartRate: 74,
    spo2: 98,
    bpSystolic: 120,
    bpDiastolic: 80,
    temperature: 36.8,
    respiratoryRate: 16,
    leadII: [0, 0.1, 0.2, -0.2, 1.4, -0.3, 0.4, 0],
    timestamp: Date.now(),
    source: 'Mindray ICU Bedside Telemetry (Mulago)',
    isStreaming: true
  });

  const addToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = 'toast-' + Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans">
      {/* Left Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        cartCount={2}
        reminderCount={1}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        {currentView === 'home' && (
          <Dashboard
            onOpenSensorModal={() => setIsSensorModalOpen(true)}
            vitals={vitals}
            onNavigateTab={setCurrentView}
            addToast={addToast}
          />
        )}

        {(currentView === 'pharmacy' || currentView === 'meds') && (
          <EPharmacyAndMedics
            onNavigate={setCurrentView}
            addToast={addToast}
          />
        )}

        {currentView === 'prescriptions' && (
          <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  Prescriptions &amp; Digital Dispensary
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Manage patient prescriptions, refill authorizations, and Uganda National Formulary interactions.
                </p>
              </div>
              <button
                onClick={() => setCurrentView('pharmacy')}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
              >
                Go to E-Pharmacy Catalog
              </button>
            </div>
            <Dashboard
              onOpenSensorModal={() => setIsSensorModalOpen(true)}
              vitals={vitals}
              onNavigateTab={setCurrentView}
              addToast={addToast}
            />
          </div>
        )}

        {currentView === 'consult' && (
          <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <Stethoscope className="w-6 h-6 text-emerald-600" />
                  Telemedicine Consultation Suite
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Direct virtual consultation with Uganda registered Medical Officers and Specialists.
                </p>
              </div>
              <button
                onClick={() => setCurrentView('home')}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Back to Outpatient Clinic
              </button>
            </div>
            <EPharmacyAndMedics
              onNavigate={setCurrentView}
              addToast={addToast}
            />
          </div>
        )}

        {currentView === 'records' && (
          <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <FolderHeart className="w-6 h-6 text-blue-600" />
                  Health Records &amp; Clinical Archive
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Centralized electronic medical records (EMR), lab reports, and radiological attachments.
                </p>
              </div>
              <button
                onClick={() => setCurrentView('home')}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
              >
                Open Patient EHR
              </button>
            </div>
            <Dashboard
              onOpenSensorModal={() => setIsSensorModalOpen(true)}
              vitals={vitals}
              onNavigateTab={setCurrentView}
              addToast={addToast}
            />
          </div>
        )}

        {currentView === 'reminders' && (
          <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <Bell className="w-6 h-6 text-amber-500" />
                  Medication Adherence &amp; Clinic Reminders
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Automated dosage SMS/WhatsApp alerts for tuberculosis, HIV/ART, hypertension, and malaria regimens.
                </p>
              </div>
              <button
                onClick={() => setCurrentView('pharmacy')}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
              >
                View Pharmacy Reminders
              </button>
            </div>
            <EPharmacyAndMedics
              onNavigate={setCurrentView}
              addToast={addToast}
            />
          </div>
        )}

        {currentView === 'settings' && (
          <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <Settings className="w-6 h-6 text-slate-700" />
                Clinic &amp; System Settings
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Hospital profile, hardware baud rate, and Uganda Ministry of Health data synchronization.
              </p>

              <div className="mt-6 space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Hospital Facility</h4>
                    <p className="text-xs text-slate-500">Mulago National Referral Hospital (Kampala, Uganda)</p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                    Connected
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Hardware Telemetry Engine</h4>
                    <p className="text-xs text-slate-500">Web Serial + BLE + Mindray ICU Protocol Bridge</p>
                  </div>
                  <button
                    onClick={() => setIsSensorModalOpen(true)}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold"
                  >
                    Configure
                  </button>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Clinical Guidelines Standard</h4>
                    <p className="text-xs text-slate-500">Uganda Clinical Guidelines (UCG 2023) + WHO ACT Regimens</p>
                  </div>
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sensor & Machine Hardware Modal */}
      <SensorHardwareModal
        isOpen={isSensorModalOpen}
        onClose={() => setIsSensorModalOpen(false)}
        onVitalsUpdate={setVitals}
        currentVitals={vitals}
      />

      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => {
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto p-3.5 rounded-2xl shadow-xl border flex items-start gap-3 backdrop-blur-md animate-in slide-in-from-bottom-5 duration-200 ${
                toast.type === 'success'
                  ? 'bg-emerald-950/90 text-white border-emerald-500/40'
                  : toast.type === 'warning'
                  ? 'bg-amber-950/90 text-white border-amber-500/40'
                  : toast.type === 'error'
                  ? 'bg-rose-950/90 text-white border-rose-500/40'
                  : 'bg-slate-900/90 text-white border-blue-500/40'
              }`}
            >
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
              {toast.type === 'error' && <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />}

              <div className="flex-1 text-xs font-medium leading-relaxed">
                {toast.message}
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-white/60 hover:text-white shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default App;
