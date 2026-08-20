import { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  Image as ImageIcon, 
  Loader2, 
  Download, 
  Sparkles, 
  Cpu, 
  Layers, 
  Sliders, 
  Check, 
  Eye, 
  RefreshCw, 
  Plus, 
  Info,
  Maximize2,
  Trash2,
  Bookmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Highly optimized realistic interactive medical SVG synthesis library for offline/failover execution
const getOfflineSvg = (promptStr: string, renderStyle: string, colorTemp: string): string => {
  const norm = promptStr.toLowerCase();
  let svgContent = '';
  
  // Custom Color Theme Definition
  let primaryColor = '#3b82f6'; // Clinical blue default
  let secondaryColor = '#60a5fa';
  let glowColor = 'rgba(59, 130, 246, 0.4)';
  let darkBg = '#090d16';

  if (colorTemp === 'bioluminescent') {
    primaryColor = '#10b981'; // Emerald glow
    secondaryColor = '#34d399';
    glowColor = 'rgba(16, 185, 129, 0.4)';
  } else if (colorTemp === 'infrared') {
    primaryColor = '#f43f5e'; // Rose heat
    secondaryColor = '#fb7185';
    glowColor = 'rgba(244, 63, 94, 0.4)';
  } else if (colorTemp === 'cool') {
    primaryColor = '#06b6d4'; // Cyan neon
    secondaryColor = '#22d3ee';
    glowColor = 'rgba(6, 182, 212, 0.4)';
  } else if (colorTemp === 'monochrome') {
    primaryColor = '#e2e8f0'; // Clean slate white
    secondaryColor = '#cbd5e1';
    glowColor = 'rgba(226, 232, 240, 0.2)';
  }

  const isBrain = norm.includes('brain') || norm.includes('neuro') || norm.includes('cogni') || norm.includes('head');
  const isHeart = norm.includes('heart') || norm.includes('cardio') || norm.includes('pulse') || norm.includes('ekg') || norm.includes('ecg');
  const isDna = norm.includes('dna') || norm.includes('gene') || norm.includes('helix') || norm.includes('chromosome');
  const isLung = norm.includes('lung') || norm.includes('breathe') || norm.includes('respirat') || norm.includes('chest');

  if (isHeart) {
    svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%" style="background:${darkBg}; font-family:sans-serif;">
  <defs>
    <radialGradient id="heartGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="${darkBg}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="200" cy="180" r="140" fill="url(#heartGlow)"/>
  <g stroke="#1e293b" stroke-width="0.5" opacity="0.4">
    <path d="M 0,50 L 400,50 M 0,100 L 400,100 M 0,150 L 400,150 M 0,200 L 400,200 M 0,250 L 400,250 M 0,300 L 400,300 M 0,350 L 400,350"/>
    <path d="M 50,0 L 50,400 M 100,0 L 100,400 M 150,0 L 150,400 M 200,0 L 200,400 M 250,0 L 250,400 M 300,0 L 300,400 M 350,0 L 350,400"/>
  </g>
  <path d="M 50,220 L 120,220 L 130,190 L 140,250 L 150,220 L 170,220 L 180,100 L 195,310 L 210,210 L 220,230 L 230,220 L 350,220" fill="none" stroke="${primaryColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M 200,260 C 160,200 120,170 120,130 C 120,95 150,75 180,85 C 200,92 200,100 200,100 C 200,100 200,92 220,85 C 250,75 280,95 280,130 C 280,170 240,200 200,260 Z" fill="none" stroke="${secondaryColor}" stroke-width="3.5" stroke-linejoin="round" stroke-dasharray="${renderStyle === 'xray' ? '4,4' : 'none'}"/>
  <text x="200" y="340" fill="#94a3b8" font-size="12" font-weight="bold" text-anchor="middle" letter-spacing="2">SYNAPSE 3D: CARDIO SECTION</text>
  <text x="200" y="360" fill="#475569" font-size="9" text-anchor="middle">Style: ${renderStyle.toUpperCase()} • Color Temp: ${colorTemp.toUpperCase()}</text>
</svg>`;
  } else if (isBrain) {
    svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%" style="background:${darkBg}; font-family:sans-serif;">
  <defs>
    <radialGradient id="brainGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="${darkBg}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="200" cy="180" r="140" fill="url(#brainGlow)"/>
  <g stroke="${primaryColor}" stroke-width="1.2" opacity="0.65" fill="none">
    <path d="M 120,150 L 160,110 L 220,100 L 280,130 L 290,180 L 250,230 L 190,240 L 130,220 Z" stroke-dasharray="${renderStyle === 'xray' ? '5,5' : 'none'}"/>
    <path d="M 160,110 L 190,160 L 250,150 L 280,130"/>
    <path d="M 120,150 L 170,180 L 190,240"/>
    <path d="M 170,180 L 250,150 L 250,230"/>
    <path d="M 190,160 L 190,240"/>
  </g>
  <g fill="${secondaryColor}">
    <circle cx="120" cy="150" r="5"/>
    <circle cx="160" cy="110" r="6"/>
    <circle cx="220" cy="100" r="5"/>
    <circle cx="280" cy="130" r="7"/>
    <circle cx="290" cy="180" r="5"/>
    <circle cx="250" cy="230" r="6"/>
    <circle cx="190" cy="240" r="8"/>
    <circle cx="130" cy="220" r="5"/>
  </g>
  <text x="200" y="340" fill="#94a3b8" font-size="12" font-weight="bold" text-anchor="middle" letter-spacing="2">SYNAPSE 3D: NEURAL NETWORK</text>
  <text x="200" y="360" fill="#475569" font-size="9" text-anchor="middle">Style: ${renderStyle.toUpperCase()} • Color Temp: ${colorTemp.toUpperCase()}</text>
</svg>`;
  } else if (isDna) {
    svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%" style="background:${darkBg}; font-family:sans-serif;">
  <defs>
    <radialGradient id="dnaGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="${darkBg}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="200" cy="180" r="140" fill="url(#dnaGlow)"/>
  <g stroke="${secondaryColor}" stroke-width="1.8" opacity="0.8">
    <line x1="120" y1="80" x2="280" y2="80" stroke-width="1" stroke-dasharray="2,2"/>
    <line x1="130" y1="110" x2="270" y2="110" stroke-width="1"/>
    <line x1="150" y1="140" x2="250" y2="140" stroke-width="1"/>
    <line x1="180" y1="170" x2="220" y2="170" stroke-width="1"/>
    <line x1="180" y1="200" x2="220" y2="200" stroke-width="1"/>
    <line x1="150" y1="230" x2="250" y2="230" stroke-width="1"/>
    <line x1="130" y1="260" x2="270" y2="260" stroke-width="1"/>
    <line x1="120" y1="290" x2="280" y2="290" stroke-width="1" stroke-dasharray="2,2"/>
    <path d="M 120,80 Q 150,140 200,185 T 280,290" fill="none" stroke="${primaryColor}" stroke-width="3.5"/>
    <path d="M 280,80 Q 250,140 200,185 T 120,290" fill="none" stroke="${secondaryColor}" stroke-width="3.5"/>
  </g>
  <g fill="${primaryColor}">
    <circle cx="120" cy="80" r="4"/><circle cx="280" cy="80" r="4"/>
    <circle cx="130" cy="110" r="4"/><circle cx="270" cy="110" r="4"/>
    <circle cx="150" cy="140" r="4"/><circle cx="250" cy="140" r="4"/>
  </g>
  <text x="200" y="340" fill="#94a3b8" font-size="12" font-weight="bold" text-anchor="middle" letter-spacing="2">SYNAPSE 3D: GENOMIC STRAND</text>
  <text x="200" y="360" fill="#475569" font-size="9" text-anchor="middle">Style: ${renderStyle.toUpperCase()} • Color Temp: ${colorTemp.toUpperCase()}</text>
</svg>`;
  } else {
    // Elegant Anatomical Grid Sphere default
    svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%" style="background:${darkBg}; font-family:sans-serif;">
  <defs>
    <radialGradient id="sphereGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${darkBg}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="200" cy="180" r="140" fill="url(#sphereGlow)"/>
  <circle cx="200" cy="180" r="100" fill="none" stroke="${primaryColor}" stroke-width="2" stroke-dasharray="${renderStyle === 'xray' ? '4,4' : 'none'}" opacity="0.8"/>
  <ellipse cx="200" cy="180" rx="100" ry="40" fill="none" stroke="${secondaryColor}" stroke-width="1.5" opacity="0.6"/>
  <ellipse cx="200" cy="180" rx="40" ry="100" fill="none" stroke="${secondaryColor}" stroke-width="1.5" opacity="0.6"/>
  <line x1="200" y1="40" x2="200" y2="320" stroke="${primaryColor}" stroke-width="1" opacity="0.4"/>
  <line x1="60" y1="180" x2="340" y2="180" stroke="${primaryColor}" stroke-width="1" opacity="0.4"/>
  <text x="200" y="340" fill="#94a3b8" font-size="12" font-weight="bold" text-anchor="middle" letter-spacing="2">SYNAPSE 3D: SPHERICAL MODEL</text>
  <text x="200" y="360" fill="#475569" font-size="9" text-anchor="middle">Style: ${renderStyle.toUpperCase()} • Color Temp: ${colorTemp.toUpperCase()}</text>
</svg>`;
  }
  
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svgContent.trim());
};

// Preset prompts library to populate interface immediately with rich medical ideas
const PROMPT_TEMPLATES = [
  { label: '🧠 Brain MRI Axial', prompt: 'Axial plane MRI slice of human brain, highly detailed medical neuroimaging, glowing active synaptic nodes, 3d render' },
  { label: '🫁 Volumetric Lungs', prompt: '3D volumetric model of human lungs and bronchioles, clinical respiratory imaging, deep blue background, holographic style' },
  { label: '❤️ Cardiac Heart model', prompt: 'Cross-section anatomical view of human heart, ventricles and aorta visible, subsurface scattering light, 4k digital illustration' },
  { label: '🧬 DNA Double Helix', prompt: 'Double helix DNA strand rendering with glowing bioluminescent codons and CRISPR genetic splice points, clinical biotech aesthetics' },
  { label: '👁️ Retinal Cell Structure', prompt: 'Microscopic view of human eye retina showing photoreceptor rods and cones, neon fluorescent micrography' }
];

const AI_MODEL_ENGINES = [
  { id: 'flux', name: 'Flux-1 Dev (HuggingFace)', desc: 'High-Fidelity open-source clinical illustrator' },
  { id: 'synapse_3d', name: 'Synapse 3D Volumetric', desc: 'Optimized anatomical rendering algorithm' },
  { id: 'stable_diffusion', name: 'Stable Diffusion XL', desc: 'Highly creative biological textures' }
];

const RENDER_STYLES = [
  { id: 'volumetric', name: '🩺 3D Volumetric Scan', promptSuffix: 'highly detailed 3d medical volumetric scan, clinical render' },
  { id: 'micrograph', name: '🔬 Fluorescent Micrograph', promptSuffix: 'high-contrast biological fluorescent micrograph, laboratory imaging' },
  { id: 'xray', name: '🦴 Volumetric X-Ray Hologram', promptSuffix: 'futuristic holographic xray 3d scan, glowing clinical grid lines' },
  { id: 'vector', name: '📈 Clean Vector Chart', promptSuffix: 'flat vector medical textbook chart style, clean labels, solid background' }
];

const ASPECT_RATIOS = [
  { id: '1:1', name: '1:1 Square' },
  { id: '16:9', name: '16:9 Cinema' },
  { id: '4:3', name: '4:3 Lab-Scan' },
  { id: '9:16', name: '9:16 Mobile View' }
];

const COLOR_TEMPS = [
  { id: 'cool_clinical', name: 'Clinical Blue', desc: 'Standard neon sterile blue' },
  { id: 'bioluminescent', name: 'Bioluminescent', desc: 'Bacterial green/turquoise' },
  { id: 'infrared', name: 'Infrared Thermal', desc: 'Hot warm vascular tone' },
  { id: 'monochrome', name: 'Slate Monochrome', desc: 'Scientific silver monochrome' }
];

export const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Custom Controls State
  const [selectedEngine, setSelectedEngine] = useState('flux');
  const [selectedStyle, setSelectedStyle] = useState('volumetric');
  const [selectedRatio, setSelectedRatio] = useState('1:1');
  const [selectedColor, setSelectedColor] = useState('cool_clinical');
  const [cfgScale, setCfgScale] = useState(7.5);
  const [steps, setSteps] = useState(30);
  const [customSeed, setCustomSeed] = useState(() => Math.floor(Math.random() * 9999999).toString());
  const [history, setHistory] = useState<Array<{prompt: string, url: string, timestamp: string, style: string, color: string}>>([]);
  const [isOffline, setIsOffline] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("medical_forced_offline") === "true" || !navigator.onLine;
    }
    return false;
  });

  useEffect(() => {
    const handleOnline = () => {
      const forced = localStorage.getItem("medical_forced_offline") === "true";
      setIsOffline(forced || false);
    };
    const handleOffline = () => setIsOffline(true);
    
    const timer = setInterval(() => {
      const forced = localStorage.getItem("medical_forced_offline") === "true";
      const isSystemOff = !navigator.onLine;
      setIsOffline(forced || isSystemOff);
    }, 1500);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      clearInterval(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Retrieve generation history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('synapse_image_generator_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const addToHistory = (pText: string, imgUrl: string) => {
    const newHistory = [
      {
        prompt: pText,
        url: imgUrl,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        style: selectedStyle,
        color: selectedColor
      },
      ...history.slice(0, 5) // Cap history at 6 items
    ];
    setHistory(newHistory);
    try {
      localStorage.setItem('synapse_image_generator_history', JSON.stringify(newHistory));
    } catch (e) {
      console.error(e);
    }
  };

  const generateImage = async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setImageUrl(null);

    // Dynamic offline fallback support with high-fidelity vector synthesis
    if (isOffline) {
      setTimeout(() => {
        try {
          const svgDataUrl = getOfflineSvg(prompt, selectedStyle, selectedColor);
          setImageUrl(svgDataUrl);
          addToHistory(prompt, svgDataUrl);
        } catch (err: any) {
          setError("Failed to synthesize offline medical vector graphic.");
        } finally {
          setIsLoading(false);
        }
      }, 1800);
      return;
    }

    try {
      // Assemble full medical prompt
      const styleObj = RENDER_STYLES.find(s => s.id === selectedStyle);
      const colorText = COLOR_TEMPS.find(c => c.id === selectedColor)?.desc || 'Clinical theme';
      const promptSuffix = styleObj ? `, ${styleObj.promptSuffix}` : '';
      const finalPrompt = `${prompt}. ${promptSuffix}, Color tone: ${colorText}, Seed: ${customSeed}, CFG: ${cfgScale}. Premium scientific visualization, high resolution.`;

      const response = await api.ai.generateImage(finalPrompt, selectedRatio);

      if (response.imageData) {
        setImageUrl(response.imageData);
        addToHistory(prompt, response.imageData);
      } else {
        setError("The AI did not provide an image. It might have returned a text description instead.");
      }
    } catch (err: any) {
      console.error("Image Generation Error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const triggerSeedRegen = () => {
    setCustomSeed(Math.floor(Math.random() * 9999999).toString());
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('synapse_image_generator_history');
  };

  return (
    <section 
      className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 h-full flex flex-col max-w-7xl mx-auto w-full"
      aria-labelledby="anatomical-illustrator-title"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-indigo-500 to-cyan-500 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-500/20" aria-hidden="true">
            <Cpu size={22} className="animate-pulse" />
          </div>
          <div>
            <h3 id="anatomical-illustrator-title" className="font-black text-slate-900 dark:text-white text-base leading-none">Synapse-3D Design Studio</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-black mt-1">HuggingFace Flux-1 & Synapse AI Core</p>
          </div>
        </div>

        {/* Offline Status Badge */}
        {isOffline && (
          <span className="self-start sm:self-center px-3 py-1 rounded-full text-[9px] font-mono font-black bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            SYNAPSE OFFLINE VECTOR SYNTHESIS
          </span>
        )}
      </div>

      {/* Main Grid: Sidebar Controls on Left, Dynamic Render Area on Right */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        
        {/* Left Column (Span 5): Control Panel Sidebar */}
        <div className="lg:col-span-5 space-y-5 flex flex-col h-full overflow-y-auto pr-1.5 custom-scrollbar">
          
          {/* Quick-Prompt Pill Templates */}
          <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-3xl border border-slate-100 dark:border-slate-800/60">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-3">ANATOMICAL TEMPLATE PIPELINE</span>
            <div className="flex flex-wrap gap-2">
              {PROMPT_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={`tmpl-${idx}`}
                  type="button"
                  onClick={() => setPrompt(tmpl.prompt)}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 text-[10px] font-bold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl transition-all cursor-pointer whitespace-nowrap"
                >
                  {tmpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt input box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="anatomical-prompt" className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">GENERATIVE INFERENCE PROMPT</label>
              <span className="text-[9px] text-slate-400 font-mono font-bold">{prompt.length} / 400 Chars</span>
            </div>
            <div className="relative">
              <textarea
                id="anatomical-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value.slice(0, 400))}
                placeholder="e.g., 'Anatomical cross-section of human optic nerve showing neurological bundles, isometric angle, cool clinical blue tones'..."
                className="w-full bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 pr-12 text-xs text-slate-900 dark:text-white min-h-[90px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none font-medium leading-relaxed"
              />
              {prompt.trim() && (
                <button 
                  onClick={() => setPrompt('')} 
                  className="absolute top-3 right-3 text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  title="Clear Prompt"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>

          {/* AI Model Selection */}
          <div className="space-y-2">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">AI GENERATIVE ENGINE</span>
            <div className="grid grid-cols-1 gap-2">
              {AI_MODEL_ENGINES.map((eng) => (
                <button
                  key={eng.id}
                  type="button"
                  onClick={() => setSelectedEngine(eng.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    selectedEngine === eng.id
                      ? 'border-indigo-500 bg-indigo-500/10 text-slate-900 dark:text-white font-extrabold'
                      : 'border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold flex items-center gap-1.5">
                      {eng.name}
                      {selectedEngine === eng.id && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />}
                    </p>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">{eng.desc}</p>
                  </div>
                  {selectedEngine === eng.id && <Check size={14} className="text-indigo-500 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Render Styles */}
          <div className="space-y-2">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">RENDER STYLE PRESET</span>
            <div className="grid grid-cols-2 gap-2">
              {RENDER_STYLES.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSelectedStyle(st.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedStyle === st.id
                      ? 'border-indigo-500 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 font-extrabold'
                      : 'border-slate-150 dark:border-slate-850 bg-white dark:bg-slate-900/40 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="text-[11px] font-bold block">{st.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio Selector */}
          <div className="space-y-2">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">ASPECT ASPECT RATIO</span>
            <div className="grid grid-cols-4 gap-2">
              {ASPECT_RATIOS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRatio(r.id)}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    selectedRatio === r.id
                      ? 'border-indigo-500 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 font-extrabold'
                      : 'border-slate-150 dark:border-slate-850 bg-white dark:bg-slate-900/40 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="text-[10px] font-mono font-bold block">{r.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Scientific Color Temperatures */}
          <div className="space-y-2">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">SCIENTIFIC SPECTRAL TONING</span>
            <div className="grid grid-cols-2 gap-2">
              {COLOR_TEMPS.map((temp) => (
                <button
                  key={temp.id}
                  type="button"
                  onClick={() => setSelectedColor(temp.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedColor === temp.id
                      ? 'border-indigo-500 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 font-extrabold'
                      : 'border-slate-150 dark:border-slate-850 bg-white dark:bg-slate-900/40 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <p className="text-[11px] font-bold leading-none">{temp.name}</p>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 leading-none font-medium">{temp.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Sliders Sidebar Option */}
          <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-3xl border border-slate-100 dark:border-slate-800/60 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200/50 dark:border-slate-800/50 pb-2 mb-2">
              <Sliders size={13} className="text-indigo-500" />
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">ADVANCED SAMPLING TELEMETRY</span>
            </div>

            {/* CFG slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>CFG Scale (Prompt Strength):</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{cfgScale}</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="15" 
                step="0.5"
                value={cfgScale} 
                onChange={(e) => setCfgScale(parseFloat(e.target.value))} 
                className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Steps slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>Inference Steps:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{steps}</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="60" 
                step="5"
                value={steps} 
                onChange={(e) => setSteps(parseInt(e.target.value))} 
                className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Seed input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-500 block">Custom Model Seed:</label>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={customSeed}
                  onChange={(e) => setCustomSeed(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white font-mono"
                />
                <button 
                  onClick={triggerSeedRegen}
                  className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-500 rounded-xl hover:border-indigo-500/40 transition-all cursor-pointer"
                  title="Regenerate Seed"
                >
                  <RefreshCw size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* Action trigger button */}
          <button
            onClick={generateImage}
            disabled={!prompt.trim() || isLoading}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 disabled:from-slate-200 disabled:to-slate-200 dark:disabled:from-slate-800 dark:disabled:to-slate-800 text-white disabled:text-slate-400 dark:disabled:text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer border border-white/10"
          >
            {isLoading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
            {isLoading ? 'Synthesizing Visuals...' : 'Synthesize Anatomical Model'}
          </button>
        </div>

        {/* Right Column (Span 7): Real-Time Canvas Screen & Render Telemetry Logs */}
        <div className="lg:col-span-7 flex flex-col gap-5 h-full overflow-y-auto pl-0.5">
          
          {/* Main Visualizer Window */}
          <div 
            className="flex-1 min-h-[350px] bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-150 dark:border-slate-850 flex items-center justify-center relative overflow-hidden group shadow-inner"
            role="status"
            aria-live="polite"
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-4 text-center p-6"
                >
                  {/* Glowing Pulse Ring animation */}
                  <div className="relative flex items-center justify-center w-20 h-20 mb-2">
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping [animation-duration:2s]" />
                    <div className="absolute inset-2 rounded-full border-4 border-indigo-500/30 animate-pulse [animation-duration:1.2s]" />
                    <div className="relative w-12 h-12 rounded-full border-4 border-indigo-100 dark:border-indigo-950 border-t-indigo-600 dark:border-t-indigo-400 animate-spin" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-slate-800 dark:text-slate-200">Rendering Synapse Volumetric Layers</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">CFG: {cfgScale} • Steps: {steps}/60 • Custom Seed: {customSeed}</p>
                  </div>
                </motion.div>
              ) : imageUrl ? (
                <motion.div
                  key="image"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full h-full p-3 flex items-center justify-center relative"
                >
                  <img
                    src={imageUrl}
                    alt={`AI generated anatomical illustration: ${prompt}`}
                    className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Floating Specs HUD on Image hover */}
                  <div className="absolute bottom-5 left-5 right-5 bg-slate-950/90 backdrop-blur-xl border border-slate-800/80 p-3.5 rounded-2xl text-[10px] font-mono text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between gap-4 shadow-2xl">
                    <div className="space-y-0.5 truncate">
                      <p className="font-bold text-white truncate">{prompt}</p>
                      <p className="text-slate-400 text-[9px]">Seed: {customSeed} • CFG: {cfgScale} • Format: {selectedRatio} • Style: {selectedStyle}</p>
                    </div>
                    
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = imageUrl;
                        link.download = `synapse-3d-${customSeed}.png`;
                        link.click();
                      }}
                      className="bg-white hover:bg-indigo-500 hover:text-white text-slate-900 p-2.5 rounded-xl transition-all shadow-md shrink-0 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider cursor-pointer"
                      title="Download Rendered Model"
                    >
                      <Download size={13} />
                      Download
                    </button>
                  </div>
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center p-8 max-w-sm"
                  role="alert"
                >
                  <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 flex items-center justify-center mx-auto mb-3">
                    <Info size={18} className="text-rose-500" />
                  </div>
                  <p className="text-xs text-rose-500 dark:text-rose-400 font-bold mb-1">Visualization Pipeline Blocked</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed font-medium">{error}</p>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center p-8 max-w-sm space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center mx-auto shadow-md">
                    <ImageIcon className="text-indigo-500 dark:text-indigo-400" size={24} aria-hidden="true" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black text-slate-800 dark:text-slate-200">Awaiting Creative Clinical Input</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed font-medium">Select a quick-template above or enter a detailed prompt to synthesize high-voltage interactive clinical visuals.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Interactive Design History Log */}
          <div className="bg-slate-50 dark:bg-slate-950/40 p-5 rounded-3xl border border-slate-150 dark:border-slate-800/60 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 pb-2.5">
              <div className="flex items-center gap-2">
                <Bookmark size={14} className="text-indigo-500" />
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">RECENT CLINICAL ILLUSTRATIONS ({history.length})</span>
              </div>
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={clearHistory}
                  className="text-[9px] font-black text-rose-500 dark:text-rose-400 hover:underline uppercase tracking-wider cursor-pointer"
                >
                  Clear History
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center py-4 font-medium">No past designs saved in this session.</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {history.map((hist, idx) => (
                  <button
                    key={`hist-${idx}`}
                    type="button"
                    onClick={() => {
                      setPrompt(hist.prompt);
                      setImageUrl(hist.url);
                    }}
                    className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:ring-2 hover:ring-indigo-500/20 transition-all group bg-slate-100 dark:bg-slate-900 cursor-pointer"
                  >
                    <img 
                      src={hist.url} 
                      alt={hist.prompt} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[8px] font-bold text-white uppercase tracking-wider">Load</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};
