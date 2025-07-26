<script setup lang="ts">
import type { MEMBER_ROLE } from '~/lib/constant';
import MemberAvatar from './member/MemberAvatar.vue';

const { members } = defineProps<{
    members: {
        $id: string;
        name: string;
        email: string;
        membership_id: string;
        role: keyof typeof MEMBER_ROLE;
        is_owner: boolean;
    }[]
}>()

const route = useRoute()
</script>

<template>
    <div class="flex flex-col gap-y-4 col-span-1">
        <div class="bg-white border rounded-lg p-4">
            <div class="flex items-center justify-between">
                <p class="text-lg font-semibold">
                    Members ({{ members.length }})
                </p>
                <Button variant="secondary" size="icon" :as-child="true">
                    <NuxtLink :href="`/workspaces/${route.params['workspaceId']}/members`">
                        <Icon name="lucide:settings" size="16px" class="size-4 text-neutral-400" />
                    </NuxtLink>
                </Button>
            </div>
            <DottedSeparator class="h-auto my-4" />
            <ul class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <li v-for="member of members" :key="member.$id">
                    <Card class="shadow-none rounded-lg overflow-hidden">
                        <CardContent class="flex flex-col items-center p-3 gap-x-2">
                            <MemberAvatar :name="member.name" class="size-12" />
                            <div class="flex flex-col items-center overflow-hidden">
                                <p class="text-lg font-medium line-clamp-1">{{ member.name }}</p>
                                <p class="text-sm text-muted-foreground line-clamp-1">{{ member.email }}</p>
                            </div>
                        </CardContent>
                    </Card>
                </li>
                <li v-if="!members?.length" class="text-sm text-muted-foreground text-center">
                    No members found
                </li>
            </ul>
        </div>
    </div>
</template>