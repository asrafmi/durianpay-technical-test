import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchInputWithHistory from './SearchInputWithHistory.vue'
import { useSearchHistory } from '../composables/useSearchHistory'

function mountInput(modelValue = '') {
  return mount(SearchInputWithHistory, {
    props: { modelValue },
    attachTo: document.body,
  })
}

const { history, addEntry, clearHistory } = useSearchHistory()

describe('SearchInputWithHistory', () => {
  beforeEach(() => {
    clearHistory()
  })

  it('does not show the suggestion dropdown before the input is focused', () => {
    addEntry('acme')
    const wrapper = mountInput()
    expect(wrapper.text()).not.toContain('acme')
  })

  it('shows existing history entries as suggestions on focus', async () => {
    addEntry('acme')
    addEntry('kedai kopi')
    const wrapper = mountInput()

    await wrapper.find('input').trigger('focus')

    expect(wrapper.text()).toContain('acme')
    expect(wrapper.text()).toContain('kedai kopi')
  })

  it('does not show a dropdown when there is no matching history', async () => {
    const wrapper = mountInput()
    await wrapper.find('input').trigger('focus')

    expect(wrapper.find('.absolute').exists()).toBe(false)
  })

  it('emits update:modelValue as the user types', async () => {
    const wrapper = mountInput()
    await wrapper.find('input').setValue('acme')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['acme'])
  })

  it('filters suggestions by the current modelValue', async () => {
    addEntry('kedai kopi')
    addEntry('acme corp')
    const wrapper = mountInput('acme')

    await wrapper.find('input').trigger('focus')

    expect(wrapper.text()).toContain('acme corp')
    expect(wrapper.text()).not.toContain('kedai kopi')
  })

  it('selecting a suggestion emits its value and closes the dropdown', async () => {
    addEntry('acme')
    const wrapper = mountInput()
    await wrapper.find('input').trigger('focus')

    await wrapper.find('.group').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['acme'])
    expect(wrapper.find('.absolute').exists()).toBe(false)
  })

  it('pressing Enter commits the current value to history', async () => {
    const wrapper = mountInput('acme')
    await wrapper.find('input').trigger('keyup.enter')

    expect(history.value).toEqual(['acme'])
  })

  it('removing a suggestion via the clear icon does not select it', async () => {
    addEntry('kedai kopi')
    addEntry('acme')
    const wrapper = mountInput()
    await wrapper.find('input').trigger('focus')

    // history is ['acme', 'kedai kopi'] (most recent first); the last rendered
    // clear icon belongs to 'kedai kopi'.
    await wrapper.findAll('svg').at(-1)!.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(history.value).toEqual(['acme'])
  })

  it('closes the dropdown when clicking outside', async () => {
    addEntry('acme')
    const wrapper = mountInput()
    await wrapper.find('input').trigger('focus')
    expect(wrapper.text()).toContain('acme')

    document.body.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.absolute').exists()).toBe(false)
  })
})
