import React, { useState, useEffect } from 'react';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { QuoteBuilder } from './components/quote/QuoteBuilder';
import { MaterialsCatalog } from './components/materials/MaterialsCatalog';
import { QuoteHistory } from './components/history/QuoteHistory';
import { SettingsView } from './components/settings/SettingsView';
import { ProposalPdfModal } from './components/quote/ProposalPdfModal';
import { Cotizacion, Insumo, ConfiguracionEmpresa } from './types';
import { storageService } from './services/storageService';
import { SAMPLE_COTIZACION, DEFAULT_CONFIG } from './data/seedData';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('cotizador');
  const [quotes, setQuotes] = useState<Cotizacion[]>([]);
  const [materials, setMaterials] = useState<Insumo[]>([]);
  const [config, setConfig] = useState<ConfiguracionEmpresa>(DEFAULT_CONFIG);
  
  // Cotización en edición activa
  const [currentQuote, setCurrentQuote] = useState<Cotizacion>(SAMPLE_COTIZACION);
  
  // Cotización para vista previa en modal PDF
  const [previewQuote, setPreviewQuote] = useState<Cotizacion | null>(null);

  const loadData = async () => {
    const [loadedQuotes, loadedMaterials, loadedConfig] = await Promise.all([
      storageService.getQuotes(),
      storageService.getMaterials(),
      storageService.getConfig()
    ]);
    setQuotes(loadedQuotes);
    setMaterials(loadedMaterials);
    setConfig(loadedConfig);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleNewQuote = () => {
    const newQuote: Cotizacion = {
      id: `cot-${Date.now()}`,
      codigo: `CNB-${new Date().getFullYear()}-${String(quotes.length + 1).padStart(3, '0')}`,
      cliente: '',
      telefono: '',
      email: '',
      proyecto: '',
      ubicacion: '',
      fecha: new Date().toISOString().split('T')[0],
      validezDias: 15,
      moneda: config.monedaSimbolo || '$',
      porcentajeImprevistos: config.porcentajeImprevistosDefault || 5,
      porcentajeGastosGenerales: config.porcentajeGastosGeneralesDefault || 8,
      porcentajeHonorarios: config.porcentajeHonorariosDefault || 15,
      aplicaIva: false,
      porcentajeIva: config.porcentajeIvaDefault || 16,
      partidas: [
        {
          id: `partida-1`,
          titulo: '1. PRELIMINARES Y TERRACERÍAS',
          items: [
            {
              id: `item-${Date.now()}`,
              descripcion: '',
              categoria: 'MANO_DE_OBRA',
              unidad: 'm2',
              cantidad: 1,
              precioUnitario: 0
            }
          ]
        }
      ],
      notas: '1. Propuesta válida durante 15 días continuos.\n2. Incluye mano de obra especializada y acarreos.',
      estado: 'BORRADOR',
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString()
    };
    setCurrentQuote(newQuote);
    setActiveTab('cotizador');
  };

  const handleSelectQuoteFromHistory = (quote: Cotizacion) => {
    setCurrentQuote(quote);
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
    <div className="flex h-screen w-screen bg-[#0A0D12] text-[#F3F5F8] overflow-hidden">
      {/* BARRA LATERAL CON BRANDING CONOBRAS */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        quotesCount={quotes.length}
        materialsCount={materials.length}
      />

      {/* ÁREA DE CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header 
          onNewQuote={handleNewQuote}
          onOpenCatalog={() => setActiveTab('materiales')}
        />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#0A0D12]">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'cotizador' && (
              <QuoteBuilder
                currentQuote={currentQuote}
                config={config}
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
        </main>
      </div>

      {/* MODAL DE VISTA PREVIA Y EXPORTACIÓN PDF */}
      {previewQuote && (
        <ProposalPdfModal
          quote={previewQuote}
          config={config}
          onClose={() => setPreviewQuote(null)}
        />
      )}
    </div>
  );
};

export default App;
