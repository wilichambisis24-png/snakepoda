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
