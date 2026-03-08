import { describe, expect, it } from 'vitest'
import { parseCsv, slugify } from '../scripts/coaches'

describe('slugify', () => {
  it('converts a simple name', () => {
    expect(slugify('Gregg Popovich')).toBe('gregg-popovich')
  })

  it('strips accents', () => {
    expect(slugify('José García')).toBe('jose-garcia')
  })

  it('handles apostrophes and special characters', () => {
    expect(slugify('D\'Antoni')).toBe('d-antoni')
  })

  it('collapses consecutive hyphens', () => {
    expect(slugify('Tim   O\'Brien')).toBe('tim-o-brien')
  })

  it('strips leading and trailing hyphens', () => {
    expect(slugify(' -Phil Jackson- ')).toBe('phil-jackson')
  })
})

describe('parseCsv', () => {
  // Realistic BB-Ref CSV header structure
  const HEADER = [
    ',,,,,Regular Season,,,,,Playoffs,,,,,',
    'Rk,Coach,From,To,Yrs,G,W,L,W/L%,W > .500,G,W,L,W/L%,Conf,Champ',
  ].join('\n')

  it('parses a standard data row', () => {
    const csv = `${HEADER}\n1,Gregg Popovich,1997,2024,27,2214,1390,824,.628,283.0,284,170,114,.599,6,5`
    const result = parseCsv(csv)

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      entityId: 'gregg-popovich',
      name: 'Gregg Popovich',
      type: 'coach',
      gamesCoached: 2214,
      wins: 1390,
      losses: 824,
    })
  })

  it('strips Hall of Fame asterisk from names', () => {
    const csv = `${HEADER}\n1,Phil Jackson*,1992,2011,20,1640,1155,485,.704,335.0,333,229,104,.688,6,6`
    const result = parseCsv(csv)

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Phil Jackson')
    expect(result[0].entityId).toBe('phil-jackson')
  })

  it('parses multiple rows', () => {
    const csv = [
      HEADER,
      '1,David Adelman,2025,2026,2,65,41,24,.631,8.5,14,7,7,.500,0,0',
      '2,Rick Adelman*,1989,2014,23,1791,1042,749,.582,146.5,157,79,78,.503,2,0',
      '3,Richie Adubato,1980,1997,6,367,127,240,.346,-56.5,8,2,6,.250,0,0',
    ].join('\n')
    const result = parseCsv(csv)

    expect(result).toHaveLength(3)
    expect(result[0].name).toBe('David Adelman')
    expect(result[1].name).toBe('Rick Adelman')
    expect(result[2].name).toBe('Richie Adubato')
  })

  it('skips blank lines', () => {
    const csv = `${HEADER}\n\n\n1,Steve Kerr,2014,2025,11,870,542,328,.623,107.0,120,79,41,.658,4,4\n\n`
    const result = parseCsv(csv)

    expect(result).toHaveLength(1)
  })

  it('skips repeated header rows mid-table', () => {
    const csv = [
      HEADER,
      '1,Steve Kerr,2014,2025,11,870,542,328,.623,107.0,120,79,41,.658,4,4',
      'Rk,Coach,From,To,Yrs,G,W,L,W/L%,W > .500,G,W,L,W/L%,Conf,Champ',
      '2,Erik Spoelstra,2008,2025,17,1394,862,532,.618,165.0,152,94,58,.618,4,2',
    ].join('\n')
    const result = parseCsv(csv)

    expect(result).toHaveLength(2)
    expect(result[0].name).toBe('Steve Kerr')
    expect(result[1].name).toBe('Erik Spoelstra')
  })

  it('skips rows with non-numeric stats', () => {
    const csv = `${HEADER}\n1,Bad Coach,2020,2024,4,abc,def,ghi,.500,0,0,0,0,.000,0,0`
    const result = parseCsv(csv)

    expect(result).toHaveLength(0)
  })

  it('skips data rows before the header is found', () => {
    const csv = [
      '1,Ghost Coach,2020,2024,4,100,60,40,.600,10.0,0,0,0,.000,0,0',
      HEADER,
      '1,Real Coach,2020,2024,4,200,120,80,.600,20.0,10,5,5,.500,0,0',
    ].join('\n')
    const result = parseCsv(csv)

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Real Coach')
  })

  it('skips rows with too few columns', () => {
    const csv = `${HEADER}\n1,Short Row,2020`
    const result = parseCsv(csv)

    expect(result).toHaveLength(0)
  })

  it('skips BB-Ref citation header', () => {
    const csv = [
      '--- When using SR data, please cite us and provide a link and/or a mention.',
      '',
      '',
      HEADER,
      '1,Steve Kerr,2014,2025,11,870,542,328,.623,107.0,120,79,41,.658,4,4',
    ].join('\n')
    const result = parseCsv(csv)

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Steve Kerr')
  })

  it('skips BB-Ref HTML footer', () => {
    const csv = [
      HEADER,
      '1,Steve Kerr,2014,2025,11,870,542,328,.623,107.0,120,79,41,.658,4,4',
      '',
      '',
      'Provided by <a href="https://www.sports-reference.com/">Basketball-Reference.com</a>',
    ].join('\n')
    const result = parseCsv(csv)

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Steve Kerr')
  })

  it('returns empty array for empty input', () => {
    expect(parseCsv('')).toEqual([])
  })
})
