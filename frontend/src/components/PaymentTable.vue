<script setup lang="ts">
import { ArrowUp } from '@lucide/vue'

interface PaymentRow {
  id: string
  merchant: string
  created_at: string
  amount: number
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
  'sort-toggle': []
}>()
</script>

<template>
  <div class="overflow-hidden rounded-[14px] border border-border bg-white">
    <div class="overflow-x-auto">
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr class="border-b border-border">
            <th class="px-5 py-[15px] text-left text-xs font-semibold tracking-wide text-text-muted uppercase">
              Payment ID
            </th>
            <th class="cursor-pointer px-5 py-[15px] text-left text-xs font-semibold tracking-wide text-text-muted uppercase select-none">
              Merchant
            </th>
            <th class="cursor-pointer px-5 py-[15px] text-left text-xs font-semibold tracking-wide text-text-muted uppercase select-none"
                @click="$emit('sort-toggle')">
              <div class="flex items-center gap-1.5">
                <span>Date</span>
                <ArrowUp
                  :size="16"
                  class="transition-transform duration-300"
                  :style="{ transform: sort === '-created_at' ? 'rotate(180deg)' : 'rotate(0deg)' }"
                />
              </div>
            </th>
            <th class="cursor-pointer px-5 py-[15px] text-right text-xs font-semibold tracking-wide text-text-muted uppercase select-none">
              Amount
            </th>
            <th class="cursor-pointer px-5 py-[15px] text-left text-xs font-semibold tracking-wide text-text-muted uppercase select-none">
              Status
            </th>
            <th class="px-5 py-[15px] text-right text-xs font-semibold tracking-wide text-text-muted uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in rows" :key="p.id"
              class="cursor-pointer border-b border-bg-light transition-colors hover:bg-bg-hover">
            <td class="px-5 py-[15px] font-mono text-[13px] text-text-muted">{{ p.id }}</td>
            <td class="px-5 py-[15px] font-semibold">{{ p.merchant }}</td>
            <td class="px-5 py-[15px] text-text-muted">{{ formatDate(p.created_at) }}</td>
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
  </div>
</template>
