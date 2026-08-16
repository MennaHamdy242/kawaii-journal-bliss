import { Sticker } from "@/components/design/Sticker";

export function ProgressCard({
  done,
  total,
}: {
  done: number;
  total: number;
}) {
  const remaining = Math.max(0, total - done);
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <section className="paper grid-paper relative overflow-hidden p-5">
      <Sticker name="tape-gingham" className="pointer-events-none absolute -right-4 -top-2 h-6 w-28 rotate-6" />
      <p className="label-caps">Today's progress</p>

      <div className="mt-3 flex items-end gap-3">
        <span className="handwritten text-6xl leading-none text-primary">{pct}%</span>
        <p className="mb-2 text-xs text-muted-foreground">
          {total === 0 ? "nothing planned yet" : `${done} done · ${remaining} to go`}
        </p>
      </div>

      <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-4 flex gap-2">
        <div className="flex-1 rounded-2xl bg-secondary/70 px-3 py-2">
          <p className="text-lg font-bold text-foreground">{done}</p>
          <p className="text-[11px] text-muted-foreground">completed</p>
        </div>
        <div className="flex-1 rounded-2xl bg-secondary/70 px-3 py-2">
          <p className="text-lg font-bold text-foreground">{remaining}</p>
          <p className="text-[11px] text-muted-foreground">remaining</p>
        </div>
      </div>
    </section>
  );
}
