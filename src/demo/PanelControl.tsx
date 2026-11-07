import { RAMAS } from './datosArbol'
import { VELOCIDADES, estaEnCurso, useDemoStore, type FaseDemo } from './demoStore'

// Este archivo no importa Three.js: el panel aparece al instante aunque la escena 3D siga cargando.

const ESTADOS: Record<FaseDemo, { titulo: string; detalle: string }> = {
  espera: { titulo: 'Listo para empezar', detalle: 'Elige una rama y presiona «Iniciar poda».' },
  trepando: { titulo: 'Paso 1 de 4 · Trepa por el tronco', detalle: 'El robot sube en espiral sujetándose al tronco.' },
  avanzando: { titulo: 'Paso 2 de 4 · Llega a la rama', detalle: 'Avanza sobre la rama hasta el punto de corte.' },
  enroscando: { titulo: 'Paso 3 de 4 · Se enrosca', detalle: 'Rodea la rama para sujetarla con firmeza.' },
  cortando: {
    titulo: 'Paso 3 de 4 · Poda por presión',
    detalle: 'Aprieta la rama hasta cortarla y la parte cortada cae al suelo.',
  },
  bajando: { titulo: 'Paso 4 de 4 · Baja', detalle: 'Se desenrosca y vuelve al suelo para la siguiente rama.' },
  terminado: { titulo: 'Poda terminada', detalle: 'Elige otra rama para seguir podando.' },
}

export function PanelControl() {
  const fase = useDemoStore((s) => s.fase)
  const ramaId = useDemoStore((s) => s.ramaId)
  const ramasCortadas = useDemoStore((s) => s.ramasCortadas)
  const reproduciendo = useDemoStore((s) => s.reproduciendo)
  const velocidad = useDemoStore((s) => s.velocidad)
  const seguirRobot = useDemoStore((s) => s.seguirRobot)
  const { seleccionarRama, iniciar, alternarPausa, reiniciar, cambiarVelocidad, cambiarSeguirRobot, centrarVista } =
    useDemoStore.getState()

  const enCurso = estaEnCurso(fase)
  const todasCortadas = ramasCortadas.length === RAMAS.length
  const estado = ESTADOS[fase]
  const detalle =
    fase === 'terminado' && todasCortadas
      ? 'Podaste todas las ramas. Presiona «Reiniciar» para volver a empezar.'
      : estado.detalle

  return (
    <aside className="tarjeta panel-demo" aria-label="Controles de la simulación">
      <div className={`panel-estado${enCurso ? ' en-curso' : ''}`} aria-live="polite">
        <strong>
          {enCurso && !reproduciendo ? 'En pausa · ' : ''}
          {estado.titulo}
        </strong>
        <p>{detalle}</p>
      </div>

      <fieldset className="panel-grupo" disabled={enCurso}>
        <legend className="panel-titulo">Rama a podar</legend>
        <div className="opciones-rama">
          {RAMAS.map((rama) => {
            const cortada = ramasCortadas.includes(rama.id)
            const activa = ramaId === rama.id
            return (
              <button
                key={rama.id}
                type="button"
                className={`opcion-rama${activa ? ' activa' : ''}`}
                aria-pressed={activa}
                disabled={cortada}
                onClick={() => seleccionarRama(rama.id)}
              >
                <span className="opcion-rama-letra">{rama.id}</span>
                <span className="opcion-rama-detalle">
                  {cortada ? 'Podada' : `${rama.altura.toLocaleString('es', { minimumFractionDigits: 1 })} m`}
                </span>
              </button>
            )
          })}
        </div>
        <p className="panel-nota">También puedes hacer clic en una rama del árbol.</p>
      </fieldset>

      <div className="panel-acciones">
        {enCurso ? (
          <button type="button" className="btn btn-primario" onClick={alternarPausa}>
            {reproduciendo ? 'Pausar' : 'Continuar'}
          </button>
        ) : (
          <button type="button" className="btn btn-primario" onClick={iniciar} disabled={!ramaId}>
            Iniciar poda
          </button>
        )}
        <button type="button" className="btn btn-secundario" onClick={reiniciar}>
          Reiniciar
        </button>
      </div>

      <div className="panel-grupo">
        <span className="panel-titulo" id="titulo-velocidad">
          Velocidad
        </span>
        <div className="segmentado" role="group" aria-labelledby="titulo-velocidad">
          {VELOCIDADES.map((v) => (
            <button
              key={v}
              type="button"
              className={velocidad === v ? 'activo' : ''}
              aria-pressed={velocidad === v}
              onClick={() => cambiarVelocidad(v)}
            >
              {v.toLocaleString('es')}×
            </button>
          ))}
        </div>
      </div>

      <div className="panel-grupo">
        <span className="panel-titulo">Cámara</span>
        <div className="panel-camara">
          <label className="casilla">
            <input type="checkbox" checked={seguirRobot} onChange={(e) => cambiarSeguirRobot(e.target.checked)} />
            Seguir al robot
          </label>
          <button type="button" className="btn btn-secundario btn-chico" onClick={centrarVista}>
            Centrar vista
          </button>
        </div>
      </div>

      <p className="panel-contador">
        Ramas podadas: <strong>{ramasCortadas.length}</strong> de {RAMAS.length}
      </p>
    </aside>
  )
}
