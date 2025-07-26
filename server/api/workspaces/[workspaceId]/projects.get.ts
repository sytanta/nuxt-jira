import { Query } from "node-appwrite";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const databases = event.context.databases;
  const user = event.context.user;

  if (!user) throw createError({ status: 401, statusText: "Unauthorized" });

  const { workspaceId } = getRouterParams(event);

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

  const projects = await databases?.listDocuments(
    config.public.appwriteDatabaseId,
    config.public.appwriteProjectsId,
    [Query.equal("workspace_id", workspaceId), Query.orderDesc("$createdAt")],
  );

  return {
    projects: projects?.documents ?? [],
  };
});
