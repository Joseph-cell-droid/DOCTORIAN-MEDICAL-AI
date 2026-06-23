import React, { useState, useEffect, useCallback } from 'react';
import { 
  Terminal, 
  Key, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Code2, 
  ExternalLink,
  ShieldCheck,
  Cpu,
  Brain,
  Database,
  Globe,
  Info,
  ArrowRight,
  RefreshCw,
  Eye,
  EyeOff,
  Activity,
  Wifi,
  WifiOff,
  AlertCircle,
  Zap,
  Cloud
} from 'lucide-react';
import { api } from '../api';
import { motion, AnimatePresence } from 'motion/react';

export const DeveloperPortal: React.FC = () => {
  const [keys, setKeys] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyLabel, setNewKeyLabel] = useState('');
  const [showKeyModal, setShowKeyModal] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'keys' | 'docs'>('keys');
  const [revealKeyId, setRevealKeyId] = useState<number | null>(null);
  const [credentials, setCredentials] = useState<any>(null);
  const [showCredentials, setShowCredentials] = useState(false);

  // Smart Fallback Diagnostic States
  const [prioritizeLocal, setPrioritizeLocal] = useState<boolean>(() => {
    return localStorage.getItem('doctorian_prioritize_local_ai') !== 'false';
  });
  const [failCount, setFailCount] = useState<number>(() => {
    return parseInt(localStorage.getItem('doctorian_local_fail_count') || '0', 10);
  });
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [pingSuccess, setPingSuccess] = useState<boolean | null>(null);
  const [pingLog, setPingLog] = useState<string[]>([]);

  useEffect(() => {
    fetchKeys();
    fetchCredentials();
    loadProfile();
    
    const savedUrl = localStorage.getItem('doctorian_cached_ollama_url') || 'https://fuzzy-bugs-run.loca.lt';
    setPingLog([
      `[${new Date().toLocaleTimeString()}] Diagnostic environment loaded.`,
      `[${new Date().toLocaleTimeString()}] Target Local AI Endpoint: ${savedUrl}`,
      `[${new Date().toLocaleTimeString()}] Ready to audit connectivity route.`
    ]);
  }, []);

  const loadProfile = async () => {
    try {
      const u = await api.auth.getProfile();
      setUserProfile(u);
      if (u?.ollamaUrl) {
        localStorage.setItem('doctorian_cached_ollama_url', u.ollamaUrl);
      }
    } catch (err) {
      try {
        const cached = localStorage.getItem('medical_user');
        if (cached) {
          const u = JSON.parse(cached);
          setUserProfile(u);
          if (u?.ollamaUrl) {
            localStorage.setItem('doctorian_cached_ollama_url', u.ollamaUrl);
          }
        }
      } catch (e) {}
    }
  };

  const refreshFallbackState = () => {
    setPrioritizeLocal(localStorage.getItem('doctorian_prioritize_local_ai') !== 'false');
    setFailCount(parseInt(localStorage.getItem('doctorian_local_fail_count') || '0', 10));
  };

  const resetFallbackState = () => {
    localStorage.setItem('doctorian_prioritize_local_ai', 'true');
    localStorage.setItem('doctorian_local_fail_count', '0');
    refreshFallbackState();
    setPingSuccess(null);
    setPingLog(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Diagnostics manual override: Reset failure counter. Re-prioritized Local LM Studio.`
    ]);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setPingSuccess(null);
    const targetUrl = userProfile?.ollamaUrl || localStorage.getItem('doctorian_cached_ollama_url') || 'https://fuzzy-bugs-run.loca.lt';
    const cleanUrl = targetUrl.trim().replace(/\/$/, "");
    
    setPingLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Auditing connection to ${cleanUrl}...`]);
    
    try {
      const isLMStudio = cleanUrl.includes(':1234') || cleanUrl.includes('/v1') || cleanUrl.toLowerCase().includes('lmstudio');
      const finalUrl = isLMStudio
        ? (cleanUrl.includes('/v1') ? `${cleanUrl}/chat/completions` : `${cleanUrl}/v1/chat/completions`)
        : (cleanUrl.includes('/api/chat') ? cleanUrl : `${cleanUrl}/api/chat`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

      const bodyPayload = isLMStudio ? {
        model: "gemma4",
        messages: [{ role: "user", content: "ping" }],
        stream: false,
        max_tokens: 1
      } : {
        model: "gemma4",
        messages: [{ role: "user", content: "ping" }],
        stream: false,
        options: { num_predict: 1 }
      };

      const res = await fetch(finalUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        setPingSuccess(true);
        localStorage.setItem('doctorian_local_fail_count', '0');
        refreshFallbackState();
        setPingLog(prev => [
          ...prev, 
          `[${new Date().toLocaleTimeString()}] Connection check succeeded! Local LM Studio is ONLINE and active. Failures reset.`
        ]);
      } else {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
    } catch (err: any) {
      setPingSuccess(false);
      setPingLog(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Connection check failed: ${err?.message || 'Network blocked or Timeout'}.`,
        `[${new Date().toLocaleTimeString()}] Suggestions: Verify Local LM Studio is running, CORS is enabled, and try options path.`
      ]);
    } finally {
      setIsTesting(false);
    }
  };

  const fetchCredentials = async () => {
    try {
      const data = await api.developer.getCredentials();
      setCredentials(data);
    } catch (err) {
      console.error("Failed to load clinical keys context:", err);
    }
  };

  const fetchKeys = async () => {
    try {
      const data = await api.developer.listKeys();
      setKeys(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateKey = async () => {
    try {
      setIsCreating(true);
      const result = await api.developer.createKey(newKeyLabel);
      setShowKeyModal(result.apiKey);
      setNewKeyLabel('');
      fetchKeys();
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteKey = async (id: number) => {
    if (!confirm("Are you sure you want to revoke this API key?")) return;
    try {
      await api.developer.deleteKey(id);
      fetchKeys();
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const codeExample = `
// Example usage of Doctorian Neural API (OpenAI Compatible)
const response = await fetch('https://your-domain.app/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    model: 'llama-3.1-70b', // or 'gemma-2-27b'
    messages: [
      { role: 'user', content: 'Analyze symptom: sudden joint pain' }
    ],
    stream: false
  })
});

const data = await response.json();
console.log(data.choices[0].message.content);
  `.trim();

  const vsCodeConfig = `
// For extensions like 'Continue', 'Cline', or 'OpenAI'
{
  "provider": "openai",
  "apiKey": "YOUR_API_KEY",
  "apiBase": "https://your-domain.app/api/v1",
  "model": "llama-3.1-70b"
}
  `.trim();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
              Developer <span className="text-blue-600">Portal</span>
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Expose your trained medical intelligence to the world.</p>
        </div>

        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('keys')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'keys' 
                ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            API Keys
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'docs' 
                ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Documentation
          </button>
          <button
            onClick={() => setActiveTab('ollama' as any)}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === ('ollama' as any)
                ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Ollama Link
          </button>
        </div>
      </div>

      {activeTab === 'ollama' as any && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
               <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                    <Cpu size={24} />
                 </div>
                 <div>
                   <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Ollama Local Link</h2>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Connect your local Phi-3 Neural Node</p>
                 </div>
               </div>

               <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
                 Bridge your local <strong>Phi-3</strong> or <strong>Llama 3.1</strong> model running via Ollama directly into the Doctorian engine. This allows for private, local-first medical synthesis.
               </p>

               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ollama Base URL</label>
                     <div className="flex gap-2">
                        <input 
                          type="text" 
                          defaultValue="http://localhost:11434"
                          className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-bold text-sm"
                          placeholder="http://localhost:11434"
                        />
                        <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95">Link</button>
                     </div>
                     <p className="text-[9px] font-bold text-slate-400 mt-2 italic px-1">
                       * Note: Browser CORS restrictions apply. Use a tunnel (ngrok) or our "Relay Browser Extension" for localhost connections.
                     </p>
                  </div>

                  <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
                     <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                       <Info size={14} /> Neural Prerequisites
                     </h4>
                     <ul className="space-y-2">
                       {[
                         'Ollama v0.3.10+ Installed',
                         'Llama 3.1 8B/70B Manifest Pulled',
                         'CORS set: OLLAMA_ORIGINS="*" env set'
                       ].map((item, i) => (
                         <li key={i} className="text-[10px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-blue-500" /> {item}
                         </li>
                       ))}
                     </ul>
                  </div>
               </div>
            </div>

            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                  <ExternalLink size={120} />
               </div>
               <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-4">Official Platform Link</h3>
               <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">Ollama <span className="text-blue-400">Registry</span></h2>
               <p className="text-sm text-slate-400 font-medium leading-relaxed mb-8">
                 Download the latest Llama 3.1 weights and the Ollama runtime directly from the official source to ensure model integrity.
               </p>
               <a 
                 href="https://ollama.com/library/llama3.1" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-900 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-blue-50 transition-all active:scale-95 shadow-xl shadow-white/5"
               >
                 Ollama Library <ArrowRight size={16} />
               </a>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-1 shadow-sm overflow-hidden flex flex-col">
             <div className="bg-slate-50 dark:bg-slate-800 px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-slate-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Terminal Configuration</span>
                </div>
             </div>
             <div className="p-8 space-y-6">
                <div className="space-y-4">
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">1. Launch Ollama with CORS Node</p>
                   <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 font-mono text-xs relative group">
                      <code className="text-emerald-400 text-high-visibility">OLLAMA_ORIGINS="*" ollama serve</code>
                      <button 
                        onClick={() => copyToClipboard('OLLAMA_ORIGINS="*" ollama serve')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                      >
                         <Copy size={14} />
                      </button>
                   </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">2. Pull Phi-3 weights</p>
                   <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 font-mono text-xs relative group">
                      <code className="text-blue-400 text-high-visibility">ollama run phi3</code>
                      <button 
                        onClick={() => copyToClipboard('ollama run phi3')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                      >
                         <Copy size={14} />
                      </button>
                   </div>
                </div>

                <div className="pt-8 flex flex-col items-center justify-center text-center">
                   <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-[2.5rem] flex items-center justify-center mb-6">
                      <RefreshCw size={32} className="text-blue-600 animate-spin-slow" />
                   </div>
                   <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-2">Awaiting Neural Bridge</h4>
                   <p className="text-[10px] font-bold text-slate-400 max-w-xs leading-relaxed">
                      Once your local Ollama instance is configured with CORS, input the URL in the Link panel to synchronize your local Llama 3.1 node.
                   </p>
                </div>
             </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'keys' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-blue-600" />
                  <h2 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Active Neural Links</h2>
                </div>
              </div>
              
              <div className="divide-y divide-slate-50 dark:divide-slate-800">
                {isLoading ? (
                  <div className="p-12 text-center">
                    <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Scanning Registry...</p>
                  </div>
                ) : keys.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full w-fit mx-auto mb-4">
                      <ShieldCheck className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 mb-2">No active API keys found.</p>
                    <p className="text-xs text-slate-400">Generate a key to start integrating your trained AI.</p>
                  </div>
                ) : (
                  keys.map(key => {
                    const isRevealed = revealKeyId === key.id;
                    return (
                      <div key={key.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="space-y-1">
                          <h3 className="font-bold text-slate-900 dark:text-white capitalize">{key.label}</h3>
                          <div className="flex items-center gap-3">
                            <code className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">
                              {isRevealed ? key.apiKey : `${key.apiKey.substring(0, 8)}...${key.apiKey.substring(key.apiKey.length - 4)}`}
                            </code>
                            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">
                              Created: {new Date(key.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setRevealKeyId(isRevealed ? null : key.id)}
                            className="p-2 text-slate-400 hover:text-blue-500 rounded-xl transition-all"
                            title={isRevealed ? "Hide Key" : "Reveal Key"}
                          >
                            {isRevealed ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                          <button 
                            onClick={() => copyToClipboard(key.apiKey)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                            title="Copy Key"
                          >
                            <Copy size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteKey(key.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                            title="Revoke Key"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* System Credentials Sharing Section */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-slate-800 rounded-2xl p-6 shadow-md text-white">
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-indigo-400" />
                    <h2 className="font-black text-white uppercase tracking-tight text-sm">System AI API Credentials</h2>
                  </div>
                  <p className="text-xs text-slate-300 max-w-md">
                    To enable other developers to consume your trained medical core model directly, you can copy the master AI orchestrator credentials below.
                  </p>
                </div>
                <button
                  onClick={() => setShowCredentials(!showCredentials)}
                  className="px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 active:bg-white/30 text-white rounded-xl transition-all flex items-center gap-1.5"
                >
                  {showCredentials ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span>{showCredentials ? "Mask Keys" : "Reveal Keys"}</span>
                </button>
              </div>

              {credentials && (
                <div className="mt-6 space-y-4 pt-4 border-t border-white/10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-950/40 p-4 border border-white/5 rounded-xl space-y-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Active Neural Engine</span>
                      <span className="text-white text-xs font-black block">{credentials.provider}</span>
                    </div>
                    <div className="bg-slate-950/40 p-4 border border-white/5 rounded-xl space-y-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Core Gemini Synapse API Key</span>
                      <div className="flex items-center justify-between gap-2">
                        <code className="text-xs font-mono select-all truncate max-w-[200px] text-indigo-200">
                          {showCredentials ? credentials.apiKey : "sk-or-v1-be453e00fc...[masked]"}
                        </code>
                        {credentials.apiKey && credentials.apiKey.length > 10 && (
                          <button
                            onClick={() => copyToClipboard(credentials.apiKey)}
                            className="p-1.5 text-indigo-300 hover:text-white hover:bg-white/10 rounded"
                            title="Copy Master Key"
                          >
                            <Copy size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-900 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Code2 className="w-32 h-32 text-white" />
              </div>
              <div className="relative z-10">
                <h2 className="text-white font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Terminal className="text-blue-400" /> API Console Preview
                </h2>
                <div className="bg-slate-950/50 rounded-xl p-4 font-mono text-sm border border-slate-800 overflow-x-auto">
                  <pre className="text-blue-300">
                    <span className="text-purple-400">POST</span> /api/v1/chat/completions
                  </pre>
                  <pre className="text-slate-400 mt-2">
                    {`{
  "model": "llama-3.1-70b",
  "messages": [{"role": "user", "content": "Explain pain pathways"}]
}`}
                  </pre>
                  <pre className="text-emerald-400 mt-4">
                    <span className="text-slate-500">{"// OpenAI Compatible Response"}</span>
                    {"\n"}
                    {`{
  "choices": [{"message": {"content": "..."}}],
  "model": "llama-3.1-70b"
}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <h3 className="font-black text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-4">Integrate Intelligence</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Generate a new API key to allow external applications to access your specialized medical training.
              </p>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Key Label</label>
                  <input
                    type="text"
                    value={newKeyLabel}
                    onChange={(e) => setNewKeyLabel(e.target.value)}
                    placeholder="e.g. My Health App"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-600 transition-all font-bold text-sm"
                  />
                </div>
                <button
                  onClick={handleCreateKey}
                  disabled={isCreating}
                  className="w-full py-4 bg-blue-600 dark:bg-blue-500 text-white rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 dark:hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isCreating ? (
                     <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Generate Link
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl">
              <div className="p-3 bg-white/10 rounded-xl w-fit mb-4">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight mb-2">Public Model API</h3>
              <p className="text-white/80 text-sm mb-4 leading-relaxed">
                Your trained nodes are automatically synchronized. No maintenance required.
              </p>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-black/20 p-2 rounded-lg">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                Neural API Status: Online
              </div>
            </div>

            {/* Smart Fallback Diagnostic Center */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600 animate-pulse" />
                  <h3 className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                    Smart Fallback Diagnostics
                  </h3>
                </div>
                <button
                  onClick={refreshFallbackState}
                  title="Force Refresh State"
                  className="p-1 px-2 text-[10px] font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 rounded-md transition-all active:scale-95 flex items-center gap-1"
                >
                  <RefreshCw size={10} />
                  <span>Refresh</span>
                </button>
              </div>

              {/* Status Badge */}
              <div className="space-y-3">
                <div className="text-[10px] uppercase tracking-widest font-black text-slate-400">
                  Fallback Route Status
                </div>
                {(!prioritizeLocal || failCount >= 3) ? (
                  <div className="flex flex-col gap-2 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                        Cloud Fallback Active (Bypassing Local)
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                      {failCount >= 3 
                        ? `Local connection failed 3 consecutive times. Autocutoff active.`
                        : `Local AI priority is disabled in main settings.`}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                        Primary Path: Local-First (LM Studio/Ollama)
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium font-sans">
                      Routing insight query attempts to local nodes. No backup currently engaged.
                    </p>
                  </div>
                )}
              </div>

              {/* Connection attempts tally */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-black text-slate-400">
                  <span>Consecutive Local Failures</span>
                  <span className="text-slate-900 dark:text-white font-black">{failCount} / 3</span>
                </div>
                
                <div className="flex items-center gap-3">
                  {[1, 2, 3].map((node) => {
                    const isPassed = failCount < node;
                    const isCurrent = failCount === node - 1 && prioritizeLocal && failCount < 3;
                    return (
                      <div 
                        key={node} 
                        className={`flex-1 h-3 rounded-lg relative overflow-hidden transition-all duration-300 ${
                          isPassed 
                            ? (isCurrent ? 'bg-indigo-100 dark:bg-indigo-950 border border-indigo-400 animate-pulse' : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700')
                            : 'bg-rose-500 dark:bg-rose-600 shadow-sm shadow-rose-500/20'
                        }`}
                      >
                        {isCurrent && (
                          <div className="absolute inset-0 bg-indigo-500/10 animate-ping" />
                        )}
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 font-sans">
                  <span>Attempt 1</span>
                  <span>Attempt 2</span>
                  <span>Attempt 3 (Limit)</span>
                </div>
              </div>

              {/* Audit targets */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700/50 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Cpu size={14} className="text-slate-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Local Provider</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400 truncate max-w-[150px]">
                    {userProfile?.ollamaUrl || localStorage.getItem('doctorian_cached_ollama_url') || 'http://localhost:11434'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Cloud size={14} className="text-slate-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cloud Backup</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400">
                    Gemma 2 27B @ Cloud Neural Link
                  </span>
                </div>
              </div>

              {/* Live diagnostic terminal logs */}
              <div className="space-y-3">
                <div className="text-[10px] uppercase tracking-widest font-black text-slate-400">
                  Diagnostic Connection Logs
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[9px] text-slate-300 space-y-1.5 max-h-[120px] overflow-y-auto scrollbar-thin">
                  {pingLog.map((logStr, i) => (
                    <div key={i} className="leading-tight select-all">
                      <span className="text-indigo-400">{logStr.substring(0, 11)}</span>
                      <span className="text-slate-300">{logStr.substring(11)}</span>
                    </div>
                  ))}
                  {pingSuccess !== null && (
                    <div className={`font-bold mt-1 ${pingSuccess ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {pingSuccess 
                        ? '>> DIAGNOSTIC AUDIT: LM STUDIO REACHABLE (ONLINE_SECURE)' 
                        : '>> DIAGNOSTIC AUDIT: DIRECT LINK CRITICAL OFFLINE (FALLBACK_BYPASS)'}
                    </div>
                  )}
                </div>
              </div>

              {/* Interactive buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="flex-1 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isTesting ? (
                    <>
                      <RefreshCw size={12} className="animate-spin" />
                      <span>Auditing...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={12} />
                      <span>Ping Local Node</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={resetFallbackState}
                  className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <RefreshCw size={12} />
                  <span>Reset Status</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <Globe className="text-blue-600" /> Unified Neural Endpoint
              </h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Doctorian AI now provides a <strong>Standard OpenAI Compatible API</strong>. You can use any library or application that supports OpenAI, including VS Code extensions like Continue, Cline, and Roo Code.
              </p>
              <div className="bg-slate-900 rounded-xl p-4 font-mono text-sm text-blue-300 border border-slate-800">
                POST /api/v1/chat/completions
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <Database className="text-purple-600" /> Request Payload
              </h2>
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Parameter</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    <tr>
                      <td className="px-6 py-4 font-mono text-blue-600 dark:text-blue-400">model</td>
                      <td className="px-6 py-4">string</td>
                      <td className="px-6 py-4 text-slate-500">'llama-3.1-70b' or 'gemma-2-27b'</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-mono text-blue-600 dark:text-blue-400">messages</td>
                      <td className="px-6 py-4">array</td>
                      <td className="px-6 py-4 text-slate-500">Array of OpenAI-format message objects.</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-mono text-blue-600 dark:text-blue-400">stream</td>
                      <td className="px-6 py-4">boolean</td>
                      <td className="px-6 py-4 text-slate-500">Set to true for server-sent events.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <Brain className="text-emerald-600" /> Research & Collaboration
              </h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Doctorian AI is designed for collective intelligence. When you train your neural nodes, you're building a clinical blueprint that other authorized researchers can leverage to accelerate medical innovation.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800">
                  <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Researcher Access</h4>
                  <p className="text-xs text-slate-500">Enable cross-node synthesis for academic validation of your trained medical logic.</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800">
                  <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Commercial Hooks</h4>
                  <p className="text-xs text-slate-500">Deploy your trained AI endpoints to power external healthcare applications and diagnostic tools.</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2 text-orange-600">
                <Terminal className="text-orange-600" /> Local & VS Code Integration
              </h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Bridge the gap between your local development environment and our neural network. Perfect for debugging local medical extensions.
              </p>
              <div className="bg-slate-900 rounded-xl p-6 relative group border border-orange-500/20">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Extension Configuration</span>
                  <button 
                    onClick={() => copyToClipboard(vsCodeConfig)}
                    className="text-white/40 hover:text-white transition-colors"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                <pre className="text-orange-300 font-mono text-xs overflow-x-auto">
                  {vsCodeConfig}
                </pre>
              </div>
              <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-xl">
                <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-2">Localhost Tunneling</h4>
                <p className="text-xs text-slate-500">
                  Our system supports secure tunneling from <code>localhost:3000</code>. Ensure your local CORS policy allows requests from <code>{window.location.origin}</code> to maintain seamless neural sync.
                </p>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-slate-50 dark:bg-slate-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-slate-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Implementation Example</span>
                </div>
                <button 
                  onClick={() => copyToClipboard(codeExample)}
                  className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy Code'}
                </button>
              </div>
              <div className="p-6 bg-slate-900 overflow-x-auto">
                <pre className="text-slate-300 font-mono text-xs leading-relaxed">
                  {codeExample}
                </pre>
              </div>
            </div>

            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
              <h4 className="font-black text-blue-900 dark:text-blue-100 uppercase tracking-widest text-xs mb-2">Pro Tip</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                By leveraging the `knowledge_base` within the app, your API response will automatically reflect your specialized medical synthesis and neural nodes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Key Display Modal */}
      <AnimatePresence>
        {showKeyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowKeyModal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 text-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                <div className="p-4 bg-white/10 rounded-full w-fit mx-auto mb-4">
                  <ShieldCheck className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Identity Locked</h2>
                <p className="text-white/70 text-sm">Save this key securely. It will not be shown again.</p>
              </div>
              <div className="p-8 space-y-6">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 break-all font-mono text-center relative group">
                  <div className="text-slate-900 dark:text-white font-bold">{showKeyModal}</div>
                </div>
                <button
                  onClick={() => copyToClipboard(showKeyModal)}
                  className="w-full py-4 bg-slate-900 dark:bg-slate-700 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95"
                >
                   {copied ? <Check size={20} className="text-emerald-400" /> : <Copy size={20} />}
                   {copied ? 'Link Copied' : 'Copy Neural Link'}
                </button>
                <p className="text-center text-[10px] text-slate-400 uppercase font-black tracking-widest">
                  REVOKE KEY AT ANY TIME FROM THE REGISTRY
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
