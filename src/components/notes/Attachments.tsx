import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { loadAttachmentUrl } from "@/lib/focusnest/attachments.js";
import { formatBytes, formatDuration } from "@/lib/focusnest/utils.js";
import type { AttachmentRef } from "@/lib/focusnest/types";

/** Hydrates blob URLs for a list of attachments straight from the legacy IndexedDB store. */
export function useAttachmentUrls(attachments: AttachmentRef[]) {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const madeRef = useRef<string[]>([]);
  const ids = attachments.map((a) => a.id).join(",");

  useEffect(() => {
    let alive = true;
    (async () => {
      for (const a of attachments) {
        if (!alive) return;
        setUrls((prev) => {
          if (prev[a.id]) return prev;
          void loadAttachmentUrl(a.id)
            .then((url) => {
              if (!url) return;
              madeRef.current.push(url);
              if (alive) setUrls((p) => (p[a.id] ? p : { ...p, [a.id]: url }));
            })
            .catch(() => {});
          return prev;
        });
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids]);

  useEffect(() => {
    const made = madeRef.current;
    return () => made.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  return urls;
}

export function ImageThumbGrid({
  images,
  urls,
  onRemove,
}: {
  images: AttachmentRef[];
  urls: Record<string, string>;
  onRemove?: (a: AttachmentRef) => void;
}) {
  const [viewing, setViewing] = useState<AttachmentRef | null>(null);
  if (images.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {images.map((a) => (
          <div key={a.id} className="relative">
            <button
              type="button"
              onClick={() => setViewing(a)}
              aria-label={`Open image ${a.name}`}
              className="block w-full overflow-hidden rounded-2xl shadow-[var(--shadow-paper)] transition-transform active:scale-95"
            >
              {urls[a.id] ? (
                <img src={urls[a.id]} alt={a.name} className="aspect-square w-full object-cover" />
              ) : (
                <span className="grid aspect-square w-full place-items-center bg-secondary/60 text-[10px] text-muted-foreground">
                  loading…
                </span>
              )}
            </button>
            {onRemove ? (
              <button
                type="button"
                onClick={() => onRemove(a)}
                aria-label={`Remove image ${a.name}`}
                className="absolute -right-1.5 -top-1.5 grid h-7 w-7 place-items-center rounded-full bg-card text-sm font-bold text-muted-foreground shadow-[var(--shadow-sticker)] active:scale-90"
              >
                ×
              </button>
            ) : null}
          </div>
        ))}
      </div>
      {viewing ? (
        <ImageViewer src={urls[viewing.id]} name={viewing.name} onClose={() => setViewing(null)} />
      ) : null}
    </>
  );
}

function ImageViewer({ src, name, onClose }: { src?: string; name: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={name}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {src ? <img src={src} alt={name} className="max-h-[85vh] max-w-full rounded-2xl object-contain" /> : null}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close image"
        className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-card text-xl font-bold text-foreground active:scale-90"
      >
        ×
      </button>
    </div>,
    document.body,
  );
}

/** Compact kawaii audio player: play/pause, progress and duration. */
export function AudioBubble({
  attachment,
  url,
  onRemove,
}: {
  attachment: AttachmentRef;
  url?: string;
  onRemove?: (a: AttachmentRef) => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(attachment.duration ?? 0);

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) void el.play();
    else el.pause();
  };

  const pct = duration > 0 ? Math.min(100, (time / duration) * 100) : 0;

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-secondary/60 p-2.5">
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause voice note" : "Play voice note"}
        className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground active:scale-90"
      >
        {playing ? "❚❚" : "▶"}
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-foreground">{attachment.name || "Voice note"}</p>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-card">
          <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground">
          {formatDuration(time)} / {duration ? formatDuration(duration) : formatBytes(attachment.size || 0)}
        </p>
      </div>
      {onRemove ? (
        <button
          type="button"
          onClick={() => onRemove(attachment)}
          aria-label="Remove voice note"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-card text-sm font-bold text-muted-foreground active:scale-90"
        >
          ×
        </button>
      ) : null}
      <audio
        ref={audioRef}
        src={url}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setTime(0);
        }}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => {
          const d = e.currentTarget.duration;
          if (Number.isFinite(d) && d > 0) setDuration(d);
        }}
        className="hidden"
      />
    </div>
  );
}
