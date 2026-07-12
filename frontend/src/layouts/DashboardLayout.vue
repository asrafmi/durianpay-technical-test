<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed, useTemplateRef } from 'vue'

import durianpayLogo from '../assets/brand/durianpay-logo.avif'
import { useTypewriter } from '../composables/useTypewriter'
import { useSlidingIndicator } from '../composables/useSlidingIndicator'
import { useAuthStore } from '../stores/auth'
import { ROUTE_LOGIN, ROUTE_DASHBOARD, ROUTE_SETTLEMENTS } from '../constants/routes'
import { UserRole } from '../constants/user-role'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const currentPath = computed(() => route.path)

const sidebarItems = [
    { name: 'Dashboard', path: ROUTE_DASHBOARD },
    { name: 'Settlements', path: ROUTE_SETTLEMENTS },
]

const navRefs = useTemplateRef<{ $el: HTMLElement }[]>('navItems')
const INDICATOR_HEIGHT = 20

const { top: navTop, height: navHeight } = useSlidingIndicator(
    currentPath,
    sidebarItems.map((item) => item.path),
    navRefs,
)
const indicatorTop = computed(() => navTop.value + (navHeight.value - INDICATOR_HEIGHT) / 2)

function getGreetingWord(hour: number): string {
    if (hour < 11) return 'Pagi'
    if (hour < 15) return 'Siang'
    if (hour < 19) return 'Sore'
    return 'Malam'
}

const greetingWord = getGreetingWord(new Date().getHours())

const userEmail = computed(() => authStore.user?.email ?? '')
const roleLabel = computed(() => (authStore.user?.role === UserRole.OPERATION ? 'Operations' : 'CS Agent'))
const userInitials = computed(() => (authStore.user?.role === UserRole.OPERATION ? 'OP' : 'CS'))

const { displayText: headerText } = useTypewriter([
    `Selamat ${greetingWord}, ${userEmail.value}`,
    'Durianpay Payments Ops Dashboard',
])

function handleLogout() {
    authStore.logout()
    router.push(ROUTE_LOGIN)
}
</script>

<template>
    <div class="grid h-screen grid-cols-[240px_1fr] bg-bg-page font-sans text-text-primary">
        <aside class="flex flex-col bg-bg-dark p-4 pt-6">
            <div class="flex items-center gap-2.5 px-2 pb-6">
                <img :src="durianpayLogo" alt="Durianpay" class="h-8 w-8" />
                <div class="text-base font-bold text-white">Durianpay</div>
            </div>

            <nav class="relative flex flex-col gap-0.5">
                <span class="absolute left-3 h-5 w-1 rounded-sm bg-primary transition-[top] duration-300 ease-out"
                    :style="{ top: indicatorTop + 'px' }" />
                <router-link v-for="item in sidebarItems" :key="item.path" ref="navItems" :to="item.path"
                    class="flex items-center gap-2.5 rounded-lg px-3 py-2.5 pl-6 text-sm font-semibold text-white transition-colors hover:bg-white/8"
                    :class="{ 'bg-white/8': currentPath === item.path }">
                    <span>{{ item.name }}</span>
                </router-link>
            </nav>

            <div class="mt-auto border-t border-border-dark px-2 pt-3">
                <div class="mt-3 text-[13px] font-semibold text-white">{{ userEmail }}</div>
                <div class="mt-0.5 text-xs text-text-secondary">{{ roleLabel }}</div>

                <button type="button"
                    class="mt-3 w-full cursor-pointer rounded-lg border border-border-dark bg-transparent p-2 font-sans text-[13px] text-text-divider transition-colors hover:border-text-label hover:text-white"
                    @click="handleLogout">
                    Log out
                </button>
            </div>
        </aside>

        <div class="flex flex-col overflow-hidden">
            <header class="flex items-center justify-between border-b border-border bg-white px-10 py-5">
                <div>
                    <div class="flex items-center gap-2">
                        <div class="min-h-7 text-lg font-bold tracking-tight">
                            {{ headerText }}
                        </div>
                    </div>
                    <span
                        class="rounded-full border border-border bg-bg-page px-2 py-0.5 text-[11px] font-semibold text-text-label">
                        {{ roleLabel }}
                    </span>
                </div>

                <div class="flex items-center gap-2">
                    <div
                        class="flex h-9 w-9 items-center justify-center rounded-full bg-bg-dark text-xs font-bold text-white">
                        {{ userInitials }}
                    </div>
                </div>
            </header>

            <main class="flex-1 overflow-y-auto px-10 py-8">
                <router-view />
            </main>
        </div>
    </div>
</template>
