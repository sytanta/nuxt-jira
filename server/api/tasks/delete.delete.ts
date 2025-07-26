import { Query } from "node-appwrite";

import { MEMBER_ROLE } from "~/lib/constant";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const databases = event.context.databases;
  const user = event.context.user;

  if (!user) throw createError({ status: 401, statusText: "Unauthorized" });

  const { taskId } = await readBody(event);
  if (!taskId)
    throw createError({ status: 400, statusText: "Task ID required" });

  const task = await databases?.getDocument(
    config.public.appwriteDatabaseId,
    config.public.appwriteTasksId,
    taskId,
  );
  if (!task) throw createError({ status: 404, statusText: "Task not found" });

  // Only admin can delete task
  const membership = await databases?.listDocuments(
    config.public.appwriteDatabaseId,
    config.public.appwriteMembersId,
    [
      Query.equal("user_id", user.$id),
      Query.equal("workspace_id", task.workspace_id),
      Query.equal("role", MEMBER_ROLE.admin),
    ],
  );
  if (!membership?.total)
    throw createError({ status: 401, statusText: "Unauthorized" });

  await databases?.deleteDocument(
    config.public.appwriteDatabaseId,
    config.public.appwriteTasksId,
    taskId,
  );

  return { ok: true };
});
