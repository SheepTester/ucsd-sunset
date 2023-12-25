export const gradeTypes = [
  'A+',
  'A',
  'A-',
  'B+',
  'B',
  'B-',
  'C+',
  'C',
  'C-',
  'D',
  'F',
  'P',
  'NP',
  'S',
  'U',
  'I',
  'W',
  'Blank'
]
export const gradeGroups = [
  { name: 'A', grades: ['A+', 'A', 'A-'] },
  { name: 'B', grades: ['B+', 'B', 'B-'] },
  { name: 'C', grades: ['C+', 'C', 'C-'] },
  { name: 'D', grades: ['D'] },
  { name: 'F', grades: ['F'] },
  { name: 'Other', grades: ['P', 'NP', 'S', 'U', 'I', 'W', 'Blank'] }
]
export const gpas: Record<string, number> = {
  'A+': 4,
  A: 4,
  'A-': 3.7,
  'B+': 3.3,
  B: 3,
  'B-': 2.7,
  'C+': 2.3,
  C: 2,
  'C-': 1.7,
  D: 1,
  F: 0
}
