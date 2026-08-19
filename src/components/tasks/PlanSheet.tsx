import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Mascot } from "@/components/design/Mascot";
import { Sticker } from "@/components/design/Sticker";
import { createTask } from "@/lib/focusnest/tasks.js";
import { parseTags, todayISO, addDaysISO } from "@/lib/focusnest/utils.js";
import type { Priority } from "@/lib/focusnest/types";

const PRIORITIES: Array<[Priority, string]> = [
  ["low", "Gentle"],
  ["medium", "Normal"],
  ["high", "Important"],
];

type Step = { id: string; text: string };

/**
 * "Add & plan" flow. FocusNest has no separate plan entity, so a plan is
 * persisted as existing tasks: one parent task plus an optional task per step.
 * Nothing is written until the user confirms.
 */
export function PlanSheet({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(todayISO());
  const [priority, setPriority] = useState<Priority>("medium");
  const [tags, setTags] = useState("");
  const [important, setImportant] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [stepDraft, setStepDraft] = useState("");

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

  const addStep = () => {
    const text = stepDraft.trim();
    if (!text) return;
    setSteps((s) => [...s, { id: `${Date.now()}-${s.length}`, text }]);
    setStepDraft("");
  };

  const save = () => {
    const clean = title.trim();
    if (!clean) return;
    const parsed = parseTags(tags);
    createTask({ title: clean, description: description.trim(), dueDate, priority, tags: parsed, important });
    // Steps become their own little slips so they can be checked off individually.
    steps.forEach((s) =>
      createTask({ title: s.text, description: `Part of: ${clean}`, dueDate, priority, tags: parsed }),
    );
    onClose();
  };

  const sheet = (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 backdrop-blur-[2px] sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Plan something"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="paper relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-b-none rounded-t-3xl p-5 pb-8 sm:rounded-3xl sm:pb-5">
        <Sticker name="tape-dots" className="pointer-events-none absolute -left-4 -top-2 h-6 w-24 -rotate-6" />

        <div className="mb-3 flex items-start justify-between gap-3">
          <p className="label-caps">Plan a little something</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close planner"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary/70 text-lg font-bold text-secondary-foreground active:scale-90"
          >
            ×
          </button>
        </div>

        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={160}
          placeholder="What are we planning?"
          className="handwritten w-full bg-transparent text-3xl text-foreground outline-none placeholder:text-muted-foreground"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="a note to future you…"
          className="ruled mt-3 w-full resize-none rounded-2xl bg-card/60 p-3 text-sm leading-7 text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40"
        />

        <p className="label-caps mt-4 mb-2">When</p>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setDueDate(todayISO())} className={chip(dueDate === todayISO())}>
            Today
          </button>
          <button type="button" onClick={() => setDueDate(addDaysISO(1))} className={chip(dueDate === addDaysISO(1))}>
            Tomorrow
          </button>
          <button type="button" onClick={() => setDueDate(addDaysISO(7))} className={chip(dueDate === addDaysISO(7))}>
            Next week
          </button>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="min-w-0 flex-1 rounded-2xl bg-secondary/50 px-3 py-2 text-xs text-foreground outline-none"
          />
        </div>

        <p className="label-caps mt-4 mb-2">Priority</p>
        <div className="flex flex-wrap gap-2">
          {PRIORITIES.map(([value, label]) => (
            <button key={value} type="button" onClick={() => setPriority(value)} className={chip(priority === value)}>
              {label}
            </button>
          ))}
          <button type="button" onClick={() => setImportant((v) => !v)} className={chip(important)}>
            ★ Star it
          </button>
        </div>

        <p className="label-caps mt-4 mb-2">Steps</p>
        <div className="flex items-center gap-2">
          <input
            value={stepDraft}
            onChange={(e) => setStepDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addStep();
              }
            }}
            placeholder="one small step…"
            className="min-w-0 flex-1 rounded-2xl bg-secondary/50 px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={addStep}
            className="min-h-11 rounded-full bg-secondary/70 px-4 text-xs font-bold text-secondary-foreground active:scale-95"
          >
            Add
          </button>
        </div>
        {steps.length ? (
          <ul className="mt-2 space-y-1.5">
            {steps.map((s) => (
              <li key={s.id} className="flex items-center gap-2 rounded-2xl bg-card/60 px-3 py-2 text-sm text-foreground">
                <span className="text-primary">○</span>
                <span className="min-w-0 flex-1 break-words">{s.text}</span>
                <button
                  type="button"
                  onClick={() => setSteps((list) => list.filter((x) => x.id !== s.id))}
                  aria-label={`Remove step ${s.text}`}
                  className="shrink-0 text-muted-foreground active:scale-90"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <label className="label-caps mt-4 block" htmlFor="planTags">
          Tags
        </label>
        <input
          id="planTags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="study, home, self-care"
          className="mt-1 w-full rounded-2xl bg-secondary/50 px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />

        <div className="mt-5 flex items-center gap-2">
          <Mascot mood="thinking" className="pointer-events-none h-12 w-auto" />
          <button
            type="button"
            onClick={onClose}
            className="ml-auto min-h-11 rounded-full bg-secondary/70 px-4 py-2.5 text-xs font-bold text-muted-foreground active:scale-95"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!title.trim()}
            className="min-h-11 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground active:scale-95 disabled:opacity-50"
          >
            Save plan
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(sheet, document.body);
}

function chip(active: boolean) {
  return `min-h-9 rounded-full px-3 py-1.5 text-xs font-bold transition-transform active:scale-95 ${
    active ? "bg-primary text-primary-foreground" : "bg-secondary/70 text-secondary-foreground"
  }`;
}
