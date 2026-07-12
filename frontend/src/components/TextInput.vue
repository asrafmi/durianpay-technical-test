<script setup lang="ts">
defineProps<{
  modelValue: string
  type?: 'text' | 'email' | 'password'
  placeholder?: string
  label?: string
  id?: string
  required?: boolean
  size?: 'md' | 'lg'
  containerClass?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()

const sizeClasses = {
  md: 'rounded-[9px] px-3.5 py-2.5 text-sm',
  lg: 'rounded-[10px] px-3.5 py-3 text-[15px]',
}
</script>

<template>
  <div :class="containerClass">
    <label v-if="label" :for="id" class="mb-1.5 block text-[13px] font-semibold text-text-label">
      {{ label }}
    </label>
    <input
      :id="id"
      :value="modelValue"
      :type="type || 'text'"
      :placeholder="placeholder"
      :required="required"
      :class="`w-full border border-border bg-white font-sans text-text-primary placeholder-text-placeholder outline-none ${sizeClasses[size || 'md']}`"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>
