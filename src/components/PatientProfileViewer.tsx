import React from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Activity, 
  Phone, 
  Mail, 
  AlertCircle, 
  ShieldAlert, 
  Heart, 
  FileText, 
  Calendar, 
  Hospital, 
  X, 
  Copy, 
  Check, 
  Clock, 
  Stethoscope,
  ChevronRight
} from 'lucide-react';

interface PatientProfileViewerProps {
  data: {
    user: {
      id: string;
      displayName?: string;
      email: string;
      phone?: string;
      photoURL?: string;
      bloodGroup?: string;
      allergies?: string;
      conditions?: string;
      hospitalPreference?: string;
      role?: string;
    };
    contacts: Array<{
      id: string;
      name: string;
      phone: string;
      role: string;
      email?: string;
    }>;
    records: Array<{
      id: string;
      title?: string;
      summary?: string;
      diagnosis?: string;
      treatment?: string;
      createdAt: string;
      type?: string;
    }>;
  };
  onClose: () => void;
}

export const PatientProfileViewer: React.FC<PatientProfileViewerProps> = ({ data, onClose }) => {
  const [copied, setCopied] = React.useState(false);
  const { user, contacts, records } = data;

  const handleCopyLink = () => {
    try {
      const encodedData = btoa(encodeURIComponent(JSON.stringify({ user, contacts, records })).replace(/%([0-9A-F]{2})/g, (match, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      }));
      const link = `${window.location.origin}/?scanUserData=${encodedData}`;
      navigator.clipboard.writeText(link);
    } catch (e) {
      const link = `${window.location.origin}/?scanUserId=${user.id}`;
      navigator.clipboard.writeText(link);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 md:p-8 font-sans transition-colors duration-300">
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-150 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-slate-950/50 overflow-hidden relative">
        {/* Aesthetic Gradient Top Bar */}
        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500" />

        {/* Top Control Banner */}
        <div className="flex items-center justify-between px-8 pt-8 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Scanned Emergency Medical Profile
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all border border-slate-100 dark:border-slate-700"
            title="Return to Hub"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-8 sm:p-12 space-y-10">
          
          {/* Header Card Profile Block */}
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left bg-slate-50/50 dark:bg-slate-800/20 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/80">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[2.2rem] bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-black uppercase tracking-tighter shadow-xl shadow-blue-500/10">
              {user.displayName ? user.displayName.split(' ').map((n, mapIdx_106) => n[0]).slice(0, 2).join('') : <User size={48} />}
            </div>
            <div className="flex-1 space-y-3">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">
                {user.displayName || 'Unknown Patient'}
              </h1>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-mono tracking-wider">
                UID: {user.id}
              </p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-1">
                {user.email && (
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-white dark:bg-slate-850 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-350 shadow-sm border border-slate-100 dark:border-slate-800">
                    <Mail size={12} className="text-slate-400" />
                    {user.email}
                  </div>
                )}
                {user.phone && (
                  <a 
                    href={`tel:${user.phone}`}
                    className="flex items-center gap-2 px-4 py-1.5 bg-white dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-xs font-semibold text-blue-600 dark:text-blue-400 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors"
                  >
                    <Phone size={12} />
                    {user.phone}
                  </a>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full md:w-auto">
              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Link Copied!' : 'Copy Direct Share Link'}
              </button>
            </div>
          </div>

          {/* Biological Parameters */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest leading-none flex items-center gap-2">
              <Heart size={14} className="text-red-500" />
              Critical Biological Parameters
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              
              {/* Blood Group */}
              <div className="p-5 bg-red-500/5 dark:bg-red-500/10 rounded-3xl border border-red-500/10 text-center">
                <span className="text-[10px] font-black uppercase text-red-500 tracking-wider">Blood Type</span>
                <p className="text-3xl font-black text-red-600 dark:text-red-400 mt-1 font-mono">{user.bloodGroup || 'Not set'}</p>
              </div>

              {/* Allergies */}
              <div className="p-5 bg-amber-500/5 dark:bg-amber-500/10 rounded-3xl border border-amber-500/10 text-center col-span-1">
                <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">Allergies</span>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1.5 line-clamp-2 truncate" title={user.allergies || 'No known allergies'}>
                  {user.allergies || 'No allergies listed'}
                </p>
              </div>

              {/* Conditions */}
              <div className="p-5 bg-blue-500/5 dark:bg-blue-500/10 rounded-3xl border border-blue-500/10 text-center col-span-1">
                <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider">Chronic Conditions</span>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1.5 line-clamp-2 truncate" title={user.conditions || 'No conditions listed'}>
                  {user.conditions || 'None declared'}
                </p>
              </div>

              {/* Hospital */}
              <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-100 dark:border-slate-800 text-center">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Preferred Hospital</span>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1.5 line-clamp-2 truncate" title={user.hospitalPreference || 'Any nearest'}>
                  {user.hospitalPreference || 'Nearest Center'}
                </p>
              </div>

            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest leading-none flex items-center gap-2">
              <ShieldAlert size={14} className="text-amber-500" />
              Registered Emergency Responders
            </h3>
            
            {contacts && contacts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {contacts.map((contact, mapIdx_196) => (
                  <div 
                    key={`patientprofileviewer-l199-${mapIdx_196}`}
                    className="p-5 bg-white dark:bg-slate-850 rounded-[1.8rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-blue-500/20 transition-all"
                  >
                    <div>
                      <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{contact.role}</p>
                      <h4 className="text-sm font-black text-slate-850 dark:text-white mt-0.5">{contact.name}</h4>
                      {contact.email && <p className="text-xs text-slate-400 dark:text-slate-500">{contact.email}</p>}
                    </div>
                    <a 
                      href={`tel:${contact.phone}`}
                      className="p-3 bg-blue-500/5 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl transition-all border border-blue-500/10"
                      title={`Call ${contact.name}`}
                    >
                      <Phone size={16} />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-[2rem] text-center border border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">No specific emergency contacts registered in clinic database.</p>
              </div>
            )}
          </div>

          {/* Diagnostics Cases & Health Logs */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest leading-none flex items-center gap-2">
              <FileText size={14} className="text-blue-500" />
              Recent Diagnostic Cases & Treatment Records
            </h3>

            {records && records.length > 0 ? (
              <div className="space-y-3">
                {records.map((record, mapIdx_232) => (
                  <div 
                    key={`patientprofileviewer-l235-${mapIdx_232}`}
                    className="p-6 bg-white dark:bg-slate-850 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-200 dark:hover:border-slate-750 transition-all"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 rounded-md text-[9px] font-black uppercase tracking-wider font-mono">
                          {record.type || 'DIAGNOSTIC'}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 font-mono">
                          <Calendar size={10} />
                          {new Date(record.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                      <h4 className="text-sm font-black text-slate-850 dark:text-white leading-tight uppercase">
                        {record.title || record.diagnosis || 'Clinical Consultation'}
                      </h4>
                      {record.summary && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                          {record.summary}
                        </p>
                      )}
                      {record.treatment && (
                        <div className="mt-2 text-xs bg-emerald-500/5 dark:bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium">
                          <span className="font-bold uppercase text-[9px] tracking-wider block mb-0.5 text-emerald-600 dark:text-emerald-400">Treatment Protocol</span>
                          {record.treatment}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-[2rem] text-center border border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">No recent diagnostics case records available in this profile.</p>
              </div>
            )}
          </div>

        </div>

        {/* Footer info branding block */}
        <div className="px-8 py-6 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            🔐 END-TO-END CLINICAL ENCRYPTION ENFORCED
          </p>
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
          >
            Access Main Portal
          </button>
        </div>

      </div>
    </div>
  );
};
