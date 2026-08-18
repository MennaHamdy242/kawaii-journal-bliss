import { useState } from "react";

import { IconMic, IconNotes, IconPlus, IconTasks } from "@/components/design/icons";
import { VoiceNoteSheet } from "@/components/notes/VoiceNoteSheet";
import { PlanSheet } from "@/components/tasks/PlanSheet";
import { createTask } from "@/lib/focusnest/tasks.js";
import { createNote } from "@/lib/focusnest/notes.js";
import { todayISO } from "@/lib/focusnest/utils.js";

type Mode = "task" | "note" | null;

export function QuickActions({ onOpenNote }: { onOpenNote?: (id: string) => void } = {}) {
  const [mode, setMode] = useState<Mode>(null);
  const [value, setValue] = useState("");
  const [sheet, setSheet] = useState<"voice" | "plan" | null>(null);

  const submit = () => {
    const text = value.trim();
    if (!text) return;
    if (mode === "task") createTask({ title: text, dueDate: todayISO(), priority: "medium" });
    if (mode === "note") createNote({ title: text, content: "" });
    setValue("");
    setMode(null);
  };

  return (
    <section className="paper p-5">
      <p className="label-caps mb-3">Quick actions</p>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <ActionButton icon={<IconTasks className="h-5 w-5" />} label="New task" onClick={() => setMode("task")} />
        <ActionButton icon={<IconNotes className="h-5 w-5" />} label="New note" onClick={() => setMode("note")} />
        <ActionButton icon={<IconMic className="h-5 w-5" />} label="Voice note" onClick={() => { setMode(null); setSheet("voice"); }} />
        <ActionButton icon={<IconPlus className="h-5 w-5" />} label="Add & plan" onClick={() => { setMode(null); setSheet("plan"); }} />
      </div>

      {sheet === "voice" ? (
        <VoiceNoteSheet onClose={() => setSheet(null)} onSaved={(id) => onOpenNote?.(id)} />
      ) : null}
      {sheet === "plan" ? <PlanSheet onClose={() => setSheet(null)} /> : null}

      {mode ? (
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-dashed border-primary/40 bg-secondary/50 p-2">

          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
              if (e.key === "Escape") setMode(null);
            }}
            placeholder={mode === "task" ? "one small thing for today…" : "a title for your page…"}
            className="min-w-0 flex-1 bg-transparent px-2 py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={submit}
            className="rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground active:scale-95"
          >
            Add
          </button>
        </div>
      ) : null}
    </section>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  const cls =
    "flex flex-col items-center gap-1.5 rounded-2xl bg-secondary/70 px-2 py-3 text-[11px] font-bold text-secondary-foreground transition-transform hover:-translate-y-0.5 active:scale-95";
  return (
    <button type="button" onClick={onClick} className={cls}>
      {icon}
      {label}
    </button>
  );
}
