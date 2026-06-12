# Syllabus Assistant

A focused, standalone Nuxt 3 app that walks a teacher through designing a course
on the XRP Ledger, then hands them a prefilled, editable syllabus draft.

The flow is served at the root route `/` (in `pages/index.vue`) and has three phases:

1. **Intro** — landing hero + "Get started".
2. **Form** — a sliding, multi-step questionnaire (author, title, topics,
   audience, duration, prerequisites, objectives, assessment, outline,
   resources, format, teacher & student services). Every step requires an
   answer except prerequisites and resources, which prompt a confirmation when
   left empty.
3. **Editor** — the same block editor used to author Academy activities
   (`components/editor/`), prefilled from the answers, including an
   "Instructor" block and a "Recommended Academy activities" block.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
```

## Standalone notes

This repo was extracted from the main Academy app and has **no full database or
authentication**. Those integration points are stubbed so the flow runs offline:

- `composables/useAuth.ts` — seeds a single local "teacher" identity.
- `server/api/activity-modules/index.get.ts` — static activity catalogue (the recommendations).
- `server/api/og-preview.get.ts` — minimal link-preview for the editor's Link block.

Completing the flow saves the full submission (author + question responses + the
generated syllabus) to a JSON file under `.data/submissions.json` (git-ignored)
via `server/api/submissions.post.ts`. Swap the `server/utils/submissions.ts`
store for a real database when needed.

## Admin (`/admin`)

A hidden, password-gated dashboard that shows charts, a table of all
submissions, and a per-submission detail view (author · responses · generated
syllabus). It's not linked anywhere — navigate to `/admin` directly.

The password is checked **server-side** (`server/api/admin/submissions.post.ts`)
against `runtimeConfig.adminPassword`. Default: **`changeme`** — override it:

```bash
ADMIN_PASSWORD=your-secret npm run dev
```

### Brute-force lockout

Failed attempts are counted **globally** (any IP). After **3** failures the
`locked` boolean in the db (`.data/admin.json`) flips to `true` and **all**
access is refused — including the correct password — until a human unlocks it:

```bash
rm .data/admin.json                       # easiest reset
# …or edit it: { "failedAttempts": 0, "locked": false }
```

A correct password (while not locked) clears the failure counter.

## Fonts & theme

- **Inter** (body) is loaded from Google Fonts in `nuxt.config.ts`.
- **Clash Display** (headings) is served locally from
  `public/ClashDisplay_Complete/Fonts/WEB/` and declared in `assets/css/fonts.css`.
- Theme colors (primary `blue`, secondary `purple`, neutral `zinc`) live in
  `app.config.ts`; base font wiring is in `assets/css/main.css`.
