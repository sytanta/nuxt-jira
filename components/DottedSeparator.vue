<script setup lang="ts">
import { cn } from '~/lib/utils';

const {
    class: className = '',
    color = '#d4d4d8',
    height = '2px',
    dotSize = '2px',
    gapSize = '6px',
    direction = 'horizontal'
} = defineProps<{
    class?: string;
    color?: string;
    height?: string;
    dotSize?: string;
    gapSize?: string;
    direction?: 'horizontal' | 'vertical';
}>()

const isHorizontal = direction === 'horizontal'

const dotStyles = {
    width: isHorizontal ? '100%' : height,
    height: isHorizontal ? height : '100%',
    backgroundImage: `radial-gradient(circle, ${color} 25%, transparent 25%)`,
    backgroundSize: isHorizontal
        ? `${parseInt(dotSize) + parseInt(gapSize)}px ${height}`
        : `${height} ${parseInt(dotSize) + parseInt(gapSize)}px`,
    backgroundRepeat: isHorizontal ? 'repeat-x' : 'repeat-y',
    backgroundPosition: 'center'
}
</script>

<template>
    <div :data-horizontal="isHorizontal"
        :class="cn('h-full flex flex-col items-center data-[horizontal=true]:w-full data-[horizontal=true]:flex-row', className)">
        <div :data-horizontal="isHorizontal" class="flex-grow-0 data-[horizontal=true]:flex-grow" :style="dotStyles">
        </div>
    </div>
</template>