import { computed, ref, watch, watchEffect } from 'vue'
import { usePaymentStore } from '../stores/payment'
import { StatusFilter } from '../constants/payment-status'
import { useDebounce } from './useDebounce'

const SEARCH_DEBOUNCE_MS = 400

export function usePaymentFilters(pageSize = 10) {
  const paymentStore = usePaymentStore()

  const searchQuery = ref<string>('')
  const debouncedSearchQuery = useDebounce(searchQuery, SEARCH_DEBOUNCE_MS)
  const status = ref<StatusFilter>(StatusFilter.ALL)
  const sort = ref<string>('-created_at')
  const dateFrom = ref<string>('')
  const dateTo = ref<string>('')
  const currentPage = ref<number>(1)

  const totalPages = computed(() => Math.max(1, Math.ceil(paymentStore.total / pageSize)))

  watch(searchQuery, () => {
    currentPage.value = 1
  })

  watch([dateFrom, dateTo], () => {
    currentPage.value = 1
  })

  watchEffect(() => {
    paymentStore.fetchPayments({
      search: debouncedSearchQuery.value,
      page: currentPage.value,
      limit: pageSize,
      status: status.value,
      sort: sort.value,
      date_from: dateFrom.value,
      date_to: dateTo.value,
    })
    paymentStore.fetchPaymentSummary()
  })

  function handleStatusChange(newStatus: StatusFilter) {
    status.value = newStatus
    currentPage.value = 1
  }

  function handleSortToggle() {
    sort.value = sort.value === '-created_at' ? 'created_at' : '-created_at'
    currentPage.value = 1
  }

  function goToPage(page: number) {
    currentPage.value = Math.min(Math.max(1, page), totalPages.value)
  }

  function goToPrevPage() {
    goToPage(currentPage.value - 1)
  }

  function goToNextPage() {
    goToPage(currentPage.value + 1)
  }

  return {
    searchQuery,
    status,
    sort,
    dateFrom,
    dateTo,
    currentPage,
    totalPages,
    handleStatusChange,
    handleSortToggle,
    goToPage,
    goToPrevPage,
    goToNextPage,
  }
}
