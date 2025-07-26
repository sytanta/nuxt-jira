<script setup lang="ts">
import type { ButtonVariants } from './ui/button';

const { open, title, variant = 'primary', closeModal, onConfirm, onClose, onCancel, cleanup } = defineProps<{
    open?: Ref<boolean>,
    title?: string;
    message?: string;
    variant?: ButtonVariants['variant'];
    closeModal?: () => void;
    onConfirm: (result?: boolean) => Promise<void>;
    onClose: (result?: boolean) => Promise<void>;
    onCancel: () => Promise<void>;
    cleanup: () => void;
}>()

const processing = ref(false)

const handleCleanup = () => setTimeout(cleanup, 250) // wait for the modal to finish transitioning

const handleConfirm = async () => {
    processing.value = true
    await onConfirm(true)
    closeModal?.()

    handleCleanup()
}

const handleClose = async () => {
    await onClose()
    closeModal?.()

    handleCleanup()
}

const handleCancel = async () => {
    await onCancel()
    closeModal?.()

    handleCleanup()
}
</script>

<template>
    <ResponsiveModal :open="open?.value ?? false" @open-update="handleClose">
        <Card class="size-full border-none shadow-none">
            <CardContent>
                <CardHeader class="p-0">
                    <CardTitle>{{ title }}</CardTitle>
                    <CardDescription>{{ message }}</CardDescription>
                </CardHeader>
                <div class="pt-4 w-full flex flex-col items-center justify-end gap-x-2 gap-y-2 lg:flex-row">
                    <Button variant="outline" @click="handleCancel" :disabled="processing"
                        class="w-full lg:w-auto">Cancel</Button>
                    <Button :variant="variant" @click="handleConfirm" :disabled="processing" class="w-full lg:w-24">
                        <template v-if="processing">
                            <Icon name="svg-spinners:8-dots-rotate" size="16px" class="size-4" />
                        </template>
                        <template v-else>Confirm</template>
                    </Button>
                </div>
            </CardContent>
        </Card>
    </ResponsiveModal>
</template>