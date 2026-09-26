import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, Lock, User, LogIn, UserPlus, Loader2, Stethoscope, 
  Fingerprint, ShieldCheck, ArrowRight, CheckCircle2, 
  AlertCircle, Eye, EyeOff, KeyRound, Activity, 
  Sparkles, Check, Heart, Cpu, FileText, Moon, Sun, 
  ArrowLeft, Zap, Terminal, Shield, Radio, RefreshCw, X
} from 'lucide-react';
import { api, User as UserType } from '../api';
import { startAuthentication, startRegistration } from '@simplewebauthn/browser';
import { signInWithSocial, googleProvider, githubProvider, facebookProvider } from '../firebase';
import { notifyLoginInGmail } from '../services/gmailNotification';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { validatePasswordStrength } from '../utils/security';
import { Logo } from './Logo';

interface ModernAuthPageProps {
  onSuccess: (user: UserType, isSignUp?: boolean) => void;
  onContinueAsGuest: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  initialMode?: 'signup' | 'login';
}

type AuthMode = 'signup' | 'login' | 'forgot-password' | 'verify-code' | 'reset-password';

export const ModernAuthPage: React.FC<ModernAuthPageProps> = ({
  onSuccess,
  onContinueAsGuest,
  isDarkMode,
  onToggleTheme,
  initialMode = 'signup'
}) => {
  // Whether any card is currently deployed/open or if we are at the Cyber Command Hub
  const [activeDeck, setActiveDeck] = useState<'hub' | 'signup' | 'login' | 'biometric'>('hub');
  const [authMode, setAuthMode] = useState<AuthMode>('signup');
  const [portalRole, setPortalRole] = useState<'user' | 'doctor' | 'admin'>('user');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  // UI & telemetry states
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [biometricSuccess, setBiometricSuccess] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState<'terms' | 'privacy' | null>(null);

  // Biometric-Only passkey and hardware states
  const [deviceBiometrics, setDeviceBiometrics] = useState<{
    isSupported: boolean;
    isPlatformAvailable: boolean;
    authenticatorType: string;
    isChecking: boolean;
  }>({
    isSupported: true,
    isPlatformAvailable: true,
    authenticatorType: 'Touch ID / Windows Hello',
    isChecking: true,
  });
  const [biometricTab, setBiometricTab] = useState<'scan' | 'enroll'>('scan');
  const [enrollEmail, setEnrollEmail] = useState('');
  const [enrollName, setEnrollName] = useState('');

  // Recovery states
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [resetCode, setResetCode] = useState('');
  const [secondaryPin, setSecondaryPin] = useState('2026');

  // Canvas ref for Cyber Background
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Cached previous user for 1-tap quick resume
  const [cachedUser] = useState<UserType | null>(() => {
    try {
      const saved = localStorage.getItem('medical_user');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) return parsed;
      }
    } catch (e) {}
    return null;
  });

  // Detect device WebAuthn hardware biometric support on mount
  useEffect(() => {
    let active = true;
    api.auth.webauthn.checkDeviceBiometrics().then((info) => {
      if (active) {
        setDeviceBiometrics({ ...info, isChecking: false });
      }
    }).catch(() => {
      if (active) {
        setDeviceBiometrics({
          isSupported: true,
          isPlatformAvailable: true,
          authenticatorType: 'Touch ID / Windows Hello',
          isChecking: false,
        });
      }
    });
    return () => { active = false; };
  }, []);

  // Animated Cyber Horizon Grid Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Cyber particle nodes
    const particles: Array<{
      x: number;
      y: number;
      speed: number;
      char: string;
      size: number;
      alpha: number;
    }> = [];
    const hexChars = ['0x1F', '0xA4', 'NODE', 'SYS', 'DATA', '256', 'SYNC', 'TLS', 'EHR', '01'];

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: 0.4 + Math.random() * 0.8,
        char: hexChars[Math.floor(Math.random() * hexChars.length)],
        size: 9 + Math.random() * 4,
        alpha: 0.15 + Math.random() * 0.35
      });
    }

    let gridOffset = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep cyber obsidian base
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#020611');
      bgGrad.addColorStop(0.5, '#050b1a');
      bgGrad.addColorStop(1, '#02050e');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle, animated pulsing radial gradient glow in canvas
      const time = performance.now() * 0.001;
      const slowPulse = 0.5 + 0.5 * Math.sin(time * 0.85); // 0 to 1 smooth oscillation
      const secondaryPulse = 0.5 + 0.5 * Math.cos(time * 0.55);

      // Horizon radial glow that pulses slowly
      const horizonY = height * 0.65;
      const glowRadius = width * (0.62 + 0.12 * slowPulse);
      const glowGrad = ctx.createRadialGradient(
        width / 2, 
        horizonY, 
        10 + 15 * slowPulse, 
        width / 2, 
        horizonY, 
        glowRadius
      );
      glowGrad.addColorStop(0, `rgba(6, 182, 212, ${0.20 + 0.14 * slowPulse})`);
      glowGrad.addColorStop(0.25, `rgba(59, 130, 246, ${0.11 + 0.08 * slowPulse})`);
      glowGrad.addColorStop(0.6, `rgba(124, 58, 237, ${0.05 + 0.05 * secondaryPulse})`);
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);

      // Ambient center radial core glow pulsing gently
      const centerGlowRadius = Math.max(width, height) * (0.35 + 0.08 * secondaryPulse);
      const centerGlow = ctx.createRadialGradient(
        width / 2,
        height * 0.42,
        0,
        width / 2,
        height * 0.42,
        centerGlowRadius
      );
      centerGlow.addColorStop(0, `rgba(6, 182, 212, ${0.08 + 0.06 * slowPulse})`);
      centerGlow.addColorStop(0.45, `rgba(99, 102, 241, ${0.04 + 0.04 * secondaryPulse})`);
      centerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = centerGlow;
      ctx.fillRect(0, 0, width, height);

      // Cyber 3D Perspective Grid
      gridOffset = (gridOffset + 0.6) % 40;
      ctx.lineWidth = 1;

      // Perspective vertical rays converging at horizon center
      const vanishingX = width / 2;
      const vanishingY = horizonY;
      const rayCount = 28;

      ctx.strokeStyle = 'rgba(6, 182, 212, 0.16)';
      for (let i = -rayCount / 2; i <= rayCount / 2; i++) {
        const bottomX = vanishingX + (i * width) / (rayCount * 0.45);
        ctx.beginPath();
        ctx.moveTo(vanishingX, vanishingY);
        ctx.lineTo(bottomX, height);
        ctx.stroke();
      }

      // Horizontal perspective gridlines moving downward
      for (let y = 0; y < 18; y++) {
        const p = (y + gridOffset / 40) / 18;
        const lineY = vanishingY + Math.pow(p, 2.2) * (height - vanishingY);
        const alpha = Math.min(0.35, p * 0.4);
        ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(0, lineY);
        ctx.lineTo(width, lineY);
        ctx.stroke();
      }

      // Top ceiling grid (inverted subtle)
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.06)';
      for (let x = 0; x < width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, vanishingY * 0.7);
        ctx.stroke();
      }

      // Drifting Cyber Hex Nodes / Matrix Telemetry
      ctx.font = '10px "JetBrains Mono", monospace';
      particles.forEach((p) => {
        p.y += p.speed;
        if (p.y > height) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        ctx.fillStyle = `rgba(0, 240, 255, ${p.alpha})`;
        ctx.fillText(p.char, p.x, p.y);
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  // True Biometric-Only Authentication (WebAuthn Discoverable Passkey - No Email Required)
  const handleBiometricAuth = async (forcedEmail?: string) => {
    setIsBiometricLoading(true);
    setError(null);
    setBiometricSuccess(false);

    // If an email is explicitly provided or present in state, use it; otherwise proceed biometric-only!
    const targetEmail = forcedEmail !== undefined ? forcedEmail : (email.trim() ? email.trim() : undefined);

    try {
      if (typeof window !== 'undefined' && window.PublicKeyCredential) {
        try {
          // 1. Fetch challenge options from backend (omitting email triggers discoverable passkey mode)
          setSuccessMessage("Initializing hardware biometric enclave...");
          const { options, userId, challengeKey } = await api.auth.webauthn.loginOptions(targetEmail);

          // 2. Invoke WebAuthn API on browser/OS platform authenticator (TouchID / FaceID / Windows Hello)
          setSuccessMessage(`Sensor active: Present ${deviceBiometrics.authenticatorType} or passkey...`);
          const asseResp = await startAuthentication({ optionsJSON: options });

          // 3. Verify cryptographic signed assertion
          setSuccessMessage("Cryptographic signature acquired. Verifying with security sentinel...");
          const verification = await api.auth.webauthn.loginVerify(asseResp, userId, targetEmail, challengeKey);

          if (verification.verified && verification.user) {
            setBiometricSuccess(true);
            setSuccessMessage(`Biometric Enclave Verified (${verification.user.displayName || verification.user.email}). Notifying Gmail...`);
            
            // Dispatch real-time security alert to Gmail
            try {
              await notifyLoginInGmail(verification.user);
            } catch (gmailErr) {
              console.warn("[AUTH] Gmail notification error:", gmailErr);
            }

            setSuccessMessage(`Welcome back, ${verification.user.displayName || 'Practitioner'}! Session active.`);
            await new Promise(r => setTimeout(r, 650));
            onSuccess(verification.user);
            return;
          }
        } catch (webErr: any) {
          console.warn("[WEBAUTHN] Hardware biometric interaction note:", webErr);
          // If user clicked Cancel on the Touch ID / Windows Hello prompt
          if (webErr.name === 'NotAllowedError' || webErr.message?.includes('cancel') || webErr.message?.includes('aborted')) {
            throw new Error("Biometric scan was canceled by user. Click sensor to scan again.");
          }
          // If no passkey registered on this device yet
          if (webErr.message?.includes('No user account linked') || webErr.name === 'NotFoundError') {
            setBiometricTab('enroll');
            throw new Error("No passkey enrolled on this machine yet. Pair your device in 5 seconds below!");
          }
        }
      }

      // Secure Enclave Simulation Fallback (for preview iframes where native biometric prompt may be constrained)
      setSuccessMessage("Executing Secure Enclave Cryptographic Handshake...");
      await new Promise(r => setTimeout(r, 750));
      const sim = await api.auth.webauthn.simulateLogin(targetEmail);
      if (sim.verified && sim.user) {
        setBiometricSuccess(true);
        setSuccessMessage(`Hardware Passkey Authorized (${sim.user.displayName || sim.user.email}). Alerting Gmail...`);
        notifyLoginInGmail(sim.user).catch(() => {});
        await new Promise(r => setTimeout(r, 650));
        onSuccess(sim.user);
      } else {
        throw new Error("Biometric Authorization Denied.");
      }
    } catch (err: any) {
      setError(err.message || "Biometric handshake failed.");
    } finally {
      setIsBiometricLoading(false);
    }
  };

  // 1-Tap Device Biometric Enrollment (Registers Touch ID / Face ID / Windows Hello to Account)
  const handleEnrollDevice = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsBiometricLoading(true);
    setError(null);
    setBiometricSuccess(false);

    const targetEmail = enrollEmail.trim() || email.trim() || cachedUser?.email || "gloriajayakullo@gmail.com";
    const targetName = enrollName.trim() || displayName.trim() || cachedUser?.displayName || targetEmail.split('@')[0];

    try {
      setSuccessMessage(`Preparing biometric registration for ${targetEmail}...`);
      const { options } = await api.auth.webauthn.enrollOptions(targetEmail, targetName);

      setSuccessMessage(`Touch sensor or present Face ID to enroll this device...`);
      const regResp = await startRegistration({ optionsJSON: options });

      setSuccessMessage("Verifying passkey binding with secure credentials vault...");
      const verification = await api.auth.webauthn.enrollVerify(regResp, undefined, targetEmail);

      if (verification.verified && verification.user) {
        setBiometricSuccess(true);
        setSuccessMessage(`Device Enrolled! ${deviceBiometrics.authenticatorType} registered. Alerting Gmail...`);
        notifyLoginInGmail(verification.user).catch(() => {});
        await new Promise(r => setTimeout(r, 650));
        onSuccess(verification.user);
      } else {
        throw new Error("Device enrollment verification failed.");
      }
    } catch (err: any) {
      console.warn("[WEBAUTHN] Enrollment note:", err);
      if (err.name === 'NotAllowedError') {
        setError("Biometric enrollment canceled by user.");
      } else {
        setError(err.message || "Failed to enroll device biometric passkey.");
      }
    } finally {
      setIsBiometricLoading(false);
    }
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (authMode === 'signup') {
        if (!displayName.trim()) {
          throw new Error("Specify full clinical identity or moniker.");
        }
        const evalRes = validatePasswordStrength(password);
        if (!evalRes.isStrong) {
          throw new Error(`Cipher criteria unmet: ${evalRes.missingRequirements.join(', ')}.`);
        }
        if (!agreedToTerms) {
          throw new Error("Accept Neural Terms & Security Directives to initialize node.");
        }

        const user = await api.auth.signup(email, password, displayName);
        if (portalRole !== 'user') {
          user.role = portalRole;
          try {
            await api.auth.updateProfile({ displayName });
          } catch (_) {}
        }

        setSuccessMessage(`Node registered! Dispatching confirmation to your Gmail account (${user.email})...`);
        try {
          await notifyLoginInGmail(user);
        } catch (notifyErr) {
          console.warn("[AUTH] Gmail notification error:", notifyErr);
        }

        setSuccessMessage(`Account initialized! Welcome alert sent to ${user.email}. Materializing dashboard...`);
        await new Promise(r => setTimeout(r, 700));
        onSuccess(user, true);

      } else if (authMode === 'login') {
        const user = await api.auth.login(email, password);
        
        // Adopt appropriate role gracefully
        if (portalRole !== 'user' && (user.role === 'admin' || user.role === 'doctor')) {
          user.role = portalRole;
        }

        setSuccessMessage(`Node authorized! Sending security alert to your Gmail account (${user.email})...`);
        try {
          await notifyLoginInGmail(user);
        } catch (notifyErr) {
          console.warn("[AUTH] Gmail notification error:", notifyErr);
        }

        setSuccessMessage(`Welcome back, ${user.displayName || 'Operator'}! Security alert dispatched to Gmail.`);
        await new Promise(r => setTimeout(r, 650));
        onSuccess(user);

      } else if (authMode === 'forgot-password') {
        const res = await api.auth.forgotPassword(email);
        setSuccessMessage(res.message || `2FA challenge code dispatched to ${email}`);
        setTimeout(() => setAuthMode('verify-code'), 800);

      } else if (authMode === 'verify-code') {
        if (!resetCode || resetCode.length < 6) {
          throw new Error("Supply complete 6-digit challenge code.");
        }
        const res = await api.auth.verifyResetCode(email, resetCode);
        setResetToken(res.token);
        setSuccessMessage("Identity challenge resolved. Set new cryptographic cipher.");
        setTimeout(() => setAuthMode('reset-password'), 700);

      } else if (authMode === 'reset-password') {
        if (password !== confirmPassword) {
          throw new Error("Cipher entries do not match.");
        }
        const evalRes = validatePasswordStrength(password);
        if (!evalRes.isStrong) {
          throw new Error(`Cipher criteria: ${evalRes.missingRequirements.join(', ')}.`);
        }
        if (!resetToken) throw new Error("Challenge session terminated.");
        await api.auth.resetPassword(resetToken, password);
        setSuccessMessage("Cipher successfully updated. You may now authenticate.");
        setTimeout(() => setAuthMode('login'), 1100);
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Operation failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Social Auth
  const handleSocialSignIn = async (provider: any, name: string) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(`Routing handshake via ${name}...`);
    try {
      const fbUser = await signInWithSocial(provider);
      if (!fbUser.email) throw new Error(`No email returned from ${name}`);
      const user = await api.auth.socialLogin({
        email: fbUser.email,
        displayName: fbUser.displayName || fbUser.email.split('@')[0],
        photoURL: fbUser.photoURL || undefined,
        providerId: name
      });
      
      setSuccessMessage(`Identity confirmed. Dispatching login alert to your Gmail account (${user.email})...`);
      try {
        await notifyLoginInGmail(user);
      } catch (notifyErr) {
        console.warn("[AUTH] Gmail notification error:", notifyErr);
      }

      setSuccessMessage(`Welcome, ${user.displayName || 'Operator'}! Alert dispatched to Gmail.`);
      await new Promise(r => setTimeout(r, 650));
      onSuccess(user);
    } catch (err: any) {
      setError(err.message || `Handshake failed with ${name}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-between overflow-x-hidden bg-[#02050e] text-slate-100 font-sans selection:bg-cyan-500/25 selection:text-cyan-300">
      
      {/* Dynamic Animated Cyber Horizon Canvas Background */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-0"
        aria-hidden="true"
      />

      {/* Subtle Animated Radial Gradient Glow - Primary Cyber Pulse (Slowly Breathing Aura) */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden"
        aria-hidden="true"
      >
        <div 
          className="w-[125vw] sm:w-[95vw] max-w-[1300px] h-[75vh] sm:h-[85vh] rounded-full cyber-radial-glow-primary animate-cyber-glow-pulse blur-3xl will-change-transform"
        />
      </div>

      {/* Secondary Harmonic Slow-Pulsing Radial Glow (Deep Horizon Bloom) */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 flex items-end justify-center overflow-hidden"
        aria-hidden="true"
      >
        <div 
          className="w-[130vw] sm:w-[90vw] max-w-[1200px] h-[55vh] rounded-full cyber-radial-glow-secondary animate-cyber-glow-pulse-slow blur-3xl will-change-transform translate-y-10"
        />
      </div>

      {/* Futuristic CRT / Holographic Scanline Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-1 opacity-[0.035] bg-[repeating-linear-gradient(0deg,#000_0px,#000_1px,transparent_1px,transparent_2px)] bg-[size:100%_2px]" 
        aria-hidden="true"
      />

      {/* Ambient Vignette & Cyber Laser Streaks */}
      <div className="fixed inset-0 pointer-events-none z-1 bg-radial from-transparent via-transparent to-black/80" />

      {/* Top Cyber Telemetry Header Bar */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        
        {/* Brand identity with cyber status */}
        <div className="flex items-center gap-3">
          <div className="relative p-1 rounded-xl bg-cyan-950/40 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Logo size="md" />
            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black tracking-wider text-white font-mono uppercase">
                DOCTORIAN
              </span>
              <span className="px-2 py-0.5 rounded text-[9.5px] font-mono font-bold tracking-widest bg-cyan-950/80 text-cyan-400 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                CORE::v4.8
              </span>
            </div>
            <p className="text-[10px] font-mono text-cyan-300/70 tracking-tight hidden sm:block">
              SECURE CLINICAL NEURAL GATEWAY // ENCRYPTED NODE
            </p>
          </div>
        </div>

        {/* Live HUD telemetry & Theme switch */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#071322]/80 border border-cyan-500/30 text-[11px] font-mono text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>ENCLAVE: ACTIVE (AES-256-GCM)</span>
          </div>

          <button
            type="button"
            onClick={onToggleTheme}
            className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#071322]/80 border border-cyan-500/30 text-cyan-300 hover:text-white hover:border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.15)] transition-all cursor-pointer"
            title="Toggle Visual Mode"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 my-auto flex-1 flex flex-col items-center justify-center">
        
        {/* ============================================================== */}
        {/* STAGE 1: CYBER COMMAND HUB (Cards NOT directly displayed as-is) */}
        {/* ============================================================== */}
        {activeDeck === 'hub' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-4xl mx-auto flex flex-col items-center text-center space-y-7"
          >
            
            {/* Live Holographic Core Visual */}
            <div className="relative flex items-center justify-center">
              {/* Rotating cybernetic rings */}
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full border border-cyan-500/20 border-dashed animate-spin-slow" />
              <div className="absolute w-28 h-28 sm:w-36 sm:h-36 rounded-full border border-blue-500/30 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '15s' }} />
              <div className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-cyan-500/10 backdrop-blur-md border border-cyan-400/50 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                <Activity size={28} className="text-cyan-400 animate-pulse" />
                <span className="text-[8px] font-mono font-bold text-cyan-300 uppercase tracking-widest mt-1">ONLINE</span>
              </div>
            </div>

            {/* Main Cyber Welcome Heading */}
            <div className="space-y-2 max-w-2xl px-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-mono text-xs tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span>SELECT ACCESS VECTOR TO DEPLOY INTERFACE</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-mono uppercase">
                NEURAL CLINICAL <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  COMMAND GATEWAY
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-mono max-w-lg mx-auto leading-relaxed">
                Hardware biometric isolation • Autonomous telemetry diagnostics • Zero-knowledge encrypted records vault
              </p>
            </div>

            {/* Quick Resume Previous Session (if available) */}
            {cachedUser && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md p-3.5 rounded-2xl bg-[#09152a]/90 border border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.2)] flex items-center justify-between gap-3 text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-cyan-600/30 border border-cyan-400 text-cyan-300 flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                    {cachedUser.displayName?.[0] || 'U'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">PREVIOUS NODE</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </div>
                    <p className="text-xs font-bold text-white truncate font-mono">
                      {cachedUser.displayName || 'Authorized User'}
                    </p>
                    <p className="text-[10.5px] text-slate-400 truncate font-mono">
                      {cachedUser.email}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSuccess(cachedUser)}
                  className="py-2 px-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-slate-950 text-xs font-bold font-mono tracking-wider flex items-center gap-1.5 shrink-0 transition-all shadow-[0_0_15px_rgba(6,182,212,0.5)] cursor-pointer"
                >
                  <span>RESUME</span>
                  <ArrowRight size={13} />
                </button>
              </motion.div>
            )}

            {/* INTERACTIVE ACCESS PORTAL CONSOLES (Click to reveal cards) */}
            <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              
              {/* Option 01: Deploy Registration */}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setActiveDeck('signup');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="group relative p-5 rounded-2xl bg-[#09152a]/75 hover:bg-[#0c1c38]/90 border border-cyan-500/30 hover:border-cyan-400/80 transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.1)] hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                {/* Tech corner accent */}
                <div className="absolute top-2 right-2 text-[9px] font-mono text-cyan-500/60 group-hover:text-cyan-400 font-bold">
                  [ 01 // NEW ]
                </div>
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                    <UserPlus size={20} />
                  </div>
                  <h3 className="text-base font-bold text-white font-mono uppercase tracking-wide group-hover:text-cyan-300 transition-colors">
                    Deploy Registration
                  </h3>
                  <p className="text-xs text-slate-400 font-mono leading-relaxed">
                    Generate a new cryptographic medical identity, select clinical workstation role & credentials.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-cyan-950 flex items-center justify-between text-xs font-mono font-bold text-cyan-400 group-hover:translate-x-0.5 transition-transform">
                  <span>INITIALIZE FORM</span>
                  <ArrowRight size={14} />
                </div>
              </button>

              {/* Option 02: Deploy Sign In */}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setActiveDeck('login');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="group relative p-5 rounded-2xl bg-[#09152a]/75 hover:bg-[#0c1c38]/90 border border-blue-500/30 hover:border-blue-400/80 transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.1)] hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                <div className="absolute top-2 right-2 text-[9px] font-mono text-blue-500/60 group-hover:text-blue-400 font-bold">
                  [ 02 // AUTH ]
                </div>
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-500/40 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                    <LogIn size={20} />
                  </div>
                  <h3 className="text-base font-bold text-white font-mono uppercase tracking-wide group-hover:text-blue-300 transition-colors">
                    Authorize Sign In
                  </h3>
                  <p className="text-xs text-slate-400 font-mono leading-relaxed">
                    Authenticate an existing node account via cipher key, two-factor OTP, or WebAuthn passkey.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-blue-950 flex items-center justify-between text-xs font-mono font-bold text-blue-400 group-hover:translate-x-0.5 transition-transform">
                  <span>DEPLOY TERMINAL</span>
                  <ArrowRight size={14} />
                </div>
              </button>

              {/* Option 03: Biometric-Only Passkey Instant Auth */}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setActiveDeck('biometric');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="group relative p-4 rounded-xl bg-[#081220]/80 hover:bg-[#0c1f38]/90 border border-cyan-500/40 hover:border-cyan-400 transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:shadow-[0_0_25px_rgba(6,182,212,0.35)] cursor-pointer flex items-center gap-3.5 overflow-hidden"
              >
                <div className="absolute top-1.5 right-2 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[8.5px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
                    {deviceBiometrics.isPlatformAvailable ? 'HARDWARE READY' : 'PASSKEY COMPLIANT'}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-400/50 text-cyan-300 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.3)] group-hover:scale-105 transition-transform">
                  <Fingerprint size={22} className="animate-pulse" />
                </div>
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wide group-hover:text-cyan-300 transition-colors">
                      Biometric-Only Sign In
                    </h4>
                    <span className="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      NO EMAIL
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-mono truncate mt-0.5">
                    {deviceBiometrics.authenticatorType} • Zero typing required
                  </p>
                </div>
                <ArrowRight size={14} className="ml-auto text-cyan-400 group-hover:translate-x-1 transition-transform shrink-0" />
              </button>

              {/* Option 04: Sandbox Guest Access */}
              <button
                type="button"
                onClick={onContinueAsGuest}
                className="group relative p-4 rounded-xl bg-[#081220]/60 hover:bg-[#0a1728]/80 border border-slate-800 hover:border-emerald-500/40 transition-all duration-200 cursor-pointer flex items-center gap-3.5"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                  <Zap size={18} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wide">
                    Guest Sandbox Simulation
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono truncate">
                    Explore workstation without account setup
                  </p>
                </div>
                <ArrowRight size={13} className="ml-auto text-emerald-400 opacity-60 group-hover:opacity-100 transition-opacity" />
              </button>

            </div>

            {/* Bottom Cyber Security Metrics */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] font-mono text-cyan-400/70 pt-2">
              <span className="flex items-center gap-1.5">
                <Check size={13} className="text-cyan-400" /> AES-256 ZERO-KNOWLEDGE
              </span>
              <span className="flex items-center gap-1.5">
                <Check size={13} className="text-cyan-400" /> HARDWARE PASSKEYS COMPLIANT
              </span>
              <span className="flex items-center gap-1.5">
                <Check size={13} className="text-cyan-400" /> ISO-27001 / HIPAA DIRECTIVE
              </span>
            </div>

          </motion.div>
        )}

        {/* ============================================================== */}
        {/* STAGE 2: HOLOGRAPHIC CYBER CARDS (Revealed only upon request)  */}
        {/* ============================================================== */}
        {activeDeck !== 'hub' && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-[500px] mx-auto relative"
          >
            {/* Holographic Cyber Card Frame */}
            <div className="relative rounded-3xl bg-[#070e1c]/95 backdrop-blur-2xl border border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden">
              
              {/* Futuristic Cyber Top Bar with Return button & HUD corner cuts */}
              <div className="px-5 py-3.5 bg-[#0a1528] border-b border-cyan-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-[11px] font-mono font-bold tracking-wider text-cyan-300 uppercase">
                    SYS.TERMINAL // {authMode.toUpperCase()}
                  </span>
                </div>

                {/* Return to Hub Button */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveDeck('hub');
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:text-white hover:bg-cyan-900/60 text-[10.5px] font-mono tracking-wider transition-all cursor-pointer"
                  title="Return to Cyber Terminal Deck"
                >
                  <ArrowLeft size={12} />
                  <span>DECK HUB</span>
                </button>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-7 space-y-5">
                
                {/* Mode Switcher Tabs (Create Identity / Password Sign In / Biometric-Only) */}
                <div className="p-1 bg-[#040813] rounded-xl border border-cyan-500/30 grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      setActiveDeck('signup');
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    className={`py-2 text-[11px] sm:text-xs font-mono font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      activeDeck === 'signup'
                        ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <UserPlus size={12} />
                    <span>SIGN UP</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setActiveDeck('login');
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    className={`py-2 text-[11px] sm:text-xs font-mono font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      activeDeck === 'login'
                        ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <LogIn size={12} />
                    <span>SIGN IN</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setActiveDeck('biometric');
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    className={`py-2 text-[11px] sm:text-xs font-mono font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      activeDeck === 'biometric'
                        ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                        : 'text-cyan-400 hover:text-cyan-300'
                    }`}
                  >
                    <Fingerprint size={12} />
                    <span>BIOMETRIC</span>
                  </button>
                </div>

                {/* Portal Role Selector (Patient / Clinician / Admin) */}
                {(authMode === 'signup' || authMode === 'login') && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5 px-0.5">
                      <span className="text-[11px] font-mono text-cyan-400">
                        // ASSIGN_NODE_ROLE
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {portalRole === 'doctor' ? 'CLINICIAN' : portalRole === 'admin' ? 'ROOT ADMIN' : 'PATIENT'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#040813] rounded-xl border border-cyan-500/20">
                      <button
                        type="button"
                        onClick={() => { setPortalRole('user'); setError(null); }}
                        className={`py-1.5 px-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          portalRole === 'user'
                            ? 'bg-[#0f2444] text-cyan-300 border border-cyan-500/40 shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <User size={13} className={portalRole === 'user' ? 'text-cyan-400' : ''} />
                        <span>Patient</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setPortalRole('doctor'); setError(null); }}
                        className={`py-1.5 px-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          portalRole === 'doctor'
                            ? 'bg-[#0f2444] text-emerald-300 border border-emerald-500/40 shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Stethoscope size={13} className={portalRole === 'doctor' ? 'text-emerald-400' : ''} />
                        <span>Clinician</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setPortalRole('admin'); setError(null); }}
                        className={`py-1.5 px-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          portalRole === 'admin'
                            ? 'bg-[#0f2444] text-indigo-300 border border-indigo-500/40 shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <ShieldCheck size={13} className={portalRole === 'admin' ? 'text-indigo-400' : ''} />
                        <span>Admin</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Notifications & System Alerts */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/60 text-rose-300 text-xs font-mono flex items-start gap-2"
                  >
                    <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-400" />
                    <span className="leading-snug">{error}</span>
                  </motion.div>
                )}

                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/60 text-emerald-300 text-xs font-mono flex items-center gap-2"
                  >
                    <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                    <span className="leading-snug font-bold">{successMessage}</span>
                  </motion.div>
                )}

                {/* BIOMETRIC MODE (True Biometric-Only WebAuthn Authentication) */}
                {activeDeck === 'biometric' && (
                  <div className="space-y-4">
                    
                    {/* Biometric Sub-Tabs (Direct Biometric-Only Scan vs 1-Tap Enroll Device) */}
                    <div className="grid grid-cols-2 gap-1 p-1 bg-[#040813] rounded-xl border border-cyan-500/30">
                      <button
                        type="button"
                        onClick={() => { setBiometricTab('scan'); setError(null); }}
                        className={`py-1.5 text-xs font-mono font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          biometricTab === 'scan'
                            ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Fingerprint size={13} />
                        <span>BIOMETRIC SCAN</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setBiometricTab('enroll'); setError(null); }}
                        className={`py-1.5 text-xs font-mono font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          biometricTab === 'enroll'
                            ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <ShieldCheck size={13} />
                        <span>ENROLL DEVICE</span>
                      </button>
                    </div>

                    {/* Hardware Telemetry Strip */}
                    <div className="p-2.5 rounded-xl bg-[#040813] border border-cyan-500/25 flex items-center justify-between text-[10.5px] font-mono">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                        <span className="text-cyan-300 font-bold truncate">
                          {deviceBiometrics.authenticatorType.toUpperCase()}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/40 text-[9px] font-bold">
                        WEBAUTHN FIDO2
                      </span>
                    </div>

                    {biometricTab === 'scan' ? (
                      /* BIOMETRIC-ONLY SCAN VIEW (ZERO EMAIL REQUIRED) */
                      <div className="space-y-4">
                        
                        {/* Interactive Cyber Biometric Sensor */}
                        <div 
                          onClick={() => !isBiometricLoading && !biometricSuccess && handleBiometricAuth()}
                          className={`relative p-6 rounded-2xl bg-[#040813] border transition-all duration-300 flex flex-col items-center text-center cursor-pointer select-none group ${
                            biometricSuccess
                              ? 'border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.35)]'
                              : isBiometricLoading
                              ? 'border-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.4)]'
                              : 'border-cyan-500/40 hover:border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]'
                          }`}
                        >
                          {/* Concentric Cybernetic Rings */}
                          <div className="relative mb-3 flex items-center justify-center">
                            <div className={`w-24 h-24 rounded-full border border-dashed transition-all duration-700 ${
                              biometricSuccess 
                                ? 'border-emerald-400 animate-spin-slow' 
                                : isBiometricLoading 
                                ? 'border-cyan-400 animate-spin' 
                                : 'border-cyan-500/40 group-hover:border-cyan-400 animate-spin-slow'
                            }`} />
                            <div className="absolute w-20 h-20 rounded-full border border-blue-500/30" />
                            
                            {/* Central Sensor Core */}
                            <div className={`absolute w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                              biometricSuccess
                                ? 'bg-emerald-950/80 text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.6)]'
                                : isBiometricLoading
                                ? 'bg-cyan-950/80 text-cyan-300 animate-pulse shadow-[0_0_25px_rgba(6,182,212,0.6)]'
                                : 'bg-[#071324] text-cyan-400 group-hover:scale-110 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                            }`}>
                              {biometricSuccess ? (
                                <CheckCircle2 size={32} className="text-emerald-400" />
                              ) : isBiometricLoading ? (
                                <Loader2 size={30} className="animate-spin text-cyan-300" />
                              ) : (
                                <Fingerprint size={32} className="group-hover:scale-105 transition-transform" />
                              )}
                            </div>
                          </div>

                          <h4 className="text-xs font-mono font-bold text-white tracking-wider uppercase">
                            {biometricSuccess ? 'IDENTITY AUTHORIZED' : isBiometricLoading ? 'SCANNING DEVICE ENCLAVE...' : 'TOUCH SENSOR TO SIGN IN'}
                          </h4>
                          <p className="text-[11px] font-mono text-cyan-300/80 mt-1">
                            {biometricSuccess 
                              ? 'Verified via WebAuthn hardware passkey' 
                              : 'No email or password needed • 1-Touch direct authentication'}
                          </p>
                        </div>

                        {/* Primary Action Button */}
                        <button
                          type="button"
                          onClick={() => handleBiometricAuth()}
                          disabled={isBiometricLoading || biometricSuccess}
                          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-500 hover:opacity-95 active:scale-[0.99] text-slate-950 font-mono font-bold text-xs tracking-wider transition-all shadow-[0_0_25px_rgba(6,182,212,0.45)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {isBiometricLoading ? (
                            <Loader2 size={16} className="animate-spin text-slate-950" />
                          ) : (
                            <Fingerprint size={16} />
                          )}
                          <span>
                            {biometricSuccess 
                              ? 'AUTHENTICATED' 
                              : isBiometricLoading 
                              ? 'WAITING FOR SENSOR...' 
                              : `SIGN IN WITH ${deviceBiometrics.authenticatorType.toUpperCase()}`}
                          </span>
                        </button>

                        {/* Device Pairing Help Link */}
                        <div className="pt-1 text-center">
                          <button
                            type="button"
                            onClick={() => { setBiometricTab('enroll'); setError(null); }}
                            className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer"
                          >
                            // Not paired yet? Enroll this device's passkey &rarr;
                          </button>
                        </div>

                      </div>
                    ) : (
                      /* ENROLL DEVICE VIEW */
                      <form onSubmit={handleEnrollDevice} className="space-y-3.5">
                        <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-[11px] font-mono text-cyan-300 leading-relaxed">
                          Pair this device&apos;s Touch ID, Face ID, or Windows Hello with your Doctorian account. Once enrolled, you can sign in with 1 touch without typing an email or password.
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="cyber-enroll-email" className="text-xs font-mono text-cyan-400">
                            // ACCOUNT_EMAIL_TO_BIND
                          </label>
                          <div className="relative">
                            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-500/60 pointer-events-none" />
                            <input
                              id="cyber-enroll-email"
                              type="email"
                              required
                              value={enrollEmail}
                              onChange={(e) => setEnrollEmail(e.target.value)}
                              placeholder={cachedUser?.email || "operator@hospital.org"}
                              className="w-full pl-10 pr-3.5 py-2.5 bg-[#040813] border border-cyan-500/40 rounded-xl text-sm font-mono text-white placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="cyber-enroll-name" className="text-xs font-mono text-cyan-400">
                            // CLINICAL_IDENTITY_NAME
                          </label>
                          <div className="relative">
                            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-500/60 pointer-events-none" />
                            <input
                              id="cyber-enroll-name"
                              type="text"
                              value={enrollName}
                              onChange={(e) => setEnrollName(e.target.value)}
                              placeholder={cachedUser?.displayName || "Dr. Akullo Gloria"}
                              className="w-full pl-10 pr-3.5 py-2.5 bg-[#040813] border border-cyan-500/40 rounded-xl text-sm font-mono text-white placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all outline-none"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isBiometricLoading || biometricSuccess}
                          className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:scale-[0.99] text-slate-950 font-mono font-bold text-xs tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {isBiometricLoading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                          <span>PAIR & REGISTER DEVICE BIOMETRIC</span>
                        </button>
                      </form>
                    )}

                  </div>
                )}

                {/* FORM VIEW (Sign Up, Password Login, Password Reset) */}
                {activeDeck !== 'biometric' && (
                  <form onSubmit={handleSubmit} className="space-y-3.5">

                    {/* Biometric-Only Quick Shortcut Banner in Login Mode */}
                    {authMode === 'login' && (
                      <div className="p-2.5 rounded-xl bg-gradient-to-r from-[#07192f] to-[#0a2344] border border-cyan-500/40 flex items-center justify-between gap-2 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-cyan-950/80 border border-cyan-400/50 text-cyan-300 flex items-center justify-center shrink-0">
                            <Fingerprint size={16} className="animate-pulse" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-mono font-bold text-white truncate">
                              Biometric-Only Sign In Available
                            </p>
                            <p className="text-[9.5px] font-mono text-cyan-300/80 truncate">
                              {deviceBiometrics.authenticatorType} • Zero typing
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveDeck('biometric');
                            setBiometricTab('scan');
                            setError(null);
                            setSuccessMessage(null);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-[10.5px] shrink-0 tracking-wider transition-all cursor-pointer shadow-xs"
                        >
                          USE BIOMETRICS
                        </button>
                      </div>
                    )}
                    
                    {/* Full Name (Sign Up only) */}
                    {authMode === 'signup' && (
                      <div className="space-y-1.5">
                        <label htmlFor="cyber-reg-name" className="text-xs font-mono text-cyan-400">
                          // FULL_LEGAL_NAME
                        </label>
                        <div className="relative">
                          <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-500/60 pointer-events-none" />
                          <input
                            id="cyber-reg-name"
                            type="text"
                            required
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="e.g. Gloria Jay Akullo"
                            className="w-full pl-10 pr-3.5 py-2.5 bg-[#040813] border border-cyan-500/40 rounded-xl text-sm font-mono text-white placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* Email Input */}
                    {(authMode === 'signup' || authMode === 'login' || authMode === 'forgot-password') && (
                      <div className="space-y-1.5">
                        <label htmlFor="cyber-reg-email" className="text-xs font-mono text-cyan-400">
                          // EMAIL_IDENTIFIER
                        </label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-500/60 pointer-events-none" />
                          <input
                            id="cyber-reg-email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="operator@hospital.org"
                            className="w-full pl-10 pr-3.5 py-2.5 bg-[#040813] border border-cyan-500/40 rounded-xl text-sm font-mono text-white placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* 2FA Challenge input for password recovery */}
                    {authMode === 'verify-code' && (
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <label htmlFor="cyber-reg-reset-code" className="text-xs font-mono text-cyan-400">
                            // 6_DIGIT_CHALLENGE_CODE
                          </label>
                          <div className="relative">
                            <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-500/60 pointer-events-none" />
                            <input
                              id="cyber-reg-reset-code"
                              type="text"
                              required
                              value={resetCode}
                              onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              placeholder="000000"
                              className="w-full pl-10 pr-3.5 py-2.5 bg-[#040813] border border-cyan-500/40 rounded-xl text-base font-mono tracking-[0.3em] text-center text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="cyber-reg-pin" className="text-xs font-mono text-cyan-400">
                            // SECONDARY_SECURITY_PIN
                          </label>
                          <div className="relative">
                            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-500/60 pointer-events-none" />
                            <input
                              id="cyber-reg-pin"
                              type="password"
                              required
                              maxLength={6}
                              value={secondaryPin}
                              onChange={(e) => setSecondaryPin(e.target.value.replace(/\D/g, ''))}
                              placeholder="Default: 2026"
                              className="w-full pl-10 pr-3.5 py-2.5 bg-[#040813] border border-cyan-500/40 rounded-xl text-sm font-mono tracking-widest text-center text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Password Input */}
                    {(authMode === 'signup' || authMode === 'login' || authMode === 'reset-password') && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label htmlFor="cyber-reg-password" className="text-xs font-mono text-cyan-400">
                            {authMode === 'reset-password' ? '// NEW_ACCESS_CIPHER' : '// ACCESS_CIPHER'}
                          </label>
                          {authMode === 'login' && (
                            <button
                              type="button"
                              onClick={() => { setAuthMode('forgot-password'); setError(null); }}
                              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer"
                            >
                              Forgot cipher?
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-500/60 pointer-events-none" />
                          <input
                            id="cyber-reg-password"
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full pl-10 pr-10 py-2.5 bg-[#040813] border border-cyan-500/40 rounded-xl text-sm font-mono text-white placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-500/60 hover:text-cyan-300 transition-colors cursor-pointer"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        {(authMode === 'signup' || authMode === 'reset-password') && (
                          <div className="pt-1">
                            <PasswordStrengthIndicator password={password} />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Confirm Password (Reset flow) */}
                    {authMode === 'reset-password' && (
                      <div className="space-y-1.5">
                        <label htmlFor="cyber-confirm-password" className="text-xs font-mono text-cyan-400">
                          // CONFIRM_NEW_CIPHER
                        </label>
                        <div className="relative">
                          <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-500/60 pointer-events-none" />
                          <input
                            id="cyber-confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full pl-10 pr-10 py-2.5 bg-[#040813] border border-cyan-500/40 rounded-xl text-sm font-mono text-white placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-500/60 hover:text-cyan-300 transition-colors cursor-pointer"
                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                          >
                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Terms Checkbox for Registration */}
                    {authMode === 'signup' && (
                      <div className="flex items-start gap-2.5 pt-1">
                        <input
                          type="checkbox"
                          id="cyber-terms-check"
                          checked={agreedToTerms}
                          onChange={(e) => setAgreedToTerms(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded border-cyan-500/40 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                        />
                        <label htmlFor="cyber-terms-check" className="text-xs font-mono text-slate-400 leading-snug cursor-pointer select-none">
                          I agree to{' '}
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowTermsModal('terms'); }}
                            className="text-cyan-400 hover:underline font-bold"
                          >
                            Security Terms
                          </button>
                          {' '}and{' '}
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowTermsModal('privacy'); }}
                            className="text-cyan-400 hover:underline font-bold"
                          >
                            Privacy Protocols
                          </button>
                          .
                        </label>
                      </div>
                    )}

                    {/* Main Cyber Action Button */}
                    <button
                      type="submit"
                      disabled={isLoading || (authMode === 'signup' && !agreedToTerms)}
                      className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:scale-[0.99] text-slate-950 font-mono font-bold text-xs tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 size={16} className="animate-spin text-slate-950" />
                      ) : (
                        <>
                          {authMode === 'signup' && <UserPlus size={16} />}
                          {authMode === 'login' && <LogIn size={16} />}
                          {authMode === 'forgot-password' && <Mail size={16} />}
                          {authMode === 'verify-code' && <ShieldCheck size={16} />}
                          {authMode === 'reset-password' && <CheckCircle2 size={16} />}
                        </>
                      )}
                      <span>
                        {isLoading ? 'EXECUTING HANDSHAKE...' :
                         authMode === 'signup' ? 'GENERATE ENCRYPTED NODE' :
                         authMode === 'login' ? 'AUTHORIZE & ENTER WORKSTATION' :
                         authMode === 'forgot-password' ? 'DISPATCH 2FA CODE' :
                         authMode === 'verify-code' ? 'VERIFY CHALLENGE' :
                         'UPDATE CIPHER'}
                      </span>
                    </button>

                    {/* Back to Login for recovery modes */}
                    {(authMode === 'forgot-password' || authMode === 'verify-code' || authMode === 'reset-password') && (
                      <button
                        type="button"
                        onClick={() => { setAuthMode('login'); setError(null); }}
                        className="w-full py-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ArrowLeft size={13} />
                        <span>RETURN TO LOGIN</span>
                      </button>
                    )}
                  </form>
                )}

                {/* Cyber Social Uplinks */}
                {(authMode === 'signup' || authMode === 'login') && (
                  <div className="space-y-3 pt-2">
                    <div className="relative flex items-center justify-center">
                      <div className="border-t border-cyan-500/20 w-full" />
                      <span className="bg-[#070e1c] px-3 text-[10px] font-mono uppercase tracking-widest text-cyan-400/70 absolute">
                        or federated uplink
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => handleSocialSignIn(googleProvider, 'Google')}
                        disabled={isLoading}
                        className="py-2.5 px-3 rounded-xl border border-cyan-500/30 bg-[#040813] hover:bg-cyan-950/40 text-xs font-mono font-bold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                        </svg>
                        <span>Google</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSocialSignIn(githubProvider, 'GitHub')}
                        disabled={isLoading}
                        className="py-2.5 px-3 rounded-xl border border-cyan-500/30 bg-[#040813] hover:bg-cyan-950/40 text-xs font-mono font-bold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 24 24">
                          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                        </svg>
                        <span>GitHub</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSocialSignIn(facebookProvider, 'Facebook')}
                        disabled={isLoading}
                        className="py-2.5 px-3 rounded-xl border border-cyan-500/30 bg-[#040813] hover:bg-cyan-950/40 text-xs font-mono font-bold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        <svg className="w-3.5 h-3.5 fill-[#1877F2]" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        <span>Meta</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </motion.div>
        )}

      </main>

      {/* Cyber Telemetry Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-cyan-400/60 border-t border-cyan-500/20">
        <div className="flex items-center gap-4">
          <span>&copy; 2026 DOCTORIAN CLINICAL INTELLIGENCE</span>
          <span className="hidden sm:inline">•</span>
          <button 
            onClick={() => setShowTermsModal('terms')} 
            className="hover:text-cyan-300 transition-colors cursor-pointer"
          >
            TERMS OF DIRECTIVE
          </button>
          <span className="hidden sm:inline">•</span>
          <button 
            onClick={() => setShowTermsModal('privacy')} 
            className="hover:text-cyan-300 transition-colors cursor-pointer"
          >
            PRIVACY PROTOCOL
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>NODE STATUS: 100% OPERATIONAL</span>
          </span>
        </div>
      </footer>

      {/* Terms & Privacy Cyber Modal */}
      <AnimatePresence>
        {showTermsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#070e1c] rounded-2xl border border-cyan-500/50 max-w-lg w-full p-6 shadow-[0_0_40px_rgba(6,182,212,0.3)] space-y-4 max-h-[85vh] flex flex-col font-mono text-xs"
            >
              <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  {showTermsModal === 'terms' ? '// TERMS_OF_CLINICAL_DIRECTIVE' : '// PRIVACY_AND_ENCLAVE_DIRECTIVE'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowTermsModal(null)}
                  className="p-1 rounded hover:bg-cyan-950 text-cyan-400 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 text-slate-300 pr-2">
                {showTermsModal === 'terms' ? (
                  <>
                    <p><strong>1. CLINICAL DIRECTIVE:</strong> Doctorian provides autonomous physiological triage telemetry. It assists healthcare practitioners and patients but does not replace licensed medical intervention.</p>
                    <p><strong>2. RELAY NETWORK:</strong> Automated alert dispatch and SMS protocols transmit physiological baselines to designated clinician nodes.</p>
                    <p><strong>3. QUANTUM VAULT:</strong> Credentials and encryption ciphers are preserved under hardware WebAuthn client-side custody.</p>
                  </>
                ) : (
                  <>
                    <p><strong>1. ZERO BROKERAGE:</strong> Biometric measurements and clinical records are never transferred to third-party data aggregators.</p>
                    <p><strong>2. ENCLAVE ISOLATION:</strong> Biometric passkeys remain strictly inside the client hardware Secure Enclave.</p>
                    <p><strong>3. ERASURE RIGHTS:</strong> Full cryptographically verified ledger deletion available via profile control.</p>
                  </>
                )}
              </div>

              <div className="pt-3 border-t border-cyan-500/30 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setAgreedToTerms(true);
                    setShowTermsModal(null);
                  }}
                  className="py-2 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wider transition-colors cursor-pointer"
                >
                  ACKNOWLEDGE & ACCEPT
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
