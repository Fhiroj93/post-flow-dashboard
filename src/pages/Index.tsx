import { useState, useMemo } from "react";
import { useGoogleSheets, type SheetRow } from "@/hooks/useGoogleSheets";
import { useTheme } from "@/hooks/useTheme";
import Header from "@/components/dashboard/Header";
import SummaryCards from "@/components/dashboard/SummaryCards";
import TabSwitcher, { type TabKey } from "@/components/dashboard/TabSwitcher";
import SearchFilter from "@/components/dashboard/SearchFilter";
import DataTable, { type ColumnDef } from "@/components/dashboard/DataTable";
import ImageModal from "@/components/dashboard/ImageModal";
import RowDetailSidebar from "@/components/dashboard/RowDetailSidebar";

const rssColumns: ColumnDef[] = [
  { key: "title", label: "Title", truncate: 60 },
  { key: "mediaType", label: "Media Type", type: "badge", badgeMap: { image: "blue", video: "purple", text: "gray" } },
  { key: "status", label: "Status", type: "badge", badgeMap: { posted: "green", failed: "red", pending: "yellow" } },
  { key: "Content", label: "Content", truncate: 80 },
  { key: "Image", label: "Image", type: "image" },
];

const manualColumns: ColumnDef[] = [
  { key: "submit_at", label: "Submitted At", type: "date" },
  { key: "topic", label: "Topic", truncate: 60 },
  { key: "content", label: "Content", truncate: 80 },
  { key: "schedule_time", label: "Schedule Time", type: "date" },
  { key: "posted?", label: "Posted?", type: "badge", badgeMap: { yes: "green", no: "yellow", true: "green", false: "yellow", "yes...": "green" } },
  { key: "post_in", label: "Post In", type: "badge", badgeMap: { facebook: "blue", linkedin: "purple", both: "gold" } },
  { key: "posted_time", label: "Posted Time", type: "date" },
  { key: "img_url", label: "Image", type: "image" },
  { key: "vid_url", label: "Video", type: "video" },
  { key: "gen_content", label: "Generated Content", truncate: 80 },
  { key: "gen_img", label: "Generated Image", type: "image" },
];

const blogColumns: ColumnDef[] = [
  { key: "link", label: "Blog URL", type: "link" },
  { key: "title", label: "Title", truncate: 60 },
  { key: "status", label: "Status", type: "badge", badgeMap: { posted: "green", failed: "red", pending: "yellow" } },
  { key: "timestamp", label: "Posted At", type: "date" },
  { key: "Content", label: "Content", truncate: 80 },
  { key: "Image", label: "Image", type: "image" },
];

const youtubeColumns: ColumnDef[] = [
  { key: "summary", label: "Summary", truncate: 100 },
  { key: "schedule_time", label: "Schedule Time", type: "date" },
  { key: "posted?", label: "Posted?", type: "badge", badgeMap: { yes: "green", no: "yellow", true: "green", false: "yellow" } },
  { key: "submitted_at", label: "Submitted At", type: "date" },
  { key: "gen_content", label: "Generated Content", truncate: 80 },
  { key: "gen_img", label: "Generated Image", type: "image" },
  { key: "post_in", label: "Post In", type: "badge", badgeMap: { facebook: "blue", linkedin: "purple", both: "gold" } },
  { key: "posted_at", label: "Posted At", type: "date" },
];

const columnMap: Record<TabKey, ColumnDef[]> = {
  rss: rssColumns,
  manual: manualColumns,
  blog: blogColumns,
  youtube: youtubeColumns,
};

const searchKeys: Record<TabKey, string[]> = {
  rss: ["title", "Content"],
  manual: ["topic", "content"],
  blog: ["title", "Content"],
  youtube: ["summary", "gen_content"],
};

function getStatus(row: Record<string, string>, tab: TabKey): string {
  if (tab === "rss" || tab === "blog") return (row["status"] || "").toLowerCase();
  const v = (row["posted?"] || "").toLowerCase();
  if (v === "yes" || v === "true" || v.startsWith("yes")) return "posted";
  if (v === "no" || v === "false" || v === "") return "pending";
  return v;
}

const Index = () => {
  const { data, loading, syncing, lastUpdated, refresh } = useGoogleSheets();
  const { dark, toggle } = useTheme();
  const [tab, setTab] = useState<TabKey>("rss");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<SheetRow | null>(null);

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
      <div className="max-w-7xl mx-auto">
        <Header dark={dark} onToggleTheme={toggle} syncing={syncing} onRefresh={refresh} />
        <SummaryCards data={data} loading={loading} />
        <TabSwitcher active={tab} onChange={(t) => { setTab(t); setSearch(""); setStatusFilter("all"); }} />
        <SearchFilter search={search} onSearch={setSearch} status={statusFilter} onStatus={setStatusFilter} />
        <DataTable rows={filteredRows} columns={columnMap[tab]} loading={loading} onImageClick={setModalImage} onRowClick={setSelectedRow} />
        <footer className="text-center py-6 text-xs text-muted-foreground">
          PostFlow Dashboard v1.0 — {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </footer>
      </div>
      <ImageModal src={modalImage} onClose={() => setModalImage(null)} />
      <RowDetailSidebar row={selectedRow} open={!!selectedRow} onClose={() => setSelectedRow(null)} onImageClick={setModalImage} />
    </div>
  );
};

export default Index;
