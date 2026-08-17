'use client'

import * as React from 'react'

import type { EstadoVista, Modulo, Usuario } from './types'
import { usuarios } from './mock-data'

/**
 * Demo controls.
 *
 * The brief asks for every screen in default, loading and empty states, and for
 * a sidebar that hides modules a colaborador has no permission for. Neither is
 * visible in a static deliverable unless the reviewer can switch between them:
 * there is no backend to be slow, no database to empty, and no login to change
 * roles with.
 *
 * So both are exposed as a control in the corner of the screen. This is scoped
 * to the demo and would be deleted the day a real API and real auth land.
 */

interface DemoContextValue {
  usuario: Usuario
  setUsuarioId: (id: string) => void
  estadoVista: EstadoVista
  setEstadoVista: (estado: EstadoVista) => void
  /** True when the signed-in user may see this module. */
  puedeVer: (modulo: Modulo) => boolean
}

const DemoContext = React.createContext<DemoContextValue | null>(null)

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [usuarioId, setUsuarioId] = React.useState(usuarios[0].id)
  const [estadoVista, setEstadoVista] = React.useState<EstadoVista>('default')

  const usuario = React.useMemo(
    () => usuarios.find((u) => u.id === usuarioId) ?? usuarios[0],
    [usuarioId]
  )

  const valor = React.useMemo<DemoContextValue>(
    () => ({
      usuario,
      setUsuarioId,
      estadoVista,
      setEstadoVista,
      puedeVer: (modulo) =>
        usuario.rol === 'admin_principal' || usuario.permisos[modulo] === true,
    }),
    [usuario, estadoVista]
  )

  return <DemoContext.Provider value={valor}>{children}</DemoContext.Provider>
}

export function useDemo(): DemoContextValue {
  const contexto = React.useContext(DemoContext)
  if (!contexto) {
    throw new Error('useDemo debe usarse dentro de DemoProvider')
  }
  return contexto
}

/**
 * Convenience for screens: returns the current view state so a screen can
 * render its loading skeleton or its empty state without wiring the context up
 * itself every time.
 */
export function useEstadoVista(): EstadoVista {
  return useDemo().estadoVista
}
