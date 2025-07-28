<script setup lang="ts">
import authenticatedPageProtectMiddleware from '~/middleware/page-protect/authenticatedPage';

definePageMeta({
    layout: 'standalone',
    middleware: [authenticatedPageProtectMiddleware]
})

useHead({
    title: 'Create workspace'
})
</script>

<template>
    <div class="w-full lg:max-w-xl">
        <WorkspaceCreateWorkspaceForm />
    </div>
</template>