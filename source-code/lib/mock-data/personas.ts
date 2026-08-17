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

/**
 * Sized against the booking volume. A facility generating roughly 3,900
 * bookings over 90 days across a base this size averages out to a couple of
 * visits a month per person, which is what a polideportivo customer base
 * actually looks like. Too few clients and every one of them appears to book
 * daily, which also makes "clientes activos" equal the total and the metric
 * meaningless.
 */
const TOTAL_CLIENTES = 190

function construirPersonas(): Persona[] {
  const usados = new Set<string>()

  return Array.from({ length: TOTAL_CLIENTES }, (_, indice) => {
    const semilla = indice + 1

    // Re-roll on a collision. Two identical names on a customer list read as a
    // generator artefact, which is exactly the impression this data exists to
    // avoid. The offset is deterministic, so the result is still stable.
    let nombre = nombreCompleto(semilla)
    let intento = 0
    while (usados.has(nombre) && intento < 20) {
      intento += 1
      nombre = nombreCompleto(semilla + intento * 977)
    }
    usados.add(nombre)

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
}

export const personas: Persona[] = construirPersonas()

export function personaPorId(id: string): Persona | undefined {
  return personas.find((persona) => persona.id === id)
}

/** The date this person first appeared, derived from their antiquity. */
export function fechaAlta(persona: Persona): string {
  return desplazarDias(HOY, -persona.antiguedadDias)
}
