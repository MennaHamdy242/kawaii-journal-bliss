import { formatDateTime } from "@/lib/focusnest/utils.js";
import type { Note } from "@/lib/focusnest/types";

import coverSakura from "@/assets/notebook-covers/sakura.jpg";
import coverSky from "@/assets/notebook-covers/dreamy-sky.jpg";
import coverMilk from "@/assets/notebook-covers/strawberry-milk.jpg";
import coverRibbon from "@/assets/notebook-covers/ribbon.jpg";
import coverTeddy from "@/assets/notebook-covers/cozy-teddy.jpg";

export const coverArt: Record<string, string> = {
  blush: coverRibbon,
  sky: coverSky,
  lavender: coverSakura,
  cream: coverTeddy,
  berry: coverMilk,
};

export function plainPreview(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** A note as a little notebook card: cover art, badges and preview. */
export function NoteCard({ note, onOpen }: { note: Note; onOpen: (id: string) => void }) {
  const hasVoice = (note.attachments ?? []).some((a) => a.type === "audio");
  const images = (note.attachments ?? []).filter((a) => a.type === "image").length;

  return (
    <button
      type="button"
      onClick={() => onOpen(note.id)}
      aria-label={`Open note: ${note.title || "Little note"}`}
      className="paper group flex w-full min-w-0 cursor-pointer gap-3 p-3 text-left transition-transform active:scale-[0.98]"
    >
      <span className="relative block h-20 w-16 shrink-0 overflow-hidden rounded-xl shadow-[var(--shadow-paper)]">
        <img
          src={coverArt[note.cover] ?? coverRibbon}
          alt=""
          loading="lazy"
          className="pointer-events-none h-full w-full object-cover"
        />
        <span className="pointer-events-none absolute inset-y-0 left-0 w-1.5 bg-primary/70" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-start gap-1.5">
          <span className="min-w-0 flex-1 break-words text-sm font-bold text-foreground line-clamp-2">
            {note.title || "Little note"}
          </span>
          {note.favorite ? <span className="shrink-0 text-xs text-primary">♥</span> : null}
          {note.pinned ? <span className="shrink-0 text-xs">📌</span> : null}
        </span>
        <span className="mt-0.5 block break-words text-xs text-muted-foreground line-clamp-2">
          {hasVoice && !plainPreview(note.content)
            ? "Voice note ♪"
            : plainPreview(note.content) || "A tiny page waiting for you"}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-1.5">
          {hasVoice ? (
            <span className="rounded-full bg-accent/60 px-2 py-0.5 text-[10px] font-bold text-accent-foreground">
              ♪ voice
            </span>
          ) : null}
          {images ? (
            <span className="rounded-full bg-secondary/70 px-2 py-0.5 text-[10px] font-bold text-secondary-foreground">
              {images} photo{images > 1 ? "s" : ""}
            </span>
          ) : null}
          {(note.tags ?? []).slice(0, 2).map((t) => (
            <span key={t} className="rounded-full bg-secondary/60 px-2 py-0.5 text-[10px] text-muted-foreground">
              #{t}
            </span>
          ))}
          <span className="text-[10px] text-muted-foreground">{formatDateTime(note.updatedAt)}</span>
        </span>
      </span>
    </button>
  );
}
