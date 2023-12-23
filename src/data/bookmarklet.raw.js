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
document.body.insertAdjacentHTML(
  'beforeend',
  `
<dialog>
  <form method="dialog">
    <button type="submit" style="float: right">&nbsp;&times;&nbsp;</button>
    <p>
      Copy and paste the following block of text into
      <a href="https://docs.google.com/forms/d/e/1FAIpQLSdRQu1lV9dlmMFYKVqQVC_p9V2oNv3qmAdG1IjsoeGmZ0V9OA/viewform">this Google Form</a>
      to share your classes' grade distributions.
    </p>
    <textarea style="width: 100%; height: 100px"></textarea>
    <p><button type="button" class="copy">Copy</button></p>
    <iframe
      src="https://docs.google.com/forms/d/e/1FAIpQLSdRQu1lV9dlmMFYKVqQVC_p9V2oNv3qmAdG1IjsoeGmZ0V9OA/viewform?embedded=true"
      width="640"
      height="1000"
      frameborder="0"
      marginheight="0"
      marginwidth="0"
    >
      Loading…
    </iframe>
  </form>
</dialog>
`
)
const dialog = document.querySelector('dialog:last-child')
dialog.showModal()
dialog.querySelector('textarea').value = data
dialog
  .querySelector('.copy')
  .addEventListener('click', () => navigator.clipboard.writeText(data))
