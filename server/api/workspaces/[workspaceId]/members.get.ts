import { Query } from "node-appwrite";

import { createAdminClient } from "~/server/lib/appwrite";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const databases = event.context.databases;
  const user = event.context.user;

  if (!user) throw createError({ status: 401, statusText: "Unauthorized" });

  const { workspaceId } = getRouterParams(event);

  const workspace = await databases?.getDocument(
    config.public.appwriteDatabaseId,
    config.public.appwriteWorkspacesId,
    workspaceId,
  );
  if (!workspace)
    throw createError({ status: 404, statusText: "Workspace not found" });

  const memberships = await databases?.listDocuments(
    config.public.appwriteDatabaseId,
    config.public.appwriteMembersId,
    [Query.equal("workspace_id", workspaceId)],
  );

  // Check if user is a member
  const userMembership = memberships?.documents.find(
    ({ user_id }) => user_id === user.$id,
  );
  if (!userMembership)
    throw createError({ status: 401, statusText: "Unauthorized" });

  // Get members' user data
  const { users } = createAdminClient();

  const members = await Promise.all(
    (memberships?.documents ?? []).map(async ({ user_id }, index) => {
      const user = await users.get(user_id);

      return {
        $id: user.$id,
        name: user.name,
        email: user.email,
        membership_id: memberships?.documents[index].$id,
        role: memberships?.documents[index].role as string,
        is_owner: workspace.user_id === user.$id,
      };
    }),
  );

  return { members };
});
