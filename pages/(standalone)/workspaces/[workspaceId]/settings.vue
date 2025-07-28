<script setup lang="ts">
import type { Models } from 'node-appwrite';
import { useQuery } from '@tanstack/vue-query';

import authenticatedPageProtectMiddleware from '~/middleware/page-protect/authenticatedPage';
import { WorkspaceUpdateWorkspaceForm } from '#components';

definePageMeta({
    layout: 'standalone',
    middleware: [authenticatedPageProtectMiddleware]
})

const route = useRoute()
const workspaceId = computed(() => route.params['workspaceId'])

const { data, isPending, isRefetching, refetch, suspense } = useQuery<{
    workspace: Models.Document;
    is_owner: boolean;
    is_admin: boolean;
}>
    ({
        queryKey: ['workspace-settings', () => workspaceId.value],
        queryFn: async () => {
            const res = await fetch(`/api/workspaces/${workspaceId.value}`)
            const data = await res.json()
            return data
        },
        staleTime: Infinity,
        experimental_prefetchInRender: true
    })

onServerPrefetch(async () => {
    await suspense()
})

const pageTitle = computed(() => data?.value?.workspace.name
    ? `${data?.value?.workspace.name} settings`
    : 'Workspace settings')
useHead({
    title: pageTitle
})

const onUpdateSuccess = async () => {
    refetch()
}
</script>

<template>
    <div class="size-full lg:max-w-xl">
        <WorkspaceUpdateWorkspaceForm v-if="data" :data="data.workspace" :is-owner="data.is_owner"
            :is-admin="data.is_admin" :on-success="onUpdateSuccess" />
        <Loader v-else-if="isPending && !isRefetching" class="min-h-auto h-96" />
    </div>
</template>