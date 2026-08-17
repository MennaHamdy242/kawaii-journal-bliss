import { Mascot } from "@/components/design/Mascot";
import { formatDateTime } from "@/lib/focusnest/utils.js";
import type { Note } from "@/lib/focusnest/types";

import coverSakura from "@/assets/notebook-covers/sakura.jpg";
import coverSky from "@/assets/notebook-covers/dreamy-sky.jpg";
import coverMilk from "@/assets/notebook-covers/strawberry-milk.jpg";
import coverRibbon from "@/assets/notebook-covers/ribbon.jpg";
import coverTeddy from "@/assets/notebook-covers/cozy-teddy.jpg";

// Maps the existing note.cover values (blush/sky/lavender/cream/berry) to artwork.
const coverArt: Record<string, string> = {
  blush: coverRibbon,
  sky: coverSky,
  lavender: coverSakura,
  cream: coverTeddy,
  berry: coverMilk,
};

function plainPreview(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function NotebookShelf({ notes, onOpen }: { notes: Note[]; onOpen: (id: string) => void }) {
  if (notes.length === 0) {
    return (
      <section className="paper flex flex-col items-center p-6 text-center">
        <p className="label-caps self-start">Notebook shelf</p>
        <Mascot mood="studying" className="pointer-events-none mt-2 h-24 w-auto" />
        <p className="handwritten mt-2 text-2xl text-foreground">The shelf is empty</p>
        <p className="mt-1 text-xs text-muted-foreground">Your first page is waiting to be written.</p>
      </section>
    );
  }

  return (
    <section className="paper p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <p className="label-caps">Notebook shelf</p>
        <span className="text-xs font-bold text-muted-foreground">{notes.length} notebooks</span>
      </div>

      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
        {notes.slice(0, 6).map((note) => (
          <button
            key={note.id}
            type="button"
            onClick={() => onOpen(note.id)}
            aria-label={`Open note: ${note.title || "Little note"}`}
            className="group w-28 shrink-0 cursor-pointer text-left transition-transform active:scale-95"
          >
            <div className="relative overflow-hidden rounded-2xl shadow-[var(--shadow-paper)] transition-transform group-hover:-translate-y-1 group-active:-translate-y-0">
              <img
                src={coverArt[note.cover] ?? coverRibbon}
                alt=""
                loading="lazy"
                className="pointer-events-none aspect-[3/4] w-full object-cover"
              />
              <span className="pointer-events-none absolute inset-y-0 left-0 w-2 bg-primary/70" />
              {note.pinned ? (
                <span className="pointer-events-none absolute right-1.5 top-1.5 rounded-full bg-card/90 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                  pinned
                </span>
              ) : null}
            </div>
            <p className="mt-1.5 truncate text-xs font-bold text-foreground">{note.title || "Little note"}</p>
            <p className="truncate text-[10px] text-muted-foreground">
              {plainPreview(note.content) || formatDateTime(note.updatedAt)}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}

export function RecentNotes({ notes, onOpen }: { notes: Note[]; onOpen: (id: string) => void }) {
  if (notes.length === 0) return null;
  return (
    <section className="paper ruled p-5">
      <p className="label-caps mb-3">Recent pages</p>
      <ul className="space-y-3">
        {notes.slice(0, 3).map((note) => (
          <li key={note.id}>
            <button
              type="button"
              onClick={() => onOpen(note.id)}
              aria-label={`Open note: ${note.title || "Little note"}`}
              className="block w-full cursor-pointer rounded-2xl px-2 py-1.5 text-left transition-transform hover:bg-secondary/40 active:scale-[0.98]"
            >
              <p className="text-sm font-semibold text-foreground">{note.title || "Little note"}</p>
              <p className="truncate text-xs text-muted-foreground">
                {plainPreview(note.content) ||
                  (note.checklist ?? []).map((i) => i.text).join(" · ") ||
                  "A tiny page waiting for you"}
              </p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{formatDateTime(note.updatedAt)}</p>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
