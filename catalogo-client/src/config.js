// URL base de la API
// Local: Vite proxy redirige /api → localhost:3002
// Producción: Nginx proxy redirige /api → backend (sin CORS)
const API_URL = import.meta.env.VITE_API_URL || ''

export default API_URL

