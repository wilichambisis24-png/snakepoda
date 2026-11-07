/** Marcador temporal para las secciones que se construyen en fases posteriores. */
export function Proximamente({ fase, puntos }: { fase: number; puntos: string[] }) {
  return (
    <div className="tarjeta proximamente">
      <span className="insignia insignia-fase">En construcción · Fase {fase}</span>
      <p>Esta sección incluirá:</p>
      <ul>
        {puntos.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </div>
  )
}
