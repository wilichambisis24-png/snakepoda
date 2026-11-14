import { useState } from 'react'
import type { EstadoReserva, Reserva } from '../api/tipos'
import { hoyISO } from './fechas'
import { ListaReservas } from './ListaReservas'
import { esProxima, sePuedeCancelar } from './reglas'

type Filtro = EstadoReserva | 'todas'

const TARJETAS_RESUMEN: { filtro: Filtro; titulo: string }[] = [
  { filtro: 'todas', titulo: 'Todas' },
  { filtro: 'pendiente', titulo: 'Por confirmar' },
  { filtro: 'confirmada', titulo: 'Confirmadas' },
  { filtro: 'completada', titulo: 'Completadas' },
  { filtro: 'cancelada', titulo: 'Canceladas' },
]

/** Quita tildes y mayúsculas para que "lucia" encuentre a "Lucía". */
const normalizar = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

/** Vista del administrador: resumen por estado, búsqueda y las reservas con sus acciones. */
export function GestionReservas({ reservas, alCambiar }: { reservas: Reserva[]; alCambiar: (r: Reserva) => void }) {
  const [hoy] = useState(hoyISO)
  const [filtro, setFiltro] = useState<Filtro>('todas')
  const [busqueda, setBusqueda] = useState('')

  const cantidad = (f: Filtro) => (f === 'todas' ? reservas.length : reservas.filter((r) => r.estado === f).length)
  const visitasHoy = reservas.filter((r) => r.fecha === hoy && r.estado === 'confirmada').length
  const sinCerrar = reservas.filter((r) => sePuedeCancelar(r.estado) && !esProxima(r, hoy)).length

  const texto = normalizar(busqueda.trim())
  const visibles = reservas.filter(
    (r) =>
      (filtro === 'todas' || r.estado === filtro) &&
      (!texto || normalizar(`${r.clienteNombre} ${r.direccion}`).includes(texto)),
  )

  if (reservas.length === 0) return <p className="lista-vacia">Todavía no hay reservas.</p>

  return (
    <div className="gestion">
      <div className="resumen" role="group" aria-label="Filtrar por estado">
        {TARJETAS_RESUMEN.map((t) => (
          <button
            key={t.filtro}
            type="button"
            className={`resumen-tarjeta resumen-${t.filtro}${filtro === t.filtro ? ' activa' : ''}`}
            aria-pressed={filtro === t.filtro}
            onClick={() => setFiltro(t.filtro)}
          >
            <span className="resumen-numero">{cantidad(t.filtro)}</span>
            <span className="resumen-titulo">{t.titulo}</span>
          </button>
        ))}
      </div>

      <div className="gestion-barra">
        <p className="gestion-avisos">
          <span className="aviso-chip">
            {visitasHoy === 0
              ? 'Sin visitas confirmadas para hoy'
              : `${visitasHoy} ${visitasHoy === 1 ? 'visita confirmada' : 'visitas confirmadas'} para hoy`}
          </span>
          {sinCerrar > 0 && (
            <span className="aviso-chip aviso-chip-atencion">
              {sinCerrar} con fecha pasada sin cerrar
            </span>
          )}
        </p>
        <label className="buscador">
          <span className="solo-lector">Buscar reservas</span>
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por cliente o dirección"
          />
        </label>
      </div>

      {visibles.length === 0 ? (
        <p className="lista-vacia">Ninguna reserva coincide con el filtro.</p>
      ) : (
        <ListaReservas reservas={visibles} esAdmin alCambiar={alCambiar} />
      )}
    </div>
  )
}
