# CatalogoHub — Contexto del Proyecto

> Archivo de contexto para retomar el desarrollo. Actualizar con cada sesión.
> **Última actualización**: 2026-02-27

---

## ¿Qué es este proyecto?

App web para **visualización y administración de catálogos de productos en PDF**.
Organizada por **Marca** y **Temporada/Año**. Los PDFs se ven inline con efecto de página tipo libro (page-flip), sin opción de descarga.

---

## Estado Actual

### ✅ Completado
- [x] Backend Express + MySQL corriendo en EasyPanel (puerto 3002)
- [x] Frontend React + Vite corriendo en EasyPanel (Nginx)
- [x] Base de datos `tendence` con tablas: `marcas`, `temporadas`, `catalogos`, `admins`
- [x] Login admin con JWT funcional
- [x] Subida de PDFs con drag & drop (Multer)
- [x] Visor PDF estilo libro doble página (react-pdf)
- [x] Filtros por marca y por año en la Home
- [x] Repositorio GitHub: https://github.com/karajoreal/catalogo
- [x] Deploy automático via EasyPanel ↔ GitHub

### 🚧 Pendiente / Por mejorar
- [ ] Verificar que el visor PDF funcione bien con PDFs grandes en producción
- [ ] Agregar búsqueda por texto en la Home
- [ ] Mejorar el efecto de page-flip (considerar `turn.js` o `@react-page-flip/react-pageflip`)
- [ ] Edición de catálogos (cambiar nombre, marca, temporada) desde el admin
- [ ] Página de detalle de Marca (todos los catálogos de una marca)
- [ ] Soporte para múltiples admins / gestión de usuarios
- [ ] Eliminar la ruta `/api/setup-admin` una vez ya no se necesite

---

## Infraestructura

### VPS Hostinger + EasyPanel
- **IP**: `82.180.128.1`
- **Panel**: EasyPanel (Docker)

### Servicios en EasyPanel
| Servicio | Repo | Subdirectorio | Puerto |
|---------|------|--------------|--------|
| `catalogo-api` | karajoreal/catalogo | `catalogo-api` | 3002 |
| `catalogo-client` | karajoreal/catalogo | `catalogo-client` | 80 |

### Base de Datos
- **Host interno**: `next_mysql`
- **DB**: `tendence`
- **User**: `mysql`
- *(password en variables de entorno de EasyPanel — no en este archivo)*

---

## Estructura del Proyecto

```
catalogo/                       ← Raíz del monorepo
├── catalogo-api/               ← Backend Node.js + Express
│   ├── app.js                  ← Servidor principal
│   ├── schema.sql              ← Esquema de DB
│   ├── create-admin.js         ← Script para crear admin (una vez)
│   └── src/
│       ├── db.js               ← Pool MySQL2
│       ├── middleware/auth.js  ← JWT middleware
│       └── routes/
│           ├── auth.js
│           ├── catalogos.js    ← CRUD + upload Multer
│           ├── marcas.js
│           └── temporadas.js
│
└── catalogo-client/            ← Frontend React + Vite
    └── src/
        ├── App.jsx             ← Router principal
        ├── pages/
        │   ├── Home.jsx        ← Grid de catálogos + filtros
        │   ├── CatalogoViewer.jsx  ← Visor PDF doble página
        │   ├── Login.jsx       ← Login admin
        │   └── Admin.jsx       ← Panel completo admin
        └── components/
            ├── Navbar.jsx
            ├── FilterBar.jsx   ← Filtros marca + año
            └── CatalogoCard.jsx
```

---

## Credenciales del Sistema

| Campo | Valor |
|-------|-------|
| Admin email | `admin@catalogohub.com` |
| Admin password | `Admin123!` |
| API health check | `[URL-API]/api/health` |

---

## Flujo de Deploy (para cambios futuros)

```bash
# En la carpeta local del proyecto:
cd c:\Users\hanse\Documents\Antigravity\catalogo

git add .
git commit -m "descripción del cambio"
git push
# EasyPanel redeploya automáticamente
```

---

## Diseño Visual

- **Paleta**: Fondo `#0A0A0F` (negro) + Acento `#D4AF37` (dorado)
- **Estilo**: Glassmorphism + grain texture
- **Fuente**: Inter (Google Fonts)
- **Proyecto Stitch**: ID `16562148488105949380`
  - Home screen: `e5cabf0f78254afe8182761740140505`
  - Viewer screen: `8cd7654f612e41688df1284b0691ea02`
  - Admin screen: `5b1aaa85e9904ae9a1903db4dbff7449`

---

## Para retomar el contexto en una nueva sesión

Di a Antigravity algo como:
> *"Continuemos con CatalogoHub. Lee el CONTEXT.md en `c:\Users\hanse\Documents\Antigravity\catalogo\CONTEXT.md`"*
