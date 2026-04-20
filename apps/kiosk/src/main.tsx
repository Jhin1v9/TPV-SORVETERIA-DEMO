import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import KioskApp from './KioskApp'

// Import shared styles
import '@tpv/shared/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <KioskApp />
  </StrictMode>,
)
