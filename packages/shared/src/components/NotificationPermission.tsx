/**
 * ═══ FASE 16 — Notification Permission Banner ═══
 * Banner para solicitar permissão de notificações push
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';

interface NotificationPermissionProps {
  locale?: string;
}

export default function NotificationPermission({ locale = 'es' }: NotificationPermissionProps) {
  const [visible, setVisible] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    setPermission(Notification.permission);
    if (Notification.permission === 'default') {
      // Mostra após 3 segundos no app
      const timer = setTimeout(() => setVisible(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleRequest = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
    setVisible(false);
  };

  const handleDismiss = () => {
    setVisible(false);
    // Não mostra novamente nesta sessão
    sessionStorage.setItem('notif-banner-dismissed', '1');
  };

  if (permission !== 'default' || !visible) return null;
  if (sessionStorage.getItem('notif-banner-dismissed')) return null;

  const textos = {
    es: {
      title: '¡Activa las notificaciones!',
      desc: 'Te avisaremos cuando tu pedido esté listo',
      allow: 'Permitir',
      dismiss: 'Ahora no',
    },
    pt: {
      title: 'Ative as notificações!',
      desc: 'Avisearemos quando seu pedido estiver pronto',
      allow: 'Permitir',
      dismiss: 'Agora não',
    },
    en: {
      title: 'Enable notifications!',
      desc: 'We\'ll let you know when your order is ready',
      allow: 'Allow',
      dismiss: 'Not now',
    },
    ca: {
      title: 'Activa les notificacions!',
      desc: 'T\'avisarem quan la teva comanda estigui llista',
      allow: 'Permetre',
      dismiss: 'Ara no',
    },
  };

  const t = textos[locale as keyof typeof textos] || textos.es;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-gradient-to-r from-[#FF6B9D]/10 to-[#FFA07A]/10 border border-[#FF6B9D]/20 rounded-2xl p-4 mb-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-[#FF6B9D]/10 flex items-center justify-center shrink-0">
            <Bell size={20} className="text-[#FF6B9D]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-800 text-sm">{t.title}</p>
            <p className="text-gray-500 text-xs">{t.desc}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRequest}
              className="px-4 py-2 rounded-xl bg-[#FF6B9D] text-white text-xs font-bold hover:bg-[#FF5A8F] transition-colors"
            >
              {t.allow}
            </button>
            <button
              onClick={handleDismiss}
              className="w-8 h-8 rounded-lg hover:bg-black/5 flex items-center justify-center text-gray-400"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
