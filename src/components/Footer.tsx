import React, { useState, useEffect, useRef } from 'react';
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
  Users,
  Bot,
  Dna,
  Pill
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
  const railRef = useRef<HTMLDivElement>(null);

  const footerFeatures = [
    {
      title: "Real-time Bio-Monitor",
      description: "Direct telemetry connection via Arduino, BLE, and Smartwatch status.",
      status: "Synced",
      color: "from-blue-500 to-indigo-600 bg-blue-500",
      icon: <Activity className="w-5 h-5 text-white" />,
      view: "monitor"
    },
    {
      title: "AI Diagnostic Suite",
      description: "Advanced neurological & diagnostic assistance powered by the medical core.",
      status: "Ready",
      color: "from-violet-500 to-purple-600 bg-violet-600",
      icon: <Bot className="w-5 h-5 text-white" />,
      view: "diagnostic_lab"
    },
    {
      title: "Genomic Longevity Sequence",
      description: "Helix sequence tracking, bio-aging indices, and life optimization parameters.",
      status: "Optimized",
      color: "from-rose-500 to-pink-600 bg-rose-500",
      icon: <Dna className="w-5 h-5 text-white" />,
      view: "genomic_longevity"
    },
    {
      title: "E-Pharmacy Vault",
      description: "MOH medicine catalog syncing and dispatch status records.",
      status: "Active",
      color: "from-emerald-500 to-teal-600 bg-emerald-500",
      icon: <Pill className="w-5 h-5 text-white" />,
      view: "meds"
    },
    {
      title: "VHT Logbook & Registry",
      description: "Aggregated community health logs, diagnostic templates, and physical files.",
      status: "Online",
      color: "from-amber-500 to-orange-600 bg-amber-500",
      icon: <Server className="w-5 h-5 text-white" />,
      view: "records"
    },
    {
      title: "Clinician Specialists Hub",
      description: "Instant connection to experts, pediatricians, cardiologists, and local nodes.",
      status: "Active VHT",
      color: "from-cyan-500 to-blue-600 bg-cyan-500",
      icon: <Users className="w-5 h-5 text-white" />,
      view: "specialist"
    },
    {
      title: "Interactive Sandbox Sim-Lab",
      description: "Simulate complex cardiological situations, calibrate triggers, and plot alerts.",
      status: "Ready",
      color: "from-teal-500 to-emerald-600 bg-teal-500",
      icon: <Sparkles className="w-5 h-5 text-white" />,
      view: "biomatic"
    }
  ];

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

  // Set up mouse drag-to-scroll and horizontal mouse wheel translation for the clinical features rail
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    let isDown = false;
    let startX: number;
    let scrollLeft: number;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      isDown = true;
      rail.classList.add('cursor-grabbing');
      rail.classList.remove('cursor-grab');
      startX = e.pageX - rail.offsetLeft;
      scrollLeft = rail.scrollLeft;
    };

    const handleMouseLeave = () => {
      isDown = false;
      rail.classList.remove('cursor-grabbing');
      rail.classList.add('cursor-grab');
    };

    const handleMouseUp = () => {
      isDown = false;
      rail.classList.remove('cursor-grabbing');
      rail.classList.add('cursor-grab');
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - rail.offsetLeft;
      const walk = (x - startX) * 1.6;
      rail.scrollLeft = scrollLeft - walk;
    };

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        rail.scrollBy({ left: e.deltaY * 1.1, behavior: 'auto' });
      }
    };

    rail.classList.add('cursor-grab');
    rail.addEventListener('mousedown', handleMouseDown);
    rail.addEventListener('mouseleave', handleMouseLeave);
    rail.addEventListener('mouseup', handleMouseUp);
    rail.addEventListener('mousemove', handleMouseMove);
    rail.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      rail.removeEventListener('mousedown', handleMouseDown);
      rail.removeEventListener('mouseleave', handleMouseLeave);
      rail.removeEventListener('mouseup', handleMouseUp);
      rail.removeEventListener('mousemove', handleMouseMove);
      rail.removeEventListener('wheel', handleWheel);
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
    <footer className="relative bg-[#f8fafc] dark:bg-[#030712] pt-10 sm:pt-12 pb-44 lg:pb-24 overflow-hidden border-t-2 border-slate-200 dark:border-slate-900/40 mt-auto transition-colors duration-300">
      
      {/* Laser Gradient Accent Bar across the top of the footer */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 shadow-[0_1px_4px_rgba(59,130,246,0.3)]" />

      {/* Elegantly soft illumination backdrops */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        <div className="absolute top-0 left-1/4 w-[450px] h-[350px] bg-gradient-to-br from-blue-500/10 to-transparent dark:from-blue-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 right-1/4 w-[350px] h-[300px] bg-gradient-to-br from-indigo-500/10 to-transparent dark:from-indigo-500/20 rounded-full blur-[90px]" />
        <div className="absolute top-1/2 right-10 w-[200px] h-[200px] bg-gradient-to-br from-emerald-500/10 to-transparent dark:from-emerald-500/20 rounded-full blur-[70px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        
        {/* Scrollable Container just like the registration / login card */}
        <div 
          id="footer-scroll-viewport" 
          tabIndex={0}
          aria-label="Clinical Footer Console"
          className="max-h-[500px] sm:max-h-[600px] md:max-h-[700px] overflow-y-auto custom-scrollbar pr-1.5 pb-6 space-y-16 border border-slate-200/50 dark:border-slate-800/40 rounded-[2rem] p-6 bg-white/40 dark:bg-slate-950/20 backdrop-blur-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          
          {/* Interactive System Status Top Row (Modern Grid Bar) / Highly visible grid boxes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-indigo-950/20 rounded-[2rem] shadow-md dark:shadow-none hover:shadow-lg transition-shadow duration-300 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl shrink-0 shadow-inner">
                <Server size={18} className="animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Clinic Gateway</p>
                <p className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  Uganda Hub Active (UTC+3)
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 border-t md:border-t-0 md:border-x border-slate-200/50 dark:border-slate-800/40 pt-4 md:pt-0 md:px-6">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl shrink-0 shadow-inner">
                <Users size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Clinicians Online</p>
                <p className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
                  {activeClinicians} Health Workers Syncing
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0 md:pl-6">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl shrink-0 shadow-inner">
                <Radio size={18} className="animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Calibration Clock</p>
                <p className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight font-mono">
                  {systemTime || 'Syncing...'}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Horizontally Scrollable Feature Rail */}
          <div className="p-6 bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/60 rounded-[2.5rem] space-y-5 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Sparkles size={14} className="text-blue-500 animate-spin-slow" /> Interactive Clinical Modules
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-1">
                  Scroll horizontally to explore advanced subsystems and check live module integration statuses.
                </p>
              </div>
              <div className="flex gap-2 self-end sm:self-auto">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    if (railRef.current) railRef.current.scrollBy({ left: -300, behavior: 'smooth' });
                  }}
                  className="w-9 h-9 rounded-xl bg-white dark:bg-slate-955 border border-slate-150 dark:border-slate-800/80 flex items-center justify-center text-slate-650 dark:text-slate-350 hover:text-blue-600 dark:hover:text-cyan-400 hover:border-blue-200 dark:hover:border-cyan-900/50 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all shadow-sm cursor-pointer active:scale-90 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  title="Scroll Left"
                >
                  <span className="font-bold text-sm">←</span>
                </button>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    if (railRef.current) railRef.current.scrollBy({ left: 300, behavior: 'smooth' });
                  }}
                  className="w-9 h-9 rounded-xl bg-white dark:bg-slate-955 border border-slate-150 dark:border-slate-800/80 flex items-center justify-center text-slate-655 dark:text-slate-355 hover:text-blue-600 dark:hover:text-cyan-400 hover:border-blue-200 dark:hover:border-cyan-900/50 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all shadow-sm cursor-pointer active:scale-90 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  title="Scroll Right"
                >
                  <span className="font-bold text-sm">→</span>
                </button>
              </div>
            </div>

            <div 
              ref={railRef}
              id="footer-features-rail"
              tabIndex={0}
              aria-label="Clinical Modules Catalog"
              className="flex flex-row flex-nowrap gap-5 overflow-x-auto pb-3 pt-1 scroll-smooth snap-x snap-mandatory overflow-y-hidden custom-scrollbar relative focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded-3xl"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {footerFeatures.map((item, idx) => (
                <div 
                  key={idx}
                  role="button"
                  tabIndex={0}
                  onClick={() => onNavigate(item.view)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onNavigate(item.view);
                    }
                  }}
                  aria-label={`Activate ${item.title} Pipeline`}
                  className="min-w-[280px] md:min-w-[316px] max-w-[316px] shrink-0 snap-start bg-white dark:bg-slate-955 p-5 rounded-[2rem] border border-slate-155 dark:border-slate-800/70 hover:border-blue-500/30 dark:hover:border-cyan-500/30 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  {/* Background soft glow on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent dark:from-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  
                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 bg-gradient-to-tr ${item.color} rounded-2xl shadow-md group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300`}>
                        {item.icon}
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-full text-slate-500 dark:text-slate-400 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-cyan-500 transition-all duration-150">
                        {item.status}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider group-hover:text-blue-650 dark:group-hover:text-cyan-400 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-1.5 leading-relaxed whitespace-normal">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-5 pt-3 border-t border-slate-50 dark:border-slate-900 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-cyan-405 transition-colors relative z-10">
                    <span>Activate Pipeline</span>
                    <ArrowRight size={12} className="group-hover:translate-x-1.5 transition-transform duration-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Grid: Branding, Links, Bulletin */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pb-6">
            
            {/* Brand Identity Panel */}
            <div className="lg:col-span-4 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl text-white shadow-lg shadow-blue-500/15 shrink-0 flex items-center justify-center">
                  <Logo className="w-5 h-5 text-white" />
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
                  <div className="w-8 h-8 bg-slate-150 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 rounded-xl flex items-center justify-center transition-colors">
                    <Mail size={14} />
                  </div>
                  <span className="break-all select-all font-bold">{process.env.MTN_EMAIL || 'gloriajayakullo@gmail.com'}</span>
                </div>
                <div className="flex items-center gap-3 group">
                  <div className="w-8 h-8 bg-slate-150 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-slate-500 rounded-xl flex items-center justify-center">
                    <MapPin size={14} />
                  </div>
                  <span className="font-bold">Kampala Region, Uganda Node</span>
                </div>
              </div>
            </div>

            {/* Nav Links columns */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 gap-8">
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
            <div className="lg:col-span-3 space-y-5">
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
                        className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-850 dark:text-white placeholder:text-slate-400/90 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-950 transition-all"
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

        </div>

        {/* Bottom Bar: Copyright, HIPAA Certification, Scroll up button */}
        <div className="pt-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-center md:text-left">
            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em]">
              © {currentYear} Doctorian AI. All rights reserved.
            </p>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 dark:bg-emerald-400/10 border border-emerald-500/20 dark:border-emerald-400/20 rounded-full shadow-sm shrink-0">
              <ShieldCheck size={12} className="text-emerald-600 dark:text-emerald-400 shadow-sm" />
              <span className="text-[8px] font-black tracking-widest uppercase text-emerald-600 dark:text-emerald-400">HIPAA & GDPR COMPLIANT NODE</span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
              Pulse Calibration Sync
            </span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="p-3 bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl transition-all duration-150 hover:-translate-y-0.5 active:scale-95 shadow-md border border-slate-200 dark:border-slate-800 cursor-pointer"
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
