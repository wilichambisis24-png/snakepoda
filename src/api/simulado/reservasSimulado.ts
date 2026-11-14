import { desdeTextoISO, esDomingo, hoyISO, sumarDias } from '../../reservas/fechas'
import { DIAS_ANTICIPACION_MAX, LIMITES, sePuedeCancelar } from '../../reservas/reglas'
import { ApiError, type DatosReserva, type Disponibilidad, type Reserva } from '../tipos'
import { esperar, generarId, guardar, leer } from './almacen'
import { usuarioDeToken } from './authSimulado'

// Imita lo que hará el backend con las reservas. Hay un solo equipo de poda,
// así que cada horario de cada día admite una sola reserva activa.

const CLAVE_RESERVAS = 'snakepoda.simulado.reservas'

/** Horas de inicio de las visitas, de lunes a sábado. Cada visita dura unas 2 horas. */
export const HORARIOS_ATENCION = ['08:00', '10:00', '12:00', '14:00', '16:00']

/** Reservas de ejemplo para que la lista y la agenda no empiecen vacías. */
function reservasDeEjemplo(): Reserva[] {
  const hoy = hoyISO()
  const diaHabil = (dias: number) => {
    const fecha = sumarDias(hoy, dias)
    return esDomingo(fecha) ? sumarDias(fecha, 1) : fecha
  }
  const creada = (dias: number) => desdeTextoISO(sumarDias(hoy, dias), '10:30').toISOString()

  return [
    {
      id: 'r-ejemplo-1',
      clienteId: 'u-cliente-demo',
      clienteNombre: 'Cliente Demo',
      fecha: diaHabil(-20),
      hora: '10:00',
      direccion: 'Calle Los Pinos 245, Zona Sur',
      cantidadArboles: 2,
      alturaAproximada: 12,
      notas: 'Dos eucaliptos junto al muro del patio.',
      estado: 'completada',
      creadaEn: creada(-27),
    },
    {
      id: 'r-ejemplo-2',
      clienteId: 'u-ejemplo-1',
      clienteNombre: 'Jorge Rojas',
      fecha: diaHabil(2),
      hora: '10:00',
      direccion: 'Av. Las Acacias 1020',
      cantidadArboles: 1,
      alturaAproximada: 15,
      estado: 'confirmada',
      creadaEn: creada(-3),
    },
    {
      id: 'r-ejemplo-3',
      clienteId: 'u-ejemplo-2',
      clienteNombre: 'Lucía Mamani',
      fecha: diaHabil(3),
      hora: '14:00',
      direccion: 'Calle Los Ceibos 88',
      cantidadArboles: 3,
      alturaAproximada: 9,
      notas: 'Hay cables de luz cerca de una de las ramas.',
      estado: 'pendiente',
      creadaEn: creada(-1),
    },
  ]
}

function reservas(): Reserva[] {
  const guardadas = leer<Reserva[] | null>(CLAVE_RESERVAS, null)
  if (guardadas) return guardadas
  const iniciales = reservasDeEjemplo()
  guardar(CLAVE_RESERVAS, iniciales)
  return iniciales
}

const ordenar = (lista: Reserva[]) =>
  [...lista].sort((a, b) => `${a.fecha} ${a.hora}`.localeCompare(`${b.fecha} ${b.hora}`))

function horariosLibres(lista: Reserva[], fecha: string): string[] {
  const hoy = hoyISO()
  if (esDomingo(fecha) || fecha < hoy || fecha > sumarDias(hoy, DIAS_ANTICIPACION_MAX)) return []
  const ahora = Date.now()
  return HORARIOS_ATENCION.filter(
    (hora) =>
      desdeTextoISO(fecha, hora).getTime() > ahora &&
      !lista.some((r) => r.estado !== 'cancelada' && r.fecha === fecha && r.hora === hora),
  )
}

const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/

export async function disponibilidad(fecha: string): Promise<Disponibilidad> {
  await esperar(300)
  if (!FORMATO_FECHA.test(fecha)) throw new ApiError(400, 'La fecha no es válida.')
  return { fecha, horarios: horariosLibres(reservas(), fecha) }
}

export async function listar(token: string | null): Promise<Reserva[]> {
  await esperar()
  const usuario = usuarioDeToken(token)
  const lista = reservas()
  return ordenar(usuario.rol === 'admin' ? lista : lista.filter((r) => r.clienteId === usuario.id))
}

function validar(datos: DatosReserva): void {
  const { fecha, hora, direccion, cantidadArboles, alturaAproximada, notas } = datos
  const hoy = hoyISO()
  const invalido = (mensaje: string) => new ApiError(400, mensaje)

  if (!FORMATO_FECHA.test(fecha)) throw invalido('La fecha no es válida.')
  if (fecha < hoy) throw invalido('No se puede reservar en una fecha pasada.')
  if (fecha > sumarDias(hoy, DIAS_ANTICIPACION_MAX)) {
    throw invalido(`Solo se puede reservar con hasta ${DIAS_ANTICIPACION_MAX} días de anticipación.`)
  }
  if (esDomingo(fecha)) throw invalido('Los domingos no atendemos.')
  if (!HORARIOS_ATENCION.includes(hora)) throw invalido('Elige uno de los horarios de atención.')
  if (desdeTextoISO(fecha, hora).getTime() <= Date.now()) throw invalido('Ese horario ya pasó.')
  if (direccion.trim().length < LIMITES.direccionMin) throw invalido('Escribe la dirección completa.')

  const { arboles, alturaMetros } = LIMITES
  if (!Number.isInteger(cantidadArboles) || cantidadArboles < arboles.min || cantidadArboles > arboles.max) {
    throw invalido(`La cantidad de árboles debe estar entre ${arboles.min} y ${arboles.max}.`)
  }
  if (!Number.isFinite(alturaAproximada) || alturaAproximada < alturaMetros.min || alturaAproximada > alturaMetros.max) {
    throw invalido(`La altura debe estar entre ${alturaMetros.min} y ${alturaMetros.max} metros.`)
  }
  if (notas && notas.length > LIMITES.notasMax) {
    throw invalido(`Las notas pueden tener hasta ${LIMITES.notasMax} caracteres.`)
  }
}

export async function crear(token: string | null, datos: DatosReserva): Promise<Reserva> {
  await esperar()
  const usuario = usuarioDeToken(token)
  if (usuario.rol !== 'cliente') throw new ApiError(403, 'Solo los clientes pueden crear reservas.')
  validar(datos)

  const lista = reservas()
  if (!horariosLibres(lista, datos.fecha).includes(datos.hora)) {
    throw new ApiError(409, 'Ese horario acaba de ser reservado. Elige otro.')
  }

  const nueva: Reserva = {
    id: generarId('r'),
    clienteId: usuario.id,
    clienteNombre: usuario.nombre,
    fecha: datos.fecha,
    hora: datos.hora,
    direccion: datos.direccion.trim(),
    cantidadArboles: datos.cantidadArboles,
    alturaAproximada: datos.alturaAproximada,
    notas: datos.notas?.trim() || undefined,
    estado: 'pendiente',
    creadaEn: new Date().toISOString(),
  }
  guardar(CLAVE_RESERVAS, [...lista, nueva])
  return nueva
}

export async function cancelar(token: string | null, id: string): Promise<Reserva> {
  await esperar()
  const usuario = usuarioDeToken(token)
  const lista = reservas()
  const reserva = lista.find((r) => r.id === id)

  if (!reserva) throw new ApiError(404, 'La reserva no existe.')
  if (usuario.rol !== 'admin' && reserva.clienteId !== usuario.id) {
    throw new ApiError(403, 'No puedes cancelar la reserva de otra persona.')
  }
  if (!sePuedeCancelar(reserva.estado)) throw new ApiError(409, 'Esta reserva ya no se puede cancelar.')

  const cancelada: Reserva = { ...reserva, estado: 'cancelada' }
  guardar(
    CLAVE_RESERVAS,
    lista.map((r) => (r.id === id ? cancelada : r)),
  )
  return cancelada
}
