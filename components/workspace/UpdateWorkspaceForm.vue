<script setup lang="ts">
import type { Models } from 'node-appwrite';
import { templateRef } from '@vueuse/core';
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { configure, useForm } from 'vee-validate'
import { toTypedSchema } from "@vee-validate/zod";
import { toast } from 'vue-sonner';

import { UpdateWorkspaceSchema } from '~/lib/schema/updateWorkspace';
import { ConfirmModal } from '#components';

const { data, isOwner, isAdmin, onSuccess, onCancel } = defineProps<{
    data: Models.Document;
    isOwner: boolean;
    isAdmin: boolean;
    onSuccess?: () => Promise<void>;
    onCancel?: () => void;
}>()

const queryClient = useQueryClient()

configure({
    validateOnBlur: false
});

// Update workspace name & image
const form = useForm({
    validationSchema: toTypedSchema(UpdateWorkspaceSchema),
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
        if (fileInputRef.value?.files?.[0]) manualFormData.append('image', fileInputRef.value.files[0])
        if (!fileInputRef.value?.files?.[0] && !image.value) manualFormData.append('image', 'null') // user removes image

        const res =
            await $fetch(`/api/workspaces/${data.$id}/update`, { method: 'PATCH', body: manualFormData })
        if (res.workspace) {
            await Promise.all([
                queryClient.refetchQueries({ queryKey: ['workspaces/all'] }), // refetch workspaces
                onSuccess?.()
            ])

            toast.success('Workspace updated')
        } else toast.error('Failed to update workspace')
    },
    onError: () => toast.error('Failed to update workspace')
})

const handleSubmit = isAdmin ? form.handleSubmit((values) => mutate(values)) : () => null

const handleCancel = () => {
    if (onCancel) onCancel()
    else navigateTo(`/workspaces/${data.$id}`)
}

const { openModal } = useConfirmModal()

// Invite code control
// Only admins can update invite code
let fullInviteLink = ref(`${window.location.origin}/workspaces/${data.$id}/join/${data.invite_code}`)

const handleCopyInviteLink = () => {
    window.navigator.clipboard.writeText(fullInviteLink.value)
        .then(() => toast.success("Invite link copied"))
}

const resetInviteCode = async () => {
    if (!isAdmin) return

    await $fetch(`/api/workspaces/${data.$id}/reset-invite-code`, { method: 'PATCH' }).then(async (res) => {
        fullInviteLink.value = `${window.location.origin}/workspaces/${data.$id}/join/${res.inviteCode}`

        toast.success('Invite code changed')
    }).catch(() => {
        toast.error('Failed to change invite code')
    })
}

const showResetInviteCodeModal = () => {
    openModal(ConfirmModal, {
        onConfirm: resetInviteCode,
        title: 'Reset invite link',
        message: 'This will invalidate the current invite link.',
        variant: 'destructive'
    })
}

// Delete workspace
// Only owner can delete workspace
const deleteWorkspace = async () => {
    if (!isOwner) return

    await $fetch(`/api/workspaces/${data.$id}/delete`, { method: 'DELETE' }).then(async () => {
        // refetch workspaces
        await queryClient.refetchQueries({ queryKey: ['workspaces/all'] })

        // redirect to homepage
        navigateTo('/', { replace: true })

        toast.success('Workspace deleted')
    }).catch(() => {
        toast.error('Failed to delete workspace')
    })
}

const showDeleteModal = () => {
    openModal(ConfirmModal, {
        onConfirm: deleteWorkspace,
        title: 'Delete workspace',
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
                            <FormField v-slot="{ componentField }" name="name">
                                <FormItem>
                                    <FormLabel>Workspace Name</FormLabel>
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
                                                <p class="text-sm">Workspace Icon</p>
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
                            <Button type="submit" variant="primary" size="lg" :disabled="!isAdmin || isPending"
                                class="w-24 ml-auto">
                                <Icon v-if="isPending" name="svg-spinners:8-dots-rotate" size="16px" class="size-4" />
                                <span v-else>Update</span>
                            </Button>
                        </div>
                    </fieldset>
                </form>
            </CardContent>
        </Card>

        <Card class="size-full border-none shadow-none gap-0 p-0">
            <CardContent class="py-7">
                <div class="flex flex-col">
                    <h3 class="font-bold">Invite Members</h3>
                    <p class="text-sm text-muted-foreground">
                        Use the invite link to add members to your workspace.
                    </p>
                    <div class="mt-4">
                        <div class="flex items-center gap-x-2">
                            <ClientOnly>
                                <Input :model-value="fullInviteLink" disabled />
                            </ClientOnly>
                            <Button variant="secondary" @click="handleCopyInviteLink" class="size-12">
                                <Icon name="lucide:copy" size="20px" class="size-5" />
                            </Button>
                        </div>
                    </div>
                    <DottedSeparator class="py-7" />
                    <Button type="button" variant="destructive" size="sm" :disabled="!isAdmin || isPending"
                        @click="showResetInviteCodeModal" class="w-fit ml-auto">Reset invite link</Button>
                </div>
            </CardContent>
        </Card>

        <Card v-if="isOwner" class="size-full border-none shadow-none gap-0 p-0">
            <CardContent class="py-7">
                <div class="flex flex-col">
                    <h3 class="font-bold">Danger Zone</h3>
                    <p class="text-sm text-muted-foreground">
                        Deleting a workspace is irreversible and will remove all associated data.
                    </p>
                    <DottedSeparator class="py-7" />
                    <Button type="button" variant="destructive" size="sm" :disabled="isPending" @click="showDeleteModal"
                        class="w-fit ml-auto">Delete workspace</Button>
                </div>
            </CardContent>
        </Card>
    </div>
</template>