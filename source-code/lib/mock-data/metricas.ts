import type { EstadoReserva, Metricas, Reserva } from '@/lib/types'
import { canchasActivas } from './canchas'
import { reservas } from './reservas'
import { bloqueosEntre } from './bloqueos'
import { HOY, desplazarDias } from './base'

/**
 * Every figure on the Métricas screen is computed from the booking records
 * rather than written down. Facturación, ocupación, the heatmap and the top ten
 * all reconcile with what the calendar and the tables show, so a reviewer who
 * cross-checks one number against another finds them consistent.
 *
 * That matters more than it sounds: an inconsistent dashboard is the fastest
 * way for a client to lose trust in the whole deliverable.
 */

/** IF7SPORTS commission on gross billings. Drives "Total ganado". */
export const COMISION_IF7 = 0.08

/**
 * Bookable hours per court per day, the occupancy denominator. Must stay in
 * step with the HORAS array in reservas.ts, or occupancy silently misreports.
 */
const HORAS_OPERATIVAS = 14
const PRIMERA_HORA = 9
const ULTIMA_HORA = 22

export type Granularidad = 'dia' | 'semana' | 'mes'

export interface RangoFechas {
  desde: string
  hasta: string
  etiqueta: string
}

/** Monday of the week containing HOY. */
const LUNES_DE_ESTA_SEMANA = (() => {
  const [ano, mes, dia] = HOY.split('-').map(Number)
  const jsDia = new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay()
  return desplazarDias(HOY, -((jsDia === 0 ? 7 : jsDia) - 1))
})()

const PRIMERO_DE_MES = `${HOY.slice(0, 7)}-01`
const ULTIMO_DE_MES = (() => {
  const [ano, mes] = HOY.split('-').map(Number)
  return new Date(Date.UTC(ano, mes, 0)).toISOString().slice(0, 10)
})()

/**
 * The presets behind the global date filter.
 *
 * Calendar-relative, not trailing. "Mes" means this month, which is what an
 * operator means when they ask for it, and it spans both the days already played
 * and the days still on the book. Trailing windows that all end today contain
 * only resolved bookings, which collapses the status breakdown into a single
 * slice and makes the chart say nothing.
 */
export const RANGOS: Record<string, RangoFechas> = {
  dia: { desde: HOY, hasta: HOY, etiqueta: 'Hoy' },
  semana: { desde: LUNES_DE_ESTA_SEMANA, hasta: desplazarDias(LUNES_DE_ESTA_SEMANA, 6), etiqueta: 'Esta semana' },
  mes: { desde: PRIMERO_DE_MES, hasta: ULTIMO_DE_MES, etiqueta: 'Este mes' },
  // The dataset spans 60 days back to 30 forward, so this is genuinely all of
  // it. Labelled for what it covers rather than promising a calendar year.
  ano: { desde: desplazarDias(HOY, -60), hasta: desplazarDias(HOY, 30), etiqueta: 'Todo' },
}

/** Billings only count bookings that were honoured or are still live. */
function facturable(reserva: Reserva): boolean {
  return reserva.estado === 'completada' || reserva.estado === 'confirmada'
}

/** A zero-filled bucket per day in the range, so gaps plot as 0 rather than break the line. */
function agruparPorFecha(desde: string, hasta: string) {
  const mapa = new Map<string, number>()

  for (let fecha = desde; fecha <= hasta; fecha = desplazarDias(fecha, 1)) {
    mapa.set(fecha, 0)
  }

  return mapa
}

export function calcularMetricas(desde: string, hasta: string): Metricas {
  const enRango = reservas.filter((r) => r.fecha >= desde && r.fecha <= hasta)

  /* ------------------------------------------------------------- billings */

  const facturadas = enRango.filter(facturable)
  const totalFacturado = facturadas.reduce((suma, r) => suma + r.importe, 0)
  const comisionIF7 = Math.round(totalFacturado * COMISION_IF7 * 100) / 100
  const totalGanado = Math.round((totalFacturado - comisionIF7) * 100) / 100

  /* --------------------------------------------------------- by status */

  const reservasPorEstado = enRango.reduce(
    (acc, r) => {
      acc[r.estado] += 1
      return acc
    },
    { pendiente: 0, confirmada: 0, cancelada: 0, completada: 0 } as Record<EstadoReserva, number>
  )

  /* ------------------------------------------------------------ occupancy
     Blocked franjas count as used capacity, because the court genuinely was
     not available to sell during them. */

  const dias = Math.max(
    1,
    Math.round(
      (Date.parse(`${hasta}T00:00:00Z`) - Date.parse(`${desde}T00:00:00Z`)) / 86_400_000
    ) + 1
  )

  const bloqueosRango = bloqueosEntre(desde, hasta)

  const ocupacionPorCancha = canchasActivas.map((cancha) => {
    const capacidad = dias * HORAS_OPERATIVAS

    const ocupadas = enRango.filter(
      (r) => r.canchaId === cancha.id && r.estado !== 'cancelada'
    ).length

    // Only the part of a bloqueo that overlaps the bookable window counts. A
    // closure from 08:00 to 11:00 removes two sellable hours, not three, and
    // counting the raw span pushed occupancy above what was ever on sale.
    const bloqueadas = bloqueosRango
      .filter((b) => b.canchaId === cancha.id)
      .reduce((suma, b) => {
        const inicio = Math.max(Number(b.horaInicio.slice(0, 2)), PRIMERA_HORA)
        const fin = Math.min(Number(b.horaFin.slice(0, 2)), ULTIMA_HORA + 1)
        return suma + Math.max(0, fin - inicio)
      }, 0)

    return {
      canchaId: cancha.id,
      canchaNombre: cancha.nombre,
      porcentaje: Math.min(100, Math.round(((ocupadas + bloqueadas) / capacidad) * 100)),
    }
  })

  const ocupacionGlobal = Math.round(
    ocupacionPorCancha.reduce((suma, o) => suma + o.porcentaje, 0) /
      Math.max(1, ocupacionPorCancha.length)
  )

  /* ------------------------------------------------------------- heatmap
     Hour of day by weekday. This is where the evening and weekend demand
     baked into the booking generator becomes visible. */

  const usoPorHora: Metricas['usoPorHora'] = []
  for (let dia = 1; dia <= 7; dia++) {
    for (let hora = 8; hora <= 22; hora++) {
      usoPorHora.push({ dia, hora, reservas: 0 })
    }
  }

  const indiceHeatmap = new Map(usoPorHora.map((celda, i) => [`${celda.dia}-${celda.hora}`, i]))

  for (const r of enRango) {
    if (r.estado === 'cancelada') continue
    const [ano, mes, dia] = r.fecha.split('-').map(Number)
    const jsDia = new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay()
    const diaISO = jsDia === 0 ? 7 : jsDia
    const hora = Number(r.horaInicio.slice(0, 2))
    const indice = indiceHeatmap.get(`${diaISO}-${hora}`)
    if (indice !== undefined) usoPorHora[indice].reservas += 1
  }

  /* ---------------------------------------------------------- by court */

  const usoPorCancha = canchasActivas
    .map((cancha) => ({
      canchaNombre: cancha.nombre,
      reservas: enRango.filter((r) => r.canchaId === cancha.id && r.estado !== 'cancelada').length,
    }))
    .sort((a, b) => b.reservas - a.reservas)

  /* ------------------------------------------------------ repeat clients */

  const porCliente = new Map<string, { nombre: string; total: number }>()
  for (const r of enRango) {
    if (r.estado === 'cancelada') continue
    const actual = porCliente.get(r.clienteId)
    porCliente.set(r.clienteId, {
      nombre: r.clienteNombre,
      total: (actual?.total ?? 0) + 1,
    })
  }

  const clientesRecurrentes = [...porCliente.entries()]
    .map(([clienteId, { nombre, total }]) => ({ clienteId, nombre, totalReservas: total }))
    .sort((a, b) => b.totalReservas - a.totalReservas)
    .slice(0, 10)

  /* ------------------------------------------------------- time series */

  const ingresos = agruparPorFecha(desde, hasta)
  const cancelaciones = agruparPorFecha(desde, hasta)
  const devoluciones = agruparPorFecha(desde, hasta)

  for (const r of enRango) {
    if (facturable(r)) ingresos.set(r.fecha, (ingresos.get(r.fecha) ?? 0) + r.importe)
    if (r.estado === 'cancelada') cancelaciones.set(r.fecha, (cancelaciones.get(r.fecha) ?? 0) + 1)
    if (r.estadoPago === 'devuelto') devoluciones.set(r.fecha, (devoluciones.get(r.fecha) ?? 0) + r.importe)
  }

  const serie = (mapa: Map<string, number>) =>
    [...mapa.entries()].map(([fecha, valor]) => ({ fecha, valor }))

  return {
    totalFacturado,
    totalGanado,
    comisionIF7,
    reservasPorEstado,
    ocupacionGlobal,
    ocupacionPorCancha,
    usoPorHora,
    usoPorCancha,
    clientesRecurrentes,
    ingresosPorDia: serie(ingresos),
    cancelacionesPorDia: serie(cancelaciones),
    devolucionesPorDia: serie(devoluciones),
    tendenciaFacturacion: serie(ingresos),
  }
}

/** Default view: the last 30 days. */
export const metricas: Metricas = calcularMetricas(RANGOS.mes.desde, RANGOS.mes.hasta)

/* ----------------------------------------------------- dashboard headline
   The four cards on the dashboard, with month-over-month movement so the
   variation indicator has something real behind it. */

function facturacionDe(desde: string, hasta: string): number {
  return reservas
    .filter((r) => r.fecha >= desde && r.fecha <= hasta && facturable(r))
    .reduce((suma, r) => suma + r.importe, 0)
}

/** Same window Métricas uses for "Este mes", so the two screens agree. */
const facturacionMesActual = facturacionDe(PRIMERO_DE_MES, ULTIMO_DE_MES)

const MES_ANTERIOR = (() => {
  const [ano, mes] = HOY.split('-').map(Number)
  const primero = new Date(Date.UTC(ano, mes - 2, 1)).toISOString().slice(0, 10)
  const ultimo = new Date(Date.UTC(ano, mes - 1, 0)).toISOString().slice(0, 10)
  return { primero, ultimo }
})()

const facturacionMesAnterior = facturacionDe(MES_ANTERIOR.primero, MES_ANTERIOR.ultimo)

export const resumenDashboard = {
  facturacionMes: facturacionMesActual,
  variacionFacturacion:
    facturacionMesAnterior === 0
      ? 0
      : ((facturacionMesActual - facturacionMesAnterior) / facturacionMesAnterior) * 100,

  reservasHoy: reservas.filter((r) => r.fecha === HOY && r.estado !== 'cancelada').length,

  ocupacion: metricas.ocupacionGlobal,

  clientesActivos: new Set(
    reservas
      .filter((r) => r.fecha >= PRIMERO_DE_MES && r.fecha <= ULTIMO_DE_MES && r.estado !== 'cancelada')
      .map((r) => r.clienteId)
  ).size,
}
