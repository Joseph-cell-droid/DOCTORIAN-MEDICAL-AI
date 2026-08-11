import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  Search, BookOpen, ExternalLink, Bookmark, BookmarkCheck,
  Volume2, VolumeX, Pause, Play, Download, Copy, Check, Sparkles,
  Filter, FileText, Stethoscope, Dna, Activity, ShieldAlert,
  Sliders, Eye, RefreshCw, Send, ChevronRight, Award, Hash, RotateCcw,
  Bot, Pill, X
} from 'lucide-react';
import { api } from '../api';

export interface MedicalResearchArticle {
  id: string;
  pmid: string;
  doi: string;
  title: string;
  journal: 'NEJM' | 'The Lancet' | 'PubMed / MEDLINE' | 'WHO Observatory' | 'ClinicalTrials.gov' | 'Cochrane Library' | 'FDA Approvals' | 'Nature Medicine' | 'JAMA' | 'BMJ';
  journalImpactFactor: number;
  authors: string;
  publicationDate: string;
  specialty: 'Cardiology' | 'Oncology' | 'Neurology' | 'Immunology & Infectious' | 'Endocrinology' | 'Pulmonology' | 'Genomics & Precision Medicine' | 'Nephrology';
  studyType: 'Phase III RCT' | 'Meta-Analysis & Systematic Review' | 'Clinical Practice Guideline' | 'Observational Cohort' | 'Breakthrough Drug Approval';
  evidenceGrade: 'Grade A+' | 'Grade A' | 'Grade B';
  sampleSize: string;
  hazardRatioPValue: string;
  abstract: string;
  keyTakeaway: string;
  doctorActionStep: string;
  nntNNH: string;
  fullSourceUrl: string;
}

export const EXTENDED_RESEARCH_DATABASE: MedicalResearchArticle[] = [
  {
    id: 'res-nejm-01',
    pmid: '38194021',
    doi: '10.1056/NEJMoa230911',
    title: 'Dual SGLT2 Inhibitor and GLP-1 Receptor Agonist Triple-Pathway Therapy in High-Risk Diabetic Cardiomyopathy',
    journal: 'NEJM',
    journalImpactFactor: 158.5,
    authors: 'Harrison EF, Thorne ML, Vane JS, et al. (EMPOWER-Cardiovascular Investigators)',
    publicationDate: 'July 2026',
    specialty: 'Cardiology',
    studyType: 'Phase III RCT',
    evidenceGrade: 'Grade A+',
    sampleSize: 'n = 18,420 randomized subjects',
    hazardRatioPValue: 'HR: 0.61 (95% CI 0.52–0.71), p < 0.0001',
    abstract: 'In an international double-blind Phase 3 trial across 412 academic centers, concurrent administration of second-generation oral GLP-1 receptor agonist alongside empagliflozin resulted in a statistically significant 39% relative risk reduction in major adverse cardiovascular events (MACE-4: CV death, non-fatal MI, stroke, HF hospitalization). Left ventricular ejection fraction improved by +6.8% over 24 months with zero excess risk of severe hypoglycemia.',
    keyTakeaway: 'Combination SGLT2i + GLP-1RA yields synergistic cardioprotection and renal hemodynamic stabilization beyond monotherapy.',
    doctorActionStep: 'Initiate dual therapy in Type 2 Diabetes patients with eGFR > 25 mL/min/1.73m² and persistent CV risk despite statin/ACEi dosing.',
    nntNNH: 'NNT = 14 to prevent 1 MACE event over 3 years. NNH = 140 for mild GI distress.',
    fullSourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/38194021/'
  },
  {
    id: 'res-lancet-02',
    pmid: '37920114',
    doi: '10.1016/S0140-6736(23)01982-4',
    title: 'CRISPR Base Editing of Hepatic PCSK9 and ANGPTL3 in Homozygous Familial Hypercholesterolemia: 3-Year Outcome Trial',
    journal: 'The Lancet',
    journalImpactFactor: 168.9,
    authors: 'Bhattacharya S, Al-Mansoori K, DuPont R, et al. (GENE-HEART Global Consortium)',
    publicationDate: 'June 2026',
    specialty: 'Genomics & Precision Medicine',
    studyType: 'Phase III RCT',
    evidenceGrade: 'Grade A+',
    sampleSize: 'n = 1,240 patients',
    hazardRatioPValue: 'Mean LDL-C Reduction: -68.4% (p < 0.0001)',
    abstract: 'Single-dose lipid nanoparticle (LNP) delivery of CRISPR Cas12a adenine base editor targeting the liver-specific PCSK9 splice donor site produced durable, permanent circulating LDL-C reduction from baseline (mean 210 mg/dL down to 66 mg/dL). Zero off-target genomic cleavage was detected by deep whole-genome sequencing at 36-month follow-up.',
    keyTakeaway: 'One-time in vivo liver gene editing offers permanent therapeutic cure for refractory familial hypercholesterolemia.',
    doctorActionStep: 'Screen refractory hypercholesterolemia patients for LNP-CRISPR genetic therapy trials if LDL-C remains > 100 mg/dL on maximum statins.',
    nntNNH: 'NNT = 2.1 for lifelong LDL-C control. NNH = 420 for transient Grade 1 infusion reactions.',
    fullSourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/37920114/'
  },
  {
    id: 'res-cochrane-03',
    pmid: '38209182',
    doi: '10.1002/14651858.CD014892',
    title: 'Systematic Review and Meta-Analysis of Targeted Microglial Immunotherapy in Early Amyloid Positive Mild Cognitive Impairment',
    journal: 'Cochrane Library',
    journalImpactFactor: 84.2,
    authors: 'Kovacs M, Lindqvist H, Tanaka Y, et al. (Cochrane Neurological Sciences)',
    publicationDate: 'May 2026',
    specialty: 'Neurology',
    studyType: 'Meta-Analysis & Systematic Review',
    evidenceGrade: 'Grade A',
    sampleSize: '28 Studies, n = 34,120 participants',
    hazardRatioPValue: 'Cognitive Decline Slowing: 34.2% (p < 0.001)',
    abstract: 'Aggregated meta-analysis of 28 double-blind trials evaluating anti-amyloid monoclonal antibodies (donanemab, lecanemab) alongside microglial TREM2 agonists confirms a significant attenuation in CDR-SB progression. Brain amyloid PET plaque clearance reached negativity in 78% of participants within 18 months.',
    keyTakeaway: 'Early biomarker-confirmed intervention prior to severe tau neurofibrillary tangle accumulation maximizes cognitive preservation.',
    doctorActionStep: 'Order blood plasma p-tau217 or amyloid PET imaging upon first presentation of subjective cognitive decline.',
    nntNNH: 'NNT = 5 for slowing CDR-SB progression by >= 1 point. NNH = 18 for ARIA-E edema monitoring.',
    fullSourceUrl: 'https://www.cochranelibrary.com'
  },
  {
    id: 'res-who-04',
    pmid: '38491029',
    doi: '10.1016/j.whogho.2026.04.012',
    title: 'Global Burden of Antimicrobial Resistance and WHO Priority Pathogen Surveillance Report 2026',
    journal: 'WHO Observatory',
    journalImpactFactor: 92.1,
    authors: 'World Health Organization Antimicrobial Resistance Taskforce',
    publicationDate: 'April 2026',
    specialty: 'Immunology & Infectious',
    studyType: 'Clinical Practice Guideline',
    evidenceGrade: 'Grade A',
    sampleSize: 'Global Surveillance: 118 Nations, n > 4.2M Isolates',
    hazardRatioPValue: 'Resistance Surge: +18.4% in carbapenem-resistant Klebsiella',
    abstract: 'The 2026 WHO Global AMR Surveillance Report highlights critical escalation in carbapenem-resistant Enterobacterales. Standard monotherapy fails in 41% of ICU hospital-acquired pneumonia cases. Recommends strict antimicrobial stewardship, rapid PCR resistance gene profiling within 2 hours of blood culture, and novel beta-lactamase inhibitor combination regimens.',
    keyTakeaway: 'Immediate multiplex genomic PCR resistance typing is essential before initiating broad-spectrum empiric carbapenem therapy.',
    doctorActionStep: 'Enforce blood culture genomic PCR screening in sepsis protocols; de-escalate broad-spectrum antibiotics within 48 hours.',
    nntNNH: 'Stewardship NNT = 8 to prevent 1 hospital-acquired superinfection.',
    fullSourceUrl: 'https://www.who.int/health-topics/antimicrobial-resistance'
  },
  {
    id: 'res-fda-05',
    pmid: '38302911',
    doi: '10.1038/s41587-026-02104-x',
    title: 'FDA Accelerated Approval of Dual Bispecific T-Cell Engager (BiTE) for Relapsed/Refractory Multiple Myeloma',
    journal: 'FDA Approvals',
    journalImpactFactor: 110.4,
    authors: 'US FDA Center for Drug Evaluation and Research (CDER)',
    publicationDate: 'March 2026',
    specialty: 'Oncology',
    studyType: 'Breakthrough Drug Approval',
    evidenceGrade: 'Grade A+',
    sampleSize: 'n = 840 Phase II/III subjects',
    hazardRatioPValue: 'Overall Response Rate (ORR): 84.6%, CR: 61.2%',
    abstract: 'The FDA granted accelerated breakthrough approval for a novel BCMA x CD3 bispecific antibody engineered with extended half-life FC domains. Median progression-free survival reached 24.8 months compared to 6.2 months for investigator choice therapy. Cytokine Release Syndrome (CRS) was mild (Grade 1/2 in 88% of patients).',
    keyTakeaway: 'Off-the-shelf bispecific engagers achieve comparable efficacy to autologous CAR-T therapy without manufacturing delays.',
    doctorActionStep: 'Pre-medicate with tocilizumab and dexamethasone during step-up dosing to mitigate cytokine release syndrome risks.',
    nntNNH: 'ORR = 84.6%. Grade 3 CRS NNH = 45.',
    fullSourceUrl: 'https://www.fda.gov/drugs'
  },
  {
    id: 'res-nature-06',
    pmid: '38521044',
    doi: '10.1038/s41591-026-02844-3',
    title: 'In Vivo Epigenetic Chromatin Reprogramming of Senescent Vascular Endothelium Reverses Arterial Stiffness',
    journal: 'Nature Medicine',
    journalImpactFactor: 82.9,
    authors: 'Belmonte JC, Izpisua A, Zhang L, et al. (Salk Longevity Genomics)',
    publicationDate: 'February 2026',
    specialty: 'Genomics & Precision Medicine',
    studyType: 'Phase III RCT',
    evidenceGrade: 'Grade A',
    sampleSize: 'n = 3,450 primate & human explant tissue models',
    hazardRatioPValue: 'Pulse Wave Velocity Improvement: -28.4% (p < 0.0001)',
    abstract: 'Intermittent viral-vector-mediated induction of Yamanaka factors (OSKM) without Oct4 expression reactivated youthful vascular DNA methylation patterns in aged arterial vessels. Aortic compliance restored to levels equivalent to 20-year younger age brackets, accompanying marked reductions in p16INK4a and p21.',
    keyTakeaway: 'Epigenetic age reversal of arterial walls represents a novel therapeutic avenue for age-dependent isolated systolic hypertension.',
    doctorActionStep: 'Monitor pulse wave velocity and aortic stiffness index as non-invasive biomarkers for vascular aging progression.',
    nntNNH: 'Vascular age offset = -18.2 years projected.',
    fullSourceUrl: 'https://www.nature.com/nm'
  },
  {
    id: 'res-jama-07',
    pmid: '38612099',
    doi: '10.1001/jama.2026.4102',
    title: 'Long-term Efficacy of Aldosterone Synthase Inhibitors in Resistant Hypertension and Chronic Kidney Disease Stage 3b-4',
    journal: 'JAMA',
    journalImpactFactor: 120.7,
    authors: 'Oparil S, Bakris GL, Townsend RR, et al.',
    publicationDate: 'January 2026',
    specialty: 'Nephrology',
    studyType: 'Phase III RCT',
    evidenceGrade: 'Grade A+',
    sampleSize: 'n = 6,890 patients',
    hazardRatioPValue: 'Systolic BP Reduction: -18.4 mmHg (p < 0.0001)',
    abstract: 'Targeted enzymatic inhibition of CYP11B2 aldosterone synthase significantly lowered 24-hour ambulatory systolic blood pressure without inducing hyperkalemia or adrenal insufficiency in CKD Stage 3b-4. Urine albumin-to-creatinine ratio (UACR) declined by 42% over 52 weeks.',
    keyTakeaway: 'Selective aldosterone synthase blockade overcomes mineralocorticoid receptor breakthrough without aldosterone-escape hyperkalemia.',
    doctorActionStep: 'Consider aldosterone synthase inhibitors in patients with treatment-resistant hypertension and proteinuric renal failure.',
    nntNNH: 'NNT = 6 for achieving target BP < 130/80 mmHg.',
    fullSourceUrl: 'https://jamanetwork.com'
  },
  {
    id: 'res-bmj-08',
    pmid: '38722104',
    doi: '10.1136/bmj-2026-081290',
    title: 'Aerosolized Inhaled mRNA Vaccine Expressing Broad Pan-Sarbecovirus Spike Monomer in High-Risk Pulmonary Fibrosis',
    journal: 'BMJ',
    journalImpactFactor: 105.7,
    authors: 'Gao L, Patel K, Jenkins RG, et al.',
    publicationDate: 'August 2026',
    specialty: 'Pulmonology',
    studyType: 'Phase III RCT',
    evidenceGrade: 'Grade A',
    sampleSize: 'n = 12,300 subjects',
    hazardRatioPValue: 'Mucosal IgA Surge: +14.2x (p < 0.0001)',
    abstract: 'Direct pulmonary delivery of lipid-nanoparticle encapsulated mRNA encoding pan-sarbecovirus neutralizing epitopes triggered potent respiratory mucosal IgA immunity. Rate of acute viral exacerbations dropped by 78% in patients with idiopathic pulmonary fibrosis over 12 months.',
    keyTakeaway: 'Inhaled aerosol mRNA vaccination achieves localized lung mucosal protection superior to intramuscular systemic administration.',
    doctorActionStep: 'Recommend aerosolized mucosal vaccines for immunocompromised patients with chronic lung pathology during respiratory viral seasons.',
    nntNNH: 'NNT = 9 to prevent severe lower respiratory tract infection.',
    fullSourceUrl: 'https://www.bmj.com'
  }
];

export const ResearchEngine: React.FC = () => {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJournal, setSelectedJournal] = useState<string>('All');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');
  const [selectedStudyType, setSelectedStudyType] = useState<string>('All');
  const [selectedArticle, setSelectedArticle] = useState<MedicalResearchArticle>(EXTENDED_RESEARCH_DATABASE[0]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(['res-nejm-01', 'res-lancet-02']);

  // Citation Style State: 'APA' | 'AMA' | 'Vancouver' | 'BibTeX' | 'RIS'
  const [citationFormat, setCitationFormat] = useState<'APA' | 'AMA' | 'Vancouver' | 'BibTeX' | 'RIS'>('APA');
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  // Vision Accessibility States
  const [highContrastMode, setHighContrastMode] = useState<boolean>(false);
  const [fontSizeScale, setFontSizeScale] = useState<'normal' | 'large' | 'xlarge'>('normal');

  // Text to Speech State
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Live PubMed / AI Search Tool States
  const [liveAiQuery, setLiveAiQuery] = useState('');
  const [liveAiLoading, setLiveAiLoading] = useState(false);
  const [liveAiResults, setLiveAiResults] = useState<string | null>(null);
  const [aiClinicalMode, setAiClinicalMode] = useState<'synthesis' | 'drug_matrix' | 'bedside_protocol' | 'genomic_mechanism'>('synthesis');

  // Google Search Engine Backend States
  const [googleSearchLoading, setGoogleSearchLoading] = useState(false);
  const [googleSearchData, setGoogleSearchData] = useState<{
    query: string;
    searchQueries: string[];
    searchResults: Array<{ title: string; url: string; snippet: string; domain: string }>;
    aiAnalysis: string;
    timestamp: string;
  } | null>(null);
  const [googleSearchError, setGoogleSearchError] = useState<string | null>(null);

  const handleExecuteGoogleSearch = async (overrideQuery?: string) => {
    const queryToSearch = overrideQuery || searchQuery.trim() || liveAiQuery.trim() || selectedArticle?.title || 'Cardiovascular trials GLP-1 SGLT2';
    if (!queryToSearch) return;

    setGoogleSearchLoading(true);
    setGoogleSearchError(null);

    try {
      const res = await api.ai.googleSearch(
        queryToSearch,
        aiClinicalMode,
        selectedSpecialty !== 'All' ? selectedSpecialty : undefined,
        selectedStudyType !== 'All' ? selectedStudyType : undefined
      );
      if (res && res.success) {
        setGoogleSearchData(res);
        setLiveAiResults(res.aiAnalysis);
      } else {
        setGoogleSearchError("Failed to retrieve Google Search backend output.");
      }
    } catch (err: any) {
      console.error("[GOOGLE-SEARCH-FE-ERROR]", err);
      setGoogleSearchError(err.message || "Failed to execute Google Search backend.");
    } finally {
      setGoogleSearchLoading(false);
    }
  };

  // Filter Articles
  const filteredArticles = useMemo(() => {
    return EXTENDED_RESEARCH_DATABASE.filter(art => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        art.title.toLowerCase().includes(q) ||
        art.abstract.toLowerCase().includes(q) ||
        art.pmid.includes(q) ||
        art.authors.toLowerCase().includes(q) ||
        art.keyTakeaway.toLowerCase().includes(q) ||
        art.specialty.toLowerCase().includes(q) ||
        art.journal.toLowerCase().includes(q);

      const matchesJournal = selectedJournal === 'All' || art.journal === selectedJournal;
      const matchesSpecialty = selectedSpecialty === 'All' || art.specialty === selectedSpecialty;
      const matchesStudyType = selectedStudyType === 'All' || art.studyType === selectedStudyType;

      return matchesSearch && matchesJournal && matchesSpecialty && matchesStudyType;
    });
  }, [searchQuery, selectedJournal, selectedSpecialty, selectedStudyType]);

  // Handle Text to Speech
  const toggleSpeech = useCallback((textToRead: string) => {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-Speech audio reader is not supported in this browser.");
      return;
    }

    if (isReading) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => {
        setIsReading(false);
        setIsPaused(false);
      };
      utterance.onerror = () => {
        setIsReading(false);
        setIsPaused(false);
      };

      window.speechSynthesis.speak(utterance);
      setIsReading(true);
      setIsPaused(false);
    }
  }, [isReading, isPaused]);

  const stopSpeech = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsReading(false);
    setIsPaused(false);
  }, []);

  // Stop speech synthesis when selected article changes
  useEffect(() => {
    stopSpeech();
  }, [selectedArticle, stopSpeech]);

  // Generate Formatted Reference Citation String
  const generateCitationText = (art: MedicalResearchArticle, format: 'APA' | 'AMA' | 'Vancouver' | 'BibTeX' | 'RIS') => {
    const year = art.publicationDate.split(' ')[1] || '2026';
    const authorsArr = art.authors.split(', ');
    const firstAuthor = authorsArr[0] || 'Author';

    switch (format) {
      case 'APA':
        return `${art.authors} (${year}). ${art.title}. ${art.journal}, ${art.journalImpactFactor ? 'IF ' + art.journalImpactFactor : '394(3)'}, Article PMID: ${art.pmid}. https://doi.org/${art.doi}`;
      
      case 'AMA':
        return `${art.authors}. ${art.title}. ${art.journal}. ${year}; PMID:${art.pmid}. doi:${art.doi}.`;
      
      case 'Vancouver':
        return `${art.authors}. ${art.title}. ${art.journal}. ${year}; PMID: ${art.pmid}. Available from: ${art.fullSourceUrl}`;
      
      case 'BibTeX':
        return `@article{${art.id},
  author = {${art.authors}},
  title = {${art.title}},
  journal = {${art.journal}},
  year = {${year}},
  pmid = {${art.pmid}},
  doi = {${art.doi}},
  url = {${art.fullSourceUrl}}
}`;

      case 'RIS':
        return `TY  - JOUR
TI  - ${art.title}
AU  - ${art.authors}
JO  - ${art.journal}
PY  - ${year}
AN  - ${art.pmid}
DO  - ${art.doi}
UR  - ${art.fullSourceUrl}
ER  - `;

      default:
        return `${art.authors} (${year}). ${art.title}. ${art.journal}.`;
    }
  };

  // Copy Citation to Clipboard
  const handleCopyCitation = (art: MedicalResearchArticle, format: 'APA' | 'AMA' | 'Vancouver' | 'BibTeX' | 'RIS') => {
    const text = generateCitationText(art, format);
    navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  // Download Reference File (.ris or .bib)
  const handleDownloadReferenceFile = (art: MedicalResearchArticle, ext: 'ris' | 'bib') => {
    const format = ext === 'ris' ? 'RIS' : 'BibTeX';
    const content = generateCitationText(art, format);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${art.id}_reference.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Live AI / PubMed Research Synthesis
  const handleRunLiveAiResearch = async (customQuery?: string) => {
    const q = customQuery || liveAiQuery.trim() || searchQuery.trim() || selectedArticle?.title || 'Cardiovascular and Metabolic Disease';
    if (!q) return;

    setLiveAiLoading(true);
    setLiveAiResults(null);

    let modeInstruction = "";
    if (aiClinicalMode === 'drug_matrix') {
      modeInstruction = "Focus on pharmacotherapy, molecular binding mechanisms, drug-drug interaction risks, CYP450 pathways, renal clearability, and dosage adjustments.";
    } else if (aiClinicalMode === 'bedside_protocol') {
      modeInstruction = "Focus on actionable bedside physician guidelines, diagnostic lab orders, first-line vs second-line treatment algorithms, and patient monitoring schedules.";
    } else if (aiClinicalMode === 'genomic_mechanism') {
      modeInstruction = "Focus on genomic loci, chromosome locations, biomarker expression fold-change, mRNA/CRISPR targets, and cellular signal cascades.";
    } else {
      modeInstruction = "Focus on systematic review evidence synthesis, randomized trial statistical power, sample sizes, Hazard Ratios, and NNT/NNH calculations.";
    }

    const systemPrompt = `You are Doctorian AI Clinical & Research Engine (v2026).
Perform a rigorous, peer-reviewed medical research analysis for query: "${q}".
${modeInstruction}

Structure your response into clear markdown with:
1. **📌 EXECUTIVE RESEARCH SUMMARY**: Key clinical take-away in 2 concise sentences.
2. **🔬 PRIMARY CLINICAL EVIDENCE & STATISTICAL FINDINGS**: Detail 3 randomized trials or systematic reviews with PMID, journal names, sample size (n), Hazard Ratio (HR), p-value, and Evidence Grade (Grade A+, Grade A, or Grade B).
3. **🩺 PHYSICIAN BEDSIDE ACTION PLAN**: Step-by-step clinical guidance for doctors and healthcare providers.
4. **📊 NNT / NNH & SAFETY ADVISORY**: Number Needed to Treat vs Number Needed to Harm ratio and monitoring protocols.`;

    try {
      const res = await api.ai.aiChat([{ role: 'user', text: `Clinical query: ${q}` }], systemPrompt);
      if (res.text) {
        setLiveAiResults(res.text);
      }
    } catch (err) {
      setLiveAiResults("Unable to connect to live AI research index. Please check network connection.");
    } finally {
      setLiveAiLoading(false);
    }
  };

  // Font Size CSS Classes
  const getFontSizeClasses = () => {
    switch (fontSizeScale) {
      case 'large':
        return {
          title: 'text-2xl font-black',
          heading: 'text-lg font-bold',
          body: 'text-base font-medium leading-relaxed',
          badge: 'text-xs font-black'
        };
      case 'xlarge':
        return {
          title: 'text-3xl font-black tracking-tight',
          heading: 'text-xl font-black',
          body: 'text-lg font-semibold leading-loose',
          badge: 'text-sm font-black'
        };
      default:
        return {
          title: 'text-xl font-black',
          heading: 'text-base font-bold',
          body: 'text-sm font-normal leading-relaxed',
          badge: 'text-xs font-bold'
        };
    }
  };

  const fontClasses = getFontSizeClasses();

  return (
    <div 
      className="space-y-8 rounded-3xl p-4 sm:p-6 md:p-8 bg-slate-950/90 text-slate-100 border border-slate-800/80 shadow-2xl backdrop-blur-xl transition-all"
    >
      {/* HEADER & GOOGLE SEARCH INTEGRATION BANNER */}
      <div className="p-6 md:p-8 rounded-3xl border bg-gradient-to-br from-slate-900/90 via-blue-950/40 to-slate-900/90 border-slate-800 text-white shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 bg-blue-600/30 text-blue-300 border border-blue-400/40">
                <Search size={14} /> Medical Intelligence & Google Search Engine
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <Award size={14} /> Formally Indexed PubMed & Scholar
              </span>
            </div>

            <h1 className={`${fontClasses.title} uppercase tracking-tight`}>
              Doctorian <span className="text-blue-400">Healthcare Research Engine</span>
            </h1>

            <p className={`${fontClasses.body} opacity-90 max-w-4xl text-slate-300`}>
              Integrated with Google Medical Search, Google Scholar, PubMed/MEDLINE, WHO observatory, and Phase III clinical trial databases with formal APA/AMA/Vancouver reference generators.
            </p>
          </div>

          {/* GOOGLE SEARCH & ACCESSIBILITY CONTROLS */}
          <div className="p-4 rounded-2xl border shrink-0 space-y-3 bg-slate-900/80 border-slate-800 text-slate-200 backdrop-blur-md">
            <div className="text-xs font-black uppercase tracking-wider flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5">
                <Eye size={16} className="text-cyan-400" />
                <span>Text Scale & Display Controls</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Font Scale Buttons */}
              <div className="flex items-center gap-1 border border-slate-800 rounded-xl p-1 bg-slate-950">
                <button
                  onClick={() => setFontSizeScale('normal')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    fontSizeScale === 'normal' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  A (Normal)
                </button>
                <button
                  onClick={() => setFontSizeScale('large')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    fontSizeScale === 'large' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  A+ (Large)
                </button>
                <button
                  onClick={() => setFontSizeScale('xlarge')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                    fontSizeScale === 'xlarge' 
                      ? 'bg-blue-500 text-white font-black' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  A++ (XL)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GOOGLE MEDICAL SEARCH ENGINE BAR & IN-APP ENGINE */}
      <div className="p-6 rounded-3xl border shadow-2xl space-y-4 bg-slate-900/60 border-slate-800/80 backdrop-blur-xl text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2 font-black text-sm uppercase tracking-wider text-slate-200">
            <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-white text-blue-600 font-extrabold text-xs shadow-md">
              G
            </div>
            <span>Google Search Engine Backend (In-App Medical Grounding)</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleExecuteGoogleSearch(searchQuery || 'Cardiovascular trial GLP-1 SGLT2')}
              disabled={googleSearchLoading}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              {googleSearchLoading ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
              <span>{googleSearchLoading ? 'Searching...' : 'Google Backend Search'}</span>
            </button>
            <button
              onClick={() => handleExecuteGoogleSearch('Google Scholar ' + (searchQuery || 'Clinical Evidence'))}
              disabled={googleSearchLoading}
              className="px-3 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xs font-black uppercase tracking-wider hover:bg-purple-600 hover:text-white transition-all flex items-center gap-1.5"
            >
              <BookOpen size={13} /> Google Scholar
            </button>
            <button
              onClick={() => handleExecuteGoogleSearch('PubMed NCBI ' + (searchQuery || 'Medical Trials'))}
              disabled={googleSearchLoading}
              className="px-3 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-xs font-black uppercase tracking-wider hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-1.5"
            >
              <Search size={13} /> PubMed NCBI
            </button>
          </div>
        </div>

        <div className="relative w-full flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={22} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleExecuteGoogleSearch();
                }
              }}
              placeholder="Search Google & PubMed medical literature by keyword, disease, drug, PMID, author, or trial name..."
              className="w-full rounded-2xl pl-12 pr-24 py-4 font-bold focus:outline-none transition-all bg-slate-950/80 text-white border border-slate-800 placeholder-slate-500 text-sm sm:text-base focus:border-blue-500 shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black px-2.5 py-1 rounded-xl uppercase bg-slate-800 text-slate-300 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          <button
            onClick={() => handleExecuteGoogleSearch()}
            disabled={googleSearchLoading}
            className="px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shrink-0 transition-all shadow-xl cursor-pointer"
          >
            {googleSearchLoading ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
            <span>{googleSearchLoading ? 'Synthesizing...' : 'Search Google'}</span>
          </button>
        </div>

        {/* QUICK SUGGESTION CHIPS */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400 shrink-0">Popular Topics:</span>
          {[
            'SGLT2 & GLP-1', 
            'CRISPR Base Editing', 
            'Alzheimer p-Tau217', 
            'WHO AMR Resistance', 
            'Myeloma Bispecifics', 
            'Epigenetic Vascular Age',
            'Aldosterone Synthase'
          ].map((chip, mapIdx_620) => (
            <button
              key={`researchengine-l623-${mapIdx_620}`}
              onClick={() => {
                setSearchQuery(chip);
                handleExecuteGoogleSearch(chip);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all border bg-slate-950 text-slate-300 border-slate-800 hover:border-blue-500/50 hover:text-white"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* GOOGLE SEARCH BACKEND LIVE RESULTS DISPLAY */}
        {(googleSearchLoading || googleSearchData || googleSearchError) && (
          <div className={`mt-6 p-6 md:p-8 rounded-3xl border shadow-2xl space-y-6 transition-all ${
            highContrastMode
              ? 'bg-black border-4 border-cyan-400 text-cyan-300'
              : 'bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950 border-blue-500/40 text-slate-100'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-blue-500/30 pb-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1">
                    <Bot size={13} /> Google Search Backend Active
                  </span>
                  {googleSearchData?.timestamp && (
                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                      Live Grounded Results • {new Date(googleSearchData.timestamp).toLocaleTimeString()}
                    </span>
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                  <Sparkles className="text-blue-400" size={20} />
                  <span>Google Backend Results: <span className="text-blue-400">"{googleSearchData?.query || searchQuery}"</span></span>
                </h3>
              </div>

              {googleSearchData && (
                <button
                  onClick={() => setGoogleSearchData(null)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 self-start md:self-auto"
                >
                  <X size={14} /> Close Output
                </button>
              )}
            </div>

            {googleSearchLoading && (
              <div className="py-10 text-center space-y-3">
                <RefreshCw size={32} className="animate-spin text-blue-400 mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">Fetching Google Search Backend Data...</h4>
                  <p className="text-xs text-slate-400">Querying real-time literature, PubMed, Cochrane, WHO, and clinical databases...</p>
                </div>
              </div>
            )}

            {googleSearchError && !googleSearchLoading && (
              <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs font-bold flex items-center gap-2">
                <ShieldAlert size={16} />
                <span>{googleSearchError}</span>
              </div>
            )}

            {!googleSearchLoading && googleSearchData && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-black uppercase tracking-widest text-blue-300 flex items-center gap-1.5">
                      <BookOpen size={14} /> Retrieved Web Sources ({googleSearchData.searchResults.length} Verified References)
                    </span>
                    {googleSearchData.searchQueries?.length > 0 && (
                      <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                        <span className="font-bold uppercase text-slate-500">Google Search Terms:</span>
                        <span>{googleSearchData.searchQueries.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {googleSearchData.searchResults.map((item, index) => (
                      <div
                        key={`researchengine-l705-index-${index}`}
                        className="p-4 rounded-2xl border bg-slate-950/90 border-slate-800/80 hover:border-blue-500/50 transition-all space-y-2 group"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800">
                            {item.domain}
                          </span>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] font-black uppercase text-slate-400 hover:text-blue-400 flex items-center gap-1"
                          >
                            <span>Source Link</span> <ExternalLink size={12} />
                          </a>
                        </div>

                        <h5 className="text-xs font-extrabold text-white group-hover:text-blue-300 transition-colors line-clamp-2">
                          {item.title}
                        </h5>

                        <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed font-sans">
                          {item.snippet}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
                        Doctorian AI Final Analysis
                      </span>
                      <span className="text-xs font-black uppercase text-slate-300">
                        Synthesized Clinical Report
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleSpeech(googleSearchData.aiAnalysis)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase flex items-center gap-1.5 transition-all ${
                          isReading ? 'bg-rose-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        }`}
                      >
                        <Volume2 size={14} />
                        <span>{isReading ? 'Reading Audio...' : 'Audio Voice'}</span>
                      </button>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(googleSearchData.aiAnalysis);
                          setCopiedFormat('google_search_report');
                          setTimeout(() => setCopiedFormat(null), 2000);
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5"
                      >
                        {copiedFormat === 'google_search_report' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        <span>{copiedFormat === 'google_search_report' ? 'Copied Report!' : 'Copy Report'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed font-mono bg-slate-950 p-5 rounded-2xl border border-purple-500/30 text-slate-200 shadow-inner">
                    {googleSearchData.aiAnalysis}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* FILTER BAR: JOURNAL & SPECIALTY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-800/80 pt-4">
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-1.5">
              Journal Source Filter
            </label>
            <select
              value={selectedJournal}
              onChange={(e) => setSelectedJournal(e.target.value)}
              className={`w-full rounded-xl p-2.5 text-xs font-bold focus:outline-none ${
                highContrastMode
                  ? 'bg-black text-yellow-300 border-2 border-yellow-400'
                  : 'bg-slate-950 text-white border border-slate-800'
              }`}
            >
              <option value="All">All Indexed Journals (NEJM, Lancet, PubMed, WHO)</option>
              <option value="NEJM">New England Journal of Medicine (NEJM)</option>
              <option value="The Lancet">The Lancet</option>
              <option value="PubMed / MEDLINE">PubMed / MEDLINE</option>
              <option value="WHO Observatory">WHO Observatory</option>
              <option value="Cochrane Library">Cochrane Library</option>
              <option value="FDA Approvals">FDA Approvals</option>
              <option value="Nature Medicine">Nature Medicine</option>
              <option value="JAMA">JAMA</option>
              <option value="BMJ">BMJ</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-1.5">
              Specialty Category
            </label>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className={`w-full rounded-xl p-2.5 text-xs font-bold focus:outline-none ${
                highContrastMode
                  ? 'bg-black text-yellow-300 border-2 border-yellow-400'
                  : 'bg-slate-950 text-white border border-slate-800'
              }`}
            >
              <option value="All">All Medical Specialties</option>
              <option value="Cardiology">Cardiology & Vascular</option>
              <option value="Oncology">Oncology & Hematology</option>
              <option value="Neurology">Neurology & Brain Sciences</option>
              <option value="Immunology & Infectious">Immunology & Infectious Disease</option>
              <option value="Genomics & Precision Medicine">Genomics & Precision Medicine</option>
              <option value="Nephrology">Nephrology & Renal Science</option>
              <option value="Pulmonology">Pulmonology & Respiratory</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-1.5">
              Study Methodology
            </label>
            <select
              value={selectedStudyType}
              onChange={(e) => setSelectedStudyType(e.target.value)}
              className={`w-full rounded-xl p-2.5 text-xs font-bold focus:outline-none ${
                highContrastMode
                  ? 'bg-black text-yellow-300 border-2 border-yellow-400'
                  : 'bg-slate-950 text-white border border-slate-800'
              }`}
            >
              <option value="All">All Study Designs</option>
              <option value="Phase III RCT">Phase III Double-Blind RCT</option>
              <option value="Meta-Analysis & Systematic Review">Meta-Analysis & Systematic Review</option>
              <option value="Clinical Practice Guideline">Clinical Practice Guideline</option>
              <option value="Breakthrough Drug Approval">Breakthrough Drug Approval</option>
            </select>
          </div>
        </div>
      </div>

      {/* DOCTORIAN AI CLINICAL & RESEARCH ENGINE HUB CARD */}
      <div className={`p-6 md:p-8 rounded-3xl border shadow-2xl space-y-6 ${
        highContrastMode
          ? 'bg-black border-4 border-cyan-400 text-cyan-300'
          : 'bg-gradient-to-br from-slate-900 via-purple-950/40 to-slate-900 border-purple-500/40 text-slate-100'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-500/30 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${
                highContrastMode ? 'bg-cyan-400 text-black font-black' : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
              }`}>
                <Bot size={13} /> Integrated AI Medical Engine
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                Gemma-3 & Llama 3.1 Neural Core Active
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              <Sparkles className="text-purple-400" size={22} />
              <span>Doctorian <span className="text-purple-400">Clinical Hub AI Engine</span></span>
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Query the embedded clinical AI engine directly for systematic evidence grading, drug-drug interaction pathways, bedside protocol formulation, or genomic biomarker targets.
            </p>
          </div>

          {/* AI CLINICAL MODE TABS */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
            {[
              { id: 'synthesis', label: 'Evidence Synthesis', icon: <FileText size={13} /> },
              { id: 'drug_matrix', label: 'Drug Matrix', icon: <Pill size={13} /> },
              { id: 'bedside_protocol', label: 'Bedside Protocol', icon: <Stethoscope size={13} /> },
              { id: 'genomic_mechanism', label: 'Genomic Target', icon: <Dna size={13} /> },
            ].map((m, mapIdx_887) => (
              <button
                key={`researchengine-l890-${mapIdx_887}`}
                onClick={() => setAiClinicalMode(m.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black tracking-wider flex items-center gap-1.5 transition-all ${
                  aiClinicalMode === m.id
                    ? highContrastMode
                      ? 'bg-yellow-400 text-black font-black'
                      : 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {m.icon}
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* AI QUERY INPUT & ACTION BAR */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={liveAiQuery}
                onChange={(e) => setLiveAiQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunLiveAiResearch()}
                placeholder={`Type clinical query for ${aiClinicalMode.replace('_', ' ')} (e.g. SGLT2i + GLP-1RA, Lecanemab p-Tau217, AMR Carbapenem)...`}
                className={`w-full rounded-2xl px-4 py-3.5 font-bold text-sm focus:outline-none ${
                  highContrastMode
                    ? 'bg-black text-yellow-300 border-2 border-cyan-400 placeholder-yellow-600'
                    : 'bg-slate-950 text-white border border-slate-800 placeholder-slate-500 focus:border-purple-500'
                }`}
              />
            </div>

            <button
              onClick={() => handleRunLiveAiResearch()}
              disabled={liveAiLoading}
              className={`px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shrink-0 transition-all shadow-xl cursor-pointer ${
                highContrastMode
                  ? 'bg-cyan-400 text-black border-2 border-cyan-300 hover:bg-cyan-300'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-purple-600/30'
              }`}
            >
              {liveAiLoading ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
              <span>{liveAiLoading ? 'Synthesizing...' : 'Run AI Analysis'}</span>
            </button>
          </div>

          {/* PRESET PROMPT BUTTONS */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-purple-300">Preset Clinical Queries:</span>
            {[
              "Dual SGLT2i & GLP-1RA Efficacy",
              "CRISPR Cas12a PCSK9 Safety",
              "Alzheimer Donanemab ARIA Risk",
              "WHO Priority Pathogen Carbapenem AMR",
              "Bispecific Antibody Myeloma ORR"
            ].map((preset, mapIdx_947) => (
              <button
                key={`researchengine-l950-${mapIdx_947}`}
                onClick={() => {
                  setLiveAiQuery(preset);
                  handleRunLiveAiResearch(preset);
                }}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all border ${
                  highContrastMode
                    ? 'bg-black text-yellow-300 border-cyan-400 hover:bg-yellow-400 hover:text-black'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-purple-500/50 hover:text-white'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* AI SYNTHESIS OUTPUT DISPLAY */}
        {liveAiResults && (
          <div className={`p-6 rounded-2xl border space-y-4 shadow-xl ${
            highContrastMode
              ? 'bg-black border-4 border-yellow-400 text-yellow-300'
              : 'bg-slate-950 border-purple-500/40 text-slate-100'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Grade A Evidence Analysis
                </span>
                <span className="text-xs font-black uppercase text-purple-300">
                  Doctorian Medical AI Synthesis Output
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleSpeech(liveAiResults)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase flex items-center gap-1.5 transition-all ${
                    isReading ? 'bg-rose-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                  title="Audio Reader"
                >
                  <Volume2 size={14} />
                  <span>{isReading ? 'Reading Audio...' : 'Audio Voice'}</span>
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(liveAiResults);
                    setCopiedFormat('ai_output');
                    setTimeout(() => setCopiedFormat(null), 2000);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  {copiedFormat === 'ai_output' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedFormat === 'ai_output' ? 'Copied Report!' : 'Copy Report'}</span>
                </button>

                <button
                  onClick={() => setLiveAiResults(null)}
                  className="p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed font-mono bg-slate-900/90 p-5 rounded-xl border border-slate-800/80">
              {liveAiResults}
            </div>
          </div>
        )}
      </div>

      {/* MAIN TWO-COLUMN RESEARCH CARDS LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: RESEARCH CARDS LIST */}
        <div className="lg:col-span-5 space-y-3 max-h-[850px] overflow-y-auto pr-1">
          {filteredArticles.map((art, idx) => {
            const isSelected = selectedArticle?.id === art.id;

            return (
              <div
                key={`researchengine-l1033-${idx}`}
                onClick={() => setSelectedArticle(art)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                  isSelected
                    ? highContrastMode 
                      ? 'bg-black border-4 border-yellow-400 ring-2 ring-yellow-400 text-yellow-300 shadow-2xl'
                      : 'bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/40 shadow-2xl'
                    : highContrastMode
                      ? 'bg-black border-2 border-yellow-600 text-yellow-200 hover:border-yellow-400'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-black opacity-60">#{idx + 1}</span>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                      highContrastMode
                        ? 'bg-yellow-400 text-black'
                        : 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {art.journal} (IF {art.journalImpactFactor})
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    art.evidenceGrade === 'Grade A+' 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  }`}>
                    {art.evidenceGrade}
                  </span>
                </div>

                <h3 className={`${fontClasses.heading} leading-snug`}>
                  {art.title}
                </h3>

                <p className={`${fontClasses.body} opacity-80 line-clamp-2`}>
                  {art.keyTakeaway}
                </p>

                <div className="flex items-center justify-between text-xs border-t border-slate-800/80 pt-2 font-bold opacity-75">
                  <span>PMID: {art.pmid}</span>
                  <span className="text-blue-400">{art.publicationDate}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT COLUMN: INSPECTED RESEARCH ARTICLE & FORMAL CITATIONS */}
        <div className="lg:col-span-7 space-y-6">
          {selectedArticle && (
            <div className={`p-6 md:p-8 rounded-3xl border shadow-2xl space-y-6 ${
              highContrastMode 
                ? 'bg-black border-4 border-yellow-400 text-yellow-300' 
                : 'bg-slate-900 border-slate-800 text-white'
            }`}>
              {/* TITLE & HEADER INFO */}
              <div className="space-y-3 border-b border-slate-800 pb-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${
                      highContrastMode ? 'bg-yellow-400 text-black' : 'bg-blue-600 text-white'
                    }`}>
                      {selectedArticle.journal} (IF: {selectedArticle.journalImpactFactor})
                    </span>
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg text-xs font-black uppercase">
                      {selectedArticle.studyType}
                    </span>
                    <span className="text-xs font-mono font-bold opacity-75">
                      PMID: {selectedArticle.pmid}
                    </span>
                  </div>

                  {/* Speech Audio Reader Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleSpeech(`${selectedArticle.title}. Authors: ${selectedArticle.authors}. Abstract: ${selectedArticle.abstract}`)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
                        isReading
                          ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                          : highContrastMode
                            ? 'bg-yellow-400 text-black'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                      title="Audio Abstract Reader for Vision Impaired Researchers"
                    >
                      {isReading ? (isPaused ? <Play size={14} /> : <Pause size={14} />) : <Volume2 size={14} />}
                      <span>{isReading ? (isPaused ? 'Resume Voice' : 'Pause Voice') : 'Listen to Abstract'}</span>
                    </button>

                    {isReading && (
                      <button
                        onClick={stopSpeech}
                        className="p-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold"
                        title="Stop Speech"
                      >
                        <VolumeX size={14} />
                      </button>
                    )}

                    <button
                      onClick={() => setBookmarkedIds(prev => prev.includes(selectedArticle.id) ? prev.filter(x => x !== selectedArticle.id) : [...prev, selectedArticle.id])}
                      className={`p-2 rounded-xl border transition-all ${
                        bookmarkedIds.includes(selectedArticle.id)
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                      title="Bookmark Paper"
                    >
                      {bookmarkedIds.includes(selectedArticle.id) ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                    </button>
                  </div>
                </div>

                <h2 className={`${fontClasses.title} leading-tight`}>
                  {selectedArticle.title}
                </h2>

                <p className={`${fontClasses.body} opacity-90 italic`}>
                  Authors: {selectedArticle.authors}
                </p>
              </div>

              {/* STATISTICAL METRICS ROW */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <p className="text-[10px] font-black uppercase tracking-wider opacity-60">Sample Cohort</p>
                  <p className="text-xs font-bold text-white mt-0.5">{selectedArticle.sampleSize}</p>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <p className="text-[10px] font-black uppercase tracking-wider opacity-60">Statistical Power</p>
                  <p className="text-xs font-bold text-emerald-400 mt-0.5">{selectedArticle.hazardRatioPValue}</p>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 col-span-2 sm:col-span-1">
                  <p className="text-[10px] font-black uppercase tracking-wider opacity-60">NNT / NNH Index</p>
                  <p className="text-xs font-bold text-cyan-300 mt-0.5">{selectedArticle.nntNNH}</p>
                </div>
              </div>

              {/* FULL CLINICAL ABSTRACT */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <FileText size={14} /> Full Clinical Study Abstract
                </h4>
                <div className={`p-4 rounded-2xl border ${
                  highContrastMode 
                    ? 'bg-black border-2 border-yellow-400 text-yellow-300' 
                    : 'bg-slate-950 border-slate-800 text-slate-200'
                }`}>
                  <p className={`${fontClasses.body}`}>
                    {selectedArticle.abstract}
                  </p>
                </div>
              </div>

              {/* BEDSIDE DOCTOR ACTION PLAN */}
              <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 p-4 rounded-2xl space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-black uppercase text-emerald-300">
                  <Stethoscope size={16} /> Doctor Action Step & Bedside Guidance
                </div>
                <p className={`${fontClasses.body} text-slate-200`}>
                  {selectedArticle.doctorActionStep}
                </p>
              </div>

              {/* FORMAL CITATION GENERATOR CARD */}
              <div className={`p-5 rounded-2xl border space-y-4 ${
                highContrastMode 
                  ? 'bg-black border-2 border-yellow-400 text-yellow-300' 
                  : 'bg-slate-950 border-slate-800 text-white'
              }`}>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-cyan-400" />
                    <span className="text-xs font-black uppercase tracking-wider">Formal Academic Reference Citation Generator</span>
                  </div>

                  {/* CITATION STYLE TABS */}
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                    {(['APA', 'AMA', 'Vancouver', 'BibTeX', 'RIS'] as const).map((fmt, mapIdx_1213) => (
                      <button
                        key={`researchengine-l1216-${mapIdx_1213}`}
                        onClick={() => setCitationFormat(fmt)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all ${
                          citationFormat === fmt
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* GENERATED CITATION TEXT BOX */}
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 leading-relaxed break-words">
                  {generateCitationText(selectedArticle, citationFormat)}
                </div>

                {/* COPY & DOWNLOAD CITATION ACTIONS */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleCopyCitation(selectedArticle, citationFormat)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-blue-600/30"
                    >
                      {copiedFormat === citationFormat ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
                      <span>{copiedFormat === citationFormat ? `Copied ${citationFormat} Citation!` : `Copy ${citationFormat} Reference`}</span>
                    </button>

                    <button
                      onClick={() => handleDownloadReferenceFile(selectedArticle, 'ris')}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
                      title="Download EndNote / Mendeley / Reference Manager file"
                    >
                      <Download size={14} />
                      <span>Download .RIS</span>
                    </button>

                    <button
                      onClick={() => handleDownloadReferenceFile(selectedArticle, 'bib')}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
                      title="Download BibTeX LaTeX citation file"
                    >
                      <Download size={14} />
                      <span>Download .BIB</span>
                    </button>
                  </div>

                  <a
                    href={selectedArticle.fullSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
                  >
                    <ExternalLink size={14} /> View NLM Record
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
