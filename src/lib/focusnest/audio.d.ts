import type { AttachmentRef } from "./types";

export class AudioRecorder {
  supported(): boolean;
  start(onTick?: (seconds: number) => void): Promise<void>;
  stop(): Promise<AttachmentRef | null>;
  cancel(): void;
  cleanup(): void;
}

export function audioAttachmentMarkup(attachment: AttachmentRef): string;
export function setRecordingText(el: HTMLElement | null, seconds?: number): void;
