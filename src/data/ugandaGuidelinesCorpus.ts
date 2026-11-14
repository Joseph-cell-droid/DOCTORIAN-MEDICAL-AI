export interface ClinicalGuidelineEntry {
  id: string;
  condition: string;
  category: string;
  source: string;
  section: string;
  year: number;
  keywords: string[];
  summary: string;
  investigations: string[];
  firstLineCare: string[];
  redFlags: string[];
  supportiveCare: string[];
  title?: string;
  sourceOrg?: string;
  version?: string;
  publicationDate?: string | number;
  isOutdated?: boolean;
}

export const UGANDA_CLINICAL_GUIDELINES: ClinicalGuidelineEntry[] = [
  {
    id: 'ucg-malaria-2023',
    condition: 'Uncomplicated & Severe Malaria (Plasmodium falciparum)',
    category: 'Infectious Diseases',
    source: 'Uganda Clinical Guidelines (UCG 2023) & WHO Malaria Guidelines',
    section: 'Section 2.4.1 — Malaria',
    year: 2023,
    keywords: ['fever', 'chills', 'rigors', 'malaria', 'headache', 'sweating', 'joint pain', 'vomiting', 'kampala', 'mosquito', 'plasmodium', 'febrile'],
    summary: 'Confirm parasitological diagnosis with Malaria Rapid Diagnostic Test (mRDT) or thick/thin blood smear before initiating antimalarial therapy whenever accessible.',
    investigations: [
      'Malaria Rapid Diagnostic Test (mRDT)',
      'Thick and thin blood smear for malaria parasites and parasite density',
      'Full blood count (FBC) and haemoglobin if pallor is present',
      'Random blood glucose and urinalysis in severe febrile illness'
    ],
    firstLineCare: [
      'Uncomplicated malaria (clinician-confirmed): Artemether-Lumefantrine (ACT) weight-based 3-day regimen taken with fatty food/milk.',
      'Severe malaria emergency: Parenteral Artesunate IV/IM stabilized at a health facility, transitioning to full oral ACT once patient can tolerate oral intake.'
    ],
    redFlags: [
      'Inability to drink, breastfeed, or persistent vomiting of all oral fluids',
      'Altered mental status, extreme lethargy, confusion, or convulsions',
      'Severe anaemia (marked palmar/conjunctival pallor), dark tea-colored urine, or jaundice',
      'Respiratory distress or circulatory shock'
    ],
    supportiveCare: [
      'Maintain oral hydration (water, ORS) and monitor temperature every 4-6 hours.',
      'Tepid sponging and clinician-advised antipyretic (paracetamol) for fever discomfort.',
      'Sleep under an insecticide-treated mosquito net (ITN) to prevent transmission.'
    ]
  },
  {
    id: 'ucg-pneumonia-ari-2023',
    condition: 'Community-Acquired Pneumonia & Pediatric ARI',
    category: 'Respiratory Medicine',
    source: 'Uganda Clinical Guidelines (UCG 2023) & WHO IMCI',
    section: 'Section 6.1 — Acute Respiratory Infections',
    year: 2023,
    keywords: ['cough', 'shortness of breath', 'dyspnea', 'chest pain', 'fast breathing', 'sputum', 'pneumonia', 'wheezing', 'spo2', 'hypoxia', 'fever'],
    summary: 'Assess respiratory rate for age, pulse oximetry (SpO2), chest indrawing, and lung auscultation to distinguish simple upper respiratory viral infection from bacterial or severe pneumonia.',
    investigations: [
      'Pulse oximetry (SpO2) measurement at rest',
      'Chest radiograph (CXR) if available for persistent or severe focal signs',
      'Sputum microscopy / GeneXpert MTB/RIF if cough persists >= 2 weeks',
      'Complete blood count (CBC) and malaria mRDT to rule out dual pathology'
    ],
    firstLineCare: [
      'Non-severe bacterial pneumonia (clinician-prescribed): Oral Amoxicillin dispersible tablets (pediatric weight-based) or Amoxicillin 500mg-1g TDS in adults for 5 days.',
      'Severe pneumonia (SpO2 < 90%, chest indrawing, or grunting): Immediate hospital admission, supplemental oxygen, and IV Ampicillin + Gentamicin or Ceftriaxone per clinician assessment.'
    ],
    redFlags: [
      'Oxygen saturation (SpO2) < 92% or visible central cyanosis (bluish lips/tongue)',
      'Lower chest wall indrawing, nasal flaring, or grunting in children',
      'Inability to speak in full sentences, extreme drowsiness, or confusion',
      'Persistent high fever beyond 48-72 hours despite medical review'
    ],
    supportiveCare: [
      'Keep upright/semi-sitting to ease breathing work and ensure adequate fluid intake.',
      'Avoid household smoke, charcoal fumes, and dust exposure.',
      'Clear nasal secretions gently in infants before feeding.'
    ]
  },
  {
    id: 'ucg-diarrhoea-cholera-2023',
    condition: 'Acute Watery Diarrhoea & Dehydration Management',
    category: 'Gastroenterology & Pediatrics',
    source: 'Uganda Clinical Guidelines (UCG 2023) & WHO Diarrhoea Protocol',
    section: 'Section 1.2 — Diarrhoeal Diseases',
    year: 2023,
    keywords: ['diarrhoea', 'diarrhea', 'loose stool', 'watery stool', 'vomiting', 'dehydration', 'ors', 'stomach', 'abdominal pain', 'cholera', 'sunken eyes'],
    summary: 'Primary clinical priority is rapid assessment of hydration status (No dehydration Plan A, Some dehydration Plan B, Severe dehydration Plan C) and electrolyte replacement.',
    investigations: [
      'Clinical dehydration grading (skin pinch, sunken eyes, thirst, capillary refill)',
      'Stool microscopy/culture and cholera rapid test during outbreaks',
      'Serum electrolytes and renal function (urea/creatinine) in severe dehydration'
    ],
    firstLineCare: [
      'Low-osmolarity Oral Rehydration Salts (ORS) after every loose stool (Plan A/B).',
      'Pediatric Zinc supplementation (20 mg/day for 10-14 days; 10 mg/day if < 6 months) to shorten episode duration.',
      'Severe dehydration / shock (Plan C): Urgent IV Ringer’s Lactate bolus at health facility; antibiotics reserved for suspected cholera or dysentery under clinician guidance.'
    ],
    redFlags: [
      'Sunken eyes, skin pinch going back very slowly (>2 seconds), or inability to drink',
      'Blood or mucus in stool (dysentery) with high fever',
      'No urine output for > 6-8 hours, severe lethargy, or unconsciousness',
      'Profuse "rice-water" stools suggesting cholera'
    ],
    supportiveCare: [
      'Sip ORS frequently in small quantities rather than large gulps if nauseated.',
      'Continue breastfeeding for infants and offer easily digestible soft foods.',
      'Practice strict handwashing with soap and boil/treat all drinking water.'
    ]
  },
  {
    id: 'ucg-tb-screening-2023',
    condition: 'Pulmonary Tuberculosis Screening & Evaluation',
    category: 'Infectious Diseases',
    source: 'Uganda National TB & Leprosy Control Guidelines / UCG 2023',
    section: 'Section 2.9 — Tuberculosis',
    year: 2023,
    keywords: ['chronic cough', 'night sweats', 'weight loss', 'tb', 'tuberculosis', 'hemoptysis', 'coughing blood', 'sputum', 'lymph node'],
    summary: 'Any cough lasting >= 2 weeks (or any duration in people living with HIV), accompanied by fever, drenching night sweats, or unintentional weight loss warrants TB microbiological testing.',
    investigations: [
      'GeneXpert MTB/RIF Ultra sputum assay (preferred initial diagnostic test in Uganda)',
      'Chest X-ray (PA view) and sputum AFB microscopy if GeneXpert unavailable',
      'Routine provider-initiated HIV testing and blood glucose screening'
    ],
    firstLineCare: [
      'Confirmed drug-susceptible pulmonary TB requires a clinician-supervised 6-month directly observed regimen (2RHZE intensive phase + 4RH continuation phase).',
      'Do not initiate empiric fluoroquinolones for undiagnosed chronic cough as this delays TB confirmation.'
    ],
    redFlags: [
      'Coughing up frank blood (haemoptysis)',
      'Progressive breathlessness, pleuritic chest pain, or rapid clinical wasting',
      'Neck stiffness or severe headache alongside TB symptoms (possible TB meningitis)'
    ],
    supportiveCare: [
      'Improve indoor cross-ventilation and wear a surgical mask in crowded clinic waiting rooms.',
      'Screen household contacts, especially children under 5 years.',
      'Ensure nutrient-dense meals and strict adherence once a clinician initiates therapy.'
    ]
  },
  {
    id: 'ucg-maternal-preeclampsia-2023',
    condition: 'Pregnancy Hypertension, Pre-eclampsia & Obstetric Danger Signs',
    category: 'Maternal & Reproductive Health',
    source: 'Uganda Clinical Guidelines (UCG 2023) & WHO Antenatal Care',
    section: 'Section 16.3 — Hypertensive Disorders in Pregnancy',
    year: 2023,
    keywords: ['pregnant', 'pregnancy', 'swelling', 'edema', 'blurred vision', 'headache', 'epigastric', 'high blood pressure', 'eclampsia', 'bleeding', 'antenatal'],
    summary: 'BP >= 140/90 mmHg after 20 weeks gestation requires urgent urinalysis for proteinuria and maternal/fetal assessment for pre-eclampsia.',
    investigations: [
      'Repeated seated blood pressure readings 4 hours apart (or immediately if >= 160/110 mmHg)',
      'Urine dipstick protein / 24-hour urine protein',
      'Platelet count, liver transaminases (AST/ALT), serum creatinine, and fetal heart rate monitoring'
    ],
    firstLineCare: [
      'Severe hypertension (>= 160/110 mmHg) or severe features require immediate obstetric admission, IV Hydralazine or oral Nifedipine, and Magnesium Sulphate (Pritchard regimen) under clinician supervision.'
    ],
    redFlags: [
      'Severe persistent frontal headache, visual blurring/flashes, or right upper quadrant abdominal pain',
      'Vaginal bleeding at any stage of pregnancy or gush of fluid',
      'Reduced or absent fetal movements, convulsions, or sudden facial/hand swelling'
    ],
    supportiveCare: [
      'Seek immediate evaluation at a Comprehensive Emergency Obstetric Care (CEmOC) health facility.',
      'Rest in left lateral position while awaiting transport to improve uteroplacental blood flow.'
    ]
  },
  {
    id: 'ucg-hypertension-2023',
    condition: 'Essential Hypertension & Cardiovascular Risk',
    category: 'Cardiology & NCDs',
    source: 'Uganda Clinical Guidelines (UCG 2023) & WHO HEARTS',
    section: 'Section 4.1 — Hypertension',
    year: 2023,
    keywords: ['hypertension', 'blood pressure', 'bp', 'chest pain', 'palpitations', 'dizziness', '140/90', '160', 'cardiac', 'heart', 'stroke'],
    summary: 'Confirm elevated blood pressure (>= 140/90 mmHg) across at least two separate visits unless readings are severely elevated (>= 180/110 mmHg) or end-organ symptoms exist.',
    investigations: [
      'Standardized seated blood pressure measurement on both arms',
      'Fasting blood glucose / HbA1c and fasting lipid profile',
      'Serum creatinine/eGFR, electrolytes, urinalysis for albuminuria, and 12-lead ECG'
    ],
    firstLineCare: [
      'Lifestyle modification plus clinician-prescribed stepwise therapy (e.g., Amlodipine, Hydrochlorothiazide/Bendroflumethiazide, or Enalapril/Losartan depending on comorbidities).'
    ],
    redFlags: [
      'Crushing or radiating chest pain, sweating, or jaw/left-arm discomfort',
      'Sudden facial droop, slurred speech, limb weakness, or acute vision loss (stroke emergency)',
      'BP >= 180/120 mmHg with severe headache, dyspnoea, or confusion (hypertensive emergency)'
    ],
    supportiveCare: [
      'Limit dietary salt (< 5g/day), avoid tobacco, limit alcohol, and maintain brisk physical activity as tolerated.',
      'Never stop antihypertensive medicine abruptly without consulting your clinician.'
    ]
  },
  {
    id: 'ucg-diabetes-2023',
    condition: 'Diabetes Mellitus & Hyperglycaemic Emergencies',
    category: 'Endocrinology & NCDs',
    source: 'Uganda Clinical Guidelines (UCG 2023) & WHO PEN',
    section: 'Section 8.1 — Diabetes Mellitus',
    year: 2023,
    keywords: ['diabetes', 'blood sugar', 'glucose', 'thirst', 'polyuria', 'frequent urination', 'blurred vision', 'metformin', 'insulin', 'foot ulcer', 'dka'],
    summary: 'Evaluate fasting plasma glucose (>= 7.0 mmol/L or 126 mg/dL), random glucose (>= 11.1 mmol/L with symptoms), or HbA1c >= 6.5% alongside ketone assessment when acutely unwell.',
    investigations: [
      'Fasting blood glucose or random capillary glucose + HbA1c',
      'Urine ketones and urinalysis if random glucose > 14 mmol/L or patient is vomiting',
      'Renal function (creatinine/eGFR) and diabetic foot inspection'
    ],
    firstLineCare: [
      'Medical nutrition therapy plus clinician-initiated Metformin (for Type 2 DM without renal/acidosis contraindications) or Insulin regimens.',
      'Suspected DKA/HHS requires emergency IV fluid resuscitation and hospital insulin protocol.'
    ],
    redFlags: [
      'Deep rapid breathing (Kussmaul respiration), fruity breath odor, severe abdominal pain, or persistent vomiting',
      'Confusion, drowsiness, or blood sugar < 3.9 mmol/L (hypoglycaemia emergency)',
      'Infected, black, or rapidly spreading foot wound'
    ],
    supportiveCare: [
      'Prioritize whole foods, high-fiber local greens, controlled complex carbohydrate portions, and hydration.',
      'Inspect feet daily and wear protective footwear.'
    ]
  },
  {
    id: 'ucg-typhoid-febrile-2023',
    condition: 'Enteric (Typhoid) Fever & Undifferentiated Febrile Illness',
    category: 'Infectious Diseases',
    source: 'Uganda Clinical Guidelines (UCG 2023)',
    section: 'Section 2.2 — Typhoid Fever',
    year: 2023,
    keywords: ['typhoid', 'sustained fever', 'abdominal pain', 'constipation', 'salmonella', 'headache', 'malaise', 'widal'],
    summary: 'Stepwise persistent fever with headache, abdominal tenderness, or relative bradycardia after ruling out malaria; blood culture is preferred over Widal testing due to false positives.',
    investigations: [
      'Malaria mRDT / smear first to exclude malaria co-infection',
      'Blood culture (first week) or stool culture (preferred over standalone Widal test)',
      'Complete blood count and abdominal exam for peritoneal signs'
    ],
    firstLineCare: [
      'Targeted oral or IV antibiotics (e.g., Ciprofloxacin or Azithromycin, or IV Ceftriaxone in severe inpatient disease) strictly prescribed after clinical evaluation.'
    ],
    redFlags: [
      'Sudden severe generalized abdominal pain, rigid board-like abdomen, or guarding (possible intestinal perforation)',
      'Bloody stools, persistent delirium, or hemodynamic instability'
    ],
    supportiveCare: [
      'Drink boiled or chlorinated water and eat thoroughly cooked hot meals.',
      'Maintain hydration and avoid self-medicating with leftover incomplete antibiotic courses.'
    ]
  },
  {
    id: 'ucg-uti-2023',
    condition: 'Urinary Tract Infection (Cystitis & Pyelonephritis)',
    category: 'Renal & Urology',
    source: 'Uganda Clinical Guidelines (UCG 2023)',
    section: 'Section 9.2 — Urinary Tract Infections',
    year: 2023,
    keywords: ['uti', 'painful urination', 'dysuria', 'burning urine', 'frequency', 'flank pain', 'loin pain', 'urinary', 'bladder'],
    summary: 'Differentiate uncomplicated lower UTI (dysuria, urgency, suprapubic discomfort without fever) from acute pyelonephritis (fever, chills, flank/costovertebral angle tenderness).',
    investigations: [
      'Urinalysis dipstick (leukocyte esterase, nitrites) and urine microscopy',
      'Mid-stream urine culture & sensitivity in pregnancy, men, recurrent UTI, or pyelonephritis',
      'Pregnancy test in women of reproductive age before prescribing medications'
    ],
    firstLineCare: [
      'Uncomplicated cystitis (clinician-prescribed): Nitrofurantoin or Cefixime/Amoxicillin-clavulanate guided by local sensitivity and pregnancy status.',
      'Pyelonephritis: Clinical evaluation for IV/high-bioavailability therapy and hydration.'
    ],
    redFlags: [
      'High fever, rigors, nausea/vomiting, and severe back/flank pain',
      'Complete inability to pass urine or visible heavy blood clots in urine',
      'Any UTI symptoms during pregnancy'
    ],
    supportiveCare: [
      'Increase clean water intake to flush the urinary tract and empty bladder regularly.',
      'Seek prompt urinalysis rather than taking unprescribed leftover antibiotics.'
    ]
  }
];

export function searchGuidelines(query: string, limit = 3): ClinicalGuidelineEntry[] {
  const normalized = (query || '').toLowerCase().trim();
  if (!normalized) return UGANDA_CLINICAL_GUIDELINES.slice(0, limit);

  const tokens = normalized.split(/[^a-z0-9]+/).filter((t) => t.length >= 2);
  const scored = UGANDA_CLINICAL_GUIDELINES.map((entry) => {
    let score = 0;
    const haystack = [
      entry.condition,
      entry.category,
      entry.summary,
      ...entry.keywords,
      ...entry.redFlags
    ].join(' ').toLowerCase();

    for (const kw of entry.keywords) {
      if (normalized.includes(kw.toLowerCase())) score += 4;
    }
    for (const tok of tokens) {
      if (haystack.includes(tok)) score += 1;
    }
    return { entry, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.entry);
}

export function formatGuidelineContext(entries: ClinicalGuidelineEntry[]): string {
  if (!entries.length) return 'Reference standard: World Health Organization (WHO) & Uganda Clinical Guidelines (UCG 2023).';
  return entries
    .map(
      (e) =>
        `[${e.source} — ${e.section} (${e.year})]\n` +
        `Condition: ${e.condition}\n` +
        `Summary: ${e.summary}\n` +
        `Investigations: ${e.investigations.join('; ')}\n` +
        `Guideline Care: ${e.firstLineCare.join(' ')}\n` +
        `Red Flags: ${e.redFlags.join('; ')}`
    )
    .join('\n\n');
}
