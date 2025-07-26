<script setup lang="ts">
import type { Models } from 'node-appwrite';
import { templateRef } from '@vueuse/core';
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { configure, useForm } from 'vee-validate'
import { toTypedSchema } from "@vee-validate/zod";
import { toast } from 'vue-sonner';

import { CreateWorkspaceSchema } from '~/lib/schema/createWorkspace';

const { onCancel } = defineProps<{ onCancel?: () => void }>()

const queryClient = useQueryClient()

configure({
    validateOnBlur: false
});

const form = useForm({
    validationSchema: toTypedSchema(CreateWorkspaceSchema),
})

const fileInputRef = templateRef('fileInputRef')
const image = ref('')
const onUploadImage = (e: Event) => {
    const file = (e.currentTarget as HTMLInputElement).files?.[0]
    image.value = file ? URL.createObjectURL(file) : ''
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

        const res: { workspace: Models.Document } =
            await $fetch('/api/workspaces/create', { method: 'POST', body: manualFormData })
        if (res.workspace) {
            await queryClient.refetchQueries({ queryKey: ['workspaces/all'] }) // re-fetch workspaces

            // reset form
            form.resetForm()
            fileInputRef.value.value = ''
            image.value = ''

            // navigate to the newly created workspace
            await navigateTo(`/workspaces/${res.workspace.$id}`)
            toast.success('Workspace created')
        } else toast.error('Failed to create workspace')
    },
    onError: () => toast.error('Failed to create workspace')
})

const handleSubmit = form.handleSubmit((values) => mutate(values))
</script>

<template>
    <Card class="size-full border-none shadow-none gap-0 p-0">
        <CardHeader class="flex py-7">
            <CardTitle class="font-bold text-xl">
                Create a new workspace
            </CardTitle>
        </CardHeader>
        <div class="px-7">
            <DottedSeparator />
        </div>
        <CardContent class="py-7">
            <form @submit="handleSubmit">
                <fieldset :disabled="isPending">
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
                        <FormField v-slot="{ componentField }" name="image">
                            <FormItem>
                                <div class="flex flex-col gap-y-2">
                                    <div class="flex items-center gap-x-5">
                                        <div v-if="image" class="size-[72px] relative rounded-md overflow-hidden">
                                            <img alt="logo" class="object-cover" :src="image" />
                                        </div>
                                        <Avatar v-else class="size-[72px]">
                                            <AvatarFallback>
                                                <Icon name="lucide:image" size="36px" class="size-9 text-neutral-400" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div class="flex flex-col">
                                            <p class="text-sm">Workspace Icon</p>
                                            <p class="text-sm text-muted-foreground">JPG, PNG, SVG or JPEG, max 1MB</p>
                                            <input type="file" accept=".jpg, .jpeg, .png, .svg" ref="fileInputRef"
                                                class="hidden" v-bind="componentField" @change="onUploadImage" />
                                            <Button v-if="componentField.modelValue" type="button" variant="destructive"
                                                size="xs" @click="removeImage" class="w-fit mt-2">
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
                            class="w-24">Cancel</Button>
                        <Button type="submit" variant="primary" size="lg" class="w-44 ml-auto">
                            <Icon v-if="isPending" name="svg-spinners:8-dots-rotate" size="16px" class="size-4" />
                            <span v-else>Create workspace</span>
                        </Button>
                    </div>
                </fieldset>
            </form>
        </CardContent>
    </Card>
</template>