import { Query } from "node-appwrite";

import { createAdminClient } from "~/server/lib/appwrite";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const databases = event.context.databases;
  const user = event.context.user;

  if (!user) throw createError({ status: 401, statusText: "Unauthorized" });

  const { taskId } = getRouterParams(event);

  const task = await databases?.getDocument(
    config.public.appwriteDatabaseId,
    config.public.appwriteTasksId,
    taskId,
  );
  if (!task) throw createError({ status: 404, statusText: "Task not found" });

  const membership = await databases?.listDocuments(
    config.public.appwriteDatabaseId,
    config.public.appwriteMembersId,
    [
      Query.equal("user_id", user.$id),
      Query.equal("workspace_id", task.workspace_id),
    ],
  );
  if (!membership?.total)
    throw createError({ status: 401, statusText: "Unauthorized" });

  const { users } = createAdminClient();

  const [project, assigneeMembership, assignee] = await Promise.all([
    databases?.getDocument(
      config.public.appwriteDatabaseId,
      config.public.appwriteProjectsId,
      task.project_id,
    ),
    databases?.listDocuments(
      config.public.appwriteDatabaseId,
      config.public.appwriteMembersId,
      [
        Query.equal("user_id", task.assignee_id),
        Query.equal("workspace_id", task.workspace_id),
      ],
    ),
    users.get(task.assignee_id),
  ]);

  return {
    task: {
      ...task,
      project,
      assignee: {
        $id: assignee.$id,
        name: assignee.name,
        email: assignee.email,
        membership_id: assigneeMembership?.documents[0]?.$id,
      },
    },
  };
});
