import { ref, watch } from 'vue'
import { SIDEBAR_COLLAPSED_STORAGE_KEY } from '../constants/storage'

const isCollapsed = ref(localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === 'true')
const isMobileOpen = ref(false)

watch(isCollapsed, (value) => {
  localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, String(value))
})

export function useSidebar() {
  function toggleCollapsed() {
    isCollapsed.value = !isCollapsed.value
  }

  function openMobile() {
    isMobileOpen.value = true
  }

  function closeMobile() {
    isMobileOpen.value = false
  }

  return {
    isCollapsed,
    isMobileOpen,
    toggleCollapsed,
    openMobile,
    closeMobile,
  }
}
