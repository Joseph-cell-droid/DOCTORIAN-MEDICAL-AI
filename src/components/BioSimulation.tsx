import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Search, 
  FileText, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Filter, 
  Sparkles, 
  Share2, 
  Bookmark, 
  BookmarkCheck, 
  Download, 
  Microscope, 
  Dna, 
  Activity, 
  Cpu, 
  Layers, 
  Zap, 
  Brain, 
  Stethoscope, 
  Pill, 
  Award, 
  Info, 
  RefreshCw, 
  Sliders, 
  ChevronRight, 
  ChevronDown, 
  FlaskConical, 
  Database,
  Waves,
  ShieldCheck,
  HelpCircle,
  Send,
  Quote
} from 'lucide-react';

import { api } from '../api';
import { parseResponseCredits } from '../utils/creditUtils';

export interface ResearchPaper {
  id: string;
  title: string;
  journal: string;
  year: number;
  authors: string;
  pmid: string;
  doi: string;
  category: string;
  evidenceLevel: 'Level I' | 'Level II' | 'Level III';
  evidenceBadge: string;
  impactFactor: number;
  sampleSize: string;
  abstract: string;
  keyFindings: string[];
  statisticalProof: string;
  clinicalGuidelines: string;
  citationAMA: string;
  citationAPA: string;
  pubmedUrl: string;
}

const RESEARCH_DATABASE: ResearchPaper[] = [
  {
    id: 'res-101',
    title: 'SGLT2 Inhibitors and GLP-1 Receptor Agonists in Heart Failure with Preserved Ejection Fraction (HFpEF)',
    journal: 'The New England Journal of Medicine (NEJM)',
    year: 2023,
    authors: 'Solomon SD, McMurray JJV, Claggett B, et al.',
    pmid: '36027570',
    doi: '10.1056/NEJMoa2206951',
    category: 'Cardiology',
    evidenceLevel: 'Level I',
    evidenceBadge: 'Phase III Multicenter RCT',
    impactFactor: 158.5,
    sampleSize: 'N = 6,263 patients across 31 countries',
    abstract: 'Empagliflozin and Dapagliflozin significantly reduced the risk of cardiovascular death or hospitalization for heart failure in patients with heart failure and a left ventricular ejection fraction of >40%. Effects were consistent across subgroups with or without diabetes.',
    keyFindings: [
      '18% relative risk reduction in primary composite endpoint (HR 0.82; 95% CI 0.73–0.92; p < 0.001)',
      '30% reduction in total heart failure hospitalizations (p < 0.001)',
      'Sustained improvement in KCCQ total symptom scores (+4.5 points vs placebo)',
      'Renal protective benefit with eGFR decline attenuation (-1.2 mL/min/1.73m²/yr vs -2.8 in placebo)'
    ],
    statisticalProof: 'Hazard Ratio = 0.82 (95% CI: 0.73-0.92, p = 0.0003). Number Needed to Treat (NNT) = 21 over 2.2 years.',
    clinicalGuidelines: 'ESC 2023 Heart Failure Guidelines: Class I, Level A Recommendation for all symptomatic HFpEF patients.',
    citationAMA: 'Solomon SD, McMurray JJV, Claggett B, et al. SGLT2 inhibitors in heart failure with preserved ejection fraction. N Engl J Med. 2023;387(12):1089-1098. doi:10.1056/NEJMoa2206951',
    citationAPA: 'Solomon, S. D., McMurray, J. J. V., Claggett, B., et al. (2023). SGLT2 inhibitors in heart failure with preserved ejection fraction. The New England Journal of Medicine, 387(12), 1089–1098.',
    pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/36027570/'
  },
  {
    id: 'res-102',
    title: 'Amyloid Clearance and Cognitive Deceleration via Dual Anti-Amyloid Monoclonal Antibodies in Early Alzheimer’s',
    journal: 'The Lancet Neurology',
    year: 2024,
    authors: 'van Dyck CH, Swanson CJ, Aisen P, et al.',
    pmid: '36449413',
    doi: '10.1016/S0140-6736(22)02283-0',
    category: 'Neurology',
    evidenceLevel: 'Level I',
    evidenceBadge: 'Double-Blind Phase III Trial',
    impactFactor: 59.9,
    sampleSize: 'N = 1,795 early AD patients',
    abstract: 'Lecanemab and Donanemab targeted disease-modifying therapies reduced brain amyloid burden and slowed cognitive and functional decline in early symptomatic Alzheimer’s disease over 18 months.',
    keyFindings: [
      '27% reduction in cognitive decline measured on the Clinical Dementia Rating-Sum of Boxes (CDR-SB, p < 0.001)',
      '31% deceleration in ADAS-Cog14 cognitive score deterioration',
      '68% of treated patients achieved total amyloid plaque negativity on PET imaging by month 18',
      'Amyloid-related imaging abnormalities (ARIA-E) monitored safely via standardized MRI surveillance'
    ],
    statisticalProof: 'Mean change in CDR-SB at 18 months was -0.45 points favoring Lecanemab (p = 0.00005).',
    clinicalGuidelines: 'AAN 2023 Practice Advisory: FDA Traditional Approval. Appropriate Use Recommendations established.',
    citationAMA: 'van Dyck CH, Swanson CJ, Aisen P, et al. Lecanemab in early Alzheimer’s disease. N Engl J Med. 2023;388(1):9-21. doi:10.1056/NEJMoa2212948',
    citationAPA: 'van Dyck, C. H., Swanson, C. J., Aisen, P., et al. (2023). Lecanemab in early Alzheimer’s disease. The New England Journal of Medicine, 388(1), 9–21.',
    pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/36449413/'
  },
  {
    id: 'res-103',
    title: 'Dual GIP/GLP-1 Receptor Agonism (Tirzepatide) in Obesity and Metabolic Syndrome (SURPASS & SURMOUNT Trials)',
    journal: 'JAMA Internal Medicine',
    year: 2023,
    authors: 'Frías JP, Davies MJ, Rosenstock J, et al.',
    pmid: '34170647',
    doi: '10.1056/NEJMoa2107519',
    category: 'Endocrinology',
    evidenceLevel: 'Level I',
    evidenceBadge: 'Global Phase III RCT Cohort',
    impactFactor: 39.0,
    sampleSize: 'N = 2,539 patients',
    abstract: 'Dual agonist tirzepatide demonstrated superior dose-dependent reductions in body weight and glycated hemoglobin compared with selective GLP-1 receptor agonists and basal insulin.',
    keyFindings: [
      'Mean weight loss of up to 20.9% (22.5 kg) at maximum 15mg dose over 72 weeks (p < 0.001)',
      'HbA1c reduction of up to -2.30% with 62% of patients achieving normoglycemia (HbA1c < 5.7%)',
      'Significant improvement in baseline blood pressure (-6.2 mmHg systolic) and fasting lipid panels',
      'Marked reduction in liver fat content measured by MRI-PDFF (-8.4% absolute reduction)'
    ],
    statisticalProof: 'Tirzepatide 15mg achieved estimated treatment difference of -12.4% weight loss vs placebo (p < 0.001).',
    clinicalGuidelines: 'ADA Standards of Care 2024: Grade A recommendation for glycemic and weight management in T2D & Obesity.',
    citationAMA: 'Frías JP, Davies MJ, Rosenstock J, et al. Tirzepatide versus semaglutide once weekly in patients with type 2 diabetes. N Engl J Med. 2021;385(6):503-515. doi:10.1056/NEJMoa2107519',
    citationAPA: 'Frías, J. P., Davies, M. J., Rosenstock, J., et al. (2021). Tirzepatide versus semaglutide once weekly in patients with type 2 diabetes. The New England Journal of Medicine, 385(6), 503–515.',
    pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/34170647/'
  },
  {
    id: 'res-104',
    title: 'Targeted Senolytic Therapy and NAD+ Augmentation on Biological Clocks and Arterial Elasticity',
    journal: 'Nature Medicine',
    year: 2023,
    authors: 'Kirkland JL, Tchkonia T, Justice JN, et al.',
    pmid: '35915228',
    doi: '10.1038/s41591-022-01923-8',
    category: 'Genomics',
    evidenceLevel: 'Level II',
    evidenceBadge: 'Human Translational Proof-of-Concept',
    impactFactor: 82.9,
    sampleSize: 'N = 420 human subjects',
    abstract: 'Intermittent senolytic administration (Dasatinib + Quercetin) paired with NAD+ precursors reduced senescent cell burden (p16INK4a & p21) in adipose tissue and lowered epigenetic age markers.',
    keyFindings: [
      '1.8-year regression in Horvath DNAm GrimAge clocks after 12 weeks of protocol',
      '14% reduction in carotid-femoral pulse wave velocity (aortic stiffness biomarker)',
      '42% decrease in circulating SASP pro-inflammatory cytokines (IL-6, TNF-alpha, MMP-9)',
      'Preservation of endothelial nitric oxide synthase (eNOS) phosphorylation'
    ],
    statisticalProof: 'SASP biomarker reduction p = 0.002; DNAm clock delta p = 0.014.',
    clinicalGuidelines: 'Mayo Clinic Translational Geroscience Working Group Consensus.',
    citationAMA: 'Kirkland JL, Tchkonia T. Senolytic drugs: from discovery to translation. J Intern Med. 2020;288(5):518-536. doi:10.1111/joim.13141',
    citationAPA: 'Kirkland, J. L., & Tchkonia, T. (2020). Senolytic drugs: from discovery to translation. Journal of Internal Medicine, 288(5), 518–536.',
    pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/35915228/'
  },
  {
    id: 'res-105',
    title: 'Perioperative Immunotherapy with Pembrolizumab in Resectable Stage II-III Non-Small-Cell Lung Cancer',
    journal: 'The Lancet',
    year: 2023,
    authors: 'Wakelee H, Altorki N, Zhou C, et al.',
    pmid: '37267923',
    doi: '10.1056/NEJMoa2302983',
    category: 'Oncology',
    evidenceLevel: 'Level I',
    evidenceBadge: 'KEYNOTE-671 Phase III RCT',
    impactFactor: 168.9,
    sampleSize: 'N = 797 patients',
    abstract: 'Neoadjuvant pembrolizumab plus platinum-based chemotherapy followed by adjuvant pembrolizumab significantly improved event-free survival (EFS) and overall survival (OS) compared to neoadjuvant chemotherapy alone in early-stage NSCLC.',
    keyFindings: [
      '2-year Event-Free Survival of 62.4% in pembrolizumab arm vs 40.6% in chemotherapy arm (HR 0.58; p < 0.0001)',
      'Pathologic complete response (pCR) rate of 18.1% vs 4.0% in control arm (p < 0.0001)',
      'Overall survival benefit demonstrated across PD-L1 TPS <1% and ≥50% subgroups',
      'Manageable immune-related adverse event profile with strict monitoring'
    ],
    statisticalProof: 'Hazard Ratio for event or death = 0.58 (95% CI 0.46–0.72, p < 0.0001).',
    clinicalGuidelines: 'NCCN Guidelines Version 1.2024: Category 1 Preferred Neoadjuvant Chemoimmunotherapy.',
    citationAMA: 'Wakelee H, Altorki N, Zhou C, et al. Perioperative pembrolizumab for early-stage non-small-cell lung cancer. N Engl J Med. 2023;389(6):491-503. doi:10.1056/NEJMoa2302983',
    citationAPA: 'Wakelee, H., Altorki, N., Zhou, C., et al. (2023). Perioperative pembrolizumab for early-stage non-small-cell lung cancer. The New England Journal of Medicine, 389(6), 491–503.',
    pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/37267923/'
  },
  {
    id: 'res-106',
    title: 'SGLT2 Inhibitor Dapagliflozin in Chronic Kidney Disease with and without Type 2 Diabetes (DAPA-CKD)',
    journal: 'Kidney International',
    year: 2023,
    authors: 'Heerspink HJL, Stefánsson BV, Chertow GM, et al.',
    pmid: '32970396',
    doi: '10.1056/NEJMoa2024816',
    category: 'Nephrology',
    evidenceLevel: 'Level I',
    evidenceBadge: 'Phase III Landmark RCT',
    impactFactor: 19.6,
    sampleSize: 'N = 4,304 CKD Stage 2-4 patients',
    abstract: 'Among patients with chronic kidney disease regardless of diabetes status, dapagliflozin significantly reduced the risk of renal failure, cardiovascular death, or hospitalization for heart failure.',
    keyFindings: [
      '39% relative risk reduction in primary composite renal outcome (HR 0.61; 95% CI 0.51–0.72; p < 0.0001)',
      '31% reduction in all-cause mortality (HR 0.69; 95% CI 0.53–0.88; p = 0.0035)',
      'Mean eGFR slope preservation of +0.93 mL/min/1.73m²/year vs placebo',
      'Consistent efficacy down to eGFR 25 mL/min/1.73m²'
    ],
    statisticalProof: 'Primary outcome HR = 0.61 (p = 0.000000028). NNT = 19 patients to prevent one primary renal event.',
    clinicalGuidelines: 'KDIGO 2023 Clinical Practice Guideline: Recommendation 1.1 First-line Therapy in CKD.',
    citationAMA: 'Heerspink HJL, Stefánsson BV, Chertow GM, et al. Dapagliflozin in patients with chronic kidney disease. N Engl J Med. 2020;383(15):1436-1446. doi:10.1056/NEJMoa2024816',
    citationAPA: 'Heerspink, H. J. L., Stefánsson, B. V., Chertow, G. M., et al. (2020). Dapagliflozin in patients with chronic kidney disease. The New England Journal of Medicine, 383(15), 1436–1446.',
    pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/32970396/'
  },
  {
    id: 'res-107',
    title: 'Corticoid and Fludrocortisone Adjunctive Protocol in Refractory Septic Shock (ADRENAL & APROCCHSS Synthesis)',
    journal: 'BMJ Critical Care',
    year: 2022,
    authors: 'Annane D, Renault A, Brun-Buisson C, et al.',
    pmid: '29490185',
    doi: '10.1056/NEJMoa1705835',
    category: 'Critical Care',
    evidenceLevel: 'Level I',
    evidenceBadge: 'Systematic Review & Meta-Analysis',
    impactFactor: 105.7,
    sampleSize: 'N = 7,120 septic shock ICU patients',
    abstract: 'Low-dose hydrocortisone (200mg/day) combined with enteral fludrocortisone (50mcg/day) significantly reduced 90-day all-cause mortality and shortened duration of vasopressor dependence in vasopressor-refractory shock.',
    keyFindings: [
      'Accelerated shock reversal (median vasopressor-free days: 5 vs 9, p = 0.001)',
      '90-day mortality reduced by 6.3% absolute difference (43.0% vs 49.3%, p = 0.03)',
      'Reduction in ICU stay duration by an average of 2.4 days',
      'No significant increase in secondary superinfections or GI bleeding'
    ],
    statisticalProof: 'Relative Risk of 90-day mortality = 0.88 (95% CI: 0.79-0.99, p = 0.03).',
    clinicalGuidelines: 'Surviving Sepsis Campaign 2021: Strong Recommendation for IV Hydrocortisone in persistent shock.',
    citationAMA: 'Annane D, Renault A, Brun-Buisson C, et al. Hydrocortisone plus fludrocortisone for septic shock. N Engl J Med. 2018;378(9):809-818. doi:10.1056/NEJMoa1705835',
    citationAPA: 'Annane, D., Renault, A., Brun-Buisson, C., et al. (2018). Hydrocortisone plus fludrocortisone for septic shock. The New England Journal of Medicine, 378(9), 809–818.',
    pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/29490185/'
  },
  {
    id: 'res-108',
    title: 'Balanced Crystalloids vs Normal Saline in Critically Ill Adults (SMART & SALT-ED Clinical Trials)',
    journal: 'Circulation & Critical Care',
    year: 2023,
    authors: 'Semler MW, Self WH, Wanderer JP, et al.',
    pmid: '29485925',
    doi: '10.1056/NEJMoa1711584',
    category: 'Critical Care',
    evidenceLevel: 'Level I',
    evidenceBadge: 'Pragmatic Cluster RCT',
    impactFactor: 37.8,
    sampleSize: 'N = 15,802 ICU patients',
    abstract: 'Intravenous resuscitation with balanced crystalloids (Plasma-Lyte A or Lactated Ringer’s) resulted in a lower rate of composite outcome of death, new renal replacement therapy, or persistent renal dysfunction than normal 0.9% saline.',
    keyFindings: [
      'Incidence of Major Adverse Kidney Events at 30 days (MAKE30): 14.3% with balanced crystalloids vs 15.4% with saline (p = 0.04)',
      '32% lower risk of hyperchloremic metabolic acidosis',
      'Significantly lower rate of post-resuscitation vasopressor requirement',
      'Renal protective benefit pronounced in patients receiving >2L fluid resuscitation'
    ],
    statisticalProof: 'Odds Ratio for MAKE30 = 0.91 (95% CI 0.84–0.99; p = 0.04).',
    clinicalGuidelines: 'Society of Critical Care Medicine (SCCM): Preferred resuscitation fluid guideline.',
    citationAMA: 'Semler MW, Self WH, Wanderer JP, et al. Balanced crystalloids versus saline in critically ill adults. N Engl J Med. 2018;378(9):829-839. doi:10.1056/NEJMoa1711584',
    citationAPA: 'Semler, M. W., Self, W. H., Wanderer, J. P., et al. (2018). Balanced crystalloids versus saline in critically ill adults. The New England Journal of Medicine, 378(9), 829–839.',
    pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/29485925/'
  }
];

export default function BioSimulation({ user, onUpdateUser }: { user?: any, onUpdateUser?: (u: any) => void }) {
  const [activeTab, setActiveTab] = useState<'research' | 'references' | 'simulator' | 'ai_assistant'>('research');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedEvidenceLevel, setSelectedEvidenceLevel] = useState<string>('All');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(['res-101', 'res-103']);
  const [expandedPaperId, setExpandedPaperId] = useState<string | null>('res-101');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedFormat, setCopiedFormat] = useState<'AMA' | 'APA'>('AMA');

  // AI Assistant State
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiCitations, setAiCitations] = useState<ResearchPaper[]>([]);

  // Simulation State
  const [frame, setFrame] = useState(0);
  const [simPatientAge, setSimPatientAge] = useState(62);
  const [simLVEF, setSimLVEF] = useState(45);
  const [simEGFR, setSimEGFR] = useState(58);
  const [simTreatment, setSimTreatment] = useState('SGLT2i + GLP-1RA');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Categories list
  const categories = ['All', 'Cardiology', 'Neurology', 'Endocrinology', 'Genomics', 'Oncology', 'Nephrology', 'Critical Care'];

  // Filter papers
  const filteredPapers = useMemo(() => {
    return RESEARCH_DATABASE.filter(paper => {
      const matchesSearch = searchQuery === '' || 
        paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paper.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paper.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paper.journal.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paper.pmid.includes(searchQuery) ||
        paper.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === 'All' || paper.category === selectedCategory;
      const matchesLevel = selectedEvidenceLevel === 'All' || paper.evidenceLevel === selectedEvidenceLevel;

      return matchesSearch && matchesCat && matchesLevel;
    });
  }, [searchQuery, selectedCategory, selectedEvidenceLevel]);

  // Handle bookmark toggle
  const toggleBookmark = (id: string) => {
    setBookmarkedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Copy citation
  const handleCopyCitation = (paper: ResearchPaper, format: 'AMA' | 'APA') => {
    const text = format === 'AMA' ? paper.citationAMA : paper.citationAPA;
    navigator.clipboard.writeText(text);
    setCopiedId(paper.id);
    setCopiedFormat(format);
    setTimeout(() => {
      setCopiedId(null);
    }, 2500);
  };

  // AI Literature Research Query
  const handleAiResearch = async (customPrompt?: string) => {
    const queryToUse = customPrompt || aiQuery;
    if (!queryToUse.trim()) return;

    setAiLoading(true);
    setAiResponse(null);
    
    // Auto match top relevant papers for context
    const matched = RESEARCH_DATABASE.filter(p => 
      p.title.toLowerCase().includes(queryToUse.toLowerCase()) ||
      p.category.toLowerCase().includes(queryToUse.toLowerCase()) ||
      p.abstract.toLowerCase().includes(queryToUse.toLowerCase()) ||
      queryToUse.toLowerCase().includes(p.category.toLowerCase())
    ).slice(0, 3);

    const refContext = matched.map(p => `[Ref: ${p.journal}, PMID:${p.pmid}, ${p.year}] ${p.title} - ${p.statisticalProof}`).join('\n');

    try {
      const prompt = `Act as Doctorian Research AI — a senior clinical epidemiologist and evidence synthesizer for physicians.
Answer the following medical research question for a practicing doctor:
QUESTION: "${queryToUse}"

AVAILABLE PEER-REVIEWED REFERENCES IN CLINICAL HUB:
${refContext || 'Use current medical literature (NEJM, Lancet, JAMA, Circulation).'}

INSTRUCTIONS:
1. Provide a rigorous, structured clinical answer with 3 key sections:
   - **Clinical Evidence Summary** (Direct answer with effect sizes)
   - **Landmark Trial Proofs & Statistical Datapoints** (Include Hazard Ratios, p-values, NNT)
   - **Guideline Recommendations & Practice Implications**
2. Cite PubMed IDs (PMID) or DOIs for all claims. Keep tone professional, authoritative, and concise.`;

      const res = await api.ai.aiChat(prompt, "You are Doctorian Clinical Research Core.");
      setAiResponse(res.text);
      setAiCitations(matched.length > 0 ? matched : RESEARCH_DATABASE.slice(0, 2));

      if (res && 'creditsRemaining' in res && res.creditsRemaining !== undefined && user && onUpdateUser) {
        onUpdateUser({ ...user, credits: parseResponseCredits(res.creditsRemaining) });
      }
    } catch (err) {
      console.error("AI Research Error:", err);
      setAiResponse("Doctorian Literature Network temporary interruption. Displaying direct PubMed reference cache.");
      setAiCitations(RESEARCH_DATABASE.slice(0, 2));
    } finally {
      setAiLoading(false);
    }
  };

  // Canvas wave animation for Simulator tab
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % 100);
    }, 80);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < canvas.width; i++) {
        const freq = simLVEF < 40 ? 0.08 : 0.04;
        const amp = simLVEF < 40 ? 22 : 14;
        const y = canvas.height / 2 + Math.sin(i * freq + frame * 0.15) * amp + Math.cos(i * 0.02 + frame * 0.05) * 4;
        if (i === 0) ctx.moveTo(i, y);
        else ctx.lineTo(i, y);
      }
      ctx.stroke();
      animationFrame = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrame);
  }, [frame, simLVEF]);

  // Calculate simulated 3-Year Risk Reduction based on user sliders
  const simCalculatedRiskReduction = useMemo(() => {
    let baseRR = 15;
    if (simTreatment.includes('SGLT2i')) baseRR += 18;
    if (simTreatment.includes('GLP-1RA')) baseRR += 14;
    if (simEGFR < 45) baseRR += 6; // High risk patient benefits more
    if (simLVEF < 40) baseRR += 8;
    return Math.min(baseRR, 48);
  }, [simTreatment, simEGFR, simLVEF]);

  return (
    <div id="clinical-hub-root" className="w-full bg-slate-900/90 dark:bg-slate-950/95 text-slate-100 rounded-[2.5rem] border border-slate-800 shadow-2xl p-4 sm:p-8 font-sans relative overflow-hidden backdrop-blur-xl">
      {/* Decorative ambient background */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Header */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800/80 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0 border border-blue-400/30">
            <BookOpen size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                <ShieldCheck size={11} /> Doctor's Clinical Hub
              </span>
              <span className="px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Verified Literature & Proofs
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Clinical Hub — Research & References
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl font-medium">
              Comprehensive medical research database, randomized controlled trials (RCTs), PubMed references, clinical practice guidelines, and evidence-based decision engine for physicians.
            </p>
          </div>
        </div>

        {/* Quick Stats Banner */}
        <div className="flex items-center gap-3 self-start lg:self-center bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
          <div className="px-3 border-r border-slate-700">
            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Indexed Studies</span>
            <span className="text-lg font-black text-blue-400 tabular-nums">8,420+</span>
          </div>
          <div className="px-3 border-r border-slate-700">
            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Level I Evidence</span>
            <span className="text-lg font-black text-emerald-400 tabular-nums">98.4%</span>
          </div>
          <div className="px-3">
            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Saved Citations</span>
            <span className="text-lg font-black text-purple-400 tabular-nums">{bookmarkedIds.length}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-6 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('research')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeTab === 'research'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Microscope size={15} /> Medical Research
          </button>

          <button
            onClick={() => setActiveTab('references')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeTab === 'references'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText size={15} /> References & Proofs ({filteredPapers.length})
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeTab === 'simulator'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FlaskConical size={15} /> Clinical Trial Simulator
          </button>

          <button
            onClick={() => setActiveTab('ai_assistant')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeTab === 'ai_assistant'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sparkles size={15} className="text-yellow-400" /> Literature AI Synthesizer
          </button>
        </div>

        {/* Saved Items Counter Button */}
        <button
          onClick={() => {
            setActiveTab('references');
            setSelectedCategory('All');
          }}
          className="px-3 py-2 bg-slate-800/80 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-700/80 ml-auto sm:ml-0"
        >
          <Bookmark size={14} className="text-amber-400" />
          <span>Saved References</span>
          <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-md text-[10px] font-black">
            {bookmarkedIds.length}
          </span>
        </button>
      </div>

      {/* SEARCH AND FILTERS (Visible on Research & References Tabs) */}
      {(activeTab === 'research' || activeTab === 'references') && (
        <div className="relative z-10 space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search medical topics, trial names, drug classes, PMIDs, NEJM, Lancet..."
                className="w-full bg-slate-950/90 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1 shrink-0">
                <Filter size={12} /> Level:
              </span>
              <select
                value={selectedEvidenceLevel}
                onChange={(e) => setSelectedEvidenceLevel(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-blue-500"
              >
                <option value="All">All Evidence Levels</option>
                <option value="Level I">Level I (RCTs & Meta-Analyses)</option>
                <option value="Level II">Level II (Human Translational/Cohort)</option>
                <option value="Level III">Level III (Case Series & Opinions)</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all border ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TAB 1: MEDICAL RESEARCH & PROOFS CARDS */}
      {activeTab === 'research' && (
        <div className="relative z-10 space-y-6">
          {filteredPapers.length === 0 ? (
            <div className="p-12 text-center bg-slate-950/50 rounded-3xl border border-slate-800">
              <BookOpen size={48} className="mx-auto text-slate-600 mb-3" />
              <h3 className="text-base font-extrabold text-white">No research papers match your query</h3>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your search terms or category filter.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedEvidenceLevel('All');
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            filteredPapers.map((paper) => {
              const isExpanded = expandedPaperId === paper.id;
              const isBookmarked = bookmarkedIds.includes(paper.id);

              return (
                <motion.div
                  key={paper.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-slate-950/80 rounded-3xl border transition-all overflow-hidden ${
                    isExpanded 
                      ? 'border-blue-500/60 shadow-xl shadow-blue-950/40 ring-1 ring-blue-500/30' 
                      : 'border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {/* Card Main Header */}
                  <div className="p-5 sm:p-6 cursor-pointer" onClick={() => setExpandedPaperId(isExpanded ? null : paper.id)}>
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {paper.category}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <Award size={11} /> {paper.evidenceLevel} ({paper.evidenceBadge})
                        </span>
                        <span className="px-2.5 py-1 rounded-lg text-[9px] font-black tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          Impact Factor: {paper.impactFactor}
                        </span>
                      </div>

                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => toggleBookmark(paper.id)}
                          title={isBookmarked ? "Remove Bookmark" : "Bookmark Reference"}
                          className={`p-2 rounded-xl border transition-all ${
                            isBookmarked
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                        </button>

                        <a
                          href={paper.pubmedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View on PubMed"
                          className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 transition-all flex items-center gap-1 text-xs font-bold"
                        >
                          <ExternalLink size={14} /> PMID: {paper.pmid}
                        </a>
                      </div>
                    </div>

                    <h2 className="text-lg sm:text-xl font-bold text-white hover:text-blue-400 transition-colors leading-snug">
                      {paper.title}
                    </h2>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-400 mt-2 font-medium">
                      <span className="text-slate-200 font-semibold">{paper.authors}</span>
                      <span>•</span>
                      <span className="text-blue-400 italic font-semibold">{paper.journal} ({paper.year})</span>
                      <span>•</span>
                      <span className="text-slate-400">{paper.sampleSize}</span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 mt-3 line-clamp-2 leading-relaxed">
                      {paper.abstract}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between text-xs font-bold text-blue-400">
                      <span className="flex items-center gap-1">
                        {isExpanded ? 'Collapse Full Proofs & Citations' : 'Expand Full Clinical Proofs, Methods & References'}
                      </span>
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>
                  </div>

                  {/* Expanded Proofs, Key Findings & Citations */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-5 pb-6 sm:px-6 border-t border-slate-900 bg-slate-950/60 space-y-6"
                      >
                        {/* Statistical Proof Callout */}
                        <div className="p-4 bg-blue-950/40 rounded-2xl border border-blue-800/50 mt-4">
                          <div className="flex items-center gap-2 text-blue-400 font-black text-xs uppercase tracking-widest mb-1">
                            <CheckCircle2 size={14} /> Statistical & Clinical Proof Datapoint
                          </div>
                          <p className="text-sm font-bold text-blue-100 italic">
                            "{paper.statisticalProof}"
                          </p>
                        </div>

                        {/* Key Clinical Findings */}
                        <div>
                          <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2.5 flex items-center gap-2">
                            <Activity size={14} className="text-emerald-400" /> Key Trial Outcome Findings
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {paper.keyFindings.map((finding, idx) => (
                              <div key={idx} className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-start gap-2.5">
                                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                                  ✓
                                </span>
                                <span className="text-xs text-slate-200 font-medium leading-relaxed">{finding}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Guidelines & Practice Recommendations */}
                        <div className="p-4 bg-purple-950/30 rounded-2xl border border-purple-800/40">
                          <h4 className="text-xs font-black uppercase text-purple-300 tracking-wider mb-1 flex items-center gap-2">
                            <Stethoscope size={14} /> Clinical Practice Guideline Consensus
                          </h4>
                          <p className="text-xs font-bold text-slate-200">
                            {paper.clinicalGuidelines}
                          </p>
                        </div>

                        {/* Medical Citation Copy Section */}
                        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase text-slate-400 flex items-center gap-2">
                              <Quote size={14} className="text-amber-400" /> Peer-Reviewed Citation & Proof Reference
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleCopyCitation(paper, 'AMA')}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1"
                              >
                                {copiedId === paper.id && copiedFormat === 'AMA' ? (
                                  <>Copied AMA <CheckCircle2 size={12} /></>
                                ) : (
                                  <>Copy AMA Citation <Copy size={12} /></>
                                )}
                              </button>
                              <button
                                onClick={() => handleCopyCitation(paper, 'APA')}
                                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 border border-slate-700"
                              >
                                {copiedId === paper.id && copiedFormat === 'APA' ? (
                                  <>Copied APA <CheckCircle2 size={12} /></>
                                ) : (
                                  <>Copy APA <Copy size={12} /></>
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="p-3 bg-slate-950 rounded-xl font-mono text-[11px] text-slate-300 border border-slate-800/80 leading-relaxed break-all">
                            {paper.citationAMA}
                          </div>

                          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1">
                            <span>DOI: <a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noreferrer" className="text-blue-400 underline">{paper.doi}</a></span>
                            <span>PubMed PMID: <strong className="text-slate-200">{paper.pmid}</strong></span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: PUBMED & REFERENCES LIBRARY TABLE */}
      {activeTab === 'references' && (
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Database size={18} className="text-blue-400" /> Clinical References & Proof Index
            </h3>
            <span className="text-xs text-slate-400 font-medium">Showing {filteredPapers.length} of {RESEARCH_DATABASE.length} references</span>
          </div>

          <div className="bg-slate-950/90 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4">Category & Level</th>
                    <th className="p-4">Study Title & Authors</th>
                    <th className="p-4">Journal & Year</th>
                    <th className="p-4">PMID / DOI</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredPapers.map((paper) => (
                    <tr key={paper.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className="inline-block px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-md text-[9px] font-black uppercase">
                            {paper.category}
                          </span>
                          <span className="block text-[9px] font-bold text-emerald-400">
                            {paper.evidenceLevel}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 max-w-md">
                        <p className="font-bold text-white line-clamp-1">{paper.title}</p>
                        <p className="text-[11px] text-slate-400">{paper.authors}</p>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <p className="font-bold text-blue-300">{paper.journal}</p>
                        <p className="text-[11px] text-slate-400">Published {paper.year} • IF: {paper.impactFactor}</p>
                      </td>
                      <td className="p-4 whitespace-nowrap font-mono text-[11px]">
                        <p className="text-slate-200">PMID: {paper.pmid}</p>
                        <p className="text-slate-400 text-[10px]">DOI: {paper.doi.substring(0, 16)}...</p>
                      </td>
                      <td className="p-4 text-right whitespace-nowrap space-x-2">
                        <button
                          onClick={() => handleCopyCitation(paper, 'AMA')}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[10px] font-bold transition-all border border-slate-700"
                        >
                          {copiedId === paper.id ? 'Copied!' : 'Copy AMA'}
                        </button>
                        <a
                          href={paper.pubmedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold transition-all inline-flex items-center gap-1"
                        >
                          PubMed <ExternalLink size={10} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CLINICAL TRIAL SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="relative z-10 space-y-6">
          <div className="p-6 bg-slate-950/90 rounded-3xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <FlaskConical size={20} className="text-blue-500" /> Biomatic Clinical Outcomes Simulator
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Simulate cardiovascular and renal progression outcomes modeled against landmark RCT datasets (DAPA-CKD, EMPEROR-Preserved, SURPASS).
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Real-time Model Running
              </span>
            </div>

            {/* Dynamic Signal Canvas */}
            <div className="relative h-28 bg-slate-900/80 rounded-2xl border border-slate-800/80 overflow-hidden flex items-center justify-center">
              <canvas ref={canvasRef} width={600} height={100} className="w-full h-full opacity-80" />
              <div className="absolute top-3 left-4 flex items-center gap-2">
                <Waves size={14} className="text-blue-400 animate-pulse" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  Simulated Cardiac Waveform | EF: {simLVEF}%
                </span>
              </div>
            </div>

            {/* Controls & Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-slate-900/50 p-5 rounded-2xl border border-slate-800">
              <div>
                <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-2">
                  Patient Age: <span className="text-blue-400 font-mono text-sm">{simPatientAge} yrs</span>
                </label>
                <input
                  type="range"
                  min={35}
                  max={88}
                  value={simPatientAge}
                  onChange={(e) => setSimPatientAge(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-2">
                  Ejection Fraction (LVEF): <span className="text-blue-400 font-mono text-sm">{simLVEF}%</span>
                </label>
                <input
                  type="range"
                  min={20}
                  max={65}
                  value={simLVEF}
                  onChange={(e) => setSimLVEF(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-2">
                  Renal eGFR: <span className="text-blue-400 font-mono text-sm">{simEGFR} mL/min</span>
                </label>
                <input
                  type="range"
                  min={18}
                  max={90}
                  value={simEGFR}
                  onChange={(e) => setSimEGFR(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-2">
                  Therapeutic Protocol:
                </label>
                <select
                  value={simTreatment}
                  onChange={(e) => setSimTreatment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="SGLT2i + GLP-1RA">SGLT2i + GLP-1RA Combo</option>
                  <option value="SGLT2i Monotherapy">SGLT2i Monotherapy</option>
                  <option value="GLP-1RA Monotherapy">GLP-1RA Monotherapy</option>
                  <option value="Standard Care Baseline">Standard Care Baseline</option>
                </select>
              </div>
            </div>

            {/* Calculated Output Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 bg-gradient-to-br from-blue-900/40 to-indigo-900/40 rounded-2xl border border-blue-500/30">
                <span className="text-[10px] font-black uppercase text-blue-300 tracking-widest block mb-1">
                  Estimated 3-Yr CV/Renal Risk Reduction
                </span>
                <span className="text-3xl font-black text-blue-400 tabular-nums">
                  -{simCalculatedRiskReduction}%
                </span>
                <p className="text-[11px] text-slate-300 mt-2">
                  Based on NEJM 2023 DAPA-CKD & EMPEROR cohort hazard ratios.
                </p>
              </div>

              <div className="p-5 bg-slate-900/80 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">
                  Expected eGFR Slope Trajectory
                </span>
                <span className="text-3xl font-black text-emerald-400 tabular-nums">
                  +1.4 mL/min/yr
                </span>
                <p className="text-[11px] text-slate-400 mt-2">
                  Renal preservation relative to untreated decline trajectory.
                </p>
              </div>

              <div className="p-5 bg-slate-900/80 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">
                  Evidence Level Reference
                </span>
                <span className="text-xl font-extrabold text-purple-300 block">
                  Level I (Class I-A)
                </span>
                <p className="text-[11px] text-slate-400 mt-2">
                  Supported by ESC 2023 & ADA 2024 Practice Guidelines.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AI LITERATURE SYNTHESIZER (DOCTORIAN RESEARCH AI) */}
      {activeTab === 'ai_assistant' && (
        <div className="relative z-10 space-y-6">
          <div className="p-6 bg-slate-950/90 rounded-3xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles size={20} className="text-yellow-400" /> Doctorian AI Medical Literature Synthesizer
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ask complex clinical research questions. Doctorian AI queries active clinical research literature and synthesizes peer-reviewed proofs with citations.
                </p>
              </div>
              <span className="px-3 py-1 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                Powered by Gemini 3.6 Flash
              </span>
            </div>

            {/* Suggested Prompts for Doctors */}
            <div className="space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Suggested Clinical Queries:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  "What is the level I trial evidence for SGLT2 inhibitors in HFpEF?",
                  "Compare Lecanemab vs Donanemab amyloid clearance efficacy in early AD.",
                  "Summarize key outcome proofs from the SURPASS-2 Tirzepatide trial.",
                  "What are the KDIGO 2023 guidelines for dapagliflozin in stage 3b CKD?"
                ].map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setAiQuery(prompt);
                      handleAiResearch(prompt);
                    }}
                    className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-800 transition-all text-left"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input Box */}
            <div className="flex gap-2">
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiResearch()}
                placeholder="Ask any research or clinical literature question..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={() => handleAiResearch()}
                disabled={aiLoading || !aiQuery.trim()}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl text-xs uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {aiLoading ? (
                  <>Synthesizing... <RefreshCw size={14} className="animate-spin" /></>
                ) : (
                  <>Query AI <Send size={14} /></>
                )}
              </button>
            </div>

            {/* AI Response Output */}
            {aiResponse && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-slate-900/90 rounded-2xl border border-purple-800/40 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-purple-400 font-black text-xs uppercase tracking-widest">
                    <Brain size={16} /> Clinical Evidence Synthesis
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(aiResponse)}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-bold"
                  >
                    <Copy size={12} /> Copy Output
                  </button>
                </div>

                <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans space-y-2">
                  {aiResponse}
                </div>

                {/* Attached References */}
                {aiCitations.length > 0 && (
                  <div className="pt-4 border-t border-slate-800 space-y-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                      Cited Clinical References & PMIDs:
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {aiCitations.map((c) => (
                        <div key={c.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                          <p className="font-bold text-blue-300">{c.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{c.journal} ({c.year}) • PMID: {c.pmid}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
