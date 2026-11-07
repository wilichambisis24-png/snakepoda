// Medidas del árbol de la demostración, en metros y grados.
// Este archivo no usa Three.js para que el panel de control pueda leerlo
// sin cargar la parte 3D.

export interface DatosRama {
  id: string
  /** Altura donde la rama sale del tronco. */
  altura: number
  /** Dirección horizontal hacia donde crece (0° = eje X, sentido antihorario visto desde arriba). */
  azimut: number
  /** Inclinación hacia arriba respecto al suelo. */
  elevacion: number
  largo: number
  /** Radio en la unión con el tronco. */
  radio: number
}

export const TRONCO = { alto: 9.2, radioBase: 0.42, radioCima: 0.2 } as const

export const RAMAS: readonly DatosRama[] = [
  { id: 'A', altura: 3.4, azimut: 20, elevacion: 28, largo: 3.0, radio: 0.13 },
  { id: 'B', altura: 4.9, azimut: 150, elevacion: 32, largo: 2.8, radio: 0.12 },
  { id: 'C', altura: 6.2, azimut: 265, elevacion: 30, largo: 2.6, radio: 0.11 },
  { id: 'D', altura: 7.3, azimut: 305, elevacion: 38, largo: 2.3, radio: 0.1 },
]
