'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, Mail, MessageCircle, MoreHorizontal, Search } from 'lucide-react'

import type { Cliente } from '@/lib/types'
import { useEstadoVista } from '@/lib/demo-context'
import { canchasActivas, clientes, reservasDeCliente } from '@/lib/mock-data'
import { ESTADO_RESERVA, ORDEN_ESTADO_RESERVA } from '@/lib/estados'
import { euros, fechaCorta } from '@/lib/formato'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page'
import { FiltroSelect } from '@/components/ui/select'
import { Avatar } from '@/components/ui/controls'
import { CeldaNumerica, CeldaPrincipal, DataTable } from '@/components/ui/data-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

/**
 * Lista de clientes.
 *
 * Terminology from the brief: everyone who has booked here appears as a
 * customer of this polideportivo, even though the same person is a user in the
 * wider IF7SPORTS ecosystem.
 */
export default function ClientesPage() {
  const estadoVista = useEstadoVista()
  const router = useRouter()
  const [busqueda, setBusqueda] = React.useState('')
  const [estadoReserva, setEstadoReserva] = React.useState('todos')
  const [cancha, setCancha] = React.useState('todos')

  const datos = React.useMemo(() => {
    if (estadoVista === 'empty') return []

    return clientes.filter((cliente) => {
      if (estadoReserva === 'todos' && cancha === 'todos') return true

      // Filtering clients by properties of their bookings, which is what the
      // brief's "estado de reserva" and "cancha reservada" filters mean here.
      const suyas = reservasDeCliente(cliente.id)
      return suyas.some((reserva) => {
        if (estadoReserva !== 'todos' && reserva.estado !== estadoReserva) return false
        if (cancha !== 'todos' && reserva.canchaId !== cancha) return false
        return true
      })
    })
  }, [estadoReserva, cancha, estadoVista])

  const columns = React.useMemo<ColumnDef<Cliente, unknown>[]>(
    () => [
      {
        accessorKey: 'nombre',
        header: 'Cliente',
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <Avatar nombre={row.original.nombre} size="md" />
            <CeldaPrincipal secundario={row.original.correo}>{row.original.nombre}</CeldaPrincipal>
          </div>
        ),
      },
      {
        accessorKey: 'telefono',
        header: 'Teléfono',
        cell: ({ row }) => (
          <span className="font-mono text-xs text-tinta-media numeros-tabulares">
            {row.original.telefono}
          </span>
        ),
      },
      {
        accessorKey: 'fechaPrimeraReserva',
        header: 'Primera reserva',
        cell: ({ row }) => (
          <span className="text-tinta-media numeros-tabulares">
            {fechaCorta(row.original.fechaPrimeraReserva)}
          </span>
        ),
      },
      {
        accessorKey: 'fechaUltimaReserva',
        header: 'Última reserva',
        cell: ({ row }) => (
          <span className="text-tinta-media numeros-tabulares">
            {fechaCorta(row.original.fechaUltimaReserva)}
          </span>
        ),
      },
      {
        accessorKey: 'totalReservas',
        header: 'Reservas',
        cell: ({ row }) => <CeldaNumerica>{row.original.totalReservas}</CeldaNumerica>,
      },
      {
        accessorKey: 'importeTotalPagado',
        header: 'Importe pagado',
        cell: ({ row }) => <CeldaNumerica>{euros(row.original.importeTotalPagado)}</CeldaNumerica>,
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
                  <Link href={`/clientes/${row.original.id}`}>
                    <Eye aria-hidden />
                    Ver detalle
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Contacto rápido</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <a href={`mailto:${row.original.correo}`}>
                    <Mail aria-hidden />
                    Enviar correo
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a
                    href={`https://wa.me/${row.original.telefono.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle aria-hidden />
                    Abrir WhatsApp
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    []
  )

  const hayFiltros = estadoReserva !== 'todos' || cancha !== 'todos' || busqueda.length > 0

  return (
    <>
      <PageHeader
        titulo="Clientes"
        descripcion="Todas las personas que han reservado en este polideportivo."
      />

      <DataTable
        descripcion="Listado de clientes del polideportivo"
        columns={columns}
        data={datos}
        estado={estadoVista}
        busqueda={busqueda}
        porPagina={12}
        onFilaClick={(cliente) => router.push(`/clientes/${cliente.id}`)}
        toolbar={
          <>
            <Input
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
              placeholder="Buscar por nombre, teléfono o correo"
              aria-label="Buscar clientes"
              iconoIzquierda={<Search />}
              className="h-8 w-72 text-xs"
            />

            <FiltroSelect
              valor={estadoReserva}
              onValorChange={setEstadoReserva}
              ariaLabel="Filtrar por estado de reserva"
              etiquetaTodos="Cualquier estado de reserva"
              opciones={ORDEN_ESTADO_RESERVA.map((valor) => ({
                valor,
                etiqueta: `Con reserva ${ESTADO_RESERVA[valor].etiqueta.toLowerCase()}`,
              }))}
            />

            <FiltroSelect
              valor={cancha}
              onValorChange={setCancha}
              ariaLabel="Filtrar por cancha reservada"
              etiquetaTodos="Cualquier cancha"
              opciones={canchasActivas.map((c) => ({ valor: c.id, etiqueta: c.nombre }))}
            />

            <span className="ml-auto text-2xs text-apagado numeros-tabulares">
              {datos.length} {datos.length === 1 ? 'cliente' : 'clientes'}
            </span>
          </>
        }
        vacio={
          <EmptyState
            ilustracion={hayFiltros ? 'busqueda' : 'lista'}
            titulo={
              hayFiltros ? 'Ningún cliente coincide con la búsqueda' : 'Todavía no hay clientes'
            }
            descripcion={
              hayFiltros
                ? 'Prueba con otro nombre, correo o teléfono, o quita los filtros.'
                : 'En cuanto alguien reserve una pista aparecerá aquí con su historial completo.'
            }
            accionSecundaria={
              hayFiltros ? (
                <Button
                  variant="secundario"
                  onClick={() => {
                    setBusqueda('')
                    setEstadoReserva('todos')
                    setCancha('todos')
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
