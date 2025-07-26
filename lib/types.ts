import type { Models } from "node-appwrite";

export type MemberRole = "admin" | "member";

export enum TaskStatus {
  Backlog = "BACKLOG",
  Todo = "TODO",
  "In Progress" = "IN_PROGRESS",
  "In Review" = "IN_REVIEW",
  Done = "DONE",
}

export type Task = Models.Document & {
  name: string;
  workspace_id: string;
  project_id: string;
  status: TaskStatus;
  due_date: string;
  assignee_id: string;
  description?: string;
};

export type FilteredTask = Models.Document & {
  name: string;
  workspace_id: string;
  project_id: string;
  status: TaskStatus;
  due_date: string;
  assignee_id: string;
  description?: string;
  project: Models.Document;
  assignee: { $id: string; name: string; email: string };
};

export type TaskSuccessSubscriber = ((task: FilteredTask) => void) | null;
export type CreateTaskInject = {
  createTaskSuccessSubsribers: TaskSuccessSubscriber[];
  subscribeToCreateTaskSuccess: (
    func: (task: FilteredTask) => void,
  ) => () => void;
};
export type UpdateTaskInject = {
  updateTaskSuccessSubsribers: TaskSuccessSubscriber[];
  subscribeToUpdateTaskSuccess: (
    func: (task: FilteredTask) => void,
  ) => () => void;
};
export type DeleteTaskInject = {
  deleteTaskSuccessSubsribers: (((taskId: string) => void) | null)[];
  subscribeToDeleteTaskSuccess: (func: (taskId: string) => void) => () => void;
};
