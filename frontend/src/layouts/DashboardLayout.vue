<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed, ref, useTemplateRef, watch } from 'vue'
import { LayoutDashboard, Menu, PanelLeft, Settings, X } from '@lucide/vue'

import durianpayLogo from '../assets/brand/durianpay-logo.avif'
import UserMenu from '../components/UserMenu.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import { useTypewriter } from '../composables/useTypewriter'
import { useSlidingIndicator } from '../composables/useSlidingIndicator'
import { useSidebar } from '../composables/useSidebar'
import { useAuthStore } from '../stores/auth'
import { ROUTE_LOGIN, ROUTE_DASHBOARD, ROUTE_SETTINGS } from '../constants/routes'
import { UserRole } from '../constants/user-role'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { isCollapsed, isMobileOpen, toggleCollapsed, closeMobile, openMobile } = useSidebar()

const currentPath = computed(() => route.path)

const sidebarItems = [
    { name: 'Dashboard', path: ROUTE_DASHBOARD, icon: LayoutDashboard },
    { name: 'Settings', path: ROUTE_SETTINGS, icon: Settings },
]

const navRefs = useTemplateRef<{ $el: HTMLElement }[]>('navItems')
const INDICATOR_HEIGHT = 20

const { top: navTop, height: navHeight, update: updateNavIndicator } = useSlidingIndicator(
    currentPath,
    sidebarItems.map((item) => item.path),
    navRefs,
)
const indicatorTop = computed(() => navTop.value + (navHeight.value - INDICATOR_HEIGHT) / 2)

watch(currentPath, closeMobile)

const SIDEBAR_TRANSITION_MS = 300
watch(isCollapsed, () => {
    setTimeout(updateNavIndicator, SIDEBAR_TRANSITION_MS)
})

function getGreetingWord(hour: number): string {
    if (hour < 11) return 'Morning'
    if (hour < 15) return 'Afternoon'
    if (hour < 19) return 'Evening'
    return 'Night'
}

const greetingWord = getGreetingWord(new Date().getHours())

const userEmail = computed(() => authStore.user?.email ?? '')
const roleLabel = computed(() => (authStore.user?.role === UserRole.OPERATION ? 'Operations' : 'CS Agent'))
const userInitials = computed(() => (authStore.user?.role === UserRole.OPERATION ? 'OP' : 'CS'))

const { displayText: headerText } = useTypewriter([
    `Good ${greetingWord}, ${userEmail.value}`,
    'Durianpay Payments Ops Dashboard',
])

const isLogoutDialogOpen = ref(false)

function requestLogout() {
    isLogoutDialogOpen.value = true
}

function cancelLogout() {
    isLogoutDialogOpen.value = false
}

function confirmLogout() {
    isLogoutDialogOpen.value = false
    authStore.logout()
    router.push(ROUTE_LOGIN)
}
</script>

<template>
    <div class="flex h-screen bg-bg-page font-sans text-text-primary">
        <div v-if="isMobileOpen" class="fixed inset-0 z-30 bg-black/50 md:hidden" @click="closeMobile" />

        <aside
            class="fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-bg-dark p-4 pt-6 transition-transform duration-300 ease-out md:static md:translate-x-0 md:transition-[width] md:duration-300"
            :class="[
                isMobileOpen ? 'translate-x-0' : '-translate-x-full',
                isCollapsed ? 'md:w-19' : 'md:w-60',
            ]"
        >
            <div class="flex items-center gap-2.5 px-2 pb-6" :class="{ 'md:justify-center md:px-0': isCollapsed }">
                <img :src="durianpayLogo" alt="Durianpay" class="h-8 w-8 shrink-0" />
                <div class="text-base font-bold text-white" :class="{ 'md:hidden': isCollapsed }">Durianpay</div>

                <button
                    type="button"
                    class="ml-auto hidden shrink-0 cursor-pointer rounded-lg p-1.5 text-text-divider transition-colors hover:bg-white/8 hover:text-white md:flex"
                    :class="{ 'md:hidden': isCollapsed }"
                    title="Collapse sidebar"
                    @click="toggleCollapsed"
                >
                    <PanelLeft :size="18" />
                </button>
            </div>

            <button
                v-if="isCollapsed"
                type="button"
                class="mb-6 hidden w-full cursor-pointer justify-center rounded-lg p-1.5 text-text-divider transition-colors hover:bg-white/8 hover:text-white md:flex"
                title="Expand sidebar"
                @click="toggleCollapsed"
            >
                <PanelLeft :size="18" class="rotate-180" />
            </button>

            <nav class="relative flex flex-col gap-0.5">
                <span
                    class="absolute left-3 h-5 w-1 rounded-sm bg-primary transition-[top] duration-300 ease-out"
                    :class="{ 'md:hidden': isCollapsed }"
                    :style="{ top: indicatorTop + 'px' }" />
                <router-link v-for="item in sidebarItems" :key="item.path" ref="navItems" :to="item.path"
                    class="flex items-center gap-2.5 rounded-lg px-3 py-2.5 pl-6 text-sm font-semibold text-white transition-colors hover:bg-white/8"
                    :class="[
                        currentPath === item.path ? (isCollapsed ? 'md:bg-primary/15' : 'bg-white/8') : '',
                        { 'md:justify-center md:pl-3': isCollapsed },
                    ]"
                    :title="isCollapsed ? item.name : undefined">
                    <component :is="item.icon" :size="18" class="shrink-0" />
                    <span :class="{ 'md:hidden': isCollapsed }">{{ item.name }}</span>
                </router-link>
            </nav>

            <div class="mt-auto border-t border-border-dark px-2 pt-3">
                <div class="mt-3 text-[13px] font-semibold text-white" :class="{ 'md:hidden': isCollapsed }">{{ userEmail }}</div>
                <div class="mt-0.5 text-xs text-text-secondary" :class="{ 'md:hidden': isCollapsed }">{{ roleLabel }}</div>

                <button type="button"
                    class="mt-3 w-full cursor-pointer rounded-lg border border-border-dark bg-transparent p-2 font-sans text-[13px] text-text-divider transition-colors hover:border-text-label hover:text-white"
                    :title="isCollapsed ? 'Log out' : undefined"
                    @click="requestLogout">
                    <span :class="{ 'md:hidden': isCollapsed }">Log out</span>
                    <X v-if="isCollapsed" :size="16" class="mx-auto hidden md:block" />
                </button>
            </div>
        </aside>

        <div class="flex min-w-0 flex-1 flex-col overflow-hidden">
            <header class="flex items-center justify-between gap-3 border-b border-border bg-white px-4 py-4 sm:px-6 md:px-10 md:py-5">
                <div class="flex min-w-0 items-center gap-3">
                    <button
                        type="button"
                        class="shrink-0 cursor-pointer rounded-lg p-2 text-text-muted transition-colors hover:bg-bg-light md:hidden"
                        aria-label="Open sidebar"
                        @click="openMobile"
                    >
                        <Menu :size="20" />
                    </button>

                    <div class="min-w-0">
                        <div class="flex items-center gap-2">
                            <div class="min-h-7 truncate text-base font-bold tracking-tight sm:text-lg">
                                {{ headerText }}
                            </div>
                        </div>
                        <span
                            class="hidden rounded-full border border-border bg-bg-page px-2 py-0.5 text-[11px] font-semibold text-text-label sm:inline-block">
                            {{ roleLabel }}
                        </span>
                    </div>
                </div>

                <div class="flex shrink-0 items-center gap-2">
                    <UserMenu :initials="userInitials" :email="userEmail" :role-label="roleLabel" @logout="requestLogout" />
                </div>
            </header>

            <main class="flex-1 overflow-y-auto px-4 py-6 sm:px-6 md:px-10 md:py-8">
                <router-view />
            </main>
        </div>
    </div>

    <ConfirmDialog
        :is-open="isLogoutDialogOpen"
        title="Log out"
        description="Are you sure you want to log out of your account?"
        confirm-text="Log out"
        cancel-text="Cancel"
        @confirm="confirmLogout"
        @cancel="cancelLogout"
    />
</template>
