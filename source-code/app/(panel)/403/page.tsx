'use client'

import Link from 'next/link'
import { Home, LifeBuoy } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ErrorPage } from '@/components/ui/error-page'

/**
 * 403. Reached when someone opens a module their permissions do not cover, for
 * example by following a bookmark after an admin narrowed their access.
 *
 * It names who can restore the access rather than telling the person to try
 * again, because retrying will not help and they need to know who to ask.
 */
export default function SinPermiso() {
  return (
    <ErrorPage
      codigo="403"
      variante="cerrado"
      titulo="No tienes acceso a este módulo"
      descripcion="Tu usuario no tiene permiso sobre esta sección. El admin principal del polideportivo puede concedértelo desde Usuarios y permisos."
      acciones={
        <>
          <Button asChild>
            <Link href="/">
              <Home aria-hidden />
              Volver al panel
            </Link>
          </Button>
          <Button variant="secundario" asChild>
            <Link href="/soporte">
              <LifeBuoy aria-hidden />
              Escribir a soporte
            </Link>
          </Button>
        </>
      }
    />
  )
}
