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
      user_id TEXT,
      full_name TEXT NOT NULL,
      age INTEGER NOT NULL,
      gender TEXT NOT NULL,
      district TEXT NOT NULL,
      phone TEXT,
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

    CREATE TABLE IF NOT EXISTS hospital_beds (
      id TEXT PRIMARY KEY,
      hospital_id TEXT NOT NULL,
      ward_name TEXT NOT NULL,
      bed_number TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('occupied', 'available', 'cleaning')),
      patient_name TEXT,
      diagnosis TEXT,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS daily_telemetry (
      id TEXT PRIMARY KEY,
      user_key TEXT NOT NULL,
      date_str TEXT NOT NULL,
      steps INTEGER NOT NULL DEFAULT 0,
      steps_goal INTEGER NOT NULL DEFAULT 10000,
      calories INTEGER NOT NULL DEFAULT 0,
      water_ml INTEGER NOT NULL DEFAULT 0,
      sleep_minutes INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_key, date_str)
    );

    CREATE TABLE IF NOT EXISTS sessions (
      jti TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL,
      ip TEXT,
      ua_hash TEXT,
      expires_at INTEGER NOT NULL,
      revoked INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS security_challenges (
      id TEXT PRIMARY KEY,
      purpose TEXT NOT NULL,
      email TEXT,
      salt TEXT NOT NULL,
      answer_hash TEXT NOT NULL,
      difficulty INTEGER NOT NULL DEFAULT 3,
      attempts INTEGER NOT NULL DEFAULT 0,
      expires_at INTEGER NOT NULL,
      consumed INTEGER NOT NULL DEFAULT 0,
      ip TEXT,
      issued_at INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS security_events (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'high', 'critical')),
      ip TEXT,
      email TEXT,
      details TEXT,
      prev_hash TEXT NOT NULL,
      entry_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS neural_messages (
      id TEXT PRIMARY KEY,
      channel TEXT NOT NULL DEFAULT 'neural_mesh',
      event_type TEXT NOT NULL DEFAULT 'signal',
      sender_id TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      sender_role TEXT NOT NULL,
      sender_specialty TEXT,
      target_role TEXT NOT NULL DEFAULT 'all',
      target_user_id TEXT,
      recipient_name TEXT,
      subject TEXT,
      content TEXT NOT NULL,
      payload_json TEXT,
      priority TEXT NOT NULL DEFAULT 'normal',
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pharmacy_orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      user_id TEXT,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      delivery_address TEXT NOT NULL,
      district TEXT NOT NULL,
      pharmacy_id TEXT NOT NULL,
      pharmacy_name TEXT NOT NULL,
      fulfillment_type TEXT NOT NULL DEFAULT 'delivery',
      payment_method TEXT NOT NULL DEFAULT 'momo',
      items_json TEXT NOT NULL,
      subtotal_ugx INTEGER NOT NULL,
      delivery_fee_ugx INTEGER NOT NULL DEFAULT 0,
      total_ugx INTEGER NOT NULL,
      prescription_ref TEXT,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'confirmed',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS billing_transactions (
      id TEXT PRIMARY KEY,
      invoice_number TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      user_email TEXT NOT NULL,
      user_name TEXT NOT NULL,
      kind TEXT NOT NULL CHECK (kind IN ('protocol', 'storage', 'sms_bundle', 'pharmacy', 'consultation')),
      item_id TEXT NOT NULL,
      item_name TEXT NOT NULL,
      subtotal_ugx INTEGER NOT NULL,
      vat_ugx INTEGER NOT NULL DEFAULT 0,
      amount_ugx INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'UGX',
      payment_method TEXT NOT NULL,
      payer_phone TEXT,
      external_ref TEXT,
      idempotency_key TEXT UNIQUE,
      status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'completed',
      receipt_hmac TEXT NOT NULL,
      metadata_json TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sms_dispatches (
      id TEXT PRIMARY KEY,
      call_session_id TEXT,
      sender_id TEXT,
      sender_name TEXT NOT NULL,
      sender_role TEXT NOT NULL,
      recipient_id TEXT,
      recipient_name TEXT NOT NULL,
      recipient_role TEXT NOT NULL CHECK (recipient_role IN ('doctor', 'nurse', 'patient', 'admin', 'emergency')),
      recipient_phone TEXT NOT NULL,
      message_body TEXT NOT NULL,
      dispatch_mode TEXT NOT NULL DEFAULT 'auto_call_sms',
      gateway_provider TEXT NOT NULL DEFAULT 'Doctorian GSM Neural Gateway',
      provider_message_id TEXT,
      status TEXT NOT NULL CHECK (status IN ('queued', 'sent', 'delivered', 'failed')) DEFAULT 'delivered',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS call_sessions (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL,
      call_mode TEXT NOT NULL CHECK (call_mode IN ('voice', 'video')),
      caller_id TEXT,
      caller_name TEXT NOT NULL,
      caller_role TEXT NOT NULL,
      callee_id TEXT,
      callee_name TEXT NOT NULL,
      callee_role TEXT NOT NULL,
      callee_phone TEXT,
      auto_sms_sent INTEGER NOT NULL DEFAULT 0,
      sms_dispatch_id TEXT,
      status TEXT NOT NULL DEFAULT 'initiated',
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS account_connections (
      id TEXT PRIMARY KEY,
      pair_key TEXT UNIQUE NOT NULL,
      requester_id TEXT NOT NULL,
      recipient_id TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined', 'blocked_abuse', 'blocked_manual')) DEFAULT 'pending',
      request_note TEXT,
      initiated_by TEXT NOT NULL,
      blocked_by TEXT,
      block_reason TEXT,
      patient_data_consent INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS moderation_incidents (
      id TEXT PRIMARY KEY,
      offender_id TEXT NOT NULL,
      target_id TEXT NOT NULL,
      pair_key TEXT NOT NULL,
      channel TEXT NOT NULL,
      matched_category TEXT NOT NULL,
      severity TEXT NOT NULL,
      excerpt TEXT,
      auto_blocked INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Ensure billing_transactions CHECK allows sms_bundle if pre-existing DB was initialized earlier
  try {
    const btSqlRow = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='billing_transactions'").get() as { sql?: string } | undefined;
    if (btSqlRow?.sql && !btSqlRow.sql.includes("'sms_bundle'")) {
      db.exec(`
        ALTER TABLE billing_transactions RENAME TO billing_transactions_old;
        CREATE TABLE billing_transactions (
          id TEXT PRIMARY KEY,
          invoice_number TEXT UNIQUE NOT NULL,
          user_id TEXT NOT NULL,
          user_email TEXT NOT NULL,
          user_name TEXT NOT NULL,
          kind TEXT NOT NULL CHECK (kind IN ('protocol', 'storage', 'sms_bundle', 'pharmacy', 'consultation')),
          item_id TEXT NOT NULL,
          item_name TEXT NOT NULL,
          subtotal_ugx INTEGER NOT NULL,
          vat_ugx INTEGER NOT NULL DEFAULT 0,
          amount_ugx INTEGER NOT NULL,
          currency TEXT NOT NULL DEFAULT 'UGX',
          payment_method TEXT NOT NULL,
          payer_phone TEXT,
          external_ref TEXT,
          idempotency_key TEXT UNIQUE,
          status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'completed',
          receipt_hmac TEXT NOT NULL,
          metadata_json TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        INSERT INTO billing_transactions SELECT * FROM billing_transactions_old;
        DROP TABLE billing_transactions_old;
      `);
    }
  } catch (err) {
    console.warn('billing_transactions migration check skipped:', err);
  }

  // Safe idempotent column migrations for existing databases
  const migrations = [
    "ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE users ADD COLUMN locked_until INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE users ADD COLUMN license_verified INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 1",
    "ALTER TABLE users ADD COLUMN mfa_enabled INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE users ADD COLUMN subscription_tier TEXT NOT NULL DEFAULT 'free'",
    "ALTER TABLE users ADD COLUMN subscription_status TEXT NOT NULL DEFAULT 'active'",
    "ALTER TABLE users ADD COLUMN credits INTEGER NOT NULL DEFAULT 400",
    "ALTER TABLE users ADD COLUMN storageQuotaBytes INTEGER NOT NULL DEFAULT 1073741824",
    "ALTER TABLE users ADD COLUMN billing_updated_at TEXT",
    "ALTER TABLE users ADD COLUMN sms_credits INTEGER NOT NULL DEFAULT 25",
    "ALTER TABLE users ADD COLUMN sms_revenue_ugx INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE users ADD COLUMN linked_patient_id TEXT",
    "ALTER TABLE patients ADD COLUMN phone TEXT",
    "ALTER TABLE patients ADD COLUMN user_id TEXT",
    "ALTER TABLE sms_dispatches ADD COLUMN segments INTEGER NOT NULL DEFAULT 1",
    "ALTER TABLE sms_dispatches ADD COLUMN cost_ugx INTEGER NOT NULL DEFAULT 60",
    "ALTER TABLE sms_dispatches ADD COLUMN price_ugx INTEGER NOT NULL DEFAULT 150",
    "ALTER TABLE sms_dispatches ADD COLUMN margin_ugx INTEGER NOT NULL DEFAULT 90"
  ];
  for (const sql of migrations) {
    try {
      db.exec(sql);
    } catch {
      // Column already exists
    }
  }

  // Ensure every registered user without quota gets exact 1 GB free allocation and baseline SMS credits
  try {
    db.exec("UPDATE users SET storageQuotaBytes = 1073741824 WHERE storageQuotaBytes IS NULL OR storageQuotaBytes <= 0");
    db.exec("UPDATE users SET sms_credits = 25 WHERE sms_credits IS NULL");
  } catch {}

  seedInitialClinicalData();
  ensureHospitalBeds('mulago-national');
  ensureHospitalBeds('lira-regional');
  ensureHospitalBeds('gulu-regional');
  ensureHospitalBeds('mbarara-regional');
}

export function ensureHospitalBeds(hospitalId: string) {
  const existing = (db.prepare('SELECT COUNT(*) as cnt FROM hospital_beds WHERE hospital_id = ?').get(hospitalId) as { cnt: number }).cnt;
  if (existing > 0) return;

  const prefix = hospitalId.split('-')[0].toUpperCase().slice(0, 4);
  const insertBed = db.prepare(`
    INSERT INTO hospital_beds (id, hospital_id, ward_name, bed_number, status, patient_name, diagnosis)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const seedBeds: Array<{ ward: string; num: string; status: 'occupied' | 'available' | 'cleaning'; patient: string | null; dx: string | null }> = [
    { ward: 'Medical Ward A', num: `${prefix}-A01`, status: 'occupied', patient: 'Grace Namukasa', dx: 'Asthma follow-up' },
    { ward: 'Medical Ward A', num: `${prefix}-A02`, status: 'occupied', patient: 'Robert Okello', dx: 'Hypertension workup' },
    { ward: 'Medical Ward A', num: `${prefix}-A03`, status: 'available', patient: null, dx: null },
    { ward: 'Medical Ward A', num: `${prefix}-A04`, status: 'available', patient: null, dx: null },
    { ward: 'Maternity & Obs', num: `${prefix}-M01`, status: 'occupied', patient: 'Miriam Tumusiime', dx: '32-wk Obstetric BP Watch' },
    { ward: 'Maternity & Obs', num: `${prefix}-M02`, status: 'available', patient: null, dx: null },
    { ward: 'Maternity & Obs', num: `${prefix}-M03`, status: 'cleaning', patient: null, dx: 'Sanitization in progress' },
    { ward: 'Pediatrics Ward', num: `${prefix}-P01`, status: 'occupied', patient: 'Isaac Wanyama', dx: 'Acute Febrile Illness' },
    { ward: 'Pediatrics Ward', num: `${prefix}-P02`, status: 'available', patient: null, dx: null },
    { ward: 'Emergency / ICU', num: `${prefix}-ICU1`, status: 'occupied', patient: 'Acute Trauma Watch', dx: 'High-Acuity Telemetry' },
    { ward: 'Emergency / ICU', num: `${prefix}-ICU2`, status: 'available', patient: null, dx: null },
    { ward: 'Emergency / ICU', num: `${prefix}-ICU3`, status: 'available', patient: null, dx: null },
  ];

  for (const b of seedBeds) {
    insertBed.run(`bed-${hospitalId}-${b.num}`, hospitalId, b.ward, b.num, b.status, b.patient, b.dx);
  }
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
    db.exec("UPDATE users SET license_verified = 1 WHERE id IN ('usr-doctor-01', 'usr-nurse-01', 'usr-admin-01')");
  } else {
    // Ensure pre-seeded baseline clinicians retain license_verified=1 after migration
    db.exec("UPDATE users SET license_verified = 1 WHERE id IN ('usr-doctor-01', 'usr-nurse-01', 'usr-admin-01') AND license_verified = 0");
  }

  const patientCount = (db.prepare('SELECT COUNT(*) as cnt FROM patients').get() as { cnt: number }).cnt;
  if (patientCount === 0) {
    const insertPatient = db.prepare(`
      INSERT INTO patients (id, mrn, user_id, full_name, age, gender, district, phone, blood_group, allergies, chronic_conditions, risk_tier, assigned_clinician_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertPatient.run('pat-001', 'DAI-2026-1187', 'usr-patient-01', 'Grace Namukasa', 29, 'Female', 'Kampala (Kawempe)', '+256 772 410 220', 'O+', 'None documented', 'Mild intermittent asthma', 'Stable', 'usr-doctor-01');
    insertPatient.run('pat-002', 'DAI-2026-1204', null, 'Robert Okello', 47, 'Male', 'Gulu', '+256 772 518 390', 'A+', 'Sulfonamides', 'Essential Hypertension', 'Attention', 'usr-doctor-01');
    insertPatient.run('pat-003', 'DAI-2026-1219', null, 'Miriam Tumusiime', 34, 'Female', 'Mbarara', '+256 782 641 205', 'B+', 'None documented', 'Gestational hypertension (32 wks)', 'Critical', 'usr-doctor-01');
    insertPatient.run('pat-004', 'DAI-2026-1240', null, 'Isaac Wanyama', 6, 'Male', 'Mbale', '+256 752 890 114', 'O+', 'None documented', 'Acute febrile illness monitoring', 'Attention', 'usr-nurse-01');
  } else {
    // Backfill registered phone numbers and patient user binding on existing seeded patients if null
    try {
      db.prepare("UPDATE patients SET phone = COALESCE(phone, '+256 772 410 220'), user_id = COALESCE(user_id, 'usr-patient-01') WHERE id = 'pat-001'").run();
      db.prepare("UPDATE patients SET phone = COALESCE(phone, '+256 772 518 390') WHERE id = 'pat-002'").run();
      db.prepare("UPDATE patients SET phone = COALESCE(phone, '+256 782 641 205') WHERE id = 'pat-003'").run();
      db.prepare("UPDATE patients SET phone = COALESCE(phone, '+256 752 890 114') WHERE id = 'pat-004'").run();
    } catch {}
  }
  try {
    db.prepare("UPDATE users SET linked_patient_id = 'pat-001' WHERE id = 'usr-patient-01' AND linked_patient_id IS NULL").run();
    // Pre-establish primary care doctor-patient accepted connection between usr-patient-01 and usr-doctor-01
    const connCount = (db.prepare('SELECT COUNT(*) as cnt FROM account_connections').get() as { cnt: number }).cnt;
    if (connCount === 0) {
      db.prepare(`
        INSERT OR IGNORE INTO account_connections (id, pair_key, requester_id, recipient_id, status, request_note, initiated_by, patient_data_consent)
        VALUES ('conn-seed-001', 'usr-doctor-01::usr-patient-01', 'usr-patient-01', 'usr-doctor-01', 'accepted', 'Primary assigned physician link', 'usr-patient-01', 1)
      `).run();
    }
  } catch {}

  const rxCount = (db.prepare('SELECT COUNT(*) as cnt FROM prescriptions').get() as { cnt: number }).cnt;
  if (rxCount === 0) {

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
    insertAppt.run('apt-001', 'pat-001', 'Grace Namukasa', 'usr-doctor-01', 'Dr. Sarah M. Nakitto', 'Mulago Outpatient Clinic', '2026-11-14 10:30', 'Telemedicine', 'Post-antibiotic respiratory follow-up', 'Completed');
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
