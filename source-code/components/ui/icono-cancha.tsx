import * as React from 'react'

import { cn } from '@/lib/utils'
import type { TipoCancha } from '@/lib/types'

/**
 * Court-type icons, drawn as court plans rather than borrowed glyphs.
 *
 * The icon set carries the whole type signal, since court type is deliberately
 * never given a colour. Generic icons failed at that job: the nearest available
 * marks for pádel, tenis and básquet were all circles, so at 16px the column
 * read as eight identical grey dots and the type became decoration. Fútbol 11
 * was worse, a flag on a slope that read as golf.
 *
 * Each court seen from above has its own outline: a wide pitch, a portrait
 * tennis court, a short enclosed pádel box, a half court with its arc. Shapes
 * that differ at the silhouette survive 16px; interior detail does not.
 */

interface IconoProps {
  className?: string
}

const comun = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinejoin: 'round' as const,
}

/** Wide pitch, centre line, a goal mouth at each end. */
function Futbol7({ className }: IconoProps) {
  return (
    <svg viewBox="0 0 20 20" className={cn('size-4', className)} aria-hidden {...comun}>
      <rect x="1.5" y="5" width="17" height="10" rx="1" />
      <line x1="10" y1="5" x2="10" y2="15" />
      <path d="M1.5 8h2v4h-2" />
      <path d="M18.5 8h-2v4h2" />
    </svg>
  )
}

/** Full pitch: centre circle and deeper boxes distinguish it from fútbol 7. */
function Futbol11({ className }: IconoProps) {
  return (
    <svg viewBox="0 0 20 20" className={cn('size-4', className)} aria-hidden {...comun}>
      <rect x="1" y="3.5" width="18" height="13" rx="1" />
      <line x1="10" y1="3.5" x2="10" y2="16.5" />
      <circle cx="10" cy="10" r="2.6" />
      <path d="M1 6.5h3.5v7H1" />
      <path d="M19 6.5h-3.5v7H19" />
    </svg>
  )
}

/** Portrait court with the net across the waist and service boxes. */
function Tenis({ className }: IconoProps) {
  return (
    <svg viewBox="0 0 20 20" className={cn('size-4', className)} aria-hidden {...comun}>
      <rect x="4.5" y="1.5" width="11" height="17" rx="0.5" />
      <line x1="2.5" y1="10" x2="17.5" y2="10" strokeDasharray="1.5 1.2" />
      <line x1="4.5" y1="6" x2="15.5" y2="6" />
      <line x1="4.5" y1="14" x2="15.5" y2="14" />
      <line x1="10" y1="6" x2="10" y2="14" />
    </svg>
  )
}

/** Short enclosed box: pádel's glass back walls make it squarer than tennis. */
function Padel({ className }: IconoProps) {
  return (
    <svg viewBox="0 0 20 20" className={cn('size-4', className)} aria-hidden {...comun}>
      <rect x="3" y="3" width="14" height="14" rx="0.5" />
      <line x1="1.5" y1="10" x2="18.5" y2="10" strokeDasharray="1.5 1.2" />
      <line x1="3" y1="6.5" x2="17" y2="6.5" />
      <line x1="3" y1="13.5" x2="17" y2="13.5" />
    </svg>
  )
}

/** Half court: the arc over the key is unmistakable even at 16px. */
function Basquet({ className }: IconoProps) {
  return (
    <svg viewBox="0 0 20 20" className={cn('size-4', className)} aria-hidden {...comun}>
      <rect x="2" y="4" width="16" height="12" rx="1" />
      <path d="M2 7.5h4v5H2" />
      <path d="M6 7.5a3.2 3.2 0 0 1 0 5" />
      <line x1="15" y1="4" x2="15" y2="16" strokeDasharray="1.5 1.2" />
    </svg>
  )
}

/** Anything else: an unmarked surface. */
function Otro({ className }: IconoProps) {
  return (
    <svg viewBox="0 0 20 20" className={cn('size-4', className)} aria-hidden {...comun}>
      <rect x="2" y="5" width="16" height="10" rx="1" strokeDasharray="2.5 1.8" />
    </svg>
  )
}

const ICONOS: Record<TipoCancha, React.ComponentType<IconoProps>> = {
  futbol_7: Futbol7,
  futbol_11: Futbol11,
  tenis: Tenis,
  padel: Padel,
  basquet: Basquet,
  otro: Otro,
}

export function IconoCancha({ tipo, className }: { tipo: TipoCancha; className?: string }) {
  const Icono = ICONOS[tipo]
  return <Icono className={className} />
}
