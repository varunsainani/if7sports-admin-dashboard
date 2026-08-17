'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  CalendarPlus,
  Euro,
  Gauge,
  Plus,
  Trophy,
  Users,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import type { Reserva } from '@/lib/types'
import { useDemo, useEstadoVista } from '@/lib/demo-context'
import {
  HOY,
  bloqueosDeFecha,
  canchasActivas,
  reservasDeHoy,
  resumenDashboard,
  ultimasReservas,
} from '@/lib/mock-data'
import { ESTADO_RESERVA } from '@/lib/estados'
import { IconoCancha } from '@/components/ui/icono-cancha'
import { capitalizar, euros, eurosCompacto, fechaConDia, numero, porcentaje } from '@/lib/formato'
import { Button } from '@/components/ui/button'
import { BadgePago, BadgeReserva } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { MetricCard, PageHeader, Section } from '@/components/ui/page'
import { Skeleton, SkeletonMetrica, SkeletonTexto } from '@/components/ui/skeleton'
import { BookingDetailModal } from '@/components/reservas/booking-detail-modal'

/**
 * Dashboard. The screen the owner lands on, answering the two questions they
 * actually open this panel to answer: what is happening on my courts today,
 * and how much money came in.
 *
 * The day view is the signature element in miniature. Courts run down the left,
 * hours run across, and each slot carries its booking status as both a colour
 * and a fill treatment. Blocked franjas are hatched like taped-off court.
 */

/** Hours the day strip covers. Continuous, matching the facility's window. */
const HORAS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]

function TiraDelDia({ onAbrirReserva }: { onAbrirReserva: (reserva: Reserva) => void }) {
  const reservas = reservasDeHoy
  const bloqueos = bloqueosDeFecha(HOY)

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[860px]">
        {/* hour ruler */}
        <div className="mb-1 grid grid-cols-[132px_repeat(14,1fr)] gap-1">
          <span />
          {HORAS.map((hora) => (
            <span key={hora} className="text-center font-mono text-2xs text-apagado">
              {String(hora).padStart(2, '0')}
            </span>
          ))}
        </div>

        <div className="space-y-1">
          {canchasActivas.map((cancha) => {
            return (
              <div key={cancha.id} className="grid grid-cols-[132px_repeat(14,1fr)] gap-1">
                <div className="flex items-center gap-1.5 pr-2">
                  <IconoCancha tipo={cancha.tipo} className="size-4 shrink-0 text-cal-500" />
                  <span className="truncate text-xs text-tinta-media">{cancha.nombre}</span>
                </div>

                {HORAS.map((hora) => {
                  const hhmm = `${String(hora).padStart(2, '0')}:00`

                  const bloqueo = bloqueos.find(
                    (b) =>
                      b.canchaId === cancha.id &&
                      hhmm >= b.horaInicio &&
                      hhmm < b.horaFin
                  )

                  if (bloqueo) {
                    return (
                      <div
                        key={hora}
                        className="trama-bloqueo h-8 rounded-sm border border-borde-fuerte"
                        title={`Bloqueo · ${bloqueo.motivo}${bloqueo.instructorNombre ? ` · ${bloqueo.instructorNombre}` : ''}`}
                      />
                    )
                  }

                  const reserva = reservas.find(
                    (r) => r.canchaId === cancha.id && r.horaInicio === hhmm
                  )

                  if (!reserva) {
                    return (
                      <div
                        key={hora}
                        className="h-8 rounded-sm border border-dashed border-borde bg-cal-50"
                      />
                    )
                  }

                  return (
                    <button
                      key={hora}
                      type="button"
                      onClick={() => onAbrirReserva(reserva)}
                      title={`${reserva.clienteNombre} · ${ESTADO_RESERVA[reserva.estado].etiqueta}`}
                      className={cn(
                        'h-8 truncate rounded-sm px-1 text-[10px] leading-8',
                        'transition-transform duration-rapida hover:scale-[1.04]',
                        ESTADO_RESERVA[reserva.estado].slot
                      )}
                    >
                      {reserva.clienteNombre.split(' ')[0]}
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Leyenda() {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-borde pt-3">
      {(['pendiente', 'confirmada', 'completada', 'cancelada'] as const).map((estado) => (
        <span key={estado} className="flex items-center gap-1.5 text-2xs text-apagado">
          <span
            className={cn('size-3 rounded-sm border border-borde', ESTADO_RESERVA[estado].slot)}
            aria-hidden
          />
          {ESTADO_RESERVA[estado].etiqueta}
        </span>
      ))}
      <span className="flex items-center gap-1.5 text-2xs text-apagado">
        <span className="trama-bloqueo size-3 rounded-sm border border-borde-fuerte" aria-hidden />
        Franja bloqueada
      </span>
      <span className="flex items-center gap-1.5 text-2xs text-apagado">
        <span className="size-3 rounded-sm border border-dashed border-borde bg-cal-50" aria-hidden />
        Libre
      </span>
    </div>
  )
}

export default function DashboardPage() {
  const estadoVista = useEstadoVista()
  const { puedeVer } = useDemo()
  const [reservaAbierta, setReservaAbierta] = React.useState<Reserva | null>(null)
  const [modalAbierto, setModalAbierto] = React.useState(false)

  function abrirReserva(reserva: Reserva) {
    setReservaAbierta(reserva)
    setModalAbierto(true)
  }

  const cargando = estadoVista === 'loading'
  const vacio = estadoVista === 'empty'

  return (
    <>
      <PageHeader
        titulo="Dashboard"
        descripcion={capitalizar(fechaConDia(HOY))}
        acciones={
          <>
            {/* Only offer a shortcut the current user can actually follow. */}
            {puedeVer('canchas') && (
              <Button variant="secundario" asChild>
                <Link href="/canchas">
                  <Trophy aria-hidden />
                  Gestionar canchas
                </Link>
              </Button>
            )}
            {puedeVer('clientes') && (
              <Button variant="secundario" asChild>
                <Link href="/clientes">
                  <Users aria-hidden />
                  Ver clientes
                </Link>
              </Button>
            )}
            <Button asChild>
              <Link href="/reservas?nueva=1">
                <CalendarPlus aria-hidden />
                Nueva reserva manual
              </Link>
            </Button>
          </>
        }
      />

      {/* ------------------------------------------------------ metric cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cargando ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonMetrica key={i} />)
        ) : (
          <>
            <MetricCard
              etiqueta="Facturación del mes"
              valor={vacio ? '0,00 €' : eurosCompacto(resumenDashboard.facturacionMes)}
              variacion={vacio ? undefined : resumenDashboard.variacionFacturacion}
              comparacion="vs. mes anterior"
              icono={<Euro />}
            />
            <MetricCard
              etiqueta="Reservas del día"
              valor={vacio ? '0' : numero(resumenDashboard.reservasHoy)}
              nota={
                vacio
                  ? 'Todavía no hay reservas para hoy.'
                  : `En ${canchasActivas.length} canchas activas`
              }
              icono={<CalendarPlus />}
            />
            <MetricCard
              etiqueta="Ocupación"
              valor={vacio ? '0 %' : porcentaje(resumenDashboard.ocupacion)}
              nota="Media de este mes"
              icono={<Gauge />}
            />
            <MetricCard
              etiqueta="Clientes activos"
              valor={vacio ? '0' : numero(resumenDashboard.clientesActivos)}
              nota="Con reserva este mes"
              icono={<Users />}
            />
          </>
        )}
      </div>

      {/* -------------------------------------------------------- day view */}
      <Section
        titulo="Reservas de hoy"
        descripcion="Pulsa una franja para abrir el detalle de la reserva."
        acciones={
          <Button variant="enlace" size="sm" asChild>
            <Link href="/reservas">
              Ver calendario completo
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        }
      >
        <Card>
          <CardContent className="pt-5">
            {cargando ? (
              <div className="space-y-1">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : vacio ? (
              <EmptyState
                compacto
                ilustracion="cancha"
                titulo="Hoy no hay ninguna reserva"
                descripcion="Cuando entren reservas para hoy aparecerán aquí, repartidas por cancha y por franja horaria."
                accion={
                  <Button asChild>
                    <Link href="/reservas?nueva=1">
                      <Plus aria-hidden />
                      Nueva reserva manual
                    </Link>
                  </Button>
                }
              />
            ) : (
              <>
                <TiraDelDia onAbrirReserva={abrirReserva} />
                <Leyenda />
              </>
            )}
          </CardContent>
        </Card>
      </Section>

      {/* --------------------------------------------------- latest bookings */}
      <Section titulo="Últimas 10 reservas">
        <Card>
          {cargando ? (
            <CardContent className="space-y-3 pt-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonTexto key={i} />
              ))}
            </CardContent>
          ) : vacio ? (
            <EmptyState
              compacto
              ilustracion="cuadrante"
              titulo="Todavía no se ha registrado ninguna reserva"
              descripcion="Las reservas más recientes del polideportivo aparecerán en esta lista."
              accion={
                <Button asChild>
                  <Link href="/reservas?nueva=1">
                    <Plus aria-hidden />
                    Nueva reserva manual
                  </Link>
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-borde">
              {ultimasReservas.map((reserva) => (
                <li key={reserva.id}>
                  <button
                    type="button"
                    onClick={() => abrirReserva(reserva)}
                    className={cn(
                      'flex w-full items-center gap-4 px-5 py-3 text-left',
                      'transition-colors duration-rapida hover:bg-cesped-50'
                    )}
                  >
                    <span className="hidden w-24 shrink-0 font-mono text-2xs text-apagado sm:block">
                      {reserva.id}
                    </span>

                    <span className="min-w-0 flex-1 xl:w-[300px] xl:flex-none">
                      <span className="block truncate text-base font-medium text-tinta">
                        {reserva.clienteNombre}
                      </span>
                      <span className="block truncate text-xs text-apagado">
                        {reserva.canchaNombre}
                      </span>
                    </span>

                    <span className="hidden w-32 shrink-0 font-mono text-xs text-tinta-media numeros-tabulares lg:block">
                      {reserva.horaInicio} a {reserva.horaFin}
                    </span>

                    <span className="ml-auto flex shrink-0 items-center gap-2.5">
                      <BadgeReserva estado={reserva.estado} />
                      <BadgePago estado={reserva.estadoPago} soloIcono className="xl:hidden" />
                      <BadgePago estado={reserva.estadoPago} className="hidden xl:inline-flex" />
                      <span className="w-20 text-right font-mono text-sm text-tinta numeros-tabulares">
                        {euros(reserva.importe)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </Section>

      <BookingDetailModal
        reserva={reservaAbierta}
        abierto={modalAbierto}
        onOpenChange={setModalAbierto}
      />
    </>
  )
}
