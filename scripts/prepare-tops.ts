/**
 * prepare-tops.ts — Transform raw YouTube CSV data into structured TOP JSON skeletons.
 *
 * Usage: npx tsx scripts/prepare-tops.ts <input-csv> <output-dir>
 *
 * This script:
 * 1. Reads a CSV of video metadata from the youtube/ project output.
 * 2. Parses video titles to extract: format (Top 5/10/etc.), temporal type, potential season.
 * 3. Generates JSON skeleton files in content/tops/ with metadata pre-filled
 *    and empty rankingAlex / rankingBastien arrays.
 * 4. Tags and rankings are then filled in manually.
 *
 * CSV expected columns: videoId, title, publishedAt, description
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'

interface CsvRow {
  videoId: string
  title: string
  publishedAt: string
  description: string
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036F]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parseFormat(title: string): number {
  const match = title.match(/top\s*(\d+)/i)
  return match ? Number.parseInt(match[1], 10) : 10
}

function parseTemporalType(title: string): 'all-time' | 'dated' {
  if (/all[- ]?time/i.test(title))
    return 'all-time'
  return 'dated'
}

function parseSeason(title: string): string | null {
  const match = title.match(/(\d{4})[- ](\d{2,4})/)
  if (match)
    return `${match[1]}-${match[2].length === 2 ? match[2] : match[2].slice(2)}`
  return null
}

function parseSubject(title: string): string {
  // Remove "Top N des " prefix
  return title
    .replace(/^top\s*\d+\s*(des?\s*)?/i, '')
    .replace(/\s*(all[- ]?time|de la saison|\d{4}[- ]\d{2}).*/i, '')
    .trim()
    .toLowerCase()
}

function parseCsv(content: string): CsvRow[] {
  const lines = content.trim().split('\n')
  const header = lines[0].split(',')
  return lines.slice(1).map((line) => {
    const values = line.split(',')
    const row: Record<string, string> = {}
    header.forEach((key, i) => {
      row[key.trim()] = (values[i] ?? '').trim()
    })
    return row as unknown as CsvRow
  })
}

function main() {
  const [inputCsv, outputDir] = process.argv.slice(2)

  if (!inputCsv || !outputDir) {
    console.error('Usage: npx tsx scripts/prepare-tops.ts <input-csv> <output-dir>')
    process.exit(1)
  }

  const csv = readFileSync(inputCsv, 'utf-8')
  const rows = parseCsv(csv)

  console.log(`Parsed ${rows.length} rows from CSV`)

  for (const row of rows) {
    const format = parseFormat(row.title)
    const temporalType = parseTemporalType(row.title)
    const season = parseSeason(row.title)
    const subject = parseSubject(row.title)
    const slug = slugify(subject || row.title)

    const skeleton = {
      slug,
      title: row.title,
      subject,
      format,
      temporalType,
      season,
      version: 1,
      publishedAt: row.publishedAt.split('T')[0],
      videoId: row.videoId,
      tags: [],
      rankingAlex: [],
      rankingBastien: [],
    }

    const filename = `${slug}-v1.json`
    const filepath = join(outputDir, filename)
    writeFileSync(filepath, `${JSON.stringify(skeleton, null, 2)}\n`)
    console.log(`  Created: ${filename}`)
  }

  console.log('Done.')
}

main()
