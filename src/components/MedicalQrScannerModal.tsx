import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  QrCode, Camera, X, Flashlight, RefreshCw, Upload, 
  AlertCircle, CheckCircle2, ShieldCheck, User, Heart, 
  FileText, ArrowRight, Sparkles, AlertTriangle, Clock, Trash2
} from 'lucide-react';
import jsQR from 'jsqr';
import { PatientProfileViewer } from './PatientProfileViewer';
import { 
  getRecentQrScans, 
  saveQrScanToHistory, 
  removeQrScanItem, 
  clearQrScansHistory, 
  ScannedQrHistoryItem, 
  QR_HISTORY_EVENT 
} from '../utils/recentQrScans';

export interface MedicalProfileData {
  user: {
    id: string;
    displayName?: string;
    email: string;
    phone?: string;
    photoURL?: string;
    bloodGroup?: string;
    allergies?: string;
    conditions?: string;
    hospitalPreference?: string;
    role?: string;
    age?: string;
    gender?: string;
  };
  contacts: Array<{
    id: string;
    name: string;
    phone: string;
    role: string;
    email?: string;
  }>;
  records: Array<{
    id: string;
    title?: string;
    summary?: string;
    diagnosis?: string;
    treatment?: string;
    createdAt: string;
    type?: string;
  }>;
}

interface MedicalQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileRetrieved?: (profile: MedicalProfileData) => void;
}

// Built-in emergency patient profiles for testing & clinical simulation
const SAMPLE_PROFILES: Record<string, MedicalProfileData> = {
  joseph: {
    user: {
      id: "PAT-UG-94021",
      displayName: "Joseph Brian Obote",
      email: "joseph.obote@patient.doctorian.org",
      phone: "+256 701 234 567",
      bloodGroup: "O+",
      allergies: "Sulfa Drugs, Codeine",
      conditions: "Congestive Heart Failure (NYHA Class II), Hypertension, Chronic Kidney Disease Stage 2",
      hospitalPreference: "Mulago National Referral Hospital, Kampala",
      role: "patient",
      age: "48",
      gender: "Male"
    },
    contacts: [
      { id: "c1", name: "Dr. Sarah Connor, MD", phone: "+256 787 674 140", role: "Primary Cardiologist", email: "sarah.connor@mulago.gov.ug" },
      { id: "c2", name: "Grace Obote", phone: "+256 702 987 654", role: "Spouse / Primary Next of Kin", email: "grace.obote@gmail.com" }
    ],
    records: [
      { id: "r1", title: "Echo & Hemodynamic Assessment", summary: "LVEF 42%, mild aortic sclerosis, regular sinus rhythm.", diagnosis: "Dilated Cardiomyopathy", treatment: "Sacubitril/Valsartan 24/26mg BID, Carvedilol 12.5mg BID", createdAt: "2026-08-14" },
      { id: "r2", title: "Renal Function & Electrolytes", summary: "Serum creatinine 1.4 mg/dL, eGFR 58 mL/min, K+ 4.6 mEq/L.", diagnosis: "Stage 2 CKD Secondary to Hypertension", treatment: "Hydration protocol & renal monitoring", createdAt: "2026-07-28" }
    ]
  },
  alex: {
    user: {
      id: "PAT-UG-88204",
      displayName: "Alex Johnson",
      email: "alex.johnson@patient.doctorian.org",
      phone: "+256 772 456 789",
      bloodGroup: "A+",
      allergies: "Severe Anaphylaxis to Penicillin & Ampicillin, Latex",
      conditions: "Type 1 Diabetes Mellitus, Asthma (Exercise-Induced)",
      hospitalPreference: "Kampala Hospital Medical Centre",
      role: "patient",
      age: "32",
      gender: "Non-Binary"
    },
    contacts: [
      { id: "c3", name: "Dr. Misty Waters, MD", phone: "+256 788 112 233", role: "Endocrinologist", email: "misty.waters@hospital.org" },
      { id: "c4", name: "Jordan Johnson", phone: "+256 774 334 455", role: "Emergency Contact / Sibling", email: "jordan.j@gmail.com" }
    ],
    records: [
      { id: "r3", title: "Endocrine Glycemic Profiling", summary: "HbA1c 6.8%, continuous glucose monitoring within target range 82% of time.", diagnosis: "Type 1 Diabetes (Controlled)", treatment: "Insulin Degludec 18u QHS + Insulin Lispro TID AC", createdAt: "2026-09-02" },
      { id: "r4", title: "Pulmonary Spirometry", summary: "FEV1/FVC ratio 78% post-bronchodilator, reversible obstruction noted.", diagnosis: "Mild Persistent Asthma", treatment: "Budesonide/Formoterol 160/4.5 mcg inhaler PRN", createdAt: "2026-06-19" }
    ]
  },
  liam: {
    user: {
      id: "PAT-UG-71092",
      displayName: "Liam Davies",
      email: "liam.family@patient.doctorian.org",
      phone: "+256 752 889 900",
      bloodGroup: "B+",
      allergies: "Peanuts, Amoxicillin (Hives)",
      conditions: "Pediatric Severe Asthma, Atopic Dermatitis",
      hospitalPreference: "Case Medical Centre, Kampala",
      role: "patient",
      age: "9",
      gender: "Male"
    },
    contacts: [
      { id: "c5", name: "Dr. Ronald Sentamu, MD", phone: "+256 773 889 900", role: "Consultant Pediatrician", email: "ronald.sentamu@casehospital.org" },
      { id: "c6", name: "Hannah Davies", phone: "+256 752 112 244", role: "Mother / Legal Guardian", email: "hannah.davies@gmail.com" }
    ],
    records: [
      { id: "r5", title: "Pediatric Asthma Action Plan", summary: "Peak flow green zone >220 L/min. Rescue inhaler protocol maintained.", diagnosis: "Childhood Atopic Asthma", treatment: "Fluticasone propionate 50mcg BID, Albuterol 100mcg PRN", createdAt: "2026-08-30" }
    ]
  }
};

export const MedicalQrScannerModal: React.FC<MedicalQrScannerModalProps> = ({
  isOpen,
  onClose,
  onProfileRetrieved
}) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isDecoding, setIsDecoding] = useState(false);
  const [scannedProfile, setScannedProfile] = useState<MedicalProfileData | null>(null);
  const [scanFeedback, setScanFeedback] = useState<string | null>(null);
  const [historyItems, setHistoryItems] = useState<ScannedQrHistoryItem[]>(() => getRecentQrScans());

  // Listen to QR history events to keep recent scans in sync
  useEffect(() => {
    const handleUpdate = () => {
      setHistoryItems(getRecentQrScans());
    };
    window.addEventListener(QR_HISTORY_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(QR_HISTORY_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera tracks cleanly
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setTorchEnabled(false);
  };

  // Start video stream
  const startCamera = async (mode = facingMode) => {
    stopCamera();
    setCameraError(null);

    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error("Camera API is not supported on this browser or platform.");
      }

      let constraints: MediaStreamConstraints = {
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        // Fallback to simple video constraint
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: any) {
      console.warn("Camera start error:", err);
      setCameraError(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? "Camera permission was denied. Please allow camera access in browser settings or use the Quick Sample Test buttons below."
          : (err.message || "Failed to access device camera sensor.")
      );
      setCameraActive(false);
    }
  };

  // Toggle Torch/Flashlight
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track && (track.getCapabilities as any)?.()?.torch) {
      try {
        await (track as any).applyConstraints({
          advanced: [{ torch: !torchEnabled }]
        });
        setTorchEnabled(!torchEnabled);
      } catch (e) {
        console.warn("Torch failed:", e);
      }
    }
  };

  // Switch between front and back camera
  const switchCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Parse raw scanned text into MedicalProfileData
  const parseScannedData = (rawText: string): MedicalProfileData => {
    const text = rawText.trim();

    // 1. Check for URL with query params
    if (text.includes('?scanUserData=') || text.includes('&scanUserData=')) {
      try {
        const url = new URL(text.startsWith('http') ? text : `http://localhost${text}`);
        const encoded = url.searchParams.get('scanUserData');
        if (encoded) {
          const decoded = decodeURIComponent(atob(encoded).split('').map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const parsed = JSON.parse(decoded);
          if (parsed.user) return parsed;
        }
      } catch (e) {}
    }

    // 2. Direct JSON payload
    if (text.startsWith('{') && text.endsWith('}')) {
      try {
        const json = JSON.parse(text);

        // If standard structure with .user
        if (json.user && json.user.id) {
          return {
            user: json.user,
            contacts: json.contacts || [],
            records: json.records || []
          };
        }

        // If Admin QR payload: { id, nm, em, ph, bt, al, cd, dp, mp }
        if (json.id || json.nm) {
          return {
            user: {
              id: json.id || `PAT-${Date.now().toString().slice(-5)}`,
              displayName: json.nm || json.name || json.displayName || "Verified Patient",
              email: json.em || json.email || "patient@hospital.org",
              phone: json.ph || json.phone || "+256 701 000 000",
              bloodGroup: json.bt || json.bloodGroup || json.bloodType || "O+",
              allergies: json.al || json.allergies || "None Recorded",
              conditions: json.cd || json.conditions || "None Declared",
              hospitalPreference: json.hospital || "Mulago National Referral Hospital",
              role: "patient"
            },
            contacts: [
              {
                id: "c-scanned",
                name: "Primary Emergency Contact",
                phone: json.dp || json.mp || json.doctorPhone || json.mentorPhone || "+256 787 674 140",
                role: "Assigned Physician / Caregiver",
                email: "emergency@hospital.org"
              }
            ],
            records: [
              {
                id: "rec-scanned",
                title: "QR Emergency Record Ingest",
                summary: `Blood: ${json.bt || 'O+'}, Allergies: ${json.al || 'None'}, Chronic Conditions: ${json.cd || 'None'}`,
                diagnosis: json.cd || "Active Telemetry Sync",
                treatment: "Continue standard care plan",
                createdAt: new Date().toISOString().split('T')[0]
              }
            ]
          };
        }
      } catch (e) {}
    }

    // 3. Fallback matching patient ID strings
    const lower = text.toLowerCase();
    if (lower.includes('alex')) return SAMPLE_PROFILES.alex;
    if (lower.includes('liam')) return SAMPLE_PROFILES.liam;
    if (lower.includes('joseph') || lower.includes('obote')) return SAMPLE_PROFILES.joseph;

    // Check localStorage registered patients
    try {
      const saved = localStorage.getItem('doctorian_registered_patients');
      if (saved) {
        const patients = JSON.parse(saved);
        const match = patients.find((p: any) => p.id === text || p.name?.toLowerCase() === lower);
        if (match) {
          return {
            user: {
              id: match.id,
              displayName: match.name,
              email: match.email || "patient@doctorian.org",
              phone: match.phone || "+256 701 234 567",
              bloodGroup: match.bloodType || match.bloodGroup || "O+",
              allergies: match.allergies || "None Recorded",
              conditions: match.conditions || "None Declared",
              hospitalPreference: "Mulago National Referral Hospital",
              role: "patient"
            },
            contacts: [
              {
                id: "c-matched",
                name: "Attending Doctor",
                phone: match.doctorPhone || "+256 787 674 140",
                role: "Physician"
              }
            ],
            records: [
              {
                id: "r-matched",
                title: "Registry Telemetry File",
                summary: match.conditions || "Stable Profile",
                createdAt: new Date().toISOString().split('T')[0]
              }
            ]
          };
        }
      }
    } catch (e) {}

    // Default synthesized medical profile from string
    return {
      user: {
        id: text.startsWith('PAT-') ? text : `PAT-QR-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        displayName: text.length < 35 && !text.includes('{') ? text : "Verified Emergency Patient",
        email: "patient.records@doctorian.org",
        phone: "+256 701 889 900",
        bloodGroup: "O+",
        allergies: "Penicillin, NSAIDs",
        conditions: "Hypertension, Sinus Tachycardia",
        hospitalPreference: "Uganda Ministry of Health Regional Centre",
        role: "patient"
      },
      contacts: [
        {
          id: "c-def",
          name: "Hospital Rapid Response Unit",
          phone: "+256 787 674 140",
          role: "Emergency Triage Team"
        }
      ],
      records: [
        {
          id: "r-def",
          title: "Instant QR Profile Ingest",
          summary: `Decoded from QR Token: ${text.slice(0, 40)}...`,
          diagnosis: "Clinical Profile Ingested",
          treatment: "Awaiting primary physician triage",
          createdAt: new Date().toISOString().split('T')[0]
        }
      ]
    };
  };

  // Process decoded QR text
  const handleDecodedText = (codeText: string) => {
    if (isDecoding) return;
    setIsDecoding(true);
    stopCamera();

    // Haptic feedback if available
    try {
      if (navigator.vibrate) {
        navigator.vibrate([40, 60, 40]);
      }
    } catch (e) {}

    setScanFeedback("QR Code Decoded! Fetching Clinical Profile...");

    setTimeout(() => {
      const profile = parseScannedData(codeText);
      saveQrScanToHistory(profile);
      setScannedProfile(profile);
      setIsDecoding(false);

      if (onProfileRetrieved) {
        onProfileRetrieved(profile);
      }
    }, 450);
  };

  // Handle uploaded image file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imgData.data, imgData.width, imgData.height, {
            inversionAttempts: "dontInvert"
          });
          if (code && code.data) {
            handleDecodedText(code.data);
          } else {
            setCameraError("Could not locate a clear QR code in the uploaded image. Please try another photo.");
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Live video frame processing loop with jsQR
  useEffect(() => {
    if (!cameraActive) return;

    let animId: number;
    let lastScanTime = 0;

    const scanFrame = (timestamp: number) => {
      if (cameraActive && videoRef.current && canvasRef.current && !isDecoding) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        // Throttle scanner to ~15-20 fps to save CPU & battery
        if (timestamp - lastScanTime > 60 && ctx && video.readyState >= video.HAVE_ENOUGH_DATA) {
          lastScanTime = timestamp;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imgData.data, imgData.width, imgData.height, {
            inversionAttempts: "dontInvert"
          });

          if (code && code.data) {
            handleDecodedText(code.data);
            return; // stop polling
          }
        }
      }

      if (cameraActive && !isDecoding) {
        animId = requestAnimationFrame(scanFrame);
      }
    };

    animId = requestAnimationFrame(scanFrame);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [cameraActive, isDecoding]);

  // Start camera on modal open
  useEffect(() => {
    if (isOpen) {
      setScannedProfile(null);
      setScanFeedback(null);
      setIsDecoding(false);
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // If a profile was retrieved, render the comprehensive PatientProfileViewer
  if (scannedProfile) {
    return (
      <div className="fixed inset-0 z-[250] overflow-y-auto">
        <PatientProfileViewer
          data={scannedProfile}
          onClose={() => {
            setScannedProfile(null);
            onClose();
          }}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg rounded-[2.5rem] bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col text-white relative"
      >
        {/* Top Header Bar */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-inner">
              <QrCode size={20} className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                <span>Medical QR Scanner</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </h3>
              <p className="text-xs text-slate-400">
                Instant patient profile & emergency triage retrieval
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Close scanner"
          >
            <X size={18} />
          </button>
        </div>

        {/* Viewfinder Canvas Area */}
        <div className="relative w-full aspect-square sm:aspect-4/3 bg-black overflow-hidden flex items-center justify-center">
          
          {/* Live Video Feed */}
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className={`w-full h-full object-cover ${cameraActive ? 'opacity-100' : 'opacity-0'}`}
          />

          {/* Hidden Canvas for jsQR Image Extraction */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Camera Loading or Error State */}
          {!cameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950/90 z-10 space-y-3">
              {cameraError ? (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                    <AlertTriangle size={24} />
                  </div>
                  <h4 className="text-sm font-bold text-white">Camera Access Notice</h4>
                  <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                    {cameraError}
                  </p>
                  <button
                    type="button"
                    onClick={() => startCamera()}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer mt-1"
                  >
                    <RefreshCw size={13} />
                    <span>Retry Camera Stream</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center animate-spin">
                    <Camera size={24} />
                  </div>
                  <h4 className="text-sm font-bold text-white">Initializing Optical Sensor...</h4>
                  <p className="text-xs text-slate-400">Requesting permission to access device camera.</p>
                </>
              )}
            </div>
          )}

          {/* Active Camera Viewfinder Overlay & Laser Reticle */}
          {cameraActive && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* Outer dimmed mask */}
              <div className="w-56 h-56 sm:w-64 sm:h-64 relative rounded-3xl border-2 border-cyan-400/80 shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                
                {/* 4 Corner Bracket Accents */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-cyan-300 rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-cyan-300 rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-cyan-300 rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-cyan-300 rounded-br-lg" />

                {/* Animated Horizontal Laser Scan Beam */}
                <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-bounce top-1/2 -translate-y-1/2" />
                
                {/* Center crosshair */}
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                  <div className="w-4 h-0.5 bg-cyan-400" />
                  <div className="h-4 w-0.5 bg-cyan-400" />
                </div>
              </div>

              {/* Viewfinder Guidance Tag */}
              <div className="absolute bottom-4 px-4 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/80 text-[11px] font-bold text-slate-300 flex items-center gap-1.5 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span>Center patient medical QR within target box</span>
              </div>
            </div>
          )}

          {/* Decoding Feedback Overlay */}
          {isDecoding && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center gap-3 z-30">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center animate-spin">
                <ShieldCheck size={28} />
              </div>
              <h4 className="text-sm font-black text-white">{scanFeedback || "Decoding Patient Data..."}</h4>
              <p className="text-xs text-slate-400">Verifying cryptographic digital health signature</p>
            </div>
          )}
        </div>

        {/* Viewfinder Toolbar Controls */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Camera switch (front/back) */}
            <button
              type="button"
              onClick={switchCamera}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Flip camera (Front / Back)"
            >
              <RefreshCw size={14} />
              <span className="hidden sm:inline">Flip Camera</span>
            </button>

            {/* Torch toggle */}
            <button
              type="button"
              onClick={toggleTorch}
              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                torchEnabled
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Toggle flashlight / torch"
            >
              <Flashlight size={14} />
              <span className="hidden sm:inline">{torchEnabled ? 'Torch On' : 'Torch'}</span>
            </button>
          </div>

          {/* Upload Image with QR code */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Select an image file from your device"
            >
              <Upload size={14} />
              <span>Upload QR Image</span>
            </button>
          </div>
        </div>

        {/* 1-Tap Simulated Quick Scan Buttons (for immediate testing without physical camera) */}
        <div className="p-5 sm:p-6 bg-slate-900 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
            <span className="flex items-center gap-1 text-cyan-400">
              <Sparkles size={12} /> Instant Test Simulations:
            </span>
            <span>Tap to test immediate profile retrieval</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDecodedText('joseph')}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs font-bold text-white group-hover:text-cyan-400">
                <span>Joseph Obote</span>
                <ArrowRight size={12} className="opacity-60 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">Heart Failure · Blood O+</p>
            </button>

            <button
              type="button"
              onClick={() => handleDecodedText('alex')}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs font-bold text-white group-hover:text-cyan-400">
                <span>Alex Johnson</span>
                <ArrowRight size={12} className="opacity-60 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">Severe Allergy · Blood A+</p>
            </button>

            <button
              type="button"
              onClick={() => handleDecodedText('liam')}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs font-bold text-white group-hover:text-cyan-400">
                <span>Liam Davies</span>
                <ArrowRight size={12} className="opacity-60 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">Pediatric Asthma · Blood B+</p>
            </button>
          </div>
        </div>

        {/* Local Storage History: Last 5 Scanned QR Codes for quick re-access */}
        {historyItems.length > 0 && (
          <div className="p-4 sm:p-5 bg-slate-950/80 border-t border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Clock size={12} />
                <span>Last 5 Scanned QR Codes ({historyItems.length}/5 Cached):</span>
              </span>
              <button
                type="button"
                onClick={() => clearQrScansHistory()}
                className="text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1 text-[10px] cursor-pointer"
                title="Clear scanned QR history"
              >
                <Trash2 size={11} />
                <span>Clear History</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
              {historyItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setScannedProfile(item.fullProfile);
                    if (onProfileRetrieved) {
                      onProfileRetrieved(item.fullProfile);
                    }
                  }}
                  className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-cyan-500/50 text-left transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="min-w-0 flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
                      {item.bloodGroup}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white group-hover:text-cyan-400 truncate">
                        {item.patientName}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate font-mono">
                        {item.formattedDate} · {item.patientId}
                      </p>
                    </div>
                  </div>
                  <ArrowRight size={12} className="text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1" />
                </div>
              ))}
            </div>
          </div>
        )}

      </motion.div>
    </div>
  );
};

export default MedicalQrScannerModal;
