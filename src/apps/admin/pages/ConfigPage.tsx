import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../../shared/stores/useStore';
import { broadcast } from '../../../shared/utils/broadcast';

export default function ConfigPage() {
  const { sabores, toggleSaborDisponivel } = useStore();
  const [saved, setSaved] = useState(false);

  const handleToggleDisponivel = (id: string) => {
    toggleSaborDisponivel(id);
    const sabor = sabores.find((s) => s.id === id);
    if (sabor) {
      broadcast.atualizarEstoque(id, sabor.stockBaldes);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-gray-800 mb-6">Configuración</h1>

      {/* Save notification */}
      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="bg-green-100 text-green-700 rounded-xl px-4 py-3 mb-4 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Cambios guardados
        </motion.div>
      )}

      {/* Establishment info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-sm mb-6"
      >
        <h3 className="font-display font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#FF6B9D]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Información del establecimiento
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Nombre</label>
            <input
              type="text"
              defaultValue="Heladería Sabadell Nord"
              className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-[#FF6B9D] outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">NIF</label>
            <input
              type="text"
              defaultValue="B-12345678"
              className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-[#FF6B9D] outline-none text-sm font-mono"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-500 mb-1">Dirección</label>
            <input
              type="text"
              defaultValue="Carrer de la Concepció, 23, 08201 Sabadell, Barcelona"
              className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-[#FF6B9D] outline-none text-sm"
            />
          </div>
        </div>
      </motion.div>

      {/* Flavor availability */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-6 shadow-sm mb-6"
      >
        <h3 className="font-display font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#4ECDC4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Disponibilidad de sabores
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sabores.map((sabor) => (
            <div
              key={sabor.id}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                sabor.disponivel ? 'border-gray-100 bg-white' : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="w-10 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: sabor.corHex }} />
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm truncate ${sabor.disponivel ? 'text-gray-800' : 'text-gray-400 line-through'}`}>
                  {sabor.nome.es}
                </p>
                <p className="text-xs text-gray-400">{sabor.stockBaldes.toFixed(1)} baldes</p>
              </div>
              <button
                onClick={() => handleToggleDisponivel(sabor.id)}
                className={`relative w-12 h-7 rounded-full transition-all ${
                  sabor.disponivel ? 'bg-[#4ECDC4]' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                    sabor.disponivel ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Prices */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 shadow-sm mb-6"
      >
        <h3 className="font-display font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#FFD700]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Precios base
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Copo 300ml', price: 3.50, color: '#4ECDC4' },
            { name: 'Copo 500ml', price: 4.80, color: '#FF6B9D' },
            { name: 'Cono', price: 3.20, color: '#D2691E' },
            { name: 'Tarrina 1L', price: 12.00, color: '#98D8C8' },
          ].map((item) => (
            <div key={item.name} className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">{item.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-gray-400">€</span>
                <input
                  type="number"
                  defaultValue={item.price.toFixed(2)}
                  step="0.1"
                  className="w-full bg-transparent font-mono font-bold text-xl outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Hours */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-6 shadow-sm"
      >
        <h3 className="font-display font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#2196F3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Horario
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
            <span className="text-2xl">☀️</span>
            <div>
              <p className="text-sm font-medium text-gray-700">Verano (Jun-Sep)</p>
              <p className="text-sm text-gray-400">16:00 - 23:00</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
            <span className="text-2xl">❄️</span>
            <div>
              <p className="text-sm font-medium text-gray-700">Invierno (Oct-May)</p>
              <p className="text-sm text-gray-400">17:00 - 22:00</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
