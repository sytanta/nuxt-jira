import { Query } from "node-appwrite";

import { MEMBER_ROLE } from "~/lib/constant";
import generateInviteCode from "~/lib/generateInviteCode";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const databases = event.context.databases;
  const user = event.context.user;

  if (!user) throw createError({ status: 401, statusText: "Unauthorized" });

  const { workspaceId } = getRouterParams(event);

  // Only admin can update workspace
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

  const invite_code = generateInviteCode(6);
  await databases?.updateDocument(
    config.public.appwriteDatabaseId,
    config.public.appwriteWorkspacesId,
    workspaceId,
    { invite_code },
  );

  return { inviteCode: invite_code };
});
