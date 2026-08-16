import { useEffect, useRef, useState } from "react";

import { Mascot } from "@/components/design/Mascot";
import { formatDuration, todayISO } from "@/lib/focusnest/utils.js";
import { updateData } from "@/lib/focusnest/state.js";

const LENGTHS = [15, 25, 45] as const;

export function FocusTimer({ sessions }: { sessions: number }) {
  const [minutes, setMinutes] = useState<number>(25);
  const [left, setLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [justFinished, setJustFinished] = useState(false);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    ref.current = window.setInterval(() => {
      setLeft((v) => {
        if (v <= 1) {
          window.clearInterval(ref.current!);
          setRunning(false);
          setJustFinished(true);
          // Persisted through the existing settings shape — no new keys.
          updateData((d) => {
            d.settings.focusSessions = Number(d.settings.focusSessions || 0) + 1;
            d.settings.lastFocusDate = todayISO();
          });
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => {
      if (ref.current) window.clearInterval(ref.current);
    };
  }, [running]);

  const pick = (m: number) => {
    setMinutes(m);
    setLeft(m * 60);
    setRunning(false);
    setJustFinished(false);
  };

  const total = minutes * 60;
  const pct = ((total - left) / total) * 100;

  return (
    <section className="paper relative overflow-hidden p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="label-caps">Focus jar</p>
          <p className="mt-1 text-xs text-muted-foreground">{sessions} sessions collected</p>
        </div>
        <Mascot mood={running ? "studying" : justFinished ? "celebrating" : "coffee"} className="h-16 w-auto" />
      </div>

      <p className="handwritten mt-2 text-center text-6xl leading-none text-primary">{formatDuration(left)}</p>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full bg-accent transition-[width] duration-1000" style={{ width: `${pct}%` }} />
      </div>

      <div className="mt-4 flex items-center gap-2">
        {LENGTHS.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => pick(m)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
              minutes === m ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-secondary/60"
            }`}
          >
            {m}m
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setJustFinished(false);
            setRunning((r) => !r);
          }}
          className="ml-auto rounded-full bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-[var(--shadow-sticker)] transition-transform active:scale-95"
        >
          {running ? "Pause" : left === 0 ? "Again" : "Start"}
        </button>
      </div>
    </section>
  );
}
