<script setup lang="ts">
</script>

<template>
    <main class="bg-neutral-100">
        <div class="min-h-screen max-w-screen-2xl mx-auto p-4">
            <nav class="flex items-center justify-between h-[73px]">
                <NuxtLink href="/" class="block w-[152px] h-[37px] overflow-hidden">
                    <img src="/public/logo.svg" width="152" height="37" alt="Nuxt Jira" />
                </NuxtLink>
                <AuthUserButton />
            </nav>
            <div class="flex flex-col items-center py-4">
                <slot></slot>
            </div>
        </div>
    </main>
</template>