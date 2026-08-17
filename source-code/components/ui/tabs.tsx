'use client'

import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'

import { cn } from '@/lib/utils'

/**
 * Tabs. Used on the court detail screen (General, Horarios, Precios, Cierres)
 * and on Mi perfil.
 *
 * The active tab is marked by a solid rule underneath rather than a filled
 * pill. It reads as a chalk line on the court, and it keeps the primary colour
 * available for actual actions instead of spending it on navigation chrome.
 */

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'relative flex items-center gap-1 overflow-x-auto border-b border-borde',
      className
    )}
    {...props}
  />
))
TabsList.displayName = 'TabsList'

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'relative -mb-px whitespace-nowrap border-b-2 border-transparent px-3 py-2.5',
      'text-base font-medium text-apagado transition-colors duration-rapida ease-curva',
      'hover:text-tinta',
      'data-[state=active]:border-primario data-[state=active]:text-tinta',
      'disabled:pointer-events-none disabled:opacity-50',
      '[&_svg]:size-4 [&_svg]:shrink-0',
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = 'TabsTrigger'

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn('pt-5 focus-visible:outline-none', className)}
    {...props}
  />
))
TabsContent.displayName = 'TabsContent'

/** Count shown alongside a tab label, e.g. "Cierres puntuales 3". */
function TabsCount({ children }: { children: React.ReactNode }) {
  return (
    <span className="ml-1.5 rounded-full bg-cal-200 px-1.5 py-0.5 text-2xs font-medium text-tinta-media">
      {children}
    </span>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, TabsCount }
