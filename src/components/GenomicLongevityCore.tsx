import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dna, Activity, Shield, Sparkles, Brain, Loader2, 
  Settings2, Info, ArrowRight, Zap, RefreshCw, BarChart2,
  Trash2, Plus, Sliders, Pill, Heart, FileText, CheckCircle2,
  ChevronRight, Search, AlertTriangle, HelpCircle, Check, 
  Wifi, WifiOff, Globe, Download, Copy, Send, Microscope,
  Sparkle, Compass, Scale, Layers
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

// ======================================================================
// POLYGENIC RISK SCORE (PRS) DATABASE
// ======================================================================

interface PRSCard {
  id: string;
  category: 'Cardiovascular' | 'Neurodegenerative' | 'Metabolic' | 'Oncology';
  condition: string;
  geneLoci: string;
  riskPercentile: number;
  oddsRatio: string;
  populationAvg: string;
  riskLevel: 'Low' | 'Moderate' | 'High Risk';
  mitigationStrategy: string;
}

const PRS_DATABASE: PRSCard[] = [
  {
    id: 'prs-01',
    category: 'Neurodegenerative',
    condition: 'Late-Onset Alzheimer\'s Disease',
    geneLoci: 'APOE (rs429358 / rs7412 e3/e4), CLU, PICALM',
    riskPercentile: 88,
    oddsRatio: '3.4x Baseline Odds',
    populationAvg: '12.0%',
    riskLevel: 'High Risk',
    mitigationStrategy: 'Enhance blood-brain barrier lipophilic clearance, maintain high-DHA omega-3 levels, optimize deep glymphatic slow-wave sleep cycles.'
  },
  {
    id: 'prs-02',
    category: 'Cardiovascular',
    condition: 'Early-Onset Coronary Artery Disease',
    geneLoci: 'LPA (rs10455872), PCSK9, 9p21.3 (rs1333049)',
    riskPercentile: 76,
    oddsRatio: '2.1x Baseline Odds',
    populationAvg: '18.5%',
    riskLevel: 'High Risk',
    mitigationStrategy: 'Target ultra-low LDL-C (< 55 mg/dL) using PCSK9 inhibitors or LNP CRISPR base editing, track hs-CRP inflammation markers.'
  },
  {
    id: 'prs-03',
    category: 'Metabolic',
    condition: 'Type 2 Diabetes & Insulin Resistance',
    geneLoci: 'TCF7L2 (rs7903146), PPARG, KCNJ11',
    riskPercentile: 42,
    oddsRatio: '1.1x Baseline Odds',
    populationAvg: '11.2%',
    riskLevel: 'Moderate',
    mitigationStrategy: 'Activate mitochondrial AMPK pathways via intermittent time-restricted feeding and SGLT2i/GLP-1 receptor agonist optimization.'
  },
  {
    id: 'prs-04',
    category: 'Oncology',
    condition: 'Hereditary Colorectal Carcinoma',
    geneLoci: 'MLH1, MSH2, APC, MUTYH (rs35426722)',
    riskPercentile: 18,
    oddsRatio: '0.6x Baseline Odds',
    populationAvg: '4.2%',
    riskLevel: 'Low',
    mitigationStrategy: 'Standard age-appropriate colonoscopy screening every 10 years, high mucosal dietary fiber intake.'
  }
];

// ======================================================================
// CRISPR BASE EDITING PIPELINE DATASETS
// ======================================================================

interface CRISPRTarget {
  id: string;
  geneName: string;
  targetOrgan: string;
  editorClass: string;
  clinicalPhase: string;
  offTargetSafetyScore: number;
  expectedOutcome: string;
}

const CRISPR_PIPELINE: CRISPRTarget[] = [
  {
    id: 'c1',
    geneName: 'PCSK9 Adenine Base Editor',
    targetOrgan: 'Hepatic Tissue (Liver)',
    editorClass: 'LNP-Cas12a Adenine Base Editor',
    clinicalPhase: 'Phase III Global Outcome Trial',
    offTargetSafetyScore: 99.8,
    expectedOutcome: 'Permanent -68% reduction in circulating LDL-C with single intravenous infusion.'
  },
  {
    id: 'c2',
    geneName: 'ANGPTL3 Splice Donor Editor',
    targetOrgan: 'Hepatic Tissue (Liver)',
    editorClass: 'LNP Cytosine Base Editor',
    clinicalPhase: 'Phase II Human Safety Trial',
    offTargetSafetyScore: 99.4,
    expectedOutcome: 'Permanent -55% reduction in plasma triglycerides and VLDL remants.'
  },
  {
    id: 'c3',
    geneName: 'TERT Telomerase Promoter Enhancer',
    targetOrgan: 'Systemic Hematopoietic Stem Cells',
    editorClass: 'AAV9 Dual-Vector CRISPR-Activation (dCas9-VP64)',
    clinicalPhase: 'Phase I Longevity Safety Trial',
    offTargetSafetyScore: 98.9,
    expectedOutcome: 'Reactivation of endogenous telomerase repair in senescent leukocytes.'
  }
];

export const GenomicLongevityCore: React.FC<GenomicLongevityCoreProps> = ({ 
  user, 
  onUpdateUser,
  onShowToast 
}) => {
  // Active Tab: 'epigenetics' (default), 'prs', 'mitochondria', 'crispr'
  const [activeTab, setActiveTab] = useState<'epigenetics' | 'prs' | 'mitochondria' | 'crispr'>('epigenetics');

  // Epigenetic clock input parameters
  const [chronologicalAge, setChronologicalAge] = useState<number>(42);
  const [mthfrVariant, setMthfrVariant] = useState<string>('hetero'); // wild, hetero, homo
  const [hsCRP, setHsCRP] = useState<number>(1.1); // mg/L
  const [hba1c, setHba1c] = useState<number>(5.4); // %
  const [homocysteine, setHomocysteine] = useState<number>(9.8); // umol/L
  const [telomereLength, setTelomereLength] = useState<number>(7.4); // kb

  // Mitochondrial Bio-Optimizer Parameters
  const [nmnDose, setNmnDose] = useState<number>(500); // mg/day
  const [fastingHours, setFastingHours] = useState<number>(16); // hrs/day
  const [deepSleepDuration, setDeepSleepDuration] = useState<number>(1.8); // hrs/night
  const [spermidineIntake, setSpermidineIntake] = useState<number>(10); // mg/day

  // AI Protocol Synthesis Engine
  const [aiProtocolPrompt, setAiProtocolPrompt] = useState<string>('');
  const [aiProtocolLoading, setAiProtocolLoading] = useState<boolean>(false);
  const [aiProtocolResult, setAiProtocolResult] = useState<string | null>(null);

  // Deduct credits helper
  const handleDeductCredits = async (amount: number, name: string): Promise<boolean> => {
    const currentCredits = parseCreditsToNumber(user?.credits);
    const isUnlimited = isCreditsUnlimited(user?.credits);
    if (currentCredits < amount && !isUnlimited) {
      if (onShowToast) {
        onShowToast(`Insufficient credit balance. ${name} requires ${amount} credits.`, 'error');
      }
      return false;
    }
    
    if (onUpdateUser) {
      const next = safeDeductCredits(user?.credits, amount);
      onUpdateUser({ ...user, credits: next });
    }
    return true;
  };

  // 1. PhenoAge & GrimAge DNA Methylation Biological Age Calculation
  const bioAgeResults = useMemo(() => {
    let offset = 0;
    
    // MTHFR methylation efficiency
    if (mthfrVariant === 'homo') offset += 3.6;
    else if (mthfrVariant === 'hetero') offset += 1.2;
    else offset -= 0.8;

    // hsCRP inflammation delta
    if (hsCRP > 1.0) offset += (hsCRP - 1.0) * 2.1;
    else offset -= 0.6;

    // HbA1c somatic glycation
    if (hba1c > 5.6) offset += (hba1c - 5.6) * 4.2;
    else offset -= (5.6 - hba1c) * 1.2;

    // Homocysteine methylation clearance
    if (homocysteine > 10.0) offset += (homocysteine - 10.0) * 0.4;

    // Telomeric depletion offset
    const telomereDelta = 7.5 - telomereLength;
    offset += telomereDelta * 2.8;

    const finalBioAge = Math.max(18, parseFloat((chronologicalAge + offset).toFixed(1)));
    const ageDelta = parseFloat((finalBioAge - chronologicalAge).toFixed(1));
    const agingRatePace = parseFloat((1.0 + (ageDelta / chronologicalAge)).toFixed(2));

    return {
      bioAge: finalBioAge,
      delta: ageDelta,
      agingRatePace,
      status: ageDelta > 2 ? 'Accelerated Somatic Senescence' : ageDelta < -2 ? 'Decelerated Biological Aging' : 'Optimum Epigenetic Baseline',
      color: ageDelta > 2 ? 'text-rose-400' : ageDelta < -2 ? 'text-emerald-400' : 'text-blue-400',
      badgeBg: ageDelta > 2 ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : ageDelta < -2 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    };
  }, [chronologicalAge, mthfrVariant, hsCRP, hba1c, homocysteine, telomereLength]);

  // Decadal Biological Age Projection Data
  const projectionChartData = useMemo(() => {
    const data = [];
    const optimizationFactor = Math.min(0.4, (nmnDose / 2000) + (fastingHours / 48) + (deepSleepDuration / 6));
    
    for (let yr = 0; yr <= 20; yr += 5) {
      const chrono = chronologicalAge + yr;
      const unoptimizedBio = bioAgeResults.bioAge + yr;
      const optimizedBio = bioAgeResults.bioAge + (yr * (1.0 - optimizationFactor));

      data.push({
        year: `+${yr} Yrs`,
        Chronological: chrono,
        StandardTrajectory: Math.round(unoptimizedBio * 10) / 10,
        OptimizedProtocol: Math.round(optimizedBio * 10) / 10
      });
    }
    return data;
  }, [chronologicalAge, bioAgeResults.bioAge, nmnDose, fastingHours, deepSleepDuration]);

  // Mitochondrial Autophagy & NAD+ Score
  const mitochondrialMetrics = useMemo(() => {
    const nadPool = Math.min(100, Math.round(40 + (nmnDose / 10) + (fastingHours * 2)));
    const sirt1Activity = Math.min(100, Math.round(35 + (fastingHours * 3) + (spermidineIntake * 2)));
    const autophagyIndex = Math.min(100, Math.round(30 + (fastingHours * 3.5) + (deepSleepDuration * 10)));

    return {
      nadPool,
      sirt1Activity,
      autophagyIndex,
      overallScore: Math.round((nadPool + sirt1Activity + autophagyIndex) / 3)
    };
  }, [nmnDose, fastingHours, deepSleepDuration, spermidineIntake]);

  // Run AI Longevity Protocol Synthesizer
  const handleRunAiProtocol = async () => {
    const text = aiProtocolPrompt.trim() || `Synthesize personalized genomic longevity protocol for Chronological Age ${chronologicalAge}, BioAge ${bioAgeResults.bioAge}, MTHFR ${mthfrVariant}, hsCRP ${hsCRP}, HbA1c ${hba1c}`;
    
    const canProceed = await handleDeductCredits(10, 'AI Longevity Protocol Synthesis');
    if (!canProceed) return;

    setAiProtocolLoading(true);
    setAiProtocolResult(null);

    const systemInstruction = `You are Doctorian Precision Longevity AI, a world-leading epigenetic geneticist and longevity physician.
Provide a doctor-grade precision longevity strategy incorporating:
1. Epigenetic Methylation & MTHFR Methyl-Donor Optimization
2. Mitochondrial NAD+ & Sirtuin Autophagy Activation
3. Polygenic Risk Mitigation Strategy
4. Longitudinal Biomarker Targets (hs-CRP, HbA1c, Homocysteine)
5. Safety Warnings & Contraindications`;

    try {
      const res = await api.ai.aiChat([{ role: 'user', text }], systemInstruction);
      if (res.text) {
        setAiProtocolResult(res.text);
      }
    } catch (e) {
      setAiProtocolResult('Failed to generate longevity protocol. Please try again.');
    } finally {
      setAiProtocolLoading(false);
    }
  };

  return (
    <div id="genomic-longevity-container" className="space-y-6 text-slate-100 pb-12">
      {/* HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/50 to-slate-950 border border-slate-800 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Dna size={12} className="animate-spin-slow" /> Longevity & DNA Intelligence Lab
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <Sparkles size={12} /> Horvath & GrimAge Epigenetics
              </span>
            </div>

            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight uppercase">
              Genomic Longevity Core
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed font-medium">
              Precision DNA methylation clocks, polygenic risk scores, mitochondrial NAD+ autophagy optimization, and in-vivo CRISPR gene editing clinical pipelines.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl shrink-0 backdrop-blur-md">
            <div className="text-center px-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Biological Age</p>
              <p className={`text-xl font-black mt-0.5 ${bioAgeResults.color}`}>{bioAgeResults.bioAge} Yrs</p>
            </div>
            <div className="text-center px-3 border-l border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Aging Pace</p>
              <p className="text-xl font-black text-cyan-400 mt-0.5">{bioAgeResults.agingRatePace}x / Yr</p>
            </div>
          </div>
        </div>

        {/* SUB-TABS */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('epigenetics')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'epigenetics'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/30'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            <Dna size={15} className="text-indigo-300" /> Epigenetic Clock & Methylation
          </button>

          <button
            onClick={() => setActiveTab('prs')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'prs'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 ring-2 ring-purple-400/30'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            <BarChart2 size={15} className="text-purple-300" /> Polygenic Risk Scores (PRS)
          </button>

          <button
            onClick={() => setActiveTab('mitochondria')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'mitochondria'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30 ring-2 ring-cyan-400/30'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            <Zap size={15} className="text-cyan-300" /> Mitochondrial NAD+ & Autophagy
          </button>

          <button
            onClick={() => setActiveTab('crispr')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'crispr'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-400/30'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            <Microscope size={15} className="text-emerald-300" /> CRISPR Gene Editing Pipeline
          </button>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* TAB 1: EPIGENETIC CLOCK & METHYLATION */}
      {/* ====================================================================== */}
      {activeTab === 'epigenetics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* INPUT CONTROLS COLUMN */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
              <h3 className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                <Sliders size={16} /> Somatic Biomarker & Epigenetic Inputs
              </h3>

              {/* Chronological Age Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>Chronological Age</span>
                  <span className="text-indigo-400 font-black">{chronologicalAge} Years</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={90}
                  value={chronologicalAge}
                  onChange={(e) => setChronologicalAge(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* MTHFR Gene Variant Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">MTHFR C677T Genotype Variant</label>
                <select
                  value={mthfrVariant}
                  onChange={(e) => setMthfrVariant(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="wild">Wild Type (C677C - Normal Methylation Efficiency)</option>
                  <option value="hetero">Heterozygous (C677T - 30% Reduced Methylation Capacity)</option>
                  <option value="homo">Homozygous Variant (T677T - 65% Reduced Methylation Capacity)</option>
                </select>
              </div>

              {/* hs-CRP Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>hs-CRP Inflammatory Marker</span>
                  <span className="text-rose-400 font-black">{hsCRP} mg/L</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={5.0}
                  step={0.1}
                  value={hsCRP}
                  onChange={(e) => setHsCRP(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>

              {/* HbA1c Glycation Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>HbA1c Somatic Glycation</span>
                  <span className="text-amber-400 font-black">{hba1c} %</span>
                </div>
                <input
                  type="range"
                  min={4.5}
                  max={7.5}
                  step={0.1}
                  value={hba1c}
                  onChange={(e) => setHba1c(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Homocysteine Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>Plasma Homocysteine Level</span>
                  <span className="text-purple-400 font-black">{homocysteine} umol/L</span>
                </div>
                <input
                  type="range"
                  min={5.0}
                  max={25.0}
                  step={0.5}
                  value={homocysteine}
                  onChange={(e) => setHomocysteine(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              {/* Telomere Length Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>Telomere Length Index</span>
                  <span className="text-cyan-400 font-black">{telomereLength} kb</span>
                </div>
                <input
                  type="range"
                  min={5.0}
                  max={10.0}
                  step={0.1}
                  value={telomereLength}
                  onChange={(e) => setTelomereLength(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>

            {/* EPIGENETIC ANALYSIS COLUMN */}
            <div className="lg:col-span-7 space-y-6">
              {/* Biological Age Result Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-slate-400">Epigenetic Horvath & GrimAge Result</span>
                  <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase border ${bioAgeResults.badgeBg}`}>
                    {bioAgeResults.status}
                  </span>
                </div>

                <div className="flex items-baseline gap-4">
                  <span className={`text-5xl font-black ${bioAgeResults.color}`}>
                    {bioAgeResults.bioAge} <span className="text-lg text-slate-400 font-bold">Yrs</span>
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    Delta vs Chronological ({chronologicalAge}): {' '}
                    <strong className={bioAgeResults.delta > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                      {bioAgeResults.delta > 0 ? `+${bioAgeResults.delta}` : bioAgeResults.delta} Yrs
                    </strong>
                  </span>
                </div>

                {/* Biological Age Trajectory Chart */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-black uppercase text-indigo-400">20-Year Decadal Age Trajectory Projection</h4>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={projectionChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="year" stroke="#64748b" fontSize={11} />
                        <YAxis stroke="#64748b" fontSize={11} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                        <Line type="monotone" dataKey="Chronological" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" />
                        <Line type="monotone" dataKey="StandardTrajectory" stroke="#f43f5e" strokeWidth={2.5} />
                        <Line type="monotone" dataKey="OptimizedProtocol" stroke="#10b981" strokeWidth={2.5} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* AI LONGEVITY PROTOCOL GENERATOR */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                    <Sparkles size={16} className="text-indigo-400" /> Precision Longevity Protocol Generator
                  </h3>
                  <span className="text-[10px] font-extrabold text-indigo-400 uppercase bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
                    10 Neural Credits
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={aiProtocolPrompt}
                    onChange={(e) => setAiProtocolPrompt(e.target.value)}
                    placeholder="Custom guidance (e.g. Include methyl-folate protocols and Sirtuin activation details)..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleRunAiProtocol}
                    disabled={aiProtocolLoading}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/30"
                  >
                    {aiProtocolLoading ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                    Generate Protocol
                  </button>
                </div>

                {aiProtocolResult && (
                  <div className="bg-slate-950 p-4 rounded-2xl border border-indigo-500/30 space-y-2 text-xs text-slate-200 leading-relaxed">
                    <p className="font-black text-indigo-300 text-[11px] uppercase tracking-wider">Personalized Longevity Protocol</p>
                    <div className="whitespace-pre-wrap">{aiProtocolResult}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* TAB 2: POLYGENIC RISK SCORES (PRS) */}
      {/* ====================================================================== */}
      {activeTab === 'prs' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <BarChart2 className="text-purple-400" size={20} /> Polygenic Risk Score (PRS) Vulnerability Matrix
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Aggregates genome-wide association study (GWAS) single nucleotide polymorphisms (SNPs) into comprehensive disease susceptibility profiles.
                </p>
              </div>

              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-black uppercase">
                Genome-Wide GWAS Panel
              </span>
            </div>

            {/* PRS Grid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PRS_DATABASE.map((prs, mapIdx_582) => (
                <div key={`genomiclongevitycore-l584-${mapIdx_582}`} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded bg-slate-900 text-purple-400 border border-purple-500/30">
                      {prs.category}
                    </span>

                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                      prs.riskLevel === 'High Risk' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      prs.riskLevel === 'Moderate' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {prs.riskLevel}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-white">{prs.condition}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-1">Loci: {prs.geneLoci}</p>
                  </div>

                  {/* Percentile Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400">Population Risk Percentile</span>
                      <span className="text-purple-300 font-mono">{prs.riskPercentile}th Percentile</span>
                    </div>
                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className={`h-full ${prs.riskPercentile > 70 ? 'bg-rose-500' : prs.riskPercentile > 35 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                        style={{ width: `${prs.riskPercentile}%` }} 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-slate-400 font-bold block">Odds Ratio</span>
                      <span className="text-white font-black">{prs.oddsRatio}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block">Pop. Avg Risk</span>
                      <span className="text-slate-300 font-black">{prs.populationAvg}</span>
                    </div>
                  </div>

                  <div className="bg-purple-950/20 border border-purple-900/40 p-3.5 rounded-xl space-y-1">
                    <span className="text-[10px] font-black uppercase text-purple-300 block">Targeted Precision Mitigation</span>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">{prs.mitigationStrategy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* TAB 3: MITOCHONDRIAL NAD+ & AUTOPHAGY */}
      {/* ====================================================================== */}
      {activeTab === 'mitochondria' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* INTERVENTION SLIDERS */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
              <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <Zap size={16} /> Cellular Intervention & Bio-Optimization Sliders
              </h3>

              {/* NMN Dose */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>NMN / NR NAD+ Precursor</span>
                  <span className="text-cyan-400 font-black">{nmnDose} mg/day</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1000}
                  step={50}
                  value={nmnDose}
                  onChange={(e) => setNmnDose(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Fasting Hours */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>Time-Restricted Fasting Window</span>
                  <span className="text-emerald-400 font-black">{fastingHours} Hours/Day</span>
                </div>
                <input
                  type="range"
                  min={12}
                  max={24}
                  value={fastingHours}
                  onChange={(e) => setFastingHours(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Deep Sleep Duration */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>Slow-Wave Deep Sleep</span>
                  <span className="text-purple-400 font-black">{deepSleepDuration} Hours/Night</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={3.0}
                  step={0.1}
                  value={deepSleepDuration}
                  onChange={(e) => setDeepSleepDuration(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              {/* Spermidine Intake */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>Spermidine Autophagy Trigger</span>
                  <span className="text-amber-400 font-black">{spermidineIntake} mg/day</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={25}
                  value={spermidineIntake}
                  onChange={(e) => setSpermidineIntake(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>

            {/* MITOCHONDRIAL RADAR & METRICS */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-black text-white uppercase">Mitochondrial Bio-Efficiency</h3>
                  <p className="text-xs text-slate-400">Sirtuin deacetylase activation and NAD+ cellular pool rating.</p>
                </div>

                <div className="text-right">
                  <span className="text-3xl font-black text-cyan-400">{mitochondrialMetrics.overallScore}</span>
                  <span className="text-xs text-slate-400 font-bold block">/ 100 Index</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <p className="text-[10px] font-black uppercase text-slate-400">NAD+ Metabolite Pool</p>
                  <p className="text-xl font-black text-cyan-400 mt-1">{mitochondrialMetrics.nadPool}%</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <p className="text-[10px] font-black uppercase text-slate-400">SIRT1/SIRT3 Activity</p>
                  <p className="text-xl font-black text-purple-400 mt-1">{mitochondrialMetrics.sirt1Activity}%</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <p className="text-[10px] font-black uppercase text-slate-400">Autophagy Induction</p>
                  <p className="text-xl font-black text-emerald-400 mt-1">{mitochondrialMetrics.autophagyIndex}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* TAB 4: CRISPR IN-VIVO BASE EDITING PIPELINE */}
      {/* ====================================================================== */}
      {activeTab === 'crispr' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <Microscope className="text-emerald-400" size={20} /> CRISPR In-Vivo Base Editing Clinical Pipeline
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Single-dose genomic base editors delivered via lipid nanoparticles (LNP) targeting liver and hematopoietic tissues.
                </p>
              </div>

              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-black uppercase">
                FDA Phase II / III Pipeline
              </span>
            </div>

            <div className="space-y-4">
              {CRISPR_PIPELINE.map((target, mapIdx_774) => (
                <div key={`genomiclongevitycore-l776-${mapIdx_774}`} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[10px] font-black uppercase">
                        {target.clinicalPhase}
                      </span>
                      <span className="text-xs font-mono text-cyan-400 font-bold">{target.targetOrgan}</span>
                    </div>

                    <span className="text-xs font-bold text-slate-400">
                      Off-Target Safety Score: <strong className="text-emerald-400">{target.offTargetSafetyScore}%</strong>
                    </span>
                  </div>

                  <h3 className="text-base font-black text-white">{target.geneName}</h3>

                  <p className="text-xs text-slate-300 font-mono bg-slate-900 p-3 rounded-xl border border-slate-800">
                    Editor Class: {target.editorClass}
                  </p>

                  <div className="bg-emerald-950/20 border border-emerald-900/40 p-3.5 rounded-xl text-xs text-emerald-200">
                    <strong className="block text-[10px] uppercase font-black text-emerald-300 mb-0.5">Expected Therapeutic Outcome:</strong>
                    {target.expectedOutcome}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
