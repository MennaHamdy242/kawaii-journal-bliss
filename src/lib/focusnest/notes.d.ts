import type { Note } from "./types";

export function createNote(payload: Partial<Note> & { title: string }): Note;
export function updateNote(id: string, patch: Partial<Note>): void;
export function deleteNote(id: string): Promise<void>;
export function noteMarkup(note: Note): string;
