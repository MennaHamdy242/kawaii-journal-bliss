import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";

import { Mascot } from "@/components/design/Mascot";
import { Sticker } from "@/components/design/Sticker";
import { FocusTimer } from "@/components/dashboard/FocusTimer";
import { NotebookShelf, RecentNotes } from "@/components/dashboard/NotebookShelf";
import { PlannerHeader } from "@/components/dashboard/PlannerHeader";
import { ProgressCard } from "@/components/dashboard/ProgressCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { TaskSlip } from "@/components/dashboard/TaskSlip";
import { useFocusNestData } from "@/lib/focusnest/useFocusNest";
import { toggleTaskComplete } from "@/lib/focusnest/tasks.js";
import { isToday, isUpcoming, priorityRank } from "@/lib/focusnest/utils.js";
import type { Note, Task } from "@/lib/focusnest/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FocusNest — your cozy daily planner" },
      {
        name: "description",
        content:
          "FocusNest is a kawaii stationery planner: today's tasks on paper slips, a notebook shelf, a focus jar timer and a bunny who keeps you company.",
      },
      { property: "og:title", content: "FocusNest — your cozy daily planner" },
      {
        property: "og:description",
        content: "Today's tasks, upcoming plans, recent pages and a focus timer — all on warm paper.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function byPriorityThenDate(a: Task, b: Task) {
  return (
    Number(a.completed) - Number(b.completed) ||
    priorityRank(b.priority) - priorityRank(a.priority) ||
    (a.dueDate || "9999-12-31").localeCompare(b.dueDate || "9999-12-31")
  );
}

function Dashboard() {
  const { data, hydrated } = useFocusNestData();

  const { todayTasks, upcoming, doneToday, totalToday, favorites, recentNotes, shelfNotes } = useMemo(() => {
    const tasks: Task[] = data.tasks ?? [];
    const notes: Note[] = data.notes ?? [];

    const today = tasks.filter((t) => isToday(t.dueDate)).sort(byPriorityThenDate);
    const undated = tasks.filter((t) => !t.dueDate && !t.completed).sort(byPriorityThenDate);
    const todayList = [...today, ...undated];

    return {
      todayTasks: todayList,
      upcoming: tasks
        .filter((t) => isUpcoming(t.dueDate) && !t.completed)
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
        .slice(0, 4),
      doneToday: today.filter((t) => t.completed).length,
      totalToday: today.length,
      favorites: [...tasks.filter((t) => t.favorite || t.important)].slice(0, 3),
      recentNotes: [...notes].sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || "")),
      shelfNotes: [...notes].sort((a, b) => Number(b.pinned) - Number(a.pinned)),
    };
  }, [data]);

  const settings = data.settings;

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-6 sm:px-6">
      <PlannerHeader
        name={typeof settings["userName"] === "string" ? (settings["userName"] as string) : ""}
        streak={Number(settings.focusStreak || 0)}
        hydrated={hydrated}
      />

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <ProgressCard done={doneToday} total={totalToday} />
        <FocusTimer sessions={Number(settings.focusSessions || 0)} />
      </div>

      <div className="mt-4">
        <QuickActions />
      </div>

      {/* Today */}
      <section className="paper relative mt-4 overflow-hidden p-5">
        <Sticker name="tape-dots" className="pointer-events-none absolute -left-5 -top-2 h-6 w-28 -rotate-6" />
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-2xl text-foreground">Today</h2>
          <span className="label-caps">{todayTasks.length} slips</span>
        </div>

        {todayTasks.length === 0 ? (
          <div className="flex flex-col items-center py-4 text-center">
            <Mascot mood={hydrated ? "sleepy" : "thinking"} className="h-24 w-auto" />
            <p className="handwritten mt-2 text-2xl text-foreground">Nothing urgent today ♡</p>
            <p className="mt-1 text-xs text-muted-foreground">Add one tiny thing above.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {todayTasks.map((task) => (
              <TaskSlip key={task.id} task={task} onToggle={toggleTaskComplete} />
            ))}
          </div>
        )}

        {totalToday > 0 && doneToday === totalToday ? (
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-secondary/60 p-3">
            <Mascot mood="celebrating" className="h-14 w-auto" />
            <p className="handwritten text-2xl text-primary">everything's checked off!</p>
          </div>
        ) : null}
      </section>

      {/* Upcoming */}
      {upcoming.length > 0 ? (
        <section className="paper mt-4 p-5">
          <h2 className="mb-3 text-2xl text-foreground">Coming up</h2>
          <div className="space-y-2.5">
            {upcoming.map((task) => (
              <TaskSlip key={task.id} task={task} onToggle={toggleTaskComplete} showDate />
            ))}
          </div>
        </section>
      ) : null}

      {/* Favorites */}
      {favorites.length > 0 ? (
        <section className="paper mt-4 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Sticker name="heart" className="h-5 w-auto" />
            <h2 className="text-2xl text-foreground">Kept close</h2>
          </div>
          <div className="space-y-2.5">
            {favorites.map((task) => (
              <TaskSlip key={task.id} task={task} onToggle={toggleTaskComplete} showDate />
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-4 space-y-4">
        <NotebookShelf notes={shelfNotes} />
        <RecentNotes notes={recentNotes} />
      </div>

      <footer className="mt-10 flex items-center justify-center gap-2">
        <Mascot mood="heart" className="h-12 w-auto" />
        <p className="handwritten text-xl text-muted-foreground">FocusNest ♡</p>
      </footer>
    </main>
  );
}
