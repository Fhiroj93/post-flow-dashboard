import { useState, useEffect, useCallback, useRef } from "react";

const SPREADSHEET_ID = "13Y5WstWfrY17JjQxRIQZA1nPi1AzNAhvnfIUOikZm6M";
const SHEET_NAMES = {
  rss: "RSS_Log",
  manual: "Manual",
  blog: "Blog",
  youtube: "Utube",
} as const;

type SheetKey = keyof typeof SHEET_NAMES;

export interface SheetRow {
  [key: string]: string;
}

export interface SheetsData {
  rss: SheetRow[];
  manual: SheetRow[];
  blog: SheetRow[];
  youtube: SheetRow[];
}

function buildUrl(sheetName: string) {
  return `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
}

function parseResponse(text: string): SheetRow[] {
  const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]+)\);?\s*$/);
  if (!match) return [];
  try {
    const json = JSON.parse(match[1]);
    const cols: { label: string }[] = json.table.cols;
    const rows: { c: ({ v: string | number | null; f?: string } | null)[] }[] = json.table.rows;
    const headers = cols.map((c) => c.label || "");
    return rows.map((row) => {
      const obj: SheetRow = {};
      headers.forEach((h, i) => {
        const cell = row.c?.[i];
        obj[h] = cell?.f ?? (cell?.v != null ? String(cell.v) : "");
      });
      return obj;
    });
  } catch (e) {
    console.error("Parse error:", e);
    return [];
  }
}

async function fetchSheet(sheetName: string): Promise<SheetRow[]> {
  try {
    const res = await fetch(buildUrl(sheetName));
    const text = await res.text();
    console.log(`[PostFlow] Fetched ${sheetName}:`, text.substring(0, 200));
    return parseResponse(text);
  } catch (e) {
    console.error(`[PostFlow] Error fetching ${sheetName}:`, e);
    return [];
  }
}

const REFRESH_INTERVAL = 15000;

export function useGoogleSheets() {
  const [data, setData] = useState<SheetsData>({ rss: [], manual: [], blog: [], youtube: [] });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [progress, setProgress] = useState(0);
  const isFirstLoad = useRef(true);
  const progressRef = useRef<ReturnType<typeof setInterval>>();

  const fetchAll = useCallback(async (isManual = false) => {
    if (!isFirstLoad.current) setSyncing(true);
    try {
      const [rss, manual, blog, youtube] = await Promise.all(
        (Object.keys(SHEET_NAMES) as SheetKey[]).map((k) => fetchSheet(SHEET_NAMES[k]))
      );
      setData({ rss, manual, blog, youtube });
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
      setSyncing(false);
      isFirstLoad.current = false;
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Auto-refresh + progress bar
  useEffect(() => {
    if (loading) return;
    setProgress(0);
    const startTime = Date.now();
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / REFRESH_INTERVAL) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(progressRef.current);
      }
    }, 100);

    const refreshTimer = setTimeout(() => {
      clearInterval(progressRef.current);
      setProgress(0);
      fetchAll();
    }, REFRESH_INTERVAL);

    return () => {
      clearInterval(progressRef.current);
      clearTimeout(refreshTimer);
    };
  }, [loading, lastUpdated, fetchAll]);

  const refresh = useCallback(() => {
    setProgress(0);
    fetchAll(true);
  }, [fetchAll]);

  return { data, loading, syncing, lastUpdated, progress, refresh };
}
