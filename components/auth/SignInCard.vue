<script setup lang="ts">
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { configure, useForm } from 'vee-validate'
import { toTypedSchema } from "@vee-validate/zod"
import { toast } from 'vue-sonner'

import { SignInSchema } from '~/lib/schema/auth'

const queryClient = useQueryClient()

// Sign in with email & password
configure({
    validateOnBlur: false
});

const form = useForm({
    validationSchema: toTypedSchema(SignInSchema)
})

const { isPending, mutate } = useMutation({
    mutationFn: async (credentials: typeof form.values) => {
        const res = await $fetch('/api/auth/sign-in', { method: 'POST', body: credentials })
        if (res.ok) {
            await queryClient.refetchQueries({ queryKey: ['auth/me'] })
            await navigateTo('/')
        } else toast.error('Failed to sign in')
    },
    onError: () => toast.error('Failed to sign in')
})

const handleSignIn = form.handleSubmit((values) => mutate(values))
</script>

<template>
    <Card class="size-full md:w-[487px] border-none shadow-none py-0 gap-0">
        <CardHeader class="flex items-center justify-center text-center p-7">
            <CardTitle class="text-2xl">Welcome back!</CardTitle>
        </CardHeader>
        <div class="px-7">
            <DottedSeparator />
        </div>
        <CardContent class="p-7">
            <form @submit="handleSignIn">
                <fieldset :disabled="isPending" class="space-y-4">
                    <FormField v-slot="{ componentField }" name="email">
                        <FormItem>
                            <FormControl>
                                <Input type="email" placeholder="Enter email address" v-bind="componentField" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>
                    <FormField v-slot="{ componentField }" name="password">
                        <FormItem>
                            <FormControl>
                                <Input type="password" minlength="8" maxlength="256" placeholder="Enter password"
                                    v-bind="componentField" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>
                    <Button type="submit" size="lg" class="w-full">
                        <Icon v-if="isPending" name="svg-spinners:8-dots-rotate" size="16px" class="size-4" />
                        <span v-else>Sign in</span>
                    </Button>
                </fieldset>
            </form>
        </CardContent>
        <div class="px-7">
            <DottedSeparator />
        </div>
        <CardContent class="flex flex-col p-7 gap-y-4">
            <form action="/api/auth/github" method="post">
                <Button type="submit" variant="secondary" size="lg" class="w-full">
                    <Icon name="logos:github-icon" size="20px" class="size-5 mr-1" />
                    Sign in with GitHub
                </Button>
            </form>
        </CardContent>
        <div class="px-7">
            <DottedSeparator />
        </div>
        <CardContent class="flex items-center justify-center p-7">
            <p>
                Don't have an account? <NuxtLink href="/sign-up"><span class="text-blue-700">Sign up</span></NuxtLink>
            </p>
        </CardContent>
    </Card>
</template>