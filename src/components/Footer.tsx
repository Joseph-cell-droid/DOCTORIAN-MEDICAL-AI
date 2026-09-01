import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  MapPin,
  ExternalLink,
  ShieldCheck,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Cpu,
  Activity,
  Stethoscope,
  Database,
  FileHeart,
  Pill,
  HeartPulse,
  Share2,
  Globe,
  Radio,
  Lock
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

  // Horizontal Quick Nav Scroll Container Ref
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Feedback states
  const [feedbackRating, setFeedbackRating] = useState<'up' | 'down' | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const scrollQuickNav = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubscribed(true);
      setEmail('');
    }, 1000);
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
      console.error("Feedback submit error:", err);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const quickNavModules = [
    { label: "AI Diagnostic Lab", view: 'diagnostic_lab', icon: <Cpu size={13} className="text-cyan-500" />, badge: "Gemini 3.7" },
    { label: "Real-Time Bio-Monitor", view: 'monitor', icon: <Activity size={13} className="text-emerald-500" />, badge: "Live Vitals" },
    { label: "Clinical Synapse AI", view: 'ai_nexus', icon: <Sparkles size={13} className="text-blue-500" />, badge: "Neural" },
    { label: "Patient EHR Vault", view: 'records', icon: <Database size={13} className="text-purple-500" />, badge: "Encrypted" },
    { label: "CognisHub Core", view: 'neuro', icon: <Stethoscope size={13} className="text-indigo-500" />, badge: "Triage" },
    { label: "E-Prescription & Pharmacy", view: 'meds', icon: <Pill size={13} className="text-amber-500" />, badge: "Formulary" },
    { label: "VHT Field Records", view: 'fitness', icon: <HeartPulse size={13} className="text-rose-500" />, badge: "Community" },
    { label: "Genomic Longevity", view: 'genomic_longevity', icon: <FileHeart size={13} className="text-teal-500" />, badge: "Biomarkers" },
    { label: "SMS GSM Gateway", view: 'gsm_sms_gateway', icon: <Radio size={13} className="text-sky-500" />, badge: "Offline SMS" },
    { label: "Specialist Relay", view: 'specialist', icon: <Share2 size={13} className="text-orange-500" />, badge: "On-Duty" },
  ];

  const menuSections = [
    {
      title: "Medical Intelligence",
      links: [
        { label: "Clinical Dashboard", view: 'home' },
        { label: "AI Diagnostic Lab", view: 'diagnostic_lab' },
        { label: "Bio-Telemetry Monitor", view: 'monitor' },
        { label: "Neural Synapse Engine", view: 'ai_nexus' },
        { label: "CognisHub Clinical Matrix", view: 'neuro' },
        { label: "Genomic Health Protocol", view: 'genomic_longevity' }
      ]
    },
    {
      title: "Patient Care & Protocols",
      links: [
        { label: "Patient Registry & EHR", view: 'records' },
        { label: "Specialist Physician Hub", view: 'specialist' },
        { label: "E-Pharmacy & Formulary", view: 'meds' },
        { label: "VHT Community Field Logs", view: 'fitness' },
        { label: "Emergency SOS Relay", view: 'gsm_sms_gateway' },
        { label: "Clinical Protocol Control", view: 'tasks' }
      ]
    },
    {
      title: "Regional Gateways & Standards",
      links: [
        { label: "Uganda Ministry of Health", href: "https://health.go.ug" },
        { label: "WhatsApp Clinic Relay", href: "https://wa.me/256787674140" },
        { label: "WHO Great Lakes Node", href: "https://www.who.int" },
        { label: "Ugandan Clinical Guidelines (UCG)", href: "https://health.go.ug" },
        { label: "E-Mail Clinical Lead", href: "mailto:gloriajayakullo@gmail.com" },
        { label: "National Health Toll-Free Line", href: "tel:256787674140" }
      ]
    }
  ];

  return (
    <footer id="doctorian-main-footer" className="relative bg-[#fafbfd] dark:bg-[#030610] pt-12 pb-28 sm:pb-20 md:pb-16 mt-auto transition-colors duration-300 border-t border-slate-200/70 dark:border-slate-900/80 overflow-visible select-none">
      
      {/* Decorative High-Tech Glow Elements */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent dark:via-cyan-500/40" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-[1px] bg-gradient-to-r from-transparent via-blue-500/60 to-transparent dark:via-cyan-400/60 filter blur-[1px]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-16 bg-blue-500/[0.05] dark:bg-cyan-500/[0.06] rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 w-full flex flex-col space-y-10">
        
        {/* Scrollable Quick-Access Navigation Ribbon */}
        <div className="w-full space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1.5">
                <Globe size={11} className="text-blue-500 dark:text-cyan-400" />
                Clinical Nodes & Express Hubs
              </span>
              <span className="text-[9px] text-slate-400 dark:text-slate-600 font-bold hidden sm:inline">
                (Scrollable Horizontal Strip)
              </span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => scrollQuickNav('left')}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
                title="Scroll Left"
                aria-label="Scroll Left"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => scrollQuickNav('right')}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
                title="Scroll Right"
                aria-label="Scroll Right"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Smooth Horizontal Scroll Ribbon */}
          <div 
            ref={scrollContainerRef}
            className="flex items-center gap-2.5 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 scroll-smooth snap-x select-none"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {quickNavModules.map((item, idx) => (
              <button
                key={`quick-node-${idx}-${item.label}`}
                onClick={() => onNavigate(item.view)}
                className="snap-start shrink-0 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900/80 hover:bg-blue-50/50 dark:hover:bg-slate-850 border border-slate-200/70 dark:border-slate-800/80 transition-all text-left shadow-xs group cursor-pointer"
              >
                <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 group-hover:scale-105 transition-transform shrink-0">
                  {item.icon}
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors whitespace-nowrap">
                    {item.label}
                  </span>
                  <span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 whitespace-nowrap">
                    {item.badge}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Brand & Menu Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 lg:gap-8 py-8 border-t border-b border-slate-200/60 dark:border-slate-900/80">
          
          {/* Brand Info */}
          <div className="flex flex-col space-y-4 lg:pr-4 text-center lg:text-left items-center lg:items-start">
            <Logo size="md" />
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium leading-relaxed max-w-sm">
              Next-generation clinical intelligence platform bridging real-time bio-telemetry, offline VHT field operations, and multilingual medical reasoning for Ugandan and regional healthcare systems.
            </p>
            
            <div className="flex flex-col space-y-2 pt-2 text-[10px] font-bold text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Mail size={12} className="text-blue-500 dark:text-cyan-400 shrink-0" />
                <span className="font-semibold select-all">{process.env.MTN_EMAIL || 'gloriajayakullo@gmail.com'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={12} className="text-blue-500 dark:text-cyan-400 shrink-0" />
                <span>Kampala Medical Node, Uganda</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock size={12} className="text-emerald-500 shrink-0" />
                <span>256-Bit TLS Clinical Encryption</span>
              </div>
            </div>
          </div>

          {/* Navigation Columns */}
          {menuSections.map((section, idx) => (
            <div key={`footer-menu-col-${idx}`} className="flex flex-col space-y-3.5 text-center lg:text-left items-center lg:items-start">
              <h4 className="text-[10px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-[0.2em]">
                {section.title}
              </h4>
              <ul className="space-y-2 w-full">
                {section.links.map((link: any, linkIdx: number) => (
                  <li key={`footer-link-item-${idx}-${linkIdx}`} className="flex justify-center lg:justify-start">
                    {link.href ? (
                      <a 
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors duration-150 inline-flex items-center gap-1.5 group/link uppercase tracking-wider"
                      >
                        <span>{link.label}</span>
                        <ExternalLink size={10} className="text-blue-500/80 dark:text-cyan-500/80 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform shrink-0" />
                      </a>
                    ) : (
                      <button
                        onClick={() => onNavigate(link.view)}
                        className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors duration-150 uppercase tracking-wider cursor-pointer text-left"
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

        {/* Interactive Segment: Feedback + Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          
          {/* Newsletter Panel */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-850/80 rounded-2xl p-5 flex flex-col space-y-3.5 shadow-xs">
            <div>
              <h4 className="text-[10px] font-black text-slate-900 dark:text-slate-200 uppercase tracking-[0.2em]">
                Clinical Bulletins & Protocols
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium mt-0.5">
                Subscribe to official clinical alerts, telemetry releases, and regional health warnings.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {!subscribed ? (
                <motion.form 
                  key="subscribe-form"
                  onSubmit={handleSubscribe}
                  className="space-y-2.5 w-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="relative">
                    <input 
                      required
                      type="email"
                      placeholder="ENTER CLINICAL EMAIL..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950/70 rounded-xl px-3.5 py-2.5 text-[10px] font-black uppercase tracking-wider text-slate-800 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/30 transition-all border border-slate-200 dark:border-slate-800"
                    />
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="absolute right-1 top-1 bottom-1 px-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg transition-all active:scale-95 flex items-center justify-center shadow-xs cursor-pointer"
                      title="Subscribe"
                    >
                      {isSubmitting ? (
                        <span className="text-[8px] font-black uppercase tracking-widest px-1 animate-pulse">...</span>
                      ) : (
                        <ArrowRight size={12} />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-[8px] font-black uppercase tracking-wider">
                    <ShieldCheck size={11} className="text-emerald-500 shrink-0" />
                    <span>Secure Encrypted Delivery Channel</span>
                  </div>
                </motion.form>
              ) : (
                <motion.div 
                  key="subscribe-success"
                  className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">Terminal Enrolled</span>
                    <span className="text-[8px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-black block">Clinical notifications active</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Feedback Panel */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-850/80 rounded-2xl p-5 flex flex-col space-y-3.5 shadow-xs">
            <div>
              <h4 className="text-[10px] font-black text-slate-900 dark:text-slate-200 uppercase tracking-[0.2em]">
                Diagnostic Experience Feedback
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium mt-0.5">
                Help us calibrate Doctorian Medical AI for practitioners and field workers.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {!feedbackSubmitted ? (
                <motion.form
                  key="feedback-form"
                  onSubmit={handleFeedbackSubmit}
                  className="space-y-2.5 w-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Rating buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFeedbackRating('up')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
                        feedbackRating === 'up'
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : "bg-slate-50 dark:bg-slate-950/70 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      <ThumbsUp size={12} className={feedbackRating === 'up' ? "scale-110" : ""} />
                      Accurate
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeedbackRating('down')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
                        feedbackRating === 'down'
                          ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                          : "bg-slate-50 dark:bg-slate-950/70 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      <ThumbsDown size={12} className={feedbackRating === 'down' ? "scale-110" : ""} />
                      Needs Tuning
                    </button>
                  </div>

                  {/* Suggestions textbox */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="SUGGESTION OR CLINICAL NOTE..."
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950/70 rounded-xl px-3.5 py-2 text-[10px] font-black uppercase tracking-wider text-slate-800 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/30 transition-all border border-slate-200 dark:border-slate-800"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingFeedback || !feedbackRating}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    {isSubmittingFeedback ? "TRANSMITTING..." : "SUBMIT CLINICAL FEEDBACK"}
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="feedback-success"
                  className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex flex-col gap-1"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Feedback Logged</span>
                  </div>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-black">
                    Thank you. Your feedback optimizes our Gemini clinical intelligence model.
                  </p>
                  <button
                    type="button"
                    onClick={() => setFeedbackSubmitted(false)}
                    className="text-left text-[8px] font-black uppercase tracking-wider text-blue-600 dark:text-cyan-400 hover:underline mt-0.5 cursor-pointer"
                  >
                    Submit Additional Notes
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="w-full pt-6 border-t border-slate-200/60 dark:border-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
              © {currentYear} Doctorian Medical AI.
            </p>
            <span className="text-slate-300 dark:text-slate-800 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-900 rounded-full text-[9px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800/60">
              Developed by <span className="text-blue-600 dark:text-cyan-400 font-extrabold ml-0.5">Akora Joseph</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              Gemini Synapse Connected
            </span>
            <span className="text-slate-300 dark:text-slate-800">|</span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="p-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800/60 text-slate-600 dark:text-slate-400 rounded-xl transition-all hover:-translate-y-0.5 active:scale-95 shadow-xs cursor-pointer flex items-center gap-1 text-[9px] font-black uppercase tracking-wider"
              title="Return to top of page"
            >
              <ChevronUp size={13} />
              <span>Top</span>
            </button>
          </div>

        </div>

      </div>
    </footer>
  );
};
