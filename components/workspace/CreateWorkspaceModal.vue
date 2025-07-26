<script setup lang="ts">
import { ResponsiveModal } from '#components';
import CreateWorkspaceForm from './CreateWorkspaceForm.vue';

const { isOpen, open, close } = useCreateWorkspaceModal()

const onModalOpenUpdate = (isOpen: boolean) => {
    if (isOpen) open()
    else close()
}
</script>

<template>
    <ResponsiveModal :open="isOpen" @open-update="onModalOpenUpdate">
        <CreateWorkspaceForm :on-cancel="close" />
    </ResponsiveModal>
</template>