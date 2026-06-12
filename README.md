# Syllabus Assistant

A standalone Nuxt 3 app that walks a teacher through designing a course on the
XRP Ledger and hands them a ready-to-edit syllabus.

## Features

- **Guided flow** — a sliding, multi-step questionnaire in two sections:
  - **Author info** — first/last name, university, GitHub, research profile,
    publications, CV, areas of expertise.
  - **Course** — title, topics, audience, duration, prerequisites, objectives,
    assessment, outline, resources, format, and teacher/student services.
  Most steps require an answer; prerequisites and resources can be skipped with
  a confirmation.
- **Prefilled editor** — answers are assembled into a structured, editable
  block-based syllabus (overview, instructor, objectives, outline, and more).
- **Completion view** — the finished syllabus rendered as a clean document.
- **Hidden admin dashboard** (`/admin`) — password-gated; shows summary stats,
  charts (top topics, formats), a table of every submission, and a detail view
  per submission (author · responses · generated syllabus).

## Setup

```bash
npm install
npm run dev          # http://localhost:3000
```

Set the admin password in a `.env` file (default: `changeme`):

```bash
ADMIN_PASSWORD=your-secret
```

Then open `/admin` and enter the password.

> After 3 failed admin attempts the dashboard locks itself. To unlock, delete
> `.data/admin.json`.
