<script setup lang="ts">
const route = useRoute()

const routes = computed(() => [
    {
        label: 'Home',
        href: `/workspaces/${route.params['workspaceId']}`,
        icon: 'heroicons:home',
        iconActive: 'heroicons:home-solid'
    },
    {
        label: 'My Tasks',
        href: `/workspaces/${route.params['workspaceId']}/tasks`,
        icon: 'heroicons:check-circle',
        iconActive: 'heroicons:check-circle-solid'
    },
    {
        label: 'Settings',
        href: `/workspaces/${route.params['workspaceId']}/settings`,
        icon: 'heroicons:cog-6-tooth',
        iconActive: 'heroicons:cog-6-tooth-solid'
    },
    {
        label: 'Members',
        href: `/workspaces/${route.params['workspaceId']}/members`,
        icon: 'heroicons:users',
        iconActive: 'heroicons:users-solid'
    }
])
</script>

<template>
    <ul v-if="route.params['workspaceId']"
        class="flex flex-col [&_.router-link-active]:bg-white [&_.router-link-active]:shadow-sm [&_.router-link-active]:text-primary [&_.router-link-active]:hover:opacity-100">
        <NuxtLink v-for="r of routes" :href="r.href">
            <div
                class="flex items-center gap-2.5 p-2.5 rounded-md font-medium text-neutral-500 transition hover:text-primary">
                <Icon :name="r.icon" size="20px" class="size-5 text-neutral-500" />
                {{ r.label }}
            </div>
        </NuxtLink>
    </ul>
</template>