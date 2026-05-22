import React, { useState } from 'react';
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
  Phone
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
      title: "Digital Handshakes",
      links: [
        { label: "WhatsApp Clinic Relay", href: "https://wa.me/256787674140" },
        { label: "X Systems", href: "https://x.com" },
        { label: "Instagram Link", href: "https://instagram.com" },
        { label: "Developer Git Link", href: "https://github.com" },
        { label: "E-Mail Assistance", href: "mailto:gloriajayakullo@gmail.com" }
      ]
    }
  ];

  return (
    <footer className="relative bg-[#fafafc] dark:bg-[#030712] pt-16 pb-36 lg:pb-16 overflow-hidden border-t border-slate-200/50 dark:border-slate-900/40 mt-auto">
      {/* Elegantly soft illumination backdrops */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        <div className="absolute top-0 left-1/4 w-[400px] h-[300px] bg-gradient-to-br from-blue-500/5 to-transparent dark:from-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-10 right-1/4 w-[300px] h-[250px] bg-gradient-to-br from-indigo-500/5 to-transparent dark:from-indigo-500/10 rounded-full blur-[80px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Main Grid: Branding, Newsletter, Links */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pb-12 border-b border-slate-200/50 dark:border-slate-800/40">
          
          {/* Brand Identity Panel (Left 4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl text-white shadow-md shadow-blue-500/15 shrink-0 flex items-center justify-center">
                <Logo className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white uppercase tracking-wider leading-tight">
                  Doctorian <span className="text-blue-600 dark:text-blue-500 font-black">AI</span>
                </h2>
                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Clinical Security Core</p>
              </div>
            </div>

            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium leading-relaxed max-w-sm">
              An advanced, user-centric clinical platform bridging bio-telemetry pipelines in real-time with reliable automated medical insights. Built to ensure smooth workflows for medical practitioners.
            </p>

            {/* Quick Contact Line */}
            <div className="flex flex-col gap-2.5 pt-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <Mail size={13} className="text-slate-400 font-bold" />
                <span className="break-all">gloriajayakullo@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={13} className="text-slate-400" />
                <span>Regional Clinical Node, Uganda</span>
              </div>
            </div>
          </div>

          {/* Links Section (Middle 5 cols) */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {menuSections.map((section, idx) => (
              <div key={idx} className="space-y-4">
                <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{section.title}</h4>
                <ul className="space-y-2.5">
                  {section.links.map((link: any, linkIdx) => (
                    <li key={linkIdx}>
                      {link.href ? (
                        <a 
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-150 flex items-center gap-1 group/item whitespace-normal break-words"
                        >
                          <span className="flex-1">{link.label}</span>
                          <ExternalLink size={10} className="opacity-0 group-hover/item:opacity-100 transition-opacity text-blue-500 shrink-0" />
                        </a>
                      ) : (
                        <button
                          onClick={() => onNavigate(link.view)}
                          className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-150 text-left block w-full whitespace-normal break-words"
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

          {/* Newsletter / Bulletin Subscription Panel (Right 3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Clinical Bulletins</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Subscribe to the secure feed for modern clinical announcements, safety updates, and system release briefs.
            </p>

            <AnimatePresence mode="wait">
              {!subscribed ? (
                <motion.form 
                  key="subscribe-form"
                  onSubmit={handleSubscribe}
                  className="space-y-2 mt-2"
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
                      className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-800 dark:text-white placeholder:text-slate-400 outline-none focus:border-blue-500/60 transition-colors"
                    />
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-transform active:scale-95 flex items-center justify-center"
                      title="Subscribe"
                    >
                      {isSubmitting ? (
                        <span className="text-[9px] font-black uppercase tracking-widest px-1">...</span>
                      ) : (
                        <ArrowRight size={13} />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 text-[9px] font-semibold uppercase tracking-wider">
                    <ShieldCheck size={11} className="text-emerald-500 shrink-0" />
                    <span>Secure Delivery Encrypted</span>
                  </div>
                </motion.form>
              ) : (
                <motion.div 
                  key="subscribe-success"
                  className="p-3 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2.5"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block h-4">Terminal Registered</span>
                    <span className="text-[8px] text-slate-400 uppercase tracking-widest font-semibold block">Secure channel established</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Bottom Bar: Copyright, HIPAA Badging, Scroll to Top */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-center md:text-left">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">
              © {currentYear} Doctorian AI. All rights reserved.
            </p>
            <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-full shadow-sm shrink-0">
              <ShieldCheck size={12} className="text-blue-500" />
              <span className="text-[8px] font-black tracking-widest uppercase text-slate-500 dark:text-slate-400">HIPAA COMPLIANT</span>
            </div>
          </div>

          {/* Up to Core trigger */}
          <div className="flex items-center gap-5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Acoustic Signal Calibration Sync</span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="p-2 bg-slate-200/60 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl transition-all duration-150 hover:-translate-y-0.5 active:scale-95 shadow-sm"
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
