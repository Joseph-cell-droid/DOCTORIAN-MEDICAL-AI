/**
 * Offline-First Clinical Pharmacy Prescription Database Engine
 * Implements structured client-side storage for:
 * 1. Patients
 * 2. Doctors
 * 3. Prescriptions
 * 4. Medicines
 * 5. Medication Logs (Intakes)
 * 6. Reminders
 * 7. Notifications
 * 8. Synchronization Records
 * 
 * Support for simulated online/offline states and database synchronization queueing.
 */

import { encryptSync, decryptSync } from './secureStorageBackup';

export interface Patient {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  allergies: string;
  conditions: string;
  complianceRate: number; // calculated percentage (taken vs total)
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  whatsappNumber: string;
  signature: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  date: string; // YYYY-MM-DD
  diagnosis: string;
  followUpDate: string; // YYYY-MM-DD
  qrCodeValue: string; // serialized data
  synced: boolean;
}

export interface Medicine {
  id: string;
  prescriptionId: string;
  name: string;
  dosage: string;
  frequency: string; // e.g. "Daily", "Twice daily", "Three times daily"
  duration: string; // e.g. "7 Days", "30 Days"
  reminderTimes: string[]; // e.g. ["08:00", "20:00"]
  synced: boolean;
}

export interface MedicationLog {
  id: string;
  medicineId: string;
  prescriptionId: string;
  patientId: string;
  scheduledTime: string; // HH:MM
  scheduledDate: string; // YYYY-MM-DD
  takenAt: string | null; // ISO timestamp or null if missed/pending
  status: 'pending' | 'taken' | 'missed';
  synced: boolean;
  
  // Medication Verification System Fields
  verificationMethod?: 'photo' | 'video' | 'scan' | 'self';
  verificationUrl?: string; // photo/video path or thumbnail base64
  verificationName?: string; // filename or scanned barcode/QR value
  aiQuestion?: string;
  aiAnswer?: string;
  confidenceScore?: number; // 0 to 100
  caregiverVerified?: boolean;
  caregiverVerifiedBy?: string;
  caregiverVerifiedAt?: string;
  anomalyDetected?: boolean;
  anomalyReason?: string;

  // Dynamic compatibility fields
  medicineName?: string;
  dosage?: string;
  logDate?: string;
  reminderTime?: string;
}

export interface Reminder {
  id: string;
  medicineId: string;
  prescriptionId: string;
  time: string; // HH:MM
  isActive: boolean;
}

export interface PrescriptionNotification {
  id: string;
  recipientId: string; // patientId
  title: string;
  content: string;
  type: 'reminder' | 'sync' | 'alert';
  read: boolean;
  createdAt: string; // ISO
}

export interface SyncRecord {
  id: string;
  entityType: 'patients' | 'doctors' | 'prescriptions' | 'medicines' | 'medication_logs' | 'reminders' | 'notifications';
  entityId: string;
  action: 'create' | 'update' | 'delete';
  status: 'pending' | 'success';
  timestamp: string; // ISO
}

// Keys for LocalStorage
const STORAGE_KEYS = {
  PATIENTS: 'rx_offline_patients',
  DOCTORS: 'rx_offline_doctors',
  PRESCRIPTIONS: 'rx_offline_prescriptions',
  MEDICINES: 'rx_offline_medicines',
  LOGS: 'rx_offline_logs',
  REMINDERS: 'rx_offline_reminders',
  NOTIFICATIONS: 'rx_offline_notifications',
  SYNC: 'rx_offline_sync',
  ONLINE_STATUS: 'rx_offline_online_status'
};

// Seed Data
const SEED_PATIENTS: Patient[] = [
  { id: 'PAT-001', name: 'Alex Tumusiime', email: 'alex.tumusiime@gmail.com', age: 42, gender: 'Male', allergies: 'Penicillin', conditions: 'Chronic Hypertension', complianceRate: 80 },
  { id: 'PAT-002', name: 'Sarah Nabakooza', email: 'sarah.nabakooza@yahoo.com', age: 29, gender: 'Female', allergies: 'Sulfa Drugs', conditions: 'Type 2 Diabetes', complianceRate: 60 },
  { id: 'PAT-003', name: 'Brian Mukasa', email: 'brian.mukasa@gmail.com', age: 55, gender: 'Male', allergies: 'Aspirin', conditions: 'Hypercholesterolemia', complianceRate: 90 }
];

const SEED_DOCTORS: Doctor[] = [
  { id: 'DOC-001', name: 'Dr. Florence Alaro', specialty: 'Senior Consultant Cardiologist', whatsappNumber: '+256 702 445566', signature: 'Dr. F. Alaro, MD' },
  { id: 'DOC-002', name: 'Dr. Joseph Brian', specialty: 'Clinical Pharmacologist & General Practitioner', whatsappNumber: '+256 772 112233', signature: 'Dr. J. Brian, PharmD' }
];

const SEED_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'RX-901',
    patientId: 'PAT-001',
    doctorId: 'DOC-001',
    date: '2026-07-04',
    diagnosis: 'Essential Hypertension Stage II',
    followUpDate: '2026-08-04',
    qrCodeValue: JSON.stringify({
      rxId: 'RX-901',
      patient: 'Alex Tumusiime',
      doctor: 'Dr. Florence Alaro',
      diagnosis: 'Essential Hypertension Stage II',
      meds: [
        { name: 'Amlodipine', dosage: '5mg', freq: 'Daily', duration: '30 Days' },
        { name: 'Atorvastatin', dosage: '20mg', freq: 'Nightly', duration: '30 Days' }
      ],
      followUp: '2026-08-04'
    }),
    synced: true
  },
  {
    id: 'RX-902',
    patientId: 'PAT-002',
    doctorId: 'DOC-002',
    date: '2026-07-05',
    diagnosis: 'New onset Type 2 Diabetes Mellitus',
    followUpDate: '2026-08-05',
    qrCodeValue: JSON.stringify({
      rxId: 'RX-902',
      patient: 'Sarah Nabakooza',
      doctor: 'Dr. Joseph Brian',
      diagnosis: 'New onset Type 2 Diabetes Mellitus',
      meds: [
        { name: 'Metformin HCl', dosage: '500mg', freq: 'Twice daily', duration: '30 Days' }
      ],
      followUp: '2026-08-05'
    }),
    synced: true
  }
];

const SEED_MEDICINES: Medicine[] = [
  { id: 'MED-101', prescriptionId: 'RX-901', name: 'Amlodipine Besylate', dosage: '5mg', frequency: 'Daily', duration: '30 Days', reminderTimes: ['08:00'], synced: true },
  { id: 'MED-102', prescriptionId: 'RX-901', name: 'Atorvastatin Calcium', dosage: '20mg', frequency: 'Nightly', duration: '30 Days', reminderTimes: ['21:00'], synced: true },
  { id: 'MED-103', prescriptionId: 'RX-902', name: 'Metformin HCl', dosage: '500mg', frequency: 'Twice daily', duration: '30 Days', reminderTimes: ['08:00', '20:00'], synced: true }
];

// Helper to generate seed logs for the last few days (July 4 to July 7)
const generateSeedLogs = (): MedicationLog[] => {
  const logs: MedicationLog[] = [];
  const dates = ['2026-07-04', '2026-07-05', '2026-07-06', '2026-07-07'];

  // MED-101 (Daily 08:00)
  dates.forEach((d, idx) => {
    logs.push({
      id: `LOG-101-${d}`,
      medicineId: 'MED-101',
      prescriptionId: 'RX-901',
      patientId: 'PAT-001',
      scheduledTime: '08:00',
      scheduledDate: d,
      // let's simulate one missed day (on July 5)
      takenAt: d === '2026-07-05' ? null : `${d}T08:05:22.000Z`,
      status: d === '2026-07-05' ? 'missed' : 'taken',
      synced: true
    });
  });

  // MED-102 (Nightly 21:00)
  dates.forEach((d) => {
    logs.push({
      id: `LOG-102-${d}`,
      medicineId: 'MED-102',
      prescriptionId: 'RX-901',
      patientId: 'PAT-001',
      scheduledTime: '21:00',
      scheduledDate: d,
      takenAt: `${d}T21:12:44.000Z`,
      status: 'taken',
      synced: true
    });
  });

  // MED-103 (Twice daily 08:00, 20:00)
  dates.forEach((d, idx) => {
    // July 4: both taken
    // July 5: 08:00 taken, 20:00 missed
    // July 6: 08:00 missed, 20:00 missed (overall sick day)
    // July 7: both taken
    
    // morning dose
    let morningStatus: 'taken' | 'missed' = 'taken';
    if (d === '2026-07-06') morningStatus = 'missed';
    logs.push({
      id: `LOG-103-AM-${d}`,
      medicineId: 'MED-103',
      prescriptionId: 'RX-902',
      patientId: 'PAT-002',
      scheduledTime: '08:00',
      scheduledDate: d,
      takenAt: morningStatus === 'taken' ? `${d}T08:15:00.000Z` : null,
      status: morningStatus,
      synced: true
    });

    // evening dose
    let eveningStatus: 'taken' | 'missed' = 'taken';
    if (d === '2026-07-05' || d === '2026-07-06') eveningStatus = 'missed';
    logs.push({
      id: `LOG-103-PM-${d}`,
      medicineId: 'MED-103',
      prescriptionId: 'RX-902',
      patientId: 'PAT-002',
      scheduledTime: '20:00',
      scheduledDate: d,
      takenAt: eveningStatus === 'taken' ? `${d}T20:02:11.000Z` : null,
      status: eveningStatus,
      synced: true
    });
  });

  return logs;
};

// Helper: Safely parse and decrypt local storage
const getStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  const rawData = localStorage.getItem(key);
  if (!rawData) return defaultValue;
  try {
    const decrypted = decryptSync(rawData);
    if (!decrypted) return defaultValue;
    return JSON.parse(decrypted) as T;
  } catch (e) {
    return defaultValue;
  }
};

const setStorage = <T>(key: string, value: T): void => {
  if (typeof window !== 'undefined') {
    try {
      const jsonStr = JSON.stringify(value);
      const encrypted = encryptSync(jsonStr);
      localStorage.setItem(key, encrypted);
    } catch (e) {
      console.warn("Offline database write warning:", e);
    }
  }
};

// INITIALIZATION
export const initOfflineDatabase = () => {
  if (typeof window === 'undefined') return;
  
  if (!localStorage.getItem(STORAGE_KEYS.PATIENTS)) {
    setStorage(STORAGE_KEYS.PATIENTS, SEED_PATIENTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.DOCTORS)) {
    setStorage(STORAGE_KEYS.DOCTORS, SEED_DOCTORS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.PRESCRIPTIONS)) {
    setStorage(STORAGE_KEYS.PRESCRIPTIONS, SEED_PRESCRIPTIONS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.MEDICINES)) {
    setStorage(STORAGE_KEYS.MEDICINES, SEED_MEDICINES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.LOGS)) {
    setStorage(STORAGE_KEYS.LOGS, generateSeedLogs());
  }
  if (!localStorage.getItem(STORAGE_KEYS.REMINDERS)) {
    const reminders: Reminder[] = [];
    SEED_MEDICINES.forEach(m => {
      m.reminderTimes.forEach(t => {
        reminders.push({
          id: `REM-${m.id}-${t}`,
          medicineId: m.id,
          prescriptionId: m.prescriptionId,
          time: t,
          isActive: true
        });
      });
    });
    setStorage(STORAGE_KEYS.REMINDERS, reminders);
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    const initialNotifications: PrescriptionNotification[] = [
      {
        id: 'NOT-001',
        recipientId: 'PAT-001',
        title: '📋 Prescription Confirmed',
        content: 'Your cardiologist Dr. Florence Alaro has issued prescription RX-901 for Essential Hypertension.',
        type: 'alert',
        read: true,
        createdAt: new Date('2026-07-04T09:00:00Z').toISOString()
      },
      {
        id: 'NOT-002',
        recipientId: 'PAT-002',
        title: '⚠️ Missed Dose Warning',
        content: 'You missed your scheduled Metformin HCl (500mg) dose at 20:00 yesterday.',
        type: 'reminder',
        read: false,
        createdAt: new Date('2026-07-06T08:30:00Z').toISOString()
      }
    ];
    setStorage(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
  }
  if (!localStorage.getItem(STORAGE_KEYS.ONLINE_STATUS)) {
    localStorage.setItem(STORAGE_KEYS.ONLINE_STATUS, 'online');
  }
  
  // Recalculate adherence rates of seeded patients
  recalculateAllComplianceRates();
};

// DATABASE OPERATIONS

// 1. ONLINE STATUS
export const isNetworkOnline = (): boolean => {
  const val = getStorage<string>(STORAGE_KEYS.ONLINE_STATUS, 'online');
  return val === 'online';
};

export const setNetworkOnline = (status: boolean): void => {
  setStorage(STORAGE_KEYS.ONLINE_STATUS, status ? 'online' : 'offline');
  if (status) {
    // Automatically trigger sync when coming back online
    syncOfflineRecords();
  }
};

// 2. PATIENTS
export const getPatients = (): Patient[] => {
  return getStorage<Patient[]>(STORAGE_KEYS.PATIENTS, []);
};

export const savePatients = (pats: Patient[]) => {
  setStorage(STORAGE_KEYS.PATIENTS, pats);
};

// 3. DOCTORS
export const getDoctors = (): Doctor[] => {
  return getStorage<Doctor[]>(STORAGE_KEYS.DOCTORS, []);
};

// 4. PRESCRIPTIONS
export const getPrescriptions = (): Prescription[] => {
  return getStorage<Prescription[]>(STORAGE_KEYS.PRESCRIPTIONS, []);
};

export const createPrescription = (
  patientId: string,
  doctorId: string,
  diagnosis: string,
  followUpDate: string,
  medicinesList: { name: string; dosage: string; frequency: string; duration: string; reminderTimes: string[] }[]
): Prescription => {
  const rxId = `RX-${Math.floor(100 + Math.random() * 900)}`;
  const patient = getPatients().find(p => p.id === patientId);
  const doctor = getDoctors().find(d => d.id === doctorId);
  
  // Build Standardized Format and serialise for QR code
  const rxData = {
    rxId,
    patient: patient?.name || 'Unknown Patient',
    doctor: doctor?.name || 'Unknown Doctor',
    diagnosis,
    meds: medicinesList.map(m => ({ name: m.name, dosage: m.dosage, freq: m.frequency, duration: m.duration })),
    followUp: followUpDate
  };

  const isOnline = isNetworkOnline();

  const newRx: Prescription = {
    id: rxId,
    patientId,
    doctorId,
    date: new Date().toISOString().split('T')[0],
    diagnosis,
    followUpDate,
    qrCodeValue: JSON.stringify(rxData),
    synced: isOnline
  };

  // Save Prescription
  const prescriptions = getPrescriptions();
  prescriptions.unshift(newRx);
  setStorage(STORAGE_KEYS.PRESCRIPTIONS, prescriptions);

  // Save Medicines
  const medicines = getStorage<Medicine[]>(STORAGE_KEYS.MEDICINES, []);
  const reminders = getStorage<Reminder[]>(STORAGE_KEYS.REMINDERS, []);
  
  medicinesList.forEach((med, idx) => {
    const medId = `MED-${Math.floor(1000 + Math.random() * 9000)}-${idx}`;
    medicines.push({
      id: medId,
      prescriptionId: rxId,
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      duration: med.duration,
      reminderTimes: med.reminderTimes,
      synced: isOnline
    });

    // Create Reminders for medicine
    med.reminderTimes.forEach(t => {
      reminders.push({
        id: `REM-${medId}-${t}`,
        medicineId: medId,
        prescriptionId: rxId,
        time: t,
        isActive: true
      });
    });
  });

  setStorage(STORAGE_KEYS.MEDICINES, medicines);
  setStorage(STORAGE_KEYS.REMINDERS, reminders);

  // Create Patient Notifications
  createNotification(
    patientId,
    '📋 New Prescription Authorized',
    `Prescription ${rxId} has been formulated for your diagnosis: "${diagnosis}". Open dashboard to configure reminder times.`,
    'alert'
  );

  // If offline, queue synchronization record
  if (!isOnline) {
    queueSyncRecord('prescriptions', rxId, 'create');
  }

  // Pre-generate pending logs for today/tomorrow
  generateFutureLogsForPrescription(rxId);

  return newRx;
};

// 5. MEDICINES
export const getMedicines = (): Medicine[] => {
  return getStorage<Medicine[]>(STORAGE_KEYS.MEDICINES, []);
};

export const getMedicinesForPrescription = (rxId: string): Medicine[] => {
  return getMedicines().filter(m => m.prescriptionId === rxId);
};

// 6. MEDICATION LOGS
export const getMedicationLogs = (): MedicationLog[] => {
  const logs = getStorage<MedicationLog[]>(STORAGE_KEYS.LOGS, []);
  const medicines = getMedicines();
  
  // Dynamic enhancement: Ensure all logs are retrofitted with dual naming compatibility
  return logs.map(log => {
    const med = medicines.find(m => m.id === log.medicineId);
    return {
      ...log,
      logDate: log.scheduledDate || (log as any).logDate,
      reminderTime: log.scheduledTime || (log as any).reminderTime,
      medicineName: med ? med.name : ((log as any).medicineName || 'Medication'),
      dosage: med ? med.dosage : ((log as any).dosage || '1 Dose'),
      scheduledDate: log.scheduledDate || (log as any).logDate,
      scheduledTime: log.scheduledTime || (log as any).reminderTime,
    };
  });
};

// Function for patients to register intake (simple self-report fallback)
export const updateMedicationIntakeStatus = (logId: string, status: 'taken' | 'missed'): MedicationLog | null => {
  const logs = getStorage<MedicationLog[]>(STORAGE_KEYS.LOGS, []);
  const index = logs.findIndex(l => l.id === logId);
  if (index === -1) return null;

  const isOnline = isNetworkOnline();
  const now = new Date().toISOString();

  logs[index] = {
    ...logs[index],
    status,
    takenAt: status === 'taken' ? now : null,
    synced: isOnline,
    verificationMethod: 'self',
    confidenceScore: status === 'taken' ? 50 : 0 // low confidence for self-reporting
  };

  setStorage(STORAGE_KEYS.LOGS, logs);

  // Recalculate compliance
  recalculatePatientCompliance(logs[index].patientId);

  // Sync queues
  if (!isOnline) {
    queueSyncRecord('medication_logs', logId, 'update');
  }

  // Create notifications as confirmation
  const medicine = getMedicines().find(m => m.id === logs[index].medicineId);
  if (status === 'taken') {
    createNotification(
      logs[index].patientId,
      '💊 Medication Dose Logged',
      `You self-reported your dose of ${medicine?.name || 'Medicine'} as Taken at ${new Date(now).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}. Verification is highly recommended.`,
      'reminder'
    );
  } else {
    createNotification(
      logs[index].patientId,
      '⚠️ Missed Dose Logged',
      `You marked your dose of ${medicine?.name || 'Medicine'} as Missed. Remember to consult your physician if you experience any worsening symptoms.`,
      'reminder'
    );
  }

  return logs[index];
};

// Enhanced Medication Verification Intake Logger
export const verifyAndLogMedicationIntake = (
  logId: string,
  method: 'photo' | 'video' | 'scan',
  verificationUrl: string,
  verificationName: string,
  aiQuestion: string,
  aiAnswer: string,
  confidenceScore: number,
  anomalyDetected: boolean,
  anomalyReason: string
): MedicationLog | null => {
  const logs = getStorage<MedicationLog[]>(STORAGE_KEYS.LOGS, []);
  const index = logs.findIndex(l => l.id === logId);
  if (index === -1) return null;

  const isOnline = isNetworkOnline();
  const now = new Date().toISOString();

  logs[index] = {
    ...logs[index],
    status: 'taken',
    takenAt: now,
    synced: isOnline,
    verificationMethod: method,
    verificationUrl,
    verificationName,
    aiQuestion,
    aiAnswer,
    confidenceScore,
    anomalyDetected,
    anomalyReason,
    caregiverVerified: false
  };

  setStorage(STORAGE_KEYS.LOGS, logs);

  // Recalculate compliance
  recalculatePatientCompliance(logs[index].patientId);

  // Sync queues
  if (!isOnline) {
    queueSyncRecord('medication_logs', logId, 'update');
  }

  // Create notifications as confirmation
  const medicine = getMedicines().find(m => m.id === logs[index].medicineId);
  createNotification(
    logs[index].patientId,
    '🛡️ Verified Dose Registered',
    `Intake verified for ${medicine?.name || 'Medicine'} via ${method.toUpperCase()} with confidence score ${confidenceScore}%.`,
    'reminder'
  );

  // If confidence score is low (< 70%) or questionable, create a separate alert notification!
  if (confidenceScore < 70 || anomalyDetected) {
    createNotification(
      logs[index].patientId,
      '🚨 Low-Confidence Intake Alert',
      `Potential anomaly detected for ${medicine?.name || 'Medicine'}: "${anomalyReason}". Clinical supervision advised.`,
      'alert'
    );
  }

  return logs[index];
};

// Caregiver supervision verification function
export const caregiverVerifyIntake = (
  logId: string,
  verifierName: string,
  approve: boolean
): MedicationLog | null => {
  const logs = getStorage<MedicationLog[]>(STORAGE_KEYS.LOGS, []);
  const index = logs.findIndex(l => l.id === logId);
  if (index === -1) return null;

  const isOnline = isNetworkOnline();
  const now = new Date().toISOString();

  logs[index] = {
    ...logs[index],
    caregiverVerified: true,
    caregiverVerifiedBy: verifierName,
    caregiverVerifiedAt: now,
    confidenceScore: approve ? Math.min(100, (logs[index].confidenceScore || 80) + 15) : Math.max(0, (logs[index].confidenceScore || 80) - 30),
    anomalyDetected: approve ? false : logs[index].anomalyDetected,
    anomalyReason: approve ? '' : 'Caregiver flagged as unapproved'
  };

  setStorage(STORAGE_KEYS.LOGS, logs);
  recalculatePatientCompliance(logs[index].patientId);

  if (!isOnline) {
    queueSyncRecord('medication_logs', logId, 'update');
  }

  const medicine = getMedicines().find(m => m.id === logs[index].medicineId);
  createNotification(
    logs[index].patientId,
    approve ? '✅ Caregiver Approved Intake' : '❌ Caregiver Flagged Intake',
    `Dose of ${medicine?.name || 'Medicine'} has been ${approve ? 'approved' : 'flagged/rejected'} by Supervisor ${verifierName}.`,
    'alert'
  );

  return logs[index];
};

// 7. REMINDERS
export const getReminders = (): Reminder[] => {
  return getStorage<Reminder[]>(STORAGE_KEYS.REMINDERS, []);
};

// 8. NOTIFICATIONS
export const getNotifications = (): PrescriptionNotification[] => {
  return getStorage<PrescriptionNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
};

export const createNotification = (
  recipientId: string,
  title: string,
  content: string,
  type: 'reminder' | 'sync' | 'alert'
): PrescriptionNotification => {
  const newNot: PrescriptionNotification = {
    id: `NOT-${Math.floor(1000 + Math.random() * 9000)}`,
    recipientId,
    title,
    content,
    type,
    read: false,
    createdAt: new Date().toISOString()
  };

  const notifications = getNotifications();
  notifications.unshift(newNot);
  setStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
  return newNot;
};

export const markNotificationRead = (notId: string) => {
  const nots = getNotifications();
  const updated = nots.map(n => n.id === notId ? { ...n, read: true } : n);
  setStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
};

// 9. SYNCHRONIZATION QUEUE
export const getSyncRecords = (): SyncRecord[] => {
  return getStorage<SyncRecord[]>(STORAGE_KEYS.SYNC, []);
};

const queueSyncRecord = (entityType: SyncRecord['entityType'], entityId: string, action: SyncRecord['action']) => {
  const syncRecords = getSyncRecords();
  const newRecord: SyncRecord = {
    id: `SYNC-${Math.floor(100000 + Math.random() * 900000)}`,
    entityType,
    entityId,
    action,
    status: 'pending',
    timestamp: new Date().toISOString()
  };
  syncRecords.push(newRecord);
  setStorage(STORAGE_KEYS.SYNC, syncRecords);
};

// Trigger Synchronization
export const syncOfflineRecords = (): Promise<{ success: boolean; count: number }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const syncRecords = getSyncRecords();
      const pending = syncRecords.filter(r => r.status === 'pending');
      
      if (pending.length === 0) {
        resolve({ success: true, count: 0 });
        return;
      }

      // Mark all pending as success
      const updatedSync = syncRecords.map(r => r.status === 'pending' ? { ...r, status: 'success' as const } : r);
      setStorage(STORAGE_KEYS.SYNC, updatedSync);

      // Mark associated entity records as synced in actual tables
      const rxTable = getPrescriptions();
      const medTable = getMedicines();
      const logsTable = getMedicationLogs();

      pending.forEach(rec => {
        if (rec.entityType === 'prescriptions') {
          const idx = rxTable.findIndex(p => p.id === rec.entityId);
          if (idx !== -1) rxTable[idx].synced = true;
        } else if (rec.entityType === 'medicines') {
          const idx = medTable.findIndex(m => m.id === rec.entityId);
          if (idx !== -1) medTable[idx].synced = true;
        } else if (rec.entityType === 'medication_logs') {
          const idx = logsTable.findIndex(l => l.id === rec.entityId);
          if (idx !== -1) logsTable[idx].synced = true;
        }
      });

      setStorage(STORAGE_KEYS.PRESCRIPTIONS, rxTable);
      setStorage(STORAGE_KEYS.MEDICINES, medTable);
      setStorage(STORAGE_KEYS.LOGS, logsTable);

      // Create system notification for patient/doctor indicating synchronization fulfilled
      createNotification(
        'PAT-001',
        '🔄 Offline Records Synchronized',
        `Successfully uploaded and secured ${pending.length} local offline medication logs and prescription items to the Cloud nodes!`,
        'sync'
      );

      resolve({ success: true, count: pending.length });
    }, 1500); // simulate network latency
  });
};

// HELPER LOG GENERATION FOR DEMO PREVIEW
export const generateFutureLogsForPrescription = (rxId: string) => {
  const medicines = getMedicines().filter(m => m.prescriptionId === rxId);
  const prescription = getPrescriptions().find(p => p.id === rxId);
  if (!prescription) return;

  const logs = getMedicationLogs();
  const today = new Date().toISOString().split('T')[0];
  
  medicines.forEach(m => {
    m.reminderTimes.forEach(t => {
      const logId = `LOG-${m.id}-${t}-${today}`;
      // Check if already exists
      if (!logs.some(l => l.id === logId)) {
        logs.unshift({
          id: logId,
          medicineId: m.id,
          prescriptionId: rxId,
          patientId: prescription.patientId,
          scheduledTime: t,
          scheduledDate: today,
          takenAt: null,
          status: 'pending',
          synced: isNetworkOnline()
        });
      }
    });
  });

  setStorage(STORAGE_KEYS.LOGS, logs);
};

// Triggering medication alerts simulation
export const checkAndTriggerSmartReminders = (): MedicationLog[] => {
  const logs = getMedicationLogs();
  const now = new Date();
  const currentTimeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  const todayString = now.toISOString().split('T')[0];

  const triggeredReminders: MedicationLog[] = [];

  logs.forEach(log => {
    if (log.status === 'pending' && log.scheduledDate === todayString) {
      // If currentTime passes scheduledTime, trigger alert or mark as missed
      const [schedHr, schedMin] = log.scheduledTime.split(':').map(Number);
      const logTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), schedHr, schedMin);
      
      // If time has passed and log is pending
      if (now >= logTime) {
        // Find medicine details
        const med = getMedicines().find(m => m.id === log.medicineId);
        
        // Push notification of active reminder
        createNotification(
          log.patientId,
          `⏰ Time for your medicine: ${med?.name || 'Medication'}`,
          `Please take ${med?.dosage || 'your prescribed dose'} of ${med?.name || 'Medicine'}. Scheduled at ${log.scheduledTime}.`,
          'reminder'
        );
        triggeredReminders.push(log);
      }
    }
  });

  return triggeredReminders;
};

// STATS CALCULATOR
const recalculatePatientCompliance = (patientId: string) => {
  const logs = getMedicationLogs().filter(l => l.patientId === patientId);
  const completedLogs = logs.filter(l => l.status === 'taken');
  const finishedLogs = logs.filter(l => l.status === 'taken' || l.status === 'missed');

  const complianceRate = finishedLogs.length > 0 
    ? Math.round((completedLogs.length / finishedLogs.length) * 100) 
    : 100;

  const patients = getPatients();
  const idx = patients.findIndex(p => p.id === patientId);
  if (idx !== -1) {
    patients[idx].complianceRate = complianceRate;
    setStorage(STORAGE_KEYS.PATIENTS, patients);
  }
};

const recalculateAllComplianceRates = () => {
  const patients = getPatients();
  patients.forEach(p => {
    recalculatePatientCompliance(p.id);
  });
};
