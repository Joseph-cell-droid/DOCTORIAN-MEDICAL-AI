import { pgTable, text, timestamp, integer, real, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. Users Table
export const users = pgTable("users", {
  id: text("id").primaryKey(), // Using string UID or identifier
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  photoURL: text("photo_url"),
  role: text("role").default("user"),
  credits: real("credits").default(400),
  lastUnitReset: text("last_unit_reset"),
  institutionId: text("institution_id"),
  doctorPhone: text("doctor_phone"),
  doctorEmail: text("doctor_email"),
  doctorName: text("doctor_name"),
  mentorPhone: text("mentor_phone"),
  mentorEmail: text("mentor_email"),
  mentorName: text("mentor_name"),
  doctorId: text("doctor_id"),
  mentorId: text("mentor_id"),
  phone: text("phone"),
  enableExternalAI: integer("enable_external_ai").default(0),
  ollamaUrl: text("ollama_url"),
  ollamaModel: text("ollama_model").default("llama3"),
  huggingfaceToken: text("huggingface_token"),
  huggingfaceModel: text("huggingface_model").default("meta-llama/Llama-3.1-8B-Instruct"),
  createdAt: text("created_at").notNull(),
});

// 2. Notifications Table
export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").default("info"),
  recipientId: text("recipient_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 3. Health Records Table
export const records = pgTable("records", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  type: text("type").notNull(),
  value: text("value").notNull(),
  unit: text("unit"),
  date: text("date").notNull(),
  notes: text("notes"),
  attachmentURL: text("attachment_url"),
});

// 4. Reset Tokens Table
export const resetTokens = pgTable("reset_tokens", {
  token: text("token").primaryKey(),
  userId: text("user_id").notNull(),
  code: text("code"),
  expiresAt: text("expires_at").notNull(),
});

// 5. System Logs Table
export const systemLogs = pgTable("system_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  action: text("action").notNull(),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 6. Feedback Table
export const feedback = pgTable("feedback", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  messageId: text("message_id").notNull(),
  rating: text("rating").notNull(),
  suggestion: text("suggestion"),
  timestamp: text("timestamp").notNull(),
});

// 7. Medications Table
export const medications = pgTable("medications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  dosage: text("dosage"),
  frequency: text("frequency"),
  time: text("time"),
  category: text("category").default("prescription"),
  remindersEnabled: integer("reminders_enabled").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

// 8. Medication Intakes Table
export const medicationIntakes = pgTable("medication_intakes", {
  id: text("id").primaryKey(),
  medicationId: text("medication_id").notNull(),
  userId: text("user_id").notNull(),
  takenAt: timestamp("taken_at").defaultNow(),
});

// 9. Chat Sessions Table
export const chatSessions = pgTable("chat_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title"),
  persona: text("persona"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 10. Chat Messages Table
export const chatMessages = pgTable("chat_messages", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  role: text("role").notNull(),
  text: text("text").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// 11. User AI Context Table
export const userAiContext = pgTable("user_ai_context", {
  userId: text("user_id").primaryKey(),
  mood: text("mood").default("neutral"),
  preferredGreeting: text("preferred_greeting").default("Professional"),
  lastGreeting: timestamp("last_greeting"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 12. Tasks Table
export const tasks = pgTable("tasks", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  deadline: text("deadline").notNull(),
  priority: text("priority").default("medium"),
  completed: integer("completed").default(0),
  notified: integer("notified").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// 13. Workouts Table
export const workouts = pgTable("workouts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  type: text("type").notNull(),
  duration: integer("duration").notNull(),
  calories: integer("calories"),
  intensity: text("intensity"),
  date: text("date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 14. Credentials (WebAuthn) Table
export const credentialsTable = pgTable("credentials", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  publicKey: text("public_key").notNull(), // text (Base64) to store public key cleanly
  counter: integer("counter").notNull(),
  transports: text("transports"),
});

// 15. Fine Tuning Jobs Table
export const fineTuningJobs = pgTable("fine_tuning_jobs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  baseModel: text("base_model").notNull(),
  customName: text("custom_name"),
  datasetSize: integer("dataset_size"),
  epochs: integer("epochs"),
  status: text("status").notNull(),
  progress: integer("progress").default(0),
  valLoss: real("val_loss").default(0.0),
  valAccuracy: real("val_accuracy").default(0.0),
  logs: text("logs"),
  isActive: integer("is_active").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// 16. Payments Table
export const payments = pgTable("payments", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  amount: real("amount"),
  currency: text("currency"),
  status: text("status"),
  externalId: text("external_id"),
  tier: text("tier"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 17. Knowledge Base Table
export const knowledgeBase = pgTable("knowledge_base", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  title: text("title"),
  content: text("content"),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 18. Developer Keys Table
export const developerKeys = pgTable("developer_keys", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  apiKey: text("api_key").notNull().unique(),
  label: text("label"),
  lastUsed: timestamp("last_used"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 19. Doctors Table
export const doctors = pgTable("doctors", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  whatsappNumber: text("whatsapp_number").notNull(),
  specialization: text("specialization").notNull(),
  location: text("location").notNull(),
  imageUrl: text("image_url"),
  active: integer("active").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relationships Setup
export const usersRelations = relations(users, ({ many, one }) => ({
  records: many(records),
  notifications: many(notifications),
  logs: many(systemLogs),
  medications: many(medications),
  tasks: many(tasks),
  workouts: many(workouts),
  aiContext: one(userAiContext, {
    fields: [users.id],
    references: [userAiContext.userId],
  }),
}));

export const recordsRelations = relations(records, ({ one }) => ({
  user: one(users, {
    fields: [records.userId],
    references: [users.id],
  }),
}));

export const medicationsRelations = relations(medications, ({ many, one }) => ({
  user: one(users, {
    fields: [medications.userId],
    references: [users.id],
  }),
  intakes: many(medicationIntakes),
}));

export const workoutsRelations = relations(workouts, ({ one }) => ({
  user: one(users, {
    fields: [workouts.userId],
    references: [users.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
}));
