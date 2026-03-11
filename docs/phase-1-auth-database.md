# Phase 1 — Auth & Database

## Goal
Set up Clerk authentication and Supabase database with the full schema, migrations, and protected routes.

## Status
✅ Complete

## Branch
`master` (committed alongside Phase 0)

---

## Tasks

- [x] Define Drizzle schema: `users`, `calls`, `transcriptions`, `summaries`
- [x] Run `npm run db:generate` → generate SQL migrations
- [x] Run `npm run db:migrate` → apply migrations on Supabase
- [x] Enable RLS on all tables (`0001_enable_rls.sql`)
- [x] Configure Clerk middleware for protected routes
- [x] Sign-in / sign-up pages under `app/(auth)/`
- [x] API routes for Groq transcription + summarization

## Key Files Created
- `src/db/schema.ts` — Drizzle table definitions
- `src/db/migrations/` — auto-generated SQL
- `src/db/migrations/0001_enable_rls.sql` — RLS policies (must be run manually in Supabase)
- `app/(auth)/sign-in/page.tsx` — Clerk `<SignIn />` component
- `app/(auth)/sign-up/page.tsx` — Clerk `<SignUp />` component
- `app/api/transcribe/route.ts` — Groq Whisper, returns `{ fullText, speakerSegments }`
- `app/api/summarize/route.ts` — Groq Llama 3.3 70B, returns `{ summary, actionItems, keyTopics, sentiment }`
- `src/actions/calls.ts` — server actions: `createCall`, `saveCallResults`, `failCall`, `getUserCalls`, `getCall`

## Database Schema

```sql
users (
  id          text PRIMARY KEY,   -- Clerk user ID
  email       text NOT NULL,
  name        text,
  created_at  timestamp DEFAULT now()
)

calls (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          text REFERENCES users(id),
  contact_name     text DEFAULT 'Unknown',
  status           text,           -- in_progress | processing | completed | failed
  duration_seconds integer,
  started_at       timestamp DEFAULT now(),
  ended_at         timestamp,
  created_at       timestamp DEFAULT now()
)

transcriptions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id          uuid REFERENCES calls(id),
  full_text        text,
  speaker_segments jsonb,          -- [{ text, start, end }]
  created_at       timestamp DEFAULT now()
)

summaries (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id      uuid REFERENCES calls(id),
  summary_text text,
  action_items jsonb,              -- string[]
  key_topics   jsonb,              -- string[]
  sentiment    text                -- positive | neutral | negative
)
```

## Important Rules
- Every new table MUST have RLS enabled + policies in `0001_enable_rls.sql`
- User row must exist before inserting a call (FK constraint) — `createCall()` upserts the user row first
- Never store audio in the database — text only
