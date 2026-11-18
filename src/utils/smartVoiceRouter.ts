import { runAutonomousOfflineMedicalAI } from './offlineMedicalAI';
import { SUPPORTED_LANGUAGES, normalizeLanguageCode } from './translations';

export type VoiceActionType = 'view' | 'nextgen' | 'popover_lab' | 'event' | 'theme' | 'language';

export interface SmartVoiceIntent {
  id: string;
  label: string;
  subtitle: string;
  actionType: VoiceActionType;
  target: string;
  category: 'triage' | 'telehealth' | 'diagnostics' | 'pharmacy' | 'system';
  keywords: string[];
  defaultWeight: number;
}

export interface SmartVoiceResolution {
  matched: boolean;
  intent?: SmartVoiceIntent;
  confidence: number;
  offlineAnswer?: string;
  suggestions: SmartVoiceIntent[];
}

const INTEREST_STORAGE_KEY = 'doctorian_user_interests_v1';

export const VOICE_INTENTS: SmartVoiceIntent[] = [
  {
    id: 'ai_nexus',
    label: 'Medbot AI',
    subtitle: 'Offline & live AI doctor',
    actionType: 'view',
    target: 'ai_nexus',
    category: 'triage',
    keywords: [
      'medbot',
      'med bot',
      'care ai',
      'ai',
      'bot',
      'chat',
      'ask doctor',
      'musawo',
      'daktari',
      'omushaho',
      'help me',
      'consultation',
      'advice'
    ],
    defaultWeight: 10
  },
  {
    id: 'symptoms',
    label: 'Symptom Triage',
    subtitle: 'Check fever, pain, cough',
    actionType: 'view',
    target: 'symptoms',
    category: 'triage',
    keywords: [
      'symptom',
      'symptoms',
      'triage',
      'check symptoms',
      'fever',
      'headache',
      'cough',
      'pain',
      'sick',
      'malaria',
      'rash',
      'omusujja',
      'homa',
      'omutwe',
      'diagnose'
    ],
    defaultWeight: 9
  },
  {
    id: 'app_medics',
    label: 'E-Pharmacy',
    subtitle: 'Order safe medicines',
    actionType: 'view',
    target: 'app_medics',
    category: 'pharmacy',
    keywords: [
      'pharmacy',
      'e-pharmacy',
      'epharmacy',
      'medics',
      'buy medicine',
      'order medicine',
      'drugs',
      'medicine',
      'coartem',
      'paracetamol',
      'panadol',
      'refill',
      'dawa',
      'eddagala'
    ],
    defaultWeight: 8
  },
  {
    id: 'server_network',
    label: 'SMS Hub',
    subtitle: 'SMS & patient messaging',
    actionType: 'view',
    target: 'server_network',
    category: 'telehealth',
    keywords: [
      'sms',
      'message',
      'messages',
      'text doctor',
      'send sms',
      'network',
      'friend request',
      'chat doctor',
      'sms hub',
      'ujumbe',
      'obubaka'
    ],
    defaultWeight: 8
  },
  {
    id: 'video_call',
    label: 'Video Clinic',
    subtitle: 'Live clinical video call',
    actionType: 'event',
    target: 'doctorian-open-video-call',
    category: 'telehealth',
    keywords: [
      'video call',
      'video clinic',
      'call doctor',
      'telehealth',
      'video consult',
      'camera call',
      'face call',
      'doctor video'
    ],
    defaultWeight: 7
  },
  {
    id: 'voice_call',
    label: 'Voice Call',
    subtitle: 'Doctor audio call & SMS',
    actionType: 'event',
    target: 'doctorian-open-voice-call',
    category: 'telehealth',
    keywords: [
      'voice call',
      'audio call',
      'phone call',
      'ring doctor',
      'ring patient',
      'simu',
      'essimu'
    ],
    defaultWeight: 6
  },
  {
    id: 'monitor',
    label: 'Bio-Telemetry',
    subtitle: 'Heart rate, BP & SpO2',
    actionType: 'view',
    target: 'monitor',
    category: 'diagnostics',
    keywords: [
      'monitor',
      'vitals',
      'telemetry',
      'heart rate',
      'heart',
      'bpm',
      'spo2',
      'oxygen',
      'blood pressure',
      'bp',
      'ecg',
      'sensor',
      'pulesa',
      'mutima'
    ],
    defaultWeight: 7
  },
  {
    id: 'optical_pulse',
    label: 'Optical Scan',
    subtitle: 'Contactless camera rPPG',
    actionType: 'nextgen',
    target: 'optical_pulse',
    category: 'diagnostics',
    keywords: ['camera pulse', 'optical', 'optical scan', 'rppg', 'pulse scan', 'face scan', 'camera'],
    defaultWeight: 6
  },
  {
    id: 'stethoscope',
    label: 'Stethoscope',
    subtitle: 'Heart & lung acoustics',
    actionType: 'nextgen',
    target: 'stethoscope',
    category: 'diagnostics',
    keywords: ['stethoscope', 'acoustic', 'lung sound', 'heart sound', 'chest sound', 'breathing'],
    defaultWeight: 5
  },
  {
    id: 'vocal_biomarker',
    label: 'Vocal Lab',
    subtitle: 'Respiratory voice test',
    actionType: 'nextgen',
    target: 'vocal_biomarker',
    category: 'diagnostics',
    keywords: ['vocal', 'biomarker', 'voice check', 'cough test', 'throat'],
    defaultWeight: 4
  },
  {
    id: 'ambient_scribe',
    label: 'Ambient Scribe',
    subtitle: 'Auto SOAP clinical notes',
    actionType: 'view',
    target: 'ambient_scribe',
    category: 'diagnostics',
    keywords: ['scribe', 'soap', 'clinical note', 'notes', 'dictate', 'transcribe'],
    defaultWeight: 5
  },
  {
    id: 'records',
    label: 'Medical Vault',
    subtitle: '1GB records & history',
    actionType: 'view',
    target: 'records',
    category: 'pharmacy',
    keywords: ['records', 'vault', '1gb', 'storage', 'documents', 'files', 'charts', 'history', 'reports'],
    defaultWeight: 6
  },
  {
    id: 'diagnostic_lab',
    label: 'Lab Analyser',
    subtitle: 'mRDT, CBC & urine labs',
    actionType: 'view',
    target: 'diagnostic_lab',
    category: 'diagnostics',
    keywords: ['lab', 'diagnostic lab', 'blood test', 'mrdt', 'cbc', 'test results', 'urine test'],
    defaultWeight: 5
  },
  {
    id: 'meds',
    label: 'Prescriptions',
    subtitle: 'Dosages & Rx schedule',
    actionType: 'view',
    target: 'meds',
    category: 'pharmacy',
    keywords: ['prescription', 'prescriptions', 'rx', 'pills', 'meds', 'dosage schedule'],
    defaultWeight: 5
  },
  {
    id: 'clinical_roadmap',
    label: 'Appointments',
    subtitle: 'Schedule clinic visits',
    actionType: 'view',
    target: 'clinical_roadmap',
    category: 'telehealth',
    keywords: ['appointment', 'appointments', 'schedule', 'visit', 'book doctor', 'calendar'],
    defaultWeight: 5
  },
  {
    id: 'emergency',
    label: 'Emergency SOS',
    subtitle: '999 / 112 rapid alert',
    actionType: 'view',
    target: 'emergency',
    category: 'triage',
    keywords: ['emergency', 'sos', 'ambulance', '999', '112', 'urgent', 'critical'],
    defaultWeight: 6
  },
  {
    id: 'smart_watch',
    label: 'Smart Watch',
    subtitle: 'Wearable & BLE link',
    actionType: 'view',
    target: 'smart_watch',
    category: 'diagnostics',
    keywords: ['watch', 'smart watch', 'wearable', 'bluetooth', 'ble', 'band'],
    defaultWeight: 4
  },
  {
    id: 'qr_pass',
    label: 'QR Health Pass',
    subtitle: 'Offline emergency QR',
    actionType: 'popover_lab',
    target: 'qr',
    category: 'system',
    keywords: ['qr', 'qr pass', 'barcode', 'scan id', 'emergency pass'],
    defaultWeight: 4
  },
  {
    id: 'bedside_calc',
    label: 'MAP & Dose Calc',
    subtitle: 'Bedside clinical math',
    actionType: 'popover_lab',
    target: 'calc',
    category: 'diagnostics',
    keywords: ['calculator', 'calc', 'map', 'dose', 'dosage calculator', 'weight calc'],
    defaultWeight: 4
  },
  {
    id: 'billing',
    label: 'Plans & Billing',
    subtitle: 'Storage & mobile money',
    actionType: 'view',
    target: 'billing',
    category: 'system',
    keywords: ['billing', 'plan', 'upgrade', 'subscription', 'pay', 'mobile money', 'storage plan'],
    defaultWeight: 4
  },
  {
    id: 'download_app',
    label: 'Install App',
    subtitle: 'Offline 70MB packages',
    actionType: 'event',
    target: 'doctorian-open-install-modal',
    category: 'system',
    keywords: ['install', 'download', 'download app', 'offline app', 'android app', 'windows app', '70mb'],
    defaultWeight: 4
  },
  {
    id: 'settings',
    label: 'Account',
    subtitle: 'Profile, theme & language',
    actionType: 'view',
    target: 'settings',
    category: 'system',
    keywords: ['account', 'settings', 'profile', 'preferences', 'language'],
    defaultWeight: 5
  },
  {
    id: 'home',
    label: 'Dashboard',
    subtitle: 'Main clinical overview',
    actionType: 'view',
    target: 'home',
    category: 'system',
    keywords: ['home', 'dashboard', 'main', 'start', 'ewaka', 'nyumbani', 'omuka'],
    defaultWeight: 5
  },
  {
    id: 'theme_dark',
    label: 'Dark Mode',
    subtitle: 'Switch to night theme',
    actionType: 'theme',
    target: 'dark',
    category: 'system',
    keywords: ['dark mode', 'night mode', 'dark theme'],
    defaultWeight: 2
  },
  {
    id: 'theme_light',
    label: 'Light Mode',
    subtitle: 'Switch to daylight theme',
    actionType: 'theme',
    target: 'light',
    category: 'system',
    keywords: ['light mode', 'day mode', 'light theme'],
    defaultWeight: 2
  }
];

interface InterestMap {
  [id: string]: {
    count: number;
    lastUsed: number;
  };
}

function readInterestMap(): InterestMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(INTEREST_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function recordUserInterest(intentOrViewId: string): void {
  if (typeof window === 'undefined' || !intentOrViewId) return;
  try {
    const matched = VOICE_INTENTS.find((it) => it.id === intentOrViewId || it.target === intentOrViewId);
    const key = matched ? matched.id : intentOrViewId;
    const map = readInterestMap();
    const prev = map[key] || { count: 0, lastUsed: 0 };
    map[key] = {
      count: prev.count + 1,
      lastUsed: Date.now()
    };
    localStorage.setItem(INTEREST_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore storage quota errors
  }
}

export function getUserInterestScore(intent: SmartVoiceIntent): number {
  const map = readInterestMap();
  const entry = map[intent.id] || map[intent.target];
  if (!entry) return intent.defaultWeight;
  const ageHours = Math.max(0, (Date.now() - entry.lastUsed) / (1000 * 60 * 60));
  const recencyBoost = ageHours < 24 ? 6 : ageHours < 168 ? 3 : 1;
  return intent.defaultWeight + Math.min(25, entry.count * 2.5) + recencyBoost;
}

export function getInterestRankedCommands(limit = 6): SmartVoiceIntent[] {
  return [...VOICE_INTENTS]
    .filter((i) => i.actionType !== 'theme')
    .sort((a, b) => getUserInterestScore(b) - getUserInterestScore(a))
    .slice(0, limit);
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  const curr = new Array<number>(b.length + 1);
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j];
  }
  return prev[b.length];
}

function cleanCommandPhrase(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\b(please|open|launch|start|go to|navigate to|show me|show|take me to|check my|check|i want to|i want|switch to|use)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function phoneticNorm(s: string): string {
  return s.replace(/ph/g, 'f').replace(/ck/g, 'k').replace(/z/g, 's');
}

export function getSmartVoiceSuggestions(partialInput: string, limit = 5): SmartVoiceIntent[] {
  const cleaned = cleanCommandPhrase(partialInput);
  if (!cleaned) {
    return getInterestRankedCommands(limit);
  }
  const tokens = cleaned.split(' ').filter(Boolean);
  const scored = VOICE_INTENTS.map((intent) => {
    let score = 0;
    const labelLow = intent.label.toLowerCase();
    const subLow = intent.subtitle.toLowerCase();
    if (labelLow.startsWith(cleaned) || intent.keywords.some((k) => k.startsWith(cleaned))) {
      score += 45;
    }
    if (labelLow.includes(cleaned) || subLow.includes(cleaned)) {
      score += 30;
    }
    for (const kw of intent.keywords) {
      if (cleaned.includes(kw)) score += 35;
      else if (kw.includes(cleaned) && cleaned.length >= 2) score += 22;
      const kwPhon = phoneticNorm(kw.split(' ')[0]);
      for (const tok of tokens) {
        if (tok.length < 2) continue;
        const tokPhon = phoneticNorm(tok);
        if (kw === tok || kwPhon === tokPhon) score += 28;
        else if (kw.includes(tok) || kwPhon.includes(tokPhon)) score += 14;
        else if (tok.length >= 4 && levenshtein(tokPhon, kwPhon) <= 1) score += 18;
      }
    }
    score += getUserInterestScore(intent) * 0.25;
    return { intent, score };
  })
    .filter((s) => s.score > 8)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.intent);

  return scored.length > 0 ? scored : getInterestRankedCommands(limit);
}

export function resolveSmartVoiceCommand(rawInput: string, activeLanguage = 'English'): SmartVoiceResolution {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return {
      matched: false,
      confidence: 0,
      suggestions: getInterestRankedCommands(5)
    };
  }

  const low = trimmed.toLowerCase();

  // 1. Direct spoken language switching (e.g. "switch to Luganda", "speak Swahili")
  if (/\b(language|speak|translate|switch to|use)\b/.test(low) || SUPPORTED_LANGUAGES.some((l) => low === l.code.toLowerCase())) {
    const foundLang = SUPPORTED_LANGUAGES.find((l) => {
      const codeLow = l.code.toLowerCase();
      const parts = codeLow.split(/[-\s]/);
      return low.includes(codeLow) || parts.some((p) => p.length >= 4 && low.includes(p)) || low.includes(l.nativeLabel.toLowerCase());
    });
    if (foundLang) {
      const syntheticIntent: SmartVoiceIntent = {
        id: `lang_${foundLang.code}`,
        label: `Language: ${foundLang.nativeLabel}`,
        subtitle: 'Switch full app language',
        actionType: 'language',
        target: foundLang.code,
        category: 'system',
        keywords: [foundLang.code.toLowerCase()],
        defaultWeight: 10
      };
      return {
        matched: true,
        intent: syntheticIntent,
        confidence: 1,
        suggestions: getInterestRankedCommands(4)
      };
    }
  }

  // 2. Score all clinical & navigation intents with user interest tie-breaking
  const cleaned = cleanCommandPhrase(trimmed);
  const tokens = (cleaned || low).split(/\s+/).filter(Boolean);
  let bestIntent: SmartVoiceIntent | undefined;
  let bestScore = 0;

  for (const intent of VOICE_INTENTS) {
    let score = 0;
    for (const kw of intent.keywords) {
      const kwPhon = phoneticNorm(kw);
      if (low === kw || cleaned === kw || phoneticNorm(cleaned) === kwPhon) {
        score += 100;
      } else if (low.includes(kw) || phoneticNorm(low).includes(kwPhon)) {
        score += 50 + kw.length;
      } else {
        for (const tok of tokens) {
          if (tok.length < 2) continue;
          const tokPhon = phoneticNorm(tok);
          const kwHeadPhon = phoneticNorm(kw.split(' ')[0]);
          if (kw === tok || kwHeadPhon === tokPhon) score += 45;
          else if ((kw.includes(tok) || kwHeadPhon.includes(tokPhon)) && tok.length >= 3) score += 22;
          else if (tok.length >= 4) {
            const dist = levenshtein(tokPhon, kwHeadPhon);
            if (dist <= 1) score += 30;
            else if (dist === 2 && tok.length >= 6) score += 19;
          }
        }
      }
    }

    if (score > 0) {
      // Personal user interest boost so frequent modules win ties
      score += Math.min(18, getUserInterestScore(intent) * 0.6);
      if (score > bestScore) {
        bestScore = score;
        bestIntent = intent;
      }
    }
  }

  // If query is clearly a clinical/medical question (longer sentence or question mark)
  // AND confidence for simple screen navigation is low, answer directly offline via Medbot!
  const isQuestionPhrase =
    trimmed.includes('?') ||
    /^(what|how|why|when|where|can|should|is|does|njagala okumanya|nina|ninaki|niambie)\b/i.test(trimmed);

  if (bestIntent && bestScore >= 36 && (!isQuestionPhrase || bestScore >= 70)) {
    recordUserInterest(bestIntent.id);
    return {
      matched: true,
      intent: bestIntent,
      confidence: Math.min(1, bestScore / 100),
      suggestions: getSmartVoiceSuggestions(trimmed, 4)
    };
  }

  // Offline / Always-On Clinical Question Resolution right inside Voice Command!
  if (isQuestionPhrase || tokens.length >= 3) {
    const canonicalLang = normalizeLanguageCode(activeLanguage);
    const offlineAnswer = runAutonomousOfflineMedicalAI(trimmed, canonicalLang)
      .replace(/[*_`#]/g, '')
      .trim();
    return {
      matched: false,
      confidence: 0,
      offlineAnswer,
      suggestions: getSmartVoiceSuggestions(trimmed, 4)
    };
  }

  if (bestIntent && bestScore >= 20) {
    recordUserInterest(bestIntent.id);
    return {
      matched: true,
      intent: bestIntent,
      confidence: Math.min(0.85, bestScore / 100),
      suggestions: getSmartVoiceSuggestions(trimmed, 4)
    };
  }

  return {
    matched: false,
    confidence: 0,
    offlineAnswer: runAutonomousOfflineMedicalAI(trimmed, normalizeLanguageCode(activeLanguage))
      .replace(/[*_`#]/g, '')
      .trim(),
    suggestions: getSmartVoiceSuggestions(trimmed, 5)
  };
}

export function getSpeechRecognitionLocale(appLang: string): string {
  const norm = normalizeLanguageCode(appLang).toLowerCase();
  if (norm.includes('swahili')) return 'sw-KE';
  if (norm.includes('french')) return 'fr-FR';
  if (norm.includes('spanish')) return 'es-ES';
  if (norm.includes('arabic')) return 'ar-SA';
  return 'en-UG';
}
