'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bell,
  CalendarClock,
  ChevronRight,
  KeyRound,
  LifeBuoy,
  LogOut,
  Search,
  ShieldCheck,
  TrendingDown,
  UserCog,
  XCircle,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { etiquetaDeRuta } from '@/lib/navegacion'
import { useDemo } from '@/lib/demo-context'
import { notificaciones } from '@/lib/mock-data'
import { ROL } from '@/lib/estados'
import { haceTiempo } from '@/lib/formato'
import type { TipoNotificacion } from '@/lib/types'
import { Avatar } from '@/components/ui/controls'
import { useBusqueda } from './command-palette'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

/**
 * Top bar: breadcrumb, the Ctrl+K search affordance, the notification panel and
 * the user menu, as the brief lays out.
 *
 * The search control is a button rather than a real input. It opens the command
 * palette, and showing a text field that does not accept typing where you
 * clicked is a small lie the interface does not need to tell.
 */

const ICONO_NOTIFICACION: Record<TipoNotificacion, typeof Bell> = {
  reserva_pendiente: CalendarClock,
  respuesta_soporte: LifeBuoy,
  cancelacion: XCircle,
  alerta_ocupacion: TrendingDown,
}

function Breadcrumb() {
  const pathname = usePathname()
  const etiqueta = etiquetaDeRuta(pathname)
  const esDetalle = pathname.split('/').filter(Boolean).length > 1

  return (
    <nav aria-label="Ruta de navegación" className="flex min-w-0 items-center gap-1.5 text-sm">
      <Link href="/" className="shrink-0 text-apagado transition-colors hover:text-tinta">
        Panel
      </Link>
      <ChevronRight className="size-3.5 shrink-0 text-cal-400" aria-hidden />
      <span className={cn('truncate', esDetalle ? 'text-apagado' : 'font-medium text-tinta')}>
        {etiqueta}
      </span>
      {esDetalle && (
        <>
          <ChevronRight className="size-3.5 shrink-0 text-cal-400" aria-hidden />
          <span className="truncate font-medium text-tinta">Detalle</span>
        </>
      )}
    </nav>
  )
}

function PanelNotificaciones() {
  const sinLeer = notificaciones.filter((n) => !n.leida).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'relative rounded p-2 text-tinta-media transition-colors duration-rapida',
            'hover:bg-cal-100 hover:text-tinta'
          )}
          aria-label={
            sinLeer > 0 ? `Notificaciones, ${sinLeer} sin leer` : 'Notificaciones, ninguna sin leer'
          }
        >
          <Bell className="size-4" aria-hidden />
          {sinLeer > 0 && (
            <span
              className={cn(
                'absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center',
                'rounded-full bg-error text-[10px] font-semibold text-white'
              )}
              aria-hidden
            >
              {sinLeer}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-96 p-0">
        <div className="flex items-center justify-between border-b border-borde px-3 py-2.5">
          <p className="font-display text-sm font-semibold text-tinta">Notificaciones</p>
          <button type="button" className="text-2xs text-primario hover:underline">
            Marcar todas como leídas
          </button>
        </div>

        <ul className="max-h-96 overflow-y-auto">
          {notificaciones.map((notificacion) => {
            const Icono = ICONO_NOTIFICACION[notificacion.tipo]

            return (
              <li key={notificacion.id}>
                <Link
                  href={notificacion.enlace}
                  className={cn(
                    'flex gap-3 border-b border-borde px-3 py-3 last:border-0',
                    'transition-colors duration-rapida hover:bg-cal-50',
                    !notificacion.leida && 'bg-cesped-50/40'
                  )}
                >
                  <Icono
                    className={cn(
                      'mt-0.5 size-4 shrink-0',
                      notificacion.leida ? 'text-cal-500' : 'text-primario'
                    )}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        'text-sm leading-snug',
                        notificacion.leida ? 'text-tinta-media' : 'font-medium text-tinta'
                      )}
                    >
                      {notificacion.titulo}
                    </p>
                    <p className="mt-0.5 text-xs text-apagado">{notificacion.detalle}</p>
                    <p className="mt-1 text-2xs text-cal-500">{haceTiempo(notificacion.fecha)}</p>
                  </div>
                  {!notificacion.leida && (
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primario" aria-hidden />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function MenuUsuario() {
  const { usuario } = useDemo()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="rounded-full transition-opacity duration-rapida hover:opacity-80"
          aria-label={`Menú de ${usuario.nombre}`}
        >
          <Avatar nombre={usuario.nombre} size="md" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-60">
        <div className="px-2 py-2">
          <p className="truncate text-sm font-medium text-tinta">{usuario.nombre}</p>
          <p className="truncate text-xs text-apagado">{usuario.correo}</p>
          <p className="mt-1 text-2xs text-cal-500">{ROL[usuario.rol].etiqueta}</p>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/perfil">
            <UserCog aria-hidden />
            Mi perfil
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/perfil?seccion=password">
            <KeyRound aria-hidden />
            Cambiar contraseña
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/perfil?seccion=2fa">
            <ShieldCheck aria-hidden />
            Verificación en dos pasos
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild peligro>
          <Link href="/login">
            <LogOut aria-hidden />
            Cerrar sesión
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function Header() {
  const { abrir: abrirBusqueda } = useBusqueda()

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-header shrink-0 items-center gap-4',
        'border-b border-borde bg-superficie/95 px-5 backdrop-blur'
      )}
    >
      <Breadcrumb />

      <div className="ml-auto flex items-center gap-1.5">
        {/* A button, not an input: it opens the palette rather than accepting
            typing in place, and the control should say what it actually does. */}
        <button
          type="button"
          onClick={abrirBusqueda}
          className={cn(
            'flex items-center gap-2 rounded border border-borde-control bg-superficie',
            'px-2.5 py-1.5 text-sm text-apagado transition-colors duration-rapida',
            'hover:border-cal-600 hover:text-tinta-media'
          )}
        >
          <Search className="size-3.5" aria-hidden />
          <span className="hidden lg:inline">Buscar</span>
          <kbd className="hidden rounded border border-borde bg-cal-100 px-1 py-0.5 text-[10px] lg:inline">
            Ctrl K
          </kbd>
        </button>

        <PanelNotificaciones />
        <MenuUsuario />
      </div>
    </header>
  )
}
