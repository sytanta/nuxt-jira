<script setup lang="ts">
import { ResponsiveModal } from '#components';
import UpdateTaskFormWrapper from './UpdateTaskFormWrapper.vue';

const { isOpen, close } = useUpdateTaskModal()

const onModalOpenUpdate = (isOpen: boolean) => {
    if (!isOpen) close()
}
</script>

<template>
    <ResponsiveModal :open="isOpen" @open-update="onModalOpenUpdate">
        <UpdateTaskFormWrapper :on-cancel="close" />
    </ResponsiveModal>
</template>