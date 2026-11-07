import { Link } from 'react-router'
import { Logo } from '../componentes/Logo'

export function NoEncontrada() {
  return (
    <div className="no-encontrada">
      <Logo tamano={48} conTexto={false} />
      <h1>Página no encontrada</h1>
      <p className="texto-suave">La dirección que buscas no existe o fue movida.</p>
      <Link to="/" className="btn btn-primario">
        Volver al inicio
      </Link>
    </div>
  )
}
