import { Query } from "node-appwrite";

import { MEMBER_ROLE } from "~/lib/constant";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const databases = event.context.databases;
  const user = event.context.user;

  if (!user) throw createError({ status: 401, statusText: "Unauthorized" });

  const { workspaceId } = getRouterParams(event);

  // Only members can view workspace
  const memberships = await databases?.listDocuments(
    config.public.appwriteDatabaseId,
    config.public.appwriteMembersId,
    [
      Query.equal("user_id", user.$id),
      Query.equal("workspace_id", workspaceId),
    ],
  );
  if (!memberships?.total)
    throw createError({ status: 401, statusText: "Unauthorized" });

  const workspace = await databases?.getDocument(
    config.public.appwriteDatabaseId,
    config.public.appwriteWorkspacesId,
    workspaceId,
  );
  if (!workspace)
    throw createError({ status: 404, statusText: "Workspace not found" });

  return {
    workspace,
    is_owner: workspace.user_id === user.$id,
    is_admin: memberships.documents[0].role === MEMBER_ROLE.admin,
  };
});
