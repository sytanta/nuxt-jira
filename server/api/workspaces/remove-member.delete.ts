import { Query } from "node-appwrite";

import { MEMBER_ROLE } from "~/lib/constant";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const databases = event.context.databases;
  const user = event.context.user;

  if (!user) throw createError({ status: 401, statusText: "Unauthorized" });

  const { membershipId } = await readBody(event);

  if (!membershipId)
    throw createError({ status: 400, statusText: "Member ID required" });

  const membershipToDelete = await databases?.getDocument(
    config.public.appwriteDatabaseId,
    config.public.appwriteMembersId,
    membershipId,
  );
  if (!membershipToDelete)
    throw createError({ status: 404, statusText: "Member not found" });

  const [allMemberships, workspace] = await Promise.all([
    databases?.listDocuments(
      config.public.appwriteDatabaseId,
      config.public.appwriteMembersId,
      [Query.equal("workspace_id", membershipToDelete.workspace_id)],
    ),
    databases?.getDocument(
      config.public.appwriteDatabaseId,
      config.public.appwriteWorkspacesId,
      membershipToDelete.workspace_id,
    ),
  ]);

  const userIsAdmin = allMemberships?.documents.find(
    ({ user_id, role }) => user_id === user.$id && role === MEMBER_ROLE.admin,
  );
  const userDeletesOtherMember = user.$id !== membershipToDelete.user_id;

  if (!workspace)
    throw createError({ status: 404, statusText: "Workspace not found" });

  // Only admin can remove other members
  if (userDeletesOtherMember && !userIsAdmin)
    throw createError({ status: 401, statusText: "Unauthorized" });

  // Only workspace owner can remove admins
  if (
    userDeletesOtherMember &&
    membershipToDelete.role === "admin" &&
    workspace?.user_id !== user.$id
  )
    throw createError({ status: 401, statusText: "Unauthorized" });

  // Cannot remove the last member
  if (allMemberships?.total === 1)
    throw createError({
      status: 400,
      statusText: "Cannot delete the only workspace member",
    });

  // User can remove himself
  await databases?.deleteDocument(
    config.public.appwriteDatabaseId,
    config.public.appwriteMembersId,
    membershipToDelete.$id,
  );

  return { ok: true };
});
