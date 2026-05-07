import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGroupOrder, gerarLinkCompartilhavel } from '@tpv/shared/group';
import { Users, Copy, Check, X, LogOut, Lock, Unlock } from 'lucide-react';

interface GroupOrderModalProps {
  visible: boolean;
  onClose: () => void;
}

type ModalTab = 'crear' | 'unirse';

export default function GroupOrderModal({ visible, onClose }: GroupOrderModalProps) {
  const group = useGroupOrder();
  const [tab, setTab] = useState<ModalTab>('crear');
  const [nomeGrupo, setNomeGrupo] = useState('');
  const [nomeHost, setNomeHost] = useState('');
  const [codigoEntrada, setCodigoEntrada] = useState('');
  const [nomeMembro, setNomeMembro] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [erro, setErro] = useState('');

  const handleCriar = () => {
    if (!nomeGrupo.trim() || !nomeHost.trim()) {
      setErro('Completa todos los campos');
      return;
    }
    group.criar(nomeGrupo.trim(), nomeHost.trim());
    setErro('');
  };

  const handleEntrar = () => {
    if (!codigoEntrada.trim() || !nomeMembro.trim()) {
      setErro('Completa todos los campos');
      return;
    }
    const resultado = group.entrar(codigoEntrada.trim(), nomeMembro.trim());
    if (!resultado.sucesso) {
      setErro(resultado.erro || 'Error al unirse');
    } else {
      setErro('');
    }
  };

  const handleCopiar = () => {
    if (!group.grupo) return;
    const link = gerarLinkCompartilhavel(group.grupo.codigo);
    navigator.clipboard.writeText(link).catch(() => {});
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleSair = () => {
    group.sair();
    onClose();
  };

  if (!visible) return null;

  // Se já tem grupo ativo, mostra detalhes
  if (group.grupo) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-gray-800">👥 {group.grupo.nome}</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Código */}
          <div className="bg-[#FF6B9D]/10 rounded-xl p-4 mb-4">
            <p className="text-xs text-gray-500 mb-1">Código del grupo</p>
            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl font-bold text-[#FF6B9D] tracking-widest">{group.grupo.codigo}</span>
              <button
                onClick={handleCopiar}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-[#FF6B9D] text-xs font-bold hover:bg-[#FF6B9D] hover:text-white transition-colors"
              >
                {copiado ? <Check size={14} /> : <Copy size={14} />}
                {copiado ? 'Copiado' : 'Copiar link'}
              </button>
            </div>
          </div>

          {/* Membros */}
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Miembros ({group.grupo.membros.length})
            </p>
            <div className="space-y-2">
              {group.grupo.membros.map((m) => (
                <div key={m.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                  <div className="w-8 h-8 rounded-full bg-[#FF6B9D]/20 flex items-center justify-center text-sm">
                    {m.nome.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-800">{m.nome}</span>
                  {m.id === group.grupo?.hostId && (
                    <span className="text-[10px] bg-[#FF6B9D] text-white px-2 py-0.5 rounded-full font-bold">Host</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Itens */}
          {group.grupo.itens.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Items ({group.grupo.itens.length})
              </p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {group.grupo.itens.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-sm text-gray-700">{item.quantity}x {item.product.nome.es}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{item.addedByName}</span>
                      <span className="text-sm font-bold text-[#FF6B9D]">€{(item.unitPrice * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 pt-2 border-t border-gray-100">
                <span className="text-sm font-semibold text-gray-700">Total</span>
                <span className="text-lg font-bold text-[#FF6B9D]">€{group.total.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Status */}
          <div className="flex items-center gap-2 mb-4">
            {group.grupo.status === 'abierto' ? (
              <>
                <Unlock size={14} className="text-green-500" />
                <span className="text-xs text-green-600 font-medium">Abierto — {group.tempoRestante} min restantes</span>
              </>
            ) : (
              <>
                <Lock size={14} className="text-gray-400" />
                <span className="text-xs text-gray-500 font-medium">Cerrado</span>
              </>
            )}
          </div>

          {/* Ações */}
          <div className="flex gap-2">
            <button
              onClick={handleSair}
              className="flex-1 py-3 rounded-xl text-sm font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut size={14} />
              {group.isHostUser ? 'Cerrar grupo' : 'Salir'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // Sem grupo — mostra criar/entrar
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-gray-800 flex items-center gap-2">
            <Users size={20} className="text-[#FF6B9D]" />
            Pedir con amigos
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
          {(['crear', 'unirse'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setErro(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t ? 'bg-white text-[#FF6B9D] shadow-sm' : 'text-gray-400'
              }`}
            >
              {t === 'crear' ? 'Crear grupo' : 'Unirse'}
            </button>
          ))}
        </div>

        {erro && (
          <div className="bg-red-50 text-red-600 text-xs font-medium px-3 py-2 rounded-lg mb-3">
            {erro}
          </div>
        )}

        <AnimatePresence mode="wait">
          {tab === 'crear' ? (
            <motion.div
              key="crear"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-3"
            >
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Nombre del grupo</label>
                <input
                  type="text"
                  value={nomeGrupo}
                  onChange={(e) => setNomeGrupo(e.target.value)}
                  placeholder="Ej: Cumpleaños de María"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B9D]/30"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Tu nombre</label>
                <input
                  type="text"
                  value={nomeHost}
                  onChange={(e) => setNomeHost(e.target.value)}
                  placeholder="Ej: Juan"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B9D]/30"
                />
              </div>
              <button
                onClick={handleCriar}
                className="w-full py-3 rounded-xl bg-[#FF6B9D] text-white font-bold text-sm hover:bg-[#FF5A8F] transition-colors"
              >
                Crear grupo
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="unirse"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-3"
            >
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Código del grupo (6 dígitos)</label>
                <input
                  type="text"
                  value={codigoEntrada}
                  onChange={(e) => setCodigoEntrada(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-mono text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-[#FF6B9D]/30"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Tu nombre</label>
                <input
                  type="text"
                  value={nomeMembro}
                  onChange={(e) => setNomeMembro(e.target.value)}
                  placeholder="Ej: Ana"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B9D]/30"
                />
              </div>
              <button
                onClick={handleEntrar}
                className="w-full py-3 rounded-xl bg-[#FF6B9D] text-white font-bold text-sm hover:bg-[#FF5A8F] transition-colors"
              >
                Unirse al grupo
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
