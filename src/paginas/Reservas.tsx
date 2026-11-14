import { useEffect, useState } from 'react'
import { reservasApi } from '../api/reservas'
import { mensajeDeError, type Reserva } from '../api/tipos'
import { FormularioReserva } from '../reservas/FormularioReserva'
import { ListaReservas } from '../reservas/ListaReservas'
import { useAuthStore } from '../store/authStore'

export function Reservas() {
  const esAdmin = useAuthStore((s) => s.usuario?.rol === 'admin')
  const [reservas, setReservas] = useState<Reserva[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    let vigente = true
    reservasApi.listar().then(
      (lista) => {
        if (vigente) setReservas(lista)
      },
      (e: unknown) => {
        if (vigente) setError(mensajeDeError(e))
      },
    )
    return () => {
      vigente = false
    }
  }, [intento])

  function reintentar() {
    setError(null)
    setIntento((n) => n + 1)
  }

  const agregar = (nueva: Reserva) => setReservas((lista) => [...(lista ?? []), nueva])
  const reemplazar = (cambiada: Reserva) =>
    setReservas((lista) => lista?.map((r) => (r.id === cambiada.id ? cambiada : r)) ?? null)

  return (
    <div className="pagina">
      <header className="encabezado-pagina">
        <h1>Reservas</h1>
        <p className="texto-suave">
          {esAdmin
            ? 'Todas las citas de los clientes.'
            : 'Agenda el servicio de poda para tus árboles y revisa el estado de tus citas.'}
        </p>
      </header>

      <div className={esAdmin ? 'reservas reservas-admin' : 'reservas'}>
        {!esAdmin && (
          <section className="tarjeta" aria-labelledby="titulo-nueva">
            <h2 id="titulo-nueva" className="titulo-tarjeta">
              Nueva reserva
            </h2>
            <FormularioReserva alCrear={agregar} />
          </section>
        )}

        <section aria-labelledby="titulo-lista">
          <h2 id="titulo-lista" className="titulo-tarjeta">
            {esAdmin ? 'Todas las reservas' : 'Mis reservas'}
          </h2>
          {error ? (
            <div className="alerta alerta-error" role="alert">
              <p>{error}</p>
              <button type="button" className="btn btn-secundario btn-chico" onClick={reintentar}>
                Reintentar
              </button>
            </div>
          ) : reservas === null ? (
            <p className="lista-vacia">Cargando reservas…</p>
          ) : (
            <ListaReservas reservas={reservas} esAdmin={esAdmin} alCambiar={reemplazar} />
          )}
        </section>
      </div>
    </div>
  )
}
