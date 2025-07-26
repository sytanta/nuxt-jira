import { Models, Query } from "node-appwrite";

import { createAdminClient } from "~/server/lib/appwrite";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const databases = event.context.databases;
  const user = event.context.user;

  if (!user) throw createError({ status: 401, statusText: "Unauthorized" });

  const {
    workspace_id,
    project_id,
    assignee_id,
    status,
    search,
    due_date,
  }: {
    workspace_id: string;
    project_id?: string;
    assignee_id?: string;
    status?: string;
    search?: string;
    due_date?: string;
  } = getQuery(event);

  if (!workspace_id)
    throw createError({ status: 400, statusText: "Workspace ID required" });

  // Only members can view tasks
  const membership = await databases?.listDocuments(
    config.public.appwriteDatabaseId,
    config.public.appwriteMembersId,
    [
      Query.equal("user_id", user.$id),
      Query.equal("workspace_id", String(workspace_id)),
    ],
  );
  if (!membership?.total)
    throw createError({ status: 401, statusText: "Unauthorized" });

  // Populate queries & fetch tasks
  const query = [
    Query.equal("workspace_id", workspace_id),
    Query.orderDesc("$createdAt"),
  ];

  if (project_id) query.push(Query.equal("project_id", project_id));
  if (assignee_id) query.push(Query.equal("assignee_id", assignee_id));
  if (status) query.push(Query.equal("status", status));
  if (due_date) query.push(Query.equal("due_date", due_date));
  if (search) query.push(Query.search("name", search));

  const tasks = await databases?.listDocuments(
    config.public.appwriteDatabaseId,
    config.public.appwriteTasksId,
    query,
  );

  // Get related projects and assignees
  const projectIds = tasks?.documents.map(({ project_id }) => project_id) ?? [];
  const assigneeIds =
    tasks?.documents.map(({ assignee_id }) => assignee_id) ?? [];

  const { users } = createAdminClient();

  const [projects, assignees]: [
    Models.DocumentList<Models.Document> | undefined,
    { $id: string; name: string; email: string }[],
  ] = await Promise.all([
    projectIds?.length
      ? await databases?.listDocuments(
          config.public.appwriteDatabaseId,
          config.public.appwriteProjectsId,
          [Query.contains("$id", projectIds)],
        )
      : { documents: [], total: 0 },
    Promise.all(
      assigneeIds.map(async (user_id) => {
        const user = await users.get(user_id);
        return {
          $id: user.$id,
          name: user.name,
          email: user.email,
        };
      }) ?? [],
    ),
  ]);

  // Populate tasks' "project_id" and "assignee_id"
  const projectsObj =
    projects?.documents.reduce(
      (acc, project) => {
        acc[project.$id] = project;
        return acc;
      },
      {} as Record<string, Models.Document>,
    ) ?? {};
  const assigneesObj =
    assignees.reduce(
      (acc, assignee) => {
        acc[assignee.$id] = assignee;
        return acc;
      },
      {} as Record<string, { $id: string; name: string; email: string }>,
    ) ?? {};

  const populatedTasks =
    tasks?.documents.map((task) => ({
      ...task,
      project: projectsObj[task.project_id],
      assignee: assigneesObj[task.assignee_id],
    })) ?? [];

  return { tasks: populatedTasks };
});
