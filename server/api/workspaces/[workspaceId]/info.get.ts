export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const databases = event.context.databases;

  const { workspaceId } = getRouterParams(event);

  const workspace = await databases?.getDocument(
    config.public.appwriteDatabaseId,
    config.public.appwriteWorkspacesId,
    workspaceId,
  );
  if (!workspace)
    throw createError({ status: 404, statusText: "Workspace not found" });

  return { name: workspace.name } as { name: string };
});
