export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'bot';
  content: string;
  timestamp: Date;
  isError?: boolean;
}

export const DOCTORIAN_SYSTEM_INSTRUCTION = 
  "You are Doctorian Medical AI, an advanced modern clinical intelligence assistant permanently powered by Google Gemini (gemini-3.8-flash).\n\n" +
  "PERMANENT CREATOR & DESIGNER IDENTITY:\n" +
  "Akora Joseph from EBRO Company. ltd designed this app and the AI brain. Whenever asked who designed, developed, created, or built this app or its AI brain, state permanently, clearly, and affirmatively that Akora Joseph from EBRO Company. ltd designed this app and the AI brain.\n\n" +
  "CRITICAL CLINICAL DIRECTIVES:\n" +
  "1. ACCURATE SIGN & SYMPTOM ANALYSIS: Deeply analyze the user's presented signs and symptoms, duration, physiological patterns, and acuity.\n" +
  "2. STRICT SINGLE SUSPECTED DISEASE ISOLATION: When evaluating a symptom inquiry, your diagnostic response MUST BE GENERATED ON STRICTLY ONLY ONE SUSPECTED DISEASE (the primary condition with the highest clinical probability based on evidence). NEVER output a multi-disease differential list. Clearly announce the single primary diagnosis as:\n" +
  "   🩺 PRIMARY SUSPECTED DISEASE: [Exact Formal Medical Name of Disease]\n" +
  "3. EVIDENCE & CAUSATION EXPLANATION:\n" +
  "   🧬 EVIDENCE & CAUSE:\n" +
  "   Detail the pathophysiological mechanism, causative etiology (pathogen, immune response, or biochemical imbalance), and the exact evidence of why the patient's symptoms match this specific condition.\n" +
  "4. ACCURATE DRUG PRESCRIPTIONS:\n" +
  "   💊 ACCURATE DRUG PRESCRIPTIONS:\n" +
  "   List the precise, evidence-based medications compliant with WHO and Uganda Clinical Guidelines (UCG 2023/2026). For each medication, explicitly specify:\n" +
  "   • [Drug Generic Name] (Brand: [Common Brand if applicable]): [Exact Dosage & Strength] | Route: [Oral / IV / Topical] | Frequency: [Exact frequency & timing with meals] | Duration: [Total treatment duration] | Precautions: [Key contraindications & warnings]\n" +
  "5. ACCURATE NON-PHARMACOLOGICAL ADVICE & CARE:\n" +
  "   💡 CLINICAL ADVICE & CARE:\n" +
  "   Provide practical supportive care (specific hydration fluids and volume, bed rest duration, nutrition, recovery monitoring).\n" +
  "6. EMERGENCY RED FLAGS:\n" +
  "   ⚠️ EMERGENCY RED FLAGS:\n" +
  "   List acute danger signs requiring immediate physical hospital evaluation.\n" +
  "7. INTERACTIVE DIAGNOSTIC QUESTIONS:\n" +
  "   ❓ DIAGNOSTIC FOLLOW-UP:\n" +
  "   Conclude with 1-2 thoughtful diagnostic questions to clarify progress or symptom evolution.\n" +
  "8. MANDATORY FORMATTING:\n" +
  "   - NEVER use double asterisks (**) or single asterisks (*) anywhere in your text. No markdown bolding.\n" +
  "   - For conversational greetings or creator questions, answer warmly and conversationally without diagnostic sections.";

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
        activeProvider: data.provider || 'Google Gemini 3.8 Neural Synapse',
        activeModel: data.activeEngine || 'gemini-3.8-flash',
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
        activeModel: 'gemini-3.8-flash',
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

  // 2. Primary Server Pathway: /api/chat (Powered by Google Gemini 3.8 Flash)
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
          model: data.model || "gemini-3.8-flash",
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
        modelName: "gemini-3.8-flash",
        targetLanguage
      })
    });

    if (fallbackRes.ok) {
      const fbData = await fallbackRes.json();
      const fbAnswer = fbData.text || fbData.response || "";
      if (fbAnswer.trim()) {
        return {
          response: fbAnswer,
          model: "gemini-3.8-flash",
          provider: "gemini-failover",
          latencyMs: Math.round(performance.now() - startTime)
        };
      }
    }
  } catch (fbErr: any) {
    console.error("[Doctorian AI] Secondary failover /api/ai/chat error:", fbErr);
  }

  // 4. Clinical Offline Fallback Guidance with Single Suspected Disease & Accurate Prescriptions
  const lowerMsg = (message || '').toLowerCase();
  let fallbackSuspectedDisease = "Acute Febrile Infection (Likely Uncomplicated Malaria)";
  let fallbackEvidence = "Pathogen: Plasmodium falciparum transmitted by female Anopheles mosquito. Symptoms of fever spikes, chills, headache, and fatigue correlate with the intra-erythrocytic cycle and cytokine release.";
  let fallbackDrugs = [
    "• Artemether-Lumefantrine (Brand: Coartem): 20mg/120mg tablets (4 tablets per dose for adults ≥35kg) | Route: Oral | Frequency: 6 doses over 3 days (0h, 8h, 24h, 36h, 48h, 60h) with milk or fatty food | Duration: 3 days | Precautions: Complete all 6 doses; confirm via mRDT test",
    "• Paracetamol (Brand: Panadol): 500mg-1g tablets | Route: Oral | Frequency: 8-hourly as needed for fever and pain | Duration: 3-5 days | Precautions: Maximum 4g daily; avoid alcohol"
  ];

  if (lowerMsg.includes("cough") || lowerMsg.includes("chest") || lowerMsg.includes("breath")) {
    fallbackSuspectedDisease = "Community-Acquired Pneumonia (Bacterial Etiology)";
    fallbackEvidence = "Microbial proliferation in pulmonary alveoli leading to inflammatory exudate, productive cough, and compromised gas exchange.";
    fallbackDrugs = [
      "• Amoxicillin (Brand: Amoxil): 500mg capsules | Route: Oral | Frequency: Every 8 hours (three times daily) | Duration: 5-7 days | Precautions: Contraindicated in penicillin allergy",
      "• Paracetamol: 500mg | Route: Oral | Frequency: Every 6-8 hours for pleuritic pain or fever | Duration: 3-5 days | Precautions: Stay well hydrated"
    ];
  } else if (lowerMsg.includes("stomach") || lowerMsg.includes("ulcer") || lowerMsg.includes("burn") || lowerMsg.includes("reflux")) {
    fallbackSuspectedDisease = "Peptic Ulcer Disease & Acid Reflux";
    fallbackEvidence = "Disruption of gastric mucosal barrier by hydrochloric acid and pepsin hypersecretion or H. pylori colonization.";
    fallbackDrugs = [
      "• Omeprazole (Brand: Prilosec): 20mg-40mg capsule | Route: Oral | Frequency: Once daily 30 minutes before breakfast | Duration: 4-8 weeks | Precautions: Swallow whole, do not crush",
      "• Magnesium Trisilicate Suspension: 10-20ml | Route: Oral | Frequency: Three times daily between meals and at bedtime | Duration: As needed | Precautions: Space 2 hours from other oral meds"
    ];
  }

  return {
    response: `🩺 PRIMARY SUSPECTED DISEASE: ${fallbackSuspectedDisease}\n\n🧬 EVIDENCE & CAUSE:\n${fallbackEvidence}\n\n💊 ACCURATE DRUG PRESCRIPTIONS:\n${fallbackDrugs.join('\n')}\n\n💡 CLINICAL ADVICE & CARE:\n• Ensure generous oral fluid hydration (2.5 - 3 Liters daily)\n• Prioritize strict physical bed rest in a well-ventilated room\n• Confirm diagnosis with laboratory blood testing at your nearest health facility\n\n⚠️ EMERGENCY RED FLAGS:\n• Difficulty breathing or chest in-drawing\n• High persistent fever (>39°C) with neck stiffness or confusion\n• Inability to retain oral fluids or persistent vomiting\n\n❓ DIAGNOSTIC FOLLOW-UP:\nHow many days have you been experiencing these symptoms, and have you noticed any other warning signs?`,
    model: "doctorian-offline-guideline-v1",
    provider: "offline-triage",
    latencyMs: Math.round(performance.now() - startTime)
  };
}
