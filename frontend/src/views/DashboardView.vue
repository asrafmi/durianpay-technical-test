<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watch, watchEffect } from 'vue'

import Pagination from '../components/Pagination.vue'
import Breadcrumb from '../components/Breadcrumb.vue'
import PaymentTable from '../components/PaymentTable.vue'
import TextInput from '../components/TextInput.vue'
import SummaryCard from '../components/SummaryCard.vue'

import { formatCurrency, formatDate, STATUS_META } from '../data/payments'
import { StatusFilter } from '../constants/payment-status'
import { ROUTE_DASHBOARD } from '../constants/routes'
import { usePaymentStore } from '../stores/payment.ts'

const breadcrumbItems = [{ label: 'Home', to: ROUTE_DASHBOARD }, { label: 'Payments' }]

const pageSize = 10
const searchQuery = ref<string>('')
const status = ref<StatusFilter>(StatusFilter.ALL)
const sort = ref<string>('-created_at')
const currentPage = ref<number>(1)
const paymentStore = usePaymentStore()
watchEffect(() => {
    const fetchPayments = async () => {
        await paymentStore.fetchPayments({
            search: searchQuery.value,
            page: currentPage.value,
            limit: pageSize,
            status: status.value,
            sort: sort.value,
        })
    }

    const fetchPaymentSummary = async () => {
        await paymentStore.fetchPaymentSummary()
    }

    Promise.all([fetchPayments(), fetchPaymentSummary()])
})

const payments = computed(() => paymentStore.payments)
const totalPages = computed(() => Math.max(1, Math.ceil(paymentStore.total / pageSize)))
const rows = computed(() => payments.value.map((p) => ({
    ...p,
    meta: STATUS_META[p.status as keyof typeof STATUS_META]
})))
const pct = (n: number) => (total.value ? Math.round((n / total.value) * 100) : 0)

const total = computed(() => paymentStore.summary?.total ?? 0)
const completed = computed(() => paymentStore.summary?.success ?? 0)
const processing = computed(() => paymentStore.summary?.processing ?? 0)
const failed = computed(() => paymentStore.summary?.failed ?? 0)

const handleStatusChange = (newStatus: StatusFilter) => {
    status.value = newStatus
    currentPage.value = 1
}

const handleSortToggle = () => {
    sort.value = sort.value === '-created_at' ? 'created_at' : '-created_at'
    currentPage.value = 1
}

const statusFilters = [
    { label: 'All', value: StatusFilter.ALL },
    { label: 'Completed', value: StatusFilter.COMPLETED },
    { label: 'Processing', value: StatusFilter.PROCESSING },
    { label: 'Failed', value: StatusFilter.FAILED },
]

const filterRefs = useTemplateRef<HTMLElement[]>('filterItems')
const pillLeft = ref(0)
const pillWidth = ref(0)

function updatePill() {
    const activeIndex = statusFilters.findIndex((item) => item.value === status.value)
    const el = filterRefs.value?.[activeIndex]
    if (el) {
        pillLeft.value = el.offsetLeft
        pillWidth.value = el.offsetWidth
    }
}

watch(status, () => nextTick(updatePill), { immediate: true, flush: 'post' })

function goToPage(page: number) {
    currentPage.value = Math.min(Math.max(1, page), totalPages.value)
}

function goToPrevPage() {
    goToPage(currentPage.value - 1)
}

function goToNextPage() {
    goToPage(currentPage.value + 1)
}
</script>

<template>
    <div class="flex flex-col gap-5.5">
        <div>
            <Breadcrumb :items="breadcrumbItems" />
            <div class="mt-2 text-2xl font-bold tracking-tight">Payments</div>
            <div class="mt-0.5 text-sm text-text-muted">Monitor and manage incoming payments.</div>
        </div>

        <div class="grid grid-cols-4 gap-4">
            <SummaryCard
                label="Total payments"
                :value="total"
                :percentage="0"
                showMultiBar
                :bars="[
                    { color: '#1A9E5C', percentage: pct(completed) },
                    { color: '#2563EB', percentage: pct(processing) },
                    { color: '#E31C4D', percentage: pct(failed) },
                ]"
            />
            <SummaryCard label="Completed" :value="completed" color="#1A9E5C" :percentage="pct(completed)" />
            <SummaryCard label="Processing" :value="processing" color="#2563EB" :percentage="pct(processing)" />
            <SummaryCard label="Failed" :value="failed" color="#E31C4D" :percentage="pct(failed)" />
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
            <TextInput v-model="searchQuery" id="search-field" placeholder="Search merchant or payment ID…" containerClass="min-w-[220px] flex-1" />

            <div class="relative flex gap-0.5 rounded-[9px] bg-bg-light p-0.75">
                <span
                    class="absolute top-0.75 bottom-0.75 rounded-[7px] bg-white shadow-sm transition-[left,width] duration-300 ease-out"
                    :style="{ left: pillLeft + 'px', width: pillWidth + 'px' }"
                />
                <button
                    v-for="item in statusFilters"
                    :key="item.value"
                    ref="filterItems"
                    type="button"
                    class="relative cursor-pointer rounded-[7px] border-none px-3.5 py-2 font-sans text-[13px] font-semibold transition-colors"
                    :class="status === item.value ? 'text-text-primary' : 'text-text-muted'"
                    @click="handleStatusChange(item.value)"
                >
                    {{ item.label }}
                </button>
            </div>
        </div>

        <PaymentTable
            :rows="rows"
            :formatDate="formatDate"
            :formatCurrency="formatCurrency"
            :sort="sort"
            @sort-toggle="handleSortToggle"
        />

        <Pagination
            :rows="rows"
            :total="paymentStore.total"
            :currentPage="currentPage"
            :pageSize="pageSize"
            :goToPage="goToPage"
            :goToPrevPage="goToPrevPage"
            :goToNextPage="goToNextPage"
        />
    </div>
</template>
