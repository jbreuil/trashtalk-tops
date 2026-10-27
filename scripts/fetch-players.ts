/**
 * Fetch all NBA players with career games played from the NBA API.
 *
 * Usage:
 *   npx tsx scripts/fetch-players.ts
 *
 * Calls CommonAllPlayers (1 call) for the full player list, then
 * LeagueDashPlayerStats for each NBA season since 1996-97 (~30 calls) to
 * accumulate career games played. Careers starting before 1996-97 (not
 * covered by LeagueDashPlayerStats) use PlayerCareerStats totals, cached in
 * scripts/data/career-games-played.json: these players are all retired, so
 * only players missing from the cache are fetched. Writes players.json.
 *
 * Expected runtime: ~1 minute (~40 minutes when the cache is empty).
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import {
  buildPlayers,
  currentSeasonYear,
  FIRST_DASH_STATS_SEASON_YEAR,
  needsCareerTotals,
  parseAllPlayersResponse,
  parseCareerTotalsResponse,
  parseSeasonStatsResponse,
  seasonString,
} from './players'

const CAREER_GP_CACHE_PATH = resolve('scripts/data/career-games-played.json')

const NBA_API_BASE = 'https://stats.nba.com/stats'
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

async function fetchWithRetry(url: string): Promise<Record<string, unknown> | null> {
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
        console.error(`  Failed after ${MAX_RETRIES} attempts: ${err}`)
        return null
      }
      const wait = 2 ** attempt * 1000
      console.warn(`  Retry ${attempt + 1}/${MAX_RETRIES} (waiting ${wait}ms)`)
      await sleep(wait)
    }
  }
  return null
}

async function main(): Promise<void> {
  const outputPath = resolve('content/entities/players.json')
  const currentYear = currentSeasonYear()
  const currentSeason = seasonString(currentYear)

  // Step 1: Fetch full player list
  console.log('Fetching all players list...')
  const allPlayersUrl = `${NBA_API_BASE}/commonallplayers?LeagueID=00&Season=${currentSeason}&IsOnlyCurrentSeason=0`
  const allPlayersData = await fetchWithRetry(allPlayersUrl)
  if (!allPlayersData) {
    console.error('Failed to fetch player list')
    process.exit(1)
  }
  const allPlayersList = parseAllPlayersResponse(allPlayersData)
  console.log(`  ${allPlayersList.length} players found`)

  // Step 2: Fetch season stats and accumulate GP
  const seasons = Array.from(
    { length: currentYear - FIRST_DASH_STATS_SEASON_YEAR + 1 },
    (_, i) => FIRST_DASH_STATS_SEASON_YEAR + i,
  )
  const totalSeasons = seasons.length
  const gpById = new Map<number, number>()

  console.log(`Fetching stats for ${totalSeasons} seasons (${seasonString(FIRST_DASH_STATS_SEASON_YEAR)} to ${currentSeason})...`)

  for (let i = 0; i < totalSeasons; i++) {
    const season = seasonString(seasons[i])
    process.stdout.write(`  ${i + 1}/${totalSeasons} (${season})\r`)

    // nba_api requires all default parameters — the API returns 500 without them
    const params = new URLSearchParams({
      Season: season,
      SeasonType: 'Regular Season',
      PerMode: 'Totals',
      LeagueID: '00',
      MeasureType: 'Base',
      Month: '0',
      Period: '0',
      LastNGames: '0',
      OpponentTeamID: '0',
      PaceAdjust: 'N',
      PlusMinus: 'N',
      Rank: 'N',
      TeamID: '0',
      TwoWay: '0',
      PORound: '0',
    })
    const url = `${NBA_API_BASE}/leaguedashplayerstats?${params}`
    const data = await fetchWithRetry(url)
    if (!data)
      continue

    const stats = parseSeasonStatsResponse(data)
    for (const { playerId, gp } of stats)
      gpById.set(playerId, (gpById.get(playerId) ?? 0) + gp)
  }

  console.log(`\n  GP data for ${gpById.size} unique players`)

  // Step 2b: Career totals for careers starting before dash stats coverage.
  // Cached by nbaId (as string key) — retired careers never change
  const careerGp: Record<string, number> = existsSync(CAREER_GP_CACHE_PATH)
    ? JSON.parse(readFileSync(CAREER_GP_CACHE_PATH, 'utf-8'))
    : {}
  const saveCache = (): void => {
    mkdirSync(dirname(CAREER_GP_CACHE_PATH), { recursive: true })
    const sorted = Object.fromEntries(Object.entries(careerGp).sort(([a], [b]) => Number(a) - Number(b)))
    writeFileSync(CAREER_GP_CACHE_PATH, `${JSON.stringify(sorted, null, 2)}\n`, 'utf-8')
  }

  const oldCareers = allPlayersList.filter(p => needsCareerTotals(p.fromYear))
  const missing = oldCareers.filter(p => !(String(p.id) in careerGp))
  console.log(`Career totals: ${oldCareers.length} pre-${seasonString(FIRST_DASH_STATS_SEASON_YEAR)} careers, ${missing.length} not cached`)

  for (let i = 0; i < missing.length; i++) {
    process.stdout.write(`  ${i + 1}/${missing.length} (${missing[i].name})\x1B[K\r`)
    const data = await fetchWithRetry(`${NBA_API_BASE}/playercareerstats?PlayerID=${missing[i].id}&PerMode=Totals&LeagueID=00`)
    if (!data)
      continue // not cached: retried on next run
    careerGp[String(missing[i].id)] = parseCareerTotalsResponse(data)
    // Save regularly so an interrupted run can resume
    if ((i + 1) % 100 === 0)
      saveCache()
  }
  if (missing.length > 0) {
    saveCache()
    console.log('')
  }

  // Career totals replace the partial dash stats accumulation (seasons since 1996-97 only)
  for (const p of oldCareers) {
    const gp = careerGp[String(p.id)]
    if (gp !== undefined)
      gpById.set(p.id, gp)
  }

  // Step 3: Build players
  const players = buildPlayers(allPlayersList, gpById)
  players.sort((a, b) => a.entityId.localeCompare(b.entityId))

  // Step 4: Compare with existing file and check for broken references
  if (existsSync(outputPath)) {
    const oldData = JSON.parse(readFileSync(outputPath, 'utf-8')) as { entityId: string, name: string }[]
    const oldIds = new Set(oldData.map(p => p.entityId))
    const newIds = new Set(players.map(p => p.entityId))

    const added = [...newIds].filter(id => !oldIds.has(id))
    const removed = [...oldIds].filter(id => !newIds.has(id))

    if (added.length > 0)
      console.log(`\n  ${added.length} new player(s): ${added.join(', ')}`)
    if (removed.length > 0)
      console.warn(`\n  ${removed.length} removed player(s): ${removed.join(', ')}`)

    // New players sharing an entityId with a coach get merged with that coach on the site
    const coachesPath = resolve('content/entities/coaches.json')
    if (added.length > 0 && existsSync(coachesPath)) {
      const coachIds = new Set((JSON.parse(readFileSync(coachesPath, 'utf-8')) as { entityId: string }[]).map(c => c.entityId))
      const collisions = added.filter(id => coachIds.has(id))
      if (collisions.length > 0) {
        console.warn(`\n  ${collisions.length} new player(s) merged with a coach — check they are the same person: ${collisions.join(', ')}`)
        console.warn('  If not, add the coach to COACH_ID_OVERRIDES in scripts/coaches.ts and re-run convert-coaches.ts')
      }
    }

    // Check if removed entityIds are referenced in any TOP file
    if (removed.length > 0) {
      const topDirs = [resolve('content/tops'), resolve('content/top100')]
      const allTopContent = topDirs.flatMap((dir) => {
        if (!existsSync(dir))
          return []
        return readdirSync(dir)
          .filter(f => f.endsWith('.json'))
          .map(f => ({ file: f, content: readFileSync(resolve(dir, f), 'utf-8') }))
      })

      const broken: string[] = []
      for (const entityId of removed) {
        const refs = allTopContent.filter(t => t.content.includes(`"${entityId}"`))
        if (refs.length > 0)
          broken.push(`  ${entityId} → referenced in ${refs.map(r => r.file).join(', ')}`)
      }

      if (broken.length > 0) {
        console.warn('\n⚠ BROKEN REFERENCES — these removed entityIds are still used in TOP files:')
        for (const line of broken)
          console.warn(line)
        console.warn('Update the TOP files to use the new entityIds before deploying.')
      }
    }
  }

  // Step 5: Write
  writeFileSync(outputPath, `${JSON.stringify(players, null, 2)}\n`, 'utf-8')
  console.log(`\nExported ${players.length} players to ${outputPath}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
