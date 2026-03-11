"use server";

import { db } from "@/db";
import { calls, transcriptions, summaries, users } from "@/db/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq, and, desc } from "drizzle-orm";

export async function createCall(contactName?: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Ensure user row exists (upsert on first call)
  const clerkUser = await currentUser();
  await db.insert(users).values({
    id: userId,
    email: clerkUser?.emailAddresses[0]?.emailAddress ?? "",
    name: clerkUser?.fullName ?? null,
  }).onConflictDoNothing();

  const [call] = await db.insert(calls).values({
    userId,
    contactName: contactName ?? "Unknown",
    status: "in_progress",
  }).returning();

  return call;
}

export async function saveCallResults({
  callId,
  fullText,
  speakerSegments,
  summary,
  actionItems,
  keyTopics,
  sentiment,
  durationSeconds,
}: {
  callId: string;
  fullText: string;
  speakerSegments: { text: string; start: number; end: number }[];
  summary: string;
  actionItems: string[];
  keyTopics: string[];
  sentiment: "positive" | "neutral" | "negative";
  durationSeconds: number;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Update call status + duration
  await db.update(calls)
    .set({ status: "completed", endedAt: new Date(), durationSeconds })
    .where(eq(calls.id, callId));

  // Save transcription
  await db.insert(transcriptions).values({
    callId,
    fullText,
    speakerSegments,
  });

  // Save summary
  await db.insert(summaries).values({
    callId,
    summaryText: summary,
    actionItems,
    keyTopics,
    sentiment,
  });

  return callId;
}

export async function failCall(callId: string) {
  await db.update(calls)
    .set({ status: "failed", endedAt: new Date() })
    .where(eq(calls.id, callId));
}

export async function getUserCalls() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return db.select().from(calls)
    .where(eq(calls.userId, userId))
    .orderBy(desc(calls.createdAt));
}

export async function getCall(callId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const [call] = await db.select().from(calls)
    .where(and(eq(calls.id, callId), eq(calls.userId, userId)));

  if (!call) return null;

  const [transcription] = await db.select().from(transcriptions)
    .where(eq(transcriptions.callId, callId));

  const [summary] = await db.select().from(summaries)
    .where(eq(summaries.callId, callId));

  return { call, transcription: transcription ?? null, summary: summary ?? null };
}
