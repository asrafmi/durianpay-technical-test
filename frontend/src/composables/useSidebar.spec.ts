import { beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { SIDEBAR_COLLAPSED_STORAGE_KEY } from '../constants/storage'

describe('useSidebar', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts collapsed=false and mobileOpen=false when localStorage is empty', async () => {
    const { useSidebar } = await import(`./useSidebar?t=${Date.now()}-1`)
    const sidebar = useSidebar()
    expect(sidebar.isCollapsed.value).toBe(false)
    expect(sidebar.isMobileOpen.value).toBe(false)
  })

  it('starts collapsed=true when localStorage says so', async () => {
    localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, 'true')
    const { useSidebar } = await import(`./useSidebar?t=${Date.now()}-2`)
    const sidebar = useSidebar()
    expect(sidebar.isCollapsed.value).toBe(true)
  })

  it('toggleCollapsed flips isCollapsed and persists to localStorage', async () => {
    const { useSidebar } = await import(`./useSidebar?t=${Date.now()}-3`)
    const sidebar = useSidebar()

    sidebar.toggleCollapsed()
    await nextTick()
    expect(sidebar.isCollapsed.value).toBe(true)
    expect(localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY)).toBe('true')

    sidebar.toggleCollapsed()
    await nextTick()
    expect(sidebar.isCollapsed.value).toBe(false)
    expect(localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY)).toBe('false')
  })

  it('openMobile/closeMobile toggle isMobileOpen', async () => {
    const { useSidebar } = await import(`./useSidebar?t=${Date.now()}-4`)
    const sidebar = useSidebar()

    sidebar.openMobile()
    expect(sidebar.isMobileOpen.value).toBe(true)

    sidebar.closeMobile()
    expect(sidebar.isMobileOpen.value).toBe(false)
  })

  it('shares state across multiple useSidebar() calls (singleton)', async () => {
    const { useSidebar } = await import(`./useSidebar?t=${Date.now()}-5`)
    const a = useSidebar()
    const b = useSidebar()

    a.toggleCollapsed()
    expect(b.isCollapsed.value).toBe(true)
  })
})
