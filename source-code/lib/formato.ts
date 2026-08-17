import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Formatting helpers. All output is es-ES: comma decimal separator, dot
 * thousands separator, euro suffix, and day-before-month dates.
 *
 * Every screen goes through these rather than calling toLocaleString inline,
 * so a reviewer never sees "1,234.50" on one screen and "1.234,50" on another.
 */

const EUR = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const EUR_COMPACTO = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const NUMERO = new Intl.NumberFormat('es-ES')

/** 1.234,50 € */
export function euros(valor: number): string {
  return EUR.format(valor)
}

/** 1.235 € - for metric cards where cents are noise. */
export function eurosCompacto(valor: number): string {
  return EUR_COMPACTO.format(valor)
}

/** 1.234 */
export function numero(valor: number): string {
  return NUMERO.format(valor)
}

/** 68 % - non-breaking space before the sign, per Spanish typography. */
export function porcentaje(valor: number, decimales = 0): string {
  return `${valor.toFixed(decimales).replace('.', ',')} %`
}

function aFecha(valor: string | Date): Date {
  return typeof valor === 'string' ? parseISO(valor) : valor
}

/** 14/03/2026 */
export function fechaCorta(valor: string | Date): string {
  return format(aFecha(valor), 'dd/MM/yyyy', { locale: es })
}

/** 14 de marzo de 2026 */
export function fechaLarga(valor: string | Date): string {
  return format(aFecha(valor), "d 'de' MMMM 'de' yyyy", { locale: es })
}

/** sábado, 14 de marzo */
export function fechaConDia(valor: string | Date): string {
  return format(aFecha(valor), "EEEE, d 'de' MMMM", { locale: es })
}

/** 14/03/2026 18:30 */
export function fechaHora(valor: string | Date): string {
  return format(aFecha(valor), 'dd/MM/yyyy HH:mm', { locale: es })
}

/** 18:30 */
export function hora(valor: string | Date): string {
  return format(aFecha(valor), 'HH:mm', { locale: es })
}

/** marzo 2026 */
export function mesAno(valor: string | Date): string {
  return format(aFecha(valor), 'MMMM yyyy', { locale: es })
}

/** hace 3 horas */
export function haceTiempo(valor: string | Date): string {
  return formatDistanceToNow(aFecha(valor), { locale: es, addSuffix: true })
}

/** 18:00 - 19:30 */
export function franja(inicio: string, fin: string): string {
  return `${inicio} - ${fin}`
}

/**
 * Capitalise the first letter. date-fns returns Spanish month and weekday names
 * in lower case, which is correct in running text but wrong at the start of a
 * heading or a table cell.
 */
export function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

/** Initials for avatar fallbacks: "María Ruiz Soler" becomes "MR". */
export function iniciales(nombre: string): string {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join('')
}
