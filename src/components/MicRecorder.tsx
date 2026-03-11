"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface MicRecorderProps {
  onRecordingComplete: (blob: Blob, durationSeconds: number) => void;
  disabled?: boolean;
}

export default function MicRecorder({ onRecordingComplete, disabled }: MicRecorderProps) {
  const [state, setState] = useState<"idle" | "recording" | "done">("idle");
  const [permissionError, setPermissionError] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function startRecording() {
    setPermissionError(false);
    chunksRef.current = [];

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setPermissionError(true);
      return;
    }

    streamRef.current = stream;
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      stream.getTracks().forEach((t) => t.stop());
      setState("done");
      onRecordingComplete(blob, duration);
    };

    recorder.start(250);
    startTimeRef.current = Date.now();
    setElapsed(0);
    setState("recording");

    timerRef.current = setInterval(() => {
      setElapsed(Math.round((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  }

  function stopRecording() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    mediaRecorderRef.current?.stop();
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  if (permissionError) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        Microphone access was denied. Please allow microphone access in your
        browser settings and reload the page.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {state === "idle" && (
        <Button
          size="lg"
          onClick={startRecording}
          disabled={disabled}
          className="w-40"
        >
          Start Recording
        </Button>
      )}

      {state === "recording" && (
        <>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            Recording — {formatTime(elapsed)}
          </div>
          <Button
            variant="destructive"
            size="lg"
            onClick={stopRecording}
            className="w-40"
          >
            Stop
          </Button>
        </>
      )}

      {state === "done" && (
        <p className="text-sm text-muted-foreground">Recording complete. Processing…</p>
      )}
    </div>
  );
}
