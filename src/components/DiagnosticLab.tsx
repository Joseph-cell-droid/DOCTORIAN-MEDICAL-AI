import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../api';
import { 
  Dna, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Activity,
  ArrowRight,
  Info,
  Thermometer,
  Wind,
  Plus,
  Trash2,
  Brain,
  Heart,
  Stethoscope as StethoscopeIcon,
  ShieldCheck,
  Zap,
  ChevronRight,
  Clock,
  History,
  RefreshCw,
  FlaskConical,
  Microscope,
  FileText,
  Upload,
  ArrowUpRight,
  Database,
  Beaker,
  Fingerprint,
  Cpu,
  Binary
} from 'lucide-react';
import { SymptomChecker } from './SymptomChecker';
import { isCreditsUnlimited, parseCreditsToNumber, parseResponseCredits, formatCredits } from '../utils/creditUtils';

interface LabTest {
  id: string;
  name: string;
  category: 'Blood' | 'Urine' | 'Imaging' | 'Genetic' | 'Cognitive';
  status: 'Pending' | 'Completed' | 'Analyzed';
  date: string;
  result?: string;
  unit?: string;
  referenceRange?: string;
  isNormal?: boolean;
}

interface DiagnosticLabProps {
  user: any;
  onUpdateUser?: (u: any) => void;
}

export const DiagnosticLab: React.FC<DiagnosticLabProps> = ({ user, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState<'symptoms' | 'tests' | 'imaging' | 'analysis' | 'genomic'>('symptoms');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [genomicSequence, setGenomicSequence] = useState<string>('');
  const [sequencingProgress, setSequencingProgress] = useState(0);

  const numericCredits = parseCreditsToNumber(user?.credits);
  const isUnlimited = isCreditsUnlimited(user?.credits);

  const startSequencing = () => {
    setIsAnalyzing(true);
    setSequencingProgress(0);
    const interval = setInterval(() => {
      setSequencingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAnalyzing(false);
          setGenomicSequence('ATGC'.repeat(25) + 'TAGC' + 'ATGC'.repeat(20));
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };
  const [imagingScan, setImagingScan] = useState<{ id: string, type: string, findings: string, confidence: number } | null>(null);
  const [labTests, setLabTests] = useState<LabTest[]>([
    {
      id: '1',
      name: 'Glucose (HbA1c)',
      category: 'Blood',
      status: 'Completed',
      date: '2026-04-28',
      result: '5.4',
      unit: '%',
      referenceRange: '4.0 - 5.6',
      isNormal: true
    },
    {
      id: '2',
      name: 'Dopamine Synthesis Index',
      category: 'Genetic',
      status: 'Analyzed',
      date: '2026-04-10',
      result: '88',
      unit: 'PSI',
      referenceRange: '70 - 100',
      isNormal: true
    },
    {
      id: '3',
      name: 'Cortisol (Am)',
      category: 'Blood',
      status: 'Completed',
      date: '2026-05-01',
      result: '22.4',
      unit: 'µg/dL',
      referenceRange: '6.2 - 19.4',
      isNormal: false
    }
  ]);

  const [showAddTest, setShowAddTest] = useState(false);
  const [newTest, setNewTest] = useState<Partial<LabTest>>({
    category: 'Blood',
    status: 'Completed'
  });

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImagingAnalysis = async () => {
    if (!selectedImage) {
      alert("Please select a source file for neural scanning.");
      return;
    }
    
    setIsAnalyzing(true);
    setImagingScan(null);
    
    try {
      const prompt = `Perform a high-precision clinical neural segmentation and diagnostic analysis on this medical imaging file.
      Identify:
      1. Image Type (e.g., MRI, CT, X-Ray, Pathology Slide)
      2. Key Findings: Describe any anomalies, metabolic activity, or structural integrity.
      3. Global Confidence: Estimate the diagnostic confidence score (0-100).
      
      Format your response as a JSON object:
      {
        "id": "SCAN-XXXXX",
        "type": "Analyzed Image Type",
        "findings": "Detailed clinical findings...",
        "confidence": 98.5
      }`;

      const response = await api.ai.aiChat(
        [{ role: 'user', text: prompt, images: [selectedImage] }],
        "You are a Clinical Imaging AI. You MUST respond with ONLY the JSON object specified."
      );
      
      let analysis;
      try {
        const text = response.text.replace(/```json|```/g, '').trim();
        analysis = JSON.parse(text);
      } catch (e) {
        analysis = {
          id: 'SCAN-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
          type: 'Advanced Neural Scan',
          findings: response.text,
          confidence: 85
        };
      }
      
      setImagingScan(analysis);
      if (response && 'creditsRemaining' in response && response.creditsRemaining !== undefined && user && onUpdateUser) {
        onUpdateUser({ ...user, credits: parseResponseCredits(response.creditsRemaining) });
      }
    } catch (err: any) {
      console.error("Imaging analysis failed:", err);
      alert("Analysis failed. Please check your neural link integrity.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddTest = () => {
    if (newTest.name && newTest.result) {
      const test: LabTest = {
        id: Math.random().toString(36).substr(2, 9),
        name: newTest.name!,
        category: newTest.category as any,
        status: 'Completed',
        date: new Date().toISOString().split('T')[0],
        result: newTest.result,
        unit: newTest.unit || '',
        referenceRange: newTest.referenceRange || '',
        isNormal: true // Default normal for now
      };
      setLabTests([test, ...labTests]);
      setShowAddTest(false);
      setNewTest({ category: 'Blood', status: 'Completed' });
    }
  };

  const [aiSynthesisResult, setAiSynthesisResult] = useState<string | null>(null);

  const runClinicalSynthesis = async () => {
    if (numericCredits < 0.5 && !isUnlimited) {
       setAiSynthesisResult("Neural energy levels critical. Please upgrade your diagnostic protocol to continue.");
       return;
    }
    
    setIsAnalyzing(true);
    setAiSynthesisResult(null);
    try {
      const testsSummary = labTests.map(t => `- ${t.name}: ${t.result} ${t.unit} (Normal: ${t.isNormal})`).join('\n');
      const prompt = `Act as a Senior Clinical Strategist. Synthesize the following lab test results and any identified symptoms into a cohesive medical insight.
      
      Lab Results:
      ${testsSummary}
      
      Provide a comprehensive 3-paragraph synthesis covering:
      1. Physiological State: Current metabolic and homeostatic baseline.
      2. Priority Drift: Any significant anomalies needing attention.
      3. Strategic Direction: Clinical next steps and specialized screenings recommended.
      
      Maintain a professional, highly technical, yet actionable tone. Use 'Cognis-Protocol' terminology.`;

      const response = await api.ai.aiChat(prompt, "You are a clinical synthesis engine.");
      setAiSynthesisResult(response.text);
      if (response && 'creditsRemaining' in response && response.creditsRemaining !== undefined && user && onUpdateUser) {
        onUpdateUser({ ...user, credits: parseResponseCredits(response.creditsRemaining) });
      }
    } catch (err: any) {
      setAiSynthesisResult(err.message || "Synthesis failed to achieve neural synchronization. Please verify biometric data stream integrity.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-slate-100 dark:border-slate-800 pb-8">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-800 mb-4"
          >
            <FlaskConical size={12} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Diagnostic Hub Active</span>
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-2">
            AI Cognis <span className="text-blue-600">Lab</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">Integrated Clinical Diagnostic System</p>
        </div>

          <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-x-auto no-scrollbar max-w-full">
            {[
              { id: 'symptoms', label: 'Symptom Mapper', icon: <Activity size={16} /> },
              { id: 'tests', label: 'Lab Records', icon: <FlaskConical size={16} /> },
              { id: 'imaging', label: 'Imaging Lab', icon: <Microscope size={16} /> },
              { id: 'genomic', label: 'Genomic Sequencer', icon: <Binary size={16} /> },
              { id: 'analysis', label: 'Clinical AI', icon: <Brain size={16} /> }
            ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-black uppercase tracking-tight transition-all shrink-0 ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {tab.icon}
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'symptoms' && (
          <motion.div
            key="symptoms"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <SymptomChecker user={user} onUpdateUser={onUpdateUser} />
          </motion.div>
        )}

        {activeTab === 'imaging' && (
          <motion.div
            key="imaging"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8"
          >
            {!imagingScan ? (
              <div className="bg-slate-900 rounded-[3.5rem] p-12 text-center border border-slate-800 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-20 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                  <Database size={300} />
                </div>
                <div className="relative z-10 max-w-2xl mx-auto">
                   <div className="w-24 h-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-blue-500/20">
                     <Upload size={40} />
                   </div>
                   <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">Neural Scanner Interface</h2>
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-10 leading-relaxed">
                     Upload DICOM, JPEG, or TIFF imaging files for high-precision neural segmentation and diagnostic labeling.
                   </p>
                   <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                     <label className="w-full sm:w-auto px-10 py-5 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all cursor-pointer text-center">
                       {selectedImage ? "File Selected" : "Select Source File"}
                       <input type="file" className="hidden" accept="image/*" onChange={handleFileSelect} />
                     </label>
                     <button 
                       onClick={handleImagingAnalysis}
                       disabled={isAnalyzing}
                       className="w-full sm:w-auto px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
                     >
                       {isAnalyzing ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />}
                       {isAnalyzing ? 'Analyzing Pixels...' : 'Run Neural Vision'}
                     </button>
                   </div>
                   {selectedImage && (
                     <div className="mt-8 flex justify-center">
                       <img src={selectedImage} alt="Selected for analysis" className="max-h-64 rounded-3xl border-4 border-white/10 shadow-2xl" referrerPolicy="no-referrer" />
                     </div>
                   )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-12">
                   <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden">
                      <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600">
                            <Microscope size={24} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Imaging Report: {imagingScan.id}</p>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">{imagingScan.type}</h3>
                          </div>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 px-6 py-3 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
                           <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Confidence Score</p>
                           <p className="text-lg font-black text-emerald-600 leading-none">{imagingScan.confidence}%</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="md:col-span-1 aspect-square bg-slate-100 dark:bg-slate-800 rounded-3xl overflow-hidden relative group cursor-crosshair border-2 border-slate-200 dark:border-slate-700">
                           <div className="absolute inset-0 flex items-center justify-center opacity-40">
                             <Activity size={100} className="text-slate-400" />
                           </div>
                           <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-white px-4 py-2 rounded-full shadow-lg">Target: PX-442</span>
                           </div>
                        </div>
                        <div className="md:col-span-3 space-y-6">
                           <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5">
                              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Clinical Findings</h4>
                              <p className="text-lg font-bold text-slate-800 dark:text-slate-200 leading-relaxed italic">
                                "{imagingScan.findings}"
                              </p>
                           </div>
                           <div className="flex flex-wrap gap-4">
                              {['No Lesions', 'Optimal Density', 'Normal Structural Flow'].map((tag, i) => (
                                <span key={i} className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-800/50">
                                  {tag}
                                </span>
                              ))}
                           </div>
                        </div>
                      </div>

                      <div className="mt-10 pt-10 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4">
                         <button 
                           onClick={() => setImagingScan(null)}
                           className="px-8 py-4 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                         >
                           Discard Scan
                         </button>
                         <button className="px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95">
                           Append to Medical Vault
                         </button>
                      </div>
                   </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
        {activeTab === 'tests' && (
          <motion.div
            key="tests"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Stats Sidebar */}
              <div className="lg:col-span-3 space-y-6">
                <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Microscope size={120} />
                  </div>
                  <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-6">Test Analytics</p>
                    <div className="space-y-6">
                      <div>
                        <span className="text-4xl font-black tracking-tighter block">{labTests.length}</span>
                        <span className="text-[10px] font-black uppercase text-blue-400">Total Recorded</span>
                      </div>
                      <div className="h-px bg-white/10" />
                      <div>
                        <span className="text-4xl font-black tracking-tighter block text-rose-500">
                          {labTests.filter(t => !t.isNormal).length}
                        </span>
                        <span className="text-[10px] font-black uppercase text-rose-400">Out of Range</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Quick Filters</h3>
                  <div className="space-y-3">
                    {['Ailment Sync', 'Full Metabolism', 'Hormonal Suite', 'Bio-Markers'].map((filter) => (
                      <button key={filter} className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group">
                        <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase group-hover:text-blue-600">{filter}</span>
                        <ArrowUpRight size={14} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-9 space-y-8">
                <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600">
                        <FileText size={24} />
                      </div>
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Clinical Records</h2>
                    </div>
                    <button 
                      onClick={() => setShowAddTest(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-xs font-black uppercase tracking-widest hover:scale-[1.05] transition-all shadow-xl active:scale-95"
                    >
                      <Plus size={16} />
                      Manual Entry
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800">
                          <th className="text-left py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Test / Marker</th>
                          <th className="text-left py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Category</th>
                          <th className="text-left py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Result</th>
                          <th className="text-left py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Reference</th>
                          <th className="text-left py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                        {labTests.map((test) => (
                          <tr key={test.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                            <td className="py-6 px-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                  test.isNormal ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 animate-pulse'
                                }`}>
                                  <Beaker size={14} />
                                </div>
                                <div>
                                  <p className="text-sm font-black text-slate-900 dark:text-white uppercase leading-none mb-1">{test.name}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{test.date}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-6 px-4">
                              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                {test.category}
                              </span>
                            </td>
                            <td className="py-6 px-4">
                              <div className="flex items-baseline gap-1 relative overflow-hidden">
                                <span className={`text-lg font-black ${test.isNormal ? 'text-slate-900 dark:text-white' : 'text-rose-600'}`}>
                                  {test.result}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">{test.unit}</span>
                                {test.isNormal ? (
                                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-500/20" />
                                ) : (
                                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-rose-500/40 animate-pulse" />
                                )}
                              </div>
                            </td>
                            <td className="py-6 px-4">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">{test.referenceRange}</span>
                            </td>
                            <td className="py-6 px-4">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 size={14} className={test.status === 'Analyzed' ? 'text-blue-500' : 'text-slate-300'} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{test.status}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-emerald-600 text-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform duration-700">
                      <Upload size={140} />
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-2xl font-black uppercase tracking-tighter leading-none mb-4">Batch OCR Upload</h3>
                      <p className="text-emerald-50 text-sm font-bold opacity-80 mb-8 max-w-xs">Scan and digitize your physical lab results instantly using AI vision.</p>
                      <button className="px-8 py-4 bg-white text-emerald-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-50 transition-all shadow-xl">
                        Start Scanner
                      </button>
                    </div>
                  </div>

                  <div className="bg-blue-600 text-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform duration-700">
                      <Database size={140} />
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-2xl font-black uppercase tracking-tighter leading-none mb-4">Cognis Direct Sink</h3>
                      <p className="text-blue-50 text-sm font-bold opacity-80 mb-8 max-w-xs">Auto-import clinical data from authorized laboratory networks.</p>
                      <button className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-50 transition-all shadow-xl">
                        Link API Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        {activeTab === 'genomic' && (
          <motion.div
            key="genomic"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-6xl mx-auto"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8">
                <div className="bg-slate-900 rounded-[3rem] p-10 border border-slate-800 shadow-2xl relative overflow-hidden h-[600px] flex flex-col">
                  <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="grid grid-cols-10 gap-2 p-4">
                      {Array.from({ length: 400 }).map((_, i) => (
                        <div key={i} className="text-[6px] font-mono text-blue-500 break-all overflow-hidden h-4">
                          {Math.random() > 0.5 ? 'A' : Math.random() > 0.5 ? 'T' : Math.random() > 0.5 ? 'C' : 'G'}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="relative z-10 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">Quantum Sequencer</h3>
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-1">Direct Genomic Link: Alpha-7</p>
                      </div>
                      {isAnalyzing && (
                        <div className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30 text-[10px] font-black animate-pulse uppercase">
                          Sequencing in progress... {sequencingProgress}%
                        </div>
                      )}
                    </div>

                    <div className="flex-1 bg-black/40 rounded-2xl border border-white/5 p-6 font-mono text-emerald-500 text-[8px] sm:text-xs overflow-y-auto custom-scrollbar whitespace-pre-wrap leading-relaxed">
                      {genomicSequence || (isAnalyzing ? 'Initializing Nucleotide Mapping...\n' + 'ATGC'.repeat(300 * (sequencingProgress / 100)) : 'SYSTEM STANDBY. AWAITING BIOMETRIC FEED...')}
                    </div>

                    <div className="mt-8 flex gap-4">
                      {!genomicSequence && !isAnalyzing ? (
                        <button 
                          onClick={startSequencing}
                          className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl flex items-center gap-2"
                        >
                          <Zap size={16} /> Begin Sequencing
                        </button>
                      ) : (
                        <button 
                          onClick={() => { setGenomicSequence(''); setSequencingProgress(0); }}
                          className="px-10 py-4 bg-white/5 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                        >
                          Reset Buffer
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Marker Analysis</h4>
                  <div className="space-y-4">
                    {[
                      { marker: 'DRD4-7R', name: 'Novelty Seeking', status: 'Detected', risk: 'Low' },
                      { marker: 'MAOA-L', name: 'Neuro-Stability', status: 'Stable', risk: 'N/A' },
                      { marker: 'COL1A1', name: 'Collagen Integrity', status: 'High', risk: 'Optimal' },
                      { marker: 'FOXP2', name: 'Cognitive Link', status: 'Active', risk: 'Optimal' }
                    ].map((m, i) => (
                      <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-black text-blue-600 uppercase">{m.marker}</span>
                          <span className="text-[8px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded uppercase">{m.status}</span>
                        </div>
                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase mb-1">{m.name}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase">Risk Profile: {m.risk}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-600 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                   <div className="relative z-10">
                      <h4 className="text-lg font-black uppercase tracking-tight mb-2">CRISPR Simulation</h4>
                      <p className="text-xs font-bold text-blue-100 mb-6 opacity-80">Test gene-editing outcomes in a virtual environment.</p>
                      <button className="w-full py-4 bg-white text-blue-600 rounded-xl font-black text-[10px] uppercase tracking-widest">Open Lab</button>
                   </div>
                   <div className="absolute bottom-0 right-0 p-4 opacity-20">
                      <Binary size={80} />
                   </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'analysis' && (
          <motion.div
            key="analysis"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-5xl mx-auto"
          >
            {!aiSynthesisResult ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-xl">
                <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-[2.5rem] flex items-center justify-center text-blue-600 mb-8 border border-blue-100 dark:border-blue-800/50">
                  <Brain size={48} className="animate-pulse" />
                </div>
                <h2 className="text-4xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter mb-4">Neural Synthesis</h2>
                <p className="text-slate-500 dark:text-slate-400 font-bold max-w-md mx-auto mb-12 uppercase tracking-widest text-[10px]">Combine biological symptoms with recent lab markers for a 360° clinical insight.</p>
                <button 
                  onClick={runClinicalSynthesis}
                  disabled={isAnalyzing}
                  className="px-12 py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-4 disabled:opacity-50"
                >
                  {isAnalyzing ? <RefreshCw className="animate-spin" /> : <Zap />}
                  {isAnalyzing ? 'SYNTHESIZING MATRIX...' : 'START SYNTHESIS'}
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="bg-slate-900 text-white rounded-[3.5rem] p-12 border border-slate-800 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
                    <Activity size={240} />
                  </div>
                  <div className="relative z-10">
                     <div className="flex items-center gap-4 mb-10">
                        <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                           <Brain className="text-blue-400" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-1">Clinical Synthesis Engine</p>
                           <h3 className="text-3xl font-black uppercase tracking-tighter">Diagnostic Manifest</h3>
                        </div>
                     </div>
                     <div className="prose prose-invert max-w-none">
                        <p className="text-xl font-bold leading-relaxed text-slate-300 italic mb-8">
                          "{aiSynthesisResult}"
                        </p>
                     </div>
                     <div className="flex gap-4 pt-10 border-t border-white/10">
                        <button 
                          onClick={() => setAiSynthesisResult(null)}
                          className="px-8 py-4 bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all"
                        >
                          Recalibrate Matrix
                        </button>
                        <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl">
                          Export Clinical Report
                        </button>
                     </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {[
                     { label: 'Integrity', val: '98.4%', icon: <ShieldCheck /> },
                     { label: 'Metabolism', val: 'Optimal', icon: <Zap /> },
                     { label: 'Cognis Sync', val: 'Active', icon: <RefreshCw /> }
                   ].map((item, i) => (
                     <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex items-center gap-6 shadow-sm">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400">
                           {React.cloneElement(item.icon as any, { size: 20 })}
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{item.label}</p>
                           <p className="text-xl font-black text-slate-900 dark:text-white uppercase">{item.val}</p>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Test Modal */}
      <AnimatePresence>
        {showAddTest && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setShowAddTest(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-2xl border border-slate-100 dark:border-slate-800"
            >
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8 flex items-center gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600">
                  <Plus />
                </div>
                New Lab Entry
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Test Name</label>
                  <input 
                    type="text" 
                    value={newTest.name || ''}
                    onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-xs font-bold focus:ring-4 focus:ring-blue-500/10"
                    placeholder="e.g., Vitamin D, Total Cholesterol"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                   <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Result Value</label>
                    <input 
                      type="text" 
                      value={newTest.result || ''}
                      onChange={(e) => setNewTest({ ...newTest, result: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-xs font-bold focus:ring-4 focus:ring-blue-500/10"
                      placeholder="85.4"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Unit</label>
                    <input 
                      type="text" 
                      value={newTest.unit || ''}
                      onChange={(e) => setNewTest({ ...newTest, unit: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-xs font-bold focus:ring-4 focus:ring-blue-500/10"
                      placeholder="mg/dL"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Reference Range</label>
                  <input 
                    type="text" 
                    value={newTest.referenceRange || ''}
                    onChange={(e) => setNewTest({ ...newTest, referenceRange: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-xs font-bold focus:ring-4 focus:ring-blue-500/10"
                    placeholder="70 - 100"
                  />
                </div>

                <div className="pt-6">
                  <button 
                    onClick={handleAddTest}
                    className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl"
                  >
                    SAVE TO VAULT
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
