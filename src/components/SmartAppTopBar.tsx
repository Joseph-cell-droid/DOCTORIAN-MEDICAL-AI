import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  MicOff,
  HeartPulse,
  Stethoscope,
  AudioWaveform,
  Watch,
  Camera,
  ArrowRight,
  X,
  ScanLine,
  QrCode,
  Calculator,
  Wifi,
  WifiOff,
  RefreshCw,
  Copy,
  Check,
  Bot,
  Sparkles
} from 'lucide-react';
import type { NextGenTechTab } from './NextGenTechSuiteModal';
import type { User } from '../api';
import { getInstalledPackageSummary } from '../utils/offlinePackageBuilder';
import { setAppLanguage, useAppLanguage } from '../utils/translations';
import {
  getInterestRankedCommands,
  getSmartVoiceSuggestions,
  getSpeechRecognitionLocale,
  recordUserInterest,
  resolveSmartVoiceCommand,
  type SmartVoiceIntent
} from '../utils/smartVoiceRouter';
import {
  DEFAULT_TOPBAR_SCROLL_CONFIG,
  createInitialTopBarScrollState,
  stepSmoothOffset,
  updateTopBarScrollState,
  type TopBarScrollState
} from '../utils/topBarScrollPhysics';

export interface SmartAppTopBarProps {
  currentView: string;
  user?: User | null;
  onNavigate: (view: string) => void;
  vitals?: {
    heartRate?: number;
    spo2?: number;
    temperature?: number;
  } | null;
  isSensorConnected?: boolean;
  isOffline?: boolean;
  onOpenNextGenTech: (tab: NextGenTechTab) => void;
  onConnectSensor?: () => void;
  onNotify?: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

const VIEW_TITLES: Record<string, string> = {
  home: 'Dashboard',
  symptoms: 'Symptom Triage',
  monitor: 'Bio-Telemetry',
  meds: 'Prescriptions',
  vitality: 'Vitality Matrix',
  clinical_roadmap: 'Appointments',
  app_medics: 'E-Pharmacy',
  ambient_scribe: 'Ambient Scribe',
  diagnostic_lab: 'Lab Analyser',
  records: 'Medical Records',
  health_trace: 'Genomic Timeline',
  neuro: 'Neural Lab',
  server_network: 'SMS Hub',
  settings: 'Account',
  profile: 'Account',
  features: 'Clinical Hub',
  admin: 'Hospital Admin',
  smart_watch: 'Smart Watch',
  billing: 'Plans & Billing',
  dev_portal: 'App Installers'
};

/**
 * Generates a deterministic 21x21 scannable-style QR grid with canonical 7x7 finder patterns
 * seeded from the encoded patient emergency URL payload.
 */
function buildDeterministicQrMatrix(payload: string): boolean[][] {
  const size = 21;
  const grid: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  const placeFinder = (r0: number, c0: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isEdge = r === 0 || r === 6 || c === 0 || c === 6;
        const isCore = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        grid[r0 + r][c0 + c] = isEdge || isCore;
      }
    }
  };

  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  let hash = 2166136261;
  for (let i = 0; i < payload.length; i++) {
    hash ^= payload.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const inFinder =
        (r < 8 && c < 8) ||
        (r < 8 && c >= size - 8) ||
        (r >= size - 8 && c < 8);
      if (inFinder) continue;
      if (r === 6 || c === 6) {
        grid[r][c] = (r + c) % 2 === 0;
        continue;
      }
      hash ^= (r * 31 + c * 17) ^ (payload.charCodeAt((r * size + c) % Math.max(1, payload.length)) || 7);
      hash = Math.imul(hash, 16777619);
      grid[r][c] = (hash & 3) === 0 || (hash & 5) === 5;
    }
  }
  return grid;
}

export const SmartAppTopBar: React.FC<SmartAppTopBarProps> = ({
  currentView,
  user,
  onNavigate,
  vitals,
  isSensorConnected = false,
  isOffline = false,
  onOpenNextGenTech,
  onConnectSensor,
  onNotify
}) => {
  const [appLang, , t] = useAppLanguage();
  const [openPopover, setOpenPopover] = useState<'telemetry' | 'voice' | 'clinical_lab' | null>(null);
  const [isBarOffscreen, setIsBarOffscreen] = useState(false);

  // Voice & Offline Acoustic Command states
  const [isListening, setIsListening] = useState(false);
  const [isOfflineVoiceActive, setIsOfflineVoiceActive] = useState(false);
  const [acousticLevels, setAcousticLevels] = useState<number[]>([22, 34, 48, 36, 54, 40, 28, 20]);
  const [commandInput, setCommandInput] = useState('');
  const [transcriptPreview, setTranscriptPreview] = useState('');
  const [inlineVoiceAnswer, setInlineVoiceAnswer] = useState<string | null>(null);

  // Border colorful sweep runs strictly for 2.8s every 30 seconds
  const [sweepKey, setSweepKey] = useState<number | null>(null);

  // Latest Clinical Lab Popover states (QR Pass + Bedside MAP/Dose Calc + Edge Latency)
  const [labSection, setLabSection] = useState<'qr' | 'calc' | 'edge'>('qr');
  const [sbp, setSbp] = useState<number>(118);
  const [dbp, setDbp] = useState<number>(76);
  const [weightKg, setWeightKg] = useState<number>(64);
  const [copiedQrLink, setCopiedQrLink] = useState(false);
  const [edgeLatencyMs, setEdgeLatencyMs] = useState<number | null>(null);
  const [isSyncingEdge, setIsSyncingEdge] = useState(false);

  const recognitionRef = useRef<any>(null);
  const acousticStreamRef = useRef<MediaStream | null>(null);
  const acousticCtxRef = useRef<AudioContext | null>(null);
  const acousticRafRef = useRef<number | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const scrollStateRef = useRef<TopBarScrollState>(createInitialTopBarScrollState(0));
  const renderedOffsetRef = useRef<number>(0);
  const animRafRef = useRef<number | null>(null);
  const lastFrameTsRef = useRef<number>(0);
  const openPopoverRef = useRef<'telemetry' | 'voice' | 'clinical_lab' | null>(null);
  const isBarOffscreenRef = useRef<boolean>(false);

  const hrValue = vitals?.heartRate && vitals.heartRate > 0 ? Math.round(vitals.heartRate) : 72;
  const spo2Value = vitals?.spo2 && vitals.spo2 > 0 ? Math.round(vitals.spo2) : 98;

  const stopVoiceListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    if (acousticRafRef.current) {
      cancelAnimationFrame(acousticRafRef.current);
      acousticRafRef.current = null;
    }
    if (acousticStreamRef.current) {
      acousticStreamRef.current.getTracks().forEach((tr) => tr.stop());
      acousticStreamRef.current = null;
    }
    if (acousticCtxRef.current) {
      try {
        void acousticCtxRef.current.close();
      } catch {
        // ignore
      }
      acousticCtxRef.current = null;
    }
    setIsListening(false);
    setIsOfflineVoiceActive(false);
  }, []);

  useEffect(() => {
    openPopoverRef.current = openPopover;
  }, [openPopover]);

  const applyHeaderVisuals = useCallback((offsetPx: number) => {
    const headerEl = headerRef.current;
    const maxHide = DEFAULT_TOPBAR_SCROLL_CONFIG.maxHidePx;
    const hiddenRatio = Math.min(1, Math.max(0, -offsetPx / maxHide));
    const opacity = hiddenRatio < 0.35 ? 1 : Math.max(0, 1 - (hiddenRatio - 0.35) / 0.65);

    if (headerEl) {
      headerEl.style.transform = `translate3d(0, ${offsetPx.toFixed(2)}px, 0)`;
      headerEl.style.opacity = opacity.toFixed(3);
    }

    const nowOffscreen = offsetPx <= -maxHide + 3;
    if (nowOffscreen !== isBarOffscreenRef.current) {
      isBarOffscreenRef.current = nowOffscreen;
      setIsBarOffscreen(nowOffscreen);
    }
  }, []);

  const ensureSmoothingLoop = useCallback(() => {
    if (animRafRef.current !== null) return;
    lastFrameTsRef.current = performance.now();

    const stepFrame = (now: number) => {
      const dt = (now - lastFrameTsRef.current) / 1000;
      lastFrameTsRef.current = now;

      const target = scrollStateRef.current.targetOffset;
      const next = stepSmoothOffset(renderedOffsetRef.current, target, dt, 15);
      renderedOffsetRef.current = next;
      applyHeaderVisuals(next);

      if (Math.abs(target - next) > 0.25) {
        animRafRef.current = requestAnimationFrame(stepFrame);
      } else {
        renderedOffsetRef.current = target;
        applyHeaderVisuals(target);
        animRafRef.current = null;
      }
    };

    animRafRef.current = requestAnimationFrame(stepFrame);
  }, [applyHeaderVisuals]);

  const revealTopBarSmoothly = useCallback(() => {
    scrollStateRef.current = {
      ...scrollStateRef.current,
      targetOffset: 0,
      committedDir: 'up',
      reversalAccum: 0
    };
    ensureSmoothingLoop();
  }, [ensureSmoothingLoop]);

  // Progressive anti-flicker scroll choreography:
  // - Gradually slides upward out of view on scroll down
  // - Smoothly returns into view on scroll up
  // - Filters micro-jitter on slow scroll & smooths fast flicks via rAF interpolation
  // - Always visible at page top; remains steady when scrolling stops
  useEffect(() => {
    if (currentView === 'ai_nexus') {
      if (animRafRef.current !== null) {
        cancelAnimationFrame(animRafRef.current);
        animRafRef.current = null;
      }
      return;
    }

    const scrollEl = document.getElementById('app-scroll-viewport');
    const initialTop = scrollEl ? scrollEl.scrollTop : window.scrollY;
    scrollStateRef.current = createInitialTopBarScrollState(initialTop);
    renderedOffsetRef.current = 0;
    applyHeaderVisuals(0);

    const target: EventTarget = scrollEl || window;

    const handleScroll = () => {
      const currentTop = scrollEl ? scrollEl.scrollTop : window.scrollY;
      const scrollHeight = scrollEl ? scrollEl.scrollHeight : document.documentElement.scrollHeight;
      const clientHeight = scrollEl ? scrollEl.clientHeight : window.innerHeight;

      const { state, shouldClosePopover } = updateTopBarScrollState(
        scrollStateRef.current,
        currentTop,
        scrollHeight,
        clientHeight,
        openPopoverRef.current !== null
      );

      scrollStateRef.current = state;
      if (shouldClosePopover) {
        setOpenPopover(null);
      }

      if (Math.abs(state.targetOffset - renderedOffsetRef.current) > 0.25) {
        ensureSmoothingLoop();
      }
    };

    target.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      target.removeEventListener('scroll', handleScroll);
      if (animRafRef.current !== null) {
        cancelAnimationFrame(animRafRef.current);
        animRafRef.current = null;
      }
    };
  }, [currentView, applyHeaderVisuals, ensureSmoothingLoop]);

  // Trigger a clean, brief colorful perimeter sweep shortly after load, then every 30 seconds
  useEffect(() => {
    let endTimer: number | null = null;
    const triggerSweep = () => {
      const id = Date.now();
      setSweepKey(id);
      if (endTimer) window.clearTimeout(endTimer);
      endTimer = window.setTimeout(() => {
        setSweepKey((curr) => (curr === id ? null : curr));
      }, 2900);
    };

    const initialTimer = window.setTimeout(triggerSweep, 1200);
    const interval = window.setInterval(triggerSweep, 30000);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(interval);
      if (endTimer) window.clearTimeout(endTimer);
    };
  }, []);

  // Close popovers cleanly on outside click or Escape
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpenPopover(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenPopover(null);
        stopVoiceListening();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        revealTopBarSmoothly();
        setOpenPopover((prev) => (prev === 'voice' ? null : 'voice'));
      }
    };
    document.addEventListener('mousedown', handleOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [stopVoiceListening, revealTopBarSmoothly]);

  useEffect(() => {
    return () => {
      stopVoiceListening();
    };
  }, [stopVoiceListening]);

  const emergencyShareUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const payload = {
      name: user?.displayName || 'Doctorian Member',
      email: user?.email || 'member@doctorian.org',
      role: user?.role || 'patient',
      hr: hrValue,
      spo2: spo2Value,
      updatedAt: new Date().toISOString().slice(0, 16)
    };
    try {
      const encoded = btoa(
        encodeURIComponent(JSON.stringify(payload)).replace(/%([0-9A-F]{2})/g, (_, p1) =>
          String.fromCharCode(parseInt(p1, 16))
        )
      );
      return `${window.location.origin}/?scanUserData=${encodeURIComponent(encoded)}`;
    } catch {
      return window.location.origin;
    }
  }, [user?.displayName, user?.email, user?.role, hrValue, spo2Value]);

  const qrMatrix = useMemo(() => buildDeterministicQrMatrix(emergencyShareUrl), [emergencyShareUrl]);
  const installedSummary = useMemo(() => getInstalledPackageSummary(), [openPopover]);

  // Dynamically rank user interests & live filter suggestions
  const interestShortcuts = useMemo(
    () => getInterestRankedCommands(6),
    [openPopover, commandInput]
  );
  const liveSuggestions = useMemo(
    () => (commandInput.trim() ? getSmartVoiceSuggestions(commandInput, 5) : interestShortcuts),
    [commandInput, interestShortcuts]
  );

  if (currentView === 'ai_nexus') {
    return null;
  }

  const dispatchIntent = (intent: SmartVoiceIntent) => {
    recordUserInterest(intent.id);
    setInlineVoiceAnswer(null);

    if (intent.actionType === 'view') {
      onNavigate(intent.target);
      onNotify?.(`${t('Opened')} ${t(intent.label)}`, 'success');
      setCommandInput('');
      setOpenPopover(null);
      return;
    }
    if (intent.actionType === 'nextgen') {
      setCommandInput('');
      setOpenPopover(null);
      onOpenNextGenTech(intent.target as NextGenTechTab);
      return;
    }
    if (intent.actionType === 'popover_lab') {
      setCommandInput('');
      setLabSection(intent.target as 'qr' | 'calc' | 'edge');
      setOpenPopover('clinical_lab');
      return;
    }
    if (intent.actionType === 'event') {
      setCommandInput('');
      setOpenPopover(null);
      window.dispatchEvent(new CustomEvent(intent.target));
      onNotify?.(t(intent.label), 'success');
      return;
    }
    if (intent.actionType === 'theme') {
      setCommandInput('');
      setOpenPopover(null);
      window.dispatchEvent(new CustomEvent('doctorian-set-theme', { detail: { dark: intent.target === 'dark' } }));
      onNotify?.(t(intent.label), 'success');
      return;
    }
    if (intent.actionType === 'language') {
      setCommandInput('');
      setOpenPopover(null);
      setAppLanguage(intent.target);
      onNotify?.(`${intent.label}`, 'success');
    }
  };

  const executeSmartCommand = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    const resolution = resolveSmartVoiceCommand(trimmed, appLang);
    if (resolution.matched && resolution.intent) {
      dispatchIntent(resolution.intent);
      return;
    }

    if (resolution.offlineAnswer) {
      setInlineVoiceAnswer(resolution.offlineAnswer);
      return;
    }

    onNotify?.(`Select a suggested action below or ask Medbot directly.`, 'info');
  };

  const startOfflineAcousticMic = async () => {
    setIsOfflineVoiceActive(true);
    setIsListening(true);
    setTranscriptPreview('Offline acoustic listener ready — speak or type to launch...');

    try {
      if (!navigator.mediaDevices?.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      acousticStreamRef.current = stream;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      acousticCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 32;
      source.connect(analyser);

      const buf = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        if (!acousticCtxRef.current) return;
        analyser.getByteFrequencyData(buf);
        const bars = Array.from({ length: 8 }, (_, idx) => {
          const val = buf[idx] || 0;
          return Math.max(16, Math.min(100, Math.round((val / 255) * 100) + 14));
        });
        setAcousticLevels(bars);
        acousticRafRef.current = requestAnimationFrame(tick);
      };
      acousticRafRef.current = requestAnimationFrame(tick);
    } catch {
      // Keep interactive offline command bar running even without mic permission
    }
  };

  const toggleVoiceRecognition = () => {
    revealTopBarSmoothly();
    if (isListening) {
      stopVoiceListening();
      return;
    }

    setOpenPopover('voice');
    setTranscriptPreview('');
    setInlineVoiceAnswer(null);

    const SpeechRec =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    if (isOffline || (typeof navigator !== 'undefined' && !navigator.onLine) || !SpeechRec) {
      void startOfflineAcousticMic();
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.lang = getSpeechRecognitionLocale(appLang);
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setIsOfflineVoiceActive(false);
      };
      recognition.onresult = (event: any) => {
        const result = event.results?.[event.results.length - 1];
        const spoken = result?.[0]?.transcript || '';
        setTranscriptPreview(spoken);
        setCommandInput(spoken);
        if (result?.isFinal && spoken.trim()) {
          stopVoiceListening();
          executeSmartCommand(spoken);
        }
      };
      recognition.onerror = (ev: any) => {
        const errCode = ev?.error;
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch {
            // ignore
          }
          recognitionRef.current = null;
        }
        // Seamless failover into Offline Acoustic + Interest Matcher when cloud speech fails offline
        if (errCode === 'network' || errCode === 'service-not-allowed' || !navigator.onLine) {
          void startOfflineAcousticMic();
        } else {
          stopVoiceListening();
        }
      };
      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      void startOfflineAcousticMic();
    }
  };

  const handleRunEdgeSyncProbe = async () => {
    if (isSyncingEdge) return;
    setIsSyncingEdge(true);
    const t0 = performance.now();
    try {
      if (navigator.onLine) {
        await fetch('/api/offline-assets', { cache: 'no-store' });
        setEdgeLatencyMs(Math.max(1, Math.round(performance.now() - t0)));
        const { syncOfflineActions } = await import('../api');
        await syncOfflineActions();
        onNotify?.('Cloud & offline edge queue synchronized.', 'success');
      } else {
        setEdgeLatencyMs(0);
        onNotify?.('Running offline on cached local engine.', 'info');
      }
    } catch {
      setEdgeLatencyMs(null);
      onNotify?.('Offline local mode preserved safely.', 'info');
    } finally {
      setIsSyncingEdge(false);
    }
  };

  const mapValue = Math.round((sbp + 2 * dbp) / 3);
  const mapStatus =
    mapValue < 65 ? 'Low Perfusion' : mapValue <= 105 ? 'Optimal MAP' : 'Elevated MAP';
  const paracetamolSingleMg = Math.round(weightKg * 15);
  const amoxicillinDailyMg = Math.round(weightKg * 45);
  const viewTitle = t(VIEW_TITLES[currentView] || 'Clinical Suite');

  return (
    <div
      ref={barRef}
      className="relative z-[58] w-full h-[80px] sm:h-[88px] pt-2 sm:pt-3 px-2 sm:px-6 pointer-events-none shrink-0 flex items-start"
    >
      <div className="w-full max-w-6xl mx-auto flex justify-center items-center">
        {/* FLOATING SMART TOP BAR (Scroll-reactive smooth upward glide & return) */}
        <header
          ref={headerRef}
          aria-label="Smart Clinical Top Bar"
          aria-hidden={isBarOffscreen}
          className={`${
            isBarOffscreen ? 'pointer-events-none' : 'pointer-events-auto'
          } relative w-full h-[66px] sm:h-[74px] px-2.5 sm:px-5 rounded-[1.25rem] bg-white/94 dark:bg-[#07122a]/94 backdrop-blur-xl border-2 border-b-[4.5px] border-slate-200/95 dark:border-cyan-500/35 border-b-slate-300 dark:border-b-[#020816] shadow-[0_14px_34px_-8px_rgba(2,12,35,0.2)] dark:shadow-[0_18px_40px_-10px_rgba(0,0,0,0.7)] flex items-center justify-between gap-1.5 sm:gap-4 will-change-[transform,opacity]`}
        >
            {/* Crisp Masked 2px Colorful Border Light Running Every 30 Seconds */}
            {sweepKey !== null && (
              <div key={sweepKey} className="doctorian-topbar-border-mask" aria-hidden="true">
                <div className="doctorian-topbar-border-beam" />
              </div>
            )}

            {/* ZONE 1: Spinning Brand Logo + Clean Single-Line Title */}
            <div className="flex items-center gap-2 min-w-0 shrink-0 relative z-10">
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="min-h-[44px] flex items-center gap-2 text-left cursor-pointer whitespace-nowrap shrink-0 group"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full p-0.5 border border-slate-200 dark:border-cyan-400/45 bg-slate-50 dark:bg-slate-900 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                  <img
                    src="/logo-48.png"
                    alt="Doctorian"
                    className="w-full h-full rounded-full object-cover doctorian-logo-spin"
                  />
                </div>
                <span className="hidden min-[380px]:inline text-xs sm:text-base font-extrabold tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition-colors">
                  Doctorian
                </span>
              </button>

              <span className="hidden lg:inline text-slate-300 dark:text-slate-600 select-none">/</span>
              <span className="hidden lg:inline text-xs font-medium text-slate-500 dark:text-slate-400 truncate max-w-[130px]">
                {viewTitle}
              </span>
            </div>

            {/* ZONE 2: Thick Tactile Elevated Card Holding Bio-Telemetry & Voice Command */}
            <div className="relative z-10 flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-2xl bg-gradient-to-b from-white via-slate-50 to-slate-100/95 dark:from-[#102759] dark:via-[#09193e] dark:to-[#050f29] border-2 border-b-[4.5px] border-slate-300 dark:border-cyan-400/50 border-b-slate-400 dark:border-b-[#020714] shadow-[0_6px_18px_-4px_rgba(15,23,42,0.16),inset_0_2px_0_rgba(255,255,255,0.95)] dark:shadow-[0_10px_24px_-6px_rgba(0,0,0,0.8),inset_0_1.5px_0_rgba(125,211,252,0.28)] shrink-0">
              <button
                type="button"
                onClick={() => setOpenPopover((prev) => (prev === 'telemetry' ? null : 'telemetry'))}
                aria-expanded={openPopover === 'telemetry'}
                title="Live Bio-Telemetry & Sensor Hub"
                className={`min-h-[38px] sm:min-h-[40px] px-2 sm:px-3.5 rounded-xl flex items-center gap-1.5 sm:gap-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  openPopover === 'telemetry'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-800 dark:text-slate-100 hover:bg-white/90 dark:hover:bg-slate-800/80'
                }`}
              >
                <HeartPulse
                  size={15}
                  className={
                    openPopover === 'telemetry'
                      ? 'text-white'
                      : isSensorConnected
                      ? 'text-rose-500'
                      : 'text-cyan-600 dark:text-cyan-400'
                  }
                />
                <span className="font-mono tabular-nums text-[11px] sm:text-xs">
                  {hrValue} BPM
                </span>
                <span className="hidden sm:inline opacity-40">·</span>
                <span
                  className={`hidden sm:inline font-mono tabular-nums text-xs ${
                    openPopover === 'telemetry' ? 'text-cyan-100' : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {spo2Value}% SpO2
                </span>
              </button>

              <div className="w-0.5 h-5 rounded-full bg-slate-300/80 dark:bg-cyan-500/25" />

              <button
                type="button"
                onClick={toggleVoiceRecognition}
                aria-expanded={openPopover === 'voice'}
                title="Smart Offline & Online Voice Command Router (Ctrl+J)"
                className={`min-h-[38px] sm:min-h-[40px] px-2.5 sm:px-3.5 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isListening
                    ? 'bg-rose-600 text-white shadow-sm'
                    : openPopover === 'voice'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-800 dark:text-slate-100 hover:bg-white/90 dark:hover:bg-slate-800/80'
                }`}
              >
                {isListening ? (
                  <>
                    <AudioWaveform size={15} className="animate-pulse" />
                    <span className="text-[11px] sm:text-xs">{t('Listening')}</span>
                  </>
                ) : (
                  <>
                    <Mic
                      size={15}
                      className={openPopover === 'voice' ? 'text-white' : 'text-blue-600 dark:text-cyan-400'}
                    />
                    <span className="text-[11px] sm:text-xs">{t('Voice Cmd')}</span>
                  </>
                )}
              </button>
            </div>

            {/* ZONE 3: Optical Scan & Clinical QR / Edge Lab */}
            <div className="relative z-10 flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setOpenPopover(null);
                  onOpenNextGenTech('optical_pulse');
                }}
                aria-label={t('Optical Scan')}
                title="Contactless Camera rPPG Pulse & Biometric Suite"
                className="min-h-[42px] px-2.5 sm:px-3.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-blue-600 dark:hover:bg-cyan-500 text-white dark:hover:text-slate-950 border border-slate-800 dark:border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <ScanLine size={15} />
                <span className="hidden md:inline">{t('Optical Scan')}</span>
              </button>

              <button
                type="button"
                onClick={() => setOpenPopover((prev) => (prev === 'clinical_lab' ? null : 'clinical_lab'))}
                aria-expanded={openPopover === 'clinical_lab'}
                aria-label={t('QR & Edge Lab')}
                title="Emergency QR Pass, Bedside Calculator & Edge Sync"
                className={`min-h-[42px] px-2.5 sm:px-3.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  openPopover === 'clinical_lab'
                    ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-blue-500/50 dark:hover:border-cyan-400/50'
                }`}
              >
                <QrCode size={15} className={openPopover === 'clinical_lab' ? 'text-white' : 'text-blue-600 dark:text-cyan-400'} />
                <span className="hidden sm:inline">{t('QR & Edge Lab')}</span>
              </button>
            </div>
        </header>
      </div>

      {/* POPOVERS (Responsive & Viewport-Clamped for All Screen Sizes) */}
      <AnimatePresence>
        {openPopover === 'telemetry' && (
          <motion.div
            key="popover-telemetry"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-auto absolute left-1/2 -translate-x-1/2 top-[80px] sm:top-[88px] w-[calc(100vw-1rem)] max-w-[400px] max-h-[calc(100dvh-110px)] overflow-y-auto rounded-2xl bg-white dark:bg-[#08142e] border-2 border-slate-200 dark:border-cyan-500/35 shadow-2xl p-4 space-y-3 text-slate-900 dark:text-slate-100"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
              <div>
                <h3 className="text-sm font-bold">{t('Biometric Hardware & Optical Scanners')}</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isSensorConnected
                    ? t('Hardware telemetry linked')
                    : isOffline
                    ? t('Local offline sensors ready')
                    : t('Camera & acoustic diagnostics ready')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpenPopover(null)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                aria-label="Close telemetry menu"
              >
                <X size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => {
                  setOpenPopover(null);
                  onOpenNextGenTech('optical_pulse');
                }}
                className="min-h-[46px] px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 hover:bg-blue-50 dark:hover:bg-blue-950/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-left cursor-pointer transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <Camera size={16} className="text-rose-500 shrink-0" />
                  <span>
                    <span className="block text-xs font-bold">Camera Optical Pulse (rPPG)</span>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400">Contactless heart-rate reader</span>
                  </span>
                </span>
                <ArrowRight size={14} className="text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setOpenPopover(null);
                  onOpenNextGenTech('stethoscope');
                }}
                className="min-h-[46px] px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 hover:bg-blue-50 dark:hover:bg-blue-950/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-left cursor-pointer transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <Stethoscope size={16} className="text-cyan-500 shrink-0" />
                  <span>
                    <span className="block text-xs font-bold">Digital Acoustic Stethoscope</span>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400">Cardiopulmonary sound analysis</span>
                  </span>
                </span>
                <ArrowRight size={14} className="text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setOpenPopover(null);
                  onOpenNextGenTech('vocal_biomarker');
                }}
                className="min-h-[46px] px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 hover:bg-blue-50 dark:hover:bg-blue-950/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-left cursor-pointer transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <AudioWaveform size={16} className="text-indigo-500 shrink-0" />
                  <span>
                    <span className="block text-xs font-bold">Vocal Biomarker Analyzer</span>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400">Respiratory strain screening</span>
                  </span>
                </span>
                <ArrowRight size={14} className="text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setOpenPopover(null);
                  if (onConnectSensor) onConnectSensor();
                  onNavigate('smart_watch');
                }}
                className="min-h-[46px] px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 hover:bg-blue-50 dark:hover:bg-blue-950/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-left cursor-pointer transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <Watch size={16} className="text-emerald-500 shrink-0" />
                  <span>
                    <span className="block text-xs font-bold">Smart Watch &amp; USB Sensor Link</span>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400">Continuous wearable &amp; BLE stream</span>
                  </span>
                </span>
                <ArrowRight size={14} className="text-slate-400" />
              </button>
            </div>
          </motion.div>
        )}

        {openPopover === 'voice' && (
          <motion.div
            key="popover-voice"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-auto absolute left-1/2 -translate-x-1/2 top-[80px] sm:top-[88px] w-[calc(100vw-1rem)] max-w-[460px] max-h-[calc(100dvh-110px)] overflow-y-auto rounded-2xl bg-white dark:bg-[#08142e] border-2 border-slate-200 dark:border-cyan-500/35 shadow-2xl p-4 space-y-3 text-slate-900 dark:text-slate-100"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {isListening ? (
                  <Mic className="w-4 h-4 text-rose-500 animate-pulse shrink-0" />
                ) : (
                  <MicOff className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <div className="min-w-0">
                  <h3 className="text-sm font-bold truncate">
                    {isOfflineVoiceActive
                      ? 'Offline Acoustic & Smart Command Hub'
                      : isListening
                      ? 'Listening for voice command...'
                      : 'Smart Offline & Voice Quick Launcher'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    Ranked by your interests · Works offline &amp; in Ugandan languages
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  stopVoiceListening();
                  setOpenPopover(null);
                }}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer shrink-0"
                aria-label="Close voice command bar"
              >
                <X size={14} />
              </button>
            </div>

            {isOfflineVoiceActive && (
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 h-6">
                  {acousticLevels.map((lvl, i) => (
                    <div
                      key={i}
                      className="w-1.5 rounded-full bg-gradient-to-t from-blue-500 to-cyan-400 transition-all duration-75"
                      style={{ height: `${Math.max(5, Math.round(lvl * 0.22))}px` }}
                    />
                  ))}
                </div>
                <span className="text-[11px] font-semibold text-cyan-700 dark:text-cyan-300 text-right leading-tight">
                  Offline Ready — type a keyword or tap your top interest below
                </span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (commandInput.trim()) {
                  executeSmartCommand(commandInput);
                } else if (liveSuggestions[0]) {
                  dispatchIntent(liveSuggestions[0]);
                }
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                autoFocus
                value={commandInput}
                onChange={(e) => {
                  setCommandInput(e.target.value);
                  if (inlineVoiceAnswer) setInlineVoiceAnswer(null);
                }}
                placeholder="Speak or type: medbot, malaria, sms, video call, omusujja..."
                className="flex-1 min-h-[42px] px-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="min-h-[42px] px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shrink-0"
              >
                Open
              </button>
            </form>

            {transcriptPreview && (
              <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium">
                {transcriptPreview}
              </p>
            )}

            {inlineVoiceAnswer && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-cyan-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-blue-600 dark:text-cyan-300">
                  <span className="flex items-center gap-1.5">
                    <Bot size={14} />
                    <span>Medbot Instant Answer</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenPopover(null);
                      onNavigate('ai_nexus');
                    }}
                    className="text-[11px] font-semibold underline cursor-pointer"
                  >
                    Open Medbot
                  </button>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line line-clamp-6">
                  {inlineVoiceAnswer}
                </p>
              </div>
            )}

            {/* Personalized Interest-Ranked Instant Open Cards */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Sparkles size={12} className="text-cyan-500" />
                  <span>{commandInput.trim() ? 'Best Matching Actions' : 'Quick Open · Based on Your Interests'}</span>
                </span>
                <span>{isOffline ? 'Offline Core' : 'Sync Ready'}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {liveSuggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => dispatchIntent(item)}
                    className="min-h-[46px] p-2 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-blue-600 hover:text-white border border-slate-200 dark:border-slate-800 text-left transition-colors cursor-pointer group"
                  >
                    <span className="block text-xs font-bold truncate group-hover:text-white">
                      {t(item.label)}
                    </span>
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400 group-hover:text-blue-100 truncate">
                      {item.subtitle}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {openPopover === 'clinical_lab' && (
          <motion.div
            key="popover-clinical-lab"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-auto absolute right-2 sm:right-6 top-[80px] sm:top-[88px] w-[calc(100vw-1rem)] max-w-[390px] max-h-[calc(100dvh-110px)] overflow-y-auto rounded-2xl bg-white dark:bg-[#08142e] border-2 border-slate-200 dark:border-cyan-500/35 shadow-2xl p-4 space-y-3.5 text-slate-900 dark:text-slate-100"
          >
            <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2.5">
              <div>
                <h3 className="text-sm font-bold">Smart QR Pass &amp; Clinical Edge Lab</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Instant emergency pass, bedside calculators &amp; edge sync
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpenPopover(null)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                aria-label="Close clinical edge lab"
              >
                <X size={14} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setLabSection('qr')}
                className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                  labSection === 'qr'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-cyan-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <QrCode size={13} />
                <span>QR Pass</span>
              </button>
              <button
                type="button"
                onClick={() => setLabSection('calc')}
                className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                  labSection === 'calc'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-cyan-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Calculator size={13} />
                <span>MAP / Dose</span>
              </button>
              <button
                type="button"
                onClick={() => setLabSection('edge')}
                className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                  labSection === 'edge'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-cyan-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <RefreshCw size={13} />
                <span>Edge Sync</span>
              </button>
            </div>

            {labSection === 'qr' && (
              <div className="space-y-3">
                <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="p-2 rounded-xl bg-white border border-slate-200 shrink-0">
                    <svg viewBox="0 0 21 21" className="w-20 h-20" shapeRendering="crispEdges">
                      {qrMatrix.map((row, r) =>
                        row.map((on, c) =>
                          on ? (
                            <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="#0f172a" />
                          ) : null
                        )
                      )}
                    </svg>
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="text-xs font-bold truncate">
                      {user?.displayName || 'Doctorian Member'}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                      HR {hrValue} BPM · SpO2 {spo2Value}%
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      Works offline for paramedics and hospital triage check-in.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(emergencyShareUrl);
                    setCopiedQrLink(true);
                    onNotify?.('Offline medical QR link copied to clipboard.', 'success');
                    window.setTimeout(() => setCopiedQrLink(false), 2000);
                  }}
                  className="w-full min-h-[42px] px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  {copiedQrLink ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedQrLink ? 'Copied Emergency Pass Link' : 'Copy Scannable QR Link'}</span>
                </button>
              </div>
            )}

            {labSection === 'calc' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Mean Arterial Pressure (MAP)</span>
                    <span className="font-mono tabular-nums font-bold text-blue-600 dark:text-cyan-400">
                      {mapValue} mmHg · {mapStatus}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="space-y-1">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Systolic (mmHg)</span>
                      <input
                        type="number"
                        min={50}
                        max={260}
                        value={sbp}
                        onChange={(e) => setSbp(Number(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono tabular-nums"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Diastolic (mmHg)</span>
                      <input
                        type="number"
                        min={30}
                        max={160}
                        value={dbp}
                        onChange={(e) => setDbp(Number(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono tabular-nums"
                      />
                    </label>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Weight-Based Dose Reference</span>
                    <input
                      type="number"
                      min={3}
                      max={200}
                      value={weightKg}
                      onChange={(e) => setWeightKg(Math.max(1, Number(e.target.value) || 1))}
                      className="w-20 px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono tabular-nums text-right"
                      aria-label="Patient weight in kilograms"
                    />
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 font-mono tabular-nums">
                    <p>Paracetamol (15 mg/kg): {paracetamolSingleMg} mg/dose</p>
                    <p>Amoxicillin (45 mg/kg/day): {amoxicillinDailyMg} mg/day</p>
                  </div>
                </div>
              </div>
            )}

            {labSection === 'edge' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold">
                      {isOffline ? (
                        <WifiOff size={14} className="text-amber-500" />
                      ) : (
                        <Wifi size={14} className="text-emerald-500" />
                      )}
                      <span>{isOffline ? 'Offline Core Active' : 'Cloud + Edge Linked'}</span>
                    </span>
                    <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                      {edgeLatencyMs !== null ? `${edgeLatencyMs} ms RTT` : installedSummary.pkg.sizeLabel}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                    {installedSummary.cachedCount} offline modules · Footprint {installedSummary.pkg.sizeLabel}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isSyncingEdge}
                  onClick={() => void handleRunEdgeSyncProbe()}
                  className="w-full min-h-[42px] px-4 py-2 rounded-xl bg-slate-900 dark:bg-cyan-500 hover:bg-blue-600 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-60"
                >
                  <RefreshCw size={14} className={isSyncingEdge ? 'animate-spin' : ''} />
                  <span>{isSyncingEdge ? 'Synchronizing...' : 'Sync Queue & Test Latency'}</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
