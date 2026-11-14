import { useState } from 'react'
import { reservasApi } from '../api/reservas'
import { mensajeDeError, type Reserva } from '../api/tipos'
import { formatearFecha, hoyISO } from './fechas'
import { ETIQUETA_ESTADO, sePuedeCancelar } from './reglas'

interface PropsLista {
  reservas: Reserva[]
  esAdmin: boolean
  alCambiar: (reserva: Reserva) => void
}

const clave = (r: Reserva) => `${r.fecha} ${r.hora}`

/** Separa las reservas en próximas (la más cercana primero) e historial (la más reciente primero). */
export function ListaReservas({ reservas, esAdmin, alCambiar }: PropsLista) {
  const [hoy] = useState(hoyISO)
  const esProxima = (r: Reserva) => sePuedeCancelar(r.estado) && r.fecha >= hoy
  const proximas = reservas.filter(esProxima).sort((a, b) => clave(a).localeCompare(clave(b)))
  const historial = reservas.filter((r) => !esProxima(r)).sort((a, b) => clave(b).localeCompare(clave(a)))

  if (reservas.length === 0) {
    return (
      <p className="lista-vacia">
        {esAdmin ? 'Todavía no hay reservas.' : 'Aún no tienes reservas. Agenda la primera con el formulario.'}
      </p>
    )
  }

  // El administrador ve las dos listas lado a lado; el cliente, una debajo de la otra
  // (su columna izquierda ya la ocupa el formulario).
  return (
    <div className={esAdmin ? 'lista-columnas' : 'lista-apilada'}>
      <div>
        <h3 className="subtitulo-lista">Próximas ({proximas.length})</h3>
        {proximas.length === 0 ? (
          <p className="lista-vacia">No hay citas programadas.</p>
        ) : (
          <ul className="lista-reservas">
            {proximas.map((r) => (
              <TarjetaReserva key={r.id} reserva={r} mostrarCliente={esAdmin} cancelable alCambiar={alCambiar} />
            ))}
          </ul>
        )}
      </div>

      {(esAdmin || historial.length > 0) && (
        <div>
          <h3 className="subtitulo-lista">Historial ({historial.length})</h3>
          {historial.length === 0 ? (
            <p className="lista-vacia">Todavía no hay reservas pasadas ni canceladas.</p>
          ) : (
            <ul className="lista-reservas">
              {historial.map((r) => (
                <TarjetaReserva
                  key={r.id}
                  reserva={r}
                  mostrarCliente={esAdmin}
                  cancelable={false}
                  alCambiar={alCambiar}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

interface PropsTarjeta {
  reserva: Reserva
  mostrarCliente: boolean
  cancelable: boolean
  alCambiar: (reserva: Reserva) => void
}

function TarjetaReserva({ reserva, mostrarCliente, cancelable, alCambiar }: PropsTarjeta) {
  const [confirmando, setConfirmando] = useState(false)
  const [cancelando, setCancelando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function cancelar() {
    setCancelando(true)
    setError(null)
    try {
      alCambiar(await reservasApi.cancelar(reserva.id))
    } catch (err) {
      setError(mensajeDeError(err))
    } finally {
      setCancelando(false)
      setConfirmando(false)
    }
  }

  return (
    <li className={`reserva reserva-${reserva.estado}`}>
      <div className="reserva-cabecera">
        <div>
          <p className="reserva-fecha">{formatearFecha(reserva.fecha)}</p>
          <p className="reserva-hora">{reserva.hora} h</p>
        </div>
        <span className={`insignia estado-${reserva.estado}`}>{ETIQUETA_ESTADO[reserva.estado]}</span>
      </div>

      <dl className="reserva-datos">
        {mostrarCliente && (
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

      {cancelable && (
        <div className="reserva-acciones">
          {confirmando ? (
            <>
              <span>¿Cancelar esta reserva?</span>
              <button type="button" className="btn btn-peligro btn-chico" onClick={cancelar} disabled={cancelando}>
                {cancelando ? 'Cancelando…' : 'Sí, cancelar'}
              </button>
              <button
                type="button"
                className="btn btn-secundario btn-chico"
                onClick={() => setConfirmando(false)}
                disabled={cancelando}
              >
                No
              </button>
            </>
          ) : (
            <button type="button" className="btn btn-secundario btn-chico" onClick={() => setConfirmando(true)}>
              Cancelar reserva
            </button>
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
