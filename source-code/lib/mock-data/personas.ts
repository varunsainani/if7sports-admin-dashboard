import { HOY, correoDe, desplazarDias, entero, nombreCompleto, telefono } from './base'

/**
 * Base identities for the customer list.
 *
 * These are split out from clientes.ts on purpose. A client's counters (total
 * bookings, amount paid, first and last booking) are derived from the actual
 * booking records rather than typed in, so the numbers on the clients table
 * always reconcile with the rows on the client detail screen. Hardcoding both
 * is how a demo ends up showing "12 reservas" above a list of nine.
 */

export interface Persona {
  id: string
  nombre: string
  correo: string
  telefono: string
  /** How many days ago this person first booked. Drives "cliente desde". */
  antiguedadDias: number
}

const TOTAL_CLIENTES = 42

export const personas: Persona[] = Array.from({ length: TOTAL_CLIENTES }, (_, indice) => {
  const semilla = indice + 1
  const nombre = nombreCompleto(semilla)

  return {
    id: `cli-${semilla}`,
    nombre,
    correo: correoDe(nombre, semilla),
    telefono: telefono(semilla),
    // A real customer base is a mix: a core of long-standing regulars and a
    // tail of people who signed up in the last few weeks.
    antiguedadDias: entero(semilla * 17, 12, 640),
  }
})

export function personaPorId(id: string): Persona | undefined {
  return personas.find((persona) => persona.id === id)
}

/** The date this person first appeared, derived from their antiquity. */
export function fechaAlta(persona: Persona): string {
  return desplazarDias(HOY, -persona.antiguedadDias)
}
