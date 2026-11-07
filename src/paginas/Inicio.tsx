import { Link } from 'react-router'
import { ESLOGAN, NOMBRE_PRODUCTO } from '../config'
import { BENEFICIOS, PASOS_FUNCIONAMIENTO } from '../contenido/producto'
import { useAuthStore } from '../store/authStore'

export function Inicio() {
  const nombre = useAuthStore((s) => s.usuario?.nombre.split(' ')[0])

  return (
    <div className="pagina">
      <section className="portada">
        <p className="portada-saludo">Hola, {nombre}</p>
        <h1>{ESLOGAN}</h1>
        <p className="portada-texto">
          {NOMBRE_PRODUCTO} es un robot con forma de serpiente que trepa el tronco, llega a las ramas altas, se
          enrosca en ellas y las poda por presión. Así evitamos los accidentes de la poda en altura y dejamos tus
          árboles con un acabado más estético.
        </p>
        <div className="portada-acciones">
          <Link to="/funcionamiento" className="btn btn-primario">
            Ver cómo funciona
          </Link>
          <Link to="/reservas" className="btn btn-secundario">
            Agendar una poda
          </Link>
        </div>
      </section>

      <section className="secciones-principales" aria-label="Secciones">
        <Link to="/funcionamiento" className="tarjeta tarjeta-seccion">
          <span className="tarjeta-seccion-etiqueta">Sección 1</span>
          <h2>Funcionamiento del producto</h2>
          <p>Mira en una simulación 3D cómo el robot sube por el árbol, se enrosca en la rama y la corta.</p>
          <span className="tarjeta-seccion-ir">Ver la demostración →</span>
        </Link>
        <Link to="/reservas" className="tarjeta tarjeta-seccion">
          <span className="tarjeta-seccion-etiqueta">Sección 2</span>
          <h2>Reservas</h2>
          <p>Agenda una cita para podar tus árboles: elige fecha, hora y cuéntanos qué necesitas.</p>
          <span className="tarjeta-seccion-ir">Agendar una cita →</span>
        </Link>
      </section>

      <section>
        <h2 className="titulo-seccion">Cómo trabaja</h2>
        <ol className="pasos">
          {PASOS_FUNCIONAMIENTO.map((p, i) => (
            <li key={p.titulo} className="paso">
              <span className="paso-numero">{i + 1}</span>
              <h3>{p.titulo}</h3>
              <p>{p.texto}</p>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="titulo-seccion">Por qué elegirnos</h2>
        <div className="beneficios">
          {BENEFICIOS.map((b) => (
            <div key={b.titulo} className="tarjeta beneficio">
              <h3>{b.titulo}</h3>
              <p>{b.texto}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
