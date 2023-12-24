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
      percentage: (distribution.grades[grade] / distribution.total) * 100
    }))
  if (grades.length === 0) {
    return null
  }
  const groupName = grades.length === 1 ? grades[0].grade : name
  return (
    <div className='grade-group'>
      <div
        className='group-name'
        style={{ visibility: name ? undefined : 'hidden' }}
      >
        <span className={`group-color-ball grade-color-${groupName}`} />
        <strong>{groupName}</strong>{' '}
        {grades.reduce((cum, curr) => cum + curr.percentage, 0).toFixed(0)}%
      </div>
      {(!name || grades.length > 1) && (
        <div className='group-breakdown'>
          {grades.map(({ grade, percentage }) => (
            <div className='grade-count'>
              {grade} {percentage.toFixed(0)}%
            </div>
          ))}
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
