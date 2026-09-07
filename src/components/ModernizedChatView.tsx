import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, Plus, Menu, Search, Calendar, UserCheck, 
  Lightbulb, Activity, Check, CheckCheck, Loader2,
  Pill, Thermometer, AlertTriangle, Heart, RefreshCw, X
} from 'lucide-react';
import { Doctorian3DRobot } from './Doctorian3DRobot';
import { api } from '../api';

interface ModernizedChatViewProps {
  user: any;
  onNavigate?: (view: any) => void;
  onOpenMenu?: () => void;
  initialQuery?: string;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  structuredCard?: {
    intro: string;
    items: {
      icon: 'pill' | 'thermometer' | 'alert' | 'heart';
      color: 'blue' | 'purple' | 'amber' | 'cyan';
      title: string;
      desc: string;
    }[];
    followup: string;
  };
}

export const ModernizedChatView: React.FC<ModernizedChatViewProps> = ({
  user,
  onNavigate,
  onOpenMenu,
  initialQuery,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'bot-1',
      sender: 'bot',
      text: "Hello, I'm Doctorian AI 👋\n\nI'm your personal medical assistant. I can help you with health advice, answer your questions, remind you about your medications, and more.\n\nHow can I help you today?",
      timestamp: '9:41 AM',
    },
    {
      id: 'user-1',
      sender: 'user',
      text: 'I have a fever and headache.',
      timestamp: '9:42 AM',
    },
    {
      id: 'bot-2',
      sender: 'bot',
      text: "I'm sorry you're not feeling well. Based on your symptoms, it could be a viral infection, such as a common cold or flu. Here are some suggestions:",
      timestamp: '9:42 AM',
      structuredCard: {
        intro: "I'm sorry you're not feeling well. Based on your symptoms, it could be a viral infection, such as a common cold or flu. Here are some suggestions:",
        items: [
          {
            icon: 'pill',
            color: 'blue',
            title: 'Rest & Hydration',
            desc: 'Drink plenty of fluids and get enough rest.',
          },
          {
            icon: 'thermometer',
            color: 'purple',
            title: 'Fever Management',
            desc: 'You can take paracetamol (if no allergies) to reduce fever and ease pain.',
          },
          {
            icon: 'alert',
            color: 'amber',
            title: 'When to See a Doctor',
            desc: 'If your fever lasts more than 3 days, gets worse, or you have difficulty breathing, seek medical care immediately.',
          },
          {
            icon: 'heart',
            color: 'cyan',
            title: 'Follow-up Care',
            desc: 'Would you like me to set a medication reminder or book a teleconsultation with a doctor?',
          },
        ],
        followup: 'Would you like me to set a medication reminder or book a teleconsultation with a doctor?',
      },
    },
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle passed initial query from hero input
  useEffect(() => {
    const saved = localStorage.getItem('doctorian_initial_chat_query');
    if (saved) {
      localStorage.removeItem('doctorian_initial_chat_query');
      handleSendMessage(saved);
    } else if (initialQuery) {
      handleSendMessage(initialQuery);
    }
  }, [initialQuery]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputVal).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputVal('');
    setIsLoading(true);

    try {
      // Call real Gemini medical AI backend
      const response = await api.ai.aiChat(
        `User symptom or question: "${text}". Provide an empathetic, professional medical response. Keep it clear and structured with supportive guidance. Always remind to consult a doctor if severe.`,
        "You are Doctorian AI, a friendly, highly intelligent medical assistant.",
        "gemini-3.7-flash",
        0.5
      );

      const botReply = response?.text || "Thank you for sharing your symptoms. I recommend staying well-hydrated and monitoring your temperature. If symptoms persist or worsen, please consult a qualified physician.";

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.warn("Error getting AI response:", err);
      const fallbackMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: "I have recorded your symptoms. Be sure to rest, maintain good hydration, and reach out to our tele-clinical team if your symptoms worsen.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMessages = searchTerm
    ? messages.filter((m) => m.text.toLowerCase().includes(searchTerm.toLowerCase()))
    : messages;

  return (
    <div className="flex flex-col h-full w-full bg-[#050b1a] text-slate-100 overflow-hidden select-none">
      {/* 1. Header (Exact Photo 2 Top) */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80 bg-[#070e24]/90 backdrop-blur-md shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMenu}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Menu"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
              <Activity size={20} className="text-cyan-300" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white leading-tight">
                Doctorian <span className="text-blue-500">AI</span>
              </h2>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">
                Your Health, Our Priority
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Search conversation"
          >
            <Search size={18} />
          </button>

          <button
            type="button"
            onClick={() => onNavigate?.('profile')}
            className="w-9 h-9 rounded-full border border-blue-500/40 overflow-hidden bg-slate-800 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
            title="Profile"
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="User" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-blue-600 flex items-center justify-center font-bold text-xs text-white">
                {user?.name?.[0] || 'U'}
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Optional Search Bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 py-2 bg-[#0a1532] border-b border-slate-800 flex items-center gap-2 shrink-0"
          >
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search chat messages..."
              className="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-hidden"
              autoFocus
            />
            <button
              type="button"
              onClick={() => {
                setSearchOpen(false);
                setSearchTerm('');
              }}
              className="text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Chat Stream (Exact Photo 2 Stream) */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
        {filteredMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {/* Bot Avatar on Left */}
            {msg.sender === 'bot' && (
              <Doctorian3DRobot size="sm" isAvatar={true} className="mt-1" />
            )}

            {/* Bubble */}
            <div className={`max-w-[85%] sm:max-w-xl space-y-2.5 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              {msg.sender === 'user' ? (
                /* User Message (Photo 2 Vivid Royal Blue) */
                <div className="bg-[#1d61f2] text-white p-3.5 sm:p-4 rounded-2xl rounded-tr-xs shadow-md">
                  <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                  </p>
                  <div className="flex items-center justify-end gap-1.5 mt-1.5 text-[10px] text-blue-200 font-mono">
                    <span>{msg.timestamp}</span>
                    <CheckCheck size={14} className="text-cyan-300 stroke-[2.5]" />
                  </div>
                </div>
              ) : (
                /* Bot Message (Photo 2 Dark High-Tech Bubble) */
                <div className="bg-[#0b152d]/90 border border-slate-800/80 p-4 rounded-2xl rounded-tl-xs shadow-md text-slate-100 space-y-3">
                  <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                  </p>

                  {/* Structured Recommendation Card (Photo 2) */}
                  {msg.structuredCard && (
                    <div className="mt-3 pt-3 border-t border-slate-800 space-y-3">
                      {msg.structuredCard.items.map((item, idx) => {
                        const iconBg = {
                          blue: 'bg-blue-600/20 text-blue-400 border-blue-500/40',
                          purple: 'bg-purple-600/20 text-purple-400 border-purple-500/40',
                          amber: 'bg-amber-600/20 text-amber-400 border-amber-500/40',
                          cyan: 'bg-cyan-600/20 text-cyan-400 border-cyan-500/40',
                        }[item.color];

                        const IconComp = {
                          pill: Pill,
                          thermometer: Thermometer,
                          alert: AlertTriangle,
                          heart: Heart,
                        }[item.icon];

                        return (
                          <div key={idx} className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/70">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${iconBg}`}>
                              <IconComp size={16} />
                            </div>
                            <div className="min-w-0">
                              <h5 className="text-xs font-bold text-white leading-tight">
                                {item.title}
                              </h5>
                              <p className="text-xs text-slate-300 mt-0.5 leading-snug">
                                {item.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex items-center justify-start text-[10px] text-slate-400 font-mono pt-1">
                    <span>{msg.timestamp}</span>
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar on Right */}
            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-full border border-blue-400/40 overflow-hidden bg-slate-800 flex items-center justify-center mt-1 shrink-0">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-blue-600 flex items-center justify-center font-bold text-[10px] text-white">
                    {user?.name?.[0] || 'U'}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3">
            <Doctorian3DRobot size="sm" isAvatar={true} />
            <div className="bg-[#0b152d]/90 border border-slate-800 px-4 py-3 rounded-2xl flex items-center gap-2 text-slate-300 text-xs">
              <Loader2 size={16} className="animate-spin text-cyan-400" />
              <span>Doctorian AI is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Action Chips Row (Exact Photo 2 Chips) */}
      <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 bg-[#070e24]/60 border-t border-slate-800/60">
        <button
          type="button"
          onClick={() => onNavigate?.('meds')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0d1c3e] hover:bg-[#122552] border border-blue-500/30 text-xs font-semibold text-blue-200 transition-colors cursor-pointer whitespace-nowrap"
        >
          <Calendar size={14} className="text-blue-400" />
          <span>Set Reminder</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate?.('telehealth')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0d1c3e] hover:bg-[#122552] border border-purple-500/30 text-xs font-semibold text-purple-200 transition-colors cursor-pointer whitespace-nowrap"
        >
          <UserCheck size={14} className="text-purple-400" />
          <span>Book a Doctor</span>
        </button>

        <button
          type="button"
          onClick={() => handleSendMessage("Can you give me more evidence-based clinical advice and precautions?")}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0d1c3e] hover:bg-[#122552] border border-amber-500/30 text-xs font-semibold text-amber-200 transition-colors cursor-pointer whitespace-nowrap"
        >
          <Lightbulb size={14} className="text-amber-400" />
          <span>More Advice</span>
        </button>
      </div>

      {/* 4. Bottom Input Dock (Exact Photo 2 Input Bar) */}
      <div className="p-3 sm:p-4 bg-[#070e24]/90 border-t border-slate-800/80 shrink-0 pb-20 sm:pb-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 max-w-4xl mx-auto"
        >
          {/* Circular Plus Button */}
          <button
            type="button"
            className="w-10 h-10 rounded-full bg-[#0b152d] border border-slate-700 hover:border-slate-500 flex items-center justify-center text-slate-300 hover:text-white shrink-0 transition-colors cursor-pointer"
            title="Add attachment"
          >
            <Plus size={20} />
          </button>

          {/* Pill Input */}
          <div className="flex-1 relative flex items-center bg-[#0b152d] rounded-full border border-slate-700/80 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 px-4 py-1.5 transition-all">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Type your message..."
              className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-hidden py-1"
            />
          </div>

          {/* Blue Send Button */}
          <button
            type="submit"
            disabled={!inputVal.trim() || isLoading}
            className="w-11 h-11 rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/30 active:scale-95 transition-all cursor-pointer"
            title="Send Message"
          >
            <Send size={18} className="translate-x-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
