<script setup lang="ts">
import type { Models } from 'node-appwrite';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';

import { MEMBER_ROLE } from '~/lib/constant';
import useAuthStore from '~/stores/auth';
import { ConfirmModal } from '#components';

const {
    data,
    workspaceId,
    totalMembers,
    currentUserIsOwner,
    currentUserIsAdmin
} = defineProps<{
    data: Models.Document;
    workspaceId: string;
    totalMembers: number;
    currentUserIsOwner: boolean;
    currentUserIsAdmin: boolean;
}>()

const queryClient = useQueryClient()
const authStore = useAuthStore()

const isSelf = computed(() => data.$id === authStore.user?.$id)
const isMember = computed(() => data.role === MEMBER_ROLE.member)

const canUpgradeOtherMembers = computed(() =>
    !isSelf.value
    && (currentUserIsOwner || currentUserIsAdmin)
    && isMember.value) // only admin can upgrade members to admin

const canDowngradeOtherMembers = computed(() =>
    !isMember.value
    && (
        (currentUserIsOwner && !isSelf.value)
        || (!currentUserIsOwner && isSelf.value)
    )
) // only allow self-downgrade or by workspace owner

const canBeRemoved = computed(() =>
    totalMembers > 1
    && ((currentUserIsOwner && !isSelf.value) || isSelf.value || (currentUserIsAdmin && isMember))
)  // owner can remove members or admins remove members

const currentUserCanControl = computed(() =>
    (currentUserIsOwner && !isSelf.value)
    || (currentUserIsAdmin && (isSelf.value || isMember.value))
    || (!currentUserIsOwner && !currentUserIsAdmin && isSelf.value)
)

// Update member role

// Remove member
const { openModal } = useConfirmModal()

const { isPending: isDeleting, mutate: removeMember } = useMutation({
    mutationFn: async () => {
        const res =
            await $fetch('/api/workspaces/remove-member', {
                method: 'DELETE', body: { membershipId: data.membership_id }
            })
        if (res.ok) {
            await queryClient.refetchQueries({ queryKey: ['members', workspaceId] }) // re-fetch workspace members

            // navigate to homepage if user leaves the workspace
            if (isSelf.value) await navigateTo('/')

            toast.success(isSelf.value ? 'You left the workspace' : 'Member removed')
        } else toast.error(isSelf.value ? 'Failed to leave workspace' : 'Failed to remove member')
    },
    onError: () => toast.error(isSelf.value ? 'Failed to leave workspace' : 'Failed to remove member')
})

const openRemoveMemberModal = () => {
    openModal(ConfirmModal, {
        onConfirm: removeMember,
        title: isSelf.value ? 'Leave workspace' : 'Remove member',
        message: isSelf.value
            ? 'Are you sure you want to leave this workspace?'
            : 'This member will be removed from the workspace.',
        variant: 'destructive'
    })
}
</script>

<template>
    <div class="flex items-center gap-2">
        <WorkspaceMemberAvatar :name="data.name" class="size-10" fallback-class="text-lg" />
        <div class="flex flex-col">
            <p class="text-sm font-medium">{{ data.name }}</p>
            <p class="text-xs text-muted-foreground">{{ data.email }}</p>
            <div class="flex items-center gap-1 mt-1 opacity-55 capitalize">
                <Badge v-if="data.role === MEMBER_ROLE.admin" class="text-[10px]">
                    {{ data.role }}
                </Badge>
                <Badge v-if="isSelf" variant="destructive" class="text-[10px]">
                    You
                </Badge>
            </div>
        </div>
        <DropdownMenu v-if="currentUserCanControl">
            <DropdownMenuTrigger :as-child="true">
                <Button variant="secondary" size="icon" class="ml-auto">
                    <Icon v-if="isDeleting" name="svg-spinners:8-dots-rotate" size="16px"
                        class="size-4 text-muted-foreground" />
                    <Icon v-else name="heroicons:ellipsis-vertical-16-solid" size="16px"
                        class="size-4 text-muted-foreground" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="end">
                <DropdownMenuItem v-if="canUpgradeOtherMembers" class="font-medium">
                    Set as Administrator
                </DropdownMenuItem>
                <DropdownMenuItem v-if="canDowngradeOtherMembers" class="font-medium">
                    Set as Member
                </DropdownMenuItem>
                <DropdownMenuItem v-if="canBeRemoved" @select="openRemoveMemberModal"
                    class="font-medium text-amber-700">
                    <span v-if="isSelf">Leave workspace</span>
                    <span v-else>Remove {{ data.name }}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </div>
</template>