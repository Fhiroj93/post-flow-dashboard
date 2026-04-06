import { Search } from "lucide-react";

interface Props {
  search: string;
  onSearch: (v: string) => void;
  status: string;
  onStatus: (v: string) => void;
}

const SearchFilter = ({ search, onSearch, status, onStatus }: Props) => (
  <div className="flex flex-col sm:flex-row gap-2 px-4 sm:px-6 py-3">
    <div className="relative flex-1">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search..."
        className="w-full pl-9 pr-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-theme"
      />
    </div>
    <select
      value={status}
      onChange={(e) => onStatus(e.target.value)}
      className="px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-theme"
    >
      <option value="all">All</option>
      <option value="posted">Posted</option>
      <option value="pending">Pending</option>
      <option value="failed">Failed</option>
    </select>
  </div>
);

export default SearchFilter;
