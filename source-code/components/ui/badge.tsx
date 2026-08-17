import * as React from 'react'

import { cn } from '@/lib/utils'
import { ESTADO_PAGO, ESTADO_RESERVA, ESTADO_TICKET, BLOQUEO } from '@/lib/estados'
import type { EstadoPago, EstadoReserva, EstadoTicket } from '@/lib/types'

/**
 * Two badge systems sit side by side on almost every row, so they are built to
 * not compete:
 *
 *   BadgeReserva  carries hue and a fill treatment. It is the loud one, because
 *                 the brief requires the four states to read at a glance.
 *   BadgePago     is monochrome and leads with an icon. It is the quiet one.
 *
 * Anything that breaks that hierarchy makes the calendar unreadable.
 */

const base =
  'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-2xs font-medium whitespace-nowrap'

/* ------------------------------------------------------- generic container */

const tonos = {
  neutro: 'bg-cal-200 text-cal-800 border border-cal-300',
  primario: 'bg-cesped-50 text-cesped-700 border border-cesped-200',
  exito: 'bg-confirmada-bg text-confirmada-texto border border-confirmada-borde',
  aviso: 'bg-pendiente-bg text-pendiente-texto border border-pendiente-borde',
  error: 'bg-cancelada-bg text-cancelada-texto border border-cancelada-borde',
  contorno: 'text-tinta-media border border-borde-fuerte',
} as const

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tono?: keyof typeof tonos
}

function Badge({ tono = 'neutro', className, ...props }: BadgeProps) {
  return <span className={cn(base, tonos[tono], className)} {...props} />
}

/* ------------------------------------------------------------ booking status */

interface BadgeReservaProps {
  estado: EstadoReserva
  /** `solido` is for the large badge in the booking detail modal. */
  variante?: 'tint' | 'solido'
  className?: string
}

function BadgeReserva({ estado, variante = 'tint', className }: BadgeReservaProps) {
  const config = ESTADO_RESERVA[estado]
  return (
    <span
      className={cn(
        base,
        config[variante],
        variante === 'solido' && 'px-3 py-1 text-sm',
        className
      )}
    >
      {config.etiqueta}
    </span>
  )
}

/* ------------------------------------------------------------ payment status */

interface BadgePagoProps {
  estado: EstadoPago
  /** Hides the label on narrow table columns; the icon and tooltip carry it. */
  soloIcono?: boolean
  className?: string
}

function BadgePago({ estado, soloIcono = false, className }: BadgePagoProps) {
  const config = ESTADO_PAGO[estado]
  const Icono = config.icono

  return (
    <span
      className={cn(base, config.clases, soloIcono && 'px-1.5', className)}
      title={soloIcono ? config.etiqueta : undefined}
    >
      <Icono className="size-3" aria-hidden />
      {soloIcono ? <span className="sr-only">{config.etiqueta}</span> : config.etiqueta}
    </span>
  )
}

/* -------------------------------------------------------------- blocked slot */

function BadgeBloqueo({ className }: { className?: string }) {
  const Icono = BLOQUEO.icono
  return (
    <span className={cn(base, BLOQUEO.clases, className)}>
      <Icono className="size-3" aria-hidden />
      {BLOQUEO.etiqueta}
    </span>
  )
}

/* ------------------------------------------------------------ support ticket */

function BadgeTicket({ estado, className }: { estado: EstadoTicket; className?: string }) {
  const config = ESTADO_TICKET[estado]
  const Icono = config.icono
  return (
    <span className={cn(base, config.clases, className)}>
      <Icono className="size-3" aria-hidden />
      {config.etiqueta}
    </span>
  )
}

/* --------------------------------------------------------------- court state */

function BadgeEstadoCancha({ activa, className }: { activa: boolean; className?: string }) {
  return (
    <Badge tono={activa ? 'exito' : 'contorno'} className={className}>
      <span
        className={cn('size-1.5 rounded-full', activa ? 'bg-confirmada-solido' : 'bg-cal-500')}
        aria-hidden
      />
      {activa ? 'Activa' : 'Desactivada'}
    </Badge>
  )
}

export { Badge, BadgeReserva, BadgePago, BadgeBloqueo, BadgeTicket, BadgeEstadoCancha }
