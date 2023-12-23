export type Distribution = {
  grade: string
  count: number
}[]

/** Returns a unique identifier for the grade distribution. */
export function distributionId (distribution: Distribution): string {
  return distribution
    .map(({ grade, count }) => `${grade}:${count}`)
    .sort()
    .join(', ')
}

export type Distributions = {
  [courseCode: string]: {
    [professor: string]: {
      [term: string]: {
        [userId: string]: Distribution
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
    const [, userId, term, course, professor, distribution] = row.split('\t')
    distributions[course] ??= {}
    distributions[course][professor] ??= {}
    distributions[course][professor][term] ??= {}
    // Assume that the spreadsheet rows are in chronological order, so later
    // rows by the same user are more recent and will overwrite previous ones
    distributions[course][professor][term][userId] = distribution
      .split(', ')
      .map(entry => {
        const [grade, count] = entry.split(':')
        return { grade, count: +count }
      })
  }
  return distributions
}
