'use client'

import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { Eye, EyeOff } from 'lucide-react'

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

/* -------------------------------------------------------- InputContrasena
   A password field with a reveal toggle.

   One component rather than an `iconoDerecha` passed in at each call site, so
   the seven password fields in the product cannot drift apart: the login form,
   the first-access flow that asks for three at once, and the change-password
   tab in Mi perfil.

   Three details that are easy to miss and obvious once wrong:

   - The button prevents its own mousedown. Without that the browser moves
     focus to the button, the field loses its caret, and someone revealing a
     password mid-typing has to click back into the field to continue.
   - Swapping `type` sends the caret to the end of the value in Chrome and
     Safari, so the selection is captured before the swap and restored after
     it. `setSelectionRange` does not pull focus, which keeps the keyboard path
     intact: tab to the button, press Enter, focus stays on the button.
   - The state change is announced. An icon flipping from eye to crossed-out
     eye says nothing to a screen reader, so a live region reports whether the
     password is showing.

   Edge draws its own native reveal control on password fields, which would sit
   next to this one; globals.css suppresses it. */

export type InputContrasenaProps = Omit<InputProps, 'type' | 'iconoDerecha'>

const InputContrasena = React.forwardRef<HTMLInputElement, InputContrasenaProps>(
  ({ className, id, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false)
    const interno = React.useRef<HTMLInputElement>(null)

    React.useImperativeHandle(ref, () => interno.current as HTMLInputElement)

    function alternar() {
      const campo = interno.current
      const inicio = campo?.selectionStart ?? null
      const fin = campo?.selectionEnd ?? null

      setVisible((anterior) => !anterior)

      if (campo && inicio !== null) {
        requestAnimationFrame(() => {
          try {
            campo.setSelectionRange(inicio, fin ?? inicio)
          } catch {
            /* Some browsers refuse setSelectionRange on a field they consider
               unselectable. Losing the caret is not worth throwing over. */
          }
        })
      }
    }

    return (
      <div className="relative">
        <input
          {...props}
          id={id}
          ref={interno}
          type={visible ? 'text' : 'password'}
          /* A revealed password is plain text as far as the browser is
             concerned, and would otherwise be underlined as a misspelling and
             sentence-capitalised on touch keyboards. */
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          className={cn(baseCampo, 'h-9 pr-10', className)}
        />

        <button
          type="button"
          onClick={alternar}
          onMouseDown={(evento) => evento.preventDefault()}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-controls={id}
          className={cn(
            'absolute right-1 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center',
            'rounded text-cal-500 transition-colors duration-rapida ease-curva',
            'hover:bg-cal-100 hover:text-tinta',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cesped-200'
          )}
        >
          {visible ? (
            <EyeOff className="size-4" aria-hidden />
          ) : (
            <Eye className="size-4" aria-hidden />
          )}
        </button>

        <span role="status" className="sr-only">
          {visible ? 'La contraseña está visible' : 'La contraseña está oculta'}
        </span>
      </div>
    )
  }
)
InputContrasena.displayName = 'InputContrasena'

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

export { Input, InputContrasena, Textarea, Label, Campo, baseCampo }
