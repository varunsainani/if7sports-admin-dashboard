'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'
import type { Festivo } from '@/lib/types'
import { DIAS_SEMANA } from '@/lib/estados'
import { capitalizar, fechaLarga } from '@/lib/formato'
import { desplazarDias, diaSemana } from '@/lib/mock-data'

/**
 * Twelve-month grid for marking closures and reduced-hours exceptions.
 *
 * The brief asks for a "calendario anual para marcar días cerrados y
 * excepciones horarias". A read-only list of dates answers "which days" but not
 * "how is the year shaped", which is the question an owner opens this to ask:
 * whether closures cluster, and whether a month is unusually thin.
 *
 * Closed days are struck in the cancelled treatment, reduced-hours days in the
 * pending one, so the two kinds of exception are distinguishable at a glance
 * and follow the same status language as the rest of the product.
 */

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function diasDelMes(ano: number, mes: number): (string | null)[] {
  const primero = `${ano}-${String(mes + 1).padStart(2, '0')}-01`
  const total = new Date(Date.UTC(ano, mes + 1, 0)).getUTCDate()
  const relleno = diaSemana(primero) - 1

  return [
    ...Array.from({ length: relleno }, () => null),
    ...Array.from({ length: total }, (_, i) => desplazarDias(primero, i)),
  ]
}

interface CalendarioAnualProps {
  ano: number
  festivos: Festivo[]
  /** Clicking a day marks or edits a closure for it. */
  onElegirDia?: (fecha: string, festivo?: Festivo) => void
}

export function CalendarioAnual({ ano, festivos, onElegirDia }: CalendarioAnualProps) {
  const porFecha = React.useMemo(
    () => new Map(festivos.map((f) => [f.fecha, f])),
    [festivos]
  )

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {MESES.map((nombre, mes) => (
          <div key={nombre} className="rounded-lg border border-borde bg-superficie-alt p-2.5">
            <p className="etiqueta mb-1.5 px-0.5">{nombre}</p>

            <div className="grid grid-cols-7 gap-px">
              {DIAS_SEMANA.map((dia) => (
                <span
                  key={dia.valor}
                  className="pb-1 text-center font-mono text-[9px] text-cal-500"
                >
                  {dia.corto}
                </span>
              ))}

              {diasDelMes(ano, mes).map((fecha, i) => {
                if (!fecha) return <span key={`v-${i}`} />

                const festivo = porFecha.get(fecha)
                const cerrado = festivo?.tipo === 'cerrado'
                const especial = festivo?.tipo === 'horario_especial'

                return (
                  <button
                    key={fecha}
                    type="button"
                    onClick={() => onElegirDia?.(fecha, festivo)}
                    title={
                      festivo
                        ? `${festivo.nombre} · ${capitalizar(fechaLarga(fecha))}`
                        : capitalizar(fechaLarga(fecha))
                    }
                    className={cn(
                      'aspect-square rounded-sm font-mono text-[9px] leading-none',
                      'transition-colors duration-rapida',
                      cerrado &&
                        'bg-cancelada-bg font-semibold text-cancelada-texto ring-1 ring-inset ring-cancelada-borde',
                      especial &&
                        'bg-pendiente-bg font-semibold text-pendiente-texto ring-1 ring-inset ring-pendiente-borde',
                      !festivo && 'text-tinta-media hover:bg-cal-200'
                    )}
                  >
                    {Number(fecha.slice(8, 10))}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-borde pt-3">
        <span className="flex items-center gap-1.5 text-2xs text-apagado">
          <span
            className="size-3 rounded-sm bg-cancelada-bg ring-1 ring-inset ring-cancelada-borde"
            aria-hidden
          />
          Cerrado todo el día
        </span>
        <span className="flex items-center gap-1.5 text-2xs text-apagado">
          <span
            className="size-3 rounded-sm bg-pendiente-bg ring-1 ring-inset ring-pendiente-borde"
            aria-hidden
          />
          Horario especial
        </span>
        <span className="ml-auto text-2xs text-apagado">
          Pulsa cualquier día para marcarlo o editarlo.
        </span>
      </div>
    </div>
  )
}
