import React, { useState, useRef, useEffect } from 'react';
import { 
  Layers, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Filter, 
  Check, 
  RotateCcw, 
  Tag, 
  Boxes,
  CheckCircle2
} from 'lucide-react';
import { Insumo, InsumoCategoria } from '../../types';
import { storageService } from '../../services/storageService';
import { SEED_INSUMOS } from '../../data/seedData';
import { InteractiveButton } from '../common/InteractiveButton';
import { ShimmerBadge } from '../common/AnimatedText';
import { AnimatedCounter } from '../common/AnimatedCounter';

// Input numérico que no bloquea la escritura de decimales ni el borrado
const NumericInput: React.FC<{
  value: number;
  onChange: (val: number) => void;
  className?: string;
  autoFocus?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}> = ({ value, onChange, className = '', autoFocus = false, onKeyDown }) => {
  const [text, setText] = useState<string>(value !== undefined && value !== null ? String(value) : '');
  const isFocused = useRef(false);

  useEffect(() => {
    if (!isFocused.current) {
      setText(value !== undefined && value !== null ? String(value) : '');
    }
  }, [value]);

  return (
    <input
      type="text"
      inputMode="decimal"
      value={text}
      autoFocus={autoFocus}
      onFocus={() => { isFocused.current = true; }}
      onKeyDown={onKeyDown}
      onChange={(e) => {
        const val = e.target.value;
        if (/^[0-9]*\.?[0-9]*$/.test(val) || val === '') {
          setText(val);
          const parsed = parseFloat(val);
          if (!isNaN(parsed)) onChange(parsed);
          else if (val === '') onChange(0);
        }
      }}
      onBlur={() => {
        isFocused.current = false;
        const parsed = parseFloat(text);
        if (isNaN(parsed) || text.trim() === '') {
          setText('0');
          onChange(0);
        } else {
          setText(String(parsed));
          onChange(parsed);
        }
      }}
      className={className}
    />
  );
};

interface MaterialsCatalogProps {
  materials: Insumo[];
  onRefresh: () => void;
  onSelectItemForQuote?: (insumo: Insumo) => void;
}

export const MaterialsCatalog: React.FC<MaterialsCatalogProps> = ({ 
  materials, 
  onRefresh,
  onSelectItemForQuote 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
  const [editingItem, setEditingItem] = useState<Insumo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Edición rápida inline de precio
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [inlinePrice, setInlinePrice] = useState<number>(0);

  // Formulario nuevo/editar modal
  const [formData, setFormData] = useState<Partial<Insumo>>({
    codigo: '',
    descripcion: '',
    categoria: 'MATERIAL',
    unidad: 'm2',
    precioUnitario: 0
  });

  const categories = [
    { id: 'TODOS', label: 'Todos los Insumos' },
    { id: 'MATERIAL', label: 'Materiales' },
    { id: 'MANO_DE_OBRA', label: 'Mano de Obra' },
    { id: 'EQUIPO', label: 'Equipos / Maq.' },
    { id: 'SUBCONTRATO', label: 'Subcontratos' }
  ];

  const filteredMaterials = materials.filter(item => {
    const matchesSearch = item.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'TODOS' || item.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenNew = () => {
    setEditingItem(null);
    setFormData({
      id: `insumo-${Date.now()}`,
      codigo: `INS-${Math.floor(100 + Math.random() * 900)}`,
      descripcion: '',
      categoria: 'MATERIAL',
      unidad: 'm2',
      precioUnitario: 0,
      fechaActualizacion: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Insumo) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.descripcion || !formData.unidad) return;

    const insumoToSave: Insumo = {
      id: formData.id || `insumo-${Date.now()}`,
      codigo: formData.codigo || `INS-${Date.now().toString().slice(-4)}`,
      descripcion: formData.descripcion,
      categoria: (formData.categoria as InsumoCategoria) || 'MATERIAL',
      unidad: formData.unidad,
      precioUnitario: Number(formData.precioUnitario) || 0,
      fechaActualizacion: new Date().toISOString().split('T')[0]
    };

    await storageService.saveMaterial(insumoToSave);
    setIsModalOpen(false);
    onRefresh();
  };

  const handleStartInlineEdit = (item: Insumo) => {
    setInlineEditingId(item.id);
    setInlinePrice(item.precioUnitario);
  };

  const handleSaveInlineEdit = async (item: Insumo) => {
    const updated: Insumo = {
      ...item,
      precioUnitario: inlinePrice,
      fechaActualizacion: new Date().toISOString().split('T')[0]
    };
    await storageService.saveMaterial(updated);
    setInlineEditingId(null);
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Deseas eliminar este insumo del catálogo local?')) {
      await storageService.deleteMaterial(id);
      onRefresh();
    }
  };

  const handleResetCatalog = async () => {
    if (confirm('¿Restablecer el catálogo con los insumos predeterminados de Conobras?')) {
      for (const item of SEED_INSUMOS) {
        await storageService.saveMaterial(item);
      }
      onRefresh();
    }
  };

  const getCategoryBadge = (cat: InsumoCategoria) => {
    switch (cat) {
      case 'MATERIAL':
        return <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20">Material</span>;
      case 'MANO_DE_OBRA':
        return <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20">Mano de Obra</span>;
      case 'EQUIPO':
        return <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20">Equipo</span>;
      case 'SUBCONTRATO':
        return <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Subcontrato</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER DEL CATÁLOGO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#12161F] border border-[#252D3D] shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Boxes className="text-[#D4AF37]" size={22} />
            <h2 className="text-lg font-bold text-white tracking-wide uppercase">
              Catálogo de Materiales & Insumos
            </h2>
          </div>
          <p className="text-xs text-[#8A94A6] mt-0.5">
            Base de datos de precios unitarios Conobras. Haz clic sobre cualquier precio para editarlo en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ShimmerBadge variant="cyan" icon={<Layers size={13} />}>
            <span>{filteredMaterials.length} Insumos Activos</span>
          </ShimmerBadge>

          <InteractiveButton
            variant="glass"
            size="sm"
            onClick={handleResetCatalog}
            title="Cargar catálogo base recomendado"
            icon={<RotateCcw size={14} />}
          >
            Restablecer
          </InteractiveButton>

          <InteractiveButton
            variant="gold"
            size="sm"
            shimmer={true}
            glow={true}
            onClick={handleOpenNew}
            icon={<Plus size={15} />}
          >
            Nuevo Insumo
          </InteractiveButton>
        </div>
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-3 text-[#8A94A6]" />
          <input
            type="text"
            placeholder="Buscar por descripción (ej. cemento, varilla, cuadrilla, andamio) o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#12161F] border border-[#252D3D] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#8A94A6] focus:outline-none focus:border-[#D4AF37] transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-2 rounded-xl text-xs whitespace-nowrap transition-colors border ${
                selectedCategory === cat.id
                  ? 'bg-[#1A202C] text-[#D4AF37] border-[#D4AF37]/40 font-semibold'
                  : 'bg-[#12161F] text-[#8A94A6] border-[#252D3D] hover:text-white hover:bg-[#1A202C]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* TABLA DE INSUMOS */}
      <div className="rounded-xl bg-[#12161F] border border-[#252D3D] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#161C27] text-[#8A94A6] uppercase tracking-wider border-b border-[#252D3D]">
                <th className="py-3 px-4 w-28 font-mono">Código</th>
                <th className="py-3 px-4 font-semibold">Descripción del Insumo / Concepto</th>
                <th className="py-3 px-4 w-32">Categoría</th>
                <th className="py-3 px-4 w-24 text-center font-mono">Unidad</th>
                <th className="py-3 px-4 w-40 text-right font-mono">Precio Unitario</th>
                <th className="py-3 px-4 w-28 text-center text-[10px]">Actualizado</th>
                <th className="py-3 px-4 w-36 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252D3D]/50">
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#8A94A6]">
                    No se encontraron insumos con los filtros actuales.
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((item) => {
                  const isInlineEditing = inlineEditingId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-[#1A202C]/60 transition-colors group">
                      <td className="py-3 px-4 font-mono text-[11px] text-[#8A94A6]">{item.codigo}</td>
                      <td className="py-3 px-4 font-medium text-white">
                        <div>{item.descripcion}</div>
                      </td>
                      <td className="py-3 px-4">{getCategoryBadge(item.categoria)}</td>
                      <td className="py-3 px-4 text-center font-mono text-[#8A94A6]">{item.unidad}</td>
                      <td className="py-3 px-4 text-right font-mono">
                        {isInlineEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-[#D4AF37] font-bold">$</span>
                            <NumericInput
                              value={inlinePrice}
                              autoFocus
                              onChange={(val) => setInlinePrice(val)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveInlineEdit(item);
                                if (e.key === 'Escape') setInlineEditingId(null);
                              }}
                              className="w-24 bg-[#1A202C] border border-[#D4AF37] rounded px-1.5 py-0.5 text-right font-mono text-[#D4AF37] font-bold text-xs focus:outline-none"
                            />
                            <button
                              onClick={() => handleSaveInlineEdit(item)}
                              className="p-1 bg-[#D4AF37] text-black rounded hover:bg-[#E6C65A]"
                              title="Guardar precio"
                            >
                              <Check size={12} />
                            </button>
                          </div>
                        ) : (
                          <span 
                            onClick={() => handleStartInlineEdit(item)}
                            title="Haz clic para editar precio rápidamente"
                            className="font-bold text-[#D4AF37] cursor-pointer hover:underline hover:text-[#E6C65A] py-1 px-1.5 rounded hover:bg-[#1A202C]"
                          >
                            $ {item.precioUnitario.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-[10px] text-[#8A94A6]">
                        {item.fechaActualizacion}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {onSelectItemForQuote && (
                            <button
                              onClick={() => onSelectItemForQuote(item)}
                              title="Insertar en Cotizador Activo"
                              className="p-1.5 text-[#D4AF37] hover:bg-[#D4AF37]/15 rounded transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="flex items-center gap-1 px-2 py-1 text-[#8A94A6] hover:text-white hover:bg-[#1A202C] border border-[#252D3D] rounded text-[11px] transition-colors"
                          >
                            <Edit2 size={12} />
                            <span>Editar</span>
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-[#8A94A6] hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                            title="Eliminar insumo"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL NUEVO / EDITAR INSUMO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12161F] border border-[#252D3D] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-[#252D3D] bg-[#161C27]">
              <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                <Tag size={16} className="text-[#D4AF37]" />
                <span>{editingItem ? 'Editar Insumo de Obra' : 'Nuevo Insumo de Catálogo'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#8A94A6] hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#8A94A6] block mb-1">Código</label>
                  <input
                    type="text"
                    value={formData.codigo || ''}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    className="w-full bg-[#1A202C] border border-[#252D3D] focus:border-[#D4AF37] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#8A94A6] block mb-1">Categoría</label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value as InsumoCategoria })}
                    className="w-full bg-[#1A202C] border border-[#252D3D] focus:border-[#D4AF37] rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="MATERIAL">Material</option>
                    <option value="MANO_DE_OBRA">Mano de Obra</option>
                    <option value="EQUIPO">Equipo / Maquinaria</option>
                    <option value="SUBCONTRATO">Subcontrato</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#8A94A6] block mb-1">Descripción del Concepto</label>
                <textarea
                  rows={3}
                  value={formData.descripcion || ''}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Ej. Varilla corrugada 1/2 grado 42 o Cuadrilla albañil..."
                  className="w-full bg-[#1A202C] border border-[#252D3D] focus:border-[#D4AF37] rounded-lg p-3 text-xs text-white focus:outline-none resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#8A94A6] block mb-1">Unidad de Medida</label>
                  <input
                    type="text"
                    value={formData.unidad || ''}
                    onChange={(e) => setFormData({ ...formData, unidad: e.target.value })}
                    placeholder="m2, ml, m3, kg, jor..."
                    className="w-full bg-[#1A202C] border border-[#252D3D] focus:border-[#D4AF37] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#8A94A6] block mb-1">Precio Unitario ($)</label>
                  <NumericInput
                    value={Number(formData.precioUnitario || 0)}
                    onChange={(val) => setFormData({ ...formData, precioUnitario: val })}
                    className="w-full bg-[#1A202C] border border-[#252D3D] focus:border-[#D4AF37] rounded-lg px-3 py-2 text-xs font-mono text-[#D4AF37] focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-[#252D3D]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs text-[#8A94A6] hover:bg-[#1A202C] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#AA8820] text-black font-semibold text-xs shadow-md shadow-[#D4AF37]/20 active:scale-95 transition-all"
                >
                  Guardar Insumo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
