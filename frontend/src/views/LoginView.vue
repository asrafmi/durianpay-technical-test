<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import TextInput from '../components/TextInput.vue'
import Button from '../components/Button.vue'
import durianpayLogo from '../assets/brand/durianpay-logo.avif'
import awaitToError from '../lib/await-to-error.ts'
import { ROUTE_DASHBOARD } from '../constants/routes'

const LoginAnimation = defineAsyncComponent(() => import('../components/LoginAnimation.vue'))

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const isSigningIn = ref(false)

async function handleSubmit() {
    isSigningIn.value = true
    const [err] = await awaitToError(authStore.login(email.value, password.value))
    isSigningIn.value = false
    if (!err) {
        const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ROUTE_DASHBOARD
        router.push(redirect)
    }
}
</script>

<template>
    <div
        class="relative grid h-screen w-screen grid-cols-1 overflow-hidden bg-bg-page font-sans text-text-primary md:grid-cols-2">
        <div class="hidden flex-col justify-between bg-bg-dark p-14 md:flex">
            <div class="flex items-center gap-3">
                <img :src="durianpayLogo" alt="Durianpay" class="h-10 w-10" />
                <div class="text-xl font-bold tracking-tight text-white">Durianpay</div>
            </div>

            <div class="flex flex-col items-center justify-center">
                <div class="relative mb-2 h-[260px] w-[260px]">
                    <LoginAnimation class="h-[260px] w-[260px]" />
                    <div
                        class="animate-float-a absolute top-1.5 -left-7 h-[22px] w-[22px] text-center text-[22px] leading-[22px] text-[#5A5B66]">
                        +
                    </div>
                    <div
                        class="animate-float-b absolute top-9 -right-6 h-[18px] w-[18px] rounded-full border-[1.5px] border-[#5A5B66]">
                    </div>
                    <div
                        class="animate-float-c absolute bottom-[34px] -left-[30px] h-4 w-4 rounded-full border-[1.5px] border-[#5A5B66]">
                    </div>
                    <div
                        class="animate-float-d absolute -right-[22px] bottom-2 h-4 w-4 rotate-45 border-[1.5px] border-[#5A5B66]">
                    </div>
                </div>
                <div class="mt-4 text-4xl leading-tight font-bold tracking-tight text-white text-center">
                    Payments Ops Dashboard
                </div>
                <div class="mt-4 text-base leading-relaxed text-[#9A9AA6] text-center">
                    Monitor incoming payments, track settlement status, and act on exceptions in real
                    time.
                </div>
            </div>

            <div class="text-[13px] text-text-muted">© 2026 PT Durian Pay Indonesia — Internal Tool</div>
        </div>

        <div class="flex items-center justify-center overflow-y-auto bg-white p-10">
            <div class="w-full max-w-[380px]">
                <div class="mb-2 text-2xl font-bold">Welcome back</div>
                <div class="mb-7 text-[15px] text-text-muted">Sign in to access the payments dashboard.</div>

                <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
                    <TextInput v-model="email" type="email" label="Email" placeholder="you@durianpay.id" required size="lg" />
                    <TextInput v-model="password" type="password" label="Password" placeholder="••••••••" required size="lg" />

                    <div v-if="authStore.error" class="rounded-lg bg-error-bg px-3 py-2.5 text-[13px] text-error-text">
                        {{ authStore.error }}
                    </div>

                    <Button type="submit" :loading="isSigningIn" loading-text="Signing in…" class="mt-1">
                        Sign in
                    </Button>
                </form>
            </div>
        </div>
    </div>
</template>
