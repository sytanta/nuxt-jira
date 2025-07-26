import { ID, Query } from "node-appwrite";

import { CreateTasksSchema } from "~/lib/schema/createTask";
import { createAdminClient } from "~/server/lib/appwrite";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const databases = event.context.databases;
  const user = event.context.user;

  if (!user) throw createError({ status: 401, statusText: "Unauthorized" });

  // Parse request data
  const params = await readValidatedBody(event, (body) =>
    CreateTasksSchema.safeParse(body),
  );

  if (params.success) {
    const { users } = createAdminClient();

    const [
      userMembership,
      assigneeMembership,
      assignee,
      workspace,
      project,
      highestPositionTask,
    ] = await Promise.all([
      databases?.listDocuments(
        config.public.appwriteDatabaseId,
        config.public.appwriteMembersId,
        [
          Query.equal("user_id", user.$id),
          Query.equal("workspace_id", params.data.workspace_id),
        ],
      ),
      databases?.listDocuments(
        config.public.appwriteDatabaseId,
        config.public.appwriteMembersId,
        [
          Query.equal("user_id", params.data.assignee_id), // "assignee_id" is "Models.User.$id"
          Query.equal("workspace_id", params.data.workspace_id),
        ],
      ),
      users.get(params.data.assignee_id),
      databases?.getDocument(
        config.public.appwriteDatabaseId,
        config.public.appwriteWorkspacesId,
        params.data.workspace_id,
      ),
      databases?.getDocument(
        config.public.appwriteDatabaseId,
        config.public.appwriteProjectsId,
        params.data.project_id,
      ),
      databases?.listDocuments(
        config.public.appwriteDatabaseId,
        config.public.appwriteTasksId,
        [
          Query.equal("status", params.data.status),
          Query.equal("workspace_id", params.data.workspace_id),
          Query.orderDesc("position"),
          Query.limit(1),
        ],
      ),
    ]);

    if (!userMembership?.total)
      throw createError({ status: 401, statusText: "Unauthorized" });
    if (!assigneeMembership?.total)
      throw createError({ status: 400, statusText: "Unauthorized assignee" });
    if (!workspace)
      throw createError({ status: 400, statusText: "Workspace not found" });
    if (!project)
      throw createError({ status: 400, statusText: "Project not found" });

    const position = (highestPositionTask?.documents[0]?.position ?? 1000) + 1;

    // Create task
    const task = await databases?.createDocument(
      config.public.appwriteDatabaseId,
      config.public.appwriteTasksId,
      ID.unique(),
      { ...params.data, position },
    );

    return {
      task: {
        ...task,
        workspace_id: workspace.$id,
        project_id: project.$id,
        project,
        assignee: {
          $id: user.$id,
          name: user.name,
          email: user.email,
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
