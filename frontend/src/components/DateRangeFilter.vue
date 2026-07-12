<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'
import { Calendar, X } from '@lucide/vue'

const props = defineProps<{
  dateFrom: string
  dateTo: string
}>()

const emit = defineEmits<{
  'update:dateFrom': [value: string]
  'update:dateTo': [value: string]
}>()

const isOpen = ref(false)
const rootRef = useTemplateRef<HTMLElement>('root')

const draftFrom = ref(props.dateFrom)
const draftTo = ref(props.dateTo)

const hasActiveRange = computed(() => !!(props.dateFrom || props.dateTo))

const label = computed(() => {
  if (!props.dateFrom && !props.dateTo) return 'Date range'
  if (props.dateFrom && props.dateTo) return `${props.dateFrom} – ${props.dateTo}`
  if (props.dateFrom) return `From ${props.dateFrom}`
  return `Until ${props.dateTo}`
})

function toggle() {
  if (!isOpen.value) {
    draftFrom.value = props.dateFrom
    draftTo.value = props.dateTo
  }
  isOpen.value = !isOpen.value
}

function close() {
  isOpen.value = false
}

function apply() {
  emit('update:dateFrom', draftFrom.value)
  emit('update:dateTo', draftTo.value)
  close()
}

function clear() {
  draftFrom.value = ''
  draftTo.value = ''
  emit('update:dateFrom', '')
  emit('update:dateTo', '')
  close()
}

function handleClickOutside(event: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(event.target as Node)) close()
}

watch(
  () => [props.dateFrom, props.dateTo],
  ([from, to]) => {
    draftFrom.value = from
    draftTo.value = to
  },
)

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <div ref="root" class="relative">
    <button
      type="button"
      class="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-[9px] border px-3.5 py-2.5 font-sans text-sm font-semibold transition-colors"
      :class="hasActiveRange
        ? 'border-primary bg-primary/8 text-primary'
        : 'border-border bg-white text-text-primary hover:border-border-hover'"
      aria-haspopup="true"
      :aria-expanded="isOpen"
      @click="toggle"
    >
      <Calendar :size="16" />
      <span class="max-w-[180px] truncate">{{ label }}</span>
      <X
        v-if="hasActiveRange"
        :size="14"
        class="ml-0.5 shrink-0 rounded-full hover:bg-primary/15"
        @click.stop="clear"
      />
    </button>

    <div
      v-if="isOpen"
      class="absolute top-full left-0 z-50 mt-2 w-[280px] rounded-[12px] border border-border bg-white p-4 shadow-lg sm:left-auto sm:right-0"
    >
      <div class="flex flex-col gap-3">
        <div>
          <label for="date-from" class="mb-1.5 block text-[13px] font-semibold text-text-label">From</label>
          <input
            id="date-from"
            v-model="draftFrom"
            type="date"
            :max="draftTo || undefined"
            class="w-full rounded-[9px] border border-border bg-white px-3.5 py-2.5 font-sans text-sm text-text-primary outline-none"
          />
        </div>
        <div>
          <label for="date-to" class="mb-1.5 block text-[13px] font-semibold text-text-label">To</label>
          <input
            id="date-to"
            v-model="draftTo"
            type="date"
            :min="draftFrom || undefined"
            class="w-full rounded-[9px] border border-border bg-white px-3.5 py-2.5 font-sans text-sm text-text-primary outline-none"
          />
        </div>
      </div>

      <div class="mt-4 flex items-center justify-between gap-2.5">
        <button
          type="button"
          class="cursor-pointer rounded-[9px] px-3 py-2 font-sans text-[13px] font-semibold text-text-muted transition-colors hover:bg-bg-light"
          @click="clear"
        >
          Clear
        </button>
        <button
          type="button"
          class="cursor-pointer rounded-[9px] bg-primary px-4 py-2 font-sans text-[13px] font-semibold text-white transition-colors hover:bg-primary-dark"
          @click="apply"
        >
          Apply
        </button>
      </div>
    </div>
  </div>
</template>
