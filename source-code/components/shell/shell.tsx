'use client'

import * as React from 'react'
import { usePathname, useRouter } from 'next/navigation'

import { cn } from '@/lib/utils'
import { useDemo } from '@/lib/demo-context'
import { TODOS_LOS_ITEMS, esRutaActiva, primeraRutaPermitida } from '@/lib/navegacion'
import { Footer } from './footer'
import { Header } from './header'
import { Sidebar } from './sidebar'
import SinPermiso from '@/app/(panel)/403/page'

/**
 * Permission gate.
 *
 * Filtering the sidebar hides a module but does not protect it: a bookmark, the
 * browser's back button, or a dashboard shortcut still loaded the screen in
 * full. That made the demo's own claim false and left the 403 page unreachable.
 */
function Guardia({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { puedeVer } = useDemo()

  const item = TODOS_LOS_ITEMS.find((candidato) => esRutaActiva(candidato, pathname))
  const denegado = Boolean(item && !puedeVer(item.modulo))

  // The root route is the landing screen, so a user who cannot open it gets
  // moved to their first available module rather than a 403 they cannot leave.
  const destino = primeraRutaPermitida(puedeVer)

  React.useEffect(() => {
    if (denegado && pathname === '/') router.replace(destino)
  }, [denegado, pathname, destino, router])

  if (denegado) return pathname === '/' ? null : <SinPermiso />

  // Routes with no module of their own (Mi perfil, the 403 itself) are always
  // reachable: they belong to the person, not to a delegated module.
  return <>{children}</>
}

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
      {/* First focusable element on the page. Without it a keyboard user tabs
          through the whole sidebar and header before reaching the content. */}
      <a
        href="#contenido"
        className={cn(
          'sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50',
          'focus:rounded focus:bg-primario focus:px-4 focus:py-2 focus:text-sm focus:text-white'
        )}
      >
        Saltar al contenido
      </a>

      <Sidebar plegado={plegado} onAlternar={() => setPlegado((valor) => !valor)} />

      <div
        className={cn(
          'flex min-h-screen flex-col transition-[padding] duration-base ease-curva',
          plegado ? 'pl-sidebar-plegado' : 'pl-sidebar'
        )}
      >
        <Header />

        <main id="contenido" tabIndex={-1} className="flex-1 px-6 py-6">
          <div className="mx-auto w-full max-w-contenido">
            <Guardia>{children}</Guardia>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  )
}
