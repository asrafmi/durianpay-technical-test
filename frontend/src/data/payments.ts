export type PaymentStatus = 'completed' | 'processing' | 'failed'

export interface Payment {
  id: string
  merchant: string
  method: string
  amount: number
  date: Date
  status: PaymentStatus
}

const MERCHANTS = [
  'Toko Sejahtera',
  'Warung Nusantara',
  'Kedai Kopi Senja',
  'Butik Anggun',
  'Griya Elektronik',
  'Sumber Rejeki Mart',
  'Dapur Ibu Kita',
  'Toko Baju Melati',
  'Bengkel Jaya Motor',
  'Apotek Sehat Selalu',
  'Toko Buku Cerdas',
  'Kios Pulsa Makmur',
  'RM Padang Jaya',
  'Toko Mainan Ceria',
  'Klinik Sehat Bersama',
]

const METHODS = [
  'Virtual Account BCA',
  'Virtual Account Mandiri',
  'QRIS',
  'GoPay',
  'OVO',
  'ShopeePay',
  'Kartu Kredit',
]

export function generatePayments(): Payment[] {
  const total = 50
  const nCompleted = 30
  const nProcessing = 12
  const nFailed = total - nCompleted - nProcessing

  const statusPool: PaymentStatus[] = [
    ...Array(nCompleted).fill('completed'),
    ...Array(nProcessing).fill('processing'),
    ...Array(nFailed).fill('failed'),
  ]
  for (let i = statusPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[statusPool[i], statusPool[j]] = [statusPool[j], statusPool[i]]
  }

  const now = Date.now()
  const items: Payment[] = []
  for (let i = 0; i < total; i++) {
    const daysAgo = Math.floor(Math.random() * 30)
    const hoursAgo = Math.floor(Math.random() * 24)
    const date = new Date(now - daysAgo * 86400000 - hoursAgo * 3600000)
    const seq = String(total - i).padStart(4, '0')
    const yyyymmdd = date.toISOString().slice(0, 10).replace(/-/g, '')
    items.push({
      id: `PAY-${yyyymmdd}-${seq}`,
      merchant: MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)],
      method: METHODS[Math.floor(Math.random() * METHODS.length)],
      amount: Math.floor(50000 + Math.random() * 14950000),
      date,
      status: statusPool[i],
    })
  }
  items.sort((a, b) => b.date.getTime() - a.date.getTime())
  return items
}

export const STATUS_META: Record<PaymentStatus, { label: string; color: string; bg: string }> = {
  completed: { label: 'Completed', color: '#1A9E5C', bg: '#E7F7EF' },
  processing: { label: 'Processing', color: '#2563EB', bg: '#EAF1FE' },
  failed: { label: 'Failed', color: '#E31C4D', bg: '#FDE8ED' },
}

export function formatCurrency(n: number): string {
  return 'Rp' + n.toLocaleString('id-ID')
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}
