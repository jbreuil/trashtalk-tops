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

import { readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
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

writeFileSync(outputPath, `${JSON.stringify(coaches, null, 2)}\n`, 'utf-8')
console.log(`Exported ${coaches.length} coaches to ${outputPath}`)

rmSync(csvPath)
console.log(`Deleted ${csvPath}`)
