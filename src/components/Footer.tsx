import React, { useRef } from 'react';
import { 
  Mail, 
  MapPin,
  ExternalLink,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
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
  Lock,
  ShieldCheck
} from 'lucide-react';
import { Logo } from './Logo';

interface FooterProps {
  onNavigate: (view: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();

  // Horizontal Quick Nav Scroll Container Ref
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollQuickNav = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
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
      title: "Regional Gateways",
      links: [
        { label: "Uganda Ministry of Health", href: "https://health.go.ug" },
        { label: "WhatsApp Clinic Relay", href: "https://wa.me/256787674140" },
        { label: "WHO Great Lakes Node", href: "https://www.who.int" },
        { label: "Ugandan Clinical Guidelines", href: "https://health.go.ug" },
        { label: "E-Mail Clinical Lead", href: "mailto:gloriajayakullo@gmail.com" },
        { label: "National Toll-Free Line", href: "tel:256787674140" }
      ]
    }
  ];

  return (
    <footer id="doctorian-main-footer" className="relative bg-[#fafbfd] dark:bg-[#030610] pt-10 pb-28 sm:pb-20 md:pb-14 mt-auto transition-colors duration-300 border-t border-slate-200/70 dark:border-slate-900/80 overflow-visible select-none">
      
      {/* Decorative High-Tech Glow Elements */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent dark:via-cyan-500/40" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-[1px] bg-gradient-to-r from-transparent via-blue-500/60 to-transparent dark:via-cyan-400/60 filter blur-[1px]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-16 bg-blue-500/[0.05] dark:bg-cyan-500/[0.06] rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 w-full flex flex-col space-y-8">
        
        {/* Scrollable Quick-Access Navigation Ribbon */}
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1.5">
                <Globe size={11} className="text-blue-500 dark:text-cyan-400" />
                Clinical Nodes & Express Hubs
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
            className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 scroll-smooth snap-x select-none"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {quickNavModules.map((item, idx) => (
              <button
                key={`quick-node-${idx}-${item.label}`}
                onClick={() => onNavigate(item.view)}
                className="snap-start shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-900/80 hover:bg-blue-50/50 dark:hover:bg-slate-850 border border-slate-200/70 dark:border-slate-800/80 transition-all text-left shadow-xs group cursor-pointer"
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

        {/* Two Separate Columns: Left & Right Equal 50/50 Split */}
        <div className="pt-6 border-t border-slate-200/60 dark:border-slate-900/80">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            
            {/* Left Column (50%): Brand, Mission, Clinical Trust Nodes & AI Status */}
            <div className="w-full flex flex-col justify-between space-y-6 text-left lg:pr-8 xl:pr-10 lg:border-r border-slate-200/70 dark:border-slate-800/80">
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <Logo size="md" />
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-500/10 dark:bg-cyan-500/10 text-blue-600 dark:text-cyan-400 border border-blue-500/20 dark:border-cyan-500/20">
                    <Sparkles size={10} className="animate-spin" />
                    Gemini 3.7 Neural Core
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium leading-relaxed max-w-xl">
                  Doctorian Medical AI is a next-generation clinical intelligence platform bridging real-time bio-telemetry, offline VHT field operations, and multilingual diagnostic reasoning powered by Google Gemini 3.7 for Ugandan and regional healthcare ecosystems.
                </p>
              </div>
              
              {/* 2x2 Trust & Telemetry Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 dark:bg-cyan-500/10 flex items-center justify-center shrink-0">
                    <Mail size={13} className="text-blue-600 dark:text-cyan-400" />
                  </div>
                  <span className="font-semibold select-all text-slate-700 dark:text-slate-300 truncate text-[11px]">gloriajayakullo@gmail.com</span>
                </div>

                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 dark:bg-cyan-500/10 flex items-center justify-center shrink-0">
                    <MapPin size={13} className="text-blue-600 dark:text-cyan-400" />
                  </div>
                  <span className="truncate text-[11px]">Kampala Medical Node, Uganda</span>
                </div>

                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Lock size={13} className="text-emerald-500" />
                  </div>
                  <span className="text-slate-600 dark:text-slate-400 truncate text-[11px]">256-Bit TLS & HIPAA Ready</span>
                </div>

                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                    <ShieldCheck size={13} className="text-indigo-500" />
                  </div>
                  <span className="text-slate-600 dark:text-slate-400 truncate text-[11px]">Autonomous Edge Gateway</span>
                </div>
              </div>

              {/* Live AI Neural Status & Telemetry Node */}
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-50/50 via-slate-50 to-indigo-50/30 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-blue-950/20 border border-blue-200/50 dark:border-blue-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Neural AI Pipeline: Connected
                    </span>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Gemini 3.7 Flash Active
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                  <span>Latency: <strong className="text-slate-700 dark:text-slate-300">~24ms</strong> (Edge-Optimized)</span>
                  <span>Failover: <strong className="text-slate-700 dark:text-slate-300">Multi-Tier Resilient</strong></span>
                </div>
              </div>

              {/* Quick AI Express Action Bar */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => onNavigate('ai_nexus')}
                  className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles size={12} />
                  <span>Clinical AI Nexus</span>
                </button>
                <button
                  onClick={() => onNavigate('diagnostic_lab')}
                  className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-750 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Cpu size={12} />
                  <span>AI Diagnostic Lab</span>
                </button>
              </div>
            </div>

            {/* Right Column (50%): Organized 3-Sub-Column Navigation */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-6 text-left lg:pl-4 xl:pl-6">
              {menuSections.map((section, idx) => (
                <div key={`footer-col-${idx}`} className="flex flex-col space-y-3.5 text-left">
                  <h4 className="text-[10px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-[0.2em] border-b border-slate-200/50 dark:border-slate-800/60 pb-2">
                    {section.title}
                  </h4>
                  <ul className="space-y-2.5 w-full">
                    {section.links.map((link: any, linkIdx: number) => (
                      <li key={`footer-link-${idx}-${linkIdx}`}>
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
                            className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors duration-150 uppercase tracking-wider cursor-pointer text-left block"
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

          </div>
        </div>

        {/* Bottom Copyright & Status Bar */}
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
