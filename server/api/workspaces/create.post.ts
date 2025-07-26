import { ID } from "node-appwrite";

import { MEMBER_ROLE } from "~/lib/constant";
import generateInviteCode from "~/lib/generateInviteCode";
import { CreateWorkspaceSchema } from "~/lib/schema/createWorkspace";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const databases = event.context.databases;
  const storage = event.context.storage;
  const user = event.context.user;

  if (!user) throw createError({ status: 401, statusText: "Unauthorized" });

  // Get & parse form data
  const data = await readMultipartFormData(event);
  const name = data?.find(({ name }) => name === "name");
  const image = data?.find(({ name }) => name === "image");

  // zod validating
  const params = CreateWorkspaceSchema.safeParse({
    name: name?.data.toString(),
    image: image
      ? new File([image?.data], image.filename!, { type: image.type })
      : undefined,
  });

  // Create a new workspace if parsing succeeds
  if (params.success) {
    const image = params.data.image;
    let uploadedImageUrl: string | undefined = undefined;
    let imageStorageId: string | undefined = undefined;

    if (image instanceof File) {
      const file = await storage?.createFile(
        config.public.appwriteImagesBucketId,
        ID.unique(),
        image,
      );

      if (file) imageStorageId = file.$id;

      const arrayBuffer = file
        ? await storage?.getFileView(
            config.public.appwriteImagesBucketId,
            file.$id,
          )
        : undefined;

      if (arrayBuffer)
        uploadedImageUrl = `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`;
    } else {
      uploadedImageUrl = image;
    }

    // Create workspace
    const workspace = await databases?.createDocument(
      config.public.appwriteDatabaseId,
      config.public.appwriteWorkspacesId,
      ID.unique(),
      {
        name: params.data.name,
        user_id: user.$id,
        invite_code: generateInviteCode(6),
        image_url: uploadedImageUrl,
        image_storage_id: imageStorageId,
      },
    );

    // Create membership
    await databases?.createDocument(
      config.public.appwriteDatabaseId,
      config.public.appwriteMembersId,
      ID.unique(),
      {
        user_id: user.$id,
        workspace_id: workspace?.$id,
        role: MEMBER_ROLE.admin,
      },
    );

    return { workspace };
  } else {
    throw createError({
      status: 400,
      statusText: params.error.message,
    });
  }
});
