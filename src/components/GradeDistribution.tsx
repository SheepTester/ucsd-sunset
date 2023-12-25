import { Distribution } from '../util/distributions'
import { gradeGroups, gradeTypes } from '../util/grade-types'

type GradeGroupProps = {
  name: string
  gradeTypes: string[]
  distribution: Distribution
}
function GradeGroup ({ name, gradeTypes, distribution }: GradeGroupProps) {
  const grades = gradeTypes
    .filter(grade => distribution.grades[grade])
    .map(grade => ({
      grade,
      count: distribution.grades[grade]
    }))
  if (grades.length === 0) {
    return null
  }
  const groupName = grades.length === 1 ? grades[0].grade : name
  const total = grades.reduce((cum, curr) => cum + curr.count, 0)
  const percentage = (total / distribution.total) * 100
  return (
    <div className='grade-group'>
      <div
        className='group-name'
        style={{ visibility: name ? undefined : 'hidden' }}
      >
        <span className={`group-color-ball grade-color-${groupName}`} />
        <strong>{groupName}</strong>:{' '}
        <span
          title={`${total}/${distribution.total} (${percentage.toFixed(2)}%)`}
        >
          {percentage.toFixed(0)}%
        </span>
      </div>
      {(!name || grades.length > 1) && (
        <div className='group-breakdown'>
          {grades.map(({ grade, count }) => {
            const percentage = (count / distribution.total) * 100
            return (
              <div className='grade-count' key={grade}>
                {grade}:{' '}
                <span
                  title={`${total}/${distribution.total} (${percentage.toFixed(
                    2
                  )}%)`}
                >
                  {percentage.toFixed(0)}%
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export type GradeDistributionProps = {
  contributors: number
  distribution: Distribution
}
export function GradeDistribution ({
  contributors,
  distribution
}: GradeDistributionProps) {
  return (
    <div className='distribution'>
      <div className='grade-breakdown'>
        {gradeGroups.map(({ name, grades }) => (
          <GradeGroup
            key={name ?? 'other'}
            name={name}
            gradeTypes={grades}
            distribution={distribution}
          />
        ))}
      </div>
      <div className='visual-breakdown'>
        {gradeTypes.map(grade => {
          const count = distribution.grades[grade]
          if (!count) {
            return null
          }
          return (
            <div
              key={grade}
              className={`visual-part grade-color-${grade}`}
              title={`${grade}: ${count}/${distribution.total} (${(
                (count / distribution.total) *
                100
              ).toFixed(2)}%)`}
              style={{ flex: `${distribution.grades[grade]} 0 0` }}
            />
          )
        })}
      </div>
      <p className='contribution-count'>
        Reported by {contributors} student
        {contributors === 1 ? '' : 's'}.
      </p>
    </div>
  )
}
