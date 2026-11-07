import { OrbitControls } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { CuboidCollider, CylinderCollider, Physics, RigidBody } from '@react-three/rapier'
import { Suspense, useRef, type ComponentRef } from 'react'
import { Vector3 } from 'three'
import { Arbol } from './Arbol'
import { TRONCO } from './datosArbol'
import { useDemoStore } from './demoStore'
import { Entorno } from './Entorno'
import { posicionCabeza } from './estadoRobot'
import { Operario } from './Operario'
import { Robot } from './Robot'

// Vista inicial calculada para que entren el árbol completo, el robot y el operario.
const POSICION_CAMARA = new Vector3(11.6, 8.9, 13.2)
const OBJETIVO_CAMARA = new Vector3(0.3, 4.4, 0.6)
/** Distancia a la que se acerca la cámara al activar "Seguir al robot". */
const DISTANCIA_SEGUIMIENTO = 6.5
const COLOR_CIELO = '#d4e8f1'

/** Cámara orbital; puede seguir al robot y volver a la vista inicial. */
function Controles() {
  const controles = useRef<ComponentRef<typeof OrbitControls>>(null)
  const vista = useRef(0)
  const desplazamiento = useRef(new Vector3())
  const seguimiento = useRef({ activo: false, acercando: false })

  useFrame(({ camera }) => {
    const c = controles.current
    if (!c) return
    const demo = useDemoStore.getState()
    const seguir = seguimiento.current

    if (vista.current !== demo.vista) {
      vista.current = demo.vista
      camera.position.copy(POSICION_CAMARA)
      c.target.copy(OBJETIVO_CAMARA)
      c.update()
    }

    // Al activar el seguimiento, la cámara se acerca una vez; después el usuario puede alejarla.
    if (demo.seguirRobot && !seguir.activo) seguir.acercando = true
    seguir.activo = demo.seguirRobot
    if (!demo.seguirRobot) return

    const d = desplazamiento.current.subVectors(camera.position, c.target)
    if (seguir.acercando) {
      const largo = d.length()
      d.setLength(largo + (DISTANCIA_SEGUIMIENTO - largo) * 0.05)
      if (Math.abs(largo - DISTANCIA_SEGUIMIENTO) < 0.1) seguir.acercando = false
    }
    // Mueve el punto de mira hacia la cabeza y arrastra la cámara con él.
    c.target.lerp(posicionCabeza, 0.06)
    camera.position.addVectors(c.target, d)
  })

  return (
    <OrbitControls
      ref={controles}
      makeDefault
      target={OBJETIVO_CAMARA.toArray()}
      enableDamping
      minDistance={2.5}
      maxDistance={26}
      maxPolarAngle={Math.PI / 2 - 0.04}
    />
  )
}

/** Escena 3D completa. Se carga aparte (lazy) para que el resto de la web abra rápido. */
export default function Escena() {
  const reproduciendo = useDemoStore((s) => s.reproduciendo)

  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 2]}
      camera={{ position: POSICION_CAMARA.toArray(), fov: 45, near: 0.1, far: 150 }}
      role="img"
      aria-label="Simulación 3D: un robot serpiente trepa un árbol, se enrosca en una rama y la poda"
    >
      <color attach="background" args={[COLOR_CIELO]} />
      <fog attach="fog" args={[COLOR_CIELO, 24, 60]} />
      <hemisphereLight args={['#eef7ff', '#55733a', 1.2]} />
      <directionalLight
        position={[7, 13, 6]}
        intensity={2.3}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={12}
        shadow-camera-bottom={-10}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-bias={-0.0004}
      />

      <Entorno />
      <Operario />
      <Robot />

      {/* El motor de física se descarga aparte; mientras tanto el árbol no se dibuja. */}
      <Suspense fallback={null}>
        <Physics paused={!reproduciendo}>
          <RigidBody type="fixed" colliders={false}>
            <CuboidCollider args={[40, 0.1, 40]} position={[0, -0.1, 0]} />
            <CylinderCollider args={[TRONCO.alto / 2, TRONCO.radioBase]} position={[0, TRONCO.alto / 2, 0]} />
          </RigidBody>
          <Arbol />
        </Physics>
      </Suspense>

      <Controles />
    </Canvas>
  )
}
