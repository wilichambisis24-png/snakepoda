import { AZIMUT_OPERARIO, DISTANCIA_OPERARIO } from './ruta'

const X = Math.cos(AZIMUT_OPERARIO) * DISTANCIA_OPERARIO
const Z = Math.sin(AZIMUT_OPERARIO) * DISTANCIA_OPERARIO
/** Gira la figura para que mire al árbol (su frente es el eje +Z local). */
const GIRO = Math.atan2(-X, -Z)

/** Persona de 1,78 m que supervisa desde el suelo con una tableta: da escala a la escena. */
export function Operario() {
  return (
    <group position={[X, 0, Z]} rotation-y={GIRO}>
      {[-0.1, 0.1].map((x) => (
        <mesh key={x} position={[x, 0.43, 0]} castShadow>
          <capsuleGeometry args={[0.075, 0.7, 4, 10]} />
          <meshStandardMaterial color="#2b3a55" />
        </mesh>
      ))}
      <mesh position={[0, 1.15, 0]} castShadow>
        <capsuleGeometry args={[0.19, 0.38, 6, 14]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.08, 0]}>
        <cylinderGeometry args={[0.196, 0.196, 0.05, 20]} />
        <meshStandardMaterial color="#e5e7eb" emissive="#ffffff" emissiveIntensity={0.15} />
      </mesh>
      <mesh position={[0, 1.6, 0]} castShadow>
        <sphereGeometry args={[0.12, 20, 14]} />
        <meshStandardMaterial color="#d9a37c" />
      </mesh>
      <mesh position={[0, 1.64, 0]} castShadow>
        <sphereGeometry args={[0.137, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#facc15" roughness={0.4} />
      </mesh>
      {[-0.23, 0.23].map((x) => (
        <mesh key={x} position={[x, 1.2, 0.12]} rotation-x={-1} castShadow>
          <capsuleGeometry args={[0.055, 0.36, 4, 8]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, 1.1, 0.36]} rotation-x={-0.7} castShadow>
        <boxGeometry args={[0.32, 0.22, 0.02]} />
        <meshStandardMaterial color="#1f2937" emissive="#5ee0ff" emissiveIntensity={0.35} />
      </mesh>
    </group>
  )
}
