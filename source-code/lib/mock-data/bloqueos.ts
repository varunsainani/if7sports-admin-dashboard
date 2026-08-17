import type { Bloqueo, MotivoBloqueo } from '@/lib/types'
import { canchasActivas } from './canchas'
import { instructores } from './instructores'
import { HOY, desplazarDias } from './base'

/**
 * Franjas the facility has taken off the market: maintenance, classes,
 * training, academy sessions, internal events.
 *
 * Recurring weekly commitments (the Tuesday and Thursday padel school, the
 * Wednesday football training) are expanded into individual rows rather than
 * stored as a rule, because that is how they appear on the calendar and how
 * the bloqueos table lists them.
 */

interface PlantillaRecurrente {
  canchaId: string
  /** ISO weekday, 1 = Monday. */
  dia: number
  horaInicio: string
  horaFin: string
  motivo: MotivoBloqueo
  instructorId?: string
  creadoPor: string
}

const RECURRENTES: PlantillaRecurrente[] = [
  {
    canchaId: 'can-1',
    dia: 2,
    horaInicio: '17:00',
    horaFin: '19:00',
    motivo: 'clase',
    instructorId: 'ins-1',
    creadoPor: 'María Belenguer',
  },
  {
    canchaId: 'can-1',
    dia: 4,
    horaInicio: '17:00',
    horaFin: '19:00',
    motivo: 'clase',
    instructorId: 'ins-1',
    creadoPor: 'María Belenguer',
  },
  {
    canchaId: 'can-5',
    dia: 3,
    horaInicio: '18:00',
    horaFin: '20:00',
    motivo: 'entrenamiento',
    instructorId: 'ins-3',
    creadoPor: 'Rubén Ferrer',
  },
  {
    canchaId: 'can-8',
    dia: 6,
    horaInicio: '10:00',
    horaFin: '13:00',
    motivo: 'academia',
    instructorId: 'ins-5',
    creadoPor: 'María Belenguer',
  },
  {
    canchaId: 'can-6',
    dia: 1,
    horaInicio: '19:00',
    horaFin: '21:00',
    motivo: 'clase',
    instructorId: 'ins-4',
    creadoPor: 'Rubén Ferrer',
  },
]

/** One-off closures. Maintenance and internal events do not repeat weekly. */
const PUNTUALES: Omit<Bloqueo, 'canchaNombre' | 'instructorNombre'>[] = [
  {
    id: 'blq-p1',
    canchaId: 'can-3',
    fecha: desplazarDias(HOY, 3),
    horaInicio: '09:00',
    horaFin: '14:00',
    motivo: 'mantenimiento',
    creadoPor: 'María Belenguer',
  },
  {
    id: 'blq-p2',
    canchaId: 'can-4',
    fecha: desplazarDias(HOY, 3),
    horaInicio: '09:00',
    horaFin: '14:00',
    motivo: 'mantenimiento',
    creadoPor: 'María Belenguer',
  },
  {
    id: 'blq-p3',
    canchaId: 'can-5',
    fecha: desplazarDias(HOY, 9),
    horaInicio: '16:00',
    horaFin: '22:00',
    motivo: 'evento',
    creadoPor: 'María Belenguer',
  },
  {
    id: 'blq-p4',
    canchaId: 'can-8',
    fecha: desplazarDias(HOY, -4),
    horaInicio: '18:00',
    horaFin: '22:00',
    motivo: 'evento',
    instructorId: 'ins-2',
    creadoPor: 'Rubén Ferrer',
  },
  {
    id: 'blq-p5',
    canchaId: 'can-2',
    fecha: desplazarDias(HOY, 1),
    horaInicio: '08:00',
    horaFin: '11:00',
    motivo: 'mantenimiento',
    creadoPor: 'Rubén Ferrer',
  },
  {
    id: 'blq-p6',
    canchaId: 'can-6',
    fecha: desplazarDias(HOY, 14),
    horaInicio: '09:00',
    horaFin: '18:00',
    motivo: 'otro',
    creadoPor: 'María Belenguer',
  },
  {
    id: 'blq-p7',
    canchaId: 'can-1',
    fecha: desplazarDias(HOY, -11),
    horaInicio: '20:00',
    horaFin: '22:00',
    motivo: 'entrenamiento',
    instructorId: 'ins-6',
    creadoPor: 'Rubén Ferrer',
  },
]

function nombreCancha(canchaId: string): string {
  return canchasActivas.find((cancha) => cancha.id === canchaId)?.nombre ?? 'Cancha'
}

function nombreInstructor(instructorId?: string): string | undefined {
  if (!instructorId) return undefined
  return instructores.find((instructor) => instructor.id === instructorId)?.nombre
}

function generarBloqueos(): Bloqueo[] {
  const salida: Bloqueo[] = []

  // Expand the weekly commitments across the same window the bookings cover.
  for (let offset = -60; offset <= 30; offset++) {
    const fecha = desplazarDias(HOY, offset)
    const [ano, mes, dia] = fecha.split('-').map(Number)
    const jsDia = new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay()
    const diaISO = jsDia === 0 ? 7 : jsDia

    for (const [indice, plantilla] of RECURRENTES.entries()) {
      if (plantilla.dia !== diaISO) continue

      salida.push({
        id: `blq-r${indice}-${fecha}`,
        canchaId: plantilla.canchaId,
        canchaNombre: nombreCancha(plantilla.canchaId),
        fecha,
        horaInicio: plantilla.horaInicio,
        horaFin: plantilla.horaFin,
        motivo: plantilla.motivo,
        instructorId: plantilla.instructorId,
        instructorNombre: nombreInstructor(plantilla.instructorId),
        creadoPor: plantilla.creadoPor,
      })
    }
  }

  for (const puntual of PUNTUALES) {
    salida.push({
      ...puntual,
      canchaNombre: nombreCancha(puntual.canchaId),
      instructorNombre: nombreInstructor(puntual.instructorId),
    })
  }

  return salida.sort((a, b) => `${b.fecha}${b.horaInicio}`.localeCompare(`${a.fecha}${a.horaInicio}`))
}

export const bloqueos: Bloqueo[] = generarBloqueos()

export function bloqueosDeFecha(fecha: string): Bloqueo[] {
  return bloqueos
    .filter((bloqueo) => bloqueo.fecha === fecha)
    .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
}

export function bloqueosEntre(desde: string, hasta: string): Bloqueo[] {
  return bloqueos.filter((bloqueo) => bloqueo.fecha >= desde && bloqueo.fecha <= hasta)
}

/** Blocked franjas attached to one instructor, for the instructors screen. */
export function bloqueosDeInstructor(instructorId: string): Bloqueo[] {
  return bloqueos.filter((bloqueo) => bloqueo.instructorId === instructorId)
}
