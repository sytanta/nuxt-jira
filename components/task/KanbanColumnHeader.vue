<script setup lang="ts">
import { cn } from '~/lib/utils';

const { boardName, taskCount } = defineProps<{
    boardName: string;
    taskCount: number
}>()

const iconNames: Record<string, { name: string; color: string; }> = {
    Backlog: { name: 'lucide:circle-dashed', color: 'text-pink-400' },
    Todo: { name: 'lucide:circle', color: 'text-red-400' },
    'In Progress': { name: 'lucide:circle-dot-dashed', color: 'text-yellow-400' },
    'In Review': { name: 'lucide:circle-dot', color: 'text-blue-400' },
    Done: { name: 'lucide:circle-check', color: 'text-emerald-400' }
}

const { open } = useCreateTaskModal()
</script>

<template>
    <div class="px-2 py-1.5 flex items-center justify-between">
        <div class="flex items-center gap-x-2">
            <Icon :name="iconNames[boardName].name" size="18px"
                :class="cn('size-[18px]', iconNames[boardName].color)" />
            <h2 class="text-sm font-medium">{{ boardName }}</h2>
            <div
                class="size-5 flex items-center justify-center rounded-md bg-neutral-200 text-xs text-neutral-700 font-medium">
                {{ taskCount }}</div>
        </div>
        <Button @click="open(boardName)" variant="ghost" size="icon" class="size-5">
            <Icon name="lucide:plus" size="16px" class="size-4 text-neutral-500" />
        </Button>
    </div>
</template>