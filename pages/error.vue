<script setup lang="ts">
import { NuxtLink } from '#components';

</script>

<template>
    <div class="h-screen flex flex-col gap-2 items-center justify-center">
        <Icon name="lucide:triangle-alert" size="24px" class="size-6" />
        <p class="text-sm">Something went wrong</p>
        <Button variant="secondary" class="mt-1">
            <NuxtLink href="/">
                Back to Home
            </NuxtLink>
        </Button>
    </div>
</template>