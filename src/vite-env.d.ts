/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL del backend, p. ej. http://localhost:3000. Si está vacía, la app usa el modo simulado. */
  readonly VITE_API_URL?: string
}
