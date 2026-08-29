![CI](https://github.com/Fhiroj93/post-flow-dashboard/actions/workflows/ci.yml/badge.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3-38BDF8?logo=tailwindcss&logoColor=white)

# PostFlow Dashboard

**[Live Demo →](https://postfloww-dash.netlify.app/)**

A real-time monitoring dashboard for a multi-channel social media automation pipeline. It reads directly from a Google Sheet that an automation workflow writes to, and shows what's been posted, what's pending, and what failed — across RSS-sourced posts, manually submitted posts, blog posts, and YouTube posts.

## Why this exists

The automation pipeline posts to Facebook and other channels on a schedule and logs every action — RSS-sourced posts, manual submissions, blog posts, and YouTube uploads — to a single Google Sheet. Checking pipeline health meant opening that sheet and manually scanning four tabs for failures, which doesn't scale once the pipeline is running unattended. This dashboard turns that sheet into a live, at-a-glance view: totals, pending items, and failures across every channel, auto-refreshing without needing to touch the spreadsheet at all.

## Features

- Live auto-refresh (polls every 15s, configurable) with a visual countdown bar
- Four-channel view: RSS feed, manual posts, blog posts, YouTube posts
- Summary cards for totals, pending, posted, and failed counts
- Searchable, filterable data tables per channel with status badges
- Image lightbox for post thumbnails
- Light/dark theme
- No backend — reads Google Sheets' public JSON endpoint directly from the client

## Tech stack

- React + TypeScript + Vite
- Tailwind CSS, shadcn/ui (Radix primitives)
- TanStack Query, React Router
- Data source: Google Sheets `gviz` JSON endpoint (no API key needed for a publicly readable sheet)

## Project structure

```
src/
├── components/
│   ├── dashboard/       # feature components: Header, SummaryCards, DataTable, RowDetailSidebar, etc.
│   └── ui/              # shadcn/ui primitives actually used by this app (button, dialog, select, ...)
├── hooks/
│   └── useGoogleSheets.ts   # fetches + parses the Google Sheets gviz JSON endpoint
├── pages/               # route-level components
├── lib/                 # shared utilities
└── App.tsx              # app shell, routing, providers
```

## Getting started

```bash
git clone https://github.com/Fhiroj93/post-flow-dashboard.git
cd post-flow-dashboard
npm install
cp .env.example .env   # then fill in your own sheet ID/tab names
npm run dev
```

## Configuration

All sheet-specific config lives in `.env` (see `.env.example`):

| Variable | Description |
|---|---|
| `VITE_SPREADSHEET_ID` | Google Sheet ID (must be publicly viewable) |
| `VITE_SHEET_RSS` / `VITE_SHEET_MANUAL` / `VITE_SHEET_BLOG` / `VITE_SHEET_YOUTUBE` | Exact tab names, case-sensitive |
| `VITE_REFRESH_INTERVAL_MS` | Auto-refresh interval in ms (default 15000) |

## Data source notes

This dashboard reads the Google Visualization API JSON endpoint (`/gviz/tq?tqx=out:json`), which requires the sheet to be shared as "Anyone with the link can view." The response is wrapped in a JS-callback string, so it's stripped before parsing — see `src/hooks/useGoogleSheets.ts`.

## Testing

```bash
npm run test        # unit tests (vitest)
npx playwright test # e2e (requires the dev server running)
```

## Deployment

Deployed on Netlify. See `netlify.toml` for build settings and the SPA redirect rule required for client-side routing.

## Possible improvements

- Add write-back support (mark a failed post for retry directly from the dashboard)
- Add basic auth so the dashboard isn't fully public
- Swap manual polling for a websocket/webhook push from the automation pipeline
- Add per-channel analytics (posting frequency over time, failure rate trend)

## Known limitations

- Read-only — this dashboard doesn't write back to the sheet or trigger re-posts.
- No auth — anyone with the deployed URL can view it, since the underlying sheet is public.

## License

MIT
