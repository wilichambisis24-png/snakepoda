import { Html, useCursor } from '@react-three/drei'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import { useRef, useState } from 'react'
import { Vector3, type Mesh } from 'three'
import { TRONCO } from './datosArbol'
import { estaEnCurso, useDemoStore } from './demoStore'
import { MARCOS, aleatorioConSemilla, puntoEje, radioRama, type MarcoRama } from './geometria'

const COLOR_CORTEZA = '#6b4a2e'
const COLOR_MADERA = '#e2c48f'
const COLOR_RESALTE = '#ffcf4d'
const COLORES_HOJA = ['#3f7d3a', '#4f8f3f', '#5c9c45', '#376f33']
const CANTIDAD_ASTILLAS = 14

interface Hoja {
  posicion: [number, number, number]
  radio: number
  color: string
}

/** Parte de la rama que queda afuera del corte (la que cae), en su propio sistema local. */
interface Pieza {
  centro: Vector3
  largo: number
  radioInicio: number
  radioFin: number
  hojas: Hoja[]
  puntoCorte: Vector3
  centroInterior: Vector3
  etiqueta: Vector3
}

function crearPieza(marco: MarcoRama, indice: number): Pieza {
  const { datos, tCorte } = marco
  const largo = datos.largo - tCorte
  const azar = aleatorioConSemilla(101 + indice * 17)
  // Las hojas empiezan a la mitad de la pieza para no tapar al robot enroscado.
  const hojas: Hoja[] = Array.from({ length: 4 }, (_, k) => ({
    posicion: [(azar() - 0.5) * 0.45, (0.05 + 0.45 * (k / 3)) * largo, (azar() - 0.5) * 0.45],
    radio: 0.26 + azar() * 0.14,
    color: COLORES_HOJA[Math.floor(azar() * COLORES_HOJA.length)],
  }))
  hojas.push({ posicion: [0, largo / 2 + 0.12, 0], radio: 0.38, color: COLORES_HOJA[indice % COLORES_HOJA.length] })

  return {
    centro: puntoEje(marco, tCorte + largo / 2),
    largo,
    radioInicio: radioRama(datos, tCorte),
    radioFin: radioRama(datos, datos.largo),
    hojas,
    puntoCorte: puntoEje(marco, tCorte),
    centroInterior: puntoEje(marco, tCorte / 2),
    etiqueta: puntoEje(marco, tCorte + largo * 0.35).addScaledVector(marco.arriba, 0.75),
  }
}

const PIEZAS = MARCOS.map(crearPieza)

const HOJAS_COPA: Hoja[] = (() => {
  const azar = aleatorioConSemilla(7)
  const hojas: Hoja[] = [{ posicion: [0, TRONCO.alto + 0.55, 0], radio: 1.05, color: COLORES_HOJA[1] }]
  for (let k = 0; k < 7; k++) {
    const angulo = (k / 7) * Math.PI * 2 + azar() * 0.4
    const distancia = 0.55 + azar() * 0.45
    hojas.push({
      posicion: [Math.cos(angulo) * distancia, TRONCO.alto + azar() * 0.8, Math.sin(angulo) * distancia],
      radio: 0.5 + azar() * 0.3,
      color: COLORES_HOJA[Math.floor(azar() * COLORES_HOJA.length)],
    })
  }
  return hojas
})()

function Follaje({ hojas }: { hojas: Hoja[] }) {
  return hojas.map((h, i) => (
    <mesh key={i} position={h.posicion} castShadow>
      <icosahedronGeometry args={[h.radio, 0]} />
      <meshStandardMaterial color={h.color} roughness={0.9} flatShading />
    </mesh>
  ))
}

function CaraDeCorte({ radio, y = 0 }: { radio: number; y?: number }) {
  return (
    <mesh position={[0, y, 0]}>
      <cylinderGeometry args={[radio * 0.97, radio * 0.97, 0.015, 14]} />
      <meshStandardMaterial color={COLOR_MADERA} />
    </mesh>
  )
}

function PiezaExterior({ pieza, cortada, resalte }: { pieza: Pieza; cortada: boolean; resalte: number }) {
  return (
    <>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[pieza.radioFin, pieza.radioInicio, pieza.largo, 10]} />
        <meshStandardMaterial
          color={COLOR_CORTEZA}
          roughness={0.95}
          flatShading
          emissive={COLOR_RESALTE}
          emissiveIntensity={resalte}
        />
      </mesh>
      {cortada && <CaraDeCorte radio={pieza.radioInicio} y={-pieza.largo / 2} />}
      <Follaje hojas={pieza.hojas} />
    </>
  )
}

/** Virutas que saltan en el momento del corte. */
function Astillas({ origen, semilla }: { origen: Vector3; semilla: number }) {
  const mallas = useRef<(Mesh | null)[]>([])
  const particulas = useRef<{ p: Vector3; v: Vector3; giro: number }[] | null>(null)

  useFrame((_, delta) => {
    const demo = useDemoStore.getState()
    const dt = demo.reproduciendo ? Math.min(delta, 0.05) * demo.velocidad : 0
    if (!particulas.current) {
      const azar = aleatorioConSemilla(semilla)
      particulas.current = Array.from({ length: CANTIDAD_ASTILLAS }, () => ({
        p: origen.clone(),
        v: new Vector3((azar() - 0.5) * 2.4, azar() * 1.8, (azar() - 0.5) * 2.4),
        giro: 4 + azar() * 8,
      }))
    }
    particulas.current.forEach((a, i) => {
      const malla = mallas.current[i]
      if (!malla) return
      if (a.p.y > 0.02) {
        a.v.y -= 9.8 * dt
        a.p.addScaledVector(a.v, dt)
        malla.rotation.x += a.giro * dt
        malla.rotation.z += a.giro * 0.7 * dt
      }
      a.p.y = Math.max(a.p.y, 0.02)
      malla.position.copy(a.p)
    })
  })

  return Array.from({ length: CANTIDAD_ASTILLAS }, (_, i) => (
    <mesh key={i} ref={(m) => void (mallas.current[i] = m)} position={origen} castShadow>
      <boxGeometry args={[0.05, 0.022, 0.04]} />
      <meshStandardMaterial color={COLOR_MADERA} />
    </mesh>
  ))
}

interface PropsRama {
  marco: MarcoRama
  pieza: Pieza
  indice: number
  cortada: boolean
  seleccionada: boolean
  elegible: boolean
  reinicio: number
}

function Rama({ marco, pieza, indice, cortada, seleccionada, elegible, reinicio }: PropsRama) {
  const seleccionarRama = useDemoStore((s) => s.seleccionarRama)
  const [sobre, setSobre] = useState(false)
  const interactiva = elegible && !cortada
  useCursor(sobre && interactiva)
  const resalte = cortada ? 0 : seleccionada ? 0.35 : sobre && interactiva ? 0.18 : 0

  const eventos = {
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      setSobre(true)
    },
    onPointerOut: () => setSobre(false),
    onClick: (e: ThreeEvent<MouseEvent>) => {
      // Ignora el clic si en realidad fue un arrastre para girar la cámara.
      if (!interactiva || e.delta > 6) return
      e.stopPropagation()
      seleccionarRama(marco.datos.id)
    },
  }

  // Al cortar, la pieza exterior cae inclinándose hacia afuera.
  const horizontal = new Vector3(marco.dir.x, 0, marco.dir.z).normalize()
  const giro = marco.lado.clone().multiplyScalar(-0.9)

  return (
    <group>
      <mesh position={pieza.centroInterior} quaternion={marco.rotacion} castShadow receiveShadow {...eventos}>
        <cylinderGeometry args={[pieza.radioInicio, marco.datos.radio, marco.tCorte, 12]} />
        <meshStandardMaterial
          color={COLOR_CORTEZA}
          roughness={0.95}
          flatShading
          emissive={COLOR_RESALTE}
          emissiveIntensity={resalte}
        />
      </mesh>

      {cortada ? (
        <>
          <group position={pieza.puntoCorte} quaternion={marco.rotacion}>
            <CaraDeCorte radio={pieza.radioInicio} />
          </group>
          <RigidBody
            key={reinicio}
            colliders="hull"
            position={pieza.centro}
            quaternion={marco.rotacion}
            linearVelocity={[horizontal.x * 1.2, 0, horizontal.z * 1.2]}
            angularVelocity={[giro.x, giro.y, giro.z]}
            friction={0.9}
            restitution={0.15}
          >
            <PiezaExterior pieza={pieza} cortada resalte={0} />
          </RigidBody>
          <Astillas origen={pieza.puntoCorte} semilla={500 + indice} />
        </>
      ) : (
        <group position={pieza.centro} quaternion={marco.rotacion} {...eventos}>
          <PiezaExterior pieza={pieza} cortada={false} resalte={resalte} />
        </group>
      )}

      {interactiva && (
        <Html position={pieza.etiqueta} center zIndexRange={[5, 0]}>
          <button
            type="button"
            className={`etiqueta-rama${seleccionada ? ' activa' : ''}`}
            aria-label={`Elegir rama ${marco.datos.id}`}
            aria-pressed={seleccionada}
            // Sin esto, el control de la cámara se queda con el clic y la etiqueta no responde.
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => seleccionarRama(marco.datos.id)}
          >
            {marco.datos.id}
          </button>
        </Html>
      )}
    </group>
  )
}

/** Tronco, copa y ramas. Debe ir dentro de <Physics> porque las ramas cortadas caen con física. */
export function Arbol() {
  const ramasCortadas = useDemoStore((s) => s.ramasCortadas)
  const ramaId = useDemoStore((s) => s.ramaId)
  const fase = useDemoStore((s) => s.fase)
  const reinicio = useDemoStore((s) => s.reinicio)
  const elegible = !estaEnCurso(fase)

  return (
    <group>
      <mesh position={[0, TRONCO.alto / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[TRONCO.radioCima, TRONCO.radioBase, TRONCO.alto, 18, 6]} />
        <meshStandardMaterial color={COLOR_CORTEZA} roughness={0.95} flatShading />
      </mesh>
      <Follaje hojas={HOJAS_COPA} />

      {MARCOS.map((marco, i) => (
        <Rama
          key={marco.datos.id}
          marco={marco}
          pieza={PIEZAS[i]}
          indice={i}
          cortada={ramasCortadas.includes(marco.datos.id)}
          seleccionada={ramaId === marco.datos.id}
          elegible={elegible}
          reinicio={reinicio}
        />
      ))}
    </group>
  )
}
