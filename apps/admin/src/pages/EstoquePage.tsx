import { useState } from 'react';
import { motion } from 'framer-motion';
import { updateRemoteFlavorStock } from '@tpv/shared/realtime/client';
import { useStore } from '@tpv/shared/stores/useStore';
import type { Sabor, Ingrediente } from '@tpv/shared/types';
import { Package, AlertTriangle, CheckCircle, FlaskConical } from 'lucide-react';
import { deveDesativarAuto, deveReativarAuto, estaEmStockBaixo, tocarNotificacaoSuave } from '@tpv/shared';
import { calcularStatusIngrediente, formatarQuantidade, gerarAlertasInventory } from '@tpv/shared/inventory';

function StatCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15`, color }}>
          {icon}
        </div>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <p className="font-mono text-3xl font-bold text-gray-800">{value}</p>
    </motion.div>
  );
}

type EstoqueTab = 'sabores' | 'ingredientes';

export default function EstoquePage() {
  const { sabores, ingredientes } = useStore();
  const [tab, setTab] = useState<EstoqueTab>('sabores');
  const [baldeInput, setBaldeInput] = useState(5);

  // Fase 10 — Alertas combinados (ingredientes + sabores)
  const alertas = gerarAlertasInventory(ingredientes, sabores);

  const lowStockSabores = sabores.filter((s) => s.stockBaldes <= s.alertaStock);
  const disponiveis = sabores.filter((s) => s.disponivel).length;
  const totalBaldes = sabores.reduce((sum, s) => sum + s.stockBaldes, 0);

  const ingredientesBaixos = ingredientes.filter((i) => calcularStatusIngrediente(i) !== 'ok');
  const ingredientesEsgotados = ingredientes.filter((i) => i.stock <= 0);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-gray-800 mb-6">Inventario</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Sabores activos" value={disponiveis} color="#4CAF50" icon={<CheckCircle size={20} />} />
        <StatCard label="Baldes totales" value={Math.round(totalBaldes * 10) / 10} color="#2196F3" icon={<Package size={20} />} />
        <StatCard label="Ingredientes OK" value={ingredientes.filter((i) => calcularStatusIngrediente(i) === 'ok').length} color="#4CAF50" icon={<FlaskConical size={20} />} />
        <StatCard label="Alertas" value={alertas.length} color={alertas.length > 0 ? '#F44336' : '#4CAF50'} icon={<AlertTriangle size={20} />} />
      </div>

      {/* Tabs */}
      <div className="flex bg-white rounded-xl p-1 mb-6 shadow-sm border border-gray-100">
        {(['sabores', 'ingredientes'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t ? 'bg-[#FF6B9D] text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {t === 'sabores' ? 'Sabores' : 'Ingredientes'}
          </button>
        ))}
      </div>

      {tab === 'sabores' && (
        <SaboresTab
          sabores={sabores}
          lowStockSabores={lowStockSabores}
          baldeInput={baldeInput}
          setBaldeInput={setBaldeInput}
        />
      )}

      {tab === 'ingredientes' && (
        <IngredientesTab ingredientes={ingredientes} ingredientesBaixos={ingredientesBaixos} ingredientesEsgotados={ingredientesEsgotados} />
      )}
    </div>
  );
}

function SaboresTab({ sabores, lowStockSabores, baldeInput, setBaldeInput }: {
  sabores: Sabor[];
  lowStockSabores: Sabor[];
  baldeInput: number;
  setBaldeInput: (v: number) => void;
}) {
  return (
    <div>
      {/* Simulador */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-500">Simulador: Baldes de 5L en stock</span>
          <span className="font-mono text-3xl font-bold text-[#FF6B9D]">{baldeInput.toFixed(1)}</span>
        </div>
        <input
          type="range"
          min="0"
          max="20"
          step="0.5"
          value={baldeInput}
          onChange={(e) => setBaldeInput(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[#FF6B9D]"
        />
        <p className="text-sm text-gray-400 mt-2">≈ {Math.floor((baldeInput * 5000) / 500)} porciones de 500ml</p>
      </div>

      {/* Alerta Fase 7 — Stock crítico + agotados */}
      {(lowStockSabores.length > 0 || sabores.filter((s) => s.stockBaldes <= 0).length > 0) && (
        <div className={`rounded-2xl p-4 mb-4 border ${
          sabores.filter((s) => s.stockBaldes <= 0).length > 0
            ? 'bg-red-50 border-red-200'
            : 'bg-amber-50 border-amber-200'
        }`}>
          <p className={`font-semibold flex items-center gap-2 ${
            sabores.filter((s) => s.stockBaldes <= 0).length > 0 ? 'text-red-700' : 'text-amber-700'
          }`}>
            <AlertTriangle size={16} />
            {sabores.filter((s) => s.stockBaldes <= 0).length > 0
              ? 'Alerta: sabores agotados'
              : 'Alerta de stock bajo'}
          </p>
          <p className={`text-sm ${
            sabores.filter((s) => s.stockBaldes <= 0).length > 0 ? 'text-red-500' : 'text-amber-600'
          }`}>
            {sabores.filter((s) => s.stockBaldes <= 0).length > 0
              ? `${sabores.filter((s) => s.stockBaldes <= 0).length} sabor(es) agotado(s) — desactivado(s) automáticamente`
              : `${lowStockSabores.length} sabores necesitan reposición.`}
          </p>
        </div>
      )}

      {/* Tabla */}
      <h2 className="font-display text-xl font-bold text-gray-800 mb-4">Stock por sabor</h2>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Sabor</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Baldes</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Stock</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Disponible</th>
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

function IngredientesTab({ ingredientes, ingredientesBaixos, ingredientesEsgotados }: {
  ingredientes: Ingrediente[];
  ingredientesBaixos: Ingrediente[];
  ingredientesEsgotados: Ingrediente[];
}) {
  const { atualizarIngredienteStock } = useStore();
  const [adjust, setAdjust] = useState<Record<string, string>>({});

  return (
    <div>
      {/* Alertas de ingredientes */}
      {(ingredientesBaixos.length > 0 || ingredientesEsgotados.length > 0) && (
        <div className={`rounded-2xl p-4 mb-6 border ${
          ingredientesEsgotados.length > 0 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
        }`}>
          <p className={`font-semibold flex items-center gap-2 ${
            ingredientesEsgotados.length > 0 ? 'text-red-700' : 'text-amber-700'
          }`}>
            <AlertTriangle size={16} />
            {ingredientesEsgotados.length > 0
              ? 'Alerta: ingredientes agotados'
              : 'Alerta de ingredientes bajos'}
          </p>
          <p className={`text-sm ${ingredientesEsgotados.length > 0 ? 'text-red-500' : 'text-amber-600'}`}>
            {ingredientesEsgotados.length > 0
              ? `${ingredientesEsgotados.length} ingrediente(s) agotado(s) — productos afectados pueden no estar disponibles`
              : `${ingredientesBaixos.length} ingrediente(s) necesitan reposición.`}
          </p>
        </div>
      )}

      {/* Tabela de ingredientes */}
      <h2 className="font-display text-xl font-bold text-gray-800 mb-4">Stock por ingrediente</h2>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Ingrediente</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Stock</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Estado</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ingredientes.map((ing) => {
                const status = calcularStatusIngrediente(ing);
                return (
                  <tr key={ing.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-gray-800">{ing.nome.es}</p>
                        <p className="text-xs text-gray-400">{ing.unidade}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`font-mono font-bold ${status === 'critico' ? 'text-red-500' : status === 'aviso' ? 'text-amber-600' : 'text-gray-700'}`}>
                        {formatarQuantidade(ing.stock, ing.unidade)}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">(alerta: {formatarQuantidade(ing.alertaStock, ing.unidade)})</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                        status === 'critico' ? 'bg-red-100 text-red-600' : status === 'aviso' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status === 'critico' ? 'bg-red-500' : status === 'aviso' ? 'bg-amber-500' : 'bg-green-500'}`} />
                        {status === 'critico' ? 'Agotado' : status === 'aviso' ? 'Bajo' : 'OK'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step={ing.unidade === 'un' ? 1 : 100}
                          placeholder="+/-"
                          value={adjust[ing.id] || ''}
                          onChange={(e) => setAdjust({ ...adjust, [ing.id]: e.target.value })}
                          className="w-20 h-8 px-2 rounded-lg border border-gray-200 text-sm text-center"
                        />
                        <button
                          onClick={() => {
                            const delta = Number.parseFloat(adjust[ing.id] || '0');
                            if (!Number.isNaN(delta)) {
                              atualizarIngredienteStock(ing.id, delta);
                              setAdjust({ ...adjust, [ing.id]: '' });
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
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FlavorRow({ sabor }: { sabor: Sabor }) {
  const hydrateRemoteState = useStore((state) => state.hydrateRemoteState);
  const auto86Enabled = useStore((state) => state.auto86Enabled);
  const [adjust, setAdjust] = useState('');
  const [saving, setSaving] = useState(false);
  const isLow = estaEmStockBaixo(sabor);
  const isAgotado = !sabor.disponivel;
  const copos500 = Math.floor((sabor.stockBaldes * 5000) / 500);

  async function handleAdjust() {
    const delta = Number.parseFloat(adjust);
    if (Number.isNaN(delta)) return;
    setSaving(true);
    try {
      const response = await updateRemoteFlavorStock(sabor.id, delta);
      let snapshot = response.snapshot;

      // Fase 7 — Auto-86
      if (auto86Enabled) {
        const saborAtualizado = snapshot.sabores.find((s) => s.id === sabor.id);
        if (saborAtualizado) {
          if (deveDesativarAuto(saborAtualizado)) {
            saborAtualizado.disponivel = false;
            tocarNotificacaoSuave();
          } else if (deveReativarAuto(saborAtualizado)) {
            saborAtualizado.disponivel = true;
          }
          snapshot = { ...snapshot, sabores: snapshot.sabores.map((s) => (s.id === sabor.id ? saborAtualizado : s)) };
        }
      }

      hydrateRemoteState(snapshot);
      setAdjust('');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleDisponivel() {
    setSaving(true);
    try {
      // Simula update local — em produção seria via Supabase
      const { sabores: currentSabores } = useStore.getState();
      const updated = currentSabores.map((s) =>
        s.id === sabor.id ? { ...s, disponivel: !s.disponivel } : s
      );
      const snapshot = {
        ...useStore.getState(),
        sabores: updated,
        updatedAt: new Date().toISOString(),
      };
      hydrateRemoteState(snapshot as unknown as import('@tpv/shared/types').DemoStateSnapshot);
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
        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${isAgotado ? 'bg-gray-100 text-gray-500' : isLow ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isAgotado ? 'bg-gray-400' : isLow ? 'bg-red-500' : 'bg-green-500'}`} />
          {isAgotado ? 'Agotado' : isLow ? 'Crítico' : 'OK'}
        </span>
      </td>
      <td className="px-5 py-4">
        <button
          onClick={handleToggleDisponivel}
          disabled={saving}
          className={`relative w-12 h-7 rounded-full transition-all disabled:opacity-60 ${sabor.disponivel ? 'bg-[#4ECDC4]' : 'bg-gray-300'}`}
        >
          <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${sabor.disponivel ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
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
            onClick={handleAdjust}
            disabled={saving}
            className="h-8 px-3 rounded-lg bg-[#FF6B9D] text-white text-xs font-bold hover:bg-[#FF5A8F] transition-colors disabled:opacity-60"
          >
            {saving ? '...' : 'Ajustar'}
          </button>
        </div>
      </td>
    </tr>
  );
}
