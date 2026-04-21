import { type ReactNode } from 'react';
import { BugDetectorProvider as AurisProvider, BugDetectorFloatingButton } from '@auris/bug-detector/react';
import type { BugDetectorConfig } from '@auris/bug-detector';

const config: BugDetectorConfig = {
  trigger: 'keyboard-shortcut',
  shortcut: 'Ctrl+Shift+D',
  persistTo: 'localStorage',
  guestMode: true,
  zIndexBase: 50, // ← não bloqueia elementos abaixo (antes era 999999)
  ai: {
    provider: 'none', // ← desativado por padrão. Ativar manualmente quando necessário
    apiKey: '',
  },
  branding: {
    primaryColor: '#FF6B9D',
    position: 'bottom-right',
    buttonText: '🐛',
  },
};

export function TPVBugDetectorProvider({ children }: { children: ReactNode }) {
  return (
    <AurisProvider config={config}>
      {children}
      <BugDetectorFloatingButton position="bottom-right" color="#FF6B9D" />
    </AurisProvider>
  );
}
