<script setup lang="ts">
import { differenceInDays, format } from 'date-fns';

import { cn } from '~/lib/utils';

const { value, class: className = '' } = defineProps<{ value: string; class?: string }>()

const today = new Date()
const endDate = new Date(value)
const diffInDays = differenceInDays(endDate, today)

let textColor = 'text-muted-foreground'
if (diffInDays <= 3) textColor = 'text-red-500'
else if (diffInDays <= 7) textColor = 'text-orange-500'
else if (diffInDays <= 14) textColor = 'text-yellow-500'
</script>

<template>
    <div :class="textColor">
        <span :class="cn('truncate', className)">{{ format(value, 'PPP') }}</span>
    </div>
</template>