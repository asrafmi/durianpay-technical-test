import { ref } from 'vue'
import { defineStore } from 'pinia'
import { toast } from 'vue3-toastify'
import { api } from '../lib/api'
import awaitToError from '../lib/await-to-error'
import omitEmpty from '../lib/omit-empty'
import { getErrorMessage } from '../lib/error-message'
import type { PaymentReviewStatus } from '../constants/payment-status'
import { TOAST_ERROR_DURATION, TOAST_SUCCESS_DURATION } from '../constants/toast'

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
  date_from?: string
  date_to?: string
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
    date_from,
    date_to,
    page = 1,
    limit = 10,
  }: GetDashboardV1PaymentsParams) => {
    isLoadingPaymentList.value = true
    const params = omitEmpty<GetDashboardV1PaymentsParams>({ search, status, sort, date_from, date_to, page, limit })
    const [err, data] = await awaitToError(api.get<PaymentListResponse>('/dashboard/v1/payments', {
      params,
    }))
    if (err) {
      error.value = getErrorMessage(err)
      isLoadingPaymentList.value = false
      toast(getErrorMessage(err), {
        autoClose: TOAST_ERROR_DURATION,
      });
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
      toast(getErrorMessage(err), {
        autoClose: TOAST_ERROR_DURATION,
      });
      return
    }

    const summaryData: PaymentSummaryResponse = data.data
    summary.value = summaryData
    isLoadingPaymentSummary.value = false
  }

  const reviewPayment = async (paymentId: string, status: PaymentReviewStatus) => {
    const [err, data] = await awaitToError(api.patch(`/dashboard/v1/payments/${paymentId}/review`, { status }))
    if (err) {
      error.value = getErrorMessage(err)
      toast(getErrorMessage(err), {
        autoClose: TOAST_ERROR_DURATION,
        type: 'error',
      });
      return
    }

    toast(`Payment review updated successfully to ${data.data.status}`, {
      autoClose: TOAST_SUCCESS_DURATION,
      type: 'success',
    });
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
      reviewPayment,
    }
  }
)