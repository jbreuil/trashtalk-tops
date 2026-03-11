/**
 * Logic for building player entities from NBA API responses.
 */

import { slugify } from './utils'

export interface Player {
  entityId: string
  name: string
  type: 'player'
  gamesPlayed: number
  nbaId?: number
}

/** Players drafted but never played — not in any API list */
export const HARDCODED_PLAYERS: Player[] = [
  { entityId: 'len-bias', name: 'Len Bias', type: 'player', gamesPlayed: 0 },
  { entityId: 'oscar-schmidt', name: 'Oscar Schmidt', type: 'player', gamesPlayed: 0 },
  { entityId: 'nikos-galis', name: 'Nikos Galis', type: 'player', gamesPlayed: 0 },
  { entityId: 'dejan-bodiroga', name: 'Dejan Bodiroga', type: 'player', gamesPlayed: 0 },
  { entityId: 'sergei-belov', name: 'Sergei Belov', type: 'player', gamesPlayed: 0 },
  { entityId: 'sergio-llull', name: 'Sergio Llull', type: 'player', gamesPlayed: 0 },
  { entityId: 'theo-papaloukas', name: 'Theo Papaloukas', type: 'player', gamesPlayed: 0 },
  { entityId: 'earl-manigault', name: 'Earl Manigault', type: 'player', gamesPlayed: 0 },
  { entityId: 'joe-hammond', name: 'Joe Hammond', type: 'player', gamesPlayed: 0 },
  { entityId: 'kresimir-cosic', name: 'Kresimir Cosic', type: 'player', gamesPlayed: 0 },
  { entityId: 'herve-dubuisson', name: 'Hervé Dubuisson', type: 'player', gamesPlayed: 0 },
  { entityId: 'warren-jabali', name: 'Warren Jabali', type: 'player', gamesPlayed: 0 },
  { entityId: 'hank-gathers', name: 'Hank Gathers', type: 'player', gamesPlayed: 0 },
]

/**
 * Derive the current NBA season start year.
 * NBA season starts in October: Oct 2025 → season 2025-26, Mar 2026 → still 2025-26.
 */
export function currentSeasonYear(): number {
  const now = new Date()
  return now.getMonth() >= 9 ? now.getFullYear() : now.getFullYear() - 1
}

/** Convert a start year to NBA season format: 2023 → "2023-24" */
export function seasonString(startYear: number): string {
  const endYear = (startYear + 1) % 100
  return `${startYear}-${endYear.toString().padStart(2, '0')}`
}

/** Parse the CommonAllPlayers resultSet from the API response */
export function parseAllPlayersResponse(data: Record<string, unknown>): { id: number, name: string }[] {
  const resultSets = data.resultSets as { name: string, headers: string[], rowSet: unknown[][] }[]
  const playerSet = resultSets?.find(rs => rs.name === 'CommonAllPlayers')

  if (!playerSet)
    return []

  const headers = playerSet.headers
  const idxId = headers.indexOf('PERSON_ID')
  const idxName = headers.indexOf('DISPLAY_FIRST_LAST')

  if (idxId === -1 || idxName === -1)
    return []

  return playerSet.rowSet.map(row => ({
    id: row[idxId] as number,
    name: (row[idxName] as string).trim(),
  }))
}

/** Parse LeagueDashPlayerStats resultSet — returns player ID and games played */
export function parseSeasonStatsResponse(data: Record<string, unknown>): { playerId: number, gp: number }[] {
  const resultSets = data.resultSets as { name: string, headers: string[], rowSet: unknown[][] }[]
  const statsSet = resultSets?.[0]

  if (!statsSet)
    return []

  const headers = statsSet.headers
  const idxId = headers.indexOf('PLAYER_ID')
  const idxGp = headers.indexOf('GP')

  if (idxId === -1 || idxGp === -1)
    return []

  return statsSet.rowSet.map(row => ({
    playerId: row[idxId] as number,
    gp: row[idxGp] as number,
  }))
}

/**
 * Build Player entities from the full player list and accumulated GP data.
 * Replicates nba-fetcher logic: all players from the list get an entry,
 * with gamesPlayed=0 if they never appear in season stats.
 */
export function buildPlayers(
  allPlayersList: { id: number, name: string }[],
  gpById: Map<number, number>,
): Player[] {
  const players: Player[] = allPlayersList.map(p => ({
    entityId: slugify(p.name),
    name: p.name,
    type: 'player' as const,
    gamesPlayed: gpById.get(p.id) ?? 0,
    nbaId: p.id,
  }))

  // Add hardcoded players not in the API list
  const existingIds = new Set(players.map(p => p.entityId))
  for (const player of HARDCODED_PLAYERS) {
    if (!existingIds.has(player.entityId))
      players.push(player)
  }

  return players
}
