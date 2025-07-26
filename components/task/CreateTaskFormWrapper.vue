<script setup lang="ts">
import type { Models } from 'node-appwrite';
import { useQuery } from '@tanstack/vue-query';

const { onCancel } = defineProps<{ onCancel?: () => void }>()

const route = useRoute()

const { data: projects, isLoading: isLoadingProjects } = useQuery<Models.Document[]>
    ({
        queryKey: ['projects', () => route.params['workspaceId']],
        queryFn: async () => {
            const res = await fetch(`/api/workspaces/${route.params['workspaceId']}/projects`)
            const data = await res.json()
            return data.projects
        },
        staleTime: Infinity,
    })

const { data: members, isLoading: isLoadingMembers } = useQuery<Models.Document[]>
    ({
        queryKey: ['members', () => route.params['workspaceId']],
        queryFn: async () => {
            const res = await fetch(`/api/workspaces/${route.params['workspaceId']}/members`)
            const data = await res.json()
            return data.members
        },
        staleTime: Infinity,
    })

const isLoading = computed(() => isLoadingProjects.value || isLoadingMembers.value)

const projectOptions = computed(() =>
    projects.value?.map(({ $id, name, image_url }) => ({ $id, name, image_url })) ?? [])
const memberOptions = computed(() =>
    members.value?.map(({ $id, name }) => ({ $id, name })) ?? [])
</script>

<template>
    <Card v-if="isLoading" class="w-full h-[714px] p-0 border-none shadow-none">
        <CardContent class="h-full flex items-center justify-center">
            <Icon name="svg-spinners:8-dots-rotate" size="20px" class="size-5 text-muted-foreground" />
        </CardContent>
    </Card>
    <div v-else>
        <TaskCreateTaskForm :project-options="projectOptions" :member-options="memberOptions" :on-cancel="onCancel" />
    </div>
</template>