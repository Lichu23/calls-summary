interface SpeakerSegment {
  text: string;
  start: number;
  end: number;
  speaker?: string;
}

interface TranscriptViewProps {
  fullText: string;
  speakerSegments?: SpeakerSegment[] | null;
}

function formatTimestamp(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const speakerColors: Record<string, string> = {
  "SPEAKER_00": "bg-blue-50 border-blue-200",
  "SPEAKER_01": "bg-green-50 border-green-200",
  "Speaker A": "bg-blue-50 border-blue-200",
  "Speaker B": "bg-green-50 border-green-200",
};

const speakerLabels: Record<string, string> = {
  "SPEAKER_00": "Speaker A",
  "SPEAKER_01": "Speaker B",
};

function getColor(speaker: string): string {
  return speakerColors[speaker] ?? (
    speaker.includes("0") ? "bg-blue-50 border-blue-200" : "bg-green-50 border-green-200"
  );
}

function getLabel(speaker: string): string {
  return speakerLabels[speaker] ?? speaker;
}

export default function TranscriptView({ fullText, speakerSegments }: TranscriptViewProps) {
  if (speakerSegments && speakerSegments.length > 0) {
    const hasSpeakerData = speakerSegments.some((seg) => !!seg.speaker);

    if (hasSpeakerData) {
      // Real diarization data — show speaker labels with colors
      return (
        <div className="space-y-3">
          {speakerSegments.map((seg, i) => (
            <div
              key={i}
              className={`rounded-lg border p-3 ${seg.speaker ? getColor(seg.speaker) : "bg-gray-50 border-gray-200"}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {seg.speaker ? getLabel(seg.speaker) : "Unknown"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatTimestamp(seg.start)} → {formatTimestamp(seg.end)}
                </span>
              </div>
              <p className="text-sm">{seg.text}</p>
            </div>
          ))}
        </div>
      );
    }

    // No speaker data — show as plain timeline
    return (
      <div className="space-y-2">
        {speakerSegments.map((seg, i) => (
          <div key={i} className="flex gap-3 items-start py-2 border-b last:border-0">
            <span className="text-xs text-muted-foreground tabular-nums pt-0.5 shrink-0">
              {formatTimestamp(seg.start)}
            </span>
            <p className="text-sm">{seg.text}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <p className="text-sm whitespace-pre-wrap leading-relaxed">{fullText}</p>
    </div>
  );
}
