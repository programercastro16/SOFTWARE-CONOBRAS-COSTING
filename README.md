# Conobras Quote Pro 🏛️
*Software de Escritorio Local para Gestión de Costos, Presupuestos y Cotizaciones Arquitectónicas*

Aplicación de escritorio 100% local, offline, sin servidores ni costes de nube, desarrollada para el uso personal del arquitecto de **Conobras Construcción + Arquitectura**.

---

## 🚀 Cómo Iniciar la Aplicación

Tienes 3 formas inmediatas de ejecutar la aplicación:

### Opción 1: Acceso Directo Windows (Recomendado)
Haz doble clic sobre el archivo ejecutable por lotes:
```text
ConobrasQuote.bat
```

### Opción 2: Terminal en Modo Producción (Escritorio Local)
```powershell
npm start
```

### Opción 3: Modo Desarrollo con Hot Reload
```powershell
npm run electron:dev
```

*(O si deseas abrirlo únicamente en el navegador web local: `npm run dev` en `http://localhost:5173`)*

---

## 📦 Generar Instalador `.exe` para Windows
Para compilar un instalador nativo de Windows autónomo:
```powershell
npm run electron:build
```
El instalador quedará generado en la carpeta `dist-electron/` o `dist/`.

---

## 📂 Módulos Incluidos y Funcionamiento

1. **Cotizador de Obra (El Núcleo)**:
   - Registro de datos de obra, ubicación, cliente, fecha, vigencia y folio de cotización.
   - Jerarquía técnica de **Partidas de Obra** (Preliminares, Estructura, Albañilería, Instalaciones, Acabados).
   - Inserción de conceptos con selector rápido desde catálogo interno.
   - Cálculo automático en tiempo real de:
     - Subtotal de Costo Directo.
     - Imprevistos / Contingencias configurables (%).
     - Gastos Generales y Administración (%).
     - Honorarios de Diseño & Dirección Técnica del Arquitecto (%).
     - Impuesto al Valor Agregado (IVA %).
     - Inversión Total del Proyecto.
   - Guardado seguro e instantáneo en la base de datos local SQLite.

2. **Catálogo de Materiales e Insumos**:
   - Catálogo preinstalado con precios de referencia de materiales, cuadrillas de mano de obra (albañiles, fierreros, electricistas), equipo/maquinaria y subcontratos.
   - Buscador en tiempo real por descripción o código.
   - Creación, edición rápida de precios y eliminación de insumos.
   - Botón de inserción directa desde el catálogo a la cotización activa.

3. **Historial de Cotizaciones**:
   - Visualización de todas las propuestas guardadas en SQLite local.
   - Búsqueda por folio, cliente o nombre de obra.
   - Duplicación de cotizaciones en un clic (ideal para nuevos proyectos similares).
   - Estados: `BORRADOR`, `PRESENTADA`, `APROBADA`, `RECHAZADA`.

4. **Propuesta Institucional / Generador PDF**:
   - Hoja membretada con el logotipo corporativo oficial de Conobras (anillos dorados).
   - Presentación de alta gama lista para presentar a clientes.
   - Botón de **Descarga directa en PDF**.
   - Botón de **Impresión**.
   - Botón de **Compartir por WhatsApp**: Formatea un mensaje ejecutivo con los datos clave y abre WhatsApp Web o App en un solo clic.

5. **Configuración de Estudio & Marca**:
   - Datos del arquitecto titular (nombre, cédula profesional, teléfono, correo).
   - Porcentajes predeterminados para nuevas cotizaciones.

---

## 💾 Dónde se Guardan tus Datos (SQLite)
La base de datos SQLite y los registros se almacenan exclusivamente en tu computadora local dentro de:
`%APPDATA%/conobras-quote/conobras_data.db`

Tus cotizaciones, precios y clientes nunca salen de tu equipo y no tienen costes de servidores.
