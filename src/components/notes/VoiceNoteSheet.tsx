import { useEffect, useRef, useState } from "react";

import { Mascot } from "@/components/design/Mascot";
import { Sticker } from "@/components/design/Sticker";
import { AudioRecorder } from "@/lib/focusnest/audio.js";
import { loadAttachmentUrl, removeAttachment } from "@/lib/focusnest/attachments.js";
import { createNote } from "@/lib/focusnest/notes.js";
import { formatDuration } from "@/lib/focusnest/utils.js";
import type { AttachmentRef } from "@/lib/focusnest/types";

type Phase = "idle" | "recording" | "ready";

/**
 * Voice note recorder sheet.
 * Reuses the legacy AudioRecorder (MediaRecorder) + attachments.js/IndexedDB blob store.
 * A Note is only created on Save — never when the sheet opens or recording starts.
 */
export function VoiceNoteSheet({ onClose, onSaved }: { onClose: () => void; onSaved?: (id: string) => void }) {
  const recorderRef = useRef<AudioRecorder | null>(null);
  if (!recorderRef.current) recorderRef.current = new AudioRecorder();

  const [phase, setPhase] = useState<Phase>("idle");
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [attachment, setAttachment] = useState<AttachmentRef | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const savedRef = useRef(false);

  // Discard the orphan blob if the user leaves without saving.
  useEffect(() => {
    return () => {
      recorderRef.current?.cancel();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (attachment && !savedRef.current) void removeAttachment(attachment.id).catch(() => {});
    };
  }, [attachment, previewUrl]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const start = async () => {
    setError(null);
    try {
      await recorderRef.current!.start((s) => setSeconds(s));
      setSeconds(0);
      setPhase("recording");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Recording could not start.");
    }
  };

  const stop = async () => {
    try {
      const ref = await recorderRef.current!.stop();
      if (!ref) return;
      setAttachment(ref);
      const url = await loadAttachmentUrl(ref.id);
      setPreviewUrl(url);
      setPhase("ready");
    } catch (e) {
      setError(e instanceof Error ? e.message : "The recording could not be saved.");
      setPhase("idle");
    }
  };

  const redo = async () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (attachment) await removeAttachment(attachment.id).catch(() => {});
    setPreviewUrl(null);
    setAttachment(null);
    setSeconds(0);
    setPhase("idle");
  };

  const save = () => {
    if (!attachment) return;
    savedRef.current = true;
    const note = createNote({
      title: title.trim() || `Voice note · ${formatDuration(seconds)}`,
      content: "",
      cover: "sky",
      tags: ["voice"],
      attachments: [attachment],
    });
    onSaved?.(note.id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 backdrop-blur-[2px] sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Record a voice note"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="paper relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-b-none rounded-t-3xl p-5 pb-8 sm:rounded-3xl sm:pb-5">
        <Sticker name="tape-dots" className="pointer-events-none absolute -left-4 -top-2 h-6 w-24 -rotate-6" />

        <div className="mb-3 flex items-start justify-between gap-3">
          <p className="label-caps">Voice note</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close voice note"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary/70 text-lg font-bold text-secondary-foreground active:scale-90"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col items-center rounded-3xl bg-secondary/40 px-4 py-6 text-center">
          <Mascot mood={phase === "recording" ? "recording" : "writing"} className="h-20 w-auto" />
          <p className="handwritten mt-1 text-3xl text-foreground" aria-live="polite">
            {formatDuration(seconds)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {phase === "recording" ? "listening…" : phase === "ready" ? "ready to keep ♡" : "tap record when you're ready"}
          </p>

          {phase !== "ready" ? (
            <button
              type="button"
              onClick={phase === "recording" ? stop : start}
              className={`mt-4 min-h-12 rounded-full px-7 py-3 text-sm font-bold active:scale-95 ${
                phase === "recording"
                  ? "bg-destructive text-destructive-foreground animate-pulse"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {phase === "recording" ? "Stop recording" : "Start recording"}
            </button>
          ) : null}
        </div>

        {error ? <p className="mt-3 text-center text-xs text-destructive">{error}</p> : null}

        {phase === "ready" && previewUrl ? (
          <div className="mt-4">
            <p className="label-caps mb-2">Preview</p>
            <audio controls src={previewUrl} className="w-full" />
            <label className="label-caps mt-4 block" htmlFor="voiceTitle">
              Title
            </label>
            <input
              id="voiceTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="what is this about?"
              className="mt-1 w-full rounded-2xl bg-secondary/50 px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={redo}
                className="min-h-11 rounded-full bg-secondary/70 px-4 py-2.5 text-xs font-bold text-muted-foreground active:scale-95"
              >
                Re-record
              </button>
              <button
                type="button"
                onClick={save}
                className="ml-auto min-h-11 rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground active:scale-95"
              >
                Save voice note
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
