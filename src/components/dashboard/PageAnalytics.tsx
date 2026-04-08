import { useMemo } from "react";
import { BarChart3, Clock, CheckCircle2, XCircle, CalendarClock, TrendingUp } from "lucide-react";
import type { SheetsData, SheetRow } from "@/hooks/useGoogleSheets";

interface Props {
  data: SheetsData;
  page: string;
  onRowClick: (row: SheetRow) => void;
  onImageClick: (src: string) => void;
}

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
  try {
    return new Date(schedTime) > new Date();
  } catch { return false; }
}

function isPosted(row: SheetRow): boolean {
  const v = (row["posted?"] || "").toLowerCase();
  return v === "yes" || v === "true" || v.startsWith("yes");
}

function isPending(row: SheetRow): boolean {
  const v = (row["posted?"] || "").toLowerCase();
  return v === "no" || v === "false" || v === "";
}

const PageAnalytics = ({ data, page, onRowClick, onImageClick }: Props) => {
  const filtered = useMemo(() => {
    const allRows = [...data.manual, ...data.youtube];
    return allRows.filter((r) => matchesPage(r, page));
  }, [data, page]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const posted = filtered.filter(isPosted).length;
    const pending = filtered.filter(isPending).length;
    const scheduled = filtered.filter(isScheduled).length;
    const failed = total - posted - pending;
    const successRate = total > 0 ? Math.round((posted / total) * 100) : 0;
    return { total, posted, pending, scheduled, failed: failed > 0 ? failed : 0, successRate };
  }, [filtered]);

  const scheduledPosts = useMemo(() => filtered.filter(isScheduled), [filtered]);
  const recentPosts = useMemo(() => filtered.filter(isPosted).slice(0, 10), [filtered]);
  const pendingPosts = useMemo(() => filtered.filter(isPending), [filtered]);

  const statCards = [
    { label: "Total Posts", value: stats.total, icon: BarChart3, color: "border-l-primary" },
    { label: "Posted", value: stats.posted, icon: CheckCircle2, color: "border-l-status-posted" },
    { label: "Pending", value: stats.pending, icon: Clock, color: "border-l-status-blue" },
    { label: "Scheduled", value: stats.scheduled, icon: CalendarClock, color: "border-l-status-purple" },
    { label: "Failed", value: stats.failed, icon: XCircle, color: "border-l-[hsl(var(--status-failed))]" },
    { label: "Success Rate", value: `${stats.successRate}%`, icon: TrendingUp, color: "border-l-primary" },
  ];

  return (
    <div className="px-4 sm:px-6 py-4 space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-bold text-foreground capitalize">{page} Analytics</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Showing all activity for "{page}"</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
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

      {/* Scheduled Posts */}
      {scheduledPosts.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <CalendarClock size={16} className="text-status-purple" />
            Scheduled Posts ({scheduledPosts.length})
          </h3>
          <div className="space-y-2">
            {scheduledPosts.map((row, i) => (
              <PostCard key={`sched-${i}`} row={row} onClick={() => onRowClick(row)} onImageClick={onImageClick} accent="border-l-status-purple" />
            ))}
          </div>
        </div>
      )}

      {/* Recent Posted */}
      {recentPosts.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-status-posted" />
            Recently Posted ({recentPosts.length})
          </h3>
          <div className="space-y-2">
            {recentPosts.map((row, i) => (
              <PostCard key={`posted-${i}`} row={row} onClick={() => onRowClick(row)} onImageClick={onImageClick} accent="border-l-status-posted" />
            ))}
          </div>
        </div>
      )}

      {/* Pending Posts */}
      {pendingPosts.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Clock size={16} className="text-primary" />
            Pending Posts ({pendingPosts.length})
          </h3>
          <div className="space-y-2">
            {pendingPosts.map((row, i) => (
              <PostCard key={`pending-${i}`} row={row} onClick={() => onRowClick(row)} onImageClick={onImageClick} accent="border-l-primary" />
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <span className="text-4xl mb-2">📭</span>
          <p className="text-sm">No posts found for "{page}"</p>
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
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${posted ? "bg-status-posted/20 text-status-posted" : "bg-primary/20 text-primary"}`}>
              {posted ? "Posted" : "Pending"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PageAnalytics;
