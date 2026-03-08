/**
 * Parsing logic for Basketball Reference coaches CSV export.
 */

import { slugify } from './utils'

export { slugify }

export interface Coach {
  entityId: string
  name: string
  type: 'coach'
  gamesCoached: number
  wins: number
  losses: number
}

// BB-Ref CSV column indices
// Format: Rk, Coach, From, To, Yrs, G, W, L, W/L%, W > .500, G, W, L, W/L%, Conf, Champ
const COL_COACH = 1
const COL_G = 5
const COL_W = 6
const COL_L = 7

export function parseCsv(content: string): Coach[] {
  const coaches: Coach[] = []
  let headerFound = false

  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed)
      continue

    // Skip BB-Ref citation header and HTML footer
    if (trimmed.startsWith('---') || trimmed.startsWith('Provided by') || trimmed.includes('<a href'))
      continue

    // Simple CSV split — BB-Ref coach names don't contain commas
    const cols = trimmed.split(',')
    const first = cols[0].trim().toLowerCase()

    // Skip header / sub-header rows
    if (first === 'rk' || first === 'coach' || first === '') {
      if (first === 'rk')
        headerFound = true
      continue
    }

    if (!headerFound)
      continue

    if (cols.length <= COL_L)
      continue

    const nameRaw = cols[COL_COACH].trim().replace(/\*/g, '') // strip Hall of Fame asterisk
    if (!nameRaw)
      continue

    const gamesCoached = Number.parseInt(cols[COL_G], 10)
    const wins = Number.parseInt(cols[COL_W], 10)
    const losses = Number.parseInt(cols[COL_L], 10)

    if (Number.isNaN(gamesCoached) || Number.isNaN(wins) || Number.isNaN(losses))
      continue

    coaches.push({
      entityId: slugify(nameRaw),
      name: nameRaw,
      type: 'coach',
      gamesCoached,
      wins,
      losses,
    })
  }

  return coaches
}
