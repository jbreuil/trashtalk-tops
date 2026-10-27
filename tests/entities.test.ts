import type { Entity } from '~/types'
import { describe, expect, it } from 'vitest'
import { entityTypeLabel, mergePlayerCoaches } from '~/utils/entities'

// Minimal fixtures: only the fields the merge logic cares about
const bird: Entity = { entityId: 'larry-bird', name: 'Larry Bird', type: 'player', nbaId: 1449, gamesPlayed: 897 }
const birdCoach: Entity = { entityId: 'larry-bird', name: 'Larry Bird', type: 'coach', gamesCoached: 214, wins: 147, losses: 67 }
const popovich: Entity = { entityId: 'gregg-popovich', name: 'Gregg Popovich', type: 'coach', gamesCoached: 2214, wins: 1390, losses: 824 }
const lebron: Entity = { entityId: 'lebron-james', name: 'LeBron James', type: 'player', nbaId: 2544, gamesPlayed: 1492 }

describe('mergePlayerCoaches', () => {
  it('merges a coach into the player with the same entityId', () => {
    const result = mergePlayerCoaches([bird], [birdCoach])

    // Only one entity left for Larry Bird
    expect(result).toHaveLength(1)
    // toMatchObject checks only the listed fields (extra fields are allowed)
    expect(result[0]).toMatchObject({
      entityId: 'larry-bird',
      type: 'player',
      nbaId: 1449,
      gamesPlayed: 897,
      gamesCoached: 214,
      wins: 147,
      losses: 67,
      roles: ['player', 'coach'],
    })
  })

  it('keeps pure players and pure coaches untouched', () => {
    const result = mergePlayerCoaches([lebron], [popovich])

    // toEqual checks deep equality: no roles field added
    expect(result).toEqual([lebron, popovich])
  })

  it('does not mutate the input entities', () => {
    mergePlayerCoaches([bird], [birdCoach])

    expect(bird.roles).toBeUndefined()
    expect(bird.gamesCoached).toBeUndefined()
  })
})

describe('entityTypeLabel', () => {
  it('returns the single type label', () => {
    expect(entityTypeLabel(lebron)).toBe('Joueur')
    expect(entityTypeLabel(popovich)).toBe('Coach')
  })

  it('joins both labels for a player-coach', () => {
    const [merged] = mergePlayerCoaches([bird], [birdCoach])
    expect(entityTypeLabel(merged)).toBe('Joueur · Coach')
  })
})
