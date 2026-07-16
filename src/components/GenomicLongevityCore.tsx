import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dna, Activity, Shield, Sparkles, Brain, Loader2, 
  Settings2, Info, ArrowRight, Zap, RefreshCw, BarChart2,
  Trash2, Plus, Sliders, Pill, Heart, FileText, CheckCircle2,
  ChevronRight, Search, AlertTriangle, HelpCircle, Check, 
  Wifi, WifiOff, Globe, Download, Copy
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, AreaChart, Area, RadarChart, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import { api } from '../api';
import { isCreditsUnlimited, parseCreditsToNumber, formatCredits, safeDeductCredits } from '../utils/creditUtils';

interface GenomicLongevityCoreProps {
  user: any;
  onUpdateUser?: (updated: any) => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

// Expansive database of medications for CYP450 pathways
const CYP450_DRUG_DATABASE = [
  { 
    name: 'Metoprolol', 
    pathway: 'CYP2D6', 
    targetGene: 'CYP2D6',
    severity: 'moderate', 
    alert: 'Elevated plasma concentration. Risk of severe bradycardia and hypotension.',
    alternative: 'Atenolol or Carvedilol (less CYP2D6 reliance)',
    details: 'Metoprolol relies significantly on hepatic clearance via CYP2D6. Poor metabolizers exhibit up to 5-fold higher systemic exposure than normal metabolizers.'
  },
  { 
    name: 'Codeine', 
    pathway: 'CYP2D6', 
    targetGene: 'CYP2D6',
    severity: 'critical', 
    alert: 'Codeine is a prodrug requiring CYP2D6 to convert into active Morphine. Totally ineffective.',
    alternative: 'Morphine, Hydrocodone, or Ibuprofen',
    details: 'Poor metabolizers fail to convert codeine to its active anesthetic conjugate, offering zero pain relief. Ultra-rapid metabolizers risk acute respiratory depression from rapid morphine accumulation.'
  },
  { 
    name: 'Clopidogrel', 
    pathway: 'CYP2C19', 
    targetGene: 'CYP2C19',
    severity: 'critical', 
    alert: 'Requires CYP2C19 activation. Reduced therapeutic efficacy increases major cardiovascular event risks.',
    alternative: 'Prasugrel or Ticagrelor',
    details: 'Clopidogrel requires biotransformation to its active metabolite. Intermediate and poor metabolizers show significantly reduced antiplatelet responses.'
  },
  { 
    name: 'Warfarin', 
    pathway: 'CYP2C9', 
    targetGene: 'CYP2C9',
    severity: 'critical', 
    alert: 'Highly sensitive clearance. Increased accumulation risk and severe bleeding vulnerability.',
    alternative: 'Apixaban, Rivaroxaban, or reduced start doses',
    details: 'CYP2C9 and VKORC1 variants account for up to 40% of warfarin dose variability. Poor metabolizers have high risk of toxic tissue accumulation.'
  },
  { 
    name: 'Omeprazole', 
    pathway: 'CYP2C19', 
    targetGene: 'CYP2C19',
    severity: 'low', 
    alert: 'Ultra-rapid clearance reduces gastric acid suppression and efficacy.',
    alternative: 'Rabeprazole or Pantoprazole',
    details: 'Omeprazole undergoes rapid hydroxylation primarily via CYP2C19. In ultra-rapid metabolizers, duplicate dosing or switching to Rabeprazole is recommended.'
  },
  { 
    name: 'Duloxetine', 
    pathway: 'CYP2D6', 
    targetGene: 'CYP2D6',
    severity: 'moderate', 
    alert: 'Elevated systemic exposure. High probability of adverse neuropsychiatric side-effects.',
    alternative: 'Sertraline or Venlafaxine',
    details: 'CYP2D6 inhibition or poor metabolizer phenotype increases Duloxetine concentration, elevating serotonin toxicity or severe headache risks.'
  },
  { 
    name: 'Ibuprofen', 
    pathway: 'CYP2C9', 
    targetGene: 'CYP2C9',
    severity: 'low', 
    alert: 'Slightly lowered renal clearance. Prolonged usage increases gastrointestinal strain.',
    alternative: 'Acetaminophen / Paracetamol',
    details: 'Ibuprofen is metabolized primarily by CYP2C9. Slow metabolizers experience prolonged half-lives, increasing risk of gastric lining irritations.'
  },
  { 
    name: 'Tamoxifen', 
    pathway: 'CYP2D6', 
    targetGene: 'CYP2D6',
    severity: 'critical', 
    alert: 'Severely reduced conversion to active Endoxifen. High risk of treatment failure.',
    alternative: 'Anastrozole or Letrozole (Aromatase inhibitors)',
    details: 'CYP2D6 poor metabolizers cannot properly activate Tamoxifen, leading to reduced therapeutic protection in estrogen-receptor-positive breast oncology.'
  },
];

// Presets for clinical text templates
const CLINICAL_TEMPLATES = [
  {
    title: '🧠 Cognitive & ApoE4 Focus',
    description: 'Optimize lipid transport, neuronal sirt-1, and cellular autophagy.',
    notes: 'APOE e3/e4 heterozygous profile identified. Focus on sirtuin blood-brain barrier pathway co-factors, ketone utilization optimization, and deep glymphatic clearance.'
  },
  {
    title: '🫀 Cardio-Methylation Core',
    description: 'Support blood flow, manage homocysteine, and counter inflammation.',
    notes: 'Homozygous MTHFR C677T variant. Epigenetic goals include managing elevated baseline homocysteine, improving active folate synthesis, and cooling systemic hs-CRP.'
  },
  {
    title: '🧬 Metabolic Sirtuin Catalyst',
    description: 'Trigger insulin sensitivity, bypass glycation, and stimulate autophagy.',
    notes: 'HbA1c trending above 5.6% showing initial somatic glycation. Focus on AMPK energetic activation, sirtuin nuclear recovery, and targeted caloric restriction mimics.'
  }
];

export const GenomicLongevityCore: React.FC<GenomicLongevityCoreProps> = ({ 
  user, 
  onUpdateUser,
  onShowToast 
}) => {
  const [activeTab, setActiveTab] = useState<'clock' | 'pharmacology' | 'simulation' | 'synth'>('clock');
  
  // Offline toggle status
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  
  // Epigenetic clock inputs
  const [chronologicalAge, setChronologicalAge] = useState<number>(38);
  const [mthfrState, setMthfrState] = useState<string>('c677t_hetero'); // hetero, homo, wild
  const [hsCRP, setHsCRP] = useState<number>(1.2); // inflammation maker
  const [hba1c, setHba1c] = useState<number>(5.4); // glycation marker
  const [telomereLength, setTelomereLength] = useState<number>(7.2); // kilobases
  
  // Pharmacogenomics interactives
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDrugName, setSelectedDrugName] = useState<string>('Codeine');
  const [customGeneCYP2D6, setCustomGeneCYP2D6] = useState<string>('Poor Metabolizer');
  const [customGeneCYP2C19, setCustomGeneCYP2C19] = useState<string>('Ultra-rapid Metabolizer');
  const [customGeneCYP2C9, setCustomGeneCYP2C9] = useState<string>('Intermediate Metabolizer');
  
  // Drug-Drug & Herbal Interaction Engine States
  const [selectedDdaA, setSelectedDdaA] = useState<string>('Codeine');
  const [selectedDdaB, setSelectedDdaB] = useState<string>('Fluoxetine');

  // Bio-simulation sliders
  const [nadPrecursors, setNadPrecursors] = useState<number>(250); // mg/day
  const [deepSleep, setDeepSleep] = useState<number>(1.5); // hrs/night
  const [caloricRestriction, setCaloricRestriction] = useState<number>(10); // % restriction
  const [complianceActive, setComplianceActive] = useState<boolean>(false); // therapeutic trigger

  // AI Generation State
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [synthResult, setSynthResult] = useState<string>('');
  const [personalizedNotes, setPersonalizedNotes] = useState<string>('');

  // Local helper to handle credit check and deduction
  const deductCredits = async (amount: number, operationName: string): Promise<boolean> => {
    // If in offline simulated mode, bypass credits and run offline calculation
    if (isOfflineMode) {
      return true;
    }
    const currentCredits = parseCreditsToNumber(user?.credits);
    const isUnlimited = isCreditsUnlimited(user?.credits);
    if (currentCredits < amount && !isUnlimited) {
      if (onShowToast) {
        onShowToast(`Insufficient credit balance. ${operationName} requires ${amount} Neural credits (Remaining: ${formatCredits(user?.credits)}).`, 'error');
      }
      return false;
    }
    
    try {
      if (onUpdateUser) {
        const nextCredits = safeDeductCredits(user?.credits, amount);
        onUpdateUser({ ...user, credits: nextCredits });
      }
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  // 1. Epigenetic biological age calculator algorithm (PhenoAge formulation mimic)
  const biologicalAgeData = useMemo(() => {
    let bioOffset = 0;
    
    // MTHFR mutations slow down methylation cycles, shifting biological profile
    if (mthfrState === 'c677t_homo') bioOffset += 3.8;
    else if (mthfrState === 'c677t_hetero') bioOffset += 1.4;
    else bioOffset -= 0.8;

    // Glycation index modifications (HbA1c)
    if (hba1c > 5.7) bioOffset += (hba1c - 5.7) * 4.5;
    else bioOffset -= (5.7 - hba1c) * 1.0;

    // Inflammatory marker coefficients (hsCRP)
    if (hsCRP > 1.0) bioOffset += (hsCRP - 1.0) * 2.2;
    else bioOffset -= 0.5;

    // Telomeric degradation calculation
    const telomereDiff = 7.5 - telomereLength; 
    bioOffset += telomereDiff * 3.0;

    const finalBioAge = Math.max(18, parseFloat((chronologicalAge + bioOffset).toFixed(1)));
    const ageDeviation = parseFloat((finalBioAge - chronologicalAge).toFixed(1));

    return {
      bioAge: finalBioAge,
      deviation: ageDeviation,
      status: ageDeviation > 2 ? 'Accelerated Senescence' : ageDeviation < -2 ? 'Decelerated Longevity' : 'Metabolically Balanced',
      color: ageDeviation > 2 ? 'text-rose-600 dark:text-rose-450' : ageDeviation < -2 ? 'text-emerald-600 dark:text-emerald-450' : 'text-blue-600 dark:text-blue-400',
      bgColor: ageDeviation > 2 ? 'bg-rose-50 dark:bg-rose-950/20' : ageDeviation < -2 ? 'bg-emerald-50 dark:bg-emerald-950/20' : 'bg-blue-50 dark:bg-blue-950/20',
      borderColor: ageDeviation > 2 ? 'border-rose-200 dark:border-rose-900/50' : ageDeviation < -2 ? 'border-emerald-200 dark:border-emerald-900/50' : 'border-blue-200 dark:border-blue-900/50',
      progressPercent: Math.min(100, Math.max(20, (finalBioAge / chronologicalAge) * 100))
    };
  }, [chronologicalAge, mthfrState, hsCRP, hba1c, telomereLength]);

  // Epigenetic diagnostic alerts & protocols computed dynamically
  const epigeneticClinicalReport = useMemo(() => {
    const alerts = [];
    if (mthfrState !== 'wild') {
      alerts.push({
        title: 'MTHFR Methylation Attenuation',
        severity: mthfrState === 'c677t_homo' ? 'CRITICAL' : 'MODERATE',
        description: `Your variant limits basic cellular methylation processes by ${mthfrState === 'c677t_homo' ? '65%' : '30%'}. This reduces DNA damage repair cycles.`,
        protocol: 'Bypass standard folic acid. Emphasize high-absorption L-Methylfolate (5-MTHF) and Methylcobalamin (B12).'
      });
    }
    if (hba1c >= 5.5) {
      alerts.push({
        title: 'Somatic Glycation Index Elevation',
        severity: hba1c >= 5.8 ? 'CRITICAL' : 'MODERATE',
        description: `HbA1c level of ${hba1c}% suggests active generation of Advanced Glycation End-products (AGEs), creating connective stiffening.`,
        protocol: 'Implement biological AMPK pathways via active compound Alpha-Lipoic Acid, Benfotiamine, or simulated intermittent fasting.'
      });
    }
    if (hsCRP > 1.0) {
      alerts.push({
        title: 'Systemic Micro-Inflammation Load',
        severity: hsCRP > 2.0 ? 'CRITICAL' : 'MODERATE',
        description: `Interferes with endothelial microvascular function and increases vascular senescence biomarkers.`,
        protocol: 'Introduce omega-3 fatty acids (EPA/DHA > 2000mg/day), curcumin, and strict deep circadian recovery support.'
      });
    }
    if (telomereLength < 7.0) {
      alerts.push({
        title: 'Accelerated Telomeric Degradation',
        severity: 'MODERATE',
        description: `Telomere segment length of ${telomereLength} kb is below optimal senescence buffers.`,
        protocol: 'Combat telomeric attrition by maximizing mitochondrial NAD+ output and optimizing caloric ratios.'
      });
    }
    return alerts;
  }, [mthfrState, hba1c, hsCRP, telomereLength]);

  // Dynamic enzyme mapping based on custom inputs
  const currentGenotypeProfile = useMemo(() => {
    return {
      CYP2D6: customGeneCYP2D6,
      CYP2C19: customGeneCYP2C19,
      CYP2C9: customGeneCYP2C9
    };
  }, [customGeneCYP2D6, customGeneCYP2C19, customGeneCYP2C9]);

  // Interactive pharmacology output based on selected drug and enzyme
  const drugInteractiveReport = useMemo(() => {
    const drug = CYP450_DRUG_DATABASE.find(d => d.name === selectedDrugName);
    if (!drug) return null;

    const assignedPhenotype = currentGenotypeProfile[drug.targetGene as keyof typeof currentGenotypeProfile] || 'Normal Metabolizer';
    
    // Recalculate risk clinical metrics according to dynamic gene phenotype selection
    let severity = 'low';
    let advisoryAlert = 'Drug clearance behaves in highly predictable parameters.';
    let overrideAlternative = drug.alternative;
    
    if (drug.targetGene === 'CYP2D6') {
      if (assignedPhenotype === 'Poor Metabolizer') {
        severity = drug.name === 'Codeine' || drug.name === 'Tamoxifen' ? 'critical' : 'moderate';
        advisoryAlert = drug.name === 'Codeine' 
          ? 'Ineffective. Underwent zero biotransformation into morphine due to CYP2D6 metabolizer deficit.' 
          : drug.name === 'Tamoxifen' 
            ? 'Critical efficacy danger. Absolute barrier converting Tamoxifen to Endoxifen active drug.'
            : 'Slow metabolic clearance triggers compound accumulation and side-effect vulnerability.';
      } else if (assignedPhenotype === 'Ultra-rapid Metabolizer') {
        severity = drug.name === 'Codeine' ? 'critical' : 'moderate';
        advisoryAlert = drug.name === 'Codeine'
          ? 'Highest respiratory risk! Codeine converts into Morphine within minutes in dangerous bulk amounts.'
          : 'High dosage needed. Exceeding clear limits of efficacy. Requires alternate metabolic route.';
      } else if (assignedPhenotype === 'Intermediate Metabolizer') {
        severity = 'moderate';
        advisoryAlert = 'Moderately lower clearance speed. Keep medication dosing at lower clinical endpoints.';
      }
    } else if (drug.targetGene === 'CYP2C19') {
      if (assignedPhenotype === 'Poor Metabolizer') {
        severity = drug.name === 'Clopidogrel' ? 'critical' : 'moderate';
        advisoryAlert = drug.name === 'Clopidogrel'
          ? 'Lacking active compound release. Increased danger of arterial occlusion and stent thrombosis.'
          : 'Toxic systemic accumulation risk. Standard clinical dosage represents danger.';
      } else if (assignedPhenotype === 'Ultra-rapid Metabolizer') {
        severity = 'moderate';
        advisoryAlert = drug.name === 'Omeprazole'
          ? 'Extreme metabolic breakdown. Antacid suppression behaves up to 60% lower than desired.'
          : 'Extremely fast breakdown limits targeted drug half-life.';
      } else if (assignedPhenotype === 'Intermediate Metabolizer') {
        severity = 'moderate';
        advisoryAlert = 'Cautionary slow activation rate. Slight reduction in absolute drug safety thresholds.';
      }
    } else if (drug.targetGene === 'CYP2C9') {
      if (assignedPhenotype === 'Poor Metabolizer') {
        severity = 'critical';
        advisoryAlert = drug.name === 'Warfarin'
          ? 'EXTREME bleeding danger. Clearance is almost offline. Reduce dosage by 60% or avoid entirely.'
          : 'Severe renal / gastric load. Extremely slow clearance triggers systemic compound build-up.';
      } else if (assignedPhenotype === 'Intermediate Metabolizer') {
        severity = 'moderate';
        advisoryAlert = 'Moderately slower metabolic index. Tight bleeding tracking (INR) is mandatory.';
      } else if (assignedPhenotype === 'Ultra-rapid Metabolizer') {
        severity = 'low';
        advisoryAlert = 'Faster clearance decreases absolute half-life. Slight potential dosage adjustments.';
      }
    }

    return {
      ...drug,
      phenotype: assignedPhenotype,
      computedSeverity: severity,
      computedAlert: advisoryAlert,
      alternative: overrideAlternative
    };
  }, [selectedDrugName, currentGenotypeProfile]);

  // Filtered drug database matching search query
  const filteredDrugList = useMemo(() => {
    return CYP450_DRUG_DATABASE.filter(d => 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.pathway.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Drug-Drug & Traditional Medicine (Herbal) Interaction Calculation
  const drugDrugInteraction = useMemo(() => {
    const itemA = selectedDdaA;
    const itemB = selectedDdaB;
    if (!itemA || !itemB) return null;

    let severity: 'critical' | 'moderate' | 'safe' = 'safe';
    let title = "No Significant Interaction";
    let description = "These substances utilize separate clearance pathways or do not exhibit competitive enzyme inhibition. Standard dosing protocols remain valid.";
    let mechanism = "Clearance operates within normal, independent pharmacokinetic limits.";
    let action = "Continue routine monitoring. No dosage adjustments required.";

    if (itemA === 'Clopidogrel') {
      if (itemB === 'Artemisia') {
        severity = 'critical';
        title = 'Critical Prodrug Activation Failure';
        mechanism = 'Artemisia is a potent inhibitor of CYP2C19, the main enzyme required to convert Clopidogrel into its active antiplatelet form.';
        description = 'Concurrent use of Artemisia prevents clopidogrel activation, leaving the patient unprotected against arterial clotting and stent thrombosis.';
        action = 'Discontinue Artemisia immediately. Consider alternative antiplatelet (Prasugrel) or substitute Artemisia with standard antimalarials.';
      } else if (itemB === "St. John's Wort") {
        severity = 'moderate';
        title = 'Accelerated Activation & Increased Bleed Risk';
        mechanism = "St. John's Wort is a strong inducer of CYP2C19, accelerating the conversion of Clopidogrel to its active antiplatelet form.";
        description = 'Faster conversion can increase systemic antiplatelet concentration, elevating microvascular bleeding risk.';
        action = 'Monitor closely for bruising. Avoid St. John\'s Wort or utilize alternative therapy.';
      }
    }

    if (itemA === 'Warfarin') {
      if (itemB === 'Neem Leaf') {
        severity = 'moderate';
        title = 'Reduced Anticoagulant Efficacy';
        mechanism = 'Neem Leaf induces CYP3A4 and inhibits CYP2C9, altering the complex stereoselective metabolism of Warfarin.';
        description = 'Can decrease warfarin half-life and lower INR levels, increasing the risk of thromboembolism.';
        action = 'Avoid Neem Leaf during Warfarin therapy. Perform serial INR monitoring if co-administered.';
      } else if (itemB === 'Warburgia') {
        severity = 'critical';
        title = 'Severe Bleeding Hazard';
        mechanism = 'Warburgia ugandensis is a potent inhibitor of CYP2C9, which clears active S-Warfarin.';
        description = 'Blocks Warfarin clearance, leading to extreme accumulation, highly elevated INR, and severe internal hemorrhage risks.';
        action = 'Strictly avoid Warburgia ugandensis. Substitute with non-interacting traditional remedies or safer analgesics.';
      } else if (itemB === 'Aspirin') {
        severity = 'critical';
        title = 'High Synergistic Bleed Risk';
        mechanism = 'Pharmacodynamic synergy. Both drugs inhibit separate pathways of coagulation (platelet aggregation vs. clotting factor synthesis).';
        description = 'Extremely elevated risk of gastrointestinal bleeding or systemic hemorrhage without altering INR directly.';
        action = 'Only combine under strict clinical supervision with gastric protection. otherwise, avoid Aspirin.';
      }
    }

    if (itemA === 'Codeine') {
      if (itemB === 'Fluoxetine') {
        severity = 'critical';
        title = 'Complete Anesthetic Blockade';
        mechanism = 'Fluoxetine is an extremely potent inhibitor of CYP2D6, the sole pathway converting Codeine to active Morphine.';
        description = 'Renders codeine completely ineffective for analgesia, offering zero pain control while retaining normal side-effects (constipation, nausea).';
        action = 'Avoid Fluoxetine or switch pain medication to Morphine, Oxycodone, or standard NSAIDs.';
      } else if (itemB === 'Warburgia') {
        severity = 'moderate';
        title = 'Diminished Analgesic Conversion';
        mechanism = 'Warburgia ugandensis inhibits CYP2D6, slowing the conversion of Codeine to its active Morphine conjugate.';
        description = 'Reduces the efficiency of pain management, leading to persistent breakthrough pain.';
        action = 'Substitute Warburgia ugandensis with non-inhibitory remedies or use direct analgesics like Paracetamol.';
      }
    }

    if (itemA === 'Metoprolol') {
      if (itemB === 'Fluoxetine') {
        severity = 'critical';
        title = 'Severe Bradycardia Risk';
        mechanism = 'Fluoxetine inhibits CYP2D6, blocking the primary hepatic pathway for Metoprolol clearance.';
        description = 'Raises Metoprolol serum concentrations by up to 400%, leading to profound bradycardia, hypotension, and risk of cardiogenic shock.';
        action = 'Strictly avoid co-administration. Monitor heart rate continuously. Consider carvedilol or non-interacting SSRIs.';
      } else if (itemB === 'Moringa') {
        severity = 'moderate';
        title = 'Enhanced Beta-Blocker Exposure';
        mechanism = 'Moringa oleifera moderately inhibits CYP2D6 activity.';
        description = 'Slowing of metoprolol clearance may cause lower heart rates or orthostatic hypotension during initiation.';
        action = 'Monitor blood pressure and pulse. Adjust metoprolol dosage if fatigue or bradycardia occurs.';
      } else if (itemB === 'Erythromycin') {
        severity = 'moderate';
        title = 'Increased Cardiotoxic Potential';
        mechanism = 'Erythromycin inhibits CYP3A4, which handles secondary shunt clearance for Metoprolol.';
        description = 'Can cause minor accumulation and prolongs QT interval synergistically.';
        action = 'Avoid macrolides; prefer Amoxicillin or Azithromycin (low CYP3A4 inhibition).';
      }
    }

    if (itemA === 'Ibuprofen') {
      if (itemB === 'Neem Leaf') {
        severity = 'moderate';
        title = 'Altered NSAID Clearance';
        mechanism = 'Neem Leaf inhibits CYP2C9, the primary metabolizer of Ibuprofen.';
        description = 'Increases Ibuprofen half-life, raising the risk of gastropathy, dyspepsia, or acute kidney injury.';
        action = 'Limit Ibuprofen dose and duration. Avoid concurrent use of Neem Leaf preparations.';
      } else if (itemB === 'Aspirin') {
        severity = 'moderate';
        title = 'Competitive Platelet Inhibition & Gastric Load';
        mechanism = 'Both compete for the cyclooxygenase-1 (COX-1) active channel.';
        description = 'Ibuprofen blocks Aspirin from binding, reducing Aspirin\'s cardioprotective antiplatelet effect, and doubles gastric ulcer risk.';
        action = 'Take Aspirin at least 2 hours before Ibuprofen, or switch to Acetaminophen.';
      }
    }

    if (itemA === 'Duloxetine') {
      if (itemB === 'Fluoxetine') {
        severity = 'critical';
        title = 'Serotonin Syndrome Hazard';
        mechanism = 'Fluoxetine inhibits CYP2D6 (blocking Duloxetine clearance) and both synergistically raise synaptic serotonin.';
        description = 'High risk of hyperthermia, muscle rigidity, mental status changes, and autonomic instability (Serotonin Syndrome).';
        action = 'Strictly contraindicated. Washout periods are required before changing between these agents.';
      } else if (itemB === 'Moringa') {
        severity = 'moderate';
        title = 'Elevated Antidepressant Concentration';
        mechanism = 'Moringa inhibits CYP2D6, reducing Duloxetine hepatic clearance.';
        description = 'Increases side effects such as dry mouth, severe insomnia, or elevated blood pressure.';
        action = 'Reduce Duloxetine dosage or stop Moringa consumption.';
      }
    }

    if (itemA === 'Tamoxifen') {
      if (itemB === 'Fluoxetine') {
        severity = 'critical';
        title = 'Critical Breast Cancer Therapy Efficacy Loss';
        mechanism = 'Fluoxetine is a potent CYP2D6 inhibitor, blocking the conversion of Tamoxifen to Endoxifen (active metabolite).';
        description = 'Drastically lowers active drug concentration, rendering the breast cancer therapy highly ineffective.';
        action = 'Contraindicated. Change Fluoxetine to Venlafaxine or Escitalopram.';
      } else if (itemB === 'Moringa') {
        severity = 'moderate';
        title = 'Reduced Tamoxifen Activation';
        mechanism = 'Moringa moderately inhibits CYP2D6, interfering with active Endoxifen conversion.';
        description = 'Can reduce the therapeutic protection of Tamoxifen in long-term oncology care.';
        action = 'Avoid concurrent Moringa supplementation in patients undergoing Tamoxifen therapy.';
      }
    }

    return {
      severity,
      title,
      description,
      mechanism,
      action
    };
  }, [selectedDdaA, selectedDdaB]);

  // 2. Interactive Future Decadal Projections (Data for Line Charts)
  const projectionData = useMemo(() => {
    const points = [];
    
    const nadFactor = Math.min(1.5, nadPrecursors / 500); 
    const sleepFactor = Math.min(1.0, deepSleep / 2.0); 
    const caloricFactor = caloricRestriction / 30; // Max 30% caloric restriction
    const baselineDeceleration = 1.0 - (0.08 * nadFactor + 0.05 * sleepFactor + 0.12 * caloricFactor + (complianceActive ? 0.09 : 0));

    for (let years = 0; years <= 25; years += 5) {
      const bioAgeBaseline = biologicalAgeData.bioAge + years;
      const bioAgeOptimized = biologicalAgeData.bioAge + (years * baselineDeceleration);

      points.push({
        timeline: `+${years} Yrs`,
        "Baseline Senescence": parseFloat(bioAgeBaseline.toFixed(1)),
        "Optimized Lifespan": parseFloat(bioAgeOptimized.toFixed(1)),
      });
    }
    return points;
  }, [chronologicalAge, biologicalAgeData, nadPrecursors, deepSleep, caloricRestriction, complianceActive]);

  // Dynamic Live Bio-enzymatic Indicators calculated dynamically responsive to inputs
  const liveBioSimMetrics = useMemo(() => {
    const sirt1 = Math.round((nadPrecursors / 1000 * 55) + (deepSleep / 3.0 * 25) + (caloricRestriction / 30 * 20));
    const ampk = Math.round((caloricRestriction / 30 * 65) + ((nadPrecursors - 100) / 900 * 20) + (deepSleep / 3.0 * 15));
    const mtorSuppression = Math.round((caloricRestriction / 30 * 75) + (deepSleep / 3.0 * 25));
    const autophagyIndex = Math.round((ampk * 0.5) + (mtorSuppression * 0.5));
    const glymphaticCleansing = Math.round((deepSleep / 3.0 * 75) + (complianceActive ? 25 : 0));

    return { sirt1, ampk, mtorSuppression, autophagyIndex, glymphaticCleansing };
  }, [nadPrecursors, deepSleep, caloricRestriction, complianceActive]);

  // Radar metrics representing longevity markers
  const longevityRadarData = useMemo(() => {
    const methylationPower = mthfrState === 'wild' ? 95 : mthfrState === 'c677t_hetero' ? 65 : 35;
    const glycemicControl = Math.max(10, Math.min(100, 100 - (hba1c - 4.5) * 20));
    const inflammatoryControl = Math.max(10, Math.min(100, 100 - (hsCRP * 15)));
    const telomereIndex = Math.min(100, (telomereLength / 9.5) * 100);
    const coFactors = Math.min(100, 20 + (caloricRestriction * 2) + (nadPrecursors / 8));

    return [
      { subject: 'Methylation Cycle', value: methylationPower },
      { subject: 'Glycemic Balance', value: glycemicControl },
      { subject: 'Inflammation Index', value: inflammatoryControl },
      { subject: 'Telomere Integrity', value: telomereIndex },
      { subject: 'NAD+ Bio-availability', value: coFactors },
    ];
  }, [mthfrState, hba1c, hsCRP, telomereLength, caloricRestriction, nadPrecursors]);

  // AI Longevity Intervention blueprint offline model simulation generator.
  // This executes when offline, or when API has errors, to offer clinical utility!
  const getOfflineFailsafeReport = () => {
    let methylAdvice = mthfrState === 'wild' ? 'Methylation pathways are baseline stable.' : `MTHFR ${mthfrState === 'c677t_homo' ? 'Homozygous' : 'Heterozygous'} variant restricts DNA methylation repair core cycles. Avoid metabolic stressors and take sublingual L-Methylfolate.`;
    let glycationAdvice = hba1c > 5.5 ? `Elevated HbA1c of ${hba1c}% introduces high glucose cross-linking (advanced glycation). Ensure tight glycemic control.` : 'Glycemic glycation indices are optimally quiet.';
    let inflammatoryAdvice = hsCRP > 1.2 ? `Systemic inflammation status hs-CRP level of ${hsCRP} mg/L represents minor cardiac loading markers.` : 'hs-CRP load resides in clinical safe ranges.';
    
    return `==========================================
DOCTORIAN CLINICAL OFFLINE CO-ENGINE (V4.1)
GENOMIC LONGEVITY & EPIGENETIC SYNTHESIS DRAFT
==========================================

STATION: Offline Adaptive Mode Active
BIOMARKER MATRICES EVALUATED:
■ Epigenetic Bio-Age Metric: ${biologicalAgeData.bioAge} Years (Chronological: ${chronologicalAge})
■ Mutation Status (MTHFR Core Loci): ${mthfrState.toUpperCase()}
■ Glycation HbA1c Segment: ${hba1c}%
■ Attrition Ratio (Telomeres): ${telomereLength} kb

[1. CRITICAL LOCI RISK INTERPRETATION]
- Gap deviation: ${biologicalAgeData.deviation} years. This is clinical evidence of ${biologicalAgeData.deviation > 2 ? 'Accelerated Senescent Pathway and high cellular replication speeds.' : 'Decelerated somatic decay and sustained bio-survival states.'}
- Methylation cycle analysis: ${methylAdvice}
- Inflammatory indexation metrics: ${inflammatoryAdvice}

[2. MOLECULAR PHARMACEUTICAL & NUTRACEUTICAL PROTOCOL]
- SIRT1 & AMPK Co-Factor: Integrate ${nadPrecursors} mg support daily to elevate cellular NAD pools. Sustains mitochondria repair.
- Advanced Glycation Defense: ${glycationAdvice}
- Autophagy Catalyst: Active dietary restriction index placed at ${caloricRestriction}%. Autophagy triggered through cellular mTOR pathway suppression.

[3. PHARMACOGENOMIC EXCERPT]
- Select drug analyzed: ${selectedDrugName} (hepatic pathway gene: ${drugInteractiveReport?.targetGene || 'N/A'})
- Assigned genetic phenotype profile: ${drugInteractiveReport?.phenotype}
- Clearance impact advisory: ${drugInteractiveReport?.computedAlert}
- Recommended hepatic alternative: ${drugInteractiveReport?.alternative || 'None'}

==========================================
ALERT: Generated locally via Doctorian Heuristic Engine.
This provides 100% offline capability of diagnostic variables.
No network calls were dispatching to cloud nodes.`;
  };

  // AI Longevity Intervention synthesis routine
  const handleAIGenesis = async () => {
    setIsSynthesizing(true);
    setSynthResult('');
    
    const tokenCheck = await deductCredits(50, 'AI Genomic Synthesis');
    if (!tokenCheck) {
      setIsSynthesizing(false);
      return;
    }

    if (isOfflineMode) {
      // Direct, fast offline heuristic generation
      setTimeout(() => {
        setSynthResult(getOfflineFailsafeReport());
        setIsSynthesizing(false);
        if (onShowToast) {
          onShowToast('Synthesis generated successfully via local adaptive heuristic node.', 'success');
        }
      }, 1200);
      return;
    }

    try {
      const prompt = `Perform a full anti-aging longevity appraisal for a patient with the following biological criteria:
      - Chronological Age: ${chronologicalAge}
      - Estimated Epigenetic Bio-Age (PhenoAge Mimic): ${biologicalAgeData.bioAge}
      - DNA Methylation Status (MTHFR Gene): ${mthfrState}
      - Inflammatory Load (hs-CRP): ${hsCRP} mg/L
      - Glycation/Glucose Metric (HbA1c): ${hba1c}%
      - Telomeric Length Index: ${telomereLength} kb
      - Dietary Caloric Restriction Level: ${caloricRestriction}%
      - Daily NAD+ precursor dosing support: ${nadPrecursors} mg/day
      - Additional notes: ${personalizedNotes || 'None'}
      
      Provide a highly professional clinical summary including:
      1. CRITICAL LOCI RISK INTERPRETATION (Explain how their MTHFR, biological age gap and inflammatory index impact physiological longevity).
      2. TARGETED PHARMACEUTICAL/NUTRACEUTICAL SYNERGY (Propose specific molecular targets like AMPK, sirtuins, mTOR or cellular methylation support).
      3. CRITICAL PHARMACOGENOMIC SAFETY (Briefly note CYP450 safety guidelines).
      Do not diagnose or promise health outcomes. Keep it professional, structured, and clinically actionable.`;

      const response = await api.ai.aiChat([
        { role: 'user', text: prompt }
      ]);

      if (response && response.text) {
        setSynthResult(response.text);
        if (onShowToast) {
          onShowToast('Molecular Lifespan Report generated successfully. 50 Neural credits debited.', 'success');
        }
      } else {
        throw new Error('Synthesis payload empty');
      }
    } catch (err: any) {
      console.error(err);
      // Failsafe fallback
      setSynthResult(getOfflineFailsafeReport());
      if (onShowToast) {
        onShowToast('Cloud API inaccessible. Switched to offline heuristic generator.', 'info');
      }
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleCopyReport = () => {
    if (!synthResult) return;
    navigator.clipboard.writeText(synthResult);
    if (onShowToast) onShowToast('Report copied to clipboard!', 'success');
  };

  const selectTemplate = (notesText: string) => {
    setPersonalizedNotes(notesText);
    if (onShowToast) onShowToast('Clinical clinical template applied.', 'info');
  };

  return (
    <div id="genomic-longevity-panel" className="w-full text-slate-800 dark:text-slate-100 font-sans p-2 sm:p-6 lg:p-8 animate-fade-in max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8 border-b border-slate-200 dark:border-slate-800 pb-6 text-center xl:text-left">
        <div className="flex flex-col items-center xl:items-start w-full xl:w-auto">
          <div className="flex flex-wrap items-center justify-center xl:justify-start gap-3 mb-2 w-full">
            <span className="p-1.5 bg-blue-500/10 dark:bg-blue-400/10 rounded-lg text-blue-600 dark:text-blue-400">
              <Dna size={18} className="animate-spin duration-3000" />
            </span>
            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest font-mono">Precision Omics & Longevity Node</span>
            
            {/* Interactive Offline Toggle Badge */}
            <button
              onClick={() => {
                setIsOfflineMode(!isOfflineMode);
                if (onShowToast) {
                  onShowToast(
                    !isOfflineMode 
                      ? "Offline Simulation Enabled. App uses local failsafe logic." 
                      : "Cloud Connect Activated. Gemini AI cores engaged.", 
                    "info"
                  );
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-mono font-black uppercase tracking-wider border cursor-pointer transition-all duration-300 ${
                isOfflineMode 
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' 
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              }`}
            >
              {isOfflineMode ? (
                <>
                  <WifiOff size={10} className="animate-pulse" />
                  Offline Heuristics Active
                </>
              ) : (
                <>
                  <Wifi size={10} className="text-emerald-500" />
                  Cloud Connected
                </>
              )}
            </button>
          </div>
          
          <h1 className="text-3xl font-[1000] text-slate-950 dark:text-white uppercase tracking-tighter sm:text-4xl text-center xl:text-left leading-none mt-2">
            Genomic Longevity & Biomarker Core
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold max-w-2xl mt-2 text-center xl:text-left mx-auto xl:mx-0">
            Analyze methylation status, assess epigenetic aging offsets, configure CYP450 pharmacogenomics, and simulate molecular therapeutic interventions offline or cloud-grounded.
          </p>
        </div>

        {/* Credit Display */}
        <div className="flex items-center justify-center xl:justify-end gap-4 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-inner w-full sm:w-auto self-center xl:self-auto">
          <div className="flex flex-col text-center sm:text-right">
            <div className="flex items-center gap-1.5 justify-center sm:justify-end">
              <Zap size={14} className="text-amber-500 animate-pulse fill-amber-500" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 font-mono">Digital Token Wallet</span>
            </div>
            <div className="mt-1 flex items-baseline justify-center sm:justify-end gap-1">
              <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono leading-none">
                {isOfflineMode ? 'INFINITE' : formatCredits(user?.credits)}
              </span>
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                {isOfflineMode ? 'Local Simulation Mode' : '/ 400 Tokens Available'}
              </span>
            </div>
          </div>
          <div className="w-10 h-10 bg-blue-500/10 dark:bg-blue-400/10 rounded-full flex items-center justify-center border border-blue-500/20 shrink-0">
            <Activity size={18} className="text-blue-600 dark:text-blue-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex overflow-x-auto gap-2 p-1 bg-slate-100/60 dark:bg-slate-900/40 rounded-3xl mb-8 border border-slate-200/50 dark:border-slate-800 max-w-full no-scrollbar justify-start md:justify-center">
        {[
          { id: 'clock', label: 'Epigenetic Clock & Metrics', icon: <Sliders size={14} /> },
          { id: 'pharmacology', label: 'CYP450 Pharmacogenomics', icon: <Pill size={14} /> },
          { id: 'simulation', label: 'Adaptive Longevity Sim', icon: <BarChart2 size={14} /> },
          { id: 'synth', label: 'AI Cellular Intervention Synth', icon: <Sparkles size={14} /> },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all duration-300 border-0 cursor-pointer ${
                isSelected 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 font-extrabold scale-102 scale-[1.01]' 
                  : 'text-slate-500 dark:text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200 font-bold'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start justify-center">
        {/* Left Aspect Grid Slot */}
        <div className="lg:col-span-8 space-y-8 w-full mx-auto">
          
          {/* TAB 1: EPIGENETIC CLOCK */}
          {activeTab === 'clock' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-950 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-4 sm:p-8 shadow-sm space-y-8 w-full"
            >
              <div className="flex items-center justify-between gap-4 flex-wrap text-center sm:text-left">
                <div className="flex items-center gap-2 mx-auto sm:mx-0">
                  <Dna className="text-blue-500" size={24} />
                  <h3 className="text-lg font-black uppercase tracking-tight text-slate-950 dark:text-white">Epigenetic Diagnostic Variables</h3>
                </div>
                <span className="text-[10px] font-mono font-black text-rose-500 bg-rose-50 dark:bg-rose-950/20 px-3 py-1.5 rounded-xl border border-rose-500/10 mx-auto sm:mx-0">
                  PhenoAge formulation mimic active
                </span>
              </div>
                   {/* Grid with Controls & Gauge Panel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-center">
                {/* Control sliders */}
                <div className="space-y-6">
                  {/* Range Chronological Age */}
                  <div className="space-y-2 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-baseline mb-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Chronological Age</label>
                      <span className="text-xs font-black text-slate-900 dark:text-white font-mono">{chronologicalAge} Years Old</span>
                    </div>
                    <input 
                      type="range" 
                      min="18" 
                      max="100" 
                      value={chronologicalAge}
                      onChange={(e) => setChronologicalAge(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  {/* Loci status */}
                  <div className="space-y-2 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">MTHFR Mutation Variant (DNA Methylation Loci)</label>
                    <select
                      value={mthfrState}
                      onChange={(e) => setMthfrState(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs font-black text-slate-950 dark:text-white outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 transition-all cursor-pointer"
                    >
                      <option value="wild">Wild Type (Normal C/C - 100% Methylation Power)</option>
                      <option value="c677t_hetero">C677T Heterozygous (Genetically Reduced ~30%)</option>
                      <option value="c677t_homo">C677T Homozygous (Somatic Capacity Reduced ~65%)</option>
                    </select>
                  </div>

                  {/* Range inflammatory CRP */}
                  <div className="space-y-2 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-baseline mb-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Inflammatory Marker (hs-CRP)</label>
                      <span className="text-xs font-black text-slate-900 dark:text-white font-mono">{hsCRP} mg/L</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.1" 
                      max="5.0" 
                      step="0.1"
                      value={hsCRP}
                      onChange={(e) => setHsCRP(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-[8.5px] font-bold text-slate-400 uppercase tracking-widest font-mono pt-1">
                      <span>Optimal: &lt; 1.0</span>
                      <span>Moderate: 1.0-3.0</span>
                      <span>High Alert: &gt; 3.0</span>
                    </div>
                  </div>

                  {/* Range HbA1c */}
                  <div className="space-y-2 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-baseline mb-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Glycation index (HbA1c)</label>
                      <span className="text-xs font-black text-slate-900 dark:text-white font-mono">{hba1c}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="4.0" 
                      max="7.0" 
                      step="0.1"
                      value={hba1c}
                      onChange={(e) => setHba1c(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-[8.5px] font-bold text-slate-400 uppercase tracking-widest font-mono pt-1">
                      <span>Optimal: &lt; 5.4</span>
                      <span>Elevated: 5.5-5.9</span>
                      <span>Diabetes: &ge; 6.0</span>
                    </div>
                  </div>

                  {/* Range Telomere */}
                  <div className="space-y-2 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-baseline mb-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Telomeric Length Average</label>
                      <span className="text-xs font-black text-slate-900 dark:text-white font-mono">{telomereLength} kb</span>
                    </div>
                    <input 
                      type="range" 
                      min="4.5" 
                      max="9.5" 
                      step="0.1"
                      value={telomereLength}
                      onChange={(e) => setTelomereLength(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                </div>

                {/* Dashboard Comparison Gauge Screen */}
                <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-6 shadow-sm">
                  <div className="text-center">
                    <span className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block">Epigenetic Diagnostic Appraisals</span>
                    <h4 className="text-sm font-black uppercase text-slate-900 dark:text-white mt-1">Somatic Aging Contrast Meter</h4>

                    {/* Highly polished circular side-by-side SVG comparison */}
                    <div className="flex flex-col sm:flex-row items-center justify-around gap-6 mt-8">
                      {/* Chronological age */}
                      <div className="flex flex-col items-center">
                        <div className="relative w-24 h-24 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="48" cy="48" r="40" stroke="currentColor" className="text-slate-250 dark:text-slate-800" strokeWidth="6" fill="transparent" />
                            <circle cx="48" cy="48" r="40" stroke="currentColor" className="text-slate-400 dark:text-slate-600" strokeWidth="6" fill="transparent" strokeDasharray="251.2" strokeDashoffset="50" strokeLinecap="round" />
                          </svg>
                          <span className="absolute text-xl font-black text-slate-900 dark:text-white font-mono">{chronologicalAge}</span>
                        </div>
                        <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2">Chronological</span>
                      </div>

                      {/* Biological age progress */}
                      <div className="flex flex-col items-center animate-pulse">
                        <div className="relative w-28 h-28 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="56" cy="56" r="48" stroke="currentColor" className="text-slate-200 dark:text-slate-800 animate-none" strokeWidth="8" fill="transparent" />
                            <circle cx="56" cy="56" r="48" stroke="currentColor" 
                              className={biologicalAgeData.deviation > 2 ? 'text-rose-500' : biologicalAgeData.deviation < -2 ? 'text-emerald-500' : 'text-blue-500'} 
                              strokeWidth="8" fill="transparent" 
                              strokeDasharray="301.6" 
                              strokeDashoffset={Math.max(0, 301.6 - (301.6 * (biologicalAgeData.bioAge / 100)))} 
                              strokeLinecap="round" 
                            />
                          </svg>
                          <span className="absolute text-2xl font-[1000] text-slate-900 dark:text-white font-mono leading-none">{biologicalAgeData.bioAge}</span>
                        </div>
                        <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-2">Somatic Bio-Age</span>
                      </div>
                    </div>
                  </div>

                  {/* Comparison Stats */}
                  <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-500">Aging Velocity Offset:</span>
                      <span className={`font-black uppercase tracking-wide px-3 py-1 rounded-full text-[10px] border ${biologicalAgeData.bgColor} ${biologicalAgeData.color} ${biologicalAgeData.borderColor}`}>
                        {biologicalAgeData.deviation > 0 ? `+${biologicalAgeData.deviation} Yr Attrition` : `${biologicalAgeData.deviation} Yr Protective`}
                      </span>
                    </div>

                    <div className="bg-white dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-snug">
                      Status: <span className="text-slate-900 dark:text-white uppercase font-black tracking-tight">{biologicalAgeData.status}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Epigenetic Interventions Protocol Drawer */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <Shield size={16} className="text-blue-500 animate-pulse" />
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-center sm:text-left">Active Cellular Action Protocols ({epigeneticClinicalReport.length})</h4>
                </div>
                
                {epigeneticClinicalReport.length === 0 ? (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 rounded-3xl text-xs font-bold border border-emerald-500/10 flex items-center justify-center gap-2 w-full text-center">
                    <CheckCircle2 size={16} />
                    All diagnostic values residing in pristine physiological parameter domains. Baseline methylation operates fully.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 justify-center">
                    {epigeneticClinicalReport.map((rep, index) => (
                      <div key={index} className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{rep.title}</span>
                          <span className={`text-[8.5px] font-mono font-black tracking-widest px-2 py-0.5 rounded-md border ${
                            rep.severity === 'CRITICAL' ? 'bg-rose-500/10 text-rose-500 border-rose-500/25' : 'bg-amber-500/10 text-amber-500 border-amber-500/25'
                          }`}>
                            {rep.severity}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">{rep.description}</p>
                        <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800 text-[10.5px] text-blue-700 dark:text-blue-400 font-extrabold leading-tight">
                          💡 Intervention: {rep.protocol}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Radar index display */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center sm:text-left">Precision Somatic Biomodeling Scorecard</h4>
                <div className="h-64 sm:h-72 w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900/40 rounded-[2rem] p-4 border border-slate-100 dark:border-slate-800">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={longevityRadarData}>
                      <PolarGrid stroke="#cbd5e1" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 9.5, fontWeight: 800 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 8 }} />
                      <Radar
                        name="Biomarker Load"
                        dataKey="value"
                        stroke="#2563eb"
                        fill="#3b82f6"
                        fillOpacity={0.2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: PHARMACOGENOMICS INTERACTIVE PROFILER */}
          {activeTab === 'pharmacology' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-950 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-4 sm:p-8 shadow-sm space-y-8 text-center sm:text-left"
            >
              <div className="flex flex-col sm:flex-row items-center gap-2 justify-center sm:justify-start">
                <Pill className="text-blue-500 animate-pulse" size={24} />
                <h3 className="text-lg font-black uppercase tracking-tight text-slate-950 dark:text-white">Pharmacogenomics CYP450 Diagnostics</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold max-w-2xl mx-auto sm:mx-0">
                Cytochrome P450 (CYP) liver enzymes heavily code your daily systemic processing of prescription drugs. Use this active, real-time diagnostic simulation console to identify genotype limitations.
              </p>

              {/* Interactive Multi-gene Customization Sliders */}
              <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-200 dark:border-slate-800 space-y-6">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <Settings2 size={16} className="text-blue-500" />
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">Simulate Your Genetic Pathway Status</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* CYP2D6 Select */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">CYP2D6 Pathway Gene</span>
                    <select
                      value={customGeneCYP2D6}
                      onChange={(e) => setCustomGeneCYP2D6(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs font-extrabold text-slate-900 dark:text-white outline-none cursor-pointer focus:border-blue-500"
                    >
                      <option value="Normal Metabolizer">Normal Metabolizer</option>
                      <option value="Poor Metabolizer">Poor Metabolizer (Deficient)</option>
                      <option value="Intermediate Metabolizer">Intermediate Metabolizer</option>
                      <option value="Ultra-rapid Metabolizer">Ultra-rapid Metabolizer</option>
                    </select>
                  </div>

                  {/* CYP2C19 Select */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">CYP2C19 Pathway Gene</span>
                    <select
                      value={customGeneCYP2C19}
                      onChange={(e) => setCustomGeneCYP2C19(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs font-extrabold text-slate-900 dark:text-white outline-none cursor-pointer focus:border-blue-500"
                    >
                      <option value="Normal Metabolizer">Normal Metabolizer</option>
                      <option value="Poor Metabolizer">Poor Metabolizer (Deficient)</option>
                      <option value="Intermediate Metabolizer">Intermediate Metabolizer</option>
                      <option value="Ultra-rapid Metabolizer">Ultra-rapid Metabolizer</option>
                    </select>
                  </div>

                  {/* CYP2C9 Select */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">CYP2C9 Pathway Gene</span>
                    <select
                      value={customGeneCYP2C9}
                      onChange={(e) => setCustomGeneCYP2C9(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs font-extrabold text-slate-900 dark:text-white outline-none cursor-pointer focus:border-blue-500"
                    >
                      <option value="Normal Metabolizer">Normal Metabolizer</option>
                      <option value="Poor Metabolizer">Poor Metabolizer (Deficient)</option>
                      <option value="Intermediate Metabolizer">Intermediate Metabolizer</option>
                      <option value="Ultra-rapid Metabolizer">Ultra-rapid Metabolizer</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Molecule Lookup Component */}
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4 flex-wrap text-center sm:text-left">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mx-auto sm:mx-0">Active Molecule Target Lookup</h4>
                  
                  {/* Search query box */}
                  <div className="relative w-full sm:w-64 mx-auto sm:mx-0">
                    <input
                      type="text"
                      placeholder="Filter medications (e.g. codeine)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-[11px] font-bold outline-none text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 transition-all"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                  </div>
                </div>

                {/* Grid layout of drugs with clicking capability */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 justify-center">
                  {filteredDrugList.map((dr) => {
                    const isSelectedVal = selectedDrugName === dr.name;
                    return (
                      <button
                        key={dr.name}
                        onClick={() => setSelectedDrugName(dr.name)}
                        className={`text-left p-4 rounded-2xl border text-xs font-extrabold transition-all cursor-pointer ${
                          isSelectedVal 
                            ? 'bg-blue-600 text-white border-transparent shadow-md shadow-blue-500/20' 
                            : 'bg-slate-55 border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-black uppercase tracking-tight">{dr.name}</span>
                          <span className={`text-[8px] font-mono px-1 rounded ${isSelectedVal ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                            {dr.pathway}
                          </span>
                        </div>
                        <span className="text-[9px] opacity-70 block truncate mt-1">Target: {dr.targetGene}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Interactive Clinical Report Box */}
              {drugInteractiveReport && (
                <div className="p-6 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[2rem] space-y-4 text-left">
                  <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div>
                      <span className="text-[9px] font-mono font-black text-blue-500 uppercase tracking-widest">CYP450 Metabolizer Simulation Output</span>
                      <h4 className="text-lg font-[1000] text-slate-950 dark:text-white uppercase tracking-tight mt-1">
                        MEDICATION PHARMACEUTICAL REPORT: {drugInteractiveReport.name}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-500 font-mono">Assigned Genotype:</span>
                      <span className="text-xs font-black uppercase text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-750 font-mono">
                        {drugInteractiveReport.phenotype}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div className="space-y-4">
                      {/* Alert Card of Efficacy */}
                      <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
                        drugInteractiveReport.computedSeverity === 'critical'
                          ? 'bg-rose-50/50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/50 text-rose-850 dark:text-rose-300'
                          : drugInteractiveReport.computedSeverity === 'moderate'
                            ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/50 text-amber-850 dark:text-amber-300'
                            : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/50 text-emerald-810 dark:text-emerald-300'
                      }`}>
                        <AlertTriangle className="shrink-0 mt-0.5" size={18} />
                        <div>
                          <h5 className="text-[11px] font-black uppercase tracking-wider mb-1">
                            {drugInteractiveReport.computedSeverity.toUpperCase()} GENE EFFECT DETECTED
                          </h5>
                          <p className="text-xs font-bold leading-normal">
                            {drugInteractiveReport.computedAlert}
                          </p>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold space-y-2">
                        <span className="font-black text-slate-900 dark:text-white uppercase text-[10px] tracking-wide block">Hepatic Mechanism Details:</span>
                        <p>{drugInteractiveReport.details}</p>
                      </div>
                    </div>

                    {/* Alternatives Card */}
                    <div className="bg-blue-600 hover:bg-blue-700 transition-colors text-white p-6 rounded-3xl space-y-4 shadow-md shadow-blue-500/10">
                      <div className="flex items-center gap-2">
                        <Shield size={18} className="text-blue-200" />
                        <h5 className="text-xs font-black uppercase tracking-widest text-blue-100">Recommended Metabolic Alternative</h5>
                      </div>
                      <p className="text-sm font-black tracking-tight leading-snug">
                        Substitute standard {drugInteractiveReport.name} with: <br />
                        <span className="text-lg text-emerald-300 font-[1000]">{drugInteractiveReport.alternative}</span>
                      </p>
                      <p className="text-[10px] text-blue-200 leading-relaxed font-medium">
                        By utilizing molecules cleared via parallel bypass enzymes, you bypass somatic metabolic bottlenecks and maintain safety bounds.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Drug-Drug & African Traditional Medicine (Herbal) Interaction Engine */}
              <div className="pt-8 border-t border-slate-150 dark:border-slate-800 space-y-6 text-left">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Sliders className="text-emerald-500 animate-pulse" size={20} />
                    <h4 className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white">Drug-Drug & Traditional Medicine (Herbal) Interaction Engine</h4>
                  </div>
                  <span className="text-[9px] font-mono font-black uppercase bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 px-2 py-1 rounded-lg">
                    Real-Time Competitive CYP450 Diagnostics
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                  Analyze pharmacokinetic interactions, competitive CYP450 hepatic saturation, and dangerous pharmacodynamic synergisms between Western prescription drugs and popular African traditional herbal remedies.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900/40 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800">
                  {/* Selectors */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Primary Western Prescription Medication</label>
                      <select
                        value={selectedDdaA}
                        onChange={(e) => setSelectedDdaA(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-black text-slate-900 dark:text-white outline-none cursor-pointer focus:border-blue-500"
                      >
                        <option value="Codeine">Codeine (Prodrug Analgesic)</option>
                        <option value="Clopidogrel">Clopidogrel (Prodrug Antiplatelet)</option>
                        <option value="Warfarin">Warfarin (Anticoagulant)</option>
                        <option value="Metoprolol">Metoprolol (Beta-Blocker / Antihypertensive)</option>
                        <option value="Duloxetine">Duloxetine (SNRI Antidepressant)</option>
                        <option value="Ibuprofen">Ibuprofen (NSAID Analgesic)</option>
                        <option value="Tamoxifen">Tamoxifen (Oncology Hormone modulator)</option>
                        <option value="Omeprazole">Omeprazole (PPI Antacid)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Secondary Agent / Herbal Remedy</label>
                      <select
                        value={selectedDdaB}
                        onChange={(e) => setSelectedDdaB(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-black text-slate-900 dark:text-white outline-none cursor-pointer focus:border-blue-500"
                      >
                        {/* Herbals */}
                        <option value="Artemisia">Artemisia annua (African Wormwood - Malaria/Fever)</option>
                        <option value="Neem Leaf">Neem Leaf (Melia azedarach - Immune/Skin)</option>
                        <option value="Moringa">Moringa oleifera (Miracle Tree - Nutrition/Inflammation)</option>
                        <option value="Warburgia">Warburgia ugandensis (Mukuzannyanja - Antimicrobial/Pain)</option>
                        <option value="St. John's Wort">St. John's Wort (Hypericum - Mood Support)</option>
                        {/* Meds */}
                        <option value="Fluoxetine">Fluoxetine (SSRI Antidepressant - CYP2D6 Block)</option>
                        <option value="Aspirin">Aspirin (Antiplatelet / Salicylate)</option>
                        <option value="Erythromycin">Erythromycin (Macrolide Antibiotic - CYP3A4 Block)</option>
                      </select>
                    </div>
                  </div>

                  {/* Interaction Results Output */}
                  {drugDrugInteraction && (
                    <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-150 dark:border-slate-800 flex flex-col justify-between space-y-4">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[10px] font-mono font-black text-slate-400 dark:text-slate-550 uppercase">Clinical Diagnostic Status</span>
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${
                          drugDrugInteraction.severity === 'critical'
                            ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50'
                            : drugDrugInteraction.severity === 'moderate'
                              ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50'
                              : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50'
                        }`}>
                          {drugDrugInteraction.severity.toUpperCase()} RISK
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <h5 className="text-xs font-black uppercase text-slate-900 dark:text-white flex items-center gap-1.5">
                          {drugDrugInteraction.severity === 'critical' && <AlertTriangle size={14} className="text-rose-500 shrink-0" />}
                          {drugDrugInteraction.severity === 'moderate' && <AlertTriangle size={14} className="text-amber-500 shrink-0" />}
                          {drugDrugInteraction.severity === 'safe' && <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />}
                          {drugDrugInteraction.title}
                        </h5>
                        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                          {drugDrugInteraction.description}
                        </p>
                      </div>

                      <div className="h-px bg-slate-100 dark:bg-slate-800" />

                      <div className="space-y-2">
                        <div className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Pathophysiology & Direct Action Plan</div>
                        <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1 text-[10px] font-medium text-slate-500 dark:text-slate-450 leading-relaxed">
                          <p><strong className="text-slate-800 dark:text-slate-200 font-extrabold uppercase text-[8px] tracking-wide block">Enzyme mechanism:</strong> {drugDrugInteraction.mechanism}</p>
                          <p className="mt-1"><strong className="text-emerald-600 dark:text-emerald-400 font-extrabold uppercase text-[8px] tracking-wide block">Recommended Protocol:</strong> {drugDrugInteraction.action}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: SIMULATION LABORATORY */}
          {activeTab === 'simulation' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-950 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-4 sm:p-8 shadow-sm space-y-8 text-center sm:text-left"
            >
              <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-slate-200 dark:border-slate-800 text-center sm:text-left">
                <div className="flex items-center gap-2 mx-auto sm:mx-0">
                  <BarChart2 className="text-blue-500 animate-pulse" size={24} />
                  <h3 className="text-lg font-black uppercase tracking-tight text-slate-950 dark:text-white">Active Epigenetic Longevity Sim</h3>
                </div>
                
                <button
                  type="button"
                  onClick={() => setComplianceActive(!complianceActive)}
                  className={`px-4 py-2 text-[10px] font-mono font-black uppercase tracking-widest rounded-xl transition-all border flex items-center justify-center gap-1.5 cursor-pointer mx-auto sm:mx-0 ${
                    complianceActive 
                      ? 'bg-emerald-500 text-white border-transparent shadow shadow-emerald-500/20' 
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-800'
                  }`}
                >
                  <CheckCircle2 size={12} />
                  Compliance Multiplier: {complianceActive ? "TRUE (OPTIMIZED)" : "FALSE"}
                </button>
              </div>

              {/* Slider Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                
                {/* Supplement range */}
                <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between text-left">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">NAD+ Exogenous Support</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white font-mono">{nadPrecursors} mg</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="1000"
                    step="50"
                    value={nadPrecursors}
                    onChange={(e) => setNadPrecursors(Number(e.target.value))}
                    className="w-full h-1 bg-slate-200 appearance-none rounded-lg accent-blue-600 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold leading-relaxed mt-3">
                    Bypasses cellular nuclear aging triggers by supporting key Sirtuin transcription processes.
                  </p>
                </div>

                {/* Deep sleep Stage */}
                <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between text-left">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-555 dark:text-slate-400">Deep Circadian Stage</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white font-mono">{deepSleep} Hrs</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.1"
                    value={deepSleep}
                    onChange={(e) => setDeepSleep(Number(e.target.value))}
                    className="w-full h-1 bg-slate-200 appearance-none rounded-lg accent-blue-600 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold leading-relaxed mt-3">
                    Drives deep glymphatic systemic cleansing indices, promoting overall waste flushing from tissue.
                  </p>
                </div>

                {/* Autophagy restriction */}
                <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between text-left">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-555 dark:text-slate-400">Caloric Fasting Restriction</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white font-mono">{caloricRestriction}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="5"
                    value={caloricRestriction}
                    onChange={(e) => setCaloricRestriction(Number(e.target.value))}
                    className="w-full h-1 bg-slate-200 appearance-none rounded-lg accent-blue-600 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold leading-relaxed mt-3">
                    Autophagy triggering. Suppresses cellular mTOR, triggering degradation of aged junk cells.
                  </p>
                </div>
              </div>

              {/* Dynamic Live Bio-Enzymatic Activity Indicators */}
              <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 space-y-6">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <Activity size={16} className="text-blue-500 animate-pulse" />
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">Live Simulated Cellular Transcriptions</h4>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 justify-center items-center">
                  {[
                    { label: 'SIRT1 Nuclear Activity', value: liveBioSimMetrics.sirt1, suffix: '%', desc: 'Sirtuin replication power' },
                    { label: 'AMPK Energy Rate', value: liveBioSimMetrics.ampk, suffix: '%', desc: 'Insulin/sugar pathway speed' },
                    { label: 'mTOR Suppression Speed', value: liveBioSimMetrics.mtorSuppression, suffix: '%', desc: 'Autophagal trigger limit' },
                    { label: 'Cellular Autophagy Index', value: liveBioSimMetrics.autophagyIndex, suffix: '/100', desc: 'Junk cell dissolution' },
                    { label: 'Glymphatic Cleansing', value: liveBioSimMetrics.glymphaticCleansing, suffix: '%', desc: 'Tissue wash velocity' },
                  ].map((metric, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-32 hover:border-blue-500/30 transition-all project-card shadow-inner text-left">
                      <div>
                        <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-550 uppercase leading-none block line-clamp-2 h-7">{metric.label}</span>
                        <span className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1 block">
                          {metric.value}{metric.suffix}
                        </span>
                      </div>
                      <span className="text-[8px] font-semibold text-slate-400 block truncate">{metric.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projections Line Chart */}
              <div className="space-y-4 pt-4">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-450">Quinquennial Biological Aging Offset Forecast</h4>
                  <span className="text-[10px] text-emerald-500 font-extrabold uppercase font-mono tracking-wider bg-emerald-50 dark:bg-emerald-950/25 px-2.5 py-1 rounded-lg">
                    Autophagy Metformin Mimics Loaded
                  </span>
                </div>
                
                <div className="h-64 sm:h-72 w-full bg-slate-50 dark:bg-slate-900/40 rounded-[2.5rem] p-4 border border-slate-100 dark:border-slate-800">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={projectionData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="timeline" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                      <YAxis domain={['dataMin - 5', 'dataMax + 5']} tick={{ fill: '#64748b', fontSize: 10 }} />
                      <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid #e2e8f0', fontFamily: 'monospace' }} />
                      <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
                      <Line 
                        type="monotone" 
                        dataKey="Baseline Senescence" 
                        stroke="#ef4444" 
                        strokeWidth={2.5} 
                        activeDot={{ r: 6 }} 
                        dot={{ strokeWidth: 1.5 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="Optimized Lifespan" 
                        stroke="#10b981" 
                        strokeWidth={3} 
                        activeDot={{ r: 8 }}
                        dot={{ strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: AI SYNTHESIS WITH TEMPLATES */}
          {activeTab === 'synth' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-950 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-4 sm:p-8 shadow-sm space-y-6 text-center sm:text-left"
            >
              <div className="flex flex-col sm:flex-row items-center gap-2 justify-center sm:justify-start">
                <Sparkles className="text-blue-500" size={24} />
                <h3 className="text-xl font-[1000] uppercase tracking-tight text-slate-950 dark:text-white">AI Cellular Longevity Synapse Engine</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold max-w-2xl mx-auto sm:mx-0">
                Generate highly polished, molecularly targeted diagnostic briefs. Choose a clinical profile template below to populate analytical parameters, or insert custom genotype observations. Works entirely offline when requested.
              </p>

              {/* Template Pre-sets */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest block text-center sm:text-left">Select Clinical Profile Template</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {CLINICAL_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => selectTemplate(tmpl.notes)}
                      className="p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800/70 border border-slate-200 dark:border-slate-800 rounded-2xl text-left transition-all cursor-pointer select-none group text-xs font-black uppercase tracking-tight text-slate-900 dark:text-white"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span>{tmpl.title}</span>
                        <ChevronRight size={12} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 leading-snug tracking-normal lowercase first-letter:uppercase">{tmpl.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Notes Field */}
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center sm:text-left block">Additional Clinical/Genetic Context (Optional)</label>
                  <textarea
                    value={personalizedNotes}
                    onChange={(e) => setPersonalizedNotes(e.target.value)}
                    placeholder="Provide ApoE markers, daily lipid metrics, historic blood trends or phenotypic descriptors..."
                    rows={3}
                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-5 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 transition-all resize-none placeholder:text-slate-400 text-left"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-center sm:text-left">
                  <div className="flex flex-col items-center sm:items-start gap-1">
                    <span className="p-1 px-2.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-[10px] uppercase font-bold tracking-widest rounded-lg font-mono">
                      {isOfflineMode ? 'Cost: 0 (Offline)' : 'Cost: 50 Tokens'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold font-mono">
                      {isOfflineMode ? 'Local System Simulation Active' : `Current Wallet Balance: ${formatCredits(user?.credits)}`}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={isSynthesizing}
                    onClick={handleAIGenesis}
                    className="w-full sm:w-auto px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white rounded-[2rem] font-[1000] text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-lg shadow-blue-500/20 border-0"
                  >
                    {isSynthesizing ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Generating Appraisal Blueprint...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        Synthesize Lifespan Blueprint
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Appraisal Output Result */}
              <AnimatePresence mode="wait">
                {synthResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="p-6 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border border-slate-150 dark:border-slate-800 overflow-hidden text-xs leading-relaxed text-slate-800 dark:text-slate-200"
                  >
                    <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3 mb-4 flex-wrap gap-2 animate-pulse">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-blue-500" />
                        <span className="font-mono font-black text-[10px] uppercase tracking-widest text-slate-500">DOCTORIAN OMICS RESPONSE RECORD</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Copy button */}
                        <button
                          onClick={handleCopyReport}
                          type="button"
                          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-850 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-905 transition-all border-0 cursor-pointer"
                          title="Copy Report to Clipboard"
                        >
                          <Copy size={13} />
                        </button>
                        
                        <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded-md border ${
                          isOfflineMode ? 'bg-amber-500/10 text-amber-500 border-amber-505/20' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-505/20'
                        }`}>
                          {isOfflineMode ? 'OFFLINE GENERATED' : 'CLINI-CLOUD SECURED'}
                        </span>
                      </div>
                    </div>

                    <div className="whitespace-pre-wrap max-h-96 overflow-y-auto pr-2 scrollbar-thin font-mono leading-relaxed text-[11px] select-text">
                      {synthResult}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

        </div>

        {/* Informative Side Card - Right (4 Columns) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-6 space-y-6 shadow-sm">
            <span className="text-[10px] font-mono font-black text-rose-500 uppercase tracking-widest">Somatic Lifespan Pillars</span>
            <h3 className="text-lg font-[1000] uppercase text-slate-950 dark:text-white mt-1">Interventional Core</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
              The somatic decay prevention index centers on suppressing senescent cells dynamically. Maintain these biological priorities:
            </p>

            <ul className="space-y-4">
              {[
                { name: 'Autophagy Triggering', desc: 'Metabolic switch stimulates cellular junk processing, utilizing dynamic ketone bodies.', icon: <CheckCircle2 className="text-emerald-500 shrink-0" size={16} /> },
                { name: 'Telomeric Base-Pair Buffer', desc: 'Keeping systemic markers optimal (CRP < 1.0) minimizes attrition velocities.', icon: <CheckCircle2 className="text-emerald-500 shrink-0" size={16} /> },
                { name: 'Systemic Glycation Defense', desc: 'Maintaining HbA1c strictly below 5.4% prevents advanced tissue cross-link stiffening.', icon: <CheckCircle2 className="text-emerald-500 shrink-0" size={16} /> },
                { name: 'Methylation Cycle Repair', desc: 'Bypassing congenital MTHFR blocks preserves overall DNA replication precision structures.', icon: <CheckCircle2 className="text-emerald-500 shrink-0" size={16} /> },
              ].map((item, idx) => (
                <li key={idx} className="flex gap-3">
                  {item.icon}
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-tight text-slate-900 dark:text-white">{item.name}</h4>
                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-normal font-medium mt-0.5">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-[10px] font-black text-slate-400 font-mono tracking-wider">
              <span>ALGORITHM V4.10</span>
              <span>EPIGENETIC CO-ENGINE</span>
            </div>
          </div>

          {/* Wallet Limit Note */}
          <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 text-white rounded-[2.5rem] p-6 space-y-4 border border-indigo-500/20 shadow-lg shadow-indigo-950/20">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 animate-pulse">
              <Brain size={18} className="text-indigo-400" />
            </div>
            <h4 className="text-sm font-black uppercase tracking-tight text-center lg:text-left">Real-time Offline Adaption</h4>
            <p className="text-[10.5px] text-indigo-200 leading-relaxed font-semibold text-center lg:text-left">
              Deep genomic synthesis and matched pharmacogenomics appraisals can utilize cloud Gemini reasoning cores (consuming 50 tokens inside online mode). 
            </p>
            <p className="text-[10.5px] text-indigo-300 leading-relaxed font-semibold text-center lg:text-left">
              However, this appraisal node is equipped with a **dedicated local calculation heuristic engine** that works 100% offline and cost-free, ensuring precision medical validation even without internet connections.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
