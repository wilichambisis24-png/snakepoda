import { API_URL } from '../config'
import { useAuthStore } from '../store/authStore'
import { ApiError } from './tipos'

interface OpcionesPeticion {
  metodo?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  cuerpo?: unknown
}

/** Llama al backend real. Agrega el token de sesión y convierte los errores en ApiError. */
export async function peticion<T>(ruta: string, opciones: OpcionesPeticion = {}): Promise<T> {
  const token = useAuthStore.getState().token
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  let respuesta: Response
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      method: opciones.metodo ?? 'GET',
      headers,
      body: opciones.cuerpo === undefined ? undefined : JSON.stringify(opciones.cuerpo),
    })
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor. Revisa tu conexión.')
  }

  if (!respuesta.ok) {
    let mensaje = `Error ${respuesta.status}`
    try {
      const datos: unknown = await respuesta.json()
      if (datos && typeof datos === 'object' && 'mensaje' in datos && typeof datos.mensaje === 'string') {
        mensaje = datos.mensaje
      }
    } catch {
      // La respuesta de error no trae JSON: se usa el mensaje genérico.
    }
    // Token vencido o inválido: se cierra la sesión local.
    if (respuesta.status === 401 && token) useAuthStore.getState().cerrarSesion()
    throw new ApiError(respuesta.status, mensaje)
  }

  if (respuesta.status === 204) return undefined as T
  return (await respuesta.json()) as T
}
