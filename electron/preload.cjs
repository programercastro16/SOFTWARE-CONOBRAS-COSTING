const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  getQuotes: () => ipcRenderer.invoke('quotes:getAll'),
  saveQuote: (quote) => ipcRenderer.invoke('quotes:save', quote),
  deleteQuote: (id) => ipcRenderer.invoke('quotes:delete', id),
  getMaterials: () => ipcRenderer.invoke('materials:getAll'),
  saveMaterial: (material) => ipcRenderer.invoke('materials:save', material),
  deleteMaterial: (id) => ipcRenderer.invoke('materials:delete', id),
  getConfig: () => ipcRenderer.invoke('config:get'),
  saveConfig: (config) => ipcRenderer.invoke('config:save', config),
  exportPdf: (htmlContent) => ipcRenderer.invoke('pdf:export', htmlContent)
});
