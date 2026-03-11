import { NextRequest, NextResponse } from "next/server";
import { groq } from "@/lib/groq";

interface TranscriptionSegment {
  text: string;
  start: number;
  end: number;
}

interface VerboseTranscription {
  text: string;
  segments?: TranscriptionSegment[];
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

    // Extract speaker segments if available
    const speakerSegments = transcription.segments?.map((seg) => ({
      text: seg.text,
      start: seg.start,
      end: seg.end,
    })) ?? [];

    return NextResponse.json({
      fullText: transcription.text,
      speakerSegments,
    });
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
  }
}
