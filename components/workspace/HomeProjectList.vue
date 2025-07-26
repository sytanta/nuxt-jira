<script setup lang="ts">
import type { Models } from 'node-appwrite';

const { projects } = defineProps<{ projects: Models.Document[] }>()

const { open: openProjectModal } = useCreateProjectModal()
</script>

<template>
    <div class="flex flex-col gap-y-4 col-span-1">
        <div class="bg-white border rounded-lg p-4">
            <div class="flex items-center justify-between">
                <p class="text-lg font-semibold">
                    Projects ({{ projects.length }})
                </p>
                <Button variant="secondary" size="icon" @click="openProjectModal">
                    <Icon name="lucide:plus" size="16px" class="size-4 text-neutral-400" />
                </Button>
            </div>
            <DottedSeparator class="h-auto my-4" />
            <ul class="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <li v-for="project of projects" :key="project.$id">
                    <NuxtLink :href="`/workspaces/${project.workspace_id}/projects/${project.$id}`">
                        <Card class="shadow-none rounded-lg transition hover:opacity-75">
                            <CardContent class="flex items-center gap-x-2.5 p-4">
                                <ProjectAvatar :name="project.name" :image="project.image_url" class="size-12"
                                    fallback-class="text-lg" />
                                <p class="text-lg font-medium truncate">{{ project.name }}</p>
                            </CardContent>
                        </Card>
                    </NuxtLink>
                </li>
                <li v-if="!projects?.length" class="text-sm text-muted-foreground text-center">
                    No projects found
                </li>
            </ul>
        </div>
    </div>
</template>