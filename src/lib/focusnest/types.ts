export type Priority = "low" | "medium" | "high";

export interface AttachmentRef {
  id: string;
  type: "image" | "audio";
  name: string;
  mimeType: string;
  size: number;
  duration?: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  important: boolean;
  favorite: boolean;
  priority: Priority;
  dueDate: string;
  tags: string[];
  attachments: AttachmentRef[];
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItem {
  id?: string;
  text: string;
  done: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  attachments: AttachmentRef[];
  cover: string;
  pinned: boolean;
  favorite: boolean;
  checklist: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  demoSeeded: boolean;
  theme: string;
  skin: string;
  focusSessions: number;
  focusStreak: number;
  lastFocusDate: string;
  soundOn: boolean;
  compactMode: boolean;
  [key: string]: unknown;
}

export interface AppData {
  tasks: Task[];
  notes: Note[];
  settings: Settings;
}
