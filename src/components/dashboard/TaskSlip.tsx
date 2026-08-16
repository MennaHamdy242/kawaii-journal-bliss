import { Sticker } from "@/components/design/Sticker";
import { formatDate } from "@/lib/focusnest/utils.js";
import type { Task } from "@/lib/focusnest/types";

const priorityTint: Record<string, string> = {
  high: "bg-primary",
  medium: "bg-accent",
  low: "bg-muted-foreground/40",
};

export function TaskSlip({
  task,
  onToggle,
  showDate = false,
}: {
  task: Task;
  onToggle: (id: string) => void;
  showDate?: boolean;
}) {
  return (
    <article className="slip relative flex items-start gap-3 py-3 pl-8 pr-4">
      <span
        className={`absolute left-[26px] top-3 h-[calc(100%-1.5rem)] w-1 rounded-full ${
          priorityTint[task.priority] ?? priorityTint["medium"]
        }`}
        aria-hidden="true"
      />
      <button
        type="button"
        onClick={() => onToggle(task.id)}
        aria-label={task.completed ? "Mark task active" : "Mark task complete"}
        className={`ml-2 mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-all active:scale-90 ${
          task.completed
            ? "border-primary bg-primary text-primary-foreground"
            : "border-primary/50 text-transparent hover:border-primary"
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="m5 12.5 4.5 4.5L19 7" />
        </svg>
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm font-semibold ${
            task.completed ? "text-muted-foreground line-through" : "text-foreground"
          }`}
        >
          {task.title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
          {showDate && task.dueDate ? <span>{formatDate(task.dueDate)}</span> : null}
          {task.priority === "high" ? <span className="font-bold text-primary">high</span> : null}
          {(task.tags ?? []).slice(0, 2).map((t) => (
            <span key={t}>#{t}</span>
          ))}
          {task.attachments?.length ? <span>{task.attachments.length} attached</span> : null}
        </div>
      </div>

      {task.favorite || task.important ? (
        <Sticker name={task.favorite ? "heart" : "star"} className="mt-0.5 h-5 w-auto" />
      ) : null}
    </article>
  );
}
