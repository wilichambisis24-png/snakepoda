import { NavLink, Outlet } from 'react-router'
import { MODO_SIMULADO } from '../config'
import { useAuthStore } from '../store/authStore'
import { Logo } from './Logo'
import { useVerificarSesion } from './useVerificarSesion'

const SECCIONES = [
  { ruta: '/', texto: 'Inicio', exacta: true },
  { ruta: '/funcionamiento', texto: 'Funcionamiento', exacta: false },
  { ruta: '/reservas', texto: 'Reservas', exacta: false },
]

/** Estructura común de las páginas internas: cabecera con navegación, contenido y pie. */
export function DisenoApp() {
  useVerificarSesion()
  const usuario = useAuthStore((s) => s.usuario)
  const cerrarSesion = useAuthStore((s) => s.cerrarSesion)

  return (
    <div className="app">
      <header className="cabecera">
        <div className="cabecera-contenido">
          <NavLink to="/" className="cabecera-marca" aria-label="Ir al inicio">
            <Logo tamano={34} />
          </NavLink>

          <nav className="navegacion" aria-label="Secciones">
            {SECCIONES.map((s) => (
              <NavLink
                key={s.ruta}
                to={s.ruta}
                end={s.exacta}
                className={({ isActive }) => `navegacion-enlace${isActive ? ' activo' : ''}`}
              >
                {s.texto}
              </NavLink>
            ))}
          </nav>

          <div className="cabecera-usuario">
            <div className="usuario-datos">
              <span className="usuario-nombre">{usuario?.nombre}</span>
              <span className={`insignia insignia-${usuario?.rol}`}>
                {usuario?.rol === 'admin' ? 'Administrador' : 'Cliente'}
              </span>
            </div>
            <button type="button" className="btn btn-secundario btn-chico" onClick={cerrarSesion}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {MODO_SIMULADO && (
        <div className="aviso-simulado" role="status">
          Modo simulado: los datos se guardan solo en este navegador hasta conectar el backend.
        </div>
      )}

      <main className="contenido">
        <Outlet />
      </main>

      <footer className="pie">
        <Logo tamano={22} />
        <span>Proyecto académico · Demostración de producto</span>
      </footer>
    </div>
  )
}
