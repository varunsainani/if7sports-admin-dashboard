import type { EstadoPago, EstadoReserva, EventoReserva, Reserva } from '@/lib/types'
import { canchasActivas } from './canchas'
import { personas } from './personas'
import { polideportivo } from './polideportivo'
import { bloqueos } from './bloqueos'
import {
  HOY,
  aleatorio,
  desplazarDias,
  diaSemana,
  elegir,
  entero,
  marcaTiempo,
  sumarHoras,
} from './base'

/**
 * The booking records that everything else on the panel reads from.
 *
 * Generated across a 90 day window (60 days behind HOY, 30 ahead) so the
 * calendar has history to scroll back into and a forward book that looks like
 * a facility with real demand.
 *
 * Two things make this look like real operational data rather than filler:
 *
 *   Status follows time. A booking in the past is completada or cancelada, one
 *   today or in the near future is confirmada or pendiente. A "pendiente"
 *   booking dated three weeks ago would immediately read as fake to anyone who
 *   runs a facility.
 *
 *   Demand follows the clock. Evenings and weekends fill, weekday mornings sit
 *   nearly empty. That is what makes the occupancy heatmap and the "horas más
 *   alquiladas" chart on the metrics screen worth looking at.
 */

const DIAS_ATRAS = 60
const DIAS_ADELANTE = 30

/**
 * Booking hours, opening through close, with no gaps. An axis that skips an
 * hour while drawing every column the same width lies about its own spacing,
 * and the facility is open continuously anyway. Mid-afternoon is quiet rather
 * than closed, which the demand curve below expresses.
 */
const HORAS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]

/**
 * Probability a given hour on a given weekday is booked. Evenings on weekdays
 * and most of the weekend are busy; weekday mornings are not.
 */
function demanda(hora: number, dia: number): number {
  const finDeSemana = dia === 6 || dia === 7

  if (finDeSemana) {
    if (hora >= 10 && hora <= 14) return 0.72
    if (hora >= 16 && hora <= 21) return 0.66
    return 0.34
  }

  if (hora >= 18 && hora <= 22) return 0.78
  if (hora >= 16 && hora < 18) return 0.44
  if (hora >= 12 && hora <= 13) return 0.28
  // The quiet middle of the afternoon. Low, but not zero.
  if (hora >= 14 && hora <= 15) return 0.1
  return 0.12
}

/**
 * Which client a booking belongs to.
 *
 * Deliberately not a uniform pick. A real facility has a core of regulars who
 * book weekly and a long tail who turn up occasionally, so the curve below
 * skews hard toward the start of the list. Spreading bookings evenly instead
 * makes every single client active in any given month, which turns the
 * "clientes activos" metric into a restatement of the total and flattens the
 * recurring-clients top ten into a tie.
 */
const EXPONENTE_FIDELIDAD = 1.25

/** The last fifth of the client list stopped booking a month ago. */
const INICIO_INACTIVOS = Math.floor(personas.length * 0.8)
const DIAS_DESDE_BAJA = 30

function indiceCliente(semilla: number, offsetDias: number): number {
  const sesgado = Math.pow(aleatorio(semilla), EXPONENTE_FIDELIDAD)
  const indice = Math.min(personas.length - 1, Math.floor(sesgado * personas.length))

  // Churned clients only appear in the older half of the window. Without this
  // every client books in every month and "clientes activos" degenerates into
  // a restatement of the total client count.
  if (indice >= INICIO_INACTIVOS && offsetDias > -DIAS_DESDE_BAJA) {
    return Math.floor(sesgado * INICIO_INACTIVOS)
  }

  return indice
}

/** Price for a court at a given hour, applying its own rules over the base. */
function precioDe(canchaIndice: number, hora: number, dia: number): number {
  const cancha = canchasActivas[canchaIndice]
  const finDeSemana = dia === 6 || dia === 7

  const regla = cancha.reglasPrecio.find((r) => {
    const diaCoincide = r.dias.length === 0 || r.dias.includes(dia)
    const inicio = Number(r.horaInicio.slice(0, 2))
    const fin = Number(r.horaFin.slice(0, 2))
    return diaCoincide && hora >= inicio && hora < fin
  })

  if (regla) return regla.precio
  return finDeSemana ? Math.round(cancha.precioBase * 1.1) : cancha.precioBase
}

/**
 * Status is a function of how far the booking sits from today.
 * Past bookings resolve, future ones are still open.
 */
function estadoPara(offsetDias: number, semilla: number): EstadoReserva {
  const r = aleatorio(semilla)

  if (offsetDias < 0) {
    // 8% of past bookings were cancelled, the rest went ahead.
    return r < 0.08 ? 'cancelada' : 'completada'
  }

  if (offsetDias === 0) {
    if (r < 0.06) return 'cancelada'
    if (r < 0.2) return 'pendiente'
    return 'confirmada'
  }

  // Further out, more bookings are still awaiting confirmation.
  const ventana = Math.min(offsetDias / DIAS_ADELANTE, 1)
  if (r < 0.04) return 'cancelada'
  if (r < 0.2 + ventana * 0.35) return 'pendiente'
  return 'confirmada'
}

/** Payment follows booking status, which is exactly why they are two badges. */
function pagoPara(estado: EstadoReserva, semilla: number): EstadoPago {
  const r = aleatorio(semilla * 3 + 7)

  switch (estado) {
    case 'completada':
      return r < 0.94 ? 'pagado' : 'no_aplica'
    case 'cancelada':
      // A cancelled booking either got refunded or was never paid for.
      return r < 0.55 ? 'devuelto' : 'no_aplica'
    case 'confirmada':
      return r < 0.78 ? 'pagado' : 'pendiente_pago'
    case 'pendiente':
      return r < 0.15 ? 'pagado' : 'pendiente_pago'
  }
}

/** The state history shown as a vertical timeline in the booking modal. */
function historialPara(
  reservaId: string,
  estado: EstadoReserva,
  fecha: string,
  horaInicio: string,
  clienteNombre: string,
  origen: 'cliente' | 'manual',
  semilla: number
): EventoReserva[] {
  const creadaEl = desplazarDias(fecha, -entero(semilla * 5, 1, 14))
  const actorCreacion = origen === 'manual' ? 'Rubén Ferrer (colaborador)' : clienteNombre

  const eventos: EventoReserva[] = [
    {
      id: `${reservaId}-e1`,
      estado: 'creada',
      fecha: marcaTiempo(creadaEl, '10:24'),
      actor: actorCreacion,
      nota: origen === 'manual' ? 'Reserva creada manualmente desde el panel.' : undefined,
    },
  ]

  if (estado === 'pendiente') return eventos

  eventos.push({
    id: `${reservaId}-e2`,
    estado: 'confirmada',
    fecha: marcaTiempo(desplazarDias(creadaEl, 1), '09:12'),
    actor: 'Sistema',
    nota: 'Confirmada automáticamente tras registrarse el pago.',
  })

  if (estado === 'confirmada') return eventos

  if (estado === 'cancelada') {
    eventos.push({
      id: `${reservaId}-e3`,
      estado: 'cancelada',
      fecha: marcaTiempo(desplazarDias(fecha, -1), '18:40'),
      actor: aleatorio(semilla * 11) > 0.5 ? clienteNombre : 'María Belenguer (admin principal)',
      nota: 'Cancelada con más de 24 horas de antelación.',
    })
    return eventos
  }

  eventos.push({
    id: `${reservaId}-e3`,
    estado: 'completada',
    fecha: marcaTiempo(fecha, sumarHoras(horaInicio, 2)),
    actor: 'Sistema',
    nota: 'Marcada como completada al finalizar la franja.',
  })

  return eventos
}

const NOTAS_INTERNAS = [
  '',
  '',
  '',
  'El cliente pide la cancha con la iluminación ya encendida.',
  'Grupo habitual de los jueves. Suelen llegar 10 minutos tarde.',
  'Solicita factura a nombre de empresa.',
  'Pago pendiente de confirmar con recepción.',
  'Aviso: el cliente ha cancelado dos veces este mes.',
]

/** Blocked franjas indexed by court, date and hour, for O(1) lookup. */
const FRANJAS_BLOQUEADAS = new Set<string>()
for (const bloqueo of bloqueos) {
  const inicio = Number(bloqueo.horaInicio.slice(0, 2))
  const fin = Number(bloqueo.horaFin.slice(0, 2))
  for (let hora = inicio; hora < fin; hora++) {
    FRANJAS_BLOQUEADAS.add(`${bloqueo.canchaId}|${bloqueo.fecha}|${hora}`)
  }
}

const FESTIVOS = new Map(polideportivo.festivos.map((f) => [f.fecha, f]))
const HORARIO_POR_DIA = new Map(polideportivo.horarios.map((h) => [h.dia, h]))

/**
 * Whether a slot can hold a booking at all.
 *
 * Without this the generator sold hours the rest of the product says are
 * closed: bookings landed on days the Configuración screen lists as "Cerrado
 * todo el día", ran past a court's own closing time, and sat underneath blocked
 * franjas where the calendar draws the bloqueo instead and the booking simply
 * vanished from view while still counting in the metrics.
 */
function esVendible(canchaIndice: number, fecha: string, dia: number, hora: number): boolean {
  const festivo = FESTIVOS.get(fecha)
  if (festivo?.tipo === 'cerrado') return false
  if (festivo?.tipo === 'horario_especial') {
    const abre = Number(festivo.apertura?.slice(0, 2) ?? 0)
    const cierra = Number(festivo.cierre?.slice(0, 2) ?? 24)
    if (hora < abre || hora >= cierra) return false
  }

  const horario = HORARIO_POR_DIA.get(dia)
  if (!horario?.abierto) return false
  const abreCentro = Number(horario.apertura.slice(0, 2))
  // A closing time of 00:00 means midnight at the end of the day.
  const cierraCentro = horario.cierre === '00:00' ? 24 : Number(horario.cierre.slice(0, 2))
  if (hora < abreCentro || hora >= cierraCentro) return false

  const cancha = canchasActivas[canchaIndice]
  if (!cancha.diasAbiertos.includes(dia)) return false
  const abreCancha = Number(cancha.horaApertura.slice(0, 2))
  const cierraCancha =
    cancha.horaCierre === '00:00' ? 24 : Number(cancha.horaCierre.slice(0, 2))
  if (hora < abreCancha || hora >= cierraCancha) return false

  if (FRANJAS_BLOQUEADAS.has(`${cancha.id}|${fecha}|${hora}`)) return false

  return true
}

function generarReservas(): Reserva[] {
  const reservas: Reserva[] = []
  let contador = 0

  for (let offset = -DIAS_ATRAS; offset <= DIAS_ADELANTE; offset++) {
    const fecha = desplazarDias(HOY, offset)
    const dia = diaSemana(fecha)

    for (let canchaIndice = 0; canchaIndice < canchasActivas.length; canchaIndice++) {
      const cancha = canchasActivas[canchaIndice]

      for (const hora of HORAS) {
        if (!esVendible(canchaIndice, fecha, dia, hora)) continue

        const semilla = (offset + 100) * 1000 + canchaIndice * 50 + hora

        if (aleatorio(semilla) > demanda(hora, dia)) continue

        contador += 1
        const id = `RSV-${String(2400 + contador).padStart(5, '0')}`
        const persona = personas[indiceCliente(semilla * 3, offset)]
        const estado = estadoPara(offset, semilla * 7)
        const horaInicio = `${String(hora).padStart(2, '0')}:00`
        // Every court sells in one-hour franjas, which is what the grid renders.
        const horaFin = sumarHoras(horaInicio, 1)
        const origen: 'cliente' | 'manual' = aleatorio(semilla * 23) < 0.18 ? 'manual' : 'cliente'

        reservas.push({
          id,
          clienteId: persona.id,
          clienteNombre: persona.nombre,
          canchaId: cancha.id,
          canchaNombre: cancha.nombre,
          fecha,
          horaInicio,
          horaFin,
          importe: precioDe(canchaIndice, hora, dia),
          estado,
          estadoPago: pagoPara(estado, semilla),
          origen,
          notasInternas: elegir(NOTAS_INTERNAS, semilla * 31),
          historial: historialPara(id, estado, fecha, horaInicio, persona.nombre, origen, semilla),
        })
      }
    }
  }

  return reservas
}

export const reservas: Reserva[] = generarReservas()

/* ----------------------------------------------------------------- queries */

export function reservaPorId(id: string): Reserva | undefined {
  return reservas.find((reserva) => reserva.id === id)
}

export function reservasDeCliente(clienteId: string): Reserva[] {
  return reservas
    .filter((reserva) => reserva.clienteId === clienteId)
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
}

export function reservasDeFecha(fecha: string): Reserva[] {
  return reservas
    .filter((reserva) => reserva.fecha === fecha)
    .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
}

export function reservasEntre(desde: string, hasta: string): Reserva[] {
  return reservas.filter((reserva) => reserva.fecha >= desde && reserva.fecha <= hasta)
}

/**
 * The "últimas 10 reservas" list on the dashboard: the ten most recently
 * *created*, which is what the label means and what an owner wants to see.
 * Sorting by slot time instead returned ten rows that all read 22:00 on the
 * same day, which looked like a rendering fault.
 */
export const ultimasReservas: Reserva[] = [...reservas]
  .sort((a, b) => b.historial[0].fecha.localeCompare(a.historial[0].fecha))
  .slice(0, 10)

export const reservasDeHoy: Reserva[] = reservasDeFecha(HOY)
