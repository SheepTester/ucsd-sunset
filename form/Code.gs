// Based on https://github.com/SheepTester/hello-world/blob/master/discord-anonymous-submission.gs

const SPREADSHEET_URL =
  'https://docs.google.com/spreadsheets/d/1h76iDaFSS1NjLQQuo7WLWwoGX97BYE-wUnUkbsjxlzw/'
/** 32-byte salt (replace with random bytes) */
const SALT = [
  6, 20, 25, 29, 36, 41, 44, 53, 54, 56, 58, 58, 63, 76, 94, 122, 123, 161, 175,
  183, 184, 191, 194, 202, 206, 207, 214, 219, 228, 241, 241, 250
]

const form = FormApp.getActiveForm()
const message = form.getItems()[0]
const sheet = SpreadsheetApp.openByUrl(SPREADSHEET_URL)

/**
 * Note: you only have to run this once, not after every change to
 * `handleSubmit`
 */
function createSubmitTrigger () {
  ScriptApp.newTrigger('handleSubmit').forForm(form).onFormSubmit().create()
}

/**
 * md5 hash then a salted HMAC-SHA256 hash. Double hashing is probably not
 * secure (it makes it easier for me to migrate the hashes to HMAC) but
 * considering the space of potential UCSD usernames being only around 100k, it
 * is probably not a big deal.
 */
function hash (username) {
  return Utilities.computeHmacSha256Signature(
    Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, username),
    SALT
  ).reduce(
    (output, byte) => output + (byte & 255).toString(16).padStart(2, '0'),
    ''
  )
}

function handleSubmit ({ response }) {
  const time = response.getTimestamp().toISOString()
  const id = hash(response.getRespondentEmail().split('@')[0])
  const content = JSON.parse(response.getResponseForItem(message).getResponse())
  for (const { term, course, professor, grades, recommend } of content) {
    sheet.appendRow([
      time,
      id,
      term,
      course,
      professor,
      grades.map(([grade, count]) => `${grade}:${count}`).join(', '),
      recommend ?? ''
    ])
  }
}
