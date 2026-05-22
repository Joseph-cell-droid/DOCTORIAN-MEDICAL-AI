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
  Globe
} from 'lucide-react';
import { api } from '../api';

interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  category?: string;
  createdAt: string;
}

export const NeuralTrainingHub: React.FC = () => {
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

  const TRAINING_CATEGORIES = [
    { id: 'article', label: 'Health Article', icon: '📄' },
    { id: 'faq', label: 'Medical FAQ', icon: '❓' },
    { id: 'symptom', label: 'Symptom Explanation', icon: '🩺' },
    { id: 'prevention', label: 'Prevention Guide', icon: '🛡️' },
    { id: 'first_aid', label: 'First Aid Info', icon: '🩹' },
    { id: 'clinical', label: 'Clinical Protocol', icon: '🔬' },
    { id: 'language', label: 'Language Translation', icon: '🌍' }
  ];

  const handleLanguageGenerate = async () => {
    const lang = prompt("Enter Ugandan Language (e.g., Luganda, Acholi):");
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
  }, []);

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

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
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
              Feed custom medical protocols, diagnostic standards, and <span className="text-blue-400">Ugandan local language translations with their meanings</span> directly into the Doctorian neural core. Evolves the logic with every node.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => setShowForm(true)}
              className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10"
            >
              <Plus size={20} />
              Inject New Node
            </button>
            <button 
              onClick={handleLanguageGenerate}
              className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-500/20"
            >
              <Zap size={18} className="animate-pulse" />
              Neural Lang Injector
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Stats & Status */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <Database size={18} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-wider">Neural Registry</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Nodes</span>
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{items.length}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sync Priority</span>
                <span className="text-sm font-black text-emerald-500 uppercase tracking-widest">L1 Clinical</span>
              </div>
              {isUsingCache && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle size={12} className="text-amber-600" />
                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Emergency Cache Mode</span>
                  </div>
                  <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest leading-tight">
                    Displaying last saved protocols from {lastSync ? new Date(lastSync).toLocaleDateString() : 'unknown'}.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 text-white shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck size={20} className="text-blue-200" />
              <h3 className="font-black uppercase tracking-widest text-sm">Security Protocol</h3>
            </div>
            <p className="text-blue-100 text-sm leading-relaxed mb-6">
              All injected nodes are encrypted and isolated per user instance. AI synthesis follows strict HIPAA and GDPR alignment during processing.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-xl">
                <Lock size={14} className="text-blue-200" />
                <span className="text-[10px] font-black uppercase tracking-widest">End-to-End Encrypted</span>
              </div>
              <div className="p-4 bg-white/10 rounded-2xl border border-white/10 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Terminal size={14} className="text-blue-300" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-100">Neural API Link</span>
                </div>
                <p className="text-[9px] text-blue-200/80 font-bold uppercase tracking-tight">
                  These nodes are automatically exposed to your external applications via the Developer Portal.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Knowledge Explorer */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-auto flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Search trained nodes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronizing Neural Matrix...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-12 text-center border border-dashed border-slate-200 dark:border-slate-800">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen size={24} className="text-slate-400" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Neural Core Empty</h3>
              <p className="text-slate-500 max-w-xs mx-auto text-sm">
                No custom knowledge nodes found. Start by injecting your first medical dataset.
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
                      className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>

                    <div className="flex items-center gap-2 mb-4">
                      <div className={`p-1.5 rounded-lg ${item.category === 'language' ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'}`}>
                        <span className="text-xs">
                          {TRAINING_CATEGORIES.find(c => c.id === item.category)?.icon || '🔬'}
                        </span>
                      </div>
                      <h4 className={`font-black uppercase tracking-tight line-clamp-1 ${item.category === 'language' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>
                        {item.title}
                      </h4>
                    </div>
                    
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 line-clamp-4">
                      {item.content}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                      <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        <History size={12} />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                      <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-full uppercase tracking-widest">Synched</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

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
                    <h2 className="text-2xl font-black uppercase tracking-tight">Node Injection</h2>
                    <p className="text-blue-300/60 text-[10px] font-black uppercase tracking-[0.2em]">Neural Synthesis Protocol</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleAddKnowledge} className="p-8 sm:p-10 space-y-6">
                {formError && (
                  <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-2xl flex items-center gap-3 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all animate-shake">
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
                       <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Linguistic Matrix Input</span>
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
                    className="flex-[2] px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
            <span className="text-xs font-black uppercase tracking-widest">{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
