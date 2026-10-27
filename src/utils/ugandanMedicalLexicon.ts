/**
 * Ugandan Medical Lexicon & Linguistic Engine
 * Provides authentic, culturally grounded clinical terms, symptom definitions,
 * and clinician dialogue across Uganda's primary languages:
 * Luganda, Swahili, Runyankole-Rukiga, Acholi-Luo, Langi, Iteso, Lusoga, Lugbara, Runyoro-Rutooro.
 */

export interface MedicalTerm {
  english: string;
  category: 'symptom' | 'condition' | 'anatomy' | 'care' | 'emergency';
  translations: Record<string, string>;
  phoneticOrGuide?: string;
  clinicalNote?: string;
}

export interface ClinicianPersona {
  id: string;
  name: string;
  title: string;
  institution: string;
  specialty: string;
  languages: string[];
  avatar: string;
  greetingLuganda: string;
  greetingSwahili: string;
  greetingEnglish: string;
}

export const UGANDAN_CLINICIAN_PERSONAS: ClinicianPersona[] = [
  {
    id: "dr_gloria",
    name: "Dr. Gloria Jayakullo",
    title: "Senior Consultant Cardiologist",
    institution: "Mulago National Referral Hospital, Kampala",
    specialty: "Tele-Cardiology & Acute Internal Medicine",
    languages: ["English", "Luganda", "Swahili", "Acholi-Luo"],
    avatar: "/src/assets/images/dr_gloria_jayakullo_1793111742464.jpg",
    greetingLuganda: "Oli otya? Nze Dr. Gloria Jayakullo okuva e Mulago. Mbulira engeri gy'owuliramu olwaleero.",
    greetingSwahili: "Habari yako? Mimi ni Dkt. Gloria Jayakullo kutoka Mulago. Niambie unavyojisikia leo.",
    greetingEnglish: "Hello, I am Dr. Gloria Jayakullo from Mulago National Referral Hospital. How are you feeling today?"
  },
  {
    id: "dr_kato",
    name: "Dr. Emmanuel Kato",
    title: "Chief Trauma & Critical Care Specialist",
    institution: "Kampala City Health Directorate / MoH Uganda",
    specialty: "Emergency Resuscitation & Bio-Telemetry",
    languages: ["English", "Luganda", "Runyankole-Rukiga", "Lusoga"],
    avatar: "/src/assets/images/dr_emmanuel_kato_1793111742363.jpg",
    greetingLuganda: "Kulika olunaku! Nze Dr. Kato Emmanuel. Ndi wano okukola ku bujjanjabi bwo n'okusoma ebyuma byo.",
    greetingSwahili: "Jambo! Mimi ni Dkt. Emmanuel Kato. Nipo hapa kukusaidia kwa matibabu na uchunguzi wa vipimo vyako.",
    greetingEnglish: "Good day! I am Dr. Emmanuel Kato. I am analyzing your real-time clinical telemetry. What symptoms do you have?"
  },
  {
    id: "dr_achan",
    name: "Dr. Achan Grace",
    title: "Lead Pediatrician & Maternal Health Specialist",
    institution: "Kawempe National Maternal & Child Referral Hospital",
    specialty: "Pediatrics, Neonatal Care & Antenatal Triage",
    languages: ["English", "Luganda", "Swahili", "Acholi-Luo"],
    avatar: "/src/assets/images/dr_achan_grace_1793111743452.jpg",
    greetingLuganda: "Tusanyuse okukulaba maama/taata. Nze Dr. Achan Grace. Weeyanze obulamu bw'omwana n'obulamu bwo.",
    greetingSwahili: "Karibu sana. Mimi ni Dkt. Achan Grace. Niko hapa kuhakikisha afya ya mama na mtoto iko salama.",
    greetingEnglish: "Welcome. I am Dr. Achan Grace, specialized in maternal and pediatric wellness. How can I assist you today?"
  },
  {
    id: "dr_mukasa",
    name: "Dr. Joseph Mukasa",
    title: "Consultant Neurologist & Clinical Director",
    institution: "Makerere University College of Health Sciences",
    specialty: "Neurology, Neuro-Vascular & Stroke Triage",
    languages: ["English", "Luganda", "Runyankole-Rukiga", "Swahili"],
    avatar: "/src/assets/images/dr_joseph_mukasa_1793111743218.jpg",
    greetingLuganda: "Oli otya nnyabo/ssebo? Nze Dr. Joseph Mukasa. Ndi wano okwekenneenya obusimu n'obulamu bw'omutwe.",
    greetingSwahili: "Habari za leo. Mimi ni Dkt. Joseph Mukasa. Niko tayari kuchunguza mfumo wa fahamu na afya yako.",
    greetingEnglish: "Greetings. I am Dr. Joseph Mukasa, Consultant Neurologist. Let us review your neuro-vital markers and symptoms."
  }
];

export const UGANDAN_MEDICAL_TERMS: MedicalTerm[] = [
  {
    english: 'Malaria / High Fever',
    category: 'condition',
    translations: {
      'Luganda': 'Omusujja gw’ensiri (Fever/Malaria)',
      'Swahili': 'Homa ya Malaria / Mbaazi',
      'Runyankole-Rukiga': 'Omusija gw’Embararo',
      'Acholi-Luo': 'Two me ladwac / Maleria',
      'Langi': 'Two me ladwac / Malaria',
      'Iteso': 'Emidid loka asurut',
      'Lusoga': 'Omusudha gw’ensiri',
      'Lugbara': 'Alio be a\'bi / Malaria',
      'Runyoro-Rutooro': 'Omusija gw’ensiri'
    },
    clinicalNote: 'Uganda MoH Protocol: Recommend rapid diagnostic test (mRDT) and Artemether-Lumefantrine (Coartem) for positive cases.'
  },
  {
    english: 'Severe Headache',
    category: 'symptom',
    translations: {
      'Luganda': 'Omutwe oguluma ennyo',
      'Swahili': 'Maumivu makali ya kichwa',
      'Runyankole-Rukiga': 'Omutwe ogurikushasha muno',
      'Acholi-Luo': 'Wic ma arema matek',
      'Langi': 'Wic ma rem atek',
      'Iteso': 'Akou na edede noi',
      'Lusoga': 'Omutwe oguluma enho',
      'Lugbara': 'Dri aza kabilo',
      'Runyoro-Rutooro': 'Omutwe ogukushasha muno'
    },
    clinicalNote: 'Assess for signs of meningitis, hypertension crisis, or cerebral malaria.'
  },
  {
    english: 'Cough / Chest Infection',
    category: 'symptom',
    translations: {
      'Luganda': 'Ekifuba / Okukolola',
      'Swahili': 'Kikohozi na kifua',
      'Runyankole-Rukiga': 'Ekifuba / Okukorora',
      'Acholi-Luo': 'Ayom ki two kor',
      'Langi': 'Ayom me kor',
      'Iteso': 'Auruut ka ekou',
      'Lusoga': 'Ekifuba / Okukohola',
      'Lugbara': 'E’yo si aza / Oyua',
      'Runyoro-Rutooro': 'Ekifuba / Okukorora'
    },
    clinicalNote: 'Differentiate dry cough vs productive sputum. Screen for TB (Uganda MoH GeneXpert) if coughing > 2 weeks.'
  },
  {
    english: 'Abdominal / Stomach Pain',
    category: 'symptom',
    translations: {
      'Luganda': 'Obulumi mu lubuto',
      'Swahili': 'Maumivu ya tumbo',
      'Runyankole-Rukiga': 'Obusaasi omu nda',
      'Acholi-Luo': 'Arema i iye',
      'Langi': 'Icc ma rem matek',
      'Iteso': 'Akook na edede',
      'Lusoga': 'Obulumi mu idha',
      'Lugbara': 'Ici aza',
      'Runyoro-Rutooro': 'Obusaasi omu nda'
    },
    clinicalNote: 'Rule out acute appendicitis, peptic ulcer disease, amoebiasis, or typhoid fever.'
  },
  {
    english: 'Vomiting & Diarrhea',
    category: 'symptom',
    translations: {
      'Luganda': 'Okusesema n’Okuddukana',
      'Swahili': 'Kutapika na Kuharisha',
      'Runyankole-Rukiga': 'Kutana n’Okwiruka',
      'Acholi-Luo': 'Ngok ki cwer iye',
      'Langi': 'Ngok ki kado icc',
      'Iteso': 'Alekun ka akipir',
      'Lusoga': 'Okutanha n’okudhubana',
      'Lugbara': 'Ole nze ti odzu',
      'Runyoro-Rutooro': 'Kutana n’Okuturuka'
    },
    clinicalNote: 'High risk of acute dehydration. Initiate Oral Rehydration Salts (ORS) + Zinc sulfate immediately.'
  },
  {
    english: 'High Blood Pressure (Hypertension)',
    category: 'condition',
    translations: {
      'Luganda': 'Puleesa ey’omusaayi eyambuka',
      'Swahili': 'Shinikizo la Juu la Damu (Puresha)',
      'Runyankole-Rukiga': 'Puresha y’Eshagama',
      'Acholi-Luo': 'Teko me remo ma malo',
      'Langi': 'Cwiny remo ma malo',
      'Iteso': 'Akaulo nako aookot',
      'Lusoga': 'Puleesa y’omusaayi',
      'Lugbara': 'Ario be aripi',
      'Runyoro-Rutooro': 'Puresha y’Esaagisi'
    },
    clinicalNote: 'Normal target: < 120/80 mmHg. Stage 1: 130-139 / 80-89. Stage 2: >= 140 / >= 90.'
  },
  {
    english: 'Diabetes / Blood Sugar',
    category: 'condition',
    translations: {
      'Luganda': 'Obulwadde bwa sukaali mu musaayi',
      'Swahili': 'Ugonjwa wa Kisukari',
      'Runyankole-Rukiga': 'Endwara ya Shukaari',
      'Acholi-Luo': 'Two me Sukari',
      'Langi': 'Two me cukar',
      'Iteso': 'Edeke loka esukali',
      'Lusoga': 'Endhwaye ya sukari',
      'Lugbara': 'Aza be Sukari',
      'Runyoro-Rutooro': 'Endwara ya sukaali'
    },
    clinicalNote: 'Fast blood glucose target: 4.0 - 7.0 mmol/L (70 - 126 mg/dL).'
  },
  {
    english: 'Pregnancy & Maternal Wellness',
    category: 'care',
    translations: {
      'Luganda': 'Olubuto n’Obulamu bw’Omukyala ey’embuto',
      'Swahili': 'Ujauzito na Afya ya Uzazi',
      'Runyankole-Rukiga': 'Enda n’Oburamu bw’Omukazi omuzaire',
      'Acholi-Luo': 'Iye ki kwo pa dako',
      'Langi': 'Icc ki kwo pa dako',
      'Iteso': 'Akook ka aijar nak’aberu',
      'Lusoga': 'Olubuto n’obulamu bw’omukazi',
      'Lugbara': 'Ici be ava amve',
      'Runyoro-Rutooro': 'Enda n’obwomeezi bw’omukazi'
    },
    clinicalNote: 'Screen for pre-eclampsia (BP, proteinuria), anemia, and provide FANC malaria prophylaxis (IPTp-SP).'
  },
  {
    english: 'Child Health & Immunization',
    category: 'care',
    translations: {
      'Luganda': 'Obulamu bw’abaana n’Empiso z’okugema',
      'Swahili': 'Afya ya Watoto na Chanjo',
      'Runyankole-Rukiga': 'Oburamu bw’Abaana n’Ebindu by’okugyema',
      'Acholi-Luo': 'Kwo pa lotino ki ciko yat',
      'Langi': 'Kwo pa atino ki ciko yat',
      'Iteso': 'Aijar naka idwe ka acikanut',
      'Lusoga': 'Obulamu bw’abaana n’okugema',
      'Lugbara': 'Wadrile be mve',
      'Runyoro-Rutooro': 'Obwomeezi bw’abaana n’okugema'
    },
    clinicalNote: 'Uganda UNEPI Schedule: BCG, Polio, Pentavalent, Rotavirus, PCV, Measles-Rubella.'
  },
  {
    english: 'Emergency Ambulance / SOS',
    category: 'emergency',
    translations: {
      'Luganda': 'Amangu Ddaala / Ambyulensi ya Gavumenti (SOS)',
      'Swahili': 'Gari la Dharura la Wagonjwa (Ambulensi)',
      'Runyankole-Rukiga': 'Obuhabuzi bw’Amangu SOS',
      'Acholi-Luo': 'Gari me two ma mapi (Ambulance)',
      'Langi': 'Gari me olingo (Ambulance)',
      'Iteso': 'Ambulance nako aijar (SOS)',
      'Lusoga': 'Amangu goona / Ambyulensi',
      'Lugbara': 'Motoka be ava aza (Ambulance)',
      'Runyoro-Rutooro': 'Amangu goona SOS'
    },
    clinicalNote: 'Toll-free emergency dispatch: 911 / 999. MoH toll free line: 0800-100-066 / 0800-203-033.'
  }
];

export const UGANDAN_AUDIO_PHRASES: { phrase: string; luganda: string; swahili: string; runyankole: string; english: string }[] = [
  {
    phrase: 'greeting',
    luganda: 'Nsanyuse okukulaba! Ndi Doctorian AI musawo wo.',
    swahili: 'Karibu sana! Mimi ni daktari wako wa kidijitali wa Doctorian.',
    runyankole: 'Kasiibo! Ndi omushaho waawe ow’omutindo Doctorian.',
    english: 'Welcome! I am Doctorian AI, your real-time medical consultant.'
  },
  {
    phrase: 'listening',
    luganda: 'Nkuwuliriza bulungi. Yogera ku bulumi bwo.',
    swahili: 'Ninakusikiliza vizuri. Tafadhali eleza maumivu unayohisi.',
    runyankole: 'Ninkuhurira gye. Gamba aha burwire bwawe.',
    english: 'I am listening closely. Please describe your symptoms and pain.'
  },
  {
    phrase: 'vitals_stable',
    luganda: 'Ebyuma biraga nti omutima n’omukka bigenda bulungi.',
    swahili: 'Vipimo vya mwili vinaonyesha mapigo ya moyo na oksijeni viko salama.',
    runyankole: 'Ebyuma byawe birikworeka ngu omutima nigukuba gye.',
    english: 'Your bio-telemetry indicators confirm normal pulse and oxygen saturation.'
  },
  {
    phrase: 'urgent_care',
    luganda: 'Wetaaga okulaba omusawo mu ddowaliro amangu ddala!',
    swahili: 'Unahitaji kuonana na daktari hospitalini mara moja!',
    runyankole: 'Oine kureeba omushaho omu ddwariro ahonaho!',
    english: 'You require immediate physical physician evaluation at the nearest hospital!'
  }
];

export function getLocalizedMedicalPhrase(phraseKey: string, lang: string): string {
  const item = UGANDAN_AUDIO_PHRASES.find(p => p.phrase === phraseKey);
  if (!item) return '';
  if (lang === 'Luganda') return item.luganda;
  if (lang === 'Swahili') return item.swahili;
  if (lang === 'Runyankole-Rukiga') return item.runyankole;
  return item.english;
}
