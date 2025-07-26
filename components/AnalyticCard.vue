<script setup lang="ts">
import { cn } from '~/lib/utils';

const { title, value, variant, increaseValue } = defineProps<{
    title: string;
    value: number;
    variant: 'up' | 'down';
    increaseValue: number;
}>()

const colorVariant = variant === 'up' ? 'text-emerald-500' : 'text-red-500'
const increaseValueVariant = variant === 'up' ? 'text-emerald-500' : 'text-red-500'
const iconName = variant === 'up' ? 'carbon:caret-up' : 'carbon:caret-down'
</script>

<template>
    <Card class="w-full border-none shadow-none">
        <CardHeader>
            <div class="flex items-center gap-x-2.5">
                <CardDescription class="flex items-center gap-x-2 font-medium overflow-hidden">
                    <span class="text-base truncate">{{ title }}</span>
                </CardDescription>
                <div class="flex items-center gap-x-1">
                    <Icon :name="iconName" size="16px" :class="cn('size-4', colorVariant)" />
                    <span :class="cn('text-base font-medium truncate', increaseValueVariant)">{{ increaseValue }}</span>
                </div>
            </div>
            <CardTitle class="text-3xl font-semibold">{{ value }}</CardTitle>
        </CardHeader>
    </Card>
</template>