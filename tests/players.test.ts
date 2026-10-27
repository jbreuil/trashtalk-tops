import { describe, expect, it } from 'vitest'
import {
  buildPlayers,
  currentSeasonYear,
  HARDCODED_PLAYERS,
  needsCareerTotals,
  parseAllPlayersResponse,
  parseCareerTotalsResponse,
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

describe('parseAllPlayersResponse with FROM_YEAR', () => {
  it('parses the career start year when available', () => {
    // The API returns FROM_YEAR as a string
    const data = {
      resultSets: [{
        name: 'CommonAllPlayers',
        headers: ['PERSON_ID', 'DISPLAY_FIRST_LAST', 'FROM_YEAR'],
        rowSet: [[1449, 'Larry Bird', '1979']],
      }],
    }

    expect(parseAllPlayersResponse(data)[0]).toEqual({ id: 1449, name: 'Larry Bird', fromYear: 1979 })
  })
})

describe('needsCareerTotals', () => {
  it('is true for careers starting before 1996-97', () => {
    expect(needsCareerTotals(1979)).toBe(true)
    expect(needsCareerTotals(1995)).toBe(true)
  })

  it('is false from 1996-97 on, or when the start year is unknown', () => {
    expect(needsCareerTotals(1996)).toBe(false)
    expect(needsCareerTotals(undefined)).toBe(false)
  })
})

describe('parseCareerTotalsResponse', () => {
  it('returns career regular season GP', () => {
    // Other result sets (per-season, playoffs) must be ignored
    const data = {
      resultSets: [
        { name: 'SeasonTotalsRegularSeason', headers: ['PLAYER_ID', 'GP'], rowSet: [[1449, 82]] },
        { name: 'CareerTotalsRegularSeason', headers: ['PLAYER_ID', 'LEAGUE_ID', 'TEAM_ID', 'GP'], rowSet: [[1449, '00', 0, 897]] },
        { name: 'CareerTotalsPostSeason', headers: ['PLAYER_ID', 'GP'], rowSet: [[1449, 164]] },
      ],
    }

    expect(parseCareerTotalsResponse(data)).toBe(897)
  })

  it('returns 0 when the player has no career totals', () => {
    const data = { resultSets: [{ name: 'CareerTotalsRegularSeason', headers: ['PLAYER_ID', 'GP'], rowSet: [] }] }

    expect(parseCareerTotalsResponse(data)).toBe(0)
    expect(parseCareerTotalsResponse({ resultSets: [] })).toBe(0)
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

  it('keeps the bare slug for the oldest homonym (lowest nbaId)', () => {
    // API order is not guaranteed: the newer Glen Rice (Jr.) comes first here
    const allPlayers = [
      { id: 203318, name: 'Glen Rice' },
      { id: 779, name: 'Glen Rice' },
    ]
    const gpById = new Map<number, number>()

    const result = buildPlayers(allPlayers, gpById)

    // find() returns the first matching player, or undefined if none
    expect(result.find(p => p.entityId === 'glen-rice')?.nbaId).toBe(779)
    expect(result.find(p => p.entityId === 'glen-rice-2')?.nbaId).toBe(203318)
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
