import { describe, expect, it } from 'vitest'

/**
 * Tests for version diff computation logic.
 * This mirrors the logic used in VersionDiffBadge.vue
 */
function computeDiff(previousRank: number | undefined, currentRank: number) {
  if (previousRank === undefined)
    return { type: 'new' as const, value: 0 }
  const change = previousRank - currentRank
  if (change > 0)
    return { type: 'up' as const, value: change }
  if (change < 0)
    return { type: 'down' as const, value: Math.abs(change) }
  return { type: 'equal' as const, value: 0 }
}

describe('version diff computation', () => {
  // Player moved up in ranking (e.g. from 5 to 2 = ↑3)
  it('detects upward movement', () => {
    const diff = computeDiff(5, 2)
    expect(diff.type).toBe('up')
    expect(diff.value).toBe(3)
  })

  // Player moved down in ranking (e.g. from 2 to 7 = ↓5)
  it('detects downward movement', () => {
    const diff = computeDiff(2, 7)
    expect(diff.type).toBe('down')
    expect(diff.value).toBe(5)
  })

  // Player stayed at the same rank
  it('detects no change', () => {
    const diff = computeDiff(3, 3)
    expect(diff.type).toBe('equal')
    expect(diff.value).toBe(0)
  })

  // New entry (no previous rank)
  it('detects new entry', () => {
    const diff = computeDiff(undefined, 5)
    expect(diff.type).toBe('new')
    expect(diff.value).toBe(0)
  })

  // Edge case: from rank 1 to rank 1
  it('handles rank 1 staying at rank 1', () => {
    const diff = computeDiff(1, 1)
    expect(diff.type).toBe('equal')
  })

  // Edge case: from rank 10 to rank 1 (big jump)
  it('handles large upward movement', () => {
    const diff = computeDiff(10, 1)
    expect(diff.type).toBe('up')
    expect(diff.value).toBe(9)
  })
})
