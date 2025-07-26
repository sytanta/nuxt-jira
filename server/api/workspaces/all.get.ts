import { Query } from "node-appwrite";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const databases = event.context.databases;
  const user = event.context.user;

  if (!user) throw createError({ status: 401, statusText: "Unauthorized" });

  const memberships = await databases?.listDocuments(
    config.public.appwriteDatabaseId,
    config.public.appwriteMembersId,
    [Query.equal("user_id", user.$id)],
  );

  if (!memberships?.total)
    return { workspaces: [], memberships: memberships?.documents ?? [] };

  const workspaces = await databases?.listDocuments(
    config.public.appwriteDatabaseId,
    config.public.appwriteWorkspacesId,
    [
      Query.contains(
        "$id",
        (memberships?.documents ?? []).map(({ workspace_id }) => workspace_id),
      ),
      Query.orderDesc("$createdAt"),
    ],
  );

  return {
    workspaces: workspaces?.documents ?? [],
    memberships: memberships?.documents,
  };
});
