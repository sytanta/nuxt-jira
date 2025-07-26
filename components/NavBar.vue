<script setup lang="ts">
</script>

<template>
    <nav class="pt-4 px-6 flex items-center justify-between">
        <div class="hidden flex-col lg:flex">
            <h1 class="text-2xl font-semibold">Home</h1>
            <p class="text-muted-foreground">Monitor all of your projects and tasks here</p>
        </div>
        <SideBarMobile />
        <ClientOnly>
            <AuthUserButton />
        </ClientOnly>
    </nav>
</template>