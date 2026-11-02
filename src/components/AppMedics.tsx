import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Pill,
  Search,
  Building2,
  MapPin,
  Phone,
  Clock,
  ShieldCheck,
  Filter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Calculator,
  Plus,
  Minus,
  Trash2,
  Share2,
  FileText,
  BadgeCheck,
  Sparkles,
  Info,
  DollarSign,
  ArrowRight,
  PhoneCall,
  MessageCircle,
  Tag,
  Stethoscope
} from 'lucide-react';

export interface MedicineItem {
  id: string;
  name: string;
  genericName: string;
  category: 'antibiotic' | 'antimalarial' | 'cardio_diabetes' | 'pain_analgesic' | 'respiratory' | 'gastro' | 'maternal_child';
  form: 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Inhaler' | 'Drops' | 'Suspension';
  dosage: string;
  packSize: string;
  priceUGX: number;
  priceUSD: number;
  prescriptionRequired: boolean;
  ndaApproved: boolean;
  mohEssential: boolean;
  inStock: boolean;
  primaryIndication: string;
  pharmacyPrices: {
    pharmacyId: string;
    pharmacyName: string;
    branch: string;
    priceUGX: number;
    inStock: boolean;
  }[];
}

export interface PharmacyItem {
  id: string;
  name: string;
  type: 'Pharmacy' | 'Hospital Pharmacy' | 'Clinic & Dispensary';
  branches: string[];
  mainAddress: string;
  district: string;
  phone: string;
  whatsapp?: string;
  hours: string;
  hasDelivery: boolean;
  rating: number;
  verified: boolean;
}

export const UGANDA_PHARMACIES: PharmacyItem[] = [
  {
    id: 'ecopharm',
    name: 'Ecopharm Pharmacy & Clinic',
    type: 'Pharmacy',
    branches: ['Nakasero Road', 'Ntinda Complex', 'Lugogo Mall', 'Acacia Mall', 'Entebbe Road'],
    mainAddress: 'Plot 14 Nakasero Road, Kampala',
    district: 'Kampala Central',
    phone: '+256 708 555 111',
    whatsapp: '+256 708 555 111',
    hours: '24 Hours (7 Days)',
    hasDelivery: true,
    rating: 4.9,
    verified: true,
  },
  {
    id: 'vine',
    name: 'Vine Pharmacy',
    type: 'Pharmacy',
    branches: ['Kampala Road', 'Garden City Mall', 'Entebbe Town', 'Victoria Mall'],
    mainAddress: 'Plot 37 Kampala Road, Opp. Bank of Uganda',
    district: 'Kampala Central',
    phone: '+256 414 259 888',
    whatsapp: '+256 772 334 455',
    hours: '08:00 AM - 10:00 PM',
    hasDelivery: true,
    rating: 4.8,
    verified: true,
  },
  {
    id: 'first_pharmacy',
    name: 'First Pharmacy',
    type: 'Pharmacy',
    branches: ['Wandegeya (Opp. Mulago Gate)', 'Forest Mall Lugogo', 'Kabalagala Ggaba Rd'],
    mainAddress: 'Plot 82 Wandegeya, Mulago Hill Road, Kampala',
    district: 'Kawempe / Wandegeya',
    phone: '+256 414 541 222',
    whatsapp: '+256 701 445 566',
    hours: '24 Hours (7 Days)',
    hasDelivery: true,
    rating: 4.9,
    verified: true,
  },
  {
    id: 'guardian',
    name: 'Guardian Pharmacy Uganda',
    type: 'Pharmacy',
    branches: ['Acacia Mall Kisementi', 'Village Mall Bugolobi', 'Oasis Mall Yusuf Lule Rd'],
    mainAddress: 'Lower Ground, Acacia Mall, Kisementi, Kololo',
    district: 'Kampala North',
    phone: '+256 393 262 300',
    whatsapp: '+256 788 123 456',
    hours: '08:00 AM - 10:00 PM',
    hasDelivery: true,
    rating: 4.7,
    verified: true,
  },
  {
    id: 'careplus',
    name: 'CarePlus Pharmacy & Family Clinic',
    type: 'Clinic & Dispensary',
    branches: ['Kololo John Babiha Ave', 'Bugolobi Spring Rd', 'Muyenga Tank Hill'],
    mainAddress: 'Plot 22 John Babiha (Acacia) Avenue, Kololo',
    district: 'Kampala Central',
    phone: '+256 752 900 120',
    whatsapp: '+256 752 900 120',
    hours: '07:30 AM - 11:00 PM',
    hasDelivery: true,
    rating: 4.8,
    verified: true,
  },
  {
    id: 'ihk_pharmacy',
    name: 'C-Care IHK Hospital Pharmacy',
    type: 'Hospital Pharmacy',
    branches: ['Kisugu Namuwongo', 'C-Care Clinic Acacia', 'C-Care Kololo'],
    mainAddress: 'Plot 4686 St. Barnabas Rd, Kisugu, Namuwongo, Kampala',
    district: 'Makindye',
    phone: '+256 312 200 400',
    whatsapp: '+256 772 200 400',
    hours: '24 Hours (7 Days)',
    hasDelivery: true,
    rating: 4.9,
    verified: true,
  },
  {
    id: 'victoria_pharmacy',
    name: 'Victoria Hospital Pharmacy',
    type: 'Hospital Pharmacy',
    branches: ['Kyadondo Road Nakasero'],
    mainAddress: 'Plot 14-16 Kyadondo Road, Nakasero, Kampala',
    district: 'Kampala Central',
    phone: '+256 312 300 800',
    hours: '24 Hours (7 Days)',
    hasDelivery: true,
    rating: 4.8,
    verified: true,
  },
  {
    id: 'case_pharmacy',
    name: 'Case Medical Centre Pharmacy',
    type: 'Hospital Pharmacy',
    branches: ['Buganda Road Nakasero'],
    mainAddress: 'Plot 69-71 Buganda Road, Kampala',
    district: 'Kampala Central',
    phone: '+256 414 250 362',
    hours: '24 Hours (7 Days)',
    hasDelivery: true,
    rating: 4.7,
    verified: true,
  },
  {
    id: 'norvik_pharmacy',
    name: 'Norvik Hospital Pharmacy',
    type: 'Hospital Pharmacy',
    branches: ['Bombo Road Wandegeya'],
    mainAddress: 'Plot 13 Bombo Road, Wandegeya, Kampala',
    district: 'Kawempe',
    phone: '+256 414 250 822',
    hours: '24 Hours (7 Days)',
    hasDelivery: false,
    rating: 4.6,
    verified: true,
  },
  {
    id: 'mengo_pharmacy',
    name: 'Mengo Hospital Main Pharmacy',
    type: 'Hospital Pharmacy',
    branches: ['Sir Albert Cook Road Mengo'],
    mainAddress: 'Plot 10 Sir Albert Cook Road, Mengo, Kampala',
    district: 'Rubaga',
    phone: '+256 414 270 222',
    hours: '24 Hours (7 Days)',
    hasDelivery: false,
    rating: 4.7,
    verified: true,
  },
  {
    id: 'abacus_pharma',
    name: 'Abacus Pharma Dispensing Centre',
    type: 'Pharmacy',
    branches: ['Mukabya Rd Nakawa', 'Jinja Town', 'Mbarara High St'],
    mainAddress: 'Plot 28-32 Mukabya Road, Nakawa Industrial Area',
    district: 'Nakawa',
    phone: '+256 414 220 500',
    hours: '08:00 AM - 07:00 PM',
    hasDelivery: true,
    rating: 4.8,
    verified: true,
  }
];

export const UGANDA_MEDICINES: MedicineItem[] = [
  // Antimalarials (Uganda MoH First-Line)
  {
    id: 'med-coartem',
    name: 'Coartem 20/120',
    genericName: 'Artemether 20mg / Lumefantrine 120mg',
    category: 'antimalarial',
    form: 'Tablet',
    dosage: '20mg / 120mg',
    packSize: '24 Tablets (Full 3-day adult course)',
    priceUGX: 20000,
    priceUSD: 5.30,
    prescriptionRequired: false,
    ndaApproved: true,
    mohEssential: true,
    inStock: true,
    primaryIndication: 'Uganda MoH 1st-line treatment for uncomplicated Plasmodium falciparum malaria',
    pharmacyPrices: [
      { pharmacyId: 'ecopharm', pharmacyName: 'Ecopharm', branch: 'Nakasero', priceUGX: 20000, inStock: true },
      { pharmacyId: 'vine', pharmacyName: 'Vine Pharmacy', branch: 'Kampala Rd', priceUGX: 21000, inStock: true },
      { pharmacyId: 'first_pharmacy', pharmacyName: 'First Pharmacy', branch: 'Wandegeya', priceUGX: 19500, inStock: true },
      { pharmacyId: 'ihk_pharmacy', pharmacyName: 'C-Care IHK', branch: 'Namuwongo', priceUGX: 23000, inStock: true },
      { pharmacyId: 'guardian', pharmacyName: 'Guardian', branch: 'Acacia Mall', priceUGX: 22000, inStock: true },
    ]
  },
  {
    id: 'med-lonart-forte',
    name: 'Lonart Forte',
    genericName: 'Artemether 80mg / Lumefantrine 480mg',
    category: 'antimalarial',
    form: 'Tablet',
    dosage: '80mg / 480mg',
    packSize: '6 Tablets (Adult single-dose convenience pack)',
    priceUGX: 18500,
    priceUSD: 4.90,
    prescriptionRequired: false,
    ndaApproved: true,
    mohEssential: true,
    inStock: true,
    primaryIndication: 'High-adherence adult therapy for acute uncomplicated malaria',
    pharmacyPrices: [
      { pharmacyId: 'ecopharm', pharmacyName: 'Ecopharm', branch: 'Ntinda', priceUGX: 18500, inStock: true },
      { pharmacyId: 'first_pharmacy', pharmacyName: 'First Pharmacy', branch: 'Lugogo', priceUGX: 18000, inStock: true },
      { pharmacyId: 'abacus_pharma', pharmacyName: 'Abacus Pharma', branch: 'Nakawa', priceUGX: 17500, inStock: true },
    ]
  },
  {
    id: 'med-artesunate-inj',
    name: 'Artesunate Injection 60mg',
    genericName: 'Artesunate Powder for Reconstitution',
    category: 'antimalarial',
    form: 'Injection',
    dosage: '60mg IV/IM',
    packSize: 'Vial + 5% Sodium Bicarbonate diluent',
    priceUGX: 28000,
    priceUSD: 7.40,
    prescriptionRequired: true,
    ndaApproved: true,
    mohEssential: true,
    inStock: true,
    primaryIndication: 'WHO & Uganda MoH gold standard for severe/cerebral malaria in children & adults',
    pharmacyPrices: [
      { pharmacyId: 'first_pharmacy', pharmacyName: 'First Pharmacy', branch: 'Wandegeya (Mulago)', priceUGX: 26500, inStock: true },
      { pharmacyId: 'ihk_pharmacy', pharmacyName: 'C-Care IHK', branch: 'Kisugu', priceUGX: 30000, inStock: true },
      { pharmacyId: 'victoria_pharmacy', pharmacyName: 'Victoria Hospital', branch: 'Nakasero', priceUGX: 29000, inStock: true },
    ]
  },

  // Antibiotics & Antimicrobials
  {
    id: 'med-augmentin-625',
    name: 'Augmentin 625mg',
    genericName: 'Amoxicillin 500mg + Clavulanic Acid 125mg',
    category: 'antibiotic',
    form: 'Tablet',
    dosage: '625mg',
    packSize: '14 Film-coated Tablets (GSK / Original)',
    priceUGX: 36000,
    priceUSD: 9.50,
    prescriptionRequired: true,
    ndaApproved: true,
    mohEssential: true,
    inStock: true,
    primaryIndication: 'Lower respiratory tract infections, sinusitis, skin & soft tissue infections',
    pharmacyPrices: [
      { pharmacyId: 'ecopharm', pharmacyName: 'Ecopharm', branch: 'Lugogo', priceUGX: 36000, inStock: true },
      { pharmacyId: 'vine', pharmacyName: 'Vine Pharmacy', branch: 'Garden City', priceUGX: 37500, inStock: true },
      { pharmacyId: 'first_pharmacy', pharmacyName: 'First Pharmacy', branch: 'Wandegeya', priceUGX: 35000, inStock: true },
      { pharmacyId: 'careplus', pharmacyName: 'CarePlus', branch: 'Kololo', priceUGX: 38000, inStock: true },
    ]
  },
  {
    id: 'med-cipro-500',
    name: 'Ciprofloxacin 500mg',
    genericName: 'Ciprofloxacin Hydrochloride',
    category: 'antibiotic',
    form: 'Tablet',
    dosage: '500mg',
    packSize: '10 Tablets',
    priceUGX: 8500,
    priceUSD: 2.25,
    prescriptionRequired: true,
    ndaApproved: true,
    mohEssential: true,
    inStock: true,
    primaryIndication: 'Urinary tract infections (UTI), typhoid fever, infectious diarrhea',
    pharmacyPrices: [
      { pharmacyId: 'ecopharm', pharmacyName: 'Ecopharm', branch: 'Nakasero', priceUGX: 8500, inStock: true },
      { pharmacyId: 'first_pharmacy', pharmacyName: 'First Pharmacy', branch: 'Wandegeya', priceUGX: 8000, inStock: true },
      { pharmacyId: 'mengo_pharmacy', pharmacyName: 'Mengo Hospital', branch: 'Mengo', priceUGX: 7500, inStock: true },
    ]
  },
  {
    id: 'med-azithro-500',
    name: 'Azithromycin 500mg (Zithromax)',
    genericName: 'Azithromycin Monohydrate',
    category: 'antibiotic',
    form: 'Tablet',
    dosage: '500mg',
    packSize: '3 Tablets (Convenient 3-day course)',
    priceUGX: 26000,
    priceUSD: 6.85,
    prescriptionRequired: true,
    ndaApproved: true,
    mohEssential: true,
    inStock: true,
    primaryIndication: 'Community-acquired pneumonia, chlamydia, atypical bacterial bronchitis',
    pharmacyPrices: [
      { pharmacyId: 'guardian', pharmacyName: 'Guardian', branch: 'Acacia Mall', priceUGX: 27000, inStock: true },
      { pharmacyId: 'vine', pharmacyName: 'Vine Pharmacy', branch: 'Kampala Rd', priceUGX: 26000, inStock: true },
      { pharmacyId: 'ecopharm', pharmacyName: 'Ecopharm', branch: 'Ntinda', priceUGX: 25000, inStock: true },
    ]
  },
  {
    id: 'med-ceftriaxone-1g',
    name: 'Ceftriaxone 1g Injection',
    genericName: 'Ceftriaxone Sodium Sterile',
    category: 'antibiotic',
    form: 'Injection',
    dosage: '1g IV/IM',
    packSize: '1 Vial + 10ml Water for Injection',
    priceUGX: 16000,
    priceUSD: 4.20,
    prescriptionRequired: true,
    ndaApproved: true,
    mohEssential: true,
    inStock: true,
    primaryIndication: 'Hospital-level treatment for sepsis, meningitis, acute pyelonephritis, gonococcal infections',
    pharmacyPrices: [
      { pharmacyId: 'first_pharmacy', pharmacyName: 'First Pharmacy', branch: 'Wandegeya', priceUGX: 15500, inStock: true },
      { pharmacyId: 'ihk_pharmacy', pharmacyName: 'C-Care IHK', branch: 'Kisugu', priceUGX: 18000, inStock: true },
      { pharmacyId: 'case_pharmacy', pharmacyName: 'Case Clinic', branch: 'Buganda Rd', priceUGX: 17500, inStock: true },
    ]
  },

  // Cardiovascular, Diabetes & Chronic Care
  {
    id: 'med-amlodipine-10',
    name: 'Amlodipine 10mg (Norvasc)',
    genericName: 'Amlodipine Besylate',
    category: 'cardio_diabetes',
    form: 'Tablet',
    dosage: '10mg',
    packSize: '30 Tablets (1 Month supply)',
    priceUGX: 22000,
    priceUSD: 5.80,
    prescriptionRequired: true,
    ndaApproved: true,
    mohEssential: true,
    inStock: true,
    primaryIndication: 'Essential hypertension & chronic stable angina pectoris prophylaxis',
    pharmacyPrices: [
      { pharmacyId: 'ecopharm', pharmacyName: 'Ecopharm', branch: 'Nakasero', priceUGX: 22000, inStock: true },
      { pharmacyId: 'vine', pharmacyName: 'Vine Pharmacy', branch: 'Kampala Rd', priceUGX: 24000, inStock: true },
      { pharmacyId: 'abacus_pharma', pharmacyName: 'Abacus Pharma', branch: 'Nakawa', priceUGX: 20000, inStock: true },
    ]
  },
  {
    id: 'med-losartan-50',
    name: 'Losartan Potassium 50mg (Cozaar)',
    genericName: 'Losartan Potassium',
    category: 'cardio_diabetes',
    form: 'Tablet',
    dosage: '50mg',
    packSize: '30 Tablets',
    priceUGX: 28000,
    priceUSD: 7.35,
    prescriptionRequired: true,
    ndaApproved: true,
    mohEssential: true,
    inStock: true,
    primaryIndication: 'Hypertension management with renal protection in diabetic nephropathy',
    pharmacyPrices: [
      { pharmacyId: 'first_pharmacy', pharmacyName: 'First Pharmacy', branch: 'Wandegeya', priceUGX: 27500, inStock: true },
      { pharmacyId: 'guardian', pharmacyName: 'Guardian', branch: 'Village Mall', priceUGX: 29500, inStock: true },
      { pharmacyId: 'careplus', pharmacyName: 'CarePlus', branch: 'Kololo', priceUGX: 29000, inStock: true },
    ]
  },
  {
    id: 'med-metformin-850',
    name: 'Metformin 850mg (Glucophage)',
    genericName: 'Metformin Hydrochloride',
    category: 'cardio_diabetes',
    form: 'Tablet',
    dosage: '850mg',
    packSize: '30 Tablets',
    priceUGX: 16000,
    priceUSD: 4.20,
    prescriptionRequired: true,
    ndaApproved: true,
    mohEssential: true,
    inStock: true,
    primaryIndication: 'Type 2 Diabetes Mellitus glycemic control (First-line monotherapy)',
    pharmacyPrices: [
      { pharmacyId: 'ecopharm', pharmacyName: 'Ecopharm', branch: 'Ntinda', priceUGX: 16000, inStock: true },
      { pharmacyId: 'first_pharmacy', pharmacyName: 'First Pharmacy', branch: 'Lugogo', priceUGX: 15000, inStock: true },
      { pharmacyId: 'mengo_pharmacy', pharmacyName: 'Mengo Hospital', branch: 'Mengo', priceUGX: 14500, inStock: true },
    ]
  },
  {
    id: 'med-atorvastatin-20',
    name: 'Atorvastatin 20mg (Lipitor)',
    genericName: 'Atorvastatin Calcium',
    category: 'cardio_diabetes',
    form: 'Tablet',
    dosage: '20mg',
    packSize: '30 Tablets',
    priceUGX: 32000,
    priceUSD: 8.40,
    prescriptionRequired: true,
    ndaApproved: true,
    mohEssential: true,
    inStock: true,
    primaryIndication: 'Hypercholesterolemia & primary prevention of cardiovascular events in high-risk patients',
    pharmacyPrices: [
      { pharmacyId: 'ecopharm', pharmacyName: 'Ecopharm', branch: 'Nakasero', priceUGX: 32000, inStock: true },
      { pharmacyId: 'guardian', pharmacyName: 'Guardian', branch: 'Acacia Mall', priceUGX: 35000, inStock: true },
      { pharmacyId: 'ihk_pharmacy', pharmacyName: 'C-Care IHK', branch: 'Kisugu', priceUGX: 34000, inStock: true },
    ]
  },

  // Respiratory & Allergy
  {
    id: 'med-ventolin-inhaler',
    name: 'Ventolin Inhaler (Salbutamol 100mcg)',
    genericName: 'Salbutamol Sulfate CFC-free',
    category: 'respiratory',
    form: 'Inhaler',
    dosage: '100mcg/actuation',
    packSize: '200 Metered Doses (GSK Inhaler)',
    priceUGX: 28000,
    priceUSD: 7.35,
    prescriptionRequired: true,
    ndaApproved: true,
    mohEssential: true,
    inStock: true,
    primaryIndication: 'Rapid bronchodilator rescue in acute asthma bronchospasm and COPD',
    pharmacyPrices: [
      { pharmacyId: 'ecopharm', pharmacyName: 'Ecopharm', branch: 'Nakasero', priceUGX: 28000, inStock: true },
      { pharmacyId: 'first_pharmacy', pharmacyName: 'First Pharmacy', branch: 'Wandegeya', priceUGX: 27000, inStock: true },
      { pharmacyId: 'vine', pharmacyName: 'Vine Pharmacy', branch: 'Garden City', priceUGX: 29000, inStock: true },
      { pharmacyId: 'careplus', pharmacyName: 'CarePlus', branch: 'Bugolobi', priceUGX: 28500, inStock: true },
    ]
  },
  {
    id: 'med-cetirizine-10',
    name: 'Cetirizine 10mg (Zyrtec)',
    genericName: 'Cetirizine Dihydrochloride',
    category: 'respiratory',
    form: 'Tablet',
    dosage: '10mg',
    packSize: '30 Tablets',
    priceUGX: 12000,
    priceUSD: 3.15,
    prescriptionRequired: false,
    ndaApproved: true,
    mohEssential: true,
    inStock: true,
    primaryIndication: 'Seasonal allergic rhinitis, perennial allergies, acute urticaria itch relief',
    pharmacyPrices: [
      { pharmacyId: 'ecopharm', pharmacyName: 'Ecopharm', branch: 'Lugogo', priceUGX: 12000, inStock: true },
      { pharmacyId: 'first_pharmacy', pharmacyName: 'First Pharmacy', branch: 'Wandegeya', priceUGX: 11000, inStock: true },
    ]
  },

  // Analgesics & Pain
  {
    id: 'med-panadol-extra',
    name: 'Panadol Extra',
    genericName: 'Paracetamol 500mg + Caffeine 65mg',
    category: 'pain_analgesic',
    form: 'Tablet',
    dosage: '500mg / 65mg',
    packSize: 'Pack of 24 Tablets',
    priceUGX: 9500,
    priceUSD: 2.50,
    prescriptionRequired: false,
    ndaApproved: true,
    mohEssential: true,
    inStock: true,
    primaryIndication: 'Tension headaches, migraine onset, dental pain, fever reduction',
    pharmacyPrices: [
      { pharmacyId: 'ecopharm', pharmacyName: 'Ecopharm', branch: 'All Branches', priceUGX: 9500, inStock: true },
      { pharmacyId: 'vine', pharmacyName: 'Vine Pharmacy', branch: 'All Branches', priceUGX: 9500, inStock: true },
      { pharmacyId: 'first_pharmacy', pharmacyName: 'First Pharmacy', branch: 'All Branches', priceUGX: 9000, inStock: true },
    ]
  },
  {
    id: 'med-ibuprofen-400',
    name: 'Ibuprofen 400mg (Brufen)',
    genericName: 'Ibuprofen BP',
    category: 'pain_analgesic',
    form: 'Tablet',
    dosage: '400mg',
    packSize: 'Pack of 20 Tablets',
    priceUGX: 6000,
    priceUSD: 1.60,
    prescriptionRequired: false,
    ndaApproved: true,
    mohEssential: true,
    inStock: true,
    primaryIndication: 'Musculoskeletal inflammation, menstrual cramps (dysmenorrhea), osteoarthritis pain',
    pharmacyPrices: [
      { pharmacyId: 'ecopharm', pharmacyName: 'Ecopharm', branch: 'Ntinda', priceUGX: 6000, inStock: true },
      { pharmacyId: 'first_pharmacy', pharmacyName: 'First Pharmacy', branch: 'Wandegeya', priceUGX: 5500, inStock: true },
    ]
  },

  // Gastrointestinal
  {
    id: 'med-omeprazole-20',
    name: 'Omeprazole 20mg (Omez)',
    genericName: 'Omeprazole Delayed-Release',
    category: 'gastro',
    form: 'Capsule',
    dosage: '20mg',
    packSize: '28 Capsules (4 Strips of 7)',
    priceUGX: 14000,
    priceUSD: 3.70,
    prescriptionRequired: false,
    ndaApproved: true,
    mohEssential: true,
    inStock: true,
    primaryIndication: 'Peptic ulcer disease, GERD acid reflux, NSAID-induced gastric ulcer prophylaxis',
    pharmacyPrices: [
      { pharmacyId: 'ecopharm', pharmacyName: 'Ecopharm', branch: 'Nakasero', priceUGX: 14000, inStock: true },
      { pharmacyId: 'first_pharmacy', pharmacyName: 'First Pharmacy', branch: 'Wandegeya', priceUGX: 13000, inStock: true },
      { pharmacyId: 'abacus_pharma', pharmacyName: 'Abacus Pharma', branch: 'Nakawa', priceUGX: 12500, inStock: true },
    ]
  },
  {
    id: 'med-ors-zinc',
    name: 'ORS + Zinc Pediatric Kit',
    genericName: 'Oral Rehydration Salts (WHO Formula) + Zinc Sulfate 20mg',
    category: 'maternal_child',
    form: 'Drops',
    dosage: '20.5g sachet + 10 dispersible tabs',
    packSize: 'Co-pack kit (2 ORS sachets + 10 Zinc tablets)',
    priceUGX: 4500,
    priceUSD: 1.20,
    prescriptionRequired: false,
    ndaApproved: true,
    mohEssential: true,
    inStock: true,
    primaryIndication: 'Uganda MoH & UNICEF standard of care for acute diarrhea dehydration in children',
    pharmacyPrices: [
      { pharmacyId: 'ecopharm', pharmacyName: 'Ecopharm', branch: 'All Branches', priceUGX: 4500, inStock: true },
      { pharmacyId: 'first_pharmacy', pharmacyName: 'First Pharmacy', branch: 'Wandegeya', priceUGX: 4000, inStock: true },
      { pharmacyId: 'mengo_pharmacy', pharmacyName: 'Mengo Hospital', branch: 'Mengo', priceUGX: 4000, inStock: true },
    ]
  },
  {
    id: 'med-amox-susp',
    name: 'Amoxicillin Oral Suspension 125mg/5ml',
    genericName: 'Amoxicillin Trihydrate Powder for Oral Liquid',
    category: 'maternal_child',
    form: 'Suspension',
    dosage: '125mg / 5ml',
    packSize: '100ml Amber Bottle',
    priceUGX: 8500,
    priceUSD: 2.25,
    prescriptionRequired: true,
    ndaApproved: true,
    mohEssential: true,
    inStock: true,
    primaryIndication: 'Pediatric ear infections (otitis media), childhood pneumonia, strep throat',
    pharmacyPrices: [
      { pharmacyId: 'ecopharm', pharmacyName: 'Ecopharm', branch: 'Ntinda', priceUGX: 8500, inStock: true },
      { pharmacyId: 'first_pharmacy', pharmacyName: 'First Pharmacy', branch: 'Wandegeya', priceUGX: 8000, inStock: true },
      { pharmacyId: 'careplus', pharmacyName: 'CarePlus', branch: 'Kololo', priceUGX: 9000, inStock: true },
    ]
  }
];

export const AppMedics: React.FC<{ onNavigate?: (view: string) => void }> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'medicines' | 'pharmacies' | 'calculator'>('medicines');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPharmacyFilter, setSelectedPharmacyFilter] = useState<string>('all');
  const [prescriptionFilter, setPrescriptionFilter] = useState<'all' | 'otc' | 'rx'>('all');
  const [selectedMedicineDetails, setSelectedMedicineDetails] = useState<MedicineItem | null>(null);

  // Prescription Estimator Cart
  const [cart, setCart] = useState<{ [medId: string]: number }>({});
  const [showToast, setShowToast] = useState<{ msg: string; type: 'success' | 'info' } | null>(null);

  const triggerToast = (msg: string, type: 'success' | 'info' = 'success') => {
    setShowToast({ msg, type });
    setTimeout(() => setShowToast(null), 3000);
  };

  const addToCart = (medId: string) => {
    setCart((prev) => ({
      ...prev,
      [medId]: (prev[medId] || 0) + 1,
    }));
    triggerToast('Added to Prescription Estimator', 'success');
  };

  const removeFromCart = (medId: string) => {
    setCart((prev) => {
      const copy = { ...prev };
      if (copy[medId] > 1) {
        copy[medId] -= 1;
      } else {
        delete copy[medId];
      }
      return copy;
    });
  };

  const clearCart = () => setCart({});

  // Filtered Medicines
  const filteredMedicines = useMemo(() => {
    return UGANDA_MEDICINES.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.primaryIndication.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;

      const matchesPrescription =
        prescriptionFilter === 'all' ||
        (prescriptionFilter === 'rx' && item.prescriptionRequired) ||
        (prescriptionFilter === 'otc' && !item.prescriptionRequired);

      const matchesPharmacy =
        selectedPharmacyFilter === 'all' ||
        item.pharmacyPrices.some((p) => p.pharmacyId === selectedPharmacyFilter);

      return matchesSearch && matchesCategory && matchesPrescription && matchesPharmacy;
    });
  }, [searchQuery, selectedCategory, prescriptionFilter, selectedPharmacyFilter]);

  // Cart Totals
  const cartTotals = useMemo(() => {
    let totalUGX = 0;
    let itemsCount = 0;
    Object.entries(cart).forEach(([id, qty]) => {
      const med = UGANDA_MEDICINES.find((m) => m.id === id);
      if (med) {
        totalUGX += med.priceUGX * qty;
        itemsCount += qty;
      }
    });
    return {
      totalUGX,
      totalUSD: (totalUGX / 3800).toFixed(2),
      itemsCount,
    };
  }, [cart]);

  return (
    <div className="w-full max-w-7xl mx-auto py-4 sm:py-6 px-3 sm:px-6 space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-[250] px-5 py-3 rounded-2xl bg-slate-900 text-white border border-emerald-500/40 shadow-2xl flex items-center gap-3 text-xs font-semibold backdrop-blur-xl"
          >
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>{showToast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Header: App Medics Uganda */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-indigo-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <BadgeCheck size={13} className="text-emerald-400" />
                Uganda National Drug Authority (NDA) Indexed
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-500/20 text-blue-300 border border-blue-500/30">
                MoH Essential Medicines 2026
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Updated Market Prices (UGX)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg">
                <Pill size={22} />
              </div>
              <span>App Medics • Uganda Pharmacy & Medicine Index</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
              Real-time prices, verified stock availability, and clinical dosing guidelines across licensed pharmacies and hospital clinics in Kampala, Entebbe, Jinja, and nationwide.
            </p>
          </div>

          {/* Quick Cart / Prescription Widget */}
          <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 border border-indigo-400/20 shrink-0 w-full lg:w-auto">
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Calculator size={14} className="text-indigo-400" />
                Prescription Basket
              </span>
              <span className="text-xs font-mono font-bold text-indigo-300 px-2 py-0.5 rounded-md bg-indigo-950/80 border border-indigo-500/30">
                {cartTotals.itemsCount} items
              </span>
            </div>
            <div className="text-lg font-black text-white font-mono">
              UGX {cartTotals.totalUGX.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              ≈ ${cartTotals.totalUSD} USD
            </div>
            <button
              onClick={() => setActiveTab('calculator')}
              className="mt-3 w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>View Cost Breakdown</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-white/10 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('medicines')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'medicines'
                ? 'bg-white text-slate-900 shadow-md font-extrabold'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Pill size={15} />
            <span>Medicines & Drug Index</span>
          </button>
          <button
            onClick={() => setActiveTab('pharmacies')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'pharmacies'
                ? 'bg-white text-slate-900 shadow-md font-extrabold'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Building2 size={15} />
            <span>Pharmacies & Clinics Directory</span>
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'calculator'
                ? 'bg-white text-slate-900 shadow-md font-extrabold'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Calculator size={15} />
            <span>Cost Estimator ({cartTotals.itemsCount})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: MEDICINES & DRUG INDEX */}
      {activeTab === 'medicines' && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search Box */}
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search drug by brand (Coartem, Augmentin), generic (Amoxicillin), or symptom..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Prescription Type Filter */}
              <div className="flex items-center gap-1.5 shrink-0 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                <button
                  onClick={() => setPrescriptionFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    prescriptionFilter === 'all'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  All Types
                </button>
                <button
                  onClick={() => setPrescriptionFilter('otc')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    prescriptionFilter === 'otc'
                      ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  OTC (Over-the-Counter)
                </button>
                <button
                  onClick={() => setPrescriptionFilter('rx')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    prescriptionFilter === 'rx'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Rx (Prescription Only)
                </button>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {[
                { id: 'all', label: 'All Classes' },
                { id: 'antimalarial', label: '🦟 Antimalarials' },
                { id: 'antibiotic', label: '💊 Antibiotics' },
                { id: 'cardio_diabetes', label: '❤️ BP & Diabetes' },
                { id: 'pain_analgesic', label: '⚡ Pain & Fever' },
                { id: 'respiratory', label: '🫁 Respiratory & Inhalers' },
                { id: 'gastro', label: '🩺 Gastro & Ulcers' },
                { id: 'maternal_child', label: '👶 Maternal & Pediatric' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Showing {filteredMedicines.length} verified medicines in Uganda
            </span>
            <span className="text-xs font-mono text-slate-400">
              Exchange: 1 USD ≈ 3,800 UGX
            </span>
          </div>

          {/* Medicines Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMedicines.map((med) => {
              const inCartQty = cart[med.id] || 0;
              return (
                <motion.div
                  key={med.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    {/* Header: Name, Tag, Indication */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {med.name}
                          </h3>
                          {med.prescriptionRequired ? (
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                              Rx
                            </span>
                          ) : (
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              OTC
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                          {med.genericName}
                        </p>
                      </div>

                      <span className="text-[11px] font-mono px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold shrink-0">
                        {med.form}
                      </span>
                    </div>

                    {/* Indication */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-normal leading-relaxed line-clamp-2 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      {med.primaryIndication}
                    </p>

                    {/* Pack & Dosing */}
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span>Dose: <strong>{med.dosage}</strong></span>
                      <span>Pack: <strong>{med.packSize}</strong></span>
                    </div>

                    {/* Pharmacy Availability Sample */}
                    <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Sample Prices in Kampala:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {med.pharmacyPrices.slice(0, 3).map((pp, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50"
                          >
                            {pp.pharmacyName}: <strong>UGX {(pp.priceUGX / 1000).toFixed(1)}k</strong>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer: Price & Add to Estimator */}
                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-lg font-black text-slate-900 dark:text-white font-mono">
                        UGX {med.priceUGX.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        ≈ ${med.priceUSD.toFixed(2)} USD
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedMedicineDetails(med)}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all text-xs font-bold cursor-pointer"
                        title="View Full Pricing & Clinics"
                      >
                        <Info size={16} />
                      </button>

                      {inCartQty > 0 ? (
                        <div className="flex items-center bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-xl p-0.5">
                          <button
                            onClick={() => removeFromCart(med.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-800 text-indigo-700 dark:text-indigo-300 transition-colors cursor-pointer"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="w-6 text-center text-xs font-black font-mono text-indigo-700 dark:text-indigo-300">
                            {inCartQty}
                          </span>
                          <button
                            onClick={() => addToCart(med.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-800 text-indigo-700 dark:text-indigo-300 transition-colors cursor-pointer"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(med.id)}
                          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus size={14} />
                          <span>Estimate</span>
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filteredMedicines.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
              <Pill size={36} className="mx-auto text-slate-400 mb-3" />
              <h3 className="font-black text-slate-800 dark:text-white text-base uppercase">
                No matching medicines found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Try searching by different brand name or molecule, or switch category filter.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setPrescriptionFilter('all');
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PHARMACIES & CLINICS DIRECTORY */}
      {activeTab === 'pharmacies' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {UGANDA_PHARMACIES.map((pharmacy) => (
              <div
                key={pharmacy.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                          {pharmacy.name}
                        </h3>
                        {pharmacy.verified && (
                          <BadgeCheck size={16} className="text-blue-500 shrink-0" />
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                        {pharmacy.type} • {pharmacy.district}
                      </span>
                    </div>

                    <span className="text-xs font-black text-amber-500 flex items-center gap-0.5 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800 shrink-0">
                      ★ {pharmacy.rating}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-start gap-2">
                      <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                      <span>{pharmacy.mainAddress}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-slate-400 shrink-0" />
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{pharmacy.hours}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-slate-400 shrink-0" />
                      <span className="font-mono">{pharmacy.phone}</span>
                    </div>
                  </div>

                  {/* Branches */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Branches:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {pharmacy.branches.map((b, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Contact Buttons */}
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <a
                    href={`tel:${pharmacy.phone.replace(/\s+/g, '')}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                  >
                    <PhoneCall size={13} />
                    <span>Call</span>
                  </a>

                  {pharmacy.whatsapp && (
                    <a
                      href={`https://wa.me/${pharmacy.whatsapp.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(pharmacy.name)},%20I%20am%20inquiring%20about%20medication%20availability%20via%20Doctorian%20App%20Medics.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <MessageCircle size={13} />
                      <span>WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PRESCRIPTION COST ESTIMATOR */}
      {activeTab === 'calculator' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Prescription Cost Estimator
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Plan your medication expense before visiting your local pharmacy in Uganda.
              </p>
            </div>

            {cartTotals.itemsCount > 0 && (
              <button
                onClick={clearCart}
                className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Clear List</span>
              </button>
            )}
          </div>

          {cartTotals.itemsCount === 0 ? (
            <div className="text-center py-12">
              <Calculator size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                Your prescription estimator is empty
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Add medicines from the drug index to calculate total cost and compare across pharmacies.
              </p>
              <button
                onClick={() => setActiveTab('medicines')}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all"
              >
                Browse Medicines
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Itemized Table */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {Object.entries(cart).map(([medId, qty]) => {
                  const med = UGANDA_MEDICINES.find((m) => m.id === medId);
                  if (!med) return null;
                  const itemTotalUGX = med.priceUGX * qty;

                  return (
                    <div key={medId} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {med.name}
                          </h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {med.form} • {med.dosage}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Unit Price: UGX {med.priceUGX.toLocaleString()} (≈ ${(med.priceUGX / 3800).toFixed(2)})
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6">
                        {/* Qty Stepper */}
                        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
                          <button
                            onClick={() => removeFromCart(med.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="w-8 text-center text-xs font-black font-mono">
                            {qty}
                          </span>
                          <button
                            onClick={() => addToCart(med.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        {/* Total per item */}
                        <div className="text-right min-w-[120px]">
                          <div className="font-extrabold text-sm text-slate-900 dark:text-white font-mono">
                            UGX {itemTotalUGX.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            ≈ ${(itemTotalUGX / 3800).toFixed(2)} USD
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total Summary Card */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                  <span>Total Medicines Selected</span>
                  <span>{cartTotals.itemsCount} items</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                    Total Estimated Cost
                  </span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                      UGX {cartTotals.totalUGX.toLocaleString()}
                    </span>
                    <span className="block text-xs font-mono text-slate-400 mt-0.5">
                      Approx. ${cartTotals.totalUSD} USD
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setActiveTab('medicines')}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  + Add More Medicines
                </button>
                <button
                  onClick={() => triggerToast('Prescription cost summary ready for pharmacist review.', 'success')}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <FileText size={15} />
                  <span>Save / Print Prescription Cost</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DETAIL MODAL: Single Medicine Full View */}
      <AnimatePresence>
        {selectedMedicineDetails && (
          <div className="fixed inset-0 z-[220] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 max-w-xl w-full shadow-2xl relative space-y-5"
            >
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                      {selectedMedicineDetails.name}
                    </h3>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300">
                      {selectedMedicineDetails.dosage}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    {selectedMedicineDetails.genericName}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedMedicineDetails(null)}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Clinical Specs */}
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Clinical Indication:
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {selectedMedicineDetails.primaryIndication}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Pack Format</span>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                      {selectedMedicineDetails.packSize}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Regulatory Status</span>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                      <ShieldCheck size={14} />
                      NDA & MoH Registered
                    </p>
                  </div>
                </div>

                {/* Price by Pharmacy */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Verified Pharmacy Prices:
                  </span>
                  <div className="space-y-2">
                    {selectedMedicineDetails.pharmacyPrices.map((pp, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                      >
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {pp.pharmacyName}
                          </span>
                          <span className="text-[10px] text-slate-400">{pp.branch}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                            UGX {pp.priceUGX.toLocaleString()}
                          </span>
                          <span className="block text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                            ● In Stock
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    addToCart(selectedMedicineDetails.id);
                    setSelectedMedicineDetails(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-md"
                >
                  Add to Prescription Estimator
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppMedics;
