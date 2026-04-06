import { Sun, Moon, RefreshCw } from "lucide-react";

interface Props {
  dark: boolean;
  onToggleTheme: () => void;
  lastUpdated: Date | null;
  syncing: boolean;
  onRefresh: () => void;
}

const Header = ({ dark, onToggleTheme, lastUpdated, syncing, onRefresh }: Props) => (
  <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border transition-theme">
    <div>
      <div className="flex items-center gap-2">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">PostFlow</h1>
        <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse-dot" />
      </div>
      <p className="text-xs text-muted-foreground mt-0.5">Auto-refreshing every 15 seconds</p>
    </div>
    <div className="flex items-center gap-3">
      <div className="hidden sm:flex flex-col items-end text-xs text-muted-foreground">
        <span>
          Last updated:{" "}
          {lastUpdated
            ? lastUpdated.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true })
            : "—"}
        </span>
        {syncing && (
          <span className="text-primary text-[10px] font-medium mt-0.5">Syncing...</span>
        )}
      </div>
      <button
        onClick={onToggleTheme}
        className="p-2 rounded-lg bg-card border border-border hover:bg-accent transition-theme"
        aria-label="Toggle theme"
      >
        {dark ? <Sun size={16} /> : <Moon size={16} />}
      </button>
      <button
        onClick={onRefresh}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-theme"
      >
        <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
        <span className="hidden sm:inline">Refresh</span>
      </button>
    </div>
  </header>
);

export default Header;
