import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Mascot } from "@/components/design/Mascot";
import { Sticker } from "@/components/design/Sticker";
import { IconMic, IconPhoto } from "@/components/design/icons";
import { AudioBubble, ImageThumbGrid, useAttachmentUrls } from "@/components/notes/Attachments";
import { updateNote, deleteNote } from "@/lib/focusnest/notes.js";
import { removeAttachment, storeFile } from "@/lib/focusnest/attachments.js";
import { AudioRecorder } from "@/lib/focusnest/audio.js";
import { parseTags, formatDateTime, formatDuration } from "@/lib/focusnest/utils.js";
import type { AttachmentRef, Note } from "@/lib/focusnest/types";

const COVERS: Array<[string, string]> = [
  ["blush", "Blush"],
  ["sky", "Sky"],
  ["lavender", "Dream"],
  ["cream", "Ribbon"],
  ["berry", "Berry"],
];

/**
 * Full note editor sheet.
 * All persistence goes through the legacy notes.js / attachments.js / audio.js
 * modules — no new storage layer.
 */
export function NoteEditorSheet({ note, onClose }: { note: Note; onClose: () => void }) {
  const [title, setTitle] = useState(note.title);
  const [tags, setTags] = useState((note.tags ?? []).join(", "));
  const [cover, setCover] = useState(note.cover || "blush");
  const [pinned, setPinned] = useState(Boolean(note.pinned));
  const [favorite, setFavorite] = useState(Boolean(note.favorite));
  const [attachments, setAttachments] = useState<AttachmentRef[]>(note.attachments ?? []);
  const [dirty, setDirty] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);

  const contentRef = useRef<HTMLDivElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const savedRef = useRef(false);
  // Attachment ids removed in this session — blobs are only dropped on save.
  const trashRef = useRef<string[]>([]);
  // Attachment ids added in this session — blobs are dropped if the user bails.
  const addedRef = useRef<string[]>([]);

  const urls = useAttachmentUrls(attachments);
  const images = useMemo(() => attachments.filter((a) => a.type === "image"), [attachments]);
  const audios = useMemo(() => attachments.filter((a) => a.type === "audio"), [attachments]);

  const touch = () => setDirty(true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty]);

  // Drop orphaned new blobs if the sheet closes without saving.
  useEffect(() => {
    return () => {
      recorderRef.current?.cancel();
      if (!savedRef.current) {
        addedRef.current.forEach((id) => void removeAttachment(id).catch(() => {}));
      }
    };
  }, []);

  const requestClose = () => {
    if (dirty) setConfirmClose(true);
    else onClose();
  };

  const addImage = async (file?: File | null) => {
    if (!file) return;
    setError(null);
    setBusy("image");
    try {
      const ref = await storeFile(file, "image");
      addedRef.current.push(ref.id);
      setAttachments((prev) => [...prev, ref]);
      touch();
    } catch (e) {
      setError(e instanceof Error ? e.message : "That image could not be added.");
    } finally {
      setBusy(null);
    }
  };

  const startRec = async () => {
    setError(null);
    if (!recorderRef.current) recorderRef.current = new AudioRecorder();
    try {
      await recorderRef.current.start((s) => setRecSeconds(s));
      setRecSeconds(0);
      setRecording(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Recording could not start.");
    }
  };

  const stopRec = async () => {
    try {
      const ref = await recorderRef.current?.stop();
      setRecording(false);
      if (!ref) return;
      addedRef.current.push(ref.id);
      setAttachments((prev) => [...prev, ref]);
      touch();
    } catch (e) {
      setRecording(false);
      setError(e instanceof Error ? e.message : "The recording could not be saved.");
    }
  };

  const dropAttachment = (a: AttachmentRef) => {
    trashRef.current.push(a.id);
    setAttachments((prev) => prev.filter((x) => x.id !== a.id));
    touch();
  };

  const save = () => {
    const clean = title.trim();
    if (!clean) {
      setError("Your page needs a little name.");
      return;
    }
    savedRef.current = true;
    updateNote(note.id, {
      title: clean,
      content: contentRef.current?.innerHTML ?? note.content,
      tags: parseTags(tags),
      cover,
      pinned,
      favorite,
      attachments,
    });
    // Now it is safe to delete blobs the user removed.
    trashRef.current.forEach((id) => void removeAttachment(id).catch(() => {}));
    onClose();
  };

  const remove = async () => {
    savedRef.current = true;
    await deleteNote(note.id);
    onClose();
  };

  const sheet = (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 backdrop-blur-[2px] sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Note: ${note.title || "Little note"}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) requestClose();
      }}
    >
      <div className="paper relative max-h-[92vh] w-full max-w-lg overflow-y-auto overflow-x-hidden rounded-b-none rounded-t-3xl p-5 pb-8 sm:rounded-3xl sm:pb-5">
        <Sticker name="tape-dots" className="pointer-events-none absolute -left-4 -top-2 h-6 w-24 -rotate-6" />

        <div className="mb-3 flex items-start justify-between gap-3">
          <p className="label-caps">Note page</p>
          <button
            type="button"
            onClick={requestClose}
            aria-label="Close note"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary/70 text-lg font-bold text-secondary-foreground active:scale-90"
          >
            ×
          </button>
        </div>

        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            touch();
          }}
          maxLength={160}
          placeholder="Give your idea a beautiful name…"
          className="handwritten w-full break-words bg-transparent text-3xl text-foreground outline-none placeholder:text-muted-foreground"
        />
        <p className="mt-0.5 text-[10px] text-muted-foreground">
          Edited {formatDateTime(note.updatedAt)}
          {dirty ? " · unsaved changes" : ""}
        </p>

        <div
          ref={contentRef}
          contentEditable
          suppressContentEditableWarning
          onInput={touch}
          role="textbox"
          aria-multiline="true"
          aria-label="Note content"
          dangerouslySetInnerHTML={{ __html: note.content || "" }}
          className="ruled mt-3 min-h-32 overflow-wrap-anywhere break-words rounded-2xl bg-card/60 p-3 text-sm leading-7 text-foreground outline-none focus:ring-2 focus:ring-primary/40"
        />

        {/* Attachment tools */}
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              void addImage(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex min-h-11 items-center gap-2 rounded-full bg-secondary/70 px-4 text-xs font-bold text-secondary-foreground active:scale-95"
          >
            <IconPhoto className="h-4 w-4" />
            {busy === "image" ? "Adding…" : "Add photo"}
          </button>
          <button
            type="button"
            onClick={recording ? stopRec : startRec}
            className={`flex min-h-11 items-center gap-2 rounded-full px-4 text-xs font-bold active:scale-95 ${
              recording ? "animate-pulse bg-destructive text-destructive-foreground" : "bg-secondary/70 text-secondary-foreground"
            }`}
          >
            <IconMic className="h-4 w-4" />
            {recording ? `Stop · ${formatDuration(recSeconds)}` : "Record voice"}
          </button>
        </div>

        {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}

        {/* Attachments */}
        <div className="mt-4">
          <p className="label-caps mb-2">Attachments</p>
          {attachments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-primary/30 bg-secondary/30 p-4 text-center">
              <p className="handwritten text-xl text-foreground">nothing tucked in yet</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Add a photo or record a little voice memo.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <ImageThumbGrid images={images} urls={urls} onRemove={dropAttachment} />
              {audios.map((a) => (
                <AudioBubble key={a.id} attachment={a} url={urls[a.id]} onRemove={dropAttachment} />
              ))}
            </div>
          )}
        </div>

        <div className="mt-4">
          <p className="label-caps mb-2">Notebook style</p>
          <div className="flex flex-wrap gap-2">
            {COVERS.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setCover(value);
                  touch();
                }}
                aria-pressed={cover === value}
                className={`min-h-11 rounded-full px-4 text-xs font-bold transition-transform active:scale-95 ${
                  cover === value
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/70 text-secondary-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <label className="label-caps mt-4 block" htmlFor="noteTags">
          Tags
        </label>
        <input
          id="noteTags"
          value={tags}
          onChange={(e) => {
            setTags(e.target.value);
            touch();
          }}
          placeholder="idea, project, study"
          className="mt-1 w-full rounded-2xl bg-secondary/50 px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />

        <div className="mt-3 flex flex-wrap gap-2">
          <Toggle
            on={pinned}
            onClick={() => {
              setPinned((v) => !v);
              touch();
            }}
            label="Pinned"
          />
          <Toggle
            on={favorite}
            onClick={() => {
              setFavorite((v) => !v);
              touch();
            }}
            label="Favorite"
          />
        </div>

        <div className="mt-5 flex items-center gap-2">
          <Mascot mood="writing" className="pointer-events-none h-12 w-auto" />
          <button
            type="button"
            onClick={remove}
            className="ml-auto min-h-11 rounded-full bg-secondary/70 px-4 text-xs font-bold text-muted-foreground active:scale-95"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={save}
            className="min-h-11 rounded-full bg-primary px-5 text-xs font-bold text-primary-foreground active:scale-95"
          >
            Save changes
          </button>
        </div>

        {confirmClose ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-t-3xl bg-foreground/40 p-5 sm:rounded-3xl">
            <div className="paper w-full max-w-xs p-4 text-center">
              <p className="handwritten text-2xl text-foreground">Leave without saving?</p>
              <p className="mt-1 text-xs text-muted-foreground">Your little edits will be lost.</p>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmClose(false)}
                  className="min-h-11 flex-1 rounded-full bg-secondary/70 px-3 text-xs font-bold text-secondary-foreground active:scale-95"
                >
                  Keep editing
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-11 flex-1 rounded-full bg-primary px-3 text-xs font-bold text-primary-foreground active:scale-95"
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(sheet, document.body);
}

function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`min-h-11 rounded-full px-4 text-xs font-bold transition-transform active:scale-95 ${
        on ? "bg-accent text-accent-foreground" : "bg-secondary/70 text-secondary-foreground"
      }`}
    >
      {on ? "♥ " : "○ "}
      {label}
    </button>
  );
}
