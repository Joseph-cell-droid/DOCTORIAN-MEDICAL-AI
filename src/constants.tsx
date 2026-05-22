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
  Smile
} from 'lucide-react';
import { HealthTip } from './components/HealthTipModal';

export const SEARCHABLE_ITEMS = [
  { label: 'Patient Monitoring System', view: 'monitor', icon: <Activity size={18} />, category: 'Tools', description: 'Real-time heart rate and vitals monitoring.' },
  { label: 'Clinical Health Records', view: 'records', icon: <FileText size={18} />, category: 'Data', description: 'View and manage your medical history and records.' },
  { label: 'Clinical Roadmap', view: 'home', icon: <LayoutGrid size={18} />, category: 'Intelligence', description: 'Track your specialized health milestones and journey.' },
  { label: 'Bio-Simulation', view: 'home', icon: <Zap size={18} />, category: 'Intelligence', description: 'Real-time biological modeling and DNA synthesis.' },
  { label: 'Diagnostic Mapper', view: 'diagnostic_lab', icon: <Stethoscope size={18} />, category: 'AI Features', description: 'Analyze your symptoms with advanced AI intelligence.' },
  { label: 'Bio-Pharmacy Tracker', view: 'meds', icon: <Pill size={18} />, category: 'Management', description: 'Dosage tracking and interaction checks.' },
  { label: 'CognisHub', view: 'neuro', icon: <Brain size={18} />, category: 'Intelligence', description: 'Cognitive health and brain performance tracking.' },
  { label: 'Vitality Matrix', view: 'vitality', icon: <Activity size={18} />, category: 'Long-term Health', description: 'Longevity, metabolic age, and performance analytics.' },
  { label: 'Profile Settings', view: 'profile', icon: <UserIcon size={18} />, category: 'Account', description: 'Manage your personal information and security.' },
  { label: 'Admin Dashboard', view: 'admin', icon: <Shield size={18} />, category: 'System', description: 'System administration and user management.' },
  { label: 'Clinical Passport', view: 'records', icon: <ShieldCheck size={18} />, category: 'Data', description: 'Verified health status and travel authorization.' },
  { label: 'Specialist Finder', view: 'specialist', icon: <UserPlus size={18} />, category: 'Network', description: 'Connect with authorized medical practitioners.' },
  { label: 'Neural Training Hub', view: 'admin', icon: <Brain size={18} />, category: 'Intelligence', description: 'Train Doctorian with your custom medical knowledge.' },
  { label: 'Medical Illustrator', view: 'illustrator', icon: <Palette size={18} />, category: 'AI Features', description: 'Generate high-fidelity anatomical and medical illustrations.' },
  { label: 'Bio-Security Control', view: 'home', icon: <Fingerprint size={18} />, category: 'Security', description: 'Neural identity management and biometric vault.' },
  { label: 'About Doctorian', view: 'about', icon: <Info size={18} />, category: 'Info', description: 'Learn about our mission and technology.' },
  { label: 'Privacy Policy', view: 'privacy', icon: <Shield size={18} />, category: 'Legal', description: 'How we protect and manage your data.' },
  { label: 'Terms of Service', view: 'terms', icon: <FileText size={18} />, category: 'Legal', description: 'Our legal agreement and usage terms.' },
  { label: 'Fever & Chills', view: 'home', icon: <Thermometer size={18} />, category: 'Symptoms', description: 'Check symptoms related to high body temperature.', prompt: 'I have a fever and chills, what should I do?' },
  { label: 'Headache Relief', view: 'home', icon: <Brain size={18} />, category: 'Symptoms', description: 'Guidance for managing persistent headaches.', prompt: 'How can I relieve a severe headache?' },
  { label: 'Heart Health', view: 'home', icon: <Heart size={18} />, category: 'Wellness', description: 'Tips and monitoring for cardiovascular health.', prompt: 'Give me tips for maintaining a healthy heart.' },
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
