// URL base de la API
// Local: el proxy de Vite redirige /api → localhost:3002 automáticamente
// Producción: apunta al dominio de EasyPanel del servicio catalogo-api
const API_URL = import.meta.env.VITE_API_URL || 'https://next-catalogo-api.bzupwx.easypanel.host'

export default API_URL
