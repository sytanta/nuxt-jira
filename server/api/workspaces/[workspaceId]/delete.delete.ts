import { Query } from "node-appwrite";

import { MEMBER_ROLE } from "~/lib/constant";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const databases = event.context.databases;
  const storage = event.context.storage;
  const user = event.context.user;

  if (!user) throw createError({ status: 401, statusText: "Unauthorized" });

  const { workspaceId } = getRouterParams(event);

  // Only admin can delete workspace
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

  const existingWorkspace = await databases?.getDocument(
    config.public.appwriteDatabaseId,
    config.public.appwriteWorkspacesId,
    workspaceId,
  );

  await Promise.all([
    // Delete memberships
    ...memberships.documents.map(({ $id }) =>
      databases?.deleteDocument(
        config.public.appwriteDatabaseId,
        config.public.appwriteMembersId,
        $id,
      ),
    ),
    // Delete image
    existingWorkspace?.image_storage_id &&
      storage?.deleteFile(
        config.public.appwriteImagesBucketId,
        existingWorkspace.image_storage_id,
      ),
    // Delete workspace
    databases?.deleteDocument(
      config.public.appwriteDatabaseId,
      config.public.appwriteWorkspacesId,
      workspaceId,
    ),
  ]);

  return { ok: true };
});
