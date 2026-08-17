'use client'

import * as React from 'react'
import Link from 'next/link'
import { Home, LifeBuoy, RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ErrorPage } from '@/components/ui/error-page'

/**
 * 500. Next renders this when a screen throws.
 *
 * It offers the retry first, because a transient failure is the most likely
 * cause and retrying is the cheapest thing to try. The digest is shown small:
 * meaningless to the reader, but the first thing support will ask for.
 */
export default function ErrorInesperado({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    // In production this is where the error would reach the monitoring service.
    console.error(error)
  }, [error])

  return (
    <main className="grid min-h-screen place-items-center bg-fondo">
      <ErrorPage
        codigo="500"
        variante="roto"
        titulo="Algo ha fallado al cargar esta pantalla"
        descripcion="No es culpa tuya y no se ha perdido ninguna reserva. Vuelve a intentarlo, y si sigue ocurriendo avísanos con la referencia de abajo."
        detalle={error.digest ? `Referencia: ${error.digest}` : undefined}
        acciones={
          <>
            <Button onClick={reset}>
              <RotateCcw aria-hidden />
              Reintentar
            </Button>
            <Button variant="secundario" asChild>
              <Link href="/">
                <Home aria-hidden />
                Ir al panel
              </Link>
            </Button>
            <Button variant="fantasma" asChild>
              <Link href="/soporte">
                <LifeBuoy aria-hidden />
                Avisar a soporte
              </Link>
            </Button>
          </>
        }
      />
    </main>
  )
}
