import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './components/App'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App
      sourceUrl='https://docs.google.com/spreadsheets/d/e/2PACX-1vQ6KhjyiPM-rof6fqjBcmp7ygy4Dqr1LQ8uJiAOtR2IoihzQEumx-SHX_KKxLpmYGZksN6QsPPk0DNb/pub?single=true&output=tsv'
      formUrl='https://docs.google.com/forms/d/e/1FAIpQLSdRQu1lV9dlmMFYKVqQVC_p9V2oNv3qmAdG1IjsoeGmZ0V9OA/viewform'
    />
  </StrictMode>
)
