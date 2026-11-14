import type { ReactNode } from 'react'
import type { IconoRol } from '../contenido/equipo'

// Iconos de línea sencillos (24×24). Toman el color del texto que los rodea.
const TRAZOS: Record<IconoRol | 'peligro' | 'robot' | 'web', ReactNode> = {
  lider: (
    <>
      <path d="M5 21V4" />
      <path d="M5 4h11l-2 4 2 4H5" />
    </>
  ),
  servidor: (
    <>
      <rect x="4" y="4" width="16" height="6" rx="1.5" />
      <rect x="4" y="14" width="16" height="6" rx="1.5" />
      <path d="M8 7h.01M8 17h.01" />
    </>
  ),
  pantalla: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="1.5" />
      <path d="M9 20h6M12 16v4" />
      <path d="m9 8-2 2 2 2M15 8l2 2-2 2" />
    </>
  ),
  pruebas: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 3 3 5-6" />
    </>
  ),
  red: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9s1.3-6.3 3.8-9Z" />
    </>
  ),
  peligro: (
    <>
      <path d="M12 3 2 20h20L12 3Z" />
      <path d="M12 10v4M12 17h.01" />
    </>
  ),
  robot: (
    <>
      <path d="M4 18c3 0 3-4 6-4s3 4 6 4 3-4 4-4" />
      <path d="M4 12c3 0 3-4 6-4s3 4 6 4" />
      <circle cx="18" cy="7" r="2" />
    </>
  ),
  web: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18M7 6.5h.01M10 6.5h.01" />
    </>
  ),
}

export type NombreIcono = keyof typeof TRAZOS

export function Icono({ nombre, tamano = 24 }: { nombre: NombreIcono; tamano?: number }) {
  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {TRAZOS[nombre]}
    </svg>
  )
}
