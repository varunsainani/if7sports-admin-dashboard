/**
 * Shared foundations for the mock dataset.
 *
 * Two rules hold across every file in this folder:
 *
 * 1. Nothing is random and nothing reads the system clock. Next renders these
 *    screens on the server and again on the client, so a value that differs
 *    between the two produces a hydration mismatch. Every date is derived from
 *    the fixed anchor below and every "random looking" value comes from the
 *    seeded generator.
 *
 * 2. The data is plausible rather than filler. Real Spanish names, real prices
 *    for a municipal polideportivo, mornings quieter than evenings. A demo
 *    filled with Lorem ipsum and round numbers reads as unfinished.
 */

/** The dataset's "today". Change this one constant to move the whole demo. */
export const HOY = '2026-08-17'

/** Deterministic pseudo-random in [0, 1), so the data is stable across renders. */
export function aleatorio(semilla: number): number {
  const x = Math.sin(semilla * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

/** Pick from a list deterministically. */
export function elegir<T>(lista: readonly T[], semilla: number): T {
  return lista[Math.floor(aleatorio(semilla) * lista.length) % lista.length]
}

/** Deterministic integer in [min, max]. */
export function entero(semilla: number, min: number, max: number): number {
  return min + Math.floor(aleatorio(semilla) * (max - min + 1))
}

/** Shift an ISO date string by whole days without touching the system clock. */
export function desplazarDias(iso: string, dias: number): string {
  const [ano, mes, dia] = iso.split('-').map(Number)
  const fecha = new Date(Date.UTC(ano, mes - 1, dia))
  fecha.setUTCDate(fecha.getUTCDate() + dias)
  return fecha.toISOString().slice(0, 10)
}

/** ISO weekday for a date string, 1 = Monday through 7 = Sunday. */
export function diaSemana(iso: string): number {
  const [ano, mes, dia] = iso.split('-').map(Number)
  const jsDia = new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay()
  return jsDia === 0 ? 7 : jsDia
}

/** Combine a date and a HH:mm time into a full ISO timestamp. */
export function marcaTiempo(fecha: string, hora: string): string {
  return `${fecha}T${hora}:00`
}

/** Add whole hours to a HH:mm string. */
export function sumarHoras(hora: string, horas: number): string {
  const [h, m] = hora.split(':').map(Number)
  return `${String(h + horas).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/* ------------------------------------------------------------------ names
   Spanish given names and surnames, combined by the seeded picker so the
   client list looks like a real customer base rather than a name generator. */

export const NOMBRES = [
  'María', 'Carlos', 'Ana', 'Javier', 'Laura', 'Miguel', 'Carmen', 'David',
  'Elena', 'Sergio', 'Lucía', 'Alberto', 'Marta', 'Pablo', 'Cristina', 'Rubén',
  'Beatriz', 'Andrés', 'Nuria', 'Óscar', 'Silvia', 'Raúl', 'Patricia', 'Iván',
  'Alicia', 'Fernando', 'Rocío', 'Adrián', 'Isabel', 'Jorge', 'Teresa', 'Diego',
] as const

export const APELLIDOS = [
  'García', 'Rodríguez', 'Martínez', 'López', 'Sánchez', 'Pérez', 'Gómez',
  'Fernández', 'Ruiz', 'Díaz', 'Moreno', 'Álvarez', 'Romero', 'Navarro',
  'Torres', 'Domínguez', 'Vázquez', 'Ramos', 'Gil', 'Serrano', 'Blanco',
  'Molina', 'Castro', 'Ortega', 'Delgado', 'Ortiz', 'Marín', 'Iglesias',
] as const

export function nombreCompleto(semilla: number): string {
  return `${elegir(NOMBRES, semilla)} ${elegir(APELLIDOS, semilla * 7 + 3)} ${elegir(APELLIDOS, semilla * 13 + 11)}`
}

/** Builds an address-safe email from a display name. */
export function correoDe(nombre: string, semilla: number): string {
  const dominios = ['gmail.com', 'hotmail.com', 'outlook.es', 'yahoo.es', 'icloud.com']
  const partes = nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(' ')
  return `${partes[0]}.${partes[1]}${entero(semilla, 1, 99)}@${elegir(dominios, semilla + 5)}`
}

/** Spanish mobile numbers start with 6 or 7. */
export function telefono(semilla: number): string {
  const prefijo = aleatorio(semilla) > 0.5 ? '6' : '7'
  const resto = String(entero(semilla * 3, 10000000, 99999999)).slice(0, 8)
  return `+34 ${prefijo}${resto.slice(0, 2)} ${resto.slice(2, 5)} ${resto.slice(5, 8)}`
}
