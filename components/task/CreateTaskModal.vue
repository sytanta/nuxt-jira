<script setup lang="ts">
import { ResponsiveModal } from '#components';

const { isOpen, open, close } = useCreateTaskModal()

const onModalOpenUpdate = (isOpen: boolean) => {
    if (isOpen) open()
    else close()
}
</script>

<template>
    <ResponsiveModal :open="isOpen" @open-update="onModalOpenUpdate">
        <TaskCreateTaskFormWrapper :on-cancel="close" />
    </ResponsiveModal>
</template>