<script setup lang="ts">
interface Props {
  label: string
  value: number
  color?: string
  percentage: number
  showMultiBar?: boolean
  bars?: Array<{ color: string; percentage: number }>
}

withDefaults(defineProps<Props>(), {
  showMultiBar: false,
})
</script>

<template>
  <div class="rounded-[14px] border border-border bg-white px-5 py-[18px]">
    <div class="text-[13px] font-medium text-text-muted">{{ label }}</div>
    <div class="mt-1.5 text-[28px] font-bold" :style="{ color: showMultiBar ? 'inherit' : color }">
      {{ value }}
    </div>
    <div class="mt-3.5 flex h-1.5 overflow-hidden rounded-md bg-bg-light">
      <template v-if="showMultiBar && bars">
        <div v-for="(bar, i) in bars" :key="i" :style="{ width: bar.percentage + '%', backgroundColor: bar.color }" />
      </template>
      <template v-else>
        <div class="h-full" :style="{ width: percentage + '%', backgroundColor: color }" />
      </template>
    </div>
  </div>
</template>
