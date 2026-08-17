'use client'

import * as React from 'react'
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsUpDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from './button'
import { SkeletonTabla } from './skeleton'

/**
 * The data table used on canchas, clientes, bloqueos, instructores, usuarios
 * and soporte. Sorting, filtering and pagination come from TanStack Table.
 *
 * The three states the brief requires for every screen are a prop rather than
 * a separate component, so a reviewer can flip between them without the layout
 * shifting underneath.
 */

export interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[]
  data: TData[]
  estado?: 'default' | 'loading' | 'empty'
  /** Rendered in place of the table body when there is nothing to show. */
  vacio: React.ReactNode
  /** Toolbar contents: search field, filter selects. */
  toolbar?: React.ReactNode
  /** Value driving the built-in global filter. */
  busqueda?: string
  onFilaClick?: (fila: TData) => void
  /** Rows per page. The brief's tables are all well under a thousand rows. */
  porPagina?: number
  className?: string
  /** Accessible name for the table, since the caption is visually hidden. */
  descripcion: string
}

export function DataTable<TData>({
  columns,
  data,
  estado = 'default',
  vacio,
  toolbar,
  busqueda = '',
  onFilaClick,
  porPagina = 10,
  className,
  descripcion,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter: busqueda },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: porPagina } },
  })

  const filas = table.getRowModel().rows
  const sinResultados = estado === 'empty' || filas.length === 0
  const cargando = estado === 'loading'

  return (
    <div className={cn('rounded-lg border border-borde bg-superficie', className)}>
      {toolbar && (
        <div className="flex flex-wrap items-center gap-3 border-b border-borde px-4 py-3">
          {toolbar}
        </div>
      )}

      {cargando ? (
        <SkeletonTabla filas={porPagina} columnas={columns.length} />
      ) : sinResultados ? (
        vacio
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">{descripcion}</caption>
            <thead>
              {table.getHeaderGroups().map((grupo) => (
                <tr key={grupo.id} className="border-b border-borde bg-superficie-alt">
                  {grupo.headers.map((header) => {
                    const puedeOrdenar = header.column.getCanSort()
                    const orden = header.column.getIsSorted()

                    return (
                      <th
                        key={header.id}
                        scope="col"
                        aria-sort={
                          orden === 'asc'
                            ? 'ascending'
                            : orden === 'desc'
                              ? 'descending'
                              : puedeOrdenar
                                ? 'none'
                                : undefined
                        }
                        className="whitespace-nowrap px-4 py-2.5 text-left"
                      >
                        {header.isPlaceholder ? null : puedeOrdenar ? (
                          <button
                            type="button"
                            onClick={header.column.getToggleSortingHandler()}
                            className={cn(
                              'etiqueta inline-flex items-center gap-1.5 rounded',
                              'transition-colors duration-rapida hover:text-tinta',
                              orden && 'text-tinta'
                            )}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {orden === 'asc' ? (
                              <ArrowUp className="size-3" aria-hidden />
                            ) : orden === 'desc' ? (
                              <ArrowDown className="size-3" aria-hidden />
                            ) : (
                              <ChevronsUpDown className="size-3 opacity-40" aria-hidden />
                            )}
                          </button>
                        ) : (
                          <span className="etiqueta">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </span>
                        )}
                      </th>
                    )
                  })}
                </tr>
              ))}
            </thead>

            <tbody>
              {filas.map((fila) => (
                <tr
                  key={fila.id}
                  onClick={onFilaClick ? () => onFilaClick(fila.original) : undefined}
                  tabIndex={onFilaClick ? 0 : undefined}
                  onKeyDown={
                    onFilaClick
                      ? (evento) => {
                          if (evento.key === 'Enter' || evento.key === ' ') {
                            evento.preventDefault()
                            onFilaClick(fila.original)
                          }
                        }
                      : undefined
                  }
                  className={cn(
                    'border-b border-borde last:border-0 transition-colors duration-rapida',
                    onFilaClick && 'cursor-pointer hover:bg-cesped-50 focus-visible:bg-cesped-50'
                  )}
                >
                  {fila.getVisibleCells().map((celda) => (
                    <td key={celda.id} className="px-4 py-3 align-middle text-tinta">
                      {flexRender(celda.column.columnDef.cell, celda.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!cargando && !sinResultados && table.getPageCount() > 1 && (
        <Paginacion table={table} />
      )}
    </div>
  )
}

/* ------------------------------------------------------------- pagination */

function Paginacion<TData>({ table }: { table: ReturnType<typeof useReactTable<TData>> }) {
  const paginaActual = table.getState().pagination.pageIndex + 1
  const totalPaginas = table.getPageCount()
  const totalFilas = table.getFilteredRowModel().rows.length
  const tamano = table.getState().pagination.pageSize
  const desde = table.getState().pagination.pageIndex * tamano + 1
  const hasta = Math.min(desde + tamano - 1, totalFilas)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-borde px-4 py-3">
      <p className="text-xs text-apagado numeros-tabulares">
        Mostrando {desde} a {hasta} de {totalFilas}
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="secundario"
          size="icono-sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          aria-label="Página anterior"
        >
          <ChevronLeft aria-hidden />
        </Button>

        <span className="px-1 text-xs text-tinta-media numeros-tabulares">
          Página {paginaActual} de {totalPaginas}
        </span>

        <Button
          variant="secundario"
          size="icono-sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          aria-label="Página siguiente"
        >
          <ChevronRight aria-hidden />
        </Button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------ cell helpers
   Shared renderers so money, dates and secondary lines look identical in every
   table rather than being restyled per screen. */

export function CeldaPrincipal({
  children,
  secundario,
}: {
  children: React.ReactNode
  secundario?: React.ReactNode
}) {
  return (
    <div className="min-w-0">
      <div className="truncate font-medium text-tinta">{children}</div>
      {secundario && <div className="truncate text-xs text-apagado">{secundario}</div>}
    </div>
  )
}

export function CeldaNumerica({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-sm numeros-tabulares text-tinta">{children}</span>
}

export function CeldaApagada({ children }: { children: React.ReactNode }) {
  return <span className="text-apagado">{children}</span>
}
