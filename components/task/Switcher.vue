<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query'

import type { CreateTaskInject, DeleteTaskInject, FilteredTask, UpdateTaskInject } from '~/lib/types'
import { columns } from './Columns'

const { projectId, assigneeId } = defineProps<{ projectId?: string; assigneeId?: string; }>()

const route = useRoute()
const queryClient = useQueryClient()
const { open } = useCreateTaskModal()
const {
    value: view,
    setQueryValue: setView,
} = useUrlQuery("tab")
const { value: filterValues } = useTaskFilterQueries()

// Default tab value is "table"
const initialView = view.value ? String(view.value) : 'table'

const isLoadingTasks = ref(false)
const tasks: Ref<FilteredTask[] | undefined> = ref(undefined)

const fetchTasks = async () => {
    isLoadingTasks.value = true

    const workspace_id = route.params['workspaceId'] as string
    const project_id = projectId ?? filterValues.value['project_id'] as string
    const assignee_id = assigneeId ?? filterValues.value['assignee_id'] as string
    const status = filterValues.value['status'] as string
    const due_date = filterValues.value['due_date'] as string
    const search = filterValues.value['search'] as string

    const searchParams = new URLSearchParams()
    searchParams.set('workspace_id', workspace_id)
    if (project_id) searchParams.set('project_id', project_id)
    if (status) searchParams.set('status', status)
    if (search) searchParams.set('search', search)
    if (assignee_id) searchParams.set('assignee_id', assignee_id)
    if (due_date) searchParams.set('due_date', due_date)

    $fetch(`/api/tasks/filter?${searchParams.toString()}`)
        .then(res => tasks.value = res.tasks as FilteredTask[])
        .finally(() => isLoadingTasks.value = false)
}

// Refetch tasks on these url params' changes
watch(([
    () => projectId ? false : filterValues.value['project_id'],
    () => assigneeId ? false : filterValues.value['assignee_id'],
    () => filterValues.value['status'],
    () => filterValues.value['due_date'],
    () => filterValues.value['search']
]), () => fetchTasks(), { immediate: true })

// Switch tab
const handleSetView = (view: any) => {
    setView(String(view))
}

// Listen to event of creating task via create-task modal
// These listers mainly for "DataTable" tab
// "Kanban" & "Calendar" tabs have their own listeners
const createTaskInject: CreateTaskInject | undefined = inject('create-task-inject')
const unsubscribeCreateSuccess = createTaskInject?.subscribeToCreateTaskSuccess((task: FilteredTask) => {
    tasks.value = [task, ...(tasks.value ?? [])]
})

// Listen to event of updating task via update-task modal
const updateTaskInject: UpdateTaskInject | undefined = inject('update-task-inject')
const unsubscribeUpdateSuccess = updateTaskInject?.subscribeToUpdateTaskSuccess((task: FilteredTask) => {
    tasks.value = tasks.value?.map((t) => t.$id === task.$id ? task : t)
    queryClient.invalidateQueries({ queryKey: ['task', task.$id] })
})

// Listen to deleting task event
const deleteTaskInject: DeleteTaskInject | undefined = inject('delete-task-inject')
const unsubscribeDeleteSuccess = deleteTaskInject?.subscribeToDeleteTaskSuccess((taskId: string) => {
    tasks.value = tasks.value?.filter((task) => task.$id !== taskId)
})

onUnmounted(() => {
    unsubscribeCreateSuccess?.()
    unsubscribeUpdateSuccess?.()
    unsubscribeDeleteSuccess?.()
})
</script>

<template>
    <Tabs :default-value="initialView" @update:model-value="handleSetView" class="flex-1 w-full border rounded-lg">
        <div class="h-full flex flex-col overflow-auto p-4">
            <div class="flex flex-col gap-y-2 items-center justify-between lg:flex-row">
                <TabsList class="w-full lg:w-auto">
                    <TabsTrigger value="table" class="h-8 w-full lg:w-auto">
                        Table
                    </TabsTrigger>
                    <TabsTrigger value="kanban" class="h-8 w-full lg:w-auto">
                        Kanban
                    </TabsTrigger>
                    <TabsTrigger value="calendar" class="h-8 w-full lg:w-auto">
                        Calendar
                    </TabsTrigger>
                </TabsList>
                <Button size="sm" @click="open()" class="w-full lg:w-auto">
                    <Icon name="lucide:plus" size="16px" class="size-4" />
                    New
                </Button>
            </div>
            <DottedSeparator class="my-4" />
            <TaskFilters :project-id="projectId" :assignee-id="assigneeId" />
            <DottedSeparator class="my-4" />
            <div v-if="isLoadingTasks" class="w-full border rounded-lg h-52 flex flex-col items-center justify-center">
                <Icon name="svg-spinners:8-dots-rotate" size="20px" class="size-5 text-muted-foreground" />
            </div>
            <TabsContent value="table" class="mt-0">
                <TaskDataTable v-if="tasks && !isLoadingTasks" :columns="columns" :data="tasks" />
            </TabsContent>
            <TabsContent value="kanban" class="mt-0">
                <TaskDataKanban v-if="tasks && !isLoadingTasks" :data="tasks" />
            </TabsContent>
            <TabsContent value="calendar" class="mt-0">
                <TaskDataCalendar v-if="tasks && !isLoadingTasks" :data="tasks" />
            </TabsContent>
        </div>
    </Tabs>
</template>