import { useState } from 'react';
import { useStore } from '@tpv/shared/stores/useStore';
import { t, getLocaleName } from '@tpv/shared/i18n';
import AlergenoSelector from '@tpv/shared/components/AlergenoSelector';
import { clearAllUsers } from '@tpv/shared/lib/authMock';
import type { Locale, PerfilUsuario } from '@tpv/shared/types';
import { LogOut, Trash2 } from 'lucide-react';

export default function ConfigPage() {
  const { locale, setLocale, perfilUsuario, setPerfilUsuario } = useStore();
  const [saved, setSaved] = useState(false);
  const [nome, setNome] = useState(perfilUsuario?.nome || '');
  const [email, setEmail] = useState(perfilUsuario?.email || '');
  const [telefone, setTelefone] = useState(perfilUsuario?.telefone || '');
  const [alergias, setAlergias] = useState(perfilUsuario?.alergias || []);

  const { logout } = useStore();

  const handleSave = () => {
    const perfil: PerfilUsuario = {
      id: perfilUsuario?.id || crypto.randomUUID(),
      nome: nome || 'Cliente',
      email: email || '',
      telefone: telefone || '',
      temAlergias: alergias.length > 0,
      alergias,
      criadoEm: perfilUsuario?.criadoEm || new Date().toISOString(),
    };
    setPerfilUsuario(perfil);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  const handleDeleteAll = () => {
    if (typeof window !== 'undefined' && window.confirm(t('deleteAllConfirm', locale))) {
      clearAllUsers();
      logout();
      window.location.reload();
    }
  };

  const locales: Locale[] = ['es', 'ca', 'pt', 'en'];

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4 pb-24">
      <h2 className="font-display font-bold text-2xl">{t('settings', locale)}</h2>

      {/* Language */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/5">
        <h3 className="font-semibold text-gray-800 mb-3">{t('language', locale)}</h3>
        <div className="grid grid-cols-2 gap-2">
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => setLocale(loc)}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                locale === loc
                  ? 'bg-[#FF6B9D] text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {getLocaleName(loc)}
            </button>
          ))}
        </div>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/5 space-y-3">
        <h3 className="font-semibold text-gray-800">{t('profile', locale)}</h3>
        <div>
          <label className="text-xs text-gray-500 block mb-1">{t('name', locale)} <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full bg-gray-50 rounded-xl px-3 py-2 text-sm border border-black/5 focus:outline-none focus:ring-2 focus:ring-[#FF6B9D]/30"
            placeholder="Seu nome"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">{t('email', locale)} <span className="text-red-500">*</span></label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-50 rounded-xl px-3 py-2 text-sm border border-black/5 focus:outline-none focus:ring-2 focus:ring-[#FF6B9D]/30"
            placeholder="seu@email.com"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">{t('phone', locale)} <span className="text-red-500">*</span></label>
          <input
            type="tel"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className="w-full bg-gray-50 rounded-xl px-3 py-2 text-sm border border-black/5 focus:outline-none focus:ring-2 focus:ring-[#FF6B9D]/30"
            placeholder="+34 612 345 678"
          />
        </div>
      </div>

      {/* Allergens - OBRIGATÓRIO */}
      <AlergenoSelector
        locale={locale}
        selecionados={alergias}
        onChange={setAlergias}
        obrigatorio
      />

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={!nome || !email || !telefone}
        className={`w-full py-4 rounded-2xl font-bold text-white transition-all ${
          saved
            ? 'bg-emerald-500'
            : !nome || !email || !telefone
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-gradient-to-r from-[#FF6B9D] to-[#FFA07A] shadow-lg hover:shadow-xl'
        }`}
      >
        {saved ? '✓ Guardado' : t('save', locale)}
      </button>

      {/* Session actions */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/5 space-y-2">
        <h3 className="font-semibold text-gray-800 text-sm">{t('session', locale)}</h3>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-50 text-gray-700 font-medium text-sm hover:bg-gray-100 transition-colors"
        >
          <LogOut size={16} /> {t('logout', locale)}
        </button>
        <button
          onClick={handleDeleteAll}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 text-red-600 font-medium text-sm hover:bg-red-100 transition-colors"
        >
          <Trash2 size={16} /> {t('deleteAllData', locale)}
        </button>
      </div>
    </div>
  );
}
