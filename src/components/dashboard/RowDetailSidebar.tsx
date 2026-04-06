import { X, ExternalLink, Play, Image as ImageIcon } from "lucide-react";
import type { SheetRow } from "@/hooks/useGoogleSheets";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface Props {
  row: SheetRow | null;
  open: boolean;
  onClose: () => void;
  onImageClick: (src: string) => void;
}

function isUrl(val: string): boolean {
  try {
    const u = new URL(val);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function isImageUrl(val: string): boolean {
  if (!isUrl(val)) return false;
  return /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?|$)/i.test(val) || val.includes("ibb.co") || val.includes("fal.media");
}

function isVideoUrl(val: string): boolean {
  if (!isUrl(val)) return false;
  return /\.(mp4|webm|mov)(\?|$)/i.test(val) || val.includes("youtube.com") || val.includes("youtu.be");
}

function formatValue(val: string): string {
  if (!val || !val.trim()) return "—";
  // Handle Google Sheets date format like Date(2026,2,17,9,0,0)
  const dateMatch = val.match(/^Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+),(\d+))?\)$/);
  if (dateMatch) {
    const [, y, m, d, h, min, s] = dateMatch;
    const date = new Date(+y, +m, +d, +(h || 0), +(min || 0), +(s || 0));
    return date.toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit", hour12: true,
    });
  }
  // Try parsing as a date
  if (/^\d{4}-\d{2}-\d{2}/.test(val)) {
    try {
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("en-US", {
          month: "short", day: "numeric", year: "numeric",
          hour: "numeric", minute: "2-digit", hour12: true,
        });
      }
    } catch {}
  }
  return val;
}

const LABEL_MAP: Record<string, string> = {
  guid: "GUID",
  title: "Title",
  link: "Link",
  mediaType: "Media Type",
  fbPostId: "FB Post ID",
  status: "Status",
  timestamp: "Timestamp",
  errorMessage: "Error Message",
  Content: "Content",
  Image: "Image",
  Date: "Date",
  Comment: "Comment",
  submit_at: "Submitted At",
  topic: "Topic",
  content: "Content",
  img_prompt: "Image Prompt",
  img_url: "Image URL",
  vid_url: "Video URL",
  schedule_time: "Schedule Time",
  "posted?": "Posted?",
  post_id: "Post ID",
  gen_content: "Generated Content",
  gen_img: "Generated Image",
  post_in: "Post In",
  posted_time: "Posted Time",
  summary: "Summary",
  ext_link: "External Link",
  submitted_at: "Submitted At",
  posted_at: "Posted At",
};

function getLabel(key: string): string {
  return LABEL_MAP[key] || key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const RowDetailSidebar = ({ row, open, onClose, onImageClick }: Props) => {
  if (!row) return null;

  const entries = Object.entries(row).filter(
    ([key, val]) => key && key.trim() && val && val.trim()
  );

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-card border-border">
        <SheetHeader className="pb-4 border-b border-border">
          <SheetTitle className="text-lg font-bold text-foreground">
            Post Details
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {entries.map(([key, val]) => {
            const label = getLabel(key);
            const isImg = isImageUrl(val);
            const isVid = isVideoUrl(val);
            const isLink = isUrl(val) && !isImg;

            return (
              <div key={key} className="group">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">
                  {label}
                </p>
                <div className="bg-background rounded-lg p-3 border border-border">
                  {isImg ? (
                    <div className="space-y-2">
                      <img
                        src={val}
                        alt={label}
                        className="w-full max-h-64 object-contain rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => onImageClick(val)}
                        loading="lazy"
                      />
                      <a
                        href={val}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-status-blue hover:underline"
                      >
                        <ExternalLink size={10} /> Open image
                      </a>
                    </div>
                  ) : isVid ? (
                    <a
                      href={val}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-status-purple hover:underline"
                    >
                      <Play size={14} /> Watch Video
                    </a>
                  ) : isLink ? (
                    <a
                      href={val}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-status-blue hover:underline break-all"
                    >
                      {val}
                    </a>
                  ) : (
                    <p className="text-sm text-foreground whitespace-pre-wrap break-words leading-relaxed">
                      {formatValue(val)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default RowDetailSidebar;
