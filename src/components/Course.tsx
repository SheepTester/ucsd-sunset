import { memo } from 'react'
import { Distributions } from '../util/distributions'
import { GradeDistribution } from './GradeDistribution'

export type CourseProps = Distributions[number]
export const Course = memo(({ course, professors }: CourseProps) => {
  return (
    <article className='course'>
      <h2 className='course-code'>{course}</h2>
      <div className='professors'>
        {professors.map(({ first, last, terms }) => (
          <section className='professor' key={`${last}, ${first}`}>
            <h3 className='professor-name'>
              {first} <strong>{last}</strong>
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
        ))}
      </div>
    </article>
  )
})
