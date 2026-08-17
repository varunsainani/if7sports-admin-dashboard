'use client'

import * as React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * Select. Used for every dropdown in the brief: court type, block reason,
 * instructor, ticket type, filters.
 *
 * Radix gives typeahead, arrow-key navigation and correct listbox semantics.
 * Filter selects always carry an explicit "all" option, because a filter that
 * cannot be cleared is a trap.
 */

const Select = SelectPrimitive.Root
const SelectGroup = SelectPrimitive.Group
const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & { size?: 'sm' | 'md' }
>(({ className, children, size = 'md', ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'flex w-full items-center justify-between gap-2 rounded border bg-superficie px-3',
      'text-base text-tinta transition-colors duration-rapida ease-curva',
      'border-borde-control hover:border-cal-600',
      'focus:border-primario focus:outline-none focus:ring-2 focus:ring-cesped-200',
      'disabled:cursor-not-allowed disabled:bg-cal-100 disabled:text-apagado',
      'data-[placeholder]:text-cal-500',
      '[&>span]:truncate',
      size === 'sm' ? 'h-8 text-xs' : 'h-9',
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="size-4 shrink-0 text-cal-500" aria-hidden />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = 'SelectTrigger'

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      position={position}
      className={cn(
        'relative z-50 max-h-72 min-w-[8rem] overflow-hidden rounded-lg border border-borde',
        'bg-superficie shadow-lg',
        'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
        position === 'popper' && 'data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1',
        className
      )}
      {...props}
    >
      <SelectPrimitive.Viewport
        className={cn(
          'p-1',
          position === 'popper' && 'w-full min-w-[var(--radix-select-trigger-width)]'
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = 'SelectContent'

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label ref={ref} className={cn('etiqueta px-2 py-1.5', className)} {...props} />
))
SelectLabel.displayName = 'SelectLabel'

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-pointer select-none items-center gap-2 rounded py-1.5 pl-2 pr-8',
      'text-base text-tinta outline-none',
      'focus:bg-cesped-50 focus:text-cesped-700',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      '[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-apagado',
      className
    )}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    <span className="absolute right-2 flex size-4 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="size-4 text-primario" aria-hidden />
      </SelectPrimitive.ItemIndicator>
    </span>
  </SelectPrimitive.Item>
))
SelectItem.displayName = 'SelectItem'

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator ref={ref} className={cn('my-1 h-px bg-borde', className)} {...props} />
))
SelectSeparator.displayName = 'SelectSeparator'

/* ------------------------------------------------------------ filter select
   Convenience wrapper for the table toolbars. Always includes the option that
   clears the filter, labelled with what it shows rather than "Todos". */

interface FiltroSelectProps {
  valor: string
  onValorChange: (valor: string) => void
  opciones: { valor: string; etiqueta: string }[]
  /** Shown as the cleared state, e.g. "Todas las canchas". */
  etiquetaTodos: string
  ariaLabel: string
  className?: string
}

function FiltroSelect({
  valor,
  onValorChange,
  opciones,
  etiquetaTodos,
  ariaLabel,
  className,
}: FiltroSelectProps) {
  return (
    <Select value={valor} onValueChange={onValorChange}>
      <SelectTrigger size="sm" aria-label={ariaLabel} className={cn('w-auto min-w-40', className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="todos">{etiquetaTodos}</SelectItem>
        <SelectSeparator />
        {opciones.map((opcion) => (
          <SelectItem key={opcion.valor} value={opcion.valor}>
            {opcion.etiqueta}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  FiltroSelect,
}
