import { ID, Query } from "node-appwrite";

import { MEMBER_ROLE } from "~/lib/constant";
import { UpdateProjectSchema } from "~/lib/schema/updateProject";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const databases = event.context.databases;
  const storage = event.context.storage;
  const user = event.context.user;

  if (!user) throw createError({ status: 401, statusText: "Unauthorized" });

  const { projectId } = getRouterParams(event);

  // Get form data
  const data = await readMultipartFormData(event);
  const name = data?.find(({ name }) => name === "name");
  const workspace_id = data?.find(({ name }) => name === "workspace_id");
  const imageObj = data?.find(({ name }) => name === "image");

  // Check if project & workspace exists
  const workspaceId = workspace_id?.data?.toString();
  if (!workspaceId)
    throw createError({ status: 400, statusText: "Workspace ID required" });

  const [workspace, memberships, exitingProject] = await Promise.all([
    databases?.getDocument(
      config.public.appwriteDatabaseId,
      config.public.appwriteWorkspacesId,
      workspaceId,
    ),
    databases?.listDocuments(
      config.public.appwriteDatabaseId,
      config.public.appwriteMembersId,
      [
        Query.equal("user_id", user.$id),
        Query.equal("workspace_id", workspaceId),
        Query.equal("role", MEMBER_ROLE.admin),
      ],
    ),
    databases?.getDocument(
      config.public.appwriteDatabaseId,
      config.public.appwriteProjectsId,
      projectId,
    ),
  ]);

  if (!workspace)
    throw createError({ status: 400, statusText: "Workspace not found" });

  if (!exitingProject)
    throw createError({ status: 400, statusText: "Project not found" });

  // Only admin can update project
  if (!memberships?.total)
    throw createError({ status: 401, statusText: "Unauthorized" });

  // File - new uploaded image
  // null - delete image
  // undefined - keep the current image
  let image: File | null | undefined = undefined;
  let imageUrl: string | undefined = imageObj
    ? imageObj.data.toString()
    : undefined;
  let finalImageUrl: string | null | undefined = undefined;

  if (imageUrl === "null") finalImageUrl = null;
  else if (imageObj && imageUrl)
    image = new File([imageObj?.data], imageObj.filename!, {
      type: imageObj.type,
    });

  // zod validating
  const params = UpdateProjectSchema.safeParse({
    name: name?.data.toString(),
    image,
  });

  // Create a new project if parsing succeeds
  if (params.success) {
    const validatedImage = params.data.image;
    let newImageStorageId: string | undefined = undefined;

    if (validatedImage instanceof File) {
      const file = await storage?.createFile(
        config.public.appwriteImagesBucketId,
        ID.unique(),
        validatedImage,
      );

      if (file) newImageStorageId = file.$id;

      const arrayBuffer = file
        ? await storage?.getFileView(
            config.public.appwriteImagesBucketId,
            file.$id,
          )
        : undefined;

      if (arrayBuffer)
        finalImageUrl = `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`;
    }

    const updatedData: {
      name?: string;
      image_url?: string;
      image_storage_id?: string;
    } = {};

    if (params.data.name) updatedData.name = params.data.name;
    if (finalImageUrl === null) {
      updatedData.image_url = "";
      updatedData.image_storage_id = "";
    } // remove image
    if (finalImageUrl && newImageStorageId) {
      updatedData.image_url = finalImageUrl;
      updatedData.image_storage_id = newImageStorageId;
    } // upload new image

    const project = await Promise.all([
      // Update project
      databases?.updateDocument(
        config.public.appwriteDatabaseId,
        config.public.appwriteProjectsId,
        exitingProject.$id,
        updatedData,
      ),
      // Remove old image
      (finalImageUrl === null || newImageStorageId) &&
        exitingProject?.image_storage_id &&
        storage?.deleteFile(
          config.public.appwriteImagesBucketId,
          exitingProject.image_storage_id,
        ),
    ]);

    return { project };
  } else {
    throw createError({
      status: 400,
      statusText: params.error.message,
    });
  }
});
