import { nextTick, ref, watch, type Ref } from 'vue'

type IndicatorRect = { offsetTop: number; offsetHeight: number; offsetLeft: number; offsetWidth: number }

export function useSlidingIndicator<T>(
  activeValue: Ref<T>,
  items: T[],
  elements: Ref<(IndicatorRect | { $el: IndicatorRect })[] | null>,
) {
  const top = ref(0)
  const left = ref(0)
  const width = ref(0)
  const height = ref(0)

  function update() {
    const activeIndex = items.findIndex((item) => item === activeValue.value)
    const raw = elements.value?.[activeIndex]
    const el = raw && '$el' in raw ? raw.$el : raw
    if (!el) return

    top.value = el.offsetTop
    left.value = el.offsetLeft
    width.value = el.offsetWidth
    height.value = el.offsetHeight
  }

  watch(activeValue, () => nextTick(update), { immediate: true, flush: 'post' })

  return { top, left, width, height, update }
}
