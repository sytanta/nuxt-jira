<script setup lang="ts">
import { ResponsiveModal } from '#components';
import CreateProjectForm from './CreateProjectForm.vue';

const { isOpen, open, close } = useCreateProjectModal()

const onModalOpenUpdate = (isOpen: boolean) => {
    if (isOpen) open()
    else close()
}
</script>

<template>
    <ResponsiveModal :open="isOpen" @open-update="onModalOpenUpdate">
        <CreateProjectForm :on-cancel="close" />
    </ResponsiveModal>
</template>