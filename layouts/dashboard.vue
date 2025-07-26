<script setup lang="ts">
import type { Models } from 'node-appwrite';

import type { TaskSuccessSubscriber } from '~/lib/types';
import CreateWorkspaceModal from '~/components/workspace/CreateWorkspaceModal.vue';
import CreateProjectModal from '~/components/project/CreateProjectModal.vue';
import CreateTaskModal from '~/components/task/CreateTaskModal.vue';
import UpdateTaskModal from '~/components/task/UpdateTaskModal.vue';

// Provide subscribers for creating, updating & deleting events
// Child components can register their listeners to those events
const createTaskSuccessSubsribers: TaskSuccessSubscriber[] = []

const subscribeToCreateTaskSuccess = (func: (newTask: Models.Document) => Promise<void> | void) => {
    const index = createTaskSuccessSubsribers.push(func)
    return () => createTaskSuccessSubsribers[index] = null
}

provide('create-task-inject', {
    createTaskSuccessSubsribers,
    subscribeToCreateTaskSuccess
})

const updateTaskSuccessSubsribers: TaskSuccessSubscriber[] = []

const subscribeToUpdateTaskSuccess = (func: (updatedTask: Models.Document) => Promise<void> | void) => {
    const index = updateTaskSuccessSubsribers.push(func)
    return () => updateTaskSuccessSubsribers[index] = null
}

provide('update-task-inject', {
    updateTaskSuccessSubsribers,
    subscribeToUpdateTaskSuccess
})

const deleteTaskSuccessSubsribers: TaskSuccessSubscriber[] = []

const subscribeToDeleteTaskSuccess = (func: (updatedTask: Models.Document) => Promise<void> | void) => {
    const index = deleteTaskSuccessSubsribers.push(func)
    return () => deleteTaskSuccessSubsribers[index] = null
}

provide('delete-task-inject', {
    deleteTaskSuccessSubsribers,
    subscribeToDeleteTaskSuccess
})
</script>

<template>
    <div class="min-h-screen flex flex-col">
        <div class="h-full grow">
            <div class="fixed left-0 top-0 hidden h-full overflow-y-auto lg:block lg:w-[264px]">
                <SideBar />
            </div>
            <div class="size-full grow lg:pl-[264px]">
                <div class="max-w-screen-2xl mx-auto h-full">
                    <NavBar />
                    <main class="h-full px-6 py-8 flex flex-col">
                        <slot></slot>
                    </main>
                </div>
            </div>
        </div>
    </div>

    <CreateWorkspaceModal />
    <CreateProjectModal />
    <CreateTaskModal />
    <UpdateTaskModal />
</template>