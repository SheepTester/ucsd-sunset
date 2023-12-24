import { Fragment, useEffect, useState } from 'react'
import {
  Distribution,
  Distributions,
  distributionId,
  parseDistributions
} from '../util/distributions'
import { Modal } from './Modal'
import bookmarklet from '../data/bookmarklet.raw.js'
import bookmarkletDialog from '../data/bookmarklet-dialog-injection.html'
import { JavaScriptUrl } from './JavaScriptUrl'
import { CloseIcon } from './CloseIcon'

const courseCodeComparator = new Intl.Collator('en-US', { numeric: true })

export type AppProps = {
  sourceUrl: string
  formUrl: string
}
export function App ({ sourceUrl }: AppProps) {
  const [distributions, setDistributions] = useState<Distributions>({
    '': { ', Loading...': {} }
  })
  const [contributeOpen, setContributeOpen] = useState(
    window.location.hash === '#contribute'
  )

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

  useEffect(() => {
    if (contributeOpen) {
      window.history.replaceState({}, '', '#contribute')
    } else {
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [contributeOpen])

  return (
    <>
      <header className='hero'>
        <div className='hero-content'>
          <h1 className='title'>
            <strong className='app-name'>SunSET</strong> for UCSD
          </h1>
          <p className='subtitle'>
            A community effort to further the legacy of CAPEs.
          </p>
          <button
            type='button'
            className='button contribute-btn'
            onClick={() => setContributeOpen(true)}
          >
            Contribute
          </button>
          <img
            className='sun-god'
            src='./images/sunny-g-silhouette.svg'
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
                              <Fragment key={term}>
                                <h4 className='term-name'>{term}</h4>
                                {Object.entries(frequencies)
                                  .sort((a, b) => b[1].count - a[1].count)
                                  .map(([id, { distribution, count }]) => (
                                    <Fragment key={id}>
                                      <p className='contribution-count'>
                                        Reported by {count} student
                                        {count === 1 ? '' : 's'}.
                                      </p>
                                      <pre>{JSON.stringify(distribution)}</pre>
                                    </Fragment>
                                  ))}
                              </Fragment>
                            )
                          })}
                      </section>
                    )
                  })}
              </div>
            </article>
          ))}
      </main>
      <Modal open={contributeOpen} onClose={() => setContributeOpen(false)}>
        <h1 className='contribute-title' id='contribute'>
          How to contribute
          <button type='submit' aria-label='Close' className='close-btn'>
            <CloseIcon />
          </button>
        </h1>
        <ol className='instructions'>
          <li>
            <div className='instruction-content'>
              <p>Drag the following link into your bookmarks bar.</p>
              <JavaScriptUrl
                className='bookmarklet'
                href={`javascript:${encodeURIComponent(
                  `{${bookmarklet};main(${JSON.stringify(bookmarkletDialog)})}`
                )}`}
                onClick={e => e.preventDefault()}
              >
                Share grade distributions
              </JavaScriptUrl>
              <p>
                This is best done on desktop. Doing this on mobile is harder.
              </p>
            </div>
            <img
              className='instruction-image'
              src='./images/add-to-bookmarks-bar.png'
              alt='The link being dragged to the bookmarks bar.'
            />
          </li>
          <li>
            <div className='instruction-content'>
              <p>
                Go to your{' '}
                <a
                  className='link'
                  href='https://act.ucsd.edu/studentAcademicHistory/academichistorystudentdisplay.htm'
                >
                  Academic History
                </a>
                .
              </p>
            </div>
            <a
              className='button'
              href='https://act.ucsd.edu/studentAcademicHistory/academichistorystudentdisplay.htm'
            >
              Go to Academic History
            </a>
          </li>
          <li>
            <div className='instruction-content'>
              <p>Click on the bookmark.</p>
            </div>
            <img
              className='instruction-image'
              src='./images/click-bookmark.png'
              alt='The bookmark on the bookmarks bar being clicked while on Academic History.'
            />
          </li>
        </ol>
      </Modal>
    </>
  )
}
