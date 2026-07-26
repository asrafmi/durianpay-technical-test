<script setup lang="ts">
const props = defineProps<{
    id?: string
    label?: string
    modelValue?: number
    placeholder?: string
    required?: boolean
    min?: number
    max?: number
    size?: 'md' | 'lg'
    containerClass?: string
}>()

defineEmits<{
    'update:modelValue': [value: number | undefined]
}>()
const sizeClasses = {
    md: 'rounded-[9px] px-3.5 py-2.5 text-sm',
    lg: 'rounded-[10px] px-3.5 py-3 text-[15px]',
}
</script>
<template>
    <div :class="containerClass || 'flex flex-col gap-1.5'">
        <label :for="id">{{ label }}</label>
        <input type="number" :id="id" :placeholder="placeholder" :required="required" :min="min" :max="max"
            :class="`w-full border border-border bg-white font-sans text-text-primary placeholder-text-placeholder outline-none ${sizeClasses[size || 'md']}`"
            :value="modelValue ?? ''"
            @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value === '' ? undefined : Number(($event.target as HTMLInputElement).value))" />
    </div>
</template>