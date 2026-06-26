import pkg from "pg";
const { Pool } = pkg;

// Initialize PostgreSQL Pool using Object Method parameters from the environment
export const pgPool = new Pool({
  host: process.env.SQL_HOST,
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DB_NAME,
  connectionTimeoutMillis: 10000,
});

pgPool.on("error", (err) => {
  console.error("[POSTGRES-POOL] Idle pool error:", err.message);
});

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
    expiresAt: "expires_at"
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
let bypassPostgresSync = false;

export function setBypassPostgresSync(val: boolean) {
  bypassPostgresSync = val;
}

export async function syncToPostgres(sqliteSql: string, params: any[], tableNameHint?: string) {
  if (bypassPostgresSync) {
    return;
  }

  // Filter out read-only query syncs
  const upperSql = sqliteSql.trim().toUpperCase();
  if (upperSql.startsWith("SELECT") || upperSql.startsWith("PRAGMA") || upperSql.startsWith("EXPLAIN")) {
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
    // Graceful logging without disrupting the main user experience thread
    console.warn(`[POSTGRES-SYNC-WRITE-WARNING] Failed to replicate query to PostgreSQL: "${sqliteSql}". Reason:`, err.message);
  }
}

// Startup pull sync: Pulls all PostgreSQL rows down to local SQLite to ensure fresh initialization
export async function syncFromPostgresToSqlite(sqliteDb: any) {
  console.log("[POSTGRES-SYNC] Initiating master cloud fetch sequence...");

  // Prevent slow boot delays block state: Do a quick 2000ms probe to check if PostgreSQL is reachable
  try {
    const probeQuery = pgPool.query("SELECT 1");
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Database connection timed out (2000ms limit)")), 2000);
    });
    await Promise.race([probeQuery, timeout]);
    console.log("[POSTGRES-SYNC] Cloud PostgreSQL connection active. Pulling data...");
  } catch (probeErr: any) {
    console.warn("[POSTGRES-SYNC-INFO] Under-configured or unreachable cloud PostgreSQL. System will operate on standalone local SQLite mode.", probeErr.message);
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
      { name: "feedback", idCol: "id" }
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

              sqliteRow[camelKey] = row[key];
            }

            // Generate general insert-or-replace placeholders
            const keys = Object.keys(sqliteRow);
            const placeholders = keys.map(() => "?").join(", ");
            const vals = keys.map(k => sqliteRow[k]);

            try {
              sqliteDb.prepare(`INSERT OR REPLACE INTO ${table.name} (${keys.join(", ")}) VALUES (${placeholders})`).run(...vals);
            } catch (sqliteErr: any) {
              console.warn(`[POSTGRES-SYNC-WARNING] Skipping row sync on SQLite for table "${table.name}":`, sqliteErr.message);
            }
          }
        })();
      } catch (err: any) {
        console.warn(`[POSTGRES-SYNC-WARNING] Startup pull skipped for table "${table.name}". Postgres table might be clean or un-migrated. Details:`, err.message);
      }
    }

    console.log("[POSTGRES-SYNC] Master sync and database convergence completed.");
  } finally {
    setBypassPostgresSync(false);
  }
}
