import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * Illustrated empty states.
 *
 * The illustrations are inline SVG drawn from the same court-marking language
 * as the rest of the interface: chalk outlines, dashed centre lines, hatched
 * closures. No external asset, no icon blown up to 96px.
 *
 * Copy rule: an empty screen is an invitation to act, not an apology. Each one
 * says what would appear here and offers the action that puts something there.
 */

/* ------------------------------------------------------------ illustrations */

const trazo = 'var(--cal-400)'
const trazoSuave = 'var(--cal-300)'
const acento = 'var(--cesped-300)'

/** An empty pitch, seen from above. Used wherever bookings would appear. */
function CanchaVacia() {
  return (
    <svg viewBox="0 0 160 104" fill="none" className="h-24 w-auto" aria-hidden>
      <rect
        x="6"
        y="6"
        width="148"
        height="92"
        rx="3"
        stroke={trazo}
        strokeWidth="1.5"
        fill="var(--cal-50)"
      />
      <line x1="80" y1="6" x2="80" y2="98" stroke={trazo} strokeWidth="1.5" strokeDasharray="4 4" />
      <circle cx="80" cy="52" r="16" stroke={trazo} strokeWidth="1.5" />
      <circle cx="80" cy="52" r="2.5" fill={acento} />
      <rect x="6" y="30" width="20" height="44" stroke={trazo} strokeWidth="1.5" />
      <rect x="134" y="30" width="20" height="44" stroke={trazo} strokeWidth="1.5" />
      <path d="M6 14 A8 8 0 0 0 14 6" stroke={trazoSuave} strokeWidth="1.5" />
      <path d="M154 14 A8 8 0 0 1 146 6" stroke={trazoSuave} strokeWidth="1.5" />
      <path d="M6 90 A8 8 0 0 1 14 98" stroke={trazoSuave} strokeWidth="1.5" />
      <path d="M154 90 A8 8 0 0 0 146 98" stroke={trazoSuave} strokeWidth="1.5" />
    </svg>
  )
}

/** An empty booking sheet: ruled rows with nothing written on them. */
function CuadranteVacio() {
  return (
    <svg viewBox="0 0 160 104" fill="none" className="h-24 w-auto" aria-hidden>
      <rect
        x="18"
        y="8"
        width="124"
        height="88"
        rx="3"
        stroke={trazo}
        strokeWidth="1.5"
        fill="var(--cal-50)"
      />
      <line x1="18" y1="26" x2="142" y2="26" stroke={trazo} strokeWidth="1.5" />
      <line x1="46" y1="8" x2="46" y2="96" stroke={trazoSuave} strokeWidth="1.5" />
      {[42, 58, 74, 90].map((y) => (
        <line key={y} x1="18" y1={y} x2="142" y2={y} stroke={trazoSuave} strokeWidth="1" />
      ))}
      {[34, 50, 66, 82].map((y, i) => (
        <line
          key={y}
          x1="28"
          y1={y}
          x2="36"
          y2={y}
          stroke={i === 0 ? acento : trazoSuave}
          strokeWidth="2"
          strokeLinecap="round"
        />
      ))}
    </svg>
  )
}

/** A taped-off area. Used where blocked franjas would appear. */
function FranjaVacia() {
  return (
    <svg viewBox="0 0 160 104" fill="none" className="h-24 w-auto" aria-hidden>
      <defs>
        <pattern id="hatch-vacio" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="8" stroke={trazoSuave} strokeWidth="3" />
        </pattern>
      </defs>
      <rect x="10" y="8" width="140" height="88" rx="3" stroke={trazo} strokeWidth="1.5" fill="var(--cal-50)" />
      <rect x="26" y="30" width="108" height="44" rx="2" fill="url(#hatch-vacio)" stroke={trazo} strokeWidth="1.5" />
      <line x1="10" y1="24" x2="150" y2="24" stroke={trazoSuave} strokeWidth="1" />
      <line x1="10" y1="80" x2="150" y2="80" stroke={trazoSuave} strokeWidth="1" />
    </svg>
  )
}

/** A search that found nothing. */
function BusquedaVacia() {
  return (
    <svg viewBox="0 0 160 104" fill="none" className="h-24 w-auto" aria-hidden>
      <rect x="18" y="8" width="124" height="88" rx="3" stroke={trazoSuave} strokeWidth="1.5" fill="var(--cal-50)" />
      {[28, 44, 60, 76].map((y) => (
        <line key={y} x1="32" y1={y} x2="128" y2={y} stroke={trazoSuave} strokeWidth="1" strokeDasharray="3 5" />
      ))}
      <circle cx="94" cy="58" r="22" fill="var(--superficie)" stroke={trazo} strokeWidth="2" />
      <line x1="110" y1="74" x2="124" y2="88" stroke={trazo} strokeWidth="3" strokeLinecap="round" />
      <line x1="86" y1="50" x2="102" y2="66" stroke={acento} strokeWidth="2" strokeLinecap="round" />
      <line x1="102" y1="50" x2="86" y2="66" stroke={acento} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

/** A roster with no names on it. Used for clients, instructors and users. */
function ListaVacia() {
  return (
    <svg viewBox="0 0 160 104" fill="none" className="h-24 w-auto" aria-hidden>
      <rect x="18" y="8" width="124" height="88" rx="3" stroke={trazo} strokeWidth="1.5" fill="var(--cal-50)" />
      {[
        { y: 26, acento: true },
        { y: 46, acento: false },
        { y: 66, acento: false },
      ].map(({ y, acento: esAcento }) => (
        <g key={y}>
          <circle
            cx="38"
            cy={y}
            r="8"
            stroke={esAcento ? acento : trazoSuave}
            strokeWidth="1.5"
            fill="var(--superficie)"
          />
          <line x1="54" y1={y - 3} x2="124" y2={y - 3} stroke={trazoSuave} strokeWidth="2" strokeLinecap="round" />
          <line x1="54" y1={y + 4} x2="98" y2={y + 4} stroke={trazoSuave} strokeWidth="2" strokeLinecap="round" />
        </g>
      ))}
      <line x1="30" y1="86" x2="130" y2="86" stroke={trazoSuave} strokeWidth="1" strokeDasharray="4 4" />
    </svg>
  )
}

const ILUSTRACIONES = {
  cancha: CanchaVacia,
  cuadrante: CuadranteVacio,
  franja: FranjaVacia,
  busqueda: BusquedaVacia,
  lista: ListaVacia,
} as const

export type Ilustracion = keyof typeof ILUSTRACIONES

/* ------------------------------------------------------------- empty state */

interface EmptyStateProps {
  ilustracion?: Ilustracion
  titulo: string
  /** One sentence saying what would appear here, and how to make it appear. */
  descripcion: string
  /** The primary action. Every empty table in the brief gets one. */
  accion?: React.ReactNode
  /** A secondary escape hatch, e.g. clearing an over-narrow filter. */
  accionSecundaria?: React.ReactNode
  className?: string
  compacto?: boolean
}

function EmptyState({
  ilustracion = 'lista',
  titulo,
  descripcion,
  accion,
  accionSecundaria,
  className,
  compacto = false,
}: EmptyStateProps) {
  const Ilustracion = ILUSTRACIONES[ilustracion]

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compacto ? 'px-6 py-10' : 'px-6 py-16',
        className
      )}
    >
      <Ilustracion />
      <h3 className="mt-5 font-display text-lg font-semibold text-tinta">{titulo}</h3>
      <p className="mt-1.5 max-w-sm text-base text-apagado">{descripcion}</p>
      {(accion || accionSecundaria) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          {accion}
          {accionSecundaria}
        </div>
      )}
    </div>
  )
}

export { EmptyState, CanchaVacia, CuadranteVacio, FranjaVacia, BusquedaVacia, ListaVacia }
