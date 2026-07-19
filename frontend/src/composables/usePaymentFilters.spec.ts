import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { defineComponent, nextTick } from 'vue'
import { usePaymentFilters } from './usePaymentFilters'
import { usePaymentStore } from '../stores/payment'
import { StatusFilter } from '../constants/payment-status'
import { useAuthStore } from '../stores/auth'
import { UserRole } from '../constants/user-role'

function mountFilters(pinia: ReturnType<typeof createTestingPinia>, pageSize = 10) {
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
      plugins: [pinia],
    },
  })

  return { wrapper, filters: exposed }
}

describe('usePaymentFilters', () => {
  it('starts with default filter state', () => {
    const pinia = createTestingPinia({ stubActions: true, createSpy: undefined })
    const { filters } = mountFilters(pinia)
    expect(filters.searchQuery.value).toBe('')
    expect(filters.status.value).toBe(StatusFilter.ALL)
    expect(filters.sort.value).toBe('-created_at')
    expect(filters.dateFrom.value).toBe('')
    expect(filters.dateTo.value).toBe('')
    expect(filters.currentPage.value).toBe(1)
  })

  it('fetches payments and summary on mount if user role is operation', async () => {
    const pinia = createTestingPinia({ stubActions: true, createSpy: undefined })
    const authStore = useAuthStore(pinia)
    authStore.role = UserRole.OPERATION

    mountFilters(pinia)
    await nextTick()
    const store = usePaymentStore()
    expect(store.fetchPayments).toHaveBeenCalledTimes(1)
    expect(store.fetchPaymentSummary).toHaveBeenCalledTimes(1)
  })

  it('fetches payments and summary on mount if user role is cs', async () => {
    const pinia = createTestingPinia({ stubActions: true, createSpy: undefined })
    const authStore = useAuthStore(pinia)
    authStore.role = UserRole.CS

    mountFilters(pinia)
    await nextTick()
    const store = usePaymentStore()
    expect(store.fetchPayments).toHaveBeenCalledTimes(1)
  })

  it('refetches payments when searchQuery changes, after the debounce delay', async () => {
    vi.useFakeTimers()
    const pinia = createTestingPinia({ stubActions: true, createSpy: undefined })
    const { filters } = mountFilters(pinia)
    const store = usePaymentStore()
    await nextTick()
    expect(store.fetchPayments).toHaveBeenCalledTimes(1)

    filters.searchQuery.value = 'acme'
    await nextTick()
    expect(store.fetchPayments).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(400)
    expect(store.fetchPayments).toHaveBeenCalledTimes(2)
    expect(store.fetchPayments).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: 'acme', page: 1 }),
    )
    vi.useRealTimers()
  })

  it('resets currentPage to 1 immediately when searchQuery changes (before debounce fires)', async () => {
    const pinia = createTestingPinia({ stubActions: true, createSpy: undefined })
    const { filters } = mountFilters(pinia)
    filters.currentPage.value = 3

    filters.searchQuery.value = 'acme'
    await nextTick()

    expect(filters.currentPage.value).toBe(1)
  })

  it('handleStatusChange updates status and resets currentPage to 1', () => {
    const pinia = createTestingPinia({ stubActions: true, createSpy: undefined })
    const { filters } = mountFilters(pinia)
    filters.currentPage.value = 3
    filters.handleStatusChange(StatusFilter.FAILED)
    expect(filters.status.value).toBe(StatusFilter.FAILED)
    expect(filters.currentPage.value).toBe(1)
  })

  it('handleSortToggle flips between -created_at and created_at', () => {
    const pinia = createTestingPinia({ stubActions: true, createSpy: undefined })
    const { filters } = mountFilters(pinia)
    expect(filters.sort.value).toBe('-created_at')
    filters.handleSortToggle('created_at')
    expect(filters.sort.value).toBe('created_at')
    filters.handleSortToggle('created_at')
    expect(filters.sort.value).toBe('-created_at')
  })

  it('handleSortToggle resets currentPage to 1', () => {
    const pinia = createTestingPinia({ stubActions: true, createSpy: undefined })
    const { filters } = mountFilters(pinia)
    filters.currentPage.value = 5
    filters.handleSortToggle('created_at')
    expect(filters.currentPage.value).toBe(1)
  })

  it('refetches payments when dateFrom or dateTo changes', async () => {
    const pinia = createTestingPinia({ stubActions: true, createSpy: undefined })
    const { filters } = mountFilters(pinia)
    const store = usePaymentStore()
    await nextTick()
    expect(store.fetchPayments).toHaveBeenCalledTimes(1)

    filters.dateFrom.value = '2026-01-01'
    await nextTick()
    expect(store.fetchPayments).toHaveBeenCalledTimes(2)
    expect(store.fetchPayments).toHaveBeenLastCalledWith(
      expect.objectContaining({ date_from: '2026-01-01', date_to: '', page: 1 }),
    )

    filters.dateTo.value = '2026-01-31'
    await nextTick()
    expect(store.fetchPayments).toHaveBeenCalledTimes(3)
    expect(store.fetchPayments).toHaveBeenLastCalledWith(
      expect.objectContaining({ date_from: '2026-01-01', date_to: '2026-01-31' }),
    )
  })

  it('resets currentPage to 1 when the date range changes', async () => {
    const pinia = createTestingPinia({ stubActions: true, createSpy: undefined })
    const { filters } = mountFilters(pinia)
    filters.currentPage.value = 4

    filters.dateFrom.value = '2026-01-01'
    await nextTick()

    expect(filters.currentPage.value).toBe(1)
  })

  it('goToPage clamps to at least 1', () => {
    const pinia = createTestingPinia({ stubActions: true, createSpy: undefined })
    const { filters } = mountFilters(pinia)
    filters.goToPage(-5)
    expect(filters.currentPage.value).toBe(1)
  })

  it('goToPage clamps to totalPages when store.total is set', () => {
    const pinia = createTestingPinia({ stubActions: true, createSpy: undefined })
    const { filters } = mountFilters(pinia, 10)
    const store = usePaymentStore()
    store.total = 25 // 3 pages at pageSize 10

    filters.goToPage(99)
    expect(filters.currentPage.value).toBe(3)
  })

  it('goToNextPage increments currentPage', () => {
    const pinia = createTestingPinia({ stubActions: true, createSpy: undefined })
    const { filters } = mountFilters(pinia)
    const store = usePaymentStore()
    store.total = 30

    filters.goToNextPage()
    expect(filters.currentPage.value).toBe(2)
  })

  it('goToPrevPage decrements currentPage but not below 1', () => {
    const pinia = createTestingPinia({ stubActions: true, createSpy: undefined })
    const { filters } = mountFilters(pinia)
    filters.goToPrevPage()
    expect(filters.currentPage.value).toBe(1)

    filters.currentPage.value = 2
    filters.goToPrevPage()
    expect(filters.currentPage.value).toBe(1)
  })
})
