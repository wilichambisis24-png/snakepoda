import { useState } from 'react'
import { reservasApi } from '../api/reservas'
import { mensajeDeError, type Reserva } from '../api/tipos'
import { formatearFecha, hoyISO } from './fechas'
import { esProxima, ETIQUETA_ESTADO, sePuedeCancelar, sePuedeCompletar, sePuedeConfirmar } from './reglas'

interface PropsLista {
  reservas: Reserva[]
  esAdmin: boolean
  alCambiar: (reserva: Reserva) => void
}

const clave = (r: Reserva) => `${r.fecha} ${r.hora}`

/** Separa las reservas en próximas (la más cercana primero) e historial (la más reciente primero). */
export function ListaReservas({ reservas, esAdmin, alCambiar }: PropsLista) {
  const [hoy] = useState(hoyISO)
  const proximas = reservas.filter((r) => esProxima(r, hoy)).sort((a, b) => clave(a).localeCompare(clave(b)))
  const historial = reservas.filter((r) => !esProxima(r, hoy)).sort((a, b) => clave(b).localeCompare(clave(a)))

  if (reservas.length === 0) {
    return <p className="lista-vacia">Aún no tienes reservas. Agenda la primera con el formulario.</p>
  }

  const tarjeta = (r: Reserva, enProximas: boolean) => (
    <TarjetaReserva key={r.id} reserva={r} esAdmin={esAdmin} enProximas={enProximas} hoy={hoy} alCambiar={alCambiar} />
  )

  // El administrador ve las dos listas lado a lado; el cliente, una debajo de la otra
  // (su columna izquierda ya la ocupa el formulario).
  return (
    <div className={esAdmin ? 'lista-columnas' : 'lista-apilada'}>
      <div>
        <h3 className="subtitulo-lista">Próximas ({proximas.length})</h3>
        {proximas.length === 0 ? (
          <p className="lista-vacia">No hay citas programadas.</p>
        ) : (
          <ul className="lista-reservas">{proximas.map((r) => tarjeta(r, true))}</ul>
        )}
      </div>

      {(esAdmin || historial.length > 0) && (
        <div>
          <h3 className="subtitulo-lista">Historial ({historial.length})</h3>
          {historial.length === 0 ? (
            <p className="lista-vacia">Todavía no hay reservas pasadas ni canceladas.</p>
          ) : (
            <ul className="lista-reservas">{historial.map((r) => tarjeta(r, false))}</ul>
          )}
        </div>
      )}
    </div>
  )
}

type Accion = 'confirmar' | 'completar' | 'cancelar'

interface PropsTarjeta {
  reserva: Reserva
  esAdmin: boolean
  enProximas: boolean
  hoy: string
  alCambiar: (reserva: Reserva) => void
}

function TarjetaReserva({ reserva, esAdmin, enProximas, hoy, alCambiar }: PropsTarjeta) {
  const [confirmandoCancelacion, setConfirmandoCancelacion] = useState(false)
  const [enProceso, setEnProceso] = useState<Accion | null>(null)
  const [error, setError] = useState<string | null>(null)

  // El cliente solo cancela sus citas próximas; el administrador maneja cualquier reserva activa.
  const puedeCancelar = sePuedeCancelar(reserva.estado) && (esAdmin || enProximas)
  const puedeConfirmar = esAdmin && sePuedeConfirmar(reserva)
  const puedeCompletar = esAdmin && sePuedeCompletar(reserva, hoy)
  const sinCerrar = esAdmin && !enProximas && sePuedeCancelar(reserva.estado)

  async function ejecutar(accion: Accion) {
    setEnProceso(accion)
    setError(null)
    try {
      const cambiada =
        accion === 'cancelar'
          ? await reservasApi.cancelar(reserva.id)
          : await reservasApi.cambiarEstado(reserva.id, accion === 'confirmar' ? 'confirmada' : 'completada')
      alCambiar(cambiada)
    } catch (err) {
      setError(mensajeDeError(err))
    } finally {
      setEnProceso(null)
      setConfirmandoCancelacion(false)
    }
  }

  const ocupado = enProceso !== null

  return (
    <li className={`reserva reserva-${reserva.estado}`}>
      <div className="reserva-cabecera">
        <div>
          <p className="reserva-fecha">{formatearFecha(reserva.fecha)}</p>
          <p className="reserva-hora">{reserva.hora} h</p>
        </div>
        <span className={`insignia estado-${reserva.estado}`}>{ETIQUETA_ESTADO[reserva.estado]}</span>
      </div>

      {sinCerrar && (
        <p className="reserva-aviso">
          La fecha ya pasó y la reserva sigue {ETIQUETA_ESTADO[reserva.estado].toLowerCase()}.
        </p>
      )}

      <dl className="reserva-datos">
        {esAdmin && (
          <div className="reserva-dato-ancho">
            <dt>Cliente</dt>
            <dd>{reserva.clienteNombre}</dd>
          </div>
        )}
        <div className="reserva-dato-ancho">
          <dt>Dirección</dt>
          <dd>{reserva.direccion}</dd>
        </div>
        <div>
          <dt>Árboles</dt>
          <dd>{reserva.cantidadArboles}</dd>
        </div>
        <div>
          <dt>Altura aprox.</dt>
          <dd>{reserva.alturaAproximada} m</dd>
        </div>
        {reserva.notas && (
          <div className="reserva-dato-ancho">
            <dt>Notas</dt>
            <dd>{reserva.notas}</dd>
          </div>
        )}
      </dl>

      {(puedeConfirmar || puedeCompletar || puedeCancelar) && (
        <div className="reserva-acciones">
          {confirmandoCancelacion ? (
            <>
              <span>¿Cancelar esta reserva?</span>
              <button
                type="button"
                className="btn btn-peligro btn-chico"
                onClick={() => ejecutar('cancelar')}
                disabled={ocupado}
              >
                {enProceso === 'cancelar' ? 'Cancelando…' : 'Sí, cancelar'}
              </button>
              <button
                type="button"
                className="btn btn-secundario btn-chico"
                onClick={() => setConfirmandoCancelacion(false)}
                disabled={ocupado}
              >
                No
              </button>
            </>
          ) : (
            <>
              {puedeConfirmar && (
                <button
                  type="button"
                  className="btn btn-primario btn-chico"
                  onClick={() => ejecutar('confirmar')}
                  disabled={ocupado}
                >
                  {enProceso === 'confirmar' ? 'Confirmando…' : 'Confirmar'}
                </button>
              )}
              {puedeCompletar && (
                <button
                  type="button"
                  className="btn btn-primario btn-chico"
                  onClick={() => ejecutar('completar')}
                  disabled={ocupado}
                >
                  {enProceso === 'completar' ? 'Guardando…' : 'Marcar completada'}
                </button>
              )}
              {puedeCancelar && (
                <button
                  type="button"
                  className="btn btn-secundario btn-chico"
                  onClick={() => setConfirmandoCancelacion(true)}
                  disabled={ocupado}
                >
                  Cancelar reserva
                </button>
              )}
            </>
          )}
        </div>
      )}

      {error && (
        <p className="alerta alerta-error reserva-error" role="alert">
          {error}
        </p>
      )}
    </li>
  )
}
