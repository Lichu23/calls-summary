# Phase 4 — Chrome Extension

## Goal
Build a Chrome Extension (Manifest V3) that captures tab audio from any browser-based call (Google Meet, Zoom, Teams, WhatsApp Web), sends it through the existing Groq pipeline, and shows the transcript + summary inline — plus a calls history tab.

## Status
⏳ Not Started

## Branch
`phase/4-chrome-extension` (to be created)

---

## Why Extension Instead of Twilio
- **Free** — no phone number cost, no per-minute charges
- **Works on any platform** — Meet, Zoom, Teams, WhatsApp Web, etc.
- **Reuses everything** — same `/api/transcribe`, `/api/summarize`, same DB
- **More useful** — most modern calls happen in the browser, not on phones

---

## Extension Structure

```
extension/
├── manifest.json          # Manifest V3 config
├── popup/
│   ├── index.html         # Popup shell
│   ├── popup.tsx          # React popup app
│   └── tabs/
│       ├── RecordTab.tsx  # Start/stop recording
│       └── CallsTab.tsx   # Past calls list
├── background/
│   └── service-worker.ts  # chrome.tabCapture + API calls
├── content/
│   └── content.ts         # (optional) page-level injection
└── icons/
    ├── icon-16.png
    ├── icon-48.png
    └── icon-128.png
```

---

## Recording Flow

```
User clicks extension icon → popup opens
        ↓
"Record Tab" tab shown
        ↓
User clicks "Start Recording"
        ↓
background service worker calls chrome.tabCapture.capture()
        ↓
MediaRecorder records the tab audio stream
        ↓
User clicks "Stop"
        ↓
Audio blob assembled → POST /api/transcribe (existing route)
        ↓
POST /api/summarize (existing route)
        ↓
saveCallResults() → saved to Supabase
        ↓
Popup shows transcript + summary inline
```

---

## Calls Tab Flow

```
User clicks "Calls" tab in popup
        ↓
Fetch calls from /api/calls (or server action via API)
        ↓
List shows: contact, date, duration, status badge
        ↓
Click a call → shows transcript + summary in popup
```

---

## Key Permissions (manifest.json)

```json
{
  "permissions": ["tabCapture", "storage", "activeTab"],
  "host_permissions": ["https://your-app.vercel.app/*"]
}
```

---

## Auth Strategy
- User signs in on the web app first (Clerk)
- Extension reads the Clerk session token from storage or cookies
- All API calls include the auth token
- If not signed in → extension shows "Sign in at calls-summary.vercel.app"

---

## Tech Stack for Extension
| Layer | Technology |
|-------|-----------|
| Framework | React + TypeScript (Vite or webpack) |
| UI | Same shadcn/ui + Tailwind (reused) |
| Audio capture | `chrome.tabCapture` API |
| API calls | Fetch to existing Next.js API routes |
| Auth | Clerk session token |
| Build | Vite with `vite-plugin-web-extension` |

---

## Testing Stage 3 Checklist
- [ ] Load extension unpacked in Chrome (`chrome://extensions` → Load unpacked)
- [ ] Join a Google Meet call with another person
- [ ] Click extension → "Start Recording"
- [ ] Have a 30-60 second conversation
- [ ] Click "Stop" → wait for processing
- [ ] Verify transcript shows Speaker A / Speaker B
- [ ] Verify summary, action items, key topics appear in popup
- [ ] Open web app → verify same call appears in calls list
