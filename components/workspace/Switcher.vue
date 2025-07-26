<script setup lang="ts">
import type { Models } from 'node-appwrite'
import { useQuery } from '@tanstack/vue-query'

const route = useRoute()

const { data, isLoading } = useQuery<Models.Document[]>
    ({
        queryKey: ['workspaces/all'],
        queryFn: async () => {
            const res = await fetch('/api/workspaces/all')
            const data = await res.json()
            return data?.workspaces ?? []
        },
        staleTime: Infinity,
        experimental_prefetchInRender: true
    })

const { open } = useCreateWorkspaceModal()

const currentWorkspaceId = computed(() => route.params['workspaceId'])
</script>

<template>
    <div class="flex flex-col gap-y-2">
        <div class="flex items-center justify-between">
            <p class="text-xs uppercase text-neutral-500">Workspaces</p>
            <button @click="open" class="flex items-center justify-center">
                <Icon v-if="isLoading" name="svg-spinners:8-dots-rotate" size="20px" class="size-5 text-neutral-500" />
                <Icon v-else name="heroicons:plus-circle-20-solid" size="20px"
                    class="size-5 text-neutral-500 cursor-pointer transition hover:opacity-75" />
            </button>
        </div>
        <Select :model-value="currentWorkspaceId">
            <SelectTrigger
                class="w-full bg-neutral-200 font-medium pl-3 focus-visible:border-transparent focus-visible:ring-transparent">
                <SelectValue placeholder="No workspace selected"></SelectValue>
            </SelectTrigger>
            <SelectContent v-if="data?.length">
                <SelectItem v-for="workspace of data" :key="workspace.$id" :value="workspace.$id"
                    @select="navigateTo(`/workspaces/${workspace.$id}`)">
                    <div class="flex items-center justify-start gap-3 font-medium">
                        <WorkspaceAvatar :name="workspace.name" :image="workspace.image_url" />
                        <span class="truncate">{{ workspace.name }}</span>
                    </div>
                </SelectItem>
            </SelectContent>
        </Select>
    </div>
</template>