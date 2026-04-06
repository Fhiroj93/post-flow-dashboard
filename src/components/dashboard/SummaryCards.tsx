import type { SheetsData } from "@/hooks/useGoogleSheets";

interface Props {
  data: SheetsData;
  loading: boolean;
}

function isToday(dateStr: string): boolean {
  if (!dateStr) return false;
  try {
    const d = new Date(dateStr);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  } catch {
    return false;
  }
}

function countToday(data: SheetsData): number {
  let count = 0;
  const allRows = [...data.rss, ...data.manual, ...data.blog, ...data.youtube];
  allRows.forEach((r) => {
    const ts = r["Posted Time"] || r["Posted At"] || r["posted_time"] || r["Submitted At"] || "";
    if (isToday(ts)) count++;
  });
  return count;
}

function countPending(data: SheetsData): number {
  const all = [...data.manual, ...data.blog, ...data.youtube];
  const rss = data.rss.filter((r) => {
    const s = (r["Status"] || "").toLowerCase();
    return s === "pending" || s === "";
  }).length;
  const other = all.filter((r) => {
    const v = (r["Posted?"] || "").toLowerCase();
    return v === "no" || v === "false" || v === "";
  }).length;
  return rss + other;
}

function countPosted(data: SheetsData): number {
  const rss = data.rss.filter((r) => (r["Status"] || "").toLowerCase() === "posted").length;
  const all = [...data.manual, ...data.blog, ...data.youtube];
  const other = all.filter((r) => {
    const v = (r["Posted?"] || "").toLowerCase();
    return v === "yes" || v === "true";
  }).length;
  return rss + other;
}

function countFailed(data: SheetsData): number {
  return data.rss.filter((r) => (r["Status"] || "").toLowerCase() === "failed").length;
}

const cards = [
  { label: "Total Posts Today", color: "border-l-primary", fn: countToday },
  { label: "Pending Posts", color: "border-l-status-blue", fn: countPending },
  { label: "Successfully Posted", color: "border-l-status-posted", fn: countPosted },
  { label: "Failed Posts", color: "border-l-[hsl(var(--status-failed))]", fn: countFailed },
] as const;

const SummaryCards = ({ data, loading }: Props) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 px-4 sm:px-6 py-4">
    {cards.map((c) => (
      <div
        key={c.label}
        className={`bg-card border border-border rounded-lg p-4 border-l-4 ${c.color} shadow-sm transition-theme`}
      >
        {loading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-8 w-16 rounded bg-muted" />
            <div className="h-3 w-24 rounded bg-muted" />
          </div>
        ) : (
          <>
            <p className="text-2xl sm:text-3xl font-bold text-foreground">{c.fn(data)}</p>
            <p className="text-xs text-muted-foreground mt-1">{c.label}</p>
          </>
        )}
      </div>
    ))}
  </div>
);

export default SummaryCards;
