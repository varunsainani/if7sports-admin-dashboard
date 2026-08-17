'use client'

import * as React from 'react'
import { ImagePlus, MapPin, Plus, Save, Trash2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useEstadoVista } from '@/lib/demo-context'
import { polideportivo } from '@/lib/mock-data'
import { DIAS_SEMANA } from '@/lib/estados'
import { fechaHora, fechaLarga } from '@/lib/formato'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/controls'
import { Campo, Input } from '@/components/ui/input'
import { SelectorHora } from '@/components/ui/selector-hora'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PageHeaderSkeleton, Section } from '@/components/ui/page'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/ui/page'
import { toast } from '@/components/ui/toast'

/**
 * Configuración del polideportivo.
 *
 * The save affordance sits in the header and states when the settings were last
 * changed, because on a screen this long the alternative is scrolling to the
 * bottom to find out whether anything was saved.
 */

/** Static map stand-in. Drawing the pin ourselves keeps the page self-contained. */
function SelectorMapa() {
  return (
    <div className="relative overflow-hidden rounded-lg border border-borde bg-cal-100">
      <svg viewBox="0 0 400 180" className="h-44 w-full" aria-hidden>
        {/* street grid */}
        {[30, 70, 110, 150].map((y) => (
          <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="var(--cal-300)" strokeWidth="6" />
        ))}
        {[60, 140, 220, 300, 360].map((x) => (
          <line key={x} x1={x} y1="0" x2={x} y2="180" stroke="var(--cal-300)" strokeWidth="6" />
        ))}
        {/* blocks */}
        {[
          [70, 40, 60, 20],
          [150, 80, 60, 20],
          [230, 40, 60, 20],
          [310, 120, 40, 20],
        ].map(([x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} fill="var(--cal-200)" rx="2" />
        ))}
        {/* the facility */}
        <rect x="150" y="40" width="60" height="30" fill="var(--cesped-200)" rx="2" />
      </svg>

      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
        <MapPin className="size-7 fill-cesped-500 text-cesped-800" aria-hidden />
      </span>

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 border-t border-borde bg-superficie/95 px-3 py-2 backdrop-blur">
        <p className="font-mono text-2xs text-tinta-media numeros-tabulares">
          {polideportivo.latitud}, {polideportivo.longitud}
        </p>
        <Button variant="secundario" size="sm">
          Ajustar ubicación
        </Button>
      </div>
    </div>
  )
}

export default function ConfiguracionPage() {
  const estadoVista = useEstadoVista()
  const [horarios, setHorarios] = React.useState(polideportivo.horarios)

  if (estadoVista === 'loading') {
    return (
      <>
        <PageHeaderSkeleton />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader
        titulo="Configuración del polideportivo"
        descripcion={`Última modificación el ${fechaHora(polideportivo.ultimaModificacion)}.`}
        acciones={
          <Button onClick={() => toast.exito('Cambios guardados')}>
            <Save aria-hidden />
            Guardar cambios
          </Button>
        }
      />

      {/* --------------------------------------------------- general data */}
      <Section titulo="Datos generales">
        <Card>
          <CardContent className="grid gap-5 pt-5 lg:grid-cols-2">
            <div className="space-y-4">
              <Campo etiqueta="Nombre del polideportivo" htmlFor="config-nombre" requerido>
                <Input id="config-nombre" defaultValue={polideportivo.nombre} />
              </Campo>

              <Campo etiqueta="Dirección" htmlFor="config-direccion" requerido>
                <Input id="config-direccion" defaultValue={polideportivo.direccion} />
              </Campo>

              <div className="grid gap-4 sm:grid-cols-2">
                <Campo etiqueta="Teléfono" htmlFor="config-telefono">
                  <Input id="config-telefono" type="tel" defaultValue={polideportivo.telefono} />
                </Campo>
                <Campo etiqueta="Correo de reservas" htmlFor="config-correo">
                  <Input id="config-correo" type="email" defaultValue={polideportivo.correo} />
                </Campo>
              </div>
            </div>

            <div>
              <p className="etiqueta mb-2">Ubicación</p>
              <SelectorMapa />
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* ----------------------------------------------------------- images */}
      <Section titulo="Imágenes" descripcion="Las ven los clientes al buscar el polideportivo.">
        <Card>
          <CardContent className="grid gap-3 pt-5 sm:grid-cols-2 lg:grid-cols-4">
            {polideportivo.imagenes.map((imagen) => (
              <div
                key={imagen}
                className="group relative overflow-hidden rounded-lg border border-borde bg-cal-100"
              >
                <div className="flex h-28 items-center justify-center">
                  <ImagePlus className="size-6 text-cal-400" aria-hidden />
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-borde bg-superficie px-2.5 py-1.5">
                  <span className="truncate text-2xs text-apagado">
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
                'flex h-full min-h-40 flex-col items-center justify-center gap-1.5 rounded-lg',
                'border border-dashed border-borde-control bg-superficie-alt',
                'transition-colors duration-rapida hover:border-primario hover:bg-cesped-50'
              )}
            >
              <ImagePlus className="size-5 text-cal-500" aria-hidden />
              <span className="text-xs text-tinta-media">Añadir imagen</span>
              <span className="text-2xs text-apagado">JPG o PNG, hasta 5 MB</span>
            </button>
          </CardContent>
        </Card>
      </Section>

      {/* ----------------------------------------------------------- hours */}
      <Section
        titulo="Horarios de apertura"
        descripcion="Se aplican a todas las canchas salvo que una defina su propia excepción."
      >
        <Card>
          <ul className="divide-y divide-borde">
            {horarios.map((horario) => {
              const dia = DIAS_SEMANA[horario.dia - 1]

              return (
                <li key={horario.dia} className="flex flex-wrap items-center gap-4 px-5 py-3">
                  <span className="w-28 shrink-0 text-base text-tinta">{dia.largo}</span>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={horario.abierto}
                      aria-label={`${dia.largo}: ${horario.abierto ? 'abierto' : 'cerrado'}`}
                      onCheckedChange={(valor) =>
                        setHorarios((actual) =>
                          actual.map((h) => (h.dia === horario.dia ? { ...h, abierto: valor } : h))
                        )
                      }
                    />
                    <span className="w-16 text-xs text-apagado">
                      {horario.abierto ? 'Abierto' : 'Cerrado'}
                    </span>
                  </div>

                  {horario.abierto ? (
                    <div className="flex items-center gap-2">
                      {/* Controlled, and written to the same state the toggle
                          uses. Uncontrolled fields lost every typed edit as
                          soon as the day was switched off and back on. */}
                      <SelectorHora
                        valor={horario.apertura}
                        onCambio={(valor) =>
                          setHorarios((actual) =>
                            actual.map((h) =>
                              h.dia === horario.dia ? { ...h, apertura: valor } : h
                            )
                          )
                        }
                        etiqueta={`Hora de apertura del ${dia.largo}`}
                      />
                      <span className="text-xs text-apagado">a</span>
                      <SelectorHora
                        valor={horario.cierre}
                        onCambio={(valor) =>
                          setHorarios((actual) =>
                            actual.map((h) => (h.dia === horario.dia ? { ...h, cierre: valor } : h))
                          )
                        }
                        etiqueta={`Hora de cierre del ${dia.largo}`}
                      />
                    </div>
                  ) : (
                    <span className="text-xs text-apagado">
                      No se admiten reservas este día.
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        </Card>
      </Section>

      {/* ------------------------------------------------------- holidays */}
      <Section
        titulo="Festivos y cierres puntuales"
        descripcion="Días del año con cierre completo o con horario reducido."
        acciones={
          <Button variant="secundario" size="sm" onClick={() => toast.info('Formulario de nuevo festivo')}>
            <Plus aria-hidden />
            Añadir festivo
          </Button>
        }
      >
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="text-base">Calendario anual 2026</CardTitle>
              <CardDescription>
                {polideportivo.festivos.filter((f) => f.tipo === 'cerrado').length} días cerrados y{' '}
                {polideportivo.festivos.filter((f) => f.tipo === 'horario_especial').length} con
                horario especial.
              </CardDescription>
            </div>
          </CardHeader>

          <ul className="divide-y divide-borde border-t border-borde">
            {polideportivo.festivos.map((festivo) => (
              <li key={festivo.id} className="flex flex-wrap items-center gap-4 px-5 py-3">
                <span
                  className={cn(
                    'flex size-9 shrink-0 flex-col items-center justify-center rounded border font-mono text-[10px] leading-none',
                    festivo.tipo === 'cerrado'
                      ? 'border-cancelada-borde bg-cancelada-bg text-cancelada-texto'
                      : 'border-pendiente-borde bg-pendiente-bg text-pendiente-texto'
                  )}
                >
                  <span className="text-xs font-semibold">{festivo.fecha.slice(8, 10)}</span>
                  <span>{festivo.fecha.slice(5, 7)}</span>
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-base text-tinta">{festivo.nombre}</p>
                  <p className="text-xs text-apagado">{fechaLarga(festivo.fecha)}</p>
                </div>

                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-2xs',
                    festivo.tipo === 'cerrado'
                      ? 'bg-cancelada-bg text-cancelada-texto'
                      : 'bg-pendiente-bg text-pendiente-texto'
                  )}
                >
                  {festivo.tipo === 'cerrado'
                    ? 'Cerrado todo el día'
                    : `Abierto de ${festivo.apertura} a ${festivo.cierre}`}
                </span>

                <Button
                  variant="fantasma"
                  size="icono-sm"
                  aria-label={`Eliminar ${festivo.nombre}`}
                  onClick={() =>
                    toast.deshacer('Festivo eliminado', () => toast.info('Festivo restaurado'), festivo.nombre)
                  }
                >
                  <Trash2 aria-hidden />
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      </Section>
    </>
  )
}
