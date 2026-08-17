import { useEffect, useRef, useState } from "react";

import { Mascot } from "@/components/design/Mascot";
import { Sticker } from "@/components/design/Sticker";
import { updateNote, deleteNote } from "@/lib/focusnest/notes.js";
import { loadAttachmentUrl } from "@/lib/focusnest/attachments.js";
import { parseTags, formatDateTime } from "@/lib/focusnest/utils.js";
import type { Note } from "@/lib/focusnest/types";

const COVERS: Array<[string, string]> = [
  ["blush", "Blush"],
  ["sky", "Sky"],
  ["lavender", "Dream"],
  ["cream", "Ribbon"],
  ["berry", "Berry"],
];

/**
 * Mirrors the original showNoteEditor() modal semantics:
 * title, rich content, cover, tags, pin, favorite, attachments, delete.
 * All writes go through the existing notes.js CRUD — no new state or storage.
 */
export function NoteEditorSheet({ note, onClose }: { note: Note; onClose: () => void }) {
  const [title, setTitle] = useState(note.title);
  const [tags, setTags] = useState((note.tags ?? []).join(", "));
  const [cover, setCover] = useState(note.cover || "blush");
  const [pinned, setPinned] = useState(Boolean(note.pinned));
  const [favorite, setFavorite] = useState(Boolean(note.favorite));
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [urls, setUrls] = useState<Record<string, string>>({});

  // Hydrate attachment blobs straight from the existing IndexedDB store.
  useEffect(() => {
    let alive = true;
    const made: string[] = [];
    (async () => {
      for (const a of note.attachments ?? []) {
        const url = await loadAttachmentUrl(a.id).catch(() => null);
        if (!url) continue;
        made.push(url);
        if (!alive) break;
        setUrls((prev) => ({ ...prev, [a.id]: url }));
      }
    })();
    return () => {
      alive = false;
      made.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [note.id, note.attachments]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const save = () => {
    const clean = title.trim();
    if (!clean) return;
    updateNote(note.id, {
      title: clean,
      content: contentRef.current?.innerHTML ?? note.content,
      tags: parseTags(tags),
      cover,
      pinned,
      favorite,
    });
    onClose();
  };

  const remove = async () => {
    await deleteNote(note.id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 backdrop-blur-[2px] sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Note: ${note.title || "Little note"}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="paper relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-b-none rounded-t-3xl p-5 pb-8 sm:rounded-3xl sm:pb-5">
        <Sticker name="tape-dots" className="pointer-events-none absolute -left-4 -top-2 h-6 w-24 -rotate-6" />

        <div className="mb-3 flex items-start justify-between gap-3">
          <p className="label-caps">Note page</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close note"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary/70 text-lg font-bold text-secondary-foreground active:scale-90"
          >
            ×
          </button>
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={160}
          placeholder="Give your idea a beautiful name…"
          className="handwritten w-full bg-transparent text-3xl text-foreground outline-none placeholder:text-muted-foreground"
        />
        <p className="mt-0.5 text-[10px] text-muted-foreground">Edited {formatDateTime(note.updatedAt)}</p>

        <div
          ref={contentRef}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label="Note content"
          dangerouslySetInnerHTML={{ __html: note.content || "" }}
          className="ruled mt-3 min-h-32 rounded-2xl bg-card/60 p-3 text-sm leading-7 text-foreground outline-none focus:ring-2 focus:ring-primary/40"
        />

        <div className="mt-4">
          <p className="label-caps mb-2">Notebook style</p>
          <div className="flex flex-wrap gap-2">
            {COVERS.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setCover(value)}
                aria-pressed={cover === value}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition-transform active:scale-95 ${
                  cover === value
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/70 text-secondary-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <label className="label-caps mt-4 block" htmlFor="noteTags">
          Tags
        </label>
        <input
          id="noteTags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="idea, project, study"
          className="mt-1 w-full rounded-2xl bg-secondary/50 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />

        <div className="mt-3 flex flex-wrap gap-2">
          <Toggle on={pinned} onClick={() => setPinned((v) => !v)} label="Pinned" />
          <Toggle on={favorite} onClick={() => setFavorite((v) => !v)} label="Favorite" />
        </div>

        {note.attachments?.length ? (
          <div className="mt-4">
            <p className="label-caps mb-2">Attachments</p>
            <div className="flex flex-wrap gap-2">
              {note.attachments.map((a) =>
                a.type === "image" ? (
                  <img
                    key={a.id}
                    src={urls[a.id]}
                    alt={a.name}
                    className="h-20 w-20 rounded-2xl object-cover shadow-[var(--shadow-paper)]"
                  />
                ) : (
                  <audio key={a.id} controls src={urls[a.id]} className="w-full" />
                ),
              )}
            </div>
          </div>
        ) : null}

        <div className="mt-5 flex items-center gap-2">
          <Mascot mood="writing" className="pointer-events-none h-12 w-auto" />
          <button
            type="button"
            onClick={remove}
            className="ml-auto rounded-full bg-secondary/70 px-4 py-2.5 text-xs font-bold text-muted-foreground active:scale-95"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={save}
            className="rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground active:scale-95"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`rounded-full px-3 py-1.5 text-xs font-bold transition-transform active:scale-95 ${
        on ? "bg-accent text-accent-foreground" : "bg-secondary/70 text-secondary-foreground"
      }`}
    >
      {on ? "♥ " : "○ "}
      {label}
    </button>
  );
}
