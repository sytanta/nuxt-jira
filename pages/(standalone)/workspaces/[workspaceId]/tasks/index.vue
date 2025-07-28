<script setup lang="ts">
import authenticatedPageProtectMiddleware from '~/middleware/page-protect/authenticatedPage';
import useAuthStore from '~/stores/auth';

definePageMeta({
    layout: 'dashboard',
    middleware: [authenticatedPageProtectMiddleware]
})

useHead({
    title: 'My tasks'
})

const auth = useAuthStore()
</script>

<template>
    <div class="h-full flex flex-col">
        <TaskSwitcher :assignee-id="auth.user?.$id" />
    </div>
</template>