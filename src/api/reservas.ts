import { MODO_SIMULADO } from '../config'
import { useAuthStore } from '../store/authStore'
import { peticion } from './http'
import * as simulado from './simulado/reservasSimulado'
import type { EstadoAdministrable } from '../reservas/reglas'
import { ApiError, type DatosReserva, type Disponibilidad, type Reserva } from './tipos'

// Punto único de acceso a las reservas. Las pantallas no saben si responde
// el backend real o el modo simulado.

/** En modo simulado, un 401 también cierra la sesión, igual que con el backend real (ver http.ts). */
async function conSesionSimulada<T>(accion: (token: string | null) => Promise<T>): Promise<T> {
  try {
    return await accion(useAuthStore.getState().token)
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) useAuthStore.getState().cerrarSesion()
    throw error
  }
}

export const reservasApi = {
  /** Horarios libres de un día ("AAAA-MM-DD"). */
  disponibilidad(fecha: string): Promise<Disponibilidad> {
    if (MODO_SIMULADO) return simulado.disponibilidad(fecha)
    return peticion<Disponibilidad>(`/api/disponibilidad?fecha=${encodeURIComponent(fecha)}`)
  },

  /** El cliente recibe solo sus reservas; el administrador, todas. */
  listar(): Promise<Reserva[]> {
    if (MODO_SIMULADO) return conSesionSimulada(simulado.listar)
    return peticion<Reserva[]>('/api/reservas')
  },

  crear(datos: DatosReserva): Promise<Reserva> {
    if (MODO_SIMULADO) return conSesionSimulada((token) => simulado.crear(token, datos))
    return peticion<Reserva>('/api/reservas', { metodo: 'POST', cuerpo: datos })
  },

  cancelar(id: string): Promise<Reserva> {
    if (MODO_SIMULADO) return conSesionSimulada((token) => simulado.cancelar(token, id))
    return peticion<Reserva>(`/api/reservas/${encodeURIComponent(id)}/cancelar`, { metodo: 'PATCH' })
  },

  /** Solo el administrador: confirmar una reserva pendiente o completar una confirmada. */
  cambiarEstado(id: string, estado: EstadoAdministrable): Promise<Reserva> {
    if (MODO_SIMULADO) return conSesionSimulada((token) => simulado.cambiarEstado(token, id, estado))
    return peticion<Reserva>(`/api/reservas/${encodeURIComponent(id)}/estado`, {
      metodo: 'PATCH',
      cuerpo: { estado },
    })
  },
}
