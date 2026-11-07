import { lazy, Suspense, useEffect, useState } from 'react'
import { LimiteError } from '../componentes/LimiteError'
import { PASOS_FUNCIONAMIENTO } from '../contenido/producto'
import { pasoDeFase, useDemoStore } from '../demo/demoStore'
import { PanelControl } from '../demo/PanelControl'

// La escena 3D (Three.js + física) pesa bastante: se descarga solo al entrar aquí.
const Escena = lazy(() => import('../demo/Escena'))

function navegadorSoportaWebGL(): boolean {
  try {
    const lienzo = document.createElement('canvas')
    return Boolean(lienzo.getContext('webgl2') ?? lienzo.getContext('webgl'))
  } catch {
    return false
  }
}

function AvisoVisor({ titulo, texto }: { titulo: string; texto?: string }) {
  return (
    <div className="aviso-visor">
      <strong>{titulo}</strong>
      {texto && <p>{texto}</p>}
    </div>
  )
}

export function Funcionamiento() {
  const fase = useDemoStore((s) => s.fase)
  const paso = pasoDeFase(fase)
  const [soportaWebGL] = useState(navegadorSoportaWebGL)

  // Al salir de la página, la demostración vuelve a su estado inicial.
  useEffect(() => () => useDemoStore.getState().reiniciar(), [])

  return (
    <div className="pagina">
      <header className="encabezado-pagina">
        <h1>Funcionamiento del producto</h1>
        <p className="texto-suave">
          Simulación 3D del robot serpiente. Elige una rama, inicia la poda y observa cada paso.
        </p>
      </header>

      <section className="demo" aria-label="Demostración interactiva">
        <div className="demo-visor">
          {soportaWebGL ? (
            <LimiteError
              respaldo={
                <AvisoVisor
                  titulo="No se pudo cargar la simulación 3D"
                  texto="Recarga la página o prueba con otro navegador."
                />
              }
            >
              <Suspense fallback={<AvisoVisor titulo="Cargando simulación 3D…" />}>
                <Escena />
              </Suspense>
            </LimiteError>
          ) : (
            <AvisoVisor
              titulo="Tu navegador no puede mostrar gráficos 3D"
              texto="Prueba con una versión actual de Chrome, Firefox o Edge."
            />
          )}
          <p className="demo-ayuda">Arrastra para girar · Rueda o pellizca para acercar</p>
        </div>

        <PanelControl />
      </section>

      <ol className="pasos">
        {PASOS_FUNCIONAMIENTO.map((p, i) => {
          const activo = i === paso
          const hecho = paso !== null && i < paso
          return (
            <li
              key={p.titulo}
              className={`paso${activo ? ' paso-activo' : ''}${hecho ? ' paso-hecho' : ''}`}
              aria-current={activo ? 'step' : undefined}
            >
              <span className="paso-numero">{hecho ? '✓' : i + 1}</span>
              <h3>{p.titulo}</h3>
              <p>{p.texto}</p>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
