import type { Entity, SearchCategory, SearchResultGroup } from '~/types'
import Fuse from 'fuse.js'
import { computed, ref } from 'vue'
import { useEntities } from './useEntities'
import { useTops } from './useTops'

const MIN_CHARS = 2
// Slot budget per category, in priority order (highest to lowest)
const CATEGORIES: SearchCategory[] = ['tops', 'franchises', 'joueurs', 'coaches']
const BASE_SLOTS: Record<SearchCategory, number> = { tops: 5, franchises: 3, joueurs: 3, coaches: 3 }
const CATEGORY_LABELS: Record<SearchCategory, string> = { tops: 'TOPs', franchises: 'Franchises', joueurs: 'Joueurs', coaches: 'Coaches' }
const FUSE_OPTIONS = { threshold: 0.3, includeScore: true, limit: 25 }

// Popularity weighting coefficients per entity type
const W_TEXT = 0.7
const W_POPULARITY = 0.3

export function useSearch() {
  const { getAllTops } = useTops()
  const { getByType } = useEntities()

  const query = ref('')

  // Build Fuse indices
  const topsFuse = new Fuse(getAllTops(), {
    ...FUSE_OPTIONS,
    keys: [
      { name: 'title', weight: 2 },
      { name: 'subject', weight: 1.5 },
      { name: 'tags', weight: 1 },
    ],
  })

  const teams = getByType('team')
  const franchisesFuse = new Fuse(teams, {
    ...FUSE_OPTIONS,
    keys: [
      { name: 'name', weight: 2 },
    ],
  })

  const players = getByType('player')
  const joueursFuse = new Fuse(players, {
    ...FUSE_OPTIONS,
    keys: [
      { name: 'name', weight: 2 },
    ],
  })

  const coaches = [...getByType('coach'), ...getByType('gm')]
  const coachesFuse = new Fuse(coaches, {
    ...FUSE_OPTIONS,
    keys: [
      { name: 'name', weight: 2 },
    ],
  })

  /** Compute popularity score for an entity (0-1) based on career stats + TOP appearances */
  function entityPopularity(entity: Entity, topAppearances: number): number {
    const gp = entity.gamesPlayed ?? entity.gamesCoached ?? 0
    // Normalize gamesPlayed/gamesCoached (max ~2000 for a long career)
    const gpScore = Math.min(gp / 2000, 1)
    // Normalize TOP appearances (max ~20 as reasonable cap)
    const topScore = Math.min(topAppearances / 20, 1)
    return (gpScore + topScore) / 2
  }

  /** Count how many TOPs an entity appears in (deduplicated per TOP) */
  function countTopAppearances(entityId: string): number {
    let count = 0
    for (const top of getAllTops()) {
      const found = top.rankings.some(ranking =>
        ranking.entries.some(entry =>
          entry.entities?.some(e => e.entityId === entityId),
        ),
      )
      if (found)
        count++
    }
    return count
  }

  /**
   * Redistribute slots from empty/under-quota categories to others.
   * Priority order: TOPs > Franchises > Joueurs > Coaches.
   * Surplus from under-quota categories is given to higher-priority ones first.
   */
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

  const results = computed<SearchResultGroup[]>(() => {
    const q = query.value.trim()
    if (q.length < MIN_CHARS)
      return []

    const rawTops = topsFuse.search(q)
    const rawFranchises = franchisesFuse.search(q)
    const rawJoueurs = joueursFuse.search(q)
    const rawCoaches = coachesFuse.search(q)

    const counts: Record<SearchCategory, number> = {
      tops: rawTops.length,
      franchises: rawFranchises.length,
      joueurs: rawJoueurs.length,
      coaches: rawCoaches.length,
    }

    const slots = redistributeSlots(counts)
    const groups: SearchResultGroup[] = []

    // TOPs — text relevance only (no popularity weighting per spec)
    if (rawTops.length > 0) {
      groups.push({
        category: 'tops',
        label: CATEGORY_LABELS.tops,
        results: rawTops.map(r => ({
          category: 'tops' as const,
          item: r.item,
          score: r.score ?? 1,
        })),
        defaultCount: slots.tops,
      })
    }

    // Franchises (teams) — popularity = TOP appearances only
    if (rawFranchises.length > 0) {
      const scored = rawFranchises.map((r) => {
        const appearances = countTopAppearances(r.item.entityId)
        const popScore = Math.min(appearances / 20, 1)
        const finalScore = (r.score ?? 1) * W_TEXT + (1 - popScore) * W_POPULARITY
        return { category: 'franchises' as const, item: r.item as Entity, score: finalScore }
      }).sort((a, b) => a.score - b.score)

      groups.push({
        category: 'franchises',
        label: CATEGORY_LABELS.franchises,
        results: scored,
        defaultCount: slots.franchises,
      })
    }

    // Joueurs — popularity = gamesPlayed + TOP appearances
    if (rawJoueurs.length > 0) {
      const scored = rawJoueurs.map((r) => {
        const pop = entityPopularity(r.item, countTopAppearances(r.item.entityId))
        const finalScore = (r.score ?? 1) * W_TEXT + (1 - pop) * W_POPULARITY
        return { category: 'joueurs' as const, item: r.item as Entity, score: finalScore }
      }).sort((a, b) => a.score - b.score)

      groups.push({
        category: 'joueurs',
        label: CATEGORY_LABELS.joueurs,
        results: scored,
        defaultCount: slots.joueurs,
      })
    }

    // Coaches — popularity = gamesCoached + TOP appearances
    if (rawCoaches.length > 0) {
      const scored = rawCoaches.map((r) => {
        const pop = entityPopularity(r.item, countTopAppearances(r.item.entityId))
        const finalScore = (r.score ?? 1) * W_TEXT + (1 - pop) * W_POPULARITY
        return { category: 'coaches' as const, item: r.item as Entity, score: finalScore }
      }).sort((a, b) => a.score - b.score)

      groups.push({
        category: 'coaches',
        label: CATEGORY_LABELS.coaches,
        results: scored,
        defaultCount: slots.coaches,
      })
    }

    return groups
  })

  return {
    query,
    results,
    redistributeSlots,
  }
}
