// Fechas en formato "AAAA-MM-DD" (el mismo que usa la API), siempre en la hora local
// del navegador. No se usa toISOString() porque convierte a UTC y puede cambiar el día.

const dosCifras = (n: number) => String(n).padStart(2, '0')

export function aTextoISO(fecha: Date): string {
  return `${fecha.getFullYear()}-${dosCifras(fecha.getMonth() + 1)}-${dosCifras(fecha.getDate())}`
}

/** Convierte "AAAA-MM-DD" (y opcionalmente "HH:mm") en una fecha local. */
export function desdeTextoISO(fecha: string, hora = '00:00'): Date {
  const [anio, mes, dia] = fecha.split('-').map(Number)
  const [h, m] = hora.split(':').map(Number)
  return new Date(anio, mes - 1, dia, h, m)
}

export function hoyISO(): string {
  return aTextoISO(new Date())
}

export function sumarDias(fecha: string, dias: number): string {
  const d = desdeTextoISO(fecha)
  d.setDate(d.getDate() + dias)
  return aTextoISO(d)
}

export function esDomingo(fecha: string): boolean {
  return desdeTextoISO(fecha).getDay() === 0
}

/** "2026-11-20" → "Viernes, 20 de noviembre de 2026" */
export function formatearFecha(fecha: string): string {
  const texto = desdeTextoISO(fecha).toLocaleDateString('es', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}
