'use client'

import * as React from 'react'
import {
  Ban,
  Check,
  Mail,
  MessageCircle,
  Pencil,
  RotateCcw,
  User,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import type { EstadoReserva, Reserva } from '@/lib/types'
import { ESTADO_RESERVA } from '@/lib/estados'
import { IconoCancha } from '@/components/ui/icono-cancha'
import { canchaPorId, clientePorId } from '@/lib/mock-data'
import { euros, fechaConDia, fechaHora, capitalizar } from '@/lib/formato'
import { Button } from '@/components/ui/button'
import { BadgePago, BadgeReserva } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/input'
import { Dato, ListaDatos } from '@/components/ui/page'
import { toast } from '@/components/ui/toast'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

/**
 * Booking detail. Opens over the calendar, the dashboard list, the client
 * history and the global search, so it takes a booking and nothing else about
 * where it was opened from.
 *
 * The vertical timeline is the reason this is a modal rather than a row
 * expansion: it answers "who changed this and when", which is the question
 * staff actually open a booking to settle.
 */

const ICONO_EVENTO: Record<EstadoReserva | 'creada', typeof Check> = {
  creada: User,
  pendiente: User,
  confirmada: Check,
  cancelada: Ban,
  completada: Check,
}

function Timeline({ reserva }: { reserva: Reserva }) {
  return (
    <ol className="relative space-y-5 pl-6">
      {/* The rail. Drawn behind the markers so it reads as one continuous line. */}
      <span
        className="absolute left-[7px] top-1.5 bottom-1.5 w-px bg-borde"
        aria-hidden
      />

      {reserva.historial.map((evento) => {
        const Icono = ICONO_EVENTO[evento.estado]
        const esCancelacion = evento.estado === 'cancelada'

        return (
          <li key={evento.id} className="relative">
            <span
              className={cn(
                'absolute -left-6 top-0.5 flex size-4 items-center justify-center rounded-full border-2 border-superficie',
                esCancelacion ? 'bg-cancelada-solido' : 'bg-cesped-300'
              )}
              aria-hidden
            >
              <Icono className="size-2.5 text-white" strokeWidth={3} />
            </span>

            <p className="text-base font-medium text-tinta">
              {evento.estado === 'creada'
                ? 'Reserva creada'
                : `Marcada como ${ESTADO_RESERVA[evento.estado].etiqueta.toLowerCase()}`}
            </p>
            <p className="mt-0.5 text-xs text-apagado">
              <time dateTime={evento.fecha}>{fechaHora(evento.fecha)}</time> · {evento.actor}
            </p>
            {evento.nota && <p className="mt-1 text-xs text-tinta-media">{evento.nota}</p>}
          </li>
        )
      })}
    </ol>
  )
}

interface BookingDetailModalProps {
  reserva: Reserva | null
  abierto: boolean
  onOpenChange: (abierto: boolean) => void
}

export function BookingDetailModal({ reserva, abierto, onOpenChange }: BookingDetailModalProps) {
  const [notas, setNotas] = React.useState('')

  /**
   * This modal is opened from a calendar chip, a dashboard row or a history
   * row, never from a DialogTrigger, so Radix has nothing to hand focus back
   * to and closing dropped the user at the top of the document. In a 7 by 14
   * grid that means losing your place entirely.
   */
  const origenFoco = React.useRef<HTMLElement | null>(null)

  React.useEffect(() => {
    if (abierto) origenFoco.current = document.activeElement as HTMLElement | null
  }, [abierto])

  React.useEffect(() => {
    setNotas(reserva?.notasInternas ?? '')
  }, [reserva])

  if (!reserva) return null

  const cancha = canchaPorId(reserva.canchaId)
  const cliente = clientePorId(reserva.clienteId)


  function cambiarEstado(nuevo: EstadoReserva) {
    toast.exito(`Reserva marcada como ${ESTADO_RESERVA[nuevo].etiqueta.toLowerCase()}`, {
      descripcion: `${reserva!.id} · ${reserva!.clienteNombre}`,
    })
  }

  return (
    <Dialog open={abierto} onOpenChange={onOpenChange}>
      <DialogContent
        ancho="lg"
        aria-describedby={undefined}
        onCloseAutoFocus={(evento) => {
          evento.preventDefault()
          origenFoco.current?.focus()
        }}
      >
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2.5">
            <DialogTitle>Reserva {reserva.id}</DialogTitle>
            {reserva.origen === 'manual' && (
              <span className="rounded-full bg-cal-200 px-2 py-0.5 text-2xs text-cal-800">
                Creada manualmente
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-apagado">
            {capitalizar(fechaConDia(reserva.fecha))} · {reserva.horaInicio} a {reserva.horaFin}
          </p>
        </DialogHeader>

        <DialogBody className="space-y-6">
          {/* ------------------------------------------- the two status axes
              Side by side and visually unequal on purpose: booking status is
              the loud one, payment is the quiet second axis. */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 rounded-lg border border-borde bg-superficie-alt px-4 py-3">
            <div>
              <p className="etiqueta mb-1.5">Estado de la reserva</p>
              <BadgeReserva estado={reserva.estado} variante="solido" />
            </div>
            <div>
              <p className="etiqueta mb-1.5">Estado del pago</p>
              <BadgePago estado={reserva.estadoPago} />
            </div>
            <div className="ml-auto text-right">
              <p className="etiqueta mb-1">Importe</p>
              <p className="font-display text-2xl font-semibold text-tinta numeros-tabulares">
                {euros(reserva.importe)}
              </p>
            </div>
          </div>

          {/* ------------------------------------------------------- details */}
          <ListaDatos columnas={2}>
            <Dato etiqueta="Cliente">
              <span className="font-medium">{reserva.clienteNombre}</span>
            </Dato>
            <Dato etiqueta="Cancha">
              <span className="flex items-center gap-1.5">
                {cancha && <IconoCancha tipo={cancha.tipo} className="size-4 text-cal-500" />}
                {reserva.canchaNombre}
              </span>
            </Dato>
            <Dato etiqueta="Fecha">{capitalizar(fechaConDia(reserva.fecha))}</Dato>
            <Dato etiqueta="Franja horaria">
              <span className="font-mono numeros-tabulares">
                {reserva.horaInicio} - {reserva.horaFin}
              </span>
            </Dato>
          </ListaDatos>

          {/* ------------------------------------------------------ timeline */}
          <div>
            <p className="etiqueta mb-3">Historial de la reserva</p>
            <Timeline reserva={reserva} />
          </div>

          {/* -------------------------------------------------- staff notes */}
          <div>
            <label htmlFor="notas-internas" className="etiqueta mb-1.5 block">
              Notas internas
            </label>
            <Textarea
              id="notas-internas"
              value={notas}
              onChange={(evento) => setNotas(evento.target.value)}
              rows={3}
              placeholder="Visible solo para el personal del polideportivo."
            />
          </div>
        </DialogBody>

        <DialogFooter>
          {/* Reserva carries no phone or email, so both come from the client
              record. Building the WhatsApp URL from the display name produced a
              link that could be copied but never worked. */}
          <Button variant="fantasma" size="sm" asChild>
            <a
              href={`https://wa.me/${(cliente?.telefono ?? '').replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle aria-hidden />
              WhatsApp
            </a>
          </Button>

          <Button variant="fantasma" size="sm" asChild>
            <a href={`mailto:${cliente?.correo ?? ''}`}>
              <Mail aria-hidden />
              Enviar correo
            </a>
          </Button>

          <div className="ml-auto flex flex-wrap items-center gap-2.5">
            {reserva.estadoPago === 'pagado' && reserva.estado !== 'cancelada' && (
              <Button
                variant="secundario"
                size="sm"
                onClick={() =>
                  toast.exito('Devolución procesada', {
                    descripcion: `${euros(reserva.importe)} devueltos a ${reserva.clienteNombre}.`,
                  })
                }
              >
                <RotateCcw aria-hidden />
                Procesar devolución
              </Button>
            )}

            <Button variant="secundario" size="sm">
              <Pencil aria-hidden />
              Editar reserva
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm">Cambiar estado</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Marcar la reserva como</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(['pendiente', 'confirmada', 'completada'] as EstadoReserva[])
                  .filter((estado) => estado !== reserva.estado)
                  .map((estado) => (
                    <DropdownMenuItem key={estado} onSelect={() => cambiarEstado(estado)}>
                      {ESTADO_RESERVA[estado].etiqueta}
                    </DropdownMenuItem>
                  ))}
                {reserva.estado !== 'cancelada' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem peligro onSelect={() => cambiarEstado('cancelada')}>
                      <Ban aria-hidden />
                      Cancelar reserva
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
