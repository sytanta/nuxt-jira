<script setup lang="ts">
const { label } = defineProps<{ label: string; }>()
</script>

<template>
    <div class="flex items-start gap-x-2">
        <div class="min-w-[100px]">
            <p class="text-sm text-muted-foreground">{{ label }}</p>
        </div>
        <div class="flex items-center gap-x-2">
            <slot></slot>
        </div>
    </div>
</template>