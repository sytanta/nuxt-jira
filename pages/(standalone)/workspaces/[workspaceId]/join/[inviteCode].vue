<script setup lang="ts">
import authenticatedPageProtectMiddleware from '~/middleware/page-protect/authenticatedPage';

definePageMeta({
    layout: 'standalone',
    middleware: [authenticatedPageProtectMiddleware]
})

const route = useRoute()

const { data: workspace, status } = await useFetch(`/api/workspaces/${route.params['workspaceId']}/info`)

const isLoading = computed(() => status.value === 'idle' || status.value === 'pending')

useHead({
    title: `${workspace?.value?.name} workspace join`
})
</script>

<template>
    <div class="w-full lg:max-w-xl">
        <Loader v-if="isLoading" class="min-h-auto h-96" />
        <WorkspaceJoinWorkspaceForm v-else :workspace-id="String(route.params['workspaceId'])" :name="workspace?.name"
            :invite-code="String(route.params['inviteCode'])" />
    </div>
</template>