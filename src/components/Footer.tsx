import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  MapPin,
  ExternalLink,
  ShieldCheck,
  ChevronUp,
  CheckCircle2,
  ArrowRight,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { Logo } from './Logo';
import { api } from '../api';

interface FooterProps {
  onNavigate: (view: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Feedback states
  const [feedbackRating, setFeedbackRating] = useState<'up' | 'down' | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubscribed(true);
      setEmail('');
    }, 1200);
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackRating || isSubmittingFeedback) return;
    setIsSubmittingFeedback(true);
    try {
      await api.ai.submitFeedback({
        messageId: "footer_user_feedback_" + Date.now(),
        rating: feedbackRating,
        suggestion: feedbackText,
      });
      setFeedbackSubmitted(true);
      setFeedbackText('');
      setFeedbackRating(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const menuSections = [
    {
      title: "Medical Suite",
      links: [
        { label: "Clinical Dashboard", view: 'home' },
        { label: "AI Diagnostic Lab", view: 'diagnostic_lab' },
        { label: "Bio-Monitor Link", view: 'monitor' },
        { label: "Neural Network Analysis", view: 'ai_nexus' },
        { label: "CognisHub Core", view: 'neuro' }
      ]
    },
    {
      title: "Clinical Records",
      links: [
        { label: "Patient Registry", view: 'records' },
        { label: "Specialist Routing", view: 'specialist' },
        { label: "E-Pharmacy Vault", view: 'meds' },
        { label: "VHT Physical Logs", view: 'fitness' },
        { label: "Billing & Protocol Control", view: 'billing' }
      ]
    },
    {
      title: "Regional Gateways",
      links: [
        { label: "Uganda Ministry of Health", href: "https://health.go.ug" },
        { label: "WhatsApp Clinic Relay", href: "https://wa.me/256787674140" },
        { label: "WHO Great Lakes Node", href: "https://www.who.int" },
        { label: "E-Mail Clinical Lead", href: "mailto:gloriajayakullo@gmail.com" },
        { label: "National Health Line", href: "tel:256787674140" }
      ]
    }
  ];

  return (
    <footer className="relative bg-[#f8fafc] dark:bg-[#030712] pt-16 sm:pt-20 pb-48 lg:pb-32 max-h-[85vh] lg:max-h-none overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-850 mt-auto transition-colors duration-300 border-t border-slate-200/80 dark:border-slate-800/80 shadow-[0_-15px_30px_rgba(0,0,0,0.02)] dark:shadow-[0_-15px_40px_rgba(0,0,0,0.4)]">
      
      {/* High-tech Separator Laser Line & Ambient Glow */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-550/40 to-transparent dark:via-cyan-500/50" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[280px] h-[20px] bg-blue-500/10 dark:bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />

      {/* Elegantly soft illumination backdrops */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        <div className="absolute top-0 left-1/4 w-[450px] h-[350px] bg-gradient-to-br from-blue-500/10 to-transparent dark:from-blue-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 right-1/4 w-[350px] h-[300px] bg-gradient-to-br from-indigo-500/10 to-transparent dark:from-indigo-500/20 rounded-full blur-[90px]" />
        <div className="absolute top-1/2 right-10 w-[200px] h-[200px] bg-gradient-to-br from-emerald-500/10 to-transparent dark:from-emerald-500/20 rounded-full blur-[70px]" />
      </div>

      <div className="max-w-none mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 relative z-10 w-full">
        
        {/* Main Grid: Branding, Links, Bulletin, Feedback */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pb-6">
          
          {/* Brand Identity Panel */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl text-white shadow-lg shadow-blue-500/15 shrink-0 flex items-center justify-center">
                <Logo className="w-5 h-5 text-white" showText={false} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-950 dark:text-white uppercase tracking-wider leading-none">
                  Doctorian <span className="text-blue-600 dark:text-blue-500 font-black">AI</span>
                </h2>
                <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1.5 leading-none">Clinical Security Core v2.4</p>
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-300 text-xs font-semibold leading-relaxed max-w-sm">
              An advanced, user-centric clinical platform bridging bio-telemetry pipelines in real-time with reliable automated medical insights. Built to ensure smooth workflows for practitioners, VHTs, and regional patients in Great Lakes communities.
            </p>

            {/* Quick Contact Info */}
            <div className="flex flex-col gap-3 pt-2 text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <div className="flex items-center gap-3 group">
                <div className="w-8 h-8 bg-slate-150 dark:bg-slate-900 text-slate-550 rounded-xl flex items-center justify-center">
                  <Mail size={14} />
                </div>
                <span className="break-all select-all font-bold">{process.env.MTN_EMAIL || 'gloriajayakullo@gmail.com'}</span>
              </div>
              <div className="flex items-center gap-3 group">
                <div className="w-8 h-8 bg-slate-150 dark:bg-slate-900 text-slate-550 rounded-xl flex items-center justify-center">
                  <MapPin size={14} />
                </div>
                <span className="font-bold">Kampala Region, Uganda Node</span>
              </div>
            </div>
          </div>

          {/* Nav Links columns */}
          <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {menuSections.map((section, idx) => (
              <div key={idx} className="space-y-5">
                <h4 className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-[0.2em]">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link: any, linkIdx) => (
                    <li key={linkIdx}>
                      {link.href ? (
                        <a 
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 transition-all duration-150 flex items-center gap-1.5 group/item whitespace-normal break-words"
                        >
                          <span className="flex-1 group-hover/item:translate-x-1 transition-transform">{link.label}</span>
                          <ExternalLink size={10} className="text-blue-500 dark:text-cyan-450 transform group-hover/item:scale-110 transition-transform shrink-0" />
                        </a>
                      ) : (
                        <button
                          onClick={() => onNavigate(link.view)}
                          className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 transition-all duration-150 text-left block w-full whitespace-normal break-words hover:translate-x-1"
                        >
                          {link.label}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bulletin Feed panel */}
          <div className="lg:col-span-2.5 space-y-5">
            <h4 className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-[0.2em]">Clinical Bulletins</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
              Subscribe to the secure feed for modern clinical announcements, infectious health warnings, and telemetry release briefs.
            </p>

            <AnimatePresence mode="wait">
              {!subscribed ? (
                <motion.form 
                  key="subscribe-form"
                  onSubmit={handleSubscribe}
                  className="space-y-2.5 mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="relative">
                    <input 
                      required
                      type="email"
                      placeholder="ENTER TERMINAL EMAIL..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-slate-900 rounded-2xl px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-850 dark:text-white placeholder:text-slate-400/90 outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-slate-950 transition-all"
                    />
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="absolute right-2 top-2 bottom-2 px-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all active:scale-95 flex items-center justify-center shadow-md shadow-blue-500/10 cursor-pointer"
                      title="Subscribe"
                    >
                      {isSubmitting ? (
                        <span className="text-[9px] font-black uppercase tracking-widest px-1 animate-pulse">...</span>
                      ) : (
                        <ArrowRight size={13} />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase tracking-wider ml-1">
                    <ShieldCheck size={11} className="text-emerald-500 shrink-0" />
                    <span>Secure Delivery TLS Encrypted</span>
                  </div>
                </motion.form>
              ) : (
                <motion.div 
                  key="subscribe-success"
                  className="p-4 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-2xl flex items-center gap-3"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0 animate-bounce" />
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block pb-0.5">Terminal Registered</span>
                    <span className="text-[8px] text-slate-400 uppercase tracking-widest font-black block">Secure notification channel online</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Feedback Panel */}
          <div className="lg:col-span-2.5 space-y-5">
            <h4 className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-[0.2em]">Share Feedback</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
              Help us improve this portal. Rate your overall experience and let us know your suggestions.
            </p>

            <AnimatePresence mode="wait">
              {!feedbackSubmitted ? (
                <motion.form
                  key="feedback-form"
                  onSubmit={handleFeedbackSubmit}
                  className="space-y-4 mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Rating buttons */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setFeedbackRating('up')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        feedbackRating === 'up'
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10"
                          : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                      }`}
                    >
                      <ThumbsUp size={14} className={feedbackRating === 'up' ? "scale-110" : ""} />
                      Good
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeedbackRating('down')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        feedbackRating === 'down'
                          ? "bg-rose-600 text-white shadow-md shadow-rose-600/10"
                          : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                      }`}
                    >
                      <ThumbsDown size={14} className={feedbackRating === 'down' ? "scale-110" : ""} />
                      Bad
                    </button>
                  </div>

                  {/* Suggestions textbox */}
                  <div className="relative">
                    <textarea
                      rows={2}
                      placeholder="ANY CONSTRUCTIVE FEEDBACK..."
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-slate-900 rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-850 dark:text-white placeholder:text-slate-400/90 outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-slate-950 transition-all resize-none font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingFeedback || !feedbackRating}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2 shadow-md shadow-blue-500/10 cursor-pointer font-sans"
                  >
                    {isSubmittingFeedback ? "SUBMITTING..." : "SUBMIT FEEDBACK"}
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="feedback-success"
                  className="p-4 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-2xl flex flex-col gap-2"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Feedback Submitted</span>
                  </div>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-black leading-relaxed">
                    Thank you for helping us build a better Doctorian AI. Your input is valuable.
                  </span>
                  <button
                    type="button"
                    onClick={() => setFeedbackSubmitted(false)}
                    className="text-left text-[9px] font-black uppercase tracking-wider text-blue-600 dark:text-cyan-400 hover:underline mt-1 cursor-pointer font-sans"
                  >
                    Submit Another
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Bottom Bar: Copyright, HIPAA Certification, Scroll up button */}
        <div className="pt-10 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-slate-200/40 dark:border-slate-800/40 mt-10">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-center md:text-left">
            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em]">
              © {currentYear} Doctorian AI. All rights reserved.
            </p>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 dark:bg-emerald-400/10 rounded-full shadow-sm shrink-0">
              <ShieldCheck size={12} className="text-emerald-600 dark:text-emerald-400 shadow-sm" />
              <span className="text-[8px] font-black tracking-widest uppercase text-emerald-600 dark:text-emerald-400">HIPAA & GDPR COMPLIANT NODE</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800/40 font-sans">
              Developed by <span className="text-blue-600 dark:text-cyan-400 font-extrabold ml-1 animate-pulse font-sans">Akora Joseph</span>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                Pulse Calibration Sync
              </span>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="p-3 bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl transition-all duration-150 hover:-translate-y-0.5 active:scale-95 shadow-md cursor-pointer"
                title="Return to Core Stream"
              >
                <ChevronUp size={16} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};
