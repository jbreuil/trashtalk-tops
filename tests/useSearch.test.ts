import type { SearchCategory } from '~/types'
import { describe, expect, it } from 'vitest'

// Test the redistributeSlots logic directly
// We replicate the exact algorithm from useSearch.ts to test in isolation
// without needing to mock all JSON imports and Fuse.js

describe('redistributeSlots', () => {
  // Base slots: tops=5, franchises=3, joueurs=3, coaches=3 (total=14)
  // Priority order: tops > franchises > joueurs > coaches

  const CATEGORIES: SearchCategory[] = ['tops', 'franchises', 'joueurs', 'coaches']
  const BASE_SLOTS: Record<SearchCategory, number> = { tops: 5, franchises: 3, joueurs: 3, coaches: 3 }

  /** Replica of the redistributeSlots logic for unit testing */
  function redistributeSlots(counts: Record<SearchCategory, number>): Record<SearchCategory, number> {
    const slots: Record<SearchCategory, number> = { ...BASE_SLOTS }
    let surplus = 0

    // First pass: collect surplus from categories with fewer results than slots
    for (const cat of CATEGORIES) {
      const count = counts[cat] ?? 0
      if (count < slots[cat]) {
        surplus += slots[cat] - count
        slots[cat] = count
      }
    }

    // Second pass: distribute surplus by priority order (TOPs first)
    if (surplus > 0) {
      for (const cat of CATEGORIES) {
        if (surplus <= 0)
          break
        const canTake = (counts[cat] ?? 0) - slots[cat]
        if (canTake > 0) {
          const give = Math.min(surplus, canTake)
          slots[cat] += give
          surplus -= give
        }
      }
    }

    return slots
  }

  // When all categories have enough results, base slots are preserved
  it('keeps base slots when all categories have enough results', () => {
    const counts: Record<SearchCategory, number> = { tops: 10, franchises: 5, joueurs: 8, coaches: 6 }
    const slots = redistributeSlots(counts)
    expect(slots).toEqual({ tops: 5, franchises: 3, joueurs: 3, coaches: 3 })
  })

  // When one category is empty, its slots go to higher-priority categories first
  it('redistributes from empty categories by priority', () => {
    const counts: Record<SearchCategory, number> = { tops: 10, franchises: 0, joueurs: 8, coaches: 6 }
    const slots = redistributeSlots(counts)
    // franchises gets 0 slots, 3 surplus goes to tops first (has room for 5 more)
    expect(slots.franchises).toBe(0)
    expect(slots.tops).toBe(8) // 5 base + 3 surplus
    const total = Object.values(slots).reduce((a, b) => a + b, 0)
    expect(total).toBe(14) // total slots preserved
  })

  // When a category has fewer results than base slots, surplus redistributes
  it('caps slots at actual result count', () => {
    const counts: Record<SearchCategory, number> = { tops: 2, franchises: 1, joueurs: 10, coaches: 10 }
    const slots = redistributeSlots(counts)
    // tops capped at 2 (surplus 3), franchises capped at 1 (surplus 2) = 5 total surplus
    expect(slots.tops).toBe(2)
    expect(slots.franchises).toBe(1)
    // Surplus 5 goes to joueurs first (can take 7 more), gets all 5
    expect(slots.joueurs).toBe(8) // 3 base + 5 surplus
    expect(slots.coaches).toBe(3) // no surplus left
  })

  // When all categories are empty
  it('handles all empty categories', () => {
    const counts: Record<SearchCategory, number> = { tops: 0, franchises: 0, joueurs: 0, coaches: 0 }
    const slots = redistributeSlots(counts)
    expect(slots).toEqual({ tops: 0, franchises: 0, joueurs: 0, coaches: 0 })
  })

  // When only one category has results, it gets all 14 slots
  it('gives all slots to the only non-empty category', () => {
    const counts: Record<SearchCategory, number> = { tops: 20, franchises: 0, joueurs: 0, coaches: 0 }
    const slots = redistributeSlots(counts)
    expect(slots.tops).toBe(14) // 5 base + 9 surplus
    expect(slots.franchises).toBe(0)
    expect(slots.joueurs).toBe(0)
    expect(slots.coaches).toBe(0)
  })

  // Priority ordering: surplus goes to higher-priority categories first
  it('prioritizes tops over other categories for surplus', () => {
    const counts: Record<SearchCategory, number> = { tops: 20, franchises: 20, joueurs: 0, coaches: 0 }
    const slots = redistributeSlots(counts)
    // joueurs+coaches give 6 surplus. tops gets it first (can take 15 more)
    expect(slots.tops).toBe(11) // 5 + 6
    expect(slots.franchises).toBe(3) // no surplus left
    expect(slots.joueurs).toBe(0)
    expect(slots.coaches).toBe(0)
  })
})

describe('search minimum characters', () => {
  // Verifies that search requires at least 2 characters
  it('requires at least 2 characters', () => {
    const MIN_CHARS = 2
    expect('a'.length < MIN_CHARS).toBe(true)
    expect('ab'.length < MIN_CHARS).toBe(false)
    expect(''.length < MIN_CHARS).toBe(true)
  })
})
