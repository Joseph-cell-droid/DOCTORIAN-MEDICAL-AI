import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, Sparkles, Brain, MessageSquare, 
  Stethoscope, Activity, FileText, Search, UserPlus,
  Compass, ShieldCheck, Cpu, ChevronRight, Zap, RefreshCw,
  Globe, Database, Server, MessageSquarePlus, X, Send,
  Crown, Loader2, Phone, Scan, FlaskConical, Dna,
  Settings, Heart, Thermometer, Gauge, Terminal
} from 'lucide-react';
import { ChatInterface } from './ChatInterface';
import { api, User } from '../api';
import { UpgradeModal } from './UpgradeModal';
import { NeuralVisualizer } from './NeuralVisualizer';
import { NeuralVoiceCall } from './NeuralVoiceCall';
import BioSimulation from './BioSimulation';

interface MedicalAIProps {
  user: User | null;
  onUpdate?: (user: User) => void;
  onRefreshUser?: () => void;
  onNavigate?: (view: any) => void;
  arduino?: any;
  onUpgradeRequested?: () => void;
}

export function MedicalAI({ user, onUpdate, onRefreshUser, onNavigate, arduino, onUpgradeRequested }: MedicalAIProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showVisualizer, setShowVisualizer] = useState(false);
  const [showVoiceCall, setShowVoiceCall] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'suggestion' | 'bug' | 'praise'>('suggestion');
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [activeAnalysisMode, setActiveAnalysisMode] = useState<'basic' | 'lab' | 'diff' | 'interaction'>('basic');
  const [labValues, setLabValues] = useState('');
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false);
  const [showBioSim, setShowBioSim] = useState(false);
  
  const [stats, setStats] = useState({
    latency: 8,
    threads: 7204,
    users: 24012,
    confidence: 99.2
  });

  const [activeTab, setActiveTab] = useState<'chat' | 'lab' | 'regional'>('chat');
  const [ugandaData, setUgandaData] = useState({
    region: 'Central',
    riskLevel: 'Moderate',
    topAlert: 'Malaria Spike in Nakasongola'
  });

  const handlePlatformFeedback = async () => {
    if (!feedbackText.trim()) return;
    setIsSubmitting(true);
    try {
      await api.ai.submitFeedback({
        messageId: 'PLATFORM_FEEDBACK',
        rating: feedbackType === 'bug' ? 'down' : 'up',
        suggestion: `[Type: ${feedbackType}] ${feedbackText}`
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        setShowFeedbackModal(false);
        setSubmitSuccess(false);
        setFeedbackText('');
      }, 2000);
    } catch (err) {
      console.error("Feedback failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [operationalIdea, setOperationalIdea] = useState<string | null>(null);
  const [isGeneratingIdea, setIsGeneratingIdea] = useState(false);

  const fetchOperationalIdea = async () => {
    if (user?.subscriptionTier !== 'enterprise' || user?.subscriptionStatus !== 'active') return;
    setIsGeneratingIdea(true);
    try {
      const data = await api.auth.generateOperationalIdea();
      setOperationalIdea(data.idea);
      if (data.creditsRemaining !== undefined && user && onUpdate) {
        onUpdate({ ...user, credits: data.creditsRemaining });
      }
    } catch (err) {
      console.error("Operational idea failed:", err);
    } finally {
      setIsGeneratingIdea(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const isPro = user?.subscriptionTier === 'pro' && user?.subscriptionStatus === 'active';
      const isEnterprise = user?.subscriptionTier === 'enterprise' && user?.subscriptionStatus === 'active';
      const baseLatency = isEnterprise ? 4 : isPro ? 8 : 12;

      setStats(prev => ({
        latency: Math.max(baseLatency - 2, Math.min(baseLatency + 5, prev.latency + (Math.random() > 0.5 ? 1 : -1))),
        threads: Math.max(4500, Math.min(5200, prev.threads + Math.floor(Math.random() * 20 - 10))),
        users: prev.users + Math.floor(Math.random() * 5),
        confidence: Math.max(97.0, Math.min(99.9, prev.confidence + (Math.random() > 0.5 ? 0.1 : -0.1)))
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, [user?.subscriptionTier, user?.subscriptionStatus]);

  return (
    <div className="flex flex-col h-full lg:h-[calc(100vh-2rem)] max-h-[1200px] bg-slate-50 dark:bg-slate-950 lg:rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden transition-all max-w-[1600px] mx-auto w-full">
      {/* Universal Neural Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950/20 overflow-hidden">

        <AnimatePresence>
          {user?.subscriptionTier === 'enterprise' && user?.subscriptionStatus === 'active' && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-purple-600 p-3 sm:px-8 flex items-center justify-between gap-4 border-b border-purple-500/30 shrink-0"
            >
              <div className="flex items-center gap-3">
                <Crown className="text-amber-300" size={18} />
                <span className="text-[10px] font-black text-white uppercase tracking-widest hidden sm:inline">Universal Quantum Node Active</span>
                <span className="text-[10px] font-black text-white uppercase tracking-widest sm:hidden">Neural Link: Quantum</span>
              </div>
              <div className="flex items-center gap-4">
                 <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/10 rounded-lg max-w-[200px] sm:max-w-[400px] overflow-hidden">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                   <span className="text-[9px] font-black text-white uppercase truncate">
                     {isGeneratingIdea ? 'Doctorian Thinking...' : operationalIdea || 'Operational Strategy Live'}
                   </span>
                 </div>
                 <button 
                   onClick={fetchOperationalIdea}
                   disabled={isGeneratingIdea}
                   className="text-[10px] font-black text-white underline underline-offset-4 decoration-white/30 hover:decoration-white transition-all uppercase disabled:opacity-50"
                 >
                   {isGeneratingIdea ? 'Thinking...' : 'Generate Elite Idea'}
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {user?.subscriptionStatus === 'pending' && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-600 p-3 sm:px-8 flex items-center justify-center gap-4 border-b border-blue-500/30 shrink-0"
            >
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin text-white" size={16} />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Neural Calibration Pending - Payment Evidence Delivered to Akora Joseph</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Header - Minimal 2026 Style */}
        <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-4 shrink-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-b border-slate-100/50 dark:border-slate-800/30">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Bot className="text-white w-5 h-5" />
             </div>
             <div>
                <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-1">
                  Doctorian
                </h1>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Neural Link Active</span>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            <button 
              onClick={() => setShowVoiceCall(true)}
              className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all active:scale-95 flex items-center gap-2 font-mono"
            >
              <Phone size={14} />
              <span className="hidden sm:inline">Voice Call</span>
            </button>
          </div>
        </div>

          <div className="flex-1 min-h-0 relative">
            <ChatInterface 
              user={user} 
              onUpdate={onUpdate} 
              arduino={arduino} 
              onUpgradeRequested={onUpgradeRequested}
            />
          </div>
      </div>

      <AnimatePresence>
        {showUpgradeModal && (
          <UpgradeModal 
            user={user} 
            onClose={() => setShowUpgradeModal(false)} 
            onUpdate={(u) => {
              onUpdate?.(u);
              setShowUpgradeModal(false);
            }} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showVisualizer && (
          <NeuralVisualizer onClose={() => setShowVisualizer(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showVoiceCall && (
          <NeuralVoiceCall 
            user={user} 
            onClose={() => setShowVoiceCall(false)} 
            vitals={arduino?.vitals}
            healthStatus={arduino?.healthStatus}
            onRefreshUser={onRefreshUser}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBioSim && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBioSim(false)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-5xl h-[80vh] bg-white dark:bg-slate-900 rounded-[2.5rem] border border-white/20 shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                    <Dna className="text-emerald-600" size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Quantum Bio-Simulation</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Cellular Path Dynamics & Synaptic Integrity</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowBioSim(false)}
                  className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>
              <div className="flex-1 min-h-0">
                <BioSimulation user={user} onUpdateUser={onUpdate} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Feedback Modal */}
      <AnimatePresence>
        {showFeedbackModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setShowFeedbackModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
            >
              <div className="p-8 sm:p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                      <MessageSquarePlus size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">System Refinement</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contribute to the Nexus Intelligence Loop</p>
                    </div>
                  </div>
                  <button 
                    disabled={isSubmitting}
                    onClick={() => setShowFeedbackModal(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {submitSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                      <Sparkles size={40} className="animate-pulse" />
                    </div>
                    <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Feedback Synchronized</h4>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Your insights have been successfully indexed by the Doctorian core.</p>
                  </motion.div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex gap-2">
                      {['suggestion', 'bug', 'praise'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setFeedbackType(type as any)}
                          className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                            feedbackType === type 
                              ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                              : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-2">
                       <textarea 
                         value={feedbackText}
                         onChange={(e) => setFeedbackText(e.target.value)}
                         placeholder="How can we improve the Doctorian experience? Share your thoughts on features, UI, or general AI accuracy..."
                         className="w-full h-40 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all resize-none"
                       />
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-right">Encrypted Transmission Enabled</p>
                    </div>

                    <button 
                      onClick={handlePlatformFeedback}
                      disabled={!feedbackText.trim() || isSubmitting}
                      className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-600/30 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw size={18} className="animate-spin" />
                          Indexing Insights...
                        </>
                      ) : (
                        <>
                          Integrate Feedback <Send size={14} />
                        </>
                      )}
                    </button>
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


const ClipboardList: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M12 11h4" />
    <path d="M12 16h4" />
    <path d="M8 11h.01" />
    <path d="M8 16h.01" />
  </svg>
);
