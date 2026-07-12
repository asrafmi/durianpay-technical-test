<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
    rows: unknown[]
    total: number
    currentPage: number
    pageSize: number
    goToPage: (page: number) => void
    goToPrevPage: () => void
    goToNextPage: () => void
}>()

const PAGE_WINDOW = 2

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const pageNumbers = computed(() => {
    const start = Math.max(1, props.currentPage - PAGE_WINDOW)
    const end = Math.min(totalPages.value, props.currentPage + PAGE_WINDOW)
    const pages: number[] = []
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
})

</script>
<template>
    <div class="flex items-center justify-between border-t border-[#E5E5EA] px-6 py-4">
        <div class="text-[13px] text-[#6B6B76]">1–{{ rows.length }} of {{ total }}</div>
        <div class="flex items-center gap-1.5">
            <button type="button" :disabled="currentPage === 1"
                class="flex cursor-pointer items-center gap-1 rounded-lg border border-[#E5E5EA] bg-white px-3 py-1.5 font-sans text-[13px] font-semibold text-[#14151C] transition-colors hover:border-[#B0B0BA] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#E5E5EA]"
                @click="goToPrevPage">
                <span aria-hidden="true">‹</span> Back
            </button>

            <button v-if="pageNumbers[0] > 1" type="button"
                class="h-8 w-8 cursor-pointer rounded-lg border border-[#E5E5EA] bg-white font-sans text-[13px] font-semibold text-[#14151C] transition-colors hover:border-[#B0B0BA]"
                @click="goToPage(1)">
                1
            </button>
            <span v-if="pageNumbers[0] > 2" class="px-1 text-[13px] text-[#6B6B76]">…</span>

            <button v-for="page in pageNumbers" :key="page" type="button"
                class="h-8 w-8 cursor-pointer rounded-lg font-sans text-[13px] font-semibold transition-colors" :class="page === currentPage
                    ? 'bg-[#14151C] text-white'
                    : 'border border-[#E5E5EA] bg-white text-[#14151C] hover:border-[#B0B0BA]'"
                @click="goToPage(page)">
                {{ page }}
            </button>

            <span v-if="pageNumbers[pageNumbers.length - 1] < totalPages - 1"
                class="px-1 text-[13px] text-[#6B6B76]">…</span>
            <button v-if="pageNumbers[pageNumbers.length - 1] < totalPages" type="button"
                class="h-8 w-8 cursor-pointer rounded-lg border border-[#E5E5EA] bg-white font-sans text-[13px] font-semibold text-[#14151C] transition-colors hover:border-[#B0B0BA]"
                @click="goToPage(totalPages)">
                {{ totalPages }}
            </button>

            <button type="button" :disabled="currentPage === totalPages"
                class="flex cursor-pointer items-center gap-1 rounded-lg border border-[#E5E5EA] bg-white px-3 py-1.5 font-sans text-[13px] font-semibold text-[#14151C] transition-colors hover:border-[#B0B0BA] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#E5E5EA]"
                @click="goToNextPage">
                Next <span aria-hidden="true">›</span>
            </button>
        </div>
    </div>
</template>