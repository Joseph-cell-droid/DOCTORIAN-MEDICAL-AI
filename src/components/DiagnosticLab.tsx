import React, { useState } from 'react';
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
  ExternalLink
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
