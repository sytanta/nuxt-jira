<script setup lang="ts">
import type { Models } from 'node-appwrite';
import { templateRef } from '@vueuse/core';
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { configure, useForm } from 'vee-validate'
import { toTypedSchema } from "@vee-validate/zod";
import { toast } from 'vue-sonner';

import { ConfirmModal } from '#components';
import { UpdateProjectSchema } from '~/lib/schema/updateProject';

const { data, workspaceId, isOwner, isAdmin, onSuccess, onCancel } = defineProps<{
    data: Models.Document;
    workspaceId: string;
    isOwner: boolean;
    isAdmin: boolean;
    onSuccess?: () => Promise<void>;
    onCancel?: () => void;
}>()

const queryClient = useQueryClient()

configure({
    validateOnBlur: false
});

// Update project name & image
const form = useForm({
    validationSchema: toTypedSchema(UpdateProjectSchema),
    initialValues: {
        name: data.name,
        image: data.image_url ?? ''
    }
})

const fileInputRef = templateRef('fileInputRef')
const image = ref(data.image_url ?? '')
const onUploadImage = (e: Event) => {
    const file = (e.currentTarget as HTMLInputElement).files?.[0]
    image.value = file ? URL.createObjectURL(file) : ''
    form.setFieldValue('image', file)
}

const removeImage = () => {
    form.resetField('image')
    fileInputRef.value.value = ''
    image.value = ''
}

const { isPending, mutate } = useMutation({
    mutationFn: async (formData: typeof form.values) => {
        // Handle image manually for zod to validate properly on server-side
        const manualFormData = new FormData()
        manualFormData.append('name', formData.name!)
        manualFormData.append('workspace_id', workspaceId)
        if (fileInputRef.value?.files?.[0]) manualFormData.append('image', fileInputRef.value.files[0])
        if (!fileInputRef.value?.files?.[0] && !image.value) manualFormData.append('image', 'null') // user removes image

        const res =
            await $fetch(`/api/projects/${data.$id}`, { method: 'PATCH', body: manualFormData })
        if ((res as { project: Models.Document } | null)?.project) {
            await Promise.all([
                queryClient.refetchQueries({ queryKey: ['projects', workspaceId] }), // refetch projects
                queryClient.refetchQueries({ queryKey: ['project', data.$id] }), // refetch the current project
                onSuccess?.()
            ])

            toast.success('Project updated')
        } else toast.error('Failed to update project')
    },
    onError: () => toast.error('Failed to update project')
})

const handleSubmit = isAdmin ? form.handleSubmit((values) => mutate(values)) : () => null

const handleCancel = () => {
    if (onCancel) onCancel()
    else navigateTo(`/workspaces/${workspaceId}/projects/${data.$id}`)
}

const { openModal } = useConfirmModal()

// Delete project
// Only admin can delete projects
const deleteProject = async () => {
    if (!isAdmin) return

    await $fetch(`/api/projects/${data.$id}`, { method: 'DELETE', body: { workspaceId } })
        .then(async () => {
            // refetch workspaces
            await queryClient.refetchQueries({ queryKey: ['projects', workspaceId] })

            // redirect to homepage
            navigateTo(`/workspaces/${workspaceId}`, { replace: true })

            toast.success('Project deleted')
        }).catch(() => {
            toast.error('Failed to delete project')
        })
}

const showDeleteModal = () => {
    openModal(ConfirmModal, {
        onConfirm: deleteProject,
        title: 'Delete project',
        message: 'This action cannot be undone.',
        variant: 'destructive'
    })
}
</script>

<template>
    <div class="flex flex-col gap-y-4">
        <Card class="size-full border-none shadow-none gap-0 p-0">
            <CardHeader class="flex items-center gap-x-4 p-7 space-y-0">
                <Button variant="secondary" size="sm" @click="handleCancel">
                    <Icon name="lucide:arrow-left" size="16px" class="size-4 mr-1" />
                    Back
                </Button>
                <CardTitle class="text-xl font-bold">
                    {{ data.name }}
                </CardTitle>
            </CardHeader>
            <div class="px-7">
                <DottedSeparator />
            </div>
            <CardContent class="py-7">
                <form @submit="handleSubmit">
                    <fieldset :disabled="!isAdmin || isPending">
                        <div class="flex flex-col gap-y-4">
                            <FormField v-slot="{ componentField }" name="workspace_id">
                                <FormItem>
                                    <Input type="hidden" v-bind="componentField" />
                                    <FormMessage />
                                </FormItem>
                            </FormField>
                            <FormField v-slot="{ componentField }" name="name">
                                <FormItem>
                                    <FormLabel>Project Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter workspace name" v-bind="componentField" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            </FormField>
                            <FormField name="image">
                                <FormItem>
                                    <div class="flex flex-col gap-y-2">
                                        <div class="flex items-center gap-x-5">
                                            <div v-if="image" class="size-[72px] relative rounded-md overflow-hidden">
                                                <img alt="logo" class="object-cover" :src="image" />
                                            </div>
                                            <Avatar v-else class="size-[72px]">
                                                <AvatarFallback>
                                                    <Icon name="lucide:image" size="36px"
                                                        class="size-9 text-neutral-400" />
                                                </AvatarFallback>
                                            </Avatar>
                                            <div class="flex flex-col">
                                                <p class="text-sm">Project Icon</p>
                                                <p class="text-sm text-muted-foreground">JPG, PNG, SVG or JPEG, max 1MB
                                                </p>
                                                <input type="file" accept=".jpg, .jpeg, .png, .svg" ref="fileInputRef"
                                                    class="hidden" @change="onUploadImage" />
                                                <Button v-if="image" type="button" variant="destructive" size="xs"
                                                    @click="removeImage" class="w-fit mt-2">
                                                    Remove image
                                                </Button>
                                                <Button v-else type="button" variant="teritary" size="xs"
                                                    @click="fileInputRef?.click()" class="w-fit mt-2">
                                                    Upload image
                                                </Button>
                                            </div>
                                        </div>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            </FormField>
                        </div>
                        <DottedSeparator class="py-7" />
                        <div class="flex items-center justify-between gap-5">
                            <Button v-if="!!onCancel" type="button" variant="secondary" size="lg" @click="onCancel"
                                :disabled="isPending" class="w-24">Cancel</Button>
                            <Button type="submit" variant="primary" size="lg" :disabled="isPending"
                                class="w-24 ml-auto">
                                <Icon v-if="isPending" name="svg-spinners:8-dots-rotate" size="16px" class="size-4" />
                                <span v-else>Update</span>
                            </Button>
                        </div>
                    </fieldset>
                </form>
            </CardContent>
        </Card>

        <Card v-if="isOwner" class="size-full border-none shadow-none gap-0 p-0">
            <CardContent class="py-7">
                <div class="flex flex-col">
                    <h3 class="font-bold">Danger Zone</h3>
                    <p class="text-sm text-muted-foreground">
                        Deleting a project is irreversible and will remove all associated data.
                    </p>
                    <DottedSeparator class="py-7" />
                    <Button type="button" variant="destructive" size="sm" :disabled="isPending" @click="showDeleteModal"
                        class="w-fit ml-auto">Delete project</Button>
                </div>
            </CardContent>
        </Card>
    </div>
</template>