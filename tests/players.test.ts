import { describe, expect, it } from 'vitest'
import {
  buildPlayers,
  currentSeasonYear,
  HARDCODED_PLAYERS,
  parseAllPlayersResponse,
  parseSeasonStatsResponse,
  seasonString,
} from '../scripts/players'

describe('seasonString', () => {
  it('converts year to NBA season format', () => {
    expect(seasonString(2023)).toBe('2023-24')
  })

  it('handles century boundary', () => {
    expect(seasonString(1999)).toBe('1999-00')
  })

  it('pads single-digit end year', () => {
    expect(seasonString(2008)).toBe('2008-09')
  })
})

describe('currentSeasonYear', () => {
  it('returns a reasonable year', () => {
    const year = currentSeasonYear()
    // Should be within a year of now
    const now = new Date().getFullYear()
    expect(year).toBeGreaterThanOrEqual(now - 1)
    expect(year).toBeLessThanOrEqual(now)
  })
})

describe('parseAllPlayersResponse', () => {
  it('parses a valid CommonAllPlayers response', () => {
    const data = {
      resultSets: [{
        name: 'CommonAllPlayers',
        headers: ['PERSON_ID', 'DISPLAY_LAST_COMMA_FIRST', 'DISPLAY_FIRST_LAST', 'ROSTER_STATUS'],
        rowSet: [
          [2544, 'James, LeBron', 'LeBron James', 1],
          [201939, 'Curry, Stephen', 'Stephen Curry', 1],
        ],
      }],
    }

    const result = parseAllPlayersResponse(data)

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ id: 2544, name: 'LeBron James' })
    expect(result[1]).toEqual({ id: 201939, name: 'Stephen Curry' })
  })

  it('returns empty array when resultSet is missing', () => {
    expect(parseAllPlayersResponse({ resultSets: [] })).toEqual([])
  })

  it('returns empty array when headers are missing', () => {
    const data = {
      resultSets: [{
        name: 'CommonAllPlayers',
        headers: ['UNKNOWN'],
        rowSet: [],
      }],
    }

    expect(parseAllPlayersResponse(data)).toEqual([])
  })
})

describe('parseSeasonStatsResponse', () => {
  it('parses a valid LeagueDashPlayerStats response', () => {
    const data = {
      resultSets: [{
        name: 'LeagueDashPlayerStats',
        headers: ['PLAYER_ID', 'PLAYER_NAME', 'TEAM_ID', 'GP', 'MIN'],
        rowSet: [
          [2544, 'LeBron James', 1610612747, 82, 3000],
          [201939, 'Stephen Curry', 1610612744, 74, 2500],
        ],
      }],
    }

    const result = parseSeasonStatsResponse(data)

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ playerId: 2544, gp: 82 })
    expect(result[1]).toEqual({ playerId: 201939, gp: 74 })
  })

  it('returns empty array when resultSet is missing', () => {
    expect(parseSeasonStatsResponse({ resultSets: [] })).toEqual([])
  })
})

describe('buildPlayers', () => {
  it('builds players with GP data', () => {
    const allPlayers = [
      { id: 2544, name: 'LeBron James' },
      { id: 201939, name: 'Stephen Curry' },
    ]
    const gpById = new Map([[2544, 1500], [201939, 900]])

    const result = buildPlayers(allPlayers, gpById)

    expect(result).toHaveLength(2 + HARDCODED_PLAYERS.length)
    expect(result[0]).toEqual({
      entityId: 'lebron-james',
      name: 'LeBron James',
      type: 'player',
      gamesPlayed: 1500,
      nbaId: 2544,
    })
  })

  it('defaults to 0 GP for players not in stats', () => {
    const allPlayers = [{ id: 999, name: 'Unknown Player' }]
    const gpById = new Map<number, number>()

    const result = buildPlayers(allPlayers, gpById)

    const player = result.find(p => p.nbaId === 999)
    expect(player?.gamesPlayed).toBe(0)
  })

  it('adds hardcoded players not in API list', () => {
    const allPlayers = [{ id: 2544, name: 'LeBron James' }]
    const gpById = new Map([[2544, 1500]])

    const result = buildPlayers(allPlayers, gpById)

    // Len Bias should be added
    const lenBias = result.find(p => p.entityId === 'len-bias')
    expect(lenBias).toBeDefined()
    expect(lenBias?.gamesPlayed).toBe(0)
    expect(lenBias?.nbaId).toBeUndefined()
  })

  it('does not duplicate hardcoded player if already in API list', () => {
    // If Len Bias somehow appeared in the API list
    const allPlayers = [{ id: 9999, name: 'Len Bias' }]
    const gpById = new Map<number, number>()

    const result = buildPlayers(allPlayers, gpById)

    const lenBiases = result.filter(p => p.entityId === 'len-bias')
    expect(lenBiases).toHaveLength(1)
    // Should be the API version (with nbaId), not the hardcoded one
    expect(lenBiases[0].nbaId).toBe(9999)
  })
})
