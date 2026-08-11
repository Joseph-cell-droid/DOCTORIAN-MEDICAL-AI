import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, 
  Plus, 
  Trash2, 
  Search, 
  Book, 
  Shield, 
  Zap, 
  Loader2, 
  AlertCircle,
  FileText,
  Brain,
  Filter,
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { api } from '../api';

interface KnowledgeNode {
  id: string;
  title: string;
  content: string;
  category: string;
  userId?: string;
  createdAt: string;
}

export const KnowledgeVault: React.FC = () => {
  const [nodes, setNodes] = useState<KnowledgeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const [newNode, setNewNode] = useState({
    title: '',
    content: '',
    category: 'clinical'
  });

  const fetchNodes = async () => {
    setLoading(true);
    try {
      const response = await api.ai.listKnowledge();
      setNodes(response);
    } catch (err) {
      console.error("Failed to fetch knowledge nodes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNodes();
  }, []);

  const handleAddNode = async () => {
    if (!newNode.title || !newNode.content) return;
    try {
      await api.ai.addKnowledge(newNode.title, newNode.content, newNode.category);
      setIsAdding(false);
      setNewNode({ title: '', content: '', category: 'clinical' });
      fetchNodes();
    } catch (err) {
      console.error("Failed to add node:", err);
    }
  };

  const handleDeleteNode = async (id: string) => {
    if (!window.confirm("Are you sure you want to decouple this neural node?")) return;
    try {
      await api.ai.deleteKnowledge(id);
      fetchNodes();
    } catch (err) {
      console.error("Failed to delete node:", err);
    }
  };

  const filteredNodes = nodes.filter(node => {
    const matchesSearch = node.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         node.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || node.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'clinical', 'personal', 'protocol', 'medication'];

  return (
    <div className="space-y-8">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Database size={16} className="text-blue-600" />
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Neural Knowledge Vault</h2>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px]">
            Personalize your AI's reasoning by injecting specialized clinical logic.
          </p>
        </div>
        
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-3 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] text-xs font-black uppercase tracking-widest hover:scale-[1.05] transition-all shadow-xl active:scale-95"
        >
          <Plus size={16} />
          Inject New Logic
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters & Search */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
              <Search size={12} /> Search Registry
            </h3>
            <div className="relative mb-8">
              <input 
                type="text"
                placeholder="Find logic nodes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-xs font-bold focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400"
              />
            </div>

            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
              <Filter size={12} /> Categories
            </h3>
            <div className="flex flex-col gap-2">
              {categories.map((cat, catIdx) => (
                <button
                  key={`kv-cat-${cat}-${catIdx}`}
                  onClick={() => setCategoryFilter(cat)}
                  className={`w-full text-left px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    categoryFilter === cat 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                      : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-blue-600 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
              <Brain size={80} />
            </div>
            <div className="relative z-10">
              <h4 className="text-lg font-black uppercase tracking-tight mb-2">Neural Training</h4>
              <p className="text-blue-50 text-[10px] font-bold leading-relaxed opacity-80 mb-6 uppercase tracking-wider">
                The AI automatically references these nodes during every diagnosis and chat session.
              </p>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                <CheckCircle2 size={12} /> Sync Active
              </div>
            </div>
          </div>
        </div>

        {/* Knowledge Nodes Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
              <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Synchronizing Matrix...</p>
            </div>
          ) : filteredNodes.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] p-12 text-center">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Database size={32} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">No Logic Found</h3>
              <p className="text-slate-400 font-bold max-w-xs mx-auto text-xs uppercase tracking-widest leading-loose">
                Your neural vault is empty. Inject clinical protocols or personal notes to train the AI.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredNodes.map((node, i) => (
                  <motion.div
                    key={node.id || `node-${i}`}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm flex flex-col group hover:shadow-xl transition-all"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600">
                          {node.category === 'clinical' ? <Shield size={18} /> : <Book size={18} />}
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest mb-1">{node.category}</p>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight line-clamp-1">{node.title}</h4>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteNode(node.id)}
                        className="p-2 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-xs font-bold text-slate-500 line-clamp-4 leading-relaxed mb-8 flex-grow">
                      {node.content}
                    </p>
                    <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                        {node.userId === 'system' ? <Lock size={10} className="inline mr-1" /> : null}
                        {new Date(node.createdAt).toLocaleDateString()}
                      </span>
                      <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-2">
                        Details <ArrowRight size={12} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Add Node Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setIsAdding(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] p-12 shadow-2xl border border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600">
                    <Zap size={24} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">New Neural Node</h3>
                </div>
                <button onClick={() => setIsAdding(false)} className="text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Logic Descriptor (Title)</label>
                  <input 
                    type="text" 
                    value={newNode.title}
                    onChange={(e) => setNewNode({ ...newNode, title: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-xs font-bold focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400"
                    placeholder="e.g. WHO Sepsis Protocol Stage 1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Category</label>
                    <select
                      value={newNode.category}
                      onChange={(e) => setNewNode({ ...newNode, category: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-xs font-bold focus:ring-4 focus:ring-blue-500/10 appearance-none"
                    >
                      {categories.filter(c => c !== 'all').map((cat, catIdx) => (
                        <option key={`kv-opt-${cat}-${catIdx}`} value={cat}>{cat.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Neural Core Content (Logic Details)</label>
                  <textarea 
                    value={newNode.content}
                    onChange={(e) => setNewNode({ ...newNode, content: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-xs font-bold focus:ring-4 focus:ring-blue-500/10 h-40 resize-none placeholder:text-slate-400"
                    placeholder="Input detailed clinical protocols, medical guidelines, or diagnostic rules here..."
                  />
                </div>

                <div className="pt-6">
                  <button 
                    onClick={handleAddNode}
                    className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                  >
                    DEPLOY NODE
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
