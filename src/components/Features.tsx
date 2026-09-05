import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  Brain, 
  MessageSquare, 
  Heart, 
  Shield, 
  Lock, 
  Zap, 
  Pill, 
  FileText, 
  Dna, 
  Compass, 
  Thermometer, 
  Stethoscope, 
  AlertTriangle, 
  Fingerprint, 
  Search, 
  ArrowUpRight, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Cpu, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FeaturesProps {
  onNavigate?: (view: any) => void;
}

interface FeatureItem {
  id: string;
  title: string;
  view: string;
  category: 'telemetry' | 'ai' | 'care' | 'longevity' | 'emergency' | 'security';
  badge: string;
  tagline: string;
  description: string;
  details: string;
  specs: string[];
  status: string;
  isSpotlight?: boolean;
}

export const Features: React.FC<FeaturesProps> = ({ onNavigate }) => {
  const [activeCard, setActiveCard] = useState<string | null>('monitor');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const featuresList: FeatureItem[] = [
    {
      id: 'monitor',
      title: "Real-Time Bio-Monitor Suite",
      view: 'monitor',
      category: 'telemetry',
      badge: 'Unlocked & Active',
      tagline: 'Continuous Electrocardiogram (ECG), SpO2, and physiological stream',
      description: "Medical-grade bio-telemetry workstation featuring real-time vital waveforms, interactive simulation dials, genomic matrix, clinical alarm thresholds, and ambulance dispatch coordination.",
      details: "Equipped with dual hardware/software inputs (demo simulation + serial telemetry), configurable clinical alarms with auditory tones, historical trend analysis, inpatient bed registry, and neural vital synthesis.",
      specs: ["ECG & PPG Waveforms", "Simulation Dials Unlocked", "Clinical Alarm Hub", "Ambulance Routing"],
      status: "Live Stream Ready",
      isSpotlight: true
    },
    {
      id: 'ai_nexus',
      title: "AI Diagnostic Consultation",
      view: 'ai_nexus',
      category: 'ai',
      badge: 'Multimodal AI',
      tagline: 'Evidence-based differential diagnostic engine with clinical grounding',
      description: "Ask complex clinical questions, input multimodal symptoms or lab data, and receive structured medical guidance with clinical references and differential pathways.",
      details: "Trained on peer-reviewed clinical knowledge bases and medical literature with strict safety guardrails and confidence metrics for physician decision support.",
      specs: ["Multimodal Image/Data Input", "Differential Diagnosis", "24/7 Clinical Triage", "PubMed Reference Linking"],
      status: "Operational"
    },
    {
      id: 'diagnostic_lab',
      title: "Diagnostic Laboratory Analyser",
      view: 'diagnostic_lab',
      category: 'ai',
      badge: 'Biomarker Intelligence',
      tagline: 'Automated blood chemistry panels, pathology, and abnormal flagging',
      description: "Analyze complete metabolic panels (CMP), lipid profiles, hematology counts, and biomarker trends with automated reference range comparison and pathology alerts.",
      details: "Interprets lab reports with clinical contextualization, highlighting out-of-range biomarkers and providing longitudinal trajectory charts.",
      specs: ["CMP / CBC / Lipid Panels", "Out-of-Range Highlighting", "Longitudinal Trend Mapping", "Pathology Assessment"],
      status: "Operational"
    },
    {
      id: 'symptoms',
      title: "Clinical Symptom Triage",
      view: 'symptoms',
      category: 'ai',
      badge: 'Interactive Triage',
      tagline: 'Algorithmic clinical symptom evaluation and triage stratification',
      description: "Rapidly evaluate acute or chronic physical symptoms using clinical severity scoring (ESI), differential branching, and red-flag alarm triggers.",
      details: "Guides patients through structured diagnostic questions, prioritizing critical emergencies and identifying appropriate specialist referrals.",
      specs: ["ESI Severity Scoring", "Red-Flag Warnings", "Anatomical Symptom Mapping", "Specialist Recommendations"],
      status: "Operational"
    },
    {
      id: 'meds',
      title: "Precision Clinical Pharmacy",
      view: 'meds',
      category: 'care',
      badge: 'Pharmacovigilance',
      tagline: 'Medication adherence schedules, dosage tracking, and interaction checks',
      description: "Comprehensive pharmacological manager with scheduled dose alerts, contraindication scans, drug-drug interaction warnings, and prescription refill workflows.",
      details: "Tracks active regimens with pharmacological timing, food interactions, adherence streaks, and physician-verified dosage instructions.",
      specs: ["Drug-Drug Interaction Engine", "Smart Dose Notifications", "Adherence Analytics", "Refill Management"],
      status: "Operational"
    },
    {
      id: 'clinical_roadmap',
      title: "Consultations & Clinical Roadmap",
      view: 'clinical_roadmap',
      category: 'care',
      badge: 'Care Management',
      tagline: 'Integrated specialist scheduling, appointment tracker, and timeline',
      description: "Coordinate medical appointments, specialist follow-ups, diagnostic scans, and clinical milestone tracking in a unified care calendar.",
      details: "Maintains structured timelines for pre-op preparations, lab appointments, medication reviews, and telehealth visit links.",
      specs: ["Specialist Scheduling", "Telehealth Video Rooms", "Pre-Consult Checklists", "Calendar Sync"],
      status: "Operational"
    },
    {
      id: 'specialist',
      title: "Specialist Directory & Telehealth",
      view: 'specialist',
      category: 'care',
      badge: 'Physician Network',
      tagline: 'Verified medical specialist referrals across cardiology, neurology, & more',
      description: "Connect with board-certified physicians, filter by clinical specialty, check credentialing ratings, and initiate direct consultation requests.",
      details: "Directory includes cardiologists, neurologists, endocrinologists, pulmonologists, and general practitioners with verified clinical IDs.",
      specs: ["Verified Medical Credentials", "Specialty Filtering", "Direct Referral Requests", "Virtual Waiting Rooms"],
      status: "Operational"
    },
    {
      id: 'vitality',
      title: "Vitality & Metabolic Index",
      view: 'vitality',
      category: 'longevity',
      badge: 'Metabolic Health',
      tagline: 'Biological age assessment and circadian bio-energy analytics',
      description: "Track cellular metabolic performance, HRV recovery patterns, biological age deviation, and bio-energy resilience indices.",
      details: "Combines continuous resting heart rate, sleep architecture, and metabolic markers to compute an actionable vitality score.",
      specs: ["Biological Age Estimator", "Circadian Bio-Energy Rhythm", "HRV Recovery Score", "Metabolic Flexibility"],
      status: "Operational"
    },
    {
      id: 'fitness',
      title: "Physiological Longevity Protocols",
      view: 'fitness',
      category: 'longevity',
      badge: 'Longevity Science',
      tagline: 'Cardiorespiratory fitness tracking, VO2 max optimization, and conditioning',
      description: "Targeted conditioning protocols engineered to optimize cardiovascular capacity, mitochondrial efficiency, and functional healthspan.",
      details: "Dynamic training zones (Zone 2 steady-state and Zone 5 intervals) tailored to real-time biometric capacity and recovery status.",
      specs: ["VO2 Max Projections", "Zone 2 Base Engine", "Musculoskeletal Strength Index", "Recovery Monitoring"],
      status: "Operational"
    },
    {
      id: 'neuro',
      title: "Cognis Neural & Cognitive Lab",
      view: 'neuro',
      category: 'longevity',
      badge: 'Cognitive Health',
      tagline: 'Neuro-diagnostic evaluation and cognitive performance tracking',
      description: "Assess cognitive latency, working memory retention, executive focus, and neuroplastic trends through interactive clinical assessments.",
      details: "Provides benchmarked reaction metrics, focus endurance graphs, and evidence-supported lifestyle adjustments for neuro-preservation.",
      specs: ["Reaction Time Benchmarks", "Executive Focus Scoring", "Memory Retention Audits", "Neuroplasticity Exercises"],
      status: "Operational"
    },
    {
      id: 'emergency',
      title: "Emergency SOS & Trauma Response",
      view: 'emergency',
      category: 'emergency',
      badge: '24/7 Critical Response',
      tagline: 'Instant trauma broadcast, SMS telemetry relay, and dispatch coordination',
      description: "Single-tap emergency broadcast that transmits real-time GPS coordinates, vitals snapshot, and critical medical ID to local emergency services and designated contacts.",
      details: "Directly integrates with GSM/SMS gateway relays, automated trauma registry logging, and inpatient hospital bed alerts.",
      specs: ["1-Tap Emergency Trigger", "GPS & Medical ID Broadcast", "SMS Telemetry Dispatch", "Trauma Log Registry"],
      status: "24/7 Active"
    },
    {
      id: 'records',
      title: "Electronic Health Records (EHR)",
      view: 'records',
      category: 'security',
      badge: 'FHIR / Encrypted',
      tagline: 'Cryptographically protected patient history, lab reports, and passports',
      description: "Centralized electronic health record vault supporting FHIR interoperability, clinical report PDF exports, and complete medical identity records.",
      details: "Patient records are encrypted at rest with zero-knowledge keys, allowing seamless exports for second opinions or clinical visits.",
      specs: ["Encrypted Data Vault", "FHIR / HL7 Schema", "Instant PDF Report Exporter", "Audit Trail Logging"],
      status: "Operational"
    },
    {
      id: 'biosecurity',
      title: "Biometric Security & 2FA Vault",
      view: 'biosecurity',
      category: 'security',
      badge: 'Zero-Knowledge',
      tagline: 'WebAuthn hardware passkeys, biometric 2FA, and cryptographic defense',
      description: "Protect sensitive clinical data with FIDO2 WebAuthn biometric authentication (Touch ID, Face ID, YubiKey) and immutable audit logging.",
      details: "Ensures compliance with HIPAA privacy standards and enterprise-grade clinical authorization controls across every endpoint.",
      specs: ["WebAuthn / Passkey 2FA", "Hardware Key Support", "Zero-Knowledge Encryption", "HIPAA Compliance"],
      status: "Operational"
    }
  ];

  const categories = [
    { id: 'all', label: 'All Capabilities', count: featuresList.length },
    { id: 'telemetry', label: 'Bio-Telemetry & Sensors', count: featuresList.filter(f => f.category === 'telemetry').length },
    { id: 'ai', label: 'AI & Diagnostics', count: featuresList.filter(f => f.category === 'ai').length },
    { id: 'care', label: 'Care & Treatments', count: featuresList.filter(f => f.category === 'care').length },
    { id: 'longevity', label: 'Longevity & Research', count: featuresList.filter(f => f.category === 'longevity').length },
    { id: 'emergency', label: 'Emergency Response', count: featuresList.filter(f => f.category === 'emergency').length },
    { id: 'security', label: 'Security & EHR', count: featuresList.filter(f => f.category === 'security').length }
  ];

  const filteredFeatures = useMemo(() => {
    return featuresList.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.specs.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const spotlightItem = featuresList.find(f => f.isSpotlight);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'telemetry': return <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'ai': return <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'care': return <Pill className="w-5 h-5 text-teal-600 dark:text-teal-400" />;
      case 'longevity': return <Heart className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
      case 'emergency': return <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'security': return <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      default: return <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      
      {/* Header Section */}
      <section className="text-left space-y-4" aria-labelledby="features-hero-title">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs font-black uppercase tracking-wider">
          <Sparkles size={14} className="animate-pulse" />
          <span>Clinical Modules & Platform Capabilities</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 
              id="features-hero-title"
              className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight"
            >
              Medical Intelligence <br className="hidden sm:inline" />
              <span className="text-blue-600 dark:text-blue-400">& Telemetry Suite</span>
            </h1>
            <p className="mt-2 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl font-medium leading-relaxed">
              Explore the fully unlocked clinical modules, bio-sensor telemetries, AI diagnostics, and precision healthcare tools available across the platform.
            </p>
          </div>

          {/* Search Input */}
          <div className="w-full md:w-80 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools, sensors, or specs..."
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Featured Unlocked Spotlight: Bio-Monitor */}
      {spotlightItem && !searchQuery && (selectedCategory === 'all' || selectedCategory === 'telemetry') && (
        <section 
          className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 text-white p-6 sm:p-8 md:p-10 rounded-3xl border border-blue-800/40 shadow-2xl overflow-hidden"
          aria-labelledby="spotlight-title"
        >
          <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Feature Unlocked: Real-Time Bio-Monitor</span>
              </div>
              <h2 id="spotlight-title" className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
                {spotlightItem.title}
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-medium">
                {spotlightItem.description}
              </p>
              
              {/* Specs Pills */}
              <div className="flex flex-wrap gap-2 pt-2">
                {spotlightItem.specs.map((spec, sIdx) => (
                  <div key={sIdx} className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 text-xs font-bold text-slate-200 backdrop-blur-sm">
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    <span>{spec}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-4">
                <button
                  onClick={() => onNavigate?.(spotlightItem.view)}
                  className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2 cursor-pointer"
                >
                  <span>Launch Bio-Monitor Workspace</span>
                  <ArrowUpRight size={16} />
                </button>
                <div className="px-4 py-3 bg-white/5 rounded-2xl border border-white/10 text-slate-300 text-xs font-bold flex items-center gap-2">
                  <Activity size={14} className="text-emerald-400 animate-pulse" />
                  <span>Interactive Clinical Dials & Alarms Fully Enabled</span>
                </div>
              </div>
            </div>

            {/* Visual Telemetry Mini-Preview */}
            <div className="lg:col-span-4 bg-slate-950/80 p-5 rounded-2xl border border-blue-500/30 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Telemetry Stream</span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE 250Hz
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Heart Rate</p>
                  <p className="text-2xl font-black text-white">72 <span className="text-xs text-slate-400 font-medium">BPM</span></p>
                </div>
                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">SpO2 Level</p>
                  <p className="text-2xl font-black text-emerald-400">98% <span className="text-xs text-slate-400 font-medium">O2</span></p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-[11px] text-slate-400 font-semibold">
                  Zero access restrictions. Unlocked for instant physiological monitoring.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Category Navigation Pills */}
      <section aria-label="Feature Categories" className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer border ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <span>{cat.label}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
              selectedCategory === cat.id
                ? 'bg-white/20 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}>
              {cat.count}
            </span>
          </button>
        ))}
      </section>

      {/* Features Grid */}
      <section 
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" 
        role="region" 
        aria-label="Features Directory"
      >
        {filteredFeatures.map((feature) => {
          const isExpanded = activeCard === feature.id;
          return (
            <motion.article 
              key={feature.id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`bg-white dark:bg-slate-900 p-6 rounded-3xl border transition-all flex flex-col justify-between ${
                isExpanded 
                  ? 'border-blue-500 shadow-xl shadow-blue-500/5 ring-1 ring-blue-500' 
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
              }`}
            >
              <div className="space-y-4">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60">
                    {getCategoryIcon(feature.category)}
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    feature.badge.includes('Unlocked') 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}>
                    {feature.badge}
                  </span>
                </div>

                {/* Title & Tagline */}
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-xs text-blue-600 dark:text-blue-400 font-bold">
                    {feature.tagline}
                  </p>
                </div>

                {/* Main Description */}
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                  {feature.description}
                </p>

                {/* Expandable Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800"
                    >
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
                        {feature.details}
                      </p>
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Specifications</p>
                        <div className="flex flex-wrap gap-1.5">
                          {feature.specs.map((spec, specIdx) => (
                            <span 
                              key={specIdx} 
                              className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action Footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setActiveCard(isExpanded ? null : feature.id)}
                  className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                  aria-expanded={isExpanded}
                >
                  <span>{isExpanded ? 'Less info' : 'Specifications'}</span>
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate?.(feature.view)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm shadow-blue-500/20 cursor-pointer"
                >
                  <span>Open</span>
                  <ArrowUpRight size={13} />
                </button>
              </div>
            </motion.article>
          );
        })}
      </section>

      {/* Zero results state */}
      {filteredFeatures.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <Search className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-base font-black text-slate-900 dark:text-white">No matching clinical features found</h3>
          <p className="text-xs text-slate-500 font-medium">Try searching for a different biomarker, sensor, or clinical specialty.</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Platform Architecture & Trust Section */}
      <section 
        className="p-6 sm:p-10 bg-slate-900 text-white rounded-3xl border border-slate-800 relative overflow-hidden"
        aria-labelledby="trust-section-title"
      >
        <div className="relative z-10 grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-black uppercase tracking-wider">
              <Shield size={13} />
              <span>Medical Architecture & Compliance</span>
            </div>
            <h2 id="trust-section-title" className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Built for Clinical Precision & Data Confidentiality
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed font-medium">
              Every telemetry channel, AI model inference, and electronic health record transaction complies with HIPAA privacy regulations and strict zero-knowledge encryption protocols.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl text-xs font-bold">
                <Lock size={14} className="text-blue-400" />
                <span>End-to-End Encrypted</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl text-xs font-bold">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>Zero-Latency Bio-Streams</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl text-xs font-bold">
                <Fingerprint size={14} className="text-indigo-400" />
                <span>FIDO2 WebAuthn 2FA</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-2xl font-black text-blue-400">13+</p>
              <p className="text-xs font-black text-white uppercase">Clinical Modules</p>
              <p className="text-[10px] text-slate-400">Integrated suite ready for immediate use</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-2xl font-black text-emerald-400">250 Hz</p>
              <p className="text-xs font-black text-white uppercase">Telemetry Rate</p>
              <p className="text-[10px] text-slate-400">High-fidelity waveform rendering</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-2xl font-black text-indigo-400">24 / 7</p>
              <p className="text-xs font-black text-white uppercase">Emergency SOS</p>
              <p className="text-[10px] text-slate-400">Instant SMS relay & ambulance routing</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-2xl font-black text-rose-400">100%</p>
              <p className="text-xs font-black text-white uppercase">Bio-Monitor Unlocked</p>
              <p className="text-[10px] text-slate-400">Direct access to patient monitor</p>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
};

export default Features;
