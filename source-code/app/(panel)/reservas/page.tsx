'use client'

import * as React from 'react'
import { useSearchParams } from 'next/navigation'
import { CalendarPlus, ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { Reserva } from '@/lib/types'
import { useEstadoVista } from '@/lib/demo-context'
import {
  HOY,
  bloqueosEntre,
  canchasActivas,
  desplazarDias,
  diaSemana,
  reservasEntre,
  reservaPorId,
} from '@/lib/mock-data'
import { DIAS_SEMANA, ESTADO_RESERVA, MOTIVO_BLOQUEO, ORDEN_ESTADO_RESERVA } from '@/lib/estados'
import { capitalizar, fechaConDia, mesAno } from '@/lib/formato'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page'
import { ControlSegmentado } from '@/components/ui/controls'
import { SkeletonCalendario } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BookingDetailModal } from '@/components/reservas/booking-detail-modal'
import { toast } from '@/components/ui/toast'

/**
 * Calendario de reservas. The central operational view, and the screen that
 * carries the design's signature.
 *
 * Slots are drawn as court markings rather than as generic calendar chips:
 * status is a colour and a fill treatment together, blocked franjas are hatched
 * like taped-off court, and the hour rules read as chalk lines. That is what
 * makes a dense grid scannable rather than merely colourful.
 */

const HORAS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]

type Vista = 'mensual' | 'semanal'

/** Monday of the week containing the given date. */
function inicioDeSemana(fecha: string): string {
  return desplazarDias(fecha, -(diaSemana(fecha) - 1))
}

/** First cell of the month grid: the Monday on or before the 1st. */
function inicioDeMalla(fecha: string): string {
  const primero = `${fecha.slice(0, 7)}-01`
  return inicioDeSemana(primero)
}

/* ------------------------------------------------------------ month view */

function VistaMensual({
  ancla,
  reservas,
  bloqueos,
  onSeleccionarDia,
}: {
  ancla: string
  reservas: Reserva[]
  bloqueos: ReturnType<typeof bloqueosEntre>
  /** Drills into the week view for that day, where slots open the booking. */
  onSeleccionarDia: (fecha: string) => void
}) {
  const inicio = inicioDeMalla(ancla)
  const mesActual = ancla.slice(0, 7)
  const dias = Array.from({ length: 42 }, (_, i) => desplazarDias(inicio, i))

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 border-b border-borde pb-2">
        {DIAS_SEMANA.map((dia) => (
          <span key={dia.valor} className="etiqueta text-center">
            {dia.largo.slice(0, 3)}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 pt-1">
        {dias.map((fecha) => {
          const delMes = fecha.slice(0, 7) === mesActual
          const esHoy = fecha === HOY
          const delDia = reservas.filter((r) => r.fecha === fecha)
          const bloqueosDelDia = bloqueos.filter((b) => b.fecha === fecha)

          const conteo = ORDEN_ESTADO_RESERVA.map((estado) => ({
            estado,
            total: delDia.filter((r) => r.estado === estado).length,
          })).filter((c) => c.total > 0)

          return (
            <button
              key={fecha}
              type="button"
              disabled={!delMes}
              onClick={() => onSeleccionarDia(fecha)}
              aria-label={
                delMes
                  ? `Ver el ${Number(fecha.slice(8, 10))} en detalle, ${delDia.length} reservas`
                  : undefined
              }
              className={cn(
                'min-h-28 rounded border p-1.5 text-left',
                'transition-colors duration-rapida',
                delMes
                  ? 'border-borde bg-superficie hover:border-cesped-300 hover:bg-cesped-50/50'
                  : 'cursor-default border-transparent bg-cal-50/60',
                esHoy && 'border-primario ring-1 ring-cesped-200'
              )}
            >
              <div className="mb-1 flex items-center justify-between">
                <span
                  className={cn(
                    'font-mono text-2xs numeros-tabulares',
                    esHoy
                      ? 'rounded bg-primario px-1.5 py-0.5 font-semibold text-white'
                      : delMes
                        ? 'text-tinta-media'
                        : 'text-cal-400'
                  )}
                >
                  {Number(fecha.slice(8, 10))}
                </span>
                {delMes && delDia.length > 0 && (
                  <span className="text-2xs text-apagado numeros-tabulares">{delDia.length}</span>
                )}
              </div>

              {delMes && (
                <div className="space-y-0.5">
                  {bloqueosDelDia.slice(0, 1).map((bloqueo) => (
                    <div
                      key={bloqueo.id}
                      className="trama-bloqueo truncate rounded-sm border border-borde-fuerte px-1 py-0.5 text-[10px] text-bloqueo-texto"
                      title={`${MOTIVO_BLOQUEO[bloqueo.motivo].etiqueta} · ${bloqueo.canchaNombre}`}
                    >
                      {MOTIVO_BLOQUEO[bloqueo.motivo].etiqueta}
                    </div>
                  ))}

                  {conteo.map(({ estado, total }) => (
                    <div
                      key={estado}
                      className={cn(
                        'flex items-center justify-between rounded-sm px-1 py-0.5 text-[10px]',
                        ESTADO_RESERVA[estado].slot
                      )}
                    >
                      <span className="truncate">{ESTADO_RESERVA[estado].etiqueta}</span>
                      <span className="numeros-tabulares">{total}</span>
                    </div>
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- week view */

function VistaSemanal({
  ancla,
  reservas,
  bloqueos,
  canchaFiltro,
  onAbrir,
}: {
  ancla: string
  reservas: Reserva[]
  bloqueos: ReturnType<typeof bloqueosEntre>
  canchaFiltro: string
  onAbrir: (reserva: Reserva) => void
}) {
  const inicio = inicioDeSemana(ancla)
  const dias = Array.from({ length: 7 }, (_, i) => desplazarDias(inicio, i))

  // One court at a time in the week view. Seven days by seven courts by twelve
  // hours in a single grid is unreadable, so the court filter drives it.
  const cancha =
    canchasActivas.find((c) => c.id === canchaFiltro) ?? canchasActivas[0]

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[720px]">
        <p className="mb-3 text-xs text-apagado">
          Mostrando <span className="font-medium text-tinta">{cancha.nombre}</span>. Cambia de
          cancha con el filtro superior.
        </p>

        <div className="grid grid-cols-[56px_repeat(7,1fr)] gap-1">
          <span />
          {dias.map((fecha) => (
            <div key={fecha} className="pb-1 text-center">
              <p className="etiqueta">{DIAS_SEMANA[diaSemana(fecha) - 1].largo.slice(0, 3)}</p>
              <p
                className={cn(
                  'font-mono text-xs numeros-tabulares',
                  fecha === HOY ? 'font-semibold text-primario' : 'text-tinta-media'
                )}
              >
                {Number(fecha.slice(8, 10))}
              </p>
            </div>
          ))}

          {HORAS.map((hora) => {
            const hhmm = `${String(hora).padStart(2, '0')}:00`

            return (
              <React.Fragment key={hora}>
                <span className="py-1 text-right font-mono text-2xs text-apagado numeros-tabulares">
                  {hhmm}
                </span>

                {dias.map((fecha) => {
                  const bloqueo = bloqueos.find(
                    (b) =>
                      b.fecha === fecha &&
                      b.canchaId === cancha.id &&
                      hhmm >= b.horaInicio &&
                      hhmm < b.horaFin
                  )

                  if (bloqueo) {
                    return (
                      <div
                        key={fecha}
                        className="trama-bloqueo flex h-9 items-center justify-center rounded-sm border border-borde-fuerte px-1 text-[10px] text-bloqueo-texto"
                        title={
                          bloqueo.instructorNombre
                            ? `${MOTIVO_BLOQUEO[bloqueo.motivo].etiqueta} · ${bloqueo.instructorNombre}`
                            : MOTIVO_BLOQUEO[bloqueo.motivo].etiqueta
                        }
                      >
                        <span className="truncate">
                          {MOTIVO_BLOQUEO[bloqueo.motivo].etiqueta}
                        </span>
                      </div>
                    )
                  }

                  const reserva = reservas.find(
                    (r) => r.fecha === fecha && r.canchaId === cancha.id && r.horaInicio === hhmm
                  )

                  if (!reserva) {
                    return (
                      <div
                        key={fecha}
                        className="h-9 rounded-sm border border-dashed border-borde bg-cal-50"
                      />
                    )
                  }

                  return (
                    <button
                      key={fecha}
                      type="button"
                      onClick={() => onAbrir(reserva)}
                      className={cn(
                        'h-9 truncate rounded-sm px-1.5 text-left text-[10px] leading-9',
                        'transition-transform duration-rapida hover:scale-[1.03]',
                        ESTADO_RESERVA[reserva.estado].slot
                      )}
                      title={`${reserva.clienteNombre} · ${ESTADO_RESERVA[reserva.estado].etiqueta}`}
                    >
                      {reserva.clienteNombre.split(' ')[0]}
                    </button>
                  )
                })}
              </React.Fragment>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ page */

function CalendarioReservas() {
  const estadoVista = useEstadoVista()
  const searchParams = useSearchParams()
  const [vista, setVista] = React.useState<Vista>('mensual')
  const [ancla, setAncla] = React.useState(HOY)
  const [canchaFiltro, setCanchaFiltro] = React.useState('todos')
  const [estadoFiltro, setEstadoFiltro] = React.useState('todos')
  const [reservaAbierta, setReservaAbierta] = React.useState<Reserva | null>(null)
  const [modalAbierto, setModalAbierto] = React.useState(false)

  /**
   * Deep links land here from global search, from the notification panel and
   * from the dashboard's quick actions. Without this they all dropped the
   * reader on an unfiltered August grid and the thing they clicked was not even
   * on screen.
   */
  React.useEffect(() => {
    const estado = searchParams.get('estado')
    if (estado) setEstadoFiltro(estado)

    const idReserva = searchParams.get('reserva')
    if (idReserva) {
      const encontrada = reservaPorId(idReserva)
      if (encontrada) {
        setAncla(encontrada.fecha)
        setVista('semanal')
        setCanchaFiltro(encontrada.canchaId)
        setReservaAbierta(encontrada)
        setModalAbierto(true)
      }
    }

    if (searchParams.get('nueva')) {
      toast.info('Nueva reserva manual', {
        descripcion: 'Aquí se abriría el formulario de alta manual de reserva.',
      })
    }
  }, [searchParams])

  const cargando = estadoVista === 'loading'
  const vacio = estadoVista === 'empty'

  const { desde, hasta } = React.useMemo(() => {
    if (vista === 'semanal') {
      const inicio = inicioDeSemana(ancla)
      return { desde: inicio, hasta: desplazarDias(inicio, 6) }
    }
    const inicio = inicioDeMalla(ancla)
    return { desde: inicio, hasta: desplazarDias(inicio, 41) }
  }, [vista, ancla])

  const reservas = React.useMemo(() => {
    if (vacio) return []
    return reservasEntre(desde, hasta).filter((r) => {
      if (canchaFiltro !== 'todos' && r.canchaId !== canchaFiltro) return false
      if (estadoFiltro !== 'todos' && r.estado !== estadoFiltro) return false
      return true
    })
  }, [desde, hasta, canchaFiltro, estadoFiltro, vacio])

  const bloqueos = React.useMemo(() => {
    if (vacio) return []
    return bloqueosEntre(desde, hasta).filter(
      (b) => canchaFiltro === 'todos' || b.canchaId === canchaFiltro
    )
  }, [desde, hasta, canchaFiltro, vacio])

  function abrir(reserva: Reserva) {
    setReservaAbierta(reserva)
    setModalAbierto(true)
  }

  function mover(direccion: -1 | 1) {
    if (vista === 'semanal') {
      setAncla((actual) => desplazarDias(actual, direccion * 7))
      return
    }

    // Step the month component, not 30 days. Stepping by days made "mes
    // siguiente" land on the same month from the 1st or the 31st, and skip a
    // month entirely across a short one.
    setAncla((actual) => {
      const [ano, mes] = actual.split('-').map(Number)
      return new Date(Date.UTC(ano, mes - 1 + direccion, 1)).toISOString().slice(0, 10)
    })
  }

  const hayFiltros = canchaFiltro !== 'todos' || estadoFiltro !== 'todos'

  return (
    <>
      <PageHeader
        titulo="Calendario de reservas"
        descripcion="Todas las reservas y franjas bloqueadas. Pulsa un día para ver sus franjas una a una."
        acciones={
          <Button
            onClick={() =>
              toast.info('Formulario de nueva reserva', {
                descripcion: 'En el prototipo esta acción abriría el alta manual de reserva.',
              })
            }
          >
            <CalendarPlus aria-hidden />
            Nueva reserva manual
          </Button>
        }
      />

      <Card>
        {/* ------------------------------------------------------- toolbar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-borde px-4 py-3">
          <div className="flex items-center gap-1">
            <Button
              variant="secundario"
              size="icono-sm"
              onClick={() => mover(-1)}
              aria-label={vista === 'semanal' ? 'Semana anterior' : 'Mes anterior'}
            >
              <ChevronLeft aria-hidden />
            </Button>
            <Button
              variant="secundario"
              size="icono-sm"
              onClick={() => mover(1)}
              aria-label={vista === 'semanal' ? 'Semana siguiente' : 'Mes siguiente'}
            >
              <ChevronRight aria-hidden />
            </Button>
            <Button variant="fantasma" size="sm" onClick={() => setAncla(HOY)}>
              Hoy
            </Button>
          </div>

          <p className="font-display text-md font-semibold text-tinta">
            {vista === 'semanal'
              ? capitalizar(fechaConDia(inicioDeSemana(ancla)))
              : capitalizar(mesAno(ancla))}
          </p>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            {/* view toggle */}
            <ControlSegmentado<Vista>
              etiqueta="Vista del calendario"
              valor={vista}
              onCambio={setVista}
              opciones={[
                { valor: 'mensual', etiqueta: 'Mes' },
                { valor: 'semanal', etiqueta: 'Semana' },
              ]}
            />

            <Select value={canchaFiltro} onValueChange={setCanchaFiltro}>
              <SelectTrigger size="sm" aria-label="Filtrar por cancha" className="w-auto min-w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas las canchas</SelectItem>
                <SelectSeparator />
                {canchasActivas.map((cancha) => (
                  <SelectItem key={cancha.id} value={cancha.id}>
                    {cancha.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
              <SelectTrigger size="sm" aria-label="Filtrar por estado" className="w-auto min-w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectSeparator />
                {ORDEN_ESTADO_RESERVA.map((estado) => (
                  <SelectItem key={estado} value={estado}>
                    {ESTADO_RESERVA[estado].etiqueta}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <CardContent className="pt-4">
          {cargando ? (
            <SkeletonCalendario />
          ) : reservas.length === 0 && bloqueos.length === 0 ? (
            <EmptyState
              ilustracion={hayFiltros ? 'busqueda' : 'cancha'}
              titulo={
                hayFiltros
                  ? 'Ninguna reserva coincide con estos filtros'
                  : 'No hay reservas en este periodo'
              }
              descripcion={
                hayFiltros
                  ? 'Prueba con otra cancha, otro estado o desplázate a otra semana.'
                  : 'Las reservas del polideportivo aparecerán sobre la parrilla, coloreadas según su estado.'
              }
              accion={
                <Button
                  onClick={() =>
                    toast.info('Formulario de nueva reserva', {
                      descripcion: 'En el prototipo esta acción abriría el alta manual de reserva.',
                    })
                  }
                >
                  <CalendarPlus aria-hidden />
                  Nueva reserva manual
                </Button>
              }
              accionSecundaria={
                hayFiltros ? (
                  <Button
                    variant="secundario"
                    onClick={() => {
                      setCanchaFiltro('todos')
                      setEstadoFiltro('todos')
                    }}
                  >
                    Quitar filtros
                  </Button>
                ) : undefined
              }
            />
          ) : vista === 'mensual' ? (
            <VistaMensual
              ancla={ancla}
              reservas={reservas}
              bloqueos={bloqueos}
              onSeleccionarDia={(fecha) => {
                setAncla(fecha)
                setVista('semanal')
              }}
            />
          ) : (
            <VistaSemanal
              ancla={ancla}
              reservas={reservas}
              bloqueos={bloqueos}
              canchaFiltro={canchaFiltro}
              onAbrir={abrir}
            />
          )}

          {/* legend */}
          {!cargando && (reservas.length > 0 || bloqueos.length > 0) && (
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-borde pt-3">
              {ORDEN_ESTADO_RESERVA.map((estado) => (
                <span key={estado} className="flex items-center gap-1.5 text-2xs text-apagado">
                  <span
                    className={cn(
                      'size-3 rounded-sm border border-borde',
                      ESTADO_RESERVA[estado].slot
                    )}
                    aria-hidden
                  />
                  {ESTADO_RESERVA[estado].etiqueta}
                </span>
              ))}
              <span className="flex items-center gap-1.5 text-2xs text-apagado">
                <span
                  className="trama-bloqueo size-3 rounded-sm border border-borde-fuerte"
                  aria-hidden
                />
                Franja bloqueada
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <BookingDetailModal
        reserva={reservaAbierta}
        abierto={modalAbierto}
        onOpenChange={setModalAbierto}
      />
    </>
  )
}

/**
 * useSearchParams needs a Suspense boundary in the App Router, otherwise the
 * whole route opts out of static rendering.
 */
export default function ReservasPage() {
  return (
    <React.Suspense fallback={<SkeletonCalendario />}>
      <CalendarioReservas />
    </React.Suspense>
  )
}
