<script setup lang="ts">
import type { Models } from 'node-appwrite'
import { templateRef } from '@vueuse/core'
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

// Workspace select
const trigger = templateRef('trigger')
const workspaceSelectOpen = ref(false)
const selectedWorkspace: Ref<Models.Document | ''> = ref('')

watch([() => route.params['workspaceId'], data], ([wId, data]) => {
    const workspaceId = (String(wId) || data?.[0]?.$id) ?? ''
    selectedWorkspace.value = data?.find(({ $id }) => $id === workspaceId) ?? ''
}, { immediate: true })
</script>

<template>
    <div class="flex flex-col gap-y-2" @click="workspaceSelectOpen = false">
        <div class="flex items-center justify-between">
            <p class="text-xs uppercase text-neutral-500">Workspaces</p>
            <button @click="open" class="flex items-center justify-center">
                <Icon v-if="isLoading" name="svg-spinners:8-dots-rotate" size="20px" class="size-5 text-neutral-500" />
                <Icon v-else name="heroicons:plus-circle-20-solid" size="20px"
                    class="size-5 text-neutral-500 cursor-pointer transition hover:opacity-75" />
            </button>
        </div>
        <Select :model-value="selectedWorkspace" :open="workspaceSelectOpen"
            @update:model-value="workspaceSelectOpen = false" class="relative">
            <button id="trigger" @click.stop="workspaceSelectOpen = !workspaceSelectOpen" ref="trigger"
                class="w-full text-left h-12 rounded-md bg-neutral-200 font-medium pl-3 focus-visible:border-transparent focus-visible:ring-transparent">
                <div v-if="selectedWorkspace" class="flex items-center justify-start gap-3 font-medium">
                    <WorkspaceAvatar :name="selectedWorkspace.name" :image="selectedWorkspace.image_url" />
                    <span class="truncate">{{ selectedWorkspace.name }}</span>
                </div>
                <template v-else>No workspace selected</template>
            </button>
            <SelectContent v-if="data?.length" :reference="trigger" @pointer-down-outside="workspaceSelectOpen = false">
                <SelectItem v-for="workspace of data" :key="workspace.$id" :value="workspace"
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