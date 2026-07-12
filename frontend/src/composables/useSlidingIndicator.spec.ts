import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { useSlidingIndicator } from './useSlidingIndicator'

describe('useSlidingIndicator', () => {
  it('sets dimensions to 0 when no matching element is found', async () => {
    const active = ref('missing')
    const elements = ref<HTMLElement[] | null>([])

    const Host = defineComponent({
      setup() {
        const { top, left, width, height } = useSlidingIndicator(active, ['a', 'b'], elements)
        return { top, left, width, height }
      },
      template: '<div />',
    })

    const wrapper = mount(Host)
    await nextTick()
    await nextTick()

    expect((wrapper.vm as any).top).toBe(0)
    expect((wrapper.vm as any).left).toBe(0)
    expect((wrapper.vm as any).width).toBe(0)
    expect((wrapper.vm as any).height).toBe(0)
  })

  it('reads offset* geometry from the element matching the active value', async () => {
    const active = ref('b')
    const fakeEl = {
      offsetTop: 12,
      offsetLeft: 34,
      offsetWidth: 56,
      offsetHeight: 78,
    }
    const elements = ref([undefined, fakeEl, undefined]) as any

    const Host = defineComponent({
      setup() {
        const { top, left, width, height } = useSlidingIndicator(active, ['a', 'b', 'c'], elements)
        return { top, left, width, height }
      },
      template: '<div />',
    })

    const wrapper = mount(Host)
    await nextTick()
    await nextTick()

    expect((wrapper.vm as any).top).toBe(12)
    expect((wrapper.vm as any).left).toBe(34)
    expect((wrapper.vm as any).width).toBe(56)
    expect((wrapper.vm as any).height).toBe(78)
  })

  it('unwraps component refs via $el', async () => {
    const active = ref('x')
    const fakeEl = { offsetTop: 1, offsetLeft: 2, offsetWidth: 3, offsetHeight: 4 }
    const elements = ref([{ $el: fakeEl }]) as any

    const Host = defineComponent({
      setup() {
        const { top, left, width, height } = useSlidingIndicator(active, ['x'], elements)
        return { top, left, width, height }
      },
      template: '<div />',
    })

    const wrapper = mount(Host)
    await nextTick()
    await nextTick()

    expect((wrapper.vm as any).top).toBe(1)
    expect((wrapper.vm as any).width).toBe(3)
  })

  it('recomputes when the active value changes', async () => {
    const active = ref('a')
    const elA = { offsetTop: 0, offsetLeft: 0, offsetWidth: 10, offsetHeight: 10 }
    const elB = { offsetTop: 100, offsetLeft: 200, offsetWidth: 300, offsetHeight: 400 }
    const elements = ref([elA, elB]) as any

    const Host = defineComponent({
      setup() {
        const { top, left, width, height } = useSlidingIndicator(active, ['a', 'b'], elements)
        return { top, left, width, height }
      },
      template: '<div />',
    })

    const wrapper = mount(Host)
    await nextTick()
    await nextTick()
    expect((wrapper.vm as any).left).toBe(0)

    active.value = 'b'
    await nextTick()
    await nextTick()
    expect((wrapper.vm as any).left).toBe(200)
    expect((wrapper.vm as any).width).toBe(300)
  })
})
