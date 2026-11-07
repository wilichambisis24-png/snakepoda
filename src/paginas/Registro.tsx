import { useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router'
import { authApi } from '../api/auth'
import { ApiError } from '../api/tipos'
import { useAuthStore } from '../store/authStore'

const LARGO_MINIMO_PASSWORD = 6

export function Registro() {
  const iniciarSesion = useAuthStore((s) => s.iniciarSesion)
  const ubicacion = useLocation()
  const [datos, setDatos] = useState({ nombre: '', email: '', telefono: '', password: '', confirmar: '' })
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

  function cambiar(campo: keyof typeof datos, valor: string) {
    setDatos((anterior) => ({ ...anterior, [campo]: valor }))
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setError(null)

    if (datos.nombre.trim().length < 2) return setError('Escribe tu nombre completo.')
    if (datos.password.length < LARGO_MINIMO_PASSWORD) {
      return setError(`La contraseña debe tener al menos ${LARGO_MINIMO_PASSWORD} caracteres.`)
    }
    if (datos.password !== datos.confirmar) return setError('Las contraseñas no coinciden.')

    setCargando(true)
    try {
      const sesion = await authApi.registro({
        nombre: datos.nombre,
        email: datos.email,
        telefono: datos.telefono || undefined,
        password: datos.password,
      })
      iniciarSesion(sesion)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Ocurrió un error inesperado. Intenta de nuevo.')
      setCargando(false)
    }
  }

  return (
    <div className="tarjeta tarjeta-acceso">
      <h2>Crear cuenta</h2>
      <p className="texto-suave">Regístrate para reservar el servicio de poda.</p>

      <form className="formulario" onSubmit={enviar}>
        <label className="campo">
          <span>Nombre completo</span>
          <input
            autoComplete="name"
            required
            value={datos.nombre}
            onChange={(e) => cambiar('nombre', e.target.value)}
          />
        </label>

        <label className="campo">
          <span>Correo electrónico</span>
          <input
            type="email"
            autoComplete="email"
            required
            value={datos.email}
            onChange={(e) => cambiar('email', e.target.value)}
            placeholder="tu@correo.com"
          />
        </label>

        <label className="campo">
          <span>
            Teléfono <small className="texto-suave">(opcional)</small>
          </span>
          <input
            type="tel"
            autoComplete="tel"
            value={datos.telefono}
            onChange={(e) => cambiar('telefono', e.target.value)}
          />
        </label>

        <div className="fila-campos">
          <label className="campo">
            <span>Contraseña</span>
            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={LARGO_MINIMO_PASSWORD}
              value={datos.password}
              onChange={(e) => cambiar('password', e.target.value)}
            />
          </label>
          <label className="campo">
            <span>Repetir contraseña</span>
            <input
              type="password"
              autoComplete="new-password"
              required
              value={datos.confirmar}
              onChange={(e) => cambiar('confirmar', e.target.value)}
            />
          </label>
        </div>

        {error && (
          <p className="alerta alerta-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="btn btn-primario btn-bloque" disabled={cargando}>
          {cargando ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>

      <p className="texto-centro">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" state={ubicacion.state}>
          Inicia sesión
        </Link>
      </p>
    </div>
  )
}
