import { gradeTypes } from './grade-types'
import { Term, parseTerm } from './terms'

export type Distribution = {
  grades: Record<string, number>
  total: number
  /** A unique identifier for the grade distribution. */
  id: string
}

export type Distributions = {
  [courseCode: string]: {
    [professor: string]: {
      [termValue: number]: {
        term: Term
        users: {
          [userId: string]: Distribution
        }
      }
    }
  }
}

/**
 * Parses a TSV file into a mapping of courses, professors, terms, and
 * contributors to grade distributions.
 */
export function parseDistributions (tsv: string): Distributions {
  const distributions: Distributions = {}
  for (const row of tsv.trim().split(/\r?\n/).slice(1)) {
    const [, userId, termStr, course, professor, distribution] = row.split('\t')
    if (
      distribution.includes(
        'Grade Distribution is not available for classes with 10 students or less.'
      )
    ) {
      continue
    }
    distributions[course] ??= {}
    distributions[course][professor] ??= {}
    const term = parseTerm(termStr)
    distributions[course][professor][term.value] ??= { term, users: {} }
    // Assume that the spreadsheet rows are in chronological order, so later
    // rows by the same user are more recent and will overwrite previous ones
    const grades = distribution
      .split(', ')
      .map(entry => {
        const [grade, count] = entry.split(':')
        return [grade, +count] as const
      })
      .filter(([grade]) => {
        if (grade === 'Total Students' || grade === 'Class GPA') {
          return false
        }
        if (!gradeTypes.includes(grade)) {
          console.warn('Unknown grade', grade)
          return false
        }
        return true
      })
    distributions[course][professor][term.value].users[userId] = {
      grades: Object.fromEntries(grades),
      total: grades.reduce((cum, curr) => cum + curr[1], 0),
      id: grades
        .map(([grade, count]) => `${grade}:${count}`)
        .sort()
        .join('\n')
    }
  }
  return distributions
}
