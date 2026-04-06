import { X } from "lucide-react";

interface Props {
  src: string | null;
  onClose: () => void;
}

const ImageModal = ({ src, onClose }: Props) => {
  if (!src) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div className="relative max-w-[80vw] max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 p-1.5 rounded-full bg-card border border-border text-foreground hover:bg-accent"
        >
          <X size={16} />
        </button>
        <img src={src} alt="Preview" className="max-w-full max-h-[80vh] rounded-lg object-contain" />
      </div>
    </div>
  );
};

export default ImageModal;
