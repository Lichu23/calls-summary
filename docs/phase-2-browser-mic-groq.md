# Phase 2 — Browser Mic + Groq Pipeline

## Goal
Record audio from the browser mic, transcribe it with Groq Whisper, summarize it with Groq Llama 3.3 70B, save all results to Supabase, and display the call detail.

## Status
✅ Complete

## Branch
`phase/2-mic-groq-pipeline` → merged into `main`

---

## Tasks

- [x] `MicRecorder` component — start/stop recording via `MediaRecorder` API
- [x] `/calls/new` page — orchestrates the full recording → transcribe → summarize → save flow
- [x] `/calls/[id]` page — displays transcript + summary after completion
- [x] `TranscriptView` component — renders speaker segments as a chat layout
- [x] `SummaryCard` component — renders summary, action items, key topics, sentiment
- [x] Dashboard layout with header + "New Recording" button
- [x] Calls list page (home) with empty state CTA
- [x] ✅ Testing Stage 1: solo mic test — transcription + summary verified working

## Recording Flow

```
User clicks "Start Recording"
        ↓
MediaRecorder captures audio chunks (browser mic)
        ↓
User clicks "Stop" → Blob assembled
        ↓
createCall() → new call row inserted with status "in_progress"
        ↓
POST /api/transcribe (FormData with blob)
  → Groq Whisper large v3
  → returns { fullText, speakerSegments }
        ↓
POST /api/summarize (JSON with transcript text)
  → Groq Llama 3.3 70B
  → returns { summary, actionItems, keyTopics, sentiment }
        ↓
saveCallResults() → DB updated (status: "completed")
        ↓
router.push(`/calls/${callId}`)
```

## State Machine (`/calls/new`)

| Stage | Description |
|-------|-------------|
| `idle` | Ready to record |
| `recording` | MediaRecorder active, timer running |
| `transcribing` | Waiting for Groq Whisper response |
| `summarizing` | Waiting for Groq Llama response |
| `done` | All saved, redirecting |
| `error` | Something failed, message shown |

## Key Files
- `app/(dashboard)/calls/new/page.tsx` — recording flow (client component)
- `app/(dashboard)/calls/[id]/page.tsx` — call detail (server component)
- `app/(dashboard)/layout.tsx` — dashboard shell with header + nav
- `app/(dashboard)/page.tsx` — calls list
- `src/components/MicRecorder.tsx` — MediaRecorder wrapper
- `src/components/TranscriptView.tsx` — speaker-labeled transcript
- `src/components/SummaryCard.tsx` — summary + action items + topics + sentiment
- `src/actions/calls.ts` — all DB server actions

## Lessons Learned
- Do NOT call server actions in `useEffect` — React 18 Strict Mode fires effects twice in dev, causing double DB writes. Call `createCall()` at the start of `handleRecordingComplete` instead.
- `createCall()` must upsert the user row first (FK constraint: `calls.user_id → users.id`)
- Default `app/page.tsx` overrides `app/(dashboard)/page.tsx` — delete the scaffold page
