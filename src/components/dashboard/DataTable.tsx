import { Play } from "lucide-react";
import type { SheetRow } from "@/hooks/useGoogleSheets";

interface ColumnDef {
  key: string;
  label: string;
  type?: "text" | "date" | "badge" | "image" | "link" | "video";
  truncate?: number;
  badgeMap?: Record<string, string>;
}

interface Props {
  rows: SheetRow[];
  columns: ColumnDef[];
  loading: boolean;
  onImageClick: (src: string) => void;
  onRowClick?: (row: SheetRow) => void;
}

function cell(val: string) {
  return val?.trim() || "—";
}

function truncate(val: string, max: number) {
  const v = cell(val);
  if (v === "—" || v.length <= max) return v;
  return v.slice(0, max) + "…";
}

function formatDate(val: string) {
  const v = cell(val);
  if (v === "—") return v;
  try {
    return new Date(v).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true,
    });
  } catch {
    return v;
  }
}

function badgeClass(color: string) {
  const map: Record<string, string> = {
    green: "bg-status-posted/20 text-status-posted",
    red: "bg-[hsl(var(--status-failed))]/20 text-[hsl(var(--status-failed))]",
    yellow: "bg-primary/20 text-primary",
    blue: "bg-status-blue/20 text-status-blue",
    purple: "bg-status-purple/20 text-status-purple",
    gray: "bg-muted text-muted-foreground",
    gold: "bg-primary/20 text-primary",
  };
  return map[color] || map.gray;
}

const DataTable = ({ rows, columns, loading, onImageClick, onRowClick }: Props) => {
  if (loading) {
    return (
      <div className="px-4 sm:px-6 space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <span className="text-4xl mb-2">📭</span>
        <p className="text-sm">No data yet</p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 overflow-x-auto">
      <table className="w-full text-sm min-w-[700px]">
        <thead>
          <tr className="bg-table-header">
            <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">#</th>
            {columns.map((c) => (
              <th key={c.key} className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className={`border-b border-border hover:bg-table-hover transition-colors cursor-pointer ${i % 2 === 1 ? "bg-table-row-alt" : ""}`}
              onClick={() => onRowClick?.(row)}
            >
              <td className="px-3 py-2.5 text-muted-foreground">{i + 1}</td>
              {columns.map((col) => {
                const val = row[col.key] || "";
                return (
                  <td key={col.key} className="px-3 py-2.5">
                    {col.type === "date" ? (
                      <span>{formatDate(val)}</span>
                    ) : col.type === "badge" ? (
                      (() => {
                        const v = cell(val).toLowerCase();
                        const color = col.badgeMap?.[v] || "gray";
                        return (
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${badgeClass(color)}`}>
                            {cell(val)}
                          </span>
                        );
                      })()
                    ) : col.type === "image" ? (
                      val?.trim() ? (
                        <img
                          src={val}
                          alt="thumb"
                          className="w-12 h-12 rounded object-cover cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => onImageClick(val)}
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )
                    ) : col.type === "link" ? (
                      val?.trim() ? (
                        <a
                          href={val}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-status-blue hover:underline text-xs"
                          title={val}
                        >
                          {(() => {
                            try { return new URL(val).hostname + "/…"; } catch { return truncate(val, 30); }
                          })()}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )
                    ) : col.type === "video" ? (
                      val?.trim() ? (
                        <a href={val} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-status-purple hover:underline text-xs">
                          <Play size={12} /> Play
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )
                    ) : (
                      <span title={val?.length > (col.truncate || 999) ? val : undefined}>
                        {truncate(val, col.truncate || 999)}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
export type { ColumnDef };
