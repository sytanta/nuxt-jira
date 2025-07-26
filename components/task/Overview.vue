<script setup lang="ts">
import { TaskStatus, type FilteredTask } from '~/lib/types';

const { task } = defineProps<{ task: FilteredTask }>()

const statuses = Object.entries(TaskStatus).reduce(
    (acc, [label, value]) => {
        acc[value] = label;
        return acc;
    },
    {} as Record<string, string>,
);

const { open: openUpdateTaskModal } = useUpdateTaskModal()
</script>

<template>
    <div class="flex flex-col gap-y-4 col-span-1">
        <div class="bg-muted rounded-lg p-4">
            <div class="flex items-center justify-between">
                <p class="text-lg font-semibold">Overview</p>
                <Button variant="secondary" size="sm" @click="openUpdateTaskModal(task.$id)">
                    <Icon name="lucide:pencil" size="16px" class="size-4 mr-1" />
                    Edit
                </Button>
            </div>
            <DottedSeparator class="h-auto my-4" />
            <div class="flex flex-col gap-y-4">
                <TaskOverviewProperty label="Assignee">
                    <WorkspaceMemberAvatar :name="task.assignee.name" />
                    <p class="text-sm font-medium">{{ task.assignee.name }}</p>
                </TaskOverviewProperty>
                <TaskOverviewProperty label="Due Date">
                    <TaskDate :value="task.due_date" class="text-sm font-medium" />
                </TaskOverviewProperty>
                <TaskOverviewProperty label="Status">
                    <Badge :variant="task.status">{{ statuses[task.status] }}</Badge>
                </TaskOverviewProperty>
            </div>
        </div>
    </div>
</template>