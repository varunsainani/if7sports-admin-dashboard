'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * Buttons name the action they perform. "Guardar cambios", never "Enviar", and
 * the verb stays the same through the flow, so a button that says "Publicar"
 * produces a toast that says "Publicado".
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded font-medium ' +
    'transition-colors duration-rapida ease-curva ' +
    'disabled:pointer-events-none disabled:opacity-50 ' +
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primario:
          'bg-primario text-primario-fg hover:bg-primario-hover shadow-sm',
        secundario:
          'bg-superficie text-tinta border border-borde-control hover:bg-cal-100 hover:border-cal-500',
        fantasma: 'text-tinta-media hover:bg-cal-200 hover:text-tinta',
        peligro: 'bg-error text-white hover:brightness-90 shadow-sm',
        'peligro-suave':
          'bg-cancelada-bg text-cancelada-texto border border-cancelada-borde hover:bg-[#f5dedc]',
        enlace: 'text-primario underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        sm: 'h-8 px-3 text-xs [&_svg]:size-3.5',
        md: 'h-9 px-4 text-base [&_svg]:size-4',
        lg: 'h-10 px-5 text-md [&_svg]:size-4',
        icono: 'h-9 w-9 [&_svg]:size-4',
        'icono-sm': 'h-8 w-8 [&_svg]:size-3.5',
      },
    },
    defaultVariants: {
      variant: 'primario',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /** Shows a spinner and blocks interaction without changing the button width. */
  cargando?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, cargando = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'

    // asChild forwards to a single child element, so a spinner cannot be injected.
    if (asChild) {
      return (
        <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props}>
          {children}
        </Comp>
      )
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        disabled={disabled || cargando}
        aria-busy={cargando || undefined}
        {...props}
      >
        {cargando && <Loader2 className="animate-spin" aria-hidden />}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
