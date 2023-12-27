const quarters: Record<string, { value: number; name: string }> = {
  'Winter Qtr': { value: 0, name: 'Winter' },
  'Spring Qtr': { value: 0.25, name: 'Spring' },
  'Sum Ses I': { value: 0.51, name: 'Summer Session I' },
  'Sum Ses II': { value: 0.52, name: 'Summer Session II' },
  SpecSumSes: { value: 0.53, name: 'Special Summer Session' },
  // 'Summer Qtr': { value: 0.5, name: 'Summer Med School' },
  'Fall Qtr': { value: 0.75, name: 'Fall' }
}

export type Term = {
  year: number
  quarter: string
  value: number
}
export function parseTerm (term: string): Term {
  const parts = term.split(' ')
  const year = +(parts.pop() ?? '')
  const quarter = parts.join(' ')
  if (!quarters[quarter]) {
    console.warn('Unknown quarter', quarter)
    return { year, quarter, value: year }
  }
  const { value, name } = quarters[quarter]
  return { year, quarter: name, value: year + value }
}
