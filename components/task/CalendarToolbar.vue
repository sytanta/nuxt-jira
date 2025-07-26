<script setup lang="ts">
const { month, prev, next, today } = defineProps<{
    month: string;
    prev: () => void;
    next: () => void;
    today: () => void;
}>()
</script>

<template>
    <div class="w-full flex items-center justify-center gap-x-2 lg:w-auto lg:justify-start">
        <Button variant="secondary" size="icon" @click="prev">
            <Icon name="lucide:chevron-left" size="16px" class="size-4" />
        </Button>
        <Button variant="secondary" @click="today"
            class="flex items-center justify-center h-8 border border-input rounded-md px-3 py-2 lg:w-auto">
            <Icon name="lucide:calendar" size="16px" class="size-4 mr-2" />
            <p class="text-sm">{{ month }}</p>
        </Button>
        <Button variant="secondary" size="icon" @click="next">
            <Icon name="lucide:chevron-right" size="16px" class="size-4" />
        </Button>
    </div>
</template>