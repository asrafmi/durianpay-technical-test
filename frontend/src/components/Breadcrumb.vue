<script setup lang="ts">
export interface BreadcrumbItem {
  label: string
  to?: string
}

defineProps<{
  items: BreadcrumbItem[]
}>()
</script>

<template>
  <nav class="flex items-center gap-2 text-xs text-[#6B6B76]" aria-label="Breadcrumb">
    <template v-for="(item, index) in items" :key="index">
      <span v-if="index > 0" class="text-[#C7C7D1]">/</span>
      <RouterLink
        v-if="item.to"
        :to="item.to"
        class="transition-colors hover:text-[#14151C]"
      >
        {{ item.label }}
      </RouterLink>
      <span v-else class="font-medium text-[#14151C]">{{ item.label }}</span>
    </template>
  </nav>
</template>
