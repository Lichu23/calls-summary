import { getCall } from "@/actions/calls";
import { notFound } from "next/navigation";
import TranscriptView from "@/components/TranscriptView";
import SummaryCard from "@/components/SummaryCard";
import { ProcessingPoller } from "@/components/ProcessingPoller";

export const revalidate = 0; // always fetch fresh — ProcessingPoller needs live data
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function formatDuration(seconds: number | null) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  completed: "default",
  in_progress: "secondary",
  processing: "secondary",
  failed: "destructive",
};

export default async function CallDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getCall(id);

  if (!result) notFound();

  const { call, transcription, summary } = result;
  const isProcessing = call.status === "in_progress" || call.status === "processing";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Auto-refresh while processing */}
      {isProcessing && <ProcessingPoller />}

      {/* Back link */}
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/">&larr; Back to calls</Link>
      </Button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold">
            {call.contactName ?? "Unknown"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {formatDate(call.startedAt)} &middot; {formatDuration(call.durationSeconds)}
          </p>
        </div>
        <Badge variant={statusVariant[call.status] ?? "outline"}>
          {call.status.replace("_", " ")}
        </Badge>
      </div>

      {/* Processing state */}
      {isProcessing && (
        <div className="flex flex-col items-center gap-4 py-16 text-center rounded-lg border">
          <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <div>
            <p className="font-medium">Processing your call</p>
            <p className="text-sm text-muted-foreground mt-1">
              Transcribing and summarizing — this usually takes under a minute.
            </p>
          </div>
        </div>
      )}

      {/* Failed state */}
      {call.status === "failed" && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          This call failed to process. Please try a new recording.
        </div>
      )}

      {/* Results — two columns on large screens */}
      {call.status === "completed" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {summary && (
            <section className="rounded-lg border p-5">
              <h2 className="text-lg font-semibold mb-4">Summary</h2>
              <SummaryCard
                summaryText={summary.summaryText}
                actionItems={summary.actionItems as string[] | null}
                keyTopics={summary.keyTopics as string[] | null}
                sentiment={summary.sentiment}
              />
            </section>
          )}

          {transcription && (
            <section className="rounded-lg border p-5">
              <h2 className="text-lg font-semibold mb-4">Transcript</h2>
              <TranscriptView
                fullText={transcription.fullText}
                speakerSegments={
                  transcription.speakerSegments as
                    | { text: string; start: number; end: number; speaker?: string }[]
                    | null
                }
              />
            </section>
          )}
        </div>
      )}
    </div>
  );
}
