/**
 * Convert a Basketball Reference coaches CSV export to coaches.json.
 *
 * Usage:
 *   npx tsx scripts/convert-coaches.ts
 *
 * Drop the CSV exported from https://www.basketball-reference.com/coaches/NBA_stats.html
 * ("Share & Export > Get table as CSV") into scripts/input/coaches/.
 * The script picks up the first .csv file found, converts it, and deletes it.
 */

import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { parseCsv } from './coaches'

const inputDir = resolve('scripts/input/coaches')
const outputPath = resolve('content/entities/coaches.json')

const files = readdirSync(inputDir).filter(f => f.endsWith('.csv'))

if (files.length === 0) {
  console.error('No CSV file found in scripts/input/coaches/')
  console.error('Download the CSV from https://www.basketball-reference.com/coaches/NBA_stats.html')
  process.exit(1)
}

const csvPath = resolve(inputDir, files[0])
console.log(`Reading ${csvPath}`)

const content = readFileSync(csvPath, 'utf-8')
const coaches = parseCsv(content)

coaches.sort((a, b) => a.entityId.localeCompare(b.entityId))

// New coaches sharing an entityId with a player get merged with that player on
// the site: check they are the same person, otherwise add a COACH_ID_OVERRIDES entry
const playersPath = resolve('content/entities/players.json')
if (existsSync(outputPath) && existsSync(playersPath)) {
  const oldIds = new Set((JSON.parse(readFileSync(outputPath, 'utf-8')) as { entityId: string }[]).map(c => c.entityId))
  const playerIds = new Set((JSON.parse(readFileSync(playersPath, 'utf-8')) as { entityId: string }[]).map(p => p.entityId))
  const newCollisions = coaches.filter(c => !oldIds.has(c.entityId) && playerIds.has(c.entityId))
  if (newCollisions.length > 0) {
    console.warn(`\n  ${newCollisions.length} new coach(es) merged with a player — check they are the same person:`)
    for (const c of newCollisions)
      console.warn(`    ${c.entityId} (${c.name})`)
    console.warn('  If not, add them to COACH_ID_OVERRIDES in scripts/coaches.ts\n')
  }
}

writeFileSync(outputPath, `${JSON.stringify(coaches, null, 2)}\n`, 'utf-8')
console.log(`Exported ${coaches.length} coaches to ${outputPath}`)

rmSync(csvPath)
console.log(`Deleted ${csvPath}`)
