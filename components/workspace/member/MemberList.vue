<script setup lang="ts">
import type { Models } from 'node-appwrite';

import { MEMBER_ROLE } from '~/lib/constant';
import useAuthStore from '~/stores/auth';
import MemberItem from './MemberItem.vue';

const { data, workspaceId } = defineProps<{ data: Models.Document[]; workspaceId: string }>()

const route = useRoute()
const authStore = useAuthStore()

const currentUserMembership = data.find(({ $id }) => $id === authStore.user?.$id)
const currentUserIsOwner = currentUserMembership!.is_owner
const currentUserIsAdmin = !currentUserIsOwner && currentUserMembership!.role === MEMBER_ROLE.admin
</script>

<template>
    <Card class="size-full border-none shadow-none">
        <CardHeader class="flex flex-row items-center gap-x-4 space-y-0 px-7">
            <Button variant="secondary" size="sm" :as-child="true">
                <NuxtLink :href="`/workspaces/${route.params['workspaceId']}`" class="flex items-center">
                    <Icon name="lucide:arrow-left" size="16px" class="size-4 mr-1" />
                    Back
                </NuxtLink>
            </Button>
            <CardTitle class="text-xl font-bold">
                Member list
            </CardTitle>
        </CardHeader>
        <div class="px-7">
            <DottedSeparator />
        </div>
        <CardContent class="px-7">
            <template v-for="(member, index) of data" :key="member.email">
                <MemberItem :data="member" :workspace-id="workspaceId" :total-members="data.length"
                    :current-user-membership-role="currentUserMembership!.role"
                    :current-user-is-owner="currentUserIsOwner" :current-user-is-admin="currentUserIsAdmin" />
                <Separator v-if="index < data.length - 1" class="my-2.5" />
            </template>
        </CardContent>
    </Card>
</template>