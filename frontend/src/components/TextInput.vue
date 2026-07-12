<script setup lang="ts">
import { ref, computed } from 'vue'
import { Eye, EyeOff } from '@lucide/vue'

const props = defineProps<{
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

const isPasswordVisible = ref(false)
const isPasswordField = computed(() => props.type === 'password')
const inputType = computed(() => (isPasswordField.value && isPasswordVisible.value ? 'text' : props.type || 'text'))
</script>

<template>
  <div :class="containerClass">
    <label v-if="label" :for="id" class="mb-1.5 block text-[13px] font-semibold text-text-label">
      {{ label }}
    </label>
    <div class="relative">
      <input
        :id="id"
        :value="modelValue"
        :type="inputType"
        :placeholder="placeholder"
        :required="required"
        :class="`w-full border border-border bg-white font-sans text-text-primary placeholder-text-placeholder outline-none ${sizeClasses[size || 'md']} ${isPasswordField ? 'pr-10' : ''}`"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <button
        v-if="isPasswordField"
        type="button"
        tabindex="-1"
        class="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-text-muted hover:text-text-primary"
        :aria-label="isPasswordVisible ? 'Hide password' : 'Show password'"
        @click="isPasswordVisible = !isPasswordVisible"
      >
        <EyeOff v-if="isPasswordVisible" :size="18" />
        <Eye v-else :size="18" />
      </button>
    </div>
  </div>
</template>
