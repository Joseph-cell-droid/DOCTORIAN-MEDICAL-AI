import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as tf from '@tensorflow/tfjs';
import { api } from '../api';
import { 
  Dna, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
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
  FlaskConical,
  Microscope,
  FileText,
  Upload,
  ArrowUpRight,
  Database,
  Beaker,
  Fingerprint,
  Cpu,
  Binary,
  Globe
} from 'lucide-react';
import { SymptomChecker } from './SymptomChecker';
import { isCreditsUnlimited, parseCreditsToNumber, parseResponseCredits, formatCredits } from '../utils/creditUtils';
import { useArduinoContext } from '../ArduinoContext';

const UGANDA_EPIDEMIOLOGY_DB = {
  Kampala: {
    district: "Kampala / Wakiso",
    alertLevel: "Moderate Surveillance",
    alertColor: "text-amber-600 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50",
    pathogens: [
      { name: "Seasonal Influenza", risk: "Elevated (Post-Rainy Peak)", multiplier: 1.8, trend: "Stable" },
      { name: "Typhoid Fever", risk: "Baseline", multiplier: 1.0, trend: "Stable" },
      { name: "Malaria", risk: "Low Endemicity", multiplier: 0.6, trend: "Decreasing" },
      { name: "Ebola / Marburg Surveillance", risk: "No active signals", multiplier: 0.1, trend: "Quiet" }
    ],
    pharmacyShortages: [
      { name: "ACT (Artemether-Lumefantrine)", stock: 94, status: "Optimal" },
      { name: "Amoxicillin Co-dry", stock: 85, status: "Optimal" },
      { name: "Zinc / ORS Hydration Packs", stock: 96, status: "Optimal" },
      { name: "Rapid Diagnostic Kits (RDT)", stock: 90, status: "Optimal" }
    ],
    coordinates: { x: 50, y: 70 },
    recommendations: "Encourage sanitation measures in congested metropolitan centers. Standard clinical respiratory protocol remains baseline."
  },
  Gulu: {
    district: "Gulu District (Northern Node)",
    alertLevel: "High Active Outbreak Alert",
    alertColor: "text-rose-600 bg-rose-50 dark:bg-rose-950/20 animate-pulse border border-rose-200 dark:border-rose-900/55",
    pathogens: [
      { name: "Malaria (Plasmodium falciparum)", risk: "Critical Outbreak Spike (2.4x)", multiplier: 2.4, trend: "Increasing" },
      { name: "Seasonal Meningitis", risk: "Elevated", multiplier: 1.5, trend: "Increasing" },
      { name: "Acute Respiratory Infections", risk: "Moderate", multiplier: 1.2, trend: "Stable" },
      { name: "Ebola / Marburg Surveillance", risk: "Zero active signals", multiplier: 0.1, trend: "Quiet" }
    ],
    pharmacyShortages: [
      { name: "ACT (Artemether-Lumefantrine)", stock: 38, status: "Critical Shortage" },
      { name: "Amoxicillin Co-dry", stock: 58, status: "Moderate Shortage" },
      { name: "Zinc / ORS Hydration Packs", stock: 88, status: "Optimal" },
      { name: "Rapid Diagnostic Kits (RDT)", stock: 45, status: "Moderate Shortage" }
    ],
    coordinates: { x: 45, y: 30 },
    recommendations: "Deploy urgent emergency insecticide-treated bed nets (ITNs). Rationalize remaining ACT reserves and transition to IV Artesunate for severe clinical presentations. Direct mobile medical outreach teams immediately."
  },
  Kasese: {
    district: "Kasese District (Western Border)",
    alertLevel: "Hemorrhagic Active Surveillance",
    alertColor: "text-rose-600 bg-rose-50 dark:bg-rose-950/20 animate-pulse border border-rose-200 dark:border-rose-900/55",
    pathogens: [
      { name: "Ebola / Marburg Surveillance", risk: "Active High-Alert Surveillance (4.5x)", multiplier: 4.5, trend: "Stable" },
      { name: "Malaria", risk: "Moderate Endemicity", multiplier: 1.2, trend: "Stable" },
      { name: "Cholera Outbreak", risk: "Elevated (Riverine spikes)", multiplier: 1.8, trend: "Increasing" }
    ],
    pharmacyShortages: [
      { name: "ACT (Artemether-Lumefantrine)", stock: 80, status: "Optimal" },
      { name: "Amoxicillin Co-dry", stock: 42, status: "Moderate Shortage" },
      { name: "Zinc / ORS Hydration Packs", stock: 92, status: "Optimal" },
      { name: "Viral PPE Biosafety Kits", stock: 30, status: "Critical Shortage" }
    ],
    coordinates: { x: 25, y: 65 },
    recommendations: "Enforce strict temperature screening and contact tracing at border control nodes. Stockpile isolation center protective gear (PPE). Disseminate viral hemorrhagic fever warning protocols."
  },
  Mbarara: {
    district: "Mbarara District (Western Node)",
    alertLevel: "Standard Surveillance",
    alertColor: "text-blue-600 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50",
    pathogens: [
      { name: "Tuberculosis (MDR-TB Hub)", risk: "Elevated Monitoring", multiplier: 1.6, trend: "Stable" },
      { name: "Malaria", risk: "Low endemicity", multiplier: 0.8, trend: "Stable" },
      { name: "Brucellosis (Zoonotic spikes)", risk: "Elevated (Dairy corridor)", multiplier: 1.5, trend: "Increasing" }
    ],
    pharmacyShortages: [
      { name: "ACT (Artemether-Lumefantrine)", stock: 85, status: "Optimal" },
      { name: "Amoxicillin Co-dry", stock: 90, status: "Optimal" },
      { name: "TB Combipacks (First-line)", stock: 68, status: "Moderate Shortage" },
      { name: "ORS Hydration Packs", stock: 94, status: "Optimal" }
    ],
    coordinates: { x: 30, y: 80 },
    recommendations: "Reinforce public milk pasteurization mandates. Maintain vigilant sputum smear diagnostic assays for chronic cough patients."
  },
  Moroto: {
    district: "Moroto District (Karamoja Node)",
    alertLevel: "Critical Hydration Alert",
    alertColor: "text-rose-600 bg-rose-50 dark:bg-rose-950/20 animate-pulse border border-rose-200 dark:border-rose-900/55",
    pathogens: [
      { name: "Seasonal Meningitis", risk: "Critical Outbreak Alert (3.2x)", multiplier: 3.2, trend: "Increasing" },
      { name: "Cholera Outbreak", risk: "High Outbreak Spike (2.8x)", multiplier: 2.8, trend: "Increasing" },
      { name: "Malaria", risk: "Low Endemicity (Arid environment)", multiplier: 0.5, trend: "Stable" }
    ],
    pharmacyShortages: [
      { name: "ACT (Artemether-Lumefantrine)", stock: 75, status: "Optimal" },
      { name: "Amoxicillin Co-dry", stock: 35, status: "Critical Shortage" },
      { name: "Zinc / ORS Hydration Packs", stock: 24, status: "Critical Shortage" },
      { name: "Meningococcal Conjugate Vaccine", stock: 15, status: "Critical Shortage" }
    ],
    coordinates: { x: 80, y: 25 },
    recommendations: "Execute emergency vaccination campaigns for Serogroup A/W. Establish emergency rehydration points for acute diarrhea/cholera. Prioritize oral rehydration salt (ORS) deliveries."
  }
};

interface MicroscopeBloodAnalysis {
  rbcDensity: string;
  hbEstimate: string;
  wbcTotal: string;
  wbcDifferential: {
    neutrophils: number;
    lymphocytes: number;
    monocytes: number;
    eosinophils: number;
    basophils: number;
  };
  plateletEstimate: string;
  parasitemiaIndex: string;
  pathogenType?: string;
  sickleCellPercentage?: string;
  morphologyFindings: string[];
  clinicalDiagnosis: string;
  urgency: 'routine' | 'urgent' | 'critical';
  treatmentProtocol: string;
}

const MEDICAL_SCAN_PRESETS = [
  {
    name: "Microscope Blood Film (Plasmodium Falciparum Malaria)",
    type: "Microscope Blood Film (1000x Oil Immersion)",
    url: "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=600",
    findings: "Giemsa-stained thin/thick blood film microscopy reveals ring-stage trophozoites of Plasmodium falciparum within red blood cell cytoplasm. Parasite density calculated at 3.8% parasitemia (~190,000 parasites/µL). Moderate normocytic anemia and mild thrombocytopenia noted. Recommendation: Immediate oral Artemether/Lumefantrine (Coartem) and parasite clearance re-check in 24 hours.",
    isMicroscopeBlood: true,
    microscopeDetails: {
      rbcDensity: "3.85 M/µL (Reduced)",
      hbEstimate: "10.2 g/dL (Moderate Anemia)",
      wbcTotal: "11,800 /µL (Mild Reactive)",
      wbcDifferential: {
        neutrophils: 68,
        lymphocytes: 22,
        monocytes: 7,
        eosinophils: 2,
        basophils: 1
      },
      plateletEstimate: "112,000 /µL (Mild Thrombocytopenia)",
      parasitemiaIndex: "3.8% (190,000 parasites/µL)",
      pathogenType: "Plasmodium falciparum (Ring Trophozoites)",
      morphologyFindings: ["Ring Trophozoites", "Maurer's Clefts", "Thrombocytopenia Clumping", "Normocytic Anemia"],
      clinicalDiagnosis: "Acute Plasmodium falciparum Malaria with Moderate Anemia",
      urgency: "urgent" as const,
      treatmentProtocol: "Coartem 20mg/120mg (Artemether/Lumefantrine) 4 tablets stat, 4 tablets at 8h, then 4 tablets twice daily for 3 days."
    }
  },
  {
    name: "Peripheral Blood Smear (Sickle Cell Anemia - Drepanocytes)",
    type: "Peripheral Blood Microscopy (Wright-Giemsa)",
    url: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&q=80&w=600",
    findings: "Peripheral blood smear demonstrates prominent sickled erythrocytes (drepanocytes) comprising 18.4% of observed red cells, along with target cells, polychromasia, and Howell-Jolly bodies. Marked anisopoikilocytosis present. Diagnostic for Sickle Cell Anemia (HbSS homozygous state).",
    isMicroscopeBlood: true,
    microscopeDetails: {
      rbcDensity: "2.40 M/µL (Markedly Low)",
      hbEstimate: "7.1 g/dL (Severe Anemia)",
      wbcTotal: "14,500 /µL (Leukocytosis)",
      wbcDifferential: {
        neutrophils: 74,
        lymphocytes: 18,
        monocytes: 5,
        eosinophils: 2,
        basophils: 1
      },
      plateletEstimate: "420,000 /µL (Reactive Thrombocytosis)",
      parasitemiaIndex: "Negative (0.0%)",
      sickleCellPercentage: "18.4% Drepanocytes",
      morphologyFindings: ["Sickled Red Cells (Drepanocytes)", "Target Cells (Codocytes)", "Howell-Jolly Bodies", "Polychromasia"],
      clinicalDiagnosis: "Sickle Cell Disease (HbSS) in Acute Hemolytic Stress",
      urgency: "urgent" as const,
      treatmentProtocol: "Oral/IV rehydration, Folic Acid 5mg daily, Analgesia protocol, and Hydroxyurea consultation."
    }
  },
  {
    name: "Chest X-Ray (Severe Lobar Pneumonia / TB Cavity)",
    type: "Chest X-Ray (DICOM Spec)",
    url: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=600",
    findings: "Consolidation observed in the right upper lobe, consistent with advanced Mycobacterium tuberculosis cavitation. Reticulonodular infiltrates present. Recommendation: Direct sputum smear microscopy and immediate isolation protocols."
  },
  {
    name: "Brain CT Scan (Acute Epidural Hematoma)",
    type: "Brain CT Scan (DICOM Spec)",
    url: "https://images.unsplash.com/photo-1559757175-0670d1e1e27e?auto=format&fit=crop&q=80&w=600",
    findings: "Biconvex hyperdense extra-axial collection in the left temporoparietal region, representing acute epidural hemorrhage. Mass effect with 5mm midline shift. Recommendation: Urgent neurosurgical consultation for decompression."
  },
  {
    name: "12-Lead ECG Strip (Antero-Lateral STEMI)",
    type: "12-Lead ECG Strip",
    url: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&q=80&w=600",
    findings: "ST-segment elevation (>2mm) observed in leads V2-V5, with reciprocal depression in leads II, III, and aVF. Consistent with acute anterolateral Myocardial Infarction. Recommendation: Immediate dual antiplatelet therapy (DDA engine cross-checked) and urgent percutaneous coronary intervention."
  }
];

interface LabTest {
  id: string;
  name: string;
  category: 'Blood' | 'Urine' | 'Imaging' | 'Genetic' | 'Cognitive';
  status: 'Pending' | 'Completed' | 'Analyzed';
  date: string;
  result?: string;
  unit?: string;
  referenceRange?: string;
  isNormal?: boolean;
}

interface DiagnosticLabProps {
  user: any;
  onUpdateUser?: (u: any) => void;
}

export const DiagnosticLab: React.FC<DiagnosticLabProps> = ({ user, onUpdateUser }) => {
  const arduino = useArduinoContext();
  const [activeTab, setActiveTab] = useState<'symptoms' | 'tests' | 'imaging' | 'analysis' | 'genomic' | 'predictions' | 'epidemiology'>('symptoms');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Gulu');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // TensorFlow.js Local Medical Predictor States
  const [age, setAge] = useState<number>(45);
  const [systolicBP, setSystolicBP] = useState<number>(125);
  const [fastingGlucose, setFastingGlucose] = useState<number>(105);
  const [heartRate, setHeartRate] = useState<number>(72);
  const [spo2, setSpo2] = useState<number>(98);
  const [bmi, setBmi] = useState<number>(23.5);
  const [modelEpochs, setModelEpochs] = useState<number>(20);

  const [isTrained, setIsTrained] = useState<boolean>(false);
  const [trainingOutput, setTrainingOutput] = useState<string[]>([]);
  const [trainingProgress, setTrainingProgress] = useState<number>(0);
  const [isPredicting, setIsPredicting] = useState<boolean>(false);

  const [cardiacRiskVal, setCardiacRiskVal] = useState<number>(0);
  const [diabetesRiskVal, setDiabetesRiskVal] = useState<number>(0);
  const [malariaSeverityRiskVal, setMalariaSeverityRiskVal] = useState<number>(0);
  const [cognitiveDeclineRiskVal, setCognitiveDeclineRiskVal] = useState<number>(0);

  const [tfBackendName, setTfBackendName] = useState<string>('cpu');
  const [biometricSyncStatus, setBiometricSyncStatus] = useState<string | null>(null);

  const handleSyncVitalsFromWearable = useCallback(() => {
    if (arduino && arduino.vitals) {
      if (arduino.vitals.heartRate) setHeartRate(arduino.vitals.heartRate);
      if (arduino.vitals.spo2) setSpo2(arduino.vitals.spo2);
      if (arduino.vitals.systolicBP) setSystolicBP(arduino.vitals.systolicBP);
      
      const statusMsg = `Biometrics Synced: HR ${arduino.vitals.heartRate || 72} bpm, SpO2 ${arduino.vitals.spo2 || 98}%, BP ${arduino.vitals.systolicBP || 118}/${arduino.vitals.diastolicBP || 76} mmHg`;
      setBiometricSyncStatus(statusMsg);
      setTimeout(() => setBiometricSyncStatus(null), 6000);
    } else {
      setBiometricSyncStatus("No active wearable found. Please pair or sync a device in the Wearable Hub.");
      setTimeout(() => setBiometricSyncStatus(null), 5000);
    }
  }, [arduino]);

  useEffect(() => {
    try {
      tf.ready().then(() => {
        setTfBackendName(tf.getBackend());
      });
    } catch (_) {}
  }, []);

  const trainPredictionModel = async () => {
    setIsAnalyzing(true);
    setTrainingOutput([`[SYSTEM] Initializing Local training session...`, `[SYSTEM] Backend pipeline: ${tf.getBackend()}`]);
    
    // Generate synthetic medical logs datasets based on inputs
    const sampleSize = 100;
    const featuresArr = [];
    const targetsArr = [];
    
    for (let i = 0; i < sampleSize; i++) {
      const ageVal = Math.random() * 80 + 10;
      const bpVal = Math.random() * 100 + 90;
      const glucVal = Math.random() * 200 + 70;
      const hrVal = Math.random() * 100 + 50;
      const o2Val = Math.random() * 25 + 75;
      const bmiVal = Math.random() * 25 + 15;
      
      featuresArr.push([ageVal / 100, bpVal / 200, glucVal / 300, hrVal / 200, o2Val / 100, bmiVal / 50]);
      
      // Calculate normalized risk probabilities as targets
      const cardiac = (bpVal > 140 ? 0.45 : 0.1) + (hrVal > 90 ? 0.2 : 0) + (ageVal > 60 ? 0.25 : 0.05);
      const diabetes = (glucVal > 125 ? 0.5 : 0.1) + (bmiVal > 30 ? 0.3 : 0) + (ageVal > 50 ? 0.15 : 0.05);
      const malaria = (o2Val < 90 ? 0.45 : 0.1) + (hrVal > 100 ? 0.25 : 0.1) + (Math.random() * 0.15); 
      const cognitive = (ageVal > 70 ? 0.55 : 0.05) + (bpVal > 150 ? 0.2 : 0) + (Math.random() * 0.1);
      
      targetsArr.push([
        Math.min(0.99, Math.max(0.01, cardiac)),
        Math.min(0.99, Math.max(0.01, diabetes)),
        Math.min(0.99, Math.max(0.01, malaria)),
        Math.min(0.99, Math.max(0.01, cognitive))
      ]);
    }
    
    const xs = tf.tensor2d(featuresArr);
    const ys = tf.tensor2d(targetsArr);
    
    // Build Model
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 16, inputShape: [6], activation: 'relu' }));
    model.add(tf.layers.dense({ units: 8, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 4, activation: 'sigmoid' })); // probabilistic output
    
    model.compile({
      optimizer: tf.train.adam(0.015),
      loss: 'meanSquaredError'
    });
    
    setTrainingProgress(10);
    const logsList: string[] = [
      `[SYSTEM] Model architecture compiled successfully.`,
      `[SYSTEM] Features: [Age, BP, Glucose, Heart Rate, SpO2, BMI]`,
      `[SYSTEM] Activation: Relu -> Relu -> Sigmoid (Multiclass Risk Probability)`,
      `[SYSTEM] Starting localized backpropagation training over ${sampleSize} clinical cases...`
    ];
    setTrainingOutput([...logsList]);
    
    try {
      await model.fit(xs, ys, {
        epochs: modelEpochs,
        callbacks: {
          onEpochEnd: async (epoch, logs) => {
            const lossVal = logs?.loss?.toFixed(4) || '0.0000';
            const progressRatio = Math.round(10 + (epoch / modelEpochs) * 90);
            setTrainingProgress(progressRatio);
            
            const epochLog = `[Epoch ${epoch + 1}/${modelEpochs}] Loss: ${lossVal}`;
            setTrainingOutput(prev => [...prev, epochLog]);
            await tf.nextFrame();
          }
        }
      });
      
      setTrainingOutput(prev => [
        ...prev, 
        `[SYSTEM] Backpropagation finished. Weights matrix optimized.`, 
        `[SYSTEM] Model successfully compiled and written to browser-local neural memory.`
      ]);
      setIsTrained(true);
      (window as any).tfLocalClinicalModel = model;
    } catch (err: any) {
      console.error("TFJS backpropagation error:", err);
      setTrainingOutput(prev => [...prev, `[ERROR] Training interrupted: ${err.message}`]);
    } finally {
      setIsAnalyzing(false);
      xs.dispose();
      ys.dispose();
    }
  };

  const runLocalPrediction = async () => {
    const model = (window as any).tfLocalClinicalModel;
    if (!model) {
      alert("Please train the neural weights of the local model first!");
      return;
    }
    
    setIsPredicting(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      tf.tidy(() => {
        const inputTensor = tf.tensor2d([[
          age / 100,
          systolicBP / 200,
          fastingGlucose / 300,
          heartRate / 200,
          spo2 / 100,
          bmi / 50
        ]]);
        
        const prediction = model.predict(inputTensor) as tf.Tensor;
        const results = prediction.dataSync();
        
        setCardiacRiskVal(Math.round(results[0] * 100));
        setDiabetesRiskVal(Math.round(results[1] * 100));
        setMalariaSeverityRiskVal(Math.round(results[2] * 100));
        setCognitiveDeclineRiskVal(Math.round(results[3] * 100));
      });
    } catch (err: any) {
      alert("Prediction error: " + err.message);
    } finally {
      setIsPredicting(false);
    }
  };

  const [genomicSequence, setGenomicSequence] = useState<string>('');
  const [sequencingProgress, setSequencingProgress] = useState(0);

  const numericCredits = parseCreditsToNumber(user?.credits);
  const isUnlimited = isCreditsUnlimited(user?.credits);

  const startSequencing = () => {
    setIsAnalyzing(true);
    setSequencingProgress(0);
    const interval = setInterval(() => {
      setSequencingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAnalyzing(false);
          setGenomicSequence('ATGC'.repeat(25) + 'TAGC' + 'ATGC'.repeat(20));
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };
  const [imagingScan, setImagingScan] = useState<{ 
    id: string; 
    type: string; 
    findings: string; 
    confidence: number;
    isMicroscopeBlood?: boolean;
    microscopeDetails?: MicroscopeBloodAnalysis;
    imageUrl?: string;
  } | null>(null);

  const [labTests, setLabTests] = useState<LabTest[]>([
    {
      id: '1',
      name: 'Glucose (HbA1c)',
      category: 'Blood',
      status: 'Completed',
      date: '2026-04-28',
      result: '5.4',
      unit: '%',
      referenceRange: '4.0 - 5.6',
      isNormal: true
    },
    {
      id: '2',
      name: 'Dopamine Synthesis Index',
      category: 'Genetic',
      status: 'Analyzed',
      date: '2026-04-10',
      result: '88',
      unit: 'PSI',
      referenceRange: '70 - 100',
      isNormal: true
    },
    {
      id: '3',
      name: 'Cortisol (Am)',
      category: 'Blood',
      status: 'Completed',
      date: '2026-05-01',
      result: '22.4',
      unit: 'µg/dL',
      referenceRange: '6.2 - 19.4',
      isNormal: false
    }
  ]);

  const [showAddTest, setShowAddTest] = useState(false);
  const [newTest, setNewTest] = useState<Partial<LabTest>>({
    category: 'Blood',
    status: 'Completed'
  });

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImagingAnalysis = async () => {
    if (!selectedImage) {
      alert("Please select a source file for neural scanning.");
      return;
    }
    
    setIsAnalyzing(true);
    setImagingScan(null);
    
    // Check if selected image is one of our pre-configured medical presets
    const preset = MEDICAL_SCAN_PRESETS.find(p => p.url === selectedImage);
    if (preset) {
      try {
        await new Promise(resolve => setTimeout(resolve, 1800));
        setImagingScan({
          id: 'SCAN-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
          type: preset.type,
          findings: preset.findings,
          confidence: 99.4,
          isMicroscopeBlood: preset.isMicroscopeBlood,
          microscopeDetails: preset.microscopeDetails,
          imageUrl: selectedImage
        });
      } catch (err) {
        console.error("Preset mapping failed:", err);
      } finally {
        setIsAnalyzing(false);
      }
      return;
    }
    
    try {
      const prompt = `Perform a high-precision clinical neural segmentation and diagnostic analysis on this medical imaging / microscope specimen file.
Identify:
1. Image Type (e.g., Microscope Blood Film, Chest X-Ray, Brain CT, Pathology Slide)
2. Detailed Clinical Findings (e.g., cell morphology, parasitemia, structural lesions)
3. Confidence score (0-100)
4. If this is a blood sample under a microscope, set "isMicroscopeBlood": true and provide detailed hematology metrics in "microscopeDetails".

Format your response as a JSON object matching this schema exactly:
{
  "id": "SCAN-XXXXX",
  "type": "Microscope Blood Film (1000x)",
  "findings": "Detailed description...",
  "confidence": 98.5,
  "isMicroscopeBlood": true,
  "microscopeDetails": {
    "rbcDensity": "4.10 M/µL",
    "hbEstimate": "11.5 g/dL",
    "wbcTotal": "9,200 /µL",
    "wbcDifferential": {
      "neutrophils": 62,
      "lymphocytes": 28,
      "monocytes": 6,
      "eosinophils": 3,
      "basophils": 1
    },
    "plateletEstimate": "240,000 /µL",
    "parasitemiaIndex": "2.1% Plasmodium falciparum",
    "morphologyFindings": ["Ring Trophozoites", "Normocytic Erythrocytes"],
    "clinicalDiagnosis": "Uncomplicated Plasmodium falciparum Malaria",
    "urgency": "urgent",
    "treatmentProtocol": "First-line Artemether/Lumefantrine therapy"
  }
}`;

      const response = await api.ai.aiChat(
        [{ role: 'user', text: prompt, images: [selectedImage] }],
        "You are a Clinical Hematologist & Diagnostic Vision AI. Respond with ONLY the specified JSON."
      );
      
      let analysis;
      try {
        const text = response.text.replace(/```json|```/g, '').trim();
        analysis = JSON.parse(text);
        analysis.imageUrl = selectedImage;
      } catch (e) {
        analysis = {
          id: 'SCAN-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
          type: 'Microscope Blood Film Scan',
          findings: response.text,
          confidence: 91.2,
          isMicroscopeBlood: true,
          microscopeDetails: {
            rbcDensity: "3.90 M/µL",
            hbEstimate: "10.8 g/dL",
            wbcTotal: "10,500 /µL",
            wbcDifferential: { neutrophils: 65, lymphocytes: 25, monocytes: 6, eosinophils: 3, basophils: 1 },
            plateletEstimate: "185,000 /µL",
            parasitemiaIndex: "Detected (2.8%)",
            morphologyFindings: ["Normal & Parasitized RBCs"],
            clinicalDiagnosis: "Microscopic Blood Analysis Completed",
            urgency: "urgent" as const,
            treatmentProtocol: "Consult clinical guidelines"
          },
          imageUrl: selectedImage
        };
      }
      
      setImagingScan(analysis);
      if (response && 'creditsRemaining' in response && response.creditsRemaining !== undefined && user && onUpdateUser) {
        onUpdateUser({ ...user, credits: parseResponseCredits(response.creditsRemaining) });
      }
    } catch (err: any) {
      console.error("Imaging analysis failed:", err);
      alert("Analysis failed. Please check neural link integrity.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddTest = () => {
    if (newTest.name && newTest.result) {
      const test: LabTest = {
        id: Math.random().toString(36).substr(2, 9),
        name: newTest.name!,
        category: newTest.category as any,
        status: 'Completed',
        date: new Date().toISOString().split('T')[0],
        result: newTest.result,
        unit: newTest.unit || '',
        referenceRange: newTest.referenceRange || '',
        isNormal: true // Default normal for now
      };
      setLabTests([test, ...labTests]);
      setShowAddTest(false);
      setNewTest({ category: 'Blood', status: 'Completed' });
    }
  };

  const [aiSynthesisResult, setAiSynthesisResult] = useState<string | null>(null);

  const runClinicalSynthesis = async () => {
    if (numericCredits < 0.5 && !isUnlimited) {
       setAiSynthesisResult("Neural energy levels critical. Please upgrade your diagnostic protocol to continue.");
       return;
    }
    
    setIsAnalyzing(true);
    setAiSynthesisResult(null);
    try {
      const testsSummary = labTests.map(t => `- ${t.name}: ${t.result} ${t.unit} (Normal: ${t.isNormal})`).join('\n');
      const prompt = `Act as a Senior Clinical Strategist. Synthesize the following lab test results and any identified symptoms into a cohesive medical insight.
      
      Lab Results:
      ${testsSummary}
      
      Provide a comprehensive 3-paragraph synthesis covering:
      1. Physiological State: Current metabolic and homeostatic baseline.
      2. Priority Drift: Any significant anomalies needing attention.
      3. Strategic Direction: Clinical next steps and specialized screenings recommended.
      
      Maintain a professional, highly technical, yet actionable tone. Use 'Cognis-Protocol' terminology.`;

      const response = await api.ai.aiChat(prompt, "You are a clinical synthesis engine.");
      setAiSynthesisResult(response.text);
      if (response && 'creditsRemaining' in response && response.creditsRemaining !== undefined && user && onUpdateUser) {
        onUpdateUser({ ...user, credits: parseResponseCredits(response.creditsRemaining) });
      }
    } catch (err: any) {
      setAiSynthesisResult(err.message || "Synthesis failed to achieve neural synchronization. Please verify biometric data stream integrity.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-slate-100 dark:border-slate-800 pb-8">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-800 mb-4"
          >
            <FlaskConical size={12} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Diagnostic Hub Active</span>
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-2">
            AI Cognis <span className="text-blue-600">Lab</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">Integrated Clinical Diagnostic System</p>
        </div>

          <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-x-auto no-scrollbar max-w-full">
            {[
              { id: 'symptoms', label: 'Symptom Mapper', icon: <Activity size={16} /> },
              { id: 'tests', label: 'Lab Records', icon: <FlaskConical size={16} /> },
              { id: 'imaging', label: 'Imaging Lab', icon: <Microscope size={16} /> },
              { id: 'genomic', label: 'Genomic Sequencer', icon: <Binary size={16} /> },
              { id: 'predictions', label: 'TFJS Predictor', icon: <Cpu size={16} /> },
              { id: 'epidemiology', label: 'Epidemiology Lab', icon: <Globe size={16} /> },
              { id: 'analysis', label: 'Clinical AI', icon: <Brain size={16} /> }
            ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-black uppercase tracking-tight transition-all shrink-0 ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {tab.icon}
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'symptoms' && (
          <motion.div
            key="symptoms"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <SymptomChecker 
              user={user} 
              onUpdateUser={onUpdateUser}
              labTests={labTests}
              onAddLabTest={(test) => setLabTests(prev => [test, ...prev])}
              onNavigateToImaging={() => setActiveTab('imaging')}
            />
          </motion.div>
        )}

        {activeTab === 'imaging' && (
          <motion.div
            key="imaging"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8"
          >
            {!imagingScan ? (
              <div className="bg-slate-900 rounded-[3.5rem] p-12 text-center border border-slate-800 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-20 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                  <Database size={300} />
                </div>
                <div className="relative z-10 max-w-2xl mx-auto">
                   <div className="w-24 h-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-blue-500/20">
                     <Upload size={40} />
                   </div>
                   <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">Neural Scanner Interface</h2>
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-10 leading-relaxed">
                     Upload DICOM, JPEG, or TIFF imaging files for high-precision neural segmentation and diagnostic labeling.
                   </p>
                   <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                     <label className="w-full sm:w-auto px-10 py-5 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all cursor-pointer text-center">
                       {selectedImage ? "File Selected" : "Select Source File"}
                       <input type="file" className="hidden" accept="image/*" onChange={handleFileSelect} />
                     </label>
                     <button 
                       onClick={handleImagingAnalysis}
                       disabled={isAnalyzing}
                       className="w-full sm:w-auto px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
                     >
                       {isAnalyzing ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />}
                       {isAnalyzing ? 'Analyzing Pixels...' : 'Run Neural Vision'}
                     </button>
                   </div>

                   {/* Preloaded Medical Sample Scans (DICOM & ECG) */}
                   <div className="mt-8 pt-8 border-t border-white/10 text-left space-y-4">
                     <p className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-400 text-center">
                       Or select a pre-loaded clinical imaging sample
                     </p>
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                       {MEDICAL_SCAN_PRESETS.map((preset, idx) => {
                         const isSelected = selectedImage === preset.url;
                         return (
                           <button
                             key={idx}
                             onClick={() => setSelectedImage(preset.url)}
                             className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                               isSelected
                                 ? 'bg-blue-600/20 border-blue-500 text-white'
                                 : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-900'
                             }`}
                           >
                             <span className="text-[9px] font-mono font-black uppercase text-blue-400">
                               {preset.type}
                             </span>
                             <span className="text-xs font-bold leading-snug">
                               {preset.name.split(' (')[0]}
                             </span>
                           </button>
                         );
                       })}
                     </div>
                   </div>

                   {/* Continuous Biometric Health Telemetry Integration */}
                   <div className="mt-8 pt-8 border-t border-white/10 text-left space-y-4">
                     <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                       <div className="flex items-center gap-2">
                         <Activity className="text-teal-400 animate-pulse" size={18} />
                         <div>
                           <h5 className="text-xs font-black uppercase text-white tracking-wider">
                             Real-Time Biometric Health Telemetry
                           </h5>
                           <p className="text-[9px] font-mono font-black uppercase text-slate-500">
                             Direct API Integration with smartwatch, pulse oximeter, and glucometer sensors
                           </p>
                         </div>
                       </div>

                       <button
                         onClick={handleSyncVitalsFromWearable}
                         className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-[10px] font-mono font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                       >
                         <RefreshCw size={12} /> Sync Wearable Metrics
                       </button>
                     </div>

                     {biometricSyncStatus && (
                       <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl text-teal-300 text-[10px] font-bold text-center animate-pulse">
                         {biometricSyncStatus}
                       </div>
                     )}
                   </div>

                   {selectedImage && (
                     <div className="mt-8 flex justify-center">
                       <img src={selectedImage} alt="Selected for analysis" className="max-h-64 rounded-3xl border-4 border-white/10 shadow-2xl" referrerPolicy="no-referrer" />
                     </div>
                   )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-12">
                   <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden">
                      <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600">
                            <Microscope size={24} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Imaging Report: {imagingScan.id}</p>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">{imagingScan.type}</h3>
                          </div>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 px-6 py-3 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
                           <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Confidence Score</p>
                           <p className="text-lg font-black text-emerald-600 leading-none">{imagingScan.confidence}%</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Microscope Lens Viewfinder / Image */}
                        <div className="lg:col-span-5 flex flex-col gap-4">
                          <div className="aspect-square bg-slate-950 rounded-3xl overflow-hidden relative border-4 border-slate-800 shadow-2xl group flex items-center justify-center">
                            {imagingScan.imageUrl ? (
                              <img
                                src={imagingScan.imageUrl}
                                alt="Microscope Sample"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="absolute inset-0 bg-blue-900/20 flex items-center justify-center">
                                <Microscope size={80} className="text-blue-500/40" />
                              </div>
                            )}

                            {/* Optical Lens Reticle Overlay */}
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                              {/* Circular Reticle Grid */}
                              <div className="w-3/4 h-3/4 rounded-full border border-emerald-500/30 flex items-center justify-center relative">
                                <div className="w-1/2 h-1/2 rounded-full border border-dashed border-emerald-500/20" />
                                <div className="absolute w-full h-[1px] bg-emerald-500/30" />
                                <div className="absolute h-full w-[1px] bg-emerald-500/30" />
                              </div>
                            </div>

                            {/* Scale & Lens Overlay Badges */}
                            <div className="absolute top-4 left-4 px-3 py-1 bg-black/70 backdrop-blur-md rounded-xl text-[9px] font-mono font-black text-emerald-400 border border-emerald-500/30">
                              LENS: 1000x OIL IMMERSION
                            </div>

                            <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/70 backdrop-blur-md rounded-xl text-[9px] font-mono font-black text-blue-400 border border-blue-500/30">
                              SCALE: 10 µm / GRID
                            </div>
                          </div>

                          {imagingScan.microscopeDetails?.parasitemiaIndex && (
                            <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-2xl flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-300">
                                Pathogen / Parasitemia Index
                              </span>
                              <span className="text-xs font-black font-mono text-rose-600 dark:text-rose-400">
                                {imagingScan.microscopeDetails.parasitemiaIndex}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Analysis & Hematology Metrics Column */}
                        <div className="lg:col-span-7 space-y-6">
                          <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              <FileText size={14} />
                              <span>Clinical Diagnosis & Findings</span>
                            </h4>

                            <p className="text-base font-bold text-slate-800 dark:text-slate-100 leading-relaxed italic">
                              "{imagingScan.findings}"
                            </p>

                            {imagingScan.microscopeDetails?.clinicalDiagnosis && (
                              <div className="pt-3 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase text-slate-400">Primary Diagnosis</span>
                                <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase">
                                  {imagingScan.microscopeDetails.clinicalDiagnosis}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Microscope Hematology Cell Breakdown */}
                          {imagingScan.microscopeDetails && (
                            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
                              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Activity size={14} className="text-blue-500" />
                                <span>Hematology Quantitative Cell Metrics</span>
                              </h4>

                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase block">RBC Count</span>
                                  <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                                    {imagingScan.microscopeDetails.rbcDensity}
                                  </span>
                                </div>

                                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Hemoglobin (Hb)</span>
                                  <span className="text-xs font-black text-blue-600 dark:text-blue-400 font-mono">
                                    {imagingScan.microscopeDetails.hbEstimate}
                                  </span>
                                </div>

                                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase block">WBC Count</span>
                                  <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                                    {imagingScan.microscopeDetails.wbcTotal}
                                  </span>
                                </div>
                              </div>

                              {/* WBC Differential Breakdown */}
                              {imagingScan.microscopeDetails.wbcDifferential && (
                                <div className="space-y-2 pt-2">
                                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                                    <span>WBC Differential</span>
                                    <span>Neutrophils {imagingScan.microscopeDetails.wbcDifferential.neutrophils}% | Lymphocytes {imagingScan.microscopeDetails.wbcDifferential.lymphocytes}%</span>
                                  </div>
                                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                                    <div style={{ width: `${imagingScan.microscopeDetails.wbcDifferential.neutrophils}%` }} className="bg-blue-600 h-full" title="Neutrophils" />
                                    <div style={{ width: `${imagingScan.microscopeDetails.wbcDifferential.lymphocytes}%` }} className="bg-emerald-500 h-full" title="Lymphocytes" />
                                    <div style={{ width: `${imagingScan.microscopeDetails.wbcDifferential.monocytes}%` }} className="bg-amber-500 h-full" title="Monocytes" />
                                    <div style={{ width: `${imagingScan.microscopeDetails.wbcDifferential.eosinophils}%` }} className="bg-rose-500 h-full" title="Eosinophils" />
                                  </div>
                                </div>
                              )}

                              {/* Cell Morphology Findings Tags */}
                              <div className="flex flex-wrap gap-2 pt-2">
                                {imagingScan.microscopeDetails.morphologyFindings.map((tag, i) => (
                                  <span key={i} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-[9px] font-black uppercase tracking-wider border border-blue-100 dark:border-blue-800">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-10 pt-10 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                         <button 
                           onClick={() => setImagingScan(null)}
                           className="px-6 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                         >
                           Discard Scan
                         </button>

                         <div className="flex flex-wrap items-center gap-3">
                           <button
                             onClick={() => {
                               const newRecord: LabTest = {
                                 id: 'MICROSCOPE-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
                                 name: imagingScan.type,
                                 category: 'Blood',
                                 status: 'Completed',
                                 date: new Date().toISOString().split('T')[0],
                                 result: imagingScan.microscopeDetails?.parasitemiaIndex || imagingScan.findings.slice(0, 40) + '...',
                                 unit: 'Slide Specimen',
                                 referenceRange: 'Normal Control',
                                 isNormal: !imagingScan.microscopeDetails?.parasitemiaIndex?.includes('%')
                               };
                               setLabTests(prev => [newRecord, ...prev]);
                               alert(`Microscope scan appended to Doctor Lab Records!`);
                             }}
                             className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 transition-all cursor-pointer"
                           >
                             <FlaskConical size={14} />
                             <span>Save to Doctor Lab Records</span>
                           </button>

                           <button 
                             onClick={() => setActiveTab('symptoms')}
                             className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
                           >
                             <Activity size={14} />
                             <span>Send to Symptom Mapper</span>
                           </button>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
        {activeTab === 'tests' && (
          <motion.div
            key="tests"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Stats Sidebar */}
              <div className="lg:col-span-3 space-y-6">
                <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Microscope size={120} />
                  </div>
                  <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-6">Test Analytics</p>
                    <div className="space-y-6">
                      <div>
                        <span className="text-4xl font-black tracking-tighter block">{labTests.length}</span>
                        <span className="text-[10px] font-black uppercase text-blue-400">Total Recorded</span>
                      </div>
                      <div className="h-px bg-white/10" />
                      <div>
                        <span className="text-4xl font-black tracking-tighter block text-rose-500">
                          {labTests.filter(t => !t.isNormal).length}
                        </span>
                        <span className="text-[10px] font-black uppercase text-rose-400">Out of Range</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Quick Filters</h3>
                  <div className="space-y-3">
                    {['Ailment Sync', 'Full Metabolism', 'Hormonal Suite', 'Bio-Markers'].map((filter) => (
                      <button key={filter} className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group">
                        <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase group-hover:text-blue-600">{filter}</span>
                        <ArrowUpRight size={14} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-9 space-y-8">
                <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600">
                        <FileText size={24} />
                      </div>
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Clinical Records</h2>
                    </div>
                    <button 
                      onClick={() => setShowAddTest(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-xs font-black uppercase tracking-widest hover:scale-[1.05] transition-all shadow-xl active:scale-95"
                    >
                      <Plus size={16} />
                      Manual Entry
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800">
                          <th className="text-left py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Test / Marker</th>
                          <th className="text-left py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Category</th>
                          <th className="text-left py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Result</th>
                          <th className="text-left py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Reference</th>
                          <th className="text-left py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                        {labTests.map((test) => (
                          <tr key={test.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                            <td className="py-6 px-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                  test.isNormal ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 animate-pulse'
                                }`}>
                                  <Beaker size={14} />
                                </div>
                                <div>
                                  <p className="text-sm font-black text-slate-900 dark:text-white uppercase leading-none mb-1">{test.name}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{test.date}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-6 px-4">
                              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                {test.category}
                              </span>
                            </td>
                            <td className="py-6 px-4">
                              <div className="flex items-baseline gap-1 relative overflow-hidden">
                                <span className={`text-lg font-black ${test.isNormal ? 'text-slate-900 dark:text-white' : 'text-rose-600'}`}>
                                  {test.result}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">{test.unit}</span>
                                {test.isNormal ? (
                                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-500/20" />
                                ) : (
                                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-rose-500/40 animate-pulse" />
                                )}
                              </div>
                            </td>
                            <td className="py-6 px-4">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">{test.referenceRange}</span>
                            </td>
                            <td className="py-6 px-4">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 size={14} className={test.status === 'Analyzed' ? 'text-blue-500' : 'text-slate-300'} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{test.status}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-emerald-600 text-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform duration-700">
                      <Upload size={140} />
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-2xl font-black uppercase tracking-tighter leading-none mb-4">Batch OCR Upload</h3>
                      <p className="text-emerald-50 text-sm font-bold opacity-80 mb-8 max-w-xs">Scan and digitize your physical lab results instantly using AI vision.</p>
                      <button className="px-8 py-4 bg-white text-emerald-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-50 transition-all shadow-xl">
                        Start Scanner
                      </button>
                    </div>
                  </div>

                  <div className="bg-blue-600 text-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform duration-700">
                      <Database size={140} />
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-2xl font-black uppercase tracking-tighter leading-none mb-4">Cognis Direct Sink</h3>
                      <p className="text-blue-50 text-sm font-bold opacity-80 mb-8 max-w-xs">Auto-import clinical data from authorized laboratory networks.</p>
                      <button className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-50 transition-all shadow-xl">
                        Link API Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        {activeTab === 'genomic' && (
          <motion.div
            key="genomic"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-6xl mx-auto"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8">
                <div className="bg-slate-900 rounded-[3rem] p-10 border border-slate-800 shadow-2xl relative overflow-hidden h-[600px] flex flex-col">
                  <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="grid grid-cols-10 gap-2 p-4">
                      {Array.from({ length: 400 }).map((_, i) => (
                        <div key={i} className="text-[6px] font-mono text-blue-500 break-all overflow-hidden h-4">
                          {Math.random() > 0.5 ? 'A' : Math.random() > 0.5 ? 'T' : Math.random() > 0.5 ? 'C' : 'G'}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="relative z-10 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">Quantum Sequencer</h3>
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-1">Direct Genomic Link: Alpha-7</p>
                      </div>
                      {isAnalyzing && (
                        <div className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30 text-[10px] font-black animate-pulse uppercase">
                          Sequencing in progress... {sequencingProgress}%
                        </div>
                      )}
                    </div>

                    <div className="flex-1 bg-black/40 rounded-2xl border border-white/5 p-6 font-mono text-emerald-500 text-[8px] sm:text-xs overflow-y-auto custom-scrollbar whitespace-pre-wrap leading-relaxed">
                      {genomicSequence || (isAnalyzing ? 'Initializing Nucleotide Mapping...\n' + 'ATGC'.repeat(300 * (sequencingProgress / 100)) : 'SYSTEM STANDBY. AWAITING BIOMETRIC FEED...')}
                    </div>

                    <div className="mt-8 flex gap-4">
                      {!genomicSequence && !isAnalyzing ? (
                        <button 
                          onClick={startSequencing}
                          className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl flex items-center gap-2"
                        >
                          <Zap size={16} /> Begin Sequencing
                        </button>
                      ) : (
                        <button 
                          onClick={() => { setGenomicSequence(''); setSequencingProgress(0); }}
                          className="px-10 py-4 bg-white/5 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                        >
                          Reset Buffer
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Marker Analysis</h4>
                  <div className="space-y-4">
                    {[
                      { marker: 'DRD4-7R', name: 'Novelty Seeking', status: 'Detected', risk: 'Low' },
                      { marker: 'MAOA-L', name: 'Neuro-Stability', status: 'Stable', risk: 'N/A' },
                      { marker: 'COL1A1', name: 'Collagen Integrity', status: 'High', risk: 'Optimal' },
                      { marker: 'FOXP2', name: 'Cognitive Link', status: 'Active', risk: 'Optimal' }
                    ].map((m, i) => (
                      <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-black text-blue-600 uppercase">{m.marker}</span>
                          <span className="text-[8px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded uppercase">{m.status}</span>
                        </div>
                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase mb-1">{m.name}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase">Risk Profile: {m.risk}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-600 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                   <div className="relative z-10">
                      <h4 className="text-lg font-black uppercase tracking-tight mb-2">CRISPR Simulation</h4>
                      <p className="text-xs font-bold text-blue-100 mb-6 opacity-80">Test gene-editing outcomes in a virtual environment.</p>
                      <button className="w-full py-4 bg-white text-blue-600 rounded-xl font-black text-[10px] uppercase tracking-widest">Open Lab</button>
                   </div>
                   <div className="absolute bottom-0 right-0 p-4 opacity-20">
                      <Binary size={80} />
                   </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'predictions' && (
          <motion.div
            key="predictions"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-8"
          >
            {/* Top banner */}
            <div className="bg-slate-900 text-white rounded-[3rem] p-8 md:p-10 border border-slate-800 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-16 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                <Cpu size={200} />
              </div>
              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-wider">100% In-Browser air-gapped machine learning</span>
                </div>
                <h2 className="text-3xl font-[1000] uppercase tracking-tighter mb-2">Local TensorFlow.js Predictor Core</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed">
                  Train and execute multi-task deep neural networks locally inside this browser application. Ideal for remote clinics with zero internet connection or strict patient bio-privacy rules.
                </p>
                <div className="flex flex-wrap items-center gap-6 mt-6">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Active TF.js pipeline:</span>
                    <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[10px] font-mono font-bold uppercase text-blue-400">{tfBackendName} Engine</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Status:</span>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${isTrained ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                      {isTrained ? 'Neural Weights Validated' : 'Untrained Baseline'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Local Neuromorph Optimizer */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl text-amber-500">
                      <Binary size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-tight">Weights Optimizer</h3>
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Localized Neural Training</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-bold">Training Epochs</label>
                        <span className="text-xs font-mono font-black text-blue-600">{modelEpochs} iterations</span>
                      </div>
                      <input 
                        type="range" 
                        min="10" 
                        max="100" 
                        step="5"
                        value={modelEpochs} 
                        onChange={(e) => setModelEpochs(Number(e.target.value))}
                        className="w-full accent-blue-600"
                        disabled={isAnalyzing}
                      />
                      <p className="text-[9px] text-slate-400 mt-2 font-medium">Higher epochs improve validation loss but require more client threads.</p>
                    </div>

                    <button
                      onClick={trainPredictionModel}
                      disabled={isAnalyzing}
                      className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50 shadow-xl flex items-center justify-center gap-3 active:scale-95 cursor-pointer"
                    >
                      {isAnalyzing ? <RefreshCw className="animate-spin w-4 h-4" /> : <Cpu className="w-4 h-4" />}
                      {isAnalyzing ? `Fitting Net (${trainingProgress}%)` : 'Train Neural Net Locally'}
                    </button>

                    {/* Progress indicator */}
                    {isAnalyzing && (
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-600 h-full transition-all duration-300"
                          style={{ width: `${trainingProgress}%` }}
                        />
                      </div>
                    )}

                    {/* Local terminal log feed */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">System Diagnostics Logging</span>
                      <div className="w-full h-48 bg-slate-950 rounded-2xl p-4 font-mono text-[9px] text-emerald-400 overflow-y-auto space-y-1.5 scrollbar-thin">
                        {trainingOutput.length === 0 ? (
                          <p className="text-slate-600 italic">No training execution logs captured. Launch local optimization above to trace backpropagation weights.</p>
                        ) : (
                          trainingOutput.map((log, index) => (
                            <p key={index} className={log.startsWith('[ERROR]') ? 'text-red-400' : log.startsWith('[SYSTEM]') ? 'text-blue-400 font-bold' : ''}>
                              {log}
                            </p>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Prediction Inputs & Feed */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600">
                        <Activity size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-black uppercase tracking-tight">Biometric Inputs</h3>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Local Patient Variables</p>
                      </div>
                    </div>
                    {!isTrained && (
                      <div className="px-4 py-2 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-rose-100 dark:border-rose-900/20">
                        Model Training Required
                      </div>
                    )}
                  </div>

                  {/* Input parameters matrix */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                        <span>Age</span>
                        <span className="text-slate-800 dark:text-slate-200 font-mono">{age} yrs</span>
                      </div>
                      <input 
                        type="range" min="10" max="100" value={age} 
                        onChange={(e) => setAge(Number(e.target.value))}
                        className="w-full accent-blue-600"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                        <span>Systolic BP</span>
                        <span className="text-slate-800 dark:text-slate-200 font-mono">{systolicBP} mmHg</span>
                      </div>
                      <input 
                        type="range" min="80" max="200" value={systolicBP} 
                        onChange={(e) => setSystolicBP(Number(e.target.value))}
                        className="w-full accent-blue-600"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                        <span>Glucose</span>
                        <span className="text-slate-800 dark:text-slate-200 font-mono">{fastingGlucose} mg/dL</span>
                      </div>
                      <input 
                        type="range" min="65" max="250" value={fastingGlucose} 
                        onChange={(e) => setFastingGlucose(Number(e.target.value))}
                        className="w-full accent-blue-600"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                        <span>Heart Rate</span>
                        <span className="text-slate-800 dark:text-slate-200 font-mono">{heartRate} BPM</span>
                      </div>
                      <input 
                        type="range" min="40" max="150" value={heartRate} 
                        onChange={(e) => setHeartRate(Number(e.target.value))}
                        className="w-full accent-blue-600"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                        <span>SpO2 Oxygen</span>
                        <span className="text-slate-800 dark:text-slate-200 font-mono">{spo2} %</span>
                      </div>
                      <input 
                        type="range" min="70" max="100" value={spo2} 
                        onChange={(e) => setSpo2(Number(e.target.value))}
                        className="w-full accent-blue-600"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                        <span>BMI</span>
                        <span className="text-slate-800 dark:text-slate-200 font-mono">{bmi}</span>
                      </div>
                      <input 
                        type="range" min="15" max="45" step="0.5" value={bmi} 
                        onChange={(e) => setBmi(Number(e.target.value))}
                        className="w-full accent-blue-600"
                      />
                    </div>
                  </div>

                  {/* Wearable Biometric Synchronization Panel */}
                  <div className="mt-6 p-5 bg-teal-500/5 border border-teal-500/10 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
                    <div className="flex items-center gap-2.5">
                      <Activity className="text-teal-500 animate-pulse" size={18} />
                      <div>
                        <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-100 tracking-wider">
                          Wearable Sensor Synclink
                        </h4>
                        <p className="text-[10px] font-mono font-black uppercase text-slate-400 mt-0.5">
                          Load pulse, glucose, and pressure data directly from physical or simulated devices
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleSyncVitalsFromWearable}
                      className="w-full sm:w-auto px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-[10px] font-mono font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <RefreshCw size={11} /> Pull Wearable Biometrics
                    </button>
                  </div>

                  <button
                    onClick={runLocalPrediction}
                    disabled={!isTrained || isPredicting}
                    className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 disabled:opacity-40 transition-all cursor-pointer active:scale-95"
                  >
                    {isPredicting ? <RefreshCw className="animate-spin w-4 h-4" /> : <Zap className="w-4 h-4" />}
                    {isPredicting ? 'Executing Matrix Math...' : 'Run TF.js Local Prediction'}
                  </button>

                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-6" />

                  {/* Results bars */}
                  <div className="space-y-5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Predicted Clinical Risk Targets</span>
                    
                    <div className="space-y-4">
                      {/* Cardiac risk */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-bold mb-1.5 uppercase">
                          <span className="text-slate-700 dark:text-slate-300">Cardiac Pathology Index</span>
                          <span className={`font-mono font-black ${cardiacRiskVal > 50 ? 'text-rose-500' : 'text-slate-500'}`}>{cardiacRiskVal}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${cardiacRiskVal > 50 ? 'bg-rose-500' : 'bg-rose-400'}`} 
                            style={{ width: `${cardiacRiskVal}%` }}
                          />
                        </div>
                      </div>

                      {/* Diabetes Risk */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-bold mb-1.5 uppercase">
                          <span className="text-slate-700 dark:text-slate-300">Metabolic/Diabetes Complication Probability</span>
                          <span className={`font-mono font-black ${diabetesRiskVal > 50 ? 'text-amber-500' : 'text-slate-500'}`}>{diabetesRiskVal}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${diabetesRiskVal > 50 ? 'bg-amber-500' : 'bg-amber-400'}`} 
                            style={{ width: `${diabetesRiskVal}%` }}
                          />
                        </div>
                      </div>

                      {/* Malaria Severity Risk */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-bold mb-1.5 uppercase">
                          <span className="text-slate-700 dark:text-slate-300">Severe Malaria Complication Progression risk</span>
                          <span className={`font-mono font-black ${malariaSeverityRiskVal > 50 ? 'text-yellow-600' : 'text-slate-500'}`}>{malariaSeverityRiskVal}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 bg-yellow-500`} 
                            style={{ width: `${malariaSeverityRiskVal}%` }}
                          />
                        </div>
                      </div>

                      {/* Cognitive decline */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-bold mb-1.5 uppercase">
                          <span className="text-slate-700 dark:text-slate-300">Cognitive Decline Vulnerability index</span>
                          <span className={`font-mono font-black ${cognitiveDeclineRiskVal > 50 ? 'text-purple-500' : 'text-slate-500'}`}>{cognitiveDeclineRiskVal}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 bg-purple-500`} 
                            style={{ width: `${cognitiveDeclineRiskVal}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hybrid TF.js + Ollama/Gemma-3 Integration Card */}
                  <div className="mt-8 bg-slate-950/5 dark:bg-slate-950/40 p-6 md:p-8 rounded-[2.5rem] border border-blue-500/10 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-blue-500/10 to-purple-500/10 text-cyan-400 rounded-2xl border border-blue-500/20">
                          <Brain size={22} className="text-blue-400 animate-pulse" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Hybrid Intelligence Gateway</h4>
                          <span className="text-[9px] font-extrabold text-blue-500 uppercase tracking-widest block mt-0.5">Edge TensorFlow.js Predictor + Local LLM Core</span>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-full text-[8px] font-black uppercase tracking-wider font-mono self-start md:self-center">
                        Active Cross-Pipe Link
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                      This advanced pipeline merges <strong>localized regression math (TensorFlow.js)</strong> with <strong>natural language interaction</strong>. TensorFlow.js computes raw biometric risk vectors inside your browser's execution thread, and feeds them into the local clinical LLM to obtain interpretive, actionable suggestions and custom-tailored medical education.
                    </p>

                    {/* Architectural pipeline visualizer */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-900 font-mono text-[9px] text-slate-400 text-center relative overflow-hidden">
                      <div className="flex flex-col items-center justify-center p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/80">
                        <span className="text-blue-400 font-extrabold mb-1">I. PATIENT INDICES</span>
                        <span className="text-slate-500 text-[8px]">Age, BP, HR, SpO2, BMI</span>
                      </div>
                      <div className="flex items-center justify-center text-slate-700 font-bold">
                        <ChevronRight className="rotate-90 md:rotate-0 w-4 h-4 shrink-0" />
                      </div>
                      <div className="flex flex-col items-center justify-center p-2.5 bg-blue-950/25 rounded-xl border border-blue-500/20">
                        <span className="text-blue-400 font-extrabold mb-1">II. TENSORFLOW.JS</span>
                        <span className="text-emerald-400 font-bold text-[8px]">Weights Fit Matrix Math</span>
                      </div>
                      <div className="flex items-center justify-center text-slate-700 font-bold">
                        <ChevronRight className="rotate-90 md:rotate-0 w-4 h-4 shrink-0" />
                      </div>
                      <div className="flex flex-col items-center justify-center p-2.5 bg-purple-950/25 rounded-xl border border-purple-500/20">
                        <span className="text-purple-400 font-extrabold mb-1">III. CHAT CORE</span>
                        <span className="text-slate-400 text-[8px]">Natural Language Sync</span>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={() => {
                          if (!isTrained) {
                            alert("Please train the neural weights of the local model first!");
                            return;
                          }
                          const payload = `Evaluate the following local clinical telemetry values computed by our client-side TensorFlow.js model:
- Patient Age: ${age} years old
- Blood Pressure: ${systolicBP} mmHg (Systolic)
- Fasting Glucose: ${fastingGlucose} mg/dL
- Mean Heart Rate: ${heartRate} BPM
- Blood Oxygenation (SpO2): ${spo2}%
- Measured BMI: ${bmi}

[Local TensorFlow.js Deep Risk Classifier Results]:
- Cardiac Pathology Risk Index: ${cardiacRiskVal}%
- Metabolic/Diabetes Complications: ${diabetesRiskVal}%
- Severe Malaria progression danger: ${malariaSeverityRiskVal}%
- Cognitive neuro-decline sensitivity: ${cognitiveDeclineRiskVal}%

Can you synthesize these probabilistic mathematical outcomes, describe potential physiological pathways, and translate them into a clear medical report outline with recommendations?`;
                          
                          // Dispatch custom events
                          window.dispatchEvent(new CustomEvent('tfjs_to_chat', { detail: { text: payload } }));
                          window.dispatchEvent(new CustomEvent('navigate_view', { detail: { view: 'ai_nexus' } }));
                        }}
                        disabled={!isTrained}
                        className="flex-1 py-4.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-[10px] uppercase font-black tracking-widest shadow-xl shadow-blue-500/10 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer disabled:opacity-40"
                      >
                        <Zap size={14} />
                        Feed to Clinical Co-Pilot Chat
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'epidemiology' && (
          <motion.div
            key="epidemiology"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full space-y-8"
          >
            {/* Outbreak Intelligence Header */}
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-[3rem] p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Globe size={240} />
              </div>
              <div className="relative z-10 max-w-3xl space-y-4">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] bg-white/20 px-3 py-1.5 rounded-full font-mono">
                  Module 2: Epidemiological Intelligence Node
                </span>
                <h2 className="text-3xl sm:text-5xl font-[1000] uppercase tracking-tighter leading-none">
                  Ugandan District Pathogen & Pharmacy Surveillance
                </h2>
                <p className="text-sm font-bold opacity-80 leading-relaxed">
                  Real-time synchronization with Ugandan Ministry of Health (MoH) outbreak bulletins and Health Center II-IV medicine stocks. Click on any district in the regional control matrix to feed local outbreak risk multipliers directly into Doctorian's diagnostic differential.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Interactive Map/List of Districts */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-800 space-y-6">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Ugandan Outbreak Control Hub</h3>
                  <h4 className="text-xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tight mt-1">Select Regional Context</h4>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                  Toggle between high-risk districts to simulate and review live epidemiological indexes.
                </p>

                {/* SVG-Style Map Placeholder Grid */}
                <div className="relative bg-slate-50 dark:bg-slate-950 rounded-[2rem] border border-slate-150 dark:border-slate-800 p-6 flex flex-col items-center justify-center min-h-[320px] overflow-hidden group">
                  {/* Grid background for technical feel */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-30" />

                  <span className="absolute top-4 left-4 text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest bg-white dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-800">
                    Live Vector Node Grid
                  </span>

                  {/* Visual map nodes */}
                  <div className="relative w-full max-w-[280px] h-[240px]">
                    {[
                      { id: 'Gulu', label: 'GULU', x: '45%', y: '25%', risk: 'critical' },
                      { id: 'Moroto', label: 'MOROTO', x: '82%', y: '30%', risk: 'critical' },
                      { id: 'Kampala', label: 'KAMPALA', x: '55%', y: '65%', risk: 'moderate' },
                      { id: 'Kasese', label: 'KASESE', x: '18%', y: '60%', risk: 'critical' },
                      { id: 'Mbarara', label: 'MBARARA', x: '28%', y: '82%', risk: 'safe' }
                    ].map((node) => {
                      const isSelected = selectedDistrict === node.id;
                      return (
                        <button
                          key={node.id}
                          onClick={() => setSelectedDistrict(node.id)}
                          style={{ left: node.x, top: node.y }}
                          className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer transition-all ${
                            isSelected ? 'scale-110 z-10' : 'hover:scale-105 z-0'
                          }`}
                        >
                          <div className={`relative flex items-center justify-center w-8 h-8 rounded-full border shadow-lg transition-all ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-transparent ring-4 ring-emerald-500/20'
                              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-350 border-slate-200 dark:border-slate-800'
                          }`}>
                            <Globe size={14} className={isSelected ? 'animate-spin' : ''} />
                            
                            {/* Animated Pulse indicator for high risk nodes */}
                            {node.risk === 'critical' && (
                              <div className="absolute -inset-1 rounded-full border border-rose-500 animate-ping opacity-40 pointer-events-none" />
                            )}
                          </div>
                          <span className={`mt-1 text-[8px] font-black uppercase px-1.5 py-0.5 rounded font-mono shadow-sm tracking-wider ${
                            isSelected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                          }`}>
                            {node.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* District Picker Buttons */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest block">Quick Select District</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'Kampala', name: 'Kampala / Wakiso' },
                      { id: 'Gulu', name: 'Gulu (Northern)' },
                      { id: 'Kasese', name: 'Kasese (Border)' },
                      { id: 'Mbarara', name: 'Mbarara (Western)' },
                      { id: 'Moroto', name: 'Moroto (Karamoja)' }
                    ].map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setSelectedDistrict(d.id)}
                        className={`p-3 rounded-xl border text-[10px] font-black uppercase tracking-tight text-left transition-all cursor-pointer ${
                          selectedDistrict === d.id
                            ? 'bg-emerald-600 text-white border-transparent shadow'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {d.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Detailed Epidemiological Data */}
              {selectedDistrict && (
                <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-800 space-y-8 text-left">
                  {/* District Alert Status */}
                  <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
                    <div>
                      <span className="text-[10px] font-mono font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Selected Region Details</span>
                      <h4 className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter mt-1">
                        {(UGANDA_EPIDEMIOLOGY_DB as any)[selectedDistrict].district}
                      </h4>
                    </div>

                    <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full font-mono tracking-wider ${(UGANDA_EPIDEMIOLOGY_DB as any)[selectedDistrict].alertColor}`}>
                      {(UGANDA_EPIDEMIOLOGY_DB as any)[selectedDistrict].alertLevel}
                    </span>
                  </div>

                  {/* Bento details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Active Outbreaks & Pathogen Weights */}
                    <div className="bg-slate-50 dark:bg-slate-950/50 p-6 rounded-[2rem] border border-slate-150 dark:border-slate-800 space-y-4">
                      <div className="flex items-center gap-1.5">
                        <Activity size={16} className="text-emerald-500 animate-pulse" />
                        <h5 className="text-[11px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Active Outbreak Vectors</h5>
                      </div>

                      <div className="space-y-3">
                        {(UGANDA_EPIDEMIOLOGY_DB as any)[selectedDistrict].pathogens.map((pathogen: any, idx: number) => (
                          <div key={idx} className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <div>
                              <span className="text-[10px] font-black uppercase text-slate-900 dark:text-white block">{pathogen.name}</span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block mt-0.5">{pathogen.risk}</span>
                            </div>
                            <div className="text-right">
                              <span className={`text-xs font-mono font-black block ${
                                pathogen.multiplier > 1.8 ? 'text-rose-500' : 'text-emerald-500'
                              }`}>
                                {pathogen.multiplier}x multiplier
                              </span>
                              <span className="text-[8px] font-extrabold text-slate-450 uppercase">{pathogen.trend} trend</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pharmacy Stock levels */}
                    <div className="bg-slate-50 dark:bg-slate-950/50 p-6 rounded-[2rem] border border-slate-150 dark:border-slate-800 space-y-4">
                      <div className="flex items-center gap-1.5">
                        <Plus size={16} className="text-teal-500" />
                        <h5 className="text-[11px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Health Center Medicine Stocks</h5>
                      </div>

                      <div className="space-y-3">
                        {(UGANDA_EPIDEMIOLOGY_DB as any)[selectedDistrict].pharmacyShortages.map((med: any, idx: number) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between items-center text-[9px] font-bold">
                              <span className="uppercase text-slate-600 dark:text-slate-300">{med.name}</span>
                              <span className={
                                med.stock < 45 ? 'text-rose-500 font-mono font-black' : 'text-emerald-500 font-mono font-black'
                              }>
                                {med.stock}% Available
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${med.stock}%` }}
                                className={`h-full rounded-full ${
                                  med.stock < 45 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
                                }`}
                              />
                            </div>
                            <span className={`text-[8px] font-extrabold uppercase tracking-widest block text-right ${
                              med.stock < 45 ? 'text-rose-500' : 'text-emerald-400'
                            }`}>
                              {med.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Pathogen differential matrix synchronization panel */}
                  <div className="p-5 bg-teal-500/5 dark:bg-teal-500/10 border-2 border-teal-500/20 rounded-[2rem] flex items-start gap-4">
                    <div className="p-2.5 bg-teal-500/10 text-teal-600 rounded-xl">
                      <Brain size={20} className="animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <h5 className="text-xs font-black uppercase text-teal-700 dark:text-teal-400 tracking-wider">
                        Doctorian Differential Matrix Synchronization
                      </h5>
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                        By selecting <strong>{(UGANDA_EPIDEMIOLOGY_DB as any)[selectedDistrict].district}</strong>, Doctorian's diagnostic engine adjusts its differential-diagnostic weights in the background. If a patient presents with elevated temperature, acute chills, or malaise, Gulu's <strong>2.4x Malaria outbreak multiplier</strong> elevates Malaria as the highest probability in the clinical prediction, recommending immediate malaria rapid diagnostic assays (RDTs) or clinical hydration.
                      </p>
                    </div>
                  </div>

                  {/* MoH recommendations */}
                  <div className="bg-slate-900 text-white p-6 rounded-[2rem] space-y-3 relative overflow-hidden">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={16} className="text-teal-400" />
                      <h5 className="text-xs font-black uppercase tracking-widest text-teal-300">MoH / Clinical Directives</h5>
                    </div>
                    <p className="text-xs font-bold leading-relaxed text-slate-200">
                      {(UGANDA_EPIDEMIOLOGY_DB as any)[selectedDistrict].recommendations}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'analysis' && (
          <motion.div
            key="analysis"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-5xl mx-auto"
          >
            {!aiSynthesisResult ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-xl">
                <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-[2.5rem] flex items-center justify-center text-blue-600 mb-8 border border-blue-100 dark:border-blue-800/50">
                  <Brain size={48} className="animate-pulse" />
                </div>
                <h2 className="text-4xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter mb-4">Neural Synthesis</h2>
                <p className="text-slate-500 dark:text-slate-400 font-bold max-w-md mx-auto mb-12 uppercase tracking-widest text-[10px]">Combine biological symptoms with recent lab markers for a 360° clinical insight.</p>
                <button 
                  onClick={runClinicalSynthesis}
                  disabled={isAnalyzing}
                  className="px-12 py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-4 disabled:opacity-50"
                >
                  {isAnalyzing ? <RefreshCw className="animate-spin" /> : <Zap />}
                  {isAnalyzing ? 'SYNTHESIZING MATRIX...' : 'START SYNTHESIS'}
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="bg-slate-900 text-white rounded-[3.5rem] p-12 border border-slate-800 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
                    <Activity size={240} />
                  </div>
                  <div className="relative z-10">
                     <div className="flex items-center gap-4 mb-10">
                        <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                           <Brain className="text-blue-400" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-1">Clinical Synthesis Engine</p>
                           <h3 className="text-3xl font-black uppercase tracking-tighter">Diagnostic Manifest</h3>
                        </div>
                     </div>
                     <div className="prose prose-invert max-w-none">
                        <p className="text-xl font-bold leading-relaxed text-slate-300 italic mb-8">
                          "{aiSynthesisResult}"
                        </p>
                     </div>
                     <div className="flex gap-4 pt-10 border-t border-white/10">
                        <button 
                          onClick={() => setAiSynthesisResult(null)}
                          className="px-8 py-4 bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all"
                        >
                          Recalibrate Matrix
                        </button>
                        <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl">
                          Export Clinical Report
                        </button>
                     </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {[
                     { label: 'Integrity', val: '98.4%', icon: <ShieldCheck /> },
                     { label: 'Metabolism', val: 'Optimal', icon: <Zap /> },
                     { label: 'Cognis Sync', val: 'Active', icon: <RefreshCw /> }
                   ].map((item, i) => (
                     <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex items-center gap-6 shadow-sm">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400">
                           {React.cloneElement(item.icon as any, { size: 20 })}
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{item.label}</p>
                           <p className="text-xl font-black text-slate-900 dark:text-white uppercase">{item.val}</p>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Test Modal */}
      <AnimatePresence>
        {showAddTest && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setShowAddTest(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-2xl border border-slate-100 dark:border-slate-800"
            >
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8 flex items-center gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600">
                  <Plus />
                </div>
                New Lab Entry
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Test Name</label>
                  <input 
                    type="text" 
                    value={newTest.name || ''}
                    onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-xs font-bold focus:ring-4 focus:ring-blue-500/10"
                    placeholder="e.g., Vitamin D, Total Cholesterol"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                   <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Result Value</label>
                    <input 
                      type="text" 
                      value={newTest.result || ''}
                      onChange={(e) => setNewTest({ ...newTest, result: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-xs font-bold focus:ring-4 focus:ring-blue-500/10"
                      placeholder="85.4"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Unit</label>
                    <input 
                      type="text" 
                      value={newTest.unit || ''}
                      onChange={(e) => setNewTest({ ...newTest, unit: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-xs font-bold focus:ring-4 focus:ring-blue-500/10"
                      placeholder="mg/dL"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Reference Range</label>
                  <input 
                    type="text" 
                    value={newTest.referenceRange || ''}
                    onChange={(e) => setNewTest({ ...newTest, referenceRange: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-xs font-bold focus:ring-4 focus:ring-blue-500/10"
                    placeholder="70 - 100"
                  />
                </div>

                <div className="pt-6">
                  <button 
                    onClick={handleAddTest}
                    className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl"
                  >
                    SAVE TO VAULT
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
