export type Distributions = {
  [courseCode: string]: {
    [professor: string]: {
      [term: string]: {
        [userId: string]: {
          grade: string
          count: number
        }[]
      }
    }
  }
}

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
