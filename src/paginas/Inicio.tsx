import { Icono, type NombreIcono } from '../componentes/Iconos'
import { NOMBRE_PRODUCTO } from '../config'
import { ARQUITECTURA, GRUPO, INTEGRANTES, PROYECTO } from '../contenido/equipo'
import { useAuthStore } from '../store/authStore'

const ICONOS_PROYECTO: NombreIcono[] = ['peligro', 'robot', 'web']

const iniciales = (nombre: string) =>
  nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('')

/** Página de inicio: presentación del grupo y del proyecto. */
export function Inicio() {
  const nombre = useAuthStore((s) => s.usuario?.nombre.split(' ')[0])

  return (
    <div className="pagina">
      <section className="portada portada-grupo">
        <div>
          <p className="portada-saludo">Hola, {nombre}</p>
          <p className="portada-antetitulo">
            {GRUPO.institucion} · {GRUPO.materia}
          </p>
          <h1>Somos {GRUPO.nombre}</h1>
          <p className="portada-texto">
            Presentamos <strong>{NOMBRE_PRODUCTO}</strong>: un robot con forma de serpiente que trepa el tronco, se
            enrosca en las ramas altas y las poda sin poner a nadie en riesgo.
          </p>
          <ul className="ficha-grupo">
            <li>
              <span>Carrera</span>
              {GRUPO.carrera}
            </li>
            <li>
              <span>Práctica</span>
              {GRUPO.practica}
            </li>
            <li>
              <span>Docente</span>
              {GRUPO.docente}
            </li>
            <li>
              <span>Dominio</span>
              {GRUPO.dominio}
            </li>
          </ul>
        </div>
        <IlustracionRobot />
      </section>

      <section aria-labelledby="titulo-equipo">
        <h2 id="titulo-equipo" className="titulo-seccion">
          Nuestro equipo
        </h2>
        <ul className="equipo">
          {INTEGRANTES.map((i) => (
            <li key={i.rol} className="integrante">
              <div className={`integrante-avatar avatar-${i.icono}`} aria-hidden="true">
                {i.nombre ? (
                  <>
                    {iniciales(i.nombre)}
                    <span className="integrante-icono">
                      <Icono nombre={i.icono} tamano={14} />
                    </span>
                  </>
                ) : (
                  <Icono nombre={i.icono} tamano={30} />
                )}
              </div>
              <h3 className={i.nombre ? undefined : 'integrante-pendiente'}>{i.nombre || 'Por confirmar'}</h3>
              <p className="integrante-rol">{i.rol}</p>
              <ul className="integrante-tareas">
                {i.tareas.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="titulo-proyecto">
        <h2 id="titulo-proyecto" className="titulo-seccion">
          El proyecto en tres ideas
        </h2>
        <ol className="ideas">
          {PROYECTO.map((p, n) => (
            <li key={p.titulo} className="idea">
              <span className={`idea-icono idea-${n + 1}`}>
                <Icono nombre={ICONOS_PROYECTO[n]} tamano={28} />
              </span>
              <h3>{p.titulo}</h3>
              <p>{p.texto}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="titulo-red">
        <h2 id="titulo-red" className="titulo-seccion">
          Cómo llega la página a tu pantalla
        </h2>
        <ol className="topologia">
          {ARQUITECTURA.map((n) => (
            <li key={n.nombre} className="nodo">
              <span className="nodo-capa">{n.capa}</span>
              <strong className="nodo-nombre">{n.nombre}</strong>
              <span className="nodo-detalle">{n.detalle}</span>
              <code className="nodo-dato">{n.dato}</code>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}

/** Dibujo del robot serpiente subiendo por un árbol hacia una rama. */
function IlustracionRobot() {
  return (
    <svg className="portada-ilustracion" viewBox="0 0 260 260" role="img" aria-label="Robot serpiente trepando un árbol">
      <ellipse cx="130" cy="240" rx="105" ry="12" fill="var(--verde-100)" />
      {/* Copa */}
      <circle cx="132" cy="44" r="34" fill="var(--verde-600)" />
      <circle cx="98" cy="58" r="22" fill="var(--verde-500)" />
      <circle cx="166" cy="60" r="20" fill="var(--verde-500)" />
      <circle cx="226" cy="66" r="22" fill="var(--verde-500)" />
      <circle cx="40" cy="122" r="18" fill="var(--verde-600)" />
      {/* Tronco y ramas */}
      <path d="M114 242 L146 242 L140 52 L122 52 Z" fill="var(--tierra)" />
      <path d="M138 108 L222 72" stroke="var(--tierra)" strokeWidth="9" strokeLinecap="round" />
      <path d="M120 156 L46 124" stroke="var(--tierra)" strokeWidth="8" strokeLinecap="round" />
      {/* Serpiente enroscada en el tronco que sale hacia la rama */}
      <path
        d="M96 232 C 112 226, 150 224, 152 214 S 108 204, 110 192 S 152 182, 152 170 S 108 158, 110 146 S 150 136, 150 124 L 192 100"
        fill="none"
        stroke="var(--verde-900)"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M96 232 C 112 226, 150 224, 152 214 S 108 204, 110 192 S 152 182, 152 170 S 108 158, 110 146 S 150 136, 150 124 L 192 100"
        fill="none"
        stroke="var(--verde-500)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="5 6"
      />
      {/* Anillos enroscados en la rama y punto de corte */}
      <ellipse cx="196" cy="94" rx="5" ry="10" transform="rotate(-23 196 94)" fill="none" stroke="var(--verde-900)" strokeWidth="5" />
      <ellipse cx="206" cy="90" rx="5" ry="10" transform="rotate(-23 206 90)" fill="none" stroke="var(--verde-900)" strokeWidth="5" />
      <circle cx="214" cy="84" r="7" fill="var(--verde-900)" />
      <circle cx="216" cy="82" r="1.8" fill="#fff" />
      <path d="M226 92 l8 6 M228 84 l10 0 M224 76 l7 -6" stroke="var(--tierra-claro)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}
