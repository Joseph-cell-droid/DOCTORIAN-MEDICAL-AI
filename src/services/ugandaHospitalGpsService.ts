/**
 * Uganda Hospital GPS & Regional Facility Intelligence Service
 * Dynamically resolves the closest hospital across all regions of Uganda
 * based on live device GPS coordinates or user-selected Ugandan district.
 */

export interface UgandaHospital {
  id: string;
  name: string;
  shortName: string;
  region: 'Central' | 'Western' | 'Northern' | 'Eastern' | 'West Nile' | 'Karamoja' | 'South Western';
  district: string;
  level: 'National Referral Hospital' | 'Regional Referral Hospital' | 'General Hospital' | 'Health Centre IV';
  latitude: number;
  longitude: number;
  photoUrl: string;
  addressHint: string;
  emergencyPhone: string;
  ambulanceHotline: string;
  bedCapacity: number;
  currentOccupancyRate: number; // baseline reference percentage
  specialties: string[];
  maternalEmergencyReady: boolean;
  icuAvailable: boolean;
  bloodBankActive: boolean;
}

export interface NearbyHospitalItem {
  hospital: UgandaHospital;
  distanceKm: number;
  estimatedArrivalMins: number;
  bearingDegrees: number;
  cardinal: string;
  directionText: string;
  googleMapsDirUrl: string;
}

export interface NearestHospitalResult {
  hospital: UgandaHospital;
  distanceKm: number;
  estimatedArrivalMins: number;
  bearingDegrees: number;
  cardinal: string;
  directionText: string;
  googleMapsDirUrl: string;
  isGpsLive: boolean;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export const UGANDA_HOSPITALS: UgandaHospital[] = [
  // ==================== CENTRAL (KAMPALA & SURROUNDINGS) ====================
  {
    id: 'mulago-national',
    name: 'Mulago National Specialized Hospital',
    shortName: 'Mulago Hospital',
    region: 'Central',
    district: 'Kampala (Kawempe Division)',
    level: 'National Referral Hospital',
    latitude: 0.3378,
    longitude: 32.5761,
    photoUrl: '/uganda_hospital_building.jpg',
    addressHint: 'Upper Mulago Hill Road, Kampala',
    emergencyPhone: '+256 414 554 001',
    ambulanceHotline: '+256 772 400 112',
    bedCapacity: 1500,
    currentOccupancyRate: 84,
    specialties: ['Trauma & Emergency', 'Cardiology & Cath Lab', 'Neurosurgery', 'Pediatrics', 'Oncology', 'ICU'],
    maternalEmergencyReady: true,
    icuAvailable: true,
    bloodBankActive: true
  },
  {
    id: 'kawempe-national',
    name: 'Kawempe National Referral Hospital',
    shortName: 'Kawempe Hospital',
    region: 'Central',
    district: 'Kampala (Kawempe)',
    level: 'National Referral Hospital',
    latitude: 0.3601,
    longitude: 32.5594,
    photoUrl: '/uganda_hospital_building.jpg',
    addressHint: 'Bombo Road, Kawempe Division, Kampala',
    emergencyPhone: '+256 414 568 200',
    ambulanceHotline: '+256 701 999 112',
    bedCapacity: 450,
    currentOccupancyRate: 79,
    specialties: ['Maternal & Neonatal Emergency', 'High-Risk Obstetrics', 'Gynecology', 'Pediatric ICU'],
    maternalEmergencyReady: true,
    icuAvailable: true,
    bloodBankActive: true
  },
  {
    id: 'kiruddu-national',
    name: 'Kiruddu National Referral Hospital',
    shortName: 'Kiruddu Hospital',
    region: 'Central',
    district: 'Kampala (Makindye)',
    level: 'National Referral Hospital',
    latitude: 0.2605,
    longitude: 32.6186,
    photoUrl: '/uganda_hospital_building.jpg',
    addressHint: 'Salaama Road, Kiruddu, Makindye',
    emergencyPhone: '+256 414 266 010',
    ambulanceHotline: '+256 782 555 119',
    bedCapacity: 450,
    currentOccupancyRate: 82,
    specialties: ['Severe Burns ICU', 'Nephrology & Hemodialysis', 'Internal Medicine', 'Infectious Diseases'],
    maternalEmergencyReady: true,
    icuAvailable: true,
    bloodBankActive: true
  },
  {
    id: 'naguru-friendship',
    name: 'China-Uganda Friendship Hospital Naguru',
    shortName: 'Naguru General Hospital',
    region: 'Central',
    district: 'Kampala (Nakawa)',
    level: 'General Hospital',
    latitude: 0.3325,
    longitude: 32.6075,
    photoUrl: '/uganda_hospital_building.jpg',
    addressHint: 'Naguru Hill, Nakawa Division, Kampala',
    emergencyPhone: '+256 414 287 400',
    ambulanceHotline: '+256 704 112 233',
    bedCapacity: 300,
    currentOccupancyRate: 76,
    specialties: ['Emergency Surgery', 'Pediatrics', 'Obstetrics', 'Orthopedics'],
    maternalEmergencyReady: true,
    icuAvailable: true,
    bloodBankActive: true
  },
  {
    id: 'entebbe-regional',
    name: 'Entebbe Regional Referral Hospital',
    shortName: 'Entebbe Hospital',
    region: 'Central',
    district: 'Wakiso (Entebbe Municipality)',
    level: 'Regional Referral Hospital',
    latitude: 0.0528,
    longitude: 32.4637,
    photoUrl: '/hospitals/jinja.jpg',
    addressHint: 'Circular Road, Entebbe Municipality (near Lake Victoria)',
    emergencyPhone: '+256 414 320 024',
    ambulanceHotline: '+256 772 321 445',
    bedCapacity: 280,
    currentOccupancyRate: 71,
    specialties: ['Aviation & Airport Trauma', 'Infectious Disease Isolation', 'Surgery', 'Maternal Child Health'],
    maternalEmergencyReady: true,
    icuAvailable: true,
    bloodBankActive: true
  },
  {
    id: 'rubaga-hospital',
    name: 'Rubaga Hospital (Uganda Martyrs)',
    shortName: 'Rubaga Hospital',
    region: 'Central',
    district: 'Kampala (Lubaga)',
    level: 'General Hospital',
    latitude: 0.3039,
    longitude: 32.5528,
    photoUrl: '/uganda_hospital_building.jpg',
    addressHint: 'Rubaga Hill Road, Kampala',
    emergencyPhone: '+256 414 270 203',
    ambulanceHotline: '+256 776 270 203',
    bedCapacity: 275,
    currentOccupancyRate: 68,
    specialties: ['Emergency Trauma', 'General Surgery', 'Cardiology', 'Pediatrics'],
    maternalEmergencyReady: true,
    icuAvailable: true,
    bloodBankActive: true
  },
  {
    id: 'mengo-hospital',
    name: 'Mengo Hospital (Namirembe)',
    shortName: 'Mengo Hospital',
    region: 'Central',
    district: 'Kampala (Namirembe Hill)',
    level: 'General Hospital',
    latitude: 0.3122,
    longitude: 32.5606,
    photoUrl: '/uganda_hospital_building.jpg',
    addressHint: 'Albert Cook Road, Namirembe Hill, Kampala',
    emergencyPhone: '+256 414 270 222',
    ambulanceHotline: '+256 772 270 222',
    bedCapacity: 300,
    currentOccupancyRate: 74,
    specialties: ['Ophthalmology & Eye Surgery', 'Emergency Care', 'Dental', 'Maternity'],
    maternalEmergencyReady: true,
    icuAvailable: true,
    bloodBankActive: true
  },
  {
    id: 'nsambya-hospital',
    name: 'St. Francis Hospital Nsambya',
    shortName: 'Nsambya Hospital',
    region: 'Central',
    district: 'Kampala (Makindye)',
    level: 'General Hospital',
    latitude: 0.2975,
    longitude: 32.5892,
    photoUrl: '/uganda_hospital_building.jpg',
    addressHint: 'Nsambya Hill, Ggaba Road, Kampala',
    emergencyPhone: '+256 414 267 012',
    ambulanceHotline: '+256 702 267 012',
    bedCapacity: 360,
    currentOccupancyRate: 78,
    specialties: ['Cancer Treatment & Oncology', 'Cardiology', 'Neurosurgery', 'Pediatrics'],
    maternalEmergencyReady: true,
    icuAvailable: true,
    bloodBankActive: true
  },
  {
    id: 'mukono-general',
    name: 'Mukono General Hospital',
    shortName: 'Mukono Hospital',
    region: 'Central',
    district: 'Mukono',
    level: 'General Hospital',
    latitude: 0.3542,
    longitude: 32.7528,
    photoUrl: '/uganda_hospital_building.jpg',
    addressHint: 'Jinja-Kampala Highway, Mukono Town',
    emergencyPhone: '+256 414 290 120',
    ambulanceHotline: '+256 788 123 999',
    bedCapacity: 200,
    currentOccupancyRate: 65,
    specialties: ['Highway Emergency Trauma', 'Maternity', 'General Surgery'],
    maternalEmergencyReady: true,
    icuAvailable: false,
    bloodBankActive: true
  },
  {
    id: 'luwero-hospital',
    name: 'Luwero General Hospital',
    shortName: 'Luwero Hospital',
    region: 'Central',
    district: 'Luwero',
    level: 'General Hospital',
    latitude: 0.8358,
    longitude: 32.4975,
    photoUrl: '/hospitals/lira.jpg',
    addressHint: 'Gulu Highway, Kasana, Luwero',
    emergencyPhone: '+256 414 610 240',
    ambulanceHotline: '+256 777 610 240',
    bedCapacity: 150,
    currentOccupancyRate: 62,
    specialties: ['Trauma Center', 'Obstetrics & Gynecology', 'Pediatrics'],
    maternalEmergencyReady: true,
    icuAvailable: false,
    bloodBankActive: true
  },

  // ==================== WESTERN UGANDA ====================
  {
    id: 'mbarara-regional',
    name: 'Mbarara Regional Referral Hospital',
    shortName: 'Mbarara Hospital',
    region: 'Western',
    district: 'Mbarara City',
    level: 'Regional Referral Hospital',
    latitude: -0.6125,
    longitude: 30.6586,
    photoUrl: '/hospitals/mbarara.jpg',
    addressHint: 'Kabale Road, opposite Mbarara University (MUST)',
    emergencyPhone: '+256 485 420 021',
    ambulanceHotline: '+256 772 485 021',
    bedCapacity: 600,
    currentOccupancyRate: 86,
    specialties: ['University Teaching Hospital', 'Cardiology & Cath Lab', 'Surgery & Trauma', 'Pediatric Oncology'],
    maternalEmergencyReady: true,
    icuAvailable: true,
    bloodBankActive: true
  },
  {
    id: 'fort-portal-regional',
    name: 'Fort Portal Regional Referral Hospital (Buhinga)',
    shortName: 'Fort Portal Hospital',
    region: 'Western',
    district: 'Kabarole / Fort Portal Tourism City',
    level: 'Regional Referral Hospital',
    latitude: 0.6558,
    longitude: 30.2742,
    photoUrl: '/hospitals/mbarara.jpg',
    addressHint: 'Buhinga Hill, Fort Portal City',
    emergencyPhone: '+256 483 422 052',
    ambulanceHotline: '+256 782 422 052',
    bedCapacity: 350,
    currentOccupancyRate: 75,
    specialties: ['Orthopedic Surgery', 'Emergency Response', 'Maternal Child Care', 'Internal Medicine'],
    maternalEmergencyReady: true,
    icuAvailable: true,
    bloodBankActive: true
  },
  {
    id: 'kabale-regional',
    name: 'Kabale Regional Referral Hospital',
    shortName: 'Kabale Hospital',
    region: 'South Western',
    district: 'Kabale (Kigezi Region)',
    level: 'Regional Referral Hospital',
    latitude: -1.2522,
    longitude: 29.9886,
    photoUrl: '/hospitals/mbarara.jpg',
    addressHint: 'Makanga Hill, Kabale Municipality',
    emergencyPhone: '+256 486 422 033',
    ambulanceHotline: '+256 774 422 033',
    bedCapacity: 280,
    currentOccupancyRate: 70,
    specialties: ['High Altitude Respiratory Medicine', 'Trauma Surgery', 'Maternity', 'Pediatrics'],
    maternalEmergencyReady: true,
    icuAvailable: true,
    bloodBankActive: true
  },
  {
    id: 'hoima-regional',
    name: 'Hoima Regional Referral Hospital',
    shortName: 'Hoima Hospital',
    region: 'Western',
    district: 'Hoima City (Bunyoro Region)',
    level: 'Regional Referral Hospital',
    latitude: 1.4328,
    longitude: 31.3533,
    photoUrl: '/hospitals/mbarara.jpg',
    addressHint: 'Old Tooro Road, Hoima City',
    emergencyPhone: '+256 465 440 011',
    ambulanceHotline: '+256 772 440 011',
    bedCapacity: 320,
    currentOccupancyRate: 78,
    specialties: ['Albertine Oil Region Trauma Care', 'Emergency Surgery', 'Dialysis Unit', 'Maternal Health'],
    maternalEmergencyReady: true,
    icuAvailable: true,
    bloodBankActive: true
  },
  {
    id: 'masaka-regional',
    name: 'Masaka Regional Referral Hospital',
    shortName: 'Masaka Hospital',
    region: 'Central',
    district: 'Masaka City (Greater Masaka)',
    level: 'Regional Referral Hospital',
    latitude: -0.3347,
    longitude: 31.7378,
    photoUrl: '/uganda_hospital_building.jpg',
    addressHint: 'Alex Ssebowa Road, Masaka City',
    emergencyPhone: '+256 481 420 018',
    ambulanceHotline: '+256 772 420 018',
    bedCapacity: 400,
    currentOccupancyRate: 80,
    specialties: ['Highway Emergency Triage (Masaka-Mbarara Hwy)', 'Surgery', 'Neonatal ICU', 'Orthopedics'],
    maternalEmergencyReady: true,
    icuAvailable: true,
    bloodBankActive: true
  },
  {
    id: 'ishaka-adventist',
    name: 'Ishaka Adventist Hospital',
    shortName: 'Ishaka Hospital',
    region: 'Western',
    district: 'Bushenyi',
    level: 'General Hospital',
    latitude: -0.5408,
    longitude: 30.1383,
    photoUrl: '/hospitals/mbarara.jpg',
    addressHint: 'Kasese-Mbarara Highway, Ishaka Town',
    emergencyPhone: '+256 485 443 001',
    ambulanceHotline: '+256 782 443 001',
    bedCapacity: 220,
    currentOccupancyRate: 67,
    specialties: ['General Medicine', 'Maternity', 'Surgery', 'Community Outreach'],
    maternalEmergencyReady: true,
    icuAvailable: false,
    bloodBankActive: true
  },

  // ==================== NORTHERN UGANDA ====================
  {
    id: 'gulu-regional',
    name: 'Gulu Regional Referral Hospital',
    shortName: 'Gulu Hospital',
    region: 'Northern',
    district: 'Gulu City (Acholi Region)',
    level: 'Regional Referral Hospital',
    latitude: 2.7744,
    longitude: 32.2989,
    photoUrl: '/hospitals/gulu.jpg',
    addressHint: 'Laroo Division, near Kaunda Grounds, Gulu City',
    emergencyPhone: '+256 471 432 022',
    ambulanceHotline: '+256 772 432 022',
    bedCapacity: 400,
    currentOccupancyRate: 83,
    specialties: ['Trauma Center', 'Mental Health Hub', 'Surgery', 'Maternal & Child Health', 'Infectious Diseases'],
    maternalEmergencyReady: true,
    icuAvailable: true,
    bloodBankActive: true
  },
  {
    id: 'lacor-hospital',
    name: "St. Mary's Hospital Lacor, Gulu",
    shortName: 'Lacor Hospital',
    region: 'Northern',
    district: 'Gulu',
    level: 'General Hospital',
    latitude: 2.7661,
    longitude: 32.2536,
    photoUrl: '/hospitals/gulu.jpg',
    addressHint: 'Juba Road (6 km West of Gulu City Center)',
    emergencyPhone: '+256 471 432 245',
    ambulanceHotline: '+256 772 432 245',
    bedCapacity: 500,
    currentOccupancyRate: 88,
    specialties: ['Renowned Surgical & Trauma Hub', 'Pediatric ICU', 'Oncology', 'Maternity'],
    maternalEmergencyReady: true,
    icuAvailable: true,
    bloodBankActive: true
  },
  {
    id: 'arua-regional',
    name: 'Arua Regional Referral Hospital',
    shortName: 'Arua Hospital',
    region: 'West Nile',
    district: 'Arua City (West Nile Region)',
    level: 'Regional Referral Hospital',
    latitude: 3.0311,
    longitude: 30.9108,
    photoUrl: '/hospitals/arua.jpg',
    addressHint: 'Hospital Road, Arua Hill Division, Arua City',
    emergencyPhone: '+256 476 420 025',
    ambulanceHotline: '+256 772 420 025',
    bedCapacity: 380,
    currentOccupancyRate: 85,
    specialties: ['Border Regional Referral', 'Surgery', 'Malaria Center of Excellence', 'Neonatal Care'],
    maternalEmergencyReady: true,
    icuAvailable: true,
    bloodBankActive: true
  },
  {
    id: 'lira-regional',
    name: 'Lira Regional Referral Hospital',
    shortName: 'Lira Hospital',
    region: 'Northern',
    district: 'Lira City (Lango Region)',
    level: 'Regional Referral Hospital',
    latitude: 2.2472,
    longitude: 32.9011,
    photoUrl: '/hospitals/lira.jpg',
    addressHint: 'Police Road / Soroti Highway, Lira City',
    emergencyPhone: '+256 473 420 011',
    ambulanceHotline: '+256 772 420 011',
    bedCapacity: 350,
    currentOccupancyRate: 77,
    specialties: ['Surgery', 'Obstetrics & Gynecology', 'Pediatrics', 'Tuberculosis & HIV'],
    maternalEmergencyReady: true,
    icuAvailable: true,
    bloodBankActive: true
  },
  {
    id: 'moroto-regional',
    name: 'Moroto Regional Referral Hospital',
    shortName: 'Moroto Hospital',
    region: 'Karamoja',
    district: 'Moroto (Karamoja Region)',
    level: 'Regional Referral Hospital',
    latitude: 2.5317,
    longitude: 34.6678,
    photoUrl: '/hospitals/mbale.jpg',
    addressHint: 'Circular Road, Moroto Municipality (near Mt. Moroto)',
    emergencyPhone: '+256 454 470 012',
    ambulanceHotline: '+256 782 470 012',
    bedCapacity: 200,
    currentOccupancyRate: 69,
    specialties: ['Severe Acute Malnutrition Clinic', 'Trauma Emergency', 'Maternal Child Health'],
    maternalEmergencyReady: true,
    icuAvailable: false,
    bloodBankActive: true
  },
  {
    id: 'kitgum-general',
    name: 'Kitgum General Hospital',
    shortName: 'Kitgum Hospital',
    region: 'Northern',
    district: 'Kitgum',
    level: 'General Hospital',
    latitude: 3.2944,
    longitude: 32.8803,
    photoUrl: '/hospitals/gulu.jpg',
    addressHint: 'Uringi Road, Kitgum Municipality',
    emergencyPhone: '+256 471 439 011',
    ambulanceHotline: '+256 772 439 011',
    bedCapacity: 200,
    currentOccupancyRate: 72,
    specialties: ['Maternal Emergency', 'Surgery', 'Malaria & Infectious Diseases'],
    maternalEmergencyReady: true,
    icuAvailable: false,
    bloodBankActive: true
  },

  // ==================== EASTERN UGANDA ====================
  {
    id: 'jinja-regional',
    name: 'Jinja Regional Referral Hospital',
    shortName: 'Jinja Hospital',
    region: 'Eastern',
    district: 'Jinja City (Busoga Region)',
    level: 'Regional Referral Hospital',
    latitude: 0.4286,
    longitude: 33.2036,
    photoUrl: '/hospitals/jinja.jpg',
    addressHint: 'Nalufenya / Rotary Road, near Lake Victoria shore, Jinja City',
    emergencyPhone: '+256 434 120 011',
    ambulanceHotline: '+256 772 120 011',
    bedCapacity: 500,
    currentOccupancyRate: 82,
    specialties: ['Industrial & Highway Trauma', 'Pediatrics', 'Obstetrics', 'Dialysis'],
    maternalEmergencyReady: true,
    icuAvailable: true,
    bloodBankActive: true
  },
  {
    id: 'mbale-regional',
    name: 'Mbale Regional Referral Hospital',
    shortName: 'Mbale Hospital',
    region: 'Eastern',
    district: 'Mbale City (Bugisu Region)',
    level: 'Regional Referral Hospital',
    latitude: 1.0772,
    longitude: 34.1758,
    photoUrl: '/hospitals/mbale.jpg',
    addressHint: 'Pallisa Road, Mbale City (Mt. Elgon Foothills)',
    emergencyPhone: '+256 454 433 018',
    ambulanceHotline: '+256 772 433 018',
    bedCapacity: 450,
    currentOccupancyRate: 84,
    specialties: ['University Teaching Hospital', 'Emergency Surgery', 'Cardiac Clinic', 'Maternal Emergency'],
    maternalEmergencyReady: true,
    icuAvailable: true,
    bloodBankActive: true
  },
  {
    id: 'soroti-regional',
    name: 'Soroti Regional Referral Hospital',
    shortName: 'Soroti Hospital',
    region: 'Eastern',
    district: 'Soroti City (Teso Region)',
    level: 'Regional Referral Hospital',
    latitude: 1.7147,
    longitude: 33.6111,
    photoUrl: '/hospitals/lira.jpg',
    addressHint: 'Hospital Road, Soroti City Center',
    emergencyPhone: '+256 454 461 022',
    ambulanceHotline: '+256 772 461 022',
    bedCapacity: 300,
    currentOccupancyRate: 76,
    specialties: ['Emergency Surgery', 'Pediatrics', 'Maternal Child Health', 'Snakebite Envenomation Center'],
    maternalEmergencyReady: true,
    icuAvailable: true,
    bloodBankActive: true
  },
  {
    id: 'iganga-general',
    name: 'Iganga General Hospital',
    shortName: 'Iganga Hospital',
    region: 'Eastern',
    district: 'Iganga',
    level: 'General Hospital',
    latitude: 0.6125,
    longitude: 33.4739,
    photoUrl: '/hospitals/jinja.jpg',
    addressHint: 'Nakavule, Kampala-Tororo Highway, Iganga',
    emergencyPhone: '+256 434 242 011',
    ambulanceHotline: '+256 772 242 011',
    bedCapacity: 180,
    currentOccupancyRate: 73,
    specialties: ['Highway Accident Emergency', 'Maternity', 'Surgery'],
    maternalEmergencyReady: true,
    icuAvailable: false,
    bloodBankActive: true
  },
  {
    id: 'tororo-general',
    name: 'Tororo General Hospital',
    shortName: 'Tororo Hospital',
    region: 'Eastern',
    district: 'Tororo',
    level: 'General Hospital',
    latitude: 0.6931,
    longitude: 34.1814,
    photoUrl: '/hospitals/mbale.jpg',
    addressHint: 'Mbale-Tororo Road, Tororo Municipality',
    emergencyPhone: '+256 454 444 022',
    ambulanceHotline: '+256 772 444 022',
    bedCapacity: 200,
    currentOccupancyRate: 68,
    specialties: ['Border Emergency Care', 'General Medicine', 'Maternity'],
    maternalEmergencyReady: true,
    icuAvailable: false,
    bloodBankActive: true
  }
];

/**
 * Calculates distance in kilometers between two GPS coordinates using Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Calculates initial compass bearing (0-359 deg) from phone coordinates to hospital coordinates
 */
export function calculateBearingDegrees(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLon);
  const theta = Math.atan2(y, x);
  return Math.round(((theta * 180) / Math.PI + 360) % 360);
}

export function getCardinalDirection(degrees: number): { cardinal: string; fullName: string } {
  const dirs = [
    { cardinal: 'N', fullName: 'North' },
    { cardinal: 'NNE', fullName: 'North-Northeast' },
    { cardinal: 'NE', fullName: 'Northeast' },
    { cardinal: 'ENE', fullName: 'East-Northeast' },
    { cardinal: 'E', fullName: 'East' },
    { cardinal: 'ESE', fullName: 'East-Southeast' },
    { cardinal: 'SE', fullName: 'Southeast' },
    { cardinal: 'SSE', fullName: 'South-Southeast' },
    { cardinal: 'S', fullName: 'South' },
    { cardinal: 'SSW', fullName: 'South-Southwest' },
    { cardinal: 'SW', fullName: 'Southwest' },
    { cardinal: 'WSW', fullName: 'West-Southwest' },
    { cardinal: 'W', fullName: 'West' },
    { cardinal: 'WNW', fullName: 'West-Northwest' },
    { cardinal: 'NW', fullName: 'Northwest' },
    { cardinal: 'NNW', fullName: 'North-Northwest' }
  ];
  const idx = Math.round((degrees % 360) / 22.5) % 16;
  return dirs[idx];
}

export function buildGoogleMapsDirectionsUrl(fromLat: number, fromLon: number, toLat: number, toLon: number): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${fromLat.toFixed(5)},${fromLon.toFixed(5)}&destination=${toLat.toFixed(5)},${toLon.toFixed(5)}&travelmode=driving`;
}

export function buildDirectionGuidance(
  hospital: UgandaHospital,
  distanceKm: number,
  bearingDegrees: number,
  etaMins: number
): { cardinal: string; directionText: string } {
  const { cardinal, fullName } = getCardinalDirection(bearingDegrees);
  if (distanceKm <= 1.2) {
    return {
      cardinal,
      directionText: `You are right in ${hospital.district} (${distanceKm} km, ~${etaMins} min) — head ${fullName} along ${hospital.addressHint}`
    };
  }
  return {
    cardinal,
    directionText: `Head ${fullName} (${bearingDegrees}° ${cardinal}) for ${distanceKm} km (~${etaMins} min drive) toward ${hospital.addressHint}`
  };
}

/**
 * Returns all Ugandan hospitals sorted from closest to furthest relative to phone coordinates
 */
export function getNearbyHospitalsSorted(lat: number, lon: number, limit: number = 8): NearbyHospitalItem[] {
  return UGANDA_HOSPITALS.map((h) => {
    const distanceKm = calculateDistanceKm(lat, lon, h.latitude, h.longitude);
    const estimatedArrivalMins = Math.max(3, Math.round((distanceKm / 38) * 60 + 4));
    const bearingDegrees = calculateBearingDegrees(lat, lon, h.latitude, h.longitude);
    const { cardinal, directionText } = buildDirectionGuidance(h, distanceKm, bearingDegrees, estimatedArrivalMins);
    return {
      hospital: h,
      distanceKm,
      estimatedArrivalMins,
      bearingDegrees,
      cardinal,
      directionText,
      googleMapsDirUrl: buildGoogleMapsDirectionsUrl(lat, lon, h.latitude, h.longitude)
    };
  })
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}

/**
 * Finds the nearest Ugandan hospital for given latitude and longitude coordinates
 */
export function findNearestUgandanHospital(
  lat: number,
  lon: number,
  isLiveGps: boolean = true
): NearestHospitalResult {
  let closest: UgandaHospital = UGANDA_HOSPITALS[0];
  let minDistance = Infinity;

  for (const hospital of UGANDA_HOSPITALS) {
    const dist = calculateDistanceKm(lat, lon, hospital.latitude, hospital.longitude);
    if (dist < minDistance) {
      minDistance = dist;
      closest = hospital;
    }
  }

  const estimatedArrivalMins = Math.max(3, Math.round((minDistance / 38) * 60 + 4));
  const bearingDegrees = calculateBearingDegrees(lat, lon, closest.latitude, closest.longitude);
  const { cardinal, directionText } = buildDirectionGuidance(closest, minDistance, bearingDegrees, estimatedArrivalMins);

  return {
    hospital: closest,
    distanceKm: minDistance,
    estimatedArrivalMins,
    bearingDegrees,
    cardinal,
    directionText,
    googleMapsDirUrl: buildGoogleMapsDirectionsUrl(lat, lon, closest.latitude, closest.longitude),
    isGpsLive: isLiveGps,
    coordinates: {
      latitude: lat,
      longitude: lon
    }
  };
}

/**
 * Predefined Ugandan districts / cities for manual selection or offline fallback
 */
export const UGANDA_REGIONAL_CENTERS: Record<string, { lat: number; lon: number; name: string }> = {
  'Kampala': { lat: 0.3476, lon: 32.5825, name: 'Kampala Capital' },
  'Lira': { lat: 2.2499, lon: 32.8998, name: 'Lira City (Lango)' },
  'Gulu': { lat: 2.7724, lon: 32.2881, name: 'Gulu City (Northern)' },
  'Mbarara': { lat: -0.6072, lon: 30.6545, name: 'Mbarara City (Western)' },
  'Arua': { lat: 3.0201, lon: 30.9111, name: 'Arua City (West Nile)' },
  'Mbale': { lat: 1.0821, lon: 34.1750, name: 'Mbale City (Eastern)' },
  'Jinja': { lat: 0.4390, lon: 33.2032, name: 'Jinja City (Busoga)' },
  'Soroti': { lat: 1.7147, lon: 33.6111, name: 'Soroti City (Teso)' },
  'Entebbe': { lat: 0.0512, lon: 32.4637, name: 'Entebbe / Wakiso South' },
  'Mukono': { lat: 0.3542, lon: 32.7528, name: 'Mukono / Greater Kampala' },
  'Fort Portal': { lat: 0.6558, lon: 30.2742, name: 'Fort Portal (Kabarole)' },
  'Masaka': { lat: -0.3347, lon: 31.7378, name: 'Masaka City' },
  'Kabale': { lat: -1.2522, lon: 29.9886, name: 'Kabale (Kigezi)' },
  'Hoima': { lat: 1.4328, lon: 31.3533, name: 'Hoima City (Bunyoro)' },
  'Moroto': { lat: 2.5317, lon: 34.6678, name: 'Moroto (Karamoja)' },
  'Kitgum': { lat: 3.2944, lon: 32.8803, name: 'Kitgum (Acholi North)' },
  'Bushenyi': { lat: -0.5408, lon: 30.1383, name: 'Bushenyi / Ishaka' },
  'Iganga': { lat: 0.6125, lon: 33.4739, name: 'Iganga (Eastern)' },
  'Tororo': { lat: 0.6931, lon: 34.1814, name: 'Tororo (Border)' },
};

const STORAGE_KEY = 'doctorian_nearest_hospital';

/**
 * Get the stored nearest hospital (normalized with photoUrl & direction fields)
 */
export function getSavedHospitalResult(): NearestHospitalResult {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<NearestHospitalResult>;
      const match = UGANDA_HOSPITALS.find((h) => h.id === parsed?.hospital?.id);
      if (match && parsed.coordinates) {
        const dist = calculateDistanceKm(parsed.coordinates.latitude, parsed.coordinates.longitude, match.latitude, match.longitude);
        const eta = Math.max(3, Math.round((dist / 38) * 60 + 4));
        const bearing = calculateBearingDegrees(parsed.coordinates.latitude, parsed.coordinates.longitude, match.latitude, match.longitude);
        const { cardinal, directionText } = buildDirectionGuidance(match, dist, bearing, eta);
        return {
          hospital: match,
          distanceKm: dist,
          estimatedArrivalMins: eta,
          bearingDegrees: bearing,
          cardinal,
          directionText,
          googleMapsDirUrl: buildGoogleMapsDirectionsUrl(parsed.coordinates.latitude, parsed.coordinates.longitude, match.latitude, match.longitude),
          isGpsLive: Boolean(parsed.isGpsLive),
          coordinates: parsed.coordinates
        };
      }
    }
  } catch (err) {
    console.warn('[GPS] Error reading saved hospital:', err);
  }
  return findNearestUgandanHospital(0.3476, 32.5825, false);
}

/**
 * Save hospital result and broadcast change event
 */
export function saveHospitalResult(result: NearestHospitalResult) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    window.dispatchEvent(new CustomEvent('doctorian_hospital_updated', { detail: result }));
  } catch (err) {
    console.warn('[GPS] Error saving hospital result:', err);
  }
}

/**
 * Initiates live browser GPS detection
 */
export function requestLiveGpsHospital(): Promise<NearestHospitalResult> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      const fallback = getSavedHospitalResult();
      resolve(fallback);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const result = findNearestUgandanHospital(latitude, longitude, true);
        saveHospitalResult(result);
        resolve(result);
      },
      (err) => {
        console.info('[GPS] Geolocation prompt declined or unavailable:', err.message);
        const fallback = getSavedHospitalResult();
        resolve({ ...fallback, isGpsLive: false });
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 30000
      }
    );
  });
}

/**
 * Continuous live GPS location watch (auto-switches hospital photo & distance when phone moves)
 */
export function watchLiveGpsHospital(onChange: (res: NearestHospitalResult) => void): () => void {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return () => {};
  }
  const watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const result = findNearestUgandanHospital(pos.coords.latitude, pos.coords.longitude, true);
      saveHospitalResult(result);
      onChange(result);
    },
    () => {},
    { enableHighAccuracy: true, maximumAge: 15000, timeout: 10000 }
  );
  return () => navigator.geolocation.clearWatch(watchId);
}
