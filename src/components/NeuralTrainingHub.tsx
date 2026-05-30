import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  Plus, 
  Trash2, 
  Save, 
  Database, 
  ShieldCheck, 
  Cpu, 
  Zap, 
  Search,
  BookOpen,
  History,
  AlertCircle,
  CheckCircle2,
  Lock,
  Workflow,
  Terminal,
  Globe,
  Play,
  Check,
  Loader2,
  Activity,
  FileText,
  RefreshCw,
  Sliders
} from 'lucide-react';
import { api } from '../api';

interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  category?: string;
  createdAt: string;
}

interface FineTuningJob {
  id: string;
  userId: string;
  baseModel: string;
  customName: string;
  datasetSize: number;
  epochs: number;
  status: 'training' | 'completed' | 'failed';
  progress: number;
  valLoss: number;
  valAccuracy: number;
  logs: string;
  isActive: number;
  createdAt: string;
}

export const NeuralTrainingHub: React.FC = () => {
  // Navigation
  const [activeTab, setActiveTab] = useState<'dataset' | 'finetune'>('dataset');

  // Node (dataset) states
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUsingCache, setIsUsingCache] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('clinical');
  const [langTerm, setLangTerm] = useState('');
  const [langMeaning, setLangMeaning] = useState('');
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fine tuning states
  const [ftJobs, setFtJobs] = useState<FineTuningJob[]>([]);
  const [ftIsLoading, setFtIsLoading] = useState(false);
  const [ftBaseModel, setFtBaseModel] = useState('meta-llama/llama-3.1-8b-instruct');
  const [ftCustomName, setFtCustomName] = useState('gloria-clinical-ft-v1');
  const [ftEpochs, setFtEpochs] = useState(5);
  const [ftIsStarting, setFtIsStarting] = useState(false);
  const [selectedJob, setSelectedJob] = useState<FineTuningJob | null>(null);

  const TRAINING_CATEGORIES = [
    { id: 'article', label: 'Health Article', icon: '📄' },
    { id: 'faq', label: 'Medical FAQ', icon: '❓' },
    { id: 'symptom', label: 'Symptom Explanation', icon: '🩺' },
    { id: 'prevention', label: 'Prevention Guide', icon: '🛡️' },
    { id: 'first_aid', label: 'First Aid Info', icon: '🩹' },
    { id: 'clinical', label: 'Clinical Protocol', icon: '🔬' },
    { id: 'language', label: 'Language Translation', icon: '🌍' }
  ];

  const BASE_MODELS = [
    { id: 'meta-llama/llama-3.1-8b-instruct', label: 'Meta Llama 3.1 8B (Recommended)', desc: 'High logical reasoning and clinical guideline synthesis.' },
    { id: 'google/gemma-2-9b-it', label: 'Google Gemma 2 9B (Ultra-Fine)', desc: 'Optimized translation and patient conversational tone.' },
    { id: 'deepseek-ai/DeepSeek-R1', label: 'DeepSeek R1 (Deep Reasoner Labs)', desc: 'Advanced differential clinical diagnostics with scratchpad thoughts.' }
  ];

  const handleLanguageGenerate = async () => {
    const lang = prompt("Enter Ugandan Language (e.g., Luganda, Acholi, Runyankole):");
    if (!lang) return;
    
    try {
      setIsSaving(true);
      setSuccessMsg(`Generating ${lang} medical node...`);
      const response = await api.ai.aiChat([{
        role: 'user', 
        text: `Generate a list of 15 essential medical symptoms and terms translated from English to ${lang}. Format them as a clear list with meanings and pronunciations if possible. Focus on terms used in rural Uganda.`
      }], "You are a professional medical translator for Ugandan languages.", undefined, 0.7, false);
      
      setNewTitle(`Medical Translation: ${lang}`);
      setNewContent(response.text);
      setNewCategory('language');
      setShowForm(true);
    } catch (err) {
      alert("Neural generation failed.");
    } finally {
      setIsSaving(false);
      setSuccessMsg('');
    }
  };

  useEffect(() => {
    fetchKnowledge();
    fetchFineTuningJobs();
  }, []);

  // Poll for active jobs if any is in 'training' status
  useEffect(() => {
    const hasActiveTraining = ftJobs.some(j => j.status === 'training');
    if (!hasActiveTraining) return;

    const interval = setInterval(() => {
      fetchFineTuningJobs(true);
    }, 4000);

    return () => clearInterval(interval);
  }, [ftJobs]);

  const fetchKnowledge = async () => {
    try {
      setIsLoading(true);
      const data = await api.ai.listKnowledge();
      const items = data as KnowledgeItem[];
      setItems(items);
      
      // Update Emergency Cache
      localStorage.setItem('medical_neural_cache', JSON.stringify(items));
      localStorage.setItem('medical_last_sync', new Date().toISOString());
      setIsUsingCache(false);
      setLastSync(new Date().toISOString());
    } catch (err) {
      console.error("Failed to load knowledge nodes, accessing emergency cache:", err);
      // Fallback to local cache
      const cached = localStorage.getItem('medical_neural_cache');
      const cachedTime = localStorage.getItem('medical_last_sync');
      if (cached) {
        setItems(JSON.parse(cached));
        setIsUsingCache(true);
        setLastSync(cachedTime);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFineTuningJobs = async (silent = false) => {
    try {
      if (!silent) setFtIsLoading(true);
      const data = await api.ai.listFineTuningJobs();
      setFtJobs(data as FineTuningJob[]);
      
      // Keep selected job logs in sync
      if (selectedJob) {
        const updated = (data as FineTuningJob[]).find(j => j.id === selectedJob.id);
        if (updated) setSelectedJob(updated);
      }
    } catch (err) {
      console.error("Failed to load fine-tuning jobs:", err);
    } finally {
      if (!silent) setFtIsLoading(false);
    }
  };

  const handleAddKnowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      setFormError("Identity labels and core logic are required.");
      return;
    }

    try {
      setIsSaving(true);
      setFormError('');
      await api.ai.addKnowledge(newTitle, newContent, newCategory);
      setNewTitle('');
      setNewContent('');
      setNewCategory('clinical');
      setShowForm(false);
      setSuccessMsg("Neural node successfully integrated into Medical core.");
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchKnowledge();
    } catch (err: any) {
      setFormError(err.message || "Failed to sync node.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to decouple this knowledge node from the neural core?")) return;
    try {
      await api.ai.deleteKnowledge(id.toString());
      fetchKnowledge();
    } catch (err) {
      alert("Decoupling failed.");
    }
  };

  const handleStartFineTuning = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ftCustomName.trim()) return;

    try {
      setFtIsStarting(true);
      const res = await api.ai.startFineTuning(ftBaseModel, ftCustomName, ftEpochs);
      setSuccessMsg("Fine-tuning optimization pipeline launched.");
      setTimeout(() => setSuccessMsg(''), 4000);
      
      // Refresh jobs list
      await fetchFineTuningJobs();
      
      // Auto-select latest launched job
      if (res && res.jobId) {
        const found = ftJobs.find(j => j.id === res.jobId);
        if (found) setSelectedJob(found);
      }
    } catch (err: any) {
      alert(err.message || "Failed to establish fine-tuning protocol.");
    } finally {
      setFtIsStarting(false);
    }
  };

  const handleActivateModel = async (jobId: string) => {
    try {
      setSuccessMsg("Synchronizing weights...");
      await api.ai.activateFineTunedModel(jobId);
      setSuccessMsg("Model prioritized active neural brain layer.");
      setTimeout(() => setSuccessMsg(''), 4000);
      await fetchFineTuningJobs(true);
    } catch (err: any) {
      alert(err.message || "Failed to prioritize weights.");
    }
  };

  const handleDeactivateModels = async () => {
    try {
      setSuccessMsg("Decoupling custom weights...");
      await api.ai.deactivateFineTunedModels();
      setSuccessMsg("Reverted neural brain to baseline Meta/Google cores.");
      setTimeout(() => setSuccessMsg(''), 4000);
      await fetchFineTuningJobs(true);
    } catch (err: any) {
      alert(err.message || "Failed to decouple weights.");
    }
  };

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4">
      {/* Header Profile Section */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 sm:p-12 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[100px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2rem] flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            <Brain size={48} className="text-white animate-pulse" />
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1 bg-blue-500/20 rounded-full border border-blue-500/30">
              <Cpu size={14} className="text-blue-400" />
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none">Neural Evolution Matrix</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tighter leading-none">
              Intelligence <span className="text-blue-500">Training</span> Hub
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl font-medium leading-relaxed">
              Feed custom medical protocols, diagnostics, and Ugandan language translations. Calibrate loss rates and accuracy by running private fine-tuning jobs on custom weights!
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-auto">
            <button 
              onClick={() => setShowForm(true)}
              className="w-full md:w-auto px-8 py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10"
            >
              <Plus size={20} />
              Inject New Node
            </button>
            <button 
              onClick={handleLanguageGenerate}
              className="w-full md:w-auto px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-500/20"
            >
              <Zap size={18} className="animate-pulse" />
              Neural Lang Injector
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Menu Selector */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('dataset')}
          id="btn-tab-dataset"
          className={`px-6 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'dataset'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <Database size={16} />
          Dataset Registry ({items.length})
        </button>
        <button
          onClick={() => setActiveTab('finetune')}
          id="btn-tab-finetune"
          className={`px-6 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'finetune'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <Cpu size={16} />
          Clinician Weights Fine-Tuning
        </button>
      </div>

      {activeTab === 'dataset' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 transition-all">
          {/* Stats & Status Side panel */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <Database size={18} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-xs">Dataset Properties</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Nodes</span>
                  <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{items.length}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Training Target</span>
                  <span className="text-sm font-black text-emerald-500 uppercase tracking-widest">Fully Grounded</span>
                </div>
                {isUsingCache && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle size={12} className="text-amber-600" />
                      <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest font-extrabold">Offline Engine Cache active</span>
                    </div>
                    <p className="text-[9px] text-amber-500 font-bold uppercase tracking-widest leading-tight">
                      Displaying synchronized datasets from {lastSync ? new Date(lastSync).toLocaleDateString() : 'offline memory'}.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 text-white shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck size={20} className="text-blue-200" />
                <h3 className="font-black uppercase tracking-widest text-xs">HIPAA Compliant</h3>
              </div>
              <p className="text-blue-100 text-sm leading-relaxed mb-6">
                All injected node records undergo rigorous end-to-end symmetric encryption before synchronization.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-xl">
                  <Lock size={14} className="text-blue-200" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Strict Partitioning</span>
                </div>
              </div>
            </div>
          </div>

          {/* Knowledge Explorer Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  placeholder="Search trained clinical records or translations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 size={32} className="text-blue-500 animate-spin" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Syncing Nodes...</span>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-12 text-center border border-dashed border-slate-200 dark:border-slate-800">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen size={24} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2 font-extrabold">Registry Empty</h3>
                <p className="text-slate-500 max-w-xs mx-auto text-sm">
                  No specialized nodes detected. Inject Ugandan language translations or clinical guidelines to configure training parameters.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredItems.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="group bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 transition-all shadow-lg hover:shadow-xl relative"
                    >
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>

                      <div className="flex items-center gap-2 mb-4">
                        <div className={`p-1.5 rounded-lg ${item.category === 'language' ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'}`}>
                          <span className="text-xs">
                            {TRAINING_CATEGORIES.find(c => c.id === item.category)?.icon || '🔬'}
                          </span>
                        </div>
                        <h4 className={`font-black uppercase tracking-tight line-clamp-1 text-xs ${item.category === 'language' ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'text-slate-900 dark:text-white font-extrabold'}`}>
                          {item.title}
                        </h4>
                      </div>
                      
                      <div className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed mb-6 whitespace-pre-line line-clamp-6">
                        {item.content}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          <History size={12} />
                          {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                        <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2. py-1 rounded-full uppercase tracking-widest">Synced</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Fine Tuning Console Panel */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 transition-all">
          {/* Left panel/form: Choose hyperparameters */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <Sliders size={18} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Hyperparameters</h3>
              </div>

              <form onSubmit={handleStartFineTuning} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Base Neural Core</label>
                  <select
                    value={ftBaseModel}
                    onChange={(e) => setFtBaseModel(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {BASE_MODELS.map(model => (
                      <option key={model.id} value={model.id}>{model.label}</option>
                    ))}
                  </select>
                  <p className="text-[9px] text-slate-400 italic">
                    {BASE_MODELS.find(m => m.id === ftBaseModel)?.desc}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Custom Weights Tag</label>
                  <input
                    type="text"
                    value={ftCustomName}
                    onChange={(e) => setFtCustomName(e.target.value)}
                    placeholder="e.g. gloria-malaria-v1"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Training Epochs</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[3, 5, 10, 20].map((ep) => (
                      <button
                        key={ep}
                        type="button"
                        onClick={() => setFtEpochs(ep)}
                        className={`py-2 text-xs font-black rounded-lg border transition-all ${
                          ftEpochs === ep
                            ? 'bg-blue-600 text-white border-blue-700 shadow-md'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        {ep} EP
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={ftIsStarting || items.length === 0}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg col-span-3 disabled:opacity-50"
                  >
                    {ftIsStarting ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        Allocating weights...
                      </>
                    ) : (
                      <>
                        <Play size={14} />
                        Run Weights Optimizers
                      </>
                    )}
                  </button>
                  {items.length === 0 && (
                    <p className="text-[9px] text-rose-500 mt-2 font-bold uppercase tracking-tight text-center">
                      * Inject at least 1 node in dataset registry before training
                    </p>
                  )}
                </div>
              </form>
            </div>

            {/* Quick action back to defaults */}
            <div className="bg-slate-900 border border-slate-800 text-slate-100 p-6 rounded-3xl space-y-4 shadow-xl">
              <div className="flex items-center gap-3">
                <RefreshCw size={18} className="text-emerald-400 animate-spin" />
                <h4 className="font-extrabold uppercase tracking-widest text-[10px] text-emerald-400">Master Synapse Layer</h4>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Want to decouple all user weights and fall back back to clinical standard?
              </p>
              <button
                onClick={handleDeactivateModels}
                className="w-full py-2 bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
              >
                Decouple All Weights Profiles
              </button>
            </div>
          </div>

          {/* Right panel: Jobs explorer & Active dynamic logs console terminal */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold uppercase tracking-widest text-slate-900 dark:text-white text-xs flex items-center gap-2">
                <History size={16} />
                Weights Convergence logs
              </h3>
              <button
                onClick={() => fetchFineTuningJobs()}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all bg-slate-100 dark:bg-slate-800 rounded-xl"
              >
                <RefreshCw size={14} />
              </button>
            </div>

            {ftIsLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 size={32} className="text-blue-500 animate-spin" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Querying GPU parameters...</p>
              </div>
            ) : ftJobs.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800">
                <Activity size={32} className="text-slate-300 mx-auto mb-4" />
                <h4 className="text-sm font-extrabold text-slate-850 dark:text-white uppercase tracking-wider">No tuning files found</h4>
                <p className="text-slate-500 text-xs max-w-xs mx-auto mt-2 leading-relaxed">
                  Start your very first fine-tuning execution by selecting a model and pressing Run Weights Optimizers.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* List of runs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ftJobs.map((job) => (
                    <div
                      key={job.id}
                      onClick={() => setSelectedJob(job)}
                      className={`p-5 rounded-[2rem] border transition-all cursor-pointer relative flex flex-col justify-between ${
                        selectedJob?.id === job.id
                          ? 'bg-slate-50 dark:bg-slate-800/80 border-blue-500'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      {/* Active green indicator badge */}
                      {job.isActive === 1 && (
                        <span className="absolute top-4 right-4 bg-emerald-500 text-white text-[8px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
                          <Check size={10} /> Active Brain
                        </span>
                      )}

                      <div className="space-y-3">
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          ID: {job.id}
                        </div>
                        <h4 className="font-extrabold text-slate-900 dark:text-white tracking-tight leading-none text-base">
                          {job.customName}
                        </h4>
                        <div className="flex flex-wrap gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800/80 rounded-full">{job.epochs} Epochs</span>
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800/80 rounded-full">{job.datasetSize} nodes</span>
                        </div>
                      </div>

                      {/* Training status panel */}
                      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-extrabold uppercase text-slate-400">Progress</span>
                          <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                            job.status === 'training'
                              ? 'bg-amber-100 text-amber-700 animate-pulse'
                              : job.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}>
                            {job.status === 'training' ? `Optimizing: ${job.progress}%` : job.status}
                          </span>
                        </div>

                        {job.status === 'training' && (
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-full transition-all duration-1000" style={{ width: `${job.progress}%` }} />
                          </div>
                        )}

                        <div className="flex gap-4 text-[10px] font-bold text-slate-500">
                          <div>Acc: <span className="text-slate-800 dark:text-slate-200 font-extrabold">{job.valAccuracy}%</span></div>
                          <div>Loss: <span className="text-slate-800 dark:text-slate-200 font-extrabold">{job.valLoss}</span></div>
                        </div>

                        {/* Activate controls for Completed job */}
                        {job.status === 'completed' && job.isActive !== 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleActivateModel(job.id);
                            }}
                            className="mt-2 w-full py-2 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-1"
                          >
                            <CheckCircle2 size={12} /> Activate Custom Layer
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Selected Job Console logs */}
                {selectedJob && (
                  <div className="bg-slate-950 border border-slate-900 rounded-[2rem] p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Terminal size={16} className="text-blue-400" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                          Clinical Tensor Weights Optimizer Logs: {selectedJob.customName}
                        </h4>
                      </div>
                      <span className="text-[8px] font-mono text-slate-500">{selectedJob.createdAt}</span>
                    </div>

                    <div className="h-64 overflow-y-auto bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 font-mono text-[9px] text-slate-300 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
                      {selectedJob.logs.split('\n').map((line, ix) => (
                        <div
                          key={ix}
                          className={
                            line.includes('[SYSTEM]') 
                              ? 'text-cyan-400 font-bold' 
                              : line.includes('[Epoch') 
                              ? 'text-amber-300 font-bold' 
                              : line.includes('-->') 
                              ? 'text-slate-400 pl-4' 
                              : 'text-slate-300'
                          }
                        >
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Injection Modal Form */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSaving && setShowForm(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
            >
              <div className="bg-slate-900 p-8 sm:p-10 text-white relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-3xl" />
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 bg-blue-500/20 rounded-2xl border border-blue-500/30">
                    <Workflow size={24} className="text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight font-extrabold">Node Injection</h2>
                    <p className="text-blue-300/60 text-[10px] font-black uppercase tracking-[0.2em]">Neural Synthesis Protocol</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleAddKnowledge} className="p-8 sm:p-10 space-y-6">
                {formError && (
                  <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-2xl flex items-center gap-3 text-rose-600 dark:text-rose-400 text-xs font-bold font-extrabold">
                    <AlertCircle size={16} />
                    {formError}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">Training Category</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {TRAINING_CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setNewCategory(cat.id)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          newCategory === cat.id 
                            ? 'bg-blue-600 text-white border-blue-700 shadow-lg shadow-blue-500/20' 
                            : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span className="text-lg block mb-1">{cat.icon}</span>
                        <span className="text-[9px] font-black uppercase tracking-tighter block leading-none">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {newCategory === 'language' ? (
                  <div className="space-y-4 p-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-3xl border border-indigo-100 dark:border-indigo-800/50">
                    <div className="flex items-center gap-2 mb-2">
                       <Globe size={14} className="text-indigo-600" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 font-extrabold">Linguistic Matrix Input</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest ml-1">Local Term</label>
                        <input 
                          type="text"
                          value={langTerm}
                          onChange={(e) => {
                            setLangTerm(e.target.value);
                            setNewTitle(`Medical Translation: ${e.target.value}`);
                          }}
                          placeholder="e.g., Obulwadde"
                          className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest ml-1">Meaning / English</label>
                        <input 
                          type="text"
                          value={langMeaning}
                          onChange={(e) => {
                            setLangMeaning(e.target.value);
                            setNewContent(`Meaning: ${e.target.value}\nLocal Term: ${langTerm}\nCategory: Medical Translation`);
                          }}
                          placeholder="e.g., Sickness / Disease"
                          className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-indigo-50 dark:border-indigo-900/50">
                      <p className="text-[9px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed italic">
                        "Your manual translation will be prioritized in the neural engine. This helps me learn regional nuances better."
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">Topic Identity</label>
                      <input 
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="e.g., Specialized Cardiology Markers"
                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">Neural Logic / Content</label>
                      <textarea 
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        placeholder="Describe the medical dataset, protocol, or knowledge in detail..."
                        rows={6}
                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none dark:text-white"
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowForm(false)}
                    disabled={isSaving}
                    className="flex-1 px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
                  >
                    Abort
                  </button>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="flex-[2] px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 font-extrabold"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        Commit Node
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Success Toast */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[110] px-6 py-3 bg-emerald-500 text-white rounded-2xl shadow-2xl flex items-center gap-3"
          >
            <CheckCircle2 size={20} />
            <span className="text-xs font-black uppercase tracking-widest font-extrabold">{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
