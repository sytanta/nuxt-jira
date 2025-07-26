<script setup lang="ts">
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { configure, useForm } from 'vee-validate'
import { toTypedSchema } from "@vee-validate/zod";
import { toast } from 'vue-sonner';

import { CreateTasksSchema } from '~/lib/schema/createTask';
import { TaskStatus, type CreateTaskInject, type FilteredTask } from '~/lib/types';

const { projectOptions, memberOptions, onCancel } = defineProps<{
    projectOptions: { $id: string; name: string; image_url?: string; }[];
    memberOptions: { $id: string; name: string; }[];
    onCancel?: () => void
}>()

const route = useRoute()
const { value: taskStatus } = useUrlQuery('create_task')

const onCreateTask: CreateTaskInject | undefined = inject('create-task-inject')

configure({
    validateOnBlur: false
});

const initialTaskStatus: ComputedRef<TaskStatus | undefined> = computed(() => {
    const decoded = taskStatus.value ? decodeURIComponent(String(taskStatus.value)) : undefined
    if (decoded && decoded in TaskStatus) return TaskStatus[decoded as keyof typeof TaskStatus]
    else return undefined
})

const form = useForm({
    validationSchema: toTypedSchema(CreateTasksSchema),
    initialValues: {
        workspace_id: String(route.params['workspaceId']),
        status: initialTaskStatus.value
    }
})

const statuses = Object.entries(TaskStatus)

const { isPending, mutate } = useMutation({
    mutationFn: async (formData: typeof form.values) => {
        const res =
            await $fetch('/api/tasks/create', { method: 'POST', body: formData })
        if (res.task) {
            onCreateTask?.createTaskSuccessSubsribers.map((onCreate) => onCreate?.(res.task as FilteredTask))
            // await queryClient.invalidateQueries({ queryKey: ['tasks', formData.workspace_id] })

            // close form
            onCancel?.()
            toast.success('Task created')
        } else toast.error('Failed to create task')
    },
    onError: () => toast.error('Failed to create task')
})

const handleSubmit = form.handleSubmit((values) => mutate(values))
</script>

<template>
    <Card class="size-full border-none shadow-none gap-0 p-0">
        <CardHeader class="flex py-7">
            <CardTitle class="font-bold text-xl">
                Create a new task
            </CardTitle>
        </CardHeader>
        <div class="px-7">
            <DottedSeparator />
        </div>
        <CardContent class="py-7">
            <form @submit="handleSubmit">
                <fieldset :disabled="isPending">
                    <div class="flex flex-col gap-y-4">
                        <FormField v-slot="{ componentField }" name="workspace_id">
                            <Input type="hidden" v-bind="componentField" />
                        </FormField>
                        <FormField v-slot="{ componentField }" name="name">
                            <FormItem>
                                <FormLabel>Task Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter task name" v-bind="componentField" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        </FormField>
                        <FormField v-slot="{ componentField }" name="due_date">
                            <FormItem>
                                <FormLabel>Due Date</FormLabel>
                                <FormControl>
                                    <DatePicker :value="componentField.modelValue"
                                        :on-change="componentField.onChange" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        </FormField>
                        <FormField v-slot="{ componentField }" name="assignee_id">
                            <FormItem>
                                <FormLabel>Assignee</FormLabel>
                                <Select :default-value="componentField.modelValue"
                                    @update:model-value="componentField.onChange">
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select assignee"></SelectValue>
                                        </SelectTrigger>
                                    </FormControl>
                                    <FormMessage />
                                    <SelectContent>
                                        <SelectItem v-for="assignee of memberOptions" :key="assignee.$id"
                                            :value="assignee.$id">
                                            <WorkspaceMemberAvatar :name="assignee.name" class="size-6" />
                                            {{ assignee.name }}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        </FormField>
                        <FormField v-slot="{ componentField }" name="status">
                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select :default-value="componentField.modelValue"
                                    @update:model-value="componentField.onChange">
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status"></SelectValue>
                                        </SelectTrigger>
                                    </FormControl>
                                    <FormMessage />
                                    <SelectContent>
                                        <SelectItem v-for="[label, val] of statuses" :key="val" :value="val">
                                            {{ label }}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        </FormField>
                        <FormField v-slot="{ componentField }" name="project_id">
                            <FormItem>
                                <FormLabel>Project</FormLabel>
                                <Select :default-value="componentField.modelValue"
                                    @update:model-value="componentField.onChange">
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select project"></SelectValue>
                                        </SelectTrigger>
                                    </FormControl>
                                    <FormMessage />
                                    <SelectContent>
                                        <SelectItem v-for="project of projectOptions" :key="project.$id"
                                            :value="project.$id">
                                            <ProjectAvatar :name="project.name" :image="project.image_url"
                                                class="size-6" />
                                            {{ project.name }}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        </FormField>
                    </div>
                    <DottedSeparator class="py-7" />
                    <div class="flex items-center justify-between gap-5">
                        <Button v-if="!!onCancel" type="button" variant="secondary" size="lg" @click="onCancel"
                            class="w-24">Cancel</Button>
                        <Button type="submit" variant="primary" size="lg" class="w-32 ml-auto">
                            <Icon v-if="isPending" name="svg-spinners:8-dots-rotate" size="16px" class="size-4" />
                            <span v-else>Create task</span>
                        </Button>
                    </div>
                </fieldset>
            </form>
        </CardContent>
    </Card>
</template>