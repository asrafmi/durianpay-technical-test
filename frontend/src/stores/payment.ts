import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../lib/api'
import awaitToError from '../lib/await-to-error'
import omitEmpty from '../lib/omit-empty'
import { getErrorMessage } from '../lib/error-message'

export interface Payment {
  id: string
  amount: number
  merchant: string
  status: string
  created_at: string
}

interface PaymentListResponse {
  payments: Payment[]
  total: number
  page: number
  limit: number
}

interface PaymentSummaryResponse {
  total: number
  success: number
  processing: number
  failed: number
}

interface GetDashboardV1PaymentsParams {
  search?: string
  status?: string
  sort?: string
  page?: number
  limit?: number
}

export const usePaymentStore = defineStore('payment', () => {
  const payments = ref<Payment[]>([])
  const total = ref<number>(0)
  const isLoadingPaymentList = ref<boolean>(false)
  
  const summary = ref<PaymentSummaryResponse | null>(null)
  const isLoadingPaymentSummary = ref<boolean>(false)
  const error = ref<string | null>(null)
  
  const fetchPayments = async ({
    search,
    status,
    sort,
    page = 1,
    limit = 10,
  }: GetDashboardV1PaymentsParams) => {
    isLoadingPaymentList.value = true
    const params = omitEmpty<GetDashboardV1PaymentsParams>({ search, status, sort, page, limit })
    const [err, data] = await awaitToError(api.get<PaymentListResponse>('/dashboard/v1/payments', {
      params,
    }))
    if (err) {
      error.value = getErrorMessage(err)
      isLoadingPaymentList.value = false
      return
    }

    payments.value = data.data.payments
    total.value = data.data.total
    isLoadingPaymentList.value = false
  }

  const fetchPaymentSummary = async () => {
    isLoadingPaymentSummary.value = true
    const [err, data] = await awaitToError(api.get('/dashboard/v1/payments/summary'))
    if (err) {
      error.value = getErrorMessage(err)
      isLoadingPaymentSummary.value = false
      return
    }

    const summaryData: PaymentSummaryResponse = data.data
    summary.value = summaryData
    isLoadingPaymentSummary.value = false
  }

  return {
      payments,
      total,
      isLoadingPaymentList,
      fetchPayments,

      summary,
      isLoadingPaymentSummary,
      fetchPaymentSummary,

      error,
    }
  }
)