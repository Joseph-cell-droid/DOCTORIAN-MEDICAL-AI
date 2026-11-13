import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Image as ImageIcon, 
  Search, 
  Upload, 
  Camera, 
  FileText, 
  History, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Brain, 
  Heart, 
  Wind, 
  Lightbulb, 
  Download, 
  Plus, 
  Share2, 
  Activity, 
  ShieldCheck, 
  ChevronRight, 
  User, 
  Clock, 
  Check, 
  X, 
  Cpu
} from 'lucide-react';
import { User as UserType } from '../api';

interface MedicalIllustratorProps {
  user?: UserType | null;
  onRefreshUser?: () => void;
  onNavigate?: (view: string) => void;
}

export const MedicalIllustrator: React.FC<MedicalIllustratorProps> = ({ user, onRefreshUser, onNavigate }) => {
  const [selectedModality, setSelectedModality] = useState<'xray' | 'mri' | 'ct' | 'ultrasound' | 'others'>('xray');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState<'results' | 'requests' | 'reports' | 'history'>('results');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedScanUrl, setUploadedScanUrl] = useState<string | null>(null);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  const notify = (msg: string) => {
    setStatusNotification(msg);
    setTimeout(() => setStatusNotification(null), 3500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsAnalyzing(true);
      const url = URL.createObjectURL(file);
      setUploadedScanUrl(url);
      setTimeout(() => {
        setIsAnalyzing(false);
        notify('Medical scan successfully parsed and evaluated with 98% AI diagnostic confidence.');
      }, 1200);
    }
  };

  // Modality Images
  const scanImages = {
    xray: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80',
    mri: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&auto=format&fit=crop&q=80',
    ct: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&auto=format&fit=crop&q=80',
    ultrasound: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80',
    others: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80'
  };

  const currentScanImage = uploadedScanUrl || scanImages[selectedModality];

  return (
    <div className="w-full min-h-screen bg-[#071329] text-white font-sans pb-16 overflow-x-hidden border-box">
      
      {/* ========================================================================= */}
      {/* TOP HEADER BAR (Matching image_2f1a7d2e.png)                              */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-30 w-full bg-[#081736]/95 backdrop-blur-md border-b border-blue-900/40 px-4 sm:px-6 lg:px-8 py-3.5 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
              <Heart size={20} className="fill-white" />
            </div>
            <div>
              <h2 className="text-base font-black text-white leading-tight">Doctorian AI</h2>
              <p className="text-[10px] text-cyan-300 font-medium">Smarter Healthcare, Better Life</p>
            </div>
          </div>

          {/* Search anything */}
          <div className="flex-1 max-w-md hidden sm:block relative">
            <Search size={15} className="absolute left-3.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search anything... (Ctrl + K)"
              className="w-full pl-9 pr-4 py-1.5 bg-[#050e20] border border-blue-800/60 rounded-full text-xs text-white placeholder-slate-400 focus:outline-none"
            />
          </div>

          {/* Status & Profile */}
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold flex items-center gap-1.5 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </span>

            <div className="flex items-center gap-2 pl-2 pr-3 py-1 bg-[#050e20] rounded-full border border-blue-800/60">
              <img
                src="/african_doctor_male.png"
                alt="Attending Clinician"
                className="w-7 h-7 rounded-full object-cover border border-blue-400"
              />
              <span className="text-xs font-bold hidden md:inline">Attending Clinician</span>
            </div>
          </div>

        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN SPLIT WORKSPACE (Image Analysis on Left, Lab Analyzer on Right)       */}
      {/* ========================================================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ===================================================================== */}
          {/* LEFT HALF: AI Image Analysis (6 Cols)                                  */}
          {/* ===================================================================== */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* Header Banner */}
            <div className="p-4 rounded-3xl bg-[#091b3d] border border-blue-500/30 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-lg shadow">
                  🖼️
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white">AI Image Analysis</h3>
                  <p className="text-[11px] text-slate-300">Upload or capture medical images for instant analysis</p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 hidden sm:inline">
                ✓ Powered by Doctorian AI
              </span>
            </div>

            {/* Modality Selector Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
              {[
                { id: 'xray', label: '🩻 X-Ray' },
                { id: 'mri', label: '🧠 MRI' },
                { id: 'ct', label: '🩻 CT Scan' },
                { id: 'ultrasound', label: '📡 Ultrasound' },
                { id: 'others', label: '⚙️ Others' },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedModality(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    selectedModality === tab.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-[#051024] text-slate-300 hover:bg-blue-900/40 border border-blue-900/40'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Scan Image Viewport with Controls */}
            <div className="relative rounded-3xl bg-[#030914] border-2 border-blue-500/40 overflow-hidden shadow-2xl h-72 sm:h-80 flex items-center justify-center p-2">
              
              {/* Image */}
              <div 
                className="w-full h-full flex items-center justify-center overflow-hidden transition-transform duration-200"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                <img
                  src={currentScanImage}
                  alt="Medical Scan"
                  className="w-full h-full object-contain rounded-2xl"
                />
              </div>

              {/* Analysis Complete Badge */}
              <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-bold backdrop-blur-md">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>{isAnalyzing ? 'Analyzing Scan...' : 'Analysis Complete'}</span>
              </div>

              {/* Zoom Controls Bottom Dock */}
              <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-[#051126]/90 border border-blue-500/40 backdrop-blur-md rounded-xl p-1 text-slate-300">
                <button
                  type="button"
                  onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2.5))}
                  className="p-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.75))}
                  className="p-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(1)}
                  className="p-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                  title="Reset Zoom"
                >
                  <Minimize2 size={14} />
                </button>
              </div>

            </div>

            {/* Analysis Result Card with Confidence & Key Findings */}
            <div className="p-5 rounded-3xl bg-[#091838] border border-blue-900/50 shadow-sm space-y-4">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">Normal Lungs</h4>
                    <p className="text-[11px] text-slate-400">No obvious abnormality detected</p>
                  </div>
                </div>

                {/* 98% Confidence Donut Gauge */}
                <div className="relative w-14 h-14 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#051024" strokeWidth="3.5" />
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#10b981" strokeWidth="3.5" strokeDasharray="98, 100" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[11px] font-black text-emerald-400">98%</span>
                    <span className="text-[6px] font-bold text-slate-400 uppercase">Confidence</span>
                  </div>
                </div>
              </div>

              {/* Key Findings with Glowing Lungs Hologram */}
              <div className="grid grid-cols-12 gap-3 items-center pt-1 border-t border-blue-900/40">
                <div className="col-span-8 space-y-2 text-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">Key Findings</span>
                  <div className="flex items-center gap-2 text-slate-200">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                    <span>Clear lung fields</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-200">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                    <span>Normal heart size</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-200">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                    <span>No signs of pneumonia or consolidation</span>
                  </div>
                </div>

                {/* Glowing Lungs Hologram Graphic */}
                <div className="col-span-4 h-24 rounded-2xl bg-gradient-to-b from-[#051126] to-[#020712] border border-cyan-500/30 flex items-center justify-center p-2">
                  <svg className="w-full h-full max-h-20" viewBox="0 0 80 80" fill="none">
                    <path
                      d="M25,20 C18,30 15,45 20,60 C25,65 35,62 38,55 C40,48 38,30 35,22 Z"
                      stroke="#00e5ff"
                      strokeWidth="2"
                      fill="#00e5ff"
                      fillOpacity="0.15"
                      className="animate-pulse"
                    />
                    <path
                      d="M55,20 C62,30 65,45 60,60 C55,65 45,62 42,55 C40,48 42,30 45,22 Z"
                      stroke="#00e5ff"
                      strokeWidth="2"
                      fill="#00e5ff"
                      fillOpacity="0.15"
                      className="animate-pulse"
                    />
                    <path d="M40,15 L40,40 M40,30 L32,45 M40,30 L48,45" stroke="#00e5ff" strokeWidth="2" />
                  </svg>
                </div>
              </div>

              {/* Recommendations & View Full Report */}
              <div className="p-3 rounded-2xl bg-[#051024] border border-blue-900/40 text-xs space-y-2">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Lightbulb size={14} />
                  <span>Recommendations</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Continue regular check-ups and consult a doctor for any symptoms. Repeat scan in 12 months.
                </p>
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => notify('Downloading full diagnostic radiologic report...')}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                  >
                    View Full Report
                  </button>
                </div>
              </div>

            </div>

            {/* AI Insights & Quick Actions Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* AI Insights with Glowing Brain */}
              <div className="p-4 rounded-3xl bg-gradient-to-br from-[#0c204c] to-[#061430] border border-blue-500/40 shadow-sm flex flex-col justify-between space-y-2">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                  <Sparkles size={14} />
                  <span>AI Insights</span>
                </div>
                <p className="text-xs text-slate-200">
                  Subtle bronchial vascular marking detected. Baseline normal variant.
                </p>
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => notify('Displaying neural feature activation map...')}
                    className="text-xs text-cyan-300 font-bold hover:underline flex items-center gap-1"
                  >
                    <span>Learn More</span>
                    <ChevronRight size={12} />
                  </button>
                  <Brain size={24} className="text-cyan-400 animate-pulse" />
                </div>
              </div>

              {/* 4 Quick Actions (Upload, Capture, Scan, History) */}
              <div className="p-3 rounded-3xl bg-[#091838] border border-blue-900/50 shadow-sm grid grid-cols-2 gap-2 text-[10px] font-bold">
                <label className="p-2.5 rounded-xl bg-[#051024] hover:bg-blue-900/50 border border-blue-900/40 text-center flex flex-col items-center justify-center gap-1 cursor-pointer">
                  <Upload size={14} className="text-blue-400" />
                  <span>Upload Image</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>

                <button
                  type="button"
                  onClick={() => notify('Opening medical camera scanner...')}
                  className="p-2.5 rounded-xl bg-[#051024] hover:bg-blue-900/50 border border-blue-900/40 text-center flex flex-col items-center justify-center gap-1"
                >
                  <Camera size={14} className="text-cyan-400" />
                  <span>Capture Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => notify('Optical document parser initialized.')}
                  className="p-2.5 rounded-xl bg-[#051024] hover:bg-blue-900/50 border border-blue-900/40 text-center flex flex-col items-center justify-center gap-1"
                >
                  <FileText size={14} className="text-emerald-400" />
                  <span>Scan Document</span>
                </button>

                <button
                  type="button"
                  onClick={() => notify('Retrieving prior radiographic studies...')}
                  className="p-2.5 rounded-xl bg-[#051024] hover:bg-blue-900/50 border border-blue-900/40 text-center flex flex-col items-center justify-center gap-1"
                >
                  <History size={14} className="text-purple-400" />
                  <span>View History</span>
                </button>
              </div>

            </div>

          </div>

          {/* ===================================================================== */}
          {/* RIGHT HALF: Laboratory Test Analyzer Summary (6 Cols)                 */}
          {/* ===================================================================== */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* Header with New Test Request Button */}
            <div className="p-4 rounded-3xl bg-[#091b3d] border border-blue-500/30 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center text-lg shadow">
                  🔬
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white">Laboratory Test Analyzer</h3>
                  <p className="text-[11px] text-slate-300">Smart analysis of lab results with AI insights</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => notify('Opening lab test requisition form...')}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1 shadow cursor-pointer"
              >
                <Plus size={14} />
                <span>New Test Request</span>
              </button>
            </div>

            {/* Sub-tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
              {[
                { id: 'results', label: '💧 Test Results' },
                { id: 'requests', label: '📋 Test Requests' },
                { id: 'reports', label: '📑 Lab Reports' },
                { id: 'history', label: '🕒 History' },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveRightTab(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    activeRightTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-[#051024] text-slate-300 hover:bg-blue-900/40 border border-blue-900/40'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Patient Header Capsule: Sarah Nakato */}
            <div className="p-4 rounded-3xl bg-[#091838] border border-blue-900/50 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80"
                  alt="Sarah Nakato"
                  className="w-12 h-12 rounded-2xl object-cover border border-blue-400"
                />
                <div>
                  <h4 className="text-sm font-black text-white">Sarah Nakato</h4>
                  <p className="text-[11px] text-slate-400">PID: PT-00124 • Age: 28 • Female</p>
                  <p className="text-[10px] text-cyan-300">Last Test: Today, 09:15 AM</p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1 border border-emerald-500/30">
                <Check size={12} /> Completed
              </span>
            </div>

            {/* Blood Test Results Table */}
            <div className="p-4 rounded-3xl bg-[#091838] border border-blue-900/50 shadow-sm space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-blue-900/40">
                <span className="text-rose-500">🩸</span>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
                  Blood Test Results
                </h4>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#050e20] text-slate-400 font-mono text-[10px] uppercase">
                    <tr>
                      <th className="p-2">Parameter</th>
                      <th className="p-2">Result</th>
                      <th className="p-2">Normal Range</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-900/30">
                    {[
                      { param: 'Hemoglobin (Hb)', result: '13.8 g/dL', norm: '12.0 – 16.0', status: 'Normal' },
                      { param: 'White Blood Cells', result: '7.2 × 10³/µL', norm: '4.0 – 11.0', status: 'Normal' },
                      { param: 'Platelets', result: '250 × 10³/µL', norm: '150 – 450', status: 'Normal' },
                      { param: 'Blood Sugar', result: '98 mg/dL', norm: '70 – 110', status: 'Normal' },
                      { param: 'Cholesterol', result: '175 mg/dL', norm: '< 200', status: 'Normal' },
                      { param: 'Creatinine', result: '0.9 mg/dL', norm: '0.6 – 1.2', status: 'Normal' },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-blue-950/40">
                        <td className="p-2 font-bold text-white">{row.param}</td>
                        <td className="p-2 font-mono text-cyan-300 font-black">{row.result}</td>
                        <td className="p-2 font-mono text-slate-400 text-[11px]">{row.norm}</td>
                        <td className="p-2">
                          <span className="text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                            ● {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Lab Summary Donut & Analytics Graph Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Lab Summary Donut */}
              <div className="p-4 rounded-3xl bg-[#091838] border border-blue-900/50 shadow-sm flex flex-col justify-between space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
                  Lab Summary
                </h4>

                <div className="flex items-center justify-center gap-3">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#051024" strokeWidth="3.5" />
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#10b981" strokeWidth="3.5" strokeDasharray="96, 100" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-xs font-black text-white">96%</span>
                      <span className="text-[6px] font-bold text-slate-400 uppercase">Score</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-[10px] text-slate-300">
                    <p className="flex items-center gap-1 text-emerald-400">✓ Test Results OK</p>
                    <p className="flex items-center gap-1 text-emerald-400">✓ No Critical Alert</p>
                    <p className="flex items-center gap-1 text-cyan-400">✓ Report Ready</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => notify('Downloading full verified lab panel report...')}
                  className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Download size={13} />
                  <span>Download Report</span>
                </button>
              </div>

              {/* Smart Alerts */}
              <div className="p-4 rounded-3xl bg-[#091838] border border-blue-900/50 shadow-sm flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1">
                    <span>🔔 Smart Alerts</span>
                    <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                      1
                    </span>
                  </h4>
                </div>

                <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-800/40 space-y-1">
                  <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs">
                    <AlertTriangle size={14} />
                    <span>Slightly high Cholesterol</span>
                  </div>
                  <p className="text-[10px] text-slate-300">
                    Consider a healthier diet and regular daily cardiovascular activity.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => notify('Displaying lipid metabolic management protocol...')}
                  className="w-full py-2 rounded-xl bg-[#051024] hover:bg-blue-900/40 border border-blue-800/60 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1"
                >
                  <span>View Details</span>
                  <ChevronRight size={13} />
                </button>
              </div>

            </div>

          </div>

        </div>

      </main>

      {/* Toast Notification */}
      {statusNotification && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-blue-600 text-white text-xs font-bold shadow-xl animate-bounce">
          {statusNotification}
        </div>
      )}

    </div>
  );
};

export default MedicalIllustrator;
