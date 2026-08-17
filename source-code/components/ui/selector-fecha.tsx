'use client'

import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { DIAS_SEMANA } from '@/lib/estados'
import { capitalizar, fechaCorta, mesAno } from '@/lib/formato'
import { HOY, desplazarDias, diaSemana } from '@/lib/mock-data'
import { Button } from './button'

/**
 * Date and date-range pickers, built as a month grid rather than on
 * `<input type="date">`.
 *
 * Same reason the time fields are a select: the native control renders in the
 * *browser's* locale, not the document's, so on an English-locale machine a
 * Spanish product shows 08/17/2026 while every other date on screen reads
 * 17/08/2026. A grid is also simply the right control for picking a booking
 * range, and it lets the ranges carry the presets an operator actually wants.
 */

/* ------------------------------------------------------------- month grid */

function celdasDelMes(ancla: string): string[] {
  const primero = `${ancla.slice(0, 7)}-01`
  const inicio = desplazarDias(primero, -(diaSemana(primero) - 1))
  return Array.from({ length: 42 }, (_, i) => desplazarDias(inicio, i))
}

interface MallaMesProps {
  ancla: string
  onAncla: (fecha: string) => void
  /** Currently chosen day, or the ends of the chosen range. */
  desde?: string
  hasta?: string
  onElegir: (fecha: string) => void
}

function MallaMes({ ancla, onAncla, desde, hasta, onElegir }: MallaMesProps) {
  const mes = ancla.slice(0, 7)
  const dias = celdasDelMes(ancla)

  function moverMes(direccion: -1 | 1) {
    const [ano, m] = ancla.split('-').map(Number)
    onAncla(new Date(Date.UTC(ano, m - 1 + direccion, 1)).toISOString().slice(0, 10))
  }

  return (
    <div className="w-64">
      <div className="mb-2 flex items-center justify-between">
        <Button variant="fantasma" size="icono-sm" onClick={() => moverMes(-1)} aria-label="Mes anterior">
          <ChevronLeft aria-hidden />
        </Button>
        <p className="font-display text-sm font-semibold text-tinta">
          {capitalizar(mesAno(ancla))}
        </p>
        <Button variant="fantasma" size="icono-sm" onClick={() => moverMes(1)} aria-label="Mes siguiente">
          <ChevronRight aria-hidden />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {DIAS_SEMANA.map((dia) => (
          <span key={dia.valor} className="etiqueta py-1 text-center">
            {dia.corto}
          </span>
        ))}

        {dias.map((fecha) => {
          const delMes = fecha.slice(0, 7) === mes
          const esHoy = fecha === HOY
          const esInicio = fecha === desde
          const esFin = fecha === hasta
          const dentro = Boolean(desde && hasta && fecha > desde && fecha < hasta)

          return (
            <button
              key={fecha}
              type="button"
              onClick={() => onElegir(fecha)}
              aria-current={esHoy ? 'date' : undefined}
              className={cn(
                'h-8 rounded-sm font-mono text-2xs numeros-tabulares',
                'transition-colors duration-rapida',
                delMes ? 'text-tinta' : 'text-cal-400',
                dentro && 'bg-cesped-50 text-cesped-700',
                (esInicio || esFin) && 'bg-primario font-semibold text-white',
                !esInicio && !esFin && !dentro && 'hover:bg-cal-200',
                esHoy && !esInicio && !esFin && 'ring-1 ring-inset ring-laton-300'
              )}
            >
              {Number(fecha.slice(8, 10))}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------ range filter */

export interface RangoFiltro {
  desde: string
  hasta: string
}

interface FiltroRangoFechasProps {
  valor: RangoFiltro | null
  onCambio: (valor: RangoFiltro | null) => void
  /** Shown on the trigger when no range is set. */
  etiquetaVacia?: string
  className?: string
}

const PRESETS: { etiqueta: string; rango: () => RangoFiltro }[] = [
  { etiqueta: 'Hoy', rango: () => ({ desde: HOY, hasta: HOY }) },
  { etiqueta: 'Próximos 7 días', rango: () => ({ desde: HOY, hasta: desplazarDias(HOY, 6) }) },
  { etiqueta: 'Últimos 7 días', rango: () => ({ desde: desplazarDias(HOY, -6), hasta: HOY }) },
  { etiqueta: 'Últimos 30 días', rango: () => ({ desde: desplazarDias(HOY, -29), hasta: HOY }) },
  {
    etiqueta: 'Este mes',
    rango: () => {
      const [ano, mes] = HOY.split('-').map(Number)
      return {
        desde: `${HOY.slice(0, 7)}-01`,
        hasta: new Date(Date.UTC(ano, mes, 0)).toISOString().slice(0, 10),
      }
    },
  },
]

export function FiltroRangoFechas({
  valor,
  onCambio,
  etiquetaVacia = 'Cualquier fecha',
  className,
}: FiltroRangoFechasProps) {
  const [abierto, setAbierto] = React.useState(false)
  const [ancla, setAncla] = React.useState(valor?.desde ?? HOY)
  /** Half-finished selection: the first click sets the start. */
  const [parcial, setParcial] = React.useState<string | null>(null)

  function elegir(fecha: string) {
    if (!parcial) {
      setParcial(fecha)
      onCambio({ desde: fecha, hasta: fecha })
      return
    }

    const [desde, hasta] = fecha < parcial ? [fecha, parcial] : [parcial, fecha]
    setParcial(null)
    onCambio({ desde, hasta })
    setAbierto(false)
  }

  const etiqueta = valor
    ? valor.desde === valor.hasta
      ? fechaCorta(valor.desde)
      : `${fechaCorta(valor.desde)} - ${fechaCorta(valor.hasta)}`
    : etiquetaVacia

  return (
    <PopoverPrimitive.Root open={abierto} onOpenChange={setAbierto}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          aria-label="Filtrar por rango de fechas"
          className={cn(
            'flex h-8 items-center gap-2 rounded border bg-superficie px-2.5 text-xs',
            'transition-colors duration-rapida',
            valor
              ? 'border-primario text-cesped-700'
              : 'border-borde-control text-tinta-media hover:border-cal-600',
            className
          )}
        >
          <CalendarDays className="size-3.5 shrink-0 text-cal-500" aria-hidden />
          <span className="numeros-tabulares">{etiqueta}</span>
          {valor && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Quitar el filtro de fechas"
              onClick={(evento) => {
                evento.stopPropagation()
                onCambio(null)
                setParcial(null)
              }}
              onKeyDown={(evento) => {
                if (evento.key === 'Enter' || evento.key === ' ') {
                  evento.preventDefault()
                  evento.stopPropagation()
                  onCambio(null)
                }
              }}
              className="rounded-full p-0.5 hover:bg-cal-200"
            >
              <X className="size-3" aria-hidden />
            </span>
          )}
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={6}
          className={cn(
            'z-50 rounded-lg border border-borde bg-superficie p-3 shadow-lg',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95'
          )}
        >
          <div className="flex gap-4">
            <div className="w-36 shrink-0 space-y-0.5 border-r border-borde pr-3">
              <p className="etiqueta mb-1.5">Atajos</p>
              {PRESETS.map((preset) => (
                <button
                  key={preset.etiqueta}
                  type="button"
                  onClick={() => {
                    const rango = preset.rango()
                    onCambio(rango)
                    setAncla(rango.desde)
                    setParcial(null)
                    setAbierto(false)
                  }}
                  className={cn(
                    'block w-full rounded px-2 py-1 text-left text-xs text-tinta-media',
                    'transition-colors duration-rapida hover:bg-cesped-50 hover:text-cesped-700'
                  )}
                >
                  {preset.etiqueta}
                </button>
              ))}
            </div>

            <div>
              <MallaMes
                ancla={ancla}
                onAncla={setAncla}
                desde={valor?.desde}
                hasta={valor?.hasta}
                onElegir={elegir}
              />
              <p className="mt-2 text-2xs text-apagado">
                {parcial
                  ? 'Elige la fecha de fin.'
                  : 'Pulsa una fecha de inicio y otra de fin.'}
              </p>
            </div>
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}

export { MallaMes }
