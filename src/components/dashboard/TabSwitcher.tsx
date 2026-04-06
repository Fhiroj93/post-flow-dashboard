const TABS = [
  { key: "rss", label: "📡 RSS Feed" },
  { key: "manual", label: "✍️ Manual Posts" },
  { key: "blog", label: "🔗 Blog Posts" },
  { key: "youtube", label: "🎬 YouTube Posts" },
] as const;

export type TabKey = (typeof TABS)[number]["key"];

interface Props {
  active: TabKey;
  onChange: (t: TabKey) => void;
}

const TabSwitcher = ({ active, onChange }: Props) => (
  <div className="flex gap-1 px-4 sm:px-6 overflow-x-auto pb-1 no-scrollbar">
    {TABS.map((t) => (
      <button
        key={t.key}
        onClick={() => onChange(t.key)}
        className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
          active === t.key
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-accent"
        }`}
      >
        {t.label}
      </button>
    ))}
  </div>
);

export default TabSwitcher;
