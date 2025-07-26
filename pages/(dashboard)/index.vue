<script setup lang="ts">
import { type Models } from 'node-appwrite';
import { useQuery } from '@tanstack/vue-query';

import authenticatedPageProtectMiddleware from '~/middleware/page-protect/authenticatedPage';

definePageMeta({
    layout: 'dashboard',
    middleware: [authenticatedPageProtectMiddleware],
})

const { data, isFetching, isSuccess, suspense } = useQuery<Models.Document[]>
    ({
        queryKey: ['workspaces/all'],
        queryFn: async () => {
            const res = await fetch('/api/workspaces/all')
            const data = await res.json()
            return data?.workspaces ?? null
        },
        staleTime: Infinity,
        experimental_prefetchInRender: true
    })

onServerPrefetch(async () => {
    await suspense()
})

watch([isFetching, isSuccess, data], async ([fetching, success, data]) => {
    if (!fetching && success && data) {
        navigateTo(data?.length ? `/workspaces/${data[0].$id}` : '/workspaces/create')
    }
}, { immediate: true })
</script>

<template>
    <Loader class="h-96 min-h-auto" />
</template>