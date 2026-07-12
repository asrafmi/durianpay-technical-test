import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api, AUTH_STORAGE_KEY } from '../lib/api'
import awaitToError from '../lib/await-to-error'

interface AuthUser {
  email: string
  role: string
}

interface StoredAuth {
  user: AuthUser
  token: string
}

interface LoginResponse {
  email: string
  role: string
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
  const token = ref<string | null>(stored?.token ?? null)

  const isAuthenticated = computed(() => !!token.value)

  async function login(email: string, password: string) {
    const [error, data] = await awaitToError(api.post<LoginResponse>('/dashboard/v1/auth/login', {
      email,
      password,
    }))
    if (error) {
      throw error
    }
    
    user.value = { email: data.data.email, role: data.data.role }
    token.value = data.data.token
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: user.value, token: data.data.token }))
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  return { user, token, isAuthenticated, login, logout }
})
