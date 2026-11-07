import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { Color, Vector3, type Mesh, type MeshStandardMaterial, type Object3D } from 'three'
import { RAMAS } from './datosArbol'
import { useDemoStore, type FaseDemo } from './demoStore'
import { posicionCabeza } from './estadoRobot'
import { EJE_Y, RADIO_SEGMENTO } from './geometria'
import { SEGMENTOS, SEPARACION, muestrear, rutaDe } from './ruta'

/** Metros por segundo en cada etapa (a velocidad 1×). */
const VELOCIDAD_ETAPA: Partial<Record<FaseDemo, number>> = {
  trepando: 1.3,
  avanzando: 0.8,
  enroscando: 0.7,
  bajando: 1.7,
}
/** Segundos que aprieta la rama y momento en que la rama se desprende. */
const DURACION_CORTE = 2.6
const MOMENTO_CORTE = 1.5
const COLOR_PRESION = new Color('#ff7a1a')

const COLOR_GRAFITO = '#2a3036'
const COLOR_VERDE = '#3a9a5e'

/** La cola se va haciendo más delgada en los últimos segmentos. */
function escalaSegmento(i: number): number {
  const desdeCola = SEGMENTOS - 1 - i
  return desdeCola >= 5 ? 1 : 0.55 + desdeCola * 0.09
}

interface Simulacion {
  s: number
  fase: FaseDemo
  tCorte: number
  cortado: boolean
  reinicio: number
  tiempo: number
}

export function Robot() {
  const partes = useRef<(Object3D | null)[]>([])
  const cuerpos = useRef<(Mesh | null)[]>([])
  const sim = useRef<Simulacion>({ s: 0, fase: 'espera', tCorte: 0, cortado: false, reinicio: -1, tiempo: 0 })
  const posicion = useRef(new Vector3())
  const tangente = useRef(new Vector3())

  useFrame((_, delta) => {
    const demo = useDemoStore.getState()
    const st = sim.current
    const ruta = rutaDe(demo.ramaEnCurso ?? RAMAS[0].id)

    // Reinicio o primer cuadro: el robot vuelve a su lugar de reposo.
    if (st.reinicio !== demo.reinicio) {
      Object.assign(st, { s: ruta.sReposo, fase: 'espera', tCorte: 0, cortado: false, reinicio: demo.reinicio })
    }
    // Se presionó "Iniciar poda".
    if ((st.fase === 'espera' || st.fase === 'terminado') && demo.fase === 'trepando') {
      Object.assign(st, { s: ruta.sReposo, fase: 'trepando', tCorte: 0, cortado: false })
    }

    const dt = demo.reproduciendo ? Math.min(delta, 0.05) * demo.velocidad : 0
    st.tiempo += dt

    switch (st.fase) {
      case 'trepando':
      case 'avanzando':
      case 'enroscando':
        st.s += (VELOCIDAD_ETAPA[st.fase] ?? 1) * dt
        if (st.s >= ruta.sFin) {
          st.s = ruta.sFin
          st.fase = 'cortando'
          st.tCorte = 0
        } else {
          st.fase = st.s < ruta.sRama ? 'trepando' : st.s < ruta.sEnrosque ? 'avanzando' : 'enroscando'
        }
        break
      case 'cortando':
        st.tCorte += dt
        if (!st.cortado && st.tCorte >= MOMENTO_CORTE && demo.ramaEnCurso) {
          st.cortado = true
          demo.cortarRama(demo.ramaEnCurso)
        }
        if (st.tCorte >= DURACION_CORTE) st.fase = 'bajando'
        break
      case 'bajando':
        st.s -= (VELOCIDAD_ETAPA.bajando ?? 1) * dt
        if (st.s <= ruta.sReposo) {
          st.s = ruta.sReposo
          st.fase = 'terminado'
        }
        break
    }
    if (st.fase !== demo.fase) demo.actualizarFase(st.fase)

    // Intensidad del apriete: sube, late mientras corta y se apaga al cortar.
    let presion = 0
    if (st.fase === 'cortando') {
      presion = st.cortado
        ? Math.max(0, 1 - (st.tCorte - MOMENTO_CORTE) / 0.6)
        : Math.min(1, st.tCorte / 0.5) * (0.65 + 0.35 * Math.sin(st.tiempo * 14))
    }

    for (let i = 0; i < SEGMENTOS; i++) {
      const parte = partes.current[i]
      if (!parte) continue
      const si = st.s - i * SEPARACION
      muestrear(ruta, si, posicion.current, tangente.current)
      parte.position.copy(posicion.current)
      parte.quaternion.setFromUnitVectors(EJE_Y, tangente.current)

      const apretando = presion > 0 && si >= ruta.sEnrosque - 0.05
      const apriete = apretando ? 1 - 0.1 * presion : 1
      const escala = escalaSegmento(i)
      parte.scale.set(escala * apriete, escala, escala * apriete)

      const material = cuerpos.current[i]?.material as MeshStandardMaterial | undefined
      if (material) {
        material.emissive.copy(COLOR_PRESION)
        material.emissiveIntensity = apretando ? presion * 0.8 : 0
      }
      if (i === 0) posicionCabeza.copy(posicion.current)
    }
  })

  return (
    <group>
      {Array.from({ length: SEGMENTOS }, (_, i) =>
        i === 0 ? (
          // Cabeza: un poco más grande, con anillo verde y sensor luminoso al frente.
          <group key={i} ref={(g) => void (partes.current[i] = g)}>
            <mesh ref={(m) => void (cuerpos.current[i] = m)} castShadow>
              <capsuleGeometry args={[RADIO_SEGMENTO * 1.15, 0.14, 6, 16]} />
              <meshStandardMaterial color={COLOR_GRAFITO} metalness={0.55} roughness={0.35} />
            </mesh>
            <mesh position={[0, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[RADIO_SEGMENTO * 1.17, 0.013, 8, 24]} />
              <meshStandardMaterial color={COLOR_VERDE} />
            </mesh>
            <mesh position={[0, 0.17, 0]}>
              <sphereGeometry args={[0.045, 16, 12]} />
              <meshStandardMaterial color="#0b1418" emissive="#56d8ff" emissiveIntensity={2.2} />
            </mesh>
          </group>
        ) : (
          <mesh
            key={i}
            ref={(m) => {
              partes.current[i] = m
              cuerpos.current[i] = m
            }}
            castShadow
          >
            <capsuleGeometry args={[RADIO_SEGMENTO, 0.06, 4, 14]} />
            <meshStandardMaterial
              color={i % 2 ? COLOR_VERDE : COLOR_GRAFITO}
              metalness={i % 2 ? 0.25 : 0.55}
              roughness={0.4}
            />
          </mesh>
        ),
      )}
    </group>
  )
}
