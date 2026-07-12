<script setup lang="ts">
import Breadcrumb from '../components/Breadcrumb.vue'
import { generatePayments, formatCurrency, formatDate, STATUS_META } from '../data/payments'

const breadcrumbItems = [{ label: 'Home', to: '/dashboard' }, { label: 'Payments' }]

const pageSize = 8
const payments = generatePayments()
const total = payments.length
const completed = payments.filter((p) => p.status === 'completed').length
const processing = payments.filter((p) => p.status === 'processing').length
const failed = payments.filter((p) => p.status === 'failed').length
const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0)

const rows = payments.slice(0, pageSize).map((p) => ({
  ...p,
  meta: STATUS_META[p.status],
  canRetry: p.status === 'failed',
  canApprove: p.status === 'processing',
}))

const totalPages = Math.max(1, Math.ceil(total / pageSize))
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
        <input
          type="text"
          placeholder="Search merchant or payment ID…"
          class="min-w-[220px] flex-1 rounded-[9px] border border-[#E5E5EA] bg-white px-3.5 py-2.5 font-sans text-sm text-[#14151C] placeholder-[#ACACB4] outline-none"
        />

        <div class="flex gap-0.5 rounded-[9px] bg-[#EFEFF2] p-[3px]">
          <button type="button" class="cursor-pointer rounded-[7px] border-none bg-white px-3.5 py-2 font-sans text-[13px] font-semibold text-[#14151C]">
            All
          </button>
          <button type="button" class="cursor-pointer rounded-[7px] border-none bg-transparent px-3.5 py-2 font-sans text-[13px] font-semibold text-[#6B6B76]">
            Completed
          </button>
          <button type="button" class="cursor-pointer rounded-[7px] border-none bg-transparent px-3.5 py-2 font-sans text-[13px] font-semibold text-[#6B6B76]">
            Processing
          </button>
          <button type="button" class="cursor-pointer rounded-[7px] border-none bg-transparent px-3.5 py-2 font-sans text-[13px] font-semibold text-[#6B6B76]">
            Failed
          </button>
        </div>

        <button
          type="button"
          class="cursor-pointer rounded-[9px] border border-[#E5E5EA] bg-white px-4 py-2.5 font-sans text-[13px] font-semibold text-[#14151C] transition-colors hover:border-[#B0B0BA]"
        >
          Export CSV
        </button>
      </div>

      <div class="overflow-hidden rounded-[14px] border border-[#E5E5EA] bg-white">
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-sm">
            <thead>
              <tr class="border-b border-[#E5E5EA]">
                <th class="px-5 py-[15px] text-left text-xs font-semibold tracking-wide text-[#6B6B76] uppercase">
                  Payment ID
                </th>
                <th class="cursor-pointer px-5 py-[15px] text-left text-xs font-semibold tracking-wide text-[#6B6B76] uppercase select-none">
                  Merchant
                </th>
                <th class="cursor-pointer px-5 py-[15px] text-left text-xs font-semibold tracking-wide text-[#6B6B76] uppercase select-none">
                  Date ▼
                </th>
                <th class="cursor-pointer px-5 py-[15px] text-right text-xs font-semibold tracking-wide text-[#6B6B76] uppercase select-none">
                  Amount
                </th>
                <th class="cursor-pointer px-5 py-[15px] text-left text-xs font-semibold tracking-wide text-[#6B6B76] uppercase select-none">
                  Status
                </th>
                <th class="px-5 py-[15px] text-right text-xs font-semibold tracking-wide text-[#6B6B76] uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="p in rows"
                :key="p.id"
                class="cursor-pointer border-b border-[#F0F0F3] transition-colors hover:bg-[#FAFAFB]"
              >
                <td class="px-5 py-[15px] font-mono text-[13px] text-[#6B6B76]">{{ p.id }}</td>
                <td class="px-5 py-[15px] font-semibold">{{ p.merchant }}</td>
                <td class="px-5 py-[15px] text-[#6B6B76]">{{ formatDate(p.date) }}</td>
                <td class="px-5 py-[15px] text-right font-semibold">{{ formatCurrency(p.amount) }}</td>
                <td class="px-5 py-[15px]">
                  <span
                    class="inline-block rounded-full px-2.5 py-1 text-xs font-semibold"
                    :style="{ background: p.meta.bg, color: p.meta.color }"
                  >
                    {{ p.meta.label }}
                  </span>
                </td>
                <td class="px-5 py-[15px] text-right">
                  <button
                    v-if="p.canRetry"
                    type="button"
                    class="cursor-pointer rounded-lg border border-[#E5E5EA] bg-white px-3 py-1.5 font-sans text-xs font-semibold text-[#14151C]"
                  >
                    Retry
                  </button>
                  <button
                    v-else-if="p.canApprove"
                    type="button"
                    class="cursor-pointer rounded-lg border border-[#E5E5EA] bg-white px-3 py-1.5 font-sans text-xs font-semibold text-[#14151C]"
                  >
                    Approve
                  </button>
                  <span v-else class="text-[#C7C7D1]">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex items-center justify-between border-t border-[#E5E5EA] px-6 py-4">
          <div class="text-[13px] text-[#6B6B76]">1–{{ rows.length }} of {{ total }}</div>
          <div class="flex items-center gap-2.5">
            <button
              type="button"
              class="cursor-pointer rounded-lg border border-[#E5E5EA] bg-white px-3.5 py-[7px] font-sans text-[13px] font-semibold text-[#14151C]"
            >
              Prev
            </button>
            <div class="text-[13px] text-[#6B6B76]">Page 1 of {{ totalPages }}</div>
            <button
              type="button"
              class="cursor-pointer rounded-lg border border-[#E5E5EA] bg-white px-3.5 py-[7px] font-sans text-[13px] font-semibold text-[#14151C]"
            >
              Next
            </button>
          </div>
        </div>
      </div>
  </div>
</template>
