import * as React from 'react'
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Skeleton } from './skeleton'

/**
 * Page-level furniture shared by every screen: the title block, the metric
 * card, and the section wrapper. Keeping these here is what stops fifteen
 * screens from each inventing their own heading size and spacing.
 */

/* --------------------------------------------------------------- PageHeader */

interface PageHeaderProps {
  titulo: string
  /** One line saying what this screen is for. Omitted when the title suffices. */
  descripcion?: string
  /** Primary and secondary actions, right aligned. */
  acciones?: React.ReactNode
  className?: string
}

function PageHeader({ titulo, descripcion, acciones, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-6 flex flex-wrap items-start justify-between gap-4', className)}>
      <div className="min-w-0">
        <span className="mb-2 block h-0.5 w-8 rounded-full bg-laton-300" aria-hidden />
        <h1 className="font-display text-2xl font-semibold tracking-display text-tinta">{titulo}</h1>
        {descripcion && <p className="mt-1 max-w-2xl text-base text-apagado">{descripcion}</p>}
      </div>
      {acciones && <div className="flex flex-wrap items-center gap-2.5">{acciones}</div>}
    </div>
  )
}

/* ------------------------------------------------------------------ Section */

interface SectionProps {
  titulo?: string
  descripcion?: string
  acciones?: React.ReactNode
  children: React.ReactNode
  className?: string
}

function Section({ titulo, descripcion, acciones, children, className }: SectionProps) {
  return (
    <section className={cn('mb-8 last:mb-0', className)}>
      {(titulo || acciones) && (
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            {titulo && (
              <h2 className="font-display text-lg font-semibold text-tinta">{titulo}</h2>
            )}
            {descripcion && <p className="mt-0.5 text-xs text-apagado">{descripcion}</p>}
          </div>
          {acciones && <div className="flex items-center gap-2">{acciones}</div>}
        </div>
      )}
      {children}
    </section>
  )
}

/* --------------------------------------------------------------- MetricCard
   The figure is the point, so it is set in the display face at the largest
   size on the screen. The label sits above it, small and quiet, because you
   read the number first and then check what it measures. */

interface MetricCardProps {
  etiqueta: string
  valor: string
  /** Period-over-period movement. Omit when there is nothing to compare to. */
  variacion?: number
  /** What the variation is measured against, e.g. "vs. mes anterior". */
  comparacion?: string
  icono?: React.ReactNode
  /** Small note under the figure, e.g. a breakdown or a caveat. */
  nota?: string
  className?: string
}

function MetricCard({
  etiqueta,
  valor,
  variacion,
  comparacion,
  icono,
  nota,
  className,
}: MetricCardProps) {
  const sinCambio = variacion !== undefined && Math.abs(variacion) < 0.05
  const sube = variacion !== undefined && variacion > 0

  // Direction is shown by an arrow as well as a colour, so the movement is
  // still readable without colour perception.
  const IconoVariacion = sinCambio ? Minus : sube ? ArrowUpRight : ArrowDownRight

  return (
    <div className={cn('rounded-lg border border-borde bg-superficie p-5 shadow-sm', className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="etiqueta">{etiqueta}</p>
        {icono && (
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-laton-50 text-laton-600 [&_svg]:size-3.5">
            {icono}
          </span>
        )}
      </div>

      <p className="mt-2 font-display text-3xl font-semibold tracking-display text-tinta numeros-tabulares">
        {valor}
      </p>

      {variacion !== undefined && (
        <div className="mt-2 flex items-center gap-1.5">
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-2xs font-medium',
              sinCambio
                ? 'bg-cal-200 text-cal-700'
                : sube
                  ? 'bg-confirmada-bg text-confirmada-texto'
                  : 'bg-cancelada-bg text-cancelada-texto'
            )}
          >
            <IconoVariacion className="size-3" aria-hidden />
            {sinCambio ? 'Sin cambios' : `${Math.abs(variacion).toFixed(1).replace('.', ',')} %`}
          </span>
          {comparacion && <span className="text-2xs text-apagado">{comparacion}</span>}
        </div>
      )}

      {nota && <p className="mt-2 text-xs text-apagado">{nota}</p>}
    </div>
  )
}

/* ------------------------------------------------------- data point / stat
   Label and value pairs used on detail screens and inside the booking modal. */

function Dato({
  etiqueta,
  children,
  className,
}: {
  etiqueta: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('min-w-0', className)}>
      <dt className="etiqueta">{etiqueta}</dt>
      <dd className="mt-1 text-base text-tinta">{children}</dd>
    </div>
  )
}

function ListaDatos({
  children,
  columnas = 2,
  className,
}: {
  children: React.ReactNode
  columnas?: 1 | 2 | 3 | 4
  className?: string
}) {
  const grid = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
  }[columnas]

  return <dl className={cn('grid gap-x-6 gap-y-5', grid, className)}>{children}</dl>
}

/* ------------------------------------------------------------ counter tile
   Used on the client detail screen for active, cancelled and completed counts. */

function Contador({
  etiqueta,
  valor,
  tono = 'neutro',
}: {
  etiqueta: string
  valor: number
  tono?: 'neutro' | 'confirmada' | 'cancelada' | 'completada'
}) {
  const tonos = {
    neutro: 'border-borde bg-superficie text-tinta',
    confirmada: 'border-confirmada-borde bg-confirmada-bg text-confirmada-texto',
    cancelada: 'border-cancelada-borde bg-cancelada-bg text-cancelada-texto',
    completada: 'border-completada-borde bg-completada-bg text-completada-texto',
  }

  return (
    <div className={cn('rounded-lg border px-4 py-3', tonos[tono])}>
      <p className="font-display text-2xl font-semibold numeros-tabulares">{valor}</p>
      <p className="mt-0.5 text-xs opacity-80">{etiqueta}</p>
    </div>
  )
}

/* ----------------------------------------------------------------- loading */

function PageHeaderSkeleton() {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <Skeleton className="h-7 w-56" />
        <Skeleton className="mt-2 h-3.5 w-80" />
      </div>
      <Skeleton className="h-9 w-36" />
    </div>
  )
}

export {
  PageHeader,
  PageHeaderSkeleton,
  Section,
  MetricCard,
  Dato,
  ListaDatos,
  Contador,
}
