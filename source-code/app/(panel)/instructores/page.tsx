'use client'

import * as React from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Info, Pencil, Plus, Search } from 'lucide-react'

import type { Instructor } from '@/lib/types'
import { useEstadoVista } from '@/lib/demo-context'
import { bloqueosDeInstructor, instructores } from '@/lib/mock-data'
import { ORDEN_TIPO_INSTRUCTOR, TIPO_INSTRUCTOR } from '@/lib/estados'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/controls'
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
 * Instructores.
 *
 * The visible note at the top is required by the brief and matters: a list of
 * people inside an admin panel reads as a list of users, and these are not. An
 * instructor never logs in, has no panel, and exists only to be named on a
 * blocked franja.
 */

function ModalInstructor({
  instructor,
  abierto,
  onOpenChange,
}: {
  instructor: Instructor | null
  abierto: boolean
  onOpenChange: (abierto: boolean) => void
}) {
  const editando = instructor !== null

  return (
    <Dialog open={abierto} onOpenChange={onOpenChange}>
      <DialogContent ancho="md">
        <DialogHeader>
          <DialogTitle>{editando ? 'Editar instructor' : 'Nuevo instructor'}</DialogTitle>
          <DialogDescription>
            Ficha informativa. El instructor no recibe acceso al sistema.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-4">
          <Campo etiqueta="Nombre" htmlFor="instructor-nombre" requerido>
            <Input
              id="instructor-nombre"
              defaultValue={instructor?.nombre}
              placeholder="Nombre y apellidos"
            />
          </Campo>

          <Campo etiqueta="Tipo" htmlFor="instructor-tipo" requerido>
            <Select defaultValue={instructor?.tipo}>
              <SelectTrigger id="instructor-tipo">
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                {ORDEN_TIPO_INSTRUCTOR.map((valor) => (
                  <SelectItem key={valor} value={valor}>
                    {TIPO_INSTRUCTOR[valor]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Campo>

          <Campo etiqueta="Foto" htmlFor="instructor-foto" ayuda="JPG o PNG, hasta 2 MB.">
            <div className="flex items-center gap-4 rounded-lg border border-dashed border-borde-control bg-superficie-alt px-4 py-5">
              <Avatar nombre={instructor?.nombre ?? 'Nuevo instructor'} size="xl" />
              <div>
                <Button variant="secundario" size="sm" type="button">
                  Subir una foto
                </Button>
                <p className="mt-1.5 text-2xs text-apagado">
                  Sin foto se muestran las iniciales del nombre.
                </p>
              </div>
            </div>
          </Campo>

          <Campo etiqueta="Notas internas" htmlFor="instructor-notas">
            <Textarea
              id="instructor-notas"
              rows={3}
              defaultValue={instructor?.notasInternas}
              placeholder="Horarios habituales, grupos que lleva, contacto de referencia."
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
              toast.exito(editando ? 'Instructor actualizado' : 'Instructor creado')
            }}
          >
            {editando ? 'Guardar cambios' : 'Crear instructor'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function InstructoresPage() {
  const estadoVista = useEstadoVista()
  const [busqueda, setBusqueda] = React.useState('')
  const [tipo, setTipo] = React.useState('todos')
  const [modalAbierto, setModalAbierto] = React.useState(false)
  const [editando, setEditando] = React.useState<Instructor | null>(null)

  const datos = React.useMemo(() => {
    if (estadoVista === 'empty') return []
    return instructores.filter((i) => tipo === 'todos' || i.tipo === tipo)
  }, [tipo, estadoVista])

  function abrirModal(instructor: Instructor | null) {
    setEditando(instructor)
    setModalAbierto(true)
  }

  const columns = React.useMemo<ColumnDef<Instructor, unknown>[]>(
    () => [
      {
        accessorKey: 'nombre',
        header: 'Instructor',
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <Avatar nombre={row.original.nombre} size="md" />
            <CeldaPrincipal>{row.original.nombre}</CeldaPrincipal>
          </div>
        ),
      },
      {
        accessorKey: 'tipo',
        header: 'Tipo',
        cell: ({ row }) => (
          <span className="rounded-full bg-cal-200 px-2 py-0.5 text-2xs text-cal-800">
            {TIPO_INSTRUCTOR[row.original.tipo]}
          </span>
        ),
      },
      {
        id: 'franjas',
        header: 'Franjas asociadas',
        cell: ({ row }) => {
          const total = bloqueosDeInstructor(row.original.id).length
          return total > 0 ? (
            <span className="numeros-tabulares text-tinta-media">
              {total} {total === 1 ? 'bloqueo' : 'bloqueos'}
            </span>
          ) : (
            <CeldaApagada>Ninguna</CeldaApagada>
          )
        },
      },
      {
        accessorKey: 'notasInternas',
        header: 'Notas internas',
        cell: ({ row }) => (
          <span className="line-clamp-1 max-w-md text-xs text-apagado">
            {row.original.notasInternas || 'Sin notas'}
          </span>
        ),
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
              aria-label={`Editar a ${row.original.nombre}`}
              onClick={() => abrirModal(row.original)}
            >
              <Pencil aria-hidden />
            </Button>
          </div>
        ),
      },
    ],
    []
  )

  return (
    <>
      <PageHeader
        titulo="Instructores"
        descripcion="Personas que imparten clases, entrenamientos y actividades en el polideportivo."
        acciones={
          <Button onClick={() => abrirModal(null)}>
            <Plus aria-hidden />
            Nuevo instructor
          </Button>
        }
      />

      {/* Required by the brief, and genuinely needed: a people list inside an
          admin panel reads as a list of users unless it says otherwise. */}
      <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-completada-borde bg-completada-bg px-4 py-3">
        <Info className="mt-0.5 size-4 shrink-0 text-completada-texto" aria-hidden />
        <p className="text-sm text-completada-texto">
          Los instructores son referencia informativa. No tienen acceso al sistema ni panel propio.
          Solo aparecen asociados a franjas bloqueadas.
        </p>
      </div>

      <DataTable
        descripcion="Listado de instructores"
        columns={columns}
        data={datos}
        estado={estadoVista}
        busqueda={busqueda}
        toolbar={
          <>
            <Input
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
              placeholder="Buscar por nombre"
              aria-label="Buscar instructores"
              iconoIzquierda={<Search />}
              className="h-8 w-64 text-xs"
            />

            <FiltroSelect
              valor={tipo}
              onValorChange={setTipo}
              ariaLabel="Filtrar por tipo"
              etiquetaTodos="Todos los tipos"
              opciones={ORDEN_TIPO_INSTRUCTOR.map((valor) => ({
                valor,
                etiqueta: TIPO_INSTRUCTOR[valor],
              }))}
            />

            <span className="ml-auto text-2xs text-apagado numeros-tabulares">
              {datos.length} {datos.length === 1 ? 'instructor' : 'instructores'}
            </span>
          </>
        }
        vacio={
          <EmptyState
            ilustracion="lista"
            titulo="Todavía no hay instructores"
            descripcion="Da de alta a los monitores y entrenadores para poder asociarlos a las franjas que bloquees."
            accion={
              <Button onClick={() => abrirModal(null)}>
                <Plus aria-hidden />
                Nuevo instructor
              </Button>
            }
          />
        }
      />

      <ModalInstructor
        instructor={editando}
        abierto={modalAbierto}
        onOpenChange={setModalAbierto}
      />
    </>
  )
}
