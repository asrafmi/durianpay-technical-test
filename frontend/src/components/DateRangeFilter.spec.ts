import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import DateRangeFilter from './DateRangeFilter.vue'

function mountFilter(props: { dateFrom?: string; dateTo?: string } = {}) {
  return mount(DateRangeFilter, {
    props: { dateFrom: props.dateFrom ?? '', dateTo: props.dateTo ?? '' },
    attachTo: document.body,
  })
}

describe('DateRangeFilter', () => {
  it('shows a placeholder label when no range is set', () => {
    const wrapper = mountFilter()
    expect(wrapper.text()).toContain('Date range')
  })

  it('shows both dates when a full range is set', () => {
    const wrapper = mountFilter({ dateFrom: '2026-01-01', dateTo: '2026-01-31' })
    expect(wrapper.text()).toContain('2026-01-01 – 2026-01-31')
  })

  it('shows an open-ended "From" label when only dateFrom is set', () => {
    const wrapper = mountFilter({ dateFrom: '2026-01-01' })
    expect(wrapper.text()).toContain('From 2026-01-01')
  })

  it('shows an open-ended "Until" label when only dateTo is set', () => {
    const wrapper = mountFilter({ dateTo: '2026-01-31' })
    expect(wrapper.text()).toContain('Until 2026-01-31')
  })

  it('opens the popover when the trigger button is clicked', async () => {
    const wrapper = mountFilter()
    expect(wrapper.find('#date-from').exists()).toBe(false)

    await wrapper.find('button').trigger('click')

    expect(wrapper.find('#date-from').exists()).toBe(true)
    expect(wrapper.find('#date-to').exists()).toBe(true)
  })

  it('emits update:dateFrom and update:dateTo when Apply is clicked', async () => {
    const wrapper = mountFilter()
    await wrapper.find('button').trigger('click')

    await wrapper.find('#date-from').setValue('2026-02-01')
    await wrapper.find('#date-to').setValue('2026-02-28')

    const applyButton = wrapper.findAll('button').find((b) => b.text() === 'Apply')!
    await applyButton.trigger('click')

    expect(wrapper.emitted('update:dateFrom')?.[0]).toEqual(['2026-02-01'])
    expect(wrapper.emitted('update:dateTo')?.[0]).toEqual(['2026-02-28'])
  })

  it('closes the popover after Apply', async () => {
    const wrapper = mountFilter()
    await wrapper.find('button').trigger('click')
    const applyButton = wrapper.findAll('button').find((b) => b.text() === 'Apply')!
    await applyButton.trigger('click')

    expect(wrapper.find('#date-from').exists()).toBe(false)
  })

  it('emits empty strings for both dates when Clear is clicked', async () => {
    const wrapper = mountFilter({ dateFrom: '2026-01-01', dateTo: '2026-01-31' })
    await wrapper.find('button').trigger('click')

    const clearButton = wrapper.findAll('button').find((b) => b.text() === 'Clear')!
    await clearButton.trigger('click')

    expect(wrapper.emitted('update:dateFrom')?.[0]).toEqual([''])
    expect(wrapper.emitted('update:dateTo')?.[0]).toEqual([''])
  })

  it('does not emit anything if the popover is closed without applying', async () => {
    const wrapper = mountFilter()
    await wrapper.find('button').trigger('click')
    await wrapper.find('#date-from').setValue('2026-02-01')

    // Simulate clicking outside by dispatching a click on document.body.
    document.body.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('update:dateFrom')).toBeUndefined()
  })

  it('resets the draft to the current props when reopened without applying', async () => {
    const wrapper = mountFilter()
    await wrapper.find('button').trigger('click')
    await wrapper.find('#date-from').setValue('2026-02-01')

    // Close without applying, then reopen.
    await wrapper.find('button:first-of-type').trigger('click')
    await wrapper.find('button:first-of-type').trigger('click')

    const input = wrapper.find('#date-from').element as HTMLInputElement
    expect(input.value).toBe('')
  })
})
