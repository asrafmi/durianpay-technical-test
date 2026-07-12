import { isAxiosError } from 'axios'

interface ApiErrorBody {
  code?: string
  message?: string
}

const ERROR_CODE_MESSAGES: Record<string, string> = {
  bad_request: 'Permintaan tidak valid. Periksa kembali data yang Anda masukkan.',
  unauthorized: 'Sesi Anda telah berakhir. Silakan masuk kembali.',
  not_found: 'Data yang Anda cari tidak ditemukan.',
  internal_error: 'Terjadi kesalahan pada server. Silakan coba lagi.',
}

const DEFAULT_FALLBACK_MESSAGE = 'Terjadi kesalahan. Silakan coba lagi.'
const NETWORK_ERROR_MESSAGE = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'

interface GetErrorMessageOptions {
  /** Fallback text when the error's code is unmapped or the error shape is unrecognized. */
  fallback?: string
  /** Per-call overrides, merged over the default code->message map (e.g. tailor "not_found" for a login form). */
  overrides?: Record<string, string>
}

export function getErrorMessage(err: unknown, options: GetErrorMessageOptions = {}): string {
  const { fallback = DEFAULT_FALLBACK_MESSAGE, overrides } = options

  if (isAxiosError<ApiErrorBody>(err)) {
    if (!err.response) return NETWORK_ERROR_MESSAGE

    const code = err.response.data?.code
    if (code) {
      if (overrides && code in overrides) return overrides[code]
      if (code in ERROR_CODE_MESSAGES) return ERROR_CODE_MESSAGES[code]
    }

    return fallback
  }

  return fallback
}
