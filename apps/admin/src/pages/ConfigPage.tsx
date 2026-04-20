import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getDemoServerUrl, resetRemoteDemo, updateRemoteFlavorAvailability, updateRemoteSettings } from '@tpv/shared/realtime/client';
import { useStore } from '@tpv/shared/stores/useStore';

export default function ConfigPage() {
  const { sabores, establishment, hydrateRemoteState } = useStore();
  const [saved, setSaved] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [form, setForm] = useState(establishment);

  useEffect(() => {
    setForm(establishment);
  }, [establishment]);

  async function handleToggleDisponivel(id: string, nextDisponivel: boolean) {
    const response = await updateRemoteFlavorAvailability(id, nextDisponivel);
    hydrateRemoteState(response.snapshot);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  async function handleSaveSettings() {
    const response = await updateRemoteSettings(form);
    hydrateRemoteState(response.snapshot);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  async function handleResetDemo() {
    setResetting(true);
    try {
      const response = await resetRemoteDemo();
      hydrateRemoteState(response.snapshot);
    } finally {
      setResetting(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-gray-800 mb-6">Configuracion</h1>

      {saved && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-green-100 text-green-700 rounded-xl px-4 py-3 mb-4">
          Cambios aplicados en todos los dispositivos conectados.
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="font-display font-bold text-gray-800">Sesion realtime</h3>
            <p className="text-sm text-gray-500">Servidor actual: {getDemoServerUrl()}</p>
          </div>
          <button
            onClick={handleResetDemo}
            disabled={resetting}
            className="h-11 px-5 rounded-xl bg-[#2D3436] text-white font-semibold disabled:opacity-60"
          >
            {resetting ? 'Reiniciando...' : 'Reset Demo'}
          </button>
        </div>
        <p className="text-sm text-gray-500">
          Este reset restaura pedidos, stock, disponibilidad y ajustes para comenzar una nueva presentacion limpia.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <h3 className="font-display font-bold text-gray-800 mb-4">Informacion del establecimiento</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Nombre</label>
            <input
              type="text"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-[#FF6B9D] outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">NIF</label>
            <input
              type="text"
              value={form.nif}
              onChange={(event) => setForm((current) => ({ ...current, nif: event.target.value }))}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-[#FF6B9D] outline-none text-sm font-mono"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-500 mb-1">Direccion</label>
            <input
              type="text"
              value={form.address}
              onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-[#FF6B9D] outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Horario verano</label>
            <input
              type="text"
              value={form.summerHours}
              onChange={(event) => setForm((current) => ({ ...current, summerHours: event.target.value }))}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-[#FF6B9D] outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Horario invierno</label>
            <input
              type="text"
              value={form.winterHours}
              onChange={(event) => setForm((current) => ({ ...current, winterHours: event.target.value }))}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-[#FF6B9D] outline-none text-sm"
            />
          </div>
        </div>
        <button onClick={handleSaveSettings} className="mt-5 h-11 px-5 rounded-xl bg-[#FF6B9D] text-white font-semibold">
          Guardar ajustes
        </button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="font-display font-bold text-gray-800 mb-4">Disponibilidad de sabores</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sabores.map((sabor) => (
            <div key={sabor.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${sabor.disponivel ? 'border-gray-100 bg-white' : 'border-red-200 bg-red-50'}`}>
              <div className="w-10 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: sabor.corHex }} />
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm truncate ${sabor.disponivel ? 'text-gray-800' : 'text-gray-400 line-through'}`}>{sabor.nome.es}</p>
                <p className="text-xs text-gray-400">{sabor.stockBaldes.toFixed(2)} baldes</p>
              </div>
              <button
                onClick={() => handleToggleDisponivel(sabor.id, !sabor.disponivel)}
                className={`relative w-12 h-7 rounded-full transition-all ${sabor.disponivel ? 'bg-[#4ECDC4]' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${sabor.disponivel ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
