import { CatmullRomCurve3, Vector3 } from 'three'
import { TRONCO } from './datosArbol'
import {
  GRADOS,
  MARCOS,
  PASO_ENROSQUE,
  RADIO_SEGMENTO,
  VUELTAS_ENROSQUE,
  distanciaARama,
  marcoDe,
  puntoEje,
  radioRama,
  radioTronco,
  type MarcoRama,
} from './geometria'

// El robot se mueve "siguiendo al líder": la cabeza avanza por una ruta y cada
// segmento pasa exactamente por donde pasó el anterior. Para retroceder basta con
// recorrer la ruta al revés, y así se desenrosca solo.

export const SEGMENTOS = 26
export const SEPARACION = 0.15
export const LARGO_CUERPO = (SEGMENTOS - 1) * SEPARACION

/** Dónde descansa el robot en el suelo y dónde está el operario. */
export const AZIMUT_REPOSO = 100 * GRADOS
export const AZIMUT_OPERARIO = -35 * GRADOS
export const DISTANCIA_OPERARIO = 5

const PASO_MUESTREO = 0.02
const VUELTA = Math.PI * 2
/** La espiral termina antes de la rama; el último tramo rodea el tronco a una altura fija, por encima de ella. */
const ARCO_FINAL = 45 * GRADOS

export interface Ruta {
  /** Puntos y direcciones cada PASO_MUESTREO metros: [x, y, z, x, y, z, ...]. */
  puntos: Float32Array
  tangentes: Float32Array
  cantidad: number
  largo: number
  /** Distancias sobre la ruta donde empieza cada etapa (posición de la cabeza). */
  sReposo: number
  sRama: number
  sEnrosque: number
  sFin: number
}

interface Helice {
  angulo0: number
  giro: number
  y0: number
  y1: number
}

function enSuelo(radio: number, azimut: number): Vector3 {
  return new Vector3(radio * Math.cos(azimut), RADIO_SEGMENTO, radio * Math.sin(azimut))
}

/** Cuerpo en reposo: una "S" sobre el césped que apunta hacia el árbol. */
function puntosReposo(): Vector3[] {
  const lateral = new Vector3(-Math.sin(AZIMUT_REPOSO), 0, Math.cos(AZIMUT_REPOSO))
  const puntos: Vector3[] = []
  // De 4,8 m a 1,5 m del tronco, ondulando 40 cm a cada lado.
  for (let i = 0; i <= 13; i++) {
    const recorrido = (i * 3.3) / 13
    puntos.push(
      enSuelo(4.8 - recorrido, AZIMUT_REPOSO).addScaledVector(lateral, 0.4 * Math.sin((recorrido * VUELTA) / 1.3)),
    )
  }
  return puntos
}

function puntoHelice(h: Helice, f: number): Vector3 {
  const angulo = h.angulo0 + h.giro * f
  const y = h.y0 + (h.y1 - h.y0) * f
  const r = radioTronco(y) + RADIO_SEGMENTO + 0.005
  return new Vector3(r * Math.cos(angulo), y, r * Math.sin(angulo))
}

/** Menor espacio libre entre la espiral y las ramas (negativo = choca). */
function holgura(h: Helice): number {
  let minimo = Infinity
  for (let k = 0; k <= 200; k++) {
    const p = puntoHelice(h, k / 200)
    for (const marco of MARCOS) minimo = Math.min(minimo, distanciaARama(p, marco) - RADIO_SEGMENTO)
  }
  return minimo
}

const auxiliarA = new Vector3()
const auxiliarB = new Vector3()

/**
 * Red de seguridad: si la curva suavizada quedó dentro de una rama, del tronco o
 * del suelo, empuja el punto hasta que el segmento solo toque la superficie.
 */
function separarDeSuperficies(p: Vector3): void {
  for (const marco of MARCOS) {
    const t = Math.min(Math.max(auxiliarA.subVectors(p, marco.base).dot(marco.dir), 0), marco.datos.largo)
    if (t < marco.tSuperficie * 0.5) continue // esa parte de la rama está dentro del tronco
    const eje = puntoEje(marco, t, auxiliarA)
    const haciaFuera = auxiliarB.subVectors(p, eje)
    const distancia = haciaFuera.length()
    const minimo = radioRama(marco.datos, t) + RADIO_SEGMENTO
    if (distancia < minimo && distancia > 1e-6) p.copy(eje).addScaledVector(haciaFuera, minimo / distancia)
  }
  if (p.y > 0 && p.y < TRONCO.alto) {
    const horizontal = Math.hypot(p.x, p.z)
    const minimo = radioTronco(p.y) + RADIO_SEGMENTO
    if (horizontal < minimo && horizontal > 1e-6) {
      p.x *= minimo / horizontal
      p.z *= minimo / horizontal
    }
  }
  p.y = Math.max(p.y, RADIO_SEGMENTO)
}

/**
 * Elige cómo sube el robot por el tronco: desde qué lado empieza y cuántas vueltas da.
 * Prueba varias opciones y se queda con la que no choca con otras ramas y tiene
 * la inclinación más natural.
 */
function elegirHelice(marco: MarcoRama): Helice {
  const y0 = 0.35
  // Termina a una altura por encima de la cara superior de la rama.
  const y1 =
    marco.base.y +
    marco.tSuperficie * marco.senoElevacion +
    radioRama(marco.datos, marco.tSuperficie) / marco.cosenoElevacion +
    RADIO_SEGMENTO +
    0.1
  const azimutFinal = marco.datos.azimut * GRADOS - ARCO_FINAL

  let mejor: Helice | null = null
  let mejorCosto = Infinity
  let masHolgada: Helice = { angulo0: AZIMUT_REPOSO, giro: VUELTA, y0, y1 }
  let mayorHolgura = -Infinity

  for (let desvio = -60; desvio <= 60; desvio += 10) {
    const angulo0 = AZIMUT_REPOSO + desvio * GRADOS
    const giroMinimo = (((azimutFinal - angulo0) % VUELTA) + VUELTA) % VUELTA
    for (let vueltas = 0; vueltas <= 3; vueltas++) {
      const giro = giroMinimo + vueltas * VUELTA
      const paso = (y1 - y0) / (giro / VUELTA)
      if (giro < Math.PI / 2 || paso < 1.2 || paso > 4) continue

      const h: Helice = { angulo0, giro, y0, y1 }
      const espacio = holgura(h)
      if (espacio > mayorHolgura) {
        mayorHolgura = espacio
        masHolgada = h
      }
      if (espacio < 0.06) continue
      const costo = Math.abs(paso - 2) + 0.4 * Math.abs(desvio * GRADOS)
      if (costo < mejorCosto) {
        mejorCosto = costo
        mejor = h
      }
    }
  }
  return mejor ?? masHolgada
}

function construirRuta(marco: MarcoRama): Ruta {
  const control: Vector3[] = puntosReposo()
  const iReposo = control.length - 1
  const helice = elegirHelice(marco)

  // Del lugar de reposo al pie del tronco.
  const diferencia = Math.atan2(Math.sin(helice.angulo0 - AZIMUT_REPOSO), Math.cos(helice.angulo0 - AZIMUT_REPOSO))
  control.push(enSuelo(1.05, AZIMUT_REPOSO + diferencia / 2))
  control.push(enSuelo(TRONCO.radioBase + RADIO_SEGMENTO + 0.06, helice.angulo0 - 0.12))

  // Sube en espiral por el tronco.
  const pasosHelice = Math.max(4, Math.ceil(helice.giro / (25 * GRADOS)))
  for (let k = 0; k <= pasosHelice; k++) control.push(puntoHelice(helice, k / pasosHelice))
  const iRama = control.length - 1

  // Rodea el tronco por encima de la rama hasta quedar sobre ella.
  const radioArco = radioTronco(helice.y1) + RADIO_SEGMENTO + 0.005
  const anguloArco = helice.angulo0 + helice.giro
  for (let k = 1; k <= 3; k++) {
    const angulo = anguloArco + (ARCO_FINAL * k) / 3
    control.push(new Vector3(radioArco * Math.cos(angulo), helice.y1, radioArco * Math.sin(angulo)))
  }

  // Se sube a la cara superior de la rama.
  for (const extra of [0.15, 0.3]) {
    const t = marco.tSuperficie + extra
    control.push(puntoEje(marco, t).addScaledVector(marco.arriba, radioRama(marco.datos, t) + RADIO_SEGMENTO))
  }

  // Se enrosca alrededor de la rama.
  const iEnrosque = control.length
  const pasosEnrosque = Math.round(VUELTAS_ENROSQUE * 12)
  for (let k = 0; k <= pasosEnrosque; k++) {
    const angulo = (k / pasosEnrosque) * VUELTAS_ENROSQUE * VUELTA
    const t = marco.tEnrosque + (PASO_ENROSQUE * angulo) / VUELTA
    const r = radioRama(marco.datos, t) + RADIO_SEGMENTO + 0.004
    control.push(
      puntoEje(marco, t)
        .addScaledVector(marco.arriba, Math.cos(angulo) * r)
        .addScaledVector(marco.lado, Math.sin(angulo) * r),
    )
  }

  // Curva suave que pasa por todos los puntos de control, medida en metros.
  const curva = new CatmullRomCurve3(control, false, 'centripetal')
  const tramos = control.length - 1
  const porTramo = 16
  const densos: Vector3[] = []
  for (let j = 0; j < tramos; j++) {
    for (let k = 0; k < porTramo; k++) densos.push(curva.getPoint((j + k / porTramo) / tramos))
  }
  densos.push(curva.getPoint(1))
  densos.forEach(separarDeSuperficies)

  const acumulado = [0]
  for (let i = 1; i < densos.length; i++) acumulado.push(acumulado[i - 1] + densos[i].distanceTo(densos[i - 1]))
  const largo = acumulado[acumulado.length - 1]
  const distanciaEnControl = (indice: number) => acumulado[indice * porTramo]

  // Remuestreo a distancias iguales para ubicar cualquier punto al instante.
  const cantidad = Math.floor(largo / PASO_MUESTREO) + 1
  const puntos = new Float32Array(cantidad * 3)
  const p = new Vector3()
  let j = 0
  for (let i = 0; i < cantidad; i++) {
    const s = i * PASO_MUESTREO
    while (j < densos.length - 2 && acumulado[j + 1] < s) j++
    const tramo = acumulado[j + 1] - acumulado[j]
    const f = tramo > 0 ? Math.min(Math.max((s - acumulado[j]) / tramo, 0), 1) : 0
    p.lerpVectors(densos[j], densos[j + 1], f)
    separarDeSuperficies(p)
    puntos.set([p.x, p.y, p.z], i * 3)
  }

  const tangentes = new Float32Array(cantidad * 3)
  const t = new Vector3()
  for (let i = 0; i < cantidad; i++) {
    const a = Math.max(i - 1, 0) * 3
    const b = Math.min(i + 1, cantidad - 1) * 3
    t.set(puntos[b] - puntos[a], puntos[b + 1] - puntos[a + 1], puntos[b + 2] - puntos[a + 2]).normalize()
    tangentes.set([t.x, t.y, t.z], i * 3)
  }

  return {
    puntos,
    tangentes,
    cantidad,
    largo,
    sReposo: distanciaEnControl(iReposo),
    sRama: distanciaEnControl(iRama),
    sEnrosque: distanciaEnControl(iEnrosque),
    sFin: (cantidad - 1) * PASO_MUESTREO,
  }
}

const rutas = new Map<string, Ruta>()

/** Ruta completa (suelo → tronco → rama → enrosque) para podar una rama. Se calcula una sola vez. */
export function rutaDe(idRama: string): Ruta {
  let ruta = rutas.get(idRama)
  if (!ruta) {
    ruta = construirRuta(marcoDe(idRama))
    rutas.set(idRama, ruta)
  }
  return ruta
}

/** Posición y dirección del robot a "s" metros del inicio de la ruta. */
export function muestrear(ruta: Ruta, s: number, posicion: Vector3, tangente: Vector3): void {
  const f = Math.min(Math.max(s, 0), ruta.sFin) / PASO_MUESTREO
  const i = Math.min(Math.floor(f), ruta.cantidad - 2)
  const w = f - i
  const a = i * 3
  const b = a + 3
  const { puntos: p, tangentes: t } = ruta
  posicion.set(p[a] + (p[b] - p[a]) * w, p[a + 1] + (p[b + 1] - p[a + 1]) * w, p[a + 2] + (p[b + 2] - p[a + 2]) * w)
  tangente
    .set(t[a] + (t[b] - t[a]) * w, t[a + 1] + (t[b + 1] - t[a + 1]) * w, t[a + 2] + (t[b + 2] - t[a + 2]) * w)
    .normalize()
}
