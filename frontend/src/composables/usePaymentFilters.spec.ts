import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { defineComponent, nextTick } from 'vue'
import { usePaymentFilters } from './usePaymentFilters'
import { usePaymentStore } from '../stores/payment'
import { StatusFilter } from '../constants/payment-status'

function mountFilters(pageSize = 10) {
  let exposed!: ReturnType<typeof usePaymentFilters>

  const Host = defineComponent({
    setup() {
      exposed = usePaymentFilters(pageSize)
      return {}
    },
    template: '<div />',
  })

  const wrapper = mount(Host, {
    global: {
      plugins: [createTestingPinia({ stubActions: true, createSpy: undefined })],
    },
  })

  return { wrapper, filters: exposed }
}

describe('usePaymentFilters', () => {
  it('starts with default filter state', () => {
    const { filters } = mountFilters()
    expect(filters.searchQuery.value).toBe('')
    expect(filters.status.value).toBe(StatusFilter.ALL)
    expect(filters.sort.value).toBe('-created_at')
    expect(filters.currentPage.value).toBe(1)
  })

  it('fetches payments and summary on mount', async () => {
    mountFilters()
    await nextTick()
    const store = usePaymentStore()
    expect(store.fetchPayments).toHaveBeenCalledTimes(1)
    expect(store.fetchPaymentSummary).toHaveBeenCalledTimes(1)
  })

  it('refetches payments when searchQuery changes', async () => {
    const { filters } = mountFilters()
    const store = usePaymentStore()
    await nextTick()
    expect(store.fetchPayments).toHaveBeenCalledTimes(1)

    filters.searchQuery.value = 'acme'
    await nextTick()
    expect(store.fetchPayments).toHaveBeenCalledTimes(2)
    expect(store.fetchPayments).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: 'acme', page: 1 }),
    )
  })

  it('handleStatusChange updates status and resets currentPage to 1', () => {
    const { filters } = mountFilters()
    filters.currentPage.value = 3
    filters.handleStatusChange(StatusFilter.FAILED)
    expect(filters.status.value).toBe(StatusFilter.FAILED)
    expect(filters.currentPage.value).toBe(1)
  })

  it('handleSortToggle flips between -created_at and created_at', () => {
    const { filters } = mountFilters()
    expect(filters.sort.value).toBe('-created_at')
    filters.handleSortToggle()
    expect(filters.sort.value).toBe('created_at')
    filters.handleSortToggle()
    expect(filters.sort.value).toBe('-created_at')
  })

  it('handleSortToggle resets currentPage to 1', () => {
    const { filters } = mountFilters()
    filters.currentPage.value = 5
    filters.handleSortToggle()
    expect(filters.currentPage.value).toBe(1)
  })

  it('goToPage clamps to at least 1', () => {
    const { filters } = mountFilters()
    filters.goToPage(-5)
    expect(filters.currentPage.value).toBe(1)
  })

  it('goToPage clamps to totalPages when store.total is set', () => {
    const { filters } = mountFilters(10)
    const store = usePaymentStore()
    store.total = 25 // 3 pages at pageSize 10

    filters.goToPage(99)
    expect(filters.currentPage.value).toBe(3)
  })

  it('goToNextPage increments currentPage', () => {
    const { filters } = mountFilters()
    const store = usePaymentStore()
    store.total = 30

    filters.goToNextPage()
    expect(filters.currentPage.value).toBe(2)
  })

  it('goToPrevPage decrements currentPage but not below 1', () => {
    const { filters } = mountFilters()
    filters.goToPrevPage()
    expect(filters.currentPage.value).toBe(1)

    filters.currentPage.value = 2
    filters.goToPrevPage()
    expect(filters.currentPage.value).toBe(1)
  })
})
