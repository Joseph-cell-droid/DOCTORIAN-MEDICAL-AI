import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import Database from "better-sqlite3";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import cors from "cors";
import axios from "axios";
import nodemailer from "nodemailer";
import twilio from "twilio";
import dotenv from "dotenv";
import Flutterwave from "flutterwave-node-v3";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI, ThinkingLevel, Modality } from "@google/genai";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';

dotenv.config();
const arduinoClients = new Set<WebSocket>();
const biometricClients = new Set<WebSocket>();

function broadcastToArduino(data: any) {
  const payload = JSON.stringify(data);
  arduinoClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

function broadcastBiometrics(data: any, source: WebSocket) {
  const payload = JSON.stringify(data);
  biometricClients.forEach(client => {
    if (client !== source && client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("[SERVER] Starting Doctorian Backend...");

const JWT_SECRET = process.env.JWT_SECRET || "medical-super-secret-key-123";
const PORT = 3000;

console.log("[SERVER] Configuring AI Engines...");
let genAI: GoogleGenerativeAI | null = null;

// 3. Neural Architecture & Configuration
// Toggle between "gemini" (Option Two - free platform Gemini models) and "Ollama" (Option One - Llama 3.1 8b via Ollama)
const ACTIVE_AI_PROVIDER = process.env.ACTIVE_AI_PROVIDER || "together";

// Option Two Engines (Google Gemini mapped to Llama for removal of Gemini)
const GEMINI_PRIMARY = "meta-llama/llama-3.1-8b-instruct"; 
const GEMINI_VISION = "meta-llama/llama-3.2-11b-vision-instruct";

// Option One Engines (OpenRouter / Llama)
const LLAMA_PRIMARY = "meta-llama/llama-3.1-8b-instruct";
const LLAMA_VISION = "meta-llama/llama-3.2-11b-vision-instruct";

const PRIMARY_ENGINE = LLAMA_PRIMARY;
const MEDICAL_REASONING_ENGINE = LLAMA_PRIMARY;
const DATA_ANALYTICS_ENGINE = LLAMA_PRIMARY;
const VISION_ENGINE = LLAMA_VISION;
const DEEPSEEK_ENGINE = LLAMA_PRIMARY;
const MISTRAL_ENGINE = LLAMA_PRIMARY;
const DEFAULT_GEMINI_ENGINE = "meta-llama/llama-3.1-8b-instruct";
const DEFAULT_LLAMA_ENGINE = "meta-llama/llama-3.1-8b-instruct";
const DEFAULT_GEMMA_ENGINE = "meta-llama/llama-3.1-8b-instruct";
const BACKUP_ENGINE = "google gemma2";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama2";
// Only use local AI if explicitly enabled AND URL is provided. 
// Avoid trying localhost in production unless OLLAMA_URL is explicitly set to it by the user.
const IS_LOCAL_ENV = process.env.NODE_ENV !== 'production';
const USE_LOCAL_AI = process.env.USE_LOCAL_AI === 'true';
const SILENT_OLLAMA = process.env.SILENT_OLLAMA === 'true';

const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY || "";
const TOGETHER_URL = process.env.TOGETHER_URL || "https://api.together.xyz/v1/chat/completions";
const TOGETHER_MODEL = process.env.TOGETHER_MODEL || "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo";

const shouldTryTogetherAI = () => {
  return !!TOGETHER_API_KEY && TOGETHER_API_KEY.trim().length > 0;
};

// Helper to determine if we should even try the local Ollama pulse
const shouldTryOllama = () => {
  if (!OLLAMA_URL) return false;
  if (SILENT_OLLAMA) return false;
  // Allow localhost for fallback when Together AI fails (user's local Ollama instance)
  return true;
};

function getValidApiKeys() {
  const envKeys = [
    "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",
    process.env.GEMINI_API_KEY,
    process.env.VITE_GEMINI_API_KEY,
    process.env.GOOGLE_API_KEY,
    process.env.google_api_key,
    process.env.API_KEY,
    process.env.VITE_API_KEY,
    process.env.OPENROUTER_API_KEY,
    process.env.DEEPSEEK_API_KEY,
    process.env.OPENAI_API_KEY,
    process.env.MISTRAL_API_KEY,
    process.env.ANTHROPIC_API_KEY,
    process.env.CLAUDE_API_KEY,
  ].filter(Boolean);
  
  // Broader search for keys in environment
  const allEnvKeys = Object.keys(process.env);
  const potentialKeys = allEnvKeys.filter(k => 
    (k.toLowerCase().includes('key') || k.toLowerCase().includes('api') || k.toLowerCase().includes('token') || k.toLowerCase().includes('secret')) &&
    !k.toLowerCase().includes('firebase') &&
    !k.toLowerCase().includes('id') &&
    !k.toLowerCase().includes('type') &&
    !k.toLowerCase().includes('port')
  );

  for (const k of potentialKeys) {
    const val = process.env[k];
    if (val && val.length > 20 && !envKeys.includes(val)) {
      envKeys.push(val);
    }
  }

  const valid = envKeys.map(k => k!.trim()).filter(k => 
    k.length > 20 && // Real keys are usually long
    !k.toLowerCase().includes("placeholder") && 
    !k.toLowerCase().includes("not_set") &&
    !k.toLowerCase().includes("your_") &&
    !k.includes(" ") && // Keys don't have spaces
    !k.includes("://") 
  );
  
  const skKeys = valid.filter(k => k.toLowerCase().startsWith('sk-'));
  const googleKeys = valid.filter(k => !k.toLowerCase().startsWith('sk-'));

  const provider = (ACTIVE_AI_PROVIDER || "").toLowerCase();
  if (provider === "gemini") {
    // Option Two: Gemini prioritized, OpenRouter/Llama as fallback
    const ordered = [...googleKeys, ...skKeys];
    return [...new Set(ordered)];
  } else {
    // Option One: OpenRouter/Llama prioritized, Gemini as fallback
    const ordered = [...skKeys, ...googleKeys];
    return [...new Set(ordered)];
  }
}

function mapModelForProvider(modelId: string, apiKey: string): string {
  const isSkKey = apiKey.toLowerCase().startsWith('sk-');
  const isORKey = apiKey.toLowerCase().startsWith('sk-or-');
  const isOpenAI = apiKey.startsWith('sk-proj-') || (isSkKey && !isORKey);

  if (isORKey) {
    const m = modelId.toLowerCase();
    if (m.includes('llama') || m.includes('ollama') || m.includes('flash') || m.includes('pro')) {
      if (m.includes('gemma')) {
        return "google/gemma-2-9b-it";
      }
      if (m.includes('llama-3.2') || m.includes('vision')) {
        return "meta-llama/llama-3.2-11b-vision-instruct";
      }
      return "meta-llama/llama-3.1-8b-instruct";
    }
    if (m.includes('gemma-2') || m.includes('gemma')) {
      return "google/gemma-2-9b-it";
    }
    if (m.includes('deepseek')) {
      return "deepseek/deepseek-chat";
    }
    return modelId;
  }
  
  if (isOpenAI) {
    const m = modelId.toLowerCase();
    if (m.includes('gpt-') || m.includes('chatgpt')) return modelId;
    return "gpt-4o-mini";
  }

  // Native Google Gemini key (AIza...)
  return "gemini-2.5-flash";
}

function getGenAI(apiKey: string) {
  if (!apiKey || apiKey.trim().length < 20) return null;
  const trimmed = apiKey.trim();
  if (!trimmed.startsWith('AIza')) return null; // Only Google API keys work with this library
  return new GoogleGenerativeAI(trimmed);
}

function isMedicalQuery(text: string): boolean {
  const medicalKeywords = [
    'diagnosis', 'treatment', 'symptoms', 'disease', 'condition', 'health',
    'medical', 'doctor', 'patient', 'clinical', 'pathology', 'prevention',
    'cancer', 'cardiac', 'respiratory', 'metabolic', 'surgery', 'pain',
    'emergency', 'blood', 'heart', 'lungs', 'fever', 'vital', 'pill', 'tablet',
    'syrup', 'anatomy', 'biology', 'virus', 'bacteria', 'infection', 'trauma',
    'psychology', 'neurology', 'metabolism', 'hormone', 'protein', 'dna',
    'clinical protocol', 'dosage', 'prescription', 'pharmacy', 'blood pressure',
    'bpm', 'spo2', 'arduino', 'hardware', 'sensor', 'machine link', 'neural',
    'cognis', 'glucose', 'insulin', 'physiotherapy', 'radiology', 'mri', 'ct scan',
    'analyze', 'analysis', 'complex', 'research', 'heavy work', 'data set', 'statistics',
    'hi', 'hello', 'how are you', 'good morning', 'good afternoon', 'good evening', 'hey'
  ];
  const lower = text.toLowerCase();
  return medicalKeywords.some(k => lower.includes(k));
}

// --- FALLBACK SYNTHESIS ENGINE (Local Knowledge-Based) ---
function doctorianLocalSynthesis(prompt: string): string {
  const lower = prompt.toLowerCase();
  
  // 1. DIRECT GREETING HANDLERS
  const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'habari', 'oli otya'];
  if (greetings.some(g => lower.startsWith(g))) {
    return "Hello! I am Doctorian, your clinical neural interface. I am currently operating using my local clinical matrix. How can I assist you with your health today?";
  }

  if (lower.includes('who are you') || lower.includes('about doctorian') || lower.includes('creator')) {
    return "I am Doctorian, an autonomous clinical intelligence system created by Akora Joseph. I specialize in health data synthesis and diagnostic guidance, even when my cloud pathways are offline.";
  }

  // 2. KNOWLEDGE MATRIX SEARCH (Enhanced Scoring)
  const results = MEDICAL_KNOWLEDGE_MATRIX.map(node => {
    let score = 0;
    const searchTerms = lower.split(/[\s,?.!]+/);
    const nodeTerms = (node.title + " " + node.content).toLowerCase().split(/[\s,?.!]+/);
    
    searchTerms.forEach(term => {
      if (term.length > 3 && nodeTerms.includes(term)) score += 2;
      else if (term.length > 3 && nodeTerms.some(nt => nt.includes(term))) score += 1;
    });

    return { ...node, score };
  }).filter(n => n.score > 0)
    .sort((a, b) => b.score - a.score);

  if (results.length > 0) {
    const best = results[0];
    return `${best.content}`;
  }

  // 3. EMERGENCY HANDLER
  if (lower.includes('emergency') || lower.includes('bleeding') || lower.includes('chest pain') || lower.includes('accident')) {
    return "URGENT NOTICE: It sounds like you may be experiencing a medical emergency. Please contact your nearest emergency services or 911 immediately. I am an AI guidance tool and cannot provide emergency medical intervention.";
  }

  return "I am receiving your transmission. While my high-level cloud synthesis is currently restricted, I can still analyze your health vitals and provide basic guidance based on local clinical protocols. How can I help you proceed?";
}

async function* callAIStream(options: {
  messages: { role: string; text: string; images?: string[] }[],
  systemInstruction: string,
  modelName?: string,
  temperature?: number,
  useSearch?: boolean,
  thinkingLevel?: string
}) {
  const { messages, systemInstruction, modelName, temperature } = options;

  // --- TOGETHER AI PATHWAY (Primary Cloud Llama 3.1 8B Brain) ---
  if (shouldTryTogetherAI()) {
    try {
      console.log(`[AI-STREAM] Directing core brain pulse to Together AI: ${TOGETHER_URL} (Model: ${TOGETHER_MODEL})`);
      
      const payload: any = {
        model: TOGETHER_MODEL,
        stream: true,
        messages: [
          { role: "system", content: systemInstruction },
          ...messages.map(m => ({
            role: m.role === 'bot' || m.role === 'model' || m.role === 'assistant' ? 'assistant' : 'user',
            content: m.text
          }))
        ],
        temperature: temperature || 0.7
      };

      const response = await axios.post(TOGETHER_URL, payload, {
        headers: {
          "Authorization": `Bearer ${TOGETHER_API_KEY}`,
          "Content-Type": "application/json"
        },
        responseType: 'stream',
        timeout: 15000 // Fast 15s timeout to trigger Ollama offline failover quickly
      });

      let stream = response.data;
      let buffer = "";
      for await (const chunk of stream) {
        const chunkStr = Buffer.isBuffer(chunk) ? chunk.toString() : String(chunk);
        buffer += chunkStr;
        const lines = buffer.split('\n');
        buffer = lines.pop() || "";
        
        for (const line of lines) {
          const cleanLine = line.trim();
          if (!cleanLine || cleanLine === "data: [DONE]" || cleanLine === "data:[DONE]") continue;
          
          let targetJson = cleanLine;
          if (cleanLine.startsWith("data:")) {
            targetJson = cleanLine.substring(cleanLine.indexOf(":") + 1).trim();
          }

          try {
            const parsed = JSON.parse(targetJson);
            if (parsed.choices?.[0]?.delta?.content) {
              yield parsed.choices[0].delta.content;
            }
          } catch (e) {}
        }
      }

      if (buffer.trim()) {
        const cleanBuffer = buffer.trim();
        if (cleanBuffer !== "data: [DONE]" && cleanBuffer !== "data:[DONE]") {
          let targetJson = cleanBuffer;
          if (cleanBuffer.startsWith("data:")) {
            targetJson = cleanBuffer.substring(cleanBuffer.indexOf(":") + 1).trim();
          }
          try {
            const parsed = JSON.parse(targetJson);
            if (parsed.choices?.[0]?.delta?.content) {
              yield parsed.choices[0].delta.content;
            }
          } catch (e) {}
        }
      }
      return; // Stream success!
    } catch (togetherErr: any) {
      console.warn(`[AI-STREAM] Together AI cloud brain pulse failed: ${togetherErr.message}. Cascading/failing over to Local Ollama...`);
      console.log(`[AI-STREAM] Together AI unavailable. Attempting local Ollama fallback at ${OLLAMA_URL}...`);
    }
  }

  // --- OLLAMA STREAMING PATHWAY ---
  if (shouldTryOllama()) {
    try {
      const endpoint = OLLAMA_URL.endsWith('/') ? OLLAMA_URL.slice(0, -1) : OLLAMA_URL;
      const isGenerateEndpoint = endpoint.includes('/api/generate');
      const finalUrl = endpoint.includes('/api/') || endpoint.includes('/v1/')
        ? endpoint
        : `${endpoint}/api/chat`;

      console.log(`[AI-STREAM] Directing pulse to Ollama Stream: ${finalUrl} (Model: ${OLLAMA_MODEL})`);
      
      const payload: any = {
        model: OLLAMA_MODEL,
        stream: true,
        options: {
          temperature: temperature || 0.7
        }
      };

      if (isGenerateEndpoint) {
        // Format as plain-text conversation prompt for /api/generate
        const conversationPrompt = messages.map(m => {
          const prefix = m.role === 'bot' || m.role === 'model' || m.role === 'assistant' ? 'Assistant: ' : 'User: ';
          return `${prefix}${m.text}`;
        }).join('\n') + '\nAssistant:';

        payload.prompt = conversationPrompt;
        payload.system = systemInstruction;
      } else {
        // Standard chat messages payload for /api/chat or OpenAI-compatible
        payload.messages = [
          { role: "system", content: systemInstruction },
          ...messages.map(m => ({
            role: m.role === 'bot' || m.role === 'model' || m.role === 'assistant' ? 'assistant' : 'user',
            content: m.text
          }))
        ];
      }

      const response = await axios.post(finalUrl, payload, { responseType: 'stream', timeout: 30000 });

      let stream = response.data;
      let buffer = "";
      for await (const chunk of stream) {
        const chunkStr = Buffer.isBuffer(chunk) ? chunk.toString() : String(chunk);
        buffer += chunkStr;
        const lines = buffer.split('\n');
        buffer = lines.pop() || ""; // Keep the partial line buffered
        
        for (const line of lines) {
          const cleanLine = line.trim();
          if (!cleanLine || cleanLine === "data: [DONE]" || cleanLine === "data:[DONE]") continue;
          
          let targetJson = cleanLine;
          if (cleanLine.startsWith("data:")) {
            targetJson = cleanLine.substring(cleanLine.indexOf(":") + 1).trim();
          }

          try {
            const parsed = JSON.parse(targetJson);
            if (parsed.message?.content) {
              yield parsed.message.content;
            } else if (parsed.response) {
              yield parsed.response;
            } else if (parsed.choices?.[0]?.delta?.content) {
              yield parsed.choices[0].delta.content;
            }
          } catch (e) {}
        }
      }
      
      if (buffer.trim()) {
        const cleanBuffer = buffer.trim();
        if (cleanBuffer !== "data: [DONE]" && cleanBuffer !== "data:[DONE]") {
          let targetJson = cleanBuffer;
          if (cleanBuffer.startsWith("data:")) {
            targetJson = cleanBuffer.substring(cleanBuffer.indexOf(":") + 1).trim();
          }
          try {
            const parsed = JSON.parse(targetJson);
            if (parsed.message?.content) {
              yield parsed.message.content;
            } else if (parsed.response) {
              yield parsed.response;
            } else if (parsed.choices?.[0]?.delta?.content) {
              yield parsed.choices[0].delta.content;
            }
          } catch (e) {}
        }
      }
      return; // Success
    } catch (ollamaErr: any) {
      const isConnError = ollamaErr.code === 'ECONNREFUSED' || ollamaErr.message?.includes('Network Error');
      const isLocalhost = OLLAMA_URL?.includes('localhost') || OLLAMA_URL?.includes('127.0.0.1');
      
      let errorDetail = ollamaErr.message;
      if (isConnError && isLocalhost && !IS_LOCAL_ENV) {
        errorDetail = `CONNECTION REFUSED. Logic: The server is running in the cloud, but the Neural Link is pointed to 'localhost'. You must use a tunnel (e.g., ngrok) to bridge your local Ollama node to the cloud.`;
      } else if (isConnError) {
        errorDetail = `Connection refused at ${OLLAMA_URL}. Ensure Ollama is running and OLLAMA_ORIGINS="*" is set.`;
      }

      console.warn(`[AI-STREAM] Ollama pulse failed: ${errorDetail}. Falling back to cloud neurons.`);
      console.error(`[AI-STREAM] Both Together AI and local Ollama failed. Falling back to cloud API keys.`);
    }
  }

  const allKeys = getValidApiKeys();

  if (allKeys.length === 0) {
    throw new Error("No valid AI API keys found.");
  }

  const lastMessage = messages[messages.length - 1];
  const lastUserMessage = (lastMessage?.text || "").toLowerCase();
  const hasImages = messages.some(m => m.images && m.images.length > 0) || lastMessage?.images?.length > 0;

  let finalModel = modelName;
  if (!finalModel || finalModel.includes('gemini') || finalModel === 'flash' || finalModel === 'pro') {
    if (hasImages) {
      finalModel = VISION_ENGINE;
    } else if (lastUserMessage.includes('analyze') || lastUserMessage.includes('data') || lastUserMessage.includes('code') || lastUserMessage.includes('logic')) {
      finalModel = DATA_ANALYTICS_ENGINE;
    } else if (lastUserMessage.includes('deepseek') || lastUserMessage.includes('reason')) {
      finalModel = DEEPSEEK_ENGINE;
    } else if (lastUserMessage.includes('mistral')) {
      finalModel = MISTRAL_ENGINE;
    } else {
      finalModel = isMedicalQuery(lastUserMessage) ? MEDICAL_REASONING_ENGINE : PRIMARY_ENGINE;
    }
  }

  for (const apiKey of allKeys) {
    try {
      const isSkKey = apiKey.toLowerCase().startsWith('sk-');
      const isORKey = apiKey.toLowerCase().startsWith('sk-or-');
      const isOpenAI = apiKey.startsWith('sk-proj-') || (isSkKey && !isORKey);

      let providerModel = mapModelForProvider(finalModel, apiKey);
      
      // Adaptation: Handle provider-specific model naming
      let modelIdentityHeader = "";
      if (providerModel.includes('llama-3.1')) {
        modelIdentityHeader = "You are Llama 3.1, a state-of-the-art large language model by Meta, serving as the Primary Clinical Brain for Doctorian.\n";
      } else if (providerModel.includes('gemma-2')) {
        modelIdentityHeader = "You are Gemma 2, a state-of-the-art open model by Google, serving as the Medical Reasoning Engine for Doctorian.\n";
      } else if (providerModel.includes('llama-3.2')) {
        modelIdentityHeader = "You are Llama 3.2, a vision-capable language model by Meta, serving as the Vision and Image Analysis Engine for Doctorian.\n";
      }

      const effectiveSystemInstruction = modelIdentityHeader + systemInstruction;

      if (!providerModel.includes('gemini')) {
        let apiUrl = isOpenAI ? "https://api.openai.com/v1/chat/completions" : "https://openrouter.ai/api/v1/chat/completions";

        if (USE_LOCAL_AI) {
          apiUrl = "http://localhost:11434/v1/chat/completions";
        }

        console.log(`[AI-STREAM] Calling OpenAI-compatible endpoint: ${apiUrl} (Model: ${USE_LOCAL_AI ? OLLAMA_MODEL : providerModel})`);

        const response = await axios.post(apiUrl, {
          model: USE_LOCAL_AI ? OLLAMA_MODEL : providerModel,
          stream: true,
          messages: [
            { role: "system", content: effectiveSystemInstruction },
            ...messages.map(m => ({
              role: m.role === 'bot' || m.role === 'model' || m.role === 'assistant' ? 'assistant' : 'user',
              content: m.text
            }))
          ],
          temperature: temperature || 0.7,
          max_tokens: 1024,
        }, {
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            ...(isOpenAI ? {} : {
              "HTTP-Referer": "https://doctorian.med",
              "X-Title": "Doctorian",
            })
          },
          responseType: 'stream',
          timeout: 60000
        });

        const stream = response.data;
        let buffer = "";
        for await (const chunk of stream) {
          const chunkStr = Buffer.isBuffer(chunk) ? chunk.toString() : String(chunk);
          buffer += chunkStr;
          
          let lineEndIndex;
          while ((lineEndIndex = buffer.indexOf("\n")) >= 0) {
            const line = buffer.slice(0, lineEndIndex).trim();
            buffer = buffer.slice(lineEndIndex + 1);
            
            const cleanLine = line.trim();
            if (!cleanLine || cleanLine === "data: [DONE]" || cleanLine === "data:[DONE]") continue;
            if (cleanLine.startsWith("data:")) {
              const jsonStr = cleanLine.substring(cleanLine.indexOf(":") + 1).trim();
              try {
                const parsed = JSON.parse(jsonStr);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) yield content;
              } catch (e) { }
            } else {
              try {
                const parsed = JSON.parse(cleanLine);
                const content = parsed.choices?.[0]?.delta?.content || parsed.response || parsed.text;
                if (content) yield content;
              } catch (e) { }
            }
          }
        }
        return; // Success
      } else {
        const aiClient = getGenAI(apiKey);
        if (aiClient) {
          console.log(`[AI-STREAM] Processing via Google Pathway (${providerModel})...`);
          
          const model = aiClient.getGenerativeModel({ 
            model: providerModel,
            systemInstruction: effectiveSystemInstruction
          });

          const formattedContents = messages.map(m => {
            const parts: any[] = [{ text: m.text || "Continue analysis." }];
            
            if (m.images && m.images.length > 0) {
              m.images.forEach(img => {
                const base64Data = img.includes('base64,') ? img.split('base64,')[1] : img;
                const mimeType = img.includes('data:') ? img.split(';')[0].split(':')[1] : 'image/jpeg';
                parts.push({
                  inlineData: {
                    data: base64Data,
                    mimeType: mimeType
                  }
                });
              });
            }
            
            return {
              role: (m.role === 'bot' || m.role === 'model' || m.role === 'assistant') ? 'model' : 'user',
              parts: parts
            };
          });

          const result = await model.generateContentStream({
            contents: formattedContents,
            generationConfig: {
              temperature: temperature || 0.7,
            }
          });
          
          let hasYielded = false;
          try {
            for await (const chunk of result.stream) {
              const text = chunk.text();
              if (text) {
                yield text;
                hasYielded = true;
              }
            }
          } catch (streamErr: any) {
            console.error("[AI-STREAM] Gemini stream chunk error:", streamErr.message);
          }
          if (hasYielded) return;
        }
      }
    } catch (err: any) {
      if (err.message?.includes('429')) {
        console.log(`[AI-STREAM] Key hit quota (429). Attempting next synapse...`);
      } else {
        console.warn(`[AI-STREAM] Synapse failover:`, err.message);
      }
    }
  }

  // --- FINAL FALLBACK: Connection Failure ---
  console.log("[AI-STREAM] External pathways exhausted. Triggering local synthesis.");
  const prompt = lastMessage?.text || "Hello";
  const fallbackResponse = doctorianLocalSynthesis(prompt);
  yield fallbackResponse;
}

async function callAI(options: {
  messages: { role: string; text: string; images?: string[] }[],
  systemInstruction: string,
  modelName?: string,
  temperature?: number,
  userId?: string
}) {
  const { messages, systemInstruction, modelName, temperature, userId } = options;

  // --- TOGETHER AI PATHWAY (Primary Cloud Llama 3.1 8B Brain) ---
  if (shouldTryTogetherAI()) {
    try {
      console.log(`[AI-BRAIN] Directing core brain pulse to Together AI: ${TOGETHER_URL} (Model: ${TOGETHER_MODEL})`);
      
      const payload: any = {
        model: TOGETHER_MODEL,
        stream: false,
        messages: [
          { role: "system", content: systemInstruction },
          ...messages.map(m => ({
            role: m.role === 'bot' || m.role === 'model' || m.role === 'assistant' ? 'assistant' : 'user',
            content: m.text
          }))
        ],
        temperature: temperature || 0.7
      };

      const response = await axios.post(TOGETHER_URL, payload, {
        headers: {
          "Authorization": `Bearer ${TOGETHER_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 15000 // Fast 15s timeout to trigger Ollama offline failover quickly
      });

      if (response.data?.choices?.[0]?.message?.content) {
        console.log(`[AI-BRAIN] Together AI Cloud Brain response successful`);
        return response.data.choices[0].message.content;
      }
    } catch (togetherErr: any) {
      console.warn(`[AI-BRAIN] Together AI cloud brain pulse failed: ${togetherErr.message}. Cascading/failing over to Local Ollama...`);
    }
  }

  // --- OLLAMA PATHWAY (Local Inference) ---
  // We prioritize this if USE_LOCAL_AI is true or OLLAMA_URL is explicitly provided
  if (shouldTryOllama()) {
    try {
      const isLocal = OLLAMA_URL && (OLLAMA_URL.includes('localhost') || OLLAMA_URL.includes('127.0.0.1'));
      
      // Injecting local analysis enhancement instruction
      const enhancedSystemInstruction = `${systemInstruction}\n\nCRITICAL DIRECTIVE FOR LOCAL ANALYTICS: Provide exceptionally high-level clinical reasoning, cross-reference symptoms with medical literature patterns, and maintain strict privacy-first discourse. Utilize your local computational resources for deep diagnostic synthesis.`;

      const endpoint = OLLAMA_URL.endsWith('/') ? OLLAMA_URL.slice(0, -1) : OLLAMA_URL;
      const isGenerateEndpoint = endpoint.includes('/api/generate');
      const finalUrl = endpoint.includes('/api/') || endpoint.includes('/v1/')
        ? endpoint
        : `${endpoint}/api/chat`;

      console.log(`[AI-BRAIN] Directing neural pulse to Ollama (${OLLAMA_MODEL}) at ${finalUrl}`);

      const payload: any = {
        model: OLLAMA_MODEL,
        stream: false,
        options: {
          temperature: temperature || 0.7,
          num_ctx: 8192 // Higher context for better analysis if local HW supports it
        }
      };

      if (isGenerateEndpoint) {
        const conversationPrompt = messages.map(m => {
          const prefix = m.role === 'bot' || m.role === 'model' || m.role === 'assistant' ? 'Assistant: ' : 'User: ';
          return `${prefix}${m.text}`;
        }).join('\n') + '\nAssistant:';

        payload.prompt = conversationPrompt;
        payload.system = enhancedSystemInstruction;
      } else {
        payload.messages = [
          { role: "system", content: enhancedSystemInstruction },
          ...messages.map(m => ({
            role: m.role === 'bot' || m.role === 'model' || m.role === 'assistant' ? 'assistant' : 'user',
            content: m.text
          }))
        ];
      }

      const response = await axios.post(finalUrl, payload, { timeout: 60000 }); // Longer timeout for deep local analysis

      // Handle standard Ollama chat format
      if (response.data?.message?.content) {
        console.log(`[AI-BRAIN] Local Neural Link successful (Ollama native chat)`);
        return response.data.message.content;
      }
      // Handle standard Ollama generate format
      if (response.data?.response) {
        console.log(`[AI-BRAIN] Local Neural Link successful (Ollama native generate)`);
        return response.data.response;
      }
      // Handle OpenAI-compatible response format
      if (response.data?.choices?.[0]?.message?.content) {
        console.log(`[AI-BRAIN] Local Neural Link successful (Ollama/Local OpenAI-compat)`);
        return response.data.choices[0].message.content;
      }
      
      if (USE_LOCAL_AI) {
        throw new Error("Local AI returned empty or invalid response structure.");
      }
    } catch (ollamaErr: any) {
      const isConnError = ollamaErr.code === 'ECONNREFUSED' || ollamaErr.message?.includes('Network Error');
      const isLocalhost = OLLAMA_URL && (OLLAMA_URL.includes('localhost') || OLLAMA_URL.includes('127.0.0.1'));
      
      let errorDetail = ollamaErr.message;
      if (isConnError && isLocalhost && !IS_LOCAL_ENV) {
        errorDetail = `CONNECTION REFUSED: Cloud-to-Local Bridge required. The app is in the cloud, so 'localhost' refers to the server's empty container, not your computer. Use a tunnel (ngrok) and update OLLAMA_URL.`;
      } else if (isConnError) {
        errorDetail = `Connection refused at ${OLLAMA_URL}. Ensure Ollama is running and OLLAMA_ORIGINS="*" is set if connecting from an external node.`;
      }
        
      console.warn(`[AI-BRAIN] Local AI unavailable (${errorDetail}). Cascading to Gemini Clinical Matrix...`);
    }
  }

  const allKeys = getValidApiKeys();
  const lastMessage = messages[messages.length - 1];
  const lastUserMessage = lastMessage?.text || "";

  for (const apiKey of allKeys) {
    try {
      const isSkKey = apiKey.toLowerCase().startsWith('sk-');
      const isORKey = apiKey.toLowerCase().startsWith('sk-or-');
      const isOpenAI = apiKey.startsWith('sk-proj-') || (isSkKey && !isORKey);

      let providerModel = mapModelForProvider(modelName || PRIMARY_ENGINE, apiKey);

      if (isSkKey) {
        let apiUrl = isOpenAI 
          ? "https://api.openai.com/v1/chat/completions" 
          : "https://openrouter.ai/api/v1/chat/completions";

        if (USE_LOCAL_AI) {
          apiUrl = "http://localhost:11434/v1/chat/completions";
        }

        console.log(`[AI-BRAIN] Synapse active: ${providerModel} via ${apiUrl.includes('openrouter') ? 'OpenRouter' : apiUrl.includes('openai') ? 'OpenAI' : 'Local Ollama'}`);

        const response = await axios.post(apiUrl, {
          model: providerModel,
          messages: [
            { role: "system", content: systemInstruction },
            ...messages.map(m => ({
              role: m.role === 'bot' || m.role === 'model' || m.role === 'assistant' ? 'assistant' : 'user',
              content: m.text
            }))
          ],
          temperature: temperature || 0.7,
          max_tokens: 1024,
        }, {
          headers: { 
            "Authorization": `Bearer ${apiKey}`,
            "HTTP-Referer": "https://doctorian.nexus",
            "X-Title": "Doctorian Neural Core"
          },
          timeout: 50000
        });

        if (response.data?.choices?.[0]?.message?.content) {
          return response.data.choices[0].message.content;
        }
      } else if (!isSkKey) {
        try {
          const modernClient = new GoogleGenAI({
            apiKey: apiKey.trim(),
            httpOptions: {
              headers: {
                'User-Agent': 'aistudio-build',
              }
            }
          });
          // Map to correct Gemini model for Google pathway
          const effectiveModel = providerModel && providerModel.includes('gemini') ? providerModel : "gemini-2.5-flash"; 
          
          console.log(`[AI-BRAIN] Mapping ${providerModel} to ${effectiveModel} via Modern Pathway`);
          
          const result = await modernClient.models.generateContent({
            model: effectiveModel,
            contents: messages.map(m => ({
              role: (m.role === 'bot' || m.role === 'model' || m.role === 'assistant') ? 'model' : 'user',
              parts: [{ text: m.text }]
            })),
            config: { temperature: temperature || 0.7 }
          });
          
          const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return text;
         } catch (genErr: any) {
          console.warn("[AI-BRAIN] Modern Synapse failed, trying classic fallback:", genErr.message);
          const aiClient = getGenAI(apiKey);
          if (aiClient) {
            // Try fallback models if primary fails
            const modelsToTry = ["gemini-1.5-flash", "gemini-2.5-flash"];
            
            for (const modelId of modelsToTry) {
              try {
                console.log(`[AI-BRAIN] Attempting classic fallback with model: ${modelId}`);
                const model = aiClient.getGenerativeModel({ model: modelId });
                const result = await model.generateContent({
                  contents: messages.map(m => ({
                    role: (m.role === 'bot' || m.role === 'model' || m.role === 'assistant') ? 'model' : 'user',
                    parts: [{ text: m.text }]
                  })),
                  generationConfig: { temperature: temperature || 0.7 }
                });
                return result.response.text();
              } catch (retryErr: any) {
                console.warn(`[AI-BRAIN] Failed with ${modelId}:`, retryErr.message);
                if (modelId === modelsToTry[modelsToTry.length - 1]) throw retryErr;
              }
            }
          }
        }
      }
    } catch (err: any) {
      if (err.message?.includes('429')) {
        console.log(`[AI-BRAIN] Key hit quota (429). Attempting next synapse...`);
      } else {
        console.warn("[AI-BRAIN] Synapse failover:", err.message);
      }
    }
  }

  // --- FINAL FALLBACK: Connection Failure ---
  console.log("[AI-BRAIN] External pathways exhausted. Triggering local synthesis.");
  const prompt = lastUserMessage || "Hello";
  return doctorianLocalSynthesis(prompt);
}

function normalizePhoneNumber(phone: string | undefined): string | undefined {
  if (!phone) return undefined;
  let cleaned = phone.trim().replace(/\s+/g, '');
  
  if (cleaned.startsWith('+')) return cleaned;
  
  // If starts with 07... or 03... (Uganda local)
  if (cleaned.startsWith('0')) {
    return '+256' + cleaned.substring(1);
  }
  
  // If starts with 7... or 3... (Uganda local without leading 0)
  if (cleaned.length === 9 && (cleaned.startsWith('7') || cleaned.startsWith('3'))) {
    return '+256' + cleaned;
  }

  // Fallback: if it doesn't have a +, add it assuming it might already have a country code but no +
  if (!cleaned.startsWith('+') && cleaned.length > 10) {
    return '+' + cleaned;
  }

  return cleaned;
}

function isPasswordSecure(pass: string): boolean {
  const hasLetter = /[a-zA-Z]/.test(pass);
  const hasNumber = /\d/.test(pass);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
  return hasLetter && hasNumber && hasSymbol && pass.length >= 8;
}

// Email Transporter Setup
const rawSmtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
const transporter = nodemailer.createTransport({
  host: (rawSmtpHost.includes('@') || !rawSmtpHost.includes('.')) ? "smtp.gmail.com" : rawSmtpHost,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendEmail(to: string, subject: string, text: string, html?: string) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn(`[EMAIL] SMTP credentials missing. Email to ${to} not sent. Subject: ${subject}`);
    console.log(`[EMAIL CONTENT]: ${text}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Doctorian" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html: html || text.replace(/\n/g, "<br>"),
    });
    console.log(`[EMAIL] Sent to ${to}: ${subject}`);
  } catch (err: any) {
    const isAuthError = err.message.includes('535') || err.message.includes('Invalid login') || err.message.includes('Username and Password not accepted');
    
    if (isAuthError) {
      console.error(`[EMAIL FATAL] AUTHENTICATION FAILED for ${process.env.SMTP_USER}.`);
      console.error("[EMAIL HINT] If using Gmail, you MUST use an 'App Password'. Go to Google Account > Security > 2-Step Verification > App Passwords.");
      console.error("[EMAIL HINT] Standard Google account passwords will NOT work for SMTP.");
    } else {
      console.error(`[EMAIL ERROR] Failed to send to ${to}:`, err.message);
    }
  }
}

// Database Setup
const DB_PATH = "medical.db";

let db: Database.Database;

const MEDICAL_KNOWLEDGE_MATRIX = [
  // Neural Identity & Training
  { title: "Protocol: Maternal Health & VHT", content: "Coordinate with Village Health Teams (VHT) for rural support. Use Boda-Boda vouchers for emergency obstetric transport. Pregnancy terms: Olubuto (Luganda) and Mimba (Swahili). Monitor for preeclampsia: BP >140/90, headache, or blurred vision." },
  { title: "Protocol: Neural Matrix Identity", content: "Doctorian is conceptualized and created by Akora Joseph. It is powered by team Ebro neural architectures. It is capable of autonomous processing which utilizes specialized health data and clinical protocols injected via the Training Hub. In this mode, the AI reasons independently of external APIs to ensure total clinical privacy." },
  { title: "Protocol: Global Health Data Training", content: "Doctorian has been synthesized using a 500TB clinical knowledge corpus, including PubMed abstracts, WHO guidance documents, CDC epidemiological reports, and the complete Ugandan Clinical Guidelines (UCG). This multimodal training enables the AI to multitask across diagnosis, prevention, and tertiary care planning." },
  
  // Health Articles
  { title: "Article: Metabolic Syndrome Architecture", content: "Metabolic syndrome is a cluster of conditions (hypertension, hyperglycemia, excess body fat, abnormal cholesterol) that increase heart disease and stroke risk. Management: 1. Weight stabilization (5-10% loss). 2. Aerobic exercise (150 min/week). 3. High-fiber, low-glycemic nutrition." },
  { title: "Article: Gut-Brain Axis Neuroscience", content: "The bidirectional link between the central nervous system and the enteric nervous system. Influenced by microbiome diversity. Chronic inflammation in the gut can correlate with mood dysregulation. Clinical focus: Probiotic variety, stress modularity, and inflammatory marker suppression." },
  
  // Medical FAQs
  { title: "FAQ: Antibiotic Compliance", content: "Q: Why complete the full course if I feel better? A: Early cessation leaves surviving bacteria with sub-lethal exposure, promoting antibiotic resistance. Always finish the prescribed cycle to ensure total eradication of the pathogen." },
  { title: "FAQ: Fever Management (Adults)", content: "Q: When is a fever dangerous? A: Temperatures >39.4°C (103°F) or persistent fevers for >3 days require professional consultation. Monitor for accessory symptoms: stiff neck, confusion, or severe rash." },
  
  // Symptom Explanations
  { title: "Symptom: Dyspnea (Shortness of Breath)", content: "Pathophysiology: Mismatch between central respiratory drive and mechanical response. Potential etiologies: 1. Cardiac (HF, ACS). 2. Pulmonary (COPD, PE, Pneumonia). 3. Systemic (Anemia, Anxiety). Red Flags: Cyanosis, use of accessory muscles, inability to speak complete sentences." },
  { title: "Symptom: Peripheral Edema Logic", content: "Fluid accumulation in tissues due to gravity and pressure imbalances. Common drivers: Venous insufficiency, heart failure, renal dysfunction, or liver cirrhosis. Bilateral vs Unilateral is key for DVT differentiation." },
  
  // Disease Prevention Guides
  { title: "Prevention: Cardiovascular Shielding", content: "1. Primary: Smoking cessation, BP control (<130/80), Lipid management (LDL <70mg/dL for high risk). 2. Secondary: Low-dose aspirin for verified CVD. 3. Lifestyle: Minimize ultra-processed foods and prioritize the 'Mediterranean' biological model." },
  { title: "Prevention: Infectious Disease Defense", content: "1. Hand hygiene (20s soap/water). 2. Vaccination (Influenza, Pneumococcal, HPV). 3. Environmental control: Ventilation and surface disinfection. 4. Immune support: Adequate Vitamin D, Zinc, and circadian-aligned sleep." },
  
  // First Aid Information
  { title: "First Aid: ACS (Heart Attack) Protocol", content: "1. Call 112/Emergency. 2. Patient in rested position. 3. Aspirin 300mg (chewed). 4. Monitor vitals until medical transport arrives. Do not provide high-fat foods or stimulants." },
  { title: "First Aid: Severe Hemorrhage Control", content: "1. Direct pressure on the wound. 2. Elevation if applicable. 3. Tourniquet application 2-3 inches above the wound (if limb and arterial). 4. Combat shock by keeping patient warm and prone." },

  // WHO protocols
  { title: "WHO: Respiratory Pathogens Matrix", content: "TB: 6-month DOTS. Asthma: ICS baseline. Emergency: GCS <= 8 requires airway stabilization." },
  { title: "WHO: Pediatrics & Hydration", content: "IMCI Plan B: 75ml/kg ORS. Plan C: IV Ringer's Lactate. Danger: Lethargy, inability to drink." },
  
  // Ugandan Medical Knowledge & Terminology
  { title: "Translation: Luganda Medical Terms", content: "Fever: Musujja; Blood: Musaayi; Pain: Bulumi; Doctor: Omusawo; Medicine: Eddagala; Hospital: Eddwaliro; Sickness: Obulwadde; Heart: Omutima; Lungs: Amawuluguma; Breath: Omukka; Stomach: Olubuto; Head: Omutwe; Cough: Kifuba; Wound: Kiwundu; Pregnant: Olubuto (also means stomach, context matters); Childbirth: Okuzaala." },
  { title: "Protocol: Malaria in Uganda (Musujja gw'ensiri)", content: "Leading morbidity cause. High risk: pregnant women, children <5. Symptoms: Chills (Okukakaba), Fever (Musujja), Headache (Omutwe), Joint pain (Okulumizibwa mu nnyingo). Treatment: Artemether-lumefantrine (Coartem) first-line. Severe cases (Okusika ebinnywa/convulsions): IV Artesunate." },
  { title: "Translation: Swahili Medical Terms (East Africa Context)", content: "Fever: Homa; Blood: Damu; Pain: Maumivu; Doctor: Daktari; Medicine: Dawa; Hospital: Hospitali; Sickness: Ugonjwa; Heart: Moyo; Lungs: Mapafu; Breath: Pumzi; Stomach: Tumbo; Head: Kichwa; Cough: Kikohozi; Wound: Kidonda." },
  { title: "Epidemic: Ebola/Marburg Protocol (Regional)", content: "Sudan Ebolavirus and Marburg are endemic risks. Symptoms: Unexplained bleeding, high fever, intense weakness. Action: Immediate isolation. Contact Ministry of Health via 0800-100-066. Avoid direct contact with bodily fluids." },
  { title: "Translation: Acholi Medical Terms", content: "Fever: Lyeto; Blood: Rem; Pain: Arem; Doctor: Ladaktar; Medicine: Yat; Hospital: Ot Yat; Sickness: Two; Heart: Cwiny; Lungs: Kom obo; Breath: Yweyo; Stomach: Iic; Head: Wic; Cough: Ola; Wound: Ret." },
  { title: "Translation: Ateso Medical Terms", content: "Fever: Akipi; Blood: Akot; Pain: Eriono; Doctor: Lokitak; Medicine: Ekitoi; Hospital: Isipitari; Sickness: Adeka; Heart: Tau; Lungs: Iuko; Breath: Akiywe; Stomach: Akoit; Head: Akou; Cough: Awola; Wound: Ajore." },
  { title: "Translation: Runyankole/Rukiga Medical Terms", content: "Fever: Omushasho; Blood: Eshagama; Pain: Obusaasi; Doctor: Omushaho; Medicine: Omubazi; Hospital: Eirwariro; Sickness: Oburwaire; Heart: Omutima; Lungs: Amahurugunyu; Breath: Omukka; Stomach: Enda; Head: Omutwe; Cough: Ekifuba; Wound: Ekihundu." },
  { title: "Translation: Lugbara Medical Terms", content: "Fever: Amve; Blood: Ari; Pain: O'du; Doctor: Dakitari; Medicine: Ti'di; Hospital: Ostali; Sickness: Aziza; Heart: Bulu; Lungs: Angalaba; Breath: O'a; Stomach: Inzu; Head: Dri; Cough: O'a; Wound: E'be." },
  { title: "Translation: Karamojong Medical Terms", content: "Fever: Akipi; Blood: Ngakot; Pain: Aryonut; Doctor: Lokitak; Medicine: Ekitoi; Hospital: Isipitari; Sickness: Adeka; Heart: Tau; Lungs: Iuko; Breath: Akiyenga; Stomach: Akoit; Head: Akou; Cough: Awola." },
  { title: "Translation: Rutooro/Runyoro Medical Terms", content: "Fever: Orukusane; Blood: Esagama; Pain: Obusaasi; Doctor: Omufumu; Medicine: Omubazi; Hospital: Edwariro; Sickness: Oburwaire; Heart: Omutima; Lungs: Amahulugulwa; Breath: Omukka; Stomach: Enda; Head: Omutwe; Cough: Ekifuba." },
  { title: "Guideline: HIV/AIDS Management (Uganda)", content: "TasP (Treatment as Prevention) strategy. U=U (Undetectable = Untransmittable). First-line ARV: TLD (Tenofovir, Lamivudine, Dolutegravir). Key counseling: 'Adherence is survival'. Use Peer Educators (Expert Patients)." },
  { title: "Protocol: Cholera Outbreak Control", content: "Mode: Fecal-oral (Unsafe water). Symptoms: 'Rice-water' stools, rapid dehydration. Treatment: ORS (Oral Rehydration Salts) + Zinc for children. IV Fluids if severe. Isolation and sanitation vital." },
  { title: "Translation: Lusoga Medical Terms", content: "Fever: Musujja; Blood: Musaayi; Pain: Bulumi; Doctor: Omusawo; Medicine: Eddagala; Hospital: Eddwaliro; Sickness: Obulwadde; Heart: Omutima; Lungs: Amawuluguma; Breath: Omukka; Stomach: Olubuto; Head: Omutwe; Cough: Kifuba; Wound: Kiwundu." },
  { title: "Nutrition: Malnutrition (Kwashiorkor/Marasmus)", content: "Common in rural districts. Signs: 'Moon face', thinning hair, swollen belly (Okuzimba olubuto). Treatment: RUTF (Ready-to-Use Therapeutic Food), F-75/F-100 therapeutic milk under medical supervision." },
  { title: "Tropical: Neglected Tropical Diseases (NTDs)", content: "Bilharzia (Schistosomiasis) prevalent around Lake Victoria. Symptoms: Blood in urine (Musaayi mu musulo). Treatment: Praziquantel. Prevention: Avoid unsafe lake water contact." }
];

function initDatabase() {
  console.log("[DB] Initializing clinical knowledge engine...");
  try {
    db = new Database(DB_PATH);
    // Test if DB is reachable
    db.prepare("SELECT 1").get();
    console.log("[DB] Connection verified.");
    
    // Seed initial knowledge if empty
    const checkTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='knowledge_base'").get();
    if (checkTable) {
      const checkKB = db.prepare("SELECT COUNT(*) as count FROM knowledge_base").get() as any;
      if (checkKB && checkKB.count === 0) {
        console.log("[DB] Seeding clinical knowledge matrix...");
        const insertKB = db.prepare("INSERT INTO knowledge_base (id, userId, title, content, category) VALUES (?, ?, ?, ?, ?)");
        MEDICAL_KNOWLEDGE_MATRIX.forEach((node, i) => {
          insertKB.run(`seed_${i}`, 'system', node.title, node.content, 'clinical');
        });
      }
    }
  } catch (err: any) {
    console.error("[DB FATAL] Initialization error:", err.message);
    if (err.code === 'SQLITE_CORRUPT') {
      console.error("[DB] Corruption detected. Engaging recovery sequence...");
      try {
        const backupPath = `${DB_PATH}.corrupted.${Date.now()}`;
        if (fs.existsSync(DB_PATH)) {
          fs.renameSync(DB_PATH, backupPath);
          console.log(`[DB] Corrupted file moved to ${backupPath}`);
        }
        db = new Database(DB_PATH);
        console.log("[DB] Recovery successful. New database instantiated.");
      } catch (recoveryErr: any) {
        console.error("[DB] Recovery sequence failed:", recoveryErr.message);
        throw recoveryErr;
      }
    } else {
      throw err;
    }
  }
}

initDatabase();

// Initialize tables
const schemas = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    displayName TEXT,
    photoURL TEXT,
    role TEXT DEFAULT 'user',
    credits REAL DEFAULT 400,
    lastUnitReset TEXT,
    institutionId TEXT,
    doctorPhone TEXT,
    doctorEmail TEXT,
    doctorName TEXT,
    mentorPhone TEXT,
    mentorEmail TEXT,
    mentorName TEXT,
    doctorId TEXT,
    mentorId TEXT,
    phone TEXT,
    enableExternalAI INTEGER DEFAULT 0,
    ollamaUrl TEXT,
    ollamaModel TEXT DEFAULT 'llama3',
    createdAt TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    recipientId TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS records (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    type TEXT NOT NULL,
    value TEXT NOT NULL,
    unit TEXT,
    date TEXT NOT NULL,
    notes TEXT,
    attachmentURL TEXT,
    FOREIGN KEY(userId) REFERENCES users(id)
  )`,
  `CREATE TABLE IF NOT EXISTS credentials (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    publicKey BLOB NOT NULL,
    counter INTEGER NOT NULL,
    transports TEXT,
    FOREIGN KEY(userId) REFERENCES users(id)
  )`,
  `CREATE TABLE IF NOT EXISTS reset_tokens (
    token TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    code TEXT,
    expiresAt TEXT NOT NULL,
    FOREIGN KEY(userId) REFERENCES users(id)
  )`,
  `CREATE TABLE IF NOT EXISTS system_logs (
    id TEXT PRIMARY KEY,
    userId TEXT,
    action TEXT NOT NULL,
    details TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(userId) REFERENCES users(id)
  )`,
  `CREATE TABLE IF NOT EXISTS feedback (
    id TEXT PRIMARY KEY,
    userId TEXT,
    messageId TEXT NOT NULL,
    rating TEXT NOT NULL,
    suggestion TEXT,
    timestamp TEXT NOT NULL,
    FOREIGN KEY(userId) REFERENCES users(id)
  )`,
  `CREATE TABLE IF NOT EXISTS medications (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    name TEXT NOT NULL,
    dosage TEXT,
    frequency TEXT,
    time TEXT,
    category TEXT DEFAULT 'prescription',
    remindersEnabled INTEGER DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(userId) REFERENCES users(id)
  )`,
  `CREATE TABLE IF NOT EXISTS medication_intakes (
    id TEXT PRIMARY KEY,
    medicationId TEXT NOT NULL,
    userId TEXT NOT NULL,
    takenAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(medicationId) REFERENCES medications(id),
    FOREIGN KEY(userId) REFERENCES users(id)
  )`,
  `CREATE TABLE IF NOT EXISTS chat_sessions (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    title TEXT,
    persona TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(userId) REFERENCES users(id)
  )`,
  `CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    sessionId TEXT NOT NULL,
    role TEXT NOT NULL,
    text TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(sessionId) REFERENCES chat_sessions(id)
  )`,
  `CREATE TABLE IF NOT EXISTS user_ai_context (
    userId TEXT PRIMARY KEY,
    mood TEXT DEFAULT 'neutral',
    preferredGreeting TEXT DEFAULT 'Professional',
    lastGreeting DATETIME,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(userId) REFERENCES users(id)
  )`,
  `CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    deadline TEXT NOT NULL,
    priority TEXT DEFAULT 'medium',
    completed INTEGER DEFAULT 0,
    notified INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(userId) REFERENCES users(id)
  )`,
  `CREATE TABLE IF NOT EXISTS workouts (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    type TEXT NOT NULL,
    duration INTEGER NOT NULL,
    calories INTEGER,
    intensity TEXT,
    date TEXT NOT NULL,
    notes TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(userId) REFERENCES users(id)
  )`
];

schemas.forEach(schema => db.exec(schema));

// 5. Unit & Credit System Logic (400 Daily Reset)
const UNIT_COSTS = {
  AI_CHAT: 0.01,        // Move extremely slowly (40,000 interactions per day)
  VOICE_CALL: 0.05,     // (8,000 calls per day)
  IMAGE_GEN: 0.1,      // (4,000 images per day)
  OPERATIONAL: 0.005,  // Background tasks
};

function checkAndResetUnits(userId: string) {
  try {
    const user = db.prepare("SELECT credits, lastUnitReset FROM users WHERE id = ?").get(userId) as any;
    if (!user) return;

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    if (user.lastUnitReset !== today) {
      db.prepare("UPDATE users SET credits = 400, lastUnitReset = ? WHERE id = ?").run(today, userId);
      console.log(`[UNITS] Daily reset triggered for user ${userId}. Balance: 400`);
    }
  } catch (err) {
    console.error("[UNITS] Reset logic failed:", err);
  }
}

function getUserUnits(userId: string): number {
  try {
    checkAndResetUnits(userId);
    const user = db.prepare("SELECT credits FROM users WHERE id = ?").get(userId) as any;
    return user ? user.credits : 0;
  } catch (err) {
    console.error("[UNITS] Error fetching user units:", err);
    return 0;
  }
}

function deductUnits(userId: string, amount: number): { success: boolean; remaining: number } {
  try {
    checkAndResetUnits(userId);
    const currentUnits = getUserUnits(userId);
    if (currentUnits < amount) return { success: false, remaining: currentUnits };
    
    db.prepare("UPDATE users SET credits = credits - ? WHERE id = ?").run(amount, userId);
    return { success: true, remaining: Math.round((currentUnits - amount) * 100) / 100 };
  } catch (err) {
    console.error("[UNITS] Deduction failed:", err);
    return { success: false, remaining: 0 };
  }
}

// --- Neural Background Protocols: Deadline Monitoring ---
function checkTaskDeadlines() {
  console.log("[NEURAL MONITOR] Scanning task deadlines...");
  try {
    const now = new Date();
    const soonThreshold = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Get all incomplete tasks that haven't triggered a "soon" notification
    const pendingTasks = db.prepare(`
      SELECT t.*, u.displayName, u.email 
      FROM tasks t 
      JOIN users u ON t.userId = u.id 
      WHERE t.completed = 0 AND t.notified < 2
    `).all() as any[];

    for (const task of pendingTasks) {
      const deadline = new Date(task.deadline);
      const diff = deadline.getTime() - now.getTime();
      
      let notificationType = "";
      let title = "";
      let content = "";
      
      if (diff < 0 && task.notified < 2) {
        // Overdue
        notificationType = "error";
        title = "🔴 CLINICAL DEADLINE EXCEEDED";
        content = `The protocol '${task.title}' has exceeded its assigned deadline (${deadline.toLocaleString()}). Immediate rectification required.`;
        db.prepare("UPDATE tasks SET notified = 2 WHERE id = ?").run(task.id);
      } else if (diff < 24 * 60 * 60 * 1000 && diff > 0 && task.notified < 1) {
        // Due soon
        notificationType = "warning";
        title = "🟡 NEURAL ALERT: PROTOCOL EXPIRING SOON";
        content = `The protocol '${task.title}' is scheduled for completion within 24 hours (${deadline.toLocaleString()}).`;
        db.prepare("UPDATE tasks SET notified = 1 WHERE id = ?").run(task.id);
      }

      if (notificationType) {
        const notifId = Math.random().toString(36).substring(2, 11);
        db.prepare("INSERT INTO notifications (id, title, content, type, recipientId) VALUES (?, ?, ?, ?, ?)")
          .run(notifId, title, content, notificationType, task.userId);
        
        console.log(`[NEURAL MONITOR] Notification triggered for user ${task.userId}: ${title}`);
        
        // Optionally send email
        if (task.email) {
          sendEmail(task.email, title, content);
        }
      }
    }
  } catch (err) {
    console.error("[NEURAL MONITOR] Deadline scan failed:", err);
  }
}

// Run monitor every 4 hours (to catch "soon" tasks effectively)
setInterval(checkTaskDeadlines, 4 * 60 * 60 * 1000);
// Initial run after brief delay to ensure DB is ready
setTimeout(checkTaskDeadlines, 10000);

// --- Neural Emergency Monitor: Vitals Stability Scan ---
function sendAutonomousAlert(phoneNumber: string, name: string, message: string, type: 'SMS' | 'CALL') {
  const timestamp = new Date().toISOString();
  console.log(`[AUTONOMOUS ${type}] TO: ${name} (${phoneNumber})`);
  console.log(`[CONTENT] ${message}`);
  
  // IN PRODUCTION: Integrate with a provider like Africa's Talking or Twilio here
  // Example for Africa's Talking (UG/KE/NG):
  /*
  const options = {
    apiKey: process.env.AFRICAS_TALKING_API_KEY,
    username: process.env.AFRICAS_TALKING_USERNAME
  };
  const AfricasTalking = require('africastalking')(options);
  if (type === 'SMS') {
    AfricasTalking.SMS.send({ to: [phoneNumber], message });
  } else {
    AfricasTalking.VOICE.call({ callFrom: process.env.SYSTEM_PHONE, callTo: [phoneNumber] });
  }
  */

  db.prepare("INSERT INTO system_logs (id, action, details) VALUES (?, ?, ?)")
    .run(Math.random().toString(36).substring(2, 11), `EMERGENCY_${type}_SENT`, `Sent to ${name} (${phoneNumber}): ${message.substring(0, 50)}...`);
}

function checkPatientStability() {
  console.log("[NEURAL MONITOR] Scanning patient biological stability...");
  try {
    // Get users with vital records within the last hour
    const activeUsers = db.prepare("SELECT DISTINCT userId FROM records WHERE date >= ?").all(new Date(Date.now() - 3600000).toISOString()) as any[];

    for (const { userId } of activeUsers) {
      const user: any = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
      if (!user) continue;

      const latestVitals = db.prepare(`
        SELECT type, value FROM records 
        WHERE userId = ? 
        ORDER BY date DESC LIMIT 20
      `).all(userId) as any[];

      let isCritical = false;
      let reason = "";

      for (const vital of latestVitals) {
        const val = parseFloat(vital.value);
        if (isNaN(val)) continue;

        if (vital.type === 'Heart Rate' && (val > 140 || val < 40)) {
          isCritical = true;
          reason = `Critical Heart Rate detected: ${val} BPM.`;
          break;
        }
        if (vital.type === 'Blood Oxygen' && val < 88) {
          isCritical = true;
          reason = `Hypoxia Alert: Oxygen levels at ${val}%.`;
          break;
        }
        if (vital.type === 'Blood Pressure') {
          // Expecting format "120/80"
          const parts = vital.value.split('/');
          if (parts.length === 2) {
            const sys = parseInt(parts[0]);
            const dia = parseInt(parts[1]);
            if (sys > 180 || dia > 120 || sys < 80) {
              isCritical = true;
              reason = `Hypertensive Crisis detected: ${vital.value} mmHg.`;
              break;
            }
          }
        }
      }

      if (isCritical) {
        const message = `DOCTORIAN EMERGENCY: Patient ${user.displayName}'s vitals have reached a critical state. REASON: ${reason} Immediate intervention required. Location data synced to neural relay.`;
        
        // SMS to Mentor
        if (user.mentorPhone) {
          sendAutonomousAlert(user.mentorPhone, user.mentorName || "Mentor", message, 'SMS');
        }
        // Call to Doctor
        if (user.doctorPhone) {
          sendAutonomousAlert(user.doctorPhone, user.doctorName || "Doctor", message, 'CALL');
          // Also SMS Doctor for redundancy
          sendAutonomousAlert(user.doctorPhone, user.doctorName || "Doctor", message, 'SMS');
        }

        // Global System Alert
        const notifId = Math.random().toString(36).substring(2, 11);
        db.prepare("INSERT INTO notifications (id, title, content, type, recipientId) VALUES (?, ?, ?, ?, ?)")
          .run(notifId, "🔴 CRITICAL INSTABILITY DETECTED", message, "error", userId);
      }
    }
  } catch (err) {
    console.error("[NEURAL MONITOR] Stability scan failed:", err);
  }
}

// Run stability check every 15 minutes
setInterval(checkPatientStability, 15 * 60 * 1000);
// Initial check
setTimeout(checkPatientStability, 15000);

// Keep legacy aliases for compatibility but use new logic (Slow movement enforced)
const CREDIT_COSTS = {
  AI_CHAT: 0.01,        
  VOICE_CALL: 0.05,     
  IMAGE_GEN: 0.1,      
  OPERATIONAL_IDEAS: 0.005, 
};

function getUserCredits(userId: string): number {
  return getUserUnits(userId);
}

function deductCredits(userId: string, amount: number): { success: boolean; remaining: number } {
  return deductUnits(userId, amount);
}

// Migration: Add columns if they don't exist
const migrations = [
  "ALTER TABLE records ADD COLUMN attachmentURL TEXT",
  "ALTER TABLE reset_tokens ADD COLUMN code TEXT",
  "ALTER TABLE users ADD COLUMN doctorPhone TEXT",
  "ALTER TABLE users ADD COLUMN doctorEmail TEXT",
  "ALTER TABLE users ADD COLUMN mentorPhone TEXT",
  "ALTER TABLE users ADD COLUMN mentorEmail TEXT",
  "ALTER TABLE users ADD COLUMN doctorId TEXT",
  "ALTER TABLE notifications ADD COLUMN recipientId TEXT",
  "ALTER TABLE users ADD COLUMN phone TEXT",
  "ALTER TABLE users ADD COLUMN subscriptionTier TEXT DEFAULT 'free'",
  "ALTER TABLE users ADD COLUMN subscriptionStatus TEXT DEFAULT 'none'",
  "ALTER TABLE users ADD COLUMN lastPaymentDate TEXT",
  "ALTER TABLE users ADD COLUMN paymentEvidence TEXT",
  "ALTER TABLE users ADD COLUMN credits REAL DEFAULT 400",
  "ALTER TABLE users ADD COLUMN institutionId TEXT",
  "ALTER TABLE users ADD COLUMN lastUnitReset TEXT",
  "ALTER TABLE medications ADD COLUMN remindersEnabled INTEGER DEFAULT 1",
  "ALTER TABLE users ADD COLUMN allergies TEXT",
  "ALTER TABLE users ADD COLUMN conditions TEXT",
  "ALTER TABLE users ADD COLUMN bloodGroup TEXT",
  "ALTER TABLE users ADD COLUMN hospitalPreference TEXT",
  "ALTER TABLE users ADD COLUMN enableExternalAI INTEGER DEFAULT 0"
];

migrations.forEach(sql => {
  try {
    db.prepare(sql).run();
  } catch (e) {
    // Ignore error if column already exists
  }
});

// Credits Migration: Ensure all existing users have the new 400-unit minimum
try {
  db.prepare("UPDATE users SET credits = 400 WHERE credits < 400").run();
  console.log("[DB MIGRATION] All accounts synchronized to 400-unit baseline.");
} catch (e) {
  console.warn("[DB MIGRATION] Credits sync bypassed:", e);
}

db.prepare(`
  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    userId TEXT,
    amount REAL,
    currency TEXT,
    status TEXT,
    externalId TEXT,
    tier TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS knowledge_base (
    id TEXT PRIMARY KEY,
    userId TEXT,
    title TEXT,
    content TEXT,
    category TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS developer_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    apiKey TEXT UNIQUE NOT NULL,
    label TEXT,
    lastUsed DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS doctors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    whatsappNumber TEXT NOT NULL,
    specialization TEXT NOT NULL,
    location TEXT NOT NULL,
    imageUrl TEXT,
    active INTEGER DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();



const RP_NAME = "Doctorian";

// In-memory store for challenges (use a real session/redis in production)
const challenges = new Map<string, string>();

async function startServer() {
  console.log("[SERVER] Initializing Express Application...");
  const app = express();
  app.set('trust proxy', 1);

  app.use(express.json());
  app.use(cookieParser());
  app.use(cors({
    origin: true,
    credentials: true
  }));

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) {
      // Don't warn for common background checks to avoid log noise, just 401
      if (!['/api/notifications', '/api/medications', '/api/tasks', '/api/auth/me'].includes(req.path)) {
        console.warn(`[AUTH] Unauthorized access attempt to ${req.path} - No token found`);
      }
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err: any) {
      console.error(`[AUTH] Token verification failed for ${req.path}:`, err.message);
      // Clear the invalid cookie to allow user to recover via re-login
      res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "none"
      });
      res.status(401).json({ error: "Invalid token" });
    }
  };

  const requireAdmin = (req: any, res: any, next: any) => {
    authenticate(req, res, () => {
      if (req.user.role !== 'admin' && req.user.role !== 'doctor') {
        console.warn(`[AUTH] Forbidden access attempt to ${req.path} by user ${req.user.id} (Role: ${req.user.role})`);
        return res.status(403).json({ error: "Forbidden: Admin access required" });
      }
      next();
    });
  };

  app.post("/api/local/chat", async (req, res) => {
    res.status(501).json({ error: "Local AI subsystems decommissioned for architectural rebuild." });
  });

  app.post("/api/local/index", async (req, res) => {
    res.status(501).json({ error: "Local indexing decommissioned." });
  });

  // API Routes
  app.get("/api/health", (req, res) => res.json({ status: "ok" }));

  // Knowledge Base Routes for Training
  app.get("/api/ai/knowledge", authenticate, (req: any, res) => {
    try {
      // Admins and Doctors see all, users see their own + system
      const isAdminOrDoctor = req.user.role === 'admin' || req.user.role === 'doctor';
      let records;
      if (isAdminOrDoctor || req.user.email.toLowerCase() === "gloriajayakullo@gmail.com") {
        records = db.prepare("SELECT * FROM knowledge_base ORDER BY createdAt DESC").all();
      } else {
        records = db.prepare("SELECT * FROM knowledge_base WHERE userId = ? OR userId = 'system' ORDER BY createdAt DESC").all(req.user.id);
      }
      res.json(records);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch neural registry" });
    }
  });

  app.post("/api/ai/knowledge", authenticate, (req: any, res) => {
    const { title, content, category } = req.body;
    if (!title || !content) return res.status(400).json({ error: "Neural node payload incomplete (Title and Logic required)" });
    
    // Non-admins can only add their own knowledge
    const id = `kb_${Date.now()}`;
    const userId = req.user.id;
    
    try {
      db.prepare("INSERT INTO knowledge_base (id, userId, title, content, category) VALUES (?, ?, ?, ?, ?)")
        .run(id, userId, title, content, category || 'personal');
      res.json({ success: true, id });
    } catch (err) {
      res.status(500).json({ error: "Neural write failure: Database commit failed." });
    }
  });

  app.delete("/api/ai/knowledge/:id", authenticate, (req: any, res) => {
    try {
      const isAdmin = req.user.role === 'admin' || req.user.role === 'doctor' || req.user.email.toLowerCase() === "gloriajayakullo@gmail.com";
      
      // Check ownership or admin
      const record: any = db.prepare("SELECT userId FROM knowledge_base WHERE id = ?").get(req.params.id);
      if (!record) return res.status(404).json({ error: "Node not found" });
      
      if (!isAdmin && record.userId !== req.user.id) {
        return res.status(403).json({ error: "Action Restricted: Unauthorized neural decoupling." });
      }

      db.prepare("DELETE FROM knowledge_base WHERE id = ?")
        .run(req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Neural write failure: Decoupling failed." });
    }
  });

  app.post("/api/auth/signup", async (req, res) => {
    const { email, password, displayName } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });
    if (!isPasswordSecure(password)) {
      return res.status(400).json({ error: "Password must be at least 8 characters and include letters, numbers, and symbols" });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const id = Math.random().toString(36).substring(2, 15);
      const createdAt = new Date().toISOString();

      const stmt = db.prepare("INSERT INTO users (id, email, password, displayName, createdAt) VALUES (?, ?, ?, ?, ?)");
      stmt.run(id, email, hashedPassword, displayName || email.split("@")[0], createdAt);

      // Send Notifications
      const adminEmail = process.env.ADMIN_EMAIL || "Josephhaxzy@gmail.com";
      const userDisplayName = displayName || email.split("@")[0];

      // Notify Admin
      sendEmail(
        adminEmail,
        "New User Signup - Doctorian",
        `A new user has signed up:\n\nEmail: ${email}\nDisplay Name: ${userDisplayName}\nID: ${id}\nTime: ${createdAt}`
      );

      // Notify User
      sendEmail(
        email,
        "Welcome to Doctorian!",
        `Hello ${userDisplayName},\n\nWelcome to Doctorian! Your account has been successfully created.\n\nWe are here to help you monitor your health and provide intelligent insights.\n\nBest regards,\nThe Doctorian Team`
      );

      const isAdmin = email.toLowerCase() === "gloriajayakullo@gmail.com";
      const role = isAdmin ? "admin" : "user";
      const token = jwt.sign({ id, email, role }, JWT_SECRET, { expiresIn: "7d" });
      res.cookie("token", token, { 
        httpOnly: true, 
        secure: true, // Always use secure in this environment as it's HTTPS
        sameSite: "none", // Needed for iframe context
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      res.json({ 
        user: { 
          id, 
          email, 
          displayName, 
          role, 
          credits: 400,
          subscriptionTier: "free",
          subscriptionStatus: "none",
          createdAt 
        } 
      });
    } catch (err: any) {
      if (err.message.includes("UNIQUE constraint failed")) {
        return res.status(400).json({ error: "Email already exists" });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/social", async (req, res) => {
    const { email, displayName, photoURL, providerId } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    try {
      let user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
      const createdAt = new Date().toISOString();

      if (!user) {
        // Create new user for social login
        const id = Math.random().toString(36).substring(2, 15);
        // We set a random password hash that can't be guessed, as they use social auth
        const dummyPassword = await bcrypt.hash(Math.random().toString(36), 10);
        
        const credits = 400;
        const stmt = db.prepare("INSERT INTO users (id, email, password, displayName, photoURL, credits, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)");
        stmt.run(id, email, dummyPassword, displayName || email.split("@")[0], photoURL || null, credits, createdAt);
        
        user = { id, email, displayName, photoURL, role: "user", credits, createdAt };
        
        // Notify Admin and User
        const adminEmail = process.env.ADMIN_EMAIL || "Josephhaxzy@gmail.com";
        sendEmail(
          adminEmail, 
          "New Social Signup - Doctorian Medical AI", 
          `New user via ${providerId}:\n\nEmail: ${email}\nName: ${displayName}`
        );
        sendEmail(
          email,
          "Welcome to Doctorian Medical AI!",
          `Hello ${displayName},\n\nYour account has been created via ${providerId}.\n\nBest regards,\nThe Doctorian Medical AI Team`
        );
      } else {
        // Update existing user with latest social info if needed
        db.prepare("UPDATE users SET displayName = COALESCE(?, displayName), photoURL = COALESCE(?, photoURL) WHERE id = ?")
          .run(displayName, photoURL, user.id);
        
        user = db.prepare("SELECT * FROM users WHERE id = ?").get(user.id);
      }

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
      res.cookie("token", token, { 
        httpOnly: true, 
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (err: any) {
      console.error("Social login backend error:", err);
      res.status(500).json({ error: "External authentication failed" });
    }
  });

  // Native Google OAuth (Direct without Firebase)
  app.get("/api/auth/google/url", (req, res) => {
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const appUrl = process.env.APP_URL || "http://localhost:3000";
    
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ error: "Google OAuth not configured" });
    }

    const options = {
      redirect_uri: `${appUrl}/auth/google/callback`,
      client_id: process.env.GOOGLE_CLIENT_ID,
      access_type: "offline",
      response_type: "code",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ].join(" "),
    };

    const qs = new URLSearchParams(options);
    res.json({ url: `${rootUrl}?${qs.toString()}` });
  });

  // --- OpenAI Compatible Endpoints for VS Code / Extensions ---
  app.post("/api/v1/chat/completions", async (req, res) => {
    const authHeader = req.headers.authorization;
    const xApiKey = req.headers['x-api-key'];
    const apiKey = xApiKey || authHeader?.split(' ')[1];

    if (!apiKey) {
      return res.status(401).json({ error: { message: "Missing API Key", type: "invalid_request_error" } });
    }

    // Find user by API key
    const keyEntry = db.prepare("SELECT userId FROM api_keys WHERE apiKey = ?").get(apiKey) as any;
    if (!keyEntry) {
      return res.status(401).json({ error: { message: "Invalid API Key", type: "invalid_request_error" } });
    }

    const userId = keyEntry.userId;
    const { messages, model, stream, temperature } = req.body;

    // Credit Check
    const credits = getUserCredits(userId);
    if (credits <= 0) {
      return res.status(403).json({ error: { message: "Neural units exhausted", type: "insufficient_quota" } });
    }

    // Map OpenAI model to our engines
    let targetModel = model || PRIMARY_ENGINE;
    if (targetModel.includes("gpt") || targetModel.includes("llama")) targetModel = PRIMARY_ENGINE;
    if (targetModel.includes("gemma")) targetModel = MEDICAL_REASONING_ENGINE;

    const systemInstruction = `You are Doctorian, a Universal Medical Intelligence Core. 
Powered by Meta Llama 3.1 and Google Gemma 2. 
You are being accessed via an external neural link (e.g., VS Code or Browser Extension).
Focus on providing high-fidelity clinical and technical insights related to medical software engineering and bio-systems.`;

    try {
      if (stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const aiStream = callAIStream({
          messages: messages.map((m: any) => ({ role: m.role === 'assistant' ? 'bot' : m.role, text: m.content })),
          systemInstruction,
          modelName: targetModel,
          temperature: temperature || 0.7
        });

        for await (const chunk of aiStream) {
          const data = {
            id: `chatcmpl-${Math.random().toString(36).substring(7)}`,
            object: "chat.completion.chunk",
            created: Math.floor(Date.now() / 1000),
            model: targetModel,
            choices: [{ delta: { content: chunk }, index: 0, finish_reason: null }]
          };
          res.write(`data: ${JSON.stringify(data)}\n\n`);
        }
        res.write(`data: [DONE]\n\n`);
        deductCredits(userId, 1);
        return res.end();
      } else {
        const responseText = await callAI({
          messages: messages.map((m: any) => ({ role: m.role === 'assistant' ? 'bot' : m.role, text: m.content })),
          systemInstruction,
          modelName: targetModel,
          temperature: temperature || 0.7
        });

        deductCredits(userId, 1);
        return res.json({
          id: `chatcmpl-${Math.random().toString(36).substring(7)}`,
          object: "chat.completion",
          created: Math.floor(Date.now() / 1000),
          model: targetModel,
          choices: [{
            message: { role: "assistant", content: responseText },
            index: 0,
            finish_reason: "stop"
          }],
          usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
        });
      }
    } catch (err: any) {
      return res.status(500).json({ error: { message: err.message, type: "server_error" } });
    }
  });

  app.get("/api/v1/models", (req, res) => {
    res.json({
      object: "list",
      data: [
        { id: "llama-3.1-70b", object: "model", created: 1721692800, owned_by: "meta" },
        { id: "gemma-2-27b", object: "model", created: 1721692800, owned_by: "google" }
      ]
    });
  });

  app.get(["/auth/google/callback", "/auth/google/callback/"], async (req, res) => {
    const code = req.query.code as string;
    const appUrl = process.env.APP_URL || "http://localhost:3000";

    if (!code) return res.redirect("/");

    try {
      // Exchange code for tokens
      const tokenUrl = "https://oauth2.googleapis.com/token";
      const values = {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${appUrl}/auth/google/callback`,
        grant_type: "authorization_code",
      };

      const response = await axios.post(tokenUrl, new URLSearchParams(values).toString(), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const { access_token } = response.data;

      // Get user info
      const userInfoUrl = `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`;
      const userResponse = await axios.get(userInfoUrl);

      const googleUser = userResponse.data;

      // Handle user in DB
      let user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(googleUser.email);
      const createdAt = new Date().toISOString();

      if (!user) {
        const id = Math.random().toString(36).substring(2, 15);
        const dummyPassword = await bcrypt.hash(Math.random().toString(36), 10);
        const credits = 400;
        db.prepare("INSERT INTO users (id, email, password, displayName, photoURL, credits, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)")
          .run(id, googleUser.email, dummyPassword, googleUser.name, googleUser.picture || null, credits, createdAt);
        
        user = { id, email: googleUser.email, displayName: googleUser.name, role: "user", credits, createdAt };

        // Notify Admin
        const adminEmail = process.env.ADMIN_EMAIL || "Josephhaxzy@gmail.com";
        sendEmail(
          adminEmail, 
          "New Direct Google Signup - Doctorian", 
          `New user via Direct Google OAuth:\n\nEmail: ${googleUser.email}\nName: ${googleUser.name}`
        );
      } else {
        db.prepare("UPDATE users SET displayName = COALESCE(?, displayName), photoURL = COALESCE(?, photoURL) WHERE id = ?")
          .run(googleUser.name, googleUser.picture || null, user.id);
        user = db.prepare("SELECT * FROM users WHERE id = ?").get(user.id);
      }

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
      res.cookie("token", token, { 
        httpOnly: true, 
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.send(`
        <html>
          <body style="background: #020617; color: white; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; margin: 0;">
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <div style="text-align: center; background: #0f172a; padding: 40px; border-radius: 24px; border: 1px solid #1e293b; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
              <div style="width: 64px; height: 64px; background: #2563eb; border-radius: 16px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
                 <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
              </div>
              <h2 style="margin: 0 0 8px; font-weight: 900; letter-spacing: -0.025em; text-transform: uppercase;">Neural Sync Complete</h2>
              <p style="color: #94a3b8; font-size: 14px; margin: 0;">Identity verified. Returning to Doctorian Nexus...</p>
            </div>
          </body>
        </html>
      `);
    } catch (err: any) {
      console.error("Google OAuth callback error:", err.response?.data || err.message);
      res.status(500).send("Authentication failed. Please try again.");
    }
  });

  // Native GitHub OAuth
  app.get("/api/auth/github/url", (req, res) => {
    const rootUrl = "https://github.com/login/oauth/authorize";
    const appUrl = process.env.APP_URL || "http://localhost:3000";
    
    if (!process.env.GITHUB_CLIENT_ID) {
      return res.status(500).json({ error: "GitHub OAuth not configured" });
    }

    const options = {
      client_id: process.env.GITHUB_CLIENT_ID,
      redirect_uri: `${appUrl}/auth/github/callback`,
      scope: "read:user user:email",
    };

    const qs = new URLSearchParams(options);
    res.json({ url: `${rootUrl}?${qs.toString()}` });
  });

  app.get(["/auth/github/callback", "/auth/github/callback/"], async (req, res) => {
    const code = req.query.code as string;
    const appUrl = process.env.APP_URL || "http://localhost:3000";

    if (!code) return res.redirect("/");

    try {
      // Exchange code for access token
      const tokenUrl = "https://github.com/login/oauth/access_token";
      const values = {
        code,
        client_id: process.env.GITHUB_CLIENT_ID!,
        client_secret: process.env.GITHUB_CLIENT_SECRET!,
        redirect_uri: `${appUrl}/auth/github/callback`,
      };

      const response = await axios.post(tokenUrl, values, {
        headers: { Accept: "application/json" },
      });

      const { access_token } = response.data;

      // Get user info
      const userResponse = await axios.get("https://api.github.com/user", {
        headers: { Authorization: `token ${access_token}` },
      });
      const githubUser = userResponse.data;

      // Get email
      const emailResponse = await axios.get("https://api.github.com/user/emails", {
        headers: { Authorization: `token ${access_token}` },
      });
      const primaryEmail = emailResponse.data.find((e: any) => e.primary && e.verified)?.email || emailResponse.data[0]?.email;

      if (!primaryEmail) throw new Error("No verified email found from GitHub");

      // Handle user in DB
      let user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(primaryEmail);
      const createdAt = new Date().toISOString();

      if (!user) {
        const id = Math.random().toString(36).substring(2, 15);
        const dummyPassword = await bcrypt.hash(Math.random().toString(36), 10);
        const credits = 400;
        db.prepare("INSERT INTO users (id, email, password, displayName, photoURL, credits, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)")
          .run(id, primaryEmail, dummyPassword, githubUser.name || githubUser.login, githubUser.avatar_url || null, credits, createdAt);
        
        user = { id, email: primaryEmail, displayName: githubUser.name || githubUser.login, role: "user", credits, createdAt };
      } else {
        db.prepare("UPDATE users SET displayName = COALESCE(?, displayName), photoURL = COALESCE(?, photoURL) WHERE id = ?")
          .run(githubUser.name || githubUser.login, githubUser.avatar_url || null, user.id);
        user = db.prepare("SELECT * FROM users WHERE id = ?").get(user.id);
      }

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
      res.cookie("token", token, { 
        httpOnly: true, 
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.send(`
        <html>
          <body style="background: #020617; color: white; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; margin: 0;">
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <div style="text-align: center; background: #0f172a; padding: 40px; border-radius: 24px; border: 1px solid #1e293b; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
               <div style="width: 64px; height: 64px; background: #000000; border-radius: 16px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
                 <svg height="32" viewBox="0 0 16 16" version="1.1" width="32" fill="white" aria-hidden="true"><path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>
              </div>
              <h2 style="margin: 0 0 8px; font-weight: 900; letter-spacing: -0.025em; text-transform: uppercase;">Neural Sync Complete</h2>
              <p style="color: #94a3b8; font-size: 14px; margin: 0;">GitHub verified. Returning to Doctorian Nexus...</p>
            </div>
          </body>
        </html>
      `);
    } catch (err: any) {
      console.error("GitHub OAuth callback error:", err.response?.data || err.message);
      res.status(500).send("Authentication failed. Please try again.");
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    try {
      const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
      res.cookie("token", token, { 
        httpOnly: true, 
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Send Login Notifications
      const adminEmail = process.env.ADMIN_EMAIL || "Josephhaxzy@gmail.com";
      const loginTime = new Date().toISOString();

      // Notify Admin
      sendEmail(
        adminEmail,
        "User Login - Doctorian",
        `A user has logged in:\n\nEmail: ${user.email}\nDisplay Name: ${user.displayName}\nTime: ${loginTime}`
      );

      // Notify User
      sendEmail(
        user.email,
        "New Login Detected - Doctorian",
        `Hello ${user.displayName},\n\nA new login was detected on your Doctorian account at ${loginTime}.\n\nIf this was not you, please contact support immediately.`
      );

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    try {
      const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
      if (!user) {
        // For security, don't reveal if user exists
        return res.json({ message: "If an account exists with that email, a verification code has been sent." });
      }

      // Generate a 6-digit numeric code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const token = Math.random().toString(36).substring(2, 15);
      const expiresAt = new Date(Date.now() + 600000).toISOString(); // 10 minutes

      // Delete any existing tokens for this user
      db.prepare("DELETE FROM reset_tokens WHERE userId = ?").run(user.id);
      db.prepare("INSERT INTO reset_tokens (token, userId, code, expiresAt) VALUES (?, ?, ?, ?)").run(token, user.id, code, expiresAt);

      await sendEmail(
        email,
        "Password Reset Code - Doctorian",
        `Hello ${user.displayName},\n\nYou requested a password reset. Your verification code is:\n\n${code}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this, please ignore this email.`
      );

      res.json({ message: "If an account exists with that email, a verification code has been sent." });
    } catch (err) {
      console.error("Forgot password error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/verify-reset-code", async (req, res) => {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: "Email and code required" });

    try {
      const user: any = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
      if (!user) return res.status(400).json({ error: "Invalid email or code" });

      const resetToken: any = db.prepare("SELECT * FROM reset_tokens WHERE userId = ? AND code = ?").get(user.id, code);
      if (!resetToken || new Date(resetToken.expiresAt) < new Date()) {
        return res.status(400).json({ error: "Invalid or expired code" });
      }

      res.json({ success: true, token: resetToken.token });
    } catch (err) {
      console.error("Verify code error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: "Token and password required" });
    if (!isPasswordSecure(password)) {
      return res.status(400).json({ error: "Password must be at least 8 characters and include letters, numbers, and symbols" });
    }

    try {
      const resetToken: any = db.prepare("SELECT * FROM reset_tokens WHERE token = ?").get(token);
      if (!resetToken || new Date(resetToken.expiresAt) < new Date()) {
        return res.status(400).json({ error: "Invalid or expired token" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hashedPassword, resetToken.userId);
      db.prepare("DELETE FROM reset_tokens WHERE token = ?").run(token);

      res.json({ success: true, message: "Password reset successfully" });
    } catch (err) {
      console.error("Reset password error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token", { 
      httpOnly: true, 
      secure: true, 
      sameSite: "none" 
    });
    res.json({ success: true });
  });

  // --- MTN MoMo Ericsson API Implementation ---
  app.post("/api/billing/mtn-payment", authenticate, async (req: any, res) => {
    const { phone, amount, currency, tier } = req.body;
    const userId = req.user.id;

    const subscriptionKey = process.env.MOMO_SUBSCRIPTION_KEY;
    const apiUserId = process.env.MOMO_API_USER_ID;
    const apiKey = process.env.MOMO_API_KEY;
    const environment = process.env.MOMO_ENVIRONMENT || 'sandbox';
    const baseUrl = process.env.MOMO_BASE_URL || 'https://ericssondeveloperapi.azure-api.net';
    const momoCurrency = process.env.MOMO_CURRENCY || 'EUR';

    if (!subscriptionKey || !apiUserId || !apiKey) {
      console.warn("MTN MoMo Credentials missing in server environment.");
      return res.status(400).json({ 
        error: "MTN MoMo Gateway not configured on server.",
        details: "Requires MOMO_SUBSCRIPTION_KEY, MOMO_API_USER_ID, and MOMO_API_KEY."
      });
    }

    try {
      // 1. Get Access Token (Basic Auth)
      const authHeader = Buffer.from(`${apiUserId}:${apiKey}`).toString('base64');
      const tokenResponse = await axios.post(`${baseUrl}/collection/token/`, {}, {
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Ocp-Apim-Subscription-Key': subscriptionKey
        }
      });

      const accessToken = tokenResponse.data.access_token;
      const externalId = `DOC-MOMO-${Date.now()}-${userId}`;

      // 2. Request Payment (Collection)
      const paymentBody = {
        externalTransactionId: externalId,
        money: {
          amount: amount.toString(),
          currency: momoCurrency
        },
        customerReference: phone || "DoctorianPatient",
        serviceProviderUserName: "DoctorianMedicalAI"
      };

      await axios.post(`${baseUrl}/collection-ctb/v2_0/payment`, paymentBody, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Callback-Url': process.env.MOMO_CALLBACK_URL || '5000',
          'X-Reference-Id': externalId,
          'X-Target-Environment': environment,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Ocp-Apim-Subscription-Key': subscriptionKey
        }
      });

      // 3. Log the transaction (payments table exists)
      db.prepare("INSERT INTO payments (id, userId, amount, currency, status, externalId, tier) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .run(externalId, userId, amount, currency, 'pending', externalId, tier);

      res.json({ 
        success: true, 
        message: "Payment request pushed to your device. Please confirm with your PIN.",
        externalId: externalId
      });

    } catch (err: any) {
      console.error("MTN MoMo Payment Error:", err.response?.data || err.message);
      res.status(err.response?.status || 500).json({ 
        error: "MTN MoMo payment initiation failed.", 
        details: err.response?.data || err.message 
      });
    }
  });

  app.get("/api/payment/mtn/status/:externalId", authenticate, (req: any, res) => {
    const { externalId } = req.params;
    const userId = req.user.id;

    try {
      const payment: any = db.prepare("SELECT * FROM payments WHERE externalId = ? AND userId = ?").get(externalId, userId);
      
      if (!payment) return res.status(404).json({ error: "Transaction not found" });

      // In a real app, we'd poll MTN API here to see if status changed to 'SUCCESSFUL'
      // For this session, we'll simulate a 70% chance of success if polled after 10s
      const age = Date.now() - parseInt(externalId.split('-')[1]);
      if (payment.status === 'pending' && age > 10000) {
         // Auto-approve in mock mode
         db.prepare("UPDATE payments SET status = 'completed' WHERE externalId = ?").run(externalId);
      // Check if this is a credit bundle purchase
      if (payment.tier.startsWith('bundle_')) {
        const creditMap: Record<string, number> = {
          'bundle_starter': 20,
          'bundle_pro': 50,
          'bundle_unlimited': 200
        };
        const creditsToAdd = creditMap[payment.tier] || 0;
        db.prepare("UPDATE users SET credits = credits + ? WHERE id = ?").run(creditsToAdd, userId);
        
        // Create notification for user
        const notifId = Math.random().toString(36).substring(2, 15);
        db.prepare("INSERT INTO notifications (id, title, content, type) VALUES (?, ?, ?, ?)")
          .run(notifId, 'Credits Recharged', `Successfully added ${creditsToAdd} consultation credits to your neural wallet.`, 'success');
      } else {
        db.prepare("UPDATE users SET subscriptionTier = ?, subscriptionStatus = 'active' WHERE id = ?").run(payment.tier, userId);
        
        // Create notification for user
        const notifId = Math.random().toString(36).substring(2, 15);
        db.prepare("INSERT INTO notifications (id, title, content, type) VALUES (?, ?, ?, ?)")
          .run(notifId, 'Subscription Activated', `Your ${payment.tier.toUpperCase()} neural link has been established successfully. Enjoy your premium features.`, 'success');
      }

         payment.status = 'completed';
      }

      res.json({ status: payment.status });
    } catch (err) {
       res.status(500).json({ error: "Status check failed" });
    }
  });

  app.get("/api/billing/history", authenticate, (req: any, res) => {
    const userId = req.user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    try {
      const total = db.prepare("SELECT COUNT(*) as count FROM payments WHERE userId = ?").get(userId) as any;
      const history = db.prepare("SELECT * FROM payments WHERE userId = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?")
        .all(userId, limit, offset);
      
      res.json({ 
        history,
        pagination: {
          total: total.count,
          page,
          limit,
          pages: Math.ceil(total.count / limit)
        }
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch billing history" });
    }
  });

  app.get("/api/billing/export", authenticate, (req: any, res) => {
    const userId = req.user.id;
    try {
      const history = db.prepare("SELECT * FROM payments WHERE userId = ? ORDER BY createdAt DESC").all(userId) as any[];
      let csv = "ID,Date,Tier,Amount,Currency,Status,ExternalID\n";
      history.forEach(p => {
        csv += `${p.id},${p.createdAt},${p.tier},${p.amount},${p.currency},${p.status},${p.externalId}\n`;
      });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=billing-history.csv');
      res.send(csv);
    } catch (err) {
      res.status(500).json({ error: "Export failed" });
    }
  });

  app.post("/api/billing/subscribe", authenticate, async (req: any, res) => {
    const { planId, transaction_id } = req.body;
    if (!['catalyst', 'quantum', 'core'].includes(planId)) {
      return res.status(400).json({ error: "Invalid plan" });
    }

    try {
      const flw = new Flutterwave(
        process.env.VITE_FLUTTERWAVE_PUBLIC_KEY || "FLWPUBK_TEST-SANDBOX-KEY",
        process.env.FLUTTERWAVE_SECRET_KEY || "FLWSECK_TEST-SANDBOX-KEY"
      );

      // Verify if payment is non-free
      if (planId !== 'core' && transaction_id) {
        const response = await flw.Transaction.verify({ id: transaction_id });
        if (response.status !== "success") {
          return res.status(400).json({ error: "Payment verification failed" });
        }
      }

      const tierMap: Record<string, string> = {
        'core': 'free',
        'catalyst': 'pro',
        'quantum': 'enterprise'
      };
      const tier = tierMap[planId];
      const now = new Date().toISOString();
      
      db.prepare("UPDATE users SET subscriptionTier = ?, subscriptionStatus = 'active', lastPaymentDate = ? WHERE id = ?")
        .run(tier, now, req.user.id);
      
      // Also add some credits 
      const creditBonus = planId === 'quantum' ? 500 : (planId === 'catalyst' ? 100 : 0);
      if (creditBonus > 0) {
        db.prepare("UPDATE users SET credits = credits + ? WHERE id = ?").run(creditBonus, req.user.id);
      }

      // Record the payment
      const paymentId = Math.random().toString(36).substring(2, 11);
      const amount = planId === 'quantum' ? 85000 : (planId === 'catalyst' ? 15000 : 0);
      
      db.prepare("INSERT INTO payments (id, userId, tier, amount, currency, status, externalId) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .run(paymentId, req.user.id, tier, amount, 'UGX', 'completed', transaction_id || `SUB-${paymentId}`);

      res.json({ success: true, tier, creditsAdded: creditBonus });
    } catch (err) {
      console.error("Subscription error:", err);
      res.status(500).json({ error: "Failed to process subscription" });
    }
  });

  // Flutterwave Initialization and Link Generation
  app.post("/api/billing/create-payment-link", authenticate, async (req: any, res) => {
    const { planId } = req.body;
    const plan = {
      'catalyst': { amount: 15000, name: 'Neural Catalyst' },
      'quantum': { amount: 85000, name: 'Universal Quantum' }
    }[planId as 'catalyst' | 'quantum'];

    if (!plan) return res.status(400).json({ error: "Invalid plan" });

    try {
      const tx_ref = `MEDICAL-${req.user.id}-${Date.now()}`;
      const response = await axios.post("https://api.flutterwave.com/v3/payments", {
        tx_ref,
        amount: plan.amount,
        currency: "UGX",
        redirect_url: `${req.headers.origin || 'https://medical-ai.studio'}/billing?status=success&tx_ref=${tx_ref}`,
        payment_options: "mobilemoneyuganda, card, ussd",
        customer: {
          email: req.user.email,
          name: req.user.displayName || "Patient"
        },
        meta: {
          userId: req.user.id,
          planId: planId
        },
        customizations: {
          title: "Doctorian Protocol",
          description: `Activation of ${plan.name} Neural Framework`,
          logo: "https://medical-ai.studio/logo.svg"
        }
      }, {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          "Content-Type": "application/json"
        }
      });

      res.json({ link: response.data.data.link });
    } catch (err: any) {
      console.error("Link generation error:", err.response?.data || err.message);
      res.status(500).json({ error: "Failed to generate payment link" });
    }
  });

  // Flutterwave Webhook
  app.post("/api/payment/flutterwave/webhook", async (req, res) => {
    const secretHash = process.env.FLUTTERWAVE_WEBHOOK_HASH;
    const signature = req.headers['verif-hash'];
    
    if (secretHash && signature !== secretHash) {
      return res.status(401).send("Invalid signature");
    }

    const payload = req.body;
    if (payload.event === "charge.completed" && payload.data.status === "successful") {
      const { amount, currency, id: transactionId, customer, meta } = payload.data;
      const userId = meta?.userId;
      
      try {
        const user: any = userId 
          ? db.prepare("SELECT * FROM users WHERE id = ?").get(userId)
          : db.prepare("SELECT * FROM users WHERE email = ?").get(customer.email);
        
        if (user) {
          let tier = 'pro';
          if (amount >= 80000) tier = 'enterprise';
          else if (amount >= 14000) tier = 'pro';
          
          const now = new Date().toISOString();
          db.prepare("UPDATE users SET subscriptionTier = ?, subscriptionStatus = 'active', lastPaymentDate = ? WHERE id = ?")
            .run(tier, now, user.id);
            
          db.prepare("INSERT INTO payments (id, userId, tier, amount, currency, status, externalId) VALUES (?, ?, ?, ?, ?, ?, ?)")
            .run(Math.random().toString(36).substring(2, 11), user.id, tier, amount, currency, 'completed', transactionId.toString());
        }
      } catch (err) {
        console.error("[WEBHOOK ERROR]", err);
      }
    }
    res.status(200).send("OK");
  });

  // --- Neural Greeting & Context Learning ---
  app.get("/api/ai/context", authenticate, (req: any, res) => {
    try {
      const userId = req.user.id;
      const context = db.prepare("SELECT * FROM user_ai_context WHERE userId = ?").get(userId) as any;
      res.json(context || { mood: 'neutral', preferredGreeting: 'Professional', lastGreeting: null });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch neural context" });
    }
  });

  app.post("/api/ai/context", authenticate, (req: any, res) => {
    try {
      const userId = req.user.id;
      const { mood, preferredGreeting } = req.body;
      const existing = db.prepare("SELECT userId FROM user_ai_context WHERE userId = ?").get(userId);
      
      if (existing) {
        db.prepare("UPDATE user_ai_context SET mood = COALESCE(?, mood), preferredGreeting = COALESCE(?, preferredGreeting), updatedAt = CURRENT_TIMESTAMP WHERE userId = ?")
          .run(mood, preferredGreeting, userId);
      } else {
        db.prepare("INSERT INTO user_ai_context (userId, mood, preferredGreeting) VALUES (?, ?, ?)")
          .run(userId, mood || 'neutral', preferredGreeting || 'Professional');
      }
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to update neural context" });
    }
  });

  app.get("/api/admin/billing/all", authenticate, requireAdmin, (req: any, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    try {
      const total = db.prepare("SELECT COUNT(*) as count FROM payments").get() as any;
      const payments = db.prepare(`
        SELECT p.*, u.email as userEmail, u.displayName as userName 
        FROM payments p 
        LEFT JOIN users u ON p.userId = u.id 
        ORDER BY p.createdAt DESC 
        LIMIT ? OFFSET ?
      `).all(limit, offset);
      
      res.json({ 
        payments,
        pagination: {
          total: total.count,
          page,
          limit,
          pages: Math.ceil(total.count / limit)
        }
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch all billing records" });
    }
  });

  // --- Task Management Endpoints ---
  app.get("/api/tasks", authenticate, (req: any, res) => {
    try {
      const tasks = db.prepare("SELECT * FROM tasks WHERE userId = ? ORDER BY deadline ASC").all(req.user.id);
      res.json(tasks);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch neural protocols" });
    }
  });

  app.post("/api/tasks", authenticate, (req: any, res) => {
    const { title, description, deadline, priority } = req.body;
    if (!title || !deadline) return res.status(400).json({ error: "Title and deadline are mandatory" });

    try {
      const id = Math.random().toString(36).substring(2, 11);
      db.prepare("INSERT INTO tasks (id, userId, title, description, deadline, priority) VALUES (?, ?, ?, ?, ?, ?)")
        .run(id, req.user.id, title, description || null, deadline, priority || 'medium');
      const newTask = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
      res.json(newTask);
    } catch (err) {
      res.status(500).json({ error: "Failed to commit neural protocol" });
    }
  });

  app.patch("/api/tasks/:id", authenticate, (req: any, res) => {
    const { completed, title, description, deadline, priority } = req.body;
    try {
      const task: any = db.prepare("SELECT userId FROM tasks WHERE id = ?").get(req.params.id);
      if (!task) return res.status(404).json({ error: "Protocol not found" });
      if (task.userId !== req.user.id) return res.status(403).json({ error: "Access denied" });

      db.prepare(`
        UPDATE tasks SET 
          completed = COALESCE(?, completed),
          title = COALESCE(?, title),
          description = COALESCE(?, description),
          deadline = COALESCE(?, deadline),
          priority = COALESCE(?, priority)
        WHERE id = ?
      `).run(
        completed !== undefined ? (completed ? 1 : 0) : null,
        title || null,
        description || null,
        deadline || null,
        priority || null,
        req.params.id
      );

      const updatedTask = db.prepare("SELECT * FROM tasks WHERE id = ?").get(req.params.id);
      res.json(updatedTask);
    } catch (err) {
      res.status(500).json({ error: "Failed to update neural protocol" });
    }
  });

  app.delete("/api/tasks/:id", authenticate, (req: any, res) => {
    try {
      const task: any = db.prepare("SELECT userId FROM tasks WHERE id = ?").get(req.params.id);
      if (!task) return res.status(404).json({ error: "Protocol not found" });
      if (task.userId !== req.user.id) return res.status(403).json({ error: "Access denied" });

      db.prepare("DELETE FROM tasks WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to decouple protocol" });
    }
  });

  app.get("/api/auth/me", (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.json({ user: null });

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const user: any = db.prepare("SELECT id, email, displayName, photoURL, role, credits, subscriptionTier, subscriptionStatus, lastPaymentDate, phone, doctorPhone, doctorEmail, mentorPhone, mentorEmail, doctorId, mentorId, allergies, conditions, bloodGroup, hospitalPreference, enableExternalAI, ollamaUrl, ollamaModel, createdAt FROM users WHERE id = ?").get(decoded.id);
      res.json({ user });
    } catch (err) {
      res.json({ user: null });
    }
  });
  
  app.patch("/api/auth/profile", authenticate, (req: any, res) => {
    console.log(`[PROFILE] Update request received for user ${req.user.id}`);
    const { 
      displayName, 
      photoURL, 
      phone,
      doctorPhone, 
      doctorEmail, 
      doctorName,
      mentorPhone, 
      mentorEmail, 
      mentorName,
      doctorId,
      mentorId,
      allergies,
      conditions,
      bloodGroup,
      hospitalPreference,
      enableExternalAI,
      ollamaUrl,
      ollamaModel
    } = req.body;
    const userId = req.user.id;

    try {
      db.prepare(`
        UPDATE users SET 
          displayName = COALESCE(?, displayName),
          photoURL = COALESCE(?, photoURL),
          phone = COALESCE(?, phone),
          doctorPhone = COALESCE(?, doctorPhone),
          doctorEmail = COALESCE(?, doctorEmail),
          doctorName = COALESCE(?, doctorName),
          mentorPhone = COALESCE(?, mentorPhone),
          mentorEmail = COALESCE(?, mentorEmail),
          mentorName = COALESCE(?, mentorName),
          doctorId = COALESCE(?, doctorId),
          mentorId = COALESCE(?, mentorId),
          allergies = COALESCE(?, allergies),
          conditions = COALESCE(?, conditions),
          bloodGroup = COALESCE(?, bloodGroup),
          hospitalPreference = COALESCE(?, hospitalPreference),
          enableExternalAI = COALESCE(?, enableExternalAI),
          ollamaUrl = COALESCE(?, ollamaUrl),
          ollamaModel = COALESCE(?, ollamaModel)
        WHERE id = ?
      `).run(
        displayName !== undefined ? displayName : null,
        photoURL !== undefined ? photoURL : null,
        phone !== undefined ? phone : null,
        doctorPhone !== undefined ? doctorPhone : null,
        doctorEmail !== undefined ? doctorEmail : null,
        doctorName !== undefined ? doctorName : null,
        mentorPhone !== undefined ? mentorPhone : null,
        mentorEmail !== undefined ? mentorEmail : null,
        mentorName !== undefined ? mentorName : null,
        doctorId !== undefined ? doctorId : null,
        mentorId !== undefined ? mentorId : null,
        allergies !== undefined ? allergies : null,
        conditions !== undefined ? conditions : null,
        bloodGroup !== undefined ? bloodGroup : null,
        hospitalPreference !== undefined ? hospitalPreference : null,
        enableExternalAI !== undefined ? (enableExternalAI ? 1 : 0) : null,
        ollamaUrl !== undefined ? ollamaUrl : null,
        ollamaModel !== undefined ? ollamaModel : null,
        userId
      );

      const user: any = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
      console.log(`[PROFILE] Update successful for user ${userId}`);
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (err: any) {
      console.error(`[PROFILE ERROR] Update failed for user ${userId}:`, err.message);
      res.status(500).json({ error: "Failed to update profile", details: err.message });
    }
  });

  app.post("/api/auth/subscription/upgrade", authenticate, (req: any, res) => {
    const { tier, amount, evidence } = req.body;
    const userId = req.user.id;

    if (!['silver', 'gold'].includes(tier)) {
      return res.status(400).json({ error: "Invalid subscription tier" });
    }

    try {
      const lastPaymentDate = new Date().toISOString();
      db.prepare("UPDATE users SET subscriptionTier = ?, subscriptionStatus = 'pending', lastPaymentDate = ?, paymentEvidence = ? WHERE id = ?")
        .run(tier, lastPaymentDate, evidence || null, userId);

      const user: any = db.prepare("SELECT id, email, displayName, photoURL, role, subscriptionTier, subscriptionStatus, lastPaymentDate, createdAt FROM users WHERE id = ?")
        .get(userId);
      
      // Notify Admin (Akora Joseph)
      const adminEmail = process.env.ADMIN_EMAIL || "Josephhaxzy@gmail.com";
      sendEmail(
        adminEmail,
        `🚨 PENDING UPGRADE: ${tier.toUpperCase()}`,
        `A user has initiated a subscription upgrade.\n\nUser: ${user.displayName} (${user.email})\nTier: ${tier.toUpperCase()}\nAmount: ${amount} UGX\n\nPAYMENT EVIDENCE:\n"${evidence}"\n\nPlease verify the payment on 0787674140 and update the status in the backend.`
      );

      res.json({ user });
    } catch (err: any) {
      console.error(`[SUBSCRIPTION ERROR] Upgrade failed for user ${userId}:`, err.message);
      res.status(500).json({ error: "Failed to upgrade subscription" });
    }
  });

  // WebAuthn Registration
  app.get("/api/auth/webauthn/credentials", authenticate, (req: any, res) => {
    try {
      const credentials = db.prepare("SELECT id, counter, transports FROM credentials WHERE userId = ?").all(req.user.id);
      res.json({ credentials });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch credentials" });
    }
  });

  app.post("/api/auth/webauthn/register-options", authenticate, async (req: any, res) => {
    const user = req.user;
    const userCredentials = db.prepare("SELECT id FROM credentials WHERE userId = ?").all(user.id) as any[];
    const rpID = req.headers.host?.split(':')[0] || 'localhost';

    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID,
      userID: Buffer.from(user.id),
      userName: user.email,
      attestationType: 'none',
      excludeCredentials: userCredentials.map(cred => ({
        id: cred.id,
        type: 'public-key',
      })),
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
    });

    challenges.set(user.id, options.challenge);
    res.json(options);
  });

  app.post("/api/auth/webauthn/register-verify", authenticate, async (req: any, res) => {
    const user = req.user;
    const expectedChallenge = challenges.get(user.id);
    const rpID = req.headers.host?.split(':')[0] || 'localhost';
    const origin = `${req.protocol}://${req.headers.host}`;

    if (!expectedChallenge) {
      return res.status(400).json({ error: "Challenge not found" });
    }

    try {
      const verification = await verifyRegistrationResponse({
        response: req.body,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
      });

      if (verification.verified && verification.registrationInfo) {
        const { credential } = verification.registrationInfo;
        
        db.prepare("INSERT INTO credentials (id, userId, publicKey, counter, transports) VALUES (?, ?, ?, ?, ?)")
          .run(
            credential.id,
            user.id,
            Buffer.from(credential.publicKey),
            credential.counter,
            JSON.stringify(req.body.response.transports || [])
          );

        challenges.delete(user.id);
        res.json({ verified: true });
      } else {
        res.status(400).json({ error: "Verification failed" });
      }
    } catch (err: any) {
      console.error("Registration verification error:", err);
      res.status(400).json({ error: err.message });
    }
  });

  // WebAuthn Authentication
  app.post("/api/auth/webauthn/login-options", async (req, res) => {
    const { email } = req.body;
    const user: any = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    const rpID = req.headers.host?.split(':')[0] || 'localhost';
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userCredentials = db.prepare("SELECT id, transports FROM credentials WHERE userId = ?").all(user.id) as any[];

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: userCredentials.map(cred => ({
        id: cred.id,
        type: 'public-key',
        transports: JSON.parse(cred.transports || '[]'),
      })),
      userVerification: 'preferred',
    });

    challenges.set(user.id, options.challenge);
    res.json({ options, userId: user.id });
  });

  app.post("/api/auth/webauthn/login-verify", async (req, res) => {
    const { response, userId, email } = req.body;
    const expectedChallenge = challenges.get(userId);
    const rpID = req.headers.host?.split(':')[0] || 'localhost';
    const origin = `${req.protocol}://${req.headers.host}`;

    if (!expectedChallenge) {
      return res.status(400).json({ error: "Challenge not found" });
    }

    const user: any = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
    const credential: any = db.prepare("SELECT * FROM credentials WHERE id = ?").get(response.id);

    if (!credential) {
      return res.status(400).json({ error: "Credential not found" });
    }

    try {
      const verification = await verifyAuthenticationResponse({
        response,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        credential: {
          id: credential.id,
          publicKey: credential.publicKey,
          counter: credential.counter,
        },
      });

      if (verification.verified) {
        // Update counter
        db.prepare("UPDATE credentials SET counter = ? WHERE id = ?")
          .run(verification.authenticationInfo.newCounter, credential.id);

        challenges.delete(userId);

        // Issue JWT
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
        res.cookie("token", token, { 
          httpOnly: true, 
          secure: true,
          sameSite: "none",
          maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({ verified: true, user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role } });
      } else {
        res.status(400).json({ error: "Verification failed" });
      }
    } catch (err: any) {
      console.error("Authentication verification error:", err);
      res.status(400).json({ error: err.message });
    }
  });

  // Records Routes
  app.get("/api/records", authenticate, (req: any, res) => {
    try {
      const records = db.prepare("SELECT * FROM records WHERE userId = ? ORDER BY date DESC").all(req.user.id);
      res.json({ records });
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Specialist / Doctor Directory Routes
  app.get("/api/admin/doctors", authenticate, requireAdmin, (req: any, res) => {
    try {
      const doctors = db.prepare("SELECT * FROM doctors ORDER BY createdAt DESC").all();
      res.json({ doctors });
    } catch (err) {
      res.status(500).json({ error: "Failed to list doctors" });
    }
  });

  app.post("/api/admin/doctors", authenticate, requireAdmin, (req: any, res) => {
    const { name, whatsappNumber, specialization, location, imageUrl } = req.body;
    if (!name || !whatsappNumber || !specialization || !location) {
      return res.status(400).json({ error: "All required fields must be provided" });
    }
    try {
      const id = Math.random().toString(36).substring(2, 11);
      const createdAt = new Date().toISOString();
      db.prepare(`
        INSERT INTO doctors (id, name, whatsappNumber, specialization, location, imageUrl, active, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, 1, ?)
      `).run(id, name, whatsappNumber, specialization, location, imageUrl, createdAt);
      
      const doctor = db.prepare("SELECT * FROM doctors WHERE id = ?").get(id);
      res.json({ doctor });
    } catch (err) {
      console.error("Doctor creation error:", err);
      res.status(500).json({ error: "Failed to register doctor" });
    }
  });

  app.patch("/api/admin/doctors/:id", authenticate, requireAdmin, (req: any, res) => {
    const { id } = req.params;
    const { name, whatsappNumber, specialization, location, imageUrl, active } = req.body;
    try {
      const existing = db.prepare("SELECT * FROM doctors WHERE id = ?").get(id) as any;
      if (!existing) return res.status(404).json({ error: "Doctor not found" });

      db.prepare(`
        UPDATE doctors 
        SET name = ?, whatsappNumber = ?, specialization = ?, location = ?, imageUrl = ?, active = ?
        WHERE id = ?
      `).run(
        name ?? existing.name,
        whatsappNumber ?? existing.whatsappNumber,
        specialization ?? existing.specialization,
        location ?? existing.location,
        imageUrl ?? existing.imageUrl,
        active !== undefined ? (active ? 1 : 0) : existing.active,
        id
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to update doctor" });
    }
  });

  app.delete("/api/admin/doctors/:id", authenticate, requireAdmin, (req: any, res) => {
    const { id } = req.params;
    try {
      db.prepare("DELETE FROM doctors WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to remove doctor" });
    }
  });

  app.get("/api/doctors/active", (req, res) => {
    try {
      const doctors = db.prepare("SELECT * FROM doctors WHERE active = 1 ORDER BY name ASC").all();
      res.json({ doctors });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch doctors" });
    }
  });

  // Admin Routes
  app.get("/api/admin/users", requireAdmin, (req: any, res) => {
    try {
      const users = db.prepare("SELECT id, email, displayName, photoURL, role, createdAt FROM users ORDER BY createdAt DESC").all();
      res.json({ users });
    } catch (err: any) {
      console.error("[ADMIN] Failed to fetch users:", err.message);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.delete("/api/admin/users/:id", requireAdmin, (req: any, res) => {
    const { id } = req.params;
    if (id === req.user.id) return res.status(400).json({ error: "Cannot delete yourself" });

    try {
      db.prepare("DELETE FROM users WHERE id = ?").run(id);
      db.prepare("DELETE FROM records WHERE userId = ?").run(id);
      db.prepare("DELETE FROM credentials WHERE userId = ?").run(id);
      res.json({ success: true });
    } catch (err: any) {
      console.error(`[ADMIN] Failed to delete user ${id}:`, err.message);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  app.get("/api/admin/users/:id/records", requireAdmin, (req: any, res) => {
    const { id } = req.params;
    try {
      const records = db.prepare("SELECT * FROM records WHERE userId = ? ORDER BY date DESC").all(id);
      res.json({ records });
    } catch (err: any) {
      console.error(`[ADMIN] Failed to fetch records for user ${id}:`, err.message);
      res.status(500).json({ error: "Failed to fetch user records" });
    }
  });

  app.patch("/api/admin/users/:id/role", requireAdmin, (req: any, res) => {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!['user', 'doctor', 'admin'].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    if (id === req.user.id) {
      return res.status(400).json({ error: "Cannot change your own role" });
    }

    try {
      db.prepare("UPDATE users SET role = ? WHERE id = ?").run(role, id);
      res.json({ success: true, role });
    } catch (err: any) {
      console.error(`[ADMIN] Failed to update role for user ${id}:`, err.message);
      res.status(500).json({ error: "Failed to update user role" });
    }
  });

  // Medication Routes
  app.get("/api/medications", authenticate, (req: any, res) => {
    try {
      const medications = db.prepare("SELECT * FROM medications WHERE userId = ? ORDER BY createdAt DESC").all(req.user.id);
      
      // For each med, check if taken today
      const today = new Date().toISOString().split('T')[0];
      const medsWithStatus = medications.map((med: any) => {
        const intake = db.prepare("SELECT * FROM medication_intakes WHERE medicationId = ? AND userId = ? AND takenAt >= ?")
          .get(med.id, req.user.id, today + ' 00:00:00');
        return { ...med, takenToday: !!intake };
      });
      
      res.json({ medications: medsWithStatus });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch medications" });
    }
  });

  app.post("/api/medications", authenticate, (req: any, res) => {
    const { name, dosage, frequency, time, category, remindersEnabled } = req.body;
    if (!name) return res.status(400).json({ error: "Medication name required" });

    try {
      const id = Math.random().toString(36).substring(2, 15);
      const createdAt = new Date().toISOString();
      db.prepare("INSERT INTO medications (id, userId, name, dosage, frequency, time, category, remindersEnabled, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(id, req.user.id, name, dosage, frequency, time, category || 'prescription', remindersEnabled ? 1 : 0, createdAt);
      
      res.json({ success: true, medication: { id, name, dosage, frequency, time, category, remindersEnabled, takenToday: false } });
    } catch (err) {
      res.status(500).json({ error: "Failed to add medication" });
    }
  });

  app.delete("/api/medications/:id", authenticate, (req: any, res) => {
    try {
      db.prepare("DELETE FROM medications WHERE id = ? AND userId = ?").run(req.params.id, req.user.id);
      db.prepare("DELETE FROM medication_intakes WHERE medicationId = ? AND userId = ?").run(req.params.id, req.user.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete medication" });
    }
  });

  app.post("/api/medications/:id/take", authenticate, (req: any, res) => {
    const { id } = req.params;
    const { undo } = req.body;
    const today = new Date().toISOString().split('T')[0];

    try {
      if (undo) {
        db.prepare("DELETE FROM medication_intakes WHERE medicationId = ? AND userId = ? AND takenAt >= ?")
          .run(id, req.user.id, today + ' 00:00:00');
      } else {
        const intakeId = Math.random().toString(36).substring(2, 15);
        db.prepare("INSERT INTO medication_intakes (id, medicationId, userId) VALUES (?, ?, ?)")
          .run(intakeId, id, req.user.id);
      }
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to update intake status" });
    }
  });

  app.patch("/api/medications/:id", authenticate, (req: any, res) => {
    const { id } = req.params;
    const { remindersEnabled } = req.body;
    
    try {
      if (remindersEnabled !== undefined) {
        db.prepare("UPDATE medications SET remindersEnabled = ? WHERE id = ? AND userId = ?")
          .run(remindersEnabled ? 1 : 0, id, req.user.id);
      }
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to update medication" });
    }
  });

  app.post("/api/records", authenticate, (req: any, res) => {
    const { type, value, unit, date, notes, attachmentURL } = req.body;
    if (!type || !value || !date) return res.status(400).json({ error: "Missing required fields" });

    try {
      const id = Math.random().toString(36).substring(2, 15);
      const stmt = db.prepare("INSERT INTO records (id, userId, type, value, unit, date, notes, attachmentURL) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
      stmt.run(id, req.user.id, type, value, unit || "", date, notes || "", attachmentURL || null);

      res.json({ record: { id, userId: req.user.id, type, value, unit, date, notes, attachmentURL } });
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/workouts", authenticate, (req: any, res) => {
    try {
      const workouts = db.prepare("SELECT * FROM workouts WHERE userId = ? ORDER BY date DESC").all(req.user.id);
      res.json({ workouts });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch workouts" });
    }
  });

  app.post("/api/workouts", authenticate, (req: any, res) => {
    const { type, duration, calories, intensity, date, notes } = req.body;
    if (!type || !duration || !date) return res.status(400).json({ error: "Missing required fields" });

    try {
      const id = Math.random().toString(36).substring(2, 15);
      const stmt = db.prepare("INSERT INTO workouts (id, userId, type, duration, calories, intensity, date, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
      stmt.run(id, req.user.id, type, duration, calories || 0, intensity || "Moderate", date, notes || "");

      res.json({ workout: { id, userId: req.user.id, type, duration, calories, intensity, date, notes } });
    } catch (err) {
      res.status(500).json({ error: "Failed to log workout" });
    }
  });

  app.delete("/api/workouts/:id", authenticate, (req: any, res) => {
    const { id } = req.params;
    try {
      db.prepare("DELETE FROM workouts WHERE id = ? AND userId = ?").run(id, req.user.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete workout" });
    }
  });

  app.post("/api/alerts/send-sms", authenticate, async (req: any, res) => {
    const { message, toDoctor, toMentor } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const mtnApiKey = process.env.MTN_API_KEY;
    const airtelApiKey = process.env.AIRTEL_API_KEY;
    const senderId = process.env.SENDER_ID || "DOCTORIAN_MED";
    
    // Support passed numbers or fallback to .env
    const doctorNumber = normalizePhoneNumber(toDoctor || process.env.DOCTOR_PHONE_NUMBER);
    const mentorNumber = normalizePhoneNumber(toMentor || process.env.MENTOR_PHONE_NUMBER);

    if ((!mtnApiKey && !airtelApiKey) || !doctorNumber) {
      console.warn("MTN/Airtel API Keys or doctor number missing. SMS not sent.");
      return res.json({ 
        success: true, 
        simulated: true, 
        message: "Alert logged. Configure MTN_API_KEY or AIRTEL_API_KEY in .env for real SMS." 
      });
    }

    const results = [];
    
    // Broadcast trigger to Arduino via WebSocket
    broadcastToArduino({
      type: 'trigger_alert',
      payload: {
        message: message,
        alertType: 'sms_alert',
        doctorNumber,
        mentorNumber
      }
    });

    const sendSmsViamtn = async (to: string, recipientName: string) => {
      try {
        const baseUrl = process.env.MTN_BASE_URL || "https://api.mtn.com/v1";
        await axios.post(`${baseUrl}/sms`, {
          to,
          from: senderId,
          message: message
        }, {
          headers: { 'Authorization': `Bearer ${mtnApiKey}` }
        });
        results.push({ recipient: recipientName, status: 'sent', network: 'MTN' });
      } catch (err: any) {
        throw err;
      }
    };

    const sendSmsViaAirtel = async (to: string, recipientName: string) => {
      try {
        const baseUrl = process.env.AIRTEL_BASE_URL || "https://api.airtel.com/v1";
        await axios.post(`${baseUrl}/sms`, {
          to,
          from: senderId,
          message: message
        }, {
          headers: { 'Authorization': `Bearer ${airtelApiKey}` }
        });
        results.push({ recipient: recipientName, status: 'sent', network: 'Airtel' });
      } catch (err: any) {
        throw err;
      }
    };

    const dispatch = async (to: string, name: string) => {
      if (!to) return;
      try {
        if (mtnApiKey) {
          await sendSmsViamtn(to, name);
        } else if (airtelApiKey) {
          await sendSmsViaAirtel(to, name);
        }
      } catch (err: any) {
        console.error(`SMS Dispatch Error (${name}: ${to}):`, err.message);
        results.push({ recipient: name, status: 'failed', error: err.message });
      }
    };

    await Promise.all([
      dispatch(doctorNumber, 'Doctor'),
      mentorNumber ? dispatch(mentorNumber, 'Mentor') : Promise.resolve()
    ]);

    const allFailed = results.every(r => r.status === 'failed');
    if (allFailed && results.length > 0) {
      return res.status(500).json({ error: "Failed to send SMS alerts", details: results });
    }

    res.json({ success: true, message: "SMS alert process completed", results });
  });

  app.post("/api/alerts/make-call", authenticate, async (req: any, res) => {
    const { message, toDoctor, toMentor, toUser } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const apiKey = process.env.MTN_API_KEY;
    const baseUrl = process.env.MTN_BASE_URL || "https://api.mtn.com/v1";
    
    // Support passed numbers or fallback to .env
    const doctorNumber = normalizePhoneNumber(toDoctor || process.env.DOCTOR_PHONE_NUMBER);
    const mentorNumber = normalizePhoneNumber(toMentor || process.env.MENTOR_PHONE_NUMBER);
    const userNumber = normalizePhoneNumber(toUser);

    if (!apiKey || (!doctorNumber && !userNumber)) {
      console.warn("MTN API Key or recipient numbers missing. Voice call not initiated.");
      return res.json({ 
        success: true, 
        simulated: true, 
        message: "Voice call logged. Configure MTN API Key and phone numbers in .env for real calls." 
      });
    }

    const results = [];
    
    // Broadcast trigger to Arduino via WebSocket
    broadcastToArduino({
      type: 'trigger_alert',
      payload: {
        message: message,
        alertType: 'voice_call_trigger',
        doctorNumber,
        mentorNumber,
        userNumber
      }
    });

    const makeMTNCall = async (to: string, recipientName: string) => {
      if (!to) return;
      try {
        await axios.post(`${baseUrl}/voice/call`, {
          to,
          message: message,
          voice: 'female'
        }, {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        results.push({ recipient: recipientName, status: 'initiated' });
      } catch (err: any) {
        console.error(`MTN Voice Error (${recipientName}: ${to}):`, err.response?.data || err.message);
        results.push({ recipient: recipientName, status: 'failed', error: err.response?.data?.message || err.message });
      }
    };

    if (doctorNumber) await makeMTNCall(doctorNumber, 'Doctor');
    if (mentorNumber) await makeMTNCall(mentorNumber, 'Mentor');
    if (userNumber) await makeMTNCall(userNumber, 'User/Patient');

    const allFailed = results.every(r => r.status === 'failed');
    if (allFailed && results.length > 0) {
      return res.status(500).json({ error: "Failed to initiate MTN voice calls", details: results });
    }

    res.json({ success: true, message: "MTN Voice call process completed", results });
  });

  app.post("/api/alerts/whatsapp", authenticate, async (req: any, res) => {
    const { message, to, type } = req.body;
    if (!message || !to) return res.status(400).json({ error: "Message and recipient required" });

    console.log(`[WHATSAPP] Sending ${type || 'alert'} to ${to}: ${message}`);
    
    // Broadcast trigger to Arduino (which handles the "fast call" as per user request)
    broadcastToArduino({
      type: 'whatsapp_trigger',
      payload: { message, to, type: type || 'medical_alert' }
    });

    // Simulated WhatsApp via logs/placeholder or Twilio if you had it
    // For now we fulfill the "trigger Arduino" part which handles the "fast call"
    res.json({ success: true, message: "WhatsApp trigger sent to neural relay." });
  });

  // --- Neural Multilingual & Audio Systems ---
  app.post("/api/ai/stt", authenticate, async (req: any, res) => {
    const { audio, mimeType, targetLang = 'English' } = req.body;
    if (!audio) return res.status(400).json({ error: "Audio data required" });

    try {
      const allKeys = getValidApiKeys();
      const googleKey = allKeys.find(k => k.startsWith('AIza'));
      if (!googleKey) throw new Error("Neural STT pathway unavailable");

      const aiClient = getGenAI(googleKey);
      if (!aiClient) throw new Error("AI client initialization failed");

      const model = aiClient.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      // Step 1: Voice -> Text (Whisper Proxy)
      const prompt = `Transcribe the provided audio precisely. 
      ${targetLang === 'Auto Detect' 
        ? "The audio contains a Ugandan language (Luganda, Swahili, Runyankole, Acholi, Ateso, Lusoga, Luo, etc.). Automatically detect which language it is." 
        : `The audio is in ${targetLang}.`}
      Return a JSON object with:
      - "original": the transcription in the original language
      - "english": a high-fidelity medical translation of the transcription into English
      - "detectedLanguage": the language identified.`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: audio.includes('base64,') ? audio.split('base64,')[1] : audio,
            mimeType: mimeType || 'audio/webm'
          }
        }
      ]);

      const responseText = result.response.text();
      let transcription;
      try {
        const jsonMatch = responseText.match(/\{.*\}/s);
        transcription = jsonMatch ? JSON.parse(jsonMatch[0]) : { original: responseText, english: responseText };
      } catch (e) {
        transcription = { original: responseText, english: responseText };
      }

      res.json({ ...transcription, success: true });
    } catch (err: any) {
      console.error("[STT ERROR]", err.message);
      res.status(500).json({ error: "Speech-to-neural pathway disruption" });
    }
  });

  app.post("/api/ai/translate", authenticate, async (req: any, res) => {
    const { text, targetLang } = req.body;
    if (!text || !targetLang) return res.status(400).json({ error: "Text and target language required" });

    try {
      const response = await callAI({
        messages: [{ role: 'user', text: `Translate the following text into ${targetLang}. Return ONLY the translated text. Original Text: "${text}"` }],
        systemInstruction: "You are a professional medical translator specialized in Ugandan languages (Luganda, Swahili, Runyankole, Acholi, Ateso, Lusoga, Luo, etc.). Maintain clinical precision and cultural context."
      });
      res.json({ text: response, success: true });
    } catch (err: any) {
      res.status(500).json({ error: "Translation pathway disrupted" });
    }
  });

  app.post("/api/alerts/medication", authenticate, async (req: any, res) => {
    const { medName, time } = req.body;
    const userId = req.user.id;
    const userRow: any = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);

    const message = `[MEDICATION ALARM] Time for ${medName} at ${time}. Please confirm intake.`;
    
    // 1. Trigger Arduino for physical alarm
    broadcastToArduino({
      type: 'medication_alarm',
      payload: { medName, time, message }
    });

    // 2. Send Email
    if (userRow?.email) {
      await sendEmail(userRow.email, "Medication Reminder", message);
    }

    // 3. Trigger WhatsApp Relay
    console.log(`[RELAY] Triggering WhatsApp for ${userRow?.email} med reminder`);

    res.json({ success: true });
  });

  app.post("/api/alerts/sos", authenticate, async (req: any, res) => {
    const { name, message, doctorPhone: bodyDoctorPhone, mentorPhone: bodyMentorPhone } = req.body;
    const userId = req.user.id;

    // Fetch user-specific emergency contacts
    const userRow: any = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
    
    // Use numbers from request if provided (for individual testing) or fall back to profile
    const doctorNumber = normalizePhoneNumber(bodyDoctorPhone || userRow?.doctorPhone || process.env.DOCTOR_PHONE_NUMBER);
    const mentorNumber = normalizePhoneNumber(bodyMentorPhone || userRow?.mentorPhone || process.env.MENTOR_PHONE_NUMBER);
    const doctorId = userRow?.doctorId;
    const mentorId = userRow?.mentorId;
    
    // Create targeted notification for the doctor if they have an account
    if (doctorId) {
      const notifId = Math.random().toString(36).substring(2, 15);
      db.prepare("INSERT INTO notifications (id, title, content, type, recipientId) VALUES (?, ?, ?, ?, ?)")
        .run(notifId, "EMERGENCY ALERT", `Patient ${name || 'User'} has triggered an SOS alert. Please respond immediately.`, "warning", doctorId);
    }
    
    // Create targeted notification for the mentor if they have an account
    if (mentorId) {
      const notifId = Math.random().toString(36).substring(2, 15);
      db.prepare("INSERT INTO notifications (id, title, content, type, recipientId) VALUES (?, ?, ?, ?, ?)")
        .run(notifId, "EMERGENCY ALERT", `Your mentee ${name || 'User'} has triggered an SOS alert. Please check on them.`, "warning", mentorId);
    }

    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    const sosMessage = `EMERGENCY ALERT: ${name || 'User'} is in distress. Please respond immediately. ${message || ''}`;
    
    console.log(`[SOS] Triggered by ${name} (${userId})`);

    // Broadcast trigger to Arduino for local hardware alarm
    broadcastToArduino({
      type: 'sos_trigger',
      payload: { 
        name: name || 'User',
        message: message || '',
        doctorNumber,
        mentorNumber 
      }
    });

    const results: any[] = [];

    // Try Twilio if configured
    if (twilioSid && twilioAuth && twilioPhone) {
      const client = twilio(twilioSid, twilioAuth);
      const recipients = [
        { phone: doctorNumber, label: 'Doctor' },
        { phone: mentorNumber, label: 'Mentor' }
      ].filter(r => r.phone);

      // Prepare all alert promises
      const alertPromises: Promise<any>[] = [];
      
      for (const recipient of recipients) {
        // Send SMS promise
        alertPromises.push(
          client.messages.create({
            body: sosMessage,
            from: twilioPhone,
            to: recipient.phone!
          }).then(() => ({ recipient: recipient.phone, label: recipient.label, type: 'sms', status: 'sent' }))
        );
        
        // Make Call promise
        alertPromises.push(
          client.calls.create({
            twiml: `<Response><Say voice="alice" language="en-US">Emergency Alert. Your ${recipient.label === 'Doctor' ? 'patient' : 'mentee'} ${name || 'is'} in distress. Please respond immediately.</Say></Response>`,
            from: twilioPhone,
            to: recipient.phone!
          }).then(() => ({ recipient: recipient.phone, label: recipient.label, type: 'call', status: 'sent' }))
        );
      }

      // Execute all alerts simultaneously
      const alertResults = await Promise.allSettled(alertPromises);
      
      alertResults.forEach((res, i) => {
        if (res.status === 'fulfilled') {
          results.push({ ...res.value, provider: 'twilio' });
        } else {
          results.push({ status: 'failed', provider: 'twilio', error: res.reason?.message || 'Unknown error' });
        }
      });
    } else {
      console.warn("[SOS] Twilio not fully configured. Using simulated fallback.");
      results.push({ status: 'simulated', message: 'Twilio credentials missing. Configure .env for real calls/SMS.' });
    }

    res.json({ success: true, message: "SOS Alert Sequence Initiated", results });
  });

  app.post("/api/chat/feedback", authenticate, async (req: any, res) => {
    const { messageId, rating, suggestion } = req.body;
    const userId = req.user.id;

    if (!messageId || !rating) {
      return res.status(400).json({ error: "MessageID and Rating are required" });
    }

    try {
      const id = Math.random().toString(36).substring(2, 15);
      const timestamp = new Date().toISOString();
      
      const stmt = db.prepare("INSERT INTO feedback (id, userId, messageId, rating, suggestion, timestamp) VALUES (?, ?, ?, ?, ?, ?)");
      stmt.run(id, userId, messageId, rating, suggestion || "", timestamp);

      res.json({ success: true, id });
    } catch (err: any) {
      console.error("[FEEDBACK ERROR]", err.message);
      res.status(500).json({ error: "Failed to save feedback" });
    }
  });

  // Chat History Management
  app.get("/api/chat/sessions", authenticate, (req: any, res) => {
    try {
      const sessions = db.prepare("SELECT * FROM chat_sessions WHERE userId = ? ORDER BY createdAt DESC").all(req.user.id);
      res.json({ sessions });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch neural session index" });
    }
  });

  app.post("/api/chat/sessions", authenticate, (req: any, res) => {
    const { title, persona } = req.body;
    const id = `session_${Date.now()}`;
    const userId = req.user.id;
    try {
      db.prepare("INSERT INTO chat_sessions (id, userId, title, persona) VALUES (?, ?, ?, ?)")
        .run(id, userId, title || 'New Neural Link', persona || 'general');
      res.json({ id, success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to allocate neural session" });
    }
  });

  app.get("/api/chat/sessions/:sessionId/messages", authenticate, (req: any, res) => {
    const { sessionId } = req.params;
    try {
      // Security check: ensure session belongs to user
      const session: any = db.prepare("SELECT userId FROM chat_sessions WHERE id = ?").get(sessionId);
      if (!session) return res.status(404).json({ error: "Session not found" });
      if (session.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: "Neural link restricted" });
      }

      const messages = db.prepare("SELECT * FROM chat_messages WHERE sessionId = ? ORDER BY timestamp ASC").all(sessionId);
      res.json({ messages });
    } catch (err) {
      res.status(500).json({ error: "Failed to reconstruct neural timeline" });
    }
  });

  app.post("/api/chat/sessions/:sessionId/messages", authenticate, (req: any, res) => {
    const { sessionId } = req.params;
    const { role, text } = req.body;
    const id = `msg_${Date.now()}`;
    try {
      // Security check: ensure session belongs to user
      const session: any = db.prepare("SELECT userId FROM chat_sessions WHERE id = ?").get(sessionId);
      if (!session) return res.status(404).json({ error: "Session not found" });
      if (session.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: "Neural link restricted" });
      }

      db.prepare("INSERT INTO chat_messages (id, sessionId, role, text) VALUES (?, ?, ?, ?)")
        .run(id, sessionId, role, text);
      res.json({ id, success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to persist neural packet" });
    }
  });

  app.delete("/api/chat/sessions/:sessionId", authenticate, (req: any, res) => {
    const { sessionId } = req.params;
    try {
      const session: any = db.prepare("SELECT userId FROM chat_sessions WHERE id = ?").get(sessionId);
      if (!session) return res.status(404).json({ error: "Session not found" });
      if (session.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: "Neural link restricted" });
      }

      db.prepare("DELETE FROM chat_messages WHERE sessionId = ?").run(sessionId);
      db.prepare("DELETE FROM chat_sessions WHERE id = ?").run(sessionId);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to purge neural session" });
    }
  });

  app.delete("/api/chat/messages/:messageId", authenticate, (req: any, res) => {
    const { messageId } = req.params;
    try {
      const message: any = db.prepare(`
        SELECT m.id, s.userId 
        FROM chat_messages m
        JOIN chat_sessions s ON m.sessionId = s.id
        WHERE m.id = ?
      `).get(messageId);
      
      if (!message) return res.status(404).json({ error: "Message not found" });
      if (message.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: "Access denied" });
      }
      
      db.prepare("DELETE FROM chat_messages WHERE id = ?").run(messageId);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete message" });
    }
  });

  // Notifications Endpoints
  app.get("/api/notifications", authenticate, async (req: any, res) => {
    const userId = req.user.id;
    try {
      const notifications = db.prepare("SELECT * FROM notifications WHERE recipientId IS NULL OR recipientId = ? ORDER BY createdAt DESC").all(userId);
      res.json({ notifications });
    } catch (err: any) {
      console.error("[API ERROR] Failed to fetch notifications:", err.message);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications", authenticate, requireAdmin, async (req, res) => {
    const { title, content, type } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    try {
      const id = Math.random().toString(36).substring(2, 15);
      db.prepare("INSERT INTO notifications (id, title, content, type) VALUES (?, ?, ?, ?)")
        .run(id, title, content, type || 'info');
      
      const notification = db.prepare("SELECT * FROM notifications WHERE id = ?").get(id);
      res.json({ success: true, notification });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to create notification" });
    }
  });

  app.delete("/api/notifications/:id", authenticate, requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
      db.prepare("DELETE FROM notifications WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to delete notification" });
    }
  });

  app.get("/api/admin/mtn-status", authenticate, requireAdmin, async (req, res) => {
    const apiKey = process.env.MTN_API_KEY;
    const senderId = process.env.MTN_SENDER_ID;
    const doctorNumber = process.env.DOCTOR_PHONE_NUMBER;

    res.json({
      configured: !!(apiKey && senderId && doctorNumber),
      details: {
        hasApiKey: !!apiKey,
        hasSenderId: !!senderId,
        hasDoctorNumber: !!doctorNumber,
        senderId: senderId || null,
        doctorNumber: doctorNumber ? `${doctorNumber.substring(0, 4)}...${doctorNumber.substring(doctorNumber.length - 3)}` : null,
      }
    });
  });

  // Deepseek R1 Chat Route (Server-side to hide API key)
  app.post("/api/chat/deepseek", authenticate, async (req: any, res) => {
    const { messages, systemInstruction } = req.body;
    const deepseekKey = process.env.DEEPSEEK_API_KEY;

    if (!deepseekKey || deepseekKey.trim() === "") {
      console.warn("[DEEPSEEK] API Key not configured in .env");
      return res.status(503).json({ error: "Deepseek provider not configured. Please add DEEPSEEK_API_KEY to your environment variables." });
    }

    try {
      console.log("[DEEPSEEK] Initiating request to OpenRouter...");
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "google/gemini-2.0-flash-exp:free",
          messages: [
            { role: "system", content: systemInstruction },
            ...messages.map((m: any) => ({
              role: m.role === 'bot' || m.role === 'model' ? 'assistant' : 'user',
              content: m.text
            }))
          ],
          max_tokens: 1536,
        },
        {
          headers: {
            "Authorization": `Bearer ${deepseekKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
            "X-Title": "Doctorian Medical AI",
          },
          timeout: 25000 // Increased timeout for Deepseek R1
        }
      );

      if (response.data?.choices?.[0]?.message?.content) {
        console.log("[DEEPSEEK] Successful response received.");
        return res.json({ text: response.data.choices[0].message.content });
      } else {
        console.error("[DEEPSEEK] Invalid structure:", JSON.stringify(response.data));
        throw new Error("Invalid response structure from Deepseek provider.");
      }
    } catch (err: any) {
      const status = err.response?.status || 500;
      const errorData = err.response?.data || err.message;
      console.error(`[DEEPSEEK ERROR] Status ${status}:`, errorData);
      
      res.status(status).json({ 
        error: "Deepseek service currently unavailable",
        details: typeof errorData === 'object' ? (errorData.error?.message || JSON.stringify(errorData)) : errorData
      });
    }
  });

    app.post("/api/ai/generate-image", authenticate, async (req: any, res) => {
      const { prompt, aspectRatio } = req.body;
      if (!prompt) return res.status(400).json({ error: "No prompt provided" });

      // Credit Check
      const creditStatus = deductCredits(req.user.id, CREDIT_COSTS.IMAGE_GEN);
      if (!creditStatus.success) {
        return res.status(402).json({ 
          error: "Insufficient Neural Energy", 
          details: `Image synthesis requires ${CREDIT_COSTS.IMAGE_GEN} credits. Your current balance is ${creditStatus.remaining}.` 
        });
      }

      console.log(`[AI] Image generation request from user ${req.user.id}: ${prompt.substring(0, 50)}...`);

      try {
        console.log(`[AI] Generating high-fidelity clinical model using Flux via Pollinations: "${prompt}"`);
        const queryPrompt = `High-fidelity professional medical illustration: ${prompt}. Anatomically precise, clinical textbook style, 4k resolution, clean clinical background.`;
        const pollinationsUrl = `https://image.pollinations.ai/p/${encodeURIComponent(queryPrompt)}?width=768&height=768&seed=${Math.floor(Math.random() * 1000000)}&nologo=true&private=true`;

        const response = await axios.get(pollinationsUrl, {
          responseType: 'arraybuffer',
          timeout: 40000
        });

        const base64Data = Buffer.from(response.data, 'binary').toString('base64');
        return res.json({ 
          imageData: `data:image/jpeg;base64,${base64Data}`,
          success: true 
        });
      } catch (err: any) {
        console.error("[AI] Pollinations Image Generation Error:", err);
        return res.status(500).json({ error: "Visualization synthesis pathways disrupted.", details: err.message });
      }
    });

    app.post("/api/ai/voice/start", authenticate, (req: any, res) => {
      const creditStatus = deductCredits(req.user.id, CREDIT_COSTS.VOICE_CALL);
      if (!creditStatus.success) {
        return res.status(402).json({ 
          error: "Insufficient Neural Energy", 
          details: `Voice consultation requires ${CREDIT_COSTS.VOICE_CALL} credits. Balance: ${creditStatus.remaining}.` 
        });
      }
      res.json({ success: true, remaining: creditStatus.remaining });
    });

    app.post("/api/ai/voice", authenticate, async (req: any, res) => {
      // Small deduction for the placeholder if called
      const creditStatus = deductCredits(req.user.id, 1);
      res.json({ 
        error: "Voice synthesis undergoing core node rebuild.",
        creditsRemaining: creditStatus.remaining
      });
    });

    app.post("/api/ai/operational-ideas", authenticate, async (req: any, res) => {
      const creditStatus = deductCredits(req.user.id, CREDIT_COSTS.OPERATIONAL_IDEAS);
      if (!creditStatus.success) {
        return res.status(402).json({ 
          error: "Neural Energy Required", 
          details: `Autonomous reasoning requires ${CREDIT_COSTS.OPERATIONAL_IDEAS} credits.` 
        });
      }
      res.json({ 
        idea: "Autonomous clinical reasoning nodes are being synchronized with the new Qwen engine. This strategic ideation pathway will be active shortly.",
        creditsRemaining: creditStatus.remaining
      });
    });

    // Developer API Keys
    app.get("/api/developer/keys", authenticate, (req: any, res) => {
      try {
        const keys = db.prepare("SELECT * FROM developer_keys WHERE userId = ? ORDER BY createdAt DESC").all(req.user.id || req.user.uid);
        res.json(keys);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    app.post("/api/developer/keys", authenticate, (req: any, res) => {
      try {
        const { label } = req.body;
        const apiKey = "doc_" + Math.random().toString(36).substring(2, 10) + "_" + Date.now().toString(36);
        db.prepare("INSERT INTO developer_keys (userId, apiKey, label) VALUES (?, ?, ?)").run(req.user.uid, apiKey, label || "Main API Key");
        res.json({ apiKey });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    app.delete("/api/developer/keys/:id", authenticate, (req: any, res) => {
      try {
        db.prepare("DELETE FROM developer_keys WHERE id = ? AND userId = ?").run(req.params.id, req.user.uid);
        res.json({ success: true });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // Public External API (for other developers)
    app.post("/api/external/v1/chat", async (req, res) => {
      const apiKeyToken = req.headers['x-api-key'] as string;
      if (!apiKeyToken) return res.status(401).json({ error: "Missing API Key" });

      const devKey = db.prepare("SELECT * FROM developer_keys WHERE apiKey = ?").get(apiKeyToken) as any;
      if (!devKey) return res.status(401).json({ error: "Invalid API Key" });

      const { prompt, useExternalAPI = false } = req.body;
      if (!prompt) return res.status(400).json({ error: "Missing prompt" });

      try {
        // Update last used
        db.prepare("UPDATE developer_keys SET lastUsed = CURRENT_TIMESTAMP WHERE apiKey = ?").run(apiKeyToken);

        // Use the Cloud AI as default since local is removed
        // Fetch specialized knowledge for context
        const specializedKnowledge = db.prepare("SELECT * FROM knowledge_base WHERE userId = ? LIMIT 5").all(devKey.userId) as any[];
        const knowledgeContext = specializedKnowledge.map(k => `[${k.category.toUpperCase()}: ${k.title}] ${k.content}`).join("\n");

        const systemInstruction = `You are Doctorian External API. Use the following project-specific knowledge to assist users:\n\n${knowledgeContext}`;
        
        const responseText = await callAI({
           messages: [{ role: 'user', text: prompt }],
           systemInstruction,
           userId: devKey.userId
        });

        return res.json({
          response: responseText,
          attribution: "Doctorian Neural Network (External Cloud Link)"
        });

        const response = await callAI({
          messages: [{ role: 'user', text: prompt }],
          systemInstruction
        });
        
        res.json({ 
          response: response,
          attribution: "Powered by Medical Neural Network (Llama 3.1/Gemma 2)" 
        });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    app.post("/api/ai/chat", authenticate, async (req, res) => {
      const { messages, systemInstruction, modelName, temperature, useSearch, thinkingLevel, modelOverride, images, targetLanguage } = req.body;
      const userId = (req as any).user.id;
      const user = db.prepare("SELECT enableExternalAI FROM users WHERE id = ?").get(userId) as any;
      const hasExternalAI = user?.enableExternalAI === 1;

      // Credit Check
      const credits = getUserCredits(userId);
      if (credits <= 0) {
        return res.status(403).json({ 
          error: "Neural units exhausted.", 
          type: "CREDITS_EXHAUSTED",
          message: "Your current bandwidth for medical intelligence synthesis has been exhausted. Reactivate your link with a specialized protocol to continue deep-layer clinical diagnostics." 
        });
      }

      console.log(`[AI] Processing chat request for user ${userId}. Language: ${targetLanguage}`);

      try {
        if (!messages) {
          return res.status(400).json({ error: "Messages array required" });
        }

        const rawUserMessage = (messages && messages.length > 0) ? messages[messages.length - 1].text : "Hello";
        const greeted = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"].some(g => rawUserMessage.toLowerCase().trim() === g);
        if (greeted && (!messages || messages.length <= 1)) {
           return res.json({ text: "Hello! I am Doctorian. How can I assist with your health and wellness today?" });
        }

        const isMedical = isMedicalQuery(rawUserMessage);
        let finalMessages = [...messages];
        let activeTargetLang = targetLanguage || 'English';

        // Auto Language Detection
        if (activeTargetLang === 'Auto Detect') {
          try {
            activeTargetLang = await callAI({
              messages: [{ role: 'user', text: `Identify the language of: "${rawUserMessage}"` }],
              systemInstruction: "Identify the language and return ONLY the name (e.g. 'Luganda', 'Ateso', 'English')."
            });
          } catch (e) { activeTargetLang = 'English'; }
        }

        // Forward Translation
        if (activeTargetLang !== "English") {
          try {
            const translation = await callAI({
              messages: [{ role: 'user', text: `Translate to English: "${rawUserMessage}"` }],
              systemInstruction: "Translate the medical query to English."
            });
            if (translation) finalMessages[finalMessages.length - 1].text = translation;
          } catch (e) { }
        }

        let knowledgeContext = "";
        try {
          const kbEntries = db.prepare("SELECT title, content FROM knowledge_base WHERE userId = ? OR userId = 'system'").all(userId) as any[];
          if (kbEntries.length > 0) {
            knowledgeContext = `\n\nINTERNAL MEDICAL RECORDS:\n${kbEntries.map(e => `[${e.title}]: ${e.content}`).join('\n')}`;
          }
        } catch (e) { }

        // Model Selection
        let targetModel = modelOverride;
        if (!targetModel) {
          if (!hasExternalAI) targetModel = DEFAULT_GEMINI_ENGINE;
          else if (isMedical) targetModel = MEDICAL_REASONING_ENGINE;
          else targetModel = PRIMARY_ENGINE;
        }

        const EMOJI_CHUNKS_DIRECTIVE = `\n\n[CRITICAL OPERATIONAL UPDATE]: The user has requested that you MUST answer in clear, chunked/structured sections, heavily enriched with professional medical and organizational emojis (e.g., 🩺, 🧠, 🫀, 🔬, 💊, 🩹, 🩸, 🏥, ✨, 🌟, 🛡️, 📋, 🔍, ✅). Ensure your response is highly professional, scientifically precise, and formatted in clean Markdown with scannable headers and bullet points. Break down complex medical insights into easily digestible cognitive "chunks". Do not return plain large walls of text. Avoid long preambles.`;
        const enrichedSystemInstruction = `${systemInstruction}\n\n${knowledgeContext}${EMOJI_CHUNKS_DIRECTIVE}`;

        const wantsStream = req.headers.accept === 'text/event-stream';
        if (wantsStream) {
          res.setHeader('Content-Type', 'text/event-stream');
          res.setHeader('Cache-Control', 'no-cache');
          res.setHeader('Connection', 'keep-alive');

          try {
            const stream = callAIStream({
              messages: finalMessages,
              systemInstruction: enrichedSystemInstruction,
              modelName: targetModel,
              temperature,
              useSearch,
              thinkingLevel
            });

            let fullResponse = "";
            let success = false;
            for await (const chunk of stream) {
              success = true;
              if (activeTargetLang !== "English") {
                fullResponse += chunk;
              } else {
                res.write(`data: ${JSON.stringify({ text: chunk, credits: credits - 1 })}\n\n`);
              }
            }

            if (success && activeTargetLang !== "English") {
              const translated = await callAI({
                messages: [{ role: 'user', text: `Translate to ${activeTargetLang}: ${fullResponse}` }],
                systemInstruction: "Translate medical response accurately."
              });
              res.write(`data: ${JSON.stringify({ text: translated, credits: credits - 1 })}\n\n`);
            }

            if (success) {
              res.write("data: [DONE]\n\n");
              deductCredits(userId, 1);
            }
            res.end();
          } catch (err: any) {
            console.error("[AI-STREAM] Error:", err.message);
            if (!res.headersSent) res.status(500).json({ error: err.message });
            else {
              res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
              res.end();
            }
          }
        } else {
          // JSON Request
          try {
            const responseText = await callAI({
              messages: finalMessages,
              systemInstruction: enrichedSystemInstruction,
              modelName: targetModel,
              temperature,
              userId
            });

            let finalResponse = responseText;
            if (activeTargetLang !== "English") {
              finalResponse = await callAI({
                messages: [{ role: 'user', text: `Translate to ${activeTargetLang}: ${responseText}` }],
                systemInstruction: "Translate medical response accurately."
              });
            }

            deductCredits(userId, 1);
            res.json({ text: finalResponse, creditsRemaining: getUserCredits(userId) });
          } catch (err: any) {
            res.status(500).json({ error: err.message });
          }
        }
      } catch (err: any) {
        if (!res.headersSent) res.status(500).json({ error: err.message });
      }
    });

    // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("[SERVER] Starting Vite in Middleware Mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    // Explicitly handle index.html for SPA if middlewares don't catch it
    app.get("*", async (req, res, next) => {
      // Skip if it's an API call or looks like a file request (has a dot in the last path segment)
      if (req.originalUrl.startsWith('/api') || (req.path.includes('.') && !req.path.endsWith('.html'))) {
        return next();
      }
      
      const url = req.originalUrl;
      try {
        const indexHtmlPath = path.resolve(__dirname, "index.html");
        if (!fs.existsSync(indexHtmlPath)) {
          return next();
        }
        let template = fs.readFileSync(indexHtmlPath, "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });

    console.log("[SERVER] Vite Middleware integrated.");
  } else {
    console.log("[SERVER] Running in PRODUCTION mode.");
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      // API fallback
      if (req.originalUrl.startsWith('/api')) {
        return res.status(404).json({ error: "API endpoint not found" });
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Final catch-all for /api specifically to avoid HTML fallthrough
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: `Path ${req.originalUrl} not found in Clinical Nexus.` });
  });

  // Seed demo user
  const seedDemoUser = async () => {
    const email = "doctor@medical-ai.studio";
    const existing = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (!existing) {
      const hashedPassword = await bcrypt.hash("Password123!", 10);
      const id = "demo-doctor-id";
      const createdAt = new Date().toISOString();
      db.prepare("INSERT INTO users (id, email, password, displayName, role, createdAt) VALUES (?, ?, ?, ?, ?, ?)")
        .run(id, email, hashedPassword, "Dr. Demo", "admin", createdAt);
      console.log("[SEED] Demo admin user created");
    } else if (existing.role !== 'admin') {
      db.prepare("UPDATE users SET role = 'admin' WHERE email = ?").run(email);
      console.log("[SEED] Demo user updated to admin");
    }
  };
  await seedDemoUser();

  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/api/ai/live' });
  const biometricsWss = new WebSocketServer({ server, path: '/api/biometrics' });

  biometricsWss.on('connection', (ws, req) => {
    console.log("[WS-BIO] Biometric Neural Stream Connected.");
    biometricClients.add(ws);

    // Initial heartbeat/sync
    ws.send(JSON.stringify({ type: 'status', message: 'Neural Handshake Established', timestamp: Date.now() }));

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        // Relay vitals or control messages to other connected clients
        broadcastBiometrics(message, ws);
      } catch (err) {
        // Handle raw string data (e.g. from simpler Arduino code)
        broadcastBiometrics({ type: 'vitals_raw', data: data.toString() }, ws);
      }
    });

    ws.on('close', () => {
      console.log("[WS-BIO] Biometric Neural Stream Disconnected.");
      biometricClients.delete(ws);
    });

    ws.on('error', (err) => {
      console.error("[WS-BIO] Biometric Stream Error:", err);
    });
  });

  wss.on('connection', (ws, req) => {
    console.log("[WS] Neural Voice Connection established under Meta Llama 3.1...");
    
    // Auth Check via Cookie
    const cookies = req.headers.cookie ? Object.fromEntries(req.headers.cookie.split('; ').map(c => c.split('='))) : {};
    const token = cookies.token;

    if (!token) {
      console.warn("[WS] Connection rejected: No auth token.");
      ws.close(4001, "Unauthorized");
      return;
    }

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      console.log(`[WS] Neural Voice established for user: ${decoded.email}`);
      arduinoClients.add(ws);

      // Instantly greet the user with the exact response shape expected by the frontend hook
      ws.send(JSON.stringify({
        serverContent: {
          modelTurn: {
            parts: [{
              text: "Hello! I am Doctorian, powered by the Llama 3.1 Diagnostic Core. How can I assist with your biological health or vitals today?"
            }]
          }
        }
      }));

      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());
          if (message.type === 'setup') {
            console.log("[WS] Meta Llama 3.1 Neural Live session configured.");
          } else if (message.text) {
            console.log(`[WS] Processing text command via Llama: "${message.text}"`);
            const responseText = await callAI({
              messages: [{ role: 'user', text: message.text }],
              systemInstruction: "You are Doctorian, a clinical voice assistant powered by Meta Llama 3.1. Provide a warm, clear, professional answer under 25 words so it has high voice stream flow.",
              modelName: PRIMARY_ENGINE
            });
            
            ws.send(JSON.stringify({
              serverContent: {
                modelTurn: {
                  parts: [{ text: responseText }]
                }
              }
            }));
          }
        } catch (err) {
          console.error("[WS] Message processing error:", err);
        }
      });

      ws.on('close', () => {
        console.log(`[WS] Neural Voice disconnected for ${decoded.email}`);
        arduinoClients.delete(ws);
      });

    } catch (err: any) {
      console.error("[WS] Auth Failed:", err.message);
      ws.close(4001, "Invalid Token");
    }
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] >>> Doctorian Neural Matrix Online at http://localhost:${PORT} <<<`);
    console.log(`[SERVER] ENVIRONMENT: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer().catch(err => {
  console.error("FATAL: Failed to start server:", err);
  process.exit(1);
});
