export type CourseNumber = {
  number: number
  suffix?: string
}
export function splitNumber (courseNumber: string): CourseNumber {
  const match = courseNumber.match(/^(\d+)([A-Z]*)$/)
  if (!match) {
    throw new SyntaxError(`'${courseNumber}' is not a course number.`)
  }
  return {
    number: +match[1],
    suffix: match[2] || undefined
  }
}
