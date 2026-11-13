import React from 'react';
import { 
  Activity, 
  FileText, 
  LayoutGrid, 
  Zap, 
  Stethoscope, 
  Pill, 
  Brain, 
  User as UserIcon, 
  Shield, 
  ShieldCheck, 
  UserPlus, 
  Palette, 
  Crown, 
  Fingerprint, 
  Info, 
  Thermometer, 
  Heart,
  Droplets,
  Apple,
  Moon,
  Smile,
  Compass
} from 'lucide-react';
import { HealthTip } from './components/HealthTipModal';

export const SEARCHABLE_ITEMS = [
  { label: 'Clinical Features & Platform Capabilities', view: 'features', icon: <Compass size={18} />, category: 'Platform Suite', description: 'Explore all active clinical tools, bio-telemetry monitors, AI diagnostic suites, and health services.' },
  { label: 'Clinical Health Dashboard', view: 'home', icon: <LayoutGrid size={18} />, category: 'Clinical Core', description: 'Real-time patient health summary, vital signs telemetry, and AI clinical insights.' },
  { label: 'Next-Generation Clinical AI Suite (Stethoscope & rPPG Pulse)', view: 'nextgen_tech', icon: <Zap size={18} />, category: 'Next-Gen Intelligence', description: 'Contactless camera rPPG pulse scanner, digital acoustic stethoscope, AI tumor board consensus matrix, vocal biomarkers, offline mesh sync, and 4D organ twin.' },
  { label: 'AI Diagnostic Consultation', view: 'ai_nexus', icon: <Zap size={18} />, category: 'AI Intelligence', description: 'Multimodal AI-driven clinical triage, differential diagnoses, and medical queries.' },
  { label: 'Real-Time Bio-Telemetry Monitor', view: 'monitor', icon: <Activity size={18} />, category: 'Diagnostics & Labs', description: 'Continuous electrocardiogram (ECG), heart rate, and physiological sensor telemetry.' },
  { label: 'Diagnostic Laboratory Analyser', view: 'diagnostic_lab', icon: <Stethoscope size={18} />, category: 'Diagnostics & Labs', description: 'Analyze blood chemistry panels, pathology reports, and biomarker values.' },
  { label: 'Vitality & Metabolic Index', view: 'vitality', icon: <Activity size={18} />, category: 'Longevity Core', description: 'Biological age assessment, metabolic stability, and circadian bio-energy analytics.' },
  { label: 'Precision Clinical Pharmacy', view: 'meds', icon: <Pill size={18} />, category: 'Care Management', description: 'Pharmacological dosage schedules, drug-drug interaction warnings, and prescription refills.' },
  { label: 'Clinical Appointments & Consultations', view: 'clinical_roadmap', icon: <LayoutGrid size={18} />, category: 'Care Management', description: 'Schedule specialist consultations, telehealth visits, and clinical calendar roadmap.' },
  { label: 'Electronic Health Records (EHR)', view: 'records', icon: <FileText size={18} />, category: 'Clinical Data', description: 'Securely view, export, and manage patient medical history, lab records, and clinical passports.' },
  { label: 'Emergency SOS & Trauma Response', view: 'emergency', icon: <ShieldCheck size={18} />, category: 'Emergency 24/7', description: 'Instant emergency dispatch, 911 SMS telemetry, and specialist trauma notification.' },
  { label: 'Physician Clinical Workstation', view: 'doctors_dashboard', icon: <UserIcon size={18} />, category: 'Physician Portal', description: 'Doctor workstation for patient management, electronic prescriptions, and telehealth video sessions.' },
  { label: 'Specialist Directory & Referral', view: 'specialist', icon: <UserPlus size={18} />, category: 'Specialist Network', description: 'Connect and schedule clinical referrals with board-certified medical specialists.' },
  { label: 'Cognis Neural & Cognitive Lab', view: 'neuro', icon: <Brain size={18} />, category: 'Neuroscience', description: 'Cognitive performance tracking, neuro-diagnostic assessments, and neuroplasticity training.' },
  { label: 'Genomic & Longevity Research Core', view: 'genomic_longevity', icon: <Compass size={18} />, category: 'Genomics & Research', description: 'DNA sequence analysis, epigenetic age metrics, and individualized longevity protocols.' },
  { label: 'Clinical Knowledge Hub & Literature', view: 'biomatic', icon: <Compass size={18} />, category: 'Research & Literature', description: 'Multi-source medical literature search, PubMed clinical trials, WHO data, and AI synthesis.' },
  { label: 'Clinical Symptom Triage', view: 'symptoms', icon: <Thermometer size={18} />, category: 'AI Intelligence', description: 'Intelligent clinical symptom evaluation with structured differential guidance.' },
  { label: 'Longitudinal Clinical Timeline', view: 'health_trace', icon: <Activity size={18} />, category: 'Clinical Data', description: 'Historical biomarker trajectories, health milestones, and longitudinal recovery trends.' },
  { label: '3D Anatomical & Surgical Illustrator', view: 'illustrator', icon: <Palette size={18} />, category: 'Medical Graphics', description: 'High-fidelity 3D anatomical modeling and medical educational video animations.' },
  { label: 'Biometric Security & 2FA Vault', view: 'biosecurity', icon: <Fingerprint size={18} />, category: 'Security & Privacy', description: 'WebAuthn passkeys, biometric vault protection, and zero-knowledge patient data privacy.' },
  { label: 'Patient Profile & Medical Identity', view: 'profile', icon: <UserIcon size={18} />, category: 'Patient Identity', description: 'Manage emergency contacts, blood type, allergies, and personal health demographics.' },
  { label: 'Healthcare Insurance & Billing Ledger', view: 'billing', icon: <Crown size={18} />, category: 'Billing & Ledger', description: 'Review insurance policies, claims processing, and healthcare subscription ledger.' },
  { label: 'Clinical SMS & Telemetry Relay', view: 'gsm_sms_gateway', icon: <Zap size={18} />, category: 'Telemetry & SMS', description: 'Hardware AT modem configuration and instant emergency SMS broadcast relays.' },
  { label: 'Physiological Longevity Protocols', view: 'fitness', icon: <Activity size={18} />, category: 'Longevity Core', description: 'Targeted cardiovascular protocols, VO2 max optimization, and metabolic conditioning.' },
  { label: 'Systems Intelligence Hub', view: 'systems_hub', icon: <LayoutGrid size={18} />, category: 'Systems Navigation', description: 'Central command matrix with rapid launcher nodes and diagnostic widgets.' },
  { label: 'Administrator Command Console', view: 'admin', icon: <Shield size={18} />, category: 'Administration', description: 'Administrative hospital oversight, user roles, security audits, and neural model training.' },
  { label: 'System Architecture & Platform Info', view: 'about', icon: <Info size={18} />, category: 'System Architecture', description: 'Learn about Doctorian clinical intelligence architecture and medical standards.' },
  { label: 'HIPAA & Privacy Data Policy', view: 'privacy', icon: <Shield size={18} />, category: 'Compliance & Legal', description: 'Comprehensive patient confidentiality and encrypted data governance protocols.' },
  { label: 'Clinical Terms of Service', view: 'terms', icon: <FileText size={18} />, category: 'Compliance & Legal', description: 'Standard clinical agreements, telehealth policies, and diagnostic liability boundaries.' },
  { label: 'Fever & Chills Clinical Guidance', view: 'home', icon: <Thermometer size={18} />, category: 'Symptom Triage', description: 'Clinical guidance for managing elevated temperature and systemic chills.', prompt: 'I have a fever and chills, what should I do?' },
  { label: 'Headache & Migraine Assessment', view: 'home', icon: <Brain size={18} />, category: 'Symptom Triage', description: 'Differential guidance for managing severe or persistent cephalalgia.', prompt: 'How can I relieve a severe headache?' },
  { label: 'Cardiovascular Health Protocol', view: 'home', icon: <Heart size={18} />, category: 'Cardiology', description: 'Evidence-based tips and telemetry monitoring for cardiovascular health.', prompt: 'Give me tips for maintaining a healthy heart.' },
];

export const HEALTH_TIPS: HealthTip[] = [
  {
    title: "Stay Hydrated",
    description: "Drink at least 8 glasses of water daily to maintain energy levels and support vital organ functions.",
    details: "Hydration is essential for nearly every bodily function. It helps regulate temperature, keep joints lubricated, prevent infections, deliver nutrients to cells, and keep organs functioning properly. Being well-hydrated also improves sleep quality, cognition, and mood.",
    benefits: ["Regulates body temperature", "Lubricates joints", "Protects sensitive tissues", "Aids in digestion"],
    icon: <Droplets className="w-8 h-8 text-blue-600" />,
    color: "bg-blue-50"
  },
  {
    title: "Balanced Nutrition",
    description: "Focus on whole foods, lean proteins, and plenty of colorful vegetables to fuel your body effectively.",
    details: "A balanced diet provides the nutrients your body needs to function correctly. To get the proper nutrition from your diet, you should consume most of your daily calories in: fresh fruits, fresh vegetables, whole grains, legumes, nuts, and lean proteins.",
    benefits: ["Boosts immune system", "Supports healthy growth", "Reduces risk of chronic diseases", "Improves mental health"],
    icon: <Apple className="w-8 h-8 text-emerald-600" />,
    color: "bg-emerald-50"
  },
  {
    title: "Quality Sleep",
    description: "Aim for 7-9 hours of restful sleep each night to allow your body and mind to recover and recharge.",
    details: "Sleep is as important to health as diet and exercise. Good sleep improves brain performance, mood, and health. Not getting enough quality sleep regularly raises the risk of many diseases and disorders. These range from heart disease and stroke to obesity and dementia.",
    benefits: ["Improves concentration", "Lowers stress levels", "Supports heart health", "Enhances athletic performance"],
    icon: <Moon className="w-8 h-8 text-indigo-600" />,
    color: "bg-indigo-50"
  },
  {
    title: "Regular Exercise",
    description: "Incorporate at least 30 minutes of moderate physical activity into your daily routine for heart health.",
    details: "Physical activity or exercise can improve your health and reduce the risk of developing several diseases like type 2 diabetes, cancer and cardiovascular disease. Physical activity and exercise can have immediate and long-term health benefits. Most importantly, regular activity can improve your quality of life.",
    benefits: ["Strengthens heart and lungs", "Improves muscle tone", "Increases bone density", "Boosts mood and energy"],
    icon: <Zap className="w-8 h-8 text-amber-600" />,
    color: "bg-amber-50"
  },
  {
    title: "Mental Clarity",
    description: "Practice mindfulness or meditation for 10 minutes daily to reduce stress and improve focus.",
    details: "Mindfulness is the basic human ability to be fully present, aware of where we are and what we’re doing, and not overly reactive or overwhelmed by what’s going on around us. Meditation is a practice where an individual uses a technique – such as mindfulness – to train attention and awareness, and achieve a mentally clear and emotionally calm and stable state.",
    benefits: ["Reduces anxiety", "Improves emotional regulation", "Increases attention span", "Enhances self-awareness"],
    icon: <Brain className="w-8 h-8 text-purple-600" />,
    color: "bg-purple-50"
  },
  {
    title: "Stress Management",
    description: "Maintain a healthy work-life balance and engage in hobbies that bring you joy and relaxation.",
    details: "Stress management is a wide spectrum of techniques and psychotherapies aimed at controlling a person's level of stress, especially chronic stress, usually for the purpose of and for the motive of improving everyday functioning.",
    benefits: ["Lowers blood pressure", "Improves sleep quality", "Strengthens immune system", "Increases productivity"],
    icon: <Smile className="w-8 h-8 text-rose-600" />,
    color: "bg-rose-50"
  }
];
