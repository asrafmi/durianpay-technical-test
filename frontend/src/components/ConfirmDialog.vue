<script setup lang="ts">
import Button from './Button.vue'

withDefaults(
  defineProps<{
    isOpen: boolean
    title: string
    description?: string
    confirmText?: string
    cancelText?: string
  }>(),
  {
    confirmText: 'Confirm',
    cancelText: 'Cancel',
  },
)

defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/50" @click="$emit('cancel')" />

      <div class="relative w-full max-w-sm rounded-[14px] bg-white p-6 shadow-lg">
        <h2 class="text-lg font-bold text-text-primary">{{ title }}</h2>
        <p v-if="description" class="mt-1.5 text-sm text-text-muted">{{ description }}</p>

        <div class="mt-6 flex justify-end gap-2.5">
          <Button type="button" variant="secondary" @click="$emit('cancel')">{{ cancelText }}</Button>
          <Button type="button" variant="danger" @click="$emit('confirm')">{{ confirmText }}</Button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
