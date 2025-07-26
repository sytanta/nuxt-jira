import { ID, Query } from "node-appwrite";

import { MEMBER_ROLE } from "~/lib/constant";
import { InviteCodeSchema } from "~/lib/schema/inviteCode";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const databases = event.context.databases;
  const user = event.context.user;

  if (!user) throw createError({ status: 401, statusText: "Unauthorized" });

  const params = await readValidatedBody(event, InviteCodeSchema.safeParse);
  const { workspaceId } = getRouterParams(event);

  if (params.success) {
    // Check if user is already a member
    const memberships = await databases?.listDocuments(
      config.public.appwriteDatabaseId,
      config.public.appwriteMembersId,
      [
        Query.equal("user_id", user.$id),
        Query.equal("workspace_id", workspaceId),
      ],
    );
    if (memberships?.total)
      throw createError({ status: 400, statusText: "Already a member" });

    const workspace = await databases?.getDocument(
      config.public.appwriteDatabaseId,
      config.public.appwriteWorkspacesId,
      workspaceId,
    );
    if (workspace!.invite_code !== params.data.code)
      throw createError({ status: 400, statusText: "Invalid invite code" });

    // Create the membership
    const membership = await databases?.createDocument(
      config.public.appwriteDatabaseId,
      config.public.appwriteMembersId,
      ID.unique(),
      {
        user_id: user.$id,
        workspace_id: workspaceId,
        role: MEMBER_ROLE.member,
      },
    );

    return { membership };
  } else {
    throw createError({
      status: 400,
      statusText: params.error.message,
    });
  }
});
