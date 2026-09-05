import React from 'react';
import { 
  Mail, 
  MapPin, 
  Lock, 
  ShieldCheck, 
  ExternalLink, 
  Sparkles, 
  Cpu
} from 'lucide-react';
import { Logo } from './Logo';

interface FooterProps {
  onNavigate: (view: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
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
    { label: "E-MAIL CLINICAL LEAD", href: "mailto:gloriajayakullo@gmail.com" },
    { label: "NATIONAL TOLL-FREE LINE", href: "tel:256787674140" }
  ];

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
          {/* DNA Double Helix Strands */}
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
          
          {/* Base Pair Connecting Rungs */}
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

          {/* Molecular Constellation Nodes & Connecting Synapses */}
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

          {/* Nodes */}
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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Top Status Header Bar */}
        <section 
          aria-label="Neural Status Bar"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-[#09253b]/80"
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

          {/* Right Status */}
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
        </section>

        {/* Main Body Split: Brand/Info on Left & 3 Nav Columns on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Left Column (Brand, Bio, Contact Cards, Mini Status, Action Buttons) */}
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
                <span className="truncate font-medium text-slate-200">gloriajayakullo@gmail.com</span>
              </div>

              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#061c2b]/90 border border-[#0d344d] text-slate-300 text-xs">
                <MapPin size={14} className="text-blue-400 shrink-0" />
                <span className="truncate font-medium text-slate-200">Kampala Medical Node, Uganda</span>
              </div>

              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#061c2b]/90 border border-[#0d344d] text-slate-300 text-xs">
                <Lock size={14} className="text-emerald-400 shrink-0" />
                <span className="truncate font-medium text-slate-200">256-Bit TLS & HIPAA Ready</span>
              </div>

              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#061c2b]/90 border border-[#0d344d] text-slate-300 text-xs">
                <ShieldCheck size={14} className="text-blue-400 shrink-0" />
                <span className="truncate font-medium text-slate-200">Autonomous Edge Gateway</span>
              </div>
            </div>

            {/* Mini Neural AI Pipeline Card */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-[#061c2b]/90 border border-[#0e3a57] space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-200">
                    NEURAL AI PIPELINE: CONNECTED
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[9px] font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-800/60">
                  Gemini 3.7 Flash Active
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Latency: <strong className="text-slate-200 font-semibold">~24ms</strong> (Edge-Optimized)</span>
                <span>Failover: <strong className="text-slate-200 font-semibold">Multi-Tier Resilient</strong></span>
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

          {/* Right Column: 3 Link Columns (Medical Intelligence, Patient Care, Regional Gateways) */}
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

        {/* Bottom Copyright Center Bar */}
        <div className="pt-6 border-t border-[#09253b]/80 text-center">
          <p className="text-xs font-semibold text-slate-400">
            © 2024 Doctorian Medical Solutions. Built with Gemini 3.7. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
