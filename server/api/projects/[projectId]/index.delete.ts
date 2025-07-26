import { Query } from "node-appwrite";

import { MEMBER_ROLE } from "~/lib/constant";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const databases = event.context.databases;
  const storage = event.context.storage;
  const user = event.context.user;

  if (!user) throw createError({ status: 401, statusText: "Unauthorized" });

  const { workspaceId } = await readBody(event);
  const { projectId } = getRouterParams(event);

  // Only admin can delete projects
  const memberships = await databases?.listDocuments(
    config.public.appwriteDatabaseId,
    config.public.appwriteMembersId,
    [
      Query.equal("user_id", user.$id),
      Query.equal("workspace_id", workspaceId),
      Query.equal("role", MEMBER_ROLE.admin),
    ],
  );
  if (!memberships?.total)
    throw createError({ status: 401, statusText: "Unauthorized" });

  const project = await databases?.getDocument(
    config.public.appwriteDatabaseId,
    config.public.appwriteProjectsId,
    projectId,
  );
  if (!project)
    throw createError({ status: 404, statusText: "Project not found" });

  await Promise.all([
    // Delete image
    project?.image_storage_id &&
      storage?.deleteFile(
        config.public.appwriteImagesBucketId,
        project.image_storage_id,
      ),
    // Delete project
    databases?.deleteDocument(
      config.public.appwriteDatabaseId,
      config.public.appwriteProjectsId,
      projectId,
    ),
  ]);

  return { ok: true };
});
