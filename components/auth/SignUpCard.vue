<script setup lang="ts">
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { configure, useForm } from 'vee-validate'
import { toTypedSchema } from "@vee-validate/zod"
import { toast } from 'vue-sonner'

import { SignUpSchema } from '~/lib/schema/auth'

const queryClient = useQueryClient()

// Sign up with email & password
configure({
    validateOnBlur: false
});

const form = useForm({
    validationSchema: toTypedSchema(SignUpSchema)
})

const { isPending, mutate } = useMutation({
    mutationFn: async (credentials: typeof form.values) => {
        const res = await $fetch('/api/auth/sign-up', { method: 'POST', body: credentials })
        if (res.ok) {
            await queryClient.refetchQueries({ queryKey: ['auth/me'] })
            await navigateTo('/')
        } else toast.error('Failed to sign up')
    },
    onError: () => toast.error('Failed to sign up')
})

const handleSignUp = form.handleSubmit((values) => mutate(values))
</script>

<template>
    <Card class="size-full md:w-[487px] border-none shadow-none py-0 gap-0">
        <CardHeader class="flex flex-col items-center justify-center text-center p-7">
            <CardTitle class="text-2xl">Sign Up</CardTitle>
            <CardDescription>
                By signing up, you agree to our
                <NuxtLink href="#" class="text-blue-700">Privacy Policy</NuxtLink>
                and
                <NuxtLink href="#" class="text-blue-700">Terms of Service</NuxtLink>
            </CardDescription>
        </CardHeader>
        <div class="px-7">
            <DottedSeparator />
        </div>
        <CardContent class="p-7">
            <form @submit="handleSignUp" class="space-y-4">
                <FormField v-slot="{ componentField }" name="name">
                    <FormItem>
                        <FormControl>
                            <Input placeholder="Enter your name" v-bind="componentField" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                </FormField>
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
                            <Input type="password" placeholder="Enter your password" v-bind="componentField" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                </FormField>
                <Button type="submit" size="lg" class="w-full">
                    <Icon v-if="isPending" name="svg-spinners:8-dots-rotate" size="16px" class="size-4" />
                    <span v-else>Register</span>
                </Button>
            </form>
        </CardContent>
        <div class="px-7">
            <DottedSeparator />
        </div>
        <CardContent class="flex flex-col p-7 gap-y-4">
            <form action="/api/auth/github" method="post">
                <Button variant="secondary" size="lg" class="w-full">
                    <Icon name="logos:github-icon" size="20px" class="size-5 mr-1" />
                    Sign up with GitHub
                </Button>
            </form>
        </CardContent>
        <div class="px-7">
            <DottedSeparator />
        </div>
        <CardContent class="flex items-center justify-center p-7">
            <p>
                Already have an account? <NuxtLink href="/sign-in"><span class="text-blue-700">Sign in</span></NuxtLink>
            </p>
        </CardContent>
    </Card>
</template>