'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * Shared chart furniture.
 *
 * Two rules hold across every chart on the metrics screen:
 *
 *   Grid and axes are recessive. They orient the reader and then get out of the
 *   way; anything heavier competes with the marks it is supposed to support.
 *
 *   Text wears text tokens, never the series colour. A coloured swatch beside a
 *   label carries identity, so the label itself stays in ink and remains legible
 *   at any size.
 */

/** Tokens shared by every Recharts axis and grid on this screen. */
export const EJE = {
  stroke: 'var(--grafico-eje)',
  fontSize: 11,
  fontFamily: 'var(--fuente-mono)',
  tickLine: false,
  axisLine: false,
} as const

export const REJILLA = {
  stroke: 'var(--grafico-rejilla)',
  strokeDasharray: '3 3',
  vertical: false,
} as const

/* ---------------------------------------------------------------- tooltip */

interface FilaTooltip {
  etiqueta: string
  valor: string
  color?: string
}

/** One tooltip shape for all charts, so hovering never changes register. */
export function TooltipCaja({
  titulo,
  filas,
}: {
  titulo: string
  filas: FilaTooltip[]
}) {
  return (
    <div className="rounded-lg border border-borde bg-superficie px-3 py-2 shadow-lg">
      <p className="text-2xs font-medium text-tinta">{titulo}</p>
      <ul className="mt-1 space-y-0.5">
        {filas.map((fila) => (
          <li key={fila.etiqueta} className="flex items-center gap-2 text-2xs">
            {fila.color && (
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: fila.color }}
                aria-hidden
              />
            )}
            <span className="text-apagado">{fila.etiqueta}</span>
            <span className="ml-auto font-mono text-tinta numeros-tabulares">{fila.valor}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ----------------------------------------------------------------- legend
   Present whenever a chart carries two or more series, so identity never rests
   on colour alone. A single-series chart gets none: its title names it. */

export function Leyenda({
  items,
  className,
}: {
  items: { etiqueta: string; color: string; valor?: string }[]
  className?: string
}) {
  return (
    <ul className={cn('flex flex-wrap items-center gap-x-4 gap-y-1.5', className)}>
      {items.map((item) => (
        <li key={item.etiqueta} className="flex items-center gap-1.5 text-2xs text-tinta-media">
          <span
            className="size-2.5 shrink-0 rounded-sm"
            style={{ backgroundColor: item.color }}
            aria-hidden
          />
          {item.etiqueta}
          {item.valor && (
            <span className="font-mono text-apagado numeros-tabulares">{item.valor}</span>
          )}
        </li>
      ))}
    </ul>
  )
}

/* ------------------------------------------------------------- chart card */

interface PanelGraficoProps {
  titulo: string
  descripcion?: string
  /** Rendered top-right: a granularity selector, a total, a table toggle. */
  acciones?: React.ReactNode
  children: React.ReactNode
  className?: string
  /** Screen-reader summary of what the chart shows, since SVG marks are mute. */
  resumen?: string
}

export function PanelGrafico({
  titulo,
  descripcion,
  acciones,
  children,
  className,
  resumen,
}: PanelGraficoProps) {
  return (
    <section className={cn('rounded-lg border border-borde bg-superficie', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 pb-2 pt-4">
        <div>
          <h3 className="font-display text-base font-semibold text-tinta">{titulo}</h3>
          {descripcion && <p className="mt-0.5 text-2xs text-apagado">{descripcion}</p>}
        </div>
        {acciones && <div className="flex items-center gap-2">{acciones}</div>}
      </div>

      <div className="px-5 pb-5">
        {resumen && <p className="sr-only">{resumen}</p>}
        {children}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------- table view
   Every chart can be read as a table. It is the accessibility fallback and,
   for a facility owner reconciling numbers, often the thing they actually
   wanted. */

export function TablaDatos({
  cabeceras,
  filas,
}: {
  cabeceras: string[]
  filas: (string | number)[][]
}) {
  return (
    <div className="max-h-64 overflow-auto rounded border border-borde">
      <table className="w-full text-2xs">
        <thead className="sticky top-0 bg-superficie-alt">
          <tr>
            {cabeceras.map((cabecera) => (
              <th key={cabecera} scope="col" className="etiqueta px-3 py-2 text-left">
                {cabecera}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila, i) => (
            <tr key={i} className="border-t border-borde">
              {fila.map((celda, j) => (
                <td
                  key={j}
                  className={cn(
                    'px-3 py-1.5',
                    j === 0 ? 'text-tinta' : 'font-mono text-tinta-media numeros-tabulares'
                  )}
                >
                  {celda}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Toggle between the chart and its table. */
export function AlternarTabla({
  mostrandoTabla,
  onCambio,
}: {
  mostrandoTabla: boolean
  onCambio: (mostrar: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onCambio(!mostrandoTabla)}
      className={cn(
        'rounded border border-borde-control px-2 py-1 text-2xs text-tinta-media',
        'transition-colors duration-rapida hover:border-cal-600 hover:text-tinta'
      )}
      aria-pressed={mostrandoTabla}
    >
      {mostrandoTabla ? 'Ver gráfico' : 'Ver tabla'}
    </button>
  )
}
