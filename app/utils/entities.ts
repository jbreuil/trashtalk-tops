import type { Entity } from '~/types'

const TYPE_LABELS: Record<Entity['type'], string> = {
  player: 'Joueur',
  coach: 'Coach',
  team: 'Équipe',
  gm: 'General Manager',
}

/**
 * Merge player-coaches into a single entity.
 * A coach sharing its entityId with a player is the same person (different
 * people are given distinct ids by scripts/coaches.ts): the player entity is
 * kept and enriched with the coaching record. Merged coaches are dropped.
 */
export function mergePlayerCoaches(players: Entity[], coaches: Entity[]): Entity[] {
  const coachById = new Map(coaches.map(c => [c.entityId, c]))
  const playerIds = new Set(players.map(p => p.entityId))

  const merged = players.map((player) => {
    const coach = coachById.get(player.entityId)
    if (!coach)
      return player
    return {
      ...player,
      gamesCoached: coach.gamesCoached,
      wins: coach.wins,
      losses: coach.losses,
      roles: ['player', 'coach'] as Entity['type'][],
    }
  })

  return [...merged, ...coaches.filter(c => !playerIds.has(c.entityId))]
}

/** Display label for an entity type, e.g. "Joueur · Coach" for a player-coach */
export function entityTypeLabel(entity: Entity): string {
  return (entity.roles ?? [entity.type]).map(t => TYPE_LABELS[t]).join(' · ')
}
