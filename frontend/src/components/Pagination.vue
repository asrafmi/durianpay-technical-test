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
    changePageSize: (size: number) => void
}>()

const PAGE_WINDOW = 2
const PAGE_OPTIONS = [5, 10, 25, 50, 100]

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
    <div
        class="flex flex-col items-center gap-3 border-t border-border px-4 py-4 sm:flex-row sm:justify-between sm:px-6">
        <div class="text-[13px] text-text-muted">1–{{ rows.length }} of {{ total }}</div>
        <div class="flex items-center gap-1.5 overflow-x-auto">
            <button type="button" :disabled="currentPage === 1"
                class="flex cursor-pointer items-center gap-1 rounded-lg border border-border bg-white px-3 py-1.5 font-sans text-[13px] font-semibold text-text-primary transition-colors hover:border-border-hover disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border"
                @click="goToPrevPage">
                <span aria-hidden="true">‹</span> <span class="hidden sm:inline">Back</span>
            </button>

            <button v-if="pageNumbers[0] > 1" type="button"
                class="h-8 w-8 cursor-pointer rounded-lg border border-border bg-white font-sans text-[13px] font-semibold text-text-primary transition-colors hover:border-border-hover"
                @click="goToPage(1)">
                1
            </button>
            <span v-if="pageNumbers[0] > 2" class="px-1 text-[13px] text-text-muted">…</span>

            <button v-for="page in pageNumbers" :key="page" type="button"
                class="h-8 w-8 cursor-pointer rounded-lg font-sans text-[13px] font-semibold transition-colors" :class="page === currentPage
                    ? 'bg-text-primary text-white'
                    : 'border border-border bg-white text-text-primary hover:border-border-hover'"
                @click="goToPage(page)">
                {{ page }}
            </button>

            <span v-if="pageNumbers[pageNumbers.length - 1] < totalPages - 1"
                class="px-1 text-[13px] text-text-muted">…</span>
            <button v-if="pageNumbers[pageNumbers.length - 1] < totalPages" type="button"
                class="h-8 w-8 cursor-pointer rounded-lg border border-border bg-white font-sans text-[13px] font-semibold text-text-primary transition-colors hover:border-border-hover"
                @click="goToPage(totalPages)">
                {{ totalPages }}
            </button>

            <button type="button" :disabled="currentPage === totalPages"
                class="flex cursor-pointer items-center gap-1 rounded-lg border border-border bg-white px-3 py-1.5 font-sans text-[13px] font-semibold text-text-primary transition-colors hover:border-border-hover disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border"
                @click="goToNextPage">
                <span class="hidden sm:inline">Next</span> <span aria-hidden="true">›</span>
            </button>
            <select name="page-size" id="page-size" :value="pageSize"
                @change="changePageSize(Number(($event.target as HTMLSelectElement).value))"
                class="flex cursor-pointer items-center gap-1 rounded-lg border border-border bg-white px-3 py-1.5 font-sans text-[13px] font-semibold text-text-primary transition-colors hover:border-border-hover disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border">
                <option v-for="option in PAGE_OPTIONS" :key="option" :value="option">{{
                    option }}</option>
            </select>
        </div>
    </div>
</template>