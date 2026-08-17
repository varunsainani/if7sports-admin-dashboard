'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import type { ColumnDef } from '@tanstack/react-table'
import { Paperclip, Plus } from 'lucide-react'

import type { Ticket } from '@/lib/types'
import { useEstadoVista } from '@/lib/demo-context'
import { tickets } from '@/lib/mock-data'
import { TIPO_TICKET } from '@/lib/estados'
import { fechaCorta, haceTiempo } from '@/lib/formato'
import { Button } from '@/components/ui/button'
import { BadgeTicket } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page'
import { Campo, Input, Textarea } from '@/components/ui/input'
import {
  FiltroSelect,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CeldaApagada, CeldaPrincipal, DataTable } from '@/components/ui/data-table'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from '@/components/ui/toast'

/**
 * Soporte con IF7SPORTS. The one screen showing the relationship between the
 * polideportivo and the platform it runs on.
 */

function ModalNuevaSolicitud({
  abierto,
  onOpenChange,
}: {
  abierto: boolean
  onOpenChange: (abierto: boolean) => void
}) {
  const [tipo, setTipo] = React.useState('')

  return (
    <Dialog open={abierto} onOpenChange={onOpenChange}>
      <DialogContent ancho="md">
        <DialogHeader>
          <DialogTitle>Nueva solicitud</DialogTitle>
          <DialogDescription>
            El equipo de IF7SPORTS responde en el mismo hilo. Recibirás un aviso en el panel.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-4">
          <Campo etiqueta="Tipo de solicitud" htmlFor="ticket-tipo" requerido>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger id="ticket-tipo">
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tecnico">Técnico</SelectItem>
                <SelectItem value="administrativo">Administrativo</SelectItem>
                <SelectItem value="comercial">Comercial</SelectItem>
              </SelectContent>
            </Select>
          </Campo>

          <Campo etiqueta="Asunto" htmlFor="ticket-asunto" requerido>
            <Input id="ticket-asunto" placeholder="Resume el problema en una línea" />
          </Campo>

          <Campo
            etiqueta="Descripción"
            htmlFor="ticket-descripcion"
            requerido
            ayuda="Cuanto más concreto, antes se resuelve. Incluye fechas, canchas o reservas afectadas."
          >
            <Textarea id="ticket-descripcion" rows={5} />
          </Campo>

          <Campo etiqueta="Adjuntos" htmlFor="ticket-adjuntos">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-borde-control bg-superficie-alt px-4 py-5 text-xs text-tinta-media transition-colors duration-rapida hover:border-primario hover:bg-cesped-50"
            >
              <Paperclip className="size-4 text-cal-500" aria-hidden />
              Adjunta capturas o documentos
            </button>
          </Campo>
        </DialogBody>

        <DialogFooter>
          <Button variant="secundario" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false)
              toast.exito('Solicitud enviada', {
                descripcion: 'IF7SPORTS responderá en este mismo hilo.',
              })
            }}
          >
            Enviar solicitud
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function SoportePage() {
  const estadoVista = useEstadoVista()
  const router = useRouter()
  const [modalAbierto, setModalAbierto] = React.useState(false)
  const [tipo, setTipo] = React.useState('todos')
  const [estado, setEstado] = React.useState('todos')

  const datos = React.useMemo(() => {
    if (estadoVista === 'empty') return []
    return tickets.filter((ticket) => {
      if (tipo !== 'todos' && ticket.tipo !== tipo) return false
      if (estado !== 'todos' && ticket.estado !== estado) return false
      return true
    })
  }, [tipo, estado, estadoVista])

  const columns = React.useMemo<ColumnDef<Ticket, unknown>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Referencia',
        cell: ({ row }) => (
          <span className="font-mono text-xs text-apagado">{row.original.id}</span>
        ),
      },
      {
        accessorKey: 'fecha',
        header: 'Fecha',
        cell: ({ row }) => (
          <span className="text-tinta-media numeros-tabulares">
            {fechaCorta(row.original.fecha)}
          </span>
        ),
      },
      {
        accessorKey: 'tipo',
        header: 'Tipo',
        cell: ({ row }) => (
          <span className="rounded-full bg-cal-200 px-2 py-0.5 text-2xs text-cal-800">
            {TIPO_TICKET[row.original.tipo]}
          </span>
        ),
      },
      {
        accessorKey: 'asunto',
        header: 'Asunto',
        cell: ({ row }) => (
          <CeldaPrincipal
            secundario={`${row.original.mensajes.length} mensajes en el hilo`}
          >
            {row.original.asunto}
          </CeldaPrincipal>
        ),
      },
      {
        accessorKey: 'estado',
        header: 'Estado',
        cell: ({ row }) => <BadgeTicket estado={row.original.estado} />,
      },
      {
        accessorKey: 'ultimaRespuesta',
        header: 'Última respuesta',
        cell: ({ row }) => <CeldaApagada>{haceTiempo(row.original.ultimaRespuesta)}</CeldaApagada>,
      },
    ],
    []
  )

  const hayFiltros = tipo !== 'todos' || estado !== 'todos'

  return (
    <>
      <PageHeader
        titulo="Soporte con IF7SPORTS"
        descripcion="Consultas técnicas, administrativas y comerciales con la plataforma."
        acciones={
          <Button onClick={() => setModalAbierto(true)}>
            <Plus aria-hidden />
            Nueva solicitud
          </Button>
        }
      />

      <DataTable
        descripcion="Tickets de soporte con IF7SPORTS"
        columns={columns}
        data={datos}
        estado={estadoVista}
        onFilaClick={(ticket) => router.push(`/soporte/${ticket.id}`)}
        toolbar={
          <>
            <FiltroSelect
              valor={tipo}
              onValorChange={setTipo}
              ariaLabel="Filtrar por tipo"
              etiquetaTodos="Todos los tipos"
              opciones={[
                { valor: 'tecnico', etiqueta: 'Técnico' },
                { valor: 'administrativo', etiqueta: 'Administrativo' },
                { valor: 'comercial', etiqueta: 'Comercial' },
              ]}
            />

            <FiltroSelect
              valor={estado}
              onValorChange={setEstado}
              ariaLabel="Filtrar por estado"
              etiquetaTodos="Todos los estados"
              opciones={[
                { valor: 'abierto', etiqueta: 'Abierto' },
                { valor: 'en_curso', etiqueta: 'En curso' },
                { valor: 'cerrado', etiqueta: 'Cerrado' },
              ]}
            />

            <span className="ml-auto text-2xs text-apagado numeros-tabulares">
              {datos.length} {datos.length === 1 ? 'solicitud' : 'solicitudes'}
            </span>
          </>
        }
        vacio={
          <EmptyState
            ilustracion={hayFiltros ? 'busqueda' : 'lista'}
            titulo={
              hayFiltros ? 'Ninguna solicitud con estos filtros' : 'No has abierto ninguna solicitud'
            }
            descripcion={
              hayFiltros
                ? 'Prueba con otro tipo u otro estado para ver el resto del historial.'
                : 'Cuando necesites algo del equipo de IF7SPORTS, abre una solicitud y la conversación quedará registrada aquí.'
            }
            accion={
              <Button onClick={() => setModalAbierto(true)}>
                <Plus aria-hidden />
                Nueva solicitud
              </Button>
            }
            accionSecundaria={
              hayFiltros ? (
                <Button
                  variant="secundario"
                  onClick={() => {
                    setTipo('todos')
                    setEstado('todos')
                  }}
                >
                  Quitar filtros
                </Button>
              ) : undefined
            }
          />
        }
      />

      <ModalNuevaSolicitud abierto={modalAbierto} onOpenChange={setModalAbierto} />
    </>
  )
}
