<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import { Clock, X } from '@lucide/vue'
import { useSearchHistory } from '../composables/useSearchHistory'

const props = defineProps<{
  modelValue: string
  id?: string
  placeholder?: string
  containerClass?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { suggestionsFor, addEntry, removeEntry } = useSearchHistory()

const isOpen = ref(false)
const rootRef = useTemplateRef<HTMLElement>('root')

const suggestions = computed(() => suggestionsFor(props.modelValue))

function handleFocus() {
  isOpen.value = true
}

function handleInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
  isOpen.value = true
}

function selectSuggestion(term: string) {
  emit('update:modelValue', term)
  addEntry(term)
  isOpen.value = false
}

function commitSearch() {
  addEntry(props.modelValue)
  isOpen.value = false
}

function handleClickOutside(event: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(event.target as Node)) isOpen.value = false
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <div ref="root" class="relative" :class="containerClass">
    <input
      :id="id"
      :value="modelValue"
      type="text"
      :placeholder="placeholder"
      class="w-full rounded-[9px] border border-border bg-white px-3.5 py-2.5 font-sans text-sm text-text-primary placeholder-text-placeholder outline-none"
      @input="handleInput"
      @focus="handleFocus"
      @keyup.enter="commitSearch"
    />

    <div
      v-if="isOpen && suggestions.length > 0"
      class="absolute top-full left-0 z-50 mt-2 w-full rounded-[12px] border border-border bg-white py-1.5 shadow-lg"
    >
      <div
        v-for="term in suggestions"
        :key="term"
        class="group flex cursor-pointer items-center gap-2 px-3.5 py-2 text-sm text-text-primary hover:bg-bg-light"
        @click="selectSuggestion(term)"
      >
        <Clock :size="14" class="shrink-0 text-text-muted" />
        <span class="flex-1 truncate">{{ term }}</span>
        <X
          :size="14"
          class="shrink-0 text-text-muted opacity-0 hover:text-text-primary group-hover:opacity-100"
          @click.stop="removeEntry(term)"
        />
      </div>
    </div>
  </div>
</template>
