import { Query } from "node-appwrite";
import { H3Event } from "h3";

import { CreateTasksSchema } from "~/lib/schema/createTask";
import { TaskStatus } from "~/lib/types";

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) throw createError({ status: 401, statusText: "Unauthorized" });

  const data: { id: string; data: any }[] = await readBody(event);

  const result = await Promise.all(
    data.map(({ id, data }) => updateSingleTask(event, id, data)),
  );

  return { ok: !!result.filter(Boolean).length };
});

async function updateSingleTask(
  event: H3Event,
  taskId: string,
  updatedData: any,
) {
  const config = useRuntimeConfig(event);
  const user = event.context.user!;
  const databases = event.context.databases;

  const existingTask = await databases?.getDocument(
    config.public.appwriteDatabaseId,
    config.public.appwriteTasksId,
    taskId,
  );
  if (!existingTask) return;

  // Parse request data
  const params = CreateTasksSchema.partial().safeParse(updatedData);

  if (params.success) {
    const [userMembership, assigneeMembership, project] = await Promise.all([
      databases?.listDocuments(
        config.public.appwriteDatabaseId,
        config.public.appwriteMembersId,
        [
          Query.equal("user_id", user.$id),
          Query.equal("workspace_id", existingTask.workspace_id),
        ],
      ),
      params.data.assignee_id
        ? databases?.listDocuments(
            config.public.appwriteDatabaseId,
            config.public.appwriteMembersId,
            [
              Query.equal("user_id", params.data.assignee_id), // "assignee_id" is "Models.User.$id"
              Query.equal("workspace_id", existingTask.workspace_id),
            ],
          )
        : { total: 1 },
      params.data.project_id
        ? databases?.getDocument(
            config.public.appwriteDatabaseId,
            config.public.appwriteProjectsId,
            params.data.project_id,
          )
        : {},
    ]);

    if (!userMembership?.total || !assigneeMembership?.total || !project)
      return;

    const {
      name,
      project_id,
      status,
      due_date,
      assignee_id,
      description,
      position,
    } = params.data;
    const updatedData: {
      name?: string;
      project_id?: string;
      status?: TaskStatus;
      due_date?: string;
      assignee_id?: string;
      description?: string;
      position?: number;
    } = {};
    if (name) updatedData.name = name;
    if (project_id) updatedData.project_id = project_id;
    if (status) updatedData.status = status;
    if (due_date) updatedData.due_date = due_date.toISOString();
    if (assignee_id) updatedData.assignee_id = assignee_id;
    if (description != undefined) updatedData.description = description;
    if (position != undefined) updatedData.position = position;

    // Update task
    await databases?.updateDocument(
      config.public.appwriteDatabaseId,
      config.public.appwriteTasksId,
      existingTask.$id,
      updatedData,
    );

    return true;
  }
}
