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
