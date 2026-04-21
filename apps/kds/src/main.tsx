import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import KDSApp from './KDSApp'
import { TPVBugDetectorProvider } from '@tpv/shared/components/BugDetectorProvider'

import '@tpv/shared/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TPVBugDetectorProvider>
      <KDSApp />
    </TPVBugDetectorProvider>
  </StrictMode>,
)
