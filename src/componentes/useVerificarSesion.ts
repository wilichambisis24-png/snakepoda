import { useEffect } from 'react'
import { authApi } from '../api/auth'
import { ApiError } from '../api/tipos'
import { useAuthStore } from '../store/authStore'

/**
 * Al entrar a la app con una sesión guardada, confirma con el servidor que el token
 * sigue siendo válido y refresca los datos del usuario. Si el token venció, cierra la sesión.
 * Si el servidor no responde, mantiene la sesión para no expulsar al usuario por un fallo de red.
 */
export function useVerificarSesion() {
  const token = useAuthStore((s) => s.token)

  useEffect(() => {
    if (!token) return
    let cancelado = false

    authApi
      .perfil()
      .then((usuario) => {
        if (!cancelado) useAuthStore.getState().actualizarUsuario(usuario)
      })
      .catch((error: unknown) => {
        if (!cancelado && error instanceof ApiError && error.status === 401) {
          useAuthStore.getState().cerrarSesion()
        }
      })

    return () => {
      cancelado = true
    }
  }, [token])
}
