import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  MapPin,
  ExternalLink,
  ShieldCheck,
  ChevronUp,
  Sparkles,
  Heart,
  Activity,
  CheckCircle2,
  ArrowRight,
  Globe,
  Phone,
  Radio,
  Server,
  Users
} from 'lucide-react';
import { Logo } from './Logo';

interface FooterProps {
  onNavigate: (view: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [systemTime, setSystemTime] = useState('');
  const [activeClinicians, setActiveClinicians] = useState(14);

  // Dynamic status updates for realism
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format as East Africa Time (EAT) / UTC+3 roughly
      setSystemTime(now.toLocaleTimeString('en-US', { hour12: false, timeZone: 'Africa/Kampala' }) + ' EAT');
    };
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);

    // Minor fluctuation in active clinician connections
    const usersInterval = setInterval(() => {
      setActiveClinicians(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const next = prev + change;
        return next > 8 && next < 25 ? next : prev;
      });
    }, 7000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(usersInterval);
    };
  }, []);

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
    <footer className="relative bg-white dark:bg-[#030712] pt-20 pb-40 lg:pb-20 overflow-hidden border-t border-slate-200 dark:border-slate-900/40 mt-auto transition-colors duration-300">
      
      {/* Elegantly soft illumination backdrops */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        <div className="absolute top-0 left-1/4 w-[450px] h-[350px] bg-gradient-to-br from-blue-500/5 to-transparent dark:from-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 right-1/4 w-[350px] h-[300px] bg-gradient-to-br from-indigo-500/5 to-transparent dark:from-indigo-500/10 rounded-full blur-[90px]" />
        <div className="absolute top-1/2 right-10 w-[200px] h-[200px] bg-gradient-to-br from-emerald-500/5 to-transparent dark:from-emerald-500/10 rounded-full blur-[70px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        
        {/* Interactive System Status Top Row (Modern Grid Bar) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 p-6 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-indigo-950/20 rounded-3xl backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl shrink-0">
              <Server size={18} className="animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Clinic Gateway</p>
              <p className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Uganda Hub Active (UTC+3)
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 border-t md:border-t-0 md:border-x border-slate-200/50 dark:border-slate-800/40 pt-4 md:pt-0 md:px-6">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl shrink-0">
              <Users size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Clinicians Online</p>
              <p className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
                {activeClinicians} Health Workers Syncing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0 md:pl-6">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl shrink-0">
              <Radio size={18} className="animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Calibration Clock</p>
              <p className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight font-mono">
                {systemTime || 'Syncing...'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Main Grid: Branding, Links, Bulletin */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pb-16 border-b border-slate-200 dark:border-slate-800/40">
          
          {/* Brand Identity Panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl text-white shadow-lg shadow-blue-500/15 shrink-0 flex items-center justify-center">
                <Logo className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white uppercase tracking-wider leading-none">
                  Doctorian <span className="text-blue-600 dark:text-blue-500 font-black">AI</span>
                </h2>
                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1.5 leading-none">Clinical Security Core v2.4</p>
              </div>
            </div>

            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium leading-relaxed max-w-sm">
              An advanced, user-centric clinical platform bridging bio-telemetry pipelines in real-time with reliable automated medical insights. Built to ensure smooth workflows for practitioners, VHTs, and regional patients in Great Lakes communities.
            </p>

            {/* Quick Contact Info */}
            <div className="flex flex-col gap-3 pt-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <div className="flex items-center gap-3 group">
                <div className="w-7 h-7 bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                  <Mail size={13} />
                </div>
                <span className="break-all">gloriajayakullo@gmail.com</span>
              </div>
              <div className="flex items-center gap-3 group">
                <div className="w-7 h-7 bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-center text-slate-400">
                  <MapPin size={13} />
                </div>
                <span>Kampala Region, Uganda Node</span>
              </div>
            </div>
          </div>

          {/* Nav Links columns */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {menuSections.map((section, idx) => (
              <div key={idx} className="space-y-5">
                <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link: any, linkIdx) => (
                    <li key={linkIdx}>
                      {link.href ? (
                        <a 
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-150 flex items-center gap-1.5 group/item whitespace-normal break-words"
                        >
                          <span className="flex-1 group-hover/item:translate-x-0.5 transition-transform">{link.label}</span>
                          <ExternalLink size={10} className="opacity-0 group-hover/item:opacity-100 transition-opacity text-blue-500 shrink-0" />
                        </a>
                      ) : (
                        <button
                          onClick={() => onNavigate(link.view)}
                          className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-150 text-left block w-full whitespace-normal break-words hover:translate-x-0.5"
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
          <div className="lg:col-span-3 space-y-5">
            <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Clinical Bulletins</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
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
                      className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-white placeholder:text-slate-400/90 outline-none focus:border-blue-500/60 focus:bg-white dark:focus:bg-slate-950 transition-all"
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
                  <div className="flex items-center gap-1.5 text-slate-400 text-[9px] font-bold uppercase tracking-wider ml-1">
                    <ShieldCheck size={11} className="text-emerald-500 shrink-0" />
                    <span>Secure Delivery TLS Encrypted</span>
                  </div>
                </motion.form>
              ) : (
                <motion.div 
                  key="subscribe-success"
                  className="p-4 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3"
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

        </div>

        {/* Bottom Bar: Copyright, HIPAA Certification, Scroll up button */}
        <div className="pt-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-center md:text-left">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">
              © {currentYear} Doctorian AI. All rights reserved.
            </p>
            <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-full shadow-sm shrink-0">
              <ShieldCheck size={12} className="text-blue-500 shadow-sm" />
              <span className="text-[8px] font-black tracking-widest uppercase text-slate-500 dark:text-slate-400">HIPAA & GDPR COMPLIANT NODE</span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Pulse Calibration Sync
            </span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="p-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl transition-all duration-150 hover:-translate-y-0.5 active:scale-95 shadow-sm border border-slate-200/10 cursor-pointer"
              title="Return to Core Stream"
            >
              <ChevronUp size={16} />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
