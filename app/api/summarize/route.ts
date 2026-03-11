import { NextRequest, NextResponse } from "next/server";
import { groq } from "@/lib/groq";

export async function POST(req: NextRequest) {
  try {
    const { transcript } = await req.json();

    if (!transcript) {
      return NextResponse.json({ error: "No transcript provided" }, { status: 400 });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an expert at summarizing conversations.
Given a call transcript, return a JSON object with exactly this structure:
{
  "summary": "2-3 sentence summary of the conversation",
  "actionItems": ["action item 1", "action item 2"],
  "keyTopics": ["topic1", "topic2", "topic3"],
  "sentiment": "positive" | "neutral" | "negative"
}
Return only valid JSON, no extra text.`,
        },
        {
          role: "user",
          content: `Summarize this call transcript:\n\n${transcript}`,
        },
      ],
      temperature: 0.3,
    });

    const raw = completion.choices[0].message.content ?? "{}";
    const result = JSON.parse(raw);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Summarization error:", error);
    return NextResponse.json({ error: "Summarization failed" }, { status: 500 });
  }
}
