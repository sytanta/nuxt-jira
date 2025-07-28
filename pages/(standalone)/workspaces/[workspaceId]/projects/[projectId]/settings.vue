<script setup lang="ts">
import type { Models } from 'node-appwrite';
import { useQuery } from '@tanstack/vue-query';

import authenticatedPageProtectMiddleware from '~/middleware/page-protect/authenticatedPage';

definePageMeta({
    layout: 'standalone',
    middleware: [authenticatedPageProtectMiddleware]
})

const route = useRoute()
const workspaceId = computed(() => route.params['workspaceId'])
const projectId = computed(() => route.params['projectId'])

const { data, isPending, isRefetching, refetch, suspense } = useQuery<{
    project: Models.Document;
    is_owner: boolean;
    is_admin: boolean;
}>
    ({
        queryKey: ['project-settings', () => projectId.value],
        queryFn: async () => {
            const res = await fetch(`/api/projects/${projectId.value}`)
            const data = await res.json()
            return data
        },
        staleTime: Infinity,
        experimental_prefetchInRender: true
    })

const pageTitle = computed(() => data?.value?.project.name
    ? `${data?.value?.project.name} settings`
    : 'Project settings')
useHead({
    title: pageTitle
})

onServerPrefetch(async () => {
    await suspense()
})

const onUpdateSuccess = async () => {
    refetch()
}
</script>

<template>
    <div class="size-full lg:max-w-xl">
        <ProjectUpdateProjectForm v-if="data" :data="data.project" :workspace-id="String(workspaceId)"
            :is-owner="data.is_owner" :is-admin="data.is_admin" :on-success="onUpdateSuccess" />
        <Loader v-if="isPending && !isRefetching" class="min-h-auto h-96" />
    </div>
</template>