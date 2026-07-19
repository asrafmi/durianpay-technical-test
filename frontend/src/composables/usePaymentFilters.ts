import { computed, ref, watch, watchEffect } from 'vue'
import { usePaymentStore } from '../stores/payment'
import { StatusFilter } from '../constants/payment-status'
import { useDebounce } from './useDebounce'
import { useAuthStore } from '../stores/auth'
import { PaymentListSortParams } from '../constants/payment-list-params'

const SEARCH_DEBOUNCE_MS = 400

export function usePaymentFilters() {
  const paymentStore = usePaymentStore()
  const authStore = useAuthStore()

  const searchQuery = ref<string>('')
  const minimumAmount = ref<number | undefined>(undefined)
  const debouncedSearchQuery = useDebounce(searchQuery, SEARCH_DEBOUNCE_MS)
  const status = ref<StatusFilter>(StatusFilter.ALL)
  const sort = ref<string>(PaymentListSortParams.CREATED_AT_DESC)
  const dateFrom = ref<string>('')
  const dateTo = ref<string>('')
  const currentPage = ref<number>(1)
  const pageSize = ref<number>(10)

  const totalPages = computed(() => Math.max(1, Math.ceil(paymentStore.total / pageSize.value)))

  watch(searchQuery, () => {
    currentPage.value = 1
  })

  watch([dateFrom, dateTo], () => {
    currentPage.value = 1
  })

  watchEffect(() => {
    paymentStore.fetchPayments({
      search: debouncedSearchQuery.value,
      min_amount: minimumAmount.value,
      page: currentPage.value,
      limit: pageSize.value,
      status: status.value,
      sort: sort.value,
      date_from: dateFrom.value,
      date_to: dateTo.value,
    })
  })

  watchEffect(() => {
    if (authStore.isOperation) {
      paymentStore.fetchPaymentSummary()
    }
  })

  function handleStatusChange(newStatus: StatusFilter) {
    status.value = newStatus
    currentPage.value = 1
  }

  function handleSortToggle(param: string) {
    sort.value = sort.value === `-${param}` ? param : `-${param}`
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

  function changePageSize(size: number) {
    pageSize.value = size
    currentPage.value = 1
  }

  return {
    searchQuery,
    minimumAmount,
    status,
    sort,
    dateFrom,
    dateTo,
    currentPage,
    totalPages,
    pageSize,
    handleStatusChange,
    handleSortToggle,
    goToPage,
    goToPrevPage,
    goToNextPage,
    changePageSize,
  }
}
