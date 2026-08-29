# PostFlow Dashboard

A real-time monitoring dashboard for a multi-channel social media automation pipeline. It reads directly from a Google Sheet that an automation workflow writes to, and shows what's been posted, what's pending, and what failed — across RSS-sourced posts, manually submitted posts, blog posts, and YouTube posts.

![Dashboard screenshot](./docs/screenshot-dark.png)

## Why this exists

DESCRIBE IN YOUR OWN WORDS WHY YOU BUILT THIS — e.g. "The automation pipeline posts to Facebook/LinkedIn on a schedule and logs every action to a spreadsheet. There was no way to see pipeline health at a glance without opening the sheet manually, so this dashboard gives a live view instead."

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

## Getting started

\`\`\`bash
git clone YOUR-REPO-URL
cd YOUR-REPO-NAME
npm install
cp .env.example .env   # then fill in your own sheet ID/tab names
npm run dev
\`\`\`

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

\`\`\`bash
npm run test        # unit tests (vitest)
npx playwright test # e2e (requires the dev server running)
\`\`\`

## Deployment

Deployed on Netlify. See `netlify.toml` for build settings and the SPA redirect rule required for client-side routing.

## Known limitations

- Read-only — this dashboard doesn't write back to the sheet or trigger re-posts.
- No auth — anyone with the deployed URL can view it, since the underlying sheet is public.

## License

MIT
