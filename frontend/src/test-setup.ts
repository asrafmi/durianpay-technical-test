// Vitest 4's jsdom environment does not reliably expose window.localStorage
// in this setup (Node 26 + jsdom 29), so provide a minimal in-memory Storage
// polyfill that mirrors the real API surface the app code relies on.
class MemoryStorage implements Storage {
  readonly #store = new Map<string, string>()

  get length() {
    return this.#store.size
  }

  clear() {
    this.#store.clear()
  }

  getItem(key: string) {
    return this.#store.has(key) ? this.#store.get(key)! : null
  }

  key(index: number) {
    return Array.from(this.#store.keys())[index] ?? null
  }

  removeItem(key: string) {
    this.#store.delete(key)
  }

  setItem(key: string, value: string) {
    this.#store.set(key, String(value))
  }
}

if (typeof window !== 'undefined' && !window.localStorage) {
  Object.defineProperty(window, 'localStorage', {
    value: new MemoryStorage(),
    configurable: true,
  })
}

Object.defineProperty(globalThis, 'localStorage', {
  value: window.localStorage,
  configurable: true,
})
