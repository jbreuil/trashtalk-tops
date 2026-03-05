import { describe, expect, it, vi } from 'vitest'

import { useSpoiler } from '~/composables/useSpoiler'

// Mock useLocalStorage to return a simple reactive ref
vi.mock('@vueuse/core', () => ({
  useLocalStorage: (_key: string, defaultValue: boolean) => ({ value: defaultValue }),
}))

describe('useSpoiler', () => {
  // Tests that spoiler is ON by default (rankings are hidden)
  it('defaults to spoiler ON', () => {
    const { spoilerOn } = useSpoiler()
    expect(spoilerOn.value).toBe(true)
  })

  // Tests that toggle flips the spoiler state
  it('toggle flips spoilerOn', () => {
    const { spoilerOn, toggle } = useSpoiler()
    expect(spoilerOn.value).toBe(true)

    toggle()
    expect(spoilerOn.value).toBe(false)

    toggle()
    expect(spoilerOn.value).toBe(true)
  })
})
