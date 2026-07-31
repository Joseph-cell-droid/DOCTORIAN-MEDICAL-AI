export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'bot';
  content: string;
  timestamp: Date;
  isError?: boolean;
}

export const DOCTORIAN_SYSTEM_INSTRUCTION = 
  "You are Doctorian Medical AI, an intelligent, empathetic medical AI assistant operating with the fluid, natural conversational persona of ChatGPT.\n\n" +
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
}

export interface ChatResponse {
  response: string;
  model?: string;
  provider?: string;
  error?: string;
}

/**
 * Modular AI Service for Doctorian Medical AI.
 * Communicates directly with local Ollama (http://localhost:11434/api/generate) using model gemma3:1b
 * when running locally in browser, or proxies through the Express backend (/api/chat).
 */
export async function sendChatMessage(options: SendMessageOptions): Promise<ChatResponse> {
  const { message, systemInstruction = DOCTORIAN_SYSTEM_INSTRUCTION } = options;

  // 1. Direct browser attempt to local Ollama (for offline or local laptop execution)
  const localOllamaUrl = "http://localhost:11434";
  const localModel = "gemma3:1b";

  try {
    const fullPrompt = `${systemInstruction}\n\nUser Query: ${message}\n\nDoctorian Medical AI:`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s fast check

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
          provider: "ollama-local-direct"
        };
      }
    }
  } catch (directErr) {
    console.log("[Doctorian AI] Direct Ollama fetch unnavigable, switching to server proxy /api/chat...");
  }

  // 2. Server proxy attempt (/api/chat)
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        prompt: message,
        systemInstruction,
        ollamaUrl: localOllamaUrl,
        ollamaModel: localModel,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.details || 
        errorData.error || 
        `HTTP Error ${response.status}: Doctorian AI service unavailable.`
      );
    }

    const data = await response.json();
    return {
      response: data.response || data.text || data.message || "No response received from Doctorian Medical AI.",
      model: data.model || localModel,
      provider: data.provider || "ollama-local",
    };
  } catch (err: any) {
    console.error("[Doctorian AI Service Error]", err);
    return {
      response: "",
      error: err.message || "Doctorian Medical AI service is currently unavailable. Please verify that Ollama is running at http://localhost:11434 with model gemma3:1b.",
    };
  }
}
