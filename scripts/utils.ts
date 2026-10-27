/**
 * Shared utilities for data scripts.
 */

export function slugify(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[\u0300-\u036F]/g, '') // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Make entityIds unique by suffixing homonyms with -2, -3, ...
 * Entities must be passed in priority order: the first occurrence keeps the
 * bare slug, so existing references stay stable as long as the order is stable
 * (a newcomer homonym must sort last so it never steals an existing slug).
 */
export function disambiguateEntityIds<T extends { entityId: string }>(entities: T[]): T[] {
  const counts = new Map<string, number>()
  return entities.map((entity) => {
    const count = (counts.get(entity.entityId) ?? 0) + 1
    counts.set(entity.entityId, count)
    return count === 1 ? entity : { ...entity, entityId: `${entity.entityId}-${count}` }
  })
}
