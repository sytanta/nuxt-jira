<script setup lang="ts">
import { cn } from '~/lib/utils';

const { name, class: className, fallbackClass } = defineProps<{
    name: string;
    class?: string;
    fallbackClass?: string;
}>()
</script>

<template>
    <Avatar :class="cn('size-5 border border-neutral-300 transition rounded-full', className)">
        <AvatarFallback
            :class="cn('bg-neutral-200 font-medium text-neutral-500 flex items-center justify-center', fallbackClass)">
            {{ name[0].toUpperCase() }}
        </AvatarFallback>
    </Avatar>
</template>