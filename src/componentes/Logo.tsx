import { NOMBRE_PRODUCTO } from '../config'

/** Marca provisional: una serpiente enroscada sobre una rama. */
export function Logo({ tamano = 36, conTexto = true }: { tamano?: number; conTexto?: boolean }) {
  return (
    <span className="logo">
      <svg width={tamano} height={tamano} viewBox="0 0 48 48" aria-hidden="true">
        <rect width="48" height="48" rx="12" fill="var(--verde-700)" />
        <path d="M6 34 L42 20" stroke="var(--tierra-claro)" strokeWidth="5" strokeLinecap="round" />
        <path
          d="M12 14 C 22 6, 30 14, 22 22 S 22 38, 34 34"
          fill="none"
          stroke="#fff"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <circle cx="12" cy="14" r="3.6" fill="#fff" />
        <circle cx="11.2" cy="13.2" r="1" fill="var(--verde-700)" />
      </svg>
      {conTexto && <span className="logo-texto">{NOMBRE_PRODUCTO}</span>}
    </span>
  )
}
