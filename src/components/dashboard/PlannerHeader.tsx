import { useEffect, useMemo, useState } from "react";

import { Mascot, type MascotMood } from "@/components/design/Mascot";
import { Sticker } from "@/components/design/Sticker";

const cycle: { mood: MascotMood; line: string }[] = [
  { mood: "waving", line: "hi again ♡" },
  { mood: "thinking", line: "what's first today?" },
  { mood: "coffee", line: "tea break?" },
  { mood: "writing", line: "ideas go here →" },
  { mood: "heart", line: "proud of you" },
  { mood: "celebrating", line: "yay!" },
  { mood: "sleepy", line: "…five more minutes" },
];

function greetingFor(hour: number) {
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 22) return "Good evening";
  return "Sweet night";
}

export function PlannerHeader({
  name,
  streak,
  hydrated,
}: {
  name: string;
  streak: number;
  hydrated: boolean;
}) {
  const [now, setNow] = useState<Date | null>(null);
  const [step, setStep] = useState(0);
  const [pop, setPop] = useState(false);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const dateLabel = useMemo(() => {
    if (!now) return "";
    return new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(now);
  }, [now]);

  const current = cycle[step % cycle.length]!;

  return (
    <header className="paper taped relative overflow-hidden px-5 pb-6 pt-9 sm:px-8">
      <Sticker name="cloud" className="pointer-events-none absolute -left-5 bottom-0 w-24 opacity-60" />
      <Sticker name="star" className="pointer-events-none absolute right-5 top-6 w-7 animate-twinkle" />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="label-caps">{hydrated ? dateLabel : "\u00a0"}</p>
          <h1 className="mt-1 text-4xl leading-tight text-foreground sm:text-5xl">
            {greetingFor(now?.getHours() ?? 9)}
            {name ? `, ${name}` : ""}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {streak > 0
              ? `${streak} things checked off so far — keep the little streak going.`
              : "A fresh page. Let's fill it gently."}
          </p>
        </div>

        <button
          type="button"
          aria-label="Say hi to the FocusNest bunny"
          onClick={() => {
            setStep((s) => s + 1);
            setPop(true);
            window.setTimeout(() => setPop(false), 420);
          }}
          className="relative shrink-0 rounded-full outline-none transition-transform focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
        >
          <Mascot
            mood={current.mood}
            className={`h-24 w-auto sm:h-28 ${pop ? "animate-pop" : "animate-float"}`}
          />
          <span className="handwritten absolute -left-2 -top-1 whitespace-nowrap rounded-full bg-card/90 px-2 py-0.5 text-lg text-primary shadow-[var(--shadow-sticker)]">
            {current.line}
          </span>
        </button>
      </div>
    </header>
  );
}
