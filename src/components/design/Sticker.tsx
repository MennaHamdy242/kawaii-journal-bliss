import bow from "@/assets/stickers/bow.png";
import cloud from "@/assets/stickers/cloud.png";
import heart from "@/assets/stickers/heart.png";
import moon from "@/assets/stickers/moon.png";
import paperclip from "@/assets/stickers/paperclip.png";
import ribbon from "@/assets/stickers/ribbon.png";
import sakura from "@/assets/stickers/sakura.png";
import star from "@/assets/stickers/star.png";
import strawberry from "@/assets/stickers/strawberry.png";
import tapeDots from "@/assets/stickers/tape-dots.png";
import tapeFloral from "@/assets/stickers/tape-floral.png";
import tapeGingham from "@/assets/stickers/tape-gingham.png";
import tapeGrid from "@/assets/stickers/tape-grid.png";
import tapeLace from "@/assets/stickers/tape-lace.png";

export const stickers = {
  bow,
  cloud,
  heart,
  moon,
  paperclip,
  ribbon,
  sakura,
  star,
  strawberry,
  "tape-dots": tapeDots,
  "tape-floral": tapeFloral,
  "tape-gingham": tapeGingham,
  "tape-grid": tapeGrid,
  "tape-lace": tapeLace,
} as const;

export type StickerName = keyof typeof stickers;

export function Sticker({
  name,
  className = "",
  alt = "",
}: {
  name: StickerName;
  className?: string;
  alt?: string;
}) {
  return (
    <img
      src={stickers[name]}
      alt={alt}
      aria-hidden={alt === "" || undefined}
      loading="lazy"
      className={`sticker select-none ${className}`}
      draggable={false}
    />
  );
}
