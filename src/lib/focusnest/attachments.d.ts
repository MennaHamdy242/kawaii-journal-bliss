import type { AttachmentRef } from "./types";

export function compressImage(file: File, maxDimension?: number, quality?: number): Promise<Blob | File>;
export function storeFile(
  file: File | Blob,
  kind: "image" | "audio",
  extra?: Record<string, unknown>,
): Promise<AttachmentRef>;
export function loadAttachmentUrl(id: string): Promise<string | null>;
export function removeAttachment(id: string): Promise<void>;
export function cleanupAttachments(attachments?: AttachmentRef[]): Promise<void>;
