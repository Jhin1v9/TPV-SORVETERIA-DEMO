import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import AdminApp from './AdminApp'
import { TPVBugDetectorProvider } from '@tpv/shared/components/BugDetectorProvider'

import '@tpv/shared/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TPVBugDetectorProvider>
      <AdminApp />
    </TPVBugDetectorProvider>
  </StrictMode>,
)
