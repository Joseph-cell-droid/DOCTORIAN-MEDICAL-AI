import React, { useState, useEffect } from 'react';
import { 
  User, Camera, Mail, Shield, Save, Loader2, 
  CheckCircle2, AlertCircle, LogOut, Fingerprint,
  ScanFace, Bell, Globe, Lock, ArrowLeft, Plus,
  X, RefreshCw, QrCode, Download, Share2,
  Activity, Zap, Crown, CreditCard,
  Syringe as Pill, ChevronLeft, ChevronRight,
  FileText, ShieldAlert, Phone, ShieldCheck, Cpu, Settings,
  Key, Sparkles, ExternalLink, Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { api, User as UserType, detectActiveLocalNode } from '../api';
import { UpgradeModal } from './UpgradeModal';
import { translate } from '../utils/translations';
import { useRef } from 'react';

interface ProfileSettingsProps {
  user: UserType | null;
  onUpdate: (user: UserType) => void;
  onLogout: () => void;
  onBack: () => void;
  onNavigate?: (view: any) => void;
  currentLanguage?: string;
  onLanguageChange?: (lang: string) => void;
  addToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ 
  user, 
  onUpdate, 
  onLogout, 
  onBack, 
  onNavigate,
  currentLanguage,
  onLanguageChange,
  addToast
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'emergency' | 'security' | 'notifications' | 'medical-id' | 'billing'>('profile');
  const isIframe = typeof window !== 'undefined' && window.self !== window.top;
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [enableExternalAI, setEnableExternalAI] = useState(user?.enableExternalAI || false);
  const [aiBrainOption, setAiBrainOption] = useState<'in_browser' | 'cloud' | 'laptop_node' | 'huggingface' | 'gemma_cloud'>(() => {
    const engine = typeof window !== 'undefined' ? localStorage.getItem('doctorian_clinical_engine') : null;
    if (engine === 'gemma3-tfjs' || !engine) {
      return 'in_browser'; // Default/primary is in_browser / Option 1
    }
    if (engine === 'gemma-cloud') {
      return 'gemma_cloud';
    }
    if (engine === 'huggingface') {
      return 'huggingface';
    }
    const prioritizeLocal = typeof window !== 'undefined' ? localStorage.getItem('doctorian_prioritize_local_ai') !== 'false' : false;
    if (prioritizeLocal) {
      return 'laptop_node';
    }
    return 'cloud';
  });
  const [prioritizeLocalAI, setPrioritizeLocalAI] = useState(() => {
    return localStorage.getItem('doctorian_prioritize_local_ai') !== 'false';
  });
  const [enableDeepHealthInsights, setEnableDeepHealthInsights] = useState(user?.enableDeepHealthInsights || false);
  const [ollamaUrl, setOllamaUrl] = useState(user?.ollamaUrl || 'https://fuzzy-bugs-run.loca.lt');
  const [ollamaModel, setOllamaModel] = useState(user?.ollamaModel || 'gemma4');
  const [localApiKey, setLocalApiKey] = useState(() => {
    return localStorage.getItem('doctorian_local_api_key') || '';
  });
  const [huggingfaceToken, setHuggingfaceToken] = useState(user?.huggingfaceToken || '');
  const [huggingfaceModel, setHuggingfaceModel] = useState(user?.huggingfaceModel || 'google/gemma-3-4b-it');
  const [hfModels, setHfModels] = useState<{ id: string; downloads: number; likes: number }[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isVerifyingHf, setIsVerifyingHf] = useState(false);
  const [hfVerificationResult, setHfVerificationResult] = useState<{ success: boolean; message: string } | null>(null);
  
  // Emergency Contact Info
  const [doctorPhone, setDoctorPhone] = useState(user?.doctorPhone || '');
  const [doctorEmail, setDoctorEmail] = useState(user?.doctorEmail || '');
  const [doctorName, setDoctorName] = useState(user?.doctorName || '');
  const [mentorPhone, setMentorPhone] = useState(user?.mentorPhone || '');
  const [mentorEmail, setMentorEmail] = useState(user?.mentorEmail || '');
  const [mentorName, setMentorName] = useState(user?.mentorName || '');
  const [mentorId, setMentorId] = useState(user?.mentorId || '');
  const [doctorId, setDoctorId] = useState(user?.doctorId || '');

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isRegisteringBiometrics, setIsRegisteringBiometrics] = useState(false);
  const [credentials, setCredentials] = useState<any[]>([]);
  const [isLoadingCredentials, setIsLoadingCredentials] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  // Voice Stack & Safety states
  const [selectedVoiceStack, setSelectedVoiceStack] = useState<string>(() => {
    return localStorage.getItem('doctorian_voice_stack') || 'cheapest';
  });
  const [voiceSafetyShort, setVoiceSafetyShort] = useState<boolean>(() => {
    return localStorage.getItem('doctorian_voice_safety_short') !== 'false';
  });
  const [voiceSafetyNoDiag, setVoiceSafetyNoDiag] = useState<boolean>(() => {
    return localStorage.getItem('doctorian_voice_safety_nodiag') !== 'false';
  });
  const [voiceSafetyNoOutcome, setVoiceSafetyNoOutcome] = useState<boolean>(() => {
    return localStorage.getItem('doctorian_voice_safety_nooutcome') !== 'false';
  });
  const [voiceSafetyEncourageHelp, setVoiceSafetyEncourageHelp] = useState<boolean>(() => {
    return localStorage.getItem('doctorian_voice_safety_encourage') !== 'false';
  });

  // Billing History State
  const [billingHistory, setBillingHistory] = useState<any[]>([]);
  const [billingPagination, setBillingPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Sector Data Release Requests State
  const [dataRequests, setDataRequests] = useState<any[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [requestDataType, setRequestDataType] = useState<string>('all');
  const [viewingRequestData, setViewingRequestData] = useState<any | null>(null);

  const fetchDataRequests = async () => {
    setIsLoadingRequests(true);
    try {
      const list = await api.dataRequests.list();
      setDataRequests(list || []);
    } catch (err: any) {
      console.error("Failed to fetch data requests:", err);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchDataRequests();
  }, []);

  const handleCreateDataRequest = async () => {
    try {
      await api.dataRequests.create({ dataType: requestDataType });
      if (addToast) {
        addToast("Sectored database data release request submitted successfully to the Admin!", "success");
      } else {
        setMessage({ text: "Sectored database data release request submitted successfully to the Admin!", type: 'success' });
      }
      fetchDataRequests();
    } catch (err: any) {
      if (addToast) {
        addToast(err.message || "Failed to submit request", "error");
      } else {
        setMessage({ text: err.message || "Failed to submit request", type: 'error' });
      }
    }
  };

  const fetchBillingHistory = async (page = 1) => {
    setIsLoadingHistory(true);
    try {
      const data = await api.billing.getHistory(page, 5);
      setBillingHistory(data.history);
      setBillingPagination(data.pagination);
    } catch (err) {
      console.error("Failed to fetch billing history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'billing') {
      fetchBillingHistory();
    }
  }, [activeTab]);

  const handleDownloadFullHistory = () => {
    // Open the export URL directly - assuming browser handles the download since we set headers
    window.location.href = api.billing.exportUrl();
  };

  const handleDownloadInvoice = (payment: any) => {
    const content = `
DOCTORIAN AI - OFFICIAL INVOICE
-------------------------------
Reference ID: ${payment.externalId}
Date: ${new Date(payment.createdAt).toLocaleDateString()}
Plan/Type: ${payment.tier?.toUpperCase() || 'Neural Credits'}
Amount: ${payment.amount} ${payment.currency}
Status: ${payment.status.toUpperCase()}
User: ${user?.displayName} (${user?.email})

This is a formal billing statement generated by Doctorian AI.
Verified by Joseph Akora - Development Lead.
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice-${payment.externalId || payment.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Notification settings (mock)
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    marketing: false
  });

  // Language settings (parent-synchronized)
  const [language, setLanguage] = useState(currentLanguage || 'English (US)');

  useEffect(() => {
    if (currentLanguage) {
      setLanguage(currentLanguage);
    }
  }, [currentLanguage]);

  const handleLanguageChange = (langName: string) => {
    setLanguage(langName);
    if (onLanguageChange) {
      onLanguageChange(langName);
    }
  };

  const languages = [
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸', native: 'English' },
    { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧', native: 'English' },
    { code: 'es-ES', name: 'Spanish', flag: '🇪🇸', native: 'Español' },
    { code: 'fr-FR', name: 'French', flag: '🇫🇷', native: 'Français' },
    { code: 'de-DE', name: 'German', flag: '🇩🇪', native: 'Deutsch' },
    { code: 'zh-CN', name: 'Chinese', flag: '🇨🇳', native: '简体中文' },
    { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳', native: 'हिन्दी' },
    { code: 'ar-SA', name: 'Arabic', flag: '🇸🇦', native: 'العربية' },
    { code: 'pt-BR', name: 'Portuguese', flag: '🇧🇷', native: 'Português' },
    { code: 'sw-KE', name: 'Swahili', flag: '🇰🇪', native: 'Kiswahili' },
    { code: 'lg-UG', name: 'Luganda', flag: '🇺🇬', native: 'Oluganda' },
    { code: 'ru-RU', name: 'Russian', flag: '🇷🇺', native: 'Русский' },
    { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵', native: '日本語' },
    { code: 'ko-KR', name: 'Korean', flag: '🇰🇷', native: '한국어' },
    { code: 'it-IT', name: 'Italian', flag: '🇮🇹', native: 'Italiano' },
    { code: 'tr-TR', name: 'Turkish', flag: '🇹🇷', native: 'Türkçe' },
  ];

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName);
      setPhotoURL(user.photoURL || '');
      setPhone(user.phone || '');
      setEnableExternalAI(user.enableExternalAI || false);
      setEnableDeepHealthInsights(user.enableDeepHealthInsights || false);
      setOllamaUrl(user.ollamaUrl || 'https://fuzzy-bugs-run.loca.lt');
      setOllamaModel(user.ollamaModel || 'gemma4');
      setHuggingfaceToken(user.huggingfaceToken || '');
      setHuggingfaceModel(user.huggingfaceModel || 'google/gemma-3-4b-it');
    }
  }, [user]);

  const handleVerifyHuggingFace = async () => {
    if (!huggingfaceToken) {
      setMessage({ text: "Please enter your Hugging Face API Token first.", type: "error" });
      return;
    }
    setIsVerifyingHf(true);
    setHfVerificationResult(null);
    try {
      const result = await api.ai.verifyHuggingFace(huggingfaceToken, huggingfaceModel);
      setHfVerificationResult({ success: true, message: result.message });
      setMessage({ text: "Hugging Face handshake successful!", type: "success" });
    } catch (e: any) {
      setHfVerificationResult({ 
        success: false, 
        message: e.message || "Failed to establish handshake. Check token or if the model is loading." 
      });
      setMessage({ text: "Hugging Face verification failed.", type: "error" });
    } finally {
      setIsVerifyingHf(false);
    }
  };

  const loadHfModels = async () => {
    setIsLoadingModels(true);
    try {
      const res = await api.ai.getHuggingFaceModels();
      setHfModels(res.models);
    } catch (e) {
      console.error("Failed to fetch Hugging Face models:", e);
    } finally {
      setIsLoadingModels(false);
    }
  };

  useEffect(() => {
    loadHfModels();
  }, []);

  const renderHuggingFaceSection = () => {
    return (
      <div className="space-y-4 mb-8">
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-blue-600 transition-colors">
            <Key size={18} />
          </div>
          <input
            type="password"
            value={huggingfaceToken}
            onChange={e => setHuggingfaceToken(e.target.value)}
            className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-3xl pl-12 pr-6 py-4 text-sm font-black text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 transition-all outline-none"
            placeholder="Hugging Face API Access Token (hf_...)"
          />
        </div>

        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-blue-600 transition-colors">
            <Sparkles size={18} />
          </div>
          <input
            type="text"
            value={huggingfaceModel}
            onChange={e => setHuggingfaceModel(e.target.value)}
            className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-3xl pl-12 pr-6 py-4 text-sm font-black text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 transition-all outline-none"
            placeholder="Model, e.g. meta-llama/Llama-3.1-8B-Instruct"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleVerifyHuggingFace}
            disabled={isVerifyingHf}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-blue-700 disabled:bg-blue-300 transition-all shadow-md shadow-blue-500/15"
          >
            {isVerifyingHf ? "Handshaking..." : "Verify Connection"}
          </button>
          
          <button
            type="button"
            onClick={loadHfModels}
            disabled={isLoadingModels}
            className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            {isLoadingModels ? "Syncing..." : "Reload Models"}
          </button>
        </div>

        {hfVerificationResult && (
          <div className={`p-4 rounded-2xl border text-xs font-bold leading-relaxed transition-all ${
            hfVerificationResult.success
              ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/30 text-emerald-800 dark:text-emerald-400"
              : "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/30 text-rose-800 dark:text-rose-400"
          }`}>
            <p>{hfVerificationResult.message}</p>
          </div>
        )}

        <div className="space-y-1.5 pt-2">
          <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Popular Inference Models</label>
          {isLoadingModels ? (
            <div className="flex flex-wrap gap-2 animate-pulse">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="h-8 w-28 bg-slate-100 dark:bg-slate-800 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
              {hfModels.map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setHuggingfaceModel(m.id);
                    setHfVerificationResult(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all text-left flex items-center justify-between gap-3 ${
                    huggingfaceModel === m.id
                      ? "bg-blue-600 border-blue-600 text-white shadow-md"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-150 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                  }`}
                >
                  <span className="truncate max-w-[180px] font-mono">{m.id.split("/").pop()}</span>
                  <span className={`text-[8px] font-normal ${huggingfaceModel === m.id ? "text-blue-200" : "text-slate-400"}`}>
                    {(m.downloads > 1000000 ? (m.downloads / 1000000).toFixed(1) + "M" : m.downloads > 1000 ? (m.downloads / 1000).toFixed(0) + "K" : m.downloads)} dn
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="text-[9px] text-slate-400 font-bold px-2 uppercase tracking-tight">
          Connect to Hugging Face serverless API for stable, ultra-low latency cloud execution. Defaults to <span className="text-slate-900 dark:text-white">google/gemma-3-4b-it</span> if left empty.
        </p>
      </div>
    );
  };

  useEffect(() => {
    if (activeTab === 'security' && user) {
      fetchCredentials();
    }
  }, [activeTab, user]);

  const fetchCredentials = async () => {
    setIsLoadingCredentials(true);
    try {
      const creds = await api.auth.webauthn.getCredentials();
      setCredentials(creds);
    } catch (err) {
      console.error("Failed to fetch credentials:", err);
    } finally {
      setIsLoadingCredentials(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    setMessage(null);
    try {
      // Commit voice settings to localStorage first
      localStorage.setItem('doctorian_voice_stack', selectedVoiceStack);
      localStorage.setItem('doctorian_voice_safety_short', String(voiceSafetyShort));
      localStorage.setItem('doctorian_voice_safety_nodiag', String(voiceSafetyNoDiag));
      localStorage.setItem('doctorian_voice_safety_nooutcome', String(voiceSafetyNoOutcome));
      localStorage.setItem('doctorian_voice_safety_encourage', String(voiceSafetyEncourageHelp));
      
      // Save AI Brain selection
      if (aiBrainOption === 'in_browser') {
        localStorage.setItem('doctorian_clinical_engine', 'gemma3-tfjs');
        localStorage.setItem('doctorian_prioritize_local_ai', 'false');
      } else if (aiBrainOption === 'gemma_cloud') {
        localStorage.setItem('doctorian_clinical_engine', 'gemma-cloud');
        localStorage.setItem('doctorian_prioritize_local_ai', 'false');
      } else if (aiBrainOption === 'cloud') {
        localStorage.setItem('doctorian_clinical_engine', 'medlm-medium');
        localStorage.setItem('doctorian_prioritize_local_ai', 'false');
      } else if (aiBrainOption === 'laptop_node') {
        localStorage.setItem('doctorian_clinical_engine', 'llama-clinical');
        localStorage.setItem('doctorian_prioritize_local_ai', 'true');
      } else if (aiBrainOption === 'huggingface') {
        localStorage.setItem('doctorian_clinical_engine', 'huggingface');
        localStorage.setItem('doctorian_prioritize_local_ai', 'false');
      }

      localStorage.setItem('doctorian_local_api_key', localApiKey);
      // Reset the local connection failure counter to allow 3 fresh attempts under the new settings
      localStorage.setItem('doctorian_local_fail_count', '0');

      const updatedUser = await api.auth.updateProfile({ 
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
        enableExternalAI,
        enableDeepHealthInsights,
        ollamaUrl,
        ollamaModel,
        huggingfaceToken,
        huggingfaceModel
      });
      onUpdate(updatedUser);
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (error: any) {
      console.error("Profile update error:", error);
      setMessage({ text: error.message || 'Failed to update profile', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ text: 'Image must be less than 2MB', type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoURL(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (isCameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCameraOpen]);

  const startCamera = async () => {
    setCameraError(null);
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 400 }, height: { ideal: 400 } } 
      });
      streamRef.current = stream;
      // If videoRef is already available, set it
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError("Could not access camera. Please check permissions.");
      // Don't close immediately so user can see error
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Square crop
        const size = Math.min(video.videoWidth, video.videoHeight);
        const startX = (video.videoWidth - size) / 2;
        const startY = (video.videoHeight - size) / 2;
        
        canvas.width = 400;
        canvas.height = 400;
        context.drawImage(video, startX, startY, size, size, 0, 0, 400, 400);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setPhotoURL(dataUrl);
        stopCamera();
      }
    }
  };

  const handleRegisterBiometrics = async () => {
    setIsRegisteringBiometrics(true);
    setMessage(null);
    try {
      const options = await api.auth.webauthn.registerOptions();
      const { startRegistration } = await import('@simplewebauthn/browser');
      
      // The browser will show the biometric prompt
      const attResp = await startRegistration({ optionsJSON: options });
      const verified = await api.auth.webauthn.registerVerify(attResp);
      
      if (verified) {
        setMessage({ text: 'Neural identity pattern synchronized successfully!', type: 'success' });
        fetchCredentials();
      } else {
        throw new Error('Neural verification failed. Pattern mismatch.');
      }
    } catch (error: any) {
      console.error("Biometric registration error:", error);
      if (error.name === 'NotAllowedError') {
        setMessage({ text: 'Registration cancelled by user or timed out.', type: 'error' });
      } else {
        setMessage({ text: error.message || 'Device biometric registration failed', type: 'error' });
      }
    } finally {
      setIsRegisteringBiometrics(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 sm:py-20 min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6"
      >
        <div>
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 font-black text-[10px] uppercase tracking-[0.3em] mb-4 transition-all group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            System Return
          </button>
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-2 uppercase leading-none">
            Clinical <span className="text-blue-600">Profile</span>
          </h1>
          <div className="flex items-center gap-3">
             <div className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
             <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Neural Identity Management Terminal</p>
          </div>
        </div>

        <div className="flex gap-2">
           <div className="hidden sm:flex flex-col items-end px-4 py-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Core Status</span>
              <span className="text-xs font-black text-blue-600 uppercase tracking-tight">{user.subscriptionTier || 'Free'} Sync Active</span>
           </div>
        </div>
      </motion.div>

      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10">
        {/* Sidebar Navigation - Premium Bento Design */}
        <div className="lg:col-span-3 space-y-4">
          <div 
            className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0 gap-2 pb-2 lg:pb-0 sticky top-4 z-20" 
            role="tablist" 
            aria-label="Profile settings sections"
          >
            {[
              { id: 'profile', label: 'Identity', icon: <User size={18} />, color: 'blue' },
              { id: 'medical-id', label: 'Clinical ID', icon: <QrCode size={18} />, color: 'blue' },
              { id: 'emergency', label: 'SOS Nodes', icon: <ShieldAlert size={18} />, color: 'rose' },
              { id: 'security', label: 'Neural Links', icon: <Lock size={18} />, color: 'indigo' },
              { id: 'billing', label: 'Credit Bank', icon: <CreditCard size={18} />, color: 'emerald' },
              { id: 'notifications', label: 'Channels', icon: <Bell size={18} />, color: 'amber' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setMessage(null);
                }}
                role="tab"
                aria-selected={activeTab === item.id}
                className={`group whitespace-nowrap flex items-center gap-3 px-6 py-4 rounded-[2rem] text-xs font-black uppercase tracking-widest transition-all duration-300 relative overflow-hidden ${
                  activeTab === item.id 
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-2xl shadow-slate-200 dark:shadow-slate-950/50 scale-[1.02]' 
                    : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 hover:scale-[1.05] active:scale-95'
                }`}
              >
                <span className={`transition-transform duration-500 ${activeTab === item.id ? 'scale-110' : 'group-hover:rotate-12'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {activeTab === item.id && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute inset-0 bg-blue-600/10 dark:bg-blue-400/10 pointer-events-none"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-between gap-3 px-6 py-5 rounded-[2rem] bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-rose-600 hover:text-white transition-all shadow-lg shadow-rose-100 dark:shadow-none active:scale-95 group"
            >
              <div className="flex items-center gap-3">
                <LogOut size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                <span>De-Authorize</span>
              </div>
              <span className="opacity-40">EXIT</span>
            </button>
          </div>
        </div>

        {/* content area placeholder */}
        <div 
          className="lg:col-span-9"
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
        >
          {/* Profile Section */}
          {activeTab === 'profile' && (
            <motion.section 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
                
                <div className="flex flex-col md:flex-row items-center gap-10 mb-12 relative z-10">
                  <div className="relative group">
                    <div className="w-40 h-40 rounded-[3rem] bg-gradient-to-br from-blue-600 to-indigo-700 p-1 shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
                      <div className="w-full h-full rounded-[2.8rem] bg-white dark:bg-slate-900 overflow-hidden relative">
                        {photoURL ? (
                          <img src={photoURL} alt={displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-200 dark:text-slate-700">
                            <User size={80} />
                          </div>
                        )}
                        <button 
                          onClick={startCamera}
                          className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm"
                        >
                          <Camera size={32} className="text-white" />
                        </button>
                      </div>
                    </div>
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                       <button 
                         onClick={() => fileInputRef.current?.click()}
                         className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-3 rounded-2xl shadow-xl hover:scale-110 active:scale-90 transition-all border border-slate-100 dark:border-slate-700"
                       >
                         <Plus size={18} />
                       </button>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                  </div>

                  <div className="text-center md:text-left flex-1">
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-1">{displayName || 'Anonymous User'}</h3>
                    <p className="text-sm text-slate-400 dark:text-slate-500 font-bold tracking-tight mb-4">{user.email}</p>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                       <div className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-full border border-blue-100 dark:border-blue-800 flex items-center gap-2">
                          <Crown size={14} className="text-blue-600" />
                          <span className="text-[10px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest">{user.subscriptionTier || 'Free'} Protocol</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">Neural Link Established</span>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                  <div className="space-y-6">
                    <div className="group">
                      <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">Universal Designation (Name)</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-blue-600 transition-colors">
                          <User size={18} />
                        </div>
                        <input
                          type="text"
                          value={displayName}
                          onChange={e => setDisplayName(e.target.value)}
                          className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-3xl pl-12 pr-6 py-4 text-sm font-black text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 transition-all outline-none"
                          placeholder="Clinical Identity..."
                        />
                      </div>
                    </div>

                    <div className="group">
                      <div className="flex items-center justify-between mb-2 ml-1">
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Biological Sync Device (Phone)</label>
                        <span className="flex items-center gap-1 text-[8px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-800">
                          <Activity size={8} className="animate-pulse" />
                          Real-time Monitored Node
                        </span>
                      </div>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-blue-600 transition-colors">
                          <Phone size={18} />
                        </div>
                        <input
                          type="tel"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-3xl pl-12 pr-6 py-4 text-sm font-black text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 transition-all outline-none"
                          placeholder="+256..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="group opacity-60">
                      <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">Primary Neural Node (Email)</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600">
                          <Mail size={18} />
                        </div>
                        <input
                          type="email"
                          value={user.email}
                          disabled
                          className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-3xl pl-12 pr-6 py-4 text-sm font-black text-slate-900 dark:text-white cursor-not-allowed outline-none"
                        />
                      </div>
                      <p className="text-[9px] font-bold text-slate-400 mt-2 px-2 italic uppercase">Immutable Node Identifier</p>
                    </div>

                    <div className="group">
                      <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">Visual Repository (URL)</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-blue-600 transition-colors">
                          <Globe size={18} />
                        </div>
                        <input
                          type="text"
                          value={photoURL}
                          onChange={e => setPhotoURL(e.target.value)}
                          className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-3xl pl-12 pr-6 py-4 text-sm font-black text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 transition-all outline-none"
                          placeholder="https://cloud.doctorian.ai/..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advanced Analytic Controls */}
                <div className="mt-8 pt-8 border-t border-slate-50 dark:border-slate-800 space-y-6 relative z-10">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Advanced Analytics Configuration</h4>
                  
                  <div className="group p-6 bg-slate-50/55 dark:bg-slate-800/20 rounded-[2rem] border border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all hover:bg-white dark:hover:bg-slate-800/40 hover:shadow-xl hover:shadow-emerald-500/5">
                    <div className="flex items-start gap-4">
                      <div className="p-4 bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-sm text-emerald-500 dark:text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                        <Zap size={24} />
                      </div>
                      <div className="max-w-md">
                        <span id="deep-health-insights-toggle-title" className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight block mb-1">Deep Health Insights</span>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-normal mb-1">
                          Predictive Metabolic Modeling & Biomarker Projection.
                        </p>
                        <p className="text-[9px] text-slate-500 leading-normal">
                          Unlock deep neural projection overlays in the Vitality Matrix, enabling 7-day autonomic balance trending, glucose instability projections, and biological age calculations.
                        </p>
                      </div>
                    </div>
                    <button 
                      type="button"
                      id="deep-health-insights-toggle-btn"
                      onClick={() => setEnableDeepHealthInsights(!enableDeepHealthInsights)}
                      className={`w-14 h-8 rounded-full transition-all relative shrink-0 cursor-pointer ${enableDeepHealthInsights ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-slate-200 dark:bg-slate-700'}`}
                    >
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${enableDeepHealthInsights ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                </div>

                <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 border-t border-slate-50 dark:border-slate-800 relative z-10">
                  <AnimatePresence>
                    {message && (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className={`flex items-center gap-3 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm ${
                          message.type === 'success' 
                            ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800' 
                            : 'bg-rose-50 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400 border border-rose-100 dark:border-rose-800'
                        }`}
                      >
                        {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        {message.text}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full sm:w-auto bg-blue-600 text-white px-12 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-4 disabled:opacity-50 active:scale-95 group shrink-0"
                  >
                    {isSaving ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} className="group-hover:rotate-12 transition-transform" />}
                    Commit Identity Changes
                  </button>
                </div>
              </div>

              {/* Bio-Verification Badge */}
              <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
                 <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-blue-600/20 to-transparent" />
                 <div className="flex items-center gap-6 relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                       <ShieldCheck className="text-blue-400 w-8 h-8" />
                    </div>
                    <div>
                       <h4 className="text-lg font-black uppercase tracking-tight">Verified Clinical Node</h4>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End-to-End Encrypted Identity Terminal</p>
                    </div>
                 </div>

                  <button 
                    onClick={() => setActiveTab('security')}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all relative z-10 border border-white/10"
                  >
                    Review Security Protocols
                  </button>
               </div>
            </motion.section>
          )}

          {/* Emergency Section */}
          {activeTab === 'emergency' && (
            <motion.section 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4 mb-10">
                  <div className="bg-rose-50 dark:bg-rose-900/30 p-4 rounded-2xl text-rose-600 dark:text-rose-400 shadow-inner">
                    <ShieldAlert size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Emergency Nodes</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[8px] font-black bg-rose-600 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">MTN NETWORK RELAY: 0787674140</span>
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Automatic triage synchronization protocols</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2 px-1">
                       <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                       <h4 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Primary Clinical Specialist</h4>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="group">
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Specialist Name</label>
                        <input
                          type="text"
                          value={doctorName}
                          onChange={e => setDoctorName(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-[1.5rem] px-6 py-4 text-sm font-black text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-rose-500/50 transition-all shadow-inner"
                          placeholder="Dr. Smith..."
                        />
                      </div>
                      <div className="group">
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Direct Dial (Phone)</label>
                        <input
                          type="tel"
                          value={doctorPhone}
                          onChange={e => setDoctorPhone(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-[1.5rem] px-6 py-4 text-sm font-black text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-rose-500/50 transition-all shadow-inner"
                          placeholder="+256..."
                        />
                      </div>
                      <div className="group">
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Neural Mail (Email)</label>
                        <input
                          type="email"
                          value={doctorEmail}
                          onChange={e => setDoctorEmail(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-[1.5rem] px-6 py-4 text-sm font-black text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-rose-500/50 transition-all shadow-inner"
                          placeholder="specialist@doctorian.ai"
                        />
                      </div>
                      <div className="group">
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Specialist ID (App Link)</label>
                        <input
                          type="text"
                          value={doctorId}
                          onChange={e => setDoctorId(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-[1.5rem] px-6 py-4 text-sm font-black text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-rose-500/50 transition-all shadow-inner"
                          placeholder="Terminal identifier..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2 px-1">
                       <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                       <h4 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Health Mentor / Guard</h4>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="group">
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Mentor Name</label>
                        <input
                          type="text"
                          value={mentorName}
                          onChange={e => setMentorName(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-[1.5rem] px-6 py-4 text-sm font-black text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500/50 transition-all shadow-inner"
                          placeholder="Mentor Joe..."
                        />
                      </div>
                      <div className="group">
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Direct Dial (Phone)</label>
                        <input
                          type="tel"
                          value={mentorPhone}
                          onChange={e => setMentorPhone(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-[1.5rem] px-6 py-4 text-sm font-black text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500/50 transition-all shadow-inner"
                          placeholder="+256..."
                        />
                      </div>
                      <div className="group">
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Neural Mail (Email)</label>
                        <input
                          type="email"
                          value={mentorEmail}
                          onChange={e => setMentorEmail(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-[1.5rem] px-6 py-4 text-sm font-black text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500/50 transition-all shadow-inner"
                          placeholder="mentor@doctorian.ai"
                        />
                      </div>
                      <div className="group">
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Mentor ID (App Link)</label>
                        <input
                          type="text"
                          value={mentorId}
                          onChange={e => setMentorId(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-[1.5rem] px-6 py-4 text-sm font-black text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500/50 transition-all shadow-inner"
                          placeholder="Terminal identifier..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 border-t border-slate-50 dark:border-slate-800 relative z-10">
                  <div className="flex items-center gap-3">
                     <ShieldCheck className="text-emerald-500" size={20} />
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol validation complete</p>
                  </div>
                  
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full sm:w-auto bg-slate-900 dark:bg-rose-600 text-white px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 dark:hover:bg-rose-700 transition-all shadow-2xl flex items-center justify-center gap-4 disabled:opacity-50 active:scale-95 group"
                  >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-700" />}
                    Sync SOS Nodes
                  </button>
                </div>
              </div>
            </motion.section>
          )}

          {/* Security Section */}
          {activeTab === 'security' && (
            <motion.section 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600" />
                
                <div className="flex items-center gap-4 mb-10">
                  <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-2xl text-indigo-600 dark:text-indigo-400 shadow-inner">
                    <Shield size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Neural Locking Protocols</h3>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mt-1">Biometric identity & neural port management</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="group p-8 bg-slate-50/50 dark:bg-slate-800/30 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 relative overflow-hidden transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl hover:shadow-indigo-500/5">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 relative z-10">
                      <div className="flex items-start gap-6">
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] shadow-xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-500">
                          <Fingerprint size={32} />
                        </div>
                        <div className="max-w-md">
                          <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Neural Pattern Enrollment</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                            Synchronize your device's biometric vault (Face ID / Passkeys) with the Doctorian Intelligence Matrix for direct, password-less authentication.
                          </p>
                        </div>
                      </div>
                      
                      <button
                        onClick={handleRegisterBiometrics}
                        disabled={isRegisteringBiometrics}
                        className="bg-indigo-600 text-white px-8 py-5 rounded-3xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-4 disabled:opacity-50 group min-w-[220px]"
                      >
                        {isRegisteringBiometrics ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            <span>SYNCING...</span>
                          </>
                        ) : (
                          <>
                            <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                            <span>Enroll Device</span>
                          </>
                        )}
                      </button>
                    </div>

                    {credentials.length > 0 && (
                      <div className="mt-10 space-y-4 pt-8 border-t border-slate-100 dark:border-slate-800/50 relative z-10">
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] ml-2 mb-4">Active Neural Ports</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {credentials.map((cred, i) => (
                            <div key={i} className="flex items-center justify-between p-5 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm group/cred">
                              <div className="flex items-center gap-4">
                                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl text-emerald-600">
                                  <CheckCircle2 size={18} />
                                </div>
                                <div>
                                  <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Active Port-0{i + 1}</p>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Counter: {cred.counter} • FIDO2</p>
                                </div>
                              </div>
                              <div className="h-2 w-2 rounded-full bg-emerald-500 group-hover:scale-150 transition-transform" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     {[
                       { label: 'Neural Relay', val: 'FIDO2 / WebAuthn', icon: <Cpu size={20} />, color: 'blue' },
                       { label: 'Security Tier', val: 'Level-5 Encrypted', icon: <Shield size={20} />, color: 'indigo' },
                       { label: 'Hardware Lock', val: 'Device Key-Bound', icon: <Fingerprint size={20} />, color: 'purple' },
                     ].map((item, i) => (
                       <div key={i} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                          <div className={`text-slate-400 dark:text-slate-500 mb-4 transition-colors group-hover:text-blue-500`}>
                            {item.icon}
                          </div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{item.label}</p>
                          <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{item.val}</p>
                       </div>
                     ))}
                  </div>
                </div>

                {isIframe && (
                  <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-200/40 dark:border-amber-900/30 rounded-3xl text-xs font-bold text-amber-800 dark:text-amber-400 leading-relaxed flex flex-col sm:flex-row items-start gap-4">
                    <div className="bg-amber-500 text-white p-3 rounded-2xl flex items-center justify-center shadow-md">
                      <AlertCircle size={22} />
                    </div>
                    <div className="space-y-2">
                      <p className="font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 text-xs">Biometric Hardware Sandboxing Notice</p>
                      <p className="text-slate-600 dark:text-slate-400 font-medium">
                        WebAuthn standards prohibit accessing real biometric readers (Touch ID / Face ID / Windows Hello) inside nested iFrame windows.
                      </p>
                      <p className="text-slate-500 dark:text-slate-500 text-[11px] font-semibold">
                        To connect and register your actual phone, tablet, or laptop fingerprint scanner, open this application in a dedicated browser tab using the link below:
                      </p>
                      <div className="pt-2">
                        <a 
                          href={window.location.href} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20"
                        >
                          Open in Dedicated Window <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-12 pt-8 border-t border-slate-50 dark:border-slate-800 flex items-center justify-center">
                  <div className="flex items-center gap-3 px-6 py-2 bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-800">
                    <Lock size={14} className="text-slate-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Biometric vault bound with hardware security</span>
                  </div>
                </div>

                {/* --- AI BRAIN NODE SELECTOR & LOCAL MODEL PRESETS --- */}
                <div className="mt-12 pt-12 border-t border-slate-100 dark:border-slate-800/80 space-y-6">
                  <div>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">AI Brain Node Selector</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                      Configure your active medical intelligence matrix. Run fully offline using a local model on your laptop, or leverage high-performance cloud synapses.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Option 1: In-Browser Local Brain (Gemma 3 TFJS) */}
                    <button
                      type="button"
                      onClick={() => {
                        setAiBrainOption('in_browser');
                        setPrioritizeLocalAI(false);
                      }}
                      className={`p-5 rounded-3xl border-2 text-left transition-all hover:scale-[1.02] flex flex-col justify-between h-48 cursor-pointer ${
                        aiBrainOption === 'in_browser'
                          ? 'bg-white dark:bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/10'
                          : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className={`p-3 rounded-2xl ${aiBrainOption === 'in_browser' ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-450'}`}>
                          <Cpu size={20} />
                        </div>
                        {aiBrainOption === 'in_browser' && (
                          <span className="px-2 py-0.5 bg-indigo-600 text-white rounded-full text-[8px] font-black uppercase tracking-wider">Primary</span>
                        )}
                      </div>
                      <div>
                        <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">In-Browser Local Brain</h5>
                        <p className="text-[9px] text-indigo-600 dark:text-indigo-400 font-bold uppercase mt-1">Google Gemma 3 (TFJS DL)</p>
                        <p className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold mt-1 leading-normal">
                          Loads weights directly in-browser. 100% private execution on your GPU using WebGL/WebGPU.
                        </p>
                      </div>
                    </button>

                    {/* Option 2: Cloud Core */}
                    <button
                      type="button"
                      onClick={() => {
                        setAiBrainOption('cloud');
                        setPrioritizeLocalAI(false);
                      }}
                      className={`p-5 rounded-3xl border-2 text-left transition-all hover:scale-[1.02] flex flex-col justify-between h-48 cursor-pointer ${
                        aiBrainOption === 'cloud'
                          ? 'bg-white dark:bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/10'
                          : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className={`p-3 rounded-2xl ${aiBrainOption === 'cloud' ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-450'}`}>
                          <Globe size={20} />
                        </div>
                        {aiBrainOption === 'cloud' && (
                          <span className="px-2 py-0.5 bg-slate-500 text-white rounded-full text-[8px] font-black uppercase tracking-wider">Failover</span>
                        )}
                      </div>
                      <div>
                        <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Cloud Brain Node</h5>
                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Google Gemini (Active Fallback)</p>
                        <p className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold mt-1 leading-normal">
                          High performance failover cloud synapse. Instant clinical reasoning & web search grounding.
                        </p>
                      </div>
                    </button>

                    {/* Option 3: Laptop Server Node */}
                    <button
                      type="button"
                      onClick={() => {
                        setAiBrainOption('laptop_node');
                        setPrioritizeLocalAI(true);
                      }}
                      className={`p-5 rounded-3xl border-2 text-left transition-all hover:scale-[1.02] flex flex-col justify-between h-48 cursor-pointer ${
                        aiBrainOption === 'laptop_node'
                          ? 'bg-white dark:bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/10'
                          : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className={`p-3 rounded-2xl ${aiBrainOption === 'laptop_node' ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-450'}`}>
                          <Activity size={20} />
                        </div>
                        {aiBrainOption === 'laptop_node' && (
                          <span className="px-2 py-0.5 bg-indigo-600 text-white rounded-full text-[8px] font-black uppercase tracking-wider">Active</span>
                        )}
                      </div>
                      <div>
                        <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Laptop Server Node</h5>
                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Local Ollama / LM Studio</p>
                        <p className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold mt-1 leading-normal">
                          Run customized offline server models (Llama 3.1) on laptop port 11434 / 1234.
                        </p>
                      </div>
                    </button>

                    {/* Option 4: Hugging Face Cloud Brain */}
                    <button
                      type="button"
                      onClick={() => {
                        setAiBrainOption('huggingface');
                        setPrioritizeLocalAI(false);
                      }}
                      className={`p-5 rounded-3xl border-2 text-left transition-all hover:scale-[1.02] flex flex-col justify-between h-48 cursor-pointer ${
                        aiBrainOption === 'huggingface'
                          ? 'bg-white dark:bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/10'
                          : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className={`p-3 rounded-2xl ${aiBrainOption === 'huggingface' ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-450'}`}>
                          <Sparkles size={20} />
                        </div>
                        {aiBrainOption === 'huggingface' && (
                          <span className="px-2 py-0.5 bg-blue-600 text-white rounded-full text-[8px] font-black uppercase tracking-wider">Stable HF</span>
                        )}
                      </div>
                      <div>
                        <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Hugging Face Cloud</h5>
                        <p className="text-[9px] text-blue-600 dark:text-blue-400 font-bold uppercase mt-1">Realistic Open Models</p>
                        <p className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold mt-1 leading-normal">
                          Fast, serverless execution of Llama 3.1 & Mistral via secure API keys.
                        </p>
                      </div>
                    </button>

                    {/* Option 5: Google Gemma 3 Cloud Brain */}
                    <button
                      type="button"
                      onClick={() => {
                        setAiBrainOption('gemma_cloud');
                        setPrioritizeLocalAI(false);
                      }}
                      className={`p-5 rounded-3xl border-2 text-left transition-all hover:scale-[1.02] flex flex-col justify-between h-48 cursor-pointer ${
                        aiBrainOption === 'gemma_cloud'
                          ? 'bg-white dark:bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/10'
                          : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className={`p-3 rounded-2xl ${aiBrainOption === 'gemma_cloud' ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-450'}`}>
                          <Sparkles size={20} className="text-blue-500" />
                        </div>
                        {aiBrainOption === 'gemma_cloud' && (
                          <span className="px-2 py-0.5 bg-indigo-600 text-white rounded-full text-[8px] font-black uppercase tracking-wider">Gemma 3</span>
                        )}
                      </div>
                      <div>
                        <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Google Gemma 3 Cloud</h5>
                        <p className="text-[9px] text-blue-600 dark:text-blue-400 font-bold uppercase mt-1">Gemma 3 4B Core</p>
                        <p className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold mt-1 leading-normal">
                          Official cloud deployment of Google Gemma 3 with absolute high-performance medical analysis.
                        </p>
                      </div>
                    </button>
                  </div>

                  {/* Local Customizer Settings rendered dynamically when Local is chosen */}
                  {aiBrainOption === 'laptop_node' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-100 dark:border-slate-800/80 space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3">
                        <div className="flex items-center gap-2">
                          <Settings size={14} className="text-indigo-600" />
                          <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wider">Configure Local Model Settings</span>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-full text-[8px] font-black uppercase">Direct Laptop Sync</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Laptop AI Address (URL)</label>
                          <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-indigo-600 transition-colors">
                              <Activity size={16} />
                            </div>
                            <input
                              type="text"
                              value={ollamaUrl}
                              onChange={e => setOllamaUrl(e.target.value)}
                              className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl pl-12 pr-6 py-3.5 text-xs font-black text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600 transition-all outline-none"
                              placeholder="e.g. http://localhost:11434"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Active Model Name</label>
                          <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-indigo-600 transition-colors">
                              <Cpu size={16} />
                            </div>
                            <input
                              type="text"
                              value={ollamaModel}
                              onChange={e => setOllamaModel(e.target.value)}
                              className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl pl-12 pr-6 py-3.5 text-xs font-black text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600 transition-all outline-none"
                              placeholder="e.g. llama3.1, gemma2, phi3"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Quick Select Model Presets</label>
                        <div className="flex flex-wrap gap-2">
                          {['gemma2', 'llama3.1', 'mistral', 'phi3'].map(preset => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setOllamaModel(preset)}
                              className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all ${
                                ollamaModel === preset
                                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                                  : 'bg-slate-50 dark:bg-slate-800 border-slate-150 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                              }`}
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-4 p-4 bg-indigo-50/40 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100/50 dark:border-indigo-800/40">
                        <AlertCircle size={14} className="text-indigo-600 shrink-0" />
                        <p className="text-[9.5px] font-bold text-slate-500 dark:text-slate-400 uppercase leading-relaxed m-0">
                          Note: Local connections connect directly from your browser. 
                          For Ollama, you must run it with CORS enabled: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-600">OLLAMA_ORIGINS="*"</code>.
                          For LM Studio, ensure "CORS Support" is toggled ON.
                        </p>
                      </div>

                      <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100/40 dark:border-emerald-800/30 flex items-center justify-between gap-3">
                        <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase">Test if local node is reachable:</span>
                        <button
                          onClick={async () => {
                            try {
                              const activeNode = await detectActiveLocalNode(ollamaUrl);
                              const isLMStudioCheck = activeNode.isOpenAI;
                              const checkPath = isLMStudioCheck 
                                ? (activeNode.url.includes('/v1') ? `${activeNode.url}/models` : `${activeNode.url.replace(/\/$/, '')}/v1/models`)
                                : `${activeNode.url.replace(/\/$/, '')}/api/tags`;
                              
                              const res = await fetch(checkPath).catch(() => null);
                              if (res && res.ok) {
                                setMessage({ 
                                  text: `Neural pulse confirmed! Successfully reached ${isLMStudioCheck ? 'LM Studio' : 'Ollama'} at ${activeNode.url}.`, 
                                  type: 'success' 
                                });
                              } else {
                                throw new Error('Connection failed');
                              }
                            } catch {
                              setMessage({ text: 'Neural pulse failed. Ensure local server (Ollama on port 11434 or LM Studio on port 1234) is running and CORS is enabled.', type: 'error' });
                            }
                          }}
                          type="button"
                          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-sm"
                        >
                          Pulse Link Check
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="group p-8 mt-8 bg-slate-50/50 dark:bg-slate-800/30 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 relative overflow-hidden transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl hover:shadow-violet-500/5">
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 relative z-10">
                    <div className="flex items-start gap-6">
                      <div className="bg-white dark:bg-slate-900 p-5 rounded-[2.5rem] shadow-xl text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform duration-500">
                        <Zap size={32} />
                      </div>
                      <div className="max-w-md">
                        <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">External Neural Links</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed mb-4">
                          Enable higher-tier reasoning by connecting to specialized external matrices. This automatically utilizes <span className="text-violet-600 font-black">Meta Llama 3.1 8B</span> and <span className="text-blue-600 font-black">DeepSeek R1</span> for complex medical synthesis.
                        </p>
                        <div className="flex flex-wrap gap-2">
                           <span className="px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded-full text-[8px] font-black uppercase tracking-widest">Llama 3.1 8B</span>
                           <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-[8px] font-black uppercase tracking-widest">Gemma</span>
                           <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-[8px] font-black uppercase tracking-widest">Active Reasoning</span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setEnableExternalAI(!enableExternalAI)}
                      className={`w-20 h-10 rounded-full transition-all relative shrink-0 ${enableExternalAI ? 'bg-violet-600 shadow-lg shadow-violet-500/30' : 'bg-slate-200 dark:bg-slate-700'}`}
                    >
                      <div className={`absolute top-1.5 w-7 h-7 bg-white rounded-full transition-all shadow-md ${enableExternalAI ? 'left-11' : 'left-2'}`} />
                    </button>
                  </div>

                  <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-4 ml-1">
                      <Cpu size={14} className="text-blue-500 animate-pulse" />
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hugging Face Cloud Neural Link (Stable API)</h4>
                    </div>
                    
                    {renderHuggingFaceSection()}

                    <div className="flex items-center gap-2 mb-4 ml-1">
                      <Globe size={14} className="text-violet-500" />
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Doctorian Cloud Neural Synapse Pipeline</h4>
                    </div>

                    <div className="space-y-4">
                      {/* Premium Managed Synapse Status Dashboard */}
                      <div className="p-6 bg-gradient-to-br from-violet-500/10 via-blue-500/5 to-transparent rounded-3xl border border-violet-500/25 dark:border-violet-500/15 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                          <Cpu size={80} className="text-violet-500 animate-pulse" />
                        </div>
                        
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block"></span>
                            Active Synapse Online
                          </span>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">
                            Active License: <span className="text-blue-600 dark:text-blue-400">{(user?.subscriptionTier || "Free").toUpperCase()}</span>
                          </span>
                        </div>

                        <h5 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">
                          {['enterprise', 'gold', 'business'].includes(user?.subscriptionTier || "")
                            ? "Google MedLM Large & Deep Reasoning Core"
                            : ['pro', 'silver'].includes(user?.subscriptionTier || "")
                            ? "Google MedLM Medium & Clinical Pro Core"
                            : "Meta LLaMA 3.1 & Doctorian Local Core"
                          }
                        </h5>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide leading-relaxed mb-4">
                          Hosted model is configured directly in the codes. Performance, diagnostic speeds, and neural layers automatically scale with your active subscription layer & payment credentials.
                        </p>

                        {/* Dynamic Progress Matrices based on Tier */}
                        <div className="space-y-2 border-t border-slate-100 dark:border-slate-800/85 pt-4">
                          <div>
                            <div className="flex justify-between text-[8.5px] font-black text-slate-400 uppercase tracking-widest mb-1">
                              <span>Diagnostic Reasoning Depth</span>
                              <span className="text-slate-900 dark:text-white">
                                {['enterprise', 'gold', 'business'].includes(user?.subscriptionTier || "") ? "100% (Ultimate)" : ['pro', 'silver'].includes(user?.subscriptionTier || "") ? "75% (Catalyst)" : "35% (Base)"}
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-violet-600 rounded-full transition-all duration-1000"
                                style={{ width: ['enterprise', 'gold', 'business'].includes(user?.subscriptionTier || "") ? '100%' : ['pro', 'silver'].includes(user?.subscriptionTier || "") ? '75%' : '35%' }}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[8.5px] font-black text-slate-400 uppercase tracking-widest mb-1">
                              <span>Complex Medical Grounding (MoH / ICD-11)</span>
                              <span className="text-slate-900 dark:text-white">
                                {['enterprise', 'gold', 'business'].includes(user?.subscriptionTier || "") ? "98% (Multi-System)" : ['pro', 'silver'].includes(user?.subscriptionTier || "") ? "90% (Guideline-Linked)" : "45% (Symptom-Matched)"}
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                                style={{ width: ['enterprise', 'gold', 'business'].includes(user?.subscriptionTier || "") ? '98%' : ['pro', 'silver'].includes(user?.subscriptionTier || "") ? '90%' : '45%' }}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[8.5px] font-black text-slate-400 uppercase tracking-widest mb-1">
                              <span>Context Bandwidth Capacity</span>
                              <span className="text-slate-900 dark:text-white">
                                {['enterprise', 'gold', 'business'].includes(user?.subscriptionTier || "") ? "128K Token Layer" : ['pro', 'silver'].includes(user?.subscriptionTier || "") ? "32K Token Layer" : "8K Token Layer"}
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                                style={{ width: ['enterprise', 'gold', 'business'].includes(user?.subscriptionTier || "") ? '100%' : ['pro', 'silver'].includes(user?.subscriptionTier || "") ? '65%' : '20%' }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-violet-600/20 to-transparent" />
                   <div className="flex items-center gap-4 mb-4">
                      <Activity size={20} className="text-violet-400" />
                      <h4 className="text-sm font-black uppercase tracking-widest">Neural Link Guidelines</h4>
                   </div>
                   <ul className="space-y-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <li className="flex items-start gap-3">
                         <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-0.5 shrink-0" />
                         <span>External links consume slightly more neural credits per request</span>
                      </li>
                      <li className="flex items-start gap-3">
                         <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-0.5 shrink-0" />
                         <span>Higher-tier models provide enhanced diagnostic logic and planning</span>
                      </li>
                      <li className="flex items-start gap-3">
                         <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-0.5 shrink-0" />
                         <span>Recommended for complex multi-symptom analysis</span>
                      </li>
                   </ul>
                </div>

                {/* AI Voice Synthesis Stack Engine Configuration */}
                <div className="p-8 bg-slate-50/50 dark:bg-slate-800/30 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 space-y-8">
                  <div>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">AI Voice Synthesis Stack</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                      Select and optimize the backend telecommunication and speech synthesis pathways for specific regional deployments, budgets, or privacy requirements.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { id: 'cheapest', label: 'Cheapest Base', desc: 'Twilio + basic TTS', info: 'Low-cost cloud speech core with premium global routing.', color: 'from-blue-600 to-indigo-600' },
                      { id: 'human', label: 'Most Human Voice', desc: 'ElevenLabs Integration', info: 'Ultra-low latency human-realistic cloned emotions.', color: 'from-violet-600 to-purple-600' },
                      { id: 'offline', label: 'Offline Native', desc: 'Coqui TTS Server', info: 'Run lightweight deep synthesis model inside local host.', color: 'from-emerald-600 to-teal-600' },
                      { id: 'african', label: 'African Deployment', desc: "Africa's Talking + Twilio", info: 'Localized cellular handshake optimized for East African nodes.', color: 'from-amber-600 to-orange-600' },
                      { id: 'fully_local', label: 'Fully Local AI', desc: 'Ollama + Whisper + Coqui', info: '完全 100% boundary-contained offline physical loop.', color: 'from-rose-600 to-pink-600' }
                    ].map((stack) => (
                      <button
                        key={stack.id}
                        type="button"
                        onClick={() => setSelectedVoiceStack(stack.id)}
                        className={`text-left p-6 rounded-3xl border-2 transition-all relative overflow-hidden flex flex-col justify-between h-40 ${selectedVoiceStack === stack.id ? 'border-violet-600 bg-white dark:bg-slate-900 shadow-xl' : 'border-slate-150 dark:border-slate-800/60 bg-slate-100/30 dark:bg-slate-900/10 hover:border-slate-300 dark:hover:border-slate-705'}`}
                      >
                        {selectedVoiceStack === stack.id && (
                          <div className={`absolute top-0 right-0 w-12 h-12 bg-linear-to-bl ${stack.color} text-white rounded-bl-3xl flex items-center justify-center`}>
                            <CheckCircle2 size={16} />
                          </div>
                        )}
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Goal: {stack.label}</span>
                          <h5 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mt-1">{stack.desc}</h5>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-normal mt-2">
                          {stack.info}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Clinical Voice Safeties & Guardrails */}
                <div className="p-8 bg-slate-50/50 dark:bg-slate-800/30 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 space-y-6">
                  <div>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">AI Clinical Guardrails</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                      Strictly enforce medical voice and transcript policies to reduce physical liability and preserve absolute safety guidelines.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { 
                        id: 'short', 
                        state: voiceSafetyShort, 
                        setter: setVoiceSafetyShort, 
                        label: 'Stay Short & Ultra-Brief', 
                        desc: 'Instructs the neural live voice model to strictly phrase answers under 25 words to avoid complex wordiness and optimize synthesis rate.' 
                      },
                      { 
                        id: 'nodiag', 
                        state: voiceSafetyNoDiag, 
                        setter: setVoiceSafetyNoDiag, 
                        label: 'Avoid AI Diagnoses', 
                        desc: 'Blocks the voice intelligence core from labeling patterns or naming diseases. Redirects reasoning toward physiological observations.' 
                      },
                      { 
                        id: 'nooutcome', 
                        state: voiceSafetyNoOutcome, 
                        setter: setVoiceSafetyNoOutcome, 
                        label: 'Avoid Outcome Guarantees', 
                        desc: 'Prohibits promising recovery rates or guaranteeing survival metrics. Directs focus towards real-time homeostatic stability index calculations.' 
                      },
                      { 
                        id: 'encourage', 
                        state: voiceSafetyEncourageHelp, 
                        setter: setVoiceSafetyEncourageHelp, 
                        label: 'Encourage Professional Medical Help', 
                        desc: 'Directs the system to conclude advice statements with clear professional directives such as: "Medical attention is recommended." or similar instructions.' 
                      }
                    ].map((safeguard) => (
                      <div 
                        key={safeguard.id}
                        className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/60 flex items-start justify-between gap-6"
                      >
                        <div className="space-y-1">
                          <h5 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{safeguard.label}</h5>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{safeguard.desc}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => safeguard.setter(!safeguard.state)}
                          className={`w-14 h-7 rounded-full shrink-0 relative transition-all inline-block ${safeguard.state ? 'bg-violet-600 shadow-md shadow-violet-500/20' : 'bg-slate-200 dark:bg-slate-700'}`}
                        >
                          <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-sm ${safeguard.state ? 'left-8' : 'left-1'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                  {/* Hybrid Strategy Architecture Visual Guide */}
                  <div className="bg-slate-50 dark:bg-slate-950 p-6 sm:p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 space-y-6">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">Active AI Brain Routing Architecture</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">The brain executes a clinical cascade. Primary tasks run on zero-cost cloud structures, falling back instantly to localized models when required.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-left">
                      <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
                        <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest block mb-1">Primary Brain • Strat 2</span>
                        <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Cloud Online Core</h5>
                        <p className="text-[9px] text-slate-450 dark:text-slate-500 font-medium mt-1">Google Gemini (via dynamic tokens) and Together AI. Lightning response with full web search capability.</p>
                        <div className="flex items-center gap-1.5 mt-2 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-md text-[8px] font-extrabold text-blue-600 dark:text-blue-400 uppercase w-max">
                          <CheckCircle2 size={9} /> Default Route
                        </div>
                      </div>

                      <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-violet-500" />
                        <span className="text-[8px] font-black text-violet-500 uppercase tracking-widest block mb-1">Failover Brain • Strat 1</span>
                        <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Local Ollama Relay</h5>
                        <p className="text-[9px] text-slate-450 dark:text-slate-500 font-medium mt-1">Bound to your personal laptop Ollama endpoint (e.g., Llama 3.1 8B). Zero-credit offline execution.</p>
                        <div className="flex items-center gap-1.5 mt-2 bg-violet-50 dark:bg-violet-900/20 px-2 py-0.5 rounded-md text-[8px] font-extrabold text-violet-600 dark:text-violet-400 uppercase w-max font-mono">
                          Auto-Failover Active
                        </div>
                      </div>

                      <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-400 dark:bg-slate-750" />
                        <span className="text-[8px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest block mb-1">Emergency Brain • Strat 3</span>
                        <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Offline Bio-Synthesis</h5>
                        <p className="text-[9px] text-slate-450 dark:text-slate-500 font-medium mt-1">Client-side clinical dictionary, local rule engine, and cached diagnostic parameters.</p>
                        <div className="flex items-center gap-1.5 mt-2 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md text-[8px] font-extrabold text-slate-500 uppercase w-max">
                          Air-Gapped Sync
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="group p-8 bg-slate-50/50 dark:bg-slate-800/30 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 relative overflow-hidden transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl hover:shadow-violet-500/5">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 relative z-10">
                      <div className="flex items-start gap-6">
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-[2.5rem] shadow-xl text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform duration-500">
                          <Zap size={32} />
                        </div>
                        <div className="max-w-md">
                          <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">External Neural Links</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed mb-4">
                            Enable higher-tier reasoning by connecting to specialized external matrices. This automatically utilizes <span className="text-violet-600 font-black">Meta Llama 3.1 8B</span> and <span className="text-blue-600 font-black">DeepSeek R1</span> for complex medical synthesis.
                          </p>
                          <div className="flex flex-wrap gap-2">
                             <span className="px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded-full text-[8px] font-black uppercase tracking-widest">Llama 3.1 8B</span>
                             <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-[8px] font-black uppercase tracking-widest">Gemma</span>
                             <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-[8px] font-black uppercase tracking-widest">Active Reasoning</span>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setEnableExternalAI(!enableExternalAI)}
                        className={`w-20 h-10 rounded-full transition-all relative ${enableExternalAI ? 'bg-violet-600 shadow-lg shadow-violet-500/30' : 'bg-slate-200 dark:bg-slate-700'}`}
                      >
                        <div className={`absolute top-1.5 w-7 h-7 bg-white rounded-full transition-all shadow-md ${enableExternalAI ? 'left-11' : 'left-2'}`} />
                      </button>
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2 mb-4 ml-1">
                        <Cpu size={14} className="text-blue-500 animate-pulse" />
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hugging Face Cloud Neural Link (Stable API)</h4>
                      </div>
                      
                      {renderHuggingFaceSection()}

                      <div className="flex items-center gap-2 mb-4 ml-1">
                        <Globe size={14} className="text-violet-500" />
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Doctorian Cloud Neural Synapse Pipeline</h4>
                      </div>

                      <div className="space-y-4">
                        {/* Premium Managed Synapse Status Dashboard */}
                        <div className="p-6 bg-gradient-to-br from-violet-500/10 via-blue-500/5 to-transparent rounded-3xl border border-violet-500/25 dark:border-violet-500/15 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Cpu size={80} className="text-violet-500 animate-pulse" />
                          </div>
                          
                          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block"></span>
                              Active Synapse Online
                            </span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">
                              Active License: <span className="text-blue-600 dark:text-blue-400">{(user?.subscriptionTier || "Free").toUpperCase()}</span>
                            </span>
                          </div>

                          <h5 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">
                            {['enterprise', 'gold', 'business'].includes(user?.subscriptionTier || "")
                              ? "Google MedLM Large & Deep Reasoning Core"
                              : ['pro', 'silver'].includes(user?.subscriptionTier || "")
                              ? "Google MedLM Medium & Clinical Pro Core"
                              : "Meta LLaMA 3.1 & Doctorian Local Core"
                            }
                          </h5>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide leading-relaxed mb-4">
                            Hosted model is configured directly in the codes. Performance, diagnostic speeds, and neural layers automatically scale with your active subscription layer & payment credentials.
                          </p>

                          {/* Dynamic Progress Matrices based on Tier */}
                          <div className="space-y-2 border-t border-slate-100 dark:border-slate-800/85 pt-4">
                            <div>
                              <div className="flex justify-between text-[8.5px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                <span>Diagnostic Reasoning Depth</span>
                                <span className="text-slate-900 dark:text-white">
                                  {['enterprise', 'gold', 'business'].includes(user?.subscriptionTier || "") ? "100% (Ultimate)" : ['pro', 'silver'].includes(user?.subscriptionTier || "") ? "75% (Catalyst)" : "35% (Base)"}
                                </span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-violet-600 rounded-full transition-all duration-1000"
                                  style={{ width: ['enterprise', 'gold', 'business'].includes(user?.subscriptionTier || "") ? '100%' : ['pro', 'silver'].includes(user?.subscriptionTier || "") ? '75%' : '35%' }}
                                />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-[8.5px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                <span>Complex Medical Grounding (MoH / ICD-11)</span>
                                <span className="text-slate-900 dark:text-white">
                                  {['enterprise', 'gold', 'business'].includes(user?.subscriptionTier || "") ? "98% (Multi-System)" : ['pro', 'silver'].includes(user?.subscriptionTier || "") ? "90% (Guideline-Linked)" : "45% (Symptom-Matched)"}
                                </span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                                  style={{ width: ['enterprise', 'gold', 'business'].includes(user?.subscriptionTier || "") ? '98%' : ['pro', 'silver'].includes(user?.subscriptionTier || "") ? '90%' : '45%' }}
                                />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-[8.5px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                <span>Context Bandwidth Capacity</span>
                                <span className="text-slate-900 dark:text-white">
                                  {['enterprise', 'gold', 'business'].includes(user?.subscriptionTier || "") ? "128K Token Layer" : ['pro', 'silver'].includes(user?.subscriptionTier || "") ? "32K Token Layer" : "8K Token Layer"}
                                </span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                                  style={{ width: ['enterprise', 'gold', 'business'].includes(user?.subscriptionTier || "") ? '100%' : ['pro', 'silver'].includes(user?.subscriptionTier || "") ? '65%' : '20%' }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Collapsible Advanced Developer Manual Bypass Accordion */}
                        <details className="group border border-slate-100 dark:border-slate-800 rounded-[2rem] p-5 bg-slate-50/50 dark:bg-slate-900/10 [&_summary::-webkit-details-marker]:hidden transition-all">
                          <summary className="flex items-center justify-between gap-2 font-black uppercase text-[9px] text-slate-400 tracking-widest cursor-pointer outline-none select-none">
                            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-300">
                              <Cpu size={12} className="text-violet-500" />
                              Advanced: Manual Developer Overrides (Bypass Local Ollama/LM Studio)
                            </span>
                            <span className="text-xs transition-transform group-open:rotate-180">▼</span>
                          </summary>

                          <div className="space-y-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 pt-4">
                            <p className="text-[9px] text-slate-400 hover:text-slate-500 font-bold uppercase leading-relaxed m-0">
                              For power developers who wish to route diagnostic tokens to custom local models on their PC instead of using the fully premium managed cloud pipeline.
                            </p>

                            {/* Prioritize Local LLM Client Direct Bridge */}
                            <div className="flex items-center justify-between p-4 bg-violet-50/50 dark:bg-violet-900/10 rounded-2xl border border-violet-100/80 dark:border-violet-800/60 my-2">
                              <div>
                                <span className="text-[10px] font-black text-violet-700 dark:text-violet-400 uppercase tracking-wider block mb-0.5">Direct Client-Side Bridge</span>
                                <span className="text-[8.5px] font-bold text-slate-400 dark:text-slate-500 uppercase leading-snug block">
                                  Prioritize your local LM Studio / Ollama. Connects directly from your browser to <code className="text-violet-700 dark:text-violet-400 bg-violet-100/60 dark:bg-violet-900/30 px-1 rounded font-bold">localhost</code> without needing any public ngrok or localtunnel tunnels.
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setPrioritizeLocalAI(!prioritizeLocalAI)}
                                className={`w-14 h-7 rounded-full transition-all relative shrink-0 ${prioritizeLocalAI ? 'bg-violet-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                              >
                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-sm ${prioritizeLocalAI ? 'left-8' : 'left-1'}`} />
                              </button>
                            </div>
                            
                            <div className="relative group">
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-violet-600 transition-colors">
                                <Activity size={18} />
                              </div>
                              <input
                                type="text"
                                value={ollamaUrl}
                                onChange={e => setOllamaUrl(e.target.value)}
                                className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-3xl pl-12 pr-6 py-4 text-sm font-black text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-violet-600 transition-all outline-none"
                                placeholder="http://localhost:11434 or http://localhost:1234"
                              />
                            </div>

                            <div className="relative group">
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-violet-600 transition-colors">
                                <Cpu size={18} />
                              </div>
                              <input
                                type="text"
                                value={ollamaModel}
                                onChange={e => setOllamaModel(e.target.value)}
                                className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-3xl pl-12 pr-6 py-4 text-sm font-black text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-violet-600 transition-all outline-none"
                                placeholder="gemma4 or custom model identifier"
                              />
                            </div>

                            <div className="relative group">
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-violet-600 transition-colors">
                                <Key size={18} />
                              </div>
                              <input
                                type="password"
                                value={localApiKey}
                                onChange={e => setLocalApiKey(e.target.value)}
                                className="w-full bg-slate-50/50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-3xl pl-12 pr-6 py-4 text-sm font-black text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-violet-600 transition-all outline-none"
                                placeholder="Local API Bearer Token (Optional for LM Studio / Ollama auth)"
                              />
                            </div>

                            <p className="text-[10px] text-slate-400 font-bold px-2 uppercase leading-relaxed tracking-tight">
                              Connect to your laptop's local instance directly from your browser! No public tunnel needed. 
                              <br />
                              • <span className="text-slate-900 dark:text-white">Ollama</span> runs on <span className="text-slate-900 dark:text-white">http://localhost:11434</span> (Requires running with <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-blue-600">OLLAMA_ORIGINS="*"</code>).
                              <br />
                              • <span className="text-slate-900 dark:text-white">LM Studio</span> runs on <span className="text-slate-900 dark:text-white">http://localhost:1234/v1</span> (Works automatically).
                            </p>

                            <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
                              <div className="flex items-center justify-between gap-3 mb-2">
                                 <div className="flex items-center gap-3">
                                    <Zap size={14} className="text-blue-600" />
                                    <span className="text-[10px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest">Public Neural Link Helper</span>
                                 </div>
                                 <button
                                   onClick={async () => {
                                     try {
                                       const activeNode = await detectActiveLocalNode(ollamaUrl);
                                        const isLMStudioCheck = activeNode.isOpenAI;
                                        const detectedUrl = activeNode.url;
                                       const checkPath = isLMStudioCheck 
                                         ? (detectedUrl.includes('/v1') ? `${detectedUrl}/models` : `${detectedUrl.replace(/\/$/, '')}/v1/models`)
                                         : `${detectedUrl.replace(/\/$/, '')}/api/tags`;
                                       
                                       const res = await fetch(checkPath).catch(() => null);
                                       if (res && res.ok) {
                                         setMessage({ text: `Neural pulse confirmed! Successfully reached ${isLMStudioCheck ? 'LM Studio' : 'Ollama'} at ${detectedUrl}.`, type: 'success' });
                                       } else {
                                         // Fallback try secondary endpoint check
                                         const secondaryPath = isLMStudioCheck ? `${detectedUrl.replace(/\/$/, '')}/api/tags` : `${detectedUrl.replace(/\/$/, '')}/v1/models`;
                                         const resSec = await fetch(secondaryPath).catch(() => null);
                                         if (resSec && resSec.ok) {
                                            setMessage({ text: 'Neural pulse confirmed! Local server is reachable.', type: 'success' });
                                         } else {
                                            throw new Error('Neural port closed.');
                                         }
                                       }
                                     } catch {
                                       setMessage({ text: 'Neural pulse failed. Ensure local tunnel is active or CORS is enabled.', type: 'error' });
                                     }
                                   }}
                                   type="button"
                                   className="px-3 py-1 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 rounded-lg text-[8px] font-black uppercase text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                 >
                                   Check Connection
                                 </button>
                              </div>
                              <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase leading-relaxed mb-4">
                                Since this app runs in the cloud, it cannot directly "see" your laptop's localhost url unless you open a public tunnel.
                                Use <span className="text-blue-600">ngrok</span> or <span className="text-blue-600">localtunnel</span> to get a public link.
                              </p>
                              <div className="bg-slate-900 rounded-xl p-3 font-mono text-[8px] text-blue-300 overflow-x-auto no-scrollbar">
                                # 1. Allow Cross-Origin Requests (CORS)<br/>
                                # For Ollama: export OLLAMA_ORIGINS="*"<br/>
                                # For LM Studio: Turn on the CORS toggle in LM Studio Server Settings<br/>
                                # 2. Start a Tunnel (e.g. for LM Studio port 1234)<br/>
                                npx localtunnel --port 1234
                              </div>
                              <p className="text-[8px] font-medium text-slate-400 mt-2 italic">
                                * Paste the resulting "https://..." link into the Local Neural Link URL field above.
                              </p>
                            </div>
                          </div>
                        </details>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-violet-600/20 to-transparent" />
                     <div className="flex items-center gap-4 mb-4">
                        <Activity size={20} className="text-violet-400" />
                        <h4 className="text-sm font-black uppercase tracking-widest">Neural Link Guidelines</h4>
                     </div>
                     <ul className="space-y-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <li className="flex items-start gap-3">
                           <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-0.5 shrink-0" />
                           <span>External links consume slightly more neural credits per request</span>
                        </li>
                        <li className="flex items-start gap-3">
                           <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-0.5 shrink-0" />
                           <span>Higher-tier models provide enhanced diagnostic logic and planning</span>
                        </li>
                        <li className="flex items-start gap-3">
                           <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-0.5 shrink-0" />
                           <span>Recommended for complex multi-symptom analysis</span>
                        </li>
                     </ul>
                  </div>

                  {/* AI Voice Synthesis Stack Engine Configuration */}
                  <div className="p-8 bg-slate-50/50 dark:bg-slate-800/30 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 space-y-8">
                    <div>
                      <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">AI Voice Synthesis Stack</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                        Select and optimize the backend telecommunication and speech synthesis pathways for specific regional deployments, budgets, or privacy requirements.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { id: 'cheapest', label: 'Cheapest Base', desc: 'Twilio + basic TTS', info: 'Low-cost cloud speech core with premium global routing.', color: 'from-blue-600 to-indigo-600' },
                        { id: 'human', label: 'Most Human Voice', desc: 'ElevenLabs Integration', info: 'Ultra-low latency human-realistic cloned emotions.', color: 'from-violet-600 to-purple-600' },
                        { id: 'offline', label: 'Offline Native', desc: 'Coqui TTS Server', info: 'Run lightweight deep synthesis model inside local host.', color: 'from-emerald-600 to-teal-600' },
                        { id: 'african', label: 'African Deployment', desc: "Africa's Talking + Twilio", info: 'Localized cellular handshake optimized for East African nodes.', color: 'from-amber-600 to-orange-600' },
                        { id: 'fully_local', label: 'Fully Local AI', desc: 'Ollama + Whisper + Coqui', info: '完全 100% boundary-contained offline physical loop.', color: 'from-rose-600 to-pink-600' }
                      ].map((stack) => (
                        <button
                          key={stack.id}
                          type="button"
                          onClick={() => setSelectedVoiceStack(stack.id)}
                          className={`text-left p-6 rounded-3xl border-2 transition-all relative overflow-hidden flex flex-col justify-between h-40 ${selectedVoiceStack === stack.id ? 'border-violet-600 bg-white dark:bg-slate-900 shadow-xl' : 'border-slate-150 dark:border-slate-800/60 bg-slate-100/30 dark:bg-slate-900/10 hover:border-slate-300 dark:hover:border-slate-705'}`}
                        >
                          {selectedVoiceStack === stack.id && (
                            <div className={`absolute top-0 right-0 w-12 h-12 bg-linear-to-bl ${stack.color} text-white rounded-bl-3xl flex items-center justify-center`}>
                              <CheckCircle2 size={16} />
                            </div>
                          )}
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Goal: {stack.label}</span>
                            <h5 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mt-1">{stack.desc}</h5>
                          </div>
                          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-normal mt-2">
                            {stack.info}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* AI Clinical Voice Safeties & Guardrails */}
                  <div className="p-8 bg-slate-50/50 dark:bg-slate-800/30 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 space-y-6">
                    <div>
                      <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">AI Clinical Guardrails</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                        Strictly enforce medical voice and transcript policies to reduce physical liability and preserve absolute safety guidelines.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {[
                        { 
                          id: 'short', 
                          state: voiceSafetyShort, 
                          setter: setVoiceSafetyShort, 
                          label: 'Stay Short & Ultra-Brief', 
                          desc: 'Instructs the neural live voice model to strictly phrase answers under 25 words to avoid complex wordiness and optimize synthesis rate.' 
                        },
                        { 
                          id: 'nodiag', 
                          state: voiceSafetyNoDiag, 
                          setter: setVoiceSafetyNoDiag, 
                          label: 'Avoid AI Diagnoses', 
                          desc: 'Blocks the voice intelligence core from labeling patterns or naming diseases. Redirects reasoning toward physiological observations.' 
                        },
                        { 
                          id: 'nooutcome', 
                          state: voiceSafetyNoOutcome, 
                          setter: setVoiceSafetyNoOutcome, 
                          label: 'Avoid Outcome Guarantees', 
                          desc: 'Prohibits promising recovery rates or guaranteeing survival metrics. Directs focus towards real-time homeostatic stability index calculations.' 
                        },
                        { 
                          id: 'encourage', 
                          state: voiceSafetyEncourageHelp, 
                          setter: setVoiceSafetyEncourageHelp, 
                          label: 'Encourage Professional Medical Help', 
                          desc: 'Directs the system to conclude advice statements with clear professional directives such as: "Medical attention is recommended." or similar instructions.' 
                        }
                      ].map((safeguard) => (
                        <div 
                          key={safeguard.id}
                          className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/60 flex items-start justify-between gap-6"
                        >
                          <div className="space-y-1">
                            <h5 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{safeguard.label}</h5>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{safeguard.desc}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => safeguard.setter(!safeguard.state)}
                            className={`w-14 h-7 rounded-full shrink-0 relative transition-all inline-block ${safeguard.state ? 'bg-violet-600 shadow-md shadow-violet-500/20' : 'bg-slate-200 dark:bg-slate-700'}`}
                          >
                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-sm ${safeguard.state ? 'left-8' : 'left-1'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 border-t border-slate-50 dark:border-slate-800 relative z-10">
                   <div className="flex items-center gap-3">
                      <ShieldCheck className="text-violet-500" size={20} />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural Link Authorized</p>
                   </div>
                  
                   <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full sm:w-auto bg-violet-600 text-white px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-violet-700 transition-all shadow-2xl flex items-center justify-center gap-4 disabled:opacity-50 active:scale-95 group"
                  >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-700" />}
                    Sync Neural Matrix
                  </button>
                </div>
              </div>

              {/* Sectored Data Release Request Matrix Card */}
              <div className="mt-8 bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500" />
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-2xl text-emerald-600 dark:text-emerald-400 shadow-inner">
                    <Database size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Sectored Data Release Request Matrix</h3>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mt-1">Submit database extraction requests to secure clinical sector data</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1 space-y-6">
                    <div className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Select Sector Data Target</label>
                      <select
                        value={requestDataType}
                        onChange={(e) => setRequestDataType(e.target.value)}
                        className="w-full px-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-500/50 dark:text-white focus:outline-none"
                      >
                        <option value="all">Complete Database Extractor (all)</option>
                        <option value="records">Vitals & Physiological Telemetry (records)</option>
                        <option value="medications">Prescriptions & Intake Metrics (meds)</option>
                        <option value="workouts">Physical & Cardio Log History (workouts)</option>
                      </select>
                      
                      <button
                        onClick={handleCreateDataRequest}
                        disabled={isLoadingRequests}
                        className="mt-4 w-full bg-emerald-600 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {isLoadingRequests ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Request Extraction
                      </button>
                    </div>

                    <div className="bg-slate-50/50 dark:bg-slate-800/20 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-3">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <ShieldAlert size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Sectoring Protocol</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                        Under tenant division rules, data extraction files are verified and compiled on-demand by Hospital Admins.
                      </p>
                    </div>
                  </div>

                  <div className="lg:col-span-2 space-y-4">
                    <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Database Request Ledger</h4>
                    
                    {isLoadingRequests ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="animate-spin text-slate-400" size={32} />
                      </div>
                    ) : dataRequests.length === 0 ? (
                      <div className="text-center py-12 bg-slate-50/40 dark:bg-slate-800/10 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-bold">No data release requests filed yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                        {dataRequests.map((req) => (
                          <div key={req.id} className="p-5 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2.5 mb-1.5">
                                <span className="text-[10px] font-black bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md uppercase">
                                  Request #{req.id.substring(0, 8)}
                                </span>
                                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                  req.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                  req.status === 'rejected' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                  'bg-amber-50 text-amber-600 border border-amber-100'
                                }`}>
                                  {req.status}
                                </span>
                              </div>
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight">
                                Extractor Category: {req.dataType}
                              </p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-1">
                                Filed: {new Date(req.createdAt).toLocaleString()}
                              </p>
                              {req.adminNotes && (
                                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-bold mt-2 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                  <span className="text-[9px] font-black text-slate-400 uppercase block mb-0.5">Admin Response:</span>
                                  {req.adminNotes}
                                </p>
                              )}
                            </div>

                            {req.status === 'approved' && req.releasedData && (
                              <button
                                onClick={() => setViewingRequestData(req)}
                                className="self-start sm:self-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md flex items-center gap-2"
                              >
                                <Lock size={12} /> Decrypt Archive
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {viewingRequestData && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
                    >
                      <motion.div
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.95 }}
                        className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden shadow-2xl relative"
                      >
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                          <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Released Sector Data</h3>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Secure Database Extract for Request #{viewingRequestData.id.substring(0, 8)}</p>
                          </div>
                          <button
                            onClick={() => setViewingRequestData(null)}
                            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                          >
                            <X size={20} />
                          </button>
                        </div>

                        <div className="p-6 flex-1 overflow-y-auto font-mono text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/50 select-text leading-relaxed">
                          <pre className="whitespace-pre-wrap">{viewingRequestData.releasedData}</pre>
                        </div>

                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
                          <button
                            onClick={() => {
                              const blob = new Blob([viewingRequestData.releasedData], { type: 'application/json' });
                              const url = URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.download = `SectoredData-${viewingRequestData.id}.json`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              URL.revokeObjectURL(url);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg"
                          >
                            <Download size={14} /> Download JSON file
                          </button>
                          <button
                            onClick={() => setViewingRequestData(null)}
                            className="px-6 py-3.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-[10px] font-black uppercase tracking-widest"
                          >
                            Close
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.section>
          )}
           {/* Notifications Section */}
          {activeTab === 'notifications' && (
            <motion.section 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4 mb-10">
                  <div className="bg-amber-50 dark:bg-amber-900/30 p-4 rounded-2xl text-amber-600 dark:text-amber-400 shadow-inner">
                    <Bell size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Transmission Channels</h3>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mt-1">Configure neural alert throughput</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { id: 'email', label: 'Neural Mail Alerts', desc: 'Clinical health reports via SMTP relay', icon: <Mail size={18} /> },
                    { id: 'sms', label: 'Cellular SOS Burst', desc: 'Urgent mobile triage notifications', icon: <Phone size={18} /> },
                    { id: 'push', label: 'Direct Browser Sync', desc: 'Real-time protocol updates', icon: <Zap size={18} /> },
                    { id: 'marketing', label: 'Evolutionary News', desc: 'Updates from Doctorian Intelligence', icon: <Globe size={18} /> }
                  ].map(item => (
                    <div key={item.id} className="group p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center justify-between transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl">
                      <div className="flex items-center gap-4">
                         <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm text-slate-400 group-hover:text-amber-500 transition-colors">
                            {item.icon}
                         </div>
                         <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{item.label}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{item.desc}</p>
                         </div>
                      </div>
                      <button 
                        onClick={() => setNotifications(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof prev] }))}
                        className={`w-14 h-8 rounded-full transition-all relative ${notifications[item.id as keyof typeof notifications] ? 'bg-amber-500 shadow-lg shadow-amber-500/20' : 'bg-slate-200 dark:bg-slate-700'}`}
                      >
                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${notifications[item.id as keyof typeof notifications] ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>
          )}

          {/* Medical ID Section */}
          {activeTab === 'medical-id' && (() => {
            const buildSelfContainedProfile = () => {
              if (!user) return null;
              
              // Completely strip photoURL or other long web links to prevent high QR density and remove any AI studio links
              return {
                id: user.id || 'unknown',
                nm: user.displayName || 'Unknown Patient',
                em: user.email || '',
                ph: user.phone || '',
                bt: user.bloodGroup || 'Not Set',
                al: user.allergies || 'None Recorded',
                cd: user.conditions || 'None Declared',
                dp: user.doctorPhone || '',
                mp: user.mentorPhone || ''
              };
            };

            const selfContainedProfile = buildSelfContainedProfile();
            const qrPayload = selfContainedProfile ? JSON.stringify(selfContainedProfile) : '';

            return (
              <motion.section 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-10"
              >
                <div className="bg-white dark:bg-slate-900 rounded-[4rem] p-12 sm:p-20 border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden text-center">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-emerald-500" />
                  
                  <div className="mx-auto max-w-xs bg-white rounded-[2.5rem] p-6 flex flex-col items-center justify-center mb-6 border border-slate-200 shadow-xl group transition-all duration-300 hover:shadow-2xl">
                     <QRCodeSVG 
                        value={qrPayload} 
                        size={256}
                        className="text-slate-900 group-hover:scale-[1.02] transition-transform duration-300" 
                        level="Q"
                        includeMargin={true}
                     />
                  </div>
                  <div className="text-[10px] font-black font-mono text-slate-400 uppercase tracking-[0.2em] opacity-80 mb-10">
                     UID: {user?.id || 'SYNCING...'}
                  </div>

                  <div className="max-w-md mx-auto mb-8 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 text-left">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-2">Embedded Secure Clinical Payload (No Web Links)</p>
                    <div className="bg-slate-100 dark:bg-slate-950 p-3 rounded-xl max-h-24 overflow-y-auto text-[10px] font-mono text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800">
                      {qrPayload}
                    </div>
                  </div>

                  <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-[-0.05em] mb-4 text-slate-900 dark:text-white leading-none">
                    Clinical <span className="text-blue-600 font-serif italic normal-case">Off-Grid</span> QR ID
                  </h2>
                  <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-bold max-w-lg mx-auto mb-12 font-serif leading-relaxed italic">
                    "This clinical identifier has no web links or remote dependencies. Scanning decrypts your complete blood group, medical conditions, surgical history, and emergency contacts directly off-grid."
                  </p>
                  
                  <div className="flex flex-wrap justify-center gap-4">
                     <button 
                       onClick={() => {
                         navigator.clipboard.writeText(qrPayload);
                         setMessage({ text: '📋 Offline Clinical JSON Payload copied to clipboard!', type: 'success' });
                       }}
                       className="flex items-center gap-3 px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all group"
                     >
                       <Download size={18} className="group-hover:translate-y-1 transition-transform" />
                       Copy Raw Payload
                     </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                   {[
                     { label: 'Metabolic Type', val: user?.bloodGroup || 'O Pos (Rh+)', icon: <Fingerprint size={24} />, color: 'rose' },
                     { label: 'Neural Inhibitors', val: user?.allergies || 'Penicillin, Latex', icon: <Shield size={24} />, color: 'amber' },
                     { label: 'Active Catalysts', val: user?.conditions || 'Lisinopril, Omega-3', icon: <Pill size={24} />, color: 'emerald' },
                     { label: 'Clinical Node', val: 'Alpha-9 Triage', icon: <Activity size={24} />, color: 'blue' }
                   ].map((card, i) => (
                     <div key={i} className="bg-white dark:bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-lg hover:shadow-2xl transition-all group">
                        <div className="text-blue-600 mb-6 group-hover:scale-110 transition-transform duration-500">{card.icon}</div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{card.label}</p>
                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">{card.val}</p>
                     </div>
                   ))}
                </div>
              </motion.section>
            );
          })()}

          {/* Billing Section */}
          {activeTab === 'billing' && (
            <motion.section 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-10"
            >
              <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                
                <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-5">
                    <div className="bg-emerald-50 dark:bg-emerald-900/30 p-5 rounded-3xl text-emerald-600 dark:text-emerald-400 shadow-inner">
                      <CreditCard size={32} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Financial Matrix</h3>
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mt-1">Neural consultation credit bank</p>
                    </div>
                  </div>
                  {billingHistory.length > 0 && (
                    <button 
                      onClick={handleDownloadFullHistory}
                      className="hidden sm:flex items-center gap-3 px-6 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.05] active:scale-95 transition-all group"
                    >
                      <ExternalLink size={18} className="group-hover:translate-x-1 transition-transform" />
                      Export Ledger
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                  <div className="p-10 bg-slate-950 rounded-[3rem] text-white relative overflow-hidden group shadow-2xl">
                    <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:rotate-12 transition-transform duration-1000 group-hover:opacity-20">
                      <Zap size={120} />
                    </div>
                    <div className="relative z-10">
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-4 px-1">Available Neurals</span>
                      <div className="flex items-baseline gap-4">
                        <h4 className="text-7xl font-black tracking-[-0.08em] leading-none">
                          {['pro', 'enterprise', 'business', 'gold', 'silver'].includes(user.subscriptionTier) || String(user.credits || "").toLowerCase().includes("unlimited") ? '∞' : Math.round(Number(user.credits) || 400)}
                        </h4>
                        <span className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Credits</span>
                      </div>
                      <button 
                        onClick={() => setShowUpgrade(true)}
                        className="mt-10 flex items-center gap-3 px-6 py-3 bg-blue-600/10 text-blue-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all border border-blue-500/20"
                      >
                        Refill Protocol Neurals <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="p-10 bg-slate-50/50 dark:bg-slate-900/50 rounded-[3rem] border border-slate-100 dark:border-slate-800 flex flex-col justify-between shadow-inner">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4 px-1">Sync Protocol Tier</span>
                      <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-4">
                         <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
                            {['pro', 'silver'].includes(user.subscriptionTier) ? <Zap className="text-blue-500" size={24} /> : ['enterprise', 'business', 'gold'].includes(user.subscriptionTier) ? <Crown className="text-amber-500" size={24} /> : <Activity className="text-slate-400" size={24} />}
                         </div>
                         {(user.subscriptionTier === 'pro' ? 'Catalyst Pro' : user.subscriptionTier === 'enterprise' ? 'Quantum Elite' : user.subscriptionTier || 'Standard Individual').toUpperCase()}
                      </h4>
                      <div className="mt-6 flex items-center gap-3">
                         <div className={`h-2 w-2 rounded-full ${user.subscriptionStatus === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                         <p className={`text-[10px] font-black uppercase tracking-widest ${user.subscriptionStatus === 'active' ? 'text-emerald-600' : 'text-rose-500'}`}>
                           Network Status: {user.subscriptionStatus?.toUpperCase() || 'OFFLINE'}
                         </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowUpgrade(true)}
                      className="w-full mt-10 py-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] rounded-[1.5rem] hover:bg-slate-950 hover:text-white transition-all shadow-sm active:scale-95"
                    >
                      Adjust Protocol Rank
                    </button>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center justify-between px-4">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Clinical Ledger</h4>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">Logs index: {billingPagination.total}</span>
                  </div>
                  
                  {isLoadingHistory ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-slate-50/30 dark:bg-slate-800/20 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-700">
                      <Loader2 className="animate-spin mb-6 text-blue-600" size={48} />
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Decrypting secure ledger...</p>
                    </div>
                  ) : billingHistory.length === 0 ? (
                    <div className="text-center py-24 bg-slate-50 dark:bg-slate-800/30 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-700">
                      <CreditCard className="mx-auto text-slate-200 dark:text-slate-800 mb-6 opacity-40 shrink-0" size={80} />
                      <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em]">Zero neural footprints detected</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {billingHistory.map((payment) => (
                        <div key={payment.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-8 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] hover:border-blue-600/50 hover:shadow-2xl hover:shadow-blue-500/5 transition-all group relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-1 h-full bg-blue-600/0 group-hover:bg-blue-600 transition-all" />
                          <div className="flex items-center gap-6 mb-4 sm:mb-0">
                            <div className={`p-4 rounded-3xl ${payment.status === 'completed' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600'} shadow-sm`}>
                              <FileText size={24} />
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{payment.tier?.toUpperCase() || 'NEURAL BURST PACK'}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] mt-1 opacity-70">
                                {new Date(payment.createdAt).toLocaleDateString()} • {payment.externalId || 'REF-N-2910'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-12">
                            <div className="text-left sm:text-right">
                              <p className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{payment.amount.toLocaleString()} {payment.currency}</p>
                              <p className={`text-[10px] font-black uppercase tracking-[0.3em] mt-1.5 ${payment.status === 'completed' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {payment.status}
                              </p>
                            </div>
                            <button 
                              onClick={() => handleDownloadInvoice(payment)}
                              className="p-5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-[1.5rem] transition-all bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm grow-0 shrink-0"
                              title="Triage Invoice Statement"
                            >
                              <Download size={24} className="group-hover:-translate-y-1 transition-transform" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {billingPagination.pages > 1 && (
                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-10 mt-10 px-4">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
                         Protocol Block <span className="text-slate-900 dark:text-white">{billingPagination.page}</span> <span className="mx-3 opacity-30">/</span> {billingPagination.pages}
                      </p>
                      <div className="flex gap-4">
                         <button 
                          disabled={billingPagination.page === 1}
                          onClick={() => fetchBillingHistory(billingPagination.page - 1)}
                          className="w-14 h-14 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl disabled:opacity-30 hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-900 transition-all active:scale-95 shadow-xl"
                         >
                           <ChevronLeft size={24} />
                         </button>
                         <button 
                          disabled={billingPagination.page === billingPagination.pages}
                          onClick={() => fetchBillingHistory(billingPagination.page + 1)}
                          className="w-14 h-14 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl disabled:opacity-30 hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-900 transition-all active:scale-95 shadow-xl"
                         >
                           <ChevronRight size={24} />
                         </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.section>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showUpgrade && (
          <UpgradeModal 
            user={user} 
            onClose={() => setShowUpgrade(false)} 
            onUpdate={onUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
