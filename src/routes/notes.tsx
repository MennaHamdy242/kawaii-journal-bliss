import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { Mascot } from "@/components/design/Mascot";
import { Sticker } from "@/components/design/Sticker";
import { IconMic, IconNotes, IconSearch } from "@/components/design/icons";
import { NoteCard, plainPreview } from "@/components/notes/NoteCard";
import { NoteEditorSheet } from "@/components/notes/NoteEditorSheet";
import { VoiceNoteSheet } from "@/components/notes/VoiceNoteSheet";
import { createNote } from "@/lib/focusnest/notes.js";
import { useFocusNestData } from "@/lib/focusnest/useFocusNest";
import type { Note } from "@/lib/focusnest/types";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Notebook — FocusNest" },
      {
        name: "description",
        content: "Your FocusNest notebook shelf: pinned pages, favorites, voice notes and photos on cozy paper.",
      },
      { property: "og:title", content: "Notebook — FocusNest" },
      { property: "og:description", content: "Pinned pages, favorites, voice notes and photos in one cozy notebook." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NotesScreen,
});

function NotesScreen() {
  const { data, hydrated } = useFocusNestData();
  const [q, setQ] = useState("");
  const [openNoteId, setOpenNoteId] = useState<string | null>(null);
  const [voice, setVoice] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [composing, setComposing] = useState(false);

  const notes: Note[] = data.notes ?? [];

  const { pinned, favorites, recent } = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const matched = needle
      ? notes.filter(
          (n) =>
            (n.title || "").toLowerCase().includes(needle) ||
            plainPreview(n.content || "").toLowerCase().includes(needle) ||
            (n.tags ?? []).some((t) => t.toLowerCase().includes(needle)),
        )
      : notes;
    const sorted = [...matched].sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
    return {
      pinned: sorted.filter((n) => n.pinned),
      favorites: sorted.filter((n) => n.favorite && !n.pinned),
      recent: sorted.filter((n) => !n.pinned && !n.favorite),
    };
  }, [notes, q]);

  const openNote = openNoteId ? notes.find((n) => n.id === openNoteId) ?? null : null;

  const addNote = () => {
    const t = newTitle.trim();
    if (!t) return;
    const note = createNote({ title: t, content: "" });
    setNewTitle("");
    setComposing(false);
    setOpenNoteId(note.id);
  };

  return (
    <main className="mx-auto max-w-3xl px-4 pb-28 pt-6 sm:px-6">
      <header className="paper relative overflow-hidden p-5">
        <Sticker name="tape-floral" className="pointer-events-none absolute -right-6 -top-2 h-6 w-28 rotate-6" />
        <p className="label-caps">Your notebook</p>
        <div className="flex items-end justify-between gap-3">
          <h1 className="handwritten text-4xl text-foreground">Notebook shelf</h1>
          <Mascot mood="studying" className="pointer-events-none h-16 w-auto" />
        </div>
        <p className="text-xs text-muted-foreground">
          {hydrated ? `${notes.length} page${notes.length === 1 ? "" : "s"} kept safe` : "opening the shelf…"}
        </p>

        <div className="mt-3 flex items-center gap-2 rounded-2xl bg-secondary/50 px-3">
          <IconSearch className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="search your pages…"
            aria-label="Search notes"
            className="min-h-11 min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          {q ? (
            <button type="button" onClick={() => setQ("")} aria-label="Clear search" className="px-1 text-lg text-muted-foreground">
              ×
            </button>
          ) : null}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setComposing((v) => !v)}
            className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-3 text-xs font-bold text-primary-foreground active:scale-95"
          >
            <IconNotes className="h-4 w-4" /> New note
          </button>
          <button
            type="button"
            onClick={() => setVoice(true)}
            className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-secondary/70 px-3 text-xs font-bold text-secondary-foreground active:scale-95"
          >
            <IconMic className="h-4 w-4" /> Voice note
          </button>
        </div>

        {composing ? (
          <div className="mt-3 flex items-center gap-2 rounded-2xl border border-dashed border-primary/40 bg-secondary/40 p-2">
            <input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addNote();
                if (e.key === "Escape") setComposing(false);
              }}
              placeholder="a title for your page…"
              className="min-h-11 min-w-0 flex-1 bg-transparent px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={addNote}
              className="min-h-11 rounded-full bg-primary px-4 text-xs font-bold text-primary-foreground active:scale-95"
            >
              Add
            </button>
          </div>
        ) : null}
      </header>

      {notes.length === 0 ? (
        <section className="paper mt-4 flex flex-col items-center p-6 text-center">
          <Mascot mood="thinking" className="pointer-events-none h-24 w-auto" />
          <p className="handwritten mt-2 text-2xl text-foreground">The shelf is empty</p>
          <p className="mt-1 text-xs text-muted-foreground">Start with one tiny page ♡</p>
        </section>
      ) : null}

      <Group title="Pinned" notes={pinned} onOpen={setOpenNoteId} />
      <Group title="Favorites" notes={favorites} onOpen={setOpenNoteId} />
      <Group title={q ? "Matches" : "Recent pages"} notes={recent} onOpen={setOpenNoteId} />

      {q && pinned.length + favorites.length + recent.length === 0 && notes.length > 0 ? (
        <p className="mt-6 text-center text-sm text-muted-foreground">No page matches “{q}”.</p>
      ) : null}

      {openNote ? <NoteEditorSheet key={openNote.id} note={openNote} onClose={() => setOpenNoteId(null)} /> : null}
      {voice ? <VoiceNoteSheet onClose={() => setVoice(false)} onSaved={(id) => setOpenNoteId(id)} /> : null}
    </main>
  );
}

function Group({ title, notes, onOpen }: { title: string; notes: Note[]; onOpen: (id: string) => void }) {
  if (notes.length === 0) return null;
  return (
    <section className="mt-5">
      <div className="mb-2 flex items-baseline justify-between px-1">
        <h2 className="text-2xl text-foreground">{title}</h2>
        <span className="label-caps">{notes.length}</span>
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {notes.map((n) => (
          <NoteCard key={n.id} note={n} onOpen={onOpen} />
        ))}
      </div>
    </section>
  );
}
