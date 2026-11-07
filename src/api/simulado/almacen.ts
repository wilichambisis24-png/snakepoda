// Utilidades del modo simulado: guardan datos en el localStorage del navegador
// para que la app funcione sin backend. Se dejarán de usar cuando exista la API real.

export function leer<T>(clave: string, inicial: T): T {
  try {
    const texto = localStorage.getItem(clave)
    return texto ? (JSON.parse(texto) as T) : inicial
  } catch {
    return inicial
  }
}

export function guardar(clave: string, valor: unknown): void {
  try {
    localStorage.setItem(clave, JSON.stringify(valor))
  } catch {
    // Almacenamiento bloqueado (p. ej. navegación privada): los datos solo duran en memoria.
  }
}

/** Simula la demora de red para que la interfaz muestre sus estados de carga. */
export function esperar(ms = 500): Promise<void> {
  return new Promise((resolver) => setTimeout(resolver, ms))
}

export function generarId(prefijo: string): string {
  return `${prefijo}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}
