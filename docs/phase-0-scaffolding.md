# Phase 0 — Scaffolding

## Goal
Bootstrap the project so the dev server runs clean with all core dependencies installed and configured.

## Status
✅ Complete

## Branch
`master` (initial commit)

---

## Tasks

- [x] Init Next.js 15 + TypeScript (`npx create-next-app`)
- [x] Install Drizzle ORM + `pg` driver
- [x] Install Supabase JS client
- [x] Install Clerk Next.js SDK
- [x] Install Groq SDK
- [x] Configure shadcn/ui + Tailwind CSS v4
- [x] Set up `.env.local` with all required keys
- [x] Verify dev server runs at `localhost:3000`

## Key Files Created
- `package.json` — all dependencies
- `next.config.ts` — minimal config
- `postcss.config.js` — `@tailwindcss/postcss` plugin
- `src/db/index.ts` — Drizzle client
- `src/db/schema.ts` — full schema definition
- `src/lib/groq.ts` — Groq client
- `app/layout.tsx` — root layout with `ClerkProvider`
- `.env.local` — environment variables (not committed)

## Environment Variables Needed
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `GROQ_API_KEY` | Groq API key |
| `DATABASE_URL` | Supabase Postgres connection string (for Drizzle) |
| `NEXT_PUBLIC_APP_URL` | Public app URL |

## Lessons Learned
- Use `postcss.config.js` (CJS), not `.mjs`, with `@tailwindcss/postcss` on Next.js 15
- Next.js 16 has a Turbopack CSS resolution bug on Windows — stay on Next.js 15 + webpack
