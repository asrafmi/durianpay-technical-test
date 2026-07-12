<script setup lang="ts">
import Breadcrumb from '../components/Breadcrumb.vue'
import { formatCurrency, formatDate, STATUS_META } from '../data/payments'
import { PaymentStatus } from '../constants/payment-status'
import { ROUTE_DASHBOARD } from '../constants/routes'
import { usePaymentStore } from '../stores/payment.ts'
import { computed, ref, watchEffect } from 'vue'

const breadcrumbItems = [{ label: 'Home', to: ROUTE_DASHBOARD }, { label: 'Payments' }]

const pageSize = 10
const searchQuery = ref<string>('')
const status = ref<string>(PaymentStatus.ALL)
const currentPage = ref<number>(1)
const paymentStore = usePaymentStore()

watchEffect(() => {
    const fetchPayments = async () => {
        await paymentStore.fetchPayments({
            search: searchQuery.value,
            page: currentPage.value,
            limit: pageSize,
            status: status.value,
        })
    }

    fetchPayments()
})

const payments = computed(() => paymentStore.payments)
const total = computed(() => payments.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))
const rows = computed(() => payments.value.map((p) => ({
    ...p,
    meta: STATUS_META[p.status as keyof typeof STATUS_META]
})))
const pct = (n: number) => (total.value ? Math.round((n / total.value) * 100) : 0)

const completed = computed(() => payments.value.filter((p) => p.status === PaymentStatus.COMPLETED).length)
const processing = computed(() => payments.value.filter((p) => p.status === PaymentStatus.PROCESSING).length)
const failed = computed(() => payments.value.filter((p) => p.status === PaymentStatus.FAILED).length)

const handleStatusChange = (newStatus: PaymentStatus) => {
    status.value = newStatus
    currentPage.value = 1
}

</script>

<template>
    <div class="flex flex-col gap-5.5">
        <div>
            <Breadcrumb :items="breadcrumbItems" />
            <div class="mt-2 text-2xl font-bold tracking-tight">Payments</div>
            <div class="mt-0.5 text-sm text-[#6B6B76]">Monitor and manage incoming payments.</div>
        </div>

        <div class="grid grid-cols-4 gap-4">
            <div class="rounded-[14px] border border-[#E5E5EA] bg-white px-5 py-[18px]">
                <div class="text-[13px] font-medium text-[#6B6B76]">Total payments</div>
                <div class="mt-1.5 text-[28px] font-bold">{{ total }}</div>
                <div class="mt-3.5 flex h-1.5 overflow-hidden rounded-md bg-[#F0F0F3]">
                    <div class="bg-[#1A9E5C]" :style="{ width: pct(completed) + '%' }"></div>
                    <div class="bg-[#2563EB]" :style="{ width: pct(processing) + '%' }"></div>
                    <div class="bg-[#E31C4D]" :style="{ width: pct(failed) + '%' }"></div>
                </div>
            </div>
            <div class="rounded-[14px] border border-[#E5E5EA] bg-white px-5 py-[18px]">
                <div class="text-[13px] font-medium text-[#6B6B76]">Completed</div>
                <div class="mt-1.5 text-[28px] font-bold text-[#1A9E5C]">{{ completed }}</div>
                <div class="mt-3.5 h-1.5 overflow-hidden rounded-md bg-[#F0F0F3]">
                    <div class="h-full bg-[#1A9E5C]" :style="{ width: pct(completed) + '%' }"></div>
                </div>
            </div>
            <div class="rounded-[14px] border border-[#E5E5EA] bg-white px-5 py-[18px]">
                <div class="text-[13px] font-medium text-[#6B6B76]">Processing</div>
                <div class="mt-1.5 text-[28px] font-bold text-[#2563EB]">{{ processing }}</div>
                <div class="mt-3.5 h-1.5 overflow-hidden rounded-md bg-[#F0F0F3]">
                    <div class="h-full bg-[#2563EB]" :style="{ width: pct(processing) + '%' }"></div>
                </div>
            </div>
            <div class="rounded-[14px] border border-[#E5E5EA] bg-white px-5 py-[18px]">
                <div class="text-[13px] font-medium text-[#6B6B76]">Failed</div>
                <div class="mt-1.5 text-[28px] font-bold text-[#E31C4D]">{{ failed }}</div>
                <div class="mt-3.5 h-1.5 overflow-hidden rounded-md bg-[#F0F0F3]">
                    <div class="h-full bg-[#E31C4D]" :style="{ width: pct(failed) + '%' }"></div>
                </div>
            </div>
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
            <label for="search-field" class="sr-only">Search</label>
            <input id="search-field" v-model="searchQuery" type="text" placeholder="Search merchant or payment ID…"
                class="min-w-[220px] flex-1 rounded-[9px] border border-[#E5E5EA] bg-white px-3.5 py-2.5 font-sans text-sm text-[#14151C] placeholder-[#ACACB4] outline-none" />

            <div class="flex gap-0.5 rounded-[9px] bg-[#EFEFF2] p-[3px]">
                <button @click="handleStatusChange(PaymentStatus.ALL)" type="button"
                    :class="['cursor-pointer rounded-[7px] border-none px-3.5 py-2 font-sans text-[13px] font-semibold', status === PaymentStatus.ALL ? 'bg-white text-[#14151C]' : 'bg-transparent text-[#6B6B76]']">
                    All
                </button>
                <button @click="handleStatusChange(PaymentStatus.COMPLETED)" type="button"
                    :class="['cursor-pointer rounded-[7px] border-none px-3.5 py-2 font-sans text-[13px] font-semibold', status === PaymentStatus.COMPLETED ? 'bg-white text-[#14151C]' : 'bg-transparent text-[#6B6B76]']">
                    Completed
                </button>
                <button @click="handleStatusChange(PaymentStatus.PROCESSING)" type="button"
                    :class="['cursor-pointer rounded-[7px] border-none px-3.5 py-2 font-sans text-[13px] font-semibold', status === PaymentStatus.PROCESSING ? 'bg-white text-[#14151C]' : 'bg-transparent text-[#6B6B76]']">
                    Processing
                </button>
                <button @click="handleStatusChange(PaymentStatus.FAILED)" type="button"
                    :class="['cursor-pointer rounded-[7px] border-none px-3.5 py-2 font-sans text-[13px] font-semibold', status === PaymentStatus.FAILED ? 'bg-white text-[#14151C]' : 'bg-transparent text-[#6B6B76]']">
                    Failed
                </button>
            </div>

            <button type="button"
                class="cursor-pointer rounded-[9px] border border-[#E5E5EA] bg-white px-4 py-2.5 font-sans text-[13px] font-semibold text-[#14151C] transition-colors hover:border-[#B0B0BA]">
                Export CSV
            </button>
        </div>

        <div class="overflow-hidden rounded-[14px] border border-[#E5E5EA] bg-white">
            <div class="overflow-x-auto">
                <table class="w-full border-collapse text-sm">
                    <thead>
                        <tr class="border-b border-[#E5E5EA]">
                            <th
                                class="px-5 py-[15px] text-left text-xs font-semibold tracking-wide text-[#6B6B76] uppercase">
                                Payment ID
                            </th>
                            <th
                                class="cursor-pointer px-5 py-[15px] text-left text-xs font-semibold tracking-wide text-[#6B6B76] uppercase select-none">
                                Merchant
                            </th>
                            <th
                                class="cursor-pointer px-5 py-[15px] text-left text-xs font-semibold tracking-wide text-[#6B6B76] uppercase select-none">
                                Date ▼
                            </th>
                            <th
                                class="cursor-pointer px-5 py-[15px] text-right text-xs font-semibold tracking-wide text-[#6B6B76] uppercase select-none">
                                Amount
                            </th>
                            <th
                                class="cursor-pointer px-5 py-[15px] text-left text-xs font-semibold tracking-wide text-[#6B6B76] uppercase select-none">
                                Status
                            </th>
                            <th
                                class="px-5 py-[15px] text-right text-xs font-semibold tracking-wide text-[#6B6B76] uppercase">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="p in rows" :key="p.id"
                            class="cursor-pointer border-b border-[#F0F0F3] transition-colors hover:bg-[#FAFAFB]">
                            <td class="px-5 py-[15px] font-mono text-[13px] text-[#6B6B76]">{{ p.id }}</td>
                            <td class="px-5 py-[15px] font-semibold">{{ p.merchant }}</td>
                            <td class="px-5 py-[15px] text-[#6B6B76]">{{ formatDate(p.created_at) }}</td>
                            <td class="px-5 py-[15px] text-right font-semibold">{{ formatCurrency(p.amount) }}</td>
                            <td class="px-5 py-[15px]">
                                <span class="inline-block rounded-full px-2.5 py-1 text-xs font-semibold"
                                    :style="{ background: p.meta.bg, color: p.meta.color }">
                                    {{ p.meta.label }}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="flex items-center justify-between border-t border-[#E5E5EA] px-6 py-4">
                <div class="text-[13px] text-[#6B6B76]">1–{{ rows.length }} of {{ total }}</div>
                <div class="flex items-center gap-2.5">
                    <button type="button"
                        class="cursor-pointer rounded-lg border border-[#E5E5EA] bg-white px-3.5 py-[7px] font-sans text-[13px] font-semibold text-[#14151C]">
                        Prev
                    </button>
                    <div class="text-[13px] text-[#6B6B76]">Page 1 of {{ totalPages }}</div>
                    <button type="button"
                        class="cursor-pointer rounded-lg border border-[#E5E5EA] bg-white px-3.5 py-[7px] font-sans text-[13px] font-semibold text-[#14151C]">
                        Next
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
