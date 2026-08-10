# PostFlow Insights

Build a professional social media automation dashboard called "PostFlow Dashboard" that reads data from a Google Sheets spreadsheet and displays it beautifully. Here are the complete requirements:

---

## DESIGN DIRECTION

Default: Dark theme — deep navy background (#0a0f1e), charcoal cards (#111827), gold accents (#f59e0b), white text.

Light theme option available via a toggle button in the top-right header.

Light theme: clean white (#ffffff) background, light gray cards (#f8fafc), same gold accents, dark text.

Font: "DM Sans" for everything — clean, modern, professional.

Smooth theme transition animation (200ms).

Subtle animated background in dark mode: very slow moving gradient mesh (deep navy to dark purple), barely visible.

Cards and tables have soft box shadows and subtle borders.

---

## HEADER

Left side:

- "PostFlow" logo text in bold with a small animated gold dot pulsing (indicating live/auto-refresh)

- Below logo: small text "Auto-refreshing every 15 seconds" in muted color

Right side:

- Last refreshed timestamp: "Last updated: 10:45:32 AM" — updates every refresh

- Light/Dark mode toggle button (sun/moon icon)

- A manual "Refresh Now" button with a refresh icon — clicking it immediately fetches fresh data

---

## SUMMARY CARDS ROW

Below the header, show 4 summary stat cards in a horizontal row (2x2 on mobile):

Card 1 — Total Posts Today (count rows where posted_time or timestamp is today's date)

Card 2 — Pending Posts (count rows where posted? = false or empty across all sheets)

Card 3 — Successfully Posted (count rows where posted? = true across all sheets)

Card 4 — Failed Posts (count rows where status = "Failed" in RSS sheet)

Each card has:

- Large bold number

- Label below

- Colored left border: gold for total, blue for pending, green for posted, red for failed

- Subtle background slightly lighter than main background

---

## TAB SWITCHER

Below the summary cards, a horizontal pill-style tab switcher with 4 tabs:

- 📡 RSS Feed

- ✍️ Manual Posts

- 🔗 Blog Posts

- 🎬 YouTube Posts

Active tab: gold background, white text

Inactive tab: transparent, muted text

Smooth underline/background slide animation when switching tabs

---

## DATA TABLES

Each tab shows its own table. All tables share the same styling:

- Sticky header row: slightly darker background, uppercase column labels, small font, letter-spacing

- Alternating row colors (very subtle — barely visible difference)

- Rows have hover highlight effect

- Horizontal scroll on mobile

- Empty state: centered icon + "No data yet" message when sheet has no rows

- Loading skeleton animation while fetching data

### TAB 1 — RSS Feed

Columns to display (in this order):

| # | Title | Media Type | Status | Content | Image |

- Title: truncate at 60 chars, show full on hover tooltip

- Media Type: small pill badge — "image" (blue), "video" (purple), "text" (gray)

- Status: colored badge — "Posted" (green), "Failed" (red), "Pending" (yellow)

- Content: truncate at 80 chars, show full on hover tooltip

- Image: if URL present, show small 48x48px thumbnail preview, clicking opens full image in a modal lightbox. If no image, show "—"

### TAB 2 — Manual Posts

Columns to display (in this order):

| # | Submitted At | Topic | Content | Schedule Time | Posted? | Post In | Posted Time | Image | Video | Generated Content | Generated Image |

- Submitted At + Schedule Time + Posted Time: format as "Mar 25, 2026 10:30 AM"

- Posted?: colored badge — "Yes" green, "No" yellow

- Post In: pill badge — "Facebook" (blue), "LinkedIn" (purple), "Both" (gold)

- Image / Generated Image: thumbnail preview same as RSS tab

- Video: if URL present show a small play icon button that opens URL in new tab

- Content + Generated Content: truncate at 80 chars with tooltip

### TAB 3 — Blog Posts

Columns to display (in this order):

| # | Blog URL | Schedule Time | Posted? | Submitted At | Generated Content | Generated Image | Post In | Posted At |

- Blog URL: show as clickable link, truncate domain only visible (e.g. "medium.com/..."), opens in new tab

- All other fields: same rules as above

### TAB 4 — YouTube Posts

Columns to display (in this order):

| # | Summary | Schedule Time | Posted? | Submitted At | Generated Content | Generated Image | Post In | Posted At |

- Summary: truncate at 100 chars with tooltip

- All other fields: same rules as above

---

## GOOGLE SHEETS INTEGRATION

Spreadsheet ID: 13Y5WstWfrY17JjQxRIQZA1nPi1AzNAhvnfIUOikZm6M

Use the Google Sheets public JSON API to fetch data without authentication (sheets must be publicly readable):

Fetch URL format for each sheet (use sheet name, gid not needed if using sheet name):

https://docs.google.com/spreadsheets/d/13Y5WstWfrY17JjQxRIQZA1nPi1AzNAhvnfIUOikZm6M/gviz/tq?tqx=out:json&sheet=n8n - FB Auto Posting i the spreadsheet name and the 4sheets names are: 

Replace SHEET_NAME with the URL-encoded sheet tab name for each of the 4 sheets.

The response is JSONP-style — strip the leading "google.visualization.Query.setResponse(" and trailing ");" before JSON.parse.

Sheet tab names to use (exact, case-sensitive):

- RSS sheet tab name: RSS_Log

- Manual posts tab name: Manual

- Blog posts tab name: Blog

- YouTube posts tab name: Utube

(Note to developer: confirm actual tab names match — update these strings if sheet tabs are named differently)

Parse the response: data is in response.table.rows, columns in response.table.cols. Map col labels to row values using index.

Only display the columns specified above for each tab — ignore all other columns.

---

## AUTO REFRESH

Auto-refresh every 15 seconds using setInterval.

Show a subtle progress bar at the very top of the page (thin gold line) that fills from left to right over 15 seconds, then resets and refetches.

When refetching, briefly show a small "Syncing..." badge near the last updated timestamp.

Do not show a loading spinner on auto-refresh — only show skeleton loading on the very first load.

---

## IMAGE MODAL / LIGHTBOX

When a thumbnail image is clicked anywhere in the dashboard:

- Overlay darkens the background

- Image opens centered, max 80vw x 80vh

- Close button (X) top right

- Click outside to close

- Smooth fade-in animation

---

## FILTERING AND SEARCH

Above each table, show a small search bar on the left and a status filter dropdown on the right:

- Search: filters rows by title/topic/content/summary (whichever is the main text column) in real-time

- Status filter: "All", "Posted", "Pending", "Failed"

- Both filters work together

---

## RESPONSIVE DESIGN

- Desktop: full table layout

- Tablet: horizontal scroll on tables, cards stay 2x2

- Mobile: cards stack to 2x2, tabs scroll horizontally, tables scroll horizontally

---

## TECH STACK

React + Tailwind CSS.

Import Google Font: DM Sans.

All state via useState/useEffect.

No backend, no auth — pure client-side Google Sheets public API.

No external UI libraries.

---

## IMPORTANT NOTES

- If a cell value is empty/null, display "—" instead of blank

- All timestamps should be displayed in a human-readable format

- The dashboard is READ-ONLY — no editing, no forms

- Console.log each fetch response for easy debugging

- Add a small "PostFlow Dashboard v1.0" footer with today's date

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://post-flow-dashboard.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/49efcd25-20b8-4501-9e70-bd64c893ec9a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
