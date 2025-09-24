import { CourseNumber, splitNumber } from './course-codes'
import { courseCodeComparator } from './distributions'

export type Filter =
  | { type: 'match'; subject?: string; number?: CourseNumber }
  | { type: 'range'; subject: string; lower: string; upper: string }

export function parseFilter (filter: string): Filter[] {
  return Array.from(
    filter
      .toUpperCase()
      .matchAll(
        /([A-Z]+)\s*(\d+[A-Z]*(?:\s+TO\s+\d+[A-Z]*)?(?:\s*(?:,|\bOR\b)\s*\d+[A-Z]*(?:\s+TO\s+\d+[A-Z]*)?)*)|([A-Z]+)|(\d+[A-Z]*)/g
      ),
    ([, subject, numbers, matchSubject, matchNumber]): Filter[] =>
      numbers
        ? numbers.split(/,|\bOR\b/).map((part): Filter => {
          const [lower, upper] = part.split(/\bTO\b/)
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

export function displayFilter (filter: Filter): string {
  return filter.type === 'range'
    ? `${filter.subject} ${filter.lower} to ${filter.upper}`
    : filter.subject !== undefined
      ? `${filter.subject} ${filter.number?.number ?? 'courses'}${
        filter.number?.suffix ?? ''
      }`
      : `courses numbered ${filter.number?.number ?? ''}${
        filter.number?.suffix ?? ''
      }`
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
    if (filter.subject !== undefined && filter.subject !== subject) {
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
