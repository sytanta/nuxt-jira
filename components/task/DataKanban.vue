<script setup lang="ts">
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useDragAndDrop } from 'fluid-dnd/vue';
import { toast } from 'vue-sonner';

import {
    TaskStatus,
    type CreateTaskInject,
    type DeleteTaskInject,
    type FilteredTask,
    type UpdateTaskInject
} from '~/lib/types';
import KanbanColumnHeader from './KanbanColumnHeader.vue';
import KanbanCard from './KanbanCard.vue';

interface DragItem { id: string; position: number, workspaceId: string; }
interface DragEndEvent { index: number, value: DragItem }
interface UpdateTaskData {
    id?: string;
    position: number;
    status?: string;
}

const { data = [] } = defineProps<{
    data?: FilteredTask[]
}>()

const route = useRoute()
const queryClient = useQueryClient()

// Store all tasks' data
const tasks: Ref<Record<string, FilteredTask | null>> = ref({})

// Fluid DnD lists
const backlogList: Ref<DragItem[]> = ref([])
const todoList: Ref<DragItem[]> = ref([])
const inProgressList: Ref<DragItem[]> = ref([])
const inReviewList: Ref<DragItem[]> = ref([])
const doneList: Ref<DragItem[]> = ref([])

let backlogs: Ref<HTMLElement | undefined>
let todos: Ref<HTMLElement | undefined>
let inProgresses: Ref<HTMLElement | undefined>
let inReviews: Ref<HTMLElement | undefined>
let dones: Ref<HTMLElement | undefined>

const onUpdateTask: UpdateTaskInject | undefined = inject('update-task-inject')

// Update a single dnded task
const { mutate: updateTask } = useMutation({
    mutationFn: async (data: UpdateTaskData) => {
        const updatedData: UpdateTaskData = { position: data.position }
        if (data.status) updatedData.status = data.status

        const res = await $fetch(`/api/tasks/${data.id}`, {
            method: 'PATCH',
            body: updatedData
        })
        const { task } = (res ?? {}) as { task: FilteredTask }
        if (task) {
            // invalidate tasks 
            queryClient.invalidateQueries({ queryKey: ['tasks', route.params['workspaceId']] })
            queryClient.invalidateQueries({ queryKey: ['task', data.id] }) // invalidate the dnded task

            // update the local task
            applyTaskUpdates([data])
            // update the same task in other tabs
            if (data.id && tasks.value[data.id])
                onUpdateTask?.updateTaskSuccessSubsribers.map((onUpdate) => onUpdate?.(task))

            toast.success('Task updated')
        } else toast.error('Failed to update task')
    },
    onError: () => toast.error('Failed to update task')
})

// Update multiple dnded tasks
const { mutate: updateTasks } = useMutation({
    mutationFn: async (updatedData: { id: string; data: UpdateTaskData }[]) => {
        const res = await $fetch('/api/tasks/update-tasks', {
            method: 'POST',
            body: updatedData
        })
        if ((res as { ok: boolean }).ok) {
            // invalidate tasks 
            queryClient.invalidateQueries({ queryKey: ['tasks', route.params['workspaceId']] })
            queryClient.invalidateQueries({ queryKey: ['task', updatedData[0].id] }) // invalidate the dnded task

            // update the local tasks
            applyTaskUpdates(updatedData.map((({ id, data }) => ({ ...data, id }))))
            // update the main dnded task in other tabs
            if (updatedData[0].id && tasks.value[updatedData[0].id])
                onUpdateTask?.updateTaskSuccessSubsribers.map((onUpdate) => onUpdate?.(tasks.value[updatedData[0].id!]!))

            toast.success('Tasks updated')
        } else toast.error('Failed to update tasks')
    },
    onError: () => toast.error('Failed to update tasks')
})

// Check & update dnded tasks' new position & status
const handleUpdateTaskOnDrop = (e: DragEndEvent, status: TaskStatus, list: Ref<DragItem[]>) => {
    const { index: newIndex, value } = e

    const selectedTask = list.value[newIndex]
    const taskBelow = list.value[newIndex + 1]

    const updatedTasks: DragItem[] = []
    const newPosition = (taskBelow?.position ?? 999) + 1

    selectedTask.position = newPosition
    if (!tasks.value[selectedTask.id]) return
    tasks.value[selectedTask.id]!.position = newPosition

    let increasedPosition = newPosition + 1
    for (let index = newIndex - 1; index >= 0; --index) {
        const task = list.value[index]
        // stop checking if task has higher position already
        if (task.position > newPosition) break
        if (!tasks.value[task.id]) continue

        task.position = increasedPosition
        tasks.value[task.id]!.position = task.position
        updatedTasks.push(task)

        increasedPosition += 1
    }

    if (updatedTasks.length) {
        const updatedData: UpdateTaskData = { position: newPosition }
        updatedData.status = status

        updateTasks([
            {
                id: value.id,
                data: updatedData
            },
            ...updatedTasks.map(({ id, position }) => ({
                id: id,
                data: { position }
            }))
        ])
    } else {
        updateTask({
            id: value.id,
            position: newPosition,
            status
        })
    }
}

const handleDragEndBacklog = (e: DragEndEvent) => {
    handleUpdateTaskOnDrop(e, TaskStatus.Backlog, backlogList)
}
const handleDragEndTodo = (e: DragEndEvent) => {
    handleUpdateTaskOnDrop(e, TaskStatus.Todo, todoList)
}
const handleDragEndinProgress = (e: DragEndEvent) => {
    handleUpdateTaskOnDrop(e, TaskStatus['In Progress'], inProgressList)
}
const handleDragEndInReview = (e: DragEndEvent) => {
    handleUpdateTaskOnDrop(e, TaskStatus['In Review'], inReviewList)
}
const handleDragEndDone = (e: DragEndEvent) => {
    handleUpdateTaskOnDrop(e, TaskStatus.Done, doneList)
}

const handleDeleteTask: Record<TaskStatus, ((taskId: string) => void) | undefined> = {
    [TaskStatus.Backlog]: undefined,
    [TaskStatus.Todo]: undefined,
    [TaskStatus['In Progress']]: undefined,
    [TaskStatus['In Review']]: undefined,
    [TaskStatus.Done]: undefined
}

const handleCreateTask: Record<TaskStatus, ((task: FilteredTask) => void) | undefined> = {
    [TaskStatus.Backlog]: undefined,
    [TaskStatus.Todo]: undefined,
    [TaskStatus['In Progress']]: undefined,
    [TaskStatus['In Review']]: undefined,
    [TaskStatus.Done]: undefined
}

// Sort tasks for displaying, pushing to micro-task queue for not blocking the main thread
const preparing = ref(true)
const prepareTaskList = (list: FilteredTask[]) => {
    preparing.value = true
    new Promise((resolve) => {
        const listBL = []
        const listTD = []
        const listIP = []
        const listIR = []
        const listDO = []

        for (const task of list) {
            tasks.value[task.$id] = task
            const item = {
                id: task.$id,
                position: task.position,
                workspaceId: task.workspace_id
            }

            if (task.status === TaskStatus.Backlog) listBL.push(item)
            else if (task.status === TaskStatus.Todo) listTD.push(item)
            else if (task.status === TaskStatus['In Progress']) listIP.push(item)
            else if (task.status === TaskStatus['In Review']) listIR.push(item)
            else listDO.push(item)
        }

        listBL.sort((a, b) => b.position - a.position)
        listTD.sort((a, b) => b.position - a.position)
        listIP.sort((a, b) => b.position - a.position)
        listIR.sort((a, b) => b.position - a.position)
        listDO.sort((a, b) => b.position - a.position)

        backlogList.value = listBL
        todoList.value = listTD
        inProgressList.value = listIP
        inReviewList.value = listIR
        doneList.value = listDO

        const backlogsDnD = useDragAndDrop(backlogList, {
            droppableGroup: "tasks",
            onDragEnd: handleDragEndBacklog
        })
        backlogs = backlogsDnD[0]
        handleCreateTask.BACKLOG = (task: FilteredTask) => {
            tasks.value[task.$id] = task
            backlogsDnD[1](0, {
                id: task.$id,
                position: task.position,
                workspaceId: task.workspace_id
            })
        }
        handleDeleteTask.BACKLOG = (taskId: string) => {
            const index = backlogList.value.findIndex(t => t.id === taskId)
            backlogsDnD[2](index)
        }

        const todosDnD = useDragAndDrop(todoList, {
            droppableGroup: "tasks",
            onDragEnd: handleDragEndTodo
        })
        todos = todosDnD[0]
        handleCreateTask.TODO = (task: FilteredTask) => {
            tasks.value[task.$id] = task
            todosDnD[1](0, {
                id: task.$id,
                position: task.position,
                workspaceId: task.workspace_id
            })
        }
        handleDeleteTask.TODO = (taskId: string) => {
            const index = todoList.value.findIndex(t => t.id === taskId)
            todosDnD[2](index)
        }

        const inProgressesDnD = useDragAndDrop(inProgressList, {
            droppableGroup: "tasks",
            onDragEnd: handleDragEndinProgress
        })
        inProgresses = inProgressesDnD[0]
        handleCreateTask.IN_PROGRESS = (task: FilteredTask) => {
            tasks.value[task.$id] = task
            inProgressesDnD[1](0, {
                id: task.$id,
                position: task.position,
                workspaceId: task.workspace_id
            })
        }
        handleDeleteTask.IN_PROGRESS = (taskId: string) => {
            const index = inProgressList.value.findIndex(t => t.id === taskId)
            inProgressesDnD[2](index)
        }

        const inReviewsDnD = useDragAndDrop(inReviewList, {
            droppableGroup: "tasks",
            onDragEnd: handleDragEndInReview
        })
        inReviews = inReviewsDnD[0]
        handleCreateTask.IN_REVIEW = (task: FilteredTask) => {
            tasks.value[task.$id] = task
            inReviewsDnD[1](0, {
                id: task.$id,
                position: task.position,
                workspaceId: task.workspace_id
            })
        }
        handleDeleteTask.IN_REVIEW = (taskId: string) => {
            const index = inReviewList.value.findIndex(t => t.id === taskId)
            inReviewsDnD[2](index)
        }

        const donesDnD = useDragAndDrop(doneList, {
            droppableGroup: "tasks",
            onDragEnd: handleDragEndDone
        })
        dones = donesDnD[0]
        handleCreateTask.DONE = (task: FilteredTask) => {
            tasks.value[task.$id] = task
            donesDnD[1](0, {
                id: task.$id,
                position: task.position,
                workspaceId: task.workspace_id
            })
        }
        handleDeleteTask.DONE = (taskId: string) => {
            const index = doneList.value.findIndex(t => t.id === taskId)
            donesDnD[2](index)
        }

        resolve(true)
    })
        .then(() => preparing.value = false)
}
prepareTaskList(data)

// Apply changes to local tasks in this kanban tab
const applyTaskUpdates = (updatedTasks: UpdateTaskData[]) => {
    for (const { id, status, position } of updatedTasks) {
        if (!id || !tasks.value[id]) continue

        if (status) tasks.value[id].status = status as TaskStatus
        tasks.value[id].position = position

        queryClient.resetQueries({ queryKey: ['task', id] })
    }
}

// Listen to event of creating task via create-task modal
const onCreateTask: CreateTaskInject | undefined = inject('create-task-inject')

const unsubscribeCreateSuccess = onCreateTask?.subscribeToCreateTaskSuccess((task: FilteredTask) => {
    handleCreateTask[task.status]?.(task)
})

// Listen to event of updating task via update-task modal
const unsubscribeUpdateSuccess = onUpdateTask?.subscribeToUpdateTaskSuccess((task) => {
    tasks.value[task.$id] = task as FilteredTask

    queryClient.invalidateQueries({ queryKey: ['tasks', route.params['workspaceId']] })
    queryClient.invalidateQueries({ queryKey: ['task', task.$id] })
})

// Listen to deleting task event
const onDeleteTask: DeleteTaskInject | undefined = inject('delete-task-inject')

const unsubscribeDeleteSuccess = onDeleteTask?.subscribeToDeleteTaskSuccess((taskId) => {
    const status = tasks.value[taskId]?.status
    if (status) {
        handleDeleteTask[status]?.(taskId)
        tasks.value[taskId] = null;
    }
})

onUnmounted(() => {
    unsubscribeCreateSuccess?.()
    unsubscribeUpdateSuccess?.()
    unsubscribeDeleteSuccess?.()
})
</script>

<template>
    <div v-show="!preparing" class="flex overflow-x-auto">
        <div class="flex-1 mx-2 bg-muted p-1.5 rounded-md min-w-[200px]">
            <KanbanColumnHeader board-name="Backlog" :task-count="backlogList.length" />
            <div ref="backlogs" class="min-h-[200px] py-1.5">
                <div class="number" v-for="(element, index) of backlogList" :index :key="element.id">
                    <KanbanCard :task="tasks[element.id]!" />
                </div>
            </div>
        </div>
        <div class="flex-1 mx-2 bg-muted p-1.5 rounded-md min-w-[200px]">
            <KanbanColumnHeader board-name="Todo" :task-count="todoList.length" />
            <div ref="todos" class="min-h-[200px] py-1.5">
                <div class="number" v-for="(element, index) of todoList" :index :key="element.id">
                    <KanbanCard :task="tasks[element.id]!" />
                </div>
            </div>
        </div>
        <div class="flex-1 mx-2 bg-muted p-1.5 rounded-md min-w-[200px]">
            <KanbanColumnHeader board-name="In Progress" :task-count="inProgressList.length" />
            <div ref="inProgresses" class="min-h-[200px] py-1.5">
                <div class="number" v-for="(element, index) of inProgressList" :index :key="element.id">
                    <KanbanCard :task="tasks[element.id]!" />
                </div>
            </div>
        </div>
        <div class="flex-1 mx-2 bg-muted p-1.5 rounded-md min-w-[200px]">
            <KanbanColumnHeader board-name="In Review" :task-count="inReviewList.length" />
            <div ref="inReviews" class="min-h-[200px] py-1.5">
                <div class="number" v-for="(element, index) of inReviewList" :index :key="element.id">
                    <KanbanCard :task="tasks[element.id]!" />
                </div>
            </div>
        </div>
        <div class="flex-1 mx-2 bg-muted p-1.5 rounded-md min-w-[200px]">
            <KanbanColumnHeader board-name="Done" :task-count="doneList.length" />
            <div ref="dones" class="min-h-[200px] py-1.5">
                <div class="number" v-for="(element, index) of doneList" :index :key="element.id">
                    <KanbanCard :task="tasks[element.id]!" />
                </div>
            </div>
        </div>
    </div>
    <div v-if="preparing" class="w-full border rounded-lg h-52 flex flex-col items-center justify-center">
        <Icon name="svg-spinners:8-dots-rotate" size="20px" class="size-5 text-muted-foreground" />
    </div>
</template>