// Copied from https://github.com/SheepTester/uxdy/blob/main/classrooms/components/search/SearchResults.tsx

export type SearchMatch = {
  start: number
  end: number
}

export type SearchResult = {
  match: SearchMatch | null
  /** 0 iff match is null */
  score: number
  matchesWord: boolean
}

/**
 * Scores:
 * - 3.0 - matches exactly
 * - 2.5 - matches first word
 * - 2.0 - matches start of string
 * - 1.5 - matches word
 * - 1.0 - matches substring
 * - 0.0 - no match
 */
export function score (string: string, query: string): SearchResult {
  if (string === '') {
    return { match: null, score: 0, matchesWord: false }
  }
  string = string.toLowerCase()
  if (string === query) {
    return {
      score: 3,
      match: { start: 0, end: string.length },
      matchesWord: true
    }
  }
  if (string.startsWith(query)) {
    const matchesWord = /\W/.test(string[query.length])
    return {
      score: 2 + (matchesWord ? 0.5 : 0),
      match: { start: 0, end: query.length },
      matchesWord
    }
  }
  const index = string.indexOf(query)
  if (index !== -1) {
    const matchesWord =
      /\W/.test(string[index - 1]) &&
      (index + query.length === string.length ||
        /\W/.test(string[index + query.length]))
    return {
      score: 1 + (matchesWord ? 0.5 : 0),
      match: { start: index, end: index + query.length },
      matchesWord
    }
  }
  return { match: null, score: 0, matchesWord: false }
}
