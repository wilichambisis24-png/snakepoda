import { Outlet } from 'react-router'
import { ESLOGAN } from '../config'
import { BENEFICIOS } from '../contenido/producto'
import { Logo } from './Logo'

/** Pantalla dividida para login y registro: marca a la izquierda, formulario a la derecha. */
export function DisenoAcceso() {
  return (
    <div className="acceso">
      <aside className="acceso-marca">
        <Logo tamano={44} />
        <h1 className="acceso-eslogan">{ESLOGAN}</h1>
        <p className="acceso-descripcion">
          Un robot con forma de serpiente que trepa el tronco, se enrosca en las ramas y las poda por presión.
        </p>
        <ul className="acceso-beneficios">
          {BENEFICIOS.map((b) => (
            <li key={b.titulo}>
              <strong>{b.titulo}.</strong> {b.texto}
            </li>
          ))}
        </ul>
      </aside>

      <main className="acceso-formulario">
        <Outlet />
      </main>
    </div>
  )
}
