import { Proximamente } from '../componentes/Proximamente'
import { PASOS_FUNCIONAMIENTO } from '../contenido/producto'

export function Funcionamiento() {
  return (
    <div className="pagina">
      <header className="encabezado-pagina">
        <h1>Funcionamiento del producto</h1>
        <p className="texto-suave">Así trabaja el robot serpiente en cada poda.</p>
      </header>

      <Proximamente
        fase={2}
        puntos={[
          'Simulación 3D interactiva: un árbol y el robot serpiente que puedes girar y acercar.',
          'Animación completa: trepa, llega a la rama, se enrosca, corta y la rama cae con física real.',
          'Panel de control para elegir la rama, la velocidad y repetir la demostración.',
        ]}
      />

      <ol className="pasos">
        {PASOS_FUNCIONAMIENTO.map((p, i) => (
          <li key={p.titulo} className="paso">
            <span className="paso-numero">{i + 1}</span>
            <h3>{p.titulo}</h3>
            <p>{p.texto}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}
