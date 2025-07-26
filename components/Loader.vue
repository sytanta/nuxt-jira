<script setup lang="ts">
import { cn } from '~/lib/utils';

const { class: className = '' } = defineProps<{ class?: string }>()
</script>

<template>
    <div :class="cn('min-h-screen flex items-center justify-center', className)">
        <Icon name="svg-spinners:8-dots-rotate" size="24px" class="size-6 text-muted-foreground" />
    </div>
</template>