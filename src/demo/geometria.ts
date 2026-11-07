import { Quaternion, Vector3 } from 'three'
import { RAMAS, TRONCO, type DatosRama } from './datosArbol'

export const GRADOS = Math.PI / 180
export const EJE_Y = new Vector3(0, 1, 0)

/** Radio de cada segmento del robot. */
export const RADIO_SEGMENTO = 0.085

/** Vueltas que da el robot alrededor de la rama y avance a lo largo de la rama por vuelta. */
export const VUELTAS_ENROSQUE = 2.25
export const PASO_ENROSQUE = 0.21

export function radioTronco(y: number): number {
  const f = Math.min(Math.max(y / TRONCO.alto, 0), 1)
  return TRONCO.radioBase + (TRONCO.radioCima - TRONCO.radioBase) * f
}

export function radioRama(datos: DatosRama, t: number): number {
  return datos.radio * (1 - 0.55 * Math.min(Math.max(t / datos.largo, 0), 1))
}

/**
 * Sistema de referencia de una rama. "t" es la distancia a lo largo de la rama
 * medida desde el eje del tronco.
 */
export interface MarcoRama {
  datos: DatosRama
  /** Punto del eje del tronco donde nace la rama. */
  base: Vector3
  /** Dirección de crecimiento (unitaria). */
  dir: Vector3
  /** Perpendicular a la rama que apunta hacia arriba: la cara superior. */
  arriba: Vector3
  lado: Vector3
  /** Rotación que lleva el eje Y a la dirección de la rama (para los cilindros). */
  rotacion: Quaternion
  senoElevacion: number
  cosenoElevacion: number
  /** Donde la rama sale de la corteza. */
  tSuperficie: number
  /** Donde el robot empieza a enroscarse. */
  tEnrosque: number
  /** Donde la rama se corta: todo lo que está más afuera cae. */
  tCorte: number
}

function crearMarco(datos: DatosRama): MarcoRama {
  const azimut = datos.azimut * GRADOS
  const elevacion = datos.elevacion * GRADOS
  const dir = new Vector3(
    Math.cos(elevacion) * Math.cos(azimut),
    Math.sin(elevacion),
    Math.cos(elevacion) * Math.sin(azimut),
  )
  const arriba = EJE_Y.clone().addScaledVector(dir, -dir.y).normalize()
  const lado = new Vector3().crossVectors(dir, arriba).normalize()
  const tSuperficie = radioTronco(datos.altura) / Math.cos(elevacion)
  const tEnrosque = tSuperficie + 0.45

  return {
    datos,
    base: new Vector3(0, datos.altura, 0),
    dir,
    arriba,
    lado,
    rotacion: new Quaternion().setFromUnitVectors(EJE_Y, dir),
    senoElevacion: Math.sin(elevacion),
    cosenoElevacion: Math.cos(elevacion),
    tSuperficie,
    tEnrosque,
    tCorte: tEnrosque + VUELTAS_ENROSQUE * PASO_ENROSQUE + 0.14,
  }
}

export const MARCOS: readonly MarcoRama[] = RAMAS.map(crearMarco)

export function marcoDe(id: string): MarcoRama {
  const marco = MARCOS.find((m) => m.datos.id === id)
  if (!marco) throw new Error(`No existe la rama ${id}`)
  return marco
}

export function puntoEje(marco: MarcoRama, t: number, salida = new Vector3()): Vector3 {
  return salida.copy(marco.base).addScaledVector(marco.dir, t)
}

/** Distancia desde un punto hasta la superficie de una rama (negativa si está adentro). */
export function distanciaARama(punto: Vector3, marco: MarcoRama): number {
  const relativo = new Vector3().subVectors(punto, marco.base)
  const t = Math.min(Math.max(relativo.dot(marco.dir), 0), marco.datos.largo)
  return punto.distanceTo(puntoEje(marco, t)) - radioRama(marco.datos, t)
}

/** Generador pseudoaleatorio con semilla: el árbol se ve igual en cada carga. */
export function aleatorioConSemilla(semilla: number): () => number {
  let estado = semilla >>> 0
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0
    let x = estado
    x = Math.imul(x ^ (x >>> 15), x | 1)
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61)
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}
