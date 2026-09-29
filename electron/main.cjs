const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;
let db = null;

// Inicialización de base de datos local SQLite
function initDatabase() {
  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'conobras_data.db');
  console.log('[Conobras SQLite] Ruta de la base de datos:', dbPath);

  try {
    const { DatabaseSync } = require('node:sqlite');
    db = new DatabaseSync(dbPath);

    // Crear tablas SQLite si no existen
    db.exec(`
      CREATE TABLE IF NOT EXISTS configuracion (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        data TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS insumos (
        id TEXT PRIMARY KEY,
        codigo TEXT,
        descripcion TEXT NOT NULL,
        categoria TEXT NOT NULL,
        unidad TEXT NOT NULL,
        precioUnitario REAL NOT NULL,
        fechaActualizacion TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS cotizaciones (
        id TEXT PRIMARY KEY,
        codigo TEXT NOT NULL,
        cliente TEXT NOT NULL,
        data TEXT NOT NULL,
        creadoEn TEXT NOT NULL,
        actualizadoEn TEXT NOT NULL
      );
    `);
    console.log('[Conobras SQLite] Base de datos SQLite inicializada exitosamente.');
  } catch (err) {
    console.warn('[Conobras SQLite] Error al inicializar SQLite nativo. Usando fallback de persistencia JSON local:', err.message);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#0A0D12',
    icon: path.join(__dirname, '../assets/conobras-logo.png'),
    title: 'Conobras Quote - Presupuestos y Costos Arquitectónicos',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  mainWindow.setMenuBarVisibility(false);

  const distPath = path.join(__dirname, '../dist/index.html');
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else if (fs.existsSync(distPath)) {
    mainWindow.loadFile(distPath);
  } else {
    mainWindow.loadURL('http://localhost:5173');
  }
}

// Configurar Handlers de IPC para SQLite
function setupIpcHandlers() {
  const userDataPath = app.getPath('userData');
  const jsonDbPath = path.join(userDataPath, 'conobras_store.json');

  // Helper para lectura/escritura de fallback
  function getStore() {
    if (!fs.existsSync(jsonDbPath)) {
      return { quotes: [], materials: [], config: null };
    }
    try {
      return JSON.parse(fs.readFileSync(jsonDbPath, 'utf8'));
    } catch {
      return { quotes: [], materials: [], config: null };
    }
  }

  function saveStore(data) {
    fs.writeFileSync(jsonDbPath, JSON.stringify(data, null, 2), 'utf8');
  }

  // --- COTIZACIONES ---
  ipcMain.handle('quotes:getAll', async () => {
    if (db) {
      try {
        const rows = db.prepare('SELECT data FROM cotizaciones ORDER BY actualizadoEn DESC').all();
        return rows.map(r => JSON.parse(r.data));
      } catch (e) {
        console.error('Error al leer cotizaciones en SQLite:', e);
      }
    }
    return getStore().quotes || [];
  });

  ipcMain.handle('quotes:save', async (_, quote) => {
    if (db) {
      try {
        const stmt = db.prepare(`
          INSERT INTO cotizaciones (id, codigo, cliente, data, creadoEn, actualizadoEn)
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            codigo = excluded.codigo,
            cliente = excluded.cliente,
            data = excluded.data,
            actualizadoEn = excluded.actualizadoEn;
        `);
        const now = new Date().toISOString();
        stmt.run(quote.id, quote.codigo, quote.cliente, JSON.stringify(quote), quote.creadoEn || now, now);
        return true;
      } catch (e) {
        console.error('Error al guardar cotización en SQLite:', e);
      }
    }
    const store = getStore();
    const idx = store.quotes.findIndex(q => q.id === quote.id);
    if (idx >= 0) {
      store.quotes[idx] = quote;
    } else {
      store.quotes.unshift(quote);
    }
    saveStore(store);
    return true;
  });

  ipcMain.handle('quotes:delete', async (_, id) => {
    if (db) {
      try {
        db.prepare('DELETE FROM cotizaciones WHERE id = ?').run(id);
        return true;
      } catch (e) {
        console.error('Error al borrar cotización en SQLite:', e);
      }
    }
    const store = getStore();
    store.quotes = store.quotes.filter(q => q.id !== id);
    saveStore(store);
    return true;
  });

  // --- MATERIALES / INSUMOS ---
  ipcMain.handle('materials:getAll', async () => {
    if (db) {
      try {
        return db.prepare('SELECT * FROM insumos ORDER BY categoria, descripcion').all();
      } catch (e) {
        console.error('Error al leer insumos en SQLite:', e);
      }
    }
    return getStore().materials || [];
  });

  ipcMain.handle('materials:save', async (_, material) => {
    if (db) {
      try {
        const stmt = db.prepare(`
          INSERT INTO insumos (id, codigo, descripcion, categoria, unidad, precioUnitario, fechaActualizacion)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            codigo = excluded.codigo,
            descripcion = excluded.descripcion,
            categoria = excluded.categoria,
            unidad = excluded.unidad,
            precioUnitario = excluded.precioUnitario,
            fechaActualizacion = excluded.fechaActualizacion;
        `);
        stmt.run(
          material.id,
          material.codigo,
          material.descripcion,
          material.categoria,
          material.unidad,
          material.precioUnitario,
          material.fechaActualizacion
        );
        return true;
      } catch (e) {
        console.error('Error al guardar insumo en SQLite:', e);
      }
    }
    const store = getStore();
    const idx = store.materials.findIndex(m => m.id === material.id);
    if (idx >= 0) {
      store.materials[idx] = material;
    } else {
      store.materials.unshift(material);
    }
    saveStore(store);
    return true;
  });

  ipcMain.handle('materials:delete', async (_, id) => {
    if (db) {
      try {
        db.prepare('DELETE FROM insumos WHERE id = ?').run(id);
        return true;
      } catch (e) {
        console.error('Error al borrar insumo en SQLite:', e);
      }
    }
    const store = getStore();
    store.materials = store.materials.filter(m => m.id !== id);
    saveStore(store);
    return true;
  });

  // --- EXPORTAR PDF ---
  ipcMain.handle('pdf:export', async () => {
    if (!mainWindow) return null;
    try {
      const pdfData = await mainWindow.webContents.printToPDF({
        marginsType: 0,
        printBackground: true,
        pageSize: 'A4',
        landscape: false
      });

      const { filePath } = await dialog.showSaveDialog(mainWindow, {
        title: 'Guardar Propuesta Conobras en PDF',
        defaultPath: path.join(app.getPath('documents'), `Cotizacion_Conobras_${Date.now()}.pdf`),
        filters: [{ name: 'Documento PDF (*.pdf)', extensions: ['pdf'] }]
      });

      if (filePath) {
        fs.writeFileSync(filePath, pdfData);
        return filePath;
      }
      return null;
    } catch (err) {
      console.error('Error al exportar PDF:', err);
      throw err;
    }
  });
}

app.whenReady().then(() => {
  // Configurar menú de edición estándar (habilita Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z, Ctrl+A en Windows)
  const template = [
    {
      label: 'Edición',
      submenu: [
        { role: 'undo', label: 'Deshacer' },
        { role: 'redo', label: 'Rehacer' },
        { type: 'separator' },
        { role: 'cut', label: 'Cortar' },
        { role: 'copy', label: 'Copiar' },
        { role: 'paste', label: 'Pegar' },
        { role: 'selectAll', label: 'Seleccionar todo' }
      ]
    },
    {
      label: 'Ver',
      submenu: [
        { role: 'reload', label: 'Recargar' },
        { role: 'forceReload', label: 'Forzar recarga' },
        { role: 'toggleDevTools', label: 'Herramientas de Desarrollador' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Zoom 100%' },
        { role: 'zoomIn', label: 'Aumentar Zoom' },
        { role: 'zoomOut', label: 'Reducir Zoom' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Pantalla Completa' }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));

  initDatabase();
  setupIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
