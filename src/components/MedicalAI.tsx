import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, Brain, Crown, Loader2, Dna
} from 'lucide-react';
import { ChatInterface } from './ChatInterface';
import { api, User } from '../api';
import { parseResponseCredits } from '../utils/creditUtils';
import { UpgradeModal } from './UpgradeModal';
import { NeuralVisualizer } from './NeuralVisualizer';

interface MedicalAIProps {
  user: User | null;
  onUpdate?: (user: User) => void;
  onRefreshUser?: () => void;
  onNavigate?: (view: any) => void;
  arduino?: any;
  onUpgradeRequested?: () => void;
  currentLanguage?: string;
}

export function MedicalAI({ user, onUpdate, onRefreshUser, onNavigate, arduino, onUpgradeRequested, currentLanguage }: MedicalAIProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showVisualizer, setShowVisualizer] = useState(false);
  const [operationalIdea, setOperationalIdea] = useState<string | null>(null);
  const [isGeneratingIdea, setIsGeneratingIdea] = useState(false);

  const fetchOperationalIdea = async () => {
    if (user?.subscriptionTier !== 'enterprise' || user?.subscriptionStatus !== 'active') return;
    setIsGeneratingIdea(true);
    try {
      const data = await api.auth.generateOperationalIdea();
      setOperationalIdea(data.idea);
      if (data.creditsRemaining !== undefined && user && onUpdate) {
        onUpdate({ ...user, credits: parseResponseCredits(data.creditsRemaining) });
      }
    } catch (err) {
      console.warn("Operational idea notice (falling back to local secure strategic node):", err);
      setOperationalIdea("Autonomous clinical reasoning nodes are being synchronized with the new Qwen engine. This strategic ideation pathway will be active shortly.");
    } finally {
      setIsGeneratingIdea(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-slate-950 overflow-hidden transition-all">
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

        <div className="flex-1 min-h-0 relative">
          <ChatInterface 
            user={user} 
            onUpdate={onUpdate} 
            arduino={arduino} 
            onUpgradeRequested={onUpgradeRequested}
            currentLanguage={currentLanguage}
            onNavigate={onNavigate}
            onShowNeuralVisualizer={() => setShowVisualizer(true)}
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
    </div>
  );
}
