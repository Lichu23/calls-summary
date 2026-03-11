# Calls Summary

A web app + Chrome extension that records browser-based calls (Google Meet, Zoom, Teams, WhatsApp Web), transcribes them with AI, and generates a structured summary with action items, key topics, and sentiment. No audio is ever stored — text only.

---

## Features

- **Browser mic recording** — record any conversation directly from the web app
- **Chrome extension** *(coming in Phase 4)* — capture tab audio from Meet, Zoom, Teams, etc.
- **AI transcription** — Groq Whisper large v3
- **Speaker detection** — Groq Llama 3.3 70B assigns Speaker A / Speaker B labels
- **AI summary** — summary, action items, key topics, and sentiment
- **Calls history** — dashboard with all past calls, status badges, and duration
- **Dark mode** — system default or manual toggle
- **Responsive** — works on desktop and mobile

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 + TypeScript |
| Auth | Clerk |
| Database | Supabase PostgreSQL |
| ORM | Drizzle ORM |
| Transcription | Groq API — Whisper large v3 |
| Summarization + Diarization | Groq API — Llama 3.3 70B |
| UI | shadcn/ui + Tailwind CSS v4 |
| Extension | Chrome Extension — Manifest V3 *(Phase 4)* |
| Deployment | Vercel |

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create a `.env.local` file in the root:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=

# Groq
GROQ_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run database migrations

```bash
npm run db:generate
npm run db:migrate
```

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Dev Commands

```bash
npm run dev          # start dev server
npm run build        # production build
npm run db:generate  # generate Drizzle migrations
npm run db:migrate   # apply migrations to Supabase
npm run db:studio    # open Drizzle Studio
```

---

## Project Structure

```
app/
├── (auth)/              # sign-in / sign-up pages
├── (dashboard)/
│   ├── layout.tsx       # header + nav
│   ├── page.tsx         # calls list
│   └── calls/
│       ├── new/         # record a new call
│       └── [id]/        # call detail (transcript + summary)
├── api/
│   ├── transcribe/      # Groq Whisper + Llama diarization
│   └── summarize/       # Groq Llama summary
src/
├── actions/calls.ts     # server actions (DB mutations)
├── components/          # UI components
├── db/                  # Drizzle schema + migrations
└── lib/                 # Groq client
docs/                    # phase documentation
```

---

## Phases

| Phase | Description | Status |
|-------|-------------|--------|
| 0 | Scaffolding | ✅ Done |
| 1 | Auth & Database | ✅ Done |
| 2 | Browser Mic + Groq Pipeline | ✅ Done |
| 3 | Dashboard UI + Dark Mode + Diarization | ✅ Done |
| 4 | Chrome Extension (tab audio capture) | 🚧 In Progress |
| 5 | Polish & Deploy to Vercel | ⏳ Planned |
