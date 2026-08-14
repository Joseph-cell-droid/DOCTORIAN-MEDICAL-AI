/// <reference lib="webworker" />
/**
 * Doctorian Medical AI — In-Browser Hugging Face Inference Worker
 *
 * Runs a real Hugging Face text-generation model fully inside the browser via
 * transformers.js (ONNX runtime + WebGPU/WASM). This powers the consultation
 * chatbot's offline / fallback brain so it keeps working with no network and
 * no API key. Generation runs off the main thread to keep the UI responsive.
 */
import { pipeline, TextStreamer, env } from '@huggingface/transformers';

// Always pull weights from the Hugging Face Hub (never look for local files).
env.allowLocalModels = false;
if (env.backends?.onnx?.wasm) {
  // Cap threads so a heavy generation doesn't starve the device.
  env.backends.onnx.wasm.numThreads = Math.min(4, (self.navigator?.hardwareConcurrency || 4));
}

const DEFAULT_MODEL = 'onnx-community/Qwen2.5-0.5B-Instruct';

// Typed as `any`: the transformers.js pipeline union type is too large for TS to represent.
let generator: any = null;
let loadedModel = '';
let loadingPromise: Promise<any> | null = null;

async function ensureModel(modelId: string): Promise<any> {
  const target = modelId || DEFAULT_MODEL;
  if (generator && loadedModel === target) return generator;

  // A different model was requested — dispose and reload.
  if (generator && loadedModel !== target) {
    try { await generator.dispose(); } catch { /* noop */ }
    generator = null;
    loadingPromise = null;
  }

  if (!loadingPromise) {
    loadedModel = target;
    const supportsWebGPU = typeof (self.navigator as any)?.gpu !== 'undefined';
    loadingPromise = pipeline('text-generation', target, {
      // q4 keeps the download small enough to cache in the browser.
      dtype: 'q4',
      device: supportsWebGPU ? 'webgpu' : 'wasm',
      progress_callback: (progress: any) => {
        (self as any).postMessage({ type: 'progress', data: progress });
      },
    } as any);
  }

  generator = await loadingPromise;
  return generator;
}

interface GenerateRequest {
  type: 'load' | 'generate';
  id: number;
  modelId?: string;
  messages?: { role: string; content: string }[];
  temperature?: number;
  maxNewTokens?: number;
}

self.addEventListener('message', async (event: MessageEvent<GenerateRequest>) => {
  const { type, id } = event.data;

  try {
    if (type === 'load') {
      await ensureModel(event.data.modelId || DEFAULT_MODEL);
      (self as any).postMessage({ type: 'ready', id });
      return;
    }

    if (type === 'generate') {
      const model = await ensureModel(event.data.modelId || DEFAULT_MODEL);

      const streamer = new TextStreamer((model as any).tokenizer, {
        skip_prompt: true,
        skip_special_tokens: true,
        callback_function: (text: string) => {
          if (text) (self as any).postMessage({ type: 'token', id, text });
        },
      });

      await model(event.data.messages as any, {
        max_new_tokens: event.data.maxNewTokens ?? 512,
        do_sample: true,
        temperature: event.data.temperature ?? 0.7,
        top_p: 0.9,
        repetition_penalty: 1.1,
        streamer,
      } as any);

      (self as any).postMessage({ type: 'done', id });
    }
  } catch (err: any) {
    (self as any).postMessage({ type: 'error', id, error: err?.message || String(err) });
  }
});
