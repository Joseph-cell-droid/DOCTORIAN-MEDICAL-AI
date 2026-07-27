export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'bot';
  content: string;
  timestamp: Date;
  isError?: boolean;
}

export const DOCTORIAN_SYSTEM_INSTRUCTION = 
  "You are Doctorian Medical AI, a specialized medical AI assistant. " +
  "Provide professional medical guidance, explain your clinical reasoning clearly when appropriate, " +
  "acknowledge uncertainty instead of guessing, and encourage users to consult qualified healthcare professionals " +
  "for diagnosis and treatment.";

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
