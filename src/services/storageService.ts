import { Insumo, Cotizacion, Cliente, ConfiguracionEmpresa } from '../types';
import { SEED_INSUMOS, SAMPLE_COTIZACION, DEFAULT_CONFIG } from '../data/seedData';

// Declaración global para la API de Electron si existe
declare global {
  interface Window {
    electronAPI?: {
      isElectron: boolean;
      getQuotes: () => Promise<Cotizacion[]>;
      saveQuote: (quote: Cotizacion) => Promise<boolean>;
      deleteQuote: (id: string) => Promise<boolean>;
      getMaterials: () => Promise<Insumo[]>;
      saveMaterial: (material: Insumo) => Promise<boolean>;
      deleteMaterial: (id: string) => Promise<boolean>;
      getConfig: () => Promise<ConfiguracionEmpresa>;
      saveConfig: (config: ConfiguracionEmpresa) => Promise<boolean>;
      exportPdf: (data: any) => Promise<string>;
    };
  }
}

const STORAGE_KEYS = {
  QUOTES: 'conobras_quotes_v1',
  MATERIALS: 'conobras_materials_v1',
  CLIENTS: 'conobras_clients_v1',
  CONFIG: 'conobras_config_v1'
};

class StorageService {
  // --- COTIZACIONES ---
  async getQuotes(): Promise<Cotizacion[]> {
    if (window.electronAPI?.getQuotes) {
      try {
        const electronQuotes = await window.electronAPI.getQuotes();
        // Filtrar cualquier cotización muestra de desarrollo previa
        return (electronQuotes || []).filter(q => q.id !== 'cot-001');
      } catch (e) {
        console.warn('Fallback a local storage para cotizaciones:', e);
      }
    }
    const data = localStorage.getItem(STORAGE_KEYS.QUOTES);
    if (!data) {
      return [];
    }
    try {
      const parsed: Cotizacion[] = JSON.parse(data);
      const filtered = parsed.filter(q => q.id !== 'cot-001');
      if (filtered.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(filtered));
      }
      return filtered;
    } catch {
      return [];
    }
  }

  async saveQuote(quote: Cotizacion): Promise<void> {
    if (window.electronAPI?.saveQuote) {
      try {
        await window.electronAPI.saveQuote(quote);
      } catch (e) {
        console.warn('Fallback a local storage para guardar cotización:', e);
      }
    }
    const quotes = await this.getQuotes();
    const existingIndex = quotes.findIndex(q => q.id === quote.id);
    if (existingIndex >= 0) {
      quotes[existingIndex] = { ...quote, actualizadoEn: new Date().toISOString() };
    } else {
      quotes.unshift({ ...quote, creadoEn: new Date().toISOString(), actualizadoEn: new Date().toISOString() });
    }
    localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
  }

  async deleteQuote(id: string): Promise<void> {
    if (window.electronAPI?.deleteQuote) {
      try {
        await window.electronAPI.deleteQuote(id);
      } catch (e) {
        console.warn('Fallback a local storage para eliminar:', e);
      }
    }
    const quotes = await this.getQuotes();
    const filtered = quotes.filter(q => q.id !== id);
    localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(filtered));
  }

  // --- MATERIALES / INSUMOS ---
  async getMaterials(): Promise<Insumo[]> {
    if (window.electronAPI?.getMaterials) {
      try {
        return await window.electronAPI.getMaterials();
      } catch (e) {
        console.warn('Fallback a local storage para insumos:', e);
      }
    }
    const data = localStorage.getItem(STORAGE_KEYS.MATERIALS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(SEED_INSUMOS));
      return SEED_INSUMOS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return SEED_INSUMOS;
    }
  }

  async saveMaterial(material: Insumo): Promise<void> {
    if (window.electronAPI?.saveMaterial) {
      try {
        await window.electronAPI.saveMaterial(material);
      } catch (e) {
        console.warn('Fallback a local storage para insumos:', e);
      }
    }
    const materials = await this.getMaterials();
    const index = materials.findIndex(m => m.id === material.id);
    if (index >= 0) {
      materials[index] = { ...material, fechaActualizacion: new Date().toISOString().split('T')[0] };
    } else {
      materials.unshift({ ...material, fechaActualizacion: new Date().toISOString().split('T')[0] });
    }
    localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials));
  }

  async deleteMaterial(id: string): Promise<void> {
    if (window.electronAPI?.deleteMaterial) {
      try {
        await window.electronAPI.deleteMaterial(id);
      } catch (e) {
        console.warn('Fallback a local storage para eliminar insumo:', e);
      }
    }
    const materials = await this.getMaterials();
    const filtered = materials.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(filtered));
  }

  // --- CONFIGURACIÓN ---
  async getConfig(): Promise<ConfiguracionEmpresa> {
    if (window.electronAPI?.getConfig) {
      try {
        return await window.electronAPI.getConfig();
      } catch (e) {
        console.warn('Fallback a local storage para configuración:', e);
      }
    }
    const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
      return DEFAULT_CONFIG;
    }
    try {
      return JSON.parse(data);
    } catch {
      return DEFAULT_CONFIG;
    }
  }

  async saveConfig(config: ConfiguracionEmpresa): Promise<void> {
    if (window.electronAPI?.saveConfig) {
      try {
        await window.electronAPI.saveConfig(config);
      } catch (e) {
        console.warn('Fallback a local storage para configuración:', e);
      }
    }
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  }
}

export const storageService = new StorageService();
