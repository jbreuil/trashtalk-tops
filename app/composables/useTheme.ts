import { useLocalStorage, usePreferredDark } from '@vueuse/core'
import { computed, watch } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'auto'

export function useTheme() {
  const prefersDark = usePreferredDark()
  const mode = useLocalStorage<ThemeMode>('tt-theme', 'auto')

  const isDark = computed(() => {
    if (mode.value === 'auto')
      return prefersDark.value
    return mode.value === 'dark'
  })

  function setMode(newMode: ThemeMode) {
    mode.value = newMode
  }

  function cycle() {
    const order: ThemeMode[] = ['light', 'dark', 'auto']
    const idx = order.indexOf(mode.value)
    mode.value = order[(idx + 1) % order.length]
  }

  watch(isDark, (dark) => {
    if (import.meta.client) {
      document.documentElement.classList.toggle('dark', dark)
    }
  }, { immediate: true })

  return {
    mode,
    isDark,
    setMode,
    cycle,
  }
}
