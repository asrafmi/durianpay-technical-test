<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'

import durianpayLogo from '../assets/brand/durianpay-logo.avif'
import { useTypewriter } from '../composables/useTypewriter'

const route = useRoute()

const currentPath = computed(() => route.path)
console.log('Current Path:', currentPath.value) // Log the current path to the console

const sidebarItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Settlements', path: '/settlements' },
]

function getGreetingWord(hour: number): string {
    if (hour < 11) return 'Pagi'
    if (hour < 15) return 'Siang'
    if (hour < 19) return 'Sore'
    return 'Malam'
}

const greetingWord = getGreetingWord(new Date().getHours())

const userName = 'Ops Team'
const userEmail = 'ops@durianpay.id'
const roleLabel = 'Operations'

const { displayText: headerText } = useTypewriter([
    `Selamat ${greetingWord}, ${userName}`,
    'Durianpay Payments Ops Dashboard',
])
</script>

<template>
    <div class="grid h-screen grid-cols-[240px_1fr] bg-[#F6F6F8] font-sans text-[#14151C]">
        <aside class="flex flex-col bg-[#14151C] p-4 pt-6">
            <div class="flex items-center gap-2.5 px-2 pb-6">
                <img :src="durianpayLogo" alt="Durianpay" class="h-8 w-8" />
                <div class="text-base font-bold text-white">Durianpay</div>
            </div>
    
            <nav class="flex flex-col gap-0.5">
                <router-link v-for="item in sidebarItems" :key="item.path" :to="item.path" class="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/8" :class="{ 'bg-white/8': currentPath === item.path }">
                    <span :class="['h-5 w-1 rounded-sm', currentPath === item.path ? 'bg-[#E31C4D]' : 'bg-transparent']" />
                    <span>{{ item.name }}</span>
                </router-link>
            </nav>
    
            <div class="mt-auto border-t border-[#26272F] px-2 pt-3">
                <div class="mt-3 text-[13px] font-semibold text-white">{{ userEmail }}</div>
                <div class="mt-0.5 text-xs text-[#9A9AA6]">{{ roleLabel }}</div>
    
                <router-link to="/login">
                    <button type="button" class="mt-3 w-full cursor-pointer rounded-lg border border-[#26272F] bg-transparent p-2 font-sans text-[13px] text-[#C7C7D1] transition-colors hover:border-[#3A3B45] hover:text-white">
                      Log out
                    </button>
                </router-link>
            </div>
        </aside>
    
        <div class="flex flex-col overflow-hidden">
            <header class="flex items-center justify-between border-b border-[#E5E5EA] bg-white px-10 py-5">
                <div>
                    <div class="flex items-center gap-2">
                        <div class="min-h-7 text-lg font-bold tracking-tight">
                            {{ headerText }}
                        </div>
                    </div>
                    <span class="rounded-full border border-[#E5E5EA] bg-[#F6F6F8] px-2 py-0.5 text-[11px] font-semibold text-[#3A3B45]">
                					{{ roleLabel }}
                					</span>
                </div>
    
                <div class="flex items-center gap-2">
                    <button type="button" aria-label="Toggle theme" class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#E5E5EA] bg-white text-[#6B6B76] transition-colors hover:border-[#B0B0BA]">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                            </svg>
                          </button>
                    <div class="flex h-9 w-9 items-center justify-center rounded-full bg-[#14151C] text-xs font-bold text-white">
                        OP
                    </div>
                </div>
            </header>
    
            <main class="flex-1 overflow-y-auto px-10 py-8">
                <slot />
            </main>
        </div>
    </div>
</template>
