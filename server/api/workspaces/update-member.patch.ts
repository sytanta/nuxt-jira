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

  const membershipToUpdate = await databases?.getDocument(
    config.public.appwriteDatabaseId,
    config.public.appwriteMembersId,
    membershipId,
  );
  if (!membershipToUpdate)
    throw createError({ status: 404, statusText: "Member not found" });

  const [userIsAdmin, workspace] = await Promise.all([
    databases?.listDocuments(
      config.public.appwriteDatabaseId,
      config.public.appwriteMembersId,
      [
        Query.equal("user_id", user.$id),
        Query.equal("workspace_id", membershipToUpdate.workspace_id),
        Query.equal("role", MEMBER_ROLE.admin),
      ],
    ),
    databases?.getDocument(
      config.public.appwriteDatabaseId,
      config.public.appwriteWorkspacesId,
      membershipToUpdate.workspace_id,
    ),
  ]);

  const userUpdatesOtherMember = user.$id !== membershipToUpdate.user_id;

  if (!workspace)
    throw createError({ status: 404, statusText: "Workspace not found" });

  // Workspace owner cannot self-downgrade
  if (workspace?.user_id !== user.$id)
    throw createError({ status: 400, statusText: "Unauthorized" });

  // User cannot self-update to admin
  if (!userUpdatesOtherMember && membershipToUpdate.role === MEMBER_ROLE.member)
    throw createError({ status: 401, statusText: "Unauthorized" });

  // Only admin can update other members
  if (userUpdatesOtherMember && !userIsAdmin)
    throw createError({ status: 401, statusText: "Unauthorized" });

  // Only workspace owner can update admins
  if (
    userUpdatesOtherMember &&
    membershipToUpdate.role === "admin" &&
    workspace?.user_id !== user.$id
  )
    throw createError({ status: 401, statusText: "Unauthorized" });

  const newRole =
    membershipToUpdate.role === MEMBER_ROLE.admin
      ? MEMBER_ROLE.member
      : MEMBER_ROLE.admin;
  await databases?.updateDocument(
    config.public.appwriteDatabaseId,
    config.public.appwriteMembersId,
    membershipToUpdate.$id,
    { role: newRole },
  );

  return { ok: true };
});
