import { useEffect, useMemo, useState } from 'react'
import bookmarklet from '../data/inject.raw.js'
import { SOURCE_URL } from '../urls'
import {
  Distributions,
  courseCodeComparator,
  parseDistributions
} from '../util/distributions'
import { CloseIcon } from './CloseIcon'
import { Course } from './Course'
import { JavaScriptUrl } from './JavaScriptUrl'
import { Modal } from './Modal'
import { CourseNumber, splitNumber } from '../util/course-codes.js'

/**
 * Tries loading the response from cache, then calls `callback` when it's
 * loaded. Then, it fetches it and stores it in cache and calls `callback`
 * (possibly again).
 */
async function cacheFirstFetch (
  request: RequestInfo | URL,
  callback: (response: Response) => void
): Promise<void> {
  // idk why Cache API would fail (other than not being on HTTPS), but I don't
  // want it to prevent the entire app from working
  let cache: Cache | undefined
  try {
    cache = await caches.open('sunset-cache')
    const response = await cache.match(request)
    if (response) {
      callback(response)
    }
  } catch {}
  const response = await fetch(request)
  if (response.ok) {
    await cache?.put(request, response.clone())
    callback(response)
  } else {
    throw new Error(`HTTP ${response.status} error, requesting ${request}`)
  }
}

type Filter =
  | { type: 'match'; subject?: string; number?: CourseNumber }
  | { type: 'range'; subject: string; lower: string; upper: string }

const SHOW_BY_DEFAULT = 10

export function App () {
  const [distributions, setDistributions] = useState<Distributions>([
    {
      course: '',
      professors: [{ first: 'Loading...', last: '', averageGpa: 0, terms: [] }]
    }
  ])
  const [contributorCount, setContributorCount] = useState(0)
  const [contributeOpen, setContributeOpen] = useState(
    window.location.hash === '#contribute'
  )
  const [filter, setFilter] = useState('')
  const [sort, setSort] = useState<'alpha' | 'gpa'>('alpha')
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    cacheFirstFetch(SOURCE_URL, r =>
      r
        .text()
        .then(parseDistributions)
        .then(({ distributions, contributors }) => {
          setDistributions(distributions)
          setContributorCount(contributors)
        })
    )
  }, [])

  useEffect(() => {
    if (contributeOpen) {
      window.history.replaceState({}, '', '#contribute')
    } else if (window.location.hash === '#contribute') {
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [contributeOpen])

  const { testFilter, filterDesc } = useMemo(() => {
    const filters = Array.from(
      filter
        .toUpperCase()
        .matchAll(
          /([A-Z]+)\s*(\d+[A-Z]*(?:\s+TO\s+\d+[A-Z]*)?(?:\s*(?:,|\bOR\b)\s*\d+[A-Z]*(?:\s+TO\s+\d+[A-Z]*)?)*)|([A-Z]+)|(\d+[A-Z]*)/g
        ),
      ([, subject, numbers, matchSubject, matchNumber]): Filter[] =>
        numbers
          ? numbers.split(/,|\bOR\b/).map((part): Filter => {
              const [lower, upper] = part.split(/\bTO\b/)
              if (upper) {
                return {
                  type: 'range',
                  subject,
                  lower: lower.trim(),
                  upper: upper.trim()
                }
              } else {
                return {
                  type: 'match',
                  subject,
                  number: splitNumber(part.trim())
                }
              }
            })
          : [
              {
                type: 'match',
                subject: matchSubject,
                number:
                  matchNumber !== undefined
                    ? splitNumber(matchNumber)
                    : undefined
              }
            ]
    ).flat()

    if (filters.length > 0) {
      return {
        testFilter: (course: string) => {
          const [subject, number] = course.split(' ')
          for (const filter of filters) {
            if (filter.subject !== undefined && filter.subject !== subject) {
              continue
            }
            if (filter.type === 'match') {
              const split = splitNumber(number)
              if (
                filter.number === undefined ||
                (filter.number.number === split.number &&
                  (filter.number.suffix === undefined ||
                    filter.number.suffix === split.suffix))
              ) {
                return true
              }
            } else if (
              courseCodeComparator.compare(filter.lower, number) <= 0 &&
              courseCodeComparator.compare(number, filter.upper) <= 0
            ) {
              return true
            }
          }
          return false
        },
        filterDesc: filters
          .map(filter =>
            filter.type === 'range'
              ? `${filter.subject} ${filter.lower} to ${filter.upper}`
              : filter.subject !== undefined
              ? `${filter.subject} ${filter.number?.number ?? 'courses'}${
                  filter.number?.suffix ?? ''
                }`
              : `courses numbered ${filter.number?.number ?? ''}${
                  filter.number?.suffix ?? ''
                }`
          )
          .join(' or ')
      }
    } else {
      return {
        testFilter: () => true,
        filterDesc: ''
      }
    }
  }, [filter])

  const sorted = useMemo(
    () =>
      sort === 'gpa'
        ? distributions
            .flatMap(({ course, professors }) =>
              professors.map(prof => ({ course, professors: [prof] }))
            )
            .sort(
              (a, b) => b.professors[0].averageGpa - a.professors[0].averageGpa
            )
        : distributions,

    [distributions, sort]
  )
  const filtered = useMemo(
    () => sorted.filter(({ course }) => testFilter(course)),
    [sorted, testFilter]
  )

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
          <a
            href='#contribute'
            className='button contribute-btn'
            onClick={e => {
              e.preventDefault()
              setContributeOpen(true)
            }}
          >
            Contribute
          </a>
          <img
            className='sun-god'
            src='./images/sunny-g-silhouette.svg'
            alt='A silhouette of Sunny G. looking towards the sunset.'
          />
        </div>
      </header>
      <main>
        <h1 className='heading'>About</h1>
        <p className='about'>
          When UCSD replaced{' '}
          <a href='https://cape.ucsd.edu/' className='link'>
            CAPEs
          </a>{' '}
          with{' '}
          <a
            href='https://academicaffairs.ucsd.edu/Modules/Evals/SET/Reports/Search.aspx'
            className='link'
          >
            SETs
          </a>{' '}
          for professor evaluations, they stopped publishing the distribution of
          grades students received. SunSET is a student-run project to
          crowdsource data from previous students to keep this resource
          available for future generations.
        </p>
        <div className='faq'>
          <div className='faq-entry'>
            <h2 className='question'>
              Why are there multiple grade distributions for each quarter?
            </h2>
            <p>
              Each entry represents a grade distribution submitted by a student.
              Different grade distributions could be due to students being in
              different sections, grade changes, or fake data.
            </p>
          </div>
          <div className='faq-entry'>
            <h2 className='question'>Why aren't all classes on here?</h2>
            <p>
              This is a crowdsourcing effort, so if no one shares data for a
              class, the class won't be listed here. You can help by{' '}
              <a
                href='#contribute'
                className='link'
                onClick={e => {
                  e.preventDefault()
                  setContributeOpen(true)
                }}
              >
                contributing data for your classes
              </a>{' '}
              and sharing this with your friends.
            </p>
            <p>
              This would not have been possible without the contributions of{' '}
              <strong>
                {contributorCount} student
                {contributorCount === 1 ? '' : 's'}
              </strong>
              &mdash;and counting.
            </p>
          </div>
          <div className='faq-entry'>
            <h2 className='question'>
              How can I use the crowd&shy;sourced data in my own project?
            </h2>
            <p>
              The raw crowdsourced data are available as a{' '}
              <a
                className='link'
                href='https://docs.google.com/spreadsheets/d/e/2PACX-1vQ6KhjyiPM-rof6fqjBcmp7ygy4Dqr1LQ8uJiAOtR2IoihzQEumx-SHX_KKxLpmYGZksN6QsPPk0DNb/pubhtml'
              >
                spreadsheet
              </a>
              . You can find more information about available formats, the
              project setup, and caveats on the{' '}
              <a
                className='link'
                href='https://github.com/SheepTester/ucsd-sunset'
              >
                GitHub repository
              </a>
              .
            </p>
          </div>
        </div>
        <h1 className='heading'>Grades received</h1>
        <div className='filters'>
          <label className='filter-wrapper filter-courses'>
            <p className='label'>Filter courses</p>
            <input
              type='search'
              className='filter'
              placeholder='Example: CSE 30, 100 to 190, ECE 101, 111'
              value={filter}
              onChange={e => {
                setFilter(e.currentTarget.value)
                setShowAll(false)
              }}
            />
          </label>
          <label className='filter-wrapper'>
            <p className='label'>Sort by</p>
            <select
              className='filter'
              defaultValue={sort}
              onChange={e => {
                if (
                  e.currentTarget.value === 'alpha' ||
                  e.currentTarget.value === 'gpa'
                ) {
                  setSort(e.currentTarget.value)
                  setShowAll(false)
                }
              }}
            >
              <option value='alpha'>Alphabetical</option>
              <option value='gpa'>Average GPA</option>
            </select>
          </label>
        </div>
        {filtered
          .slice(0, showAll ? undefined : SHOW_BY_DEFAULT)
          .map(({ course, professors }) => {
            return (
              <Course
                course={course}
                professors={professors}
                key={`${course}\n${professors[0].last},${professors[0].first}`}
              />
            )
          })}
        {filtered.length === 0 && (
          <p className='no-results'>No results for {filterDesc}.</p>
        )}
        {filtered.length > SHOW_BY_DEFAULT && !showAll && (
          <button
            type='button'
            className='button show-all-btn'
            onClick={() => setShowAll(true)}
          >
            Show all {filtered.length}
          </button>
        )}
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
                href={`javascript:${encodeURIComponent(bookmarklet.trim())}`}
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
              <p>
                Click on the bookmark and follow the directions that appear.
              </p>
            </div>
            <img
              className='instruction-image'
              src='./images/click-bookmark.png'
              alt='The bookmark on the bookmarks bar being clicked while on Academic History.'
            />
          </li>
          <li>
            <div className='instruction-content'>
              <p>Share this with your friends so more people can contribute!</p>
            </div>
          </li>
        </ol>
      </Modal>
    </>
  )
}
