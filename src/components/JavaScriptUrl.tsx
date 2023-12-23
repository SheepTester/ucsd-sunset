import { useEffect, useRef } from 'react'

/**
 * A wrapper around `<a>` to get around React's javascript: URL warning.
 */
export function JavaScriptUrl ({
  href,
  ...props
}: React.DetailedHTMLProps<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  HTMLAnchorElement
>) {
  const ref = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (ref.current && href !== undefined) {
      ref.current.href = href
    }
  }, [])

  return <a {...props} ref={ref} />
}
