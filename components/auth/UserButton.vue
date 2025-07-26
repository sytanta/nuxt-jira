<script setup lang="ts">
import { useMutation, useQueryClient } from '@tanstack/vue-query'

import useAuthStore from '~/stores/auth'

const queryClient = useQueryClient()
const authStore = useAuthStore()

const { isPending, mutate } = useMutation({
    mutationFn: () => fetch('/api/auth/sign-out', { method: 'POST' }),
    onSuccess: async () => {
        await queryClient.invalidateQueries({ type: 'active' })
        await queryClient.resetQueries({ type: 'inactive' })
        await navigateTo('/sign-in')
    }
})
</script>

<template>
    <div v-if="isPending"
        class="size-10 rounded-full flex items-center justify-center bg-neutral-200 border border-neutral-300">
        <Icon name="svg-spinners:8-dots-rotate" size="16px" class="size-4 text-muted-foreground" />
    </div>
    <DropdownMenu v-else :modal="false">
        <DropdownMenuTrigger class="outline-none relative">
            <Avatar class="size-10 hover:opacity-75 transition border border-neutral-300">
                <AvatarFallback class="bg-neutral-200 font-medium text-neutral-500 flex items-center justify-center">
                    {{ (authStore.user?.name || authStore.user?.email || 'U')[0].toUpperCase() }}
                </AvatarFallback>
            </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="bottom" :side-offset="10" class="w-60">
            <div class="flex flex-col items-center justify-center gap-2 px-2.5 py-4">
                <Avatar class="size-[52px] border border-neutral-300">
                    <AvatarFallback
                        class="bg-neutral-200 font-medium text-xl text-neutral-500 flex items-center justify-center">
                        {{ (authStore.user?.name || authStore.user?.email || 'U')[0].toUpperCase() }}
                    </AvatarFallback>
                </Avatar>
                <div class="flex flex-col items-center justify-center">
                    <p class="text-sm font-medium text-neutral-900">{{ authStore.user?.name ?? 'User' }}</p>
                    <p class="text-xs text-neutral-500">{{ authStore.user?.email }}</p>
                </div>
            </div>
            <DottedSeparator class="mb-1" />
            <DropdownMenuItem @select="mutate"
                class="h-10 flex items-center justify-between text-amber-700 font-medium cursor-pointer">
                <Icon name="lucide:log-out" size="16px" class="size-4 mr-1" /> Sign out
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
</template>