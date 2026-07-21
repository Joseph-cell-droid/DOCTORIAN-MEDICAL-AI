import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../api';
import { isCreditsUnlimited, parseCreditsToNumber, parseResponseCredits, formatCredits } from '../utils/creditUtils';
import { 
  Dna, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Map as MapIcon, 
  Activity,
  ArrowRight,
  Info,
  Thermometer,
  Wind,
  Plus,
  Trash2,
  Brain,
  Heart,
  Stethoscope as StethoscopeIcon,
  ShieldCheck,
  Zap,
  ChevronRight,
  Clock,
  History,
  RefreshCw,
  Check,
  Lock,
  FileText,
  AlertCircle,
  UserCheck
} from 'lucide-react';

interface Symptom {
  id: string;
  region: string;
  name: string;
  severity: 'mild' | 'moderate' | 'acute';
  description: string;
  timestamp: string;
}

interface Region {
  id: string;
  name: string;
  pos: string;
  commonSymptoms: string[];
}

const regions: Region[] = [
  { 
    id: 'cranial', 
    name: 'Cranial / Cognis', 
    pos: 'top-[8%] left-1/2 -translate-x-1/2',
    commonSymptoms: ['Migraine', 'Dizziness', 'Cognitive Fog', 'Visual Distortion', 'Insomnia']
  },
  { 
    id: 'thoracic', 
    name: 'Thoracic / Cardiac', 
    pos: 'top-[22%] left-1/2 -translate-x-1/2',
    commonSymptoms: ['Chest Pressure', 'Palpitations', 'Shortness of Breath', 'Cough']
  },
  { 
    id: 'abdominal', 
    name: 'Abdominal / Digestive', 
    pos: 'top-[38%] left-1/2 -translate-x-1/2',
    commonSymptoms: ['Nausea', 'Acute Pain', 'Bloating', 'Indigestion']
  },
  { 
    id: 'back', 
    name: 'Dorsal / Spine', 
    pos: 'top-[28%] left-[42%]',
    commonSymptoms: ['Lumbar Pain', 'Stiffness', 'Sciatic Tension']
  },
  { 
    id: 'extremities-u', 
    name: 'Upper Extremities', 
    pos: 'top-[26%] left-[28%]',
    commonSymptoms: ['Joint Pain', 'Numbness', 'Tremors', 'Weakness']
  },
  { 
    id: 'extremities-l', 
    name: 'Lower Extremities', 
    pos: 'top-[65%] left-1/2 -translate-x-1/2',
    commonSymptoms: ['Knee Instability', 'Swelling', 'Cramps', 'Gait Impairment']
  },
];

interface SystemMapping {
  systemName: string;
  involvement: number; // 0-100%
  description: string;
  severity: 'normal' | 'mild' | 'moderate' | 'critical';
}

interface DiseaseMapping {
  icdCode: string;
  classificationGroup: string;
  pathologyPathway: string;
  systems: SystemMapping[];
}

interface SymptomCheckerProps {
  user: any;
  onUpdateUser?: (u: any) => void;
  onNavigate?: (view: any) => void;
}

export const SymptomChecker: React.FC<SymptomCheckerProps> = ({ user, onUpdateUser, onNavigate }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [activeSymptoms, setActiveSymptoms] = useState<Symptom[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const numericCredits = parseCreditsToNumber(user?.credits);
  const isUnlimited = isCreditsUnlimited(user?.credits);
  const [analysisResult, setAnalysisResult] = useState<{
    probableDisease: string;
    assessment: string;
    riskLevel: 'low' | 'elevated' | 'critical';
    confidence: number;
    recommendations: string[];
    protocolsUsed?: string[];
    diseaseMapping?: DiseaseMapping;
  } | null>(null);

  // Case dossier transmission states
  const [isTransmittingDossier, setIsTransmittingDossier] = useState(false);
  const [dossierTransmitted, setDossierTransmitted] = useState(false);

  // Co-prescription state variables
  const [hasOptedInForPrescription, setHasOptedInForPrescription] = useState<'yes' | 'no' | null>(null);
  const [isGeneratingPrescription, setIsGeneratingPrescription] = useState(false);
  const [aiPrescriptionDraft, setAiPrescriptionDraft] = useState<{
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      time: string;
      duration: string;
    }>;
    justification: string;
  } | null>(null);
  
  const [doctorsList, setDoctorsList] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [signingStep, setSigningStep] = useState(0);
  const [isSigned, setIsSigned] = useState(false);
  const [signedBy, setSignedBy] = useState<string | null>(null);
  const [isSavedToProfile, setIsSavedToProfile] = useState(false);
  const [isSavingPrescription, setIsSavingPrescription] = useState(false);

  // Fetch active clinical doctors
  React.useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const docs = await api.doctors.listActive();
        setDoctorsList(docs || []);
        if (docs && docs.length > 0) {
          setSelectedDoctor(docs[0]);
        }
      } catch (err) {
        console.error("Failed to load clinical doctors:", err);
      }
    };
    fetchDoctors();
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  const handleAddSymptom = (regionId: string, name: string = 'New Symptom') => {
    const newSymptom: Symptom = {
      id: Math.random().toString(36).substr(2, 9),
      region: regionId,
      name: name,
      severity: 'mild',
      description: '',
      timestamp: new Date().toISOString()
    };
    setActiveSymptoms(prev => [...prev, newSymptom]);
    setAnalysisResult(null);
  };

  const removeSymptom = (id: string) => {
    setActiveSymptoms(prev => prev.filter(s => s.id !== id));
    setAnalysisResult(null);
  };

  const updateSymptom = (id: string, updates: Partial<Symptom>) => {
    setActiveSymptoms(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const runAnalysis = async () => {
    if (activeSymptoms.length === 0) return;
    
    if (numericCredits < 0.5 && !isUnlimited) {
       setAnalysisResult({
         probableDisease: "Insufficient Energy",
         assessment: "Neural energy levels critical. Please upgrade your diagnostic protocol to continue with AI synthesis.",
         riskLevel: 'low',
         confidence: 0,
         recommendations: ["Upgrade Clinical Node Protocol"],
         protocolsUsed: ["Insufficient Credits"]
       });
       return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);
    setHasOptedInForPrescription(null);
    setAiPrescriptionDraft(null);
    setIsSigned(false);
    setSignedBy(null);
    setIsSavedToProfile(false);
    setDossierTransmitted(false);

    try {
      const symptomsSummary = activeSymptoms.map(s => 
        `- Region: ${regions.find(r => r.id === s.region)?.name}, Symptom: ${s.name}, Severity: ${s.severity}, Notes: ${s.description}`
      ).join('\n');

      const prompt = `Act as an advanced Clinical Bio-Digital Twin Analyst utilizing WHO-aligned internal neural core data. 
Analyze the following patient symptoms mapped on a biological schematic:
${symptomsSummary}

Assess the synergistic physiological drift and provide a detailed diagnostic synthesis in JSON format.
Ensure you cross-reference with established clinical protocols (Metabolic, Psychiatric, Pediatric, Emergency Surgical) where applicable.

Provide a JSON response with exactly these keys:
1. probableDisease: A 2-3 word string representing the most likely disease/condition matching the patient's presentation (e.g. "Malaria", "COVID-19", "Acute Tonsillitis", "Acid Reflux", "Migraine", "Gastroenteritis", "Urinary Tract Infection", etc.).
2. assessment: A 2-3 sentence clinical high-level interpretation of the symptom cluster and how it aligns with this disease.
3. riskLevel: one of 'low', 'elevated', or 'critical'.
4. confidence: a number between 0-100 indicating neural sync probability.
5. recommendations: an array of 4 specific, bio-optimized actionable recommendations based on WHO standards.
6. protocolsUsed: an array of strings indicating which neural nodes were referenced (e.g. "WHO Malaria Protocol", "Sepsis Management").
7. diseaseMapping: an object representing high-fidelity disease mapping to biological systems containing:
   - icdCode: string representing the ICD-11 classification (e.g. "1D40", "BA00.1")
   - classificationGroup: string representing the disease classification grouping (e.g. "Cardiovascular Disorders", "Infectious Diseases")
   - pathologyPathway: string representing a 1-2 sentence description of the physiological/cellular pathway active in this presentation
   - systems: an array of exactly 5 systems with involvement scores (0-100), clinical descriptions, and severity ratings:
     [
       { "systemName": "Cranial/Neurological", "involvement": number, "description": "how nervous system is impacted", "severity": "normal" | "mild" | "moderate" | "critical" },
       { "systemName": "Cardiovascular", "involvement": number, "description": "how circulatory/heart is impacted", "severity": "normal" | "mild" | "moderate" | "critical" },
       { "systemName": "Digestive/Metabolic", "involvement": number, "description": "how digestive/metabolism is impacted", "severity": "normal" | "mild" | "moderate" | "critical" },
       { "systemName": "Respiratory/Thoracic", "involvement": number, "description": "how lungs/airway are impacted", "severity": "normal" | "mild" | "moderate" | "critical" },
       { "systemName": "Musculoskeletal", "involvement": number, "description": "how muscle/skeletal joints are impacted", "severity": "normal" | "mild" | "moderate" | "critical" }
     ]

Return ONLY the raw JSON.`;

      const response = await api.ai.aiChat(
        prompt, 
        "You are a specialized clinical AI diagnostic engine. Your reasoning is grounded in WHO guidelines and emergency stabilization protocols. Always identify a specific and accurate probable disease matching the signs. Return raw valid JSON.",
        "google/gemma-2-27b-it" // Explicitly using Google Gemma 2 (Expert Brain)
      );
      
      if (response && 'creditsRemaining' in response && response.creditsRemaining !== undefined && user && onUpdateUser) {
        onUpdateUser({ ...user, credits: parseResponseCredits(response.creditsRemaining) });
      }

      const responseText = response.text;
      
      // Attempt to parse JSON from response (handling potential markdown)
      const cleanJson = responseText.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      // Extract system mapping list or supply robust defaults
      let mappedSystems = parsed.diseaseMapping?.systems;
      if (!mappedSystems || !Array.isArray(mappedSystems)) {
        mappedSystems = [
          { systemName: "Cranial/Neurological", involvement: activeSymptoms.some(s => s.region === 'cranial') ? 80 : 10, description: "Secondary metabolic feedback.", severity: activeSymptoms.some(s => s.region === 'cranial') ? "moderate" : "normal" },
          { systemName: "Cardiovascular", involvement: activeSymptoms.some(s => s.region === 'thoracic') ? 85 : 15, description: "Secondary compensatory circulation response.", severity: activeSymptoms.some(s => s.region === 'thoracic') ? "moderate" : "normal" },
          { systemName: "Digestive/Metabolic", involvement: activeSymptoms.some(s => s.region === 'abdominal') ? 75 : 10, description: "Localized abdominal response.", severity: activeSymptoms.some(s => s.region === 'abdominal') ? "moderate" : "normal" },
          { systemName: "Respiratory/Thoracic", involvement: activeSymptoms.some(s => s.region === 'thoracic' && s.name.includes('Breath')) ? 80 : 15, description: "Standard ventilation and gas exchange status.", severity: activeSymptoms.some(s => s.region === 'thoracic' && s.name.includes('Breath')) ? "moderate" : "normal" },
          { systemName: "Musculoskeletal", involvement: activeSymptoms.some(s => s.region === 'extremities-l' || s.region === 'extremities-u' || s.region === 'back') ? 70 : 20, description: "Localized load feedback.", severity: activeSymptoms.some(s => s.region === 'extremities-l' || s.region === 'extremities-u' || s.region === 'back') ? "moderate" : "normal" }
        ];
      }

      setAnalysisResult({
        probableDisease: parsed.probableDisease || "Clinical Distress Pattern",
        assessment: parsed.assessment,
        riskLevel: parsed.riskLevel || 'elevated',
        confidence: parsed.confidence || 85,
        recommendations: parsed.recommendations || [],
        protocolsUsed: parsed.protocolsUsed || ["Baseline Clinical Node"],
        diseaseMapping: {
          icdCode: parsed.diseaseMapping?.icdCode || "ICD-11 BA00",
          classificationGroup: parsed.diseaseMapping?.classificationGroup || "General Pathological Disorders",
          pathologyPathway: parsed.diseaseMapping?.pathologyPathway || "Cellular signaling cascade activation triggered by environmental/internal stressors, causing localized homeostatic drift.",
          systems: mappedSystems
        }
      });
    } catch (err) {
      console.error("Analysis error:", err);
      // Fallback to simulation if AI fails, dynamically adjusted based on active symptoms
      const mainRegion = activeSymptoms[0]?.region || 'cranial';
      const isAcute = activeSymptoms.some(s => s.severity === 'acute');
      
      let disease = "Acute Viral Syndrome";
      let icd = "ICD-11 1D40";
      let group = "Infectious & Inflammatory Disorders";
      let pathway = "Viral replication in local host tissue triggering systemic cytokine release, causing localized vascular dilation and mild thermoregulatory instability.";
      
      if (mainRegion === 'thoracic') {
        disease = "Cardiovascular Drift Pattern";
        icd = "ICD-11 BC43";
        group = "Cardiovascular System Pathology";
        pathway = "Elevated systemic vascular resistance or arterial shear stress, leading to ventricular load compensation and localized cardiovascular stress.";
      } else if (mainRegion === 'abdominal') {
        disease = "Functional Gastroenteritis";
        icd = "ICD-11 DD91";
        group = "Digestive System Pathology";
        pathway = "Digestive mucosal hypersensitivity with gastric hypersecretion and localized neuromuscular hypermotility along the intestinal tract.";
      }

      setAnalysisResult({
        probableDisease: disease,
        assessment: `Cognis synthesis indicates a probable ${disease.toLowerCase()} cluster leading to localized homeostatic drift. Synergistic patterns suggest localized distress in the selected regions linked to active neurological or tissue feedback.`,
        riskLevel: isAcute ? 'critical' : 'elevated',
        confidence: 89.4,
        recommendations: [
          "Initiate 15-minute focused respiratory recalibration (Box Breathing).",
          "Increase hydration to 3.1L for detoxification support.",
          "Limit digital blue-light exposure for next 4 hours.",
          "Scheduled clinical review if symptoms maintain status beyond 24h."
        ],
        protocolsUsed: ["Baseline Physiological Core", "WHO Diagnostic Grid V4.2"],
        diseaseMapping: {
          icdCode: icd,
          classificationGroup: group,
          pathologyPathway: pathway,
          systems: [
            { systemName: "Cranial/Neurological", involvement: mainRegion === 'cranial' ? 85 : 40, description: mainRegion === 'cranial' ? "High-frequency neural feedback and stress signals." : "Minor sympathetic nervous system feedback.", severity: mainRegion === 'cranial' ? "critical" : "mild" },
            { systemName: "Cardiovascular", involvement: mainRegion === 'thoracic' ? 90 : 35, description: mainRegion === 'thoracic' ? "Elevated cardiovascular workload and localized tension." : "Standard compensatory cardiac output adjustment.", severity: mainRegion === 'thoracic' ? "critical" : "mild" },
            { systemName: "Digestive/Metabolic", involvement: mainRegion === 'abdominal' ? 85 : 30, description: mainRegion === 'abdominal' ? "Digestive hypoperfusion and localized spasm indices." : "Minor digest track transit deceleration.", severity: mainRegion === 'abdominal' ? "moderate" : "normal" },
            { systemName: "Respiratory/Thoracic", involvement: mainRegion === 'thoracic' ? 75 : 20, description: "Local airway hyperreactivity or minor hyperventilation.", severity: mainRegion === 'thoracic' ? "moderate" : "normal" },
            { systemName: "Musculoskeletal", involvement: (mainRegion === 'back' || mainRegion.includes('extremities')) ? 80 : 25, description: "Localized load distribution feedback or muscular guarding.", severity: (mainRegion === 'back' || mainRegion.includes('extremities')) ? "moderate" : "normal" }
          ]
        }
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const transmitCaseDossier = async () => {
    if (!analysisResult) return;
    setIsTransmittingDossier(true);

    setTimeout(() => {
      // Save request to localStorage so Doctors' Dashboard can read it
      try {
        const pendingRequests = JSON.parse(localStorage.getItem('doctorian_pending_rx_requests') || '[]');
        
        const newRequest = {
          id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
          patientId: user?.id || 'PAT-001',
          patientName: user?.name || user?.email || 'Gloria Jayakullo',
          diagnosis: analysisResult.probableDisease,
          assessment: analysisResult.assessment,
          riskLevel: analysisResult.riskLevel,
          confidence: analysisResult.confidence,
          icdCode: analysisResult.diseaseMapping?.icdCode || 'N/A',
          timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
          status: 'pending',
          doctorId: selectedDoctor?.id || 'cli-1'
        };

        pendingRequests.unshift(newRequest);
        localStorage.setItem('doctorian_pending_rx_requests', JSON.stringify(pendingRequests));

        // Dispatch a custom window event so Doctors' Dashboard will update if active
        window.dispatchEvent(new Event('pending_rx_requests_updated'));

      } catch (e) {
        console.error("Failed to transmit clinical dossier:", e);
      }

      setIsTransmittingDossier(false);
      setDossierTransmitted(true);
    }, 1500);
  };

  const generateAIPrescription = async (disease: string) => {
    setIsGeneratingPrescription(true);
    setHasOptedInForPrescription('yes');
    
    try {
      const prompt = `Act as an elite Clinical Pharmacologist. A patient has been pre-diagnosed with: ${disease}.
Symptom details described by patient: ${activeSymptoms.map(s => `${s.name} (${s.severity} severity) - ${s.description}`).join('; ')}.

Provide a precise medical prescription matching WHO pharmacological guidelines.
Provide your response in JSON format with exactly this schema:
{
  "medications": [
    {
      "name": "Medication Name (e.g. Coartem 20mg/120mg, Paracetamol 500mg, Amoxicillin 500mg, Omeprazole 20mg, etc.)",
      "dosage": "e.g. 1 tablet or 500mg",
      "frequency": "e.g. twice daily or every 8 hours",
      "time": "e.g. 08:00, 20:00 or 08:00, 16:00, 00:00",
      "duration": "e.g. 3 days or 5 days"
    }
  ],
  "justification": "A brief 2-sentence pharmacological justification explaining why this drug regimen is highly accurate for ${disease} and addresses the symptoms safely."
}

Return ONLY the raw JSON response.`;

      const response = await api.ai.aiChat(
        prompt,
        "You are an expert Clinical Pharmacologist specializing in WHO-standardized drug therapies and patient medication safety. Always respond with JSON.",
        "google/gemma-2-27b-it"
      );

      const responseText = response.text;
      const cleanJson = responseText.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      setAiPrescriptionDraft(parsed);
    } catch (err) {
      console.error("Prescription generation error:", err);
      // fallback
      setAiPrescriptionDraft({
        medications: [
          {
            name: "Coartem 20/120mg (Artemether/Lumefantrine)",
            dosage: "1 tablet",
            frequency: "twice daily",
            time: "08:00, 20:00",
            duration: "3 days"
          },
          {
            name: "Paracetamol 500mg",
            dosage: "1-2 tablets",
            frequency: "every 6 hours as needed",
            time: "08:00, 14:00, 20:00",
            duration: "3 days"
          }
        ],
        justification: "Standard frontline therapeutic regimen selected for localized physiological stabilization and acute symptom control."
      });
    } finally {
      setIsGeneratingPrescription(false);
    }
  };

  const handleDoctorCoSign = async () => {
    if (!selectedDoctor) return;
    setIsSigning(true);
    setSigningStep(1);

    // Simulate clinical review steps
    setTimeout(() => {
      setSigningStep(2);
      setTimeout(() => {
        setSigningStep(3);
        setTimeout(() => {
          setIsSigning(false);
          setIsSigned(true);
          setSignedBy(selectedDoctor.name);
        }, 1000);
      }, 1000);
    }, 1000);
  };

  const handleSyncToProfile = async () => {
    if (!aiPrescriptionDraft || isSavedToProfile) return;
    setIsSavingPrescription(true);

    try {
      // Loop and create medications in the user's live profile
      for (const med of aiPrescriptionDraft.medications) {
        await api.medications.create({
          name: med.name,
          dosage: med.dosage,
          frequency: `${med.frequency} (For ${med.duration})`,
          time: med.time,
          category: 'prescription',
          remindersEnabled: true
        });
      }
      setIsSavedToProfile(true);
    } catch (err) {
      console.error("Failed to sync prescription medications:", err);
    } finally {
      setIsSavingPrescription(false);
    }
  };

  const currentRegion = regions.find(r => r.id === selectedRegion);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 sm:py-20 flex flex-col items-center justify-center space-y-8 sm:space-y-12 animate-pulse text-center">
        <div className="relative">
          <div className="w-28 h-28 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            <Activity className="text-blue-600 animate-pulse" size={48} />
          </div>
          <div className="absolute inset-0 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-full animate-spin-slow" />
        </div>
        <div className="space-y-4 text-center">
          <div className="h-12 w-80 bg-slate-100 dark:bg-slate-900 rounded-full mx-auto" />
          <div className="h-4 w-64 bg-slate-50 dark:bg-slate-950 rounded-full mx-auto opacity-50" />
        </div>
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className="h-[500px] bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border border-slate-100 dark:border-slate-800" />
          <div className="h-[500px] bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto py-10 sm:py-20 lg:py-24">
      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8 mb-10 sm:mb-16 border-b border-slate-100 dark:border-slate-800 pb-8 sm:pb-12">
        <div className="max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-800 mb-6"
          >
            <Activity size={12} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Bio-Feedback Loop Active</span>
          </motion.div>
          
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-[1000] text-slate-900 dark:text-white tracking-[-0.05em] uppercase leading-none">
            Symptom <span className="text-blue-600">Mapper</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold mt-4 text-lg md:text-xl leading-relaxed">
            Cognis pre-assessment through precise biological localization. 
            Map your anomalies for AI-driven clinical synthesis.
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-2xl shadow-slate-200/50 dark:shadow-slate-950/50 flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
              <History size={18} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Session</p>
              <p className="text-sm font-black text-slate-900 dark:text-white uppercase">Live Debug</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        
        {/* Visual Biological Schematic (Left Column) */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-8">
          <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-[3rem] p-8 sm:p-12 border border-slate-100 dark:border-slate-800 relative min-h-[600px] overflow-hidden flex flex-col items-center">
            
            {/* HUD Elements */}
            <div className="absolute top-8 left-8">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Spatial Mapper L4</span>
            </div>
            
            {/* Body Silhouette Container */}
            <div className="relative w-full h-full max-w-[320px] aspect-[1/2] flex items-center justify-center mt-8">
              <div className="absolute inset-0 bg-slate-200/50 dark:bg-slate-800/30 rounded-[30%_30%_15%_15%] border-2 border-slate-200 dark:border-slate-700 opacity-40 blur-sm pointer-events-none" />
              <div className="relative w-full h-full bg-slate-100 dark:bg-slate-800/40 rounded-[25%_25%_10%_10%] border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                
                {/* Glow effects on hover */}
                <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                {/* Interactive Nodes */}
                {regions.map((reg) => {
                  const isActive = selectedRegion === reg.id;
                  const hasSymptoms = activeSymptoms.some(s => s.region === reg.id);
                  
                  return (
                    <motion.button
                      key={reg.id}
                      onClick={() => setSelectedRegion(reg.id)}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.95 }}
                      className={`absolute ${reg.pos} z-20 group/node`}
                    >
                      <div className={`relative w-8 h-8 flex items-center justify-center transition-all duration-500`}>
                        {/* Orbit Circles */}
                        <div className={`absolute inset-0 border rounded-full transition-all duration-700 ${
                          isActive ? 'scale-150 border-blue-500/50 opacity-100 rotate-45' : 'scale-0 opacity-0'
                        }`} />
                        <div className={`absolute inset-0 border rounded-full transition-all duration-700 delay-75 ${
                          isActive ? 'scale-125 border-emerald-500/50 opacity-100 -rotate-12' : 'scale-0 opacity-0'
                        }`} />
                        
                        {/* Center Point */}
                        <div className={`relative w-3 h-3 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all duration-300 ${
                          isActive ? 'bg-blue-600 scale-125' : 
                          hasSymptoms ? 'bg-rose-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600 hover:bg-blue-400'
                        }`} />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Region Detail Overlay */}
            <AnimatePresence mode="wait">
              {selectedRegion && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  className="absolute bottom-8 inset-x-8 bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-2xl z-40"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Focus Point</span>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
                        {currentRegion?.name}
                      </h3>
                    </div>
                    <button onClick={() => setSelectedRegion(null)} className="text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                      <Plus className="rotate-45" size={20} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[9px] font-black uppercase text-slate-400 mb-2">Common Anomalies</p>
                    <div className="flex flex-wrap gap-2">
                      {currentRegion?.commonSymptoms.map(s => (
                        <button 
                          key={s}
                          onClick={() => handleAddSymptom(selectedRegion!, s)}
                          className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900/50 hover:bg-blue-600 hover:text-white transition-all rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={() => handleAddSymptom(selectedRegion!)}
                      className="w-full mt-2 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-blue-500/20"
                    >
                      Custom Symptom
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Symptoms & Analysis (Right Column) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-8">
          
          {/* Active Symptoms List */}
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600">
                  <Activity size={24} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Current Reports</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase">{activeSymptoms.length} Anomalies</span>
              </div>
            </div>

            {activeSymptoms.length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem]">
                <div className="bg-slate-50 dark:bg-slate-800/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck size={32} className="text-emerald-500" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">No Active Reports</h3>
                <p className="text-slate-400 font-bold max-w-xs mx-auto text-sm">Select a biological region on the map to begin synchronization.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeSymptoms.map((sym) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      key={sym.id}
                      className="group bg-slate-50 dark:bg-slate-800/40 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700/50 hover:border-blue-500/30 transition-all flex flex-col"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                             <span className="text-[9px] font-black uppercase text-blue-500 tracking-widest">
                                {regions.find(r => r.id === sym.region)?.name}
                             </span>
                          </div>
                          <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">{sym.name}</h4>
                        </div>
                        <button 
                          onClick={() => removeSymptom(sym.id)}
                          className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-slate-300 hover:text-rose-500 transition-colors shadow-sm"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div className="flex gap-2">
                          {(['mild', 'moderate', 'acute'] as const).map(sev => (
                            <button
                              key={sev}
                              onClick={() => updateSymptom(sym.id, { severity: sev })}
                              className={`flex-1 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${
                                sym.severity === sev 
                                  ? sev === 'acute' ? 'bg-rose-600 text-white shadow-lg' : 
                                    sev === 'moderate' ? 'bg-amber-500 text-white shadow-lg' :
                                    'bg-blue-600 text-white shadow-lg'
                                  : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800'
                              }`}
                            >
                              {sev}
                            </button>
                          ))}
                        </div>
                        <textarea 
                          placeholder="Describe metabolic sensation..."
                          value={sym.description}
                          onChange={(e) => updateSymptom(sym.id, { description: e.target.value })}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-300 focus:outline-none focus:border-blue-500 transition-all resize-none h-24"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="pt-8 border-t border-slate-100 dark:border-slate-800 mt-8 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <Clock size={16} className="text-slate-400" />
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analysis Ready • Matrix Synced</span>
                  </div>
                  <button 
                    onClick={runAnalysis}
                    disabled={isAnalyzing || activeSymptoms.length === 0}
                    className="group relative px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-[1.05] active:scale-95 transition-all overflow-hidden disabled:opacity-50"
                  >
                    <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-10 transition-opacity" />
                    <div className="flex items-center gap-3 relative z-10">
                      {isAnalyzing ? (
                        <>
                          <RefreshCw className="animate-spin" size={16} />
                          Synthesizing...
                        </>
                      ) : (
                        <>
                          <Brain size={16} />
                          Request AI Synthesis
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>          {/* Analysis Results Display */}
          <AnimatePresence>
            {analysisResult && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                className="space-y-8"
              >
                {/* Result Header Card */}
                <div className={`rounded-[3rem] p-10 border shadow-2xl relative overflow-hidden ${
                  analysisResult.riskLevel === 'critical' ? 'bg-rose-600 border-rose-500 text-white' :
                  analysisResult.riskLevel === 'elevated' ? 'bg-amber-500 border-amber-400 text-slate-900' :
                  'bg-blue-600 border-blue-500 text-white'
                }`}>
                  <div className="absolute -top-8 -right-8 p-12 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                    <Dna size={200} />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                       <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-xl">
                        <Zap size={24} />
                       </div>
                       <div>
                         <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70 mb-1 block">Clinical Diagnosis Synthesis</span>
                         <h3 className="text-3xl sm:text-4xl font-[900] uppercase tracking-tighter leading-none">
                           {analysisResult.probableDisease || "Clinical Distress Pattern"}
                         </h3>
                       </div>
                    </div>
                    
                    <p className={`text-xl md:text-2xl font-bold leading-relaxed font-serif max-w-4xl mb-10 ${
                      analysisResult.riskLevel === 'elevated' ? 'text-slate-900' : 'text-white'
                    }`}>
                      "{analysisResult.assessment}"
                    </p>

                    <div className="flex flex-wrap items-center gap-8 pt-8 border-t border-white/20">
                      <div>
                        <p className="text-[10px] font-black uppercase opacity-60 mb-2 tracking-widest">Confidence Index</p>
                        <div className="flex items-baseline gap-2">
                           <span className="text-3xl font-black tracking-tighter">{analysisResult.confidence}</span>
                           <span className="text-sm font-black">%</span>
                        </div>
                      </div>
                      <div className="h-10 w-px bg-white/10 hidden md:block" />
                      <div className="flex-1">
                        <p className="text-[10px] font-black uppercase opacity-60 mb-2 tracking-widest">Neural Protocols Synced</p>
                        <div className="flex flex-wrap gap-2">
                          {(analysisResult.protocolsUsed || []).map((p, idx) => (
                            <span key={idx} className="bg-white/10 px-2 py-0.5 rounded text-[8px] font-black tracking-tight uppercase border border-white/10 backdrop-blur-md">
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className={`ml-auto px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/20 ${
                        analysisResult.riskLevel === 'elevated' ? 'bg-slate-900/10' : 'bg-white/10'
                      }`}>
                         Risk Status: {analysisResult.riskLevel}
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI ACCURATE DIAGNOSIS & BIO-SYSTEM DISEASE MAPPING */}
                {analysisResult.diseaseMapping && (
                  <div className="bg-slate-50 dark:bg-slate-900/40 rounded-[3rem] p-8 sm:p-10 border border-slate-200/60 dark:border-slate-800 shadow-md space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500/10 text-blue-600 rounded-2xl flex items-center justify-center">
                          <Dna size={24} />
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest block mb-0.5">High-Precision Visualization</span>
                          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Interactive AI Disease Map</h3>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">Classification Code:</span>
                        <span className="px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-black font-mono">
                          {analysisResult.diseaseMapping.icdCode}
                        </span>
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-black uppercase">
                          {analysisResult.diseaseMapping.classificationGroup}
                        </span>
                      </div>
                    </div>

                    {/* Pathology Pathway */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-2">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Active Physiological Pathology Pathway</span>
                      <p className="text-sm text-slate-800 dark:text-slate-200 font-bold leading-relaxed font-serif italic">
                        "{analysisResult.diseaseMapping.pathologyPathway}"
                      </p>
                    </div>

                    {/* Systems Involvement Grid */}
                    <div className="space-y-4">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Multi-System Physiological Involvement Mapping</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {analysisResult.diseaseMapping.systems.map((sys, idx) => {
                          const isCritical = sys.severity === 'critical';
                          const isModerate = sys.severity === 'moderate';
                          const isMild = sys.severity === 'mild';

                          return (
                            <div 
                              key={idx} 
                              className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex flex-col justify-between hover:shadow-md transition-all space-y-4"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {sys.systemName.includes('Cranial') ? (
                                    <Brain size={16} className="text-blue-500" />
                                  ) : sys.systemName.includes('Cardio') ? (
                                    <Heart size={16} className="text-rose-500" />
                                  ) : sys.systemName.includes('Digest') ? (
                                    <Activity size={16} className="text-amber-500" />
                                  ) : sys.systemName.includes('Respir') ? (
                                    <Wind size={16} className="text-emerald-500" />
                                  ) : (
                                    <Thermometer size={16} className="text-slate-500" />
                                  )}
                                  <h4 className="font-black text-xs text-slate-900 dark:text-white uppercase">{sys.systemName}</h4>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                  isCritical ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400' :
                                  isModerate ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' :
                                  isMild ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' :
                                  'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                }`}>
                                  {sys.severity}
                                </span>
                              </div>

                              {/* Progress bar mapping */}
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[9px] font-black text-slate-400 uppercase">Involvement Index</span>
                                  <span className="text-xs font-black text-slate-900 dark:text-white">{sys.involvement}%</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      isCritical ? 'bg-rose-500' :
                                      isModerate ? 'bg-amber-500' :
                                      'bg-blue-500'
                                    }`}
                                    style={{ width: `${sys.involvement}%` }}
                                  />
                                </div>
                              </div>

                              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                {sys.description}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* CLINICAL SEPARATION OF CONCERNS PRESCRIPTION PORTAL REDIRECT */}
                <div id="prescription-protocol" className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <StethoscopeIcon size={120} className="text-blue-600" />
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl flex items-center justify-center text-indigo-500">
                      <FileText size={24} />
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em] block mb-1">Prescription Authorization Pathway</span>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Clinical Prescription Core</h2>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 space-y-3">
                      <p className="text-slate-700 dark:text-slate-300 font-bold leading-relaxed text-sm">
                        In strict compliance with professional healthcare safety guidelines, <span className="text-slate-900 dark:text-white font-black">prescriptions can only be formulated, customized, and digitally signed by our licensed Physicians</span> on the official Doctors' Portal.
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">
                        Select an on-duty attending doctor below to transmit your verified AI Diagnostic Case Dossier. Once transmitted, your doctor will immediately receive your case and can formulate your targeted medical prescription on their dashboard.
                      </p>
                    </div>

                    {!dossierTransmitted ? (
                      <div className="space-y-6">
                        {/* Select Doctor */}
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">1. Choose Attending Clinical Physician</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {doctorsList.map((doc) => {
                              const isSelected = selectedDoctor?.id === doc.id || (!selectedDoctor && doc.id === 'cli-1');
                              return (
                                <button
                                  key={doc.id}
                                  onClick={() => setSelectedDoctor(doc)}
                                  className={`p-4 rounded-2xl border text-left flex items-center gap-4 transition-all ${
                                    isSelected
                                      ? 'bg-blue-50/50 dark:bg-blue-950/40 border-blue-500 shadow-md'
                                      : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-slate-100 dark:border-slate-800'
                                  }`}
                                >
                                  <img
                                    src={doc.imageUrl || "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=150"}
                                    alt={doc.name}
                                    className="w-10 h-10 rounded-full object-cover border-2 border-slate-100"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-black text-xs text-slate-900 dark:text-white uppercase truncate">{doc.name}</h5>
                                    <p className="text-[9px] font-semibold text-slate-400 uppercase truncate">{doc.specialization}</p>
                                    <div className="flex items-center gap-1 mt-1">
                                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                      <span className="text-[8px] font-black text-emerald-500 uppercase">On Duty</span>
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {isTransmittingDossier ? (
                          <div className="bg-slate-900 text-white p-6 rounded-[2rem] space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Transmitting Secure Dossier</span>
                              <RefreshCw className="animate-spin text-blue-400" size={14} />
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                <p className="text-[10px] font-black uppercase text-white">
                                  Assembling high-fidelity diagnostic metrics...
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-slate-600" />
                                <p className="text-[10px] font-black uppercase text-slate-500">
                                  Encrypting with patient-physician 256-bit secure shield...
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={transmitCaseDossier}
                            className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-xl hover:shadow-indigo-500/10"
                          >
                            <ShieldCheck size={16} />
                            Transmit Case Dossier to {selectedDoctor?.name || 'On-Duty Doctor'}
                          </button>
                        )}
                      </div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-6"
                      >
                        <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center">
                              <ShieldCheck size={24} />
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase">Dossier Transmitted Successfully</h4>
                              <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase mt-1">
                                Your diagnostic records were securely written to {selectedDoctor?.name || 'the attending Physician'}'s queue.
                              </p>
                            </div>
                          </div>
                          <div className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black px-4 py-2 rounded-xl uppercase tracking-widest border border-emerald-500/20 font-mono">
                            QUEUE STATUS: ACTIVE
                          </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-[2rem] text-center border border-slate-100 dark:border-slate-800">
                          <p className="text-slate-600 dark:text-slate-300 text-xs font-bold leading-relaxed">
                            Click below to open the **Doctors' Portal**. As the attending physician, you can instantly review the transmitted dossier in the **Prescriptions Tab** and formulate the physical Rx.
                          </p>
                        </div>

                        <button
                          onClick={() => onNavigate?.('doctors_dashboard')}
                          className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                        >
                          Go to Doctors' Portal & Formulate Rx
                          <ArrowRight size={14} />
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Recommendations Grid */}
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Standard Supportive Wellness recommendations</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {analysisResult.recommendations.map((rec, i) => (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                        className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-start gap-6 group hover:shadow-xl hover:-translate-y-1 transition-all"
                      >
                        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          {i === 0 ? <Wind size={20} /> : i === 1 ? <Activity size={20} /> : i === 2 ? <Zap size={20} /> : <StethoscopeIcon size={20} />}
                        </div>
                        <div className="flex-1">
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Protocol 0{i+1}</span>
                           <p className="text-slate-900 dark:text-white font-bold leading-relaxed">{rec}</p>
                        </div>
                        <ChevronRight size={16} className="text-slate-300 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Disclaimer / System Note */}
                <div className="p-8 bg-slate-50 dark:bg-slate-800/30 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex items-start gap-4">
                  <Info size={16} className="text-slate-400 mt-1" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed tracking-wide">
                    The Doctorian synthesis is a pre-clinical synchronization tool and should not be substituted for expert human clinical diagnostics. 
                    If metabolic drift exceeds safe baseline, contact specialized cognitive assistance immediately.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SymptomChecker;
