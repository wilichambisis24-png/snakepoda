// Tipos compartidos con el backend. Si cambian aquí, hay que actualizar docs/API.md.

export type Rol = 'cliente' | 'admin'

export interface Usuario {
  id: string
  nombre: string
  email: string
  telefono?: string
  rol: Rol
}

export interface Sesion {
  token: string
  usuario: Usuario
}

export interface DatosLogin {
  email: string
  password: string
}

export interface DatosRegistro {
  nombre: string
  email: string
  telefono?: string
  password: string
}

/** Error que devuelve la API: el backend responde { "mensaje": "..." }. */
export class ApiError extends Error {
  readonly status: number

  constructor(status: number, mensaje: string) {
    super(mensaje)
    this.name = 'ApiError'
    this.status = status
  }
}

/** Mensaje que se le muestra al usuario para cualquier error de una llamada a la API. */
export function mensajeDeError(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Ocurrió un error inesperado. Intenta de nuevo.'
}

// ===== Reservas (Fase 3) =====

export type EstadoReserva = 'pendiente' | 'confirmada' | 'completada' | 'cancelada'

export interface Reserva {
  id: string
  clienteId: string
  clienteNombre: string
  fecha: string // AAAA-MM-DD
  hora: string // HH:mm, 24 h
  direccion: string
  cantidadArboles: number
  alturaAproximada: number // metros
  notas?: string
  estado: EstadoReserva
  creadaEn: string // ISO 8601
}

/** Lo que el cliente envía al crear una reserva. */
export interface DatosReserva {
  fecha: string
  hora: string
  direccion: string
  cantidadArboles: number
  alturaAproximada: number
  notas?: string
}

export interface Disponibilidad {
  fecha: string
  horarios: string[]
}
