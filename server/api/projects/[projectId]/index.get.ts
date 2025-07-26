import { Query } from "node-appwrite";

import { MEMBER_ROLE } from "~/lib/constant";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const databases = event.context.databases;
  const user = event.context.user;

  if (!user) throw createError({ status: 401, statusText: "Unauthorized" });

  const { projectId } = getRouterParams(event);

  const project = await databases?.getDocument(
    config.public.appwriteDatabaseId,
    config.public.appwriteProjectsId,
    projectId,
  );
  if (!project)
    throw createError({ status: 404, statusText: "Project not found" });

  const [workspace, membership] = await Promise.all([
    databases?.getDocument(
      config.public.appwriteDatabaseId,
      config.public.appwriteWorkspacesId,
      project.workspace_id,
    ),
    databases?.listDocuments(
      config.public.appwriteDatabaseId,
      config.public.appwriteMembersId,
      [
        Query.equal("user_id", user.$id),
        Query.equal("workspace_id", project.workspace_id),
      ],
    ),
  ]);

  if (!workspace)
    throw createError({ status: 404, statusText: "Workspace not found" });
  if (!membership?.total)
    throw createError({ status: 401, statusText: "Unauthorized" });

  return {
    project,
    is_owner: workspace.user_id === user.$id,
    is_admin: membership.documents[0].role === MEMBER_ROLE.admin,
  };
});
