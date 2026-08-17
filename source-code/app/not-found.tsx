import Link from 'next/link'
import { CalendarDays, Home } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ErrorPage } from '@/components/ui/error-page'

export const metadata = { title: 'Página no encontrada' }

/** 404. Rendered outside the panel shell, so it carries its own way back. */
export default function NoEncontrado() {
  return (
    <main className="min-h-screen bg-fondo">
      <ErrorPage
        codigo="404"
        variante="perdido"
        titulo="No encontramos esta página"
        descripcion="El enlace puede estar mal escrito o apuntar a algo que ya se ha eliminado. Desde el panel llegarás a cualquier sección."
        acciones={
          <>
            <Button asChild>
              <Link href="/">
                <Home aria-hidden />
                Ir al panel
              </Link>
            </Button>
            <Button variant="secundario" asChild>
              <Link href="/reservas">
                <CalendarDays aria-hidden />
                Ver el calendario
              </Link>
            </Button>
          </>
        }
      />
    </main>
  )
}
