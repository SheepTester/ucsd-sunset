// node scripts/cleanup.ts

import * as fs from 'fs'
import crypto from 'crypto'
import { SOURCE_URL } from '../src/urls.ts'

let rehash: (userId: string) => string
if (process.env.REHASH_SALT) {
  const salt = new Uint8Array(JSON.parse(process.env.REHASH_SALT))
  const cache: Record<string, string> = {}
  rehash = userId => {
    if (cache[userId] === undefined) {
      const hmac = crypto.createHmac('sha256', salt)
      hmac.update(Buffer.from(userId, 'hex'))
      cache[userId] = hmac.digest('hex')
    }
    return cache[userId]
  }
} else {
  rehash = userId => userId
}

const cleanedRows: Record<
  `${string}\t${string}\t${string}\t${string}`,
  { timestamp: string; distribution: string }
> = {}
const tsv = await fetch(SOURCE_URL).then(r => r.text())
const [header, ...rows] = tsv.trim().split(/\r?\n/)
for (const row of rows) {
  const [timestamp, userId, term, course, professor, distribution] =
    row.split('\t')
  const key = `${rehash(userId)}\t${term}\t${course}\t${professor}` as const
  if (cleanedRows[key]) {
    if (cleanedRows[key].distribution === distribution) {
      continue
    }
    // Delete old row
    delete cleanedRows[key]
  }
  cleanedRows[key] = { timestamp, distribution }
}

const file = fs.createWriteStream('scripts/cleanup.tsv')
file.write(`${header}\n`)
for (const [key, { timestamp, distribution }] of Object.entries(cleanedRows)) {
  file.write(`${timestamp}\t${key}\t${distribution}\n`)
}
file.end()

console.error(
  'Original:',
  rows.length,
  'rows. Cleaned:',
  Object.entries(cleanedRows).length,
  'rows.'
)
