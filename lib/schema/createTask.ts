import * as z from "zod";

import { TaskStatus } from "../types";

export const CreateTasksSchema = z.object({
  name: z.string().trim().min(1, "Required"),
  workspace_id: z.string().trim().min(1, "Required"),
  project_id: z.string().trim().min(1, "Required"),
  status: z.nativeEnum(TaskStatus, { required_error: "Required" }),
  due_date: z.coerce.date(),
  assignee_id: z.string().trim().min(1, "Required"),
  description: z.string().optional(),
  position: z.number().optional(),
});
