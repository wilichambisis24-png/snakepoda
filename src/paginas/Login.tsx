import { useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router'
import { authApi } from '../api/auth'
import { CUENTAS_DEMO } from '../api/simulado/authSimulado'
import { ApiError } from '../api/tipos'
import { MODO_SIMULADO } from '../config'
import { useAuthStore } from '../store/authStore'

export function Login() {
  const iniciarSesion = useAuthStore((s) => s.iniciarSesion)
  const ubicacion = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setError(null)
    setCargando(true)
    try {
      // Al guardar la sesión, RutaPublica redirige automáticamente a la app.
      iniciarSesion(await authApi.login({ email, password }))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Ocurrió un error inesperado. Intenta de nuevo.')
      setCargando(false)
    }
  }

  return (
    <div className="tarjeta tarjeta-acceso">
      <h2>Iniciar sesión</h2>
      <p className="texto-suave">Entra para ver la demostración y agendar tu servicio de poda.</p>

      <form className="formulario" onSubmit={enviar}>
        <label className="campo">
          <span>Correo electrónico</span>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
          />
        </label>

        <label className="campo">
          <span>Contraseña</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error && (
          <p className="alerta alerta-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="btn btn-primario btn-bloque" disabled={cargando}>
          {cargando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <p className="texto-centro">
        ¿No tienes cuenta?{' '}
        <Link to="/registro" state={ubicacion.state}>
          Regístrate
        </Link>
      </p>

      {MODO_SIMULADO && (
        <div className="alerta alerta-info">
          <strong>Cuentas de prueba</strong> (modo simulado)
          <div className="cuentas-demo">
            {CUENTAS_DEMO.map((c) => (
              <button
                key={c.email}
                type="button"
                className="btn btn-secundario btn-chico"
                onClick={() => {
                  setEmail(c.email)
                  setPassword(c.password)
                }}
              >
                Usar {c.etiqueta.toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
