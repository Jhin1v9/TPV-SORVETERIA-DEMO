import { useState } from 'react';
import { motion } from 'framer-motion';
import { updateRemoteFlavorStock } from '../../../shared/realtime/client';
import { useStore } from '../../../shared/stores/useStore';
import { calcularPorcoesAll } from '../../../shared/utils/calculos';
import type { Sabor } from '../../../shared/types';

function StockCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) {
  const isLow = value < 10;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`bg-white rounded-2xl p-5 shadow-sm border-2 transition-all ${isLow ? 'border-red-300 animate-pulse' : 'border-transparent'}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: `${color}20` }}>
          {icon}
        </div>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <p className={`font-mono text-3xl font-bold ${isLow ? 'text-red-500' : 'text-gray-800'}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-1">porciones</p>
    </motion.div>
  );
}

export default function EstoquePage() {
  const { sabores } = useStore();
  const [baldeInput, setBaldeInput] = useState(5);
  const porcoes = calcularPorcoesAll(baldeInput);
  const lowStockSabores = sabores.filter((sabor) => sabor.stockBaldes <= sabor.alertaStock);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-gray-800 mb-6">Calculadora de Stock</h1>

      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-500">Baldes de 5L en stock</span>
          <span className="font-mono text-3xl font-bold text-[#FF6B9D]">{baldeInput.toFixed(1)}</span>
        </div>
        <input type="range" min="0" max="20" step="0.5" value={baldeInput} onChange={(event) => setBaldeInput(Number(event.target.value))} className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[#FF6B9D]" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StockCard label="Copo 300ml" value={porcoes.copo300} color="#4ECDC4" icon="300" />
        <StockCard label="Copo 500ml" value={porcoes.copo500} color="#FF6B9D" icon="500" />
        <StockCard label="Cones" value={porcoes.cone} color="#D2691E" icon="C" />
        <StockCard label="Potes 1L" value={porcoes.pote1l} color="#98D8C8" icon="1L" />
      </div>

      <h2 className="font-display text-xl font-bold text-gray-800 mb-4">Stock por sabor</h2>

      {lowStockSabores.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
          <p className="font-semibold text-red-700">Alerta de stock bajo</p>
          <p className="text-red-500 text-sm">{lowStockSabores.length} sabores necesitan reposicion.</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Sabor</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Baldes</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Estado</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sabores.map((sabor) => (
                <FlavorRow key={sabor.id} sabor={sabor} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FlavorRow({ sabor }: { sabor: Sabor }) {
  const hydrateRemoteState = useStore((state) => state.hydrateRemoteState);
  const [adjust, setAdjust] = useState('');
  const [saving, setSaving] = useState(false);
  const isLow = sabor.stockBaldes <= sabor.alertaStock;
  const copos500 = Math.floor((sabor.stockBaldes * 5000) / 500);

  async function handleAdjust() {
    const delta = Number.parseFloat(adjust);
    if (Number.isNaN(delta)) {
      return;
    }
    setSaving(true);
    try {
      const response = await updateRemoteFlavorStock(sabor.id, delta);
      hydrateRemoteState(response.snapshot);
      setAdjust('');
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full" style={{ backgroundColor: sabor.corHex }} />
          <div>
            <p className="font-medium text-gray-800">{sabor.nome.es}</p>
            <p className="text-xs text-gray-400 capitalize">{sabor.categoria}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <span className={`font-mono font-bold ${isLow ? 'text-red-500' : 'text-gray-700'}`}>{sabor.stockBaldes.toFixed(2)}</span>
        <span className="text-xs text-gray-400 ml-1">(~{copos500} copos)</span>
      </td>
      <td className="px-5 py-4">
        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${isLow ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isLow ? 'bg-red-500' : 'bg-green-500'}`} />
          {isLow ? 'Critico' : 'OK'}
        </span>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <input type="number" step="0.5" placeholder="+/-" value={adjust} onChange={(event) => setAdjust(event.target.value)} className="w-20 h-8 px-2 rounded-lg border border-gray-200 text-sm text-center" />
          <button onClick={handleAdjust} disabled={saving} className="h-8 px-3 rounded-lg bg-[#FF6B9D] text-white text-xs font-bold hover:bg-[#FF5A8F] transition-colors disabled:opacity-60">
            {saving ? '...' : 'Ajustar'}
          </button>
        </div>
      </td>
    </tr>
  );
}
