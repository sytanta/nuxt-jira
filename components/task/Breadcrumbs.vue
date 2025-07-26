<script setup lang="ts">
import type { Models } from 'node-appwrite';
import { useQueryClient } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';

import type { FilteredTask } from '~/lib/types';
import { ConfirmModal } from '#components';

const { project, task } = defineProps<{ project: Models.Document; task: FilteredTask; }>()

const route = useRoute()
const { openModal } = useConfirmModal()

const queryClient = useQueryClient()

// Delete task
const deleteTask = async () => {
    await $fetch('/api/tasks/delete', { method: 'DELETE', body: { taskId: task.$id } })
        .then(async () => {
            await queryClient.invalidateQueries({ queryKey: ['tasks', route.params['workspaceId']] })
            await navigateTo(`/workspaces/${route.params['workspaceId']}/tasks`)
            toast.success('Task deleted')
        }).catch(() => {
            toast.error('Failed to delete task')
        })
}

const showDeleteModal = () => {
    openModal(ConfirmModal, {
        onConfirm: deleteTask,
        title: `Delete task "${task.name}"`,
        message: 'This action cannot be undone.',
        variant: 'destructive'
    })
}
</script>

<template>
    <div class="flex items-center gap-x-2">
        <ProjectAvatar :name="project.name" :image="project.image_url" class="size-6 lg:size-8" />
        <NuxtLink :href="`/workspaces/${route.params['workspaceId']}/projects/${project.$id}`">
            <p class="text-sm font-semibold text-muted-foreground transition hover:opacity-75 lg:text-lg">{{
                project.name }}</p>
        </NuxtLink>
        <Icon name="lucide:chevron-right" size="16px" class="size-4 text-muted-foreground lg:hidden!" />
        <Icon name="lucide:chevron-right" size="20px" class="size-5 text-muted-foreground hidden! lg:block!" />
        <p class="text-sm font-semibold lg:text-lg">{{
            task.name }}</p>
        <Button @click="showDeleteModal" variant="destructive" size="sm" class="ml-auto">
            <Icon name="lucide:trash" class="size-4 lg:mr-1" />
            <span class="hidden lg:block">Delete Task</span>
        </Button>
    </div>
</template>