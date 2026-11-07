import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Sesion, Usuario } from '../api/tipos'

interface EstadoAuth {
  token: string | null
  usuario: Usuario | null
  iniciarSesion: (sesion: Sesion) => void
  actualizarUsuario: (usuario: Usuario) => void
  cerrarSesion: () => void
}

// La sesión se guarda en localStorage para que siga abierta al recargar la página.
export const useAuthStore = create<EstadoAuth>()(
  persist(
    (set) => ({
      token: null,
      usuario: null,
      iniciarSesion: ({ token, usuario }) => set({ token, usuario }),
      actualizarUsuario: (usuario) => set({ usuario }),
      cerrarSesion: () => set({ token: null, usuario: null }),
    }),
    {
      name: 'snakepoda.sesion',
      partialize: ({ token, usuario }) => ({ token, usuario }),
    },
  ),
)
