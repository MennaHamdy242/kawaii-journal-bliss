import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { Mascot } from "@/components/design/Mascot";
import { Sticker } from "@/components/design/Sticker";
import { IconPlus, IconTasks } from "@/components/design/icons";
import { TaskSlip } from "@/components/dashboard/TaskSlip";
import { PlanSheet } from "@/components/tasks/PlanSheet";
import { createTask, toggleTaskComplete } from "@/lib/focusnest/tasks.js";
import { useFocusNestData } from "@/lib/focusnest/useFocusNest";
import { isToday, isUpcoming, priorityRank, todayISO } from "@/lib/focusnest/utils.js";
import type { Task } from "@/lib/focusnest/types";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — FocusNest" },
      {
        name: "description",
        content: "Every FocusNest task on its own paper slip: today, coming up, someday and finished.",
      },
      { property: "og:title", content: "Tasks — FocusNest" },
      { property: "og:description", content: "Today, coming up, someday and finished — all on paper slips." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TasksScreen,
});

const sortTasks = (a: Task, b: Task) =>
  Number(a.completed) - Number(b.completed) ||
  priorityRank(b.priority) - priorityRank(a.priority) ||
  (a.dueDate || "9999-12-31").localeCompare(b.dueDate || "9999-12-31");

function TasksScreen() {
  const { data } = useFocusNestData();
  const [value, setValue] = useState("");
  const [plan, setPlan] = useState(false);

  const tasks: Task[] = data.tasks ?? [];
  const groups = useMemo(() => {
    const open = tasks.filter((t) => !t.completed);
    return {
      today: open.filter((t) => isToday(t.dueDate)).sort(sortTasks),
      upcoming: open.filter((t) => isUpcoming(t.dueDate)).sort(sortTasks),
      someday: open.filter((t) => !t.dueDate || (!isToday(t.dueDate) && !isUpcoming(t.dueDate))).sort(sortTasks),
      done: tasks.filter((t) => t.completed).sort(sortTasks),
    };
  }, [tasks]);

  const add = () => {
    const text = value.trim();
    if (!text) return;
    createTask({ title: text, dueDate: todayISO(), priority: "medium" });
    setValue("");
  };

  return (
    <main className="mx-auto max-w-3xl px-4 pb-28 pt-6 sm:px-6">
      <header className="paper relative overflow-hidden p-5">
        <Sticker name="tape-grid" className="pointer-events-none absolute -left-5 -top-2 h-6 w-28 -rotate-6" />
        <p className="label-caps">Your slips</p>
        <div className="flex items-end justify-between gap-3">
          <h1 className="handwritten text-4xl text-foreground">Tasks</h1>
          <Mascot mood="coffee" className="pointer-events-none h-16 w-auto" />
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-2xl border border-dashed border-primary/40 bg-secondary/40 p-2">
          <IconTasks className="ml-1 h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="one small thing for today…"
            aria-label="New task"
            className="min-h-11 min-w-0 flex-1 bg-transparent px-1 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={add}
            className="min-h-11 rounded-full bg-primary px-4 text-xs font-bold text-primary-foreground active:scale-95"
          >
            Add
          </button>
        </div>

        <button
          type="button"
          onClick={() => setPlan(true)}
          className="mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-secondary/70 text-xs font-bold text-secondary-foreground active:scale-95"
        >
          <IconPlus className="h-4 w-4" /> Add &amp; plan
        </button>
      </header>

      <Group title="Today" tasks={groups.today} />
      <Group title="Coming up" tasks={groups.upcoming} showDate />
      <Group title="Someday" tasks={groups.someday} />
      <Group title="Finished" tasks={groups.done} showDate />

      {tasks.length === 0 ? (
        <section className="paper mt-4 flex flex-col items-center p-6 text-center">
          <Mascot mood="sleepy" className="pointer-events-none h-24 w-auto" />
          <p className="handwritten mt-2 text-2xl text-foreground">No slips yet</p>
          <p className="mt-1 text-xs text-muted-foreground">Write one tiny thing above.</p>
        </section>
      ) : null}

      {plan ? <PlanSheet onClose={() => setPlan(false)} /> : null}
    </main>
  );
}

function Group({ title, tasks, showDate = false }: { title: string; tasks: Task[]; showDate?: boolean }) {
  if (tasks.length === 0) return null;
  return (
    <section className="paper mt-4 p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-2xl text-foreground">{title}</h2>
        <span className="label-caps">{tasks.length}</span>
      </div>
      <div className="space-y-2.5">
        {tasks.map((t) => (
          <TaskSlip key={t.id} task={t} onToggle={toggleTaskComplete} showDate={showDate} />
        ))}
      </div>
    </section>
  );
}
