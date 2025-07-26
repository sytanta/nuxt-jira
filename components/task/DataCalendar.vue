<script setup lang="ts">
import type { Models } from 'node-appwrite';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { format } from 'date-fns';

import type { CreateTaskInject, FilteredTask } from '~/lib/types';
import useComponentToString from '~/composables/useComponentToString';
import CalendarToolbar from './CalendarToolbar.vue';
import EventCard from './EventCard.vue';

interface Event {
    id: string;
    title: string;
    start: string;
    extendedProps: {
        status: string;
        project: Models.Document;
        assignee: {
            $id: string;
            name: string;
            email: string;
        };
    }
}

const { data = [] } = defineProps<{
    data?: FilteredTask[]
}>()

const route = useRoute()
const { componentToString } = useComponentToString()

const events: Event[] = data.map(({ $id, name, status, due_date, project, assignee }) => ({
    id: $id,
    title: name,
    start: due_date,
    extendedProps: {
        status,
        project,
        assignee
    }
}))

const currentMonth = ref(format(new Date(data?.[0].due_date), 'MMMM yyyy'))
let calendar: Calendar | undefined = undefined
onMounted(() => {
    const elm = document.getElementById('calendar')
    if (!elm) return

    new Promise((resolve) => {
        calendar = new Calendar(elm as HTMLElement, {
            plugins: [dayGridPlugin],
            initialView: 'dayGridMonth',
            initialDate: data?.[0].due_date ?? new Date(),
            events,
            headerToolbar: {
                start: '',
                center: '',
                end: ''
            },
            dayCellContent: function (arg) {
                return {
                    html: arg.dayNumberText.padStart(2, '0')
                };
            },
            // render event
            eventContent: function (arg) {
                const { id, title, start, extendedProps } = arg.event as unknown as Event;
                return {
                    html: componentToString(EventCard, {
                        id,
                        title,
                        start,
                        status: extendedProps.status,
                        project: extendedProps.project,
                        assignee: extendedProps.assignee
                    })
                }
            },
            eventClick: function (eventClickInfo) {
                navigateTo(`/workspaces/${route.params['workspaceId']}/tasks/${eventClickInfo.event.id}`)
            },
            // on month change event
            datesSet: function (e) {
                currentMonth.value = format(e.view.calendar.getDate(), 'MMMM yyyy')
            }
        });
        calendar.render()

        resolve(true)
    })
})

// Calendar toolbar buttons
const prev = () => calendar?.prev()
const next = () => calendar?.next()
const today = () => calendar?.today()

// Listen to event of creating task via create-task modal
const onCreateTask: CreateTaskInject | undefined = inject('create-task-inject')

const unsubscribeCreateSuccess = onCreateTask?.subscribeToCreateTaskSuccess((task: FilteredTask) => {
    const { $id, name, status, due_date, project, assignee } = task
    calendar?.addEvent({
        id: $id,
        title: name,
        start: due_date,
        extendedProps: {
            status,
            project,
            assignee
        }
    })
})

onUnmounted(() => {
    calendar?.destroy()
    unsubscribeCreateSuccess?.()
})
</script>

<template>
    <CalendarToolbar :month="currentMonth" :prev="prev" :next="next" :today="today" />
    <div id="calendar"></div>
</template>