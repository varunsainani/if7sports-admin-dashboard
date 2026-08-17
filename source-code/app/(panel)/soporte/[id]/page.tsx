'use client'

import * as React from 'react'
import Link from 'next/link'
import { notFound, useParams } from 'next/navigation'
import { ArrowLeft, Paperclip, Send } from 'lucide-react'

import { cn } from '@/lib/utils'
import { ticketPorId } from '@/lib/mock-data'
import { TIPO_TICKET } from '@/lib/estados'
import { fechaHora } from '@/lib/formato'
import { Button } from '@/components/ui/button'
import { BadgeTicket } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/controls'
import { Textarea } from '@/components/ui/input'
import { Dato, ListaDatos } from '@/components/ui/page'
import { Marca } from '@/components/shell/sidebar'
import { toast } from '@/components/ui/toast'

/**
 * Ticket thread.
 *
 * Messages from IF7SPORTS sit on the opposite side and carry the platform mark
 * rather than an avatar, so it is immediately obvious which side of the
 * conversation each message came from without reading the author line.
 */
export default function TicketDetallePage() {
  const params = useParams<{ id: string }>()
  const ticket = ticketPorId(decodeURIComponent(params.id))

  const [respuesta, setRespuesta] = React.useState('')

  if (!ticket) notFound()

  return (
    <>
      <Button variant="enlace" size="sm" asChild className="mb-3">
        <Link href="/soporte">
          <ArrowLeft aria-hidden />
          Volver a soporte
        </Link>
      </Button>

      <div className="mb-6 rounded-lg border border-borde bg-superficie p-5">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-xs text-apagado">{ticket.id}</p>
            <h1 className="mt-1 font-display text-xl font-semibold tracking-display text-tinta">
              {ticket.asunto}
            </h1>
          </div>
          <BadgeTicket estado={ticket.estado} />
        </div>

        <ListaDatos columnas={3}>
          <Dato etiqueta="Tipo">{TIPO_TICKET[ticket.tipo]}</Dato>
          <Dato etiqueta="Abierta el">{fechaHora(ticket.fecha)}</Dato>
          <Dato etiqueta="Última respuesta">{fechaHora(ticket.ultimaRespuesta)}</Dato>
        </ListaDatos>
      </div>

      {/* --------------------------------------------------------- thread */}
      <ol className="space-y-4">
        {ticket.mensajes.map((mensaje) => (
          <li
            key={mensaje.id}
            className={cn('flex gap-3', mensaje.esIF7 ? 'flex-row-reverse' : 'flex-row')}
          >
            {mensaje.esIF7 ? (
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-borde bg-superficie">
                <Marca className="size-5" />
              </span>
            ) : (
              <Avatar nombre={mensaje.autor} size="md" />
            )}

            <div
              className={cn(
                'max-w-2xl rounded-lg border px-4 py-3',
                mensaje.esIF7
                  ? 'border-cesped-200 bg-cesped-50'
                  : 'border-borde bg-superficie'
              )}
            >
              <div className="mb-1.5 flex flex-wrap items-baseline gap-x-2">
                <p className="text-sm font-medium text-tinta">{mensaje.autor}</p>
                <time className="text-2xs text-apagado" dateTime={mensaje.fecha}>
                  {fechaHora(mensaje.fecha)}
                </time>
              </div>

              <p className="whitespace-pre-line text-base leading-relaxed text-tinta-media">
                {mensaje.cuerpo}
              </p>

              {mensaje.adjuntos.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {mensaje.adjuntos.map((adjunto) => (
                    <li key={adjunto}>
                      <span className="inline-flex items-center gap-1.5 rounded border border-borde bg-superficie px-2 py-1 text-2xs text-tinta-media">
                        <Paperclip className="size-3 text-cal-500" aria-hidden />
                        {adjunto}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>

      {/* ---------------------------------------------------------- reply */}
      {ticket.estado === 'cerrado' ? (
        <div className="mt-6 rounded-lg border border-borde bg-superficie-alt px-4 py-4 text-center">
          <p className="text-sm text-apagado">
            Esta solicitud está cerrada. Si el problema vuelve a aparecer, abre una solicitud nueva
            y enlaza esta referencia.
          </p>
          <Button variant="secundario" size="sm" className="mt-3" asChild>
            <Link href="/soporte">Volver al listado</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-borde bg-superficie p-4">
          <label htmlFor="respuesta" className="etiqueta mb-2 block">
            Responder
          </label>
          <Textarea
            id="respuesta"
            rows={4}
            value={respuesta}
            onChange={(evento) => setRespuesta(evento.target.value)}
            placeholder="Escribe tu respuesta al equipo de IF7SPORTS."
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <Button variant="fantasma" size="sm">
              <Paperclip aria-hidden />
              Adjuntar archivo
            </Button>
            <Button
              disabled={respuesta.trim().length === 0}
              onClick={() => {
                setRespuesta('')
                toast.exito('Respuesta enviada')
              }}
            >
              <Send aria-hidden />
              Enviar respuesta
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
