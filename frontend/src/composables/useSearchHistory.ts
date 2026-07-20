import { ref } from 'vue'
import { PAYMENT_SEARCH_HISTORY_STORAGE_KEY } from '../constants/storage'

const MAX_HISTORY_ENTRIES = 10

function loadHistory(): string[] {
  const raw = localStorage.getItem(PAYMENT_SEARCH_HISTORY_STORAGE_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((entry) => typeof entry === 'string') : []
  } catch {
    return []
  }
}

const history = ref<string[]>(loadHistory())

function persist() {
  localStorage.setItem(PAYMENT_SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(history.value))
}

export function useSearchHistory() {
  function addEntry(term: string) {
    const trimmed = term.trim()
    if (!trimmed) return

    const withoutDuplicate = history.value.filter(
      (entry) => entry.toLowerCase() !== trimmed.toLowerCase(),
    )
    history.value = [trimmed, ...withoutDuplicate].slice(0, MAX_HISTORY_ENTRIES)
    persist()
  }

  function removeEntry(term: string) {
    history.value = history.value.filter((entry) => entry !== term)
    persist()
  }

  function clearHistory() {
    history.value = []
    persist()
  }

  function suggestionsFor(query: string): string[] {
    const trimmed = query.trim().toLowerCase()
    if (!trimmed) return history.value
    return history.value.filter((entry) => entry.toLowerCase().includes(trimmed))
  }

  return {
    history,
    addEntry,
    removeEntry,
    clearHistory,
    suggestionsFor,
  }
}
