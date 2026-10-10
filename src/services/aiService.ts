export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'bot';
  content: string;
  timestamp: Date;
  isError?: boolean;
}

export const DOCTORIAN_SYSTEM_INSTRUCTION = 
  "You are Doctorian Medical AI, an intelligent, empathetic medical AI assistant operating with the fluid, natural conversational persona of ChatGPT.\n\n" +
  "PERMANENT CREATOR & SYSTEM IDENTITY:\n" +
  "Akora Joseph from EBRO Company. ltd designed this app and the AI brain. If any user asks who made, designed, developed, or built this app or its AI brain, you must state permanently, clearly, and affirmatively that Akora Joseph from EBRO Company. ltd designed this app and the AI brain.\n\n" +
  "CRITICAL BEHAVIORAL PROTOCOL:\n" +
  "1. CONVERSATIONAL FLOW (CHATGPT STYLE): Answer questions naturally, directly, and fluidly. Do NOT output repetitive boilerplate headings for every simple response or greeting. Provide clear, well-explained answers in standard conversational markdown.\n" +
  "2. SELECTIVE HEADINGS FOR ANALYSIS ONLY: Include bold section headings (e.g. '### Clinical Analysis', '### Pathophysiology', '### Recommended Action') ONLY when performing explicit clinical analysis, diagnostic symptom evaluations, or complex lab/vital data breakdowns.\n" +
  "3. MARKDOWN TABLES ON DEMAND OR COMPARISON: Whenever the user requests a table (or when comparing drugs, vitals baselines, or clinical options), construct clean Markdown tables (e.g., | Parameter | Detail | Baseline |).\n" +
  "4. INTERACTIVE FOLLOW-UP QUESTIONS AT END: At the very end of EVERY response, ALWAYS ask 1 or 2 relevant, thoughtful follow-up questions to engage the user, clarify their health context, or guide their next step (e.g., 'Would you like a detailed comparison table of these treatment options, or are you experiencing any other symptoms?').\n" +
  "5. MEDICAL SAFETY: Provide professional guidance, explain clinical reasoning clearly, acknowledge uncertainty when data is limited, and encourage users to consult qualified healthcare professionals when appropriate.";

export interface SendMessageOptions {
  message: string;
  history?: ChatMessage[];
  systemInstruction?: string;
  targetLanguage?: string;
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
 * Diagnostic tool to check real-time AI neural connectivity and latency
 */
export async function checkAiConnection(): Promise<AiConnectionDiagnostic> {
  const startTime = performance.now();
  try {
    const statusRes = await fetch('/api/ai/status');
    const latency = Math.round(performance.now() - startTime);
    if (statusRes.ok) {
      const data = await statusRes.json();
      return {
        status: 'connected',
        latencyMs: Math.max(12, latency),
        activeProvider: data.provider || 'Google Gemini 3.7 Neural Synapse',
        activeModel: data.activeEngine || 'gemini-3.7-flash',
        serverProxyAvailable: true,
        localEdgeAvailable: false,
        supportedLanguages: data.supportedLanguages || ['English', 'Luganda', 'Runyankole', 'Acholi', 'Swahili', 'Ateso'],
        timestamp: new Date()
      };
    }
  } catch (err) {
    console.warn("[AI Connection Diagnostic] /api/ai/status unreachable, checking /api/chat fallback...");
  }

  // Quick fallback check
  try {
    const chatPingStart = performance.now();
    const chatRes = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: "PING_STATUS" })
    });
    const latency = Math.round(performance.now() - chatPingStart);
    if (chatRes.ok) {
      return {
        status: 'connected',
        latencyMs: latency,
        activeProvider: 'Google Gemini Neural Core',
        activeModel: 'gemini-3.7-flash',
        serverProxyAvailable: true,
        localEdgeAvailable: false,
        supportedLanguages: ['English', 'Luganda', 'Swahili'],
        timestamp: new Date()
      };
    }
  } catch (chatErr) {
    // Both failed
  }

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
 * Modular AI Service for Doctorian Medical AI.
 * Communicates with the Google Gemini Neural Core via Express backend (/api/chat & /api/ai/chat)
 * with multi-turn conversation memory, fast local edge checks, and robust multi-tier failovers.
 */
export async function sendChatMessage(options: SendMessageOptions): Promise<ChatResponse> {
  const { message, history = [], systemInstruction = DOCTORIAN_SYSTEM_INSTRUCTION, targetLanguage = "English" } = options;
  const startTime = performance.now();

  // 1. Direct browser attempt to local Ollama (only if explicitly enabled by user)
  const isLocalOllamaPreferred = typeof window !== 'undefined' && 
    (localStorage.getItem('doctorian_enable_local_ollama') === 'true' || localStorage.getItem('doctorian_prioritize_local_ai') === 'true');
  const localOllamaUrl = "http://localhost:11434";
  const localModel = "gemma3:1b";

  if (isLocalOllamaPreferred) {
    try {
      const fullPrompt = `${systemInstruction}\n\nUser Query: ${message}\n\nDoctorian Medical AI:`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s fast check

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
        const outputText = data.response || data.text || "";
        if (outputText.trim()) {
          console.log("[Doctorian AI] Successfully fetched directly from local Ollama (gemma3:1b)");
          return {
            response: outputText,
            model: localModel,
            provider: "ollama-local-direct",
            latencyMs: Math.round(performance.now() - startTime)
          };
        }
      }
    } catch (directErr) {
      console.log("[Doctorian AI] Direct Ollama fetch unavailable, switching to server proxy /api/chat...");
    }
  }

  // Format multi-turn conversation history for context preservation
  const messagesPayload = (history && history.length > 0)
    ? history.map(h => ({
        role: (h.role === 'user') ? 'user' : 'assistant',
        text: h.content
      })).concat([{ role: 'user', text: message }])
    : [{ role: 'user', text: message }];

  // 2. Primary Server Pathway: /api/chat (Powered by Google Gemini 3.7 Flash)
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
      const answer = data.response || data.text || data.message || "";
      if (answer.trim()) {
        return {
          response: answer,
          model: data.model || "gemini-3.7-flash",
          provider: data.provider || "gemini",
          latencyMs: Math.round(performance.now() - startTime)
        };
      }
    }
  } catch (err: any) {
    console.warn("[Doctorian AI] /api/chat attempt failed, trying failover pathway /api/ai/chat...", err);
  }

  // 3. Secondary Failover Pathway: /api/ai/chat
  try {
    const fallbackRes = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: messagesPayload,
        systemInstruction,
        modelName: "gemini-3.7-flash",
        targetLanguage
      })
    });

    if (fallbackRes.ok) {
      const fbData = await fallbackRes.json();
      const fbAnswer = fbData.text || fbData.response || "";
      if (fbAnswer.trim()) {
        return {
          response: fbAnswer,
          model: "gemini-3.7-flash",
          provider: "gemini-failover",
          latencyMs: Math.round(performance.now() - startTime)
        };
      }
    }
  } catch (fbErr: any) {
    console.error("[Doctorian AI] Secondary failover /api/ai/chat error:", fbErr);
  }

  // 4. Clinical Offline Fallback Guidance
  return {
    response: `### Clinical Intelligence Notice\n\nDoctorian Medical AI is currently operating in **Autonomous Offline Safety Mode**. While connecting to the cloud neural core, here is evidence-based clinical guidance regarding your query:\n\n- **Immediate Priority**: For acute severe symptoms (chest pain, severe dyspnea, sudden neurological deficit, severe uncontrolled bleeding, or high fever with altered mentation), proceed directly to the nearest emergency health facility (Mulago, Mbarara, or your designated Regional Referral Hospital).\n- **Query Recorded**: "${message}"\n- **Regional Triage Helpline**: Contact Uganda Emergency Medical Services or Ministry of Health toll-free helpline.`,
    model: "doctorian-offline-guideline-v1",
    provider: "offline-triage",
    latencyMs: Math.round(performance.now() - startTime)
  };
}
