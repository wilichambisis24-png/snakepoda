import { MODO_SIMULADO } from '../config'
import { useAuthStore } from '../store/authStore'
import { peticion } from './http'
import * as simulado from './simulado/authSimulado'
import type { DatosLogin, DatosRegistro, Sesion, Usuario } from './tipos'

// Punto único de acceso a la autenticación. Las pantallas llaman a estas funciones
// y no saben si responde el backend real o el modo simulado.
export const authApi = {
  login(datos: DatosLogin): Promise<Sesion> {
    if (MODO_SIMULADO) return simulado.login(datos)
    return peticion<Sesion>('/api/auth/login', { metodo: 'POST', cuerpo: datos })
  },

  registro(datos: DatosRegistro): Promise<Sesion> {
    if (MODO_SIMULADO) return simulado.registro(datos)
    return peticion<Sesion>('/api/auth/registro', { metodo: 'POST', cuerpo: datos })
  },

  perfil(): Promise<Usuario> {
    if (MODO_SIMULADO) return simulado.perfil(useAuthStore.getState().token)
    return peticion<Usuario>('/api/auth/me')
  },
}
