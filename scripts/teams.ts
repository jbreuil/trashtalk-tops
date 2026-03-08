/**
 * Logic for building team entities from NBA API TeamDetails responses.
 */

import { slugify } from './utils'

export interface Team {
  entityId: string
  name: string
  type: 'team'
  nbaId: number
  years: string
  linkedTo?: string
}

export interface TeamHistoryRow {
  city: string
  nickname: string
  yearFounded: number
  yearActiveTill: number
}

/**
 * Build Team entities from a franchise's history rows (one API response).
 * Each row is an era of the franchise (relocation, rename).
 * Replicates the linkedTo logic from nba-fetcher:
 * - Each era links to the first OTHER era in the list
 * - Single-era franchises have no linkedTo
 */
export function buildFranchiseTeams(nbaId: number, rows: TeamHistoryRow[]): Team[] {
  if (rows.length === 0)
    return []

  const eras = rows.map((row) => {
    const name = `${row.city} ${row.nickname}`
    const years = row.yearActiveTill === 0
      ? `${row.yearFounded}-present`
      : `${row.yearFounded}-${row.yearActiveTill}`

    return { entityId: slugify(name), name, nbaId, years }
  })

  return eras.map((era, i) => {
    const team: Team = {
      entityId: era.entityId,
      name: era.name,
      type: 'team',
      nbaId: era.nbaId,
      years: era.years,
    }

    if (eras.length > 1) {
      const linkedIds = eras.filter((_, k) => k !== i).map(e => e.entityId)
      team.linkedTo = linkedIds[0]
    }

    return team
  })
}

/**
 * Parse the TeamHistory resultSet from a TeamDetails API response.
 */
export function parseTeamHistoryResponse(data: Record<string, unknown>): TeamHistoryRow[] {
  const resultSets = data.resultSets as { name: string, headers: string[], rowSet: unknown[][] }[]
  const historySet = resultSets.find(rs => rs.name === 'TeamHistory')

  if (!historySet)
    return []

  const headers = historySet.headers
  const idxCity = headers.indexOf('CITY')
  const idxNickname = headers.indexOf('NICKNAME')
  const idxFounded = headers.indexOf('YEARFOUNDED')
  const idxActiveTill = headers.indexOf('YEARACTIVETILL')

  if (idxCity === -1 || idxNickname === -1 || idxFounded === -1 || idxActiveTill === -1)
    return []

  return historySet.rowSet.map(row => ({
    city: row[idxCity] as string,
    nickname: row[idxNickname] as string,
    yearFounded: row[idxFounded] as number,
    yearActiveTill: row[idxActiveTill] as number,
  }))
}
