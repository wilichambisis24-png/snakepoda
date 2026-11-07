import { Proximamente } from '../componentes/Proximamente'

export function Reservas() {
  return (
    <div className="pagina">
      <header className="encabezado-pagina">
        <h1>Reservas</h1>
        <p className="texto-suave">Agenda el servicio de poda para tus árboles.</p>
      </header>

      <Proximamente
        fase={3}
        puntos={[
          'Formulario para agendar: fecha, horario disponible, dirección y detalles de los árboles.',
          'Lista de tus reservas con su estado (pendiente, confirmada, completada o cancelada).',
          'Opción para cancelar una reserva.',
        ]}
      />
    </div>
  )
}
