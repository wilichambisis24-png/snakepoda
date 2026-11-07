import { Navigate, Outlet, useLocation } from 'react-router'
import type { Rol } from '../api/tipos'
import { useAuthStore } from '../store/authStore'

interface EstadoNavegacion {
  desde?: string
}

/** Solo deja pasar a usuarios con sesión (y, si se indica, con uno de los roles permitidos). */
export function RutaProtegida({ roles }: { roles?: Rol[] }) {
  const usuario = useAuthStore((s) => s.usuario)
  const ubicacion = useLocation()

  if (!usuario) {
    return <Navigate to="/login" replace state={{ desde: ubicacion.pathname } satisfies EstadoNavegacion} />
  }
  if (roles && !roles.includes(usuario.rol)) {
    return <Navigate to="/" replace />
  }
  return <Outlet />
}

/** Login y registro: si ya hay sesión, vuelve a la página que se pidió antes o al inicio. */
export function RutaPublica() {
  const usuario = useAuthStore((s) => s.usuario)
  const ubicacion = useLocation()
  const desde = (ubicacion.state as EstadoNavegacion | null)?.desde

  if (usuario) return <Navigate to={desde ?? '/'} replace />
  return <Outlet />
}
