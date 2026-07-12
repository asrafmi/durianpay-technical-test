<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import { LogOut } from '@lucide/vue'

defineProps<{
  initials: string
  email: string
  roleLabel: string
}>()

const emit = defineEmits<{
  logout: []
}>()

const isOpen = ref(false)
const rootRef = useTemplateRef<HTMLElement>('root')

function toggle() {
  isOpen.value = !isOpen.value
}

function close() {
  isOpen.value = false
}

function handleLogoutClick() {
  close()
  emit('logout')
}

function handleClickOutside(event: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(event.target as Node)) close()
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <div ref="root" class="relative">
    <button
      type="button"
      class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-bg-dark text-xs font-bold text-white transition-opacity hover:opacity-80"
      aria-haspopup="true"
      :aria-expanded="isOpen"
      @click="toggle"
    >
      {{ initials }}
    </button>

    <div
      v-if="isOpen"
      class="absolute top-full right-0 z-50 mt-2 w-56 rounded-[12px] border border-border bg-white py-1.5 shadow-lg"
    >
      <div class="px-3.5 py-2">
        <div class="truncate text-[13px] font-semibold text-text-primary">{{ email }}</div>
        <div class="mt-0.5 text-xs text-text-muted">{{ roleLabel }}</div>
      </div>
      <div class="my-1 border-t border-border" />
      <button
        type="button"
        class="flex w-full cursor-pointer items-center gap-2 px-3.5 py-2 text-left text-[13px] font-semibold text-error transition-colors hover:bg-error-bg"
        @click="handleLogoutClick"
      >
        <LogOut :size="16" />
        Log out
      </button>
    </div>
  </div>
</template>
