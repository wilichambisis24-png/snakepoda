import { useEffect, useState, type FormEvent } from 'react'
import { reservasApi } from '../api/reservas'
import { ApiError, mensajeDeError, type Reserva } from '../api/tipos'
import { esDomingo, formatearFecha, hoyISO, sumarDias } from './fechas'
import { DIAS_ANTICIPACION_MAX, LIMITES } from './reglas'

const VACIO = { fecha: '', hora: '', direccion: '', cantidadArboles: '1', alturaAproximada: '', notas: '' }
type Campo = keyof typeof VACIO

type EstadoHorarios =
  | { tipo: 'sin-fecha' }
  | { tipo: 'cargando' }
  | { tipo: 'error'; mensaje: string }
  | { tipo: 'listo'; horarios: string[] }

/** Pide al servidor los horarios libres cada vez que cambia la fecha (o se pide recargar). */
function useHorariosLibres(fecha: string, recarga: number): EstadoHorarios {
  const clave = `${fecha}#${recarga}`
  const [resultado, setResultado] = useState<{ clave: string; estado: EstadoHorarios } | null>(null)

  useEffect(() => {
    if (!fecha) return
    let vigente = true
    reservasApi.disponibilidad(fecha).then(
      (d) => vigente && setResultado({ clave, estado: { tipo: 'listo', horarios: d.horarios } }),
      (e: unknown) => vigente && setResultado({ clave, estado: { tipo: 'error', mensaje: mensajeDeError(e) } }),
    )
    return () => {
      vigente = false
    }
  }, [fecha, clave])

  if (!fecha) return { tipo: 'sin-fecha' }
  if (resultado?.clave !== clave) return { tipo: 'cargando' }
  return resultado.estado
}

export function FormularioReserva({ alCrear }: { alCrear: (reserva: Reserva) => void }) {
  const [hoy] = useState(hoyISO)
  const [datos, setDatos] = useState(VACIO)
  const [recarga, setRecarga] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [exito, setExito] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const horarios = useHorariosLibres(datos.fecha, recarga)

  function cambiar(campo: Campo, valor: string) {
    setExito(null)
    // Al cambiar de día, el horario elegido deja de valer.
    setDatos((anterior) => ({ ...anterior, [campo]: valor, ...(campo === 'fecha' && { hora: '' }) }))
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setError(null)
    setExito(null)

    const cantidadArboles = Number(datos.cantidadArboles)
    const alturaAproximada = Number(datos.alturaAproximada)
    if (!datos.fecha) return setError('Elige una fecha.')
    if (!datos.hora) return setError('Elige uno de los horarios disponibles.')
    if (datos.direccion.trim().length < LIMITES.direccionMin) return setError('Escribe la dirección completa.')
    if (!Number.isInteger(cantidadArboles) || cantidadArboles < LIMITES.arboles.min) {
      return setError('Indica cuántos árboles hay que podar.')
    }
    if (!alturaAproximada) return setError('Indica la altura aproximada de los árboles.')

    setEnviando(true)
    try {
      const reserva = await reservasApi.crear({
        fecha: datos.fecha,
        hora: datos.hora,
        direccion: datos.direccion.trim(),
        cantidadArboles,
        alturaAproximada,
        notas: datos.notas.trim() || undefined,
      })
      setDatos(VACIO)
      setExito(
        `Reserva registrada para el ${formatearFecha(reserva.fecha).toLowerCase()} a las ${reserva.hora}. ` +
          'Queda pendiente hasta que la confirmemos.',
      )
      alCrear(reserva)
    } catch (err) {
      setError(mensajeDeError(err))
      // Otro cliente tomó el horario: se vuelven a pedir los horarios libres.
      if (err instanceof ApiError && err.status === 409) {
        setDatos((anterior) => ({ ...anterior, hora: '' }))
        setRecarga((n) => n + 1)
      }
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form className="formulario" onSubmit={enviar} noValidate>
      <label className="campo">
        <span>Fecha</span>
        <input
          type="date"
          name="fecha"
          required
          min={hoy}
          max={sumarDias(hoy, DIAS_ANTICIPACION_MAX)}
          value={datos.fecha}
          onChange={(e) => cambiar('fecha', e.target.value)}
        />
        <small className="campo-ayuda">Atendemos de lunes a sábado, hasta {DIAS_ANTICIPACION_MAX} días adelante.</small>
      </label>

      <fieldset className="campo campo-grupo">
        <legend>Horario</legend>
        {horarios.tipo === 'sin-fecha' && <p className="campo-ayuda">Primero elige una fecha.</p>}
        {horarios.tipo === 'cargando' && <p className="campo-ayuda">Buscando horarios libres…</p>}
        {horarios.tipo === 'error' && <p className="campo-ayuda texto-peligro">{horarios.mensaje}</p>}
        {horarios.tipo === 'listo' && horarios.horarios.length === 0 && (
          <p className="campo-ayuda texto-peligro">
            {esDomingo(datos.fecha)
              ? 'Los domingos no atendemos. Elige otro día.'
              : 'No quedan horarios libres ese día. Prueba con otra fecha.'}
          </p>
        )}
        {horarios.tipo === 'listo' && horarios.horarios.length > 0 && (
          <>
            <div className="horarios">
              {horarios.horarios.map((hora) => (
                <label key={hora} className="horario">
                  <input
                    type="radio"
                    name="hora"
                    value={hora}
                    checked={datos.hora === hora}
                    onChange={() => cambiar('hora', hora)}
                  />
                  <span>{hora}</span>
                </label>
              ))}
            </div>
            <small className="campo-ayuda">Hora de llegada del equipo. Cada visita dura unas 2 horas.</small>
          </>
        )}
      </fieldset>

      <label className="campo">
        <span>Dirección</span>
        <input
          name="direccion"
          autoComplete="street-address"
          required
          value={datos.direccion}
          onChange={(e) => cambiar('direccion', e.target.value)}
          placeholder="Calle, número y zona"
        />
      </label>

      <div className="fila-campos">
        <label className="campo">
          <span>Cantidad de árboles</span>
          <input
            type="number"
            name="cantidadArboles"
            inputMode="numeric"
            required
            min={LIMITES.arboles.min}
            max={LIMITES.arboles.max}
            step={1}
            value={datos.cantidadArboles}
            onChange={(e) => cambiar('cantidadArboles', e.target.value)}
          />
        </label>
        <label className="campo">
          <span>Altura aproximada (m)</span>
          <input
            type="number"
            name="alturaAproximada"
            inputMode="decimal"
            required
            min={LIMITES.alturaMetros.min}
            max={LIMITES.alturaMetros.max}
            step={0.5}
            value={datos.alturaAproximada}
            onChange={(e) => cambiar('alturaAproximada', e.target.value)}
            placeholder="Ej.: 12"
          />
        </label>
      </div>

      <label className="campo">
        <span>
          Notas <small className="texto-suave">(opcional)</small>
        </span>
        <textarea
          name="notas"
          rows={3}
          maxLength={LIMITES.notasMax}
          value={datos.notas}
          onChange={(e) => cambiar('notas', e.target.value)}
          placeholder="Tipo de árbol, ramas cerca de cables, acceso al lugar…"
        />
      </label>

      {error && (
        <p className="alerta alerta-error" role="alert">
          {error}
        </p>
      )}
      {exito && (
        <p className="alerta alerta-exito" role="status">
          {exito}
        </p>
      )}

      <button type="submit" className="btn btn-primario btn-bloque" disabled={enviando}>
        {enviando ? 'Reservando…' : 'Reservar'}
      </button>
    </form>
  )
}
