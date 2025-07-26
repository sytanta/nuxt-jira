<script setup lang="ts">
import type { Models } from 'node-appwrite';
import { templateRef } from '@vueuse/core';
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { configure, useForm } from 'vee-validate'
import { toTypedSchema } from "@vee-validate/zod";
import { toast } from 'vue-sonner';

import { CreateProjectsSchema } from '~/lib/schema/createProject';

const { onCancel } = defineProps<{ onCancel?: () => void }>()

const route = useRoute()
const queryClient = useQueryClient()

configure({
    validateOnBlur: false
});

const form = useForm({
    validationSchema: toTypedSchema(CreateProjectsSchema),
    initialValues: {
        workspace_id: String(route.params['workspaceId'])
    }
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
        manualFormData.append('workspace_id', formData.workspace_id!)
        if (fileInputRef.value?.files?.[0]) manualFormData.append('image', fileInputRef.value.files[0])

        const res =
            await $fetch('/api/projects/create', { method: 'POST', body: manualFormData })
        if (res.project) {
            await queryClient.refetchQueries({ queryKey: ['projects', formData.workspace_id] }) // re-fetch projects

            // reset form
            form.resetForm()
            fileInputRef.value.value = ''
            image.value = ''

            // navigate to the newly created project
            await navigateTo(`/workspaces/${formData.workspace_id!}/projects/${(res.project as Models.Document).$id}`)
            toast.success('Project created')
        } else toast.error('Failed to create project')
    },
    onError: () => toast.error('Failed to create project')
})

const handleSubmit = form.handleSubmit((values) => mutate(values))
</script>

<template>
    <Card class="size-full border-none shadow-none gap-0 p-0">
        <CardHeader class="flex py-7">
            <CardTitle class="font-bold text-xl">
                Create a new project
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
                                <FormLabel>Project Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter project name" v-bind="componentField" />
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
                                            <p class="text-sm">Project Icon</p>
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
                            <span v-else>Create project</span>
                        </Button>
                    </div>
                </fieldset>
            </form>
        </CardContent>
    </Card>
</template>