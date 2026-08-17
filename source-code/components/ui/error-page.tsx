import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * Shared layout for 404, 403 and 500.
 *
 * Errors explain what happened and what to do next, in the interface's voice.
 * They do not apologise and they are never vague: "no encontramos esta página"
 * tells someone more than "algo ha salido mal", and every one of these offers a
 * way out rather than leaving the person at a dead end.
 *
 * The illustration is the same court-marking language as the empty states, so
 * an error still looks like part of the product.
 */

/** A court with something wrong with it, varied per error type. */
function Ilustracion({ variante }: { variante: 'perdido' | 'cerrado' | 'roto' }) {
  const trazo = 'var(--cal-400)'
  const suave = 'var(--cal-300)'

  return (
    <svg viewBox="0 0 200 130" fill="none" className="h-32 w-auto" aria-hidden>
      <rect
        x="8"
        y="8"
        width="184"
        height="114"
        rx="3"
        stroke={trazo}
        strokeWidth="1.5"
        fill="var(--cal-50)"
      />
      <line x1="100" y1="8" x2="100" y2="122" stroke={trazo} strokeWidth="1.5" strokeDasharray="4 4" />
      <circle cx="100" cy="65" r="20" stroke={trazo} strokeWidth="1.5" />
      <rect x="8" y="40" width="22" height="50" stroke={trazo} strokeWidth="1.5" />
      <rect x="170" y="40" width="22" height="50" stroke={trazo} strokeWidth="1.5" />

      {variante === 'perdido' && (
        <>
          {/* the ball has gone out of play */}
          <circle cx="176" cy="18" r="6" fill="var(--cesped-300)" />
          <path
            d="M100 65 Q140 30 172 20"
            stroke={suave}
            strokeWidth="1.5"
            strokeDasharray="3 4"
            fill="none"
          />
        </>
      )}

      {variante === 'cerrado' && (
        <>
          {/* the whole pitch is taped off */}
          <defs>
            <pattern
              id="hatch-error"
              width="10"
              height="10"
              patternTransform="rotate(45)"
              patternUnits="userSpaceOnUse"
            >
              <line x1="0" y1="0" x2="0" y2="10" stroke={suave} strokeWidth="4" />
            </pattern>
          </defs>
          <rect x="8" y="8" width="184" height="114" rx="3" fill="url(#hatch-error)" opacity="0.9" />
          <rect
            x="52"
            y="52"
            width="96"
            height="26"
            rx="2"
            fill="var(--superficie)"
            stroke={trazo}
            strokeWidth="1.5"
          />
          <line x1="66" y1="65" x2="134" y2="65" stroke={suave} strokeWidth="3" strokeLinecap="round" />
        </>
      )}

      {variante === 'roto' && (
        <>
          {/* the floodlights are out */}
          <path
            d="M40 20 L60 45 M160 20 L140 45"
            stroke={suave}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="40" cy="18" r="5" fill="var(--cal-300)" />
          <circle cx="160" cy="18" r="5" fill="var(--cal-300)" />
          <path
            d="M88 55 L112 79 M112 55 L88 79"
            stroke="var(--cancelada-borde)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  )
}

interface ErrorPageProps {
  codigo: string
  titulo: string
  /** What happened and what to do about it. Never vague, never an apology. */
  descripcion: string
  variante: 'perdido' | 'cerrado' | 'roto'
  acciones: React.ReactNode
  /** Technical detail, shown small. Useful when reporting the problem. */
  detalle?: string
  className?: string
}

export function ErrorPage({
  codigo,
  titulo,
  descripcion,
  variante,
  acciones,
  detalle,
  className,
}: ErrorPageProps) {
  return (
    <div
      className={cn(
        'flex min-h-[60vh] flex-col items-center justify-center px-6 py-16 text-center',
        className
      )}
    >
      <Ilustracion variante={variante} />

      <p className="mt-6 font-mono text-2xs tracking-etiqueta text-apagado">ERROR {codigo}</p>

      <h1 className="mt-2 font-display text-2xl font-semibold tracking-display text-tinta">
        {titulo}
      </h1>

      <p className="mt-2 max-w-md text-base text-apagado">{descripcion}</p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">{acciones}</div>

      {detalle && (
        <p className="mt-8 max-w-md font-mono text-2xs text-cal-500">{detalle}</p>
      )}
    </div>
  )
}
