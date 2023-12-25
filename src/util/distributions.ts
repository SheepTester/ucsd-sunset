import { gradeTypes } from './grade-types'
import { Term, parseTerm } from './terms'

export type Distribution = {
  grades: Record<string, number>
  total: number
  /** A unique identifier for the grade distribution. */
  id: string
}

type RawDistributions = {
  [course: string]: {
    [professor: string]: {
      [term: string]: {
        [userId: string]: Distribution
      }
    }
  }
}
export type Distributions = {
  course: string
  professors: {
    first: string
    last: string
    terms: {
      term: Term
      distributions: {
        distribution: Distribution
        count: number
      }[]
    }[]
  }[]
}[]

const courseCodeComparator = new Intl.Collator('en-US', { numeric: true })

export type ParseResult = {
  distributions: Distributions
  contributors: number
}
/**
 * Parses a TSV file into a mapping of courses, professors, terms, and
 * contributors to grade distributions.
 */
export function parseDistributions (tsv: string): ParseResult {
  const distributions: RawDistributions = {}
  const contributors = new Set<string>()
  for (const row of tsv.trim().split(/\r?\n/).slice(1)) {
    const [, userId, term, course, professor, distribution] = row.split('\t')
    contributors.add(userId)
    if (
      distribution.includes(
        'Grade Distribution is not available for classes with 10 students or less.'
      )
    ) {
      continue
    }
    distributions[course] ??= {}
    distributions[course][professor] ??= {}
    distributions[course][professor][term] ??= {}
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
    distributions[course][professor][term][userId] = {
      grades: Object.fromEntries(grades),
      total: grades.reduce((cum, curr) => cum + curr[1], 0),
      id: grades
        .map(([grade, count]) => `${grade}:${count}`)
        .sort()
        .join('\n')
    }
  }
  return {
    distributions: Object.entries(distributions)
      .map(([course, professors]) => {
        return {
          course,
          professors: Object.entries(professors)
            .map(([professor, terms]) => {
              const [last, first] = professor.split(', ')
              return {
                first,
                last,
                terms: Object.entries(terms)
                  .map(([term, users]) => {
                    const frequencies: Record<
                      string,
                      { distribution: Distribution; count: number }
                    > = {}
                    for (const distribution of Object.values(users)) {
                      frequencies[distribution.id] ??= {
                        distribution,
                        count: 0
                      }
                      frequencies[distribution.id].count++
                    }
                    return {
                      term: parseTerm(term),
                      distributions: Object.values(frequencies).sort(
                        (a, b) => b.count - a.count
                      )
                    }
                  })
                  // Sort by most recent term first
                  .sort((a, b) => b.term.value - a.term.value)
              }
            })
            // Sort by instructor that taught most recently first
            .sort((a, b) => b.terms[0].term.value - a.terms[0].term.value)
        }
      })
      // Sort course codes alphabetically (numerically aware comparisons, so
      // SMTH 2 comes before SMTH 10)
      .sort((a, b) => courseCodeComparator.compare(a.course, b.course)),
    contributors: contributors.size
  }
}
