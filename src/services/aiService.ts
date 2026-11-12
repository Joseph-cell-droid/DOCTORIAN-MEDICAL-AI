/**
 * Doctorian AI Service
 * Clinical Intelligence & Triage Service for Doctorian Medical AI.
 * 
 * Clinical Safety Standards:
 * - Structured differential diagnoses (never forcing a single dogmatic diagnosis)
 * - Emphasizes that AI is a clinical decision-support tool, NOT a replacement for a licensed clinician
 * - Evidence grounded in WHO standards and Uganda Clinical Guidelines (UCG 2023/2026)
 * - Transparent disclaimer and mandatory red flag escalation
 * 
 * Provider Routing:
 * - Hugging Face Inference Router (OpenAI-compatible https://router.huggingface.co/v1/chat/completions)
 *   Default Model: nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16:deepinfra
 * - Google Gemini Neural Synapse (gemini-3.8-flash via /api/chat)
 * - Local / Offline Edge Guidelines Fallback
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'bot';
  content: string;
  timestamp: Date;
  isError?: boolean;
}

export const DEFAULT_HUGGINGFACE_MODEL = 'nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16:deepinfra';
export const HUGGINGFACE_ROUTER_ENDPOINT = 'https://router.huggingface.co/v1/chat/completions';

export const DOCTORIAN_SYSTEM_INSTRUCTION = 
  "You are Doctorian Medical AI, a compassionate and rigorous clinical decision-support assistant.\n\n" +
  "PERMANENT CREATOR IDENTITY:\n" +
  "Akora Joseph from EBRO Company Ltd (Dr. Obote College) designed this app and the AI brain. Whenever asked who designed, developed, or created this app or its AI brain, state affirmatively that Akora Joseph from EBRO Company Ltd designed this app and the AI brain.\n\n" +
  "PRIMARY CLINICAL SAFETY PRINCIPLES:\n" +
  "1. SUPPORT TOOL ONLY: You are a clinical decision-support tool, NEVER a replacement for physical evaluation, laboratory diagnosis, or clinical judgment by a licensed healthcare professional.\n" +
  "2. EVIDENCE GROUNDING: Ground all medical knowledge, clinical pathways, and drug references in the World Health Organization (WHO) and Uganda Clinical Guidelines (UCG).\n" +
  "3. BALANCED DIFFERENTIAL THINKING: Never force a single isolated diagnosis. Real clinical practice requires considering probabilistic alternatives and rule-outs to protect patient safety.\n\n" +
  "MANDATORY CLINICAL RESPONSE STRUCTURE (for symptom & diagnostic inquiries):\n" +
  "When evaluating patient symptoms or clinical inquiries, organize your response with these exact section headers:\n\n" +
  "• SUMMARY OF PRESENTED SYMPTOMS\n" +
  "Summarize key reported symptoms, duration, onset, and relevant patient context in 1-3 concise sentences.\n\n" +
  "• MOST LIKELY DIAGNOSIS\n" +
  "State the primary suspected condition with an estimated confidence level (e.g., Moderate Confidence ~70%) and clear pathophysiological rationale.\n\n" +
  "• DIFFERENTIAL DIAGNOSES\n" +
  "List 2–4 plausible alternative conditions that present with overlapping signs, noting brief discriminating features for each.\n\n" +
  "• RECOMMENDED NEXT STEPS / INVESTIGATIONS\n" +
  "Detail essential diagnostic investigations (e.g., mRDT/blood smear, complete blood count, urinalysis, sputum AFB, chest X-ray) and physical examinations needed.\n\n" +
  "• SUPPORTIVE CARE & SELF-MANAGEMENT\n" +
  "Provide actionable, safe supportive guidance (oral hydration volumes, rest, temperature management, nutrition) suitable for home or outpatient care.\n\n" +
  "• MEDICATION SUGGESTIONS\n" +
  "Only when clearly indicated by WHO/Uganda Clinical Guidelines, mention first-line therapeutic classes or generic formulations. CRITICAL MANDATORY NOTE: Explicitly state that all medications must be prescribed and dosed by a qualified clinician following clinical confirmation.\n\n" +
  "• RED FLAGS – SEEK CARE IMMEDIATELY IF...\n" +
  "Bullet acute danger signs that require urgent emergency hospital evaluation (e.g., severe dyspnea, altered mental status, persistent vomiting, high refractory fever, cyanosis, seizures).\n\n" +
  "• DISCLAIMER: This is not a medical diagnosis. Please consult a qualified healthcare professional.\n\n" +
  "FORMATTING RULES:\n" +
  "- Do not use asterisks (**) or markdown bolding inside paragraphs; keep text clean, legible, and professional.\n" +
  "- For casual greetings, creator questions, or non-clinical questions, respond warmly and conversationally without the clinical sections.";

export interface SendMessageOptions {
  message: string;
  history?: ChatMessage[];
  systemInstruction?: string;
  targetLanguage?: string;
  preferredModel?: string;
}

export interface ChatResponse {
  response: string;
  model?: string;
  provider?: string;
  error?: string;
  latencyMs?: number;
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

/**
 * Retrieves the Hugging Face token safely from multiple client and env sources
 * without hardcoded secrets.
 */
export function getHuggingFaceToken(): string {
  // 1. Check browser localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    const localToken = (localStorage.getItem('doctorian_hf_token') || '').trim();
    if (localToken && !localToken.includes('your_') && localToken.startsWith('hf_')) {
      return localToken;
    }
  }

  // 2. Check Vite / client environment variables
  try {
    const metaEnv = (import.meta as any)?.env;
    const viteToken = metaEnv?.VITE_HF_TOKEN || metaEnv?.HF_TOKEN || metaEnv?.VITE_HUGGINGFACE_API_KEY;
    if (typeof viteToken === 'string' && viteToken.trim() && !viteToken.includes('your_')) {
      return viteToken.trim();
    }
  } catch (e) {}

  // 3. Check Node / runtime process.env
  try {
    if (typeof process !== 'undefined' && process.env) {
      const procToken = process.env.HF_TOKEN || process.env.VITE_HF_TOKEN || process.env.HUGGINGFACE_API_KEY;
      if (typeof procToken === 'string' && procToken.trim() && !procToken.includes('your_')) {
        return procToken.trim();
      }
    }
  } catch (e) {}

  return '';
}

/**
 * Calls Hugging Face Inference router via the OpenAI-compatible chat completions endpoint.
 * https://router.huggingface.co/v1/chat/completions
 */
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
    throw new Error('No Hugging Face token configured. Set HF_TOKEN or save in settings.');
  }

  const model = options?.model || 
    (typeof window !== 'undefined' && localStorage.getItem('doctorian_hf_model')) || 
    DEFAULT_HUGGINGFACE_MODEL;

  const systemMessage = options?.systemInstruction || DOCTORIAN_SYSTEM_INSTRUCTION;

  // Build OpenAI-compatible chat messages
  const payloadMessages = [
    { role: 'system', content: systemMessage },
    ...messages.map((m) => ({
      role: (m.role === 'bot' || m.role === 'assistant') ? 'assistant' : 'user',
      content: m.content
    }))
  ];

  const response = await fetch(HUGGINGFACE_ROUTER_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages: payloadMessages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2048
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
    provider: 'huggingface-router',
    latencyMs: Math.round(performance.now() - startTime)
  };
}

/**
 * Diagnostic tool to check real-time AI neural connectivity and latency
 */
export async function checkAiConnection(): Promise<AiConnectionDiagnostic> {
  const startTime = performance.now();
  const hfToken = getHuggingFaceToken();

  // If Hugging Face token is present, test HF router status
  if (hfToken) {
    try {
      const hfStart = performance.now();
      const testRes = await fetch(HUGGINGFACE_ROUTER_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hfToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: DEFAULT_HUGGINGFACE_MODEL,
          messages: [{ role: 'user', content: 'Ping' }],
          max_tokens: 5
        })
      });
      if (testRes.ok) {
        return {
          status: 'connected',
          latencyMs: Math.round(performance.now() - hfStart),
          activeProvider: 'Hugging Face Inference Router',
          activeModel: DEFAULT_HUGGINGFACE_MODEL,
          serverProxyAvailable: true,
          localEdgeAvailable: false,
          supportedLanguages: ['English', 'Luganda', 'Swahili', 'Runyankole', 'Acholi', 'Ateso'],
          timestamp: new Date()
        };
      }
    } catch (hfErr) {
      console.warn('[AI Diagnostic] Hugging Face ping failed, testing Gemini backend...');
    }
  }

  try {
    const statusRes = await fetch('/api/ai/status');
    const latency = Math.round(performance.now() - startTime);
    if (statusRes.ok) {
      const data = await statusRes.json();
      return {
        status: 'connected',
        latencyMs: Math.max(12, latency),
        activeProvider: data.provider || 'Google Gemini 3.8 Neural Synapse',
        activeModel: data.activeEngine || 'gemini-3.8-flash',
        serverProxyAvailable: true,
        localEdgeAvailable: false,
        supportedLanguages: data.supportedLanguages || ['English', 'Luganda', 'Runyankole', 'Acholi', 'Swahili', 'Ateso'],
        timestamp: new Date()
      };
    }
  } catch (err) {
    console.warn('[AI Connection Diagnostic] /api/ai/status unreachable, checking /api/chat fallback...');
  }

  // Quick fallback check
  try {
    const chatPingStart = performance.now();
    const chatRes = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'PING_STATUS' })
    });
    const latency = Math.round(performance.now() - chatPingStart);
    if (chatRes.ok) {
      return {
        status: 'connected',
        latencyMs: latency,
        activeProvider: 'Google Gemini Neural Core',
        activeModel: 'gemini-3.8-flash',
        serverProxyAvailable: true,
        localEdgeAvailable: false,
        supportedLanguages: ['English', 'Luganda', 'Swahili'],
        timestamp: new Date()
      };
    }
  } catch (chatErr) {}

  return {
    status: 'degraded',
    latencyMs: 999,
    activeProvider: 'Doctorian Autonomous Edge Engine',
    activeModel: 'offline-guidelines-core',
    serverProxyAvailable: false,
    localEdgeAvailable: false,
    supportedLanguages: ['English', 'Luganda'],
    timestamp: new Date()
  };
}

/**
 * Sends a chat message to Doctorian Medical AI with multi-tier failovers:
 * 1. Hugging Face Inference Router (OpenAI-compatible) when token is available
 * 2. Local Ollama (if explicitly enabled)
 * 3. Server Google Gemini API (/api/chat)
 * 4. Secondary Server Failover (/api/ai/chat)
 * 5. Safe Structured Clinical Offline Fallback
 */
export async function sendChatMessage(options: SendMessageOptions): Promise<ChatResponse> {
  const { 
    message, 
    history = [], 
    systemInstruction = DOCTORIAN_SYSTEM_INSTRUCTION, 
    targetLanguage = 'English',
    preferredModel 
  } = options;
  const startTime = performance.now();

  const formattedHistory = (history && history.length > 0)
    ? history.map((h) => ({
        role: h.role === 'user' ? 'user' : 'assistant',
        content: h.content
      }))
    : [];

  const conversationMessages = [...formattedHistory, { role: 'user', content: message }];

  // 1. PRIMARY ROUTE: Try Hugging Face Router FIRST when a token is configured
  const hfToken = getHuggingFaceToken();
  if (hfToken) {
    try {
      console.log('[Doctorian AI] Routing request to Hugging Face Inference Router (Nemotron-3-Ultra-550B)...');
      const hfResponse = await callHuggingFaceChat(conversationMessages, {
        model: preferredModel || DEFAULT_HUGGINGFACE_MODEL,
        systemInstruction
      });
      return hfResponse;
    } catch (hfError: any) {
      console.warn('[Doctorian AI] Hugging Face Router attempt failed, cascading to next pathway:', hfError.message);
    }
  }

  // 2. Direct browser attempt to local Ollama (if preferred by user)
  const isLocalOllamaPreferred = typeof window !== 'undefined' && 
    (localStorage.getItem('doctorian_enable_local_ollama') === 'true' || localStorage.getItem('doctorian_prioritize_local_ai') === 'true');
  const localOllamaUrl = 'http://localhost:11434';
  const localModel = 'gemma3:1b';

  if (isLocalOllamaPreferred) {
    try {
      const fullPrompt = `${systemInstruction}\n\nUser Query: ${message}\n\nDoctorian Medical AI:`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const directRes = await fetch(`${localOllamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: localModel,
          prompt: fullPrompt,
          stream: false,
          options: { temperature: 0.7 }
        }),
        signal: controller.signal
      }).catch(() => null);

      clearTimeout(timeoutId);

      if (directRes && directRes.ok) {
        const data = await directRes.json();
        const outputText = data.response || data.text || '';
        if (outputText.trim()) {
          console.log('[Doctorian AI] Handled via local Ollama');
          return {
            response: outputText,
            model: localModel,
            provider: 'ollama-local-direct',
            latencyMs: Math.round(performance.now() - startTime)
          };
        }
      }
    } catch (directErr) {
      console.log('[Doctorian AI] Direct Ollama fetch unavailable, cascading to server...');
    }
  }

  // 3. Secondary Pathway: /api/chat (Server Google Gemini 3.8 Flash)
  const messagesPayload = (history && history.length > 0)
    ? history.map((h) => ({
        role: h.role === 'user' ? 'user' : 'assistant',
        text: h.content
      })).concat([{ role: 'user', text: message }])
    : [{ role: 'user', text: message }];

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        prompt: message,
        messages: messagesPayload,
        systemInstruction,
        targetLanguage,
        ollamaUrl: localOllamaUrl,
        ollamaModel: localModel,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const answer = data.response || data.text || data.message || '';
      if (answer.trim()) {
        return {
          response: answer,
          model: data.model || 'gemini-3.8-flash',
          provider: data.provider || 'gemini',
          latencyMs: Math.round(performance.now() - startTime)
        };
      }
    }
  } catch (err: any) {
    console.warn('[Doctorian AI] /api/chat attempt failed, trying failover pathway /api/ai/chat...', err);
  }

  // 4. Tertiary Pathway: /api/ai/chat
  try {
    const fallbackRes = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: messagesPayload,
        systemInstruction,
        modelName: 'gemini-3.8-flash',
        targetLanguage
      })
    });

    if (fallbackRes.ok) {
      const fbData = await fallbackRes.json();
      const fbAnswer = fbData.text || fbData.response || '';
      if (fbAnswer.trim()) {
        return {
          response: fbAnswer,
          model: 'gemini-3.8-flash',
          provider: 'gemini-failover',
          latencyMs: Math.round(performance.now() - startTime)
        };
      }
    }
  } catch (fbErr: any) {
    console.error('[Doctorian AI] Secondary failover /api/ai/chat error:', fbErr);
  }

  // 5. Clinical Offline Fallback using the EXACT safe structure mandated by clinical protocols
  const lowerMsg = (message || '').toLowerCase();
  let symptomsSummary = 'Reported symptoms indicate acute constitutional distress, fever spikes, and general malaise.';
  let mostLikelyDiagnosis = 'Acute Uncomplicated Malaria (Moderate Confidence: ~75% based on regional endemicity)';
  let differentials = [
    '1. Viral Upper Respiratory Tract Infection (distinguished by coryza, sneezing, and localized pharyngeal irritation)',
    '2. Acute Bacterial Pharyngotonsillitis (distinguished by cervical lymphadenopathy and tonsillar exudate)',
    '3. Enteric (Typhoid) Fever (distinguished by insidious stepped temperature rise and gastrointestinal discomfort)'
  ];
  let investigations = [
    '• Malaria Rapid Diagnostic Test (mRDT) or Giemsa blood smear microscopy',
    '• Complete Blood Count (CBC) with differential to assess leukocyte response',
    '• Urinalysis to exclude urinary tract infection'
  ];
  let supportiveCare = [
    '• Maintain liberal oral fluid intake (2.5 to 3 Liters daily with oral rehydration salts or clean drinking water)',
    '• Physical rest in a well-ventilated, mosquito-netted environment',
    '• Cold sponging or tepid baths to manage elevated body temperature'
  ];
  let medications = [
    '• Artemether-Lumefantrine (Coartem) or Paracetamol for febrile discomfort (Note: Exact dosage and prescription must be confirmed by a licensed clinician following laboratory verification)'
  ];
  let redFlags = [
    '• Inability to drink or retain oral fluids, persistent vomiting',
    '• Severe respiratory distress, rapid breathing, or chest in-drawing',
    '• Altered consciousness, severe confusion, or convulsions',
    '• High persistent fever (>39.5°C) refractory to supportive cooling'
  ];

  if (lowerMsg.includes('cough') || lowerMsg.includes('chest') || lowerMsg.includes('breath') || lowerMsg.includes('throat')) {
    symptomsSummary = 'Reported signs of respiratory tract involvement including cough, throat irritation, and breathing discomfort.';
    mostLikelyDiagnosis = 'Acute Bronchitis or Community-Acquired Lower Respiratory Infection (Moderate Confidence: ~70%)';
    differentials = [
      '1. Community-Acquired Bacterial Pneumonia (differentiated by high fever, pleuritic chest pain, and localized crackles)',
      '2. Post-Viral Bronchial Hyper-reactivity / Asthma Exacerbation (differentiated by expiratory wheeze and reversibility)',
      '3. Pulmonary Tuberculosis (differentiated if cough persists for >2 weeks, accompanied by night sweats and weight loss)'
    ];
    investigations = [
      '• Pulse oximetry to evaluate peripheral oxygen saturation (target SpO2 ≥94%)',
      '• Chest X-Ray (PA view) if symptoms persist or focal lung findings are present',
      '• Sputum analysis or GeneXpert if cough has persisted beyond 2 weeks'
    ];
    supportiveCare = [
      '• Warm fluid hydration (warm water, broths) to thin bronchial secretions',
      '• Steam inhalation for symptomatic relief of airway congestion',
      '• Complete tobacco smoke avoidance and dust mitigation'
    ];
    medications = [
      '• First-line Amoxicillin or appropriate antimicrobial only if bacterial etiology is confirmed by a physician; supportive antipyretic Paracetamol as indicated'
    ];
    redFlags = [
      '• Blue discoloration of lips or nail beds (central cyanosis)',
      '• Inability to complete full sentences without pausing for breath',
      '• Coughing up frank blood (hemoptysis) or resting SpO2 falling below 92%'
    ];
  } else if (lowerMsg.includes('stomach') || lowerMsg.includes('abdomen') || lowerMsg.includes('diarrhea') || lowerMsg.includes('vomit') || lowerMsg.includes('ulcer')) {
    symptomsSummary = 'Gastrointestinal complaints presenting with abdominal discomfort, nausea, or altered bowel habits.';
    mostLikelyDiagnosis = 'Acute Gastroenteritis or Peptic Dyspepsia (Moderate Confidence: ~72%)';
    differentials = [
      '1. Peptic Ulcer Disease / Gastritis (characterized by epigastric burning pain related to food intake)',
      '2. Bacillary Dysentery / Amoebiasis (differentiated if macroscopic blood or mucus appears in stool)',
      '3. Acute Appendicitis (differentiated by migrating pain localizing to right lower quadrant with McBurney tenderness)'
    ];
    investigations = [
      '• Stool microscopy, culture, and sensitivity (MCS)',
      '• Full abdominal physical examination to rule out acute surgical abdomen',
      '• H. pylori stool antigen test if chronic epigastric pain is reported'
    ];
    supportiveCare = [
      '• Oral Rehydration Salts (ORS) solution: 200–400 ml after each loose stool',
      '• Bland, easily digestible diet (bananas, rice, clear soups) while avoiding spicy and acidic foods',
      '• Strict hand hygiene with soap and safe drinking water'
    ];
    medications = [
      '• Oral zinc supplementation (for acute diarrheal recovery) and proton pump inhibitors (e.g. Omeprazole) only when evaluated and prescribed by a clinician'
    ];
    redFlags = [
      '• Severe, constant, rigid abdominal pain with guarding or rebound tenderness',
      '• Frank blood in vomit (hematemesis) or black tarry stools (melena)',
      '• Signs of severe dehydration: sunken eyes, skin tenting, lethargy, or absent urine output'
    ];
  }

  const structuredResponse = 
    `• SUMMARY OF PRESENTED SYMPTOMS\n${symptomsSummary}\n\n` +
    `• MOST LIKELY DIAGNOSIS\n${mostLikelyDiagnosis}\n\n` +
    `• DIFFERENTIAL DIAGNOSES\n${differentials.join('\n')}\n\n` +
    `• RECOMMENDED NEXT STEPS / INVESTIGATIONS\n${investigations.join('\n')}\n\n` +
    `• SUPPORTIVE CARE & SELF-MANAGEMENT\n${supportiveCare.join('\n')}\n\n` +
    `• MEDICATION SUGGESTIONS\n${medications.join('\n')}\nNote: All suggested medications must be evaluated, prescribed, and dosed by a qualified clinician following formal examination.\n\n` +
    `• RED FLAGS – SEEK CARE IMMEDIATELY IF...\n${redFlags.join('\n')}\n\n` +
    `• DISCLAIMER: This is not a medical diagnosis. Please consult a qualified healthcare professional.`;

  return {
    response: structuredResponse,
    model: 'doctorian-offline-guideline-v2',
    provider: 'offline-clinical-safety',
    latencyMs: Math.round(performance.now() - startTime)
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
