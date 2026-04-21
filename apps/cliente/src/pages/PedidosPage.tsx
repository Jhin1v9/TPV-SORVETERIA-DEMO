import { useStore } from '@tpv/shared/stores/useStore';
import { t } from '@tpv/shared/i18n';

export default function PedidosPage() {
  const { pedidos, locale, perfilUsuario } = useStore();

  const meusPedidos = perfilUsuario?.telefone
    ? pedidos.filter((p) => p.clienteTelefone === perfilUsuario.telefone)
    : [];

  const statusColors: Record<string, string> = {
    pendiente: 'bg-blue-100 text-blue-700',
    preparando: 'bg-amber-100 text-amber-700',
    listo: 'bg-emerald-100 text-emerald-700',
    entregado: 'bg-gray-100 text-gray-600',
    cancelado: 'bg-red-100 text-red-700',
  };

  const statusLabels: Record<string, string> = {
    pendiente: t('orderStatusPending', locale),
    preparando: t('orderStatusPreparing', locale),
    listo: t('orderStatusReady', locale),
    entregado: t('orderStatusDelivered', locale),
    cancelado: t('cancelled', locale),
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="font-display font-bold text-2xl mb-4">{t('myOrders', locale)}</h2>

      {meusPedidos.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <span className="text-6xl">📋</span>
          <p className="text-lg font-medium mt-4">{t('noOrdersYet', locale)}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {meusPedidos.map((pedido) => (
            <div key={pedido.id} className="bg-white rounded-2xl p-4 shadow-sm border border-black/5">
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono font-bold text-gray-800">#{pedido.numeroSequencial.toString().padStart(3, '0')}</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColors[pedido.status]}`}>
                  {statusLabels[pedido.status]}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {pedido.itens.length} {t('orders', locale).toLowerCase()} · €{pedido.total.toFixed(2)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(pedido.timestampCriacao).toLocaleString(locale)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
