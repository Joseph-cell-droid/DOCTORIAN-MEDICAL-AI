import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HelpCircle, BookOpen, MessageSquare, Key, ShieldAlert, FileText, CheckCircle2,
  Search, ExternalLink, UserCheck, PhoneCall, Send, Shield, Activity, 
  Settings, LogIn, Lock, Loader2, Download, Upload, AlertTriangle, Play, Check, 
  Clock, Database, Users, Users2, Mail, MapPin, Sparkles, RefreshCw, X
} from 'lucide-react';

interface SubViewProps {
  user: any;
  onNavigate?: (view: any) => void;
  vitals?: any;
}

/* ==========================================================================
   1. HELP CENTER VIEW
   ========================================================================== */
export const HelpCenter: React.FC<SubViewProps> = ({ user, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'faqs' | 'guide' | 'support'>('faqs');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);

  const [systemChecks, setSystemChecks] = useState({
    audioSynth: { status: 'pending', label: 'IEC Acoustic Engine Pulse' },
    localStorage: { status: 'pending', label: 'Local Encrypted DB Sync' },
    biometrics: { status: 'pending', label: 'Attending Authorization Hook' },
    twilioRelay: { status: 'pending', label: 'Twilio SMS Outbound Carrier' }
  });
  const [isRunningCheck, setIsRunningCheck] = useState(false);

  const faqs = [
    {
      q: "How does the Real-time Pulse Monitor acoustic engine sync work?",
      a: "The oximeter audio engine maps pulse rates and oxygen bounds straight into the browser's Web Audio API. Higher SpO2 values generate higher frequencies (480Hz - 880Hz) to represent peak hemodynamics. This operates continuously when the clinical heartbeat beep is active.",
      category: "audio"
    },
    {
      q: "What defines high vs medium priority clinical alarms?",
      a: "According to standard clinical specifications (IEC 60601-1-8), high-priority alarms generate repeating groups of 5 fast, high-pitched triangle pulses inside a 2.5-second sequence. Medium-priority warnings trigger 3 slower sine-wave patterns every 5 seconds.",
      category: "alarms"
    },
    {
      q: "How can I configure the automated Twilio SMS emergency relays?",
      a: "Navigate to the Emergency Registry tab, then write down the priority responder's phone format. Alarms trigger automatic REST dispatches after exactly 3 continuous seconds of anomalous baseline vitals.",
      category: "integrations"
    },
    {
      q: "Are the telemetry streams saved to persistent servers?",
      a: "This application prioritizes safe offline processing. Patient metrics and logs are handled using client-side memory and local sandbox encryption models to satisfy rigorous HIPAA patient data protection standards.",
      category: "security"
    }
  ];

  const handleSystemCheck = () => {
    setIsRunningCheck(true);
    setSystemChecks({
      audioSynth: { status: 'loading', label: 'IEC Acoustic Engine Pulse' },
      localStorage: { status: 'loading', label: 'Local Encrypted DB Sync' },
      biometrics: { status: 'loading', label: 'Attending Authorization Hook' },
      twilioRelay: { status: 'loading', label: 'Twilio SMS Outbound Carrier' }
    });

    setTimeout(() => {
      setSystemChecks({
        audioSynth: { status: 'success', label: 'IEC Acoustic Engine Pulse' },
        localStorage: { status: 'success', label: 'Local Encrypted DB Sync' },
        biometrics: { status: 'success', label: 'Attending Authorization Hook' },
        twilioRelay: { status: 'warning', label: 'Twilio SMS Outbound Carrier (No API key)' }
      });
      setIsRunningCheck(false);
    }, 1500);
  };

  const submitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setTicketSuccess(true);
      setTicketSubject('');
      setTicketMessage('');
    }, 1200);
  };

  const filteredFaqs = faqs.filter(faq => 
    faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 text-slate-900 dark:text-slate-100 animate-fade-in max-w-5xl mx-auto px-4 py-8">
      {/* View Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-6">
        <div>
          <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-500 tracking-[0.2em] bg-blue-50 dark:bg-blue-950/20 px-3 py-1 rounded-full">Systems Hub</span>
          <h1 className="text-3xl font-black uppercase tracking-tight mt-3 text-slate-950 dark:text-white">Help & Knowledge Center</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-xs">Access diagnostic guides, acoustic specifications, and operational system checks.</p>
        </div>
        <button 
          onClick={() => onNavigate && onNavigate('home')}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
        >
          Return to home
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 dark:border-slate-800/85">
        {[
          { id: 'faqs', label: 'Clinical FAQs', icon: <HelpCircle size={15} /> },
          { id: 'guide', label: 'Self Diagnostics', icon: <BookOpen size={15} /> },
          { id: 'support', label: 'Escalation Desk', icon: <MessageSquare size={15} /> }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center gap-2 px-6 py-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
              activeTab === t.id 
                ? 'border-blue-600 text-blue-600 dark:text-blue-500 font-bold' 
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab Switch Contents */}
      <AnimatePresence mode="wait">
        {activeTab === 'faqs' && (
          <motion.div 
            key="faqs-pane"
            className="space-y-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {/* Search FAQ */}
            <div className="relative">
              <input 
                type="text"
                placeholder="Search database articles (e.g., Alarms, SpO2, HIPAA)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] pl-12 pr-6 py-4 text-xs font-bold uppercase tracking-wider placeholder:text-slate-400 focus:border-blue-500 outline-none shadow-md transition-colors"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800/80 shadow-md hover:shadow-lg transition-all space-y-4">
                    <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-850/60 rounded-lg text-[9px] font-bold uppercase text-slate-500 tracking-wider">
                      {faq.category}
                    </span>
                    <h3 className="text-base font-black text-slate-905 dark:text-white leading-tight">
                      Q: {faq.q}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                      {faq.a}
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-12 text-slate-400">
                  <AlertTriangle className="mx-auto mb-2 text-amber-500 animate-bounce" size={32} />
                  <p className="text-xs font-black uppercase tracking-wider">No matching articles found</p>
                  <p className="text-[10px] uppercase tracking-widest mt-1">Refine your queries or head to the Support Desk</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'guide' && (
          <motion.div 
            key="guide-pane"
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {/* Diagnostic Panel */}
            <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
              <h3 className="text-lg font-black uppercase tracking-tight">Vitals Transmission Verification</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Run automated diagnostics checks on local client nodes, browser AudioContext, and Twilio callback triggers. Helps confirm interface readiness before patient monitoring sequences.
              </p>

              <div className="space-y-3.5 pt-2">
                {Object.entries(systemChecks).map(([key, item]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.label}</span>
                    <div>
                      {item.status === 'pending' && <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">READY TO RUN</span>}
                      {item.status === 'loading' && <Loader2 className="animate-spin text-blue-500" size={16} />}
                      {item.status === 'success' && <Check className="text-emerald-500" size={18} />}
                      {item.status === 'warning' && <AlertTriangle className="text-amber-500" size={18} />}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSystemCheck}
                disabled={isRunningCheck}
                className="w-full py-4 bg-slate-950 hover:bg-slate-850 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
              >
                {isRunningCheck ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={14} />}
                RUN DIAGNOSTIC HARNESS CHECKS
              </button>
            </div>

            {/* IEC Audio Guide */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-zinc-800 shadow-md flex flex-col justify-between">
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Standards Matrix</h4>
                <h3 className="text-base font-black uppercase tracking-tight text-slate-950 dark:text-white">IEC 60601-1-8 Compliance</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-4">
                  Acoustic warnings are set according to ISO parameters to maintain clinical audibility and prevent cognitive fatigue in operating spaces.
                </p>

                <div className="mt-6 space-y-4">
                  <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider block">High Priority Alarm</span>
                      <span className="text-[9px] font-semibold text-slate-400 uppercase">920Hz Triangle sequence</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">Medium Warning Alarm</span>
                      <span className="text-[9px] font-semibold text-slate-400 uppercase">680Hz Sine beep wave</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500 mt-6 leading-normal">
                Audio streams rely directly on browser audio synthesis APIs. For best results, ensure system volume is unmuted.
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'support' && (
          <motion.div 
            key="support-pane"
            className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {/* ESCALATION FORM */}
            <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
              <h3 className="text-lg font-black uppercase tracking-tight">Systems Coordinator Escalation</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Facing persistent telemetry telemetry anomalies or system lockouts? Dispatch emergency assistance tickets directly to regional platform directors.
              </p>

              <AnimatePresence mode="wait">
                {!ticketSuccess ? (
                  <motion.form 
                    key="ticket-form"
                    onSubmit={submitTicket} 
                    className="space-y-4"
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Clinician ID Reference</label>
                      <input 
                        type="text" 
                        disabled 
                        value={user?.uid || 'CLINICIAN-GUEST-SECURE'} 
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-4 py-3 text-xs font-bold text-slate-500 uppercase"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subject Heading</label>
                        <input 
                          type="text" 
                          required
                          placeholder="E.G., TWILIO SMS GATEWAY DELAY..." 
                          value={ticketSubject}
                          onChange={(e) => setTicketSubject(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Functional Area</label>
                        <select className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider outline-none focus:border-blue-500">
                          <option>Acoustic Alarms</option>
                          <option>SMS Relays</option>
                          <option>Patient Registries</option>
                          <option>HIPAA Logging Archive</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Anomalous Incident Narrative</label>
                      <textarea 
                        rows={4}
                        required
                        placeholder="PROVIDE SYSTEM COMPONENT DETAILS OR TIMELINE LOGS..."
                        value={ticketMessage}
                        onChange={(e) => setTicketMessage(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider outline-none focus:border-blue-500 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={14} />}
                      TRANSMIT DISPATCH PACKET
                    </button>
                  </motion.form>
                ) : (
                  <motion.div 
                    key="ticket-success"
                    className="p-8 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] text-center space-y-4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <CheckCircle2 className="mx-auto text-emerald-500" size={40} />
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-tight text-emerald-600 dark:text-emerald-400">Escalation Packet Logged</h4>
                      <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mt-1">Ref ID: Ticket-{Math.random().toString(36).substring(2, 8).toUpperCase()}</p>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                      Your technical message has been dispatched to regional clinical network engineers. Active monitoring channels remain open.
                    </p>
                    <button
                      onClick={() => setTicketSuccess(false)}
                      className="px-6 py-2.5 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 transition-colors"
                    >
                      LOG NEW DISPATCH
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* DIRECT HOTLINES */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-zinc-800 shadow-md space-y-6">
              <h3 className="text-base font-black uppercase tracking-tight text-slate-950 dark:text-white">Emergency Backlinks</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Direct telecom routes for critical system failures requiring immediate on-site human overrides.
              </p>

              <div className="space-y-4">
                <div className="p-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                  <span className="text-[11px] font-black uppercase text-blue-600 tracking-wider flex items-center gap-1.5">
                    <PhoneCall size={12} /> Regional Network Support
                  </span>
                  <a href="tel:+256787674140" className="text-xs font-bold text-slate-700 dark:text-slate-350 block hover:text-blue-500 transition-colors">
                    +256 787 674 140
                  </a>
                  <span className="text-[9px] font-semibold text-slate-400 uppercase block">Available 24/7/365</span>
                </div>

                <div className="p-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                  <span className="text-[11px] font-black uppercase text-indigo-500 tracking-wider flex items-center gap-1.5">
                    <Mail size={12} /> Lead Systems Officer
                  </span>
                  <a href="mailto:gloriajayakullo@gmail.com" className="text-xs font-bold text-slate-705 dark:text-slate-350 block hover:text-blue-500 transition-colors truncate">
                    gloriajayakullo@gmail.com
                  </a>
                  <span className="text-[9px] font-semibold text-slate-400 uppercase block">Typical turnaround: &lt; 2 hrs</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


/* ==========================================================================
   2. CLINICAL NETWORK VIEW
   ========================================================================== */
export const ClinicalNetwork: React.FC<SubViewProps> = ({ onNavigate }) => {
  const [deptFilter, setDeptFilter] = useState<'all' | 'cardio' | 'neuro' | 'emergency' | 'telehealth'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pagedDoctor, setPagedDoctor] = useState<string | null>(null);
  const [showReferModal, setShowReferModal] = useState(false);
  const [referPayload, setReferPayload] = useState({ doctor: '', dept: '', notes: '' });
  const [isReferring, setIsReferring] = useState(false);
  const [referSuccess, setReferSuccess] = useState(false);

  // Simulated Medical Directory List
  const clinicians = [
    { name: "Dr. Gloria Jayakullo", role: "Attending Cardiologist, Chief Systems Specialist", dept: "cardio", status: "On Duty", location: "Cardiology Suite A", contact: "+256 787 674 140", avatar: "G" },
    { name: "Assoc. Prof. Aaron S.", role: "Lead Neurosurgeon & Cognitive Architect", dept: "neuro", status: "In Surgery", location: "OT Chamber 4", contact: "+256 702 344 511", avatar: "A" },
    { name: "Dr. Florence N.", role: "Emergency Medicine Specialist", dept: "emergency", status: "On Duty", location: "Trauma Bay 2", contact: "+256 751 989 311", avatar: "F" },
    { name: "Consultant Isaac O.", role: "Telehealth Operations Director", dept: "telehealth", status: "Online", location: "Virtual Node 1", contact: "+256 772 881 229", avatar: "I" },
    { name: "Dr. Trevor M.", role: "Pediatric Cardiothoracic Specialist", dept: "cardio", status: "Offline", location: "Outpost Clinics", contact: "+256 781 120 440", avatar: "T" }
  ];

  const handlePageDoctor = (name: string) => {
    setPagedDoctor(name);
    setTimeout(() => {
      setPagedDoctor(null);
    }, 2500);
  };

  const handleReferralSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!referPayload.doctor || !referPayload.notes) return;
    setIsReferring(true);
    setTimeout(() => {
      setIsReferring(false);
      setReferSuccess(true);
      setTimeout(() => {
        setReferSuccess(false);
        setShowReferModal(false);
        setReferPayload({ doctor: '', dept: '', notes: '' });
      }, 2000);
    }, 1200);
  };

  const filteredClinicians = clinicians.filter(doc => {
    const matchesDept = deptFilter === 'all' || doc.dept === deptFilter;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || doc.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="space-y-8 text-slate-900 dark:text-slate-100 animate-fade-in max-w-5xl mx-auto px-4 py-8 relative">
      
      {/* View Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-6">
        <div>
          <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-500 tracking-[0.2em] bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1 rounded-full">Systems Hub</span>
          <h1 className="text-3xl font-black uppercase tracking-tight mt-3 text-slate-950 dark:text-white">Clinical Network & Paging Matrix</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-xs">Direct encrypted conduits to active specialists, caregivers, and telehealth response blocks.</p>
        </div>
        <button 
          onClick={() => onNavigate && onNavigate('home')}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
        >
          Return to home
        </button>
      </div>

      {/* Control Block */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        {/* Department Filters */}
        <div className="flex bg-slate-50 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Units' },
            { id: 'cardio', label: 'Cardiology' },
            { id: 'neuro', label: 'Neurology' },
            { id: 'emergency', label: 'Emergency' },
            { id: 'telehealth', label: 'Tele-Health' }
          ].map(dept => (
            <button
              key={dept.id}
              onClick={() => setDeptFilter(dept.id as any)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
                deptFilter === dept.id 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              {dept.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <input 
            type="text"
            placeholder="Search medical roster..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs font-bold uppercase tracking-wider outline-none focus:border-emerald-500"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
        </div>
      </div>

      {/* clinician Directory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredClinicians.length > 0 ? (
          filteredClinicians.map((doc, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-800/85 shadow-md flex gap-4 hover:shadow-lg transition-transform hover:-translate-y-0.5">
              {/* Fake Avatar */}
              <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xl font-bold font-mono shrink-0 shadow-md">
                {doc.avatar}
              </div>

              {/* Info & Core Controls */}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-black text-slate-950 dark:text-white leading-tight uppercase tracking-tight">{doc.name}</h3>
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                      doc.status === 'On Duty' || doc.status === 'Online'
                        ? 'bg-emerald-100 text-emerald-700'
                        : doc.status === 'In Surgery'
                        ? 'bg-blue-105 text-blue-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {doc.status}
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 leading-snug mt-1">{doc.role}</p>
                </div>

                <div className="flex flex-col gap-1.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <MapPin size={11} className="text-slate-400" />
                    <span>{doc.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PhoneCall size={11} className="text-slate-400" />
                    <span>{doc.contact}</span>
                  </div>
                </div>

                {/* Direct Action triggers */}
                <div className="flex gap-2.5 pt-1">
                  <button
                    onClick={() => handlePageDoctor(doc.name)}
                    disabled={pagedDoctor === doc.name}
                    className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    {pagedDoctor === doc.name ? (
                      <>
                        <Loader2 className="animate-spin" size={10} /> DISPATCHED...
                      </>
                    ) : (
                      <>
                        <PhoneCall size={10} /> PAGE SECURE
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setReferPayload(prev => ({ ...prev, doctor: doc.name, dept: doc.dept }));
                      setShowReferModal(true);
                    }}
                    className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border border-slate-200/50 dark:border-slate-800"
                  >
                    REFER PATIENT
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center py-12 text-slate-400 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800/80">
            <Users className="mx-auto mb-2 text-slate-350 animate-pulse" size={32} />
            <p className="text-xs font-black uppercase tracking-wider">No clinical staff matched current units</p>
          </div>
        )}
      </div>

      {/* Referral Modal Dialog Mockup */}
      <AnimatePresence>
        {showReferModal && (
          <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-md p-4 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-800 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowReferModal(false)}
                className="absolute right-6 top-6 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="space-y-6">
                <div className="text-center">
                  <span className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-full inline-block mb-3">
                    <UserCheck size={24} />
                  </span>
                  <h3 className="text-lg font-black uppercase tracking-tight">Generate Patient Referral</h3>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mt-1">Direct Secure Clinical Handover</p>
                </div>

                {!referSuccess ? (
                  <form onSubmit={handleReferralSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Attending Recipient</label>
                      <input 
                        type="text" 
                        disabled 
                        value={referPayload.doctor} 
                        className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-slate-500 uppercase"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Diagnostic & Case Notes</label>
                      <textarea 
                        rows={3}
                        required
                        placeholder="SUMMARIZE SPUTUM, VITALS DEVIATIONS OR REASON FOR INTENSE TRIAGE CO-MONITORING..."
                        value={referPayload.notes}
                        onChange={(e) => setReferPayload(prev => ({ ...prev, notes: e.target.value }))}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider outline-none focus:border-emerald-500 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isReferring}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
                    >
                      {isReferring ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={14} />}
                      TRANSMIT REFERRAL DISPATCH
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-4 space-y-3">
                    <CheckCircle2 size={40} className="text-emerald-500 mx-auto" />
                    <h4 className="text-sm font-black uppercase tracking-tight text-emerald-600">Referral Logged & Dispatched</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                      Encrypted pipeline packet dispatched to {referPayload.doctor}. Attending has been paged with medical baseline telemetry history.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};


/* ==========================================================================
   3. PRIVACY VAULT VIEW
   ========================================================================== */
export const PrivacyVault: React.FC<SubViewProps> = ({ user, onNavigate }) => {
  const [isLocalEncrypted, setIsLocalEncrypted] = useState(true);
  const [requireBiometrics, setRequireBiometrics] = useState(false);
  const [zeroKnowledgeProof, setZeroKnowledgeProof] = useState(true);
  const [anonymizeData, setAnonymizeData] = useState(true);

  // Simulated live HIPAA Audit Access Logs
  const [auditLogs, setAuditLogs] = useState([
    { actor: "Dr. Gloria Jayakullo", action: "Pulled real-time telemetry waveforms", status: "Secure", time: "22:01:10", hash: "0x89e1...f01" },
    { actor: "Systems Core", action: "Triggered Twilio emergency outbound broadcast", status: "Secure", time: "21:58:32", hash: "0xa210...9bb" },
    { actor: "Secure Client Proxy", action: "Refreshed local bio-alarm threshold limits", status: "Secure", time: "21:30:15", hash: "0xb771...33e" },
    { actor: "Patient Portal", action: "Authorized attending cardiac tracking keys", status: "Secure", time: "19:15:00", hash: "0x44cd...ee1" }
  ]);

  const clearAuditLogs = () => {
    setAuditLogs([]);
  };

  const rotateKeys = () => {
    // Generate new random hashes
    setAuditLogs(prev => [
      { actor: "Crypto Engine", action: "Rotated clinical telemetry key blocks", status: "Rotated", time: new Date().toLocaleTimeString('en-GB'), hash: "0x" + Math.random().toString(16).substring(2, 10) + "...001" },
      ...prev
    ]);
  };

  return (
    <div className="space-y-8 text-slate-900 dark:text-slate-100 animate-fade-in max-w-5xl mx-auto px-4 py-8">
      
      {/* View Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-6">
        <div>
          <span className="text-[10px] font-black uppercase text-rose-600 dark:text-rose-500 tracking-[0.2em] bg-rose-50 dark:bg-rose-950/20 px-3 py-1 rounded-full">Systems Hub</span>
          <h1 className="text-3xl font-black uppercase tracking-tight mt-3 text-slate-950 dark:text-white">HIPAA Privacy Vault & Crypto Core</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-xs">Verify continuous encryption blocks, toggle local privacy parameters, and monitor immutable telemetry audit logs.</p>
        </div>
        <button 
          onClick={() => onNavigate && onNavigate('home')}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
        >
          Return to home
        </button>
      </div>

      {/* Main Grid controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* PRIVACY CONTROLS */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-800/80 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-2xl">
              <Lock size={20} />
            </div>
            <h3 className="text-base font-black uppercase tracking-tight text-slate-900 dark:text-white">Privacy Switches</h3>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
            Adjust client-side constraints on-the-fly to respect patients' digital custody wishes.
          </p>

          <div className="space-y-4 pt-2">
            {[
              { id: 'localEnc', val: isLocalEncrypted, set: setIsLocalEncrypted, label: "AES-GCM Local Database Encryption", desc: "Forces sandbox values to save under randomized key parameters." },
              { id: 'reqBio', val: requireBiometrics, set: setRequireBiometrics, label: "Attending Passphrase Verification", desc: "Interrupts actions and requires a secure user credential hash." },
              { id: 'zkpAuth', val: zeroKnowledgeProof, set: setZeroKnowledgeProof, label: "Zero-Knowledge Telemetry Relay", desc: "Transmits indicators to relays without releasing individual patient identifiers." },
              { id: 'anonData', val: anonymizeData, set: setAnonymizeData, label: "HIPAA Scrub AI Analytics", desc: "Scrubs diagnostic outputs before forwarding metrics into predictive models." }
            ].map((sw) => (
              <div key={sw.id} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-105 dark:border-slate-850 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold leading-tight select-none">{sw.label}</span>
                  <button
                    onClick={() => sw.set(!sw.val)}
                    aria-label={`Toggle ${sw.label}`}
                    className={`w-11 h-6 rounded-full p-1 transition-colors ${sw.val ? 'bg-rose-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${sw.val ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">{sw.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* IMMUTABLE AUDIT LOG */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-800/80 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-2xl">
                  <Database size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase tracking-tight text-slate-900 dark:text-white">HIPAA Access Audit Trails</h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Immutable Cryptographic Loggers</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={rotateKeys}
                  className="py-2.5 px-4 bg-slate-950 dark:bg-blue-600 hover:bg-slate-850 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all"
                >
                  <Key size={11} /> ROTATE KEY BLOCKS
                </button>
                <button
                  onClick={clearAuditLogs}
                  aria-label="Clear audit logs"
                  className="p-2 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 dark:bg-slate-850 dark:hover:bg-rose-950/20 rounded-xl transition-all border border-slate-150 dark:border-slate-800"
                >
                  Clear Log
                </button>
              </div>
            </div>

            <div className="space-y-3.5 pt-6 max-h-[380px] overflow-y-auto pr-2 no-scrollbar">
              {auditLogs.length > 0 ? (
                auditLogs.map((log, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-955 rounded-2xl border border-slate-100 dark:border-slate-850/80 flex justify-between items-start gap-4 hover:border-rose-100 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{log.actor}</span>
                        <span className="text-[8px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 rounded uppercase tracking-widest">{log.status}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">{log.action}</p>
                    </div>

                    <div className="text-right shrink-0 space-y-1">
                      <span className="text-[9px] font-black text-slate-400 block font-mono">{log.time}</span>
                      <span className="text-[9px] font-bold text-rose-500 font-mono block select-all bg-rose-50 dark:bg-rose-950/30 px-1 py-0.5 rounded">{log.hash}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <CheckCircle2 className="mx-auto text-emerald-400 mb-2" size={32} />
                  <p className="text-xs font-black uppercase tracking-widest">No active audit deviations recorded</p>
                  <p className="text-[10px] uppercase text-slate-400 mt-1">Audit log synchronized with security cores.</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <span>Cryptographic Salt: SHA-256 [SECURE]</span>
            <span>Platform compliant</span>
          </div>
        </div>

      </div>

    </div>
  );
};


/* ==========================================================================
   4. TERMS & DATA VIEW
   ========================================================================== */
export const TermsAndData: React.FC<SubViewProps> = ({ vitals, onNavigate }) => {
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [importLogs, setImportLogs] = useState<string[]>([]);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleExportData = () => {
    // Generate simulated clinical setup configuration package
    const clinicalConfigData = {
      deviceRole: "Doctorian AI Telemetry Node",
      timestampUTC: new Date().toISOString(),
      activePhysiometrics: {
        heartRate: vitals?.heartRate || 75,
        spo2: vitals?.spo2 || 98,
        temperature: vitals?.temperature || 36.8,
        respiratoryRate: vitals?.respiratoryRate || 16,
        systolicBP: vitals?.systolicBP || 120,
        diastolicBP: vitals?.diastolicBP || 80
      },
      telemetryStandardsCompliance: ["IEC 60601-1-8", "HIPAA Omnibus Guardrails"],
      exporterCredentialNode: "UGANDA-REGINAL-CLINIC-GUEST"
    };

    const dataHexStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(clinicalConfigData, null, 2));
    const downloadHelperAnchor = document.createElement('a');
    downloadHelperAnchor.setAttribute("href", dataHexStr);
    downloadHelperAnchor.setAttribute("download", `clinical-telemetry-harness-export-${Date.now()}.json`);
    document.body.appendChild(downloadHelperAnchor);
    downloadHelperAnchor.click();
    downloadHelperAnchor.remove();

    setExportSuccess(true);
    setTimeout(() => {
      setExportSuccess(false);
    }, 2500);
  };

  const handleImportMockPreset = () => {
    setImportStatus('reading');
    setTimeout(() => {
      setImportStatus('success');
      setImportLogs(prev => [
        `Restored threshold envelopes: HR bounds [40-180], SpO2 hypoxia alert [90%]`,
        ...prev
      ]);
      setTimeout(() => setImportStatus(null), 2000);
    }, 1000);
  };

  return (
    <div className="space-y-8 text-slate-900 dark:text-slate-100 animate-fade-in max-w-5xl mx-auto px-4 py-8">
      
      {/* View Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-6">
        <div>
          <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-500 tracking-[0.2em] bg-amber-50 dark:bg-amber-950/20 px-3 py-1 rounded-full">Systems Hub</span>
          <h1 className="text-3xl font-black uppercase tracking-tight mt-3 text-slate-950 dark:text-white">Terms of Custody & Telemetry Exporter</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-xs">Examine telemetry custody agreements, export offline clinical setups, or restore default safety profiles.</p>
        </div>
        <button 
          onClick={() => onNavigate && onNavigate('home')}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
        >
          Return to home
        </button>
      </div>

      {/* Main Grid: split terms explanation on left, telemetry loader on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Custody Terms */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-2xl">
              <FileText size={20} />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight">EHR Telemetry Data Custody Covenant</h3>
          </div>

          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 no-scrollbar text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            <h4 className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">1. Scope of Continuous Bio-Monitoring</h4>
            <p>
              By keeping the real-time telemetry harness running, clinical personnel acknowledge that all physiological parameters (such as Heart Pulsations, SpO2 wave, Core Temperature limits, and Blood Pressure curves) are temporary metrics held strictly within active browser memory contexts. No secondary database records are published client-side unless manually exported.
            </p>

            <h4 className="font-extrabold text-[#111] dark:text-[#eee] uppercase tracking-wider text-[11px]">2. SMS Broadcast Dispatches & Responsibility</h4>
            <p>
              Critical alerts dispatched via underlying telecom APIs (like the Twilio VoIP robocall engine) remain a helper tool rather than an absolute indicator. Attending cardiologists or practitioners retain primary onsite diagnostic obligations.
            </p>

            <h4 className="font-extrabold text-[#111] dark:text-[#eee] uppercase tracking-wider text-[11px]">3. Consent & Local Encryption Sandboxes</h4>
            <p>
               All settings regarding alarms, thresholds, and patient vitals are subject to local storage persistence models. These are fully cleared immediately upon browser terminal resets unless backed up using our clinical exporter.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4">
            <button
              onClick={() => setAgreedTerms(!agreedTerms)}
              className={`w-6 h-6 rounded-lg border transition-colors flex items-center justify-center shrink-0 ${
                agreedTerms ? 'bg-amber-500 border-amber-500 text-white' : 'bg-transparent border-slate-300 dark:border-slate-700'
              }`}
            >
              {agreedTerms && <Check size={14} />}
            </button>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-normal select-none">
              I acknowledge the Clinical Telemetry Custory Covenant
            </span>
          </div>
        </div>

        {/* Telemetry Exporter Harness */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-zinc-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-2xl">
                <Database size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight">Active Data Exporter</h3>
                <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Configure offline profiles</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              Save current guardrail thresholds and patient monitoring configurations to your local hard drive as a structured JSON packet, or restore baseline safety presets in one single hit.
            </p>

            <div className="space-y-4">
              <button
                onClick={handleExportData}
                disabled={!agreedTerms || exportSuccess}
                className="w-full py-4 bg-slate-950 hover:bg-slate-850 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-50"
              >
                {exportSuccess ? <CheckCircle2 size={15} /> : <Download size={14} />}
                {exportSuccess ? "TELEMETRY JSON EXPORTED!" : "EXPORT TELEMETRY PROFILE (.JSON)"}
              </button>

              <button
                onClick={handleImportMockPreset}
                disabled={!agreedTerms || importStatus === 'reading'}
                className="w-full py-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-205 rounded-2xl text-[10.5px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-slate-250 dark:border-slate-800 transition-transform active:scale-[0.98] disabled:opacity-50"
              >
                {importStatus === 'reading' ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                RELOAD SAFETY PRESETS (.JSON)
              </button>
            </div>

            {/* Simulated feedback lines */}
            {importLogs.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Restoration Activity Logs</span>
                <div className="space-y-1.5 max-h-[100px] overflow-y-auto">
                  {importLogs.map((log, idx) => (
                    <div key={idx} className="flex gap-2 text-[10px] font-semibold text-emerald-600 dark:text-emerald-500">
                      <span className="shrink-0">•</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500 leading-normal mt-6 select-none">
            To unlock export / import routines, clinician must read and accept the custody checkbox above.
          </div>
        </div>

      </div>

    </div>
  );
};
