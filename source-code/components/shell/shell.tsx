'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'
import { Footer } from './footer'
import { Header } from './header'
import { Sidebar } from './sidebar'

/**
 * Owns the sidebar's collapsed state so the content column's left offset stays
 * in step with the sidebar's actual width. Keeping the two in separate
 * components with separate state is how a layout ends up with a gap or an
 * overlap the moment someone collapses the menu.
 *
 * The brief calls for the sidebar to be fixed on desktop and collapsible on
 * tablet, so it starts collapsed below 1024px and expanded above it.
 */
export function Shell({ children }: { children: React.ReactNode }) {
  const [plegado, setPlegado] = React.useState(false)

  React.useEffect(() => {
    const consulta = window.matchMedia('(max-width: 1023px)')

    // Set once on mount, then follow the viewport. Reading this during render
    // would differ between server and client and break hydration.
    setPlegado(consulta.matches)

    const alCambiar = (evento: MediaQueryListEvent) => setPlegado(evento.matches)
    consulta.addEventListener('change', alCambiar)
    return () => consulta.removeEventListener('change', alCambiar)
  }, [])

  return (
    <div className="min-h-screen">
      <Sidebar plegado={plegado} onAlternar={() => setPlegado((valor) => !valor)} />

      <div
        className={cn(
          'flex min-h-screen flex-col transition-[padding] duration-base ease-curva',
          plegado ? 'pl-sidebar-plegado' : 'pl-sidebar'
        )}
      >
        <Header />

        <main className="flex-1 px-6 py-6">
          <div className="mx-auto w-full max-w-contenido">{children}</div>
        </main>

        <Footer />
      </div>
    </div>
  )
}
