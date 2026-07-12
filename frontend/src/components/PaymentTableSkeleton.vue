<script setup lang="ts">
withDefaults(defineProps<{ rows?: number }>(), {
  rows: 8,
})
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
            <th class="px-5 py-[15px] text-left text-xs font-semibold tracking-wide text-text-muted uppercase">
              Merchant
            </th>
            <th class="px-5 py-[15px] text-left text-xs font-semibold tracking-wide text-text-muted uppercase">
              Date
            </th>
            <th class="px-5 py-[15px] text-right text-xs font-semibold tracking-wide text-text-muted uppercase">
              Amount
            </th>
            <th class="px-5 py-[15px] text-left text-xs font-semibold tracking-wide text-text-muted uppercase">
              Status
            </th>
            <th class="px-5 py-[15px] text-right text-xs font-semibold tracking-wide text-text-muted uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="i in rows" :key="i" class="border-b border-border">
            <td class="px-5 py-[15px]"><div class="h-4 w-20 animate-pulse rounded bg-border" /></td>
            <td class="px-5 py-[15px]"><div class="h-4 w-28 animate-pulse rounded bg-border" /></td>
            <td class="px-5 py-[15px]"><div class="h-4 w-24 animate-pulse rounded bg-border" /></td>
            <td class="px-5 py-[15px] text-right"><div class="ml-auto h-4 w-20 animate-pulse rounded bg-border" /></td>
            <td class="px-5 py-[15px]"><div class="h-6 w-20 animate-pulse rounded-full bg-border" /></td>
            <td class="px-5 py-[15px] text-right"><div class="ml-auto h-8 w-8 animate-pulse rounded-lg bg-border" /></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
