import type { Entity } from '~/types'

import coachesData from '~/../content/entities/coaches.json'
import gmsData from '~/../content/entities/gms.json'
import playersData from '~/../content/entities/players.json'
import teamsData from '~/../content/entities/teams.json'

const allEntities: Entity[] = [
  ...(playersData as Entity[]),
  ...(coachesData as Entity[]),
  ...(gmsData as Entity[]),
  ...(teamsData as Entity[]),
]

const entityMap = new Map<string, Entity>(
  allEntities.map(e => [e.entityId, e]),
)

export function useEntities() {
  function getAll(): Entity[] {
    return allEntities
  }

  function getById(entityId: string): Entity | undefined {
    return entityMap.get(entityId)
  }

  function getByType(type: Entity['type']): Entity[] {
    return allEntities.filter(e => e.type === type)
  }

  function getEntityMap(): Map<string, Entity> {
    return entityMap
  }

  return {
    getAll,
    getById,
    getByType,
    getEntityMap,
  }
}
