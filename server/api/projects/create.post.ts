import { ID, Query } from "node-appwrite";

import { MEMBER_ROLE } from "~/lib/constant";
import { CreateProjectsSchema } from "~/lib/schema/createProject";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const databases = event.context.databases;
  const storage = event.context.storage;
  const user = event.context.user;

  if (!user) throw createError({ status: 401, statusText: "Unauthorized" });

  // Get & parse form data
  const data = await readMultipartFormData(event);
  const name = data?.find(({ name }) => name === "name");
  const workspaceId = data?.find(({ name }) => name === "workspace_id");
  const image = data?.find(({ name }) => name === "image");

  // zod validating
  const params = CreateProjectsSchema.safeParse({
    name: name?.data.toString(),
    workspace_id: workspaceId?.data.toString(),
    image: image
      ? new File([image?.data], image.filename!, { type: image.type })
      : undefined,
  });

  // Create a new project if parsing succeeds
  if (params.success) {
    // Only admin can create new projects
    const membership = await databases?.listDocuments(
      config.public.appwriteDatabaseId,
      config.public.appwriteMembersId,
      [
        Query.equal("user_id", user.$id),
        Query.equal("workspace_id", params.data.workspace_id),
        Query.equal("role", MEMBER_ROLE.admin),
      ],
    );
    if (!membership?.total)
      throw createError({ status: 401, statusText: "Unauthorized" });

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

    // Create project
    const project = await databases?.createDocument(
      config.public.appwriteDatabaseId,
      config.public.appwriteProjectsId,
      ID.unique(),
      {
        name: params.data.name,
        workspace_id: params.data.workspace_id,
        image_url: uploadedImageUrl,
        image_storage_id: imageStorageId,
      },
    );

    return { project };
  } else {
    throw createError({
      status: 400,
      statusText: params.error.message,
    });
  }
});
