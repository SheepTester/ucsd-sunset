import { memo } from 'react'
import { Distributions } from '../util/distributions'
import { GradeDistribution } from './GradeDistribution'
import { SearchMatch } from '../util/search'

export type CourseProps = Distributions[number] & {
  visible?: boolean
  match?: SearchMatch | null
  professorMatches?: (SearchMatch | null)[]
}
export const Course = memo(
  ({
    course,
    professors,
    visible = true,
    match,
    professorMatches
  }: CourseProps) => {
    return (
      <article
        className='course'
        style={{ display: visible ? undefined : 'none' }}
      >
        <h2 className='course-code'>
          {match ? (
            <>
              {course.slice(0, match.start)}
              <span className='match'>
                {course.slice(match.start, match.end)}
              </span>
              {course.slice(match.end)}
            </>
          ) : (
            course
          )}
        </h2>
        <div className='professors'>
          {professors.map(({ first, last, terms }, i) => {
            first += ' '
            const match = professorMatches?.[i]
            return (
              <section className='professor' key={`${last}, ${first}`}>
                <h3 className='professor-name'>
                  {!match || match.start > 0
                    ? first.slice(0, match?.start)
                    : null}
                  {match && match.start >= first.length ? (
                    <strong>{last.slice(0, match.start - first.length)}</strong>
                  ) : null}

                  {match ? (
                    <span className='match'>
                      {match.start < first.length
                        ? first.slice(match.start, match.end)
                        : null}
                      {match.end >= first.length ? (
                        <strong>
                          {last.slice(
                            Math.max(0, match.start - first.length),
                            match.end - first.length
                          )}
                        </strong>
                      ) : null}
                    </span>
                  ) : null}

                  {match && match.end < first.length
                    ? first.slice(match.end)
                    : null}
                  {!match || match.end < (first + last).length ? (
                    <strong>
                      {last.slice(
                        Math.max(0, (match?.end ?? 0) - first.length)
                      )}
                    </strong>
                  ) : null}
                </h3>
                {terms.map(({ term, distributions }) => (
                  <div className='term' key={term.value}>
                    <h4 className='term-name'>
                      {term.quarter} {term.year}
                    </h4>
                    {distributions.map(({ distribution, count }) => (
                      <GradeDistribution
                        key={distribution.id}
                        contributors={count}
                        distribution={distribution}
                      />
                    ))}
                  </div>
                ))}
              </section>
            )
          })}
        </div>
      </article>
    )
  }
)
