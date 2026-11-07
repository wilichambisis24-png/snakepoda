import { create } from 'zustand'
import { RAMAS } from './datosArbol'

/** Etapas de la simulación. El robot (Robot.tsx) avanza entre ellas y las publica aquí. */
export type FaseDemo = 'espera' | 'trepando' | 'avanzando' | 'enroscando' | 'cortando' | 'bajando' | 'terminado'

export const VELOCIDADES = [0.5, 1, 2] as const

export function estaEnCurso(fase: FaseDemo): boolean {
  return fase !== 'espera' && fase !== 'terminado'
}

/**
 * Paso de la explicación (0 a 3) que corresponde a la fase.
 * null = todavía no empieza; 4 = terminó todos los pasos.
 */
export function pasoDeFase(fase: FaseDemo): number | null {
  switch (fase) {
    case 'espera':
      return null
    case 'trepando':
      return 0
    case 'avanzando':
      return 1
    case 'enroscando':
    case 'cortando':
      return 2
    case 'bajando':
      return 3
    case 'terminado':
      return 4
  }
}

interface EstadoDemo {
  fase: FaseDemo
  /** Rama elegida en el panel o con clic en el árbol. */
  ramaId: string | null
  /** Rama que se está podando en el recorrido actual. */
  ramaEnCurso: string | null
  ramasCortadas: string[]
  reproduciendo: boolean
  velocidad: number
  seguirRobot: boolean
  /** Contadores que la escena observa para reiniciarse o recolocar la cámara. */
  reinicio: number
  vista: number

  seleccionarRama: (id: string) => void
  iniciar: () => void
  alternarPausa: () => void
  reiniciar: () => void
  actualizarFase: (fase: FaseDemo) => void
  cortarRama: (id: string) => void
  cambiarVelocidad: (velocidad: number) => void
  cambiarSeguirRobot: (seguir: boolean) => void
  centrarVista: () => void
}

function primeraRamaSinCortar(cortadas: string[]): string | null {
  return RAMAS.find((r) => !cortadas.includes(r.id))?.id ?? null
}

export const useDemoStore = create<EstadoDemo>()((set, get) => ({
  fase: 'espera',
  ramaId: RAMAS[0].id,
  ramaEnCurso: null,
  ramasCortadas: [],
  reproduciendo: true,
  velocidad: 1,
  seguirRobot: false,
  reinicio: 0,
  vista: 0,

  seleccionarRama: (id) => {
    const { fase, ramasCortadas } = get()
    if (estaEnCurso(fase) || ramasCortadas.includes(id)) return
    set({ ramaId: id })
  },

  iniciar: () => {
    const { fase, ramaId, ramasCortadas } = get()
    if (estaEnCurso(fase) || !ramaId || ramasCortadas.includes(ramaId)) return
    set({ fase: 'trepando', ramaEnCurso: ramaId, reproduciendo: true })
  },

  alternarPausa: () => set((s) => ({ reproduciendo: !s.reproduciendo })),

  reiniciar: () =>
    set((s) => ({
      fase: 'espera',
      ramaId: RAMAS[0].id,
      ramaEnCurso: null,
      ramasCortadas: [],
      reproduciendo: true,
      reinicio: s.reinicio + 1,
    })),

  actualizarFase: (fase) =>
    set((s) => (fase === 'terminado' ? { fase, ramaId: primeraRamaSinCortar(s.ramasCortadas) } : { fase })),

  cortarRama: (id) =>
    set((s) => (s.ramasCortadas.includes(id) ? {} : { ramasCortadas: [...s.ramasCortadas, id] })),

  cambiarVelocidad: (velocidad) => set({ velocidad }),
  cambiarSeguirRobot: (seguirRobot) => set({ seguirRobot }),
  centrarVista: () => set((s) => ({ vista: s.vista + 1, seguirRobot: false })),
}))
