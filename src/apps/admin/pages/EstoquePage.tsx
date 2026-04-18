import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../../shared/stores/useStore';
import { calcularPorcoesAll } from '../../../shared/utils/calculos';
import type { Sabor } from '../../../shared/types';

function StockCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) {
  const isLow = value < 10;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl p-5 shadow-sm border-2 transition-all ${isLow ? 'border-red-300 animate-pulse' : 'border-transparent'}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: color + '20' }}>
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
  const { sabores, updateSaborStock } = useStore();
  const [baldeInput, setBaldeInput] = useState(5);
  const porcoes = calcularPorcoesAll(baldeInput);

  const lowStockSabores = sabores.filter((s) => s.stockBaldes <= s.alertaStock);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-gray-800 mb-6">Calculadora de Stock</h1>

      {/* Slider */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-500">Baldes de 5L en estoque</span>
          <span className="font-mono text-3xl font-bold text-[#FF6B9D]">{baldeInput.toFixed(1)}</span>
        </div>
        <input
          type="range"
          min="0"
          max="20"
          step="0.5"
          value={baldeInput}
          onChange={(e) => setBaldeInput(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[#FF6B9D]"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>0</span>
          <span>5</span>
          <span>10</span>
          <span>15</span>
          <span>20</span>
        </div>
      </div>

      {/* Portions result */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StockCard label="Copo 300ml" value={porcoes.copo300} color="#4ECDC4" icon="🍨" />
        <StockCard label="Copo 500ml" value={porcoes.copo500} color="#FF6B9D" icon="🍦" />
        <StockCard label="Cones" value={porcoes.cone} color="#D2691E" icon="🥐" />
        <StockCard label="Potes 1L" value={porcoes.pote1l} color="#98D8C8" icon="🛒" />
      </div>

      {/* Flavors stock */}
      <h2 className="font-display text-xl font-bold text-gray-800 mb-4">Stock por Sabor</h2>

      {lowStockSabores.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-red-700">Alerta de stock bajo</p>
            <p className="text-red-500 text-sm">{lowStockSabores.length} sabores necesitan reposición</p>
          </div>
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
                <FlavorRow key={sabor.id} sabor={sabor} onUpdateStock={updateSaborStock} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FlavorRow({ sabor, onUpdateStock }: { sabor: Sabor; onUpdateStock: (id: string, q: number) => void }) {
  const [adjust, setAdjust] = useState('');
  const isLow = sabor.stockBaldes <= sabor.alertaStock;
  const copos500 = Math.floor((sabor.stockBaldes * 5000) / 500);

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
        <span className={`font-mono font-bold ${isLow ? 'text-red-500' : 'text-gray-700'}`}>
          {sabor.stockBaldes.toFixed(1)}
        </span>
        <span className="text-xs text-gray-400 ml-1">(~{copos500} copos)</span>
      </td>
      <td className="px-5 py-4">
        {isLow ? (
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
            Crítico
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 bg-green-100 text-green-600 text-xs font-bold px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            OK
          </span>
        )}
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <input
            type="number"
            step="0.5"
            placeholder="+/-"
            value={adjust}
            onChange={(e) => setAdjust(e.target.value)}
            className="w-20 h-8 px-2 rounded-lg border border-gray-200 text-sm text-center"
          />
          <button
            onClick={() => {
              const val = parseFloat(adjust);
              if (!isNaN(val)) {
                onUpdateStock(sabor.id, val);
                setAdjust('');
              }
            }}
            className="h-8 px-3 rounded-lg bg-[#FF6B9D] text-white text-xs font-bold hover:bg-[#FF5A8F] transition-colors"
          >
            Ajustar
          </button>
        </div>
      </td>
    </tr>
  );
}
