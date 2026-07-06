import { useState, useEffect } from 'react';
import { api } from '../api';
import { Image as ImageIcon, Loader2, Download, Sparkles, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const getOfflineSvg = (promptStr: string): string => {
  const norm = promptStr.toLowerCase();
  let svgContent = '';
  
  if (norm.includes('heart') || norm.includes('cardio') || norm.includes('pulse') || norm.includes('blood') || norm.includes('cardiac') || norm.includes('ekg') || norm.includes('ecg')) {
    svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%" style="background:#0f172a; font-family:sans-serif;">
  <defs>
    <radialGradient id="heartGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ef4444" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="200" cy="180" r="140" fill="url(#heartGlow)"/>
  <g stroke="#334155" stroke-width="0.5" opacity="0.3">
    <path d="M 0,50 L 400,50 M 0,100 L 400,100 M 0,150 L 400,150 M 0,200 L 400,200 M 0,250 L 400,250 M 0,300 L 400,300 M 0,350 L 400,350"/>
    <path d="M 50,0 L 50,400 M 100,0 L 100,400 M 150,0 L 150,400 M 200,0 L 200,400 M 250,0 L 250,400 M 300,0 L 300,400 M 350,0 L 350,400"/>
  </g>
  <path d="M 50,220 L 120,220 L 130,200 L 140,240 L 150,220 L 170,220 L 180,120 L 195,290 L 210,210 L 220,230 L 230,220 L 350,220" fill="none" stroke="#ef4444" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M 200,260 C 160,200 120,170 120,130 C 120,95 150,75 180,85 C 200,92 200,100 200,100 C 200,100 200,92 220,85 C 250,75 280,95 280,130 C 280,170 240,200 200,260 Z" fill="none" stroke="#f87171" stroke-width="4" stroke-linejoin="round"/>
  <text x="200" y="340" fill="#94a3b8" font-size="14" font-weight="bold" text-anchor="middle" letter-spacing="2">OFFLINE MEDICAL ART: CARDIO CORE</text>
  <text x="200" y="360" fill="#64748b" font-size="10" text-anchor="middle">Dynamic SVG Synthesis • Prompt: "${promptStr.replace(/"/g, '&quot;')}"</text>
</svg>`;
  } else if (norm.includes('brain') || norm.includes('neuro') || norm.includes('cogni') || norm.includes('mind') || norm.includes('head') || norm.includes('intellect') || norm.includes('spine') || norm.includes('nerv')) {
    svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%" style="background:#0f172a; font-family:sans-serif;">
  <defs>
    <radialGradient id="brainGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="200" cy="180" r="140" fill="url(#brainGlow)"/>
  <g stroke="#38bdf8" stroke-width="1" opacity="0.6" fill="none">
    <path d="M 120,150 L 160,110 L 220,100 L 280,130 L 290,180 L 250,230 L 190,240 L 130,220 Z"/>
    <path d="M 160,110 L 190,160 L 250,150 L 280,130"/>
    <path d="M 120,150 L 170,180 L 190,240"/>
    <path d="M 170,180 L 250,150 L 250,230"/>
    <path d="M 190,160 L 190,240"/>
  </g>
  <g fill="#38bdf8">
    <circle cx="120" cy="150" r="5"/>
    <circle cx="160" cy="110" r="6"/>
    <circle cx="220" cy="100" r="5"/>
    <circle cx="280" cy="130" r="7"/>
    <circle cx="290" cy="180" r="5"/>
    <circle cx="250" cy="230" r="6"/>
    <circle cx="190" cy="240" r="8"/>
    <circle cx="130" cy="220" r="5"/>
    <circle cx="190" cy="160" r="5"/>
    <circle cx="250" cy="150" r="5"/>
    <circle cx="170" cy="180" r="6"/>
  </g>
  <text x="200" y="340" fill="#94a3b8" font-size="14" font-weight="bold" text-anchor="middle" letter-spacing="2">OFFLINE MEDICAL ART: NEURAL CORE</text>
  <text x="200" y="360" fill="#64748b" font-size="10" text-anchor="middle">Dynamic SVG Synthesis • Prompt: "${promptStr.replace(/"/g, '&quot;')}"</text>
</svg>`;
  } else if (norm.includes('dna') || norm.includes('gene') || norm.includes('genome') || norm.includes('helix') || norm.includes('cell') || norm.includes('biotech') || norm.includes('micro')) {
    svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%" style="background:#0f172a; font-family:sans-serif;">
  <defs>
    <radialGradient id="dnaGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="200" cy="180" r="140" fill="url(#dnaGlow)"/>
  <g stroke="#34d399" stroke-width="2" opacity="0.8">
    <line x1="120" y1="80" x2="280" y2="80" stroke-width="1"/>
    <line x1="130" y1="110" x2="270" y2="110" stroke-width="1"/>
    <line x1="150" y1="140" x2="250" y2="140" stroke-width="1"/>
    <line x1="180" y1="170" x2="220" y2="170" stroke-width="1"/>
    <line x1="180" y1="200" x2="220" y2="200" stroke-width="1"/>
    <line x1="150" y1="230" x2="250" y2="230" stroke-width="1"/>
    <line x1="130" y1="260" x2="270" y2="260" stroke-width="1"/>
    <line x1="120" y1="290" x2="280" y2="290" stroke-width="1"/>
    <path d="M 120,80 Q 150,140 200,185 T 280,290" fill="none" stroke="#059669" stroke-width="4"/>
    <path d="M 280,80 Q 250,140 200,185 T 120,290" fill="none" stroke="#10b981" stroke-width="4"/>
  </g>
  <g fill="#34d399">
    <circle cx="120" cy="80" r="5"/><circle cx="280" cy="80" r="5"/>
    <circle cx="130" cy="110" r="5"/><circle cx="270" cy="110" r="5"/>
    <circle cx="150" cy="140" r="5"/><circle cx="250" cy="140" r="5"/>
    <circle cx="180" cy="170" r="5"/><circle cx="220" cy="170" r="5"/>
    <circle cx="180" cy="200" r="5"/><circle cx="220" cy="200" r="5"/>
    <circle cx="150" cy="230" r="5"/><circle cx="250" cy="230" r="5"/>
    <circle cx="130" cy="260" r="5"/><circle cx="270" cy="260" r="5"/>
    <circle cx="120" cy="290" r="5"/><circle cx="280" cy="290" r="5"/>
  </g>
  <text x="200" y="340" fill="#94a3b8" font-size="14" font-weight="bold" text-anchor="middle" letter-spacing="2">OFFLINE MEDICAL ART: GENOMIC HELIX</text>
  <text x="200" y="360" fill="#64748b" font-size="10" text-anchor="middle">Dynamic SVG Synthesis • Prompt: "${promptStr.replace(/"/g, '&quot;')}"</text>
</svg>`;
  } else if (norm.includes('lung') || norm.includes('pulmonary') || norm.includes('breathe') || norm.includes('respirat') || norm.includes('air') || norm.includes('bronchial')) {
    svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%" style="background:#0f172a; font-family:sans-serif;">
  <defs>
    <radialGradient id="lungGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="200" cy="180" r="140" fill="url(#lungGlow)"/>
  <g stroke="#22d3ee" stroke-linecap="round" fill="none">
    <path d="M 200,60 L 200,120" stroke-width="8"/>
    <path d="M 200,120 Q 180,140 140,160" stroke-width="5"/>
    <path d="M 200,120 Q 220,140 260,160" stroke-width="5"/>
    <path d="M 140,160 Q 110,180 90,220" stroke-width="3"/>
    <path d="M 140,160 Q 140,190 130,230" stroke-width="3"/>
    <path d="M 140,160 Q 160,180 170,220" stroke-width="3"/>
    <path d="M 260,160 Q 290,180 310,220" stroke-width="3"/>
    <path d="M 260,160 Q 260,190 270,230" stroke-width="3"/>
    <path d="M 260,160 Q 240,180 230,220" stroke-width="3"/>
  </g>
  <path d="M 200,120 C 170,80 110,90 90,130 C 70,170 70,240 110,270 C 130,285 160,280 185,250 C 195,240 200,220 200,220 C 200,220 205,240 215,250 C 240,280 270,285 290,270 C 330,240 330,170 310,130 C 290,90 230,80 200,120 Z" fill="none" stroke="#22d3ee" stroke-width="3" opacity="0.5"/>
  <text x="200" y="340" fill="#94a3b8" font-size="14" font-weight="bold" text-anchor="middle" letter-spacing="2">OFFLINE MEDICAL ART: LUNG VENTILATION</text>
  <text x="200" y="360" fill="#64748b" font-size="10" text-anchor="middle">Dynamic SVG Synthesis • Prompt: "${promptStr.replace(/"/g, '&quot;')}"</text>
</svg>`;
  } else if (norm.includes('eye') || norm.includes('vision') || norm.includes('ocul') || norm.includes('sight') || norm.includes('pupil') || norm.includes('iris')) {
    svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%" style="background:#0f172a; font-family:sans-serif;">
  <defs>
    <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#a855f7" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="irisGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#22d3ee"/>
      <stop offset="70%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </radialGradient>
  </defs>
  <circle cx="200" cy="180" r="140" fill="url(#eyeGlow)"/>
  <path d="M 80,180 C 130,110 270,110 320,180 C 270,250 130,250 80,180 Z" fill="none" stroke="#c084fc" stroke-width="3"/>
  <circle cx="200" cy="180" r="50" fill="url(#irisGrad)" stroke="#c084fc" stroke-width="1.5"/>
  <circle cx="200" cy="180" r="22" fill="#0f172a" stroke="#ffffff" stroke-width="0.5"/>
  <circle cx="188" cy="168" r="6" fill="#ffffff" opacity="0.8"/>
  <circle cx="180" cy="176" r="3" fill="#ffffff" opacity="0.5"/>
  <text x="200" y="340" fill="#94a3b8" font-size="14" font-weight="bold" text-anchor="middle" letter-spacing="2">OFFLINE MEDICAL ART: OCULAR CORE</text>
  <text x="200" y="360" fill="#64748b" font-size="10" text-anchor="middle">Dynamic SVG Synthesis • Prompt: "${promptStr.replace(/"/g, '&quot;')}"</text>
</svg>`;
  } else {
    svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%" style="background:#0f172a; font-family:sans-serif;">
  <defs>
    <radialGradient id="defaultGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#6366f1" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="200" cy="180" r="140" fill="url(#defaultGlow)"/>
  <path d="M 170,100 H 230 V 150 H 280 V 210 H 230 V 260 H 170 V 210 H 120 V 150 H 170 Z" fill="none" stroke="#818cf8" stroke-width="3" stroke-linejoin="round" opacity="0.6"/>
  <path d="M 100,180 Q 150,130 200,180 T 300,180" fill="none" stroke="#6366f1" stroke-width="3" stroke-linecap="round"/>
  <circle cx="200" cy="180" r="100" fill="none" stroke="#4f46e5" stroke-width="1" stroke-dasharray="6,6"/>
  <circle cx="130" cy="110" r="5" fill="#818cf8"/>
  <circle cx="270" cy="250" r="5" fill="#818cf8"/>
  <text x="200" y="340" fill="#94a3b8" font-size="14" font-weight="bold" text-anchor="middle" letter-spacing="2">OFFLINE MEDICAL ART: SYNTHETIC CORE</text>
  <text x="200" y="360" fill="#64748b" font-size="10" text-anchor="middle">Dynamic SVG Synthesis • Prompt: "${promptStr.replace(/"/g, '&quot;')}"</text>
</svg>`;
  }
  
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svgContent.trim());
};

export const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    
    // Periodically check local forced offline state
    const timer = setInterval(() => {
      const forced = localStorage.getItem("medical_forced_offline") === "true";
      const isSystemOff = !navigator.onLine;
      setIsOffline(forced || isSystemOff);
    }, 1000);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      clearInterval(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const generateImage = async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setImageUrl(null);

    // Dynamic offline support
    if (isOffline) {
      setTimeout(() => {
        try {
          const svgDataUrl = getOfflineSvg(prompt);
          setImageUrl(svgDataUrl);
        } catch (err: any) {
          setError("Failed to synthesize offline medical vector graphic.");
        } finally {
          setIsLoading(false);
        }
      }, 1500);
      return;
    }

    try {
      const generateWithRetry = async (retryCount = 0): Promise<any> => {
        try {
          const response = await api.ai.generateImage(prompt);
          return response;
        } catch (err: any) {
          const errorMsg = err?.message || String(err);
          const isQuotaError = errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('quota');
          const isTransientError = errorMsg.includes('500') || errorMsg.includes('503') || errorMsg.includes('fetch') || errorMsg.includes('NetworkError');

          if (isQuotaError) {
            throw new Error("API Quota Exceeded. Please try again later.");
          }

          if (isTransientError && retryCount < 2) {
            const delay = Math.pow(2, retryCount) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
            return generateWithRetry(retryCount + 1);
          }

          throw err;
        }
      };

      const response = await generateWithRetry();

      if (response.imageData) {
        setImageUrl(response.imageData);
      } else {
        setError("The AI did not provide an image. It might have returned a text description instead.");
      }
    } catch (err) {
      console.error("Image Generation Error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section 
      className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 h-full flex flex-col"
      aria-labelledby="anatomical-illustrator-title"
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg text-indigo-600 dark:text-indigo-400" aria-hidden="true">
          <ImageIcon size={20} />
        </div>
        <div>
          <h3 id="anatomical-illustrator-title" className="font-bold text-slate-900 dark:text-white text-sm">Anatomical Illustrator</h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-500 uppercase tracking-wider font-semibold">AI-Powered Visuals</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <div className="relative group">
          <label htmlFor="anatomical-prompt" className="sr-only">Illustration prompt</label>
          <textarea
            id="anatomical-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'Cross-section of the human heart showing ventricles'..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-sm text-slate-900 dark:text-white min-h-[100px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
          />
          <button
            onClick={generateImage}
            disabled={!prompt.trim() || isLoading}
            aria-label={isLoading ? "Generating illustration" : "Generate illustration"}
            className="absolute bottom-3 right-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-2"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <Sparkles size={14} aria-hidden="true" />}
            {isLoading ? 'Generating...' : 'Generate'}
          </button>
        </div>

        <div 
          className="flex-1 min-h-[250px] bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center relative overflow-hidden group"
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
                className="flex flex-col items-center gap-3"
              >
                <div className="w-12 h-12 border-4 border-indigo-100 dark:border-indigo-900/30 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin" aria-hidden="true"></div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Creating illustration...</p>
              </motion.div>
            ) : imageUrl ? (
              <motion.div
                key="image"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-full p-2"
              >
                <img
                  src={imageUrl}
                  alt={`AI generated anatomical illustration: ${prompt}`}
                  className="w-full h-full object-contain rounded-xl"
                  referrerPolicy="no-referrer"
                />
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = imageUrl;
                    link.download = 'doctorian-illustration.png';
                    link.click();
                  }}
                  aria-label="Download generated illustration"
                  className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Download size={16} aria-hidden="true" />
                </button>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center p-6"
                role="alert"
              >
                <p className="text-xs text-rose-500 dark:text-rose-400 font-medium">{error}</p>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center p-6"
              >
                <ImageIcon className="mx-auto text-slate-300 dark:text-slate-600 mb-2" size={32} aria-hidden="true" />
                <p className="text-xs text-slate-400 dark:text-slate-500">Your generated illustration will appear here.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
