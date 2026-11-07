// Datos generales de la app. El nombre del producto aún no es definitivo:
// cámbialo aquí y se actualiza en toda la interfaz.
export const NOMBRE_PRODUCTO = 'SNAKE PODA'
export const ESLOGAN = 'Poda en altura sin poner a nadie en riesgo'

// Si VITE_API_URL no está definida (archivo .env.local), la app funciona
// con datos simulados guardados en el navegador. Ver docs/API.md.
export const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '')
export const MODO_SIMULADO = API_URL === ''
