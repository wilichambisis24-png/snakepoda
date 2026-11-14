import type { EstadoReserva } from '../api/tipos'

// Reglas de las reservas. El backend debe validar lo mismo (ver docs/API.md);
// el frontend las usa para limitar los campos del formulario y avisar antes de enviar.

/** Hasta cuántos días hacia adelante se puede reservar. */
export const DIAS_ANTICIPACION_MAX = 60

export const LIMITES = {
  arboles: { min: 1, max: 50 },
  alturaMetros: { min: 2, max: 40 },
  direccionMin: 8,
  notasMax: 500,
} as const

export const ETIQUETA_ESTADO: Record<EstadoReserva, string> = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  completada: 'Completada',
  cancelada: 'Cancelada',
}

/** Solo se pueden cancelar las reservas que todavía no se atendieron. */
export function sePuedeCancelar(estado: EstadoReserva): boolean {
  return estado === 'pendiente' || estado === 'confirmada'
}

/** Estados que el administrador asigna con PATCH /api/reservas/:id/estado (cancelar tiene su propia ruta). */
export type EstadoAdministrable = 'confirmada' | 'completada'

/** El administrador confirma las reservas pendientes. */
export function sePuedeConfirmar({ estado }: { estado: EstadoReserva }): boolean {
  return estado === 'pendiente'
}

/** Una reserva confirmada se completa desde el día de la visita (no antes). */
export function sePuedeCompletar({ estado, fecha }: { estado: EstadoReserva; fecha: string }, hoy: string): boolean {
  return estado === 'confirmada' && fecha <= hoy
}

/** Próxima = sigue activa y su fecha es hoy o después. Lo demás va al historial. */
export function esProxima({ estado, fecha }: { estado: EstadoReserva; fecha: string }, hoy: string): boolean {
  return sePuedeCancelar(estado) && fecha >= hoy
}
