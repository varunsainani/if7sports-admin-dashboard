'use client'

import { CheckCircle2, Info, TriangleAlert, XCircle } from 'lucide-react'
import { Toaster as Sonner, toast as sonnerToast } from 'sonner'

/**
 * Toasts confirm that something happened, in the past tense of the verb the
 * control used. "Guardar cambios" produces "Cambios guardados". "Publicar"
 * produces "Publicado". Keeping the verb consistent through the flow is how
 * someone learns their way around the product.
 *
 * A toast never carries information the person needs in order to act. It
 * disappears, so anything essential belongs on the page.
 */

function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      gap={10}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'flex w-full items-start gap-3 rounded-lg border border-borde bg-superficie p-3.5 shadow-lg',
          title: 'text-base font-medium text-tinta',
          description: 'text-xs text-apagado mt-0.5',
          actionButton:
            'ml-auto shrink-0 rounded bg-primario px-2.5 py-1 text-xs font-medium text-white hover:bg-primario-hover',
          cancelButton:
            'shrink-0 rounded border border-borde-control px-2.5 py-1 text-xs font-medium text-tinta-media hover:bg-cal-100',
          closeButton: 'text-apagado hover:text-tinta',
        },
      }}
      icons={{
        success: <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-exito" aria-hidden />,
        error: <XCircle className="mt-0.5 size-4 shrink-0 text-error" aria-hidden />,
        warning: <TriangleAlert className="mt-0.5 size-4 shrink-0 text-aviso" aria-hidden />,
        info: <Info className="mt-0.5 size-4 shrink-0 text-info" aria-hidden />,
      }}
    />
  )
}

interface OpcionesToast {
  descripcion?: string
  accion?: { etiqueta: string; onClick: () => void }
}

function construir({ descripcion, accion }: OpcionesToast = {}) {
  return {
    description: descripcion,
    action: accion ? { label: accion.etiqueta, onClick: accion.onClick } : undefined,
  }
}

/**
 * Spanish-named wrappers so screen code never touches the sonner API directly
 * and every call site reads the same way.
 */
export const toast = {
  /** Something completed. Title is the past participle of the action's verb. */
  exito: (titulo: string, opciones?: OpcionesToast) =>
    sonnerToast.success(titulo, construir(opciones)),

  /** Something failed. Say what went wrong and what to do about it. */
  error: (titulo: string, opciones?: OpcionesToast) =>
    sonnerToast.error(titulo, construir(opciones)),

  /** Something needs attention but nothing broke. */
  aviso: (titulo: string, opciones?: OpcionesToast) =>
    sonnerToast.warning(titulo, construir(opciones)),

  info: (titulo: string, opciones?: OpcionesToast) =>
    sonnerToast.info(titulo, construir(opciones)),

  /**
   * Destructive actions get an undo rather than a confirmation dialog wherever
   * the change is reversible. Fewer interruptions, same safety.
   */
  deshacer: (titulo: string, onDeshacer: () => void, descripcion?: string) =>
    sonnerToast.success(titulo, {
      description: descripcion,
      action: { label: 'Deshacer', onClick: onDeshacer },
    }),
}

export { Toaster }
