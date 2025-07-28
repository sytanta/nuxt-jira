<script setup lang="ts">
import type { Models } from 'node-appwrite'
import { useQuery } from '@tanstack/vue-query'

import authenticatedPageProtectMiddleware from '~/middleware/page-protect/authenticatedPage'
import MemberList from '~/components/workspace/member/MemberList.vue'

definePageMeta({
    layout: 'standalone',
    middleware: [authenticatedPageProtectMiddleware]
})

useHead({
    title: 'Members'
})

const route = useRoute()
const workspaceId = computed(() => route.params['workspaceId'])

const { data, isFetching, isRefetching, suspense } = useQuery<Models.Document[]>
    ({
        queryKey: ['workspace-members', () => workspaceId.value],
        queryFn: async () => {
            const res = await fetch(`/api/workspaces/${workspaceId.value}/members`)
            const data = await res.json()
            return (data?.members ?? []) as Models.Document[]
        },
        staleTime: Infinity,
        experimental_prefetchInRender: true
    })

onServerPrefetch(async () => {
    await suspense()
})
</script>

<template>
    <div class="size-full lg:max-w-xl">
        <Loader v-if="isFetching && !isRefetching" class="min-h-auto h-96" />
        <MemberList v-else-if="!!data?.length && !!workspaceId" :data="data" :workspace-id="String(workspaceId)" />
    </div>
</template>