import celebrating from "@/assets/mascot/celebrating.png";
import coffee from "@/assets/mascot/coffee.png";
import confused from "@/assets/mascot/confused.png";
import heart from "@/assets/mascot/heart.png";
import recording from "@/assets/mascot/recording.png";
import sleepy from "@/assets/mascot/sleepy.png";
import studying from "@/assets/mascot/studying.png";
import thinking from "@/assets/mascot/thinking.png";
import waving from "@/assets/mascot/waving.png";
import writing from "@/assets/mascot/writing.png";

export const mascots = {
  waving,
  sleepy,
  writing,
  celebrating,
  thinking,
  coffee,
  heart,
  recording,
  confused,
  studying,
} as const;

export type MascotMood = keyof typeof mascots;

export function Mascot({
  mood,
  className = "",
  alt,
  float = false,
}: {
  mood: MascotMood;
  className?: string;
  alt?: string;
  float?: boolean;
}) {
  return (
    <img
      src={mascots[mood]}
      alt={alt ?? ""}
      aria-hidden={alt ? undefined : true}
      loading="lazy"
      draggable={false}
      className={`sticker select-none ${float ? "animate-float" : ""} ${className}`}
    />
  );
}
