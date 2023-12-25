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
    window.location.href =
      'https://act.ucsd.edu/studentAcademicHistory/academichistorystudentdisplay.htm'
  }
}
const data = JSON.stringify(
  Array.from(
    document.querySelectorAll('td:nth-child(5) .enhanced-info'),
    gradeInfo => {
      const professor = gradeInfo.parentElement?.parentElement
        ?.querySelector('.popover-content p')
        ?.textContent?.replace(/\s+/g, ' ')
        .split(' - ')[0]
        .trim()
      const [term, course] =
        gradeInfo
          .querySelector('[data-original-title]')
          ?.getAttribute('data-original-title')
          ?.replace(/\s+/g, ' ')
          .split(' - ') ?? []
      return {
        professor,
        term,
        course,
        grades: Array.from(gradeInfo.querySelectorAll('tr'), row => [
          row.firstElementChild?.textContent,
          +(row.lastElementChild?.textContent ?? '')
        ])
      }
    }
  )
)

function h<K extends keyof HTMLElementTagNameMap> (
  tagName: K,
  {
    style,
    ...props
  }: Partial<Omit<HTMLElementTagNameMap[K], 'style'>> & {
    style?: Partial<CSSStyleDeclaration>
  } = {},
  children: (string | Node)[] = []
): HTMLElementTagNameMap[K] {
  const element = Object.assign(document.createElement(tagName), props)
  if (style) {
    Object.assign(element.style, style)
  }
  element.append(...children)
  return element
}

const textarea = h('textarea', {
  style: { width: '100%', height: '100px' },
  value: data
})
const dialog = h('dialog', {}, [
  h('form', { method: 'dialog' }, [
    h('button', { type: 'submit', style: { float: 'right' } }, [
      '\u{a0}×\u{a0}'
    ]),
    h('p', {}, [
      'Copy and paste the following block of text into ',
      h(
        'a',
        {
          href: 'https://docs.google.com/forms/d/e/1FAIpQLSdRQu1lV9dlmMFYKVqQVC_p9V2oNv3qmAdG1IjsoeGmZ0V9OA/viewform'
        },
        ['this Google Form']
      ),
      " to share your classes' grade distributions."
    ]),
    textarea,
    h('p', {}, [
      h(
        'button',
        {
          type: 'button',
          className: 'copy',
          onclick: () => navigator.clipboard.writeText(data)
        },
        ['Copy']
      )
    ]),
    h('iframe', {
      src: 'https://docs.google.com/forms/d/e/1FAIpQLSdRQu1lV9dlmMFYKVqQVC_p9V2oNv3qmAdG1IjsoeGmZ0V9OA/viewform?embedded=true',
      width: '640',
      height: '1000',
      style: { border: '0' }
    }),
    h('p', {}, [
      h('a', { href: 'https://sheeptester.github.io/ucsd-sunset/' }, [
        'Return to SunSET'
      ])
    ]),
    h('p', {}, [
      'Please note that it may take a few minutes for your contributions to show up.'
    ])
  ])
])
document.body.append(dialog)
dialog.showModal()
