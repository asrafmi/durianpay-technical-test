import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { AxiosError, AxiosHeaders } from 'axios'
import { usePaymentStore } from './payment'
import { api } from '../lib/api'

function makeApiError(code: string) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    status: 500,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
    data: { code },
  })
}

vi.mock('../lib/api', () => ({
  api: { get: vi.fn() },
}))

const mockedGet = api.get as unknown as ReturnType<typeof vi.fn>

describe('usePaymentStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockedGet.mockReset()
  })

  describe('fetchPayments', () => {
    it('populates payments and total on success', async () => {
      mockedGet.mockResolvedValueOnce({
        data: {
          payments: [{ id: 'p1', amount: 1000, merchant: 'Toko A', status: 'completed', created_at: '2026-01-01' }],
          total: 42,
          page: 1,
          limit: 10,
        },
      })

      const store = usePaymentStore()
      await store.fetchPayments({ page: 1, limit: 10 })

      expect(store.payments).toHaveLength(1)
      expect(store.payments[0].id).toBe('p1')
      expect(store.total).toBe(42)
      expect(store.isLoadingPaymentList).toBe(false)
      expect(store.error).toBeNull()
    })

    it('strips empty params via omitEmpty before calling the API', async () => {
      mockedGet.mockResolvedValueOnce({ data: { payments: [], total: 0, page: 1, limit: 10 } })

      const store = usePaymentStore()
      await store.fetchPayments({ search: '', status: '', date_from: '', date_to: '', page: 1, limit: 10 })

      expect(mockedGet).toHaveBeenCalledWith(
        '/dashboard/v1/payments',
        { params: { page: 1, limit: 10 } },
      )
    })

    it('passes date_from and date_to through to the API params', async () => {
      mockedGet.mockResolvedValueOnce({ data: { payments: [], total: 0, page: 1, limit: 10 } })

      const store = usePaymentStore()
      await store.fetchPayments({ date_from: '2026-01-01', date_to: '2026-01-31', page: 1, limit: 10 })

      expect(mockedGet).toHaveBeenCalledWith(
        '/dashboard/v1/payments',
        { params: { date_from: '2026-01-01', date_to: '2026-01-31', page: 1, limit: 10 } },
      )
    })

    it('sets a human-readable error message and stops loading when the request fails', async () => {
      mockedGet.mockRejectedValueOnce(makeApiError('internal_error'))

      const store = usePaymentStore()
      await store.fetchPayments({ page: 1 })

      expect(store.error).toBe('Terjadi kesalahan pada server. Silakan coba lagi.')
      expect(store.isLoadingPaymentList).toBe(false)
      expect(store.payments).toEqual([])
    })

    it('sets isLoadingPaymentList to true while the request is in flight', () => {
      let resolveRequest!: (value: unknown) => void
      mockedGet.mockReturnValueOnce(new Promise((resolve) => { resolveRequest = resolve }))

      const store = usePaymentStore()
      const promise = store.fetchPayments({ page: 1 })

      expect(store.isLoadingPaymentList).toBe(true)
      resolveRequest({ data: { payments: [], total: 0, page: 1, limit: 10 } })
      return promise
    })
  })

  describe('fetchPaymentSummary', () => {
    it('populates summary on success', async () => {
      mockedGet.mockResolvedValueOnce({
        data: { total: 10, success: 6, processing: 2, failed: 2 },
      })

      const store = usePaymentStore()
      await store.fetchPaymentSummary()

      expect(store.summary).toEqual({ total: 10, success: 6, processing: 2, failed: 2 })
      expect(store.isLoadingPaymentSummary).toBe(false)
    })

    it('sets a human-readable error message and stops loading when the request fails', async () => {
      mockedGet.mockRejectedValueOnce(makeApiError('internal_error'))

      const store = usePaymentStore()
      await store.fetchPaymentSummary()

      expect(store.error).toBe('Terjadi kesalahan pada server. Silakan coba lagi.')
      expect(store.isLoadingPaymentSummary).toBe(false)
      expect(store.summary).toBeNull()
    })
  })
})
