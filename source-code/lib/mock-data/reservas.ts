import type { EstadoPago, EstadoReserva, EventoReserva, Reserva } from '@/lib/types'
import { canchasActivas } from './canchas'
import { personas } from './personas'
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

/** Booking hours, opening through close. */
const HORAS = [9, 10, 11, 12, 13, 16, 17, 18, 19, 20, 21, 22]

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
  return 0.12
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
  'El cliente pide la pista con la iluminación ya encendida.',
  'Grupo habitual de los jueves. Suelen llegar 10 minutos tarde.',
  'Solicita factura a nombre de empresa.',
  'Pago pendiente de confirmar con recepción.',
  'Aviso: el cliente ha cancelado dos veces este mes.',
]

function generarReservas(): Reserva[] {
  const reservas: Reserva[] = []
  let contador = 0

  for (let offset = -DIAS_ATRAS; offset <= DIAS_ADELANTE; offset++) {
    const fecha = desplazarDias(HOY, offset)
    const dia = diaSemana(fecha)

    for (let canchaIndice = 0; canchaIndice < canchasActivas.length; canchaIndice++) {
      const cancha = canchasActivas[canchaIndice]

      for (const hora of HORAS) {
        const semilla = (offset + 100) * 1000 + canchaIndice * 50 + hora

        if (aleatorio(semilla) > demanda(hora, dia)) continue

        contador += 1
        const id = `RSV-${String(2400 + contador).padStart(5, '0')}`
        const persona = elegir(personas, semilla * 3)
        const estado = estadoPara(offset, semilla * 7)
        const horaInicio = `${String(hora).padStart(2, '0')}:00`
        const duracion = cancha.tipo === 'padel' || cancha.tipo === 'tenis' ? 1 : 1
        const horaFin = sumarHoras(horaInicio, duracion)
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

/** The "últimas 10 reservas" list on the dashboard, newest first. */
export const ultimasReservas: Reserva[] = [...reservas]
  .sort((a, b) => `${b.fecha}${b.horaInicio}`.localeCompare(`${a.fecha}${a.horaInicio}`))
  .filter((reserva) => reserva.fecha <= HOY)
  .slice(0, 10)

export const reservasDeHoy: Reserva[] = reservasDeFecha(HOY)
