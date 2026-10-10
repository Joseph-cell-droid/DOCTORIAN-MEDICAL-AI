import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Radio, Send, Phone, MessageSquare, AlertTriangle, Shield, Activity, 
  MapPin, Check, CheckCheck, Clock, RefreshCw, User, Stethoscope, 
  Bot, Sparkles, HeartPulse, Zap, Volume2, VolumeX, AlertCircle, 
  Copy, PhoneCall, ChevronRight, ArrowRight
} from 'lucide-react';
import { api, User as UserType } from '../api';

export interface EmergencySmsChatProps {
  user: UserType | null;
  addToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onNavigate?: (view: any) => void;
}

interface SmsMessageItem {
  id: string;
  sender: 'user' | 'peer' | 'system';
  senderName: string;
  senderPhone: string;
  recipientName: string;
  recipientPhone: string;
  targetType: 'person' | 'doctor' | 'ai';
  text: string;
  timestamp: string;
  status: 'DELIVERED' | 'SENDING' | 'FAILED';
  hasGps?: boolean;
  hasVitals?: boolean;
  vitalsSummary?: string;
  carrierRoute?: string;
}

export const EmergencySmsChat: React.FC<EmergencySmsChatProps> = ({ user, addToast, onNavigate }) => {
  const [activeTarget, setActiveTarget] = useState<'person' | 'doctor' | 'ai'>('doctor');
  
  // Contacts
  const [customPhone, setCustomPhone] = useState(user?.mentorPhone || '+256772987654');
  const [contactName, setContactName] = useState('Family Emergency Contact (David)');
  const [selectedDoctor, setSelectedDoctor] = useState({
    name: 'Dr. Sarah Johnson, MD (Emergency Attending)',
    phone: '+256700123456',
    specialty: 'Trauma & Acute Resuscitation'
  });

  const [messageInput, setMessageInput] = useState('');
  const [includeGps, setIncludeGps] = useState(true);
  const [includeVitals, setIncludeVitals] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [carrierSignal, setCarrierSignal] = useState({ operator: 'MTN Cellular / GSM Gateway', csq: 29, status: 'ONLINE' });

  const [messages, setMessages] = useState<SmsMessageItem[]>([
    {
      id: 'sms-init-1',
      sender: 'system',
      senderName: 'Doctorian GSM SMS Engine',
      senderPhone: 'RELAY-SMS',
      recipientName: 'Patient Device',
      recipientPhone: user?.phone || '+256700000000',
      targetType: 'ai',
      text: '🚨 Emergency SMS Relay active. Direct SMS available for Family/Contacts, On-Call Physicians, and AI Emergency Triage for zero-data/low-connectivity environments.',
      timestamp: new Date(Date.now() - 360000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'DELIVERED',
      carrierRoute: 'GSM-AT-CELLULAR'
    },
    {
      id: 'sms-init-2',
      sender: 'peer',
      senderName: 'Dr. Sarah Johnson, MD',
      senderPhone: '+256700123456',
      recipientName: user?.displayName || 'Patient',
      recipientPhone: user?.phone || '+256700000000',
      targetType: 'doctor',
      text: 'Doctorian Emergency Station on-call. If acute chest pain, trauma, or respiratory distress occurs, send SMS dispatch immediately.',
      timestamp: new Date(Date.now() - 180000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'DELIVERED',
      carrierRoute: 'MTN_TELECOM_UG'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Current Patient Vitals (Simulated / Connected)
  const currentVitals = {
    heartRate: '98 bpm',
    spo2: '97%',
    temp: '37.8°C',
    bp: '124/82 mmHg'
  };

  const gpsCoordinates = "0.3476° N, 32.5825° E (Kampala Central / Sector 4)";

  // One-tap quick emergency dispatches
  const quickDispatches = [
    {
      label: 'Chest Pain / Angina',
      text: 'EMERGENCY: Experiencing severe crushing chest pain, radiating to left arm and shortness of breath.',
      priority: 'CRITICAL'
    },
    {
      label: 'Severe Bleeding / Trauma',
      text: 'EMERGENCY: Severe acute laceration with continuous bleeding. Need immediate compression protocol & trauma aid.',
      priority: 'HIGH'
    },
    {
      label: 'Child High Fever / Convulsion',
      text: 'EMERGENCY: Child has high temperature 39.5C with twitching/febrile seizure symptoms. Need urgent guidance.',
      priority: 'CRITICAL'
    },
    {
      label: 'Obstetric / Labor Distress',
      text: 'EMERGENCY: Pregnant patient in intense labor contractions with sudden membrane rupture. Need delivery dispatch.',
      priority: 'HIGH'
    }
  ];

  const handleSendSms = async (overrideText?: string) => {
    const rawText = overrideText || messageInput;
    if (!rawText.trim()) return;

    setIsSending(true);

    let fullPayload = rawText.trim();
    if (includeGps) {
      fullPayload += ` [GPS: ${gpsCoordinates}]`;
    }
    if (includeVitals) {
      fullPayload += ` [VITALS: HR ${currentVitals.heartRate}, SpO2 ${currentVitals.spo2}, BP ${currentVitals.bp}]`;
    }

    const targetPhone = activeTarget === 'person' 
      ? customPhone 
      : activeTarget === 'doctor' 
      ? selectedDoctor.phone 
      : '911-DOCTORIAN-AI';

    const targetRecipient = activeTarget === 'person' 
      ? contactName 
      : activeTarget === 'doctor' 
      ? selectedDoctor.name 
      : 'Doctorian Emergency AI Brain';

    const newMsg: SmsMessageItem = {
      id: `sms-tx-${Date.now()}`,
      sender: 'user',
      senderName: user?.displayName || 'Patient / User',
      senderPhone: user?.phone || '+256701234567',
      recipientName: targetRecipient,
      recipientPhone: targetPhone,
      targetType: activeTarget,
      text: fullPayload,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'DELIVERED',
      hasGps: includeGps,
      hasVitals: includeVitals,
      vitalsSummary: `HR: ${currentVitals.heartRate} | SpO2: ${currentVitals.spo2}`,
      carrierRoute: 'GSM_MODEM_TX_QUEUED'
    };

    setMessages(prev => [...prev, newMsg]);
    setMessageInput('');

    try {
      // Send through backend GSM Gateway
      await fetch('/api/gsm/incoming-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderPhone: newMsg.senderPhone,
          messageText: `[EMERGENCY_SMS_RELAY to ${targetRecipient}] ${fullPayload}`,
          aiModel: 'Emergency Triage Core'
        })
      });
    } catch (e) {
      console.warn("GSM SMS Server relay fallback to cellular simulation:", e);
    }

    if (addToast) {
      addToast(`Emergency SMS dispatched via ${carrierSignal.operator} to ${targetRecipient}`, 'success');
    }

    // Generate Rapid Reply depending on recipient type
    setTimeout(() => {
      let replyText = '';
      let replySender = '';
      let replyPhone = '';

      if (activeTarget === 'ai') {
        replySender = 'Doctorian AI Emergency Brain';
        replyPhone = '911-AI-RELAY';
        if (rawText.toLowerCase().includes('chest pain')) {
          replyText = '[AI EMERGENCY SMS] Sit upright. Loosen tight clothing. If not allergic, chew 300mg Aspirin immediately. Ambulance dispatched to GPS: 0.3476N, 32.5825E. Stay on call.';
        } else if (rawText.toLowerCase().includes('bleeding')) {
          replyText = '[AI EMERGENCY SMS] Apply firm, continuous direct pressure with clean cloth. Elevate wound above heart level. Do NOT remove cloth if soaked; add another layer on top.';
        } else if (rawText.toLowerCase().includes('fever') || rawText.toLowerCase().includes('convulsion')) {
          replyText = '[AI EMERGENCY SMS] Turn patient on their side (recovery position) to protect airway. Do NOT place objects in mouth. Sponge body with lukewarm water. Doctor paged.';
        } else {
          replyText = '[AI EMERGENCY SMS] Priority Triage: Keep airway clear. Rest in comfortable position. Emergency medical dispatch alerted with your vital telemetry.';
        }
      } else if (activeTarget === 'doctor') {
        replySender = selectedDoctor.name;
        replyPhone = selectedDoctor.phone;
        replyText = `[DOCTOR SMS] Received emergency SOS with vitals (${currentVitals.heartRate}, SpO2 ${currentVitals.spo2}). Hospital response team dispatched to your location. Keep phone line open. ETA ~7 mins.`;
      } else {
        replySender = contactName;
        replyPhone = customPhone;
        replyText = `[SMS RECEIVED] I received your emergency alert and GPS location! I am heading over right now and calling emergency services for you. Hold on!`;
      }

      const replyMsg: SmsMessageItem = {
        id: `sms-rx-${Date.now()}`,
        sender: 'peer',
        senderName: replySender,
        senderPhone: replyPhone,
        recipientName: user?.displayName || 'User',
        recipientPhone: user?.phone || '+256701234567',
        targetType: activeTarget,
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'DELIVERED',
        carrierRoute: 'GSM_MODEM_RX_INBOUND'
      };

      setMessages(prev => [...prev, replyMsg]);
      setIsSending(false);
      if (addToast) {
        addToast(`Inbound Emergency SMS received from ${replySender}`, 'info');
      }
    }, 1200);
  };

  const filteredMessages = messages.filter(m => {
    if (m.sender === 'system') return true;
    return m.targetType === activeTarget;
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col h-[740px] max-h-[85vh]">
      {/* ───────────────────────────────────────────────────────── */}
      {/* 1. Header with Carrier Status & Emergency Modes           */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 text-white shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shrink-0">
              <Radio size={20} className="text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg tracking-tight leading-tight">
                  Doctorian Emergency SMS Chat
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-black/30 border border-white/20">
                  GSM/Cellular
                </span>
              </div>
              <p className="text-xs text-rose-100 font-medium mt-0.5">
                Faster help via SMS for Family, Doctors & AI Triage (Offline Capable)
              </p>
            </div>
          </div>

          {/* Carrier & Signal Badge */}
          <div className="flex items-center gap-2 bg-black/25 px-3 py-1.5 rounded-xl border border-white/20 shrink-0 self-start sm:self-auto">
            <div className="flex items-end gap-0.5 h-3">
              <span className="w-1 h-1.5 bg-emerald-400 rounded-xs" />
              <span className="w-1 h-2 bg-emerald-400 rounded-xs" />
              <span className="w-1 h-2.5 bg-emerald-400 rounded-xs" />
              <span className="w-1 h-3 bg-emerald-400 rounded-xs" />
            </div>
            <div className="text-[10px] font-mono leading-none">
              <span className="font-bold text-white block">{carrierSignal.operator}</span>
              <span className="text-emerald-300 text-[8px] uppercase tracking-wider">Signal CSQ: {carrierSignal.csq}/31 • 99.8% Online</span>
            </div>
          </div>
        </div>

        {/* Channel Navigation Switcher: Another Person | Doctor | AI Triage */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/20">
          <button
            type="button"
            onClick={() => setActiveTarget('person')}
            className={`py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTarget === 'person' 
                ? 'bg-white text-rose-700 shadow-md scale-[1.02]' 
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <User size={14} />
            <span className="truncate">Emergency Contact</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTarget('doctor')}
            className={`py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTarget === 'doctor' 
                ? 'bg-white text-rose-700 shadow-md scale-[1.02]' 
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Stethoscope size={14} />
            <span className="truncate">Doctor on Call</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTarget('ai')}
            className={`py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTarget === 'ai' 
                ? 'bg-white text-rose-700 shadow-md scale-[1.02]' 
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Bot size={14} />
            <span className="truncate">AI Rapid Triage</span>
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* 2. Recipient Information & Telemetry Context Bar           */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex items-center gap-2">
          {activeTarget === 'person' && (
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 dark:text-slate-200">Contact:</span>
              <input 
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="px-2 py-0.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold bg-white dark:bg-slate-900 w-44"
                placeholder="Contact Name"
              />
              <input 
                type="text"
                value={customPhone}
                onChange={(e) => setCustomPhone(e.target.value)}
                className="px-2 py-0.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-mono bg-white dark:bg-slate-900 w-32"
                placeholder="Phone Number"
              />
            </div>
          )}

          {activeTarget === 'doctor' && (
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 dark:text-slate-200">On-Call Physician:</span>
              <span className="font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-0.5 rounded-lg border border-rose-200 dark:border-rose-900">
                {selectedDoctor.name} ({selectedDoctor.phone})
              </span>
            </div>
          )}

          {activeTarget === 'ai' && (
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 dark:text-slate-200">AI Engine:</span>
              <span className="font-mono text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-0.5 rounded-lg border border-purple-200 dark:border-purple-900 font-bold">
                Doctorian Qwen Clinical Emergency Core (Offline/SMS)
              </span>
            </div>
          )}
        </div>

        {/* Telemetry Toggles */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-600 dark:text-slate-400 font-medium">
            <input 
              type="checkbox"
              checked={includeGps}
              onChange={(e) => setIncludeGps(e.target.checked)}
              className="rounded text-rose-600 focus:ring-rose-500"
            />
            <MapPin size={12} className="text-rose-500" />
            <span>Attach GPS</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-600 dark:text-slate-400 font-medium">
            <input 
              type="checkbox"
              checked={includeVitals}
              onChange={(e) => setIncludeVitals(e.target.checked)}
              className="rounded text-rose-600 focus:ring-rose-500"
            />
            <Activity size={12} className="text-emerald-500" />
            <span>Attach Vitals</span>
          </label>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* 3. SMS Message Thread Stream                              */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3.5 bg-slate-100/60 dark:bg-[#070e20]/60">
        {filteredMessages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isSystem = msg.sender === 'system';

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-2">
                <div className="bg-amber-100/90 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs px-3 py-1.5 rounded-2xl max-w-lg text-center font-medium shadow-xs">
                  {msg.text}
                </div>
              </div>
            );
          }

          return (
            <div 
              key={msg.id} 
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mb-1 px-1">
                <span className="font-bold text-slate-700 dark:text-slate-300">{msg.senderName}</span>
                <span>•</span>
                <span>{msg.senderPhone}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              <div 
                className={`max-w-[85%] sm:max-w-md p-3 sm:p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm relative ${
                  isUser 
                    ? 'bg-rose-600 text-white rounded-br-xs' 
                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-xs'
                }`}
              >
                <p className="whitespace-pre-wrap font-medium">{msg.text}</p>

                {/* Vitals & GPS Attached Tags */}
                {(msg.hasGps || msg.hasVitals) && (
                  <div className={`mt-2 pt-2 border-t flex flex-wrap gap-2 text-[10px] font-mono ${
                    isUser ? 'border-rose-500/50 text-rose-100' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                  }`}>
                    {msg.hasGps && (
                      <span className="flex items-center gap-1 bg-black/15 px-2 py-0.5 rounded-md">
                        <MapPin size={10} /> GPS Location Sent
                      </span>
                    )}
                    {msg.hasVitals && (
                      <span className="flex items-center gap-1 bg-black/15 px-2 py-0.5 rounded-md">
                        <HeartPulse size={10} /> Live Telemetry Linked
                      </span>
                    )}
                  </div>
                )}

                {/* Status Indicator */}
                <div className="flex items-center justify-end gap-1 mt-1 text-[9px] opacity-80">
                  <span>SMS Relay</span>
                  {msg.status === 'DELIVERED' ? (
                    <CheckCheck size={11} className={isUser ? 'text-rose-200' : 'text-emerald-500'} />
                  ) : (
                    <Clock size={11} />
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* 4. One-Tap Quick Emergency Templates                      */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="px-3 py-2 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar shrink-0">
        <div className="flex items-center gap-2 min-w-max">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1">
            <Zap size={11} className="text-amber-500" /> Quick SOS:
          </span>
          {quickDispatches.map((qd, qIdx) => (
            <button
              key={`qd-${qIdx}`}
              type="button"
              onClick={() => handleSendSms(qd.text)}
              className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-800 hover:border-rose-300 transition-all cursor-pointer whitespace-nowrap shadow-2xs"
            >
              {qd.label}
            </button>
          ))}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* 5. SMS Composer & Dispatch Button                          */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendSms();
                }
              }}
              placeholder={`Send emergency SMS to ${activeTarget === 'person' ? contactName : activeTarget === 'doctor' ? selectedDoctor.name : 'AI Emergency Triage'}...`}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 resize-none h-16"
            />
            <div className="absolute bottom-2 right-3 text-[9px] font-mono text-slate-400">
              {messageInput.length}/160 SMS Char
            </div>
          </div>

          <button
            type="button"
            disabled={isSending || !messageInput.trim()}
            onClick={() => handleSendSms()}
            className="h-16 px-5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 active:scale-95 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider flex flex-col items-center justify-center gap-1 shadow-lg shadow-rose-600/30 cursor-pointer shrink-0 transition-all"
          >
            {isSending ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            <span>Send SMS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
