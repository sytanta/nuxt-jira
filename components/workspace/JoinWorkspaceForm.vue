<script setup lang="ts">
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';

const { workspaceId, name, inviteCode } = defineProps<{ workspaceId: string; name?: string; inviteCode: string }>()

const queryClient = useQueryClient()

const { isPending, mutate } = useMutation({
    mutationFn: async () => {
        const res = await $fetch(`/api/workspaces/${workspaceId}/join`, { method: 'POST', body: { code: inviteCode } })
        if (res.membership) {
            await queryClient.resetQueries({ queryKey: ['workspaces/all'] })
            await navigateTo(`/workspaces/${workspaceId}`)
        } else toast.error('Failed to join workspace')
    },
    onError: (e) => {
        toast.error('Failed to join workspace')
    }
})

const handleJoin = () => {
    mutate()
}
</script>

<template>
    <Card class="size-full border-none shadow-none">
        <CardHeader class="px-7">
            <CardTitle class="text-xl font-bold">
                Join workspace
            </CardTitle>
            <CardDescription>
                You've been invited to join <strong>{{ name }}</strong> workspace
            </CardDescription>
        </CardHeader>
        <div class="px-7">
            <DottedSeparator />
        </div>
        <CardContent class="px-7">
            <div class="flex flex-col items-center justify-between gap-2 lg:flex-row">
                <Button type="button" variant="secondary" size="lg" :disabled="isPending" :as-child="true"
                    class="w-full lg:w-fit">
                    <NuxtLink href="/">Cancel</NuxtLink>
                </Button>
                <Button type="button" :disabled="isPending" @click="handleJoin" size="lg" class="w-full lg:w-44">
                    <Icon v-if="isPending" name="svg-spinners:8-dots-rotate" size="16px" class="size-4" />
                    <span v-else>Join workspace</span>
                </Button>
            </div>
        </CardContent>
    </Card>
</template>