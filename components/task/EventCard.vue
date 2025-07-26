<script setup lang="ts">
import type { Models } from 'node-appwrite';

import { cn } from '~/lib/utils';
import { TaskStatus } from '~/lib/types';

const {
    title,
    status,
    project,
    assignee
} = defineProps<{
    title: string;
    status: string;
    project: Models.Document;
    assignee: {
        $id: string;
        name: string;
        email: string;
    };

}>()

const colorMap: Record<TaskStatus, string> = {
    [TaskStatus.Backlog]: 'border-l-pink-500',
    [TaskStatus.Todo]: 'border-l-red-500',
    [TaskStatus['In Progress']]: 'border-l-yellow-500',
    [TaskStatus['In Review']]: 'border-l-blue-500',
    [TaskStatus.Done]: 'border-l-emerald-500',
}
</script>

<template>
    <div class="block px-2">
        <div :class="cn(
            'p-1.5 text-xs bg-white text-primary border border-l-4 flex flex-col gap-y-1.5 rounded-md cursor-pointer transition hover:opacity-75',
            colorMap[status as TaskStatus])">
            <p>{{ title }}</p>
            <div class="flex items-center gap-x-1">
                <WorkspaceMemberAvatar :name="assignee.name" />
                <div class="size-1 rounded-full bg-neutral-300"></div>
                <ProjectAvatar :name="project?.name" :image="project?.image_url" />
            </div>
        </div>
    </div>
</template>