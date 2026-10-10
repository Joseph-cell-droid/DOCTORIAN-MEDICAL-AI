import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, Brain, Crown, Loader2, Dna
} from 'lucide-react';
import { ChatInterface } from './ChatInterface';
import { ModernizedChatView } from './ModernizedChatView';
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
  onChangeLanguage?: (lang: string) => void;
  isDarkMode?: boolean;
}

export function MedicalAI({ user, onUpdate, onRefreshUser, onNavigate, arduino, onUpgradeRequested, currentLanguage, onChangeLanguage, isDarkMode }: MedicalAIProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showVisualizer, setShowVisualizer] = useState(false);
  const [operationalIdea, setOperationalIdea] = useState<string | null>(null);
  const [isGeneratingIdea, setIsGeneratingIdea] = useState(false);
  const [chatMode, setChatMode] = useState<'modern' | 'matrix'>('modern');

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
          {chatMode === 'modern' ? (
            <ModernizedChatView 
              user={user} 
              onUpdate={onUpdate} 
              arduino={arduino} 
              onUpgradeRequested={onUpgradeRequested}
              currentLanguage={currentLanguage}
              onChangeLanguage={onChangeLanguage}
              onNavigate={onNavigate}
              onShowNeuralVisualizer={() => setShowVisualizer(true)}
              onSwitchToMatrix={() => setChatMode('matrix')}
              isDarkMode={isDarkMode}
            />
          ) : (
            <div className="relative h-full w-full">
              <button
                type="button"
                onClick={() => setChatMode('modern')}
                className="absolute top-2 right-24 z-50 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5 cursor-pointer"
              >
                <span>Return to Modern View</span>
              </button>
              <ChatInterface 
                user={user} 
                onUpdate={onUpdate} 
                arduino={arduino} 
                onUpgradeRequested={onUpgradeRequested}
                currentLanguage={currentLanguage}
                onChangeLanguage={onChangeLanguage}
                onNavigate={onNavigate}
                onShowNeuralVisualizer={() => setShowVisualizer(true)}
              />
            </div>
          )}
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

export default MedicalAI;
