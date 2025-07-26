<script setup lang="ts">
import { cn } from '~/lib/utils';

const { name, image, class: className } = defineProps<{
    name: string;
    image?: string;
    class?: string
}>()
</script>

<template>
    <div v-if="image" :class="cn('size-10 relative rounded-md overflow-hidden', className)">
        <img :src="image" :alt="name" class="object-cover" />
    </div>
    <Avatar v-else :class="cn('size-10 rounded-md', className)">
        <AvatarFallback class="text-white bg-blue-600 font-semibold text-lg uppercase rounded-md">
            {{ name[0] }}
        </AvatarFallback>
    </Avatar>
</template>