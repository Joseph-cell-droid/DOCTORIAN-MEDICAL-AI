import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FlaskConical, 
  Search, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Printer, 
  Share2, 
  Plus, 
  History, 
  FileText, 
  Sparkles, 
  Clock, 
  Calendar, 
  Droplet, 
  Dna, 
  ShieldCheck, 
  ChevronRight, 
  Lightbulb, 
  Download, 
  User, 
  MapPin, 
  Check, 
  X,
  ExternalLink,
  Camera,
  Video,
  Sliders,
  ZoomIn,
  ZoomOut,
  Scan,
  Target,
  Layers,
  Eye,
  RefreshCw,
  Maximize2
} from 'lucide-react';

interface DiagnosticLabProps {
  onNavigate?: (view: string) => void;
  user?: any;
}

export const DiagnosticLab: React.FC<DiagnosticLabProps> = ({ onNavigate, user }) => {
  const [activeTab, setActiveTab] = useState<'results' | 'requests' | 'reports' | 'history' | 'analytics'>('results');
  const [timeRange, setTimeRange] = useState('Last 30 Days');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewTestModal, setShowNewTestModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Trigger quick toast notification
  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Camera & Microscopic Scanner State
  const [isMicroscopeOpen, setIsMicroscopeOpen] = useState(true);
  const [scannerSource, setScannerSource] = useState<'slide' | 'camera'>('slide');
  const [selectedSlide, setSelectedSlide] = useState<'malaria' | 'gram' | 'urine' | 'afb'>('malaria');
  const [objectiveLens, setObjectiveLens] = useState<'10x' | '40x' | '100x'>('40x');
  const [focusLevel, setFocusLevel] = useState(0); // 0 = sharp, >0 = blurred
  const [illumination, setIllumination] = useState(100); // 70 to 140
  const [showAiOverlay, setShowAiOverlay] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<{
    specimen: string;
    density: string;
    differential: string;
    confidence: number;
    timestamp: string;
  } | null>({
    specimen: 'Peripheral Blood Smear (Giemsa Stain)',
    density: 'Malaria P. falciparum: Zero Gametocytes, Negative Thick Film (<50 parasites/µL)',
    differential: 'Neutrophils 64%, Lymphocytes 28%, Monocytes 6%, Eosinophils 2%',
    confidence: 99.4,
    timestamp: 'Today, 09:18 AM'
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Start live webcam or mobile back camera
  const startCameraStream = async () => {
    try {
      setCameraError(null);
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
        setMediaStream(stream);
        setScannerSource('camera');
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        notify('Microscope optical camera feed connected.');
      } else {
        setCameraError('Camera API not accessible in this environment. Using high-resolution digital slide preset.');
        setScannerSource('slide');
      }
    } catch (err: any) {
      console.warn('Microscope camera stream fallback:', err);
      setCameraError('Camera access unavailable. Using digital specimen slide simulator.');
      setScannerSource('slide');
    }
  };

  // Stop camera stream
  const stopCameraStream = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    setScannerSource('slide');
  };

  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mediaStream]);

  // Capture & Analyze Slide
  const handleCaptureAndAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);

      let newResultTitle = '';
      let resultValue = '';
      let normRange = '';
      let diffSummary = '';

      if (selectedSlide === 'malaria') {
        newResultTitle = 'Microscopy: Malaria Thick & Thin Film';
        resultValue = 'Negative (< 50 parasites/µL)';
        normRange = '0 parasites/µL';
        diffSummary = 'P. falciparum: None Detected. Normocytic RBCs with uniform staining.';
      } else if (selectedSlide === 'gram') {
        newResultTitle = 'Microscopy: Gram Stain Smear';
        resultValue = 'Gram-Positive Cocci (Rare)';
        normRange = 'Normal Commensal Flora';
        diffSummary = 'Sparse Gram-positive cocci in tetrads. No pathogenic Gram-negative bacilli observed.';
      } else if (selectedSlide === 'urine') {
        newResultTitle = 'Microscopy: Urinalysis Sediment';
        resultValue = 'WBC 0-2/HPF, RBC 0-1/HPF';
        normRange = 'WBC < 5/HPF, RBC < 3/HPF';
        diffSummary = 'Normal urothelial sediment. Rare amorphous calcium oxalate crystals, no hyaline casts.';
      } else {
        newResultTitle = 'Microscopy: Ziehl-Neelsen AFB Stain';
        resultValue = 'AFB Negative (0/300 HPF)';
        normRange = '0 Acid-Fast Bacilli';
        diffSummary = 'Zero acid-fast bacilli observed across 300 calibrated oil immersion fields.';
      }

      setLastAnalysis({
        specimen: selectedSlide === 'malaria' ? 'Peripheral Blood Smear' : selectedSlide === 'gram' ? 'Microbial Smear' : selectedSlide === 'urine' ? 'Urinalysis Sediment' : 'Sputum AFB Smear',
        density: resultValue,
        differential: diffSummary,
        confidence: 99.2,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      // Automatically prepend to tests list!
      setTests(prev => [
        {
          name: newResultTitle,
          result: resultValue,
          normal: normRange,
          status: 'Normal',
          date: 'Just Now (Microscopic AI)',
          type: 'microscopy'
        },
        ...prev
      ]);

      notify(`Analysis Complete: ${newResultTitle} verified & added to patient chart.`);
    }, 1400);
  };

  // Lab Tests Data
  const [tests, setTests] = useState([
    { name: 'Hemoglobin (Hb)', result: '13.8 g/dL', normal: '12.0 – 16.0', status: 'Normal', date: 'Today, 09:15 AM', type: 'blood' },
    { name: 'White Blood Cells', result: '7.2 × 10³/µL', normal: '4.0 – 11.0', status: 'Normal', date: 'Today, 09:15 AM', type: 'blood' },
    { name: 'Platelets', result: '250 × 10³/µL', normal: '150 – 450', status: 'Normal', date: 'Today, 09:15 AM', type: 'blood' },
    { name: 'Blood Sugar (Fasting)', result: '98 mg/dL', normal: '70 – 110', status: 'Normal', date: 'Today, 09:10 AM', type: 'biochem' },
    { name: 'Cholesterol (Total)', result: '175 mg/dL', normal: '< 200', status: 'Normal', date: 'Today, 09:10 AM', type: 'biochem' },
    { name: 'Creatinine', result: '0.9 mg/dL', normal: '0.6 – 1.2', status: 'Normal', date: 'Today, 09:10 AM', type: 'biochem' },
  ]);

  const filteredTests = tests.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen bg-[#f3f7fd] dark:bg-[#060e20] text-slate-900 dark:text-slate-100 font-sans pb-16 overflow-x-hidden">
      
      {/* ========================================================================= */}
      {/* TOP HEADER BAR                                                            */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-[#081530]/95 backdrop-blur-md border-b border-slate-200 dark:border-blue-900/40 px-4 sm:px-6 lg:px-8 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          <div className="flex-1 max-w-md relative">
            <Search size={16} className="absolute left-3.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lab tests, patients..."
              className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-[#0c1a36] border border-slate-200 dark:border-blue-800/60 rounded-full text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>

            {/* User Profile */}
            <div className="flex items-center gap-2 pl-2 pr-3 py-1 bg-slate-100 dark:bg-[#0c1a36] rounded-full border border-slate-200 dark:border-blue-800/60">
              <img
                src="/african_doctor_male.png"
                alt="Dr. Joseph Akora"
                className="w-7 h-7 rounded-full object-cover border border-blue-400"
              />
              <span className="text-xs font-bold hidden sm:inline">Dr. Joseph Akora</span>
            </div>
          </div>

        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN CONTENT                                                              */}
      {/* ========================================================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* --------------------------------------------------------------------- */}
          {/* LEFT COLUMN: Patient Info + Quick Actions + Lab Status (4 Cols)       */}
          {/* --------------------------------------------------------------------- */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Patient Information Card */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#091838] border border-slate-200 dark:border-blue-900/50 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-blue-900/40">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Patient Information
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate?.('records')}
                  className="text-xs text-blue-600 dark:text-cyan-400 font-bold hover:underline"
                >
                  View Profile →
                </button>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center font-black text-xl shadow-md">
                  SN
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900 dark:text-white">Sarah Nakato</h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    PID: PT-00124 • Age: 28 • Female
                  </p>
                  <p className="text-[11px] text-blue-600 dark:text-cyan-400 font-semibold flex items-center gap-1 mt-0.5">
                    <MapPin size={11} /> Kampala, Uganda
                  </p>
                </div>
              </div>

              {/* 3 Summary Badges */}
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-[#050e20] border border-slate-100 dark:border-blue-900/40">
                  <span className="text-[10px] text-slate-400 block font-semibold">Last Visit</span>
                  <strong className="text-xs font-black text-slate-900 dark:text-white">Today</strong>
                </div>
                <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-[#050e20] border border-slate-100 dark:border-blue-900/40">
                  <span className="text-[10px] text-slate-400 block font-semibold">Next Appt</span>
                  <strong className="text-xs font-black text-blue-600 dark:text-cyan-400">Nov 6, 2026</strong>
                </div>
                <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-[#050e20] border border-slate-100 dark:border-blue-900/40">
                  <span className="text-[10px] text-slate-400 block font-semibold">Total Visits</span>
                  <strong className="text-xs font-black text-emerald-500">12</strong>
                </div>
              </div>
            </div>

            {/* Quick Actions (4 gradient buttons) */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#091838] border border-slate-200 dark:border-blue-900/50 shadow-sm space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Quick Actions
              </h4>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setShowNewTestModal(true)}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer transition-transform active:scale-95"
                >
                  <FlaskConical size={16} />
                  <span>New Test Request</span>
                </button>

                <button
                  type="button"
                  onClick={() => notify('Retrieving 12-month historical laboratory archive...')}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer transition-transform active:scale-95"
                >
                  <History size={16} />
                  <span>View History</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer transition-transform active:scale-95"
                >
                  <Printer size={16} />
                  <span>Print Report</span>
                </button>

                <button
                  type="button"
                  onClick={() => notify('Encrypted PDF lab summary generated and copied to share link.')}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer transition-transform active:scale-95"
                >
                  <Share2 size={16} />
                  <span>Share Results</span>
                </button>
              </div>
            </div>

            {/* Lab Status Capsule */}
            <div className="p-4 rounded-3xl bg-white dark:bg-[#091838] border border-slate-200 dark:border-blue-900/50 shadow-sm flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Lab Status</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                    Connected
                  </span>
                </div>
                <p className="text-xs font-black text-slate-900 dark:text-white mt-1">Lab Analyzer Online</p>
                <p className="text-[10px] text-slate-400">Last Sync: 2 min ago</p>
              </div>

              {/* 3D Machine Illustration */}
              <div className="w-16 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-cyan-400">
                <CheckCircle2 size={24} className="text-emerald-500" />
              </div>
            </div>

          </div>

          {/* --------------------------------------------------------------------- */}
          {/* RIGHT/CENTER: Laboratory Test Analyzer Main Panel (8 Cols)            */}
          {/* --------------------------------------------------------------------- */}
          <div className="lg:col-span-8 space-y-5">
            
            {/* Banner Header with Microscope & Date Filter */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-600 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
              <div className="flex items-center gap-3.5 z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-2xl shadow-inner">
                  🔬
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Laboratory Test Analyzer
                  </h2>
                  <p className="text-xs sm:text-sm text-blue-100 font-medium">
                    Smart analysis of lab results with AI insights
                  </p>
                </div>
              </div>

              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold text-xs rounded-xl px-3 py-1.5 focus:outline-none z-10 cursor-pointer"
              >
                <option value="Last 30 Days" className="text-slate-900">📅 Last 30 Days</option>
                <option value="Last 3 Months" className="text-slate-900">📅 Last 3 Months</option>
                <option value="Last 6 Months" className="text-slate-900">📅 Last 6 Months</option>
                <option value="Last Year" className="text-slate-900">📅 Last Year</option>
              </select>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
              {[
                { id: 'results', label: '💧 Test Results' },
                { id: 'microscopy', label: '🔬 Microscopic Scanner & Camera' },
                { id: 'requests', label: '📋 Test Requests' },
                { id: 'reports', label: '📑 Lab Reports' },
                { id: 'history', label: '🕒 History' },
                { id: 'analytics', label: '📊 Analytics' }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id as any)}
                  className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === t.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white dark:bg-[#091838] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-blue-900/40 border border-slate-200 dark:border-blue-900/50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* ================================================================= */}
            {/* MICROBIOLOGY & DIGITAL MICROSCOPIC SCANNER WORKBENCH              */}
            {/* ================================================================= */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#091838] border border-slate-200 dark:border-blue-900/50 shadow-md space-y-4">
              
              {/* Header with Camera/Slide toggle and Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-blue-900/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-sm">
                    <Scan size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Digital Microscopic Slide & Camera Scanner</span>
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-500 dark:text-cyan-400 text-[10px] font-bold border border-cyan-500/30">
                        {scannerSource === 'camera' ? '📷 Optical Hardware' : '🔬 Specimen AI'}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Real-time pathogen recognition, parasite density quantification, and cell differentials
                    </p>
                  </div>
                </div>

                {/* Source Selection Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      stopCameraStream();
                      setScannerSource('slide');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      scannerSource === 'slide'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-[#050e20] text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    Specimen Slides
                  </button>

                  <button
                    type="button"
                    onClick={startCameraStream}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      scannerSource === 'camera'
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-[#050e20] text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    <Camera size={13} />
                    <span>Live Camera</span>
                  </button>
                </div>
              </div>

              {/* Specimen Slide Selector (When slide mode active) */}
              {scannerSource === 'slide' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'malaria', label: 'Peripheral Blood (Malaria P.f)', badge: 'Thick/Thin Smear' },
                    { id: 'gram', label: 'Gram Stain (Bacterial Smear)', badge: 'G+ / G- Differential' },
                    { id: 'urine', label: 'Urinalysis Microscopic Sediment', badge: 'Casts & Crystals' },
                    { id: 'afb', label: 'Ziehl-Neelsen Stain (TB AFB)', badge: 'Acid-Fast Bacilli' }
                  ].map(slide => (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => setSelectedSlide(slide.id as any)}
                      className={`p-2.5 rounded-2xl text-left border transition-all cursor-pointer ${
                        selectedSlide === slide.id
                          ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300 shadow-sm'
                          : 'bg-slate-50 dark:bg-[#050e20] border-slate-200 dark:border-blue-900/30 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xs font-black block truncate">{slide.label}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">{slide.badge}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Microscope Circular Field / Viewport */}
              <div className="relative w-full h-72 sm:h-84 rounded-3xl bg-[#030914] border border-blue-900/60 overflow-hidden flex items-center justify-center select-none shadow-inner">
                
                {/* Microscope Circular Field Aperture Frame */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_55%,rgba(3,9,20,0.95)_70%,#030914_100%)] pointer-events-none z-20" />

                {/* Reticle Crosshair & Scale Bar */}
                <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
                  <div className="w-12 h-px bg-cyan-400/40" />
                  <div className="h-12 w-px bg-cyan-400/40 absolute" />
                  <div className="w-24 h-24 rounded-full border border-cyan-400/20 absolute" />
                </div>

                {/* Top Overlay HUD: Objective & Focus Telemetry */}
                <div className="absolute top-3 left-4 z-30 flex items-center gap-2 text-[10px] font-mono text-cyan-300 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-cyan-500/30">
                  <Target size={12} className="text-cyan-400 animate-pulse" />
                  <span>MAG: {objectiveLens}</span>
                  <span>•</span>
                  <span>ILLUM: {illumination}%</span>
                  <span>•</span>
                  <span>FIELD: {objectiveLens === '100x' ? '0.18 mm² (Oil)' : objectiveLens === '40x' ? '0.45 mm²' : '1.8 mm²'}</span>
                </div>

                {/* Top Right: AI toggle indicator */}
                <div className="absolute top-3 right-4 z-30 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAiOverlay(prev => !prev)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                      showAiOverlay
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700'
                    }`}
                  >
                    AI Labels: {showAiOverlay ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* Scanner Content: Camera Video or High-Res Slide */}
                {scannerSource === 'camera' ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                      style={{
                        filter: `blur(${focusLevel}px) brightness(${illumination}%)`
                      }}
                    />
                    {cameraError && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-4 text-center text-xs text-amber-300 z-10">
                        {cameraError}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Digital Specimen Slide Canvas Representation */
                  <div 
                    className="relative w-full h-full flex items-center justify-center"
                    style={{
                      filter: `blur(${focusLevel}px) brightness(${illumination}%)`,
                      transform: objectiveLens === '100x' ? 'scale(1.25)' : objectiveLens === '40x' ? 'scale(1.05)' : 'scale(0.95)',
                      transition: 'transform 0.4s ease, filter 0.2s ease'
                    }}
                  >
                    {/* Specimen Slide: Malaria Thick/Thin Film */}
                    {selectedSlide === 'malaria' && (
                      <div className="relative w-full h-full bg-[#12081f] flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#ec4899_1.5px,transparent_1.5px)] [background-size:20px_20px]" />
                        
                        {[
                          { x: '25%', y: '35%', infected: true, name: 'P. falciparum ring', conf: '99.4%' },
                          { x: '68%', y: '40%', infected: true, name: 'P. falciparum ring', conf: '98.8%' },
                          { x: '45%', y: '65%', infected: true, name: 'Trophozoite schizont', conf: '97.2%' },
                          { x: '75%', y: '72%', infected: false, name: 'Normocytic RBC', conf: '99.1%' },
                          { x: '35%', y: '75%', infected: false, name: 'Normochromic RBC', conf: '98.5%' },
                          { x: '55%', y: '30%', infected: false, name: 'Erythrocyte', conf: '98.9%' },
                          { x: '18%', y: '60%', infected: false, name: 'Erythrocyte', conf: '97.8%' }
                        ].map((cell, idx) => (
                          <div
                            key={idx}
                            className="absolute -translate-x-1/2 -translate-y-1/2"
                            style={{ left: cell.x, top: cell.y }}
                          >
                            <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center ${
                              cell.infected
                                ? 'bg-rose-950/50 border-rose-400/80 shadow-lg shadow-rose-500/20'
                                : 'bg-pink-950/30 border-pink-400/50'
                            }`}>
                              {cell.infected && (
                                <div className="relative w-5 h-5 rounded-full border-2 border-cyan-400 flex items-top justify-end p-0.5 animate-pulse">
                                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                </div>
                              )}
                            </div>

                            {showAiOverlay && (
                              <div className={`absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                                cell.infected
                                  ? 'bg-rose-950/90 text-rose-300 border-rose-500'
                                  : 'bg-blue-950/80 text-cyan-300 border-blue-500/60'
                              }`}>
                                {cell.name} • {cell.conf}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Specimen Slide: Gram Stain Smear */}
                    {selectedSlide === 'gram' && (
                      <div className="relative w-full h-full bg-[#0a0518] flex items-center justify-center overflow-hidden">
                        <div className="absolute left-[30%] top-[40%] p-3 rounded-2xl border border-purple-500/40 bg-purple-950/30">
                          <div className="grid grid-cols-4 gap-1">
                            {Array.from({ length: 16 }).map((_, i) => (
                              <div key={i} className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm shadow-purple-400" />
                            ))}
                          </div>
                          {showAiOverlay && (
                            <span className="block mt-1 text-[8px] font-mono text-purple-300 bg-black/80 px-1 rounded">
                              Gram+ Cocci Clusters • 98.9%
                            </span>
                          )}
                        </div>

                        <div className="absolute right-[28%] top-[50%] p-3 rounded-2xl border border-rose-500/40 bg-rose-950/30">
                          <div className="space-y-1.5">
                            <div className="w-9 h-2.5 rounded-full bg-rose-400 rotate-12 shadow-sm shadow-rose-400" />
                            <div className="w-8 h-2 rounded-full bg-rose-400 -rotate-6 shadow-sm shadow-rose-400" />
                            <div className="w-10 h-2.5 rounded-full bg-rose-400 rotate-45 shadow-sm shadow-rose-400" />
                          </div>
                          {showAiOverlay && (
                            <span className="block mt-1 text-[8px] font-mono text-rose-300 bg-black/80 px-1 rounded">
                              Gram- Bacilli (Rods) • 97.4%
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Specimen Slide: Urinalysis Sediment */}
                    {selectedSlide === 'urine' && (
                      <div className="relative w-full h-full bg-[#141208] flex items-center justify-center overflow-hidden">
                        <div className="absolute left-[35%] top-[38%] p-3 rounded-xl border border-amber-500/50 bg-amber-950/30">
                          <div className="w-8 h-8 border-2 border-amber-300 rotate-45 relative flex items-center justify-center">
                            <div className="w-full h-px bg-amber-300 absolute" />
                            <div className="h-full w-px bg-amber-300 absolute" />
                          </div>
                          {showAiOverlay && (
                            <span className="block mt-2 text-[8px] font-mono text-amber-300 bg-black/80 px-1 rounded">
                              Calcium Oxalate Envelope • 96.8%
                            </span>
                          )}
                        </div>

                        <div className="absolute right-[30%] top-[45%] p-3 rounded-xl border border-cyan-500/50 bg-cyan-950/30">
                          <div className="w-20 h-6 rounded-full border border-cyan-300/60 bg-cyan-900/30" />
                          {showAiOverlay && (
                            <span className="block mt-1 text-[8px] font-mono text-cyan-300 bg-black/80 px-1 rounded">
                              Hyaline Cast (Tamm-Horsfall) • 94.6%
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Specimen Slide: Ziehl-Neelsen AFB TB Smear */}
                    {selectedSlide === 'afb' && (
                      <div className="relative w-full h-full bg-[#051424] flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1.5px,transparent_1.5px)] [background-size:24px_24px]" />
                        
                        <div className="absolute left-[40%] top-[45%] p-3 rounded-2xl border border-rose-500/60 bg-rose-950/40">
                          <div className="flex gap-2 items-center">
                            <div className="w-6 h-1.5 rounded-full bg-red-500 shadow-md shadow-red-500 rotate-12" />
                            <div className="w-7 h-1.5 rounded-full bg-red-500 shadow-md shadow-red-500 -rotate-45" />
                          </div>
                          {showAiOverlay && (
                            <span className="block mt-1 text-[8px] font-mono text-red-300 bg-black/80 px-1 rounded">
                              Acid-Fast Bacilli (M. tuberculosis) • 99.2%
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* Laser Scanning Line Animation when analyzing */}
                {isAnalyzing && (
                  <motion.div
                    initial={{ top: '0%' }}
                    animate={{ top: '100%' }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent z-40 shadow-[0_0_15px_#00e5ff]"
                  />
                )}

                {/* Bottom Left Scale Indicator */}
                <div className="absolute bottom-3 left-4 z-30 text-[9px] font-mono text-slate-400 bg-black/60 px-2.5 py-1 rounded-md border border-slate-700/60">
                  <span>SCALE: 10 µm | 100x Oil Phase Contrast</span>
                </div>
              </div>

              {/* Optical Controls Toolbar */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center pt-2">
                
                {/* 1. Objective Selector (4 Cols) */}
                <div className="md:col-span-4 flex items-center gap-1.5 bg-slate-50 dark:bg-[#050e20] p-1 rounded-2xl border border-slate-200 dark:border-blue-900/40">
                  {(['10x', '40x', '100x'] as const).map(obj => (
                    <button
                      key={obj}
                      type="button"
                      onClick={() => setObjectiveLens(obj)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        objectiveLens === obj
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {obj}
                    </button>
                  ))}
                </div>

                {/* 2. Focus & Illumination Sliders (5 Cols) */}
                <div className="md:col-span-5 grid grid-cols-2 gap-2 text-[10px] font-bold">
                  {/* Focus Slider */}
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#050e20] border border-slate-200 dark:border-blue-900/40">
                    <div className="flex justify-between text-slate-500 mb-1">
                      <span>Fine Focus</span>
                      <span className="font-mono text-blue-500">{focusLevel === 0 ? 'Crisp (0)' : `+${focusLevel}`}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="4"
                      step="1"
                      value={focusLevel}
                      onChange={(e) => setFocusLevel(Number(e.target.value))}
                      className="w-full h-1 bg-slate-200 dark:bg-blue-900 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  {/* Illumination Slider */}
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#050e20] border border-slate-200 dark:border-blue-900/40">
                    <div className="flex justify-between text-slate-500 mb-1">
                      <span>Light Intensity</span>
                      <span className="font-mono text-cyan-500">{illumination}%</span>
                    </div>
                    <input
                      type="range"
                      min="70"
                      max="140"
                      step="5"
                      value={illumination}
                      onChange={(e) => setIllumination(Number(e.target.value))}
                      className="w-full h-1 bg-slate-200 dark:bg-blue-900 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>
                </div>

                {/* 3. Capture & Analyze Slide Button (3 Cols) */}
                <div className="md:col-span-3">
                  <button
                    type="button"
                    disabled={isAnalyzing}
                    onClick={handleCaptureAndAnalyze}
                    className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-cyan-600/25 transition-transform active:scale-95 cursor-pointer disabled:opacity-60"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Scanning...</span>
                      </>
                    ) : (
                      <>
                        <Camera size={14} />
                        <span>Analyze Slide</span>
                      </>
                    )}
                  </button>
                </div>

              </div>

              {/* Latest Microscopic Analysis Telemetry Banner */}
              {lastAnalysis && (
                <div className="p-3.5 rounded-2xl bg-cyan-50 dark:bg-[#071936] border border-cyan-200 dark:border-cyan-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 dark:text-white">{lastAnalysis.specimen}</span>
                      <span className="px-2 py-0.2 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                        AI Conf: {lastAnalysis.confidence}%
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-cyan-700 dark:text-cyan-300 font-bold">
                      {lastAnalysis.density}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {lastAnalysis.differential}
                    </p>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    Timestamp: {lastAnalysis.timestamp}
                  </span>
                </div>
              )}

            </div>

            {/* ================================================================= */}
            {/* INFORMATIVE CARD: AUTOMATED PATHOGEN DIFFERENTIAL & TELEMETRY     */}
            {/* ================================================================= */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-900/40 via-[#0a1836] to-[#040e22] border border-blue-500/50 shadow-lg text-white space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-blue-800/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-cyan-400 flex items-center justify-center border border-blue-500/40">
                    <Dna size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white tracking-wide">
                      Automated Pathogen Differential & Molecular Assay Telemetry
                    </h3>
                    <p className="text-[10px] text-cyan-300 font-medium">
                      Multi-Parameter Clinical Pathology & Hemolysis Interference Profile
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider self-start sm:self-auto flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-emerald-400" />
                  ISO 15189 Certified Tele-Pathology
                </span>
              </div>

              {/* Telemetry Metric Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                
                {/* 1. Patient Identifiers */}
                <div className="p-3 rounded-2xl bg-[#061127] border border-blue-900/60 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block font-bold">National ID (NIN)</span>
                  <strong className="text-xs font-mono font-black text-cyan-300 block truncate">CM8802914209LK</strong>
                  <span className="text-[10px] text-slate-300 font-medium">Sarah Nakato • 28y F</span>
                </div>

                {/* 2. Blood & Genotype Profile */}
                <div className="p-3 rounded-2xl bg-[#061127] border border-blue-900/60 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block font-bold">Blood Group & Genotype</span>
                  <strong className="text-xs font-mono font-black text-emerald-400 block">O+ (Rh Positive)</strong>
                  <span className="text-[10px] text-slate-300 font-medium">HbAA (Normal Adult Hb)</span>
                </div>

                {/* 3. Specimen Tube & QC Lot */}
                <div className="p-3 rounded-2xl bg-[#061127] border border-blue-900/60 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block font-bold">Specimen Batch</span>
                  <strong className="text-xs font-mono font-black text-purple-300 block truncate">SPEC-KLA-2026-9812</strong>
                  <span className="text-[10px] text-slate-300 font-medium">Whole Blood K2-EDTA</span>
                </div>

                {/* 4. Spectrophotometric Indices */}
                <div className="p-3 rounded-2xl bg-[#061127] border border-blue-900/60 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block font-bold">HIL Quality Index</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-black text-emerald-400">Optimal (0.01%)</span>
                  </div>
                  <span className="text-[10px] text-slate-300 font-medium">Hemolysis Grade 0 (Clear)</span>
                </div>

              </div>

              {/* Clinical Verification Summary Ribbon */}
              <div className="pt-2 border-t border-blue-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span>
                    Cross-matched with Mulago National Blood Bank & VHT Health Sub-District network. Zero transfusion incompatibilities detected.
                  </span>
                </div>
                <span className="font-mono text-[10px] text-cyan-300 font-bold shrink-0">
                  Validated by Dr. Joseph Akora (Consultant Pathologist)
                </span>
              </div>
            </div>

            {/* Test Results Overview + Categories + AI Insight */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Card 1: 96% Overall Health Score Donut */}
              <div className="p-4 rounded-3xl bg-white dark:bg-[#091838] border border-slate-200 dark:border-blue-900/50 shadow-sm flex flex-col justify-between space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Test Results Overview
                </h4>

                <div className="flex items-center justify-center gap-3 py-1">
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="3.5" />
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#10b981" strokeWidth="3.5" strokeDasharray="96, 100" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-base font-black text-slate-900 dark:text-white">96%</span>
                      <span className="text-[7px] font-bold text-slate-400 uppercase">Health Score</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-[11px]">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> All Tests Normal: 8
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                      <span className="w-2 h-2 rounded-full bg-amber-500" /> Slight Attention: 1
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                      <span className="w-2 h-2 rounded-full bg-rose-500" /> Requires Follow-up: 0
                    </div>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold flex items-center justify-between">
                  <span>Great! Your results are mostly normal.</span>
                  <ChevronRight size={12} />
                </div>
              </div>

              {/* Card 2: Lab Test Categories (Donut) */}
              <div className="p-4 rounded-3xl bg-white dark:bg-[#091838] border border-slate-200 dark:border-blue-900/50 shadow-sm flex flex-col justify-between space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Lab Test Categories
                </h4>

                <div className="flex items-center justify-center gap-3 py-1">
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#3b82f6" strokeWidth="3.5" strokeDasharray="40, 100" />
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#06b6d4" strokeWidth="3.5" strokeDasharray="30, 100" strokeDashoffset="-40" />
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#10b981" strokeWidth="3.5" strokeDasharray="20, 100" strokeDashoffset="-70" />
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#a855f7" strokeWidth="3.5" strokeDasharray="10, 100" strokeDashoffset="-90" />
                    </svg>
                  </div>

                  <div className="space-y-1 text-[10px] font-semibold">
                    <div className="flex items-center gap-1.5 text-blue-500">
                      <span className="w-2 h-2 rounded-full bg-blue-500" /> Blood Tests 40%
                    </div>
                    <div className="flex items-center gap-1.5 text-cyan-500">
                      <span className="w-2 h-2 rounded-full bg-cyan-500" /> Urine Tests 30%
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-500">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> Biochemistry 20%
                    </div>
                    <div className="flex items-center gap-1.5 text-purple-500">
                      <span className="w-2 h-2 rounded-full bg-purple-500" /> Others 10%
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 font-mono text-center pt-1 border-t border-slate-100 dark:border-blue-900/40">
                  Total Parameters Profiled: 32
                </div>
              </div>

              {/* Card 3: AI Lab Insight with Lightbulb */}
              <div className="p-4 rounded-3xl bg-gradient-to-br from-[#0c204c] to-[#061430] border border-blue-500/40 text-white shadow-sm flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-xs">
                    <Sparkles size={14} />
                    <span>AI Lab Insight</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 text-[9px] font-bold">
                    Powered by Doctorian AI
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300 shrink-0">
                    <Lightbulb size={20} />
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    Your blood sugar and cholesterol levels are within normal range. Continue with a balanced diet and regular exercise.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => notify('Displaying detailed clinical biochemical breakdown...')}
                  className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <span>View Details</span>
                  <ChevronRight size={14} />
                </button>
              </div>

            </div>

            {/* Recent Test Results Table & Trends Graph */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              {/* Test Results Table (7 Cols) */}
              <div className="lg:col-span-7 p-4 rounded-3xl bg-white dark:bg-[#091838] border border-slate-200 dark:border-blue-900/50 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-blue-900/40">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Recent Test Results
                  </h4>
                  <button type="button" className="text-xs text-blue-600 dark:text-cyan-400 font-bold hover:underline">
                    View All Results →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-[#050e20] text-slate-400 font-mono text-[10px] uppercase">
                      <tr>
                        <th className="p-2.5">Test Name</th>
                        <th className="p-2.5">Result</th>
                        <th className="p-2.5">Normal Range</th>
                        <th className="p-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-blue-900/30">
                      {filteredTests.map((t, idx) => (
                        <tr key={idx} className="hover:bg-blue-50/50 dark:hover:bg-blue-950/30">
                          <td className="p-2.5 font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            {t.name}
                          </td>
                          <td className="p-2.5 font-mono font-black text-blue-600 dark:text-cyan-300">
                            {t.result}
                          </td>
                          <td className="p-2.5 font-mono text-slate-400 text-[11px]">
                            {t.normal}
                          </td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                              ● Normal
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 6-Month Test Trends Graph (5 Cols) */}
              <div className="lg:col-span-5 p-4 rounded-3xl bg-white dark:bg-[#091838] border border-slate-200 dark:border-blue-900/50 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-blue-900/40">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Test Trends
                  </h4>
                  <span className="text-[10px] text-slate-400 font-bold">6 Months</span>
                </div>

                {/* Legends */}
                <div className="flex items-center gap-3 text-[10px] font-bold">
                  <span className="flex items-center gap-1 text-blue-500">
                    <span className="w-2 h-2 rounded-full bg-blue-500" /> Hemoglobin
                  </span>
                  <span className="flex items-center gap-1 text-purple-500">
                    <span className="w-2 h-2 rounded-full bg-purple-500" /> Blood Sugar
                  </span>
                  <span className="flex items-center gap-1 text-emerald-500">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Cholesterol
                  </span>
                </div>

                {/* Trends SVG */}
                <div className="h-36 w-full relative pt-2">
                  <svg className="w-full h-full" viewBox="0 0 240 100" preserveAspectRatio="none">
                    <line x1="0" y1="20" x2="240" y2="20" stroke="currentColor" strokeOpacity="0.08" />
                    <line x1="0" y1="50" x2="240" y2="50" stroke="currentColor" strokeOpacity="0.08" />
                    <line x1="0" y1="80" x2="240" y2="80" stroke="currentColor" strokeOpacity="0.08" />

                    {/* Cholesterol (Green) */}
                    <path
                      d="M10,25 Q50,20 90,26 T170,22 T230,18"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                    />
                    {/* Blood Sugar (Purple) */}
                    <path
                      d="M10,48 Q50,42 90,46 T170,44 T230,40"
                      fill="none"
                      stroke="#a855f7"
                      strokeWidth="2.5"
                    />
                    {/* Hemoglobin (Blue) */}
                    <path
                      d="M10,72 Q50,68 90,70 T170,74 T230,65"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2.5"
                    />

                    {/* Points */}
                    <circle cx="10" cy="25" r="3" fill="#10b981" />
                    <circle cx="90" cy="26" r="3" fill="#10b981" />
                    <circle cx="170" cy="22" r="3" fill="#10b981" />
                    <circle cx="230" cy="18" r="3" fill="#10b981" />
                  </svg>
                  <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-1">
                    <span>Jun</span>
                    <span>Jul</span>
                    <span>Aug</span>
                    <span>Sep</span>
                    <span>Oct</span>
                    <span>Nov</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Verification Strip */}
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300">
                <ShieldCheck size={20} className="shrink-0" />
                <div>
                  <span className="font-black block">Lab Results Verified</span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                    All test results have been securely verified and stored in your medical record.
                  </span>
                </div>
              </div>

              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 shrink-0">
                <Check size={14} /> Verified at 09:20 AM
              </span>
            </div>

          </div>

        </div>

      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-blue-600 text-white text-xs font-bold shadow-xl animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* New Test Request Modal */}
      {showNewTestModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#081736] border border-blue-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-blue-900/40">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Request New Lab Panel</h3>
              <button onClick={() => setShowNewTestModal(false)} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>
            <p className="text-slate-500 dark:text-slate-300">
              Select diagnostic profiles to run via Doctorian Laboratory Analyzer:
            </p>
            <div className="space-y-2">
              {['Comprehensive Metabolic Panel (CMP)', 'Lipid Profile (Cholesterol, HDL, LDL)', 'Hemoglobin A1c (HbA1c)', 'Full Blood Count (FBC)'].map((p, i) => (
                <label key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-[#050e20] border border-slate-200 dark:border-blue-900/40 cursor-pointer">
                  <input type="checkbox" defaultChecked={i === 0} className="rounded text-blue-600" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">{p}</span>
                </label>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setShowNewTestModal(false);
                notify('New laboratory test orders submitted to automated analyzer.');
              }}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black"
            >
              Confirm Lab Order
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default DiagnosticLab;
