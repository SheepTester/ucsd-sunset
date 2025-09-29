import { CourseNumber, splitNumber } from './course-codes'
import { courseCodeComparator } from './distributions'

export type Filter =
  | { type: 'match'; subject: string; number?: CourseNumber }
  | { type: 'range'; subject: string; lower: string; upper: string }

export function parseFilter (filter: string): Filter[] {
  return Array.from(
    filter
      .toUpperCase()
      .matchAll(
        /([A-Z]+)\s*(\d+[A-Z]*(?:\s+(?:TO|-)\s+\d+[A-Z]*)?(?:\s*(?:[,/]|\bOR\b)\s*\d+[A-Z]*(?:\s+(?:TO|-)\s+\d+[A-Z]*)?)*)|([A-Z]+)/g
      ),
    ([, subject, numbers, matchSubject, matchNumber]): Filter[] =>
      numbers
        ? numbers.split(/[,/]|\bOR\b/).map((part): Filter => {
          const [lower, upper] = part.split(/\b(?:TO|-)\b/)
          if (upper) {
            return {
              type: 'range',
              subject,
              lower: lower.trim(),
              upper: upper.trim()
            }
          } else {
            return {
              type: 'match',
              subject,
              number: splitNumber(part.trim())
            }
          }
        })
        : [
          {
            type: 'match',
            subject: matchSubject,
            number:
              matchNumber !== undefined ? splitNumber(matchNumber) : undefined
          }
        ]
  ).flat()
}

const collator = new Intl.Collator('en-US', { numeric: true })

export function displayFilters (filters: Filter[]): string {
  return Array.from(Map.groupBy(filters, filter => filter.subject))
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([subject, filters]) => {
      if (
        filters.some(
          filter => filter.type === 'match' && filter.number === undefined
        )
      ) {
        return `any ${subject} course`
      }
      return `${subject} ${filters
        .sort((a, b) =>
          collator.compare(
            a.type === 'range'
              ? a.lower
              : `${a.number?.number}${a.number?.suffix ?? ''}`,
            b.type === 'range'
              ? b.lower
              : `${b.number?.number}${b.number?.suffix ?? ''}`
          )
        )
        .map(filter =>
          filter.type === 'range'
            ? `${filter.lower}–${filter.upper}`
            : `${filter.number?.number}${filter.number?.suffix ?? ''}`
        )
        .join(', ')}`
    })
    .join('; or ')
}

export type FilterMatch = {
  number: boolean
  suffix: boolean
}

export function matchFilter (
  filters: Filter[],
  courseCode: string
): FilterMatch | null {
  const [subject, number] = courseCode.split(' ')
  for (const filter of filters) {
    if (filter.subject !== subject) {
      continue
    }
    if (filter.type === 'match') {
      const split = splitNumber(number)
      if (
        filter.number === undefined ||
        (filter.number.number === split.number &&
          (filter.number.suffix === undefined ||
            filter.number.suffix === split.suffix))
      ) {
        return {
          number: filter.number !== undefined,
          suffix: filter.number?.suffix !== undefined
        }
      }
    } else if (
      courseCodeComparator.compare(filter.lower, number) <= 0 &&
      courseCodeComparator.compare(number, filter.upper) <= 0
    ) {
      return { number: true, suffix: true }
    }
  }
  return null
}
