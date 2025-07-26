<script setup lang="ts">
import type { Models } from 'node-appwrite'
import { useQuery } from '@tanstack/vue-query'
import ProjectAvatar from './ProjectAvatar.vue'

const route = useRoute()
const workspaceId = computed(() => route.params['workspaceId'])

const { data: projects, isLoading } = useQuery<Models.Document[]>
    ({
        queryKey: ['projects', () => route.params['workspaceId']],
        queryFn: async () => {
            const res = await fetch(`/api/workspaces/${route.params['workspaceId']}/projects`)
            const data = await res.json()
            return data?.projects ?? []
        },
        staleTime: Infinity,
        experimental_prefetchInRender: true
    })

const { open } = useCreateProjectModal()
</script>

<template>
    <div
        class="flex flex-col gap-y-2 [&_.router-link-active]:bg-white [&_.router-link-active]:shadow-sm [&_.router-link-active]:text-primary [&_.router-link-active]:hover:opacity-100">
        <div class="flex items-center justify-between">
            <p class="text-xs uppercase text-neutral-500">Projects</p>
            <button @click="open" class="flex items-center justify-center">
                <Icon v-if="isLoading" name="svg-spinners:8-dots-rotate" size="20px" class="size-5 text-neutral-500" />
                <Icon v-else name="heroicons:plus-circle-20-solid" size="20px"
                    class="size-5 text-neutral-500 cursor-pointer transition hover:opacity-75" />
            </button>
        </div>

        <template v-if="projects?.length">
            <NuxtLink v-for="project of projects" :key="project.$id"
                :href="`/workspaces/${workspaceId}/projects/${project.$id}`">
                <div
                    class="flex items-center gap-2.5 p-2.5 rounded-md text-neutral-500 cursor-pointer transition hover:opacity-75">
                    <ProjectAvatar :name="project.name" :image="project.image_url" />
                    <span class="truncate">{{ project.name }}</span>
                </div>
            </NuxtLink>
        </template>
    </div>
</template>