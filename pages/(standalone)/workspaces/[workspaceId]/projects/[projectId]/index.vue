<script setup lang="ts">
import type { Models } from 'node-appwrite';
import { useQuery } from '@tanstack/vue-query';

import authenticatedPageProtectMiddleware from '~/middleware/page-protect/authenticatedPage';

definePageMeta({
    layout: 'dashboard',
    middleware: [authenticatedPageProtectMiddleware]
})

const route = useRoute()

const { data, isPending, isRefetching, suspense } = useQuery<{
    project: Models.Document;
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
        queryKey: ['project-analytics', () => route.params['projectId']],
        queryFn: async () => {
            const res = await fetch(`/api/projects/${route.params['projectId']}/analytics`)
            const data = await res.json()
            return data
        },
        staleTime: Infinity,
        experimental_prefetchInRender: true
    })

onServerPrefetch(async () => {
    await suspense()
})
</script>

<template>
    <Loader v-if="isPending && !isRefetching" class="min-h-auto h-96" />
    <div v-else-if="data" class="flex flex-col gap-y-4">
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-x-2">
                <ProjectAvatar :name="data.project.name" :image="data.project.image_url" class="size-8" />
                <p class="text-lg font-semibold">{{ data.project.name }}</p>
            </div>
            <div>
                <Button variant="secondary" size="sm" :as-child="true">
                    <NuxtLink
                        :href="`/workspaces/${route.params['workspaceId']}/projects/${route.params['projectId']}/settings`">
                        <Icon name="lucide:pencil" size="16px" class="size-4 mr-1" />
                        Edit Project
                    </NuxtLink>
                </Button>
            </div>
        </div>

        <ProjectAnalytics :data="data.analytic_data" />
        <TaskSwitcher :project-id="String(route.params['projectId'])" />
    </div>
</template>