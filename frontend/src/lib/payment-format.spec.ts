import { describe, expect, it } from 'vitest'
import { formatCurrency, formatDate, percentageOf } from './payment-format'

describe('formatCurrency', () => {
  it('formats a whole number with the Rp prefix and thousands separator', () => {
    expect(formatCurrency(1500000)).toBe('Rp1.500.000')
  })

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('Rp0')
  })
})

describe('formatDate', () => {
  it('formats an ISO date string into id-ID short format', () => {
    expect(formatDate('2026-01-15T10:00:00.000Z')).toBe('15 Jan 2026')
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
