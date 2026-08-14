import { Sun, Moon, RefreshCw, ExternalLink, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  dark: boolean;
  onToggleTheme: () => void;
  syncing: boolean;
  onRefresh: () => void;
  pages: string[];
  selectedPage: string;
  onPageChange: (page: string) => void;
}

const Header = ({ dark, onToggleTheme, syncing, onRefresh, pages, selectedPage, onPageChange }: Props) => (
  <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border transition-theme">
    <div className="flex items-center gap-3">
      <img
        src="/logo-icon.png"
        alt="PostFloww logo"
        width={40}
        height={40}
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl shrink-0"
      />
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">PostFloww</h1>
          <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse-dot" />
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">Live Dashboard</p>
      </div>
    </div>

    <div className="flex items-center gap-3">
      {/* Page Selector */}
      <Select value={selectedPage} onValueChange={onPageChange}>
        <SelectTrigger className="w-[140px] h-9 text-xs bg-card border-border">
          <SelectValue placeholder="All Pages" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Pages</SelectItem>
          {pages.map((p) => (
            <SelectItem key={p} value={p} className="capitalize">
              {p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <button
        onClick={() => window.open("https://fb-autopost.lovable.app", "_blank", "noopener,noreferrer,popup,width=1000,height=700")}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-status-posted/20 text-status-posted text-sm font-medium hover:bg-status-posted/30 transition-theme"
      >
        <ExternalLink size={14} />
        <span className="hidden sm:inline">Post Now</span>
      </button>
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
