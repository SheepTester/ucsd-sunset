function main (dialogHtml) {
  if (
    window.location.host !== 'act.ucsd.edu' &&
    window.location.pathname !==
      '/studentAcademicHistory/academichistorystudentdisplay.htm'
  ) {
    if (
      confirm(
        'Please run this bookmarklet on Academic History. Would you like to be taken there?'
      )
    ) {
      window.location =
        'https://act.ucsd.edu/studentAcademicHistory/academichistorystudentdisplay.htm'
    }
    return
  }
  const data = JSON.stringify(
    Array.from(
      document.querySelectorAll('td:nth-child(5) .enhanced-info'),
      gradeInfo => {
        const professor = gradeInfo.parentElement.parentElement
          .querySelector('.popover-content p')
          .textContent.replace(/\s+/g, ' ')
          .split(' - ')[0]
          .trim()
        const [term, course] = gradeInfo
          .querySelector('[data-original-title]')
          .dataset.originalTitle.replace(/\s+/g, ' ')
          .split(' - ')
        return {
          professor,
          term,
          course,
          grades: Array.from(gradeInfo.querySelectorAll('tr'), row => [
            row.firstElementChild.textContent,
            +row.lastElementChild.textContent
          ])
        }
      }
    )
  )
  document.body.insertAdjacentHTML('beforeend', dialogHtml)
  const dialog = document.querySelector('dialog:last-child')
  dialog.showModal()
  dialog.querySelector('textarea').value = data
  dialog
    .querySelector('.copy')
    .addEventListener('click', () => navigator.clipboard.writeText(data))
}
