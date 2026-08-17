'use client'

import * as React from 'react'
import Link from 'next/link'
import { notFound, useParams } from 'next/navigation'
import { ArrowLeft, Mail, MessageCircle, Phone } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { Reserva } from '@/lib/types'
import { useEstadoVista } from '@/lib/demo-context'
import { clientePorId, reservasDeCliente } from '@/lib/mock-data'
import { euros, fechaCorta, fechaLarga } from '@/lib/formato'
import { Button } from '@/components/ui/button'
import { BadgePago, BadgeReserva } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/controls'
import { EmptyState } from '@/components/ui/empty-state'
import { Contador, Dato, ListaDatos, PageHeaderSkeleton, Section } from '@/components/ui/page'
import { Skeleton, SkeletonTexto } from '@/components/ui/skeleton'
import { BookingDetailModal } from '@/components/reservas/booking-detail-modal'

/**
 * Detalle del cliente: who they are, their three counters, and the full booking
 * history with every row opening the same booking modal used everywhere else.
 */
export default function ClienteDetallePage() {
  const params = useParams<{ id: string }>()
  const estadoVista = useEstadoVista()
  const cliente = clientePorId(params.id)

  const [reservaAbierta, setReservaAbierta] = React.useState<Reserva | null>(null)
  const [modalAbierto, setModalAbierto] = React.useState(false)

  if (!cliente) notFound()

  const historial = reservasDeCliente(cliente.id)
  const cargando = estadoVista === 'loading'
  const vacio = estadoVista === 'empty'

  if (cargando) {
    return (
      <>
        <PageHeaderSkeleton />
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonTexto key={i} />
          ))}
        </div>
      </>
    )
  }

  const telefonoLimpio = cliente.telefono.replace(/[^0-9]/g, '')

  return (
    <>
      <Button variant="enlace" size="sm" asChild className="mb-3">
        <Link href="/clientes">
          <ArrowLeft aria-hidden />
          Volver a clientes
        </Link>
      </Button>

      {/* ---------------------------------------------------------- header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4 rounded-lg border border-borde bg-superficie p-5">
        <div className="flex items-center gap-4">
          <Avatar nombre={cliente.nombre} size="xl" />
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-semibold tracking-display text-tinta">
              {cliente.nombre}
            </h1>
            <p className="mt-1 text-base text-apagado">
              Cliente desde el {fechaLarga(cliente.fechaPrimeraReserva)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secundario" size="sm" asChild>
            <a href={`mailto:${cliente.correo}`}>
              <Mail aria-hidden />
              Enviar correo
            </a>
          </Button>
          <Button variant="secundario" size="sm" asChild>
            <a href={`tel:${telefonoLimpio}`}>
              <Phone aria-hidden />
              Llamar
            </a>
          </Button>
          <Button variant="secundario" size="sm" asChild>
            <a href={`https://wa.me/${telefonoLimpio}`} target="_blank" rel="noreferrer">
              <MessageCircle aria-hidden />
              WhatsApp
            </a>
          </Button>
        </div>
      </div>

      {/* ----------------------------------------------------- contact data */}
      <div className="mb-6 rounded-lg border border-borde bg-superficie p-5">
        <ListaDatos columnas={4}>
          <Dato etiqueta="Correo electrónico">{cliente.correo}</Dato>
          <Dato etiqueta="Teléfono">
            <span className="font-mono text-sm numeros-tabulares">{cliente.telefono}</span>
          </Dato>
          <Dato etiqueta="Última reserva">{fechaCorta(cliente.fechaUltimaReserva)}</Dato>
          <Dato etiqueta="Importe total pagado">
            <span className="font-mono numeros-tabulares">{euros(cliente.importeTotalPagado)}</span>
          </Dato>
        </ListaDatos>
      </div>

      {/* -------------------------------------------------------- counters */}
      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <Contador etiqueta="Reservas activas" valor={cliente.reservasActivas} tono="confirmada" />
        <Contador
          etiqueta="Reservas completadas"
          valor={cliente.reservasCompletadas}
          tono="completada"
        />
        <Contador
          etiqueta="Reservas canceladas"
          valor={cliente.reservasCanceladas}
          tono="cancelada"
        />
      </div>

      {/* --------------------------------------------------------- history */}
      <Section
        titulo="Historial de reservas"
        descripcion={`${cliente.totalReservas} reservas en total. Pulsa una fila para abrir el detalle.`}
      >
        <div className="overflow-hidden rounded-lg border border-borde bg-superficie">
          {vacio || historial.length === 0 ? (
            <EmptyState
              ilustracion="cuadrante"
              titulo="Este cliente todavía no tiene reservas"
              descripcion="Cuando reserve una pista, el historial completo aparecerá aquí con su estado y su importe."
            />
          ) : (
            <ul className="divide-y divide-borde">
              {historial.slice(0, 25).map((reserva) => (
                <li key={reserva.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setReservaAbierta(reserva)
                      setModalAbierto(true)
                    }}
                    className={cn(
                      'flex w-full items-center gap-4 px-5 py-3 text-left',
                      'transition-colors duration-rapida hover:bg-cesped-50'
                    )}
                  >
                    <span className="w-24 shrink-0 font-mono text-2xs text-apagado">
                      {reserva.id}
                    </span>

                    <span className="w-24 shrink-0 text-sm text-tinta-media numeros-tabulares">
                      {fechaCorta(reserva.fecha)}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-base text-tinta">
                        {reserva.canchaNombre}
                      </span>
                      <span className="block font-mono text-xs text-apagado numeros-tabulares">
                        {reserva.horaInicio} a {reserva.horaFin}
                      </span>
                    </span>

                    <BadgeReserva estado={reserva.estado} />
                    <BadgePago estado={reserva.estadoPago} soloIcono />

                    <span className="w-20 shrink-0 text-right font-mono text-sm text-tinta numeros-tabulares">
                      {euros(reserva.importe)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {historial.length > 25 && (
            <div className="border-t border-borde px-5 py-3 text-center">
              <p className="text-xs text-apagado">
                Mostrando las 25 reservas más recientes de {historial.length}.
              </p>
            </div>
          )}
        </div>
      </Section>

      <BookingDetailModal
        reserva={reservaAbierta}
        abierto={modalAbierto}
        onOpenChange={setModalAbierto}
      />
    </>
  )
}
