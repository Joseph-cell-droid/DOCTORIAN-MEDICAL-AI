/**
 * Doctorian AI Service
 * Clinical Intelligence & Decision-Support Service for Doctorian AI (Uganda & East Africa).
 *
 * Clinical Safety Standards:
 * - Never presents an AI-generated suggestion as a confirmed medical diagnosis
 * - Never invents confidence percentages or numerical diagnostic scores
 * - Clearly distinguishes possible differential considerations from confirmed clinical diagnoses
 * - Grounded in World Health Organization (WHO) and Uganda Clinical Guidelines (UCG 2023)
 * - Structured 10-section clinical format tailored to user role
 */

import { searchGuidelines, ClinicalGuidelineEntry } from '../data/ugandaGuidelinesCorpus';

export type ClinicalSpecialistMode =
  | 'Primary Care'
  | 'Emergency Triage'
  | 'Infectious Diseases'
  | 'Maternal & Reproductive'
  | 'Pediatrics'
  | 'Cardiology & NCDs'
  | 'Pharmacology & Rx'
  | 'Laboratory Diagnostics';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'bot';
  content: string;
  timestamp: Date;
  isError?: boolean;
  citations?: ClinicalGuidelineEntry[];
  outdatedWarnings?: string[];
}

export const DEFAULT_HUGGINGFACE_MODEL = 'nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16:deepinfra';
export const HUGGINGFACE_ROUTER_ENDPOINT = 'https://router.huggingface.co/v1/chat/completions';

export const DOCTORIAN_SYSTEM_INSTRUCTION = [
  'You are Doctorian AI, a clinical decision-support and healthcare information assistant for patients, clinicians, nurses, and health workers in Uganda and East Africa.',
  '',
  'CLINICAL SAFETY RULES:',
  '1. Support Tool Only: You provide healthcare information and clinical decision support. You do NOT replace professional medical judgment, physical examination, laboratory confirmation, or a licensed clinician.',
  '2. Never Confirm Diagnoses: Never present any AI-generated possibility as a confirmed diagnosis. Always distinguish possible differential explanations from a clinician-confirmed diagnosis.',
  '3. No Fabricated Confidence Scores: Do NOT invent confidence percentages (e.g., ~75%, 80% sure) or numerical diagnostic scores.',
  '4. Evidence Grounding: Ground recommendations in World Health Organization (WHO) standards and the Uganda Clinical Guidelines (UCG 2023).',
  '5. Urgent Triage Priority: Identify emergency red flags immediately and advise urgent in-person care when danger signs are present.',
  '',
  'MANDATORY 10-SECTION RESPONSE FORMAT (for symptom and diagnostic questions):',
  '1. Summary of the Reported Symptoms',
  '2. Relevant Information Missing from the History',
  '3. Possible Explanations or Differential Diagnoses',
  '4. Clinical Urgency and Recommended Next Steps',
  '5. Suggested Investigations for Clinician Consideration',
  '6. Supportive Care and Patient Education',
  '7. Medication Information (where supported by WHO / Uganda Clinical Guidelines; clearly state that a qualified clinician must prescribe and dose)',
  '8. Emergency Warning Signs (Seek Care Immediately If...)',
  '9. Evidence Sources and Guideline References',
  '10. Clinical Safety Disclaimer: Doctorian AI provides healthcare information and clinical decision support. It does not replace professional medical judgment, physical examination, or diagnosis by a qualified healthcare professional. In an emergency, seek immediate medical attention.',
  '',
  'Formatting: Write in clean, structured plain prose with numbered headings. Avoid markdown asterisk clutter.'
].join('\n');

export interface SendMessageOptions {
  message: string;
  history?: ChatMessage[];
  systemInstruction?: string;
  targetLanguage?: string;
  preferredModel?: string;
  specialty?: ClinicalSpecialistMode | string;
  userRole?: string;
}

export interface ChatResponse {
  response: string;
  model?: string;
  provider?: string;
  error?: string;
  latencyMs?: number;
  citations?: ClinicalGuidelineEntry[];
  outdatedWarnings?: string[];
}

export interface AiConnectionDiagnostic {
  status: 'connected' | 'degraded' | 'offline';
  latencyMs: number;
  activeProvider: string;
  activeModel: string;
  serverProxyAvailable: boolean;
  localEdgeAvailable: boolean;
  supportedLanguages: string[];
  timestamp: Date;
}

export function getHuggingFaceToken(): string {
  if (typeof window !== 'undefined' && window.localStorage) {
    const localToken = (localStorage.getItem('doctorian_hf_token') || '').trim();
    if (localToken && !localToken.includes('your_') && localToken.startsWith('hf_')) {
      return localToken;
    }
  }

  try {
    const metaEnv = (import.meta as any)?.env;
    const viteToken = metaEnv?.VITE_HF_TOKEN || metaEnv?.HF_TOKEN || metaEnv?.VITE_HUGGINGFACE_API_KEY;
    if (typeof viteToken === 'string' && viteToken.trim() && !viteToken.includes('your_')) {
      return viteToken.trim();
    }
  } catch {
    // ignore
  }

  return '';
}

export async function callHuggingFaceChat(
  messages: Array<{ role: string; content: string }>,
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    systemInstruction?: string;
  }
): Promise<ChatResponse> {
  const startTime = performance.now();
  const token = getHuggingFaceToken();

  if (!token) {
    throw new Error('No Hugging Face token configured.');
  }

  const model =
    options?.model ||
    (typeof window !== 'undefined' && localStorage.getItem('doctorian_hf_model')) ||
    DEFAULT_HUGGINGFACE_MODEL;

  const systemMessage = options?.systemInstruction || DOCTORIAN_SYSTEM_INSTRUCTION;

  const payloadMessages = [
    { role: 'system', content: systemMessage },
    ...messages.map((m) => ({
      role: m.role === 'bot' || m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content
    }))
  ];

  const response = await fetch(HUGGINGFACE_ROUTER_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages: payloadMessages,
      temperature: options?.temperature ?? 0.25,
      max_tokens: options?.maxTokens ?? 1600
    })
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Hugging Face Router error (${response.status}): ${errorText || response.statusText}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content || '';

  if (!text) {
    throw new Error('Hugging Face Router returned empty message content.');
  }

  return {
    response: text,
    model,
    provider: 'Hugging Face Router',
    latencyMs: Math.round(performance.now() - startTime)
  };
}

export async function checkAiConnection(): Promise<AiConnectionDiagnostic> {
  const startTime = performance.now();
  try {
    const statusRes = await fetch('/api/ai/status', { credentials: 'include' });
    const latency = Math.round(performance.now() - startTime);
    if (statusRes.ok) {
      const data = await statusRes.json();
      return {
        status: data.status === 'connected' ? 'connected' : 'degraded',
        latencyMs: Math.max(10, latency),
        activeProvider: data.huggingfaceConfigured
          ? 'Hugging Face Router / Server Clinical AI'
          : data.geminiConfigured
          ? 'Server Clinical AI (Gemini)'
          : 'Uganda Clinical Guidelines Offline Engine',
        activeModel: data.huggingfaceConfigured ? data.huggingfaceModel : data.geminiModel || 'ucg-2023-rag',
        serverProxyAvailable: true,
        localEdgeAvailable: true,
        supportedLanguages: ['English (US)', 'Swahili', 'Luganda', 'Runyankole-Rukiga', 'Acholi-Luo'],
        timestamp: new Date()
      };
    }
  } catch {
    // offline
  }

  return {
    status: 'offline',
    latencyMs: 0,
    activeProvider: 'Offline Clinical Guidelines Fallback',
    activeModel: 'ucg-2023-offline',
    serverProxyAvailable: false,
    localEdgeAvailable: true,
    supportedLanguages: ['English (US)', 'Swahili', 'Luganda'],
    timestamp: new Date()
  };
}

function buildLocalOfflineClinicalResponse(
  message: string,
  userRole: string,
  citations: ClinicalGuidelineEntry[]
): string {
  const top = citations[0];
  const diffLines = citations.length
    ? citations.map((c) => `- ${c.condition} (${c.section}): ${c.summary}`).join('\n')
    : '- Acute undifferentiated illness requiring clinical history, physical examination, and baseline vital signs.';
  const invLines = top?.investigations.length
    ? top.investigations.map((i) => `- ${i}`).join('\n')
    : '- Full set of vital signs (BP, HR, Temp, RR, SpO2), Malaria RDT, urinalysis, and clinician-directed blood tests.';
  const supportLines = top?.supportiveCare.length
    ? top.supportiveCare.map((s) => `- ${s}`).join('\n')
    : '- Maintain oral hydration, adequate rest, and close monitoring of symptom changes.';
  const medLines = top?.firstLineCare.length
    ? top.firstLineCare.map((m) => `- ${m}`).join('\n')
    : '- Do not start leftover or unprescribed antimicrobials prior to clinician assessment.';
  const redFlagLines = top?.redFlags.length
    ? top.redFlags.map((r) => `- ${r}`).join('\n')
    : '- Difficulty breathing, chest pain, altered consciousness, persistent vomiting, seizures, or severe bleeding.';
  const sourceLines = citations.length
    ? citations.map((c) => `- ${c.source} — ${c.section} (${c.year})`).join('\n')
    : '- World Health Organization (WHO) & Uganda Clinical Guidelines (UCG 2023)';

  return [
    '1. Summary of the Reported Symptoms',
    `Submitted query (${userRole} view): "${message.trim()}". Generated using offline Uganda Clinical Guidelines reference.`,
    '',
    '2. Relevant Information Missing from the History',
    '- Onset and duration of symptoms, measured temperature/BP/SpO2, pregnancy status if applicable, known allergies, and chronic medical history.',
    '',
    '3. Possible Explanations or Differential Diagnoses',
    'Possible considerations for clinician evaluation (not a confirmed diagnosis):',
    diffLines,
    '',
    '4. Clinical Urgency and Recommended Next Steps',
    'Seek in-person examination at a qualified clinic or hospital (Health Centre III/IV or Hospital) for formal triage and diagnostic testing. Go immediately to an emergency department if any red flag signs occur.',
    '',
    '5. Suggested Investigations for Clinician Consideration',
    invLines,
    '',
    '6. Supportive Care and Patient Education',
    supportLines,
    '',
    '7. Medication Information',
    medLines,
    'A qualified clinician must confirm the diagnosis and prescribe exact dosages.',
    '',
    '8. Emergency Warning Signs',
    redFlagLines,
    '',
    '9. Evidence Sources and Guideline References',
    sourceLines,
    '',
    '10. Clinical Safety Disclaimer',
    'Doctorian AI provides healthcare information and clinical decision support. It does not replace professional medical judgment, physical examination, or diagnosis by a qualified healthcare professional. In an emergency, seek immediate medical attention.'
  ].join('\n');
}

export async function sendChatMessage(options: SendMessageOptions): Promise<ChatResponse> {
  const {
    message,
    history = [],
    systemInstruction = DOCTORIAN_SYSTEM_INSTRUCTION,
    targetLanguage = 'English (US)',
    preferredModel,
    specialty = 'Primary Care',
    userRole = 'patient'
  } = options;
  const startTime = performance.now();
  const matchedGuidelines = searchGuidelines(message, 3);
  const outdatedWarnings = matchedGuidelines
    .filter((g) => g.year < 2022)
    .map((g) => `${g.condition} (${g.year}) should be verified against current Ministry of Health guidance.`);

  // 1. If user explicitly saved a Hugging Face token locally, try HF Router first
  const hfToken = getHuggingFaceToken();
  if (hfToken) {
    try {
      const conversationMessages = [
        ...history.slice(-8).map((h) => ({
          role: h.role === 'user' ? 'user' : 'assistant',
          content: h.content
        })),
        { role: 'user', content: `[Role: ${userRole} | Specialty: ${specialty} | Language: ${targetLanguage}]\n${message}` }
      ];
      const hfRes = await callHuggingFaceChat(conversationMessages, {
        model: preferredModel || DEFAULT_HUGGINGFACE_MODEL,
        systemInstruction
      });
      return {
        ...hfRes,
        citations: matchedGuidelines,
        outdatedWarnings
      };
    } catch (hfErr) {
      console.warn('[Doctorian AI] Browser HF route failed, falling back to server API:', hfErr);
    }
  }

  // 2. Server-side RAG + Gemini / HF endpoint (/api/chat)
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        message,
        history: history.slice(-8).map((h) => ({
          role: h.role === 'user' ? 'user' : 'assistant',
          content: h.content
        })),
        specialty,
        targetLanguage,
        userRole
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.response) {
        return {
          response: data.response,
          model: data.model || 'gemini-4-hydrogen',
          provider: data.provider || 'Doctorian Clinical Cloud',
          latencyMs: Math.round(performance.now() - startTime),
          citations: data.citations || matchedGuidelines,
          outdatedWarnings: data.outdatedWarnings || outdatedWarnings
        };
      }
    }
  } catch (err) {
    console.warn('[Doctorian AI] Server /api/chat unavailable, using offline guideline fallback:', err);
  }

  // 3. Offline Structured UCG Fallback
  return {
    response: buildLocalOfflineClinicalResponse(message, userRole, matchedGuidelines),
    model: 'ucg-2023-offline',
    provider: 'Uganda Clinical Guidelines Offline Engine',
    latencyMs: Math.round(performance.now() - startTime),
    citations: matchedGuidelines,
    outdatedWarnings
  };
}

export default {
  sendChatMessage,
  callHuggingFaceChat,
  checkAiConnection,
  getHuggingFaceToken,
  DOCTORIAN_SYSTEM_INSTRUCTION,
  DEFAULT_HUGGINGFACE_MODEL,
  HUGGINGFACE_ROUTER_ENDPOINT
};
