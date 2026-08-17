'use client'

import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'

import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------- Label */

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & { requerido?: boolean }
>(({ className, children, requerido, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn('block text-xs font-medium text-tinta-media mb-1.5', className)}
    {...props}
  >
    {children}
    {requerido && (
      <span className="text-error ml-0.5" aria-hidden>
        *
      </span>
    )}
  </LabelPrimitive.Root>
))
Label.displayName = 'Label'

/* ------------------------------------------------------------------- Input */

const baseCampo =
  'w-full rounded border bg-superficie px-3 text-base text-tinta ' +
  'placeholder:text-cal-500 transition-colors duration-rapida ease-curva ' +
  'border-borde-control hover:border-cal-600 ' +
  'focus:border-primario focus:outline-none focus:ring-2 focus:ring-cesped-200 ' +
  'disabled:bg-cal-100 disabled:text-apagado disabled:cursor-not-allowed ' +
  'aria-[invalid=true]:border-error aria-[invalid=true]:ring-cancelada-borde'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Rendered inside the field on the left, e.g. a search or currency glyph. */
  iconoIzquierda?: React.ReactNode
  iconoDerecha?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', iconoIzquierda, iconoDerecha, ...props }, ref) => {
    if (!iconoIzquierda && !iconoDerecha) {
      return (
        <input type={type} ref={ref} className={cn(baseCampo, 'h-9', className)} {...props} />
      )
    }

    return (
      <div className="relative">
        {iconoIzquierda && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cal-500 [&_svg]:size-4">
            {iconoIzquierda}
          </span>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            baseCampo,
            'h-9',
            iconoIzquierda && 'pl-9',
            iconoDerecha && 'pr-9',
            className
          )}
          {...props}
        />
        {iconoDerecha && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-cal-500 [&_svg]:size-4">
            {iconoDerecha}
          </span>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

/* ---------------------------------------------------------------- Textarea */

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, rows = 4, ...props }, ref) => (
  <textarea ref={ref} rows={rows} className={cn(baseCampo, 'py-2 resize-y', className)} {...props} />
))
Textarea.displayName = 'Textarea'

/* ------------------------------------------------------------- Campo group
   Pairs a label, control, hint and error so spacing and the aria wiring are
   identical on every form in the product. */

interface CampoProps {
  etiqueta: string
  htmlFor?: string
  requerido?: boolean
  /** Explains the field before it is filled in. Never doubles as an error. */
  ayuda?: string
  /** Says what went wrong and how to fix it, in the interface's voice. */
  error?: string
  children: React.ReactNode
  className?: string
}

function Campo({ etiqueta, htmlFor, requerido, ayuda, error, children, className }: CampoProps) {
  return (
    <div className={cn('w-full', className)}>
      <Label htmlFor={htmlFor} requerido={requerido}>
        {etiqueta}
      </Label>
      {children}
      {ayuda && !error && <p className="mt-1.5 text-xs text-apagado">{ayuda}</p>}
      {error && (
        <p className="mt-1.5 text-xs text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export { Input, Textarea, Label, Campo, baseCampo }
