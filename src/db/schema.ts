import { pgTable, text, timestamp, integer, jsonb, pgEnum } from "drizzle-orm/pg-core";

export const callStatusEnum = pgEnum("call_status", [
  "in_progress",
  "processing",
  "completed",
  "failed",
]);

export const sentimentEnum = pgEnum("sentiment", [
  "positive",
  "neutral",
  "negative",
]);

export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk user ID
  email: text("email").notNull(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const calls = pgTable("calls", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  contactName: text("contact_name"),
  phone: text("phone"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
  durationSeconds: integer("duration_seconds"),
  status: callStatusEnum("status").default("in_progress").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transcriptions = pgTable("transcriptions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  callId: text("call_id").notNull().references(() => calls.id, { onDelete: "cascade" }),
  fullText: text("full_text").notNull(),
  speakerSegments: jsonb("speaker_segments"), // [{ speaker: "A", text: "...", start: 0 }]
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const summaries = pgTable("summaries", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  callId: text("call_id").notNull().references(() => calls.id, { onDelete: "cascade" }),
  summaryText: text("summary_text").notNull(),
  actionItems: jsonb("action_items"), // string[]
  keyTopics: jsonb("key_topics"),     // string[]
  sentiment: sentimentEnum("sentiment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
