'use client'

import * as React from 'react'
import { Eye, SlidersHorizontal, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useDemo } from '@/lib/demo-context'
import { usuarios } from '@/lib/mock-data'
import { ROL, MODULO, ORDEN_MODULO } from '@/lib/estados'
import type { EstadoVista } from '@/lib/types'

/**
 * Review controls, docked bottom-right.
 *
 * This panel is scaffolding for the design review, not part of the product. The
 * brief asks for every screen in default, loading and empty states and for a
 * sidebar that hides modules a colaborador cannot access. In a static
 * deliverable with no backend and no auth, none of that is reachable unless the
 * reviewer can switch it directly.
 *
 * Delete this component and its provider the day a real API and real session
 * land, and nothing else in the codebase changes.
 */

const ESTADOS: { valor: EstadoVista; etiqueta: string; ayuda: string }[] = [
  { valor: 'default', etiqueta: 'Normal', ayuda: 'La pantalla con sus datos' },
  { valor: 'loading', etiqueta: 'Cargando', ayuda: 'Esqueletos de carga' },
  { valor: 'empty', etiqueta: 'Vacío', ayuda: 'Sin datos, con su acción principal' },
]

export function DemoControls() {
  const { usuario, setUsuarioId, estadoVista, setEstadoVista } = useDemo()
  const [abierto, setAbierto] = React.useState(false)

  const modulosVisibles = ORDEN_MODULO.filter(
    (modulo) => usuario.rol === 'admin_principal' || usuario.permisos[modulo]
  )

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className={cn(
          'fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full',
          'border border-borde bg-superficie px-3.5 py-2 shadow-lg',
          'text-xs font-medium text-tinta-media',
          'transition-colors duration-rapida hover:border-cal-500 hover:text-tinta'
        )}
      >
        <SlidersHorizontal className="size-3.5" aria-hidden />
        Vista de revisión
        {estadoVista !== 'default' && (
          <span className="rounded-full bg-pendiente-bg px-1.5 py-0.5 text-[10px] text-pendiente-texto">
            {ESTADOS.find((e) => e.valor === estadoVista)?.etiqueta}
          </span>
        )}
      </button>
    )
  }

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50 w-80 overflow-hidden rounded-xl',
        'border border-borde bg-superficie shadow-lg'
      )}
    >
      <div className="flex items-center justify-between border-b border-borde px-4 py-2.5">
        <p className="flex items-center gap-2 font-display text-sm font-semibold text-tinta">
          <Eye className="size-3.5 text-primario" aria-hidden />
          Vista de revisión
        </p>
        <button
          type="button"
          onClick={() => setAbierto(false)}
          className="rounded p-1 text-apagado transition-colors hover:bg-cal-100 hover:text-tinta"
          aria-label="Cerrar panel de revisión"
        >
          <X className="size-3.5" aria-hidden />
        </button>
      </div>

      <div className="space-y-4 px-4 py-3.5">
        {/* -------------------------------------------------- screen state */}
        <div>
          <p className="etiqueta mb-2">Estado de la pantalla</p>
          <div className="grid grid-cols-3 gap-1.5">
            {ESTADOS.map((estado) => (
              <button
                key={estado.valor}
                type="button"
                onClick={() => setEstadoVista(estado.valor)}
                aria-pressed={estadoVista === estado.valor}
                className={cn(
                  'rounded border px-2 py-1.5 text-xs transition-colors duration-rapida',
                  estadoVista === estado.valor
                    ? 'border-primario bg-cesped-50 font-medium text-cesped-700'
                    : 'border-borde text-tinta-media hover:border-cal-500 hover:text-tinta'
                )}
              >
                {estado.etiqueta}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-2xs text-apagado">
            {ESTADOS.find((e) => e.valor === estadoVista)?.ayuda}
          </p>
        </div>

        {/* --------------------------------------------------------- role */}
        <div>
          <p className="etiqueta mb-2">Usuario y permisos</p>
          <div className="space-y-1">
            {usuarios
              .filter((u) => u.estado === 'activo')
              .map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setUsuarioId(u.id)}
                  aria-pressed={usuario.id === u.id}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 rounded border px-2 py-1.5',
                    'text-left text-xs transition-colors duration-rapida',
                    usuario.id === u.id
                      ? 'border-primario bg-cesped-50'
                      : 'border-borde hover:border-cal-500'
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-tinta">{u.nombre}</span>
                    <span className="block truncate text-2xs text-apagado">
                      {ROL[u.rol].etiqueta}
                    </span>
                  </span>
                </button>
              ))}
          </div>
        </div>

        {/* ------------------------------------------------ visible modules */}
        <div>
          <p className="etiqueta mb-1.5">Módulos visibles ahora</p>
          <div className="flex flex-wrap gap-1">
            {modulosVisibles.map((modulo) => (
              <span
                key={modulo}
                className="rounded-full bg-cal-200 px-1.5 py-0.5 text-[10px] text-cal-800"
              >
                {MODULO[modulo]}
              </span>
            ))}
          </div>
          <p className="mt-1.5 text-2xs text-apagado">
            {modulosVisibles.length === 8
              ? 'Permisos totales, la barra lateral muestra todo.'
              : `${8 - modulosVisibles.length} módulos ocultos en la barra lateral.`}
          </p>
        </div>
      </div>

      <div className="border-t border-borde bg-superficie-alt px-4 py-2.5">
        <p className="text-2xs text-apagado">
          Panel de revisión del diseño. No forma parte del producto.
        </p>
      </div>
    </div>
  )
}
