import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import KDSApp from './KDSApp'

import '@tpv/shared/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <KDSApp />
  </StrictMode>,
)
