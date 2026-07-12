<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'

import Pagination from '../components/Pagination.vue'
import Breadcrumb from '../components/Breadcrumb.vue'
import PaymentTable from '../components/PaymentTable.vue'
import PaymentDetailPanel from '../components/PaymentDetailPanel.vue'
import TextInput from '../components/TextInput.vue'
import SummaryCard from '../components/SummaryCard.vue'

import { formatCurrency, formatDate, percentageOf, STATUS_META } from '../data/payments'
import { StatusFilter } from '../constants/payment-status'
import { ROUTE_DASHBOARD } from '../constants/routes'
import { usePaymentStore, type Payment } from '../stores/payment.ts'
import { usePaymentFilters } from '../composables/usePaymentFilters'
import { useSlidingIndicator } from '../composables/useSlidingIndicator'

const breadcrumbItems = [{ label: 'Home', to: ROUTE_DASHBOARD }, { label: 'Payments' }]
const pageSize = 10

const paymentStore = usePaymentStore()
const {
    searchQuery,
    status,
    sort,
    currentPage,
    handleStatusChange,
    handleSortToggle,
    goToPage,
    goToPrevPage,
    goToNextPage,
} = usePaymentFilters(pageSize)

const selectedPayment = ref<Payment | null>(null)
const isPanelOpen = ref(false)

const payments = computed(() => paymentStore.payments)
const rows = computed(() => payments.value.map((p) => ({
    ...p,
    meta: STATUS_META[p.status as keyof typeof STATUS_META]
})))

const total = computed(() => paymentStore.summary?.total ?? 0)
const completed = computed(() => paymentStore.summary?.success ?? 0)
const processing = computed(() => paymentStore.summary?.processing ?? 0)
const failed = computed(() => paymentStore.summary?.failed ?? 0)
const pct = (n: number) => percentageOf(n, total.value)

const statusFilters = [
    { label: 'All', value: StatusFilter.ALL },
    { label: 'Completed', value: StatusFilter.COMPLETED },
    { label: 'Processing', value: StatusFilter.PROCESSING },
    { label: 'Failed', value: StatusFilter.FAILED },
]

const filterRefs = useTemplateRef<HTMLElement[]>('filterItems')
const { left: pillLeft, width: pillWidth } = useSlidingIndicator(
    status,
    statusFilters.map((item) => item.value),
    filterRefs,
)

function handleViewDetail(payment: Payment) {
    selectedPayment.value = payment
    isPanelOpen.value = true
}

function handleClosePanel() {
    isPanelOpen.value = false
    selectedPayment.value = null
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
            @view-detail="handleViewDetail"
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

    <PaymentDetailPanel
        :payment="selectedPayment"
        :isOpen="isPanelOpen"
        @close="handleClosePanel"
    />
</template>
