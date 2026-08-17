'use client'

import * as React from 'react'
import Link from 'next/link'
import { notFound, useParams } from 'next/navigation'
import { ArrowLeft, ImagePlus, Plus, Save, Trash2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useEstadoVista } from '@/lib/demo-context'
import { bloqueos, canchaPorId, polideportivo } from '@/lib/mock-data'
import { DIAS_SEMANA, MOTIVO_BLOQUEO, ORDEN_TIPO_CANCHA, TIPO_CANCHA } from '@/lib/estados'
import { IconoCancha } from '@/components/ui/icono-cancha'
import { euros, fechaCorta } from '@/lib/formato'
import { Button } from '@/components/ui/button'
import { BadgeEstadoCancha } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/controls'
import { Campo, Input, Textarea } from '@/components/ui/input'
import { SelectorHora } from '@/components/ui/selector-hora'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader, PageHeaderSkeleton, Section } from '@/components/ui/page'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsCount, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/components/ui/toast'

/**
 * Detalle y edición de cancha, organised in the four tabs the brief names.
 *
 * Schedules and closures both note where they override the facility's general
 * hours, because a court that quietly closes earlier than the building is the
 * kind of thing that produces an angry phone call.
 */
export default function CanchaDetallePage() {
  const params = useParams<{ id: string }>()
  const estadoVista = useEstadoVista()
  const cancha = canchaPorId(params.id)

  if (!cancha) notFound()

  const cierres = bloqueos.filter((b) => b.canchaId === cancha.id).slice(0, 8)
  const [apertura, setApertura] = React.useState(cancha.horaApertura)
  const [cierre, setCierre] = React.useState(cancha.horaCierre)
  const cargando = estadoVista === 'loading'
  const vacio = estadoVista === 'empty'

  if (cargando) {
    return (
      <>
        <PageHeaderSkeleton />
        <Skeleton className="h-10 w-full" />
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </>
    )
  }

  return (
    <>
      <Button variant="enlace" size="sm" asChild className="mb-3">
        <Link href="/canchas">
          <ArrowLeft aria-hidden />
          Volver a canchas
        </Link>
      </Button>

      <PageHeader
        titulo={cancha.nombre}
        descripcion={cancha.descripcion}
        acciones={
          <>
            <BadgeEstadoCancha activa={cancha.estado === 'activa'} />
            <Button onClick={() => toast.exito('Cambios guardados', { descripcion: cancha.nombre })}>
              <Save aria-hidden />
              Guardar cambios
            </Button>
          </>
        }
      />

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="horarios">Horarios</TabsTrigger>
          <TabsTrigger value="precios">
            Precios
            {!vacio && cancha.reglasPrecio.length > 0 && (
              <TabsCount>{cancha.reglasPrecio.length}</TabsCount>
            )}
          </TabsTrigger>
          <TabsTrigger value="cierres">
            Cierres puntuales
            {!vacio && cierres.length > 0 && <TabsCount>{cierres.length}</TabsCount>}
          </TabsTrigger>
        </TabsList>

        {/* ------------------------------------------------------- general */}
        <TabsContent value="general">
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              <Campo etiqueta="Nombre" htmlFor="cancha-nombre" requerido>
                <Input id="cancha-nombre" defaultValue={cancha.nombre} />
              </Campo>

              <Campo etiqueta="Tipo de pista" htmlFor="cancha-tipo" requerido>
                <Select defaultValue={cancha.tipo}>
                  <SelectTrigger id="cancha-tipo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDEN_TIPO_CANCHA.map((valor) => (
                      <SelectItem key={valor} value={valor}>
                        {TIPO_CANCHA[valor].etiqueta}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Campo>

              <Campo
                etiqueta="Descripción"
                htmlFor="cancha-descripcion"
                ayuda="La ven los clientes al elegir cancha."
              >
                <Textarea id="cancha-descripcion" rows={3} defaultValue={cancha.descripcion} />
              </Campo>
            </div>

            <div>
              <p className="etiqueta mb-2">Imágenes</p>
              <div className="space-y-2">
                {cancha.imagenes.map((imagen) => (
                  <div
                    key={imagen}
                    className="overflow-hidden rounded-lg border border-borde bg-superficie"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagen}
                      alt={`Fotografía de ${cancha.nombre}`}
                      className="h-32 w-full object-cover"
                    />
                    <div className="flex items-center gap-2 border-t border-borde px-3 py-2">
                      <IconoCancha tipo={cancha.tipo} className="size-3.5 shrink-0 text-cal-500" />
                      <span className="min-w-0 flex-1 truncate text-xs text-tinta-media">
                        {imagen.split('/').pop()}
                      </span>
                      <Button variant="fantasma" size="icono-sm" aria-label="Eliminar imagen">
                        <Trash2 aria-hidden />
                      </Button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  className={cn(
                    'flex w-full flex-col items-center gap-1.5 rounded-lg border border-dashed',
                    'border-borde-control bg-superficie-alt px-4 py-6',
                    'transition-colors duration-rapida hover:border-primario hover:bg-cesped-50'
                  )}
                >
                  <ImagePlus className="size-5 text-cal-500" aria-hidden />
                  <span className="text-xs text-tinta-media">Arrastra una imagen o pulsa aquí</span>
                  <span className="text-2xs text-apagado">JPG o PNG, hasta 5 MB</span>
                </button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ------------------------------------------------------ horarios */}
        <TabsContent value="horarios">
          <Section
            titulo="Días abiertos"
            descripcion="Marca los días en los que esta cancha admite reservas."
          >
            <div className="flex flex-wrap gap-2">
              {DIAS_SEMANA.map((dia) => {
                const abierto = cancha.diasAbiertos.includes(dia.valor)
                return (
                  <label
                    key={dia.valor}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded border px-3 py-2 text-sm',
                      'transition-colors duration-rapida',
                      abierto
                        ? 'border-primario bg-cesped-50 text-cesped-700'
                        : 'border-borde text-apagado hover:border-cal-500'
                    )}
                  >
                    <Checkbox defaultChecked={abierto} aria-label={dia.largo} />
                    {dia.largo}
                  </label>
                )
              })}
            </div>
          </Section>

          <Section titulo="Horario de la cancha">
            <div className="flex flex-wrap items-end gap-4">
              <Campo etiqueta="Hora de apertura" htmlFor="cancha-apertura" className="w-auto">
                <SelectorHora
                  id="cancha-apertura"
                  valor={apertura}
                  onCambio={setApertura}
                  etiqueta="Hora de apertura de la cancha"
                />
              </Campo>
              <Campo etiqueta="Hora de cierre" htmlFor="cancha-cierre" className="w-auto">
                <SelectorHora
                  id="cancha-cierre"
                  valor={cierre}
                  onCambio={setCierre}
                  etiqueta="Hora de cierre de la cancha"
                />
              </Campo>
            </div>

            <div className="mt-4 rounded-lg border border-completada-borde bg-completada-bg px-4 py-3">
              <p className="text-sm text-completada-texto">
                {cancha.excepcionHorario ? (
                  <>
                    <span className="font-medium">Excepción sobre el horario general.</span>{' '}
                    {cancha.excepcionHorario}
                  </>
                ) : (
                  <>
                    Sigue el horario general del polideportivo, de{' '}
                    {polideportivo.horarios[0].apertura} a {polideportivo.horarios[0].cierre} entre
                    semana. Cambiar estas horas crea una excepción solo para esta cancha.
                  </>
                )}
              </p>
            </div>
          </Section>
        </TabsContent>

        {/* ------------------------------------------------------- precios */}
        <TabsContent value="precios">
          <Section titulo="Precio base">
            <div className="max-w-xs">
              <Campo
                etiqueta="Precio por franja"
                htmlFor="cancha-precio"
                ayuda="Se aplica cuando ninguna regla coincide."
              >
                <Input
                  id="cancha-precio"
                  type="number"
                  defaultValue={cancha.precioBase}
                  iconoDerecha={<span className="text-xs">€</span>}
                />
              </Campo>
            </div>
          </Section>

          <Section
            titulo="Reglas dinámicas"
            descripcion="Por franja horaria, día de la semana o temporada. La primera que coincide gana."
            acciones={
              <Button
                size="sm"
                variant="secundario"
                onClick={() => toast.info('Formulario de nueva regla de precio')}
              >
                <Plus aria-hidden />
                Nueva regla
              </Button>
            }
          >
            {vacio || cancha.reglasPrecio.length === 0 ? (
              <div className="rounded-lg border border-borde bg-superficie">
                <EmptyState
                  compacto
                  ilustracion="cuadrante"
                  titulo="Sin reglas de precio"
                  descripcion="Esta cancha cobra siempre el precio base. Añade una regla para subir el precio en las horas de más demanda."
                  accion={
                    <Button onClick={() => toast.info('Formulario de nueva regla de precio')}>
                      <Plus aria-hidden />
                      Nueva regla
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-borde bg-superficie">
                <table className="w-full text-sm">
                  <caption className="sr-only">Reglas de precio de {cancha.nombre}</caption>
                  <thead className="border-b border-borde bg-superficie-alt">
                    <tr>
                      {['Descripción', 'Días', 'Franja', 'Temporada', 'Precio', ''].map((h) => (
                        <th key={h} scope="col" className="etiqueta px-4 py-2.5 text-left">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cancha.reglasPrecio.map((regla) => (
                      <tr key={regla.id} className="border-b border-borde last:border-0">
                        <td className="px-4 py-3 text-tinta">{regla.descripcion}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-0.5">
                            {DIAS_SEMANA.map((dia) => {
                              const activo =
                                regla.dias.length === 0 || regla.dias.includes(dia.valor)
                              return (
                                <span
                                  key={dia.valor}
                                  className={cn(
                                    'flex size-5 items-center justify-center rounded-sm font-mono text-[10px]',
                                    activo
                                      ? 'bg-cesped-100 text-cesped-700'
                                      : 'bg-cal-100 text-cal-400'
                                  )}
                                  title={dia.largo}
                                >
                                  {dia.corto}
                                </span>
                              )
                            })}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-tinta-media numeros-tabulares">
                          {regla.horaInicio} - {regla.horaFin}
                        </td>
                        <td className="px-4 py-3 text-xs text-apagado">
                          {regla.temporada ?? 'Todo el año'}
                        </td>
                        <td className="px-4 py-3 font-mono text-sm text-tinta numeros-tabulares">
                          {euros(regla.precio)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="fantasma"
                            size="icono-sm"
                            aria-label={`Eliminar la regla ${regla.descripcion}`}
                            onClick={() =>
                              toast.deshacer('Regla eliminada', () =>
                                toast.info('Regla restaurada')
                              )
                            }
                          >
                            <Trash2 aria-hidden />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
        </TabsContent>

        {/* ------------------------------------------------------- cierres */}
        <TabsContent value="cierres">
          <Section
            titulo="Cierres puntuales"
            descripcion="Franjas en las que esta cancha no admite reservas."
            acciones={
              <Button size="sm" variant="secundario" asChild>
                <Link href="/bloqueos">
                  <Plus aria-hidden />
                  Nuevo cierre
                </Link>
              </Button>
            }
          >
            {vacio || cierres.length === 0 ? (
              <div className="rounded-lg border border-borde bg-superficie">
                <EmptyState
                  compacto
                  ilustracion="franja"
                  titulo="Sin cierres programados"
                  descripcion="Esta cancha está disponible en todo su horario. Programa un cierre cuando necesites cerrarla por mantenimiento o por una clase."
                  accion={
                    <Button asChild>
                      <Link href="/bloqueos">
                        <Plus aria-hidden />
                        Nuevo cierre
                      </Link>
                    </Button>
                  }
                />
              </div>
            ) : (
              <ul className="divide-y divide-borde overflow-hidden rounded-lg border border-borde bg-superficie">
                {cierres.map((cierre) => {
                  const config = MOTIVO_BLOQUEO[cierre.motivo]
                  const IconoMotivo = config.icono

                  return (
                    <li key={cierre.id} className="flex items-center gap-4 px-4 py-3">
                      <span className="trama-bloqueo flex size-9 shrink-0 items-center justify-center rounded border border-borde-fuerte">
                        <IconoMotivo className="size-4 text-bloqueo-texto" aria-hidden />
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="text-base text-tinta">{config.etiqueta}</p>
                        <p className="text-xs text-apagado numeros-tabulares">
                          {fechaCorta(cierre.fecha)} · {cierre.horaInicio} a {cierre.horaFin}
                        </p>
                      </div>

                      {cierre.instructorNombre && (
                        <span className="shrink-0 rounded-full bg-cal-200 px-2 py-0.5 text-2xs text-cal-800">
                          {cierre.instructorNombre}
                        </span>
                      )}

                      <Button
                        variant="fantasma"
                        size="icono-sm"
                        aria-label={`Eliminar el cierre del ${fechaCorta(cierre.fecha)}`}
                        onClick={() =>
                          toast.deshacer('Cierre eliminado', () => toast.info('Cierre restaurado'))
                        }
                      >
                        <Trash2 aria-hidden />
                      </Button>
                    </li>
                  )
                })}
              </ul>
            )}
          </Section>
        </TabsContent>
      </Tabs>
    </>
  )
}
