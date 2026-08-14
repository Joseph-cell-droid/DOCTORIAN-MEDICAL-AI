import pkg from "pg";
const { Pool } = pkg;

// Initialize PostgreSQL Pool using Object Method parameters from the environment
export const pgPool = process.env.SQL_HOST ? new Pool({
  host: process.env.SQL_HOST,
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DB_NAME,
  connectionTimeoutMillis: 10000,
}) : null as any;

if (pgPool) {
  pgPool.on("error", (err: any) => {
    console.error("[POSTGRES-POOL] Idle pool error:", err.message);
  });
}

// Direct utility to translate standard SQLite query strings into PostgreSQL dialect
export function translateSqlToPg(sqliteSql: string, tableNameHint?: string): string {
  let pgSql = sqliteSql;

  // Translate SQLite camelCase columns to snake_case for PostgreSQL compatibility
  const columnReplacements: { [key: string]: string } = {
    userId: "user_id",
    photoURL: "photo_url",
    displayName: "display_name",
    recipientId: "recipient_id",
    whatsappNumber: "whatsapp_number",
    messageId: "message_id",
    medicationId: "medication_id",
    takenAt: "taken_at",
    sessionId: "session_id",
    preferredGreeting: "preferred_greeting",
    lastGreeting: "last_greeting",
    updatedAt: "updated_at",
    remindersEnabled: "reminders_enabled",
    createdAt: "created_at",
    valLoss: "val_loss",
    valAccuracy: "val_accuracy",
    baseModel: "base_model",
    customName: "custom_name",
    datasetSize: "dataset_size",
    externalId: "external_id",
    isActive: "is_active",
    apiKey: "api_key",
    lastUsed: "last_used",
    institutionId: "institution_id",
    doctorPhone: "doctor_phone",
    doctorEmail: "doctor_email",
    doctorName: "doctor_name",
    mentorPhone: "mentor_phone",
    mentorEmail: "mentor_email",
    mentorName: "mentor_name",
    doctorId: "doctor_id",
    mentorId: "mentor_id",
    enableExternalAI: "enable_external_ai",
    ollamaUrl: "ollama_url",
    ollamaModel: "ollama_model",
    huggingfaceToken: "huggingface_token",
    huggingfaceModel: "huggingface_model",
    lastUnitReset: "last_unit_reset",
    attachmentURL: "attachment_url",
    expiresAt: "expires_at",
    lastActive: "last_active",
    bloodGroup: "blood_group",
    hospitalPreference: "hospital_preference",
    subscriptionTier: "subscription_tier",
    subscriptionStatus: "subscription_status",
    lastPaymentDate: "last_payment_date",
    paymentEvidence: "payment_evidence",
    patientId: "patient_id",
    patientName: "patient_name",
    vitalAlertSource: "vital_alert_source",
    dispatchCode: "dispatch_code",
    ambulanceUnit: "ambulance_unit",
    paramedicTeam: "paramedic_team",
    destinationHospital: "destination_hospital",
    equipmentStatus: "equipment_status",
    etaMinutes: "eta_minutes",
    distanceKm: "distance_km"
  };

  for (const [camel, snake] of Object.entries(columnReplacements)) {
    const regex = new RegExp(`\\b${camel}\\b`, "gi");
    pgSql = pgSql.replace(regex, snake);
  }

  // 1. Convert standard SQLite "INSERT OR IGNORE" to PostgreSQL conflict syntax
  if (pgSql.includes("INSERT OR IGNORE")) {
    pgSql = pgSql.replace(/INSERT OR IGNORE/gi, "INSERT");
    const lower = pgSql.toLowerCase();
    if (lower.includes("into knowledge_base")) {
      pgSql += " ON CONFLICT (id) DO NOTHING";
    } else if (lower.includes("into users")) {
      pgSql += " ON CONFLICT (id) DO NOTHING";
    } else if (lower.includes("into developer_keys")) {
      pgSql += " ON CONFLICT (api_key) DO NOTHING";
    } else {
      pgSql += " ON CONFLICT DO NOTHING";
    }
  }

  // 2. Convert standard SQLite "INSERT OR REPLACE" to PostgreSQL UPSERT
  if (pgSql.includes("INSERT OR REPLACE")) {
    pgSql = pgSql.replace(/INSERT OR REPLACE/gi, "INSERT");
    // Append minimal crash prevention
    pgSql += " ON CONFLICT DO NOTHING";
  }

  // 3. Convert SQL datetime('now') and CURRENT_TIMESTAMP patterns safely
  pgSql = pgSql.replace(/datetime\('now'\)/gi, "CURRENT_TIMESTAMP");
  pgSql = pgSql.replace(/datetime\('now', 'localtime'\)/gi, "CURRENT_TIMESTAMP");

  // 4. Map SQLite "?" parameter placeholders to PostgreSQL sequential positional ($1, $2) variables
  let paramCounter = 1;
  pgSql = pgSql.replace(/\?/g, () => `$${paramCounter++}`);

  return pgSql;
}

// Background Replication Task
let bypassPostgresSync = !process.env.SQL_HOST;

export function setBypassPostgresSync(val: boolean) {
  bypassPostgresSync = val;
}

export async function syncToPostgres(sqliteSql: string, params: any[], tableNameHint?: string) {
  if (bypassPostgresSync) {
    return;
  }

  // Filter out read-only query syncs and DDL statements
  const upperSql = sqliteSql.trim().toUpperCase();
  if (
    upperSql.startsWith("SELECT") || 
    upperSql.startsWith("PRAGMA") || 
    upperSql.startsWith("EXPLAIN") ||
    upperSql.startsWith("CREATE") ||
    upperSql.startsWith("ALTER") ||
    upperSql.startsWith("DROP")
  ) {
    return;
  }

  try {
    const pgSql = translateSqlToPg(sqliteSql, tableNameHint);
    
    // Safely map complex parameters to JSON or clean primitives (similar to sqlite driver)
    const pgParams = params.map(p => {
      if (p !== null && typeof p === "object") {
        return JSON.stringify(p);
      }
      return p;
    });

    await pgPool.query(pgSql, pgParams);
  } catch (err: any) {
    if (err.message.includes("permission denied") || err.message.includes("is not allowed") || err.message.includes("Connection")) {
      console.log(`[POSTGRES-SYNC-INFO] PostgreSQL sync write permission restricted or unreachable. Bypassing further PostgreSQL sync tasks.`);
      setBypassPostgresSync(true);
    } else {
      console.log(`[POSTGRES-SYNC-INFO] PostgreSQL sync write bypassed: "${sqliteSql.substring(0, 40)}...". Reason:`, err.message);
    }
  }
}

// Startup pull sync: Pulls all PostgreSQL rows down to local SQLite to ensure fresh initialization
export async function syncFromPostgresToSqlite(sqliteDb: any) {
  if (bypassPostgresSync || !pgPool) {
    console.log("[POSTGRES-SYNC] PostgreSQL not configured or bypassed. Using local SQLite store.");
    return;
  }
  console.log("[POSTGRES-SYNC] Initiating master cloud fetch sequence...");

  // Prevent slow boot delays block state: Do a quick 2000ms probe to check if PostgreSQL is reachable
  try {
    const probeQuery = pgPool.query("SELECT 1");
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Database connection timed out (2000ms limit)")), 2000);
    });
    await Promise.race([probeQuery, timeout]);
    console.log("[POSTGRES-SYNC] Cloud PostgreSQL connection active. Pulling data...");

    // Run active schema migrations on startup
    console.log("[POSTGRES-SYNC] Ensuring PostgreSQL schemas are updated...");
    try {
      // Ensure all major tables exist in PostgreSQL
      await pgPool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          display_name TEXT,
          photo_url TEXT,
          role TEXT DEFAULT 'user',
          credits REAL DEFAULT 400,
          last_unit_reset TEXT,
          institution_id TEXT,
          doctor_phone TEXT,
          doctor_email TEXT,
          doctor_name TEXT,
          mentor_phone TEXT,
          mentor_email TEXT,
          mentor_name TEXT,
          doctor_id TEXT,
          mentor_id TEXT,
          phone TEXT,
          enable_external_ai INTEGER DEFAULT 0,
          ollama_url TEXT,
          ollama_model TEXT DEFAULT 'llama3',
          huggingface_token TEXT,
          huggingface_model TEXT DEFAULT 'google/gemma-3-4b-it',
          allergies TEXT,
          conditions TEXT,
          blood_group TEXT,
          hospital_preference TEXT,
          subscription_tier TEXT DEFAULT 'free',
          subscription_status TEXT DEFAULT 'inactive',
          last_payment_date TEXT,
          payment_evidence TEXT,
          created_at TEXT NOT NULL
        )
      `);

      await pgPool.query(`
        CREATE TABLE IF NOT EXISTS notifications (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          type TEXT DEFAULT 'info',
          recipient_id TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await pgPool.query(`
        CREATE TABLE IF NOT EXISTS records (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          type TEXT NOT NULL,
          value TEXT NOT NULL,
          unit TEXT,
          date TEXT NOT NULL,
          notes TEXT,
          attachment_url TEXT
        )
      `);

      await pgPool.query(`
        CREATE TABLE IF NOT EXISTS medications (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          name TEXT NOT NULL,
          dosage TEXT,
          frequency TEXT,
          time TEXT,
          category TEXT DEFAULT 'prescription',
          reminders_enabled INTEGER DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await pgPool.query(`
        CREATE TABLE IF NOT EXISTS medication_intakes (
          id TEXT PRIMARY KEY,
          medication_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await pgPool.query(`
        CREATE TABLE IF NOT EXISTS chat_sessions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          title TEXT,
          persona TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await pgPool.query(`
        CREATE TABLE IF NOT EXISTS chat_messages (
          id TEXT PRIMARY KEY,
          session_id TEXT NOT NULL,
          role TEXT NOT NULL,
          text TEXT NOT NULL,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await pgPool.query(`
        CREATE TABLE IF NOT EXISTS user_ai_context (
          user_id TEXT PRIMARY KEY,
          mood TEXT DEFAULT 'neutral',
          preferred_greeting TEXT DEFAULT 'Professional',
          last_greeting TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await pgPool.query(`
        CREATE TABLE IF NOT EXISTS tasks (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          deadline TEXT NOT NULL,
          priority TEXT DEFAULT 'medium',
          completed INTEGER DEFAULT 0,
          notified INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await pgPool.query(`
        CREATE TABLE IF NOT EXISTS workouts (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          type TEXT NOT NULL,
          duration INTEGER NOT NULL,
          calories INTEGER,
          intensity TEXT,
          date TEXT NOT NULL,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await pgPool.query(`
        CREATE TABLE IF NOT EXISTS payments (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          amount REAL,
          currency TEXT,
          status TEXT,
          external_id TEXT,
          tier TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await pgPool.query(`
        CREATE TABLE IF NOT EXISTS knowledge_base (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          title TEXT,
          content TEXT,
          category TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await pgPool.query(`
        CREATE TABLE IF NOT EXISTS developer_keys (
          id SERIAL PRIMARY KEY,
          user_id TEXT NOT NULL,
          api_key TEXT UNIQUE NOT NULL,
          label TEXT,
          last_used TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await pgPool.query(`
        CREATE TABLE IF NOT EXISTS doctors (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          whatsapp_number TEXT NOT NULL,
          specialization TEXT NOT NULL,
          location TEXT NOT NULL,
          image_url TEXT,
          active INTEGER DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await pgPool.query(`
        CREATE TABLE IF NOT EXISTS fine_tuning_jobs (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          base_model TEXT NOT NULL,
          custom_name TEXT,
          dataset_size INTEGER,
          epochs INTEGER,
          status TEXT NOT NULL,
          progress INTEGER DEFAULT 0,
          val_loss REAL DEFAULT 0.0,
          val_accuracy REAL DEFAULT 0.0,
          logs TEXT,
          is_active INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await pgPool.query(`
        CREATE TABLE IF NOT EXISTS feedback (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          message_id TEXT NOT NULL,
          rating TEXT NOT NULL,
          suggestion TEXT,
          timestamp TEXT NOT NULL
        )
      `);

      await pgPool.query(`
        CREATE TABLE IF NOT EXISTS emergency_contacts (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          name TEXT NOT NULL,
          phone TEXT NOT NULL,
          role TEXT NOT NULL,
          email TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await pgPool.query(`
        CREATE TABLE IF NOT EXISTS ambulance_dispatches (
          id TEXT PRIMARY KEY,
          patient_id TEXT NOT NULL,
          patient_name TEXT NOT NULL,
          vital_alert_source TEXT,
          severity TEXT NOT NULL,
          dispatch_code TEXT NOT NULL,
          ambulance_unit TEXT NOT NULL,
          paramedic_team TEXT NOT NULL,
          destination_hospital TEXT NOT NULL,
          status TEXT NOT NULL,
          equipment_status TEXT NOT NULL,
          eta_minutes INTEGER DEFAULT 15,
          distance_km REAL DEFAULT 5.2,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      const addCol = async (tableName: string, colName: string, sqlConstraint: string) => {
        const check = await pgPool.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = $1 AND column_name = $2
        `, [tableName, colName]);
        if (check.rows.length === 0) {
          console.log(`[POSTGRES-SYNC] Adding column ${colName} to table ${tableName} in PostgreSQL...`);
          await pgPool.query(`ALTER TABLE ${tableName} ADD COLUMN ${colName} ${sqlConstraint}`);
        }
      };

      await addCol("users", "allergies", "TEXT");
      await addCol("users", "conditions", "TEXT");
      await addCol("users", "blood_group", "TEXT");
      await addCol("users", "hospital_preference", "TEXT");
      await addCol("users", "subscription_tier", "TEXT DEFAULT 'free'");
      await addCol("users", "subscription_status", "TEXT DEFAULT 'inactive'");
      await addCol("users", "last_payment_date", "TEXT");
      await addCol("users", "payment_evidence", "TEXT");
      await addCol("records", "attachment_url", "TEXT");
      
    } catch (migErr: any) {
      console.log("[POSTGRES-SYNC-INFO] Schema verification bypassed or skipped:", migErr.message);
      if (migErr.message.includes("permission denied") || migErr.message.includes("is not allowed")) {
        console.log("[POSTGRES-SYNC-INFO] PostgreSQL public schema permission restricted. Falling back to local storage.");
        setBypassPostgresSync(true);
      }
    }

  } catch (probeErr: any) {
    console.warn("[POSTGRES-SYNC-INFO] Under-configured or unreachable cloud PostgreSQL. System will operate on standalone local SQLite mode.", probeErr.message);
    setBypassPostgresSync(true);
    return;
  }

  setBypassPostgresSync(true);

  try {
    const tablesToSync = [
      { name: "users", idCol: "id" },
      { name: "doctors", idCol: "id" },
      { name: "medications", idCol: "id" },
      { name: "records", idCol: "id" },
      { name: "notifications", idCol: "id" },
      { name: "medication_intakes", idCol: "id" },
      { name: "chat_sessions", idCol: "id" },
      { name: "chat_messages", idCol: "id" },
      { name: "user_ai_context", idCol: "userId" },
      { name: "tasks", idCol: "id" },
      { name: "workouts", idCol: "id" },
      { name: "payments", idCol: "id" },
      { name: "knowledge_base", idCol: "id" },
      { name: "developer_keys", idCol: "id" },
      { name: "fine_tuning_jobs", idCol: "id" },
      { name: "feedback", idCol: "id" },
      { name: "emergency_contacts", idCol: "id" },
      { name: "ambulance_dispatches", idCol: "id" }
    ];

    for (const table of tablesToSync) {
      try {
        // Query PostgreSQL for current table records
        const pgRes = await pgPool.query(`SELECT * FROM ${table.name}`);
        if (pgRes.rows.length === 0) continue;

        console.log(`[POSTGRES-SYNC] Found ${pgRes.rows.length} rows for table "${table.name}" in PostgreSQL. Syncing local cache...`);

        // Batch insert into SQLite using INSERT OR REPLACE
        sqliteDb.transaction(() => {
          for (const row of pgRes.rows) {
            // Normalize column names from snake_case in PG to camelCase in SQLite
            const sqliteRow: any = {};
            for (const key of Object.keys(row)) {
              // Map snake_case keys back if they differ
              let camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
              // Hand-curated special column overrides
              if (key === "user_id") camelKey = "userId";
              if (key === "photo_url") camelKey = "photoURL";
              if (key === "display_name") camelKey = "displayName";
              if (key === "recipient_id") camelKey = "recipientId";
              if (key === "whatsapp_number") camelKey = "whatsappNumber";
              if (key === "message_id") camelKey = "messageId";
              if (key === "medication_id") camelKey = "medicationId";
              if (key === "taken_at") camelKey = "takenAt";
              if (key === "session_id") camelKey = "sessionId";
              if (key === "preferred_greeting") camelKey = "preferredGreeting";
              if (key === "last_greeting") camelKey = "lastGreeting";
              if (key === "updated_at") camelKey = "updatedAt";
              if (key === "reminders_enabled") camelKey = "remindersEnabled";
              if (key === "created_at") camelKey = "createdAt";
              if (key === "val_loss") camelKey = "valLoss";
              if (key === "val_accuracy") camelKey = "valAccuracy";
              if (key === "base_model") camelKey = "baseModel";
              if (key === "custom_name") camelKey = "customName";
              if (key === "dataset_size") camelKey = "datasetSize";
              if (key === "external_id") camelKey = "externalId";
              if (key === "is_active") camelKey = "isActive";
              if (key === "api_key") camelKey = "apiKey";
              if (key === "last_used") camelKey = "lastUsed";
              if (key === "last_active") camelKey = "lastActive";
              if (key === "blood_group") camelKey = "bloodGroup";
              if (key === "hospital_preference") camelKey = "hospitalPreference";
              if (key === "subscription_tier") camelKey = "subscriptionTier";
              if (key === "subscription_status") camelKey = "subscriptionStatus";
              if (key === "last_payment_date") camelKey = "lastPaymentDate";
              if (key === "payment_evidence") camelKey = "paymentEvidence";
              if (key === "patient_id") camelKey = "patientId";
              if (key === "patient_name") camelKey = "patientName";
              if (key === "vital_alert_source") camelKey = "vitalAlertSource";
              if (key === "dispatch_code") camelKey = "dispatchCode";
              if (key === "ambulance_unit") camelKey = "ambulanceUnit";
              if (key === "paramedic_team") camelKey = "paramedicTeam";
              if (key === "destination_hospital") camelKey = "destinationHospital";
              if (key === "equipment_status") camelKey = "equipmentStatus";
              if (key === "eta_minutes") camelKey = "etaMinutes";
              if (key === "distance_km") camelKey = "distanceKm";

              sqliteRow[camelKey] = row[key];
            }

            // Generate general insert-or-replace placeholders
            const keys = Object.keys(sqliteRow);
            const placeholders = keys.map(() => "?").join(", ");
            const vals = keys.map(k => sqliteRow[k]);

            try {
              sqliteDb.prepare(`INSERT OR REPLACE INTO ${table.name} (${keys.join(", ")}) VALUES (${placeholders})`).run(...vals);
            } catch (sqliteErr: any) {
              console.log(`[POSTGRES-SYNC-INFO] Skipping row sync on SQLite for table "${table.name}":`, sqliteErr.message);
            }
          }
        })();
      } catch (err: any) {
        console.log(`[POSTGRES-SYNC-INFO] Startup pull skipped for table "${table.name}". Postgres table might be clean or un-migrated. Details:`, err.message);
      }
    }

    console.log("[POSTGRES-SYNC] Master sync and database convergence completed.");
  } finally {
    setBypassPostgresSync(false);
  }
}
