'use client'

import * as React from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus, Trash2 } from 'lucide-react'

import type { Bloqueo } from '@/lib/types'
import { useEstadoVista } from '@/lib/demo-context'
import { HOY, bloqueos, canchasActivas, instructores } from '@/lib/mock-data'
import { MOTIVO_BLOQUEO, ORDEN_MOTIVO_BLOQUEO } from '@/lib/estados'
import { fechaCorta } from '@/lib/formato'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page'
import { Campo, Input, Textarea } from '@/components/ui/input'
import { SelectorHora } from '@/components/ui/selector-hora'
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { toast } from '@/components/ui/toast'

/**
 * Bloqueos. Franjas the facility takes off the market for maintenance,
 * classes, training, academy sessions or internal events.
 *
 * The instructor field is the only place an instructor ever appears in the
 * product, and it stays optional: a maintenance closure has no instructor.
 */

function ModalNuevoBloqueo({
  abierto,
  onOpenChange,
}: {
  abierto: boolean
  onOpenChange: (abierto: boolean) => void
}) {
  const [cancha, setCancha] = React.useState('')
  const [motivo, setMotivo] = React.useState('')
  const [instructor, setInstructor] = React.useState('ninguno')
  const [horaInicio, setHoraInicio] = React.useState('18:00')
  const [horaFin, setHoraFin] = React.useState('20:00')

  return (
    <Dialog open={abierto} onOpenChange={onOpenChange}>
      <DialogContent ancho="md">
        <DialogHeader>
          <DialogTitle>Nuevo bloqueo</DialogTitle>
          <DialogDescription>
            La franja dejará de estar disponible para reservar y aparecerá marcada en el
            calendario.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-4">
          <Campo etiqueta="Cancha" htmlFor="bloqueo-cancha" requerido>
            <Select value={cancha} onValueChange={setCancha}>
              <SelectTrigger id="bloqueo-cancha">
                <SelectValue placeholder="Selecciona una cancha" />
              </SelectTrigger>
              <SelectContent>
                {canchasActivas.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Campo>

          <Campo etiqueta="Fecha" htmlFor="bloqueo-fecha" requerido>
            <Input id="bloqueo-fecha" type="date" defaultValue={HOY} />
          </Campo>

          <div className="flex flex-wrap items-end gap-4">
            <Campo etiqueta="Hora de inicio" htmlFor="bloqueo-inicio" requerido className="w-auto">
              <SelectorHora
                id="bloqueo-inicio"
                valor={horaInicio}
                onCambio={setHoraInicio}
                etiqueta="Hora de inicio del bloqueo"
              />
            </Campo>
            <Campo etiqueta="Hora de fin" htmlFor="bloqueo-fin" requerido className="w-auto">
              <SelectorHora
                id="bloqueo-fin"
                valor={horaFin}
                onCambio={setHoraFin}
                etiqueta="Hora de fin del bloqueo"
              />
            </Campo>
          </div>

          <Campo etiqueta="Motivo" htmlFor="bloqueo-motivo" requerido>
            <Select value={motivo} onValueChange={setMotivo}>
              <SelectTrigger id="bloqueo-motivo">
                <SelectValue placeholder="Selecciona un motivo" />
              </SelectTrigger>
              <SelectContent>
                {ORDEN_MOTIVO_BLOQUEO.map((valor) => (
                  <SelectItem key={valor} value={valor}>
                    {MOTIVO_BLOQUEO[valor].etiqueta}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Campo>

          <Campo
            etiqueta="Instructor asociado"
            htmlFor="bloqueo-instructor"
            ayuda="Opcional. Solo tiene sentido en clases, entrenamientos y academias."
          >
            <Select value={instructor} onValueChange={setInstructor}>
              <SelectTrigger id="bloqueo-instructor">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ninguno">Sin instructor</SelectItem>
                {instructores.map((i) => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Campo>

          <Campo etiqueta="Notas" htmlFor="bloqueo-notas">
            <Textarea
              id="bloqueo-notas"
              rows={2}
              placeholder="Visible solo para el personal del polideportivo."
            />
          </Campo>
        </DialogBody>

        <DialogFooter>
          <Button variant="secundario" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false)
              toast.exito('Bloqueo creado', {
                descripcion: 'La franja ya no admite reservas.',
              })
            }}
          >
            Crear bloqueo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function BloqueosPage() {
  const estadoVista = useEstadoVista()
  const [modalAbierto, setModalAbierto] = React.useState(false)
  const [cancha, setCancha] = React.useState('todos')
  const [motivo, setMotivo] = React.useState('todos')

  const datos = React.useMemo(() => {
    if (estadoVista === 'empty') return []
    return bloqueos.filter((bloqueo) => {
      if (cancha !== 'todos' && bloqueo.canchaId !== cancha) return false
      if (motivo !== 'todos' && bloqueo.motivo !== motivo) return false
      return true
    })
  }, [cancha, motivo, estadoVista])

  const columns = React.useMemo<ColumnDef<Bloqueo, unknown>[]>(
    () => [
      {
        accessorKey: 'fecha',
        header: 'Fecha',
        cell: ({ row }) => (
          <span className="numeros-tabulares text-tinta-media">
            {fechaCorta(row.original.fecha)}
          </span>
        ),
      },
      {
        accessorKey: 'canchaNombre',
        header: 'Cancha',
        cell: ({ row }) => <CeldaPrincipal>{row.original.canchaNombre}</CeldaPrincipal>,
      },
      {
        id: 'franja',
        header: 'Franja horaria',
        cell: ({ row }) => (
          <span className="font-mono text-sm numeros-tabulares text-tinta">
            {row.original.horaInicio} - {row.original.horaFin}
          </span>
        ),
      },
      {
        accessorKey: 'motivo',
        header: 'Motivo',
        cell: ({ row }) => {
          const config = MOTIVO_BLOQUEO[row.original.motivo]
          const Icono = config.icono
          return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cal-200 px-2 py-0.5 text-2xs text-cal-800">
              <Icono className="size-3" aria-hidden />
              {config.etiqueta}
            </span>
          )
        },
      },
      {
        accessorKey: 'instructorNombre',
        header: 'Instructor',
        cell: ({ row }) =>
          row.original.instructorNombre ? (
            <span className="text-tinta-media">{row.original.instructorNombre}</span>
          ) : (
            <CeldaApagada>Sin instructor</CeldaApagada>
          ),
      },
      {
        accessorKey: 'creadoPor',
        header: 'Creado por',
        cell: ({ row }) => <CeldaApagada>{row.original.creadoPor}</CeldaApagada>,
      },
      {
        id: 'acciones',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button
              variant="fantasma"
              size="icono-sm"
              aria-label={`Eliminar el bloqueo del ${fechaCorta(row.original.fecha)}`}
              onClick={() =>
                toast.deshacer(
                  'Bloqueo eliminado',
                  () => toast.info('Bloqueo restaurado'),
                  `${row.original.canchaNombre} · ${fechaCorta(row.original.fecha)}`
                )
              }
            >
              <Trash2 aria-hidden />
            </Button>
          </div>
        ),
      },
    ],
    []
  )

  const hayFiltros = cancha !== 'todos' || motivo !== 'todos'

  return (
    <>
      <PageHeader
        titulo="Bloqueos"
        descripcion="Franjas retiradas de la venta por mantenimiento, clases, entrenamientos, academias o eventos."
        acciones={
          <Button onClick={() => setModalAbierto(true)}>
            <Plus aria-hidden />
            Nuevo bloqueo
          </Button>
        }
      />

      <DataTable
        descripcion="Listado de franjas bloqueadas"
        columns={columns}
        data={datos}
        estado={estadoVista}
        porPagina={12}
        toolbar={
          <>
            <FiltroSelect
              valor={cancha}
              onValorChange={setCancha}
              ariaLabel="Filtrar por cancha"
              etiquetaTodos="Todas las canchas"
              opciones={canchasActivas.map((c) => ({ valor: c.id, etiqueta: c.nombre }))}
            />

            <FiltroSelect
              valor={motivo}
              onValorChange={setMotivo}
              ariaLabel="Filtrar por motivo"
              etiquetaTodos="Todos los motivos"
              opciones={ORDEN_MOTIVO_BLOQUEO.map((valor) => ({
                valor,
                etiqueta: MOTIVO_BLOQUEO[valor].etiqueta,
              }))}
            />

            <span className="ml-auto text-2xs text-apagado numeros-tabulares">
              {datos.length} {datos.length === 1 ? 'bloqueo' : 'bloqueos'}
            </span>
          </>
        }
        vacio={
          <EmptyState
            ilustracion="franja"
            titulo={hayFiltros ? 'Ningún bloqueo con estos filtros' : 'No hay franjas bloqueadas'}
            descripcion={
              hayFiltros
                ? 'Prueba con otra cancha u otro motivo para ver el resto de bloqueos.'
                : 'Bloquea una franja cuando necesites retirar una cancha del calendario por mantenimiento, una clase o un evento interno.'
            }
            accion={
              <Button onClick={() => setModalAbierto(true)}>
                <Plus aria-hidden />
                Nuevo bloqueo
              </Button>
            }
            accionSecundaria={
              hayFiltros ? (
                <Button
                  variant="secundario"
                  onClick={() => {
                    setCancha('todos')
                    setMotivo('todos')
                  }}
                >
                  Quitar filtros
                </Button>
              ) : undefined
            }
          />
        }
      />

      <ModalNuevoBloqueo abierto={modalAbierto} onOpenChange={setModalAbierto} />
    </>
  )
}
