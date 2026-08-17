import type { Notificacion } from '@/lib/types'
import { HOY, desplazarDias } from './base'

/**
 * The notification panel behind the header bell.
 *
 * Every entry is actionable and links somewhere real. The brief asks for four
 * kinds of event: new pending bookings, IF7SPORTS replies on support tickets,
 * recent cancellations and occupancy alerts. A notification that cannot be
 * acted on is just noise with a red dot on it.
 */
export const notificaciones: Notificacion[] = [
  {
    id: 'not-1',
    tipo: 'reserva_pendiente',
    titulo: '4 reservas pendientes de confirmar',
    detalle: 'Las más antiguas llevan más de 24 horas esperando respuesta.',
    fecha: `${HOY}T08:40:00`,
    leida: false,
    enlace: '/reservas?estado=pendiente',
  },
  {
    id: 'not-2',
    tipo: 'respuesta_soporte',
    titulo: 'IF7SPORTS ha respondido a TCK-1042',
    detalle: 'Liquidación de julio reemitida con el IBAN corregido.',
    fecha: `${desplazarDias(HOY, -1)}T12:30:00`,
    leida: false,
    enlace: '/soporte/TCK-1042',
  },
  {
    id: 'not-3',
    tipo: 'alerta_ocupacion',
    titulo: 'Campo principal por debajo del 40 % esta semana',
    detalle: 'La ocupación ha caído 12 puntos respecto a la semana anterior.',
    fecha: `${desplazarDias(HOY, -1)}T07:00:00`,
    leida: false,
    enlace: '/metricas',
  },
  {
    id: 'not-4',
    tipo: 'cancelacion',
    titulo: '3 cancelaciones en las últimas 24 horas',
    detalle: 'Dos de ellas en la franja de tarde de Pádel 1.',
    fecha: `${desplazarDias(HOY, -1)}T20:15:00`,
    leida: true,
    enlace: '/reservas?estado=cancelada',
  },
  {
    id: 'not-5',
    tipo: 'reserva_pendiente',
    titulo: 'Nueva reserva del campo principal',
    detalle: 'Viernes 19:00 a 21:00, pendiente de confirmar.',
    fecha: `${desplazarDias(HOY, -2)}T18:22:00`,
    leida: true,
    enlace: '/reservas',
  },
  {
    id: 'not-6',
    tipo: 'respuesta_soporte',
    titulo: 'IF7SPORTS ha cerrado TCK-1039',
    detalle: 'Las reglas de precio de Pádel 2 vuelven a guardarse correctamente.',
    fecha: `${desplazarDias(HOY, -15)}T11:10:00`,
    leida: true,
    enlace: '/soporte/TCK-1039',
  },
]

export const notificacionesSinLeer = notificaciones.filter((n) => !n.leida).length
