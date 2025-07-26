import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { Query } from "node-appwrite";

import { MEMBER_ROLE } from "~/lib/constant";
import { TaskStatus } from "~/lib/types";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const databases = event.context.databases;
  const user = event.context.user;

  if (!user) throw createError({ status: 401, statusText: "Unauthorized" });

  const { projectId } = getRouterParams(event);

  const project = await databases?.getDocument(
    config.public.appwriteDatabaseId,
    config.public.appwriteProjectsId,
    projectId,
  );
  if (!project)
    throw createError({ status: 404, statusText: "Project not found" });

  const [workspace, membership] = await Promise.all([
    databases?.getDocument(
      config.public.appwriteDatabaseId,
      config.public.appwriteWorkspacesId,
      project.workspace_id,
    ),
    databases?.listDocuments(
      config.public.appwriteDatabaseId,
      config.public.appwriteMembersId,
      [
        Query.equal("user_id", user.$id),
        Query.equal("workspace_id", project.workspace_id),
      ],
    ),
  ]);

  if (!workspace)
    throw createError({ status: 404, statusText: "Workspace not found" });
  if (!membership?.total)
    throw createError({ status: 401, statusText: "Unauthorized" });

  const now = new Date();
  const thisMonthStart = startOfMonth(now);
  const thisMonthEnd = endOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  const [
    thisMonthTasks,
    lastMonthTasks,
    thisMonthAssignedTasks,
    lastMonthAssignedTasks,
    thisMonthCompletedTasks,
    lastMonthCompletedTasks,
    thisMonthOverdueTasks,
    lastMonthOverdueTasks,
  ] = await Promise.all([
    databases?.listDocuments(
      config.public.appwriteDatabaseId,
      config.public.appwriteTasksId,
      [
        Query.equal("project_id", projectId),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ],
    ),
    databases?.listDocuments(
      config.public.appwriteDatabaseId,
      config.public.appwriteTasksId,
      [
        Query.equal("project_id", projectId),
        Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
      ],
    ),
    databases?.listDocuments(
      config.public.appwriteDatabaseId,
      config.public.appwriteTasksId,
      [
        Query.equal("project_id", projectId),
        Query.equal("assignee_id", user.$id),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ],
    ),
    databases?.listDocuments(
      config.public.appwriteDatabaseId,
      config.public.appwriteTasksId,
      [
        Query.equal("project_id", projectId),
        Query.equal("assignee_id", user.$id),
        Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
      ],
    ),
    databases?.listDocuments(
      config.public.appwriteDatabaseId,
      config.public.appwriteTasksId,
      [
        Query.equal("project_id", projectId),
        Query.equal("status", TaskStatus.Done),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ],
    ),
    databases?.listDocuments(
      config.public.appwriteDatabaseId,
      config.public.appwriteTasksId,
      [
        Query.equal("project_id", projectId),
        Query.equal("status", TaskStatus.Done),
        Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
      ],
    ),
    databases?.listDocuments(
      config.public.appwriteDatabaseId,
      config.public.appwriteTasksId,
      [
        Query.equal("project_id", projectId),
        Query.notEqual("status", TaskStatus.Done),
        Query.lessThan("due_date", now.toISOString()),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ],
    ),
    databases?.listDocuments(
      config.public.appwriteDatabaseId,
      config.public.appwriteTasksId,
      [
        Query.equal("project_id", projectId),
        Query.notEqual("status", TaskStatus.Done),
        Query.lessThan("due_date", now.toISOString()),
        Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
      ],
    ),
  ]);

  const task_count = thisMonthTasks?.total ?? 0;
  const task_diff = task_count - (lastMonthTasks?.total ?? 0);

  const assigned_task_count = thisMonthAssignedTasks?.total ?? 0;
  const assigned_task_diff =
    assigned_task_count - (lastMonthAssignedTasks?.total ?? 0);

  const completed_task_count = thisMonthCompletedTasks?.total ?? 0;
  const completed_task_diff =
    completed_task_count - (lastMonthCompletedTasks?.total ?? 0);

  const incompleted_task_count = task_count - completed_task_count;
  const incompleted_task_diff =
    incompleted_task_count -
    (lastMonthTasks?.total ?? 0 - (lastMonthCompletedTasks?.total ?? 0));

  const overdue_task_count = thisMonthOverdueTasks?.total ?? 0;
  const overdue_task_diff =
    overdue_task_count - (lastMonthOverdueTasks?.total ?? 0);

  return {
    project,
    analytic_data: {
      task_count,
      task_diff,
      assigned_task_count,
      assigned_task_diff,
      completed_task_count,
      completed_task_diff,
      incompleted_task_count,
      incompleted_task_diff,
      overdue_task_count,
      overdue_task_diff,
    },
    is_owner: workspace.user_id === user.$id,
    is_admin: membership.documents[0].role === MEMBER_ROLE.admin,
  };
});
