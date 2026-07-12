import { describe, expect, it } from 'vitest'
import omitEmpty from './omit-empty'

describe('omitEmpty', () => {
  it('removes undefined values', () => {
    expect(omitEmpty({ a: 1, b: undefined })).toEqual({ a: 1 })
  })

  it('removes null values', () => {
    expect(omitEmpty({ a: 1, b: null })).toEqual({ a: 1 })
  })

  it('removes empty string values', () => {
    expect(omitEmpty({ a: 1, b: '' })).toEqual({ a: 1 })
  })

  it('keeps falsy values that are not undefined/null/empty-string', () => {
    expect(omitEmpty({ a: 0, b: false })).toEqual({ a: 0, b: false })
  })

  it('returns an empty object when all values are empty', () => {
    expect(omitEmpty({ a: undefined, b: null, c: '' })).toEqual({})
  })

  it('does not mutate the original object', () => {
    const input = { a: 1, b: undefined }
    omitEmpty(input)
    expect(input).toEqual({ a: 1, b: undefined })
  })
})
