import type { Task } from "./types";

export function createTask(payload: Partial<Task> & { title: string }): Task;
export function updateTask(id: string, patch: Partial<Task>): void;
export function deleteTask(id: string): Promise<void>;
export function toggleTaskComplete(id: string): void;
export function filterAndSortTasks(tasks: Task[], filter: string, sort: string): Task[];
export function taskMarkup(task: Task, attachmentSummary?: string): string;
export function taskAttachmentPreview(task: Task, renderedAttachments?: string): string;
