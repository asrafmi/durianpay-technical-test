import { describe, expect, it } from 'vitest'
import { formatAmount, formatDate, percentageOf } from './payment-format'

describe('formatAmount', () => {
  it('formats a whole number with the Rp prefix and thousands separator', () => {
    expect(formatAmount(1500000)).toBe('Rp1.500.000')
  })

  it('formats zero', () => {
    expect(formatAmount(0)).toBe('Rp0')
  })
})

describe('formatDate', () => {
  it('formats an ISO date string into id-ID short format', () => {
    expect(formatDate('2026-01-15T10:00:00.000Z')).toBe('15 Jan 2026')
  })

  it('renders in Asia/Jakarta (WIB, UTC+7), matching the backend date filter timezone', () => {
    // 18:49 UTC is 01:49 the next day in WIB - this must show as the 13th,
    // not the 12th, to match how the backend interprets date_from/date_to.
    expect(formatDate('2026-07-12T18:49:57Z')).toBe('13 Jul 2026')
  })

  it('does not roll over to the next day for a UTC time still within the same WIB day', () => {
    // 10:00 UTC is 17:00 WIB - same calendar day in both timezones.
    expect(formatDate('2026-07-12T10:00:00Z')).toBe('12 Jul 2026')
  })
})

describe('percentageOf', () => {
  it('computes a rounded percentage', () => {
    expect(percentageOf(3, 4)).toBe(75)
  })

  it('rounds to the nearest integer', () => {
    expect(percentageOf(1, 3)).toBe(33)
  })

  it('returns 0 when total is 0 to avoid division by zero', () => {
    expect(percentageOf(5, 0)).toBe(0)
  })

  it('returns 0 when value is 0', () => {
    expect(percentageOf(0, 10)).toBe(0)
  })

  it('returns 100 when value equals total', () => {
    expect(percentageOf(10, 10)).toBe(100)
  })
})
