import { useEffect, useState } from 'react'
import { Distributions, parseDistributions } from '../util/parseDistributions'

export type AppProps = {
  sourceUrl: string
  formUrl: string
}
export function App ({ sourceUrl }: AppProps) {
  const [distributions, setDistributions] = useState<Distributions>({})

  useEffect(() => {
    fetch(sourceUrl)
      .then(r => r.text())
      .then(parseDistributions)
      .then(setDistributions)
  }, [sourceUrl])

  return <pre>{JSON.stringify(distributions, null, 2)}</pre>
}
