import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { AxiosError, AxiosHeaders } from 'axios'
import { UserRole } from '../constants/user-role'
import { AUTH_STORAGE_KEY } from '../constants/storage'
import { api } from '../lib/api'

vi.mock('../lib/api', () => ({
  api: { post: vi.fn() },
}))

const mockedPost = api.post as unknown as ReturnType<typeof vi.fn>

function makeApiError(code: string) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    status: 401,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
    data: { code },
  })
}

describe('useAuthStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    mockedPost.mockReset()
    vi.resetModules()
  })

  it('starts unauthenticated when localStorage is empty', async () => {
    const { useAuthStore } = await import('./auth')
    const store = useAuthStore()
    expect(store.isAuthenticated).toBe(false)
    expect(store.user).toBeNull()
    expect(store.token).toBeNull()
  })

  it('hydrates state from localStorage on creation', async () => {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ user: { email: 'a@b.com', role: UserRole.CS }, token: 'stored-token' }),
    )

    const { useAuthStore } = await import('./auth')
    const store = useAuthStore()

    expect(store.isAuthenticated).toBe(true)
    expect(store.token).toBe('stored-token')
    expect(store.user?.email).toBe('a@b.com')
  })

  it('ignores corrupted localStorage data and starts unauthenticated', async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, '{not-json')

    const { useAuthStore } = await import('./auth')
    const store = useAuthStore()

    expect(store.isAuthenticated).toBe(false)
    expect(store.user).toBeNull()
  })

  describe('login', () => {
    it('sets user/token and persists to localStorage on success', async () => {
      mockedPost.mockResolvedValueOnce({
        data: { email: 'a@b.com', role: UserRole.OPERATION, token: 'new-token' },
      })

      const { useAuthStore } = await import('./auth')
      const store = useAuthStore()
      await store.login('a@b.com', 'secret')

      expect(store.isAuthenticated).toBe(true)
      expect(store.token).toBe('new-token')
      expect(store.user).toEqual({ email: 'a@b.com', role: UserRole.OPERATION })
      expect(store.isLoading).toBe(false)

      const persisted = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)!)
      expect(persisted.token).toBe('new-token')
    })

    it('sets a human-readable error, resets loading, and throws on failure', async () => {
      mockedPost.mockRejectedValueOnce(makeApiError('not_found'))

      const { useAuthStore } = await import('./auth')
      const store = useAuthStore()

      await expect(store.login('a@b.com', 'wrong')).rejects.toThrow()
      expect(store.error).toBe('Email atau password salah.')
      expect(store.isLoading).toBe(false)
      expect(store.isAuthenticated).toBe(false)
    })

    it('maps an unauthorized failure to the same login-specific message', async () => {
      mockedPost.mockRejectedValueOnce(makeApiError('unauthorized'))

      const { useAuthStore } = await import('./auth')
      const store = useAuthStore()

      await expect(store.login('a@b.com', 'wrong')).rejects.toThrow()
      expect(store.error).toBe('Email atau password salah.')
    })
  })

  describe('logout', () => {
    it('clears user, token, and localStorage', async () => {
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ user: { email: 'a@b.com', role: UserRole.CS }, token: 'stored-token' }),
      )

      const { useAuthStore } = await import('./auth')
      const store = useAuthStore()
      expect(store.isAuthenticated).toBe(true)

      store.logout()

      expect(store.isAuthenticated).toBe(false)
      expect(store.user).toBeNull()
      expect(store.token).toBeNull()
      expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull()
    })
  })
})
