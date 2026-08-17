import {
  Ban,
  BarChart3,
  Building2,
  CalendarDays,
  LayoutDashboard,
  LifeBuoy,
  ShieldCheck,
  Trophy,
  Users,
  ClipboardList,
  type LucideIcon,
} from 'lucide-react'

import type { Modulo } from './types'

/**
 * Sidebar structure, grouped exactly as the brief specifies.
 *
 * Each item declares the module it belongs to, which is what lets the sidebar
 * filter itself against the signed-in user's permissions. Nav order is the
 * order of a working day: what is happening now, then what you manage, then
 * what you review, then what you configure.
 */

export interface ItemNav {
  href: string
  etiqueta: string
  icono: LucideIcon
  modulo: Modulo
  /** Matched as a prefix so detail routes keep the parent item active. */
  coincidePrefijo?: boolean
}

export interface GrupoNav {
  titulo: string
  items: ItemNav[]
}

export const NAVEGACION: GrupoNav[] = [
  {
    titulo: 'Operación',
    items: [
      { href: '/', etiqueta: 'Dashboard', icono: LayoutDashboard, modulo: 'reservas' },
      {
        href: '/reservas',
        etiqueta: 'Reservas',
        icono: CalendarDays,
        modulo: 'reservas',
        coincidePrefijo: true,
      },
      { href: '/bloqueos', etiqueta: 'Bloqueos', icono: Ban, modulo: 'bloqueos' },
      {
        href: '/clientes',
        etiqueta: 'Clientes',
        icono: Users,
        modulo: 'clientes',
        coincidePrefijo: true,
      },
    ],
  },
  {
    titulo: 'Gestión',
    items: [
      {
        href: '/canchas',
        etiqueta: 'Canchas',
        icono: Trophy,
        modulo: 'canchas',
        coincidePrefijo: true,
      },
      // A clipboard rather than a person icon: instructors are an informational
      // record attached to blocked franjas, not users of the system.
      { href: '/instructores', etiqueta: 'Instructores', icono: ClipboardList, modulo: 'instructores' },
    ],
  },
  {
    titulo: 'Análisis',
    items: [{ href: '/metricas', etiqueta: 'Métricas', icono: BarChart3, modulo: 'metricas' }],
  },
  {
    titulo: 'Configuración',
    items: [
      { href: '/configuracion', etiqueta: 'Polideportivo', icono: Building2, modulo: 'configuracion' },
      { href: '/usuarios', etiqueta: 'Usuarios y permisos', icono: ShieldCheck, modulo: 'configuracion' },
      {
        href: '/soporte',
        etiqueta: 'Soporte',
        icono: LifeBuoy,
        modulo: 'soporte',
        coincidePrefijo: true,
      },
    ],
  },
]

/** Every nav item flattened, for breadcrumbs and the command palette. */
export const TODOS_LOS_ITEMS: ItemNav[] = NAVEGACION.flatMap((grupo) => grupo.items)

/** Breadcrumb label for a pathname, falling back to the segment itself. */
export function etiquetaDeRuta(pathname: string): string {
  const exacto = TODOS_LOS_ITEMS.find((item) => item.href === pathname)
  if (exacto) return exacto.etiqueta

  const porPrefijo = TODOS_LOS_ITEMS.filter(
    (item) => item.href !== '/' && pathname.startsWith(item.href)
  ).sort((a, b) => b.href.length - a.href.length)[0]

  return porPrefijo?.etiqueta ?? 'Panel'
}

export function esRutaActiva(item: ItemNav, pathname: string): boolean {
  if (item.href === '/') return pathname === '/'
  if (item.coincidePrefijo) return pathname === item.href || pathname.startsWith(`${item.href}/`)
  return pathname === item.href
}
