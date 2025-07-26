<script setup lang="ts">
import { toast } from 'vue-sonner';

import type { DeleteTaskInject } from '~/lib/types';
import { ConfirmModal } from '#components';

const { taskId, name, projectId } = defineProps<{
    taskId: string;
    name: string;
    projectId: string;
}>()

const route = useRoute()
const { openModal } = useConfirmModal()
const { open: openUpdateTaskModal } = useUpdateTaskModal()

const onDeleteTask: DeleteTaskInject | undefined = inject('delete-task-inject')

const currentProject = computed(() => route.params['projectId'])

// Delete task
const deleteTask = async () => {
    await $fetch('/api/tasks/delete', { method: 'DELETE', body: { taskId } })
        .then(async () => {
            await Promise.all(
                (onDeleteTask?.deleteTaskSuccessSubsribers ?? []).map((onDelete) => onDelete?.(taskId))
            )
            toast.success('Task deleted')
        }).catch(() => {
            toast.error('Failed to delete task')
        })
}

const showDeleteModal = () => {
    openModal(ConfirmModal, {
        onConfirm: deleteTask,
        title: `Delete task "${name}"`,
        message: 'This action cannot be undone.',
        variant: 'destructive'
    })
}
</script>

<template>
    <div class="flex justify-end">
        <DropdownMenu :modal="false">
            <DropdownMenuTrigger :as-child="true">
                <slot></slot>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-48">
                <DropdownMenuItem :as-child="true">
                    <NuxtLink :href="`/workspaces/${route.params['workspaceId']}/tasks/${taskId}`"
                        class="font-medium p-[10px]">
                        <Icon name="lucide:external-link" class="size-4 mr-1 stroke-2" />
                        Task Details
                    </NuxtLink>
                </DropdownMenuItem>
                <DropdownMenuItem v-if="currentProject !== projectId" :as-child="true">
                    <NuxtLink :href="`/workspaces/${route.params['workspaceId']}/projects/${projectId}`"
                        class="font-medium p-[10px]">
                        <Icon name="lucide:external-link" class="size-4 mr-1 stroke-2" />
                        Open Project
                    </NuxtLink>
                </DropdownMenuItem>
                <DropdownMenuItem @select="openUpdateTaskModal(taskId)" class="font-medium p-[10px]">
                    <Icon name="lucide:pencil" class="size-4 mr-1 stroke-2" />
                    Edit Task
                </DropdownMenuItem>
                <DropdownMenuItem @select="showDeleteModal"
                    class="font-medium text-amber-700 p-[10px] focus:text-amber-700">
                    <Icon name="lucide:trash" class="size-4 mr-1 stroke-2" />
                    Delete Task
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </div>
</template>