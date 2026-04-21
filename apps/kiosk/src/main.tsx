import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import KioskApp from './KioskApp'
import { TPVBugDetectorProvider } from '@tpv/shared/components/BugDetectorProvider'

// Import shared styles
import '@tpv/shared/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TPVBugDetectorProvider>
      <KioskApp />
    </TPVBugDetectorProvider>
  </StrictMode>,
)
