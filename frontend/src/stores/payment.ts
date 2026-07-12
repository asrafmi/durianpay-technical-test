import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../lib/api'
import awaitToError from '../lib/await-to-error'
import omitEmpty from '../lib/omit-empty'

interface Payment {
  id: string
  amount: number
  merchant: string
  currency: string
  status: string
  created_at: string
}

interface PaymentListResponse {
  payments: Payment[]
}

interface GetDashboardV1PaymentsParams {
  search?: string
  status?: string
  page?: number
  limit?: number
}

export const usePaymentStore = defineStore('payment', () => {
  const payments = ref<Payment[]>([])
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const fetchPayments = async ({
    search,
    status,
    page = 1,
    limit = 10,
  }: GetDashboardV1PaymentsParams) => {
    isLoading.value = true
    const params = omitEmpty<GetDashboardV1PaymentsParams>({ search, status, page, limit })
    const [err, data] = await awaitToError(api.get<PaymentListResponse>('/dashboard/v1/payments', {
      params,
    }))
    if (err) {
      error.value = err.message
      isLoading.value = false
      return
    }

    payments.value = data.data.payments
    isLoading.value = false
  }

  return {
    payments,
    isLoading,
    error,
    fetchPayments,
  }
})