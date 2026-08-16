import type { SVGProps } from "react";

/**
 * FocusNest icon style: 24px grid, 1.7px stroke, round caps/joins,
 * hand-drawn softness (slightly uneven curves), one optional filled accent dot.
 */
const base = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function IconHome(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M3.6 10.6 12 3.8l8.4 6.8" />
      <path d="M5.4 10v8.2c0 1 .8 1.8 1.8 1.8h9.6c1 0 1.8-.8 1.8-1.8V10" />
      <path d="M10 20v-4.4c0-.9.9-1.6 2-1.6s2 .7 2 1.6V20" />
    </svg>
  );
}

export function IconTasks(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M5.6 3.8h12.8c.7 0 1.2.6 1.2 1.3v13.8c0 .7-.5 1.3-1.2 1.3H5.6c-.7 0-1.2-.6-1.2-1.3V5.1c0-.7.5-1.3 1.2-1.3Z" />
      <path d="m7.8 9.2 1.7 1.7 3-3.4" />
      <path d="M13.6 15.4h3.1" />
      <path d="M7.6 15.4h2.4" />
    </svg>
  );
}

export function IconNotes(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M4.4 5.2c2.6-1.1 5.1-1.1 7.6.4 2.5-1.5 5-1.5 7.6-.4v12.6c-2.6-1.1-5.1-1.1-7.6.4-2.5-1.5-5-1.5-7.6-.4V5.2Z" />
      <path d="M12 5.6v12.6" />
    </svg>
  );
}

export function IconFavorites(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M12 19.6c-3.7-2.4-7-5-7-8.4A3.9 3.9 0 0 1 12 8.6a3.9 3.9 0 0 1 7 2.6c0 3.4-3.3 6-7 8.4Z" />
    </svg>
  );
}

export function IconSearch(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <circle cx="10.8" cy="10.6" r="5.6" />
      <path d="m15.2 15 4.2 4.4" />
    </svg>
  );
}

export function IconMic(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <rect x="9.2" y="3.4" width="5.6" height="10" rx="2.8" />
      <path d="M5.8 11.4a6.2 6.2 0 0 0 12.4 0" />
      <path d="M12 17.6V20.4" />
    </svg>
  );
}

export function IconPhoto(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <rect x="3.6" y="5.4" width="16.8" height="13.2" rx="2.6" />
      <path d="m4.6 16.2 4-4.2 3.4 3 2.6-2.4 4.8 4.2" />
      <circle cx="8.6" cy="9.6" r="1.2" />
    </svg>
  );
}

export function IconPlus(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M12 5.2v13.6M5.2 12h13.6" />
    </svg>
  );
}
