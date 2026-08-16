import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Mascot, type MascotMood } from "@/components/design/Mascot";
import { Sticker, type StickerName } from "@/components/design/Sticker";
import {
  IconFavorites,
  IconHome,
  IconMic,
  IconNotes,
  IconPhoto,
  IconPlus,
  IconSearch,
  IconTasks,
} from "@/components/design/icons";

import coverSakura from "@/assets/notebook-covers/sakura.jpg";
import coverSky from "@/assets/notebook-covers/dreamy-sky.jpg";
import coverMilk from "@/assets/notebook-covers/strawberry-milk.jpg";
import coverRibbon from "@/assets/notebook-covers/ribbon.jpg";
import coverTwilight from "@/assets/notebook-covers/twilight-garden.jpg";
import coverTeddy from "@/assets/notebook-covers/cozy-teddy.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FocusNest — visual system & art direction" },
      {
        name: "description",
        content:
          "The FocusNest design system: kawaii stationery tokens, bunny mascot states, sticker set, notebook covers and six theme worlds.",
      },
      { property: "og:title", content: "FocusNest — visual system & art direction" },
      {
        property: "og:description",
        content: "Colour, type, paper, mascot, stickers and theme worlds for the FocusNest journal app.",
      },
    ],
  }),
  component: DesignDirection,
});

const themes = [
  { id: "sakura", name: "Sakura Diary", cover: coverSakura, note: "cream paper · blossom pink · sage" },
  { id: "dreamy-sky", name: "Dreamy Sky", cover: coverSky, note: "powder blue · lavender · clouds" },
  { id: "strawberry-milk", name: "Strawberry Milk", cover: coverMilk, note: "milk white · berry · butter" },
  { id: "ribbon", name: "Ribbon", cover: coverRibbon, note: "blush · satin rose · lace" },
  { id: "twilight-garden", name: "Twilight Garden", cover: coverTwilight, note: "deep plum · lilac · fireflies" },
  { id: "cozy-teddy", name: "Cozy Teddy", cover: coverTeddy, note: "oat · caramel · honey" },
  { id: "dreamy-night", name: "Dreamy Night", cover: coverTwilight, note: "dark mode · navy · warm cream ink" },
] as const;

const tokens = [
  ["paper", "sheet surface"],
  ["blush", "soft fill"],
  ["rose", "primary"],
  ["powder", "calm accent"],
  ["lavender", "dream accent"],
  ["peach", "warm accent"],
  ["sage", "quiet accent"],
  ["butter", "highlight"],
  ["plum", "deep ink"],
] as const;

const moods: { mood: MascotMood; label: string }[] = [
  { mood: "waving", label: "greeting" },
  { mood: "sleepy", label: "no tasks" },
  { mood: "writing", label: "note editor" },
  { mood: "celebrating", label: "all done" },
  { mood: "thinking", label: "planning" },
  { mood: "coffee", label: "focus break" },
  { mood: "heart", label: "favorites" },
  { mood: "recording", label: "voice note" },
  { mood: "confused", label: "no results" },
  { mood: "studying", label: "empty notebook" },
];

const stickerNames: StickerName[] = [
  "bow",
  "ribbon",
  "paperclip",
  "cloud",
  "sakura",
  "star",
  "heart",
  "strawberry",
  "moon",
];

const tapes: StickerName[] = ["tape-gingham", "tape-dots", "tape-floral", "tape-lace", "tape-grid"];

function Section({
  index,
  title,
  caption,
  children,
}: {
  index: string;
  title: string;
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-14">
      <div className="flex items-baseline gap-3">
        <span className="label-caps">{index}</span>
        <h2 className="text-3xl text-foreground">{title}</h2>
      </div>
      <p className="mt-1 mb-5 text-sm text-muted-foreground">{caption}</p>
      {children}
    </section>
  );
}

function DesignDirection() {
  const [theme, setTheme] = useState<string>("sakura");

  useEffect(() => {
    document.documentElement.dataset["theme"] = theme;
  }, [theme]);

  return (
    <main className="mx-auto max-w-5xl px-5 pb-32 pt-10">
      {/* Cover */}
      <header className="paper taped relative overflow-hidden px-6 py-10 sm:px-10">
        <Sticker name="star" className="absolute right-6 top-6 w-8 animate-twinkle" />
        <Sticker name="cloud" className="absolute -left-4 bottom-4 w-24 opacity-70" />
        <p className="label-caps">FocusNest · art direction v1</p>
        <h1 className="mt-2 text-5xl leading-none text-foreground sm:text-6xl">
          Paper Bunny
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          A stationery world instead of an interface: warm paper sheets, taped-down slips, a bunny who lives in the
          margins, and six little worlds to move between. 70% calm productivity, 30% kawaii magic.
        </p>
        <div className="mt-6 flex items-end gap-3">
          <Mascot mood="waving" className="w-24" float />
          <p className="handwritten mb-3 text-2xl text-primary">good evening ♡</p>
        </div>
      </header>

      {/* Theme switcher */}
      <div className="sticky top-3 z-20 mt-6 flex flex-wrap gap-2 rounded-3xl border border-border bg-card/85 p-2 backdrop-blur">
        {themes.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTheme(t.id)}
            className={`rounded-2xl px-3 py-1.5 text-xs font-semibold transition-all ${
              theme === t.id
                ? "bg-primary text-primary-foreground shadow-[var(--shadow-sticker)]"
                : "bg-secondary text-secondary-foreground hover:-translate-y-0.5"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      <Section index="01" title="Colour tokens" caption="Paper first. Colour arrives as pigment on it, never as a flat brand fill.">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {tokens.map(([name, role]) => (
            <div key={name} className="paper overflow-hidden p-0">
              <div className="h-16 w-full" style={{ background: `var(--${name})` }} />
              <div className="px-3 py-2">
                <div className="text-xs font-bold text-foreground">{name}</div>
                <div className="text-[11px] text-muted-foreground">{role}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section index="02" title="Typography" caption="Caveat writes, Quicksand works. Handwriting is for feelings; the rounded sans carries every piece of data.">
        <div className="paper space-y-4 p-6">
          <p className="handwritten text-5xl text-primary">Today's little things</p>
          <p className="label-caps">SECTION LABEL · 0.68rem / 0.16em</p>
          <h3 className="text-2xl text-foreground">Notebook shelf</h3>
          <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
            Body copy is Quicksand 500 at 14–16px with generous 1.7 line height, so long journal entries stay soft but
            perfectly legible on a phone at night.
          </p>
          <p className="text-xs font-semibold text-muted-foreground">Metadata · 12px · 600 · due tomorrow · 2 photos</p>
        </div>
      </Section>

      <Section index="03" title="Space, radius, shadow" caption="4pt spacing scale, pillowy radii, and shadows that read as paper lifting off paper — never material elevation.">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="paper p-5">
            <p className="label-caps mb-3">Spacing 4pt</p>
            <div className="space-y-2">
              {[4, 8, 12, 16, 24, 32].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className="h-2 rounded-full bg-primary" style={{ width: s * 2 }} />
                  <span className="text-[11px] text-muted-foreground">{s}px</span>
                </div>
              ))}
            </div>
          </div>
          <div className="paper p-5">
            <p className="label-caps mb-3">Radius</p>
            <div className="flex items-end gap-2">
              {["rounded-md", "rounded-lg", "rounded-2xl", "rounded-3xl", "rounded-full"].map((r) => (
                <div key={r} className={`h-12 w-12 bg-secondary ${r}`} />
              ))}
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">base 18px · sheets 30px · pills full</p>
          </div>
          <div className="paper p-5">
            <p className="label-caps mb-3">Shadow</p>
            <div className="space-y-3">
              <div className="rounded-xl bg-card p-3 text-xs shadow-[var(--shadow-paper)]">paper</div>
              <div className="rounded-xl bg-card p-3 text-xs shadow-[var(--shadow-lift)]">lift (dragged / open)</div>
              <div className="rounded-xl bg-card p-3 text-xs shadow-[var(--shadow-sticker)]">sticker</div>
            </div>
          </div>
        </div>
      </Section>

      <Section index="04" title="Paper & card styles" caption="Four surfaces only: sheet, slip, ruled page, grid page. Everything in the app is one of these — no generic cards.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="paper taped p-6">
            <p className="label-caps mb-1">Sheet</p>
            <p className="text-sm text-muted-foreground">Taped-down surface for sections and dialogs.</p>
          </div>
          <div className="slip flex items-start gap-3 p-4 pl-8">
            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 border-primary text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">Planner slip — a task</p>
              <p className="text-xs text-muted-foreground">left margin rule · priority tab · tiny due-date stamp</p>
            </div>
            <Sticker name="paperclip" className="ml-auto w-5 -rotate-12" />
          </div>
          <div className="paper ruled p-6">
            <p className="handwritten text-2xl text-foreground">Ruled page — note editor</p>
          </div>
          <div className="paper grid-paper p-6">
            <p className="handwritten text-2xl text-foreground">Grid page — checklists & gallery</p>
          </div>
        </div>
      </Section>

      <Section index="05" title="Iconography" caption="One custom set: 24px grid, 1.7px stroke, round caps, softly imperfect curves. No emoji anywhere in the UI.">
        <div className="paper flex flex-wrap gap-6 p-6 text-foreground">
          {[IconHome, IconTasks, IconNotes, IconFavorites, IconSearch, IconMic, IconPhoto, IconPlus].map((Icon, i) => (
            <Icon key={i} className="h-7 w-7" />
          ))}
        </div>
      </Section>

      <Section index="06" title="Mascot system" caption="One bunny, ten states. It appears only where a human would react: greetings, empty pages, completion, recording.">
        <div className="paper grid grid-cols-3 gap-4 p-6 sm:grid-cols-5">
          {moods.map((m) => (
            <figure key={m.mood} className="text-center">
              <Mascot mood={m.mood} className="mx-auto h-20 w-auto" />
              <figcaption className="mt-2 text-[11px] text-muted-foreground">{m.label}</figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <Section index="07" title="Sticker & tape system" caption="Decoration is placed, never scattered: max two per screen, always anchoring a real element.">
        <div className="paper space-y-5 p-6">
          <div className="flex flex-wrap items-center gap-5">
            {stickerNames.map((s) => (
              <Sticker key={s} name={s} className="h-12 w-auto" />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {tapes.map((t) => (
              <Sticker key={t} name={t} className="h-6 w-auto -rotate-2" />
            ))}
          </div>
        </div>
      </Section>

      <Section index="08" title="Notebook covers" caption="Notes live on a shelf. Each cover is real artwork with a fabric spine and a stitched label tab.">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {themes.slice(0, 4).map((t) => (
            <article key={t.id} className="group relative">
              <div className="relative overflow-hidden rounded-2xl shadow-[var(--shadow-lift)] transition-transform group-hover:-translate-y-1">
                <img src={t.cover} alt={`${t.name} notebook cover`} loading="lazy" className="aspect-[3/4] w-full object-cover" />
                <span className="absolute inset-y-0 left-0 w-3 bg-primary/70" />
                <span className="absolute bottom-3 left-1/2 w-[80%] -translate-x-1/2 rounded-xl border border-dashed border-primary/40 bg-card/90 px-2 py-1 text-center text-[11px] font-bold text-foreground">
                  {t.name}
                </span>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section index="09" title="Theme worlds" caption="Each theme changes paper tint, ink, accents, background atmosphere, cover art and sticker mix — tap the bar above to try one.">
        <div className="grid gap-3 sm:grid-cols-2">
          {themes.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTheme(t.id)}
              className="paper flex items-center gap-4 p-3 text-left transition-transform hover:-translate-y-0.5"
            >
              <img src={t.cover} alt="" loading="lazy" className="h-16 w-12 rounded-lg object-cover" />
              <div>
                <p className="text-sm font-bold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.note}</p>
              </div>
            </button>
          ))}
        </div>
      </Section>

      <Section index="10" title="Empty states" caption="Never a blank screen — a bunny, a handwritten line, one gentle action.">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { mood: "sleepy" as MascotMood, line: "Nothing urgent today ♡", sub: "Add one tiny thing." },
            { mood: "studying" as MascotMood, line: "Let's capture an idea.", sub: "Your notebook is waiting." },
            { mood: "confused" as MascotMood, line: "Hmm… I couldn't find that.", sub: "Try another word?" },
          ].map((e) => (
            <div key={e.mood} className="paper flex flex-col items-center p-6 text-center">
              <Mascot mood={e.mood} className="h-24 w-auto" />
              <p className="handwritten mt-3 text-2xl text-foreground">{e.line}</p>
              <p className="mt-1 text-xs text-muted-foreground">{e.sub}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section index="11" title="Navigation" caption="A stationery tab bar: five paper tabs, the active one lifts like a bookmark. Safe-area padded, 56px touch targets.">
        <div className="paper mx-auto max-w-sm p-3">
          <nav className="flex items-end justify-between">
            {[
              { Icon: IconHome, label: "Home", active: true },
              { Icon: IconTasks, label: "Tasks" },
              { Icon: IconNotes, label: "Notes" },
              { Icon: IconFavorites, label: "Saved" },
              { Icon: IconSearch, label: "Search" },
            ].map(({ Icon, label, active }) => (
              <span
                key={label}
                className={`flex w-14 flex-col items-center gap-1 rounded-2xl py-2 transition-all ${
                  active
                    ? "-translate-y-2 bg-primary text-primary-foreground shadow-[var(--shadow-sticker)]"
                    : "text-muted-foreground"
                }`}
              >
                <Icon className="h-6 w-6" />
                <span className="text-[10px] font-bold">{label}</span>
              </span>
            ))}
          </nav>
        </div>
      </Section>

      <footer className="mt-16 flex items-center justify-center gap-3">
        <Mascot mood="coffee" className="h-16 w-auto" />
        <p className="handwritten text-2xl text-muted-foreground">…ready when you are ♡</p>
      </footer>
    </main>
  );
}
