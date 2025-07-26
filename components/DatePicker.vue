<script setup lang="ts">
import { CalendarDate, type DateValue } from '@internationalized/date';
import { format } from 'date-fns'

import { cn } from '~/lib/utils';

const { value, class: className = '', placeholder = 'Select date', onChange } = defineProps<{
    value: Date | undefined;
    class?: string;
    placeholder?: string;
    onChange?: (date: Date | undefined) => void;
}>()

const displayedDate = ref(value)
const initialDate = value
    ? new CalendarDate(value.getFullYear(), value.getMonth() + 1, value.getDate())
    : undefined

const onSelect = (date: DateValue | undefined) => {
    const nativeDate = date ? new Date(date.year, date.month - 1, date.day) : undefined
    displayedDate.value = nativeDate

    onChange?.(nativeDate)
}
</script>

<template>
    <Popover>
        <PopoverTrigger :as-child="true">
            <Button variant="outline" size="lg"
                :class="cn('w-full text-left font-normal px-3 justify-start', !value && 'text-muted-foreground', className)">
                <Icon name="lucide:calendar" class="size-4 mr-1" />
                <template v-if="displayedDate">{{ format(displayedDate, 'PPP') }}</template>
                <span v-else>{{ placeholder }}</span>
            </Button>
        </PopoverTrigger>
        <PopoverContent class="w-auto p-0">
            <Calendar :model-value="initialDate" :initial-focus="true" @update:model-value="onSelect" />
        </PopoverContent>
    </Popover>
</template>