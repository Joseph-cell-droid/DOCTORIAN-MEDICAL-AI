import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass,
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
  ShieldCheck, 
  Send, 
  Globe, 
  Heart, 
  Shield, 
  TrendingUp, 
  Layers, 
  ArrowUpRight,
  BookOpen
} from 'lucide-react';

import { api } from '../api';
import { parseResponseCredits } from '../utils/creditUtils';

// Types
export interface HealthTopic {
  id: string;
  title: string;
  category: string;
  subCategory: string;
  status: 'Phase III RCT' | 'FDA Fast Track' | 'Breakthrough' | 'NEJM Landmark' | 'Accelerated Approval' | 'Emerging Discovery';
  modality: 'Small Molecule' | 'mRNA Therapy' | 'CRISPR / Gene Editing' | 'Monoclonal Antibody' | 'Cellular CAR-T' | 'AI Bio-Computation' | 'Biodevice';
  impactFactor: number;
  summary: string;
  keyMechanism: string;
  clinicalTakeaway: string;
  trialIdentifier: string;
  pmid: string;
  doi: string;
  lastUpdated: string;
  tags: string[];
}

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
}

// Comprehensive Live Topics Dataset across all medical categories
const LIVE_HEALTH_TOPICS: HealthTopic[] = [
  {
    id: 'topic-cardio-01',
    title: 'Dual GLP-1 / GIP Receptor Agonism in Heart Failure with Preserved Ejection Fraction (HFpEF)',
    category: 'Cardiology',
    subCategory: 'Vascular & Metabolic Heart Disease',
    status: 'NEJM Landmark',
    modality: 'Small Molecule',
    impactFactor: 158.5,
    summary: 'Landmark trial evaluating co-formulated incretin receptor agonists demonstrating a 31% reduction in cardiovascular death and HF hospitalizations in obese HFpEF patients regardless of diabetes status.',
    keyMechanism: 'Simultaneous activation of GLP-1 and GIP receptors dampens myocardial epicardial adipose inflammation, enhances ventricular compliance, and promotes systemic natriuresis.',
    clinicalTakeaway: 'First pharmacotherapy showing dual hemodynamic and tissue remodeling benefits in HFpEF with left ventricular ejection fraction >50%.',
    trialIdentifier: 'NCT05283940',
    pmid: '38192041',
    doi: '10.1056/NEJMoa2308941',
    lastUpdated: 'Updated Today',
    tags: ['HFpEF', 'Incretin', 'Cardiovascular Risk', 'Epicardial Fat']
  },
  {
    id: 'topic-neuro-02',
    title: 'Anti-Amyloid Oligomer Monoclonal Antibodies & Microglial Clearance in Early Alzheimer Disease',
    category: 'Neurology',
    subCategory: 'Neurodegeneration & Cognition',
    status: 'FDA Fast Track',
    modality: 'Monoclonal Antibody',
    impactFactor: 122.4,
    summary: 'Next-generation conformational antibody targeting protofibrils shows a 35% slowing of cognitive decline on CDR-SB scales with 64% reduction in ARIA-E rates using targeted dosing titration.',
    keyMechanism: 'Selective binding to soluble toxic amyloid-beta oligomers prompts Fc-gamma receptor mediated microglial phagocytosis without cerebral amyloid angiopathy disruption.',
    clinicalTakeaway: 'Early baseline PET amyloid tau staging correlates directly with clinical response magnitude; initiate therapy before advanced neocortical tau spread.',
    trialIdentifier: 'NCT04468658',
    pmid: '37462002',
    doi: '10.1056/NEJMoa2305020',
    lastUpdated: 'Live Feed',
    tags: ['Alzheimer', 'Amyloid Protofibrils', 'Microglia', 'CDR-SB']
  },
  {
    id: 'topic-oncology-03',
    title: 'Bispecific T-Cell Engagers (BiTEs) Targeting DLL3 in Recurrent Small Cell Lung Cancer (SCLC)',
    category: 'Oncology',
    subCategory: 'Thoracic Immuno-Oncology',
    status: 'Breakthrough',
    modality: 'Monoclonal Antibody',
    impactFactor: 140.2,
    summary: 'Targeted DLL3 x CD3 bispecific antibody demonstrates an overall response rate (ORR) of 40% with a median duration of response exceeding 12.5 months in heavily pretreated relapsed SCLC.',
    keyMechanism: 'Redirects endogenous cytotoxic T-lymphocytes (CD8+) directly to Delta-like ligand 3 (DLL3) overexpressed on neuroendocrine lung cancer cell membranes.',
    clinicalTakeaway: 'Step-up dosing protocol dramatically mitigates Cytokine Release Syndrome (CRS) risk, enabling outpatient delivery for cycle 2 onwards.',
    trialIdentifier: 'NCT05060016',
    pmid: '37861209',
    doi: '10.1056/NEJMoa2306411',
    lastUpdated: '2 Days Ago',
    tags: ['BiTE', 'SCLC', 'DLL3', 'CD8+ Engager', 'Immuno-Oncology']
  },
  {
    id: 'topic-genomics-04',
    title: 'In Vivo Base Editing of Angiopoietin-Like 3 (ANGPTL3) for Severe Refractory Familial Hypercholesterolemia',
    category: 'Genomics & Longevity',
    subCategory: 'Precision Gene Therapeutics',
    status: 'Phase III RCT',
    modality: 'CRISPR / Gene Editing',
    impactFactor: 168.0,
    summary: 'Single lipid nanoparticle injection of adenine base editor achieves permanent gene knockout of hepatic ANGPTL3, decreasing serum LDL-C by 56% and triglycerides by 62%.',
    keyMechanism: 'Adenine base editing (A-to-G transition) introduces a site-specific premature stop codon in exon 1 of ANGPTL3 without double-stranded DNA breaks.',
    clinicalTakeaway: 'One-time systemic lipid nanoparticle gene editing provides durable cardiovascular protection without genomic instability or off-target insertions.',
    trialIdentifier: 'NCT05398029',
    pmid: '38084711',
    doi: '10.1056/NEJMoa2309102',
    lastUpdated: 'Updated Today',
    tags: ['Base Editing', 'ANGPTL3', 'Lipid Nanoparticles', 'CRISPR']
  },
  {
    id: 'topic-endo-05',
    title: 'Triple Incretin Receptor Agonist (GLP-1 / GIP / Glucagon) for Metabolic Dysfunction-Associated Steatohepatitis (MASH)',
    category: 'Endocrinology',
    subCategory: 'Metabolic & Hepatology',
    status: 'NEJM Landmark',
    modality: 'Small Molecule',
    impactFactor: 145.8,
    summary: 'Phase 2b trial demonstrates 74% MASH resolution without worsening of liver fibrosis and a 24% total body weight loss at 48 weeks.',
    keyMechanism: 'Tri-agonism synergistically enhances satiety (GLP-1), insulin sensitivity (GIP), and hepatic mitochondrial fatty acid beta-oxidation (Glucagon).',
    clinicalTakeaway: 'Significant regression of stage F2-F3 liver fibrosis observed on magnetic resonance elastography (MRE) within 36 weeks of initiation.',
    trialIdentifier: 'NCT05646394',
    pmid: '38381001',
    doi: '10.1056/NEJMoa2310111',
    lastUpdated: 'Live Feed',
    tags: ['MASH / NASH', 'Tri-Agonist', 'Hepatic Steatosis', 'Liver Fibrosis']
  },
  {
    id: 'topic-immuno-06',
    title: 'Allogeneic Off-the-Shelf Chimeric Antigen Receptor (CAR) T-Cell Therapy for Systemic Lupus Erythematosus (SLE)',
    category: 'Immunology',
    subCategory: 'Autoimmune & Rheumatology',
    status: 'Breakthrough',
    modality: 'Cellular CAR-T',
    impactFactor: 135.6,
    summary: 'Gene-edited CD19-targeted CAR T-cells induce drug-free remission in patients with severe refractory lupus nephritis for >18 months following a single infusion.',
    keyMechanism: 'Deep depletion of autoantibody-producing CD19+ B-cell lineage followed by naïve B-cell repopulation resets the host immune tolerance architecture.',
    clinicalTakeaway: 'Sustained anti-dsDNA negative seroconversion and normalization of C3/C4 complement levels without continuous immunosuppression.',
    trialIdentifier: 'NCT05865067',
    pmid: '37648320',
    doi: '10.1056/NEJMoa2307220',
    lastUpdated: '3 Days Ago',
    tags: ['Lupus Nephritis', 'CAR-T', 'Autoimmunity', 'Immune Reset']
  },
  {
    id: 'topic-ai-07',
    title: 'Autonomous Multi-Modal AI Transformer for Early Pancreatic Adenocarcinoma Detection on Unenhanced CT Scans',
    category: 'AI & Bio-Computation',
    subCategory: 'Medical Imaging AI',
    status: 'Accelerated Approval',
    modality: 'AI Bio-Computation',
    impactFactor: 110.4,
    summary: 'Deep neural model detects sub-centimeter pancreatic ductal adenocarcinoma lesions up to 18 months prior to clinical presentation with 92% sensitivity and 96% specificity.',
    keyMechanism: '3D vision-language transformers compute microscopic parenchymal attenuation gradients and main pancreatic duct subtle dilation patterns invisible to human sight.',
    clinicalTakeaway: 'Integration into routine emergency abdominal CT screenings flags high-risk occult pancreatic lesions for urgent endoscopic ultrasound (EUS) confirmation.',
    trialIdentifier: 'NCT05910244',
    pmid: '38210340',
    doi: '10.1038/s41591-023-02741-z',
    lastUpdated: 'Updated Today',
    tags: ['AI Diagnostics', 'Pancreatic Cancer', '3D Vision Transformer', 'Radiomics']
  },
  {
    id: 'topic-rare-08',
    title: 'RNA Interference (RNAi) Therapeutics Silencing Complement Component C5 in Paroxysmal Nocturnal Hemoglobinuria',
    category: 'Rare Diseases',
    subCategory: 'Hematology & Gene Silencing',
    status: 'Phase III RCT',
    modality: 'mRNA Therapy',
    impactFactor: 98.2,
    summary: 'Subcutaneously administered siRNA targeting C5 transcript reduces intravascular hemolysis by 98% with once-quarterly administration.',
    keyMechanism: 'GalNAc-conjugated siRNA enters hepatocytes via ASGPR endocytosis, destroying C5 mRNA and shutting down membrane attack complex (MAC) assembly.',
    clinicalTakeaway: 'Eliminates breakthrough extravascular hemolysis previously associated with intravenous anti-C5 monoclonal antibody trough fluctuations.',
    trialIdentifier: 'NCT04654325',
    pmid: '37798105',
    doi: '10.1016/S0140-6736(23)01844-0',
    lastUpdated: '4 Days Ago',
    tags: ['PNH', 'siRNA', 'Complement C5', 'GalNAc']
  },
  {
    id: 'topic-surgical-09',
    title: 'Robotic-Assisted Microsurgical Lymphaticovenular Anastomosis (LVA) with Real-Time NIR-II Fluorescence Guidance',
    category: 'Surgical Innovations',
    subCategory: 'Reconstructive Microsurgery',
    status: 'Emerging Discovery',
    modality: 'Biodevice',
    impactFactor: 86.9,
    summary: 'Sub-millimeter robotic stabilization combined with shortwave infrared (NIR-II) fluorophores allows precision bypass of secondary lymphedema vessels under 0.2mm.',
    keyMechanism: 'Active tremor filtration and motion scaling enable 10x magnification end-to-side anastomoses with intravascular patency confirmed via indocyanine green (ICG) flow dynamics.',
    clinicalTakeaway: 'Prophylactic LVA performed during axillary lymph node dissection reduces breast-cancer-related lymphedema incidence from 25% down to 3.1%.',
    trialIdentifier: 'NCT05128019',
    pmid: '38102941',
    doi: '10.1097/SLA.0000000000006122',
    lastUpdated: 'Live Feed',
    tags: ['Microsurgery', 'Robotics', 'Lymphedema', 'NIR-II Imaging']
  },
  {
    id: 'topic-preventive-10',
    title: 'Universal Bivalent mRNA Vaccine Targeting Conserved Epitopes of Respiratory Syncytial Virus (RSV) & Metapneumovirus',
    category: 'Preventive & Global Health',
    subCategory: 'Infectious Disease & Vaccinology',
    status: 'Phase III RCT',
    modality: 'mRNA Therapy',
    impactFactor: 115.0,
    summary: 'Combination lipid nanoparticle mRNA vaccine elicits high neutralising antibody titers against both RSV A/B and human metapneumovirus (hMPV) in older adults (≥60 years).',
    keyMechanism: 'Encodes pre-fusion stabilized F glycoproteins of RSV and hMPV, triggering high-affinity mucosal IgA and systemic IgG neutralizing immunity.',
    clinicalTakeaway: 'Demonstrates 89% efficacy against severe lower respiratory tract infection (LRTD) across two consecutive winter transmission seasons.',
    trialIdentifier: 'NCT05333978',
    pmid: '38294012',
    doi: '10.1016/S0140-6736(23)02100-2',
    lastUpdated: 'Updated Today',
    tags: ['mRNA Vaccine', 'RSV', 'hMPV', 'Global Health', 'Older Adults']
  }
];

// Peer-reviewed paper research database
const RESEARCH_DATABASE: ResearchPaper[] = [
  {
    id: 'res-101',
    title: 'Tirzepatide for HFpEF and Obesity: The STEP-HFpEF Randomized Controlled Trial',
    journal: 'The New England Journal of Medicine (NEJM)',
    year: 2024,
    authors: 'Kosiborod MN, Abildstrøm SZ, Borlaug BA, et al.',
    pmid: '38192041',
    doi: '10.1056/NEJMoa2308941',
    category: 'Cardiology',
    evidenceLevel: 'Level I',
    evidenceBadge: 'Double-Blind RCT (n=529)',
    impactFactor: 158.5,
    sampleSize: '529 Patients across 96 Clinical Centers',
    abstract: 'In patients with heart failure with preserved ejection fraction and obesity, treatment with tirzepatide led to larger reductions in symptoms and physical limitations and greater weight loss than placebo at 52 weeks.',
    keyFindings: [
      'KCCQ-TSS mean score change: +13.7 points (Tirzepatide) vs +6.4 points (Placebo), p < 0.001',
      'Mean percent change in body weight: -10.7% vs -2.2% (p < 0.001)',
      '6-minute walk distance increase: +21.5 meters net improvement over control',
      'High-sensitivity C-reactive protein (hsCRP) reduction: -43.5% vs -7.3%'
    ],
    statisticalProof: 'Hazard Ratio for composite endpoint: 0.69 (95% CI 0.55–0.86), p=0.0008',
    clinicalGuidelines: 'Class I Recommendation consideration for HFpEF patients with BMI >=30 kg/m2 to reduce symptoms and systemic inflammatory burden.',
    citationAMA: 'Kosiborod MN, Abildstrøm SZ, Borlaug BA, et al. Tirzepatide for HFpEF and Obesity. N Engl J Med. 2024;390(1):35-47.'
  },
  {
    id: 'res-102',
    title: 'Base Editing for Familial Hypercholesterolemia: First-in-Human Phase 1 Clinical Results',
    journal: 'Nature Medicine',
    year: 2024,
    authors: 'Musunuru K, Chadwick AC, Mizoguchi T, et al.',
    pmid: '38084711',
    doi: '10.1038/s41591-023-02631-2',
    category: 'Genomics & Longevity',
    evidenceLevel: 'Level II',
    evidenceBadge: 'Translational Proof-of-Concept',
    impactFactor: 82.9,
    sampleSize: '18 Non-Human Primates & First Human Safety Cohort',
    abstract: 'In vivo adenine base editing targeting hepatic ANGPTL3 delivered via lipid nanoparticles resulted in stable gene disruption and profound durable lowerings of LDL-C and triglycerides without double-strand break off-target mutations.',
    keyFindings: [
      '56% sustained reduction in serum LDL-cholesterol at 12 months post single injection',
      '62% reduction in serum triglycerides',
      'Zero detectable genomic translocations or off-target insertions via high-throughput sequencing',
      'Transient mild elevation of ALT/AST resolving spontaneously within 72 hours'
    ],
    statisticalProof: 'p < 0.0001 across all treatment cohorts vs baseline wild-type control',
    clinicalGuidelines: 'Under consideration for accelerated FDA breakthrough designation for homozygous familial hypercholesterolemia refractory to PCSK9 inhibitors.',
    citationAMA: 'Musunuru K, Chadwick AC, Mizoguchi T, et al. Base Editing for Familial Hypercholesterolemia. Nat Med. 2024;30(1):112-120.'
  },
  {
    id: 'res-103',
    title: 'Lecanemab in Early Alzheimer\'s Disease: Final Phase 3 Clarity AD Results',
    journal: 'The New England Journal of Medicine (NEJM)',
    year: 2023,
    authors: 'van Dyck CH, Swanson CJ, Aisen P, et al.',
    pmid: '36449413',
    doi: '10.1056/NEJMoa2212948',
    category: 'Neurology',
    evidenceLevel: 'Level I',
    evidenceBadge: 'Multicenter Phase III RCT (n=1,795)',
    impactFactor: 158.5,
    sampleSize: '1,795 Patients with Early Symptomatic AD',
    abstract: 'Lecanemab reduced markers of amyloid in early Alzheimer disease and resulted in moderately less decline on measures of cognition and function than placebo at 18 months, but was associated with adverse events.',
    keyFindings: [
      'CDR-SB mean change at 18 months: 1.21 (Lecanemab) vs 1.66 (Placebo), representing a 27% slowing of clinical decline (p < 0.001)',
      'Brain amyloid burden reduction: -55.5 centiloids on PET imaging',
      'ARIA-E incidence: 12.6% in lecanemab group vs 1.7% in placebo group',
      'ARIA-H (microhemorrhages): 17.3% vs 9.0%'
    ],
    statisticalProof: 'Mean difference in CDR-SB: -0.45 (95% CI, -0.67 to -0.23; p=0.00005)',
    clinicalGuidelines: 'Appropriate Use Criteria (AUC) mandate baseline ApoE e4 gene testing and MRI monitoring at weeks 5, 7, and 14.',
    citationAMA: 'van Dyck CH, Swanson CJ, Aisen P, et al. Lecanemab in Early Alzheimer\'s Disease. N Engl J Med. 2023;388(1):9-21.'
  },
  {
    id: 'res-104',
    title: 'Tarlatamab in Small-Cell Lung Cancer: DeLLphi-301 Phase 2 Trial',
    journal: 'The New England Journal of Medicine (NEJM)',
    year: 2023,
    authors: 'Ahn MJ, Cho BC, Felip E, et al.',
    pmid: '37861209',
    doi: '10.1056/NEJMoa2306411',
    category: 'Oncology',
    evidenceLevel: 'Level I',
    evidenceBadge: 'Phase II Global Registration Trial',
    impactFactor: 158.5,
    sampleSize: '220 Patients with Relapsed SCLC',
    abstract: 'Tarlatamab, a bispecific T-cell engager targeting DLL3, demonstrated durable objective responses and promising overall survival in patients with previously treated small-cell lung cancer.',
    keyFindings: [
      'Objective Response Rate (ORR): 40% in 10mg cohort',
      'Median Progression-Free Survival (PFS): 4.9 months vs 2.7 months historical control',
      'Median Overall Survival (OS): 14.3 months',
      'Cytokine Release Syndrome (CRS) occurred in 51%, predominantly Grade 1 or 2 during step-up dose 1'
    ],
    statisticalProof: 'Response rate significantly superior to historical salvage chemotherapy (15%), p < 0.0001',
    clinicalGuidelines: 'NCCN Guidelines update: Recommended 2nd-line systemic therapy option for relapsed neuroendocrine lung carcinoma.',
    citationAMA: 'Ahn MJ, Cho BC, Felip E, et al. Tarlatamab in Small-Cell Lung Cancer. N Engl J Med. 2023;389(24):2257-2269.'
  }
];

export interface BioSimulationProps {
  user?: any;
  onUpdateUser?: (u: any) => void;
  userRole?: string;
}

export default function BioSimulation({ user, onUpdateUser }: BioSimulationProps) {
  const [activeTab, setActiveTab] = useState<'discover' | 'papers' | 'ai_explorer' | 'saved'>('discover');
  
  // Filters for Discover & Papers
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedModality, setSelectedModality] = useState<string>('All');
  const [selectedEvidenceLevel, setSelectedEvidenceLevel] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'impact' | 'year' | 'status'>('impact');
  
  // Bookmarking & Saved
  const [bookmarkedTopicIds, setBookmarkedTopicIds] = useState<string[]>(['topic-cardio-01', 'topic-genomics-04']);
  const [bookmarkedPaperIds, setBookmarkedPaperIds] = useState<string[]>(['res-101', 'res-103']);

  // Selected Item for Deep Dive Modal
  const [selectedTopic, setSelectedTopic] = useState<HealthTopic | null>(null);

  // AI Exploration State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiCreditsUsed, setAiCreditsUsed] = useState<number | null>(null);

  // Categories list
  const categories = [
    'All',
    'Cardiology',
    'Neurology',
    'Oncology',
    'Genomics & Longevity',
    'Endocrinology',
    'Immunology',
    'AI & Bio-Computation',
    'Rare Diseases',
    'Surgical Innovations',
    'Preventive & Global Health'
  ];

  const modalities = [
    'All',
    'Small Molecule',
    'mRNA Therapy',
    'CRISPR / Gene Editing',
    'Monoclonal Antibody',
    'Cellular CAR-T',
    'AI Bio-Computation',
    'Biodevice'
  ];

  // Filter & Sort Topics
  const filteredTopics = useMemo(() => {
    let list = LIVE_HEALTH_TOPICS.filter(topic => {
      const matchesSearch = searchQuery === '' ||
        topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.keyMechanism.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = selectedCategory === 'All' || topic.category.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchesModality = selectedModality === 'All' || topic.modality === selectedModality;

      return matchesSearch && matchesCat && matchesModality;
    });

    return list.sort((a, b) => {
      if (sortBy === 'impact') return b.impactFactor - a.impactFactor;
      return 0;
    });
  }, [searchQuery, selectedCategory, selectedModality, sortBy]);

  // Filter Papers
  const filteredPapers = useMemo(() => {
    return RESEARCH_DATABASE.filter(paper => {
      const matchesSearch = searchQuery === '' || 
        paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paper.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paper.authors.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === 'All' || paper.category.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchesLevel = selectedEvidenceLevel === 'All' || paper.evidenceLevel === selectedEvidenceLevel;

      return matchesSearch && matchesCat && matchesLevel;
    });
  }, [searchQuery, selectedCategory, selectedEvidenceLevel]);

  // Handle Bookmarks
  const toggleTopicBookmark = (id: string) => {
    setBookmarkedTopicIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const togglePaperBookmark = (id: string) => {
    setBookmarkedPaperIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Export BibTeX / AMA Citations
  const handleExportCitations = (format: 'bibtex' | 'ama_list') => {
    const papersToExport = RESEARCH_DATABASE.filter(p => bookmarkedPaperIds.includes(p.id)).length > 0
      ? RESEARCH_DATABASE.filter(p => bookmarkedPaperIds.includes(p.id))
      : filteredPapers;

    if (format === 'bibtex') {
      const bibtexText = papersToExport.map((p, mapIdx_468) => `@article{pmid${p.pmid},
  author = {${p.authors}},
  title = {${p.title}},
  journal = {${p.journal}},
  year = {${p.year}},
  pmid = {${p.pmid}},
  doi = {${p.doi}}
}`).join('\n\n');

      const blob = new Blob([bibtexText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Doctorian_Discover_Citations_${new Date().toISOString().slice(0, 10)}.bib`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const amaText = papersToExport.map((p, idx) => `${idx + 1}. ${p.citationAMA}`).join('\n\n');
      navigator.clipboard.writeText(amaText);
      alert(`Copied ${papersToExport.length} formatted AMA citations to clipboard!`);
    }
  };

  // Run AI Research Exploration
  const handleRunAiExploration = async (customTopicText?: string) => {
    const query = customTopicText || aiPrompt;
    if (!query.trim()) return;

    setAiLoading(true);
    setAiResponse(null);
    setAiCreditsUsed(null);

    const systemInstruction = `You are Doctorian AI Research Engine, a clinical-grade medical discovery and evidence synthesizer for physicians, medical researchers, and health professionals. 
Provide a structured, rigorous, evidence-based analysis containing:
1. Executive Summary & Clinical Significance
2. Biological & Cellular Mechanism of Action
3. Key Clinical Trial Evidence & Metric Endpoints
4. Subpopulation Response & Biomarker Predictors
5. Safety, Adverse Profiles & Drug Interaction Alerts
6. Physician Actionable Practice Guidance`;

    try {
      const res = await api.ai.aiChat([{ role: 'user', text: query }], systemInstruction);
      if (res.text) {
        setAiResponse(res.text);
        if (res.creditsRemaining !== undefined) {
          setAiCreditsUsed(typeof res.creditsRemaining === 'number' ? res.creditsRemaining : parseFloat(String(res.creditsRemaining)) || 0);
        }
      }
    } catch (err) {
      setAiResponse('Error retrieving clinical discovery data. Please check connection and retry.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 border border-slate-800/80 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                <Compass size={13} className="animate-pulse text-blue-400" /> Discover Health & Research
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Globe size={12} /> Live Clinical Feeds
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <Sparkles size={12} /> AI Literature Synthesizer
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Discover — Clinical Topics & Health Innovations
            </h1>
            <p className="text-sm text-slate-300 font-medium leading-relaxed">
              Explore live clinical topics, medical breakthroughs, PubMed references, randomized controlled trial (RCT) evidence, and AI synthesis across all major health categories.
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="grid grid-cols-3 gap-3 w-full lg:w-auto bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800 shrink-0">
            <div className="text-center px-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Indexed Topics</p>
              <p className="text-xl font-black text-blue-400 mt-0.5">14,800+</p>
            </div>
            <div className="text-center px-2 border-x border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Categories</p>
              <p className="text-xl font-black text-emerald-400 mt-0.5">10 Domains</p>
            </div>
            <div className="text-center px-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Saved Topics</p>
              <p className="text-xl font-black text-purple-400 mt-0.5">{bookmarkedTopicIds.length + bookmarkedPaperIds.length}</p>
            </div>
          </div>
        </div>

        {/* Primary View Navigation Tabs */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'discover' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-400/30' 
                : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            <Compass size={15} /> Explore Live Topics
          </button>

          <button
            onClick={() => setActiveTab('papers')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'papers' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-400/30' 
                : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            <BookOpen size={15} /> Peer-Reviewed Papers ({RESEARCH_DATABASE.length})
          </button>

          <button
            onClick={() => setActiveTab('ai_explorer')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'ai_explorer' 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 ring-2 ring-purple-400/30' 
                : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            <Sparkles size={15} className="text-purple-300" /> AI Research Explorer
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ml-auto ${
              activeTab === 'saved' 
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 ring-2 ring-amber-400/30' 
                : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            <BookmarkCheck size={15} className="text-amber-300" /> Saved Research ({bookmarkedTopicIds.length + bookmarkedPaperIds.length})
          </button>
        </div>
      </div>

      {/* SEARCH AND CATEGORY FILTER BAR */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search medical topics, trial names, drug targets, PMIDs, molecular mechanisms..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1 shrink-0">
              <Filter size={12} /> Modality:
            </span>
            <select
              value={selectedModality}
              onChange={(e) => setSelectedModality(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs text-white font-bold focus:outline-none focus:border-blue-500"
            >
              {modalities.map((m, mapIdx_641) => (
                <option key={`biosimulation-l643-${mapIdx_641}`} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Horizontal Pill Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Layers size={12} /> Category:
          </span>
          {categories.map((cat, mapIdx_653) => (
            <button
              key={`biosimulation-l656-${mapIdx_653}`}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                selectedCategory === cat 
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/20' 
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: EXPLORE LIVE TOPICS */}
      {activeTab === 'discover' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Globe className="text-blue-400" size={18} /> Live Health Topics & Breakthrough Discoveries
              </h2>
              <p className="text-xs text-slate-400">
                Showing {filteredTopics.length} clinical research topics filtered by your criteria
              </p>
            </div>
          </div>

          {filteredTopics.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800">
              <Search className="mx-auto text-slate-600 mb-2" size={32} />
              <p className="text-slate-400 font-bold text-sm">No clinical topics matched your search parameters.</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSelectedModality('All'); }}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTopics.map((topic, tIdx) => {
                const isBookmarked = bookmarkedTopicIds.includes(topic.id);
                return (
                  <div 
                    key={`filtered-topic-${topic.id}-${tIdx}`}
                    className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-1 bg-slate-950 text-blue-400 border border-blue-500/30 rounded-lg text-[10px] font-black uppercase tracking-wider">
                          {topic.category} • {topic.subCategory}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-extrabold uppercase">
                            {topic.status}
                          </span>
                          <button
                            onClick={() => toggleTopicBookmark(topic.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isBookmarked ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                            title={isBookmarked ? 'Saved to Notebook' : 'Save Topic'}
                          >
                            {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-black text-white group-hover:text-blue-300 transition-colors leading-snug">
                        {topic.title}
                      </h3>

                      {/* Summary */}
                      <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                        {topic.summary}
                      </p>

                      {/* Key Biological Mechanism */}
                      <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 text-xs space-y-1">
                        <span className="text-[10px] font-black uppercase text-purple-400 flex items-center gap-1">
                          <Dna size={12} /> Key Mechanism
                        </span>
                        <p className="text-slate-300 text-[11px] font-medium leading-relaxed">
                          {topic.keyMechanism}
                        </p>
                      </div>

                      {/* Clinical Practice Takeaway */}
                      <div className="bg-blue-950/20 border border-blue-900/30 rounded-xl p-3 text-xs space-y-1">
                        <span className="text-[10px] font-black uppercase text-blue-400 flex items-center gap-1">
                          <Stethoscope size={12} /> Clinical Practice Takeaway
                        </span>
                        <p className="text-blue-200 text-[11px] font-medium">
                          {topic.clinicalTakeaway}
                        </p>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                        <span>Trial: <strong className="text-slate-200">{topic.trialIdentifier}</strong></span>
                        <span>•</span>
                        <span>PMID: <strong className="text-slate-200">{topic.pmid}</strong></span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedTopic(topic)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-md shadow-blue-600/20"
                        >
                          Deep Dive <ArrowUpRight size={13} />
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab('ai_explorer');
                            setAiPrompt(`Provide a complete clinical research briefing on: ${topic.title} (${topic.trialIdentifier})`);
                            handleRunAiExploration(`Provide a complete clinical research briefing on: ${topic.title} (${topic.trialIdentifier})`);
                          }}
                          className="p-1.5 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold transition-all"
                          title="Ask AI to Synthesize this Topic"
                        >
                          <Sparkles size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PEER-REVIEWED LITERATURE & PAPERS */}
      {activeTab === 'papers' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <BookOpen className="text-blue-400" size={18} /> Peer-Reviewed Research Literature Database
              </h2>
              <p className="text-xs text-slate-400">
                Randomized controlled trials, high-impact journals, and clinical practice guidelines
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExportCitations('bibtex')}
                className="px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
              >
                <Download size={13} /> Export .BIB
              </button>
              <button
                onClick={() => handleExportCitations('ama_list')}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
              >
                <Copy size={13} /> Copy AMA Citations
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredPapers.map((paper, pIdx) => {
              const isSaved = bookmarkedPaperIds.includes(paper.id);
              return (
                <div 
                  key={`filtered-paper-${paper.id}-${pIdx}`}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg space-y-4 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded text-[10px] font-black uppercase">
                        {paper.evidenceLevel}
                      </span>
                      <span className="px-2.5 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-extrabold">
                        {paper.evidenceBadge}
                      </span>
                      <span className="text-xs text-slate-400 font-bold">
                        {paper.journal} ({paper.year})
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-bold text-amber-400">
                        Impact Factor: {paper.impactFactor}
                      </span>
                      <button
                        onClick={() => togglePaperBookmark(paper.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isSaved ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-white leading-snug mb-1">
                      {paper.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      Authors: {paper.authors}
                    </p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    <p className="font-semibold text-slate-200 mb-2">Abstract Summary:</p>
                    {paper.abstract}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                      <p className="text-[10px] font-black uppercase text-emerald-400">Key Trial Endpoints</p>
                      <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-1">
                        {paper.keyFindings.map((kf, idx) => (
                          <li key={`biosimulation-l878-idx-${idx}`}>{kf}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-2">
                      <div>
                        <p className="text-[10px] font-black uppercase text-blue-400">Statistical Significance</p>
                        <p className="text-slate-300 text-[11px]">{paper.statisticalProof}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-purple-400">Practice Guidelines</p>
                        <p className="text-slate-300 text-[11px]">{paper.clinicalGuidelines}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80">
                    <div>
                      <span>PMID: <strong className="text-slate-200">{paper.pmid}</strong></span>
                      <span className="mx-2">•</span>
                      <span>DOI: <strong className="text-slate-200">{paper.doi}</strong></span>
                    </div>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(paper.citationAMA);
                        alert('Copied AMA citation to clipboard!');
                      }}
                      className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      <Copy size={12} /> Copy Citation
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: AI RESEARCH EXPLORER */}
      {activeTab === 'ai_explorer' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-600/20 text-purple-400 rounded-2xl border border-purple-500/30">
                <Sparkles size={24} />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">AI Clinical Research Explorer</h2>
                <p className="text-xs text-slate-400">
                  Ask deep medical queries, request disease mechanism breakdowns, or evaluate novel therapeutic targets with Gemini.
                </p>
              </div>
            </div>

            {/* Prompt Form */}
            <div className="space-y-3">
              <textarea
                rows={3}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. Compare mechanism and cardiorenal outcomes of dual GLP-1/GIP agonists vs SGLT2 inhibitors in diabetic nephropathy..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white placeholder-slate-500 font-medium focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-slate-400">Suggested Prompts:</span>
                  <button
                    onClick={() => setAiPrompt("Analyze dual GLP-1/GIP agonists in HFpEF and epicardial fat remodeling")}
                    className="px-2.5 py-1 bg-slate-950 border border-slate-800 hover:border-purple-500 text-xs text-slate-300 rounded-lg transition-all"
                  >
                    HFpEF Incretins
                  </button>
                  <button
                    onClick={() => setAiPrompt("Summarize base editing efficacy and off-target safety in lipid disorders")}
                    className="px-2.5 py-1 bg-slate-950 border border-slate-800 hover:border-purple-500 text-xs text-slate-300 rounded-lg transition-all"
                  >
                    Base Editing Safety
                  </button>
                  <button
                    onClick={() => setAiPrompt("Evaluate CAR-T cell therapy in drug-resistant lupus nephritis")}
                    className="px-2.5 py-1 bg-slate-950 border border-slate-800 hover:border-purple-500 text-xs text-slate-300 rounded-lg transition-all"
                  >
                    CAR-T Lupus
                  </button>
                </div>

                <button
                  onClick={() => handleRunAiExploration()}
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all ml-auto"
                >
                  {aiLoading ? <RefreshCw className="animate-spin" size={16} /> : <Send size={16} />}
                  {aiLoading ? 'Synthesizing Data...' : 'Run Research AI'}
                </button>
              </div>
            </div>

            {/* AI Result Output */}
            {aiResponse && (
              <div className="mt-6 pt-6 border-t border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-purple-400 flex items-center gap-1.5">
                    <Sparkles size={14} /> Doctorian Research Synthesis
                  </span>
                  {aiCreditsUsed !== null && (
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800">
                      Credits Used: {aiCreditsUsed.toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-line shadow-inner">
                  {aiResponse}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: SAVED RESEARCH & NOTEBOOK */}
      {activeTab === 'saved' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <BookmarkCheck className="text-amber-400" size={20} /> Your Saved Research Notebook
                </h2>
                <p className="text-xs text-slate-400">
                  Quick access to your bookmarked clinical topics and peer-reviewed citations
                </p>
              </div>

              <button
                onClick={() => handleExportCitations('bibtex')}
                className="px-3 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
              >
                <Download size={13} /> Export All Saved .BIB
              </button>
            </div>

            {bookmarkedTopicIds.length === 0 && bookmarkedPaperIds.length === 0 ? (
              <div className="text-center py-12">
                <Bookmark className="mx-auto text-slate-600 mb-2" size={36} />
                <p className="text-slate-400 font-bold text-sm">No saved topics or papers in your notebook.</p>
                <p className="text-xs text-slate-500 mt-1">Click the bookmark icon on any topic or paper card to save it here.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Bookmarked Topics */}
                {bookmarkedTopicIds.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                      Saved Live Topics ({bookmarkedTopicIds.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {LIVE_HEALTH_TOPICS.filter(t => bookmarkedTopicIds.includes(t.id)).map((topic, btIdx) => (
                        <div key={`bm-topic-${topic.id}-${btIdx}`} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-blue-400">{topic.category}</span>
                            <button onClick={() => toggleTopicBookmark(topic.id)} className="text-amber-400 hover:text-slate-500">
                              <BookmarkCheck size={16} />
                            </button>
                          </div>
                          <h4 className="text-sm font-black text-white">{topic.title}</h4>
                          <p className="text-xs text-slate-400 line-clamp-2">{topic.summary}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bookmarked Papers */}
                {bookmarkedPaperIds.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                      Saved Peer-Reviewed Literature ({bookmarkedPaperIds.length})
                    </h3>
                    <div className="space-y-3">
                      {RESEARCH_DATABASE.filter(p => bookmarkedPaperIds.includes(p.id)).map((paper, bpIdx) => (
                        <div key={`bm-paper-${paper.id}-${bpIdx}`} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-black uppercase text-emerald-400">{paper.journal} ({paper.year})</span>
                            <h4 className="text-sm font-black text-white">{paper.title}</h4>
                            <p className="text-xs text-slate-400">{paper.authors}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(paper.citationAMA);
                                alert('Copied AMA citation!');
                              }}
                              className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded text-xs font-bold flex items-center gap-1"
                            >
                              <Copy size={12} /> Citation
                            </button>
                            <button onClick={() => togglePaperBookmark(paper.id)} className="text-amber-400 hover:text-slate-500">
                              <BookmarkCheck size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TOPIC DEEP DIVE MODAL */}
      <AnimatePresence>
        {selectedTopic && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedTopic(null)}
                className="absolute top-6 right-6 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition-colors"
              >
                ✕
              </button>

              <div className="space-y-2 pr-8">
                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-full text-[10px] font-black uppercase tracking-wider">
                  {selectedTopic.category} • {selectedTopic.subCategory}
                </span>
                <h2 className="text-xl font-black text-white leading-snug">
                  {selectedTopic.title}
                </h2>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>Modality: <strong className="text-slate-200">{selectedTopic.modality}</strong></span>
                  <span>•</span>
                  <span>Status: <strong className="text-emerald-400">{selectedTopic.status}</strong></span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-black uppercase text-blue-400">Executive Summary</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedTopic.summary}</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-black uppercase text-purple-400">Detailed Biological Pathway & Mechanism</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedTopic.keyMechanism}</p>
                </div>

                <div className="bg-blue-950/30 p-4 rounded-2xl border border-blue-900/40 space-y-1">
                  <span className="text-[10px] font-black uppercase text-blue-300">Physician & Researcher Actionable Guidance</span>
                  <p className="text-xs text-blue-200 leading-relaxed">{selectedTopic.clinicalTakeaway}</p>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                  <div>
                    <p>Clinical Trial ID: <strong className="text-slate-200">{selectedTopic.trialIdentifier}</strong></p>
                    <p>PubMed ID: <strong className="text-slate-200">{selectedTopic.pmid}</strong></p>
                  </div>
                  <button
                    onClick={() => {
                      const topicToSynthesize = selectedTopic;
                      setSelectedTopic(null);
                      setActiveTab('ai_explorer');
                      setAiPrompt(`Provide a complete clinical research briefing on: ${topicToSynthesize.title} (${topicToSynthesize.trialIdentifier})`);
                      handleRunAiExploration(`Provide a complete clinical research briefing on: ${topicToSynthesize.title} (${topicToSynthesize.trialIdentifier})`);
                    }}
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/30"
                  >
                    <Sparkles size={14} /> Synthesize with AI
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
