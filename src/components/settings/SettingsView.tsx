import React, { useState } from 'react';
import { Settings, Save, Building2, User, Percent, DollarSign, Check, Phone, Mail, Globe } from 'lucide-react';
import { ConfiguracionEmpresa } from '../../types';
import { storageService } from '../../services/storageService';

interface SettingsViewProps {
  config: ConfiguracionEmpresa;
  onRefresh: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ config, onRefresh }) => {
  const [formData, setFormData] = useState<ConfiguracionEmpresa>(config);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await storageService.saveConfig(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
    onRefresh();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between p-5 rounded-xl bg-[#12161F] border border-[#252D3D]">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="text-[#D4AF37]" size={20} />
            <h2 className="text-lg font-bold text-white tracking-wide uppercase">
              Configuración de Estudio & Marca
            </h2>
          </div>
          <p className="text-xs text-[#8A94A6] mt-0.5">
            Personaliza los datos institucionales de Conobras, información del arquitecto y porcentajes base
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#48BB78]/15 border border-[#48BB78]/30 text-[#48BB78] text-xs font-medium animate-in fade-in">
            <Check size={14} />
            <span>Configuración guardada en SQLite</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* IDENTIDAD CORPORATIVA */}
        <div className="p-6 rounded-xl bg-[#12161F] border border-[#252D3D] space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#D4AF37] border-b border-[#252D3D] pb-3">
            <Building2 size={16} />
            <span>Datos Institucionales (Conobras)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] text-[#8A94A6] block mb-1">Nombre Comercial</label>
              <input
                type="text"
                value={formData.nombreEmpresa}
                onChange={(e) => setFormData({ ...formData, nombreEmpresa: e.target.value })}
                className="w-full bg-[#1A202C] border border-[#252D3D] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                required
              />
            </div>
            <div>
              <label className="text-[11px] text-[#8A94A6] block mb-1">Eslogan Institucional</label>
              <input
                type="text"
                value={formData.eslogan}
                onChange={(e) => setFormData({ ...formData, eslogan: e.target.value })}
                className="w-full bg-[#1A202C] border border-[#252D3D] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="text-[11px] text-[#8A94A6] block mb-1">Dirección de Oficina / Estudio</label>
              <input
                type="text"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                className="w-full bg-[#1A202C] border border-[#252D3D] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="text-[11px] text-[#8A94A6] block mb-1">Sitio Web / Portfolio</label>
              <input
                type="text"
                value={formData.sitioWeb || ''}
                onChange={(e) => setFormData({ ...formData, sitioWeb: e.target.value })}
                className="w-full bg-[#1A202C] border border-[#252D3D] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>
        </div>

        {/* DATOS DEL ARQUITECTO TITULAR */}
        <div className="p-6 rounded-xl bg-[#12161F] border border-[#252D3D] space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#D4AF37] border-b border-[#252D3D] pb-3">
            <User size={16} />
            <span>Perfil Profesional del Arquitecto</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] text-[#8A94A6] block mb-1">Arquitecto Titular</label>
              <input
                type="text"
                value={formData.arquitecto}
                onChange={(e) => setFormData({ ...formData, arquitecto: e.target.value })}
                className="w-full bg-[#1A202C] border border-[#252D3D] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                required
              />
            </div>
            <div>
              <label className="text-[11px] text-[#8A94A6] block mb-1">Cédula / Licencia Profesional</label>
              <input
                type="text"
                value={formData.cedulaProfesional || ''}
                onChange={(e) => setFormData({ ...formData, cedulaProfesional: e.target.value })}
                className="w-full bg-[#1A202C] border border-[#252D3D] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="text-[11px] text-[#8A94A6] block mb-1">Teléfono Directo / WhatsApp</label>
              <input
                type="text"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="w-full bg-[#1A202C] border border-[#252D3D] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                required
              />
            </div>
          </div>
        </div>

        {/* PARÁMETROS FINANCIEROS PREDETERMINADOS */}
        <div className="p-6 rounded-xl bg-[#12161F] border border-[#252D3D] space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#D4AF37] border-b border-[#252D3D] pb-3">
            <Percent size={16} />
            <span>Porcentajes Predeterminados para Nuevas Cotizaciones</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-[11px] text-[#8A94A6] block mb-1">Imprevistos (%)</label>
              <input
                type="number"
                step="0.5"
                value={formData.porcentajeImprevistosDefault}
                onChange={(e) => setFormData({ ...formData, porcentajeImprevistosDefault: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#1A202C] border border-[#252D3D] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="text-[11px] text-[#8A94A6] block mb-1">Gastos Generales (%)</label>
              <input
                type="number"
                step="0.5"
                value={formData.porcentajeGastosGeneralesDefault}
                onChange={(e) => setFormData({ ...formData, porcentajeGastosGeneralesDefault: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#1A202C] border border-[#252D3D] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="text-[11px] text-[#8A94A6] block mb-1">Honorarios / Utilidad (%)</label>
              <input
                type="number"
                step="0.5"
                value={formData.porcentajeHonorariosDefault}
                onChange={(e) => setFormData({ ...formData, porcentajeHonorariosDefault: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#1A202C] border border-[#D4AF37]/50 rounded-lg px-3 py-2 text-xs font-mono text-[#D4AF37] font-bold focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="text-[11px] text-[#8A94A6] block mb-1">Tasa IVA Base (%)</label>
              <input
                type="number"
                step="0.5"
                value={formData.porcentajeIvaDefault}
                onChange={(e) => setFormData({ ...formData, porcentajeIvaDefault: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#1A202C] border border-[#252D3D] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>
        </div>

        {/* BOTÓN GUARDAR */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#AA8820] hover:from-[#E6C65A] hover:to-[#D4AF37] text-black font-semibold text-xs shadow-lg shadow-[#D4AF37]/20 active:scale-95 transition-all"
          >
            <Save size={16} />
            <span>Guardar Parámetros en SQLite</span>
          </button>
        </div>
      </form>
    </div>
  );
};
