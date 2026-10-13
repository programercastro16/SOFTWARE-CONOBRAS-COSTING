import React, { useState, useEffect } from 'react';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { NavigationTabs } from './components/layout/NavigationTabs';
import { QuoteBuilder } from './components/quote/QuoteBuilder';
import { MaterialsCatalog } from './components/materials/MaterialsCatalog';
import { QuoteHistory } from './components/history/QuoteHistory';
import { SettingsView } from './components/settings/SettingsView';
import { ProposalPdfModal } from './components/quote/ProposalPdfModal';
import { AmbientBackground3D } from './components/common/AmbientBackground3D';
import { Cotizacion, Insumo, ConfiguracionEmpresa } from './types';
import { storageService } from './services/storageService';
import { DEFAULT_CONFIG } from './data/seedData';

// Generador de cotización completamente vacía (sin datos prellenados)
const createEmptyQuote = (cfg?: ConfiguracionEmpresa, count = 0): Cotizacion => {
  const year = new Date().getFullYear();
  return {
    id: `cot-${Date.now()}`,
    codigo: `CNB-${year}-${String(count + 1).padStart(3, '0')}`,
    cliente: '',
    telefono: '',
    email: '',
    proyecto: '',
    ubicacion: '',
    fecha: new Date().toISOString().split('T')[0],
    validezDias: 15,
    moneda: cfg?.monedaSimbolo || '$',
    porcentajeImprevistos: cfg?.porcentajeImprevistosDefault ?? 5,
    porcentajeGastosGenerales: cfg?.porcentajeGastosGeneralesDefault ?? 8,
    porcentajeHonorarios: cfg?.porcentajeHonorariosDefault ?? 15,
    aplicaIva: false,
    porcentajeIva: cfg?.porcentajeIvaDefault ?? 16,
    partidas: [],
    notas: '',
    estado: 'BORRADOR',
    creadoEn: new Date().toISOString(),
    actualizadoEn: new Date().toISOString()
  };
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[Conobras ErrorBoundary]:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 m-6 rounded-2xl bg-[#12161F] border border-amber-500/30 text-center shadow-2xl">
          <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider mb-2">
            Aviso de Renderizado
          </h3>
          <p className="text-xs text-[#8A94A6] mb-4 max-w-md">
            {this.state.error?.message || 'Se produjo un error al desplegar este módulo.'}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#AA8820] text-black font-semibold text-xs transition-all active:scale-95 cursor-pointer"
          >
            Reintentar y Recargar Módulo
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('cotizador');
  const [quotes, setQuotes] = useState<Cotizacion[]>([]);
  const [materials, setMaterials] = useState<Insumo[]>([]);
  const [config, setConfig] = useState<ConfiguracionEmpresa>(DEFAULT_CONFIG);
  
  // Cotización en edición activa
  const [currentQuote, setCurrentQuote] = useState<Cotizacion>(() => createEmptyQuote(DEFAULT_CONFIG, 0));
  
  // Cotización para vista previa en modal PDF
  const [previewQuote, setPreviewQuote] = useState<Cotizacion | null>(null);

  const loadData = async () => {
    const [loadedQuotes, loadedMaterials, loadedConfig] = await Promise.all([
      storageService.getQuotes(),
      storageService.getMaterials(),
      storageService.getConfig()
    ]);
    setQuotes(loadedQuotes || []);
    setMaterials(loadedMaterials || []);
    setConfig(loadedConfig || DEFAULT_CONFIG);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleNewQuote = () => {
    const newQuote = createEmptyQuote(config || DEFAULT_CONFIG, quotes.length);
    setCurrentQuote(newQuote);
    setActiveTab('cotizador');
  };

  const handleSelectQuoteFromHistory = (quote: Cotizacion) => {
    // Deep-clone limpio con timestamp actualizado para forzar re-render completo
    const freshQuote: Cotizacion = JSON.parse(JSON.stringify(quote));
    freshQuote.actualizadoEn = new Date().toISOString();
    setCurrentQuote(freshQuote);
    setActiveTab('cotizador');
  };

  const handleInsertMaterialIntoActiveQuote = (insumo: Insumo) => {
    const updatedPartidas = [...currentQuote.partidas];
    if (updatedPartidas.length === 0) {
      updatedPartidas.push({
        id: `partida-1`,
        titulo: '1. PARTIDA GENERAL',
        items: []
      });
    }

    const lastPartida = updatedPartidas[updatedPartidas.length - 1];
    lastPartida.items.push({
      id: `item-${Date.now()}`,
      insumoId: insumo.id,
      descripcion: insumo.descripcion,
      categoria: insumo.categoria,
      unidad: insumo.unidad,
      cantidad: 1,
      precioUnitario: insumo.precioUnitario
    });

    setCurrentQuote({ ...currentQuote, partidas: updatedPartidas });
    setActiveTab('cotizador');
  };

  return (
    <div className="relative flex h-screen w-screen bg-[#0A0D12] text-[#F3F5F8] overflow-hidden select-none">
      {/* FONDO DINÁMICO 3D CON PARTÍCULAS Y OBJETOS VOLANDO EN EL ESPACIO */}
      <AmbientBackground3D />

      {/* BARRA LATERAL CON BRANDING CONOBRAS */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        quotesCount={quotes.length}
        materialsCount={materials.length}
      />

      {/* ÁREA DE CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col h-full overflow-hidden z-10 relative">
        <Header 
          onNewQuote={handleNewQuote}
          onOpenCatalog={() => setActiveTab('materiales')}
        />

        {/* NAVEGACIÓN TABS SUPERIOR */}
        <div className="px-6 lg:px-8 bg-[#0A0D12]/60 backdrop-blur-sm">
          <NavigationTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            quotesCount={quotes.length}
            materialsCount={materials.length}
            currentQuoteCode={currentQuote?.codigo}
          />
        </div>

        {/* CONTENEDOR DESPLAZABLE CON TRANSICIÓN DINÁMICA */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-transparent">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* VISTAS MODULARES CON ANIMACIONES DE ENTRADA SUAVES */}
            <div key={activeTab} className="animate-fade-in-up">
              {activeTab === 'cotizador' && (
                <QuoteBuilder
                  key={`${currentQuote?.id}-${currentQuote?.actualizadoEn || '0'}`}
                  currentQuote={currentQuote}
                  config={config || DEFAULT_CONFIG}
                  materials={materials}
                  onQuoteSaved={loadData}
                  onOpenPdf={(q) => setPreviewQuote(q)}
                  onUpdateCurrentQuote={(q) => setCurrentQuote(q)}
                />
              )}

              {activeTab === 'materiales' && (
                <MaterialsCatalog 
                  materials={materials}
                  onRefresh={loadData}
                  onSelectItemForQuote={handleInsertMaterialIntoActiveQuote}
                />
              )}

              {activeTab === 'historial' && (
                <QuoteHistory 
                  quotes={quotes}
                  onSelectQuote={handleSelectQuoteFromHistory}
                  onPreviewPdf={(q) => setPreviewQuote(q)}
                  onRefresh={loadData}
                />
              )}

              {activeTab === 'configuracion' && (
                <SettingsView 
                  config={config}
                  onRefresh={loadData}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      {/* MODAL DE VISTA PREVIA Y EXPORTACIÓN PDF */}
      {previewQuote && (
        <ErrorBoundary>
          <ProposalPdfModal
            quote={previewQuote}
            config={config || DEFAULT_CONFIG}
            onClose={() => setPreviewQuote(null)}
          />
        </ErrorBoundary>
      )}
    </div>
  );
};

export default App;
