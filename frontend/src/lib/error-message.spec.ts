import { describe, expect, it } from 'vitest'
import { AxiosError, AxiosHeaders } from 'axios'
import { getErrorMessage } from './error-message'

function makeAxiosError(status: number, body: { code?: string; message?: string } | undefined, hasResponse = true) {
  const err = new AxiosError(
    'Request failed',
    'ERR_BAD_REQUEST',
    undefined,
    undefined,
    hasResponse
      ? {
          status,
          statusText: 'Error',
          headers: {},
          config: { headers: new AxiosHeaders() },
          data: body,
        }
      : undefined,
  )
  return err
}

describe('getErrorMessage', () => {
  it('maps a known error code to a human-friendly message', () => {
    const err = makeAxiosError(500, { code: 'internal_error', message: 'db error' })
    expect(getErrorMessage(err)).toBe('Terjadi kesalahan pada server. Silakan coba lagi.')
  })

  it('never surfaces the raw server message, even when the code is known', () => {
    const err = makeAxiosError(500, { code: 'internal_error', message: 'db error' })
    const result = getErrorMessage(err)
    expect(result).not.toContain('db error')
    expect(result).not.toContain('internal server error')
  })

  it('maps unauthorized code', () => {
    const err = makeAxiosError(401, { code: 'unauthorized', message: 'invalid token claims' })
    expect(getErrorMessage(err)).toBe('Sesi Anda telah berakhir. Silakan masuk kembali.')
  })

  it('maps not_found code', () => {
    const err = makeAxiosError(404, { code: 'not_found', message: 'invalid credentials' })
    expect(getErrorMessage(err)).toBe('Data yang Anda cari tidak ditemukan.')
  })

  it('maps bad_request code', () => {
    const err = makeAxiosError(400, { code: 'bad_request', message: 'empty body' })
    expect(getErrorMessage(err)).toBe('Permintaan tidak valid. Periksa kembali data yang Anda masukkan.')
  })

  it('falls back to the default message for an unrecognized code', () => {
    const err = makeAxiosError(500, { code: 'some_new_code', message: 'whatever' })
    expect(getErrorMessage(err)).toBe('Terjadi kesalahan. Silakan coba lagi.')
  })

  it('falls back to a custom fallback message when provided', () => {
    const err = makeAxiosError(500, { code: 'some_new_code' })
    expect(getErrorMessage(err, { fallback: 'Custom fallback' })).toBe('Custom fallback')
  })

  it('returns a network-error message when there is no response at all', () => {
    const err = makeAxiosError(0, undefined, false)
    expect(getErrorMessage(err)).toBe('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.')
  })

  it('applies per-call overrides for a known code', () => {
    const err = makeAxiosError(404, { code: 'not_found' })
    expect(getErrorMessage(err, { overrides: { not_found: 'Email atau password salah.' } })).toBe(
      'Email atau password salah.',
    )
  })

  it('applies per-call overrides even for an otherwise-unmapped code', () => {
    const err = makeAxiosError(401, { code: 'unauthorized' })
    expect(getErrorMessage(err, { overrides: { unauthorized: 'Email atau password salah.' } })).toBe(
      'Email atau password salah.',
    )
  })

  it('falls back for a non-axios error (e.g. a plain Error)', () => {
    expect(getErrorMessage(new Error('boom'))).toBe('Terjadi kesalahan. Silakan coba lagi.')
  })

  it('falls back for a non-error value', () => {
    expect(getErrorMessage('just a string')).toBe('Terjadi kesalahan. Silakan coba lagi.')
    expect(getErrorMessage(null)).toBe('Terjadi kesalahan. Silakan coba lagi.')
    expect(getErrorMessage(undefined)).toBe('Terjadi kesalahan. Silakan coba lagi.')
  })

  it('falls back when the response body has no code field', () => {
    const err = makeAxiosError(500, { message: 'db error' })
    expect(getErrorMessage(err)).toBe('Terjadi kesalahan. Silakan coba lagi.')
  })
})
