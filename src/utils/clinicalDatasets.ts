/**
 * Local Clinical Reference Datasets for Offline Healthcare & Pharmacy
 * 1. Drug Interaction Matrix & WHO Essential Medicines
 * 2. ICD-11 & CPT Coding Helper
 */

export interface DrugInteraction {
  drugA: string;
  drugB: string;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  mechanism: string;
  clinicalEffect: string;
  recommendedAction: string;
}

export interface ICD11Code {
  code: string;
  title: string;
  category: string;
  cptCode?: string;
  cptDescription?: string;
}

export interface EssentialMedicine {
  id: string;
  innName: string;
  category: string;
  formulation: string;
  dosage: string;
  whoCategory: 'Access' | 'Watch' | 'Reserve';
  indications: string[];
}

// ─── 1. DRUG INTERACTION MATRIX ─────────────────────────────────────────────
export const DRUG_INTERACTION_MATRIX: DrugInteraction[] = [
  {
    drugA: 'Warfarin',
    drugB: 'Aspirin',
    severity: 'CRITICAL',
    mechanism: 'Synergistic inhibition of haemostasis & platelet aggregation',
    clinicalEffect: 'Severe risk of major internal hemorrhage and gastrointestinal bleeding',
    recommendedAction: 'Avoid co-administration unless mechanical heart valve present. Monitor INR closely.'
  },
  {
    drugA: 'Lisinopril',
    drugB: 'Spironolactone',
    severity: 'HIGH',
    mechanism: 'Dual potassium retention via RAAS blockade',
    clinicalEffect: 'Severe hyperkalemia (>5.5 mmol/L), potential fatal cardiac arrhythmias',
    recommendedAction: 'Monitor serum potassium and renal function within 1 week of initiation.'
  },
  {
    drugA: 'Metformin',
    drugB: 'Iodinated Contrast',
    severity: 'HIGH',
    mechanism: 'Contrast-induced acute kidney injury leads to metformin accumulation',
    clinicalEffect: 'Lactic acidosis (potentially fatal metabolic crisis)',
    recommendedAction: 'Withhold metformin for 48 hours prior to contrast imaging and verify eGFR.'
  },
  {
    drugA: 'Ibuprofen',
    drugB: 'Lisinopril',
    severity: 'MODERATE',
    mechanism: 'NSAID prostaglandin inhibition attenuates ACE-i renal vasodilation',
    clinicalEffect: 'Reduced antihypertensive effect and increased acute kidney injury risk',
    recommendedAction: 'Use paracetamol for analgesia or monitor blood pressure and eGFR.'
  },
  {
    drugA: 'Clopidogrel',
    drugB: 'Omeprazole',
    severity: 'HIGH',
    mechanism: 'CYP2C19 inhibition prevents prodrug activation of clopidogrel',
    clinicalEffect: 'Reduced antiplatelet efficacy, increased stroke / stent thrombosis risk',
    recommendedAction: 'Switch omeprazole to pantoprazole or H2-receptor antagonist (Famotidine).'
  },
  {
    drugA: 'Simvastatin',
    drugB: 'Amlodipine',
    severity: 'MODERATE',
    mechanism: 'CYP3A4 competition increases statin exposure',
    clinicalEffect: 'Increased risk of rhabdomyolysis and severe myopathy',
    recommendedAction: 'Do not exceed simvastatin 20mg daily when co-administered with amlodipine.'
  },
  {
    drugA: 'Ciprofloxacin',
    drugB: 'Artemether-Lumefantrine',
    severity: 'HIGH',
    mechanism: 'Additive QT interval prolongation',
    clinicalEffect: 'Ventricular tachycardia, Torsades de Pointes',
    recommendedAction: 'Avoid combination. Use alternative antibiotic (e.g. Amoxicillin/Clavulanate).'
  },
  {
    drugA: 'SGLT2 Inhibitor (Dapagliflozin)',
    drugB: 'Furosemide',
    severity: 'MODERATE',
    mechanism: 'Synergistic osmotic diuresis and intravascular volume depletion',
    clinicalEffect: 'Hypotension, dehydration, acute renal impairment',
    recommendedAction: 'Adjust loop diuretic dosage and advise patient on adequate hydration.'
  }
];

// ─── 2. ICD-11 & CPT DIAGNOSTIC DICTIONARY ──────────────────────────────
export const ICD11_CPT_DICTIONARY: ICD11Code[] = [
  { code: 'BA00', title: 'Essential Hypertension Stage I', category: 'Cardiovascular', cptCode: '99213', cptDescription: 'Outpatient Visit Mid-Complexity' },
  { code: 'BA01', title: 'Essential Hypertension Stage II with LVH', category: 'Cardiovascular', cptCode: '99214', cptDescription: 'Outpatient Visit High-Complexity' },
  { code: '5A11', title: 'Type 2 Diabetes Mellitus without complications', category: 'Endocrine', cptCode: '99213', cptDescription: 'Diabetes Evaluation' },
  { code: '5A11.1', title: 'Type 2 Diabetes Mellitus with Diabetic Nephropathy', category: 'Endocrine', cptCode: '99215', cptDescription: 'Complex Metabolic Consult' },
  { code: '1C60', title: 'Malaria caused by Plasmodium falciparum', category: 'Infectious', cptCode: '87207', cptDescription: 'Blood Smear Parasite Exam' },
  { code: 'CA40', title: 'Acute Bronchitis & Lower Respiratory Infection', category: 'Respiratory', cptCode: '99203', cptDescription: 'New Patient Evaluation' },
  { code: 'CA23', title: 'Bronchial Asthma, Unspecified Acute Exacerbation', category: 'Respiratory', cptCode: '94640', cptDescription: 'Inhalation Aerosol Therapy' },
  { code: 'MG30', title: 'Acute Febrile Illness of Unknown Origin', category: 'General', cptCode: '80053', cptDescription: 'Comprehensive Metabolic Panel' },
  { code: '8A80', title: 'Ischaemic Stroke / Cerebral Infarction', category: 'Neurology', cptCode: '99285', cptDescription: 'Emergency Department High-Severity' },
  { code: 'GA00', title: 'Acute Pyelonephritis / Urinary Tract Infection', category: 'Nephrology', cptCode: '81002', cptDescription: 'Urinalysis Non-Automated' },
  { code: '4A40', title: 'Severe Acute Malnutrition (Kwashiorkor/Marasmus)', category: 'Nutrition', cptCode: '97802', cptDescription: 'Medical Nutrition Therapy' },
  { code: '2B30', title: 'Iron Deficiency Anemia, Secondary to Blood Loss', category: 'Hematology', cptCode: '85025', cptDescription: 'Complete Blood Count (CBC)' },
];

// ─── 3. WHO ESSENTIAL MEDICINES ────────────────────────────────────────────
export const WHO_ESSENTIAL_MEDICINES: EssentialMedicine[] = [
  { id: 'WHO-01', innName: 'Amoxicillin + Clavulanic Acid', category: 'Antibacterial', formulation: 'Tablet 500mg/125mg', dosage: '625mg q8h', whoCategory: 'Access', indications: ['Pneumonia', 'Sinusitis', 'Otitis Media'] },
  { id: 'WHO-02', innName: 'Artemether + Lumefantrine', category: 'Antimalarial', formulation: 'Tablet 20mg/120mg', dosage: '4 tabs at 0, 8, 24, 36, 48, 60h', whoCategory: 'Access', indications: ['Uncomplicated P. falciparum Malaria'] },
  { id: 'WHO-03', innName: 'Artesunate IV/IM', category: 'Antimalarial', formulation: 'Vial 60mg powder for injection', dosage: '2.4 mg/kg IV at 0, 12, 24h then daily', whoCategory: 'Access', indications: ['Severe Complicated Malaria'] },
  { id: 'WHO-04', innName: 'Metformin Hydrochloride', category: 'Antidiabetic', formulation: 'Tablet 500mg / 850mg', dosage: '500mg BID with meals', whoCategory: 'Access', indications: ['Type 2 Diabetes Mellitus'] },
  { id: 'WHO-05', innName: 'Amlodipine Besylate', category: 'Antihypertensive', formulation: 'Tablet 5mg / 10mg', dosage: '5mg - 10mg OD', whoCategory: 'Access', indications: ['Essential Hypertension', 'Angina'] },
  { id: 'WHO-06', innName: 'Lisinopril', category: 'ACE Inhibitor', formulation: 'Tablet 5mg / 10mg / 20mg', dosage: '10mg OD', whoCategory: 'Access', indications: ['Hypertension', 'Heart Failure', 'Diabetic Nephropathy'] },
  { id: 'WHO-07', innName: 'Ciprofloxacin', category: 'Fluoroquinolone', formulation: 'Tablet 500mg', dosage: '500mg BID', whoCategory: 'Watch', indications: ['Typhoid Fever', 'Complicated UTI'] },
  { id: 'WHO-08', innName: 'Ceftriaxone IV', category: '3rd Gen Cephalosporin', formulation: 'Vial 1g powder', dosage: '1g - 2g IV daily', whoCategory: 'Watch', indications: ['Sepsis', 'Meningitis', 'Severe Pneumonia'] },
  { id: 'WHO-09', innName: 'Salbutamol Inhaler', category: 'Bronchodilator', formulation: 'Metered Dose Inhaler 100mcg/dose', dosage: '1-2 puffs PRN', whoCategory: 'Access', indications: ['Asthma Exacerbation', 'COPD'] },
  { id: 'WHO-10', innName: 'Oral Rehydration Salts (ORS) + Zinc', category: 'Rehydration & Micronutrient', formulation: 'Sachet for 1L + Zinc 20mg tab', dosage: '1L ORS over 4 hours + 20mg Zinc daily', whoCategory: 'Access', indications: ['Acute Diarrheal Dehydration'] },
];

/**
 * Check drug interaction against list of current medications
 */
export function checkDrugInteractions(medList: string[]): DrugInteraction[] {
  const found: DrugInteraction[] = [];
  const normalizedMeds = medList.map(m => m.toLowerCase().trim());

  DRUG_INTERACTION_MATRIX.forEach(interaction => {
    const matchA = normalizedMeds.some(m => m.includes(interaction.drugA.toLowerCase()));
    const matchB = normalizedMeds.some(m => m.includes(interaction.drugB.toLowerCase()));

    if (matchA && matchB) {
      found.push(interaction);
    }
  });

  return found;
}

/**
 * Search ICD-11 & CPT Coding Helper offline
 */
export function searchICD11CPT(query: string): ICD11Code[] {
  if (!query || query.trim().length < 2) return ICD11_CPT_DICTIONARY.slice(0, 6);
  const q = query.toLowerCase().trim();
  return ICD11_CPT_DICTIONARY.filter(item =>
    item.code.toLowerCase().includes(q) ||
    item.title.toLowerCase().includes(q) ||
    item.category.toLowerCase().includes(q) ||
    (item.cptCode && item.cptCode.toLowerCase().includes(q))
  );
}
