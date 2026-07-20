import { beforeEach, describe, expect, it } from 'vitest'
import { PAYMENT_SEARCH_HISTORY_STORAGE_KEY } from '../constants/storage'

describe('useSearchHistory', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts empty when localStorage has no history', async () => {
    const { useSearchHistory } = await import(`./useSearchHistory?t=${Date.now()}-1`)
    const { history } = useSearchHistory()
    expect(history.value).toEqual([])
  })

  it('loads existing history from localStorage', async () => {
    localStorage.setItem(PAYMENT_SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(['acme', 'kedai kopi']))
    const { useSearchHistory } = await import(`./useSearchHistory?t=${Date.now()}-2`)
    const { history } = useSearchHistory()
    expect(history.value).toEqual(['acme', 'kedai kopi'])
  })

  it('ignores malformed JSON in localStorage and starts empty', async () => {
    localStorage.setItem(PAYMENT_SEARCH_HISTORY_STORAGE_KEY, '{not valid json')
    const { useSearchHistory } = await import(`./useSearchHistory?t=${Date.now()}-3`)
    const { history } = useSearchHistory()
    expect(history.value).toEqual([])
  })

  it('addEntry adds a new term to the front and persists it', async () => {
    const { useSearchHistory } = await import(`./useSearchHistory?t=${Date.now()}-4`)
    const { history, addEntry } = useSearchHistory()

    addEntry('acme')
    expect(history.value).toEqual(['acme'])
    expect(JSON.parse(localStorage.getItem(PAYMENT_SEARCH_HISTORY_STORAGE_KEY)!)).toEqual(['acme'])

    addEntry('kedai kopi')
    expect(history.value).toEqual(['kedai kopi', 'acme'])
  })

  it('addEntry ignores blank/whitespace-only terms', async () => {
    const { useSearchHistory } = await import(`./useSearchHistory?t=${Date.now()}-5`)
    const { history, addEntry } = useSearchHistory()

    addEntry('   ')
    addEntry('')
    expect(history.value).toEqual([])
  })

  it('addEntry trims whitespace before storing', async () => {
    const { useSearchHistory } = await import(`./useSearchHistory?t=${Date.now()}-6`)
    const { history, addEntry } = useSearchHistory()

    addEntry('  acme  ')
    expect(history.value).toEqual(['acme'])
  })

  it('addEntry deduplicates case-insensitively, moving the existing entry to the front', async () => {
    const { useSearchHistory } = await import(`./useSearchHistory?t=${Date.now()}-7`)
    const { history, addEntry } = useSearchHistory()

    addEntry('acme')
    addEntry('kedai kopi')
    addEntry('ACME')

    expect(history.value).toEqual(['ACME', 'kedai kopi'])
  })

  it('addEntry caps history at 10 entries, dropping the oldest', async () => {
    const { useSearchHistory } = await import(`./useSearchHistory?t=${Date.now()}-8`)
    const { history, addEntry } = useSearchHistory()

    for (let i = 1; i <= 11; i++) addEntry(`term-${i}`)

    expect(history.value).toHaveLength(10)
    expect(history.value[0]).toBe('term-11')
    expect(history.value).not.toContain('term-1')
  })

  it('removeEntry removes a single term and persists the change', async () => {
    const { useSearchHistory } = await import(`./useSearchHistory?t=${Date.now()}-9`)
    const { history, addEntry, removeEntry } = useSearchHistory()

    addEntry('acme')
    addEntry('kedai kopi')
    removeEntry('acme')

    expect(history.value).toEqual(['kedai kopi'])
    expect(JSON.parse(localStorage.getItem(PAYMENT_SEARCH_HISTORY_STORAGE_KEY)!)).toEqual(['kedai kopi'])
  })

  it('clearHistory empties the history and persists the change', async () => {
    const { useSearchHistory } = await import(`./useSearchHistory?t=${Date.now()}-10`)
    const { history, addEntry, clearHistory } = useSearchHistory()

    addEntry('acme')
    clearHistory()

    expect(history.value).toEqual([])
    expect(JSON.parse(localStorage.getItem(PAYMENT_SEARCH_HISTORY_STORAGE_KEY)!)).toEqual([])
  })

  it('suggestionsFor returns the full history when the query is blank', async () => {
    const { useSearchHistory } = await import(`./useSearchHistory?t=${Date.now()}-11`)
    const { addEntry, suggestionsFor } = useSearchHistory()

    addEntry('acme')
    addEntry('kedai kopi')

    expect(suggestionsFor('')).toEqual(['kedai kopi', 'acme'])
  })

  it('suggestionsFor filters case-insensitively by substring', async () => {
    const { useSearchHistory } = await import(`./useSearchHistory?t=${Date.now()}-12`)
    const { addEntry, suggestionsFor } = useSearchHistory()

    addEntry('acme corp')
    addEntry('kedai kopi')

    expect(suggestionsFor('ACME')).toEqual(['acme corp'])
    expect(suggestionsFor('zzz')).toEqual([])
  })

  it('shares state across multiple useSearchHistory() calls (singleton)', async () => {
    const { useSearchHistory } = await import(`./useSearchHistory?t=${Date.now()}-13`)
    const a = useSearchHistory()
    const b = useSearchHistory()

    a.addEntry('acme')
    expect(b.history.value).toEqual(['acme'])
  })
})
