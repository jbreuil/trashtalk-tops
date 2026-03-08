import { describe, expect, it } from 'vitest'
import { buildFranchiseTeams, parseTeamHistoryResponse } from '../scripts/teams'

describe('buildFranchiseTeams', () => {
  const NBA_ID = 1610612738

  it('builds a single-era franchise with no linkedTo', () => {
    const result = buildFranchiseTeams(NBA_ID, [
      { city: 'Boston', nickname: 'Celtics', yearFounded: 1946, yearActiveTill: 0 },
    ])

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      entityId: 'boston-celtics',
      name: 'Boston Celtics',
      type: 'team',
      nbaId: NBA_ID,
      years: '1946-present',
    })
    // No linkedTo property at all
    expect(result[0]).not.toHaveProperty('linkedTo')
  })

  it('builds a two-era franchise with linkedTo', () => {
    const result = buildFranchiseTeams(1610612760, [
      { city: 'Oklahoma City', nickname: 'Thunder', yearFounded: 2008, yearActiveTill: 0 },
      { city: 'Seattle', nickname: 'SuperSonics', yearFounded: 1967, yearActiveTill: 2008 },
    ])

    expect(result).toHaveLength(2)

    // First era links to the second
    expect(result[0].entityId).toBe('oklahoma-city-thunder')
    expect(result[0].linkedTo).toBe('seattle-supersonics')
    expect(result[0].years).toBe('2008-present')

    // Second era links to the first
    expect(result[1].entityId).toBe('seattle-supersonics')
    expect(result[1].linkedTo).toBe('oklahoma-city-thunder')
    expect(result[1].years).toBe('1967-2008')
  })

  it('builds a multi-era franchise — each era links to the first other era', () => {
    // Washington franchise: 3 eras (simplified)
    const result = buildFranchiseTeams(1610612764, [
      { city: 'Washington', nickname: 'Wizards', yearFounded: 1997, yearActiveTill: 0 },
      { city: 'Washington', nickname: 'Bullets', yearFounded: 1974, yearActiveTill: 1997 },
      { city: 'Baltimore', nickname: 'Bullets', yearFounded: 1963, yearActiveTill: 1973 },
    ])

    expect(result).toHaveLength(3)

    // Wizards (index 0) links to Bullets (index 1, first other)
    expect(result[0].entityId).toBe('washington-wizards')
    expect(result[0].linkedTo).toBe('washington-bullets')

    // Bullets (index 1) links to Wizards (index 0, first other)
    expect(result[1].entityId).toBe('washington-bullets')
    expect(result[1].linkedTo).toBe('washington-wizards')

    // Baltimore (index 2) links to Wizards (index 0, first other)
    expect(result[2].entityId).toBe('baltimore-bullets')
    expect(result[2].linkedTo).toBe('washington-wizards')
  })

  it('returns empty array for empty rows', () => {
    expect(buildFranchiseTeams(NBA_ID, [])).toEqual([])
  })

  it('uses yearActiveTill 0 as "present"', () => {
    const result = buildFranchiseTeams(NBA_ID, [
      { city: 'Boston', nickname: 'Celtics', yearFounded: 1946, yearActiveTill: 0 },
    ])

    expect(result[0].years).toBe('1946-present')
  })

  it('uses yearActiveTill as end year when non-zero', () => {
    const result = buildFranchiseTeams(NBA_ID, [
      { city: 'Seattle', nickname: 'SuperSonics', yearFounded: 1967, yearActiveTill: 2008 },
    ])

    expect(result[0].years).toBe('1967-2008')
  })
})

describe('parseTeamHistoryResponse', () => {
  it('parses a valid TeamHistory resultSet', () => {
    const data = {
      resultSets: [
        { name: 'TeamBackground', headers: [], rowSet: [] },
        {
          name: 'TeamHistory',
          headers: ['TEAM_ID', 'CITY', 'NICKNAME', 'YEARFOUNDED', 'YEARACTIVETILL'],
          rowSet: [
            [1610612760, 'Oklahoma City', 'Thunder', 2008, 0],
            [1610612760, 'Seattle', 'SuperSonics', 1967, 2008],
          ],
        },
      ],
    }

    const result = parseTeamHistoryResponse(data)

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({
      city: 'Oklahoma City',
      nickname: 'Thunder',
      yearFounded: 2008,
      yearActiveTill: 0,
    })
    expect(result[1]).toEqual({
      city: 'Seattle',
      nickname: 'SuperSonics',
      yearFounded: 1967,
      yearActiveTill: 2008,
    })
  })

  it('returns empty array when TeamHistory resultSet is missing', () => {
    const data = {
      resultSets: [
        { name: 'TeamBackground', headers: [], rowSet: [] },
      ],
    }

    expect(parseTeamHistoryResponse(data)).toEqual([])
  })

  it('returns empty array when headers are missing', () => {
    const data = {
      resultSets: [
        { name: 'TeamHistory', headers: ['UNKNOWN'], rowSet: [] },
      ],
    }

    expect(parseTeamHistoryResponse(data)).toEqual([])
  })
})
