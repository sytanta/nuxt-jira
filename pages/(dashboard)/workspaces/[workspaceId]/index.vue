<script setup lang="ts">
import type { Models } from 'node-appwrite';
import { useQuery, useQueryClient } from '@tanstack/vue-query';

import { MEMBER_ROLE } from '~/lib/constant';
import type { CreateTaskInject, FilteredTask } from '~/lib/types';
import authenticatedPageProtectMiddleware from '~/middleware/page-protect/authenticatedPage';

definePageMeta({
    layout: 'dashboard',
    middleware: [authenticatedPageProtectMiddleware]
})

const route = useRoute()
const queryClient = useQueryClient()

const { data: analytics, isPending: isLoadingAnalytics, suspense: loadAnalytics } = useQuery<{
    workspace: Models.Document;
    is_owner: boolean;
    is_admin: boolean,
    analytic_data: {
        task_count: number;
        task_diff: number;
        assigned_task_count: number;
        assigned_task_diff: number;
        completed_task_count: number;
        completed_task_diff: number;
        incompleted_task_count: number;
        incompleted_task_diff: number;
        overdue_task_count: number;
        overdue_task_diff: number;
    },
}>
    ({
        queryKey: ['workspace-analytics', () => route.params['workspaceId']],
        queryFn: async () => {
            const res = await fetch(`/api/workspaces/${route.params['workspaceId']}/analytics`)
            const data = await res.json()
            return data
        },
        staleTime: Infinity,
        experimental_prefetchInRender: true
    })
const { data: projects, isPending: isLoadingProjects, suspense: loadProjects } = useQuery<Models.Document[]>
    ({
        queryKey: ['projects', () => route.params['workspaceId']],
        queryFn: async () => {
            const res = await fetch(`/api/workspaces/${route.params['workspaceId']}/projects`)
            const data = await res.json()
            return data?.projects ?? []
        },
        staleTime: Infinity,
        experimental_prefetchInRender: true
    })
const { data: members, isPending: isLoadingMembers, suspense: loadMembers } = useQuery<
    {
        $id: string;
        name: string;
        email: string;
        membership_id: string;
        role: keyof typeof MEMBER_ROLE;
        is_owner: boolean;
    }[]
>
    ({
        queryKey: ['members', () => route.params['workspaceId']],
        queryFn: async () => {
            const res = await fetch(`/api/workspaces/${route.params['workspaceId']}/members`)
            const data = await res.json()
            return data?.members ?? []
        },
        staleTime: Infinity,
        experimental_prefetchInRender: true
    })
const { data: tasks, isPending: isLoadingTasks, suspense: loadTasks } = useQuery<FilteredTask[]>
    ({
        queryKey: ['tasks', () => route.params['workspaceId']],
        queryFn: async () => {
            const res = await fetch(`/api/tasks/filter?workspace_id=${route.params['workspaceId']}`)
            const data = await res.json()
            return data?.tasks ?? []
        },
        staleTime: Infinity,
        experimental_prefetchInRender: true
    })

const pageTitle = computed(() => analytics?.value?.workspace.name ?? 'Workspace')
useHead({
    title: pageTitle
})

onServerPrefetch(async () => {
    await Promise.all([
        loadAnalytics(),
        loadProjects(),
        loadMembers(),
        loadTasks()
    ])
})

const isLoading = computed(() =>
    isLoadingAnalytics.value
    || isLoadingProjects.value
    || isLoadingMembers.value
    || isLoadingTasks.value)

// Listen to event of creating task via create-task modal
const onCreateTask: CreateTaskInject | undefined = inject('create-task-inject')

const unsubscribeCreateSuccess = onCreateTask?.subscribeToCreateTaskSuccess(() => {
    queryClient.invalidateQueries({ queryKey: ['tasks', route.params['workspaceId']] })
})

onUnmounted(() => {
    unsubscribeCreateSuccess?.()
})
</script>

<template>
    <Loader v-if="isLoading" class="min-h-auto h-96" />
    <div v-if="analytics && tasks && projects && members" class="h-full flex flex-col space-y-4">
        <ProjectAnalytics :data="analytics.analytic_data" />
        <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <WorkspaceHomeTaskList :tasks="tasks" />
            <WorkspaceHomeProjectList :projects="projects" />
            <WorkspaceHomeMemberList :members="members" />
        </div>
    </div>
</template>