import { gpas, gradeTypes } from './grade-types'
import { Term, parseTerm } from './terms'

export type Distribution = {
  grades: Record<string, number>
  total: number
  /** A unique identifier for the grade distribution. */
  id: string
  averageGpa: number
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
    averageGpa: number
    terms: {
      term: Term
      distributions: {
        distribution: Distribution
        count: number
      }[]
    }[]
  }[]
}[]

export const courseCodeComparator = new Intl.Collator('en-US', {
  numeric: true
})

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
    const entries = distribution.split(', ').map(entry => {
      const [grade, count] = entry.split(':')
      return [grade, +count] as const
    })
    const grades = entries.filter(([grade]) => {
      if (grade === 'Total Students' || grade === 'Class GPA') {
        return false
      }
      if (!gradeTypes.includes(grade)) {
        console.warn('Unknown grade', grade)
        return false
      }
      return true
    })
    const sumGpa = grades.reduce(
      (cum, [grade, count]) => cum + (gpas[grade] ?? 0) * count,
      0
    )
    const hasGpa = grades.reduce(
      (cum, [grade, count]) => cum + (grade in gpas ? count : 0),
      0
    )
    const averageGpa = sumGpa / hasGpa || 0
    const actualAvgGpa = entries.find(([grade]) => grade === 'Class GPA')
    // Sanity check. For some reason, Academic History seems to round to 3
    // places then 2 places, rather than directly to 2 places, so 3.01481 rounds
    // to 3.02 rather than 3.01. (Also, 3.135.toFixed(2) is 3.13 not 3.14.)
    if (
      actualAvgGpa &&
      actualAvgGpa[1] !== Math.round(Math.round(averageGpa * 1000) / 10) / 100
    ) {
      console.warn(
        'Calculated average GPA was wrong. Expected:',
        actualAvgGpa[1],
        'Actual:',
        averageGpa
      )
    }
    // Assumes that the spreadsheet rows are in chronological order, so later
    // rows by the same user are more recent and will overwrite previous ones
    distributions[course] ??= {}
    distributions[course][professor] ??= {}
    distributions[course][professor][term] ??= {}
    distributions[course][professor][term][userId] = {
      grades: Object.fromEntries(grades),
      total: grades.reduce((cum, curr) => cum + curr[1], 0),
      id: grades
        .map(([grade, count]) => `${grade}:${count}`)
        .sort()
        .join('\n'),
      averageGpa
    }
  }
  return {
    distributions: Object.entries(distributions)
      .map(([course, professors]) => {
        return {
          course,
          professors: Object.entries(professors)
            .map(([professor, termsObj]) => {
              const [last, first] = professor.split(', ')
              const terms = Object.entries(termsObj)
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
              // Average GPA by contributor
              const sumGpa = terms.reduce(
                (cum, curr) =>
                  curr.distributions.reduce(
                    (cum, curr) =>
                      cum + curr.count * curr.distribution.averageGpa,
                    cum
                  ),
                0
              )
              const countGpa = terms.reduce(
                (cum, curr) =>
                  curr.distributions.reduce(
                    (cum, curr) => cum + curr.count,
                    cum
                  ),
                0
              )
              return {
                first,
                last,
                averageGpa: sumGpa / countGpa || 0,
                terms
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
