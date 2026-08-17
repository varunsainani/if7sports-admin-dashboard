'use client'

import * as React from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { KeyRound, MoreHorizontal, Pencil, Plus, ShieldCheck, UserX } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { Modulo, Permisos, Usuario } from '@/lib/types'
import { useEstadoVista } from '@/lib/demo-context'
import { SIN_PERMISOS, TODOS_LOS_PERMISOS, resumirPermisos, usuarios } from '@/lib/mock-data'
import { MODULO, ORDEN_MODULO, ROL } from '@/lib/estados'
import { fechaHora } from '@/lib/formato'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, Checkbox, Switch } from '@/components/ui/controls'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page'
import { Campo, Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from '@/components/ui/toast'

/**
 * Usuarios y permisos.
 *
 * The permission matrix is the substance of this screen. It is rendered as one
 * row per module with a short line saying what the module actually lets someone
 * do, because "Reservas" on its own does not tell an owner whether they are
 * handing over the ability to cancel a booking and refund a customer.
 */

/** What granting each module actually means, in the owner's terms. */
const ALCANCE_MODULO: Record<Modulo, string> = {
  reservas: 'Ver el calendario, crear reservas manuales y cambiar su estado.',
  canchas: 'Crear y editar pistas, precios y horarios.',
  clientes: 'Consultar la ficha y el historial de cualquier cliente.',
  configuracion: 'Cambiar los datos, horarios y festivos del polideportivo.',
  metricas: 'Ver facturación, ocupación y el resto de indicadores.',
  bloqueos: 'Bloquear y liberar franjas horarias.',
  instructores: 'Dar de alta y editar fichas de instructores.',
  soporte: 'Abrir tickets con IF7SPORTS y leer las respuestas.',
}

function MatrizPermisos({
  permisos,
  onCambio,
  deshabilitada,
}: {
  permisos: Permisos
  onCambio: (permisos: Permisos) => void
  deshabilitada: boolean
}) {
  const concedidos = ORDEN_MODULO.filter((modulo) => permisos[modulo]).length
  const todos = concedidos === ORDEN_MODULO.length
  const ninguno = concedidos === 0

  return (
    <div className="rounded-lg border border-borde">
      <div className="flex items-center justify-between gap-3 border-b border-borde bg-superficie-alt px-4 py-2.5">
        <p className="etiqueta">Permisos por módulo</p>
        <div className="flex items-center gap-2.5">
          <span className="text-2xs text-apagado numeros-tabulares">
            {concedidos} de {ORDEN_MODULO.length}
          </span>
          <Checkbox
            id="permisos-todos"
            checked={todos ? true : ninguno ? false : 'indeterminate'}
            onCheckedChange={(valor) =>
              onCambio(valor === true ? { ...TODOS_LOS_PERMISOS } : { ...SIN_PERMISOS })
            }
            disabled={deshabilitada}
            aria-label="Conceder o retirar todos los módulos"
          />
        </div>
      </div>

      <ul className="divide-y divide-borde">
        {ORDEN_MODULO.map((modulo) => (
          <li key={modulo} className="flex items-start gap-3 px-4 py-2.5">
            <Checkbox
              id={`permiso-${modulo}`}
              className="mt-0.5"
              checked={permisos[modulo]}
              disabled={deshabilitada}
              onCheckedChange={(valor) => onCambio({ ...permisos, [modulo]: valor === true })}
            />
            <div className="min-w-0">
              <label
                htmlFor={`permiso-${modulo}`}
                className={cn(
                  'block cursor-pointer text-base',
                  deshabilitada ? 'text-apagado' : 'text-tinta'
                )}
              >
                {MODULO[modulo]}
              </label>
              <p className="text-xs text-apagado">{ALCANCE_MODULO[modulo]}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ModalUsuario({
  usuario,
  abierto,
  onOpenChange,
}: {
  usuario: Usuario | null
  abierto: boolean
  onOpenChange: (abierto: boolean) => void
}) {
  const editando = usuario !== null
  const [rol, setRol] = React.useState<'admin_principal' | 'colaborador'>('colaborador')
  const [permisos, setPermisos] = React.useState<Permisos>({ ...SIN_PERMISOS })

  React.useEffect(() => {
    setRol(usuario?.rol ?? 'colaborador')
    setPermisos(usuario ? { ...usuario.permisos } : { ...SIN_PERMISOS })
  }, [usuario, abierto])

  const esAdmin = rol === 'admin_principal'

  return (
    <Dialog open={abierto} onOpenChange={onOpenChange}>
      <DialogContent ancho="lg">
        <DialogHeader>
          <DialogTitle>{editando ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
          <DialogDescription>
            {editando
              ? 'Los cambios de permisos se aplican la próxima vez que la persona entre al panel.'
              : 'Se enviará una contraseña temporal al correo indicado y se pedirá cambiarla en el primer acceso.'}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="Nombre" htmlFor="usuario-nombre" requerido>
              <Input
                id="usuario-nombre"
                defaultValue={usuario?.nombre}
                placeholder="Nombre y apellidos"
              />
            </Campo>

            <Campo etiqueta="Correo electrónico" htmlFor="usuario-correo" requerido>
              <Input
                id="usuario-correo"
                type="email"
                defaultValue={usuario?.correo}
                placeholder="nombre@polideportivo.es"
              />
            </Campo>
          </div>

          <Campo etiqueta="Rol" htmlFor="usuario-rol" requerido ayuda={ROL[rol].descripcion}>
            <Select value={rol} onValueChange={(valor) => setRol(valor as typeof rol)}>
              <SelectTrigger id="usuario-rol">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin_principal">{ROL.admin_principal.etiqueta}</SelectItem>
                <SelectItem value="colaborador">{ROL.colaborador.etiqueta}</SelectItem>
              </SelectContent>
            </Select>
          </Campo>

          {esAdmin ? (
            <div className="rounded-lg border border-confirmada-borde bg-confirmada-bg px-4 py-3">
              <p className="flex items-center gap-2 text-sm text-confirmada-texto">
                <ShieldCheck className="size-4 shrink-0" aria-hidden />
                El admin principal tiene acceso a todos los módulos. No hay permisos que ajustar.
              </p>
            </div>
          ) : (
            <MatrizPermisos permisos={permisos} onCambio={setPermisos} deshabilitada={false} />
          )}
        </DialogBody>

        <DialogFooter>
          <Button variant="secundario" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false)
              toast.exito(editando ? 'Permisos guardados' : 'Usuario creado', {
                descripcion: editando
                  ? undefined
                  : 'Se ha enviado una contraseña temporal al correo indicado.',
              })
            }}
          >
            {editando ? 'Guardar cambios' : 'Crear usuario'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function UsuariosPage() {
  const estadoVista = useEstadoVista()
  const [modalAbierto, setModalAbierto] = React.useState(false)
  const [editando, setEditando] = React.useState<Usuario | null>(null)

  const datos = estadoVista === 'empty' ? [] : usuarios

  function abrirModal(usuario: Usuario | null) {
    setEditando(usuario)
    setModalAbierto(true)
  }

  const columns = React.useMemo<ColumnDef<Usuario, unknown>[]>(
    () => [
      {
        accessorKey: 'nombre',
        header: 'Usuario',
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <Avatar nombre={row.original.nombre} size="md" />
            <CeldaPrincipal secundario={row.original.correo}>{row.original.nombre}</CeldaPrincipal>
          </div>
        ),
      },
      {
        accessorKey: 'rol',
        header: 'Rol',
        cell: ({ row }) => (
          <Badge tono={row.original.rol === 'admin_principal' ? 'primario' : 'neutro'}>
            {ROL[row.original.rol].etiqueta}
          </Badge>
        ),
      },
      {
        id: 'permisos',
        header: 'Permisos',
        cell: ({ row }) => (
          <span className="text-tinta-media">{resumirPermisos(row.original)}</span>
        ),
      },
      {
        accessorKey: 'ultimoLogin',
        header: 'Último acceso',
        cell: ({ row }) =>
          row.original.ultimoLogin ? (
            <span className="numeros-tabulares text-tinta-media">
              {fechaHora(row.original.ultimoLogin)}
            </span>
          ) : (
            <CeldaApagada>Nunca ha entrado</CeldaApagada>
          ),
      },
      {
        accessorKey: 'estado',
        header: 'Estado',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Switch
              checked={row.original.estado === 'activo'}
              aria-label={`${row.original.estado === 'activo' ? 'Desactivar' : 'Activar'} a ${row.original.nombre}`}
              onCheckedChange={(valor) =>
                toast.exito(valor ? 'Usuario activado' : 'Usuario desactivado', {
                  descripcion: row.original.nombre,
                })
              }
            />
            <span className="text-xs text-apagado">
              {row.original.estado === 'activo' ? 'Activo' : 'Desactivado'}
            </span>
          </div>
        ),
      },
      {
        id: 'acciones',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end">
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
                <DropdownMenuItem onSelect={() => abrirModal(row.original)}>
                  <Pencil aria-hidden />
                  Editar permisos
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() =>
                    toast.exito('Contraseña temporal enviada', {
                      descripcion: `${row.original.correo} deberá cambiarla al entrar.`,
                    })
                  }
                >
                  <KeyRound aria-hidden />
                  Resetear contraseña
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  peligro
                  onSelect={() =>
                    toast.deshacer('Usuario desactivado', () => toast.info('Usuario reactivado'), row.original.nombre)
                  }
                >
                  <UserX aria-hidden />
                  Desactivar usuario
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    []
  )

  return (
    <>
      <PageHeader
        titulo="Usuarios y permisos"
        descripcion="Quién puede entrar al panel del polideportivo y qué módulos ve cada persona."
        acciones={
          <Button onClick={() => abrirModal(null)}>
            <Plus aria-hidden />
            Nuevo usuario
          </Button>
        }
      />

      <DataTable
        descripcion="Usuarios con acceso al panel"
        columns={columns}
        data={datos}
        estado={estadoVista}
        vacio={
          <EmptyState
            ilustracion="lista"
            titulo="Solo tú tienes acceso al panel"
            descripcion="Da de alta a un colaborador para repartir el trabajo del día a día y decidir qué módulos puede abrir."
            accion={
              <Button onClick={() => abrirModal(null)}>
                <Plus aria-hidden />
                Nuevo usuario
              </Button>
            }
          />
        }
      />

      <ModalUsuario usuario={editando} abierto={modalAbierto} onOpenChange={setModalAbierto} />
    </>
  )
}
