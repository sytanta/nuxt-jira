<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query'

const route = useRoute()
const queryClient = useQueryClient()

const processing = ref(true)
const error = ref('')

onMounted(() => {
    $fetch('/api/auth/github/callback',
        {
            method: 'GET',
            query: { userId: route.query['userId'], secret: route.query['secret'] }
        })
        .then(async (res) => {
            if (res.ok) {
                await queryClient.refetchQueries({ queryKey: ['auth/me'] })
                await navigateTo('/')
            }
        }).catch((e) => {
            error.value = e.message || 'Server error'
        }).finally(() => processing.value = false)
})
</script>

<template>
    <div class="h-96 flex flex-col flex-1 items-center justify-center gap-1">
        <template v-if="error">
            <Icon name="lucide:triangle-alert" size="24px" class="size-6 text-muted-foreground" />
            <h2 class="text-xl font-semibold text-gray-700">Authentication failed</h2>
            <p class="text-sm text-muted-foreground">{{ error }}</p>
            <Button variant="outline" size="lg" :as-child="true" class="mt-2 text-md">
                <NuxtLink href="/auth">
                    Try again
                </NuxtLink>
            </Button>
        </template>
        <template v-else>
            <Icon name="svg-spinners:8-dots-rotate" size="24px" class="size-6 text-muted-foreground" />
            <h2 class="text-xl font-semibold text-gray-700">Completing authentication...</h2>
            <p class="text-sm text-muted-foreground">Please wait while we sign you in</p>
        </template>
    </div>
</template>