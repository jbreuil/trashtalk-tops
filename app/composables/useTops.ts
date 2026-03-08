import type { Top, Top100 } from '~/types'

const topModules = import.meta.glob('~/../content/tops/*.json', { eager: true, import: 'default' })
const top100Modules = import.meta.glob('~/../content/top100/*.json', { eager: true, import: 'default' })

const allTopFiles: Top[] = Object.values(topModules) as Top[]
const allTop100Files: Top100[] = Object.values(top100Modules) as Top100[]

/** Group TOPs by slug to find all versions of the same TOP */
function groupBySlug(tops: Top[]): Map<string, Top[]> {
  const map = new Map<string, Top[]>()
  for (const top of tops) {
    const list = map.get(top.slug) ?? []
    list.push(top)
    map.set(top.slug, list)
  }
  // Sort each group by version ascending
  for (const list of map.values()) {
    list.sort((a, b) => a.version - b.version)
  }
  return map
}

const topsBySlug = groupBySlug(allTopFiles)

/** Deduplicated list: latest version of each TOP */
const latestTops: Top[] = [...topsBySlug.values()].map(
  versions => versions[versions.length - 1],
)

export function useTops() {
  function getAllTops(): Top[] {
    return latestTops
  }

  function getAllTopFiles(): Top[] {
    return allTopFiles
  }

  function getTopBySlug(slug: string, version?: number): Top | undefined {
    const versions = topsBySlug.get(slug)
    if (!versions)
      return undefined
    if (version !== undefined)
      return versions.find(t => t.version === version)
    return versions[versions.length - 1]
  }

  function getTopVersions(slug: string): Top[] {
    return topsBySlug.get(slug) ?? []
  }

  function getAllTop100(): Top100[] {
    return allTop100Files
  }

  function getTop100BySlug(slug: string): Top100 | undefined {
    return allTop100Files.find(t => t.slug === slug)
  }

  /** Get chronologically adjacent TOPs for navigation (latest version of each, excludes Top 100) */
  function getAdjacentTops(slug: string): { prev: Top | null, next: Top | null } {
    const sorted = [...latestTops].sort((a, b) =>
      a.publishedAt.localeCompare(b.publishedAt),
    )
    const idx = sorted.findIndex(t => t.slug === slug)
    return {
      prev: idx > 0 ? sorted[idx - 1] : null,
      next: idx < sorted.length - 1 ? sorted[idx + 1] : null,
    }
  }

  /** Get related TOPs by shared tags (latest version only) */
  function getRelatedTops(slug: string, limit = 4): Top[] {
    const current = getTopBySlug(slug)
    if (!current)
      return []

    return latestTops
      .filter(t => t.slug !== slug)
      .map(t => ({
        top: t,
        shared: t.tags.filter(tag => current.tags.includes(tag)).length,
      }))
      .filter(({ shared }) => shared > 0)
      .sort((a, b) => b.shared - a.shared)
      .slice(0, limit)
      .map(({ top }) => top)
  }

  return {
    getAllTops,
    getAllTopFiles,
    getTopBySlug,
    getTopVersions,
    getAllTop100,
    getTop100BySlug,
    getAdjacentTops,
    getRelatedTops,
  }
}
