import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import { useTheme } from '~/composables/useTheme'

// Mock VueUse composables with Vue refs for reactivity
// useLocalStorage: returns a reactive ref seeded with the default value
// usePreferredDark: returns a reactive ref we control to simulate OS dark preference
const mockPrefersDark = ref(false)
vi.mock('@vueuse/core', () => ({
  useLocalStorage: (_key: string, defaultValue: string) => ref(defaultValue),
  usePreferredDark: () => mockPrefersDark,
}))

// Stub document to prevent DOM errors during the watch in useTheme
vi.stubGlobal('document', {
  documentElement: { classList: { toggle: vi.fn() } },
})

describe('useTheme', () => {
  // Tests that the composable initializes with 'auto' mode by default
  it('defaults to auto mode', () => {
    const { mode } = useTheme()
    expect(mode.value).toBe('auto')
  })

  // Tests that isDark follows OS preference when mode is 'auto'
  it('isDark follows OS preference when auto', () => {
    mockPrefersDark.value = true
    const { isDark } = useTheme()
    expect(isDark.value).toBe(true)

    mockPrefersDark.value = false
    expect(isDark.value).toBe(false)
  })

  // Tests that isDark returns true when mode is explicitly 'dark'
  it('isDark is true when mode is dark', () => {
    const { isDark, setMode } = useTheme()
    setMode('dark')
    expect(isDark.value).toBe(true)
  })

  // Tests that isDark returns false when mode is explicitly 'light'
  it('isDark is false when mode is light', () => {
    const { isDark, setMode } = useTheme()
    setMode('light')
    expect(isDark.value).toBe(false)
  })

  // Tests that cycle() rotates through light -> dark -> auto -> light
  it('cycle rotates through modes', () => {
    const { mode, cycle } = useTheme()
    // starts at auto (default from mock)
    cycle() // auto -> light
    expect(mode.value).toBe('light')
    cycle() // light -> dark
    expect(mode.value).toBe('dark')
    cycle() // dark -> auto
    expect(mode.value).toBe('auto')
  })
})
