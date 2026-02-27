// Configuración de la URL de la API
// En producción: establece VITE_API_URL en las variables de entorno de EasyPanel al compilar
// En desarrollo local: el proxy de vite redirige /api → localhost:3002 automáticamente
const API_URL = import.meta.env.VITE_API_URL || ''

export default API_URL
