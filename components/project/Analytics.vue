<script setup lang="ts">
const { data } = defineProps<{
    data: {
        task_count: number;
        task_diff: number;
        assigned_task_count: number;
        assigned_task_diff: number;
        completed_task_count: number;
        completed_task_diff: number;
        incompleted_task_count?: number;
        incompleted_task_diff?: number;
        overdue_task_count: number;
        overdue_task_diff: number;
        project_count?: number;
        project_diff?: number;
    }
}>()

const {
    task_count,
    task_diff,
    assigned_task_count,
    assigned_task_diff,
    completed_task_count,
    completed_task_diff,
    incompleted_task_count,
    incompleted_task_diff,
    overdue_task_count,
    overdue_task_diff
} = data
</script>

<template>
    <ScrollArea class="w-full border rounded-lg whitespace-nowrap shrink-0">
        <div class="w-full flex">
            <div class="flex flex-1 items-center min-w-56">
                <AnalyticCard title="Total Tasks" :value="task_count" :variant="task_diff > 0 ? 'up' : 'down'"
                    :increase-value="task_diff" />
                <DottedSeparator direction="vertical" />
            </div>
            <div class="flex flex-1 items-center min-w-56">
                <AnalyticCard title="Assigned Tasks" :value="assigned_task_count"
                    :variant="assigned_task_diff > 0 ? 'up' : 'down'" :increase-value="assigned_task_diff" />
                <DottedSeparator direction="vertical" />
            </div>
            <div class="flex flex-1 items-center min-w-56">
                <AnalyticCard title="Completed Tasks" :value="completed_task_count"
                    :variant="completed_task_diff > 0 ? 'up' : 'down'" :increase-value="completed_task_diff" />
                <DottedSeparator direction="vertical" />
            </div>
            <div class="flex flex-1 items-center min-w-56">
                <AnalyticCard title="Overdue Tasks" :value="overdue_task_count"
                    :variant="overdue_task_diff > 0 ? 'up' : 'down'" :increase-value="overdue_task_diff" />
                <DottedSeparator direction="vertical" />
            </div>
            <div v-if="incompleted_task_count != undefined && incompleted_task_diff != undefined"
                class="flex flex-1 items-center min-w-56">
                <AnalyticCard title="Incomplete Tasks" :value="incompleted_task_count"
                    :variant="incompleted_task_diff > 0 ? 'up' : 'down'" :increase-value="incompleted_task_diff" />
                <DottedSeparator direction="vertical" />
            </div>
        </div>
        <ScrollBar orientation="horizontal" />
    </ScrollArea>
</template>