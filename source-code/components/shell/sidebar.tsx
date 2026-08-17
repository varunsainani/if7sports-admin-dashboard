'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, PanelLeftClose, PanelLeftOpen, UserCog } from 'lucide-react'

import { cn } from '@/lib/utils'
import { NAVEGACION, esRutaActiva } from '@/lib/navegacion'
import { useDemo } from '@/lib/demo-context'
import { polideportivo } from '@/lib/mock-data'
import { ROL } from '@/lib/estados'
import { Avatar } from '@/components/ui/controls'
import { Tooltip } from '@/components/ui/dropdown-menu'

/**
 * Fixed on desktop, collapsible on tablet, exactly as the brief describes.
 *
 * Items are filtered against the signed-in user's permissions rather than
 * rendered disabled. A colaborador who cannot open Métricas has no reason to
 * know the module exists, and a greyed-out row invites a click that goes
 * nowhere.
 */

/** The facility mark. Court lines rather than a generic app glyph. */
function Marca({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden>
      <rect x="1" y="4" width="30" height="24" rx="2" fill="var(--cesped-500)" />
      <line x1="16" y1="4" x2="16" y2="28" stroke="var(--cesped-100)" strokeWidth="1.25" />
      <circle cx="16" cy="16" r="5" stroke="var(--cesped-100)" strokeWidth="1.25" />
      <rect x="1" y="10" width="5" height="12" stroke="var(--cesped-100)" strokeWidth="1.25" />
      <rect x="26" y="10" width="5" height="12" stroke="var(--cesped-100)" strokeWidth="1.25" />
    </svg>
  )
}

interface SidebarProps {
  plegado: boolean
  onAlternar: () => void
}

export function Sidebar({ plegado, onAlternar }: SidebarProps) {
  const pathname = usePathname()
  const { usuario, puedeVer } = useDemo()

  const grupos = NAVEGACION.map((grupo) => ({
    ...grupo,
    items: grupo.items.filter((item) => puedeVer(item.modulo)),
  })).filter((grupo) => grupo.items.length > 0)

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-borde bg-superficie',
        'transition-[width] duration-base ease-curva',
        plegado ? 'w-sidebar-plegado' : 'w-sidebar'
      )}
    >
      {/* ------------------------------------------------- facility identity */}
      <div
        className={cn(
          'flex h-header shrink-0 items-center gap-2.5 border-b border-borde px-3',
          plegado && 'justify-center px-0'
        )}
      >
        <Marca className="size-7 shrink-0" />
        {!plegado && (
          <div className="min-w-0">
            <p className="line-clamp-2 font-display text-xs font-semibold leading-tight text-tinta">
              {polideportivo.nombre}
            </p>
            <p className="truncate text-2xs text-apagado">IF7SPORTS</p>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------- navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4" aria-label="Navegación principal">
        {grupos.map((grupo) => (
          <div key={grupo.titulo} className="mb-5 last:mb-0">
            {!plegado && <p className="etiqueta mb-1.5 px-2">{grupo.titulo}</p>}
            {plegado && <div className="mx-auto mb-2 h-px w-6 bg-borde" role="presentation" />}

            <ul className="space-y-0.5">
              {grupo.items.map((item) => {
                const activo = esRutaActiva(item, pathname)
                const Icono = item.icono

                const enlace = (
                  <Link
                    href={item.href}
                    aria-current={activo ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-2.5 rounded px-2 py-1.5 text-base',
                      'transition-colors duration-rapida ease-curva',
                      plegado && 'justify-center px-0',
                      activo
                        ? 'bg-cesped-50 font-medium text-cesped-700'
                        : 'text-tinta-media hover:bg-cal-100 hover:text-tinta'
                    )}
                  >
                    <Icono
                      className={cn('size-4 shrink-0', activo ? 'text-primario' : 'text-cal-500')}
                      aria-hidden
                    />
                    {!plegado && <span className="truncate">{item.etiqueta}</span>}
                    {plegado && <span className="sr-only">{item.etiqueta}</span>}
                  </Link>
                )

                return (
                  <li key={item.href}>
                    {plegado ? (
                      <Tooltip texto={item.etiqueta} side="right">
                        {enlace}
                      </Tooltip>
                    ) : (
                      enlace
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* ---------------------------------------------------- signed-in user */}
      <div className="shrink-0 border-t border-borde p-2">
        <Link
          href="/perfil"
          className={cn(
            'flex items-center gap-2.5 rounded p-1.5 transition-colors duration-rapida',
            'hover:bg-cal-100',
            plegado && 'justify-center'
          )}
        >
          <Avatar nombre={usuario.nombre} size="md" />
          {!plegado && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium leading-tight text-tinta">
                {usuario.nombre}
              </p>
              <p className="truncate text-2xs text-apagado">{ROL[usuario.rol].etiqueta}</p>
            </div>
          )}
          {!plegado && <UserCog className="size-4 shrink-0 text-cal-500" aria-hidden />}
        </Link>

        {!plegado && (
          <Link
            href="/login"
            className={cn(
              'mt-1 flex items-center gap-2.5 rounded px-2 py-1.5 text-sm text-tinta-media',
              'transition-colors duration-rapida hover:bg-cal-100 hover:text-tinta'
            )}
          >
            <LogOut className="size-4 shrink-0 text-cal-500" aria-hidden />
            Cerrar sesión
          </Link>
        )}

        <button
          type="button"
          onClick={onAlternar}
          aria-expanded={!plegado}
          className={cn(
            'mt-1 flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-sm text-apagado',
            'transition-colors duration-rapida hover:bg-cal-100 hover:text-tinta',
            plegado && 'justify-center px-0'
          )}
        >
          {plegado ? (
            <PanelLeftOpen className="size-4 shrink-0" aria-hidden />
          ) : (
            <PanelLeftClose className="size-4 shrink-0" aria-hidden />
          )}
          {plegado ? (
            <span className="sr-only">Expandir menú</span>
          ) : (
            <span>Plegar menú</span>
          )}
        </button>
      </div>
    </aside>
  )
}

export { Marca }
