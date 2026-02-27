# CatalogoHub — Contexto del Proyecto

> Archivo de contexto para retomar el desarrollo. Actualizar con cada sesión.
> **Última actualización**: 2026-02-27 (Viernes)

---

## ¿Qué es este proyecto?

App web para **visualización y administración de catálogos de productos en PDF**.
Organizada por **Marca** y **Temporada/Año**. Los PDFs se ven inline con efecto de página tipo libro (page-flip), sin opción de descarga.

---

## Estado Actual — TODO FUNCIONANDO ✅

### ✅ Completado hoy
- [x] Backend Express + MySQL corriendo en EasyPanel (puerto 3002)
- [x] Frontend React + Vite corriendo en EasyPanel (Nginx)
- [x] Base de datos `tendence` con tablas: `marcas`, `temporadas`, `catalogos`, `admins`
- [x] Login admin con JWT funcional (`admin@catalogohub.com` / `Admin123!`)
- [x] **Subida de PDFs con drag & drop funcional en producción**
- [x] **Proxy Nginx resuelto** — usando variable `BACKEND_HOST` en EasyPanel env vars
- [x] **Visor PDF doble página lado a lado** (página izquierda + derecha como libro)
- [x] Navegación con flechas del teclado (← →) y botones en pantalla
- [x] Thumbnails/filmstrip en la barra inferior
- [x] **Botones de eliminar** en Marcas y Temporadas (con confirmación)
- [x] Filtros por marca y por año en la Home
- [x] Repositorio GitHub: https://github.com/karajoreal/catalogo
- [x] Deploy automático via EasyPanel ↔ GitHub (push = redeploy automático)

### 🚧 Pendiente / Ideas para el lunes
- [ ] Edición de catálogos desde el admin (cambiar nombre, marca, temporada)
- [ ] Búsqueda por texto en la Home
- [ ] Mejorar animación de page-flip (actualmente es un tilt CSS simple)
- [ ] Página de detalle por Marca (todos sus catálogos)
- [ ] Dominio personalizado (ej: `catalogos.tendence.io`)
- [ ] Eliminar la ruta temporal `/api/setup-admin` de `app.js` una vez que ya no se necesite
- [ ] Subida de imagen de portada automática (captura primera página del PDF como portada)

---

## Infraestructura

### VPS Hostinger + EasyPanel
- **IP**: `82.180.128.1`
- **Frontend URL**: `https://next-catalogo-client.bzupwx.easypanel.host/`
- **Panel**: EasyPanel (Docker)

### Servicios en EasyPanel
| Servicio | Subdirectorio | Puerto |
|---------|--------------|--------|
| `catalogo-api` | `catalogo-api` | 3002 |
| `catalogo-client` | `catalogo-client` | 80 |

### Configuración EasyPanel — `catalogo-client` (env vars en runtime):
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

### Base de Datos
- **Host interno Docker**: `next_mysql`
- **DB**: `tendence`
- **User**: `mysql`

---

## Estructura del Proyecto

```
catalogo/                            ← Monorepo en GitHub
├── CONTEXT.md                       ← Este archivo
├── catalogo-api/                    ← Backend Node.js + Express
│   ├── app.js                       ← Servidor + CORS + rutas
│   ├── schema.sql                   ← Esquema de DB (ya ejecutado en VPS)
│   ├── create-admin.js              ← Script para crear admin (ya no necesario)
│   ├── Dockerfile
│   └── src/
│       ├── db.js                    ← Pool MySQL2
│       ├── middleware/auth.js       ← JWT middleware
│       └── routes/
│           ├── auth.js              ← Login admin JWT
│           ├── catalogos.js         ← CRUD + upload PDF/portada con Multer
│           ├── marcas.js            ← CRUD marcas
│           └── temporadas.js        ← CRUD temporadas
│
└── catalogo-client/                 ← Frontend React + Vite
    ├── Dockerfile                   ← Build React + Nginx con template
    ├── nginx.conf.template          ← Proxy /api y /uploads → backend
    └── src/
        ├── config.js                ← URL base de la API (usa VITE_API_URL o '')
        ├── App.jsx                  ← Router con rutas protegidas
        ├── index.css                ← Estilos completos (dark/gold/glassmorphism)
        ├── pages/
        │   ├── Home.jsx             ← Grid de catálogos + filtros
        │   ├── CatalogoViewer.jsx   ← Visor PDF doble página (libro)
        │   ├── Login.jsx            ← Login admin
        │   └── Admin.jsx            ← Panel admin (catálogos, marcas, temporadas)
        └── components/
            ├── Navbar.jsx
            ├── FilterBar.jsx        ← Filtros por marca y año
            └── CatalogoCard.jsx
```

---

## Credenciales del Sistema

| Campo | Valor |
|-------|-------|
| Admin email | `admin@catalogohub.com` |
| Admin password | `Admin123!` |
| API health check | `https://next-catalogo-api.bzupwx.easypanel.host/api/health` |
| Frontend | `https://next-catalogo-client.bzupwx.easypanel.host` |

---

## Flujo de Deploy (para cambios futuros)

```bash
cd c:\Users\hanse\Documents\Antigravity\catalogo
git add .
git commit -m "descripción del cambio"
git push
# EasyPanel redeploya automáticamente ambos servicios
```

---

## Diseño Visual

- **Paleta**: Fondo `#0A0A0F` (negro) + Acento `#D4AF37` (dorado)
- **Estilo**: Glassmorphism + grain texture + Inter font
- **Proyecto Stitch**: ID `16562148488105949380` (referencia visual)

---

## Cómo retomar en una nueva sesión

Di a Antigravity:
> *"Continuemos con CatalogoHub. Lee el CONTEXT.md en `c:\Users\hanse\Documents\Antigravity\catalogo\CONTEXT.md`"*
