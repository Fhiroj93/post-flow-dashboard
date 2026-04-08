import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { BarChart3, Clock, CheckCircle2, XCircle, CalendarClock, TrendingUp, Filter } from "lucide-react";
import type { SheetsData, SheetRow } from "@/hooks/useGoogleSheets";

interface Props {
  data: SheetsData;
  page: string;
  onRowClick: (row: SheetRow) => void;
  onImageClick: (src: string) => void;
}

type PostFilter = "all" | "posted" | "pending" | "scheduled" | "failed";

function cleanVal(val: string): string {
  const match = val.match(/^\[(.+)\]$/);
  if (match) return match[1].replace(/"/g, "").trim();
  return val;
}

function matchesPage(row: SheetRow, page: string): boolean {
  const raw = (row["post_in"] || "").toLowerCase();
  const cleaned = cleanVal(raw);
  return cleaned.includes(page.toLowerCase());
}

function formatDate(val: string) {
  if (!val?.trim()) return "—";
  try {
    return new Date(val).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true,
    });
  } catch { return val; }
}

function isScheduled(row: SheetRow): boolean {
  const schedTime = row["schedule_time"] || "";
  if (!schedTime.trim()) return false;
  try { return new Date(schedTime) > new Date(); } catch { return false; }
}

function isPosted(row: SheetRow): boolean {
  const v = (row["posted?"] || "").toLowerCase();
  return v === "yes" || v === "true" || v.startsWith("yes");
}

function isPending(row: SheetRow): boolean {
  const v = (row["posted?"] || "").toLowerCase();
  return v === "no" || v === "false" || v === "";
}

function isFailed(row: SheetRow): boolean {
  return !isPosted(row) && !isPending(row);
}

const CHART_COLORS = {
  posted: "hsl(142, 71%, 45%)",
  pending: "hsl(43, 96%, 56%)",
  scheduled: "hsl(263, 70%, 50%)",
  failed: "hsl(0, 84%, 60%)",
};

const filterButtons: { key: PostFilter; label: string; icon: typeof BarChart3 }[] = [
  { key: "all", label: "All", icon: BarChart3 },
  { key: "posted", label: "Posted", icon: CheckCircle2 },
  { key: "pending", label: "Pending", icon: Clock },
  { key: "scheduled", label: "Scheduled", icon: CalendarClock },
  { key: "failed", label: "Failed", icon: XCircle },
];

const PageAnalytics = ({ data, page, onRowClick, onImageClick }: Props) => {
  const [filter, setFilter] = useState<PostFilter>("all");

  const filtered = useMemo(() => {
    const allRows = [...data.manual, ...data.youtube];
    return allRows.filter((r) => matchesPage(r, page));
  }, [data, page]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const posted = filtered.filter(isPosted).length;
    const pending = filtered.filter(isPending).length;
    const scheduled = filtered.filter(isScheduled).length;
    const failed = filtered.filter(isFailed).length;
    const successRate = total > 0 ? Math.round((posted / total) * 100) : 0;
    return { total, posted, pending, scheduled, failed, successRate };
  }, [filtered]);

  const pieData = useMemo(() => [
    { name: "Posted", value: stats.posted, color: CHART_COLORS.posted },
    { name: "Pending", value: stats.pending, color: CHART_COLORS.pending },
    { name: "Scheduled", value: stats.scheduled, color: CHART_COLORS.scheduled },
    { name: "Failed", value: stats.failed, color: CHART_COLORS.failed },
  ].filter((d) => d.value > 0), [stats]);

  const displayPosts = useMemo(() => {
    switch (filter) {
      case "posted": return filtered.filter(isPosted);
      case "pending": return filtered.filter(isPending);
      case "scheduled": return filtered.filter(isScheduled);
      case "failed": return filtered.filter(isFailed);
      default: return filtered;
    }
  }, [filtered, filter]);

  const statCards = [
    { label: "Total Posts", value: stats.total, icon: BarChart3, color: "border-l-primary" },
    { label: "Posted", value: stats.posted, icon: CheckCircle2, color: "border-l-status-posted" },
    { label: "Pending", value: stats.pending, icon: Clock, color: "border-l-status-blue" },
    { label: "Scheduled", value: stats.scheduled, icon: CalendarClock, color: "border-l-status-purple" },
    { label: "Failed", value: stats.failed, icon: XCircle, color: "border-l-[hsl(var(--status-failed))]" },
    { label: "Success Rate", value: `${stats.successRate}%`, icon: TrendingUp, color: "border-l-primary" },
  ];

  function accentForRow(row: SheetRow) {
    if (isScheduled(row)) return "border-l-status-purple";
    if (isPosted(row)) return "border-l-status-posted";
    if (isFailed(row)) return "border-l-[hsl(var(--status-failed))]";
    return "border-l-primary";
  }

  return (
    <div className="px-4 sm:px-6 py-4 space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-bold text-foreground capitalize">{page} Analytics</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Showing all activity for "{page}"</p>
      </div>

      {/* Top Section: Stats + Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Stat Cards - 2 columns on left */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {statCards.map((s) => (
            <div key={s.label} className={`bg-card border border-border rounded-lg p-3 border-l-4 ${s.color} shadow-sm transition-theme`}>
              <div className="flex items-center gap-2 mb-1">
                <s.icon size={14} className="text-muted-foreground" />
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
              </div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Pie Chart - right */}
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm flex flex-col items-center justify-center">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Status Distribution</p>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "hsl(var(--foreground))",
                  }}
                  formatter={(value: number, name: string) => [`${value} posts`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground py-8">No data</p>
          )}
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-3 mt-1">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={14} className="text-muted-foreground" />
        {filterButtons.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-theme ${
              filter === f.key
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            <f.icon size={12} />
            {f.label}
            {f.key !== "all" && (
              <span className="ml-0.5 opacity-70">
                ({f.key === "posted" ? stats.posted : f.key === "pending" ? stats.pending : f.key === "scheduled" ? stats.scheduled : stats.failed})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Post List */}
      {displayPosts.length > 0 ? (
        <div className="space-y-2">
          {displayPosts.map((row, i) => (
            <PostCard key={i} row={row} onClick={() => onRowClick(row)} onImageClick={onImageClick} accent={accentForRow(row)} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <span className="text-4xl mb-2">📭</span>
          <p className="text-sm">
            {filter === "all" ? `No posts found for "${page}"` : `No ${filter} posts found`}
          </p>
        </div>
      )}
    </div>
  );
};

function PostCard({ row, onClick, onImageClick, accent }: { row: SheetRow; onClick: () => void; onImageClick: (s: string) => void; accent: string }) {
  const topic = row["topic"] || row["summary"] || "Untitled";
  const content = row["content"] || row["gen_content"] || "";
  const schedTime = row["schedule_time"] || "";
  const postedTime = row["posted_time"] || row["posted_at"] || "";
  const imgUrl = row["img_url"] || row["gen_img"] || "";
  const posted = isPosted(row);
  const scheduled = isScheduled(row);

  const statusLabel = posted ? "Posted" : scheduled ? "Scheduled" : "Pending";
  const statusClass = posted
    ? "bg-status-posted/20 text-status-posted"
    : scheduled
    ? "bg-status-purple/20 text-status-purple"
    : "bg-primary/20 text-primary";

  return (
    <div
      onClick={onClick}
      className={`bg-card border border-border rounded-lg p-4 border-l-4 ${accent} shadow-sm hover:bg-accent/50 transition-theme cursor-pointer`}
    >
      <div className="flex gap-3">
        {imgUrl?.trim() && (
          <img
            src={imgUrl}
            alt="post"
            className="w-14 h-14 rounded-lg object-cover flex-shrink-0 cursor-pointer hover:opacity-80"
            onClick={(e) => { e.stopPropagation(); onImageClick(imgUrl); }}
            loading="lazy"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{topic}</p>
          {content && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{content}</p>}
          <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
            {schedTime?.trim() && (
              <span className="flex items-center gap-1">
                <CalendarClock size={10} /> {formatDate(schedTime)}
              </span>
            )}
            {postedTime?.trim() && (
              <span className="flex items-center gap-1">
                <CheckCircle2 size={10} /> {formatDate(postedTime)}
              </span>
            )}
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${statusClass}`}>
              {statusLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PageAnalytics;
