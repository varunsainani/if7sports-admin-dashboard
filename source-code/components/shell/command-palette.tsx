'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { CalendarDays, CornerDownLeft, Search, Trophy, Users } from 'lucide-react'

import { cn } from '@/lib/utils'
import { canchas, clientes, reservas } from '@/lib/mock-data'
import { TIPO_CANCHA, ESTADO_RESERVA } from '@/lib/estados'
import { IconoCancha } from '@/components/ui/icono-cancha'
import { euros, fechaCorta } from '@/lib/formato'
import { TODOS_LOS_ITEMS } from '@/lib/navegacion'
import { useDemo } from '@/lib/demo-context'
import { Dialog, DialogContent } from '@/components/ui/dialog'

/**
 * Global search, opened with Ctrl+K as the brief specifies.
 *
 * Results are grouped by type: reservas matched on id, client name or court;
 * clientes on name, email or phone; canchas on name. Grouping matters because
 * "Pádel 1" legitimately matches a court, a booking and nothing else, and an
 * ungrouped list would make the reader work out which is which.
 *
 * Only modules the user can actually open are searched, so a colaborador does
 * not find their way into a screen the sidebar hides from them.
 */

const LIMITE_POR_GRUPO = 5

/**
 * The palette can be opened from the keyboard or from the header's search
 * button, so its open state lives in context. The alternative, having the
 * button synthesise a Ctrl+K keystroke, works but is a lie about what the
 * click does and breaks the moment the shortcut changes.
 */
const BusquedaContext = React.createContext<{ abrir: () => void } | null>(null)

export function useBusqueda() {
  const contexto = React.useContext(BusquedaContext)
  if (!contexto) throw new Error('useBusqueda debe usarse dentro de BusquedaProvider')
  return contexto
}

export function BusquedaProvider({ children }: { children: React.ReactNode }) {
  const [abierto, setAbierto] = React.useState(false)

  const valor = React.useMemo(() => ({ abrir: () => setAbierto(true) }), [])

  return (
    <BusquedaContext.Provider value={valor}>
      {children}
      <CommandPalette abierto={abierto} setAbierto={setAbierto} />
    </BusquedaContext.Provider>
  )
}

function CommandPalette({
  abierto,
  setAbierto,
}: {
  abierto: boolean
  setAbierto: (valor: boolean) => void
}) {
  const [consulta, setConsulta] = React.useState('')
  const router = useRouter()
  const { puedeVer } = useDemo()

  React.useEffect(() => {
    function alPulsar(evento: KeyboardEvent) {
      if (evento.key === 'k' && (evento.metaKey || evento.ctrlKey)) {
        evento.preventDefault()
        setAbierto(!abierto)
      }
    }

    document.addEventListener('keydown', alPulsar)
    return () => document.removeEventListener('keydown', alPulsar)
  }, [abierto, setAbierto])

  const termino = consulta.trim().toLowerCase()

  const resultados = React.useMemo(() => {
    if (termino.length < 2) {
      return { reservas: [], clientes: [], canchas: [] }
    }

    return {
      reservas: puedeVer('reservas')
        ? reservas
            .filter(
              (r) =>
                r.id.toLowerCase().includes(termino) ||
                r.clienteNombre.toLowerCase().includes(termino) ||
                r.canchaNombre.toLowerCase().includes(termino)
            )
            .slice(0, LIMITE_POR_GRUPO)
        : [],

      clientes: puedeVer('clientes')
        ? clientes
            .filter(
              (c) =>
                c.nombre.toLowerCase().includes(termino) ||
                c.correo.toLowerCase().includes(termino) ||
                c.telefono.replace(/\s/g, '').includes(termino.replace(/\s/g, ''))
            )
            .slice(0, LIMITE_POR_GRUPO)
        : [],

      canchas: puedeVer('canchas')
        ? canchas.filter((c) => c.nombre.toLowerCase().includes(termino)).slice(0, LIMITE_POR_GRUPO)
        : [],
    }
  }, [termino, puedeVer])

  const paginas = React.useMemo(
    () => TODOS_LOS_ITEMS.filter((item) => puedeVer(item.modulo)),
    [puedeVer]
  )

  function ir(href: string) {
    setAbierto(false)
    setConsulta('')
    router.push(href)
  }

  const sinResultados =
    termino.length >= 2 &&
    resultados.reservas.length === 0 &&
    resultados.clientes.length === 0 &&
    resultados.canchas.length === 0

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogContent ancho="lg" sinCerrar className="p-0" aria-label="Búsqueda global">
        <Command
          shouldFilter={false}
          className="overflow-hidden"
          label="Buscar reservas, clientes y canchas"
        >
          <div className="flex items-center gap-3 border-b border-borde px-4">
            <Search className="size-4 shrink-0 text-cal-500" aria-hidden />
            <Command.Input
              value={consulta}
              onValueChange={setConsulta}
              placeholder="Buscar reservas, clientes o canchas"
              className={cn(
                'h-12 flex-1 bg-transparent text-md text-tinta outline-none',
                'placeholder:text-cal-500'
              )}
            />
            <kbd className="hidden shrink-0 rounded border border-borde px-1.5 py-0.5 text-2xs text-apagado sm:block">
              Esc
            </kbd>
          </div>

          <Command.List className="max-h-96 overflow-y-auto p-2">
            {termino.length < 2 && (
              <Command.Group heading="Ir a" className="[&_[cmdk-group-heading]]:etiqueta [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
                {paginas.map((item) => {
                  const Icono = item.icono
                  return (
                    <Command.Item
                      key={item.href}
                      value={item.href}
                      onSelect={() => ir(item.href)}
                      className={cn(
                        'flex cursor-pointer items-center gap-2.5 rounded px-2 py-2 text-base text-tinta',
                        'data-[selected=true]:bg-cesped-50 data-[selected=true]:text-cesped-700'
                      )}
                    >
                      <Icono className="size-4 shrink-0 text-cal-500" aria-hidden />
                      {item.etiqueta}
                    </Command.Item>
                  )
                })}
              </Command.Group>
            )}

            {sinResultados && (
              <div className="px-2 py-10 text-center">
                <p className="text-base text-tinta">Sin resultados para «{consulta}»</p>
                <p className="mt-1 text-xs text-apagado">
                  Prueba con la referencia de una reserva, el nombre de un cliente o el nombre de una cancha.
                </p>
              </div>
            )}

            {resultados.reservas.length > 0 && (
              <Command.Group
                heading="Reservas"
                className="[&_[cmdk-group-heading]]:etiqueta [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5"
              >
                {resultados.reservas.map((reserva) => (
                  <Command.Item
                    key={reserva.id}
                    value={reserva.id}
                    onSelect={() => ir(`/reservas?reserva=${reserva.id}`)}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded px-2 py-2',
                      'data-[selected=true]:bg-cesped-50'
                    )}
                  >
                    <CalendarDays className="size-4 shrink-0 text-cal-500" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base text-tinta">{reserva.clienteNombre}</p>
                      <p className="truncate text-xs text-apagado">
                        {reserva.canchaNombre} · {fechaCorta(reserva.fecha)} · {reserva.horaInicio}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-2xs text-apagado">{reserva.id}</span>
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2 py-0.5 text-2xs',
                        ESTADO_RESERVA[reserva.estado].tint
                      )}
                    >
                      {ESTADO_RESERVA[reserva.estado].etiqueta}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {resultados.clientes.length > 0 && (
              <Command.Group
                heading="Clientes"
                className="[&_[cmdk-group-heading]]:etiqueta [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5"
              >
                {resultados.clientes.map((cliente) => (
                  <Command.Item
                    key={cliente.id}
                    value={cliente.id}
                    onSelect={() => ir(`/clientes/${cliente.id}`)}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded px-2 py-2',
                      'data-[selected=true]:bg-cesped-50'
                    )}
                  >
                    <Users className="size-4 shrink-0 text-cal-500" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base text-tinta">{cliente.nombre}</p>
                      <p className="truncate text-xs text-apagado">{cliente.correo}</p>
                    </div>
                    <span className="shrink-0 text-2xs text-apagado numeros-tabulares">
                      {cliente.totalReservas} reservas
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {resultados.canchas.length > 0 && (
              <Command.Group
                heading="Canchas"
                className="[&_[cmdk-group-heading]]:etiqueta [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5"
              >
                {resultados.canchas.map((cancha) => (
                    <Command.Item
                      key={cancha.id}
                      value={cancha.id}
                      onSelect={() => ir(`/canchas/${cancha.id}`)}
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded px-2 py-2',
                        'data-[selected=true]:bg-cesped-50'
                      )}
                    >
                      <IconoCancha tipo={cancha.tipo} className="size-4 shrink-0 text-cal-500" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base text-tinta">{cancha.nombre}</p>
                        <p className="truncate text-xs text-apagado">
                          {TIPO_CANCHA[cancha.tipo].etiqueta} · desde {euros(cancha.precioBase)}
                        </p>
                      </div>
                      {cancha.estado === 'desactivada' && (
                        <span className="shrink-0 text-2xs text-apagado">Desactivada</span>
                      )}
                    </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>

          <div className="flex items-center gap-4 border-t border-borde bg-superficie-alt px-4 py-2 text-2xs text-apagado">
            <span className="flex items-center gap-1.5">
              <CornerDownLeft className="size-3" aria-hidden />
              Abrir
            </span>
            <span className="flex items-center gap-1.5">
              <Trophy className="size-3" aria-hidden />
              Busca por referencia, cliente o cancha
            </span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
