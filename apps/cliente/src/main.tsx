import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ClienteApp from './ClienteApp'
import { registerClienteServiceWorker } from './lib/pushNotifications'

// Import shared styles
import '@tpv/shared/index.css'

void registerClienteServiceWorker()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClienteApp />
  </StrictMode>,
)
