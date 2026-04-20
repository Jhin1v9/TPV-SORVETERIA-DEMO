import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ClienteApp from './ClienteApp'

// Import shared styles
import '@tpv/shared/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClienteApp />
  </StrictMode>,
)
