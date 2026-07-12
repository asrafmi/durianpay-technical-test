import { describe, expect, it } from 'vitest'
import awaitToError from './await-to-error'

describe('awaitToError', () => {
  it('returns [null, data] when the promise resolves', async () => {
    const [err, data] = await awaitToError(Promise.resolve({ id: 1 }))
    expect(err).toBeNull()
    expect(data).toEqual({ id: 1 })
  })

  it('returns [error, null] when the promise rejects', async () => {
    const rejection = new Error('boom')
    const [err, data] = await awaitToError(Promise.reject(rejection))
    expect(err).toBe(rejection)
    expect(data).toBeNull()
  })

  it('propagates non-Error rejection reasons as-is', async () => {
    const [err] = await awaitToError(Promise.reject('string failure'))
    expect(err).toBe('string failure')
  })
})
