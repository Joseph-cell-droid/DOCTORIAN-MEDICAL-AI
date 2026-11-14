import React, { useRef } from 'react';
import { 
  Mail, 
  MapPin, 
  Lock, 
  ShieldCheck, 
  ExternalLink, 
  Sparkles, 
  Cpu,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  Code2,
  Terminal,
  Activity,
  HeartPulse,
  Radio,
  Server
} from 'lucide-react';
import { Logo } from './Logo';

interface FooterProps {
  onNavigate: (view: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const medicalIntelligenceLinks = [
    { label: "CLINICAL DASHBOARD", view: 'home' },
    { label: "AI DIAGNOSTIC LAB", view: 'diagnostic_lab' },
    { label: "BIO-TELEMETRY MONITOR", view: 'monitor' },
    { label: "NEURAL SYNAPSE ENGINE", view: 'ai_nexus' },
    { label: "COGNISHUB CLINICAL MATRIX", view: 'neuro' },
    { label: "GENOMIC HEALTH PROTOCOL", view: 'genomic_longevity' }
  ];

  const patientCareLinks = [
    { label: "PATIENT REGISTRY & EHR", view: 'records' },
    { label: "SPECIALIST PHYSICIAN HUB", view: 'specialist' },
    { label: "E-PHARMACY & FORMULARY", view: 'meds' },
    { label: "VHT COMMUNITY FIELD LOGS", view: 'fitness' },
    { label: "EMERGENCY SOS RELAY", view: 'gsm_sms_gateway' },
    { label: "CLINICAL PROTOCOL CONTROL", view: 'tasks' }
  ];

  const regionalGatewayLinks = [
    { label: "UGANDA MINISTRY OF HEALTH", href: "https://health.go.ug" },
    { label: "WHATSAPP CLINIC RELAY", href: "https://wa.me/256787674140" },
    { label: "WHO GREAT LAKES NODE", href: "https://www.who.int" },
    { label: "UGANDAN CLINICAL GUIDELINES", href: "https://health.go.ug" },
    { label: "E-MAIL CLINICAL SUPPORT", href: "mailto:support@doctorian.org" },
    { label: "NATIONAL TOLL-FREE LINE", href: "tel:256787674140" }
  ];

  const fastChannels = [
    { name: "Live Vitals Telemetry", icon: HeartPulse, tag: "98.7% Sync", view: "monitor" },
    { name: "Global Health Node", icon: Radio, tag: "Active", view: "home" },
    { name: "Diagnostic AI Lab", icon: Cpu, tag: "Gemini 3.7", view: "diagnostic_lab" },
    { name: "Emergency SMS Gateway", icon: Activity, tag: "GSM Live", view: "gsm_sms_gateway" },
    { name: "Admin Command Center", icon: Server, tag: "Super Admin", view: "admin" },
    { name: "Neural Synapse Hub", icon: Sparkles, tag: "Real-Time", view: "ai_nexus" },
  ];

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -260, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 260, behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer 
      id="doctorian-main-footer" 
      className="relative w-full bg-[#05131e] text-slate-300 font-sans border-t border-[#092235] mt-auto select-none overflow-hidden"
    >
      {/* Background Molecular DNA & Neural Constellation Network Graphic */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-2xl pointer-events-none opacity-20 overflow-hidden">
        <svg 
          viewBox="0 0 700 500" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-full h-full object-cover text-cyan-400"
        >
          <path 
            d="M 450,40 Q 550,110 450,180 T 450,320 T 450,460" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeDasharray="4 4" 
            opacity="0.6"
          />
          <path 
            d="M 550,40 Q 450,110 550,180 T 550,320 T 550,460" 
            stroke="currentColor" 
            strokeWidth="2" 
            opacity="0.6"
          />
          {[60, 100, 140, 180, 220, 260, 300, 340, 380, 420].map((y, i) => (
            <line 
              key={i} 
              x1={450 + Math.sin(i * 0.8) * 45} 
              y1={y} 
              x2={550 - Math.sin(i * 0.8) * 45} 
              y2={y + 12} 
              stroke="currentColor" 
              strokeWidth="1.5" 
              opacity="0.4"
            />
          ))}
          <g stroke="currentColor" strokeWidth="1" opacity="0.5">
            <line x1="380" y1="90" x2="450" y2="120" />
            <line x1="450" y1="120" x2="520" y2="80" />
            <line x1="520" y1="80" x2="620" y2="130" />
            <line x1="620" y1="130" x2="650" y2="240" />
            <line x1="650" y1="240" x2="560" y2="280" />
            <line x1="560" y1="280" x2="480" y2="250" />
            <line x1="480" y1="250" x2="410" y2="340" />
            <line x1="410" y1="340" x2="490" y2="400" />
            <line x1="490" y1="400" x2="590" y2="390" />
            <line x1="590" y1="390" x2="660" y2="460" />
            <line x1="380" y1="90" x2="340" y2="200" />
            <line x1="340" y1="200" x2="410" y2="340" />
          </g>
          {[
            [380, 90], [450, 120], [520, 80], [620, 130],
            [650, 240], [560, 280], [480, 250], [410, 340],
            [490, 400], [590, 390], [660, 460], [340, 200]
          ].map(([cx, cy], idx) => (
            <circle 
              key={idx} 
              cx={cx} 
              cy={cy} 
              r="3.5" 
              fill="#00e5ff" 
              opacity="0.8"
            />
          ))}
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Top Status Header Bar */}
        <section 
          aria-label="Neural Status Bar"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#09253b]/80"
        >
          {/* Left Status */}
          <div className="space-y-0.5 text-left">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)] shrink-0" />
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-100">
                NEURAL AI PIPELINE: CONNECTED
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium pl-4 sm:pl-4.5">
              Latency: <span className="font-bold text-slate-200">~24ms</span> (Edge-Optimized)
            </p>
          </div>

          {/* Right Status + Back to Top */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col sm:items-end space-y-0.5 text-left sm:text-right">
              <div>
                <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-700/60 tracking-tight">
                  Gemini 3.7 Flash Active
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Failover: <span className="font-bold text-slate-200">Multi-Tier Resilient</span>
              </p>
            </div>

            <button
              type="button"
              onClick={scrollToTop}
              title="Smart Scroll to Top"
              className="p-2.5 rounded-xl bg-[#092235] hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 transition-all cursor-pointer shadow-md active:scale-95 flex items-center gap-1.5 text-xs font-bold shrink-0"
            >
              <ArrowUp size={14} />
              <span className="hidden sm:inline">Top</span>
            </button>
          </div>
        </section>

        {/* Smart Scrollable Quick Channels Bar */}
        <div className="relative py-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-widest">
              <Terminal size={13} />
              <span>Smart Medical Stream & Rapid Portals</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={handleScrollLeft}
                aria-label="Scroll left"
                className="p-1 rounded-lg bg-[#061c2b] hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-[#0d344d] transition-all cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              <button 
                onClick={handleScrollRight}
                aria-label="Scroll right"
                className="p-1 rounded-lg bg-[#061c2b] hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-[#0d344d] transition-all cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div 
            ref={scrollContainerRef}
            className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth py-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {fastChannels.map((ch, i) => {
              const Icon = ch.icon;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onNavigate(ch.view)}
                  className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-[#071d2e]/90 hover:bg-[#0b2840] border border-[#0e3b5a] text-slate-200 transition-all shrink-0 hover:border-cyan-400/50 hover:shadow-[0_0_12px_rgba(0,229,255,0.15)] cursor-pointer group"
                >
                  <div className="p-1.5 rounded-lg bg-cyan-950/60 text-cyan-400 border border-cyan-800/40 group-hover:text-cyan-300">
                    <Icon size={14} />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-100 group-hover:text-cyan-200 whitespace-nowrap">{ch.name}</p>
                    <p className="text-[10px] text-cyan-400/80 font-medium">{ch.tag}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Body Split: Brand/Info on Left & 3 Nav Columns on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Left Column (Brand, Bio, Contact Cards, Action Buttons) */}
          <div className="lg:col-span-6 space-y-5 text-left lg:pr-6 lg:border-r border-[#09253b]/80">
            
            {/* Logo and Tagline Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <Logo size="md" showText={false} />
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-white leading-none">
                    Doctorian <span className="text-blue-500">AI</span>
                  </span>
                  <span className="text-[9.5px] font-black tracking-[0.2em] text-blue-400 uppercase mt-1">
                    — MEDICAL INTELLIGENCE
                  </span>
                </div>
              </div>

              {/* Gemini Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/70 text-blue-300 text-[10px] font-black tracking-wider uppercase">
                <Sparkles size={11} className="text-blue-400" />
                <span>GEMINI 3.7 NEURAL CORE</span>
              </div>
            </div>

            {/* Platform Description */}
            <p className="text-xs sm:text-[13px] text-slate-300 font-normal leading-relaxed">
              Doctorian Medical AI is a next-generation clinical intelligence platform bridging real-time bio-telemetry, offline VHT field operations, and multilingual diagnostic reasoning powered by Google Gemini 3.7 for Ugandan and regional healthcare ecosystems.
            </p>

            {/* 2x2 Info & Trust Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#061c2b]/90 border border-[#0d344d] text-slate-300 text-xs">
                <Mail size={14} className="text-blue-400 shrink-0" />
                <span className="truncate font-medium text-slate-200">support@doctorian.org</span>
              </div>

              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#061c2b]/90 border border-[#0d344d] text-slate-300 text-xs">
                <MapPin size={14} className="text-blue-400 shrink-0" />
                <span className="truncate font-medium text-slate-200">Kampala Medical Node, Uganda</span>
              </div>

              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#061c2b]/90 border border-[#0d344d] text-slate-300 text-xs">
                <Lock size={14} className="text-emerald-400 shrink-0" />
                <span className="truncate font-medium text-slate-200">256-Bit TLS & Uganda DPPA 2019</span>
              </div>

              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#061c2b]/90 border border-[#0d344d] text-slate-300 text-xs">
                <ShieldCheck size={14} className="text-blue-400 shrink-0" />
                <span className="truncate font-medium text-slate-200">Autonomous Edge Gateway</span>
              </div>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => onNavigate('ai_nexus')}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer active:scale-98"
              >
                <Sparkles size={14} />
                <span>Clinical AI Nexus</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('diagnostic_lab')}
                className="w-full py-3 px-4 rounded-xl bg-[#061d2d] hover:bg-[#0a263a] text-slate-200 border border-[#144260] text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Cpu size={14} className="text-slate-300" />
                <span>AI Diagnostic Lab</span>
              </button>
            </div>

          </div>

          {/* Right Column: 3 Link Columns */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 lg:pl-2">
            
            {/* Medical Intelligence */}
            <div className="space-y-3 text-left">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-100">
                MEDICAL INTELLIGENCE
              </h4>
              <ul className="space-y-2.5">
                {medicalIntelligenceLinks.map((link, idx) => (
                  <li key={idx}>
                    <button
                      type="button"
                      onClick={() => onNavigate(link.view)}
                      className="text-[11px] font-bold text-slate-300 hover:text-white transition-colors uppercase tracking-wider text-left block cursor-pointer"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Patient Care & Protocols */}
            <div className="space-y-3 text-left">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-100">
                PATIENT CARE & PROTOCOLS
              </h4>
              <ul className="space-y-2.5">
                {patientCareLinks.map((link, idx) => (
                  <li key={idx}>
                    <button
                      type="button"
                      onClick={() => onNavigate(link.view)}
                      className="text-[11px] font-bold text-slate-300 hover:text-white transition-colors uppercase tracking-wider text-left block cursor-pointer"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Regional Gateways */}
            <div className="space-y-3 text-left">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-100">
                REGIONAL GATEWAYS
              </h4>
              <ul className="space-y-2.5">
                {regionalGatewayLinks.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-slate-300 hover:text-white transition-colors uppercase tracking-wider inline-flex items-center gap-1 group"
                    >
                      <span>{link.label}</span>
                      <ExternalLink size={11} className="text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>

        {/* Developer Attribution & Bottom Copyright Bar */}
        <div className="pt-6 border-t border-[#09253b]/80 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-2.5 text-xs text-slate-300">
            <div className="p-1.5 rounded-lg bg-blue-950/80 border border-blue-700/50 text-cyan-400">
              <Code2 size={15} />
            </div>
            <div>
              <p className="font-semibold text-slate-200">
                Lead System Architect & App Developer: <span className="text-cyan-400 font-extrabold tracking-wide">AKORA JOSEPH</span>
              </p>
              <p className="text-[10px] text-slate-400">
                Full-Stack Medical Intelligence & Autonomous Neural Architecture
              </p>
            </div>
          </div>

          <div className="text-xs font-semibold text-slate-400 text-center md:text-right">
            <p>© 2026 Doctorian Medical AI Solutions. All rights reserved.</p>
            <p className="text-[10px] text-slate-500 font-mono">Developed & Maintained by AKORA JOSEPH</p>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
