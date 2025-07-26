<script setup lang="ts">
import { formatDistanceToNow } from 'date-fns';
import type { FilteredTask } from '~/lib/types';

const { tasks } = defineProps<{ tasks: FilteredTask[] }>()

const route = useRoute()
const { open: openTaskModal } = useCreateTaskModal()
</script>

<template>
    <div class="flex flex-col gap-y-4 col-span-1">
        <div class="bg-muted rounded-lg p-4">
            <div class="flex items-center justify-between">
                <p class="text-lg font-semibold">
                    Tasks ({{ tasks.length }})
                </p>
                <Button variant="muted" size="icon" @click="openTaskModal('1')">
                    <Icon name="lucide:plus" size="16px" class="size-4 text-neutral-400" />
                </Button>
            </div>
            <DottedSeparator class="h-auto my-4" />
            <ul class="flex flex-col gap-y-4">
                <li v-for="task of tasks" :key="task.$id">
                    <NuxtLink :href="`/workspaces/${task.workspace_id}/tasks/${task.$id}`">
                        <Card class="shadow-none rounded-lg transition hover:opacity-75">
                            <CardContent class="p-4">
                                <p class="text-lg font-medium truncate">{{ task.name }}</p>
                                <div class="flex items-center gap-x-2">
                                    <p>{{ task.project?.name ?? '' }}</p>
                                    <div class="size-1 rounded-full bg-neutral-300"></div>
                                    <div class="flex items-center text-sm text-muted-foreground">
                                        <Icon name="lucide:calendar" size="12px" class="size-3 mr-1" />
                                        <span class="truncate">{{ formatDistanceToNow(task.due_date) }}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </NuxtLink>
                </li>
                <li v-if="!tasks?.length" class="text-sm text-muted-foreground text-center">
                    No tasks found
                </li>
            </ul>
            <Button variant="muted" class="w-full mt-4" :as-child="true">
                <NuxtLink :href="`/workspaces/${route.params['workspaceId']}/tasks`">Show All</NuxtLink>
            </Button>
        </div>
    </div>
</template>