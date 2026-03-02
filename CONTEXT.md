# CatalogoHub — Contexto del Proyecto

> Archivo de contexto para retomar el desarrollo. Actualizar con cada sesión.
> **Última actualización**: 2026-03-02 (Lunes)

---

## ¿Qué es este proyecto?

App web para **visualización y administración de catálogos de productos en PDF e imágenes**.
Organizada por **Marca** y **Temporada/Año**. Los PDFs y catálogos de imágenes se ven inline con layout libro (doble página lado a lado), sin opción de descarga.

---

## Estado Actual — TODO FUNCIONANDO ✅

### ✅ Completado hoy (2026-03-02)
- [x] **Rebrand visual completo** — colores corporativos Tendence:
  - Rojo `#ED1C24` (primario), Verde `#A3C939`, Naranja `#F7941D`, Azul `#99D9EA`
  - Fuente Oswald para headings + Inter para body
  - Logo SVG corporativo 2×2 en el Navbar
  - Badge "NUEVO" en verde corporativo
- [x] **Tema claro** — fondo blanco/gris claro, texto oscuro, selects claros
- [x] **Admin sidebar** — blanco con degradado rojo-naranja en el logo y borde rojo
- [x] **Soporte catálogos de imágenes** — nuevo tipo `imagenes` además de `pdf`:
  - Backend: endpoint `POST /api/catalogos/imagenes` (multi-imagen)
  - DB: columnas `tipo ENUM('pdf','imagenes')` e `imagenes JSON`
  - Frontend Admin: toggle PDF/Imágenes con drag & drop multi-archivo
  - `ImageViewer.jsx` — mismo layout libro que el PDF viewer
  - `App.jsx` → `CatalogoRouter` detecta el tipo y abre el visor correcto
- [x] **Zoom nítido en visor PDF** — pasa `height * zoom` al `Page` de react-pdf (re-render real, no CSS scale)
- [x] **Zoom solo con botones** `−`/`+` y teclas `+`/`-` (mouse wheel desactivado para no interferir con scroll)
- [x] **Visor tema claro** — topbar blanco, fondo gris `#E8E8E8` (como mesa de trabajo)
- [x] Fix borrado en Admin — handlers verifican `res.ok` y muestran error real (ej. sesión expirada)
- [x] **CORS backend** — ahora acepta todos los métodos HTTP incluyendo DELETE explícitamente
- [x] **Volumen persistente** configurado en EasyPanel para `uploads/` → los archivos sobreviven redeploys
- [x] Script de migración `migrate-imagenes.js` compatible con MySQL 5.7 (usa SHOW COLUMNS)

### ✅ Completado antes (2026-02-27)
- [x] Backend Express + MySQL corriendo en EasyPanel (puerto 3002)
- [x] Frontend React + Vite corriendo en EasyPanel (Nginx)
- [x] Login admin con JWT funcional
- [x] Subida de PDFs con drag & drop funcional en producción
- [x] Visor PDF doble página lado a lado (layout libro)
- [x] Botones de eliminar en Marcas y Temporadas (con confirmación)
- [x] Filtros por marca y año en la Home
- [x] Deploy automático via EasyPanel ↔ GitHub

### 🚧 Pendiente / Ideas
- [ ] Edición de catálogos desde el admin (cambiar nombre, marca, temporada)
- [ ] Búsqueda por texto en la Home
- [ ] Página de detalle por Marca (todos sus catálogos)
- [ ] Dominio personalizado (ej: `catalogos.tendence.io`)
- [ ] Captura automática de portada (primera página del PDF como portada)
- [ ] Eliminar la ruta temporal `/api/setup-admin` de `app.js`

---

## Infraestructura

### VPS Hostinger + EasyPanel
- **IP**: `82.180.128.1`
- **Frontend URL**: `https://next-catalogo-client.bzupwx.easypanel.host/`
- **Panel**: EasyPanel (Docker)

### Servicios en EasyPanel
| Servicio | Puerto | Volumen persistente |
|---------|--------|-------------------|
| `catalogo-api` | 3002 | `/app/uploads` → persistente ✅ |
| `catalogo-client` | 80 | — |

### Configuración EasyPanel — `catalogo-client` (env vars runtime):
```
BACKEND_HOST=catalogo-api
BACKEND_PORT=3002
```

### Configuración EasyPanel — `catalogo-api` (env vars):
```
DB_HOST=next_mysql
DB_PORT=3306
DB_NAME=tendence
DB_USER=mysql
DB_PASS=23bd148508f82b8b51ae
JWT_SECRET=catalogohub_jwt_secret_2026_ultra_secure
PORT=3002
```

### Base de Datos — tabla `catalogos`
Columnas clave: `id`, `titulo`, `descripcion`, `marca_id`, `temporada_id`, `pdf_url`, `portada_url`, `imagenes` (JSON), `tipo` (ENUM pdf/imagenes), `es_nuevo`, `activo`, `visualizaciones`, `creado_en`

---

## Estructura del Proyecto

```
catalogo/
├── CONTEXT.md
├── catalogo-api/                    ← Backend Node.js + Express
│   ├── app.js                       ← Servidor, CORS (todos los métodos), rutas
│   ├── migrate-imagenes.js          ← Script de migración DB (MySQL 5.7 compatible)
│   ├── schema.sql
│   ├── Dockerfile
│   └── src/
│       ├── db.js
│       ├── middleware/auth.js
│       └── routes/
│           ├── auth.js
│           ├── catalogos.js         ← CRUD + upload PDF + upload imágenes (/imagenes)
│           ├── marcas.js
│           └── temporadas.js
│
└── catalogo-client/                 ← Frontend React + Vite
    ├── Dockerfile
    ├── nginx.conf.template          ← Proxy /api y /uploads → backend
    └── src/
        ├── config.js                ← API_URL (relativo para Nginx proxy)
        ├── App.jsx                  ← CatalogoRouter detecta tipo pdf/imagenes
        ├── index.css                ← Tema claro + paleta Tendence + fuente Oswald
        ├── pages/
        │   ├── Home.jsx             ← Grid + filtros por marca/año
        │   ├── CatalogoViewer.jsx   ← Visor PDF doble página + zoom nítido con botones
        │   ├── ImageViewer.jsx      ← Visor imágenes doble página (mismo UX que PDF)
        │   ├── Login.jsx
        │   └── Admin.jsx            ← Toggle PDF/Imágenes, delete con error handling
        └── components/
            ├── Navbar.jsx           ← Logo SVG 2×2 Tendence + Oswald
            ├── FilterBar.jsx
            └── CatalogoCard.jsx
```

---

## Identidad Visual Tendence

| Color | Hex | Uso |
|-------|-----|-----|
| 🔴 Rojo | `#ED1C24` | Primario: botones, activos, bordes, navbar |
| 🟢 Verde | `#A3C939` | Badge "NUEVO", éxitos |
| 🟠 Naranja | `#F7941D` | Hover, degradado logo admin |
| 🩵 Azul | `#99D9EA` | Info (decorativo) |

**Fuente headings**: Oswald (cargado desde Google Fonts)
**Fuente body**: Inter

---

## Credenciales del Sistema

| Campo | Valor |
|-------|-------|
| Admin email | `admin@catalogohub.com` |
| Admin password | `Admin123!` |
| API health | `https://next-catalogo-api.bzupwx.easypanel.host/api/health` |
| Frontend | `https://next-catalogo-client.bzupwx.easypanel.host` |
| GitHub | `https://github.com/karajoreal/catalogo` |

---

## Flujo de Deploy

```bash
cd c:\Users\hanse\Documents\Antigravity\catalogo
git add .
git commit -m "descripción"
git push
# EasyPanel redeploya automáticamente ambos servicios
```

> ⚠️ Si agregas columnas nuevas a la DB, ejecutar en EasyPanel → `catalogo-api` → Terminal:
> `node migrate-imagenes.js`

---

## Cómo retomar en una nueva sesión

Di a Antigravity:
> *"Continuemos con CatalogoHub. Lee el CONTEXT.md en `c:\Users\hanse\Documents\Antigravity\catalogo\CONTEXT.md`"*
