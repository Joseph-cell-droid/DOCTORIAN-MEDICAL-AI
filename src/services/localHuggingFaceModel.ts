/**
 * Doctorian Medical AI — In-Browser Hugging Face Model Service
 *
 * Thin controller around the model Web Worker (hfModelWorker.ts). It exposes an
 * async generator that streams tokens from a real Hugging Face model running
 * entirely in the browser, plus a preload helper with download progress. Used
 * as the offline / no-API-key fallback brain for the consultation chatbot.
 */

// Compact instruct model that ships ONNX weights compatible with transformers.js.
// The medical persona is applied through the Doctorian system instruction; users
// can override the underlying model via the localStorage key below.
export const DEFAULT_BROWSER_MODEL = 'onnx-community/Qwen2.5-0.5B-Instruct';
export const BROWSER_MODEL_STORAGE_KEY = 'doctorian_hf_browser_model';

export interface BrowserModelProgress {
  status: string;
  name?: string;
  file?: string;
  progress?: number;
  loaded?: number;
  total?: number;
}

interface WorkerMessage {
  type: 'progress' | 'ready' | 'token' | 'done' | 'error';
  id?: number;
  text?: string;
  error?: string;
  data?: BrowserModelProgress;
}

let worker: Worker | null = null;
let requestCounter = 0;

export function getBrowserModelId(): string {
  try {
    const stored = localStorage.getItem(BROWSER_MODEL_STORAGE_KEY);
    if (stored && stored.trim() !== '') return stored.trim();
  } catch {
    /* localStorage unavailable */
  }
  return DEFAULT_BROWSER_MODEL;
}

export function setBrowserModelId(modelId: string): void {
  try {
    localStorage.setItem(BROWSER_MODEL_STORAGE_KEY, modelId.trim());
  } catch {
    /* localStorage unavailable */
  }
}

/** In-browser inference needs Web Workers + WebAssembly. Guards SSR / old browsers. */
export function isBrowserModelSupported(): boolean {
  return typeof Worker !== 'undefined' && typeof WebAssembly !== 'undefined';
}

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('../workers/hfModelWorker.ts', import.meta.url), {
      type: 'module',
    });
  }
  return worker;
}

/**
 * Download + warm up the model ahead of time (e.g. from a Settings button) so
 * the first offline message is instant. Resolves once the model is ready.
 */
export function preloadLocalHFModel(
  onProgress?: (progress: BrowserModelProgress) => void,
): Promise<void> {
  if (!isBrowserModelSupported()) {
    return Promise.reject(new Error('In-browser inference is not supported in this environment.'));
  }
  const w = getWorker();
  const id = ++requestCounter;

  return new Promise<void>((resolve, reject) => {
    const handler = (event: MessageEvent<WorkerMessage>) => {
      const msg = event.data;
      if (msg.type === 'progress') {
        if (msg.data) onProgress?.(msg.data);
        return;
      }
      if (msg.id !== id) return;
      if (msg.type === 'ready') {
        w.removeEventListener('message', handler);
        resolve();
      } else if (msg.type === 'error') {
        w.removeEventListener('message', handler);
        reject(new Error(msg.error || 'Failed to load in-browser model.'));
      }
    };
    w.addEventListener('message', handler);
    w.postMessage({ type: 'load', id, modelId: getBrowserModelId() });
  });
}

export interface StreamLocalHFOptions {
  messages: { role: string; text: string }[];
  systemInstruction: string;
  temperature?: number;
  signal?: AbortSignal;
  onProgress?: (progress: BrowserModelProgress) => void;
}

/**
 * Stream a completion from the in-browser Hugging Face model, yielding text
 * chunks as they are generated. Throws if the model cannot be loaded/run so the
 * caller can cascade to another fallback.
 */
export async function* streamLocalHFResponse(
  opts: StreamLocalHFOptions,
): AsyncGenerator<string, void, unknown> {
  if (!isBrowserModelSupported()) {
    throw new Error('In-browser inference is not supported in this environment.');
  }

  const { messages, systemInstruction, temperature, signal, onProgress } = opts;
  const w = getWorker();
  const id = ++requestCounter;

  const chatMessages = [
    { role: 'system', content: systemInstruction },
    ...messages.map((m) => ({
      role:
        m.role === 'bot' || m.role === 'model' || m.role === 'assistant'
          ? 'assistant'
          : 'user',
      content: m.text,
    })),
  ];

  const queue: string[] = [];
  let finished = false;
  let failure: Error | null = null;
  let wake: (() => void) | null = null;

  const notify = () => {
    if (wake) {
      const fn = wake;
      wake = null;
      fn();
    }
  };

  const handler = (event: MessageEvent<WorkerMessage>) => {
    const msg = event.data;
    if (msg.type === 'progress') {
      if (msg.data) onProgress?.(msg.data);
      return;
    }
    if (msg.id !== id) return;
    if (msg.type === 'token' && msg.text) {
      queue.push(msg.text);
      notify();
    } else if (msg.type === 'done') {
      finished = true;
      notify();
    } else if (msg.type === 'error') {
      failure = new Error(msg.error || 'In-browser model generation failed.');
      finished = true;
      notify();
    }
  };

  const onAbort = () => {
    finished = true;
    notify();
  };

  w.addEventListener('message', handler);
  signal?.addEventListener('abort', onAbort);

  w.postMessage({
    type: 'generate',
    id,
    modelId: getBrowserModelId(),
    messages: chatMessages,
    temperature: temperature ?? 0.7,
  });

  try {
    while (true) {
      if (queue.length === 0 && !finished) {
        await new Promise<void>((resolve) => {
          wake = resolve;
        });
      }
      while (queue.length > 0) {
        if (signal?.aborted) return;
        yield queue.shift() as string;
      }
      if (finished) {
        if (failure) throw failure;
        return;
      }
    }
  } finally {
    w.removeEventListener('message', handler);
    signal?.removeEventListener('abort', onAbort);
  }
}
