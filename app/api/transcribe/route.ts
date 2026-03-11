import { NextRequest, NextResponse } from "next/server";
import { groq } from "@/lib/groq";

interface TranscriptionSegment {
  text: string;
  start: number;
  end: number;
  speaker?: string;
}

interface VerboseTranscription {
  text: string;
  segments?: TranscriptionSegment[];
}

async function assignSpeakers(
  segments: { text: string; start: number; end: number }[]
): Promise<string[]> {
  const segmentList = segments
    .map((s, i) => `${i + 1}. "${s.text.trim()}"`)
    .join("\n");

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0,
    messages: [
      {
        role: "system",
        content:
          "You are analyzing a conversation transcript. Given the segments, identify speaker turns and label each segment as 'Speaker A' or 'Speaker B'. " +
          "Use conversation context (questions/answers, topic changes, different perspectives) to detect speaker changes. " +
          "Return ONLY a valid JSON array of strings with exactly one label per segment, e.g. [\"Speaker A\",\"Speaker B\",\"Speaker A\"].",
      },
      {
        role: "user",
        content: `Assign speaker labels to these ${segments.length} segments:\n${segmentList}`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content ?? "[]";
  const match = content.match(/\[.*\]/s);
  if (!match) return segments.map(() => "Speaker A");

  const labels: string[] = JSON.parse(match[0]);
  // Ensure we have one label per segment
  return segments.map((_, i) => labels[i] ?? "Speaker A");
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audio = formData.get("audio") as File;

    if (!audio) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const transcription = await groq.audio.transcriptions.create({
      file: audio,
      model: "whisper-large-v3",
      response_format: "verbose_json",
    }) as VerboseTranscription;

    const rawSegments = transcription.segments?.map((seg) => ({
      text: seg.text,
      start: seg.start,
      end: seg.end,
    })) ?? [];

    // Use Llama to assign speaker labels based on conversation flow
    const speakerLabels = rawSegments.length > 0
      ? await assignSpeakers(rawSegments)
      : [];

    const speakerSegments = rawSegments.map((seg, i) => ({
      ...seg,
      speaker: speakerLabels[i],
    }));

    return NextResponse.json({
      fullText: transcription.text,
      speakerSegments,
    });
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
  }
}
