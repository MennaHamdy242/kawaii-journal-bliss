import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { Mascot } from "@/components/design/Mascot";
import { Sticker } from "@/components/design/Sticker";
import { TaskSlip } from "@/components/dashboard/TaskSlip";
import { NoteCard } from "@/components/notes/NoteCard";
import { NoteEditorSheet } from "@/components/notes/NoteEditorSheet";
import { toggleTaskComplete } from "@/lib/focusnest/tasks.js";
import { useFocusNestData } from "@/lib/focusnest/useFocusNest";
import type { Note, Task } from "@/lib/focusnest/types";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "Kept close — FocusNest" },
      { name: "description", content: "The FocusNest tasks and notebook pages you marked with a little heart." },
      { property: "og:title", content: "Kept close — FocusNest" },
      { property: "og:description", content: "Your favorite tasks and pages, gathered on one warm paper shelf." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FavoritesScreen,
});

function FavoritesScreen() {
  const { data } = useFocusNestData();
  const [openNoteId, setOpenNoteId] = useState<string | null>(null);

  const notes: Note[] = data.notes ?? [];
  const { favTasks, favNotes } = useMemo(() => {
    const tasks: Task[] = data.tasks ?? [];
    return {
      favTasks: tasks.filter((t) => t.favorite || t.important),
      favNotes: notes.filter((n) => n.favorite),
    };
  }, [data, notes]);

  const openNote = openNoteId ? notes.find((n) => n.id === openNoteId) ?? null : null;
  const empty = favTasks.length === 0 && favNotes.length === 0;

  return (
    <main className="mx-auto max-w-3xl px-4 pb-28 pt-6 sm:px-6">
      <header className="paper relative overflow-hidden p-5">
        <Sticker name="heart" className="pointer-events-none absolute right-4 top-3 h-6 w-auto" />
        <p className="label-caps">Little treasures</p>
        <div className="flex items-end justify-between gap-3">
          <h1 className="handwritten text-4xl text-foreground">Kept close</h1>
          <Mascot mood="heart" className="pointer-events-none h-16 w-auto" />
        </div>
      </header>

      {empty ? (
        <section className="paper mt-4 flex flex-col items-center p-6 text-center">
          <Mascot mood="thinking" className="pointer-events-none h-24 w-auto" />
          <p className="handwritten mt-2 text-2xl text-foreground">Nothing kept yet</p>
          <p className="mt-1 text-xs text-muted-foreground">Tap ♡ on a task or a page to keep it here.</p>
        </section>
      ) : null}

      {favTasks.length > 0 ? (
        <section className="paper mt-4 p-5">
          <h2 className="mb-3 text-2xl text-foreground">Favorite tasks</h2>
          <div className="space-y-2.5">
            {favTasks.map((t) => (
              <TaskSlip key={t.id} task={t} onToggle={toggleTaskComplete} showDate />
            ))}
          </div>
        </section>
      ) : null}

      {favNotes.length > 0 ? (
        <section className="mt-5">
          <h2 className="mb-2 px-1 text-2xl text-foreground">Favorite pages</h2>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {favNotes.map((n) => (
              <NoteCard key={n.id} note={n} onOpen={setOpenNoteId} />
            ))}
          </div>
        </section>
      ) : null}

      {openNote ? <NoteEditorSheet key={openNote.id} note={openNote} onClose={() => setOpenNoteId(null)} /> : null}
    </main>
  );
}
