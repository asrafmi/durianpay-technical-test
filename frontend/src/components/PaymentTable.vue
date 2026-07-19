<script setup lang="ts">
import { ArrowUp, Eye } from '@lucide/vue'
import type { Payment } from '../stores/payment'
import { PaymentListSortParams } from '../constants/payment-list-params'

interface PaymentRow extends Payment {
    meta: {
        label: string
        bg: string
        color: string
    }
}

defineProps<{
    rows: PaymentRow[]
    formatDate: (date: string) => string
    formatCurrency: (amount: number) => string
    sort: string
}>()

defineEmits<{
    'sort-toggle': [column: string]
    'view-detail': [row: PaymentRow]
}>()
</script>

<template>
    <div class="overflow-hidden rounded-[14px] border border-border bg-white">
        <div class="overflow-x-auto">
            <table class="w-full border-collapse text-sm">
                <thead>
                    <tr class="border-b border-border">
                        <th
                            class="px-5 py-[15px] text-left text-xs font-semibold tracking-wide text-text-muted uppercase"
                            @click="$emit('sort-toggle', PaymentListSortParams.ID_ASC)">
                            <div class="flex justify-center items-center gap-1.5">
                                <span>Payment ID</span>
                                <ArrowUp :size="16" class="transition-transform duration-300"
                                    :style="{ transform: sort === PaymentListSortParams.ID_DESC ? 'rotate(180deg)' : 'rotate(0deg)' }" />
                            </div>
                        </th>
                        <th
                            class="cursor-pointer px-5 py-[15px] text-left text-xs font-semibold tracking-wide text-text-muted uppercase select-none">
                            Merchant
                        </th>
                        <th class="cursor-pointer px-5 py-[15px] text-center text-xs font-semibold tracking-wide text-text-muted uppercase select-none"
                            @click="$emit('sort-toggle', PaymentListSortParams.CREATED_AT_ASC)">
                            <div class="flex justify-center items-center gap-1.5">
                                <span>Date</span>
                                <ArrowUp :size="16" class="transition-transform duration-300"
                                    :style="{ transform: sort === PaymentListSortParams.CREATED_AT_DESC ? 'rotate(180deg)' : 'rotate(0deg)' }" />
                            </div>
                        </th>
                        <th class="cursor-pointer px-5 py-[15px] text-center text-xs font-semibold tracking-wide text-text-muted uppercase select-none"
                            @click="$emit('sort-toggle', PaymentListSortParams.AMOUNT_ASC)">
                            <div class="flex justify-center items-center gap-1.5">
                                <span>Amount</span>
                                <ArrowUp :size="16" class="transition-transform duration-300"
                                    :style="{ transform: sort === PaymentListSortParams.AMOUNT_DESC ? 'rotate(180deg)' : 'rotate(0deg)' }" />
                            </div>
                        </th>
                        <th
                            class="cursor-pointer px-5 py-[15px] text-center text-xs font-semibold tracking-wide text-text-muted uppercase select-none">
                            Status
                        </th>
                        <th
                            class="px-5 py-[15px] text-center text-xs font-semibold tracking-wide text-text-muted uppercase">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="p in rows" :key="p.id"
                        class="border-b border-bg-light transition-colors hover:bg-bg-hover">
                        <td class="px-5 py-[15px] font-mono text-[13px] text-text-muted">{{ p.id }}</td>
                        <td class="px-5 py-[15px] font-semibold">{{ p.merchant }}</td>
                        <td class="px-5 py-[15px] text-center text-text-muted">{{ formatDate(p.created_at) }}</td>
                        <td class="px-5 py-[15px] text-center font-semibold">{{ formatCurrency(p.amount) }}</td>
                        <td class="px-5 py-[15px] text-center">
                            <span class="inline-block rounded-full px-2.5 py-1 text-xs font-semibold"
                                :style="{ background: p.meta.bg, color: p.meta.color }">
                                {{ p.meta.label }}
                            </span>
                        </td>
                        <td class="px-5 py-[15px] text-center">
                            <button type="button" @click="$emit('view-detail', p)"
                                class="cursor-pointer inline-flex items-center justify-center rounded-lg p-2 hover:bg-[#F0F0F3] transition-colors text-[#6B6B76] hover:text-[#14151C]"
                                title="View details">
                                <Eye :size="18" />
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
