import { onBeforeUnmount, ref, watch, type Ref } from 'vue'

export function useDebounce<T>(source: Ref<T>, delay = 400) {
  const debounced = ref(source.value) as Ref<T>
  let timer: ReturnType<typeof setTimeout> | undefined

  watch(source, (value) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      debounced.value = value
    }, delay)
  })

  onBeforeUnmount(() => clearTimeout(timer))

  return debounced
}
