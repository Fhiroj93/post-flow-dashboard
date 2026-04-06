import { useState, useMemo } from "react";
import { useGoogleSheets } from "@/hooks/useGoogleSheets";
import { useTheme } from "@/hooks/useTheme";
import ProgressBar from "@/components/dashboard/ProgressBar";
import Header from "@/components/dashboard/Header";
import SummaryCards from "@/components/dashboard/SummaryCards";
import TabSwitcher, { type TabKey } from "@/components/dashboard/TabSwitcher";
import SearchFilter from "@/components/dashboard/SearchFilter";
import DataTable, { type ColumnDef } from "@/components/dashboard/DataTable";
import ImageModal from "@/components/dashboard/ImageModal";

const rssColumns: ColumnDef[] = [
  { key: "Title", label: "Title", truncate: 60 },
  { key: "Media Type", label: "Media Type", type: "badge", badgeMap: { image: "blue", video: "purple", text: "gray" } },
  { key: "Status", label: "Status", type: "badge", badgeMap: { posted: "green", failed: "red", pending: "yellow" } },
  { key: "Content", label: "Content", truncate: 80 },
  { key: "Image", label: "Image", type: "image" },
];

const manualColumns: ColumnDef[] = [
  { key: "Submitted At", label: "Submitted At", type: "date" },
  { key: "Topic", label: "Topic", truncate: 60 },
  { key: "Content", label: "Content", truncate: 80 },
  { key: "Schedule Time", label: "Schedule Time", type: "date" },
  { key: "Posted?", label: "Posted?", type: "badge", badgeMap: { yes: "green", no: "yellow", true: "green", false: "yellow" } },
  { key: "Post In", label: "Post In", type: "badge", badgeMap: { facebook: "blue", linkedin: "purple", both: "gold" } },
  { key: "Posted Time", label: "Posted Time", type: "date" },
  { key: "Image", label: "Image", type: "image" },
  { key: "Video", label: "Video", type: "video" },
  { key: "Generated Content", label: "Generated Content", truncate: 80 },
  { key: "Generated Image", label: "Generated Image", type: "image" },
];

const blogColumns: ColumnDef[] = [
  { key: "Blog URL", label: "Blog URL", type: "link" },
  { key: "Schedule Time", label: "Schedule Time", type: "date" },
  { key: "Posted?", label: "Posted?", type: "badge", badgeMap: { yes: "green", no: "yellow", true: "green", false: "yellow" } },
  { key: "Submitted At", label: "Submitted At", type: "date" },
  { key: "Generated Content", label: "Generated Content", truncate: 80 },
  { key: "Generated Image", label: "Generated Image", type: "image" },
  { key: "Post In", label: "Post In", type: "badge", badgeMap: { facebook: "blue", linkedin: "purple", both: "gold" } },
  { key: "Posted At", label: "Posted At", type: "date" },
];

const youtubeColumns: ColumnDef[] = [
  { key: "Summary", label: "Summary", truncate: 100 },
  { key: "Schedule Time", label: "Schedule Time", type: "date" },
  { key: "Posted?", label: "Posted?", type: "badge", badgeMap: { yes: "green", no: "yellow", true: "green", false: "yellow" } },
  { key: "Submitted At", label: "Submitted At", type: "date" },
  { key: "Generated Content", label: "Generated Content", truncate: 80 },
  { key: "Generated Image", label: "Generated Image", type: "image" },
  { key: "Post In", label: "Post In", type: "badge", badgeMap: { facebook: "blue", linkedin: "purple", both: "gold" } },
  { key: "Posted At", label: "Posted At", type: "date" },
];

const columnMap: Record<TabKey, ColumnDef[]> = {
  rss: rssColumns,
  manual: manualColumns,
  blog: blogColumns,
  youtube: youtubeColumns,
};

const searchKeys: Record<TabKey, string[]> = {
  rss: ["Title", "Content"],
  manual: ["Topic", "Content"],
  blog: ["Blog URL", "Generated Content"],
  youtube: ["Summary", "Generated Content"],
};

function getStatus(row: Record<string, string>, tab: TabKey): string {
  if (tab === "rss") return (row["Status"] || "").toLowerCase();
  const v = (row["Posted?"] || "").toLowerCase();
  if (v === "yes" || v === "true") return "posted";
  if (v === "no" || v === "false" || v === "") return "pending";
  return v;
}

const Index = () => {
  const { data, loading, syncing, lastUpdated, progress, refresh } = useGoogleSheets();
  const { dark, toggle } = useTheme();
  const [tab, setTab] = useState<TabKey>("rss");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalImage, setModalImage] = useState<string | null>(null);

  const filteredRows = useMemo(() => {
    let rows = data[tab];
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((r) => searchKeys[tab].some((k) => (r[k] || "").toLowerCase().includes(q)));
    }
    if (statusFilter !== "all") {
      rows = rows.filter((r) => getStatus(r, tab) === statusFilter);
    }
    return rows;
  }, [data, tab, search, statusFilter]);

  return (
    <div className="min-h-screen animated-bg transition-theme">
      <ProgressBar progress={progress} />
      <div className="max-w-7xl mx-auto">
        <Header dark={dark} onToggleTheme={toggle} lastUpdated={lastUpdated} syncing={syncing} onRefresh={refresh} />
        <SummaryCards data={data} loading={loading} />
        <TabSwitcher active={tab} onChange={(t) => { setTab(t); setSearch(""); setStatusFilter("all"); }} />
        <SearchFilter search={search} onSearch={setSearch} status={statusFilter} onStatus={setStatusFilter} />
        <DataTable rows={filteredRows} columns={columnMap[tab]} loading={loading} onImageClick={setModalImage} />
        <footer className="text-center py-6 text-xs text-muted-foreground">
          PostFlow Dashboard v1.0 — {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </footer>
      </div>
      <ImageModal src={modalImage} onClose={() => setModalImage(null)} />
    </div>
  );
};

export default Index;
