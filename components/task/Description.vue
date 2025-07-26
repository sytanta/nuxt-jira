<script setup lang="ts">
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';

import type { FilteredTask } from '~/lib/types';

const { task } = defineProps<{ task: FilteredTask }>()

const queryClient = useQueryClient()

const inputDescription = ref(task.description ?? '')
const isEditing = ref(false)

const { isPending, mutate: save } = useMutation({
    mutationFn: async () => {
        isEditing.value = true
        const res =
            await $fetch(`/api/tasks/${task.$id}`, { method: 'PATCH', body: { description: inputDescription.value } })
        if ((res as unknown as { task: FilteredTask }).task) {
            await queryClient.refetchQueries({ queryKey: ['task', task.$id] }) // re-fetch tasks
            isEditing.value = false
            toast.success('Task description updated')
        } else toast.error('Failed to update task description')
    },
    onError: () => toast.error('Failed to update task description')
})
</script>

<template>
    <div class="p-4 border rounded-lg">
        <div class="flex items-center justify-between">
            <p class="text-lg font-semibold">
                Description
            </p>
            <Button variant="secondary" size="sm" :disabled="isPending" @click="isEditing = !isEditing">
                <Icon v-if="isEditing" name="heroicons:x-mark" size="16px" class="size-4 mr-1" />
                <Icon v-else name="lucide:pencil" size="16px" class="size-4 mr-1" />
                <template v-if="isEditing">Cancel</template>
                <template v-else>Edit</template>
            </Button>
        </div>
        <DottedSeparator class="h-auto my-4" />
        <div v-if="isEditing" class="flex flex-col gap-y-4">
            <Textarea v-model="inputDescription" rows="4" :disabled="isPending"
                placeholder="Add a description..."></Textarea>
            <Button size="sm" :disabled="isPending" @click="save" class="w-32 ml-auto">
                <Icon v-if="isPending" name="svg-spinners:8-dots-rotate" size="16px" class="size-4" />
                <template v-else>Save Changes</template>
            </Button>
        </div>
        <div v-else>
            <template v-if="task.description">{{ task.description }}</template>
            <span v-else class="text-muted-foreground">No description set</span>
        </div>
    </div>
</template>