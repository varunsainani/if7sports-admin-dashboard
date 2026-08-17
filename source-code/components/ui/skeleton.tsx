import { cn } from '@/lib/utils'

/**
 * Loading skeletons. The shimmer is defined in globals.css as `.esqueleto` and
 * stops entirely under prefers-reduced-motion.
 *
 * Skeletons mirror the shape of the content they stand in for. A skeleton that
 * does not match its final layout causes a visible jump on load, which reads as
 * a bug rather than as loading.
 */

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('esqueleto', className)} aria-hidden {...props} />
}

/** One line of text. Width varies so a stack does not look like a barcode. */
function SkeletonTexto({ ancho = 'w-full', className }: { ancho?: string; className?: string }) {
  return <Skeleton className={cn('h-3.5', ancho, className)} />
}

/** Placeholder rows for a data table, matching the real column count. */
function SkeletonTabla({ filas = 8, columnas = 5 }: { filas?: number; columnas?: number }) {
  const anchos = ['w-3/4', 'w-1/2', 'w-2/3', 'w-1/3', 'w-5/6', 'w-2/5']

  return (
    <div role="status" aria-label="Cargando datos de la tabla">
      <div className="flex items-center gap-4 border-b border-borde bg-superficie-alt px-4 py-2.5">
        {Array.from({ length: columnas }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: filas }).map((_, fila) => (
        <div key={fila} className="flex items-center gap-4 border-b border-borde px-4 py-3.5">
          {Array.from({ length: columnas }).map((_, col) => (
            <div key={col} className="flex-1">
              <SkeletonTexto ancho={anchos[(fila + col) % anchos.length]} />
            </div>
          ))}
        </div>
      ))}
      <span className="sr-only">Cargando datos de la tabla</span>
    </div>
  )
}

/** Placeholder for a metric card: small label above a large figure. */
function SkeletonMetrica() {
  return (
    <div className="rounded-lg border border-borde bg-superficie p-5" role="status">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-8 w-32" />
      <Skeleton className="mt-3 h-3 w-20" />
      <span className="sr-only">Cargando métrica</span>
    </div>
  )
}

/** Placeholder for a chart panel. */
function SkeletonGrafico({ alto = 'h-64' }: { alto?: string }) {
  return (
    <div className="rounded-lg border border-borde bg-superficie p-5" role="status">
      <Skeleton className="h-4 w-40" />
      <Skeleton className={cn('mt-4 w-full', alto)} />
      <span className="sr-only">Cargando gráfico</span>
    </div>
  )
}

/** Placeholder for the bookings calendar grid. */
function SkeletonCalendario() {
  return (
    <div className="rounded-lg border border-borde bg-superficie p-4" role="status">
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={`c-${i}`} className="h-3" />
        ))}
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
      <span className="sr-only">Cargando calendario</span>
    </div>
  )
}

export {
  Skeleton,
  SkeletonTexto,
  SkeletonTabla,
  SkeletonMetrica,
  SkeletonGrafico,
  SkeletonCalendario,
}
