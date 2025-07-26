<script setup lang="ts">
import { cn } from '~/lib/utils';

const { name, image, class: className, fallbackClass = '' } = defineProps<{
    name: string;
    image?: string;
    class?: string;
    fallbackClass?: string;
}>()
</script>

<template>
    <div v-if="image"
        :class="cn('size-5 flex items-center justify-center relative rounded-md overflow-hidden', className)">
        <img :src="image" :alt="name" class="size-full object-cover" />
    </div>
    <Avatar v-else :class="cn('size-5 rounded-md', className)">
        <AvatarFallback :class="cn('text-white bg-blue-600 font-semibold text-lg uppercase rounded-md', fallbackClass)">
            {{ name[0] }}
        </AvatarFallback>
    </Avatar>
</template>