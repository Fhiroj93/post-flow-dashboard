import { useState, useEffect, useCallback, useRef } from "react";

const SPREADSHEET_ID = import.meta.env.VITE_SPREADSHEET_ID as string;
const SHEET_NAMES = {
  rss: import.meta.env.VITE_SHEET_RSS as string,
  manual: import.meta.env.VITE_SHEET_MANUAL as string,
  blog: import.meta.env.VITE_SHEET_BLOG as string,
  youtube: import.meta.env.VITE_SHEET_YOUTUBE as string,
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

export function parseResponse(text: string): SheetRow[] {
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
    if (import.meta.env.DEV) {
  console.debug(`[PostFlow] Fetched ${sheetName}`);
}
    return parseResponse(text);
  } catch (e) {
    console.error(`[PostFlow] Error fetching ${sheetName}:`, e);
    return [];
  }
}

const REFRESH_INTERVAL = Number(import.meta.env.VITE_REFRESH_INTERVAL_MS) || 15000;

export function useGoogleSheets() {
  const [data, setData] = useState<SheetsData>({ rss: [], manual: [], blog: [], youtube: [] });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const isFirstLoad = useRef(true);

  const fetchAll = useCallback(async (isManual = false) => {
    if (!isFirstLoad.current) setSyncing(true);
    try {
      const [rss, manual, blog, youtube] = await Promise.all(
        (Object.keys(SHEET_NAMES) as SheetKey[]).map((k) => fetchSheet(SHEET_NAMES[k]))
      );
      // Reverse so newest rows appear first
      setData({
        rss: [...rss].reverse(),
        manual: [...manual].reverse(),
        blog: [...blog].reverse(),
        youtube: [...youtube].reverse(),
      });
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

  // Auto-refresh silently
  useEffect(() => {
    if (loading) return;
    const refreshTimer = setInterval(() => {
      fetchAll();
    }, REFRESH_INTERVAL);
    return () => clearInterval(refreshTimer);
  }, [loading, fetchAll]);

  const refresh = useCallback(() => {
    fetchAll(true);
  }, [fetchAll]);

  return { data, loading, syncing, lastUpdated, refresh };
}
