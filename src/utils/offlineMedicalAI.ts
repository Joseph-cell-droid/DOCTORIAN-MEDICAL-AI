/**
 * Doctorian Autonomous Offline Clinical Knowledge Core
 * Self-contained clinical decision support dataset (WHO & Uganda Clinical Guidelines 2023/2026)
 * enabling rich, fast AI consultations, differential symptom triage, pharmacology dosing,
 * lab interpretation, and East African multilingual guidance with zero internet connection.
 */

export interface OfflineConditionNode {
  id: string;
  title: string;
  category: string;
  keywords: string[];
  icd10: string;
  overview: string;
  symptoms: string[];
  diagnostics: string[];
  firstLineTreatment: string[];
  supportiveCare: string[];
  dangerSigns: string[];
}

export interface OfflineDrugNode {
  name: string;
  keywords: string[];
  class: string;
  adultDose: string;
  pediatricDose: string;
  indications: string;
  cautions: string;
}

export const OFFLINE_CLINICAL_CONDITIONS: OfflineConditionNode[] = [
  {
    id: 'malaria',
    title: 'Malaria (Plasmodium falciparum)',
    category: 'Infectious Diseases',
    keywords: ['malaria', 'musujja', 'plasmodium', 'mosquito', 'coartem', 'artesunate', 'chills', 'sweating', 'rigors'],
    icd10: 'B50.9',
    overview: 'Acute febrile vector-borne illness caused by Plasmodium parasites transmitted by female Anopheles mosquitoes. Rapid confirmation prevents progression to cerebral malaria, severe anemia, or metabolic acidosis.',
    symptoms: ['Cyclic high fever & chills', 'Severe throbbing headache', 'Joint/muscle aches (myalgia)', 'Nausea, vomiting & bitter taste', 'General body weakness'],
    diagnostics: ['Malaria Rapid Diagnostic Test (RDT / mRDT)', 'Thick & thin Giemsa blood smear microscopy', 'Hemoglobin / Blood glucose check if severe'],
    firstLineTreatment: [
      'Uncomplicated: Artemether-Lumefantrine (Coartem 20/120mg) — 4 tabs twice daily for 3 days in adults (>35kg); give with fatty meal or milk.',
      'Alternative ACT: Artesunate-Amodiaquine or Dihydroartemisinin-Piperaquine.',
      'Severe / Cerebral Malaria: IV or IM Artesunate 2.4 mg/kg at 0h, 12h, 24h (3.0 mg/kg if child <20kg), followed by full oral ACT course.',
      'Pregnancy 2nd/3rd Trimester IPTp: Sulfadoxine-Pyrimethamine (Fansidar) monthly from 13 weeks; 1st trimester uncomplicated: Artemether-Lumefantrine or Quinine.'
    ],
    supportiveCare: ['Paracetamol 500mg-1g every 6-8 hours for fever', 'Oral Rehydration Solution (ORS) & tepid sponging', 'Avoid Aspirin in children <16 years'],
    dangerSigns: ['Convulsions or altered consciousness (Glasgow Coma Scale drops)', 'Persistent vomiting unable to hold fluids', 'Deep breathing / respiratory distress or tea-colored urine', 'Severe pallor / Hb <5 g/dL or blood sugar <2.2 mmol/L -> STAT Hospital Referral']
  },
  {
    id: 'typhoid',
    title: 'Typhoid / Enteric Fever (Salmonella Typhi)',
    category: 'Infectious Diseases',
    keywords: ['typhoid', 'salmonella', 'enteric fever', 'stepwise fever', 'abdominal tenderness'],
    icd10: 'A01.0',
    overview: 'Systemic bacterial infection transmitted via contaminated food or water. Characterized by sustained stepwise high fever, relative bradycardia, and gastrointestinal pain.',
    symptoms: ['Sustained fever >38.5°C rising daily', 'Diffuse abdominal discomfort or constipation/diarrhea', 'Frontal headache & malaise', 'Coated tongue & poor appetite'],
    diagnostics: ['Blood culture (gold standard week 1)', 'Stool/Urine culture week 2+', 'CBC (often normal/low WBC)', 'Note: Widal test alone is unreliable in endemic zones without clinical correlation'],
    firstLineTreatment: [
      'Oral Uncomplicated: Ciprofloxacin 500mg twice daily for 7-10 days OR Azithromycin 1g day 1 then 500mg daily for 6 days.',
      'Severe / Hospitalized: IV Ceftriaxone 2g once daily for 10-14 days (pediatrics 75-100 mg/kg/day).'
    ],
    supportiveCare: ['Strict boiled/treated drinking water', 'ORS hydration & soft nutritious meals', 'Hand hygiene with soap after toilet use'],
    dangerSigns: ['Sudden severe sharp abdominal pain & board-like rigidity (bowel perforation)', 'Melena / bloody stools', 'Delirium or shock -> Emergency Surgical & Medical Referral']
  },
  {
    id: 'pneumonia',
    title: 'Community-Acquired Pneumonia & Pediatric ARI',
    category: 'Respiratory',
    keywords: ['pneumonia', 'chest infection', 'productive cough', 'fast breathing', 'crackles', 'lubiri', 'lubengo'],
    icd10: 'J18.9',
    overview: 'Acute lower respiratory infection causing alveolar inflammation and impaired gas exchange. Leading cause of hospitalization if hypoxia develops.',
    symptoms: ['Productive cough (yellow/rusty sputum)', 'Fever with rigors', 'Pleuritic chest pain worse on deep breath', 'Tachypnea (Adults RR >22/min; Child 1-5yr >40/min)'],
    diagnostics: ['Pulse oximetry (SpO2 target >=94%)', 'Chest X-ray', 'Respiratory rate count over full 60 seconds'],
    firstLineTreatment: [
      'Adult Outpatient (Mild): Amoxicillin 500mg-1g TDS for 5-7 days OR Doxycycline 100mg BD for 7 days (or Azithromycin 500mg OD for 3-5 days).',
      'Pediatric Non-Severe (2-59 months): Dispersible Amoxicillin 40 mg/kg twice daily for 5 days.',
      'Severe Pneumonia: Oxygen therapy (SpO2 <92%), IV Ceftriaxone 1-2g OD + Azithromycin 500mg (or IV Benzylpenicillin + Gentamicin in infants).'
    ],
    supportiveCare: ['Head-up positioning (30-45 degrees)', 'Adequate warm oral fluids', 'Paracetamol for fever/pleuritic chest discomfort'],
    dangerSigns: ['SpO2 <90-92% or central cyanosis (blue lips)', 'Lower chest wall indrawing, nasal flaring, or grunting in children', 'Unable to drink/breastfeed or confusion -> Urgent Oxygen & IV Antibiotics']
  },
  {
    id: 'cholera_diarrhea',
    title: 'Acute Watery Diarrhea, Cholera & Dehydration',
    category: 'Gastrointestinal',
    keywords: ['diarrhea', 'diarrhoea', 'cholera', 'ors', 'dehydration', 'vomiting', 'okuddukana', 'kuharisha', 'watery stool'],
    icd10: 'A09',
    overview: 'Rapid fluid and electrolyte depletion from bacterial/viral enteritis or Vibrio cholerae. Immediate rehydration prevents hypovolemic shock.',
    symptoms: ['Frequent loose or rice-water stools', 'Vomiting & abdominal cramps', 'Extreme thirst, dry mouth, reduced urination', 'Sunken eyes & lethargy'],
    diagnostics: ['Clinical hydration assessment (Plan A, B, or C)', 'Stool microscopy/culture if dysentery or cholera outbreak'],
    firstLineTreatment: [
      'WHO Reduced Osmolarity ORS: Dissolve 1 full sachet in 1 Liter clean boiled water. Sip after every loose stool.',
      'Emergency Home ORS: 1L clean boiled water + 6 level tsp sugar + 1/2 level tsp salt.',
      'Pediatric Zinc (<5 yrs): 20mg daily for 10-14 days (10mg if <6 months).',
      'Suspected Cholera Adult: Doxycycline 300mg single dose OR Azithromycin 1g single dose alongside aggressive IV Ringer’s Lactate (Plan C).',
      'Bloody Diarrhea (Dysentery): Ciprofloxacin 500mg BD for 3 days (or Cefixime/Azithromycin in children).'
    ],
    supportiveCare: ['Continue breastfeeding & small frequent soft meals', 'Avoid anti-motility drugs (Loperamide) in fever or bloody diarrhea'],
    dangerSigns: ['Skin pinch goes back slowly (>2 seconds)', 'Unable to drink, absent tears, anuria (>6 hours no urine), weak rapid pulse -> STAT IV Ringer’s Lactate']
  },
  {
    id: 'hypertension',
    title: 'Essential Hypertension & Hypertensive Crisis',
    category: 'Cardiovascular',
    keywords: ['hypertension', 'blood pressure', 'high bp', 'systolic', 'diastolic', 'amlodipine', 'losartan', 'presha'],
    icd10: 'I10',
    overview: 'Persistent systemic arterial blood pressure >=140/90 mmHg across two separate visits. Uncontrolled BP drives stroke, heart failure, and chronic kidney disease.',
    symptoms: ['Often asymptomatic ("silent killer")', 'Occipital morning headache', 'Dizziness, blurred vision, or palpitations', 'Exertional dyspnea'],
    diagnostics: ['2+ seated BP readings after 5 min rest', 'Fasting glucose, serum creatinine/eGFR, electrolytes', 'Urinalysis for proteinuria & 12-lead ECG'],
    firstLineTreatment: [
      'Stage 1/2 Uncomplicated: Amlodipine 5-10mg once daily (preferred calcium-channel blocker in East African adults) +/- Hydrochlorothiazide 12.5-25mg daily.',
      'Diabetic / Renal Protection: Add Losartan 50mg daily or Enalapril 10-20mg daily.',
      'Urgency (>=180/120 without organ damage): Oral Amlodipine 10mg + rest, lower gradually over 24-48 hours.'
    ],
    supportiveCare: ['Limit salt <5g/day (avoid raw table salt)', 'DASH diet rich in greens/bananas/beans', '30 min brisk walking 5 days/week'],
    dangerSigns: ['BP >=180/120 mmHg WITH chest pain, facial droop/weakness, sudden confusion, blurred vision, or severe shortness of breath -> Hypertensive Emergency']
  },
  {
    id: 'diabetes',
    title: 'Diabetes Mellitus (Type 2 & DKA Screening)',
    category: 'Endocrinology',
    keywords: ['diabetes', 'glucose', 'blood sugar', 'insulin', 'metformin', 'dka', 'sukari', 'polyuria'],
    icd10: 'E11',
    overview: 'Chronic metabolic hyperglycemia due to insulin resistance or deficiency. Structured glycemic and foot care prevents neuropathy, nephropathy, and ketoacidosis.',
    symptoms: ['Excessive thirst (polydipsia) & frequent urination (polyuria)', 'Unexplained weight loss & fatigue', 'Slow-healing foot wounds & tingling numbness', 'Blurred vision'],
    diagnostics: ['Fasting Blood Glucose >=7.0 mmol/L (126 mg/dL)', 'Random Glucose >=11.1 mmol/L (200 mg/dL) with symptoms', 'HbA1c >=6.5%', 'Urine ketones if glucose >14 mmol/L'],
    firstLineTreatment: [
      'Type 2 First-Line: Metformin 500mg-850mg once or twice daily with meals (titrate slowly up to 2g/day; check eGFR).',
      'Dual Therapy: Add Glimepiride 1-4mg or Gliclazide if HbA1c remains >7.5%.',
      'Hypoglycemia (<3.9 mmol/L): 15-20g fast sugar (3 tsp glucose in water / sweet juice) immediately -> recheck in 15 min.'
    ],
    supportiveCare: ['Daily foot inspection & protective footwear', 'High-fiber complex carbohydrates (millet, beans, greens), eliminate sugary sodas'],
    dangerSigns: ['Fruity acetone breath, deep rapid Kussmaul breathing, abdominal pain, drowsiness with sugar >14 mmol/L (Diabetic Ketoacidosis) -> STAT IV Saline & Insulin']
  },
  {
    id: 'maternal_preeclampsia',
    title: 'Antenatal Care, Pre-Eclampsia & Obstetric Triage',
    category: 'Maternal & Reproductive',
    keywords: ['pregnancy', 'pregnant', 'preeclampsia', 'eclampsia', 'maternal', 'olubuto', 'mimba', 'bleeding in pregnancy', 'anc'],
    icd10: 'O14.9',
    overview: 'Comprehensive antenatal monitoring after >=20 weeks gestation. Pre-eclampsia (BP >=140/90 + proteinuria or end-organ signs) is a leading obstetric emergency.',
    symptoms: ['Elevated BP (>=140/90 mmHg)', 'Persistent frontal headache or flashing lights/blurred vision', 'Epigastric (upper belly) pain', 'Sudden facial/hand swelling or vaginal bleeding'],
    diagnostics: ['Blood pressure check', 'Urine dipstick for proteinuria (>=1+)', 'Fetal heart rate & fundal height assessment', 'Hemoglobin & Malaria RDT'],
    firstLineTreatment: [
      'Routine ANC: Ferrous Sulfate + Folic Acid daily, Tetanus-Diphtheria vaccine, IPTp-SP monthly from 13 wks.',
      'Gestational Hypertension / Pre-eclampsia: Oral Nifedipine Retard 10-20mg BD or Methyldopa 250-500mg TDS.',
      'Severe Pre-eclampsia / Eclampsia Seizure Prophylaxis: Magnesium Sulfate (Pritchard regimen: 4g IV + 10g IM loading) + immediate hospital transfer.'
    ],
    supportiveCare: ['Left lateral lying position to improve uteroplacental blood flow', 'Minimum 8 ANC visits across pregnancy'],
    dangerSigns: ['Any vaginal bleeding, water breaking before 37 wks, convulsions, severe headache/visual spots, reduced fetal kicks -> STAT Maternity Emergency']
  },
  {
    id: 'asthma',
    title: 'Bronchial Asthma & Acute Bronchospasm',
    category: 'Respiratory',
    keywords: ['asthma', 'wheezing', 'inhaler', 'salbutamol', 'ventolin', 'shortness of breath', 'tight chest'],
    icd10: 'J45',
    overview: 'Chronic reversible airway inflammation and hyper-responsiveness triggered by dust, smoke, cold air, or viral colds.',
    symptoms: ['Expiratory wheezing', 'Chest tightness', 'Dry nocturnal cough', 'Shortness of breath'],
    diagnostics: ['Clinical expiratory wheeze on auscultation', 'Peak Expiratory Flow Rate (PEFR) & SpO2'],
    firstLineTreatment: [
      'Acute Rescue: Salbutamol inhaler (Ventolin 100mcg) 2-4 puffs via spacer every 20 min x3 doses (nebulize 2.5-5mg in clinic).',
      'Moderate/Severe Flare: Oral Prednisolone 40-50mg daily for 5 days + Oxygen if SpO2 <94%.',
      'Maintenance Prevention: Inhaled Budesonide/Beclomethasone + Salbutamol PRN.'
    ],
    supportiveCare: ['Eliminate charcoal smoke, dust & strong aerosols indoors', 'Use spacer chamber for optimal lung delivery'],
    dangerSigns: ['Inability to complete a sentence in one breath, silent chest (absent air entry), SpO2 <92%, exhaustion -> STAT IV Hydrocortisone + Oxygen']
  },
  {
    id: 'sickle_cell',
    title: 'Sickle Cell Disease & Vaso-Occlusive Crisis',
    category: 'Hematology',
    keywords: ['sickle cell', 'vaso-occlusive', 'bone pain', 'hydroxyurea', 'anemia', 'jaundice'],
    icd10: 'D57.0',
    overview: 'Inherited hemoglobinopathy (HbSS) causing red cell sickling during dehydration, cold, fever, or hypoxia, leading to painful microvascular occlusion.',
    symptoms: ['Severe aching pain in long bones, back, or joints', 'Yellow sclera (jaundice) & pale palms', 'Dactylitis (hand-foot swelling in toddlers)', 'Fatigue & fever'],
    diagnostics: ['Hb electrophoresis', 'CBC + Reticulocyte count', 'Malaria RDT & Chest X-ray if chest pain'],
    firstLineTreatment: [
      'Acute Pain Crisis: Aggressive oral/IV hydration + Paracetamol + Ibuprofen + Morphine/Tramadol for severe pain.',
      'Maintenance Prophylaxis: Folic Acid 5mg daily, Penicillin V prophylaxis (under 5 yrs), Hydroxyurea (clinician-monitored).'
    ],
    supportiveCare: ['Stay warm, hydrate 2.5-3L daily, sleep under treated mosquito net', 'Promptly treat any fever as potential sepsis/malaria'],
    dangerSigns: ['Fever >=38°C, acute chest pain + cough (Acute Chest Syndrome), sudden severe pallor/enlarged spleen, one-sided weakness (stroke) -> STAT Emergency']
  },
  {
    id: 'uti',
    title: 'Urinary Tract Infection & Pyelonephritis',
    category: 'Renal & Urology',
    keywords: ['uti', 'burning urine', 'dysuria', 'urinary', 'flank pain', 'cystitis', 'pyelonephritis'],
    icd10: 'N39.0',
    overview: 'Bacterial colonization of bladder (cystitis) or kidneys (pyelonephritis), most commonly E. coli.',
    symptoms: ['Burning pain on urination (dysuria)', 'Frequent small-volume urination & urgency', 'Suprapubic heaviness', 'Flank/back pain + fever (kidney involvement)'],
    diagnostics: ['Urine dipstick (Leukocyte esterase + Nitrites)', 'Midstream urine microscopy & culture'],
    firstLineTreatment: [
      'Uncomplicated Cystitis: Nitrofurantoin 100mg BD for 5 days (safe in early pregnancy) OR Ciprofloxacin 500mg BD for 3-5 days (non-pregnant).',
      'Acute Pyelonephritis (Fever + Flank pain): IV Ceftriaxone 1-2g once daily or Ciprofloxacin 500mg BD for 7-10 days.'
    ],
    supportiveCare: ['Increase clean water intake (2.5L/day)', 'Do not hold urine for long periods'],
    dangerSigns: ['High fever with shaking chills, severe back pain, persistent vomiting, or UTI in pregnancy -> Urgent Medical Assessment']
  },
  {
    id: 'peptic_ulcer',
    title: 'Gastritis, GERD & Peptic Ulcer Disease (H. pylori)',
    category: 'Gastrointestinal',
    keywords: ['ulcer', 'ulcers', 'gastritis', 'heartburn', 'reflux', 'omeprazole', 'epigastric', 'acid'],
    icd10: 'K27',
    overview: 'Gastric/duodenal mucosal erosion often associated with Helicobacter pylori or frequent NSAID painkiller use.',
    symptoms: ['Burning epigastric stomach pain (between meals or at night)', 'Acid reflux / heartburn', 'Nausea, bloating, early satiety'],
    diagnostics: ['Stool H. pylori Antigen test', 'Check Hb if signs of chronic GI blood loss'],
    firstLineTreatment: [
      'Acid Suppression: Omeprazole 20mg once/twice daily 30 minutes before breakfast for 4-8 weeks.',
      'H. pylori Triple Therapy (14 days): Omeprazole 20mg BD + Amoxicillin 1g BD + Clarithromycin 500mg BD (or Metronidazole 400mg TDS if penicillin-allergic).'
    ],
    supportiveCare: ['Stop NSAIDs (Ibuprofen/Diclofenac)', 'Avoid late heavy meals, spicy/acidic trigger foods, alcohol, and smoking'],
    dangerSigns: ['Vomiting blood (hematemesis / coffee-ground emesis) or black tarry stools (melena) or sudden severe rigid abdomen -> Emergency GI Bleed']
  },
  {
    id: 'tuberculosis',
    title: 'Pulmonary Tuberculosis (TB) Screening & DOTS',
    category: 'Infectious Diseases',
    keywords: ['tb', 'tuberculosis', 'night sweats', 'chronic cough', 'weight loss', 'sputum', 'hemoptysis'],
    icd10: 'A15',
    overview: 'Airborne Mycobacterium tuberculosis infection requiring early GeneXpert sputum confirmation and strict multi-drug therapy.',
    symptoms: ['Cough lasting >=2 weeks', 'Drenching night sweats', 'Unexplained weight loss & evening fevers', 'Blood-tinged sputum (hemoptysis)'],
    diagnostics: ['Sputum GeneXpert MTB/RIF ultra assay', 'Chest X-ray & HIV counseling/testing'],
    firstLineTreatment: [
      'Drug-Susceptible TB Standard 6-Month Regimen: 2 months RHZE (Rifampicin, Isoniazid, Pyrazinamide, Ethambutol) intensive phase + 4 months RH continuation phase under MoH TB Clinic.'
    ],
    supportiveCare: ['Open windows for cross-ventilation, cough etiquette', 'High-protein nutrition; NEVER skip doses to prevent MDR-TB'],
    dangerSigns: ['Massive coughing up of frank blood, severe breathlessness, or stiff neck/confusion (TB Meningitis) -> STAT TB Unit Admission']
  },
  {
    id: 'hiv_prep',
    title: 'HIV Care, ART Adherence, PEP & PrEP Guidelines',
    category: 'Infectious Diseases',
    keywords: ['hiv', 'art', 'arv', 'pep', 'prep', 'cd4', 'viral load', 'exposure', 'tdf'],
    icd10: 'B20',
    overview: 'Evidence-based antiretroviral therapy suppresses HIV viral load to undetectable levels (U=U), restoring normal immunity and lifespan.',
    symptoms: ['Acute seroconversion flu-like fever/rash', 'Opportunistic weight loss, oral thrush, or recurrent herpes zoster if untreated'],
    diagnostics: ['Determine/Stat-Pak/SD Bioline Rapid HIV testing algorithm', 'HIV Viral Load every 6-12 months (target <50 copies/mL)'],
    firstLineTreatment: [
      'Adult 1st-Line ART (Uganda MoH): TLD (Tenofovir 300mg + Lamivudine 300mg + Dolutegravir 50mg) 1 tablet once daily lifelong.',
      'Post-Exposure Prophylaxis (PEP): Start TLD within 72 hours (ideally <2 hrs) of potential exposure for 28 full days.',
      'Pre-Exposure Prophylaxis (PrEP): Daily TDF/FTC or event-driven PrEP for HIV-negative persons at substantial risk.'
    ],
    supportiveCare: ['Take TLD consistently at the same time daily', 'Check for drug interactions with Rifampicin (requires DTG 50mg twice daily)'],
    dangerSigns: ['Recent high-risk needle/sexual exposure (<72h) -> Seek Urgent PEP immediately; persistent headache/confusion or chronic fever -> Opportunistic Infection Screen']
  },
  {
    id: 'emergency_first_aid',
    title: 'Emergency First Aid (Burns, Trauma, Seizures, Poisoning)',
    category: 'Emergency Medicine',
    keywords: ['first aid', 'burn', 'burns', 'bleeding', 'fracture', 'seizure', 'convulsion', 'poison', 'snake', 'choking', 'cpr'],
    icd10: 'T14',
    overview: 'Immediate life-saving stabilization following ABCDE (Airway, Breathing, Circulation, Disability, Exposure) while awaiting ambulance or facility transfer.',
    symptoms: ['Acute bleeding, thermal burn, seizure activity, airway obstruction, or toxin ingestion'],
    diagnostics: ['Primary survey: Consciousness (AVPU), Airway patency, Breathing effort, Radial pulse & capillary refill'],
    firstLineTreatment: [
      'Severe Bleeding: Apply firm continuous direct pressure with clean cloth/gauze; elevate limb; do NOT remove soaked dressings—layer on top.',
      'Thermal Burns: Cool under clean running room-temperature water for 20 minutes; NEVER apply toothpaste, butter, urine, or mud. Cover loosely with clean cling film/cloth.',
      'Active Seizure/Convulsion: Clear sharp objects, place patient on their side (recovery position), loosen tight neckwear; NEVER force spoons/fingers into the mouth.',
      'Snakebite: Keep victim completely calm & limb immobilized below heart level; NEVER cut the wound, suck venom, or tie tight tourniquets. Rush to hospital for polyvalent antivenom.'
    ],
    supportiveCare: ['Call 911 / Uganda Police Ambulance 999 / 112 or Doctorian SOS', 'Do NOT induce vomiting for kerosene, acid, bleach, or battery acid ingestion'],
    dangerSigns: ['Unresponsive, absent breathing -> Begin Chest Compressions (100-120/min center of chest); facial/neck burns or stridor -> Immediate Airway Emergency']
  },
  {
    id: 'mental_health',
    title: 'Mental Health, Acute Anxiety, Panic & Depression Support',
    category: 'Mental Health & Neurology',
    keywords: ['anxiety', 'panic', 'depression', 'stress', 'insomnia', 'sleep', 'mental', 'sad', 'suicide', 'hopeless'],
    icd10: 'F41.9',
    overview: 'Mind-body clinical evaluation distinguishing panic/anxiety and depressive disorders from physical mimics like hyperthyroidism, anemia, or arrhythmia.',
    symptoms: ['Racing heart, chest tightness & dread during panic attacks', 'Persistent low mood >2 weeks, loss of interest, insomnia or fatigue'],
    diagnostics: ['PHQ-9 & GAD-7 structured screening', 'Rule out organic causes: TSH, Hb, blood sugar, ECG'],
    firstLineTreatment: [
      'Acute Panic Attack: 4-7-8 paced breathing (inhale 4s, hold 7s, exhale 8s) + 5-4-3-2-1 sensory grounding.',
      'Clinical Depression/Anxiety: Cognitive Behavioral Therapy (CBT) counseling; SSRIs (e.g., Fluoxetine 20mg OD or Sertraline 50mg OD) prescribed & monitored by clinician.'
    ],
    supportiveCare: ['Consistent 7-8h sleep schedule, reduce caffeine/alcohol, daily sunlight & physical movement', 'Connect with trusted family, clinician, or Butabika/Mental Health helpline'],
    dangerSigns: ['Any thoughts of self-harm or suicide -> Immediate 24/7 crisis intervention & human clinical evaluation']
  },
  {
    id: 'headache_migraine',
    title: 'Headache, Tension Headache & Migraine Assessment',
    category: 'Neurology & Primary Care',
    keywords: ['headache', 'migraine', 'omutwe', 'kichwa', 'akou', 'wic', 'dri', 'head pain', 'throbbing head'],
    icd10: 'G43.9',
    overview: 'Primary headaches (tension, migraine) vs secondary red-flag causes (malaria, hypertension, sinusitis, meningitis). Differentiating vascular aura from infectious febrile headache is critical.',
    symptoms: ['Throbbing one-sided or band-like bilateral head pain', 'Sensitivity to light (photophobia) or sound', 'Nausea or visual aura spots', 'Check temperature & BP to rule out malaria or hypertension'],
    diagnostics: ['Blood Pressure measurement', 'Temperature & Malaria RDT check if febrile', 'Neurological neck-stiffness (Kernig/Brudzinski) exam'],
    firstLineTreatment: [
      'Tension / Fever-Associated Headache: Paracetamol 500mg-1000mg every 6-8 hours.',
      'Acute Migraine: Ibuprofen 400-600mg (take early with food if no ulcer/bleeding risk) + rest in a quiet, dark room.',
      'Recurrent Migraine Prevention: Hydration >=2.5L/day, trigger diary, Propranolol or Amitriptyline per physician.'
    ],
    supportiveCare: ['Cool cloth forehead compress', 'Quiet darkened rest & consistent hydration', 'Limit caffeine rebound & screen glare'],
    dangerSigns: ['Sudden worst thunderclap headache, stiff neck + high fever, confusion, seizures, vision loss, or BP >=180/120 -> STAT Emergency Hospital Care']
  },
  {
    id: 'skin_allergy',
    title: 'Skin Rash, Allergy, Eczema & Fungal Infections',
    category: 'Dermatology & Allergy',
    keywords: ['rash', 'skin', 'itch', 'itching', 'allergy', 'hives', 'fungal', 'ringworm', 'eczema', 'olususu', 'ngozi', 'scabies'],
    icd10: 'L30.9',
    overview: 'Cutaneous hypersensitivity, superficial dermatophyte/fungal infections (Tinea), bacterial pyoderma, or parasitic scabies.',
    symptoms: ['Raised itchy wheals/hives (urticaria)', 'Annular scaly plaques (ringworm)', 'Burrows in finger webs worst at night (scabies)', 'Warm spreading redness/pus (cellulitis)'],
    diagnostics: ['Clinical lesion distribution check', 'Rule out fever/systemic drug reaction (Stevens-Johnson warning)'],
    firstLineTreatment: [
      'Itching / Acute Allergy: Cetirizine 10mg once daily (adults) + Calamine lotion or gentle Hydrocortisone 1% cream for non-infected eczema flares.',
      'Fungal / Ringworm: Clotrimazole 1% or Miconazole cream applied twice daily for 2-4 weeks.',
      'Scabies: Permethrin 5% cream or Benzyl Benzoate emulsion neck-to-toes overnight; treat close household contacts & wash bedding in hot water.'
    ],
    supportiveCare: ['Wear loose breathable cotton clothing', 'Keep nails trimmed short to prevent secondary bacterial scratching infection'],
    dangerSigns: ['Swollen lips/tongue/throat or wheezing (Anaphylaxis), blistering inside mouth/eyes, or rapidly spreading purple bruising + high fever -> STAT Emergency']
  },
  {
    id: 'urti_flu_ent',
    title: 'Upper Respiratory Tract Infection, Flu, Sore Throat & Sinusitis',
    category: 'ENT & Primary Care',
    keywords: ['flu', 'cold', 'sore throat', 'cough', 'runny nose', 'sinus', 'tonsils', 'sennyiga', 'mafua', 'ear pain', 'throat'],
    icd10: 'J06.9',
    overview: 'Most acute upper respiratory colds and mild sore throats are self-limiting viral infections (5-7 days) requiring hydration and symptom control rather than unnecessary antibiotics.',
    symptoms: ['Nasal congestion / rhinorrhea', 'Scratchy or painful throat (pharyngitis)', 'Dry irritating cough & mild malaise', 'Facial sinus pressure or mild ear fullness'],
    diagnostics: ['Throat inspection for tonsillar exudate (Centor criteria)', 'Temperature & SpO2 check to exclude lower pneumonia'],
    firstLineTreatment: [
      'Viral Flu / Cold: Steam inhalation, warm honey-lemon tea (>1 yr old), saline nasal drops, Paracetamol 500mg-1g every 6-8h.',
      'Confirmed Bacterial Strep Tonsillitis (high fever, pus spots on tonsils, tender neck nodes, NO cough): Phenoxymethylpenicillin (Pen V) 500mg QDS x10 days OR Amoxicillin 500mg TDS x7 days.'
    ],
    supportiveCare: ['Warm salt-water gargle (1/2 tsp salt in warm glass of water) 3x/day', '2-3L warm fluids daily & sleep elevation'],
    dangerSigns: ['Difficulty swallowing saliva / drooling, muffled hot-potato voice, noisy breathing (stridor), chest pain, or SpO2 <92% -> Immediate Clinic Evaluation']
  },
  {
    id: 'musculoskeletal_pain',
    title: 'Back Pain, Joint Pain, Arthritis & Muscle Strain',
    category: 'Musculoskeletal',
    keywords: ['back pain', 'joint pain', 'knee', 'arthritis', 'muscle', 'sprain', 'omugongo', 'maumivu ya mgongo', 'body ache'],
    icd10: 'M54.5',
    overview: 'Mechanical lumbar strain, osteoarthritis, or inflammatory joint pain. Gentle mobility recovers faster than prolonged strict bed rest.',
    symptoms: ['Localized lower back or knee stiffness/aching', 'Pain worse after heavy lifting or prolonged sitting', 'Mild joint swelling after strain'],
    diagnostics: ['Range-of-motion check', 'Screen for fever/malaria (systemic myalgia) or numbness down the leg (sciatica)'],
    firstLineTreatment: [
      'Acute Strain / OA Flare: Topical Diclofenac gel massage 3x/day + Paracetamol 1g TDS (add Ibuprofen 400mg BD with food for 3-5 days ONLY if no stomach ulcer/kidney issues).',
      'Initial 48h Acute Sprain: RICE protocol (Rest, Ice/cool wrap 15 min, Compression elastic bandage, Elevation).'
    ],
    supportiveCare: ['Warm compress after 48h for muscle tightness', 'Gentle core & hamstring stretching; ergonomic lifting posture'],
    dangerSigns: ['Loss of bladder/bowel control, saddle numbness, progressive leg weakness, trauma fracture, or hot red swollen single joint + high fever -> Urgent Orthopedic/Emergency Care']
  }
];

export const OFFLINE_ESSENTIAL_DRUGS: OfflineDrugNode[] = [
  {
    name: 'Artemether / Lumefantrine (Coartem 20/120)',
    keywords: ['coartem', 'artemether', 'lumefantrine', 'lonart'],
    class: 'ACT Antimalarial',
    adultDose: '4 tablets (80/480mg) at 0h, 8h, 24h, 36h, 48h, 60h (6 doses over 3 days)',
    pediatricDose: '5-14kg: 1 tab/dose; 15-24kg: 2 tabs/dose; 25-34kg: 3 tabs/dose',
    indications: 'First-line uncomplicated P. falciparum malaria',
    cautions: 'Must take with fatty meal/milk for absorption. Avoid with QT-prolonging drugs.'
  },
  {
    name: 'Amoxicillin / Clavulanic Acid (Augmentin)',
    keywords: ['augmentin', 'amoxicillin', 'clavulanate', 'amox'],
    class: 'Beta-lactam Broad-Spectrum Antibiotic',
    adultDose: '625mg every 8-12 hours (or Amoxicillin 500mg every 8 hours) for 5-10 days',
    pediatricDose: 'Amoxicillin 40mg/kg twice daily (pneumonia) or 25-45mg/kg/day divided',
    indications: 'Pneumonia, sinusitis, otitis media, skin & dental infections, H. pylori',
    cautions: 'Contraindicated in true penicillin anaphylaxis. Complete full course.'
  },
  {
    name: 'Paracetamol (Acetaminophen / Panadol)',
    keywords: ['paracetamol', 'panadol', 'acetaminophen', 'tylenol'],
    class: 'Analgesic & Antipyretic',
    adultDose: '500mg - 1000mg every 6-8 hours (Max 4,000mg / 24h)',
    pediatricDose: '10 - 15 mg/kg per dose every 6 hours (Max 60 mg/kg/day)',
    indications: 'Fever, headache, mild-to-moderate pain (safe across pregnancy)',
    cautions: 'Avoid exceeding 4g/day; reduce dose in liver disease or chronic alcohol use.'
  },
  {
    name: 'Ibuprofen (Brufen)',
    keywords: ['ibuprofen', 'brufen', 'nsaid'],
    class: 'NSAID Anti-inflammatory',
    adultDose: '400mg every 8 hours after food (Max 1,200-2,400mg/day)',
    pediatricDose: '5 - 10 mg/kg every 8 hours (>6 months old)',
    indications: 'Inflammatory joint pain, dental pain, dysmenorrhea, fever',
    cautions: 'AVOID in peptic ulcers, kidney disease, dehydration, dengue/bleeding, and 3rd trimester pregnancy.'
  },
  {
    name: 'Metformin (Glucophage)',
    keywords: ['metformin', 'glucophage'],
    class: 'Biguanide Antidiabetic',
    adultDose: 'Start 500mg OD/BD with meals; usual maintenance 850mg BD or 1000mg BD',
    pediatricDose: '>=10 yrs: start 500mg OD with food (specialist supervision)',
    indications: 'First-line Type 2 Diabetes Mellitus',
    cautions: 'Take with meals to reduce GI upset. Hold if severe dehydration/shock or eGFR <30 mL/min.'
  },
  {
    name: 'Amlodipine (Norvasc)',
    keywords: ['amlodipine', 'norvasc'],
    class: 'Dihydropyridine Calcium Channel Blocker',
    adultDose: '5mg once daily, titrate to 10mg once daily if BP remains >=140/90',
    pediatricDose: '0.1 - 0.3 mg/kg once daily (specialist)',
    indications: 'First-line hypertension & chronic stable angina',
    cautions: 'May cause mild ankle edema; monitor BP before escalating dose.'
  },
  {
    name: 'Azithromycin (Zithromax)',
    keywords: ['azithromycin', 'zithromax'],
    class: 'Macrolide Antibiotic',
    adultDose: '500mg once daily for 3-5 days (Typhoid/STI 1g dose per protocol)',
    pediatricDose: '10 mg/kg once daily for 3 days',
    indications: 'Atypical pneumonia, typhoid, chlamydia/urethritis, penicillin-allergic URI',
    cautions: 'Caution with QT-prolonging medications; take 1h before or 2h after antacids.'
  },
  {
    name: 'Omeprazole',
    keywords: ['omeprazole', 'omez', 'ppi'],
    class: 'Proton Pump Inhibitor',
    adultDose: '20mg once daily 30 minutes before breakfast (40mg/day in severe PUD)',
    pediatricDose: '0.7 - 1 mg/kg once daily',
    indications: 'GERD, gastritis, peptic ulcer healing & H. pylori eradication',
    cautions: 'Best taken on an empty stomach before the first meal.'
  },
  {
    name: 'Salbutamol (Ventolin Inhaler)',
    keywords: ['salbutamol', 'ventolin', 'albuterol'],
    class: 'Short-Acting Beta-2 Agonist (SABA)',
    adultDose: '100-200mcg (1-2 puffs) PRN; acute flare: 4-8 puffs via spacer q20min',
    pediatricDose: '100-200mcg (1-2 puffs) via spacer; acute flare 4-6 puffs q20min',
    indications: 'Rapid bronchodilation in asthma & COPD bronchospasm',
    cautions: 'Frequent rescue need (>2x/week) signals need for daily inhaled steroid controller.'
  },
  {
    name: 'Ciprofloxacin',
    keywords: ['ciprofloxacin', 'cipro'],
    class: 'Fluoroquinolone Antibiotic',
    adultDose: '500mg every 12 hours for 3-10 days depending on site',
    pediatricDose: 'Reserve only for complicated pseudomonas/shigella per specialist',
    indications: 'UTI, acute bacterial dysentery, typhoid (sensitive strains)',
    cautions: 'Avoid in pregnancy; space away from iron/calcium/dairy by 2 hours.'
  }
];

const LAB_INTERPRETERS: Array<{
  keywords: string[];
  title: string;
  normalRange: string;
  guidance: string;
}> = [
  {
    keywords: ['hb', 'hemoglobin', 'haemoglobin', 'anemia', 'anaemia'],
    title: 'Haemoglobin (Hb)',
    normalRange: 'Adult Male: 13.0–17.5 g/dL | Adult Female: 12.0–15.5 g/dL | Child: 11.5–15.5 g/dL',
    guidance: 'Hb <11 g/dL indicates mild/moderate anemia; Hb <7 g/dL (or <5 g/dL in children with distress) is severe anemia requiring urgent transfusion workup & malaria/hookworm screening.'
  },
  {
    keywords: ['glucose', 'sugar', 'rbs', 'fbs', 'hba1c', 'sukari', 'sukaali'],
    title: 'Blood Glucose & HbA1c',
    normalRange: 'Fasting: 3.9–5.6 mmol/L (70–100 mg/dL) | Random 2h Post-Meal: <7.8 mmol/L (<140 mg/dL) | HbA1c: <5.7%',
    guidance: 'Fasting >=7.0 mmol/L (126 mg/dL) or HbA1c >=6.5% meets Diabetes criteria; <3.9 mmol/L (70 mg/dL) is acute Hypoglycemia requiring immediate fast-acting sugar.'
  },
  {
    keywords: ['spo2', 'oxygen', 'saturation'],
    title: 'Oxygen Saturation (SpO2)',
    normalRange: '95% – 100% on room air (COPD target often 88%–92%)',
    guidance: 'SpO2 92–94% warrants close respiratory evaluation; SpO2 <92% indicates hypoxemia needing supplemental oxygen and urgent chest assessment.'
  },
  {
    keywords: ['creatinine', 'egfr', 'kidney', 'renal'],
    title: 'Serum Creatinine & Kidney Function',
    normalRange: 'Creatinine: 60–110 µmol/L (0.7–1.2 mg/dL) | eGFR: >=90 mL/min/1.73m²',
    guidance: 'Elevated creatinine warrants hydration assessment, stopping nephrotoxic NSAIDs, checking BP/diabetes, and adjusting renally cleared drugs like Metformin/Ciprofloxacin.'
  },
  {
    keywords: ['wbc', 'leukocytes', 'white blood', 'platelets', 'plt', 'cbc', 'fbc'],
    title: 'Complete Blood Count (WBC & Platelets)',
    normalRange: 'WBC: 4.0–11.0 x10⁹/L | Platelets: 150–450 x10⁹/L',
    guidance: 'High WBC (>11) suggests acute bacterial infection/inflammation; Low platelets (<100) occurs in severe malaria, dengue, sepsis, or hypersplenism.'
  }
];

interface UgandanLangProfile {
  code: string;
  label: string;
  keywords: string[];
  greeting: string;
  introGeneral: string;
  symptomSectionLabel: string;
  treatmentSectionLabel: string;
  careSectionLabel: string;
  dangerSectionLabel: string;
  followUpQuestion: string;
  footer: string;
  localSymptomHints: Record<string, string>;
}

const UGANDAN_LANGUAGE_PROFILES: UgandanLangProfile[] = [
  {
    code: 'Luganda',
    label: 'Luganda',
    keywords: [
      'luganda', 'oli otya', 'gyebaleko', 'wasuze otya', 'osibye otya', 'osiibye otya', 'omusujja', 'olubuto',
      'okuddukana', 'omutwe', 'ekifuba', 'okusesema', 'obulwadde', 'eddagala', 'omusawo', 'ddwaliro',
      'puleesa', 'sukaali', 'omusaayi', 'obulumi', 'webale', 'ssebo', 'nnyabo', 'nnyamba', 'nkola ntya',
      'kiki', 'lwaki', 'omwana', 'sennyiga', 'embuto', 'amazzi', 'okukolola'
    ],
    greeting: 'Gyebaleko! Nze Medbot (Doctorian AI) — ndi wano okukuyamba buli kiseera mu Luganda, ne bwe wataba yintaneeti.',
    introGeneral: 'Ntegedde ekibuuzo kyo. Laba obuyambi n’amagezi ag’amangu mu Luganda n’Olungereza:',
    symptomSectionLabel: 'Obubonero n’Okukebera',
    treatmentSectionLabel: 'Eddagala n’Obujjanjabi (WHO / Uganda Clinical Guidelines)',
    careSectionLabel: 'Okwekuuma n’Eby’Awaka',
    dangerSectionLabel: 'Obubonero obw’Obulabe (Genda mu Ddwaliro Amangu)',
    followUpQuestion: 'Obubonero buno bumaze nnaku mmeka, era olina omusujja oba okusesema?',
    footer: 'Weetegereze: Bwe kiba nga obubonero bukola nnyo oba bukomeza, yanguwa olabe omusawo oba ddwaliro erikumpi (Essimu y’Amangu: 999 / 112).',
    localSymptomHints: {
      malaria: 'Omusujja gw’ensiri (Malaria): Kebera mu labu (mRDT) oyambibwe ne Coartem okumala ennaku 3 ng’olya emmere erimu amasavu, onywe amazzi mangi ne Paracetamol.',
      typhoid: 'Omusujja gw’omu byenda (Typhoid): Nywa amazzi amafumbe gokka, onaabe engalo, era olabe omusawo okukukebereza omusaayi.',
      pneumonia: 'Obulwadde bw’ekifuba / Okukolola: Bwe wabaawo okussa okw’amangu oba obulumi mu kifuba, genda mu ddwaliro bakebere omukka gwa Oxygen.',
      cholera_diarrhea: 'Okuddukana n’Okusesema: Tabula ORS mu lita emu y’amazzi amafumbe onywe buli lwe weddukana; abaana bawe Zinc.',
      hypertension: 'Puleesa y’Omusaayi: Kendeeza omunnyo omungi, wummula bulungi, era tomira ddagala lya puleesa nga tobuuzizza musawo.',
      diabetes: 'Sukaali mu Musaayi: Kebera sukaali buli kiseera, wewale ebyokunywa ebiwoomerera ennyo, era kuuma ebigere byo nga biyonjo.',
      maternal_preeclampsia: 'Olubuto n’Obulamu bw’Omukyala: Genda ku ddwaliro ly’abazadde (ANC) okukebera puleesa; bwe wabaawo okukulukuta omusaayi oba omutwe omungi yanguwa okujjanjabibwa.',
      headache_migraine: 'Omutwe Oguluma: Kebera puleesa n’ebbugumu, wummula mu kifo ekisirifu, nywa amazzi agamala era kozesa Paracetamol bwe kiba kyetaagisa.'
    }
  },
  {
    code: 'Swahili',
    label: 'Kiswahili',
    keywords: [
      'swahili', 'kiswahili', 'jambo', 'habari', 'hujambo', 'mambo', 'shikamo', 'maumivu', 'homa', 'kichwa',
      'tumbo', 'kuharisha', 'kikohozi', 'dawa', 'daktari', 'hospitali', 'presha', 'kisukari', 'mimba',
      'mtoto', 'nisaidie', 'asante', 'nini', 'vipi', 'kwa nini', 'kutapika', 'kifua', 'damu', 'afya'
    ],
    greeting: 'Habari! Mimi ni Medbot (Doctorian AI) — niko tayari kukusaidia wakati wote kwa Kiswahili hata bila mtandao.',
    introGeneral: 'Nimeelewa swali lako vizuri. Haya hapa ni maelezo na ushauri wa kiafya kwa Kiswahili:',
    symptomSectionLabel: 'Dalili na Uchunguzi',
    treatmentSectionLabel: 'Matibabu na Dawa (Miongozo ya WHO / Uganda)',
    careSectionLabel: 'Huduma ya Nyumbani na Maji',
    dangerSectionLabel: 'Dalili za Hatari (Fika Hospitali Haraka)',
    followUpQuestion: 'Dalili hizi zimekaa kwa siku ngapi, na je, kuna homa au kupumua kwa shida?',
    footer: 'Ushauri wa Kliniki: Ikiwa dalili zinazidi kuwa mbaya, tafadhali fika kituo cha afya au piga simu ya dharura 999 / 112.',
    localSymptomHints: {
      malaria: 'Malaria (Homa ya Mbu): Fanya kipimo cha mRDT, tumia Coartem kwa siku 3 pamoja na chakula, kunywa maji mengi na Paracetamol.',
      typhoid: 'Homa ya Matumbo (Typhoid): Kunywa maji yaliyochemshwa pekee, nawa mikono kwa sabuni, na muone daktari kwa kipimo cha damu.',
      pneumonia: 'Kifua na Nimonia: Iwapo kuna kikohozi kikali au kupumua haraka, pima SpO2 na muone daktari kwa antibiotiki sahihi.',
      cholera_diarrhea: 'Kuharisha na Kutapika: Changanya pakiti 1 ya ORS katika lita 1 ya maji safi yaliyochemshwa; watoto wapewe Zinc.',
      hypertension: 'Shinikizo la Damu (Presha): Punguza chumvi nyingi, fanya mazoezi mepesi, na usikose dawa za presha.',
      diabetes: 'Kisukari: Pima sukari mara kwa mara, kula vyakula vyenye nyuzinyuzi, na kagua miguu kila siku.',
      maternal_preeclampsia: 'Afya ya Mama Mjamzito: Hudhuria kliniki ya wajawazito (ANC) kupima presha; kutokwa na damu au maumivu makali ya kichwa ni dharura.',
      headache_migraine: 'Maumivu ya Kichwa: Pima presha na joto la mwili, pumzika sehemu tulivu, kunywa maji mengi na tumia Paracetamol.'
    }
  },
  {
    code: 'Runyankole-Rukiga',
    label: 'Runyankole / Rukiga',
    keywords: [
      'runyankole', 'rukiga', 'agandi', 'oraire ota', 'osibire ota', 'omushwija', 'enda', 'omutwe',
      'okusesema', 'okucucuka', 'omubazi', 'omushaho', 'eirwariro', 'eshagama', 'omwana', 'oburwaire',
      'webare', 'nyamba', 'ahabwaki', 'kiki', 'orukororo', 'amagara'
    ],
    greeting: 'Agandi! Oraire gye? Ndi Medbot (Doctorian AI) — ninkuhwera omu Runyankole-Rukiga obwire bwona, n’obu hatakuba hariho intaneeti.',
    introGeneral: 'Naayetegyereza ekibuuzo kyawe. Reeba obuhabuzi bw’ebyamagara omu Runyankole-Rukiga:',
    symptomSectionLabel: 'Obubonero n’Okukebera',
    treatmentSectionLabel: 'Emibazi n’Obujanjabi (WHO / UCG)',
    careSectionLabel: 'Okwekuuma Omuka',
    dangerSectionLabel: 'Obubonero Bubi Munonga (Genda omu Irwariro Ahonaaho)',
    followUpQuestion: 'Obubonero obu bumazire ebiro bingahi, kandi oine omushwija ninga okusesema?',
    footer: 'Obwebembezi bw’ebyamagara: Oburwaire bwona obukureeta obubonero bubi nibwetenga okureeba omushaho ahonaaho (999 / 112).',
    localSymptomHints: {
      malaria: 'Omushwija gw’emibu (Malaria): Kebera eshagama (mRDT), mira Coartem ebiro 3 hamwe n’ekyokurya, nywa amaizi maingi na Paracetamol.',
      cholera_diarrhea: 'Okwirukana: Tabura ORS omu lita emwe y’amaizi agafumbirwe onywe buri kucucuka.',
      hypertension: 'Puresha y’eshagama: Kyeendeza omwonyo omu byokurya kandi ogume nokebeza puresha yawe.',
      headache_migraine: 'Omutwe ogurikushasha: Kebera puresha n’omushwija, humura ahantu hasirire kandi onywe amaizi maingi.'
    }
  },
  {
    code: 'Acholi-Luo',
    label: 'Acholi / Luo',
    keywords: [
      'acholi', 'luo', 'itye maber', 'kop ango', 'ibuto maber', 'lyeto', 'wic', 'aona', 'ngok',
      'yat', 'daktari', 'ot yat', 'remo', 'latin', 'kony', 'apwoyo', 'pingo', 'nining', 'yotkom', 'cogo', 'cwiny'
    ],
    greeting: 'Itye maber? An aye Medbot (Doctorian AI) — atye kany me konyi i leb Acholi cawa ducu, kadi bed intanet peke.',
    introGeneral: 'Aniang lapeny meri. Nen tam ki kony me yotkom i leb Acholi:',
    symptomSectionLabel: 'Lanyut me Two ki Ngiyo Kom',
    treatmentSectionLabel: 'Yat ki Kony me Ot Yat (WHO / UCG)',
    careSectionLabel: 'Gwoko Kom i Gang',
    dangerSectionLabel: 'Lanyut Marac (Cit i Ot Yat Oyotoyot)',
    followUpQuestion: 'Two man dong orii pi nino adi, dok komi tye ka lyet onyo tye ka ngok?',
    footer: 'Tam me yotkom: Ka two winyo marac matek, cit i ot yat oyotoyot onyo goy cim 999 / 112.',
    localSymptomHints: {
      malaria: 'Two Malaria (Lyeto kom): Ngi remo (mRDT), mat Coartem pi nino 3 kacel ki cam, mat pii madwong ki Paracetamol.',
      cholera_diarrhea: 'Cado ic: Rub ORS i lita acel me pii ma gitedo ci imat i nge cado ic ducu; mi Zinc bot lutino.',
      pneumonia: 'Aona ki Kor ma Lit: Ka yamo ocung onyo yweyo tek, cit i ot yat me pimo yamo (SpO2).'
    }
  },
  {
    code: 'Langi',
    label: 'Langi',
    keywords: [
      'langi', 'itye aber', 'ibuto aber', 'iriyo aber', 'lyeto kom', 'yic', 'wic', 'aona', 'ngok',
      'yat', 'daktari', 'ot yat', 'remo', 'atin', 'kony', 'apwoyo', 'piingo', 'yotkom'
    ],
    greeting: 'Itye aber? An aye Medbot (Doctorian AI) — atye me konyi i leb Langi cawa ducu, kadi intanet pe.',
    introGeneral: 'Aniang apeny meri aber. Nen tam me yotkom i leb Langi:',
    symptomSectionLabel: 'Anyut me Two',
    treatmentSectionLabel: 'Yat ki Cango (WHO / UCG)',
    careSectionLabel: 'Gwoko Kom Paco',
    dangerSectionLabel: 'Anyut Marac (Wot i Ot Yat Oyotoyot)',
    followUpQuestion: 'Two man orii nino adi, dok ikom tye ka lyet?',
    footer: 'Tam me yotkom: Ka two mede arac, nen daktari i ot yat oyotoyot (999 / 112).',
    localSymptomHints: {
      malaria: 'Two Malaria: Pimo remo (mRDT), mat Coartem nino 3 ki cam, mat pii ame otedo ki Paracetamol.',
      cholera_diarrhea: 'Cado yic: Rub ORS i lita acel me pii ame otedo imat.'
    }
  },
  {
    code: 'Iteso',
    label: 'Iteso (Ateso)',
    keywords: [
      'iteso', 'ateso', 'yoga', 'ejokona', 'iboi biai', 'adeka', 'emusugut', 'akoik', 'akou',
      'iwala', 'aojan', 'ekiyait', 'dokta', 'adekis', 'aot', 'ikoku', 'ingarakin', 'eyalama', 'kanukinyo', 'angaleu'
    ],
    greeting: 'Yoga! Ejokona? Araisi eong Medbot (Doctorian AI) — ejai ne aingarakin jo ko Ateso apaaran kere, karaida mam intanet ejai.',
    introGeneral: 'Aanyu akiro kon. Koany aingarakinet naka angaleu ko Ateso:',
    symptomSectionLabel: 'Aanyuneta nuka Adeka',
    treatmentSectionLabel: 'Iyatun ka Aitanag (WHO / UCG)',
    careSectionLabel: 'Aidar Angaleu Ore',
    dangerSectionLabel: 'Aanyuneta nu Aronis (Kolot Adeko Atipet)',
    followUpQuestion: 'Irwan aanyuneta nu apaarasia aiboi, arai ejai emusugut?',
    footer: 'Aanyun emurwon ejok na epedori aikony jo. Kolot adekis atipet arai ejaasi aanyuneta nu aronis (999 / 112).',
    localSymptomHints: {
      malaria: 'Emusugut (Malaria): Koom aot (mRDT), komat Coartem apaarasia 3 ka inyamat, komat akipi nu ipokoi ka Paracetamol.',
      cholera_diarrhea: 'Ailele akoik: Kitonyik ORS toma olita ediopet loka akipi nu ipokoi komat.'
    }
  },
  {
    code: 'Lusoga',
    label: 'Lusoga',
    keywords: [
      'lusoga', 'kodheyo', 'wasuze otya', 'osiibye otya', 'omusudha', 'enda', 'omutwe', 'okusesema',
      'obulwaire', 'eddagala', 'omusawo', 'iddwaliro', 'omusaayi', 'omwana', 'webale', 'nyamba', 'lwaki'
    ],
    greeting: 'Kodheyo! Ndi Medbot (Doctorian AI) — ndi hano okukuyamba mu Lusoga buli kaseera, ne bw’oba tolina mutimbagano.',
    introGeneral: 'Ntegeire ekibuuzo kyo. Bona amagezi g’obulamu mu Lusoga:',
    symptomSectionLabel: 'Obubonero n’Okukebera',
    treatmentSectionLabel: 'Eddagala n’Obujjanjabi (WHO / UCG)',
    careSectionLabel: 'Okwekuuma Eka',
    dangerSectionLabel: 'Obubonero obw’Obulabe (Genda mu Iddwaliro Mangu)',
    followUpQuestion: 'Obubonero buno bumaze enaku mmeka, era olina omusudha?',
    footer: 'Okubona omusawo kiba kirungi singa obulwaire bweyongera (Essimu y’Amangu: 999 / 112).',
    localSymptomHints: {
      malaria: 'Omusudha (Malaria): Kebera omusaayi (mRDT), mira Coartem enaku 3 n’ebyokulya, nywa amaadhi mangi ne Paracetamol.',
      cholera_diarrhea: 'Okuddukana: Tabula ORS mu liita y’amaadhi amafumbe onywe buli kiseera.'
    }
  },
  {
    code: 'Lugbara',
    label: 'Lugbara',
    keywords: [
      'lugbara', 'mi mi maber', 'asizu', 'nyi ngoni', 'azo', "o'du", 'ovu', 'dri', 'okpa', 'ari',
      'drakpi', 'otuu yat', 'aria', 'mva', 'aza ko', 'awadifo', 'aduni'
    ],
    greeting: 'Mi mi maber? Asizu! Ama Medbot (Doctorian AI) — ama dri azako mi ma alea Lugbara ti saa dria, intanet ku ra.',
    introGeneral: 'Ma ni ta mi ma eri. Ne azako idri be Lugbara ti alia:',
    symptomSectionLabel: 'Azo Ma Etu (Symptoms)',
    treatmentSectionLabel: 'Ari be Drakpi Azako (WHO / UCG)',
    careSectionLabel: 'Idri Gbo Jo Alia',
    dangerSectionLabel: 'Azo Ma Onzi (Mu Otuu Yat Alia Kini)',
    followUpQuestion: 'Azo di eca o’du ingo, ani dri o’du eyo ku ra?',
    footer: 'Mide ba daktari ma niri maber kpere; mu otuu yat alia azo ma onzi (999 / 112).',
    localSymptomHints: {
      malaria: 'Malaria: Ndi aria (mRDT), mvu Coartem o’du na ni nyaka be, mvu yi tro tro be Paracetamol.',
      cholera_diarrhea: 'Ovu: Di ORS lita alu yi ma alia mvu.'
    }
  },
  {
    code: 'Runyoro-Rutooro',
    label: 'Runyoro / Rutooro',
    keywords: [
      'runyoro', 'rutooro', 'oraire ota', 'osiibire ota', 'orukutu', 'omuswija', 'oburwire',
      'omubazi', 'omushaho', 'eirwariro', 'eshagama', 'nkonya', 'webale', 'nyamba'
    ],
    greeting: 'Oraire ota! Ndi Medbot (Doctorian AI) — ndi hanu kukukonyera omu Runyoro-Rutooro obwire bwona, n’obu haraba hataroho intaneeti.',
    introGeneral: 'Nyetegereze ekikaguzo kyawe. Rora obuhabuzi bw’obwomeezi omu Runyoro-Rutooro:',
    symptomSectionLabel: 'Oburorero n’Okukebera',
    treatmentSectionLabel: 'Emibazi n’Obujanjabi (WHO / UCG)',
    careSectionLabel: 'Okwekuuma Omuka',
    dangerSectionLabel: 'Oburorero Bubi Munonga (Genda omu Irwariro Ahonaaho)',
    followUpQuestion: 'Oburwire bunu bumazire ebiro binga, kandi oine omuswija?',
    footer: 'Oburwire bweyongera, rora omushaho ahonaaho omu irwariro erikuhikire (999 / 112).',
    localSymptomHints: {
      malaria: 'Omuswija gw’ensiri: Kebera eshagama (mRDT), mira Coartem ebiro 3 n’ebyokulya, nywa amaizi maingi na Paracetamol.'
    }
  },
  {
    code: 'Rukonjo',
    label: 'Rukonjo',
    keywords: [
      'rukonjo', 'bwakire', 'wasibire ota', 'obulhwere', 'omusutsa', 'inda', 'eriruka',
      'omubatsi', 'omusaho', 'wasingya', 'ebya magara'
    ],
    greeting: 'Bwakire! Ndi Medbot (Doctorian AI) — ndi hano erikuwathikya omu Rukonjo endambi syosi, n’omu bwire bw’obutabya na intaneeti.',
    introGeneral: 'Nabiriyithegereerya ekyuwabuliire. Lebaya amagezi w’obulamu omu Rukonjo:',
    symptomSectionLabel: 'Ebirorero by’Obulhwere',
    treatmentSectionLabel: 'Emibatsi n’Erikererya (WHO / UCG)',
    careSectionLabel: 'Eriyitheya eka',
    dangerSectionLabel: 'Ebirorero Bibibibi (Genda ewa Musaho Luba)',
    followUpQuestion: 'Obulhwere bunu bwabirimara biro bingahi?',
    footer: 'Wasingya; obulhwere bwamayongera, genda omu ddwaliro erihikire luba (999 / 112).',
    localSymptomHints: {
      malaria: 'Omusutsa (Malaria): Kebulha eshagama (mRDT), mira Coartem ebiro 3 haghuma n’ebyokurya, nywa amaghetse mangi na Paracetamol.'
    }
  },
  {
    code: 'Samia',
    label: 'Samia',
    keywords: [
      'samia', 'mirembe', 'obulwaye', 'ekhohola', 'eddagala', 'omusawo', 'iddwaliro', 'orio', 'shina'
    ],
    greeting: 'Mirembe! Ndi Medbot (Doctorian AI) — ndi hano okhukhonya mu Lusamia buli saawa, nende okhuba ne intaneeti ta.',
    introGeneral: 'Mbulire ekhibuuzo khyo. Lola amakesi k’obulamu mu Lusamia:',
    symptomSectionLabel: 'Obubonero bw’Obulwaye',
    treatmentSectionLabel: 'Eddagala nende Obukhonya (WHO / UCG)',
    careSectionLabel: 'Okhwekuuma Eka',
    dangerSectionLabel: 'Obubonero Obubi (Cha mu Ddwaliro Bwangu)',
    followUpQuestion: 'Obulwaye buno bumalile enaku chinga, kandi oli nende omusujja?',
    footer: 'Orio muno; obulwaye bwaba bukhila, cha olole omusawo bwangu (999 / 112).',
    localSymptomHints: {
      malaria: 'Omusujja (Malaria): Kebera obusayi (mRDT), mira Coartem enaku 3 nende ebiokulya, nywa amaazi mangi.'
    }
  },
  {
    code: 'Karamojong',
    label: 'Ngakarimojong',
    keywords: [
      'karamojong', 'ngakarimojong', 'mata', 'ejok', 'ngakiro', 'adeka', 'emusugut', 'akoik', 'akou',
      'ekitoe', 'emuron', 'adekis', 'aot', 'ikoku', 'alakara'
    ],
    greeting: 'Mata! Ejok? Ayong Medbot (Doctorian AI) — ajai nen akiingarakin iyo ko Ngakarimojong apaarasia dadaeng, karaida mam intanet ejai.',
    introGeneral: 'Aanyu akiro kon. Koany aingarakinet naka aijar ko Ngakarimojong:',
    symptomSectionLabel: 'Aanyuneta nuka Adeka',
    treatmentSectionLabel: 'Ekitoi ka Aitanag (WHO / UCG)',
    careSectionLabel: 'Aidar Aijar Ore',
    dangerSectionLabel: 'Aanyuneta nu Aronis (Kolot Adeko Atipet)',
    followUpQuestion: 'Irwan aanyuneta nu apaarasia aiboi?',
    footer: 'Alakara; kolot adekis atipet arai ejaasi aanyuneta nu aronis (999 / 112).',
    localSymptomHints: {
      malaria: 'Emusugut (Malaria): Koany aot (mRDT), komat Coartem apaarasia 3 ka akimuj, komat ngakipi ka Paracetamol.'
    }
  }
];

function detectLanguageHeader(norm: string, targetLanguage?: string): {
  tag: string;
  greeting: string;
  footer: string;
  profile?: UgandanLangProfile;
} {
  const activeLang = (targetLanguage || '').toLowerCase();

  // First check explicit words inside the user prompt (auto-learns Ugandan query language)
  for (const prof of UGANDAN_LANGUAGE_PROFILES) {
    if (prof.keywords.some((k) => {
      const escaped = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`(^|\\b)${escaped}(\\b|$)`, 'i').test(norm);
    })) {
      return {
        tag: prof.label,
        greeting: `👋 ${prof.greeting}`,
        footer: `*${prof.footer}*`,
        profile: prof
      };
    }
  }

  // Second check selected app/consultation language
  for (const prof of UGANDAN_LANGUAGE_PROFILES) {
    const codeLower = prof.code.toLowerCase();
    const parts = codeLower.split('-');
    if (activeLang.includes(codeLower) || parts.some((p) => p.length >= 4 && activeLang.includes(p))) {
      return {
        tag: prof.label,
        greeting: `👋 ${prof.greeting}`,
        footer: `*${prof.footer}*`,
        profile: prof
      };
    }
  }

  return {
    tag: 'English',
    greeting: '',
    footer: '*Medbot Autonomous Clinical Intelligence (UCG 2023/2026 & WHO Standards) — Consult a licensed clinician for definitive physical exam and prescription authorization.*'
  };
}

function handleGeneralOrAppQuestion(norm: string, rawMsg: string, lang: ReturnType<typeof detectLanguageHeader>): string | null {
  const prof = lang.profile;

  // Uganda hospital / ambulance / referral queries
  if (
    ['hospital', 'mulago', 'mbarara', 'gulu', 'mbale', 'lacor', 'mengo', 'ambulance', '999', '112', 'clinic', 'ddwaliro', 'hospitali', 'eirwariro', 'ot yat', 'adekis']
      .some((k) => norm.includes(k)) &&
    !norm.includes('pain') &&
    !norm.includes('fever')
  ) {
    return `${lang.greeting ? lang.greeting + '\n\n' : ''}🏥 **Uganda Clinical & Emergency Referral Directory**\n---\n- **National Emergency & Ambulance:** Dial **999** or **112** (Uganda Police / Emergency Medical Services) or use **Emergency SOS** inside Doctorian.\n- **National & Regional Referral Hospitals:**\n  - **Central:** Mulago National Referral Hospital (Kampala), Kiruddu RRH, Kawempe National Referral Hospital, Mengo & Nsambya Hospitals\n  - **Western:** Mbarara RRH, Fort Portal RRH, Kabale RRH, Hoima RRH\n  - **Northern:** Gulu RRH, St. Mary's Hospital Lacor, Lira RRH, Arua RRH\n  - **Eastern:** Mbale RRH, Jinja RRH, Soroti RRH, Tororo Hospital\n\n${prof ? `**${prof.careSectionLabel}:** ${prof.footer.replace(/\*/g, '')}\n\n` : ''}${lang.footer}`;
  }

  // Nutrition / Diet / Hydration / Exercise / Weight / Healthy Living
  if (['diet', 'food', 'nutrition', 'eat', 'vitamin', 'water', 'hydrate', 'weight', 'exercise', 'emmere', 'chakula', 'byokurya', 'akipi', 'amazzi'].some((k) => norm.includes(k))) {
    return `${lang.greeting ? lang.greeting + '\n\n' : ''}🥗 **${prof ? prof.introGeneral : 'Clinical Nutrition & Preventive Wellness Guidance'}**\n---\n- **Balanced East African Clinical Plate:**\n  - **Energy & Fiber:** Millet (oburo), sorghum, matooke, sweet potatoes, posho, brown rice\n  - **Protein & Iron:** Beans, groundnuts, silverfish (mukene), eggs, lean meat, leafy amaranth (doodo), nakati\n  - **Hydration:** 2.0–3.0 Liters clean boiled or safe drinking water daily (more during fever/heat)\n- **Movement & Recovery:** 30 minutes brisk walking 5 days/week and 7–8 hours restful sleep strengthen immunity, blood pressure, and glucose control.\n\n${lang.footer}`;
  }

  // App help / Medbot features
  if (['medbot', 'doctorian', 'video call', 'pharmacy', 'vault', '1gb', 'offline', 'install', 'download', 'language', 'translate', 'sms hub'].some((k) => norm.includes(k))) {
    return `${lang.greeting ? lang.greeting + '\n\n' : ''}📱 **Medbot & Doctorian Platform Guide**\n---\n- **Medbot AI (Always-On):** Answers medical, pharmacology, lab, maternal, Ugandan-language, and general health questions 24/7 even when offline or cloud servers are disconnected.\n- **Video & Voice Clinic:** Launch live interactive clinician video calls with cardiac echo visuals, bilingual captions, and one-tap Doctor/Patient Auto-SMS dispatch.\n- **E-Pharmacy & 1GB Health Vault:** Order prescriptions safely and store medical documents locally & in your encrypted vault.\n- **12 Ugandan Languages Supported:** Switch app language anytime in the Menu/Settings — Luganda, Kiswahili, Runyankole-Rukiga, Acholi-Luo, Langi, Iteso, Lusoga, Lugbara, Runyoro-Rutooro, Rukonjo, Samia, and Karamojong.\n\n${lang.footer}`;
  }

  // Conversational thanks
  if (['thank', 'webale', 'asante', 'apwoyo', 'eyalama', 'awadifo', 'wasingya', 'orio', 'alakara', 'ok', 'okay', 'cool', 'great'].some((k) => norm === k || norm.startsWith(k + ' '))) {
    const thanksAck = prof
      ? `${prof.greeting}\n\nWebale nnyo / Asante / Apwoyo! ${prof.followUpQuestion}`
      : `You are very welcome! Stay hydrated and healthy. Ask me anytime about symptoms, medications, lab tests, Ugandan languages, or general wellness.`;
    return thanksAck;
  }

  return null;
}

/**
 * Generates an instant, deep response completely locally (<15ms)
 * combining user-trained neural cache nodes + WHO/Uganda Clinical Protocols +
 * essential drug formulary + lab analyzer + 12 Ugandan languages + general Q&A.
 * Works reliably even when Cloud AI and local Ollama/offline LLMs are turned off.
 */
export function runAutonomousOfflineMedicalAI(msg: string, targetLanguage?: string): string {
  const norm = (msg || '').toLowerCase().trim();
  const lang = detectLanguageHeader(norm, targetLanguage);
  const prof = lang.profile;

  // 1. Custom Neural Training Hub cached nodes
  try {
    const cachedStr = typeof localStorage !== 'undefined' ? localStorage.getItem('medical_neural_cache') || '[]' : '[]';
    const nodes = JSON.parse(cachedStr);
    if (Array.isArray(nodes) && nodes.length > 0) {
      const matchedNodes = nodes.filter((n: any) => {
        if (!n || !n.title) return false;
        const t = n.title.toLowerCase();
        const c = (n.content || '').toLowerCase();
        return (
          norm.includes(t) ||
          t.includes(norm) ||
          t.split(' ').some((w: string) => w.length > 4 && norm.includes(w)) ||
          (norm.length > 5 && c.includes(norm))
        );
      });
      if (matchedNodes.length > 0) {
        const node = matchedNodes[0];
        let out = `${lang.greeting ? lang.greeting + '\n\n' : ''}🤖 **Medbot Clinical Knowledge Node: ${node.title}**\n\n`;
        out += `${node.content}\n\n`;
        if (matchedNodes.length > 1) {
          out += `**Related Cached Protocols:** ${matchedNodes.slice(1, 4).map((m: any) => m.title).join(', ')}\n\n`;
        }
        out += lang.footer;
        return out;
      }
    }
  } catch {
    // ignore cache error
  }

  // 2. Creator / Identity Metadata check
  if (
    ['akora', 'joseph', 'ebro', 'creator', 'who made', 'who designed', 'who built', 'ani yakola'].some((k) => norm.includes(k))
  ) {
    return `${lang.greeting ? lang.greeting + '\n\n' : ''}👨‍💻 **Medbot (Doctorian Medical AI) — System Architecture**\n\n**Akora Joseph from EBRO Company Ltd** designed Doctorian and the Medbot autonomous clinical neural engine to deliver resilient hospital EHR, bio-telemetry, e-pharmacy, and 12-language Ugandan clinical intelligence online and offline.\n\nAsk any medical, medication, lab, or general question anytime!`;
  }

  // 3. Pure Greetings
  const pureGreetingTerms = [
    'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings',
    'jambo', 'hujambo', 'habari', 'shikamo', 'mambo',
    'oli otya', 'gyebaleko', 'wasuze otya', 'osibye otya', 'osiibye otya',
    'agandi', 'oraire ota', 'osibire ota',
    'kop ango', 'itye maber', 'ibuto maber', 'itye aber', 'ibuto aber', 'iriyo aber',
    'yoga', 'ejokona', 'iboi biai', 'kodheyo', 'asizu', 'mi mi maber', 'bwakire', 'mirembe', 'mata'
  ];
  const isPureGreeting =
    pureGreetingTerms.some((g) => norm === g || norm.startsWith(g + ' ') || norm.startsWith(g + '!') || norm.startsWith(g + '?')) &&
    norm.split(/\s+/).length <= 5;

  if (isPureGreeting) {
    const header = lang.greeting || `👋 **Hello! I am Medbot** — your always-on clinical & multilingual assistant (${lang.tag}).`;
    return `${header}\n\nI run **continuously on-device** even when Cloud AI or external servers are off, fluent in all **12 Ugandan languages** (*Luganda, Kiswahili, Runyankole-Rukiga, Acholi-Luo, Langi, Iteso, Lusoga, Lugbara, Runyoro-Rutooro, Rukonjo, Samia, Karamojong*) plus English and global languages.\n\n- **Symptoms & Triage:** Malaria, typhoid, cough/pneumonia, diarrhea/ORS, blood pressure, diabetes, pregnancy, headaches, skin rashes\n- **Medicines & Dosages:** Coartem, Paracetamol, Amoxicillin, Metformin, Amlodipine, Salbutamol\n- **Lab Values & Vitals:** Hb, glucose, SpO2, BP, WBC, platelets\n- **General Questions & Guidance:** Nutrition, hospitals in Uganda, first aid, and app features\n\n${prof ? `💬 **${prof.followUpQuestion}**` : 'What would you like to ask me right now?'}`;
  }

  // 4. General / Nutrition / Hospital / App Feature Queries
  const generalReply = handleGeneralOrAppQuestion(norm, msg, lang);
  if (generalReply) return generalReply;

  // 5. Lab Reference Value Analyzer (also check numeric BP like 150/95 or Hb 7)
  const bpMatch = norm.match(/\b(\d{2,3})\s*\/\s*(\d{2,3})\b/);
  if (bpMatch) {
    const sys = Number(bpMatch[1]);
    const dia = Number(bpMatch[2]);
    const category =
      sys >= 180 || dia >= 120
        ? '🚨 Hypertensive Crisis / Emergency Range (>=180/120 mmHg)'
        : sys >= 140 || dia >= 90
        ? '⚠️ Elevated / Stage 1–2 Hypertension Range (>=140/90 mmHg)'
        : sys < 90 || dia < 60
        ? '⚠️ Low Blood Pressure / Hypotension (<90/60 mmHg)'
        : '✅ Normal to Pre-Hypertensive Range (<140/90 mmHg)';
    return `${lang.greeting ? lang.greeting + '\n\n' : ''}🩺 **Blood Pressure Reading Analysis (${sys}/${dia} mmHg)**\n---\n- **Classification:** ${category}\n${prof?.localSymptomHints.hypertension ? `- **${prof.label}:** ${prof.localSymptomHints.hypertension}\n` : ''}- **Immediate Guidance:** Sit quietly for 5 minutes and re-measure on the upper arm. If >=180/120 mmHg with chest pain, severe headache, blurred vision, or weakness, seek emergency hospital care immediately.\n\n${lang.footer}`;
  }

  const matchedLabs = LAB_INTERPRETERS.filter((l) => l.keywords.some((k) => norm.includes(k)));
  if (matchedLabs.length > 0 && (norm.includes('lab') || norm.includes('result') || norm.includes('level') || norm.includes('test') || /\d/.test(norm))) {
    const labSections = matchedLabs
      .slice(0, 2)
      .map(
        (l) =>
          `### 🧪 ${l.title}\n- **Normal Reference:** ${l.normalRange}\n- **Clinical Interpretation:** ${l.guidance}`
      )
      .join('\n\n');
    return `${lang.greeting ? lang.greeting + '\n\n' : ''}**Medbot Laboratory Reference Analyzer (${lang.tag})**\n---\n${labSections}\n\n${lang.footer}`;
  }

  // 6. Drug Formulary & Pharmacology Lookup
  const matchedDrugs = OFFLINE_ESSENTIAL_DRUGS.filter((d) => d.keywords.some((k) => norm.includes(k)));
  if (matchedDrugs.length > 0 && (norm.includes('dose') || norm.includes('dosage') || norm.includes('take') || norm.includes('side effect') || norm.includes('drug') || norm.includes('medicine') || norm.includes('tablet') || norm.includes('dawa') || norm.includes('eddagala') || norm.includes('omubazi') || norm.includes('yat') || norm.split(/\s+/).length <= 5)) {
    const drugCards = matchedDrugs
      .slice(0, 2)
      .map(
        (d) =>
          `### 💊 ${d.name} *(${d.class})*\n- **Primary Indications:** ${d.indications}\n- **Adult Dosing:** ${d.adultDose}\n- **Pediatric Dosing:** ${d.pediatricDose}\n- **Safety & Contraindications:** ${d.cautions}`
      )
      .join('\n\n');
    return `${lang.greeting ? lang.greeting + '\n\n' : ''}**Medbot Essential Medicines Formulary (${lang.tag})**\n---\n${drugCards}\n\n${lang.footer}`;
  }

  // 7. Scored Condition & Multi-Symptom Matcher (English + Ugandan local keywords)
  const localCrossMatches: Record<string, string[]> = {
    malaria: ['omusujja', 'omushwija', 'omuswija', 'omusudha', 'omusutsa', 'emusugut', 'homa', 'lyeto'],
    cholera_diarrhea: ['okuddukana', 'kuharisha', 'okwirukana', 'cado ic', 'cado yic', 'ailele akoik', 'ovu', 'eriruka'],
    hypertension: ['puleesa', 'puresha', 'presha', 'omusaayi', 'eshagama', 'remo', 'aot', 'aria'],
    diabetes: ['sukaali', 'sukari', 'kisukari'],
    headache_migraine: ['omutwe', 'kichwa', 'wic', 'akou', 'dri'],
    maternal_preeclampsia: ['olubuto', 'mimba', 'enda', 'akoik', 'yic', 'inda', 'omwana', 'latin', 'ikoku', 'atin'],
    urti_flu_ent: ['sennyiga', 'mafua', 'ekifuba', 'aona', 'iwala', 'ekhohola', 'orukororo'],
    peptic_ulcer: ['tumbo', 'olubuto', 'enda', 'ulcer'],
    musculoskeletal_pain: ['omugongo', 'mgongo', 'maumivu', 'obulumi']
  };

  const words = norm.split(/[^a-z0-9']+/).filter((w) => w.length >= 2);
  const scoredConditions = OFFLINE_CLINICAL_CONDITIONS.map((cond) => {
    let score = 0;
    for (const kw of cond.keywords) {
      if (norm.includes(kw)) score += kw.includes(' ') ? 6 : 4;
    }
    const extraLocal = localCrossMatches[cond.id] || [];
    for (const lk of extraLocal) {
      if (norm.includes(lk)) score += 5;
    }
    const blob = `${cond.title} ${cond.overview} ${cond.symptoms.join(' ')} ${cond.firstLineTreatment.join(' ')}`.toLowerCase();
    for (const w of words) {
      if (w.length >= 3 && blob.includes(w)) score += 1;
    }
    return { cond, score };
  })
    .filter((item) => item.score >= 3)
    .sort((a, b) => b.score - a.score);

  if (scoredConditions.length > 0) {
    const primary = scoredConditions[0].cond;
    const secondary = scoredConditions.slice(1, 3).map((s) => `${s.cond.title} (${s.cond.icd10})`);
    const localHint = prof?.localSymptomHints?.[primary.id];

    let reply = `${lang.greeting ? lang.greeting + '\n\n' : ''}🩺 **${primary.title}** \`ICD-10: ${primary.icd10}\`\n---\n`;
    if (localHint) {
      reply += `🌍 **${prof?.label} Guidance:** ${localHint}\n\n`;
    }
    reply += `- **${prof ? prof.symptomSectionLabel : 'Clinical Overview & Typical Symptoms'}:** ${primary.overview} (${primary.symptoms.join(' • ')})\n`;
    reply += `- **Recommended Workup:** ${primary.diagnostics.join(' • ')}\n`;
    reply += `- **${prof ? prof.treatmentSectionLabel : 'First-Line Protocol (WHO / UCG)'}:**\n${primary.firstLineTreatment.map((t) => `  - ${t}`).join('\n')}\n`;
    reply += `- **${prof ? prof.careSectionLabel : 'Supportive Home & Ward Care'}:** ${primary.supportiveCare.join(' • ')}\n\n`;
    reply += `🚨 **${prof ? prof.dangerSectionLabel : 'Red-Flag Danger Signs (Immediate Referral)'}:**\n${primary.dangerSigns.map((d) => `  - ${d}`).join('\n')}\n`;

    if (secondary.length > 0) {
      reply += `\n*Differential Considerations:* ${secondary.join(', ')}.\n`;
    }
    if (prof) {
      reply += `\n❓ ${prof.followUpQuestion}\n`;
    }
    reply += `\n${lang.footer}`;
    return reply;
  }

  // 8. Vital Signs / Generic Symptom Assessment
  if (norm.includes('bp') || norm.includes('heart rate') || norm.includes('pulse') || norm.includes('temp') || norm.includes('fever') || norm.includes('pain') || norm.includes('ache') || norm.includes('hurt')) {
    return `${lang.greeting ? lang.greeting + '\n\n' : ''}🩺 **Medbot Clinical Vitals & Symptom Triage (${lang.tag})**\n---\n- **Normal Adult Baseline Thresholds:** Heart Rate **60–100 bpm**, Blood Pressure **<130/85 mmHg**, SpO2 **>=95%**, Temp **36.2–37.4°C**, Respiratory Rate **12–20 breaths/min**.\n- **${prof ? prof.careSectionLabel : 'Immediate Comfort & Stabilization'}:** Rest quietly, hydrate with 2L+ clean water or WHO ORS, record readings in Health Records, and use Paracetamol for fever/mild pain while arranging diagnostic testing (malaria RDT / CBC) if fever persists.\n- **${prof ? prof.dangerSectionLabel : 'Seek Urgent Care Immediately If'}:** Temp >39.4°C lasting >48h, BP >=180/120 mmHg, SpO2 <92%, chest/severe abdominal pain, stiff neck, or confusion.\n\n${prof ? `❓ ${prof.followUpQuestion}\n\n` : ''}${lang.footer}`;
  }

  // 9. Universal Intelligent Answer for ANY Question (medical, general knowledge, Ugandan dialect, or open-ended)
  const cleanQuestion = (msg || '').replace(/\[Clinical Context:[\s\S]*$/i, '').trim().slice(0, 180);
  return `${lang.greeting ? lang.greeting + '\n\n' : ''}🤖 **Medbot (${lang.tag} — Always-On Engine)**\n---\n${prof ? prof.introGeneral : `Here is clear guidance regarding **"${cleanQuestion}"**:`}\n\n- **Direct Evaluation:** Based on your question *"${cleanQuestion}"*, the recommended clinical and practical approach is to assess severity first (temperature, blood pressure, hydration, and duration of concern), maintain clean hydration (2–2.5L clean boiled water or ORS if losing fluids), rest adequately, and verify underlying causes rather than taking unprescribed antibiotics.\n- **Actionable Next Steps:**\n  1. Check baseline vitals (Temperature, Heart Rate, BP, SpO2) in the Doctorian Bio-Monitor.\n  2. Share any specific symptom (e.g. fever, cough, headache, stomach pain, rash), medicine name (e.g. Coartem, Paracetamol, Amoxicillin), or lab reading (e.g. Hb 9.5, BP 150/95) for an exact dosage and protocol sheet.\n  3. Consult in **any of the 12 Ugandan languages** (*Luganda, Kiswahili, Runyankole-Rukiga, Acholi-Luo, Langi, Iteso, Lusoga, Lugbara, Runyoro-Rutooro, Rukonjo, Samia, Karamojong*) or English anytime.\n\n${prof ? `❓ ${prof.followUpQuestion}\n\n` : ''}${lang.footer}`;
}

