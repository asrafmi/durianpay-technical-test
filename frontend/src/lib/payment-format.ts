import { PaymentStatus } from '../constants/payment-status'

export const STATUS_META: Record<PaymentStatus, { label: string; color: string; bg: string }> = {
  [PaymentStatus.COMPLETED]: { label: 'Completed', color: '#1A9E5C', bg: '#E7F7EF' },
  [PaymentStatus.PROCESSING]: { label: 'Processing', color: '#2563EB', bg: '#EAF1FE' },
  [PaymentStatus.FAILED]: { label: 'Failed', color: '#E31C4D', bg: '#FDE8ED' },
}

export function formatCurrency(n: number): string {
  return 'Rp' + n.toLocaleString('id-ID')
}

export function formatDate(d: string): string {
  const date = new Date(d)
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function percentageOf(value: number, total: number): number {
  return total ? Math.round((value / total) * 100) : 0
}
