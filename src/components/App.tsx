import { useEffect, useState } from 'react'
import {
  Distribution,
  Distributions,
  distributionId,
  parseDistributions
} from '../util/distributions'

const courseCodeComparator = new Intl.Collator('en-US', { numeric: true })

export type AppProps = {
  sourceUrl: string
  formUrl: string
}
export function App ({ sourceUrl }: AppProps) {
  const [distributions, setDistributions] = useState<Distributions>({})

  useEffect(() => {
    // TEMP: Currently requests once and uses cache indefinitely. In production,
    // it should always request a new version
    caches
      .open('sunset-cache')
      .then(cache =>
        cache
          .match(sourceUrl)
          .then(
            response =>
              response ??
              fetch(sourceUrl).then(
                response => (cache.put(sourceUrl, response.clone()), response)
              )
          )
      )
      .then(r => r.text())
      .then(parseDistributions)
      .then(setDistributions)
  }, [sourceUrl])

  return (
    <>
      <header className='hero'>
        <div className='hero-content'>
          <h1 className='title'>
            <strong className='app-name'>SunSET</strong> for UCSD
          </h1>
          <p className='subtitle'>Furthering the legacy of CAPEs.</p>
          <img
            className='sun-god'
            src='./sunny-g-silhouette.svg'
            alt='A silhouette of Sunny G. looking towards the sunset.'
          />
        </div>
      </header>
      <main>
        {Object.entries(distributions)
          .sort((a, b) => courseCodeComparator.compare(a[0], b[0]))
          .map(([course, professors]) => (
            <article className='course' key={course}>
              <h2 className='course-code'>{course}</h2>
              <div className='professors'>
                {Object.entries(professors)
                  .sort((a, b) => a[0].localeCompare(b[0]))
                  .map(([professor, terms]) => {
                    const [last, first] = professor.split(', ')
                    return (
                      <section className='professor' key={professor}>
                        <h3 className='professor-name'>
                          {first} <strong>{last}</strong>
                        </h3>
                        {Object.entries(terms)
                          .sort((a, b) => a[0].localeCompare(b[0]))
                          .map(([term, users]) => {
                            const frequencies: Record<
                              string,
                              { distribution: Distribution; count: number }
                            > = {}
                            for (const distribution of Object.values(users)) {
                              const id = distributionId(distribution)
                              frequencies[id] ??= { distribution, count: 0 }
                              frequencies[id].count++
                            }
                            return (
                              <>
                                <h4 className='term-name'>{term}</h4>
                                {Object.values(frequencies)
                                  .sort((a, b) => b.count - a.count)
                                  .map(({ distribution, count }) => (
                                    <>
                                      <p className='contribution-count'>
                                        Reported by {count} student
                                        {count === 1 ? '' : 's'}.
                                      </p>
                                      <pre>{JSON.stringify(distribution)}</pre>
                                    </>
                                  ))}
                              </>
                            )
                          })}
                      </section>
                    )
                  })}
              </div>
            </article>
          ))}
      </main>
    </>
  )
}
