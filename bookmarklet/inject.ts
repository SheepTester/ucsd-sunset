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
const classes = Array.from(
  document.querySelectorAll('td:nth-child(5) .enhanced-info'),
  gradeInfo => {
    const professor =
      gradeInfo.parentElement?.parentElement
        ?.querySelector('.popover-content p')
        ?.textContent?.replace(/\s+/g, ' ')
        .split(' - ')[0]
        .trim() ?? ''
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
const data = JSON.stringify(classes)

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
const copySuccess = h('span', { className: 'text-success' }, [
  ' Copied to clipboard!'
])
const dialog = h('dialog', {}, [
  h('form', { method: 'dialog' }, [
    h(
      'button',
      {
        type: 'submit',
        className: 'close',
        ariaLabel: 'Close',
        style: { float: 'right' }
      },
      ['×']
    ),
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
          className: 'btn copy',
          onclick: function () {
            navigator.clipboard.writeText(data).then(() => {
              if (this instanceof HTMLButtonElement) {
                this.after(copySuccess)
              }
            })
          }
        },
        ['Copy']
      )
    ]),
    h('details', { className: 'accordion-group' }, [
      h('summary', { className: 'accordion-heading' }, [
        h(
          'div',
          { className: 'accordion-toggle', style: { display: 'inline-block' } },
          ['Optional: Would you recommend your professors?']
        )
      ]),
      h(
        'div',
        { className: 'accordion-inner' },
        classes.flatMap(({ term, course, professor }, i) => [
          term,
          ': ',
          h('strong', {}, [course]),
          ' with ',
          h('strong', {}, [professor]),
          h('p', {}, [
            h('label', { className: 'radio inline' }, [
              h('input', {
                type: 'radio',
                name: `recommend-${i}`,
                value: 'good'
              }),
              ' 🤩 better than others'
            ]),
            ' ',
            h('label', { className: 'radio inline' }, [
              h('input', {
                type: 'radio',
                name: `recommend-${i}`,
                value: 'ok'
              }),
              ' 🤷 it was fine'
            ]),
            ' ',
            h('label', { className: 'radio inline' }, [
              h('input', {
                type: 'radio',
                name: `recommend-${i}`,
                value: 'bad'
              }),
              ' 😡 avoid if possible'
            ]),
            ' ',
            h('label', { className: 'radio inline' }, [
              h('input', {
                type: 'radio',
                name: `recommend-${i}`,
                value: '',
                checked: true
              }),
              ' no selection'
            ])
          ])
        ])
      )
    ]),
    h('iframe', {
      src: 'https://docs.google.com/forms/d/e/1FAIpQLSdRQu1lV9dlmMFYKVqQVC_p9V2oNv3qmAdG1IjsoeGmZ0V9OA/viewform?embedded=true',
      width: '640',
      height: '1000',
      style: { border: '0' }
    }),
    h('p', {}, [
      h(
        'a',
        {
          className: 'btn',
          href: 'https://sheeptester.github.io/ucsd-sunset/'
        },
        ['Return to SunSET']
      )
    ]),
    h('p', {}, [
      'Please note that it may take a few minutes for your contributions to show up.'
    ])
  ])
])
document.body.append(dialog)
dialog.showModal()
