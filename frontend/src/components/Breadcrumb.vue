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
  <nav class="flex items-center gap-2 text-xs text-text-muted" aria-label="Breadcrumb">
    <template v-for="(item, index) in items" :key="index">
      <span v-if="index > 0" class="text-text-divider">/</span>
      <RouterLink
        v-if="item.to"
        :to="item.to"
        class="transition-colors hover:text-text-primary"
      >
        {{ item.label }}
      </RouterLink>
      <span v-else class="font-medium text-text-primary">{{ item.label }}</span>
    </template>
  </nav>
</template>
