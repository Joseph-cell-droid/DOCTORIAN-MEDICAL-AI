import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const dataDir = path.resolve(process.cwd(), '.data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'doctorian.db');
export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('patient', 'doctor', 'nurse', 'admin', 'guest')),
      specialty TEXT,
      facility TEXT,
      phone TEXT,
      license_number TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      mrn TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      age INTEGER NOT NULL,
      gender TEXT NOT NULL,
      district TEXT NOT NULL,
      blood_group TEXT,
      allergies TEXT DEFAULT 'None documented',
      chronic_conditions TEXT DEFAULT 'None documented',
      risk_tier TEXT NOT NULL DEFAULT 'Stable',
      assigned_clinician_id TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS clinical_encounters (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      clinician_id TEXT,
      encounter_type TEXT NOT NULL,
      subjective TEXT,
      objective TEXT,
      assessment TEXT,
      plan TEXT,
      vitals_json TEXT,
      red_flags_json TEXT,
      status TEXT NOT NULL DEFAULT 'open',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS prescriptions (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      patient_name TEXT NOT NULL,
      prescriber_id TEXT,
      prescriber_name TEXT NOT NULL,
      medication_name TEXT NOT NULL,
      dosage TEXT NOT NULL,
      frequency TEXT NOT NULL,
      duration TEXT NOT NULL,
      route TEXT DEFAULT 'Oral',
      instructions TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      adherence_percent INTEGER NOT NULL DEFAULT 95,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS lab_results (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      patient_name TEXT NOT NULL,
      test_name TEXT NOT NULL,
      category TEXT NOT NULL,
      result_value TEXT NOT NULL,
      reference_range TEXT NOT NULL,
      unit TEXT,
      interpretation TEXT NOT NULL CHECK (interpretation IN ('Normal', 'Attention', 'Critical')),
      ordered_by TEXT NOT NULL,
      reviewed_by TEXT,
      status TEXT NOT NULL DEFAULT 'Completed',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS vital_signs (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      recorded_by TEXT NOT NULL,
      heart_rate INTEGER NOT NULL,
      systolic_bp INTEGER NOT NULL,
      diastolic_bp INTEGER NOT NULL,
      spo2 INTEGER NOT NULL,
      temperature REAL NOT NULL,
      respiratory_rate INTEGER NOT NULL DEFAULT 18,
      notes TEXT,
      recorded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      patient_name TEXT NOT NULL,
      clinician_id TEXT,
      clinician_name TEXT NOT NULL,
      facility TEXT NOT NULL,
      scheduled_for TEXT NOT NULL,
      visit_type TEXT NOT NULL DEFAULT 'Telemedicine',
      reason TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Scheduled',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS referrals (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      patient_name TEXT NOT NULL,
      from_clinician TEXT NOT NULL,
      to_facility TEXT NOT NULL,
      urgency TEXT NOT NULL CHECK (urgency IN ('Routine', 'Urgent', 'Emergency')),
      reason TEXT NOT NULL,
      vitals_summary TEXT,
      status TEXT NOT NULL DEFAULT 'Pending',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      actor_id TEXT,
      actor_email TEXT NOT NULL,
      actor_role TEXT NOT NULL,
      action TEXT NOT NULL,
      resource TEXT NOT NULL,
      details TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  seedInitialClinicalData();
}

function seedInitialClinicalData() {
  const userCount = (db.prepare('SELECT COUNT(*) as cnt FROM users').get() as { cnt: number }).cnt;
  if (userCount === 0) {
    const defaultHash = bcrypt.hashSync('Doctorian@2026!', 10);
    const insertUser = db.prepare(`
      INSERT INTO users (id, email, password_hash, display_name, role, specialty, facility, phone, license_number, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `);

    insertUser.run('usr-patient-01', 'patient@doctorian.org', defaultHash, 'Grace Namukasa', 'patient', null, 'Mulago Outpatient Clinic', '+256 772 410 220', null);
    insertUser.run('usr-doctor-01', 'doctor@doctorian.org', defaultHash, 'Dr. Sarah M. Nakitto', 'doctor', 'Internal Medicine & Infectious Diseases', 'Mulago National Referral Hospital', '+256 772 881 104', 'UMDPC-UG-4821');
    insertUser.run('usr-nurse-01', 'nurse@doctorian.org', defaultHash, 'Sr. Beatrice Achieng', 'nurse', 'Triage & Community Nursing', 'Mbale Regional Referral Hospital', '+256 752 309 411', 'UNMC-UG-9104');
    insertUser.run('usr-admin-01', 'admin@doctorian.org', defaultHash, 'Samuel K. Mugisha', 'admin', 'Hospital Operations Director', 'Doctorian East Africa Network', '+256 701 640 990', 'ADMIN-UG-001');
  }

  const patientCount = (db.prepare('SELECT COUNT(*) as cnt FROM patients').get() as { cnt: number }).cnt;
  if (patientCount === 0) {
    const insertPatient = db.prepare(`
      INSERT INTO patients (id, mrn, full_name, age, gender, district, blood_group, allergies, chronic_conditions, risk_tier, assigned_clinician_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertPatient.run('pat-001', 'DAI-2026-1187', 'Grace Namukasa', 29, 'Female', 'Kampala (Kawempe)', 'O+', 'None documented', 'Mild intermittent asthma', 'Stable', 'usr-doctor-01');
    insertPatient.run('pat-002', 'DAI-2026-1204', 'Robert Okello', 47, 'Male', 'Gulu', 'A+', 'Sulfonamides', 'Essential Hypertension', 'Attention', 'usr-doctor-01');
    insertPatient.run('pat-003', 'DAI-2026-1219', 'Miriam Tumusiime', 34, 'Female', 'Mbarara', 'B+', 'None documented', 'Gestational hypertension (32 wks)', 'Critical', 'usr-doctor-01');
    insertPatient.run('pat-004', 'DAI-2026-1240', 'Isaac Wanyama', 6, 'Male', 'Mbale', 'O+', 'None documented', 'Acute febrile illness monitoring', 'Attention', 'usr-nurse-01');

    const insertRx = db.prepare(`
      INSERT INTO prescriptions (id, patient_id, patient_name, prescriber_id, prescriber_name, medication_name, dosage, frequency, duration, route, instructions, status, adherence_percent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertRx.run('rx-001', 'pat-001', 'Grace Namukasa', 'usr-doctor-01', 'Dr. Sarah M. Nakitto', 'Paracetamol', '500mg', 'Every 6 Hours', '7 Days', 'Oral', 'Take 1 tablet after food when febrile or in mild pain.', 'active', 96);
    insertRx.run('rx-002', 'pat-001', 'Grace Namukasa', 'usr-doctor-01', 'Dr. Sarah M. Nakitto', 'Amoxicillin', '500mg', 'Every 8 Hours', '10 Days', 'Oral', 'Complete full 10-day course with water after meals.', 'active', 94);
    insertRx.run('rx-003', 'pat-002', 'Robert Okello', 'usr-doctor-01', 'Dr. Sarah M. Nakitto', 'Amlodipine', '5mg', 'Once Daily', '30 Days', 'Oral', 'Take every morning and monitor home blood pressure.', 'active', 88);
    insertRx.run('rx-004', 'pat-004', 'Isaac Wanyama', 'usr-doctor-01', 'Dr. Sarah M. Nakitto', 'Artemether-Lumefantrine', '20mg/120mg', 'Twice Daily', '3 Days', 'Oral', 'Give after fatty meal or milk; repeat dose if vomited within 30 minutes.', 'pending_approval', 92);

    const insertLab = db.prepare(`
      INSERT INTO lab_results (id, patient_id, patient_name, test_name, category, result_value, reference_range, unit, interpretation, ordered_by, reviewed_by, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertLab.run('lab-001', 'pat-001', 'Grace Namukasa', 'Malaria RDT (P. falciparum)', 'Parasitology', 'Negative', 'Negative', '', 'Normal', 'Dr. Sarah M. Nakitto', 'Dr. Sarah M. Nakitto', 'Completed');
    insertLab.run('lab-002', 'pat-002', 'Robert Okello', 'Fasting Blood Glucose', 'Biochemistry', '6.8', '3.9 - 5.6', 'mmol/L', 'Attention', 'Dr. Sarah M. Nakitto', 'Dr. Sarah M. Nakitto', 'Completed');
    insertLab.run('lab-003', 'pat-003', 'Miriam Tumusiime', 'Urine Protein Dipstick', 'Urinalysis', '2+ Proteinuria', 'Negative', '', 'Critical', 'Sr. Beatrice Achieng', null, 'Pending Review');
    insertLab.run('lab-004', 'pat-004', 'Isaac Wanyama', 'Haemoglobin (Hb)', 'Haematology', '9.6', '11.5 - 15.5', 'g/dL', 'Attention', 'Sr. Beatrice Achieng', 'Dr. Sarah M. Nakitto', 'Completed');

    const insertVitals = db.prepare(`
      INSERT INTO vital_signs (id, patient_id, recorded_by, heart_rate, systolic_bp, diastolic_bp, spo2, temperature, respiratory_rate, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertVitals.run('vit-001', 'pat-001', 'Sr. Beatrice Achieng', 74, 118, 76, 98, 36.7, 16, 'Routine outpatient check — stable');
    insertVitals.run('vit-002', 'pat-002', 'Sr. Beatrice Achieng', 86, 152, 94, 96, 36.9, 18, 'Elevated BP — antihypertensive adherence review');
    insertVitals.run('vit-003', 'pat-003', 'Sr. Beatrice Achieng', 98, 164, 108, 97, 37.1, 20, 'Urgent obstetric BP alert — notify physician');

    const insertAppt = db.prepare(`
      INSERT INTO appointments (id, patient_id, patient_name, clinician_id, clinician_name, facility, scheduled_for, visit_type, reason, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertAppt.run('apt-001', 'pat-001', 'Grace Namukasa', 'usr-doctor-01', 'Dr. Sarah M. Nakitto', 'Mulago Outpatient Clinic', '2026-11-14 10:30', 'Telemedicine', 'Post-antibiotic respiratory follow-up', 'Scheduled');
    insertAppt.run('apt-002', 'pat-002', 'Robert Okello', 'usr-doctor-01', 'Dr. Sarah M. Nakitto', 'Gulu Regional Clinic', '2026-11-15 09:00', 'In-Person', 'Hypertension & glucose monitoring', 'Scheduled');

    const insertRef = db.prepare(`
      INSERT INTO referrals (id, patient_id, patient_name, from_clinician, to_facility, urgency, reason, vitals_summary, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertRef.run('ref-001', 'pat-003', 'Miriam Tumusiime', 'Sr. Beatrice Achieng', 'Mbarara Regional Referral Hospital — Maternity Ward', 'Emergency', 'BP 164/108 mmHg with 2+ proteinuria at 32 weeks gestation — rule out severe pre-eclampsia', 'BP 164/108, HR 98, SpO2 97%, Temp 37.1C', 'Dispatched');

    const insertAudit = db.prepare(`
      INSERT INTO audit_logs (id, actor_id, actor_email, actor_role, action, resource, details)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertAudit.run('aud-001', 'usr-doctor-01', 'doctor@doctorian.org', 'doctor', 'PRESCRIPTION_CREATED', 'rx-002', 'Prescribed Amoxicillin 500mg TDS for 10 days');
    insertAudit.run('aud-002', 'usr-nurse-01', 'nurse@doctorian.org', 'nurse', 'REFERRAL_DISPATCHED', 'ref-001', 'Urgent obstetric referral initiated for elevated BP + proteinuria');
  }
}

export function logAudit(actorId: string | null, actorEmail: string, actorRole: string, action: string, resource: string, details: string) {
  try {
    const id = `aud-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    db.prepare(`
      INSERT INTO audit_logs (id, actor_id, actor_email, actor_role, action, resource, details)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, actorId, actorEmail, actorRole, action, resource, details);
  } catch (err) {
    console.error('Audit log error:', err);
  }
}
