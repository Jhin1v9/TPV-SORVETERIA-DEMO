import { motion } from 'framer-motion';
import { useStore } from '@tpv/shared/stores/useStore';
import {
  Receipt,
  CreditCard,
  Banknote,
  Smartphone,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Package,
  MapPin,
} from 'lucide-react';
import type { Pedido, PedidoStatus, ComprovantePagamento } from '@tpv/shared/types';

interface PedidoDetalhesPageProps {
  pedido: Pedido;
  onBack: () => void;
}

const statusConfig: Record<
  PedidoStatus,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  pendiente: {
    label: 'Pendiente',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    icon: <Clock size={18} />,
  },
  preparando: {
    label: 'Preparando',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    icon: <Package size={18} />,
  },
  listo: {
    label: '¡Listo!',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    icon: <CheckCircle2 size={18} />,
  },
  entregado: {
    label: 'Entregado',
    color: 'text-gray-600',
    bg: 'bg-gray-50',
    icon: <MapPin size={18} />,
  },
  cancelado: {
    label: 'Cancelado',
    color: 'text-red-600',
    bg: 'bg-red-50',
    icon: <XCircle size={18} />,
  },
};

function MetodoPagamentoIcon({ metodo }: { metodo: string }) {
  switch (metodo) {
    case 'tarjeta':
      return <CreditCard size={20} className="text-indigo-500" />;
    case 'efectivo':
      return <Banknote size={20} className="text-emerald-500" />;
    case 'bizum':
      return <Smartphone size={20} className="text-cyan-500" />;
    default:
      return <Receipt size={20} className="text-gray-500" />;
  }
}

function MetodoPagamentoLabel({ metodo }: { metodo: string }) {
  switch (metodo) {
    case 'tarjeta':
      return 'Tarjeta';
    case 'efectivo':
      return 'Efectivo';
    case 'bizum':
      return 'Bizum';
    default:
      return metodo;
  }
}

function ComprovanteCard({ comprovante }: { comprovante?: ComprovantePagamento }) {
  if (!comprovante) {
    // Mock visual para demonstração (preparado para real)
    return (
      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4 text-center">
        <Receipt size={32} className="text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-400">Comprobante no disponible</p>
        <p className="text-xs text-gray-300 mt-1">Se generará al procesar el pago real</p>
      </div>
    );
  }

  const estadoStyles = {
    aprovado: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: <CheckCircle2 size={20} className="text-emerald-600" />, text: 'text-emerald-700' },
    rejeitado: { bg: 'bg-red-50', border: 'border-red-200', icon: <XCircle size={20} className="text-red-600" />, text: 'text-red-700' },
    pendente: { bg: 'bg-amber-50', border: 'border-amber-200', icon: <Clock size={20} className="text-amber-600" />, text: 'text-amber-700' },
    reembolsado: { bg: 'bg-blue-50', border: 'border-blue-200', icon: <Receipt size={20} className="text-blue-600" />, text: 'text-blue-700' },
  };

  const style = estadoStyles[comprovante.estado];

  return (
    <div className={`${style.bg} ${style.border} border rounded-xl p-4 space-y-3`}>
      <div className="flex items-center gap-2">
        {style.icon}
        <span className={`font-semibold text-sm ${style.text}`}>
          {comprovante.estado === 'aprovado' && 'Pago aprobado'}
          {comprovante.estado === 'rejeitado' && 'Pago rechazado'}
          {comprovante.estado === 'pendente' && 'Pago pendiente'}
          {comprovante.estado === 'reembolsado' && 'Reembolsado'}
        </span>
      </div>

      {comprovante.idTransacao && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">ID Transacción</span>
          <span className="font-mono text-gray-700">{comprovante.idTransacao}</span>
        </div>
      )}

      {comprovante.gateway && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Gateway</span>
          <span className="text-gray-700 capitalize">{comprovante.gateway}</span>
        </div>
      )}

      {comprovante.ultimos4Digitos && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Tarjeta</span>
          <span className="text-gray-700">**** {comprovante.ultimos4Digitos}</span>
        </div>
      )}

      {comprovante.dataProcessamento && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Procesado</span>
          <span className="text-gray-700">
            {new Date(comprovante.dataProcessamento).toLocaleString('es-ES')}
          </span>
        </div>
      )}

      {comprovante.mensagemErro && (
        <div className="flex items-start gap-2 bg-red-100 rounded-lg p-2">
          <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
          <p className="text-xs text-red-700">{comprovante.mensagemErro}</p>
        </div>
      )}

      {comprovante.urlComprovante && (
        <a
          href={comprovante.urlComprovante}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-sm text-[#FF6B9D] font-medium hover:underline"
        >
          Descargar comprobante →
        </a>
      )}
    </div>
  );
}

export default function PedidoDetalhesPage({ pedido, onBack }: PedidoDetalhesPageProps) {
  const { locale } = useStore();
  const status = statusConfig[pedido.status];
  const iva = pedido.iva ?? pedido.total * 0.1 / 1.1;
  const subtotal = pedido.subtotal ?? pedido.total - iva;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="h-full bg-[#F5F5F5] overflow-y-auto"
    >
      {/* Header */}
      <div className="bg-white px-4 py-3 sticky top-0 z-10 border-b border-black/5">
        {/* KIMI REVISAO OK TESTE EXAUSTIVO PRA PROCURAR BUGS — seta quadrada removida, texto 'Volver a pedidos' em botão clean */}
        <button
          onClick={onBack}
          className="mb-2 inline-flex items-center gap-2 rounded-full border border-black/8 bg-black/[0.03] px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-black/[0.06] transition-colors"
        >
          Volver a pedidos
        </button>
        <div>
          <h1 className="font-display font-bold text-lg">
            Pedido #{pedido.numeroSequencial.toString().padStart(3, '0')}
          </h1>
          <p className="text-xs text-gray-400">
            {new Date(pedido.timestampCriacao).toLocaleDateString(locale)}
          </p>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        {/* Status */}
        <div className={`${status.bg} rounded-2xl p-4 flex items-center gap-3`}>
          <div className={`${status.color}`}>{status.icon}</div>
          <div>
            <p className={`font-bold ${status.color}`}>{status.label}</p>
            <p className="text-xs text-gray-500">
              {pedido.status === 'pendiente' && 'Recibido en cocina'}
              {pedido.status === 'preparando' && 'Cocina trabajando en tu pedido'}
              {pedido.status === 'listo' && '¡Pasa por el mostrador!'}
              {pedido.status === 'entregado' && 'Entregado el ' + new Date(pedido.timestampListo || pedido.timestampCriacao).toLocaleDateString(locale)}
              {pedido.status === 'cancelado' && 'Pedido cancelado'}
            </p>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/5">
          <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Package size={18} className="text-[#FF6B9D]" />
            Productos
          </h2>
          <div className="space-y-3">
            {pedido.itens.map((item, idx) => (
              <div key={item.id || idx} className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">
                    {item.quantidade}x {item.productName || item.categoriaNome}
                  </p>
                  {item.selections && Object.entries(item.selections).length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {Object.entries(item.selections).map(([key, opts]) => {
                        if (!Array.isArray(opts) || opts.length === 0) return null;
                        return (
                          <p key={key} className="text-xs text-gray-500">
                            {key}: {opts.map((o) => o.nome?.es || o.id).join(', ')}
                          </p>
                        );
                      })}
                    </div>
                  )}
                  {item.itemType === 'legacy' && item.sabores.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Sabores: {item.sabores.map((s) => s.nome.es).join(', ')}
                    </p>
                  )}
                </div>
                <p className="font-semibold text-gray-800 text-sm">
                  €{((item.precoUnitario || 0) * item.quantidade).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-black/5 mt-4 pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-700">€{subtotal.toFixed(2)}</span>
            </div>
            {pedido.descuento && pedido.descuento > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Descuento</span>
                <span className="text-emerald-600">-€{pedido.descuento.toFixed(2)}</span>
              </div>
            )}
            {pedido.extras && pedido.extras > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Extras</span>
                <span className="text-gray-700">+€{pedido.extras.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">IVA (10%)</span>
              <span className="text-gray-700">€{iva.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-2 border-t border-black/5">
              <span>Total</span>
              <span>€{pedido.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Método de Pago */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/5">
          <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Receipt size={18} className="text-[#FF6B9D]" />
            Método de Pago
          </h2>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
              <MetodoPagamentoIcon metodo={pedido.metodoPago} />
            </div>
            <div>
              <p className="font-medium text-gray-800">
                <MetodoPagamentoLabel metodo={pedido.metodoPago} />
              </p>
              <p className="text-xs text-gray-400">
                {pedido.metodoPago === 'efectivo' && 'Paga al recoger en mostrador'}
                {pedido.metodoPago === 'tarjeta' && 'Pago con tarjeta bancaria'}
                {pedido.metodoPago === 'bizum' && 'Pago via Bizum'}
              </p>
            </div>
          </div>

          {/* Comprovante */}
          <ComprovanteCard comprovante={pedido.comprovantePagamento} />
        </div>

        {/* Informações Adicionais */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/5">
          <h2 className="font-bold text-gray-800 mb-3">Información</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Número de pedido</span>
              <span className="font-mono text-gray-700">#{pedido.numeroSequencial.toString().padStart(3, '0')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Fecha</span>
              <span className="text-gray-700">
                {new Date(pedido.timestampCriacao).toLocaleString(locale)}
              </span>
            </div>
            {pedido.clienteTelefone && (
              <div className="flex justify-between">
                <span className="text-gray-500">Teléfono</span>
                <span className="text-gray-700">{pedido.clienteTelefone}</span>
              </div>
            )}
            {pedido.nomeUsuario && (
              <div className="flex justify-between">
                <span className="text-gray-500">Cliente</span>
                <span className="text-gray-700">{pedido.nomeUsuario}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Origen</span>
              <span className="text-gray-700 capitalize">
                {pedido.origem === 'pwa' ? 'App Cliente' : pedido.origem === 'kiosk' ? 'Quiosco' : 'TPV'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
