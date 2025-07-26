import { Models, Query } from "node-appwrite";

import { TaskStatus } from "~/lib/types";
import { createAdminClient } from "~/server/lib/appwrite";
import { CreateTasksSchema } from "~/lib/schema/createTask";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const databases = event.context.databases;
  const user = event.context.user;

  if (!user) throw createError({ status: 401, statusText: "Unauthorized" });

  const { taskId } = getRouterParams(event);

  const existingTask = await databases?.getDocument(
    config.public.appwriteDatabaseId,
    config.public.appwriteTasksId,
    taskId,
  );
  if (!existingTask)
    throw createError({ status: 404, statusText: "Task not found" });

  // Parse request data
  const params = await readValidatedBody(event, (body) =>
    CreateTasksSchema.partial().safeParse(body),
  );

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

    if (!userMembership?.total)
      throw createError({ status: 401, statusText: "Unauthorized" });
    if (!assigneeMembership?.total)
      throw createError({ status: 400, statusText: "Unauthorized assignee" });
    if (!project)
      throw createError({ status: 400, statusText: "Project not found" });

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
    const updatedTask = await databases?.updateDocument(
      config.public.appwriteDatabaseId,
      config.public.appwriteTasksId,
      existingTask.$id,
      updatedData,
    );

    const { users } = createAdminClient();

    const [newProject, assignee]: [
      Models.Document | undefined,
      Models.User<Models.Preferences> | undefined,
    ] = await Promise.all([
      databases?.getDocument(
        config.public.appwriteDatabaseId,
        config.public.appwriteProjectsId,
        updatedTask!.project_id,
      ),
      users.get(updatedTask!.assignee_id),
    ]);

    return {
      task: {
        ...updatedTask,
        project: newProject,
        assignee: {
          $id: assignee.$id,
          name: assignee.name,
          emal: assignee.email,
        },
      },
    };
  } else {
    throw createError({
      status: 400,
      statusText: params.error.message,
    });
  }
});
