'use client'

import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import * as SeparatorPrimitive from '@radix-ui/react-separator'
import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { Check, Minus } from 'lucide-react'

import { cn } from '@/lib/utils'
import { iniciales } from '@/lib/formato'

/* ---------------------------------------------------------------- Checkbox
   Carries an indeterminate state, which the permission matrix needs: a module
   row is indeterminate when some but not all of its actions are granted. */

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'peer size-4 shrink-0 rounded-sm border border-borde-control bg-superficie',
      'transition-colors duration-rapida ease-curva',
      'hover:border-cal-600',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cesped-200',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'data-[state=checked]:border-primario data-[state=checked]:bg-primario',
      'data-[state=indeterminate]:border-primario data-[state=indeterminate]:bg-primario',
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center text-white">
      {props.checked === 'indeterminate' ? (
        <Minus className="size-3" strokeWidth={3} aria-hidden />
      ) : (
        <Check className="size-3" strokeWidth={3} aria-hidden />
      )}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = 'Checkbox'

/** Checkbox with its label, wired so clicking the text toggles the box. */
function CheckboxCampo({
  id,
  etiqueta,
  descripcion,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Checkbox> & {
  id: string
  etiqueta: string
  descripcion?: string
}) {
  return (
    <div className={cn('flex items-start gap-2.5', className)}>
      <Checkbox id={id} className="mt-0.5" {...props} />
      <div className="min-w-0">
        <label htmlFor={id} className="cursor-pointer text-base text-tinta">
          {etiqueta}
        </label>
        {descripcion && <p className="text-xs text-apagado">{descripcion}</p>}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ Switch */

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full',
      'border-2 border-transparent transition-colors duration-base ease-curva',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cesped-200 focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'data-[state=checked]:bg-primario data-[state=unchecked]:bg-cal-400',
      className
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        'pointer-events-none block size-4 rounded-full bg-white shadow-sm',
        'transition-transform duration-base ease-curva',
        'data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0'
      )}
    />
  </SwitchPrimitive.Root>
))
Switch.displayName = 'Switch'

/* -------------------------------------------------------------- RadioGroup */

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root ref={ref} className={cn('grid gap-2', className)} {...props} />
))
RadioGroup.displayName = 'RadioGroup'

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={cn(
      'aspect-square size-4 rounded-full border border-borde-control text-primario',
      'transition-colors duration-rapida',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cesped-200',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'data-[state=checked]:border-primario',
      className
    )}
    {...props}
  >
    <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
      <span className="size-2 rounded-full bg-primario" />
    </RadioGroupPrimitive.Indicator>
  </RadioGroupPrimitive.Item>
))
RadioGroupItem.displayName = 'RadioGroupItem'

/* --------------------------------------------------------------- Separator */

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={cn(
      'shrink-0 bg-borde',
      orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
      className
    )}
    {...props}
  />
))
Separator.displayName = 'Separator'

/* ------------------------------------------------------------------ Avatar
   Falls back to initials rather than a generic silhouette, so a row without a
   photo still identifies the person. */

interface AvatarProps {
  nombre: string
  src?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const tamanosAvatar = {
  sm: 'size-6 text-2xs',
  md: 'size-8 text-xs',
  lg: 'size-10 text-base',
  xl: 'size-16 text-lg',
} as const

function Avatar({ nombre, src, size = 'md', className }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      className={cn(
        'relative flex shrink-0 overflow-hidden rounded-full border border-borde',
        tamanosAvatar[size],
        className
      )}
    >
      {src && (
        <AvatarPrimitive.Image
          src={src}
          alt=""
          className="aspect-square size-full object-cover"
        />
      )}
      <AvatarPrimitive.Fallback
        delayMs={src ? 300 : 0}
        className="flex size-full items-center justify-center bg-cesped-50 font-display font-semibold text-cesped-700"
      >
        {iniciales(nombre)}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
}

export {
  Checkbox,
  CheckboxCampo,
  Switch,
  RadioGroup,
  RadioGroupItem,
  Separator,
  Avatar,
}
