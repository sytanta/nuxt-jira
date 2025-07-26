<script setup lang="ts">
const route = useRoute()

const pathnameMap = {
    default: {
        title: 'Home',
        description: 'Monitor all of your projects and tasks here'
    },
    tasks: {
        title: 'My tasks',
        description: 'View all of your tasks here'
    },
    projects: {
        title: 'My project',
        description: 'View tasks of your project here'
    }
}

const titleDescription = computed(() => {
    const pathnameParts = route.path.split('/')
    const pathnameKey = pathnameParts[3] as keyof typeof pathnameMap

    return pathnameMap[pathnameKey] ?? pathnameMap.default
})
</script>

<template>
    <nav class="pt-4 px-6 flex items-center justify-between">
        <div class="hidden flex-col lg:flex">
            <h1 class="text-2xl font-semibold">{{ titleDescription.title }}</h1>
            <p class="text-muted-foreground">{{ titleDescription.description }}</p>
        </div>
        <SideBarMobile />
        <ClientOnly>
            <AuthUserButton />
        </ClientOnly>
    </nav>
</template>