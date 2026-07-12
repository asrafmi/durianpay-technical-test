import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { useDebounce } from './useDebounce'

function mountDebounce(initial: string, delay?: number) {
  const source = ref(initial)
  let debounced!: ReturnType<typeof useDebounce<string>>

  const Host = defineComponent({
    setup() {
      debounced = useDebounce(source, delay)
      return {}
    },
    template: '<div />',
  })

  const wrapper = mount(Host)
  return { wrapper, source, debounced }
}

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts with the source value', () => {
    const { debounced } = mountDebounce('initial')
    expect(debounced.value).toBe('initial')
  })

  it('does not update immediately when source changes', async () => {
    const { source, debounced } = mountDebounce('a')
    source.value = 'b'
    await nextTick()
    expect(debounced.value).toBe('a')
  })

  it('updates after the delay elapses', async () => {
    const { source, debounced } = mountDebounce('a', 400)
    source.value = 'b'
    await nextTick()

    await vi.advanceTimersByTimeAsync(400)
    expect(debounced.value).toBe('b')
  })

  it('resets the timer on rapid successive changes (only the last value wins)', async () => {
    const { source, debounced } = mountDebounce('a', 400)

    source.value = 'b'
    await nextTick()
    await vi.advanceTimersByTimeAsync(200)
    source.value = 'c'
    await nextTick()
    await vi.advanceTimersByTimeAsync(200)
    expect(debounced.value).toBe('a')

    await vi.advanceTimersByTimeAsync(200)
    expect(debounced.value).toBe('c')
  })

  it('uses a default delay of 400ms', async () => {
    const { source, debounced } = mountDebounce('a')
    source.value = 'b'
    await nextTick()

    await vi.advanceTimersByTimeAsync(399)
    expect(debounced.value).toBe('a')

    await vi.advanceTimersByTimeAsync(1)
    expect(debounced.value).toBe('b')
  })
})
