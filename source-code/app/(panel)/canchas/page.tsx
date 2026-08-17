'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, MoreHorizontal, Pencil, Plus, PowerOff, Search } from 'lucide-react'

import type { Cancha } from '@/lib/types'
import { useEstadoVista } from '@/lib/demo-context'
import { canchas } from '@/lib/mock-data'
import { ORDEN_TIPO_CANCHA, TIPO_CANCHA } from '@/lib/estados'
import { euros } from '@/lib/formato'
import { Button } from '@/components/ui/button'
import { BadgeEstadoCancha } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page'
import { FiltroSelect } from '@/components/ui/select'
import { CeldaNumerica, CeldaPrincipal, DataTable } from '@/components/ui/data-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from '@/components/ui/toast'

/** Lista de canchas. Name, type, base price and state, with search and filters. */
export default function CanchasPage() {
  const estadoVista = useEstadoVista()
  const router = useRouter()
  const [busqueda, setBusqueda] = React.useState('')
  const [tipo, setTipo] = React.useState('todos')
  const [estado, setEstado] = React.useState('todos')

  const datos = React.useMemo(() => {
    if (estadoVista === 'empty') return []
    return canchas.filter((cancha) => {
      if (tipo !== 'todos' && cancha.tipo !== tipo) return false
      if (estado !== 'todos' && cancha.estado !== estado) return false
      return true
    })
  }, [tipo, estado, estadoVista])

  const columns = React.useMemo<ColumnDef<Cancha, unknown>[]>(
    () => [
      {
        accessorKey: 'nombre',
        header: 'Nombre',
        cell: ({ row }) => {
          const Icono = TIPO_CANCHA[row.original.tipo].icono
          return (
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded bg-cesped-50">
                <Icono className="size-4 text-cesped-600" aria-hidden />
              </span>
              <CeldaPrincipal secundario={row.original.descripcion}>
                {row.original.nombre}
              </CeldaPrincipal>
            </div>
          )
        },
      },
      {
        accessorKey: 'tipo',
        header: 'Tipo de pista',
        cell: ({ row }) => (
          <span className="text-tinta-media">{TIPO_CANCHA[row.original.tipo].etiqueta}</span>
        ),
      },
      {
        accessorKey: 'precioBase',
        header: 'Precio base',
        cell: ({ row }) => (
          <div>
            <CeldaNumerica>{euros(row.original.precioBase)}</CeldaNumerica>
            {row.original.reglasPrecio.length > 0 && (
              <p className="text-2xs text-apagado">
                {row.original.reglasPrecio.length}{' '}
                {row.original.reglasPrecio.length === 1 ? 'regla' : 'reglas'} de precio
              </p>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'estado',
        header: 'Estado',
        cell: ({ row }) => <BadgeEstadoCancha activa={row.original.estado === 'activa'} />,
      },
      {
        id: 'acciones',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end" onClick={(evento) => evento.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="fantasma"
                  size="icono-sm"
                  aria-label={`Acciones para ${row.original.nombre}`}
                >
                  <MoreHorizontal aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <Link href={`/canchas/${row.original.id}`}>
                    <Eye aria-hidden />
                    Ver detalle
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/canchas/${row.original.id}`}>
                    <Pencil aria-hidden />
                    Editar cancha
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  peligro
                  onSelect={() =>
                    toast.deshacer(
                      row.original.estado === 'activa' ? 'Cancha desactivada' : 'Cancha activada',
                      () => toast.info('Cambio deshecho'),
                      row.original.nombre
                    )
                  }
                >
                  <PowerOff aria-hidden />
                  {row.original.estado === 'activa' ? 'Desactivar' : 'Activar'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    []
  )

  const hayFiltros = tipo !== 'todos' || estado !== 'todos' || busqueda.length > 0

  return (
    <>
      <PageHeader
        titulo="Canchas"
        descripcion="Pistas y campos del polideportivo, con su precio base y su disponibilidad."
        acciones={
          <Button
            onClick={() =>
              toast.info('Formulario de nueva cancha', {
                descripcion: 'En el prototipo esta acción abriría el alta de cancha.',
              })
            }
          >
            <Plus aria-hidden />
            Nueva cancha
          </Button>
        }
      />

      <DataTable
        descripcion="Listado de canchas del polideportivo"
        columns={columns}
        data={datos}
        estado={estadoVista}
        busqueda={busqueda}
        onFilaClick={(cancha) => router.push(`/canchas/${cancha.id}`)}
        toolbar={
          <>
            <Input
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
              placeholder="Buscar por nombre"
              aria-label="Buscar canchas por nombre"
              iconoIzquierda={<Search />}
              className="h-8 w-64 text-xs"
            />

            <FiltroSelect
              valor={tipo}
              onValorChange={setTipo}
              ariaLabel="Filtrar por tipo de pista"
              etiquetaTodos="Todos los tipos"
              opciones={ORDEN_TIPO_CANCHA.map((valor) => ({
                valor,
                etiqueta: TIPO_CANCHA[valor].etiqueta,
              }))}
            />

            <FiltroSelect
              valor={estado}
              onValorChange={setEstado}
              ariaLabel="Filtrar por estado"
              etiquetaTodos="Activas y desactivadas"
              opciones={[
                { valor: 'activa', etiqueta: 'Solo activas' },
                { valor: 'desactivada', etiqueta: 'Solo desactivadas' },
              ]}
            />

            <span className="ml-auto text-2xs text-apagado numeros-tabulares">
              {datos.length} {datos.length === 1 ? 'cancha' : 'canchas'}
            </span>
          </>
        }
        vacio={
          <EmptyState
            ilustracion={hayFiltros ? 'busqueda' : 'cancha'}
            titulo={
              hayFiltros ? 'Ninguna cancha coincide con la búsqueda' : 'Todavía no hay canchas'
            }
            descripcion={
              hayFiltros
                ? 'Prueba con otro nombre o quita los filtros para ver todas las pistas.'
                : 'Da de alta la primera pista para poder empezar a recibir reservas.'
            }
            accion={
              <Button
                onClick={() =>
                  toast.info('Formulario de nueva cancha', {
                    descripcion: 'En el prototipo esta acción abriría el alta de cancha.',
                  })
                }
              >
                <Plus aria-hidden />
                Nueva cancha
              </Button>
            }
            accionSecundaria={
              hayFiltros ? (
                <Button
                  variant="secundario"
                  onClick={() => {
                    setBusqueda('')
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
    </>
  )
}
