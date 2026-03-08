/**
 * Fetch all NBA teams with franchise history from the NBA API.
 *
 * Usage:
 *   npx tsx scripts/fetch-teams.ts
 *
 * Calls the TeamDetails endpoint for each of the 30 NBA franchises,
 * builds team entities with franchise era history, and writes teams.json.
 */

import type { Team } from './teams'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { buildFranchiseTeams, parseTeamHistoryResponse } from './teams'

// 30 NBA franchise IDs — stable since 2004 (last expansion: Charlotte Bobcats)
const FRANCHISE_IDS = [
  1610612737,
  1610612738,
  1610612739,
  1610612740,
  1610612741,
  1610612742,
  1610612743,
  1610612744,
  1610612745,
  1610612746,
  1610612747,
  1610612748,
  1610612749,
  1610612750,
  1610612751,
  1610612752,
  1610612753,
  1610612754,
  1610612755,
  1610612756,
  1610612757,
  1610612758,
  1610612759,
  1610612760,
  1610612761,
  1610612762,
  1610612763,
  1610612764,
  1610612765,
  1610612766,
]

const NBA_API_BASE = 'https://stats.nba.com/stats/teamdetails'
const DELAY_MS = 600
const MAX_RETRIES = 3

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  'Accept': 'application/json',
  'Referer': 'https://www.nba.com/',
  'Accept-Language': 'en-US,en;q=0.5',
}

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}

async function fetchTeamDetails(teamId: number): Promise<Record<string, unknown> | null> {
  const url = `${NBA_API_BASE}?TeamID=${teamId}`

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      await sleep(DELAY_MS)
      const res = await fetch(url, { headers: HEADERS })
      if (!res.ok)
        throw new Error(`HTTP ${res.status}`)
      return await res.json() as Record<string, unknown>
    }
    catch (err) {
      if (attempt === MAX_RETRIES - 1) {
        console.error(`  Failed for team ${teamId} after ${MAX_RETRIES} attempts: ${err}`)
        return null
      }
      const wait = 2 ** attempt * 1000
      console.warn(`  Retry ${attempt + 1}/${MAX_RETRIES} for team ${teamId} (waiting ${wait}ms)`)
      await sleep(wait)
    }
  }
  return null
}

async function main(): Promise<void> {
  const outputPath = resolve('content/entities/teams.json')
  const allTeams: Team[] = []
  const total = FRANCHISE_IDS.length

  console.log(`Fetching ${total} franchises from NBA API...`)

  for (let i = 0; i < total; i++) {
    const teamId = FRANCHISE_IDS[i]
    process.stdout.write(`  ${i + 1}/${total}\r`)

    const data = await fetchTeamDetails(teamId)
    if (!data)
      continue

    const rows = parseTeamHistoryResponse(data)
    const teams = buildFranchiseTeams(teamId, rows)
    allTeams.push(...teams)
  }

  allTeams.sort((a, b) => a.entityId.localeCompare(b.entityId))

  writeFileSync(outputPath, `${JSON.stringify(allTeams, null, 2)}\n`, 'utf-8')
  console.log(`\nExported ${allTeams.length} teams to ${outputPath}`)

  // Sanity check against existing file
  try {
    const existing = JSON.parse(readFileSync(outputPath, 'utf-8')) as Team[]
    const oldIds = new Set(existing.map(t => t.entityId))
    const newIds = new Set(allTeams.map(t => t.entityId))
    const removed = [...oldIds].filter(id => !newIds.has(id))
    const added = [...newIds].filter(id => !oldIds.has(id))
    if (removed.length > 0)
      console.warn(`Warning: ${removed.length} teams removed: ${removed.join(', ')}`)
    if (added.length > 0)
      console.log(`New teams: ${added.join(', ')}`)
  }
  catch {
    // No existing file to compare
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
