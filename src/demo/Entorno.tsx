import { aleatorioConSemilla } from './geometria'

// Escenario: césped, arbustos, piedras y árboles lejanos para dar profundidad.

const ARBUSTOS: [x: number, z: number, radio: number][] = [
  [-5, -4, 0.9],
  [-6.5, 2.5, 0.7],
  [4.5, -6.5, 1],
  [9, -3, 0.8],
  [-3.2, 8, 0.75],
]

const PIEDRAS: [x: number, z: number, radio: number][] = [
  [2.8, 3.3, 0.22],
  [-3.5, -1.5, 0.3],
  [6.5, 1.5, 0.18],
]

const ARBOLES_LEJANOS = (() => {
  const azar = aleatorioConSemilla(42)
  return Array.from({ length: 12 }, (_, i) => {
    const angulo = (i / 12) * Math.PI * 2 + azar() * 0.3
    const distancia = 17 + azar() * 7
    return { x: Math.cos(angulo) * distancia, z: Math.sin(angulo) * distancia, alto: 3.5 + azar() * 3 }
  })
})()

export function Entorno() {
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[60, 64]} />
        <meshStandardMaterial color="#8dbb63" roughness={1} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.004} receiveShadow>
        <circleGeometry args={[2.2, 40]} />
        <meshStandardMaterial color="#7aa553" roughness={1} />
      </mesh>

      {ARBUSTOS.map(([x, z, r], i) => (
        <mesh key={`arbusto-${i}`} position={[x, r * 0.6, z]} castShadow receiveShadow>
          <icosahedronGeometry args={[r, 0]} />
          <meshStandardMaterial color={i % 2 ? '#4f8f3f' : '#5c9c45'} roughness={0.9} flatShading />
        </mesh>
      ))}

      {PIEDRAS.map(([x, z, r], i) => (
        <mesh key={`piedra-${i}`} position={[x, r * 0.5, z]} castShadow receiveShadow>
          <dodecahedronGeometry args={[r, 0]} />
          <meshStandardMaterial color="#9aa0a3" roughness={0.9} flatShading />
        </mesh>
      ))}

      {ARBOLES_LEJANOS.map((a, i) => (
        <group key={`lejano-${i}`} position={[a.x, 0, a.z]}>
          <mesh position-y={0.6}>
            <cylinderGeometry args={[0.15, 0.22, 1.2, 6]} />
            <meshStandardMaterial color="#6b4a2e" flatShading />
          </mesh>
          <mesh position-y={1.1 + a.alto / 2}>
            <coneGeometry args={[a.alto * 0.32, a.alto, 7]} />
            <meshStandardMaterial color={i % 2 ? '#3f7d3a' : '#4a8a40'} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  )
}
