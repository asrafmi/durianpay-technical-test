<script setup lang="ts">
interface Props {
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  loadingText?: string
}

withDefaults(defineProps<Props>(), {
  type: 'button',
  variant: 'primary',
  size: 'md',
})

const baseClasses = 'cursor-pointer rounded-[10px] border-none font-sans font-semibold transition-colors'

const sizeClasses = {
  sm: 'px-2 py-1 text-sm',
  md: 'px-3 py-2 text-[15px]',
  lg: 'p-[13px] text-[15px]',
}

const variantClasses = {
  primary: 'bg-primary text-white hover:bg-primary-dark disabled:opacity-70',
  secondary: 'bg-bg-light text-text-primary hover:bg-border disabled:opacity-70',
  danger: 'bg-error text-white hover:bg-primary-dark disabled:opacity-70',
}

const disabledClasses = 'disabled:cursor-not-allowed'
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClasses}`"
  >
    <span v-if="loading">{{ loadingText || 'Loading…' }}</span>
    <slot v-else />
  </button>
</template>
