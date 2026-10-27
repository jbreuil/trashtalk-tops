import { describe, expect, it } from 'vitest'
import { disambiguateEntityIds } from '../scripts/utils'

describe('disambiguateEntityIds', () => {
  it('leaves unique entityIds untouched', () => {
    const input = [{ entityId: 'lebron-james' }, { entityId: 'stephen-curry' }]

    // toEqual compares values deeply (not object identity)
    expect(disambiguateEntityIds(input)).toEqual(input)
  })

  it('suffixes homonyms with -2, -3 in input order', () => {
    const input = [
      { entityId: 'glen-rice', nbaId: 779 },
      { entityId: 'glen-rice', nbaId: 203318 },
      { entityId: 'glen-rice', nbaId: 999999 },
    ]

    // map() extracts only the ids so the assertion stays readable
    expect(disambiguateEntityIds(input).map(e => e.entityId))
      .toEqual(['glen-rice', 'glen-rice-2', 'glen-rice-3'])
  })

  it('does not mutate the input array', () => {
    const input = [{ entityId: 'dee-brown' }, { entityId: 'dee-brown' }]
    disambiguateEntityIds(input)

    // The original objects must keep their bare slug
    expect(input[1].entityId).toBe('dee-brown')
  })
})
