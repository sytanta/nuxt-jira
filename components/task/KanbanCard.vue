<script setup lang="ts">
import type { FilteredTask } from '~/lib/types';

const { task } = defineProps<{ task: FilteredTask }>()
</script>

<template>
    <div class="bg-white p-2.5 mb-1.5 rounded shadow-sm space-y-3">
        <div class="flex items-start justify-between gap-x-2">
            <p class="text-sm line-clamp-2">{{ task.name }}</p>
            <TaskActions :task-id="task.$id" :name="task.name" :project-id="task.project_id">
                <Icon name="lucide:ellipsis" size="18px"
                    class="size-[18px] stroke-1 shrink-0 text-neutral-700 transition hover:opacity-75" />
            </TaskActions>
        </div>
        <DottedSeparator />
        <div class="flex items-center gap-x-1.5">
            <WorkspaceMemberAvatar :name="task.assignee.name" fallback-class="text-[10px]" />
            <div class="size-1 rounded-full bg-neutral-300"></div>
            <TaskDate :value="task.due_date" class="text-xs" />
        </div>
        <div class="flex items-center gap-x-1.5">
            <ProjectAvatar :name="task.project.name" :image="task.project.image_url" fallback-class="text-[10px]" />
            <span class="text-xs font-medium">{{ task.project.name }}</span>
        </div>
    </div>
</template>