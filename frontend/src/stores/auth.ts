import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '../lib/api'
import awaitToError from '../lib/await-to-error'
import { getErrorMessage } from '../lib/error-message'
import { AUTH_STORAGE_KEY } from '../constants/storage'
import type { UserRole } from '../constants/user-role'

interface AuthUser {
  email: string
  role: UserRole
}

interface StoredAuth {
  user: AuthUser
  token: string
}

interface LoginResponse {
  email: string
  role: UserRole
  token: string
}

function loadStoredAuth(): StoredAuth | null {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredAuth
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const stored = loadStoredAuth()
  const user = ref<AuthUser | null>(stored?.user ?? null)
  const role = ref<UserRole | null>(stored?.user?.role ?? null)
  console.log('role.value!!', role.value)
  const token = ref<string | null>(stored?.token ?? null)
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)
  const isOperation = computed(() => role.value === 'operation')
  const isCS = computed(() => role.value === 'cs')

  async function login(email: string, password: string) {
    isLoading.value = true

    const [err, data] = await awaitToError(api.post<LoginResponse>('/dashboard/v1/auth/login', {
      email,
      password,
    }))
    if (err) {
      isLoading.value = false
      error.value = getErrorMessage(err, {
        overrides: {
          not_found: 'Email atau password salah.',
          unauthorized: 'Email atau password salah.',
        },
      })
      throw err
    }
    
    user.value = { email: data.data.email, role: data.data.role }
    token.value = data.data.token
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: user.value, token: data.data.token }))
    isLoading.value = false
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  console.log('role.value', role.value)
  console.log('isOperation.value', isOperation.value)
  return { user, role, isOperation, isCS, token, isAuthenticated, isLoading, error, login, logout }
})
