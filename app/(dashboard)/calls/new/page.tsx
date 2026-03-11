"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCall, saveCallResults, failCall } from "@/actions/calls";
import MicRecorder from "@/components/MicRecorder";

type Stage = "idle" | "recording" | "transcribing" | "summarizing" | "done" | "error";

const stageMessages: Record<Stage, string> = {
  idle: "Ready to record",
  recording: "Recording…",
  transcribing: "Transcribing audio…",
  summarizing: "Generating summary…",
  done: "Done! Redirecting…",
  error: "Something went wrong.",
};

export default function NewCallPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleRecordingComplete(blob: Blob, durationSeconds: number) {
    let callId: string | null = null;

    try {
      // Step 1: Create call record
      const call = await createCall();
      callId = call.id;

      // Step 2: Transcribe
      setStage("transcribing");
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");

      const transcribeRes = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!transcribeRes.ok) {
        throw new Error(`Transcription failed: ${transcribeRes.statusText}`);
      }

      const { fullText, speakerSegments } = await transcribeRes.json();

      // Step 3: Summarize
      setStage("summarizing");
      const summarizeRes = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: fullText }),
      });

      if (!summarizeRes.ok) {
        throw new Error(`Summarization failed: ${summarizeRes.statusText}`);
      }

      const { summary, actionItems, keyTopics, sentiment } = await summarizeRes.json();

      // Step 3: Save results
      await saveCallResults({
        callId,
        fullText,
        speakerSegments,
        summary,
        actionItems,
        keyTopics,
        sentiment,
        durationSeconds,
      });

      setStage("done");
      router.push(`/calls/${callId}`);
    } catch (err) {
      console.error(err);
      if (callId) await failCall(callId).catch(() => {});
      setStage("error");
      setErrorMsg(err instanceof Error ? err.message : "An unexpected error occurred.");
    }
  }

  const isProcessing = stage === "transcribing" || stage === "summarizing" || stage === "done";

  return (
    <div className="max-w-lg mx-auto py-16 flex flex-col items-center gap-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-1">New Recording</h1>
        <p className="text-muted-foreground text-sm">
          Record a call and get an instant transcript and AI summary.
        </p>
      </div>

      {stage === "error" ? (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive text-center w-full">
          {errorMsg}
        </div>
      ) : isProcessing ? (
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">{stageMessages[stage]}</p>
        </div>
      ) : (
        <MicRecorder
          onRecordingComplete={handleRecordingComplete}
          disabled={stage !== "idle"}
        />
      )}
    </div>
  );
}
