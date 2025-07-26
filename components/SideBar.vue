<script setup lang="ts">
</script>

<template>
    <aside class="h-full bg-neutral-100 p-4 w-full">
        <NuxtLink href="/" class="block w-[164px] h-[40px] overflow-hidden">
            <NuxtImg src="../public/logo.svg" width="164" height="40" alt="Nuxt Jira" />
        </NuxtLink>
        <DottedSeparator class="my-4 h-fit" direction="horizontal" />
        <WorkspaceSwitcher />
        <DottedSeparator class="my-4 h-fit" direction="horizontal" />
        <Navigation />
        <DottedSeparator class="my-4 h-fit" direction="horizontal" />
        <ProjectListSidebar />
    </aside>
</template>