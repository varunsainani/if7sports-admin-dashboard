'use client'

import * as React from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Download, FileText, Table2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { EstadoReserva } from '@/lib/types'
import { useEstadoVista } from '@/lib/demo-context'
import { HOY, RANGOS, calcularMetricas, desplazarDias } from '@/lib/mock-data'
import { DIAS_SEMANA, ESTADO_RESERVA, ORDEN_ESTADO_RESERVA } from '@/lib/estados'
import { euros, eurosCompacto, fechaCorta, numero, porcentaje } from '@/lib/formato'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { MetricCard, PageHeader } from '@/components/ui/page'
import { SkeletonGrafico, SkeletonMetrica } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from '@/components/ui/toast'
import {
  AlternarTabla,
  EJE,
  Leyenda,
  PanelGrafico,
  REJILLA,
  TablaDatos,
  TooltipCaja,
} from '@/components/metricas/chart-parts'

/**
 * Métricas. Every indicator the brief lists, all computed from the booking
 * records so the numbers reconcile with the calendar and the tables.
 *
 * Chart decisions follow one rule: the data's job picks the form. Magnitude
 * over time is a line, share of a whole is a donut, comparison across courts is
 * a horizontal bar, density across two dimensions is a heatmap, and a top ten
 * is a list rather than a chart, because ranked names are read, not compared by
 * length.
 *
 * Charts use their own status steps, not the badge steps. The badge palette
 * measured 4.8 ΔE between confirmada and cancelada under deuteranopia, meaning
 * a colour-blind reader could not tell a cancelled booking from a confirmed one
 * in the donut. The chart steps measure 10.0 across every pair.
 */

const COLOR_GRAFICO: Record<EstadoReserva, string> = {
  confirmada: 'var(--grafico-confirmada)',
  pendiente: 'var(--grafico-pendiente)',
  completada: 'var(--grafico-completada)',
  cancelada: 'var(--grafico-cancelada)',
}

const RAMPA_SECUENCIAL = [
  'var(--grafico-seq-1)',
  'var(--grafico-seq-2)',
  'var(--grafico-seq-3)',
  'var(--grafico-seq-4)',
  'var(--grafico-seq-5)',
  'var(--grafico-seq-6)',
]

type ClaveRango = 'dia' | 'semana' | 'mes' | 'ano' | 'custom'
type Granularidad = 'dia' | 'semana' | 'mes'

/* --------------------------------------------------------------- heatmap */

function Heatmap({ datos }: { datos: { dia: number; hora: number; reservas: number }[] }) {
  const horas = Array.from({ length: 15 }, (_, i) => i + 8)
  const maximo = Math.max(1, ...datos.map((d) => d.reservas))

  function paso(valor: number): string {
    if (valor === 0) return 'var(--cal-100)'
    const indice = Math.min(
      RAMPA_SECUENCIAL.length - 1,
      Math.floor((valor / maximo) * RAMPA_SECUENCIAL.length)
    )
    return RAMPA_SECUENCIAL[indice]
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[560px]">
        <div className="grid grid-cols-[40px_repeat(15,1fr)] gap-0.5">
          <span />
          {horas.map((hora) => (
            <span key={hora} className="text-center font-mono text-[9px] text-apagado">
              {hora}
            </span>
          ))}

          {DIAS_SEMANA.map((dia) => (
            <React.Fragment key={dia.valor}>
              <span className="pr-1 text-right font-mono text-[10px] leading-6 text-apagado">
                {dia.corto}
              </span>
              {horas.map((hora) => {
                const celda = datos.find((d) => d.dia === dia.valor && d.hora === hora)
                const valor = celda?.reservas ?? 0

                return (
                  <div
                    key={hora}
                    // 2px surface gap between cells so adjacent steps of the same
                    // hue stay distinguishable.
                    className="h-6 rounded-sm border border-superficie"
                    style={{ backgroundColor: paso(valor) }}
                    title={`${dia.largo} a las ${hora}:00 · ${valor} ${valor === 1 ? 'reserva' : 'reservas'}`}
                  />
                )
              })}
            </React.Fragment>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className="text-2xs text-apagado">Menos</span>
          {['var(--cal-100)', ...RAMPA_SECUENCIAL].map((color) => (
            <span
              key={color}
              className="size-3 rounded-sm border border-superficie"
              style={{ backgroundColor: color }}
              aria-hidden
            />
          ))}
          <span className="text-2xs text-apagado">Más</span>
          <span className="ml-auto text-2xs text-apagado numeros-tabulares">
            Máximo {maximo} reservas en una franja
          </span>
        </div>
      </div>
    </div>
  )
}

/* ----------------------------------------------------------------- gauge
   A ring rather than a bar, because occupancy is a proportion of a fixed
   capacity and the ring makes the ceiling visible. */

function Medidor({ etiqueta, valor }: { etiqueta: string; valor: number }) {
  const radio = 26
  const circunferencia = 2 * Math.PI * radio
  const relleno = (Math.min(100, Math.max(0, valor)) / 100) * circunferencia

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg viewBox="0 0 64 64" className="size-16 -rotate-90" role="img" aria-label={`${etiqueta}: ${valor} por ciento`}>
        <circle cx="32" cy="32" r={radio} fill="none" stroke="var(--cal-200)" strokeWidth="7" />
        <circle
          cx="32"
          cy="32"
          r={radio}
          fill="none"
          stroke="var(--grafico-confirmada)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${relleno} ${circunferencia}`}
        />
      </svg>
      <p className="font-display text-sm font-semibold text-tinta numeros-tabulares">{valor} %</p>
      <p className="max-w-20 text-center text-[10px] leading-tight text-apagado">{etiqueta}</p>
    </div>
  )
}

/* ------------------------------------------------------------------ page */

export default function MetricasPage() {
  const estadoVista = useEstadoVista()
  const [rango, setRango] = React.useState<ClaveRango>('mes')
  const [granularidad, setGranularidad] = React.useState<Granularidad>('dia')
  const [tablaIngresos, setTablaIngresos] = React.useState(false)
  const [tablaEstados, setTablaEstados] = React.useState(false)

  const cargando = estadoVista === 'loading'
  const vacio = estadoVista === 'empty'

  const { desde, hasta } = React.useMemo(() => {
    if (rango === 'custom') return { desde: desplazarDias(HOY, -14), hasta: HOY }
    return { desde: RANGOS[rango].desde, hasta: RANGOS[rango].hasta }
  }, [rango])

  const m = React.useMemo(() => calcularMetricas(desde, hasta), [desde, hasta])

  /* Aggregate the daily series up to the chosen granularity. Never two y-axes:
     when the granularity changes, the same measure is simply re-bucketed. */
  const serieIngresos = React.useMemo(() => {
    if (granularidad === 'dia') return m.ingresosPorDia

    const cubos = new Map<string, number>()
    for (const punto of m.ingresosPorDia) {
      const clave =
        granularidad === 'mes'
          ? punto.fecha.slice(0, 7)
          : punto.fecha.slice(0, 8) + String(Math.ceil(Number(punto.fecha.slice(8, 10)) / 7))
      cubos.set(clave, (cubos.get(clave) ?? 0) + punto.valor)
    }
    return [...cubos.entries()].map(([fecha, valor]) => ({ fecha, valor }))
  }, [m.ingresosPorDia, granularidad])

  const datosDonut = ORDEN_ESTADO_RESERVA.map((estado) => ({
    estado,
    nombre: ESTADO_RESERVA[estado].etiqueta,
    valor: m.reservasPorEstado[estado],
  })).filter((d) => d.valor > 0)

  const totalReservas = datosDonut.reduce((suma, d) => suma + d.valor, 0)

  function exportar(formato: 'CSV' | 'PDF') {
    toast.exito(`Informe exportado en ${formato}`, {
      descripcion: `Periodo ${fechaCorta(desde)} a ${fechaCorta(hasta)}.`,
    })
  }

  if (vacio) {
    return (
      <>
        <PageHeader titulo="Métricas" descripcion="Rendimiento del polideportivo." />
        <div className="rounded-lg border border-borde bg-superficie">
          <EmptyState
            ilustracion="cuadrante"
            titulo="Todavía no hay datos que medir"
            descripcion="En cuanto el polideportivo empiece a registrar reservas, aquí verás facturación, ocupación, horas punta y clientes recurrentes."
          />
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader
        titulo="Métricas"
        descripcion={`Periodo del ${fechaCorta(desde)} al ${fechaCorta(hasta)}.`}
        acciones={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secundario">
                <Download aria-hidden />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => exportar('CSV')}>
                <Table2 aria-hidden />
                Descargar CSV
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => exportar('PDF')}>
                <FileText aria-hidden />
                Descargar PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      {/* ------------------------------------------------ global date filter
          One row above the charts, as a single control set that drives every
          panel below. Splitting it per chart would let two panels disagree. */}
      <div className="mb-6 flex flex-wrap items-center gap-2 rounded-lg border border-borde bg-superficie px-4 py-3">
        <span className="etiqueta mr-1">Rango</span>
        {(
          [
            ['dia', 'Día'],
            ['semana', 'Semana'],
            ['mes', 'Mes'],
            ['ano', 'Año'],
            ['custom', 'Personalizado'],
          ] as [ClaveRango, string][]
        ).map(([clave, etiqueta]) => (
          <button
            key={clave}
            type="button"
            onClick={() => setRango(clave)}
            aria-pressed={rango === clave}
            className={cn(
              'rounded border px-2.5 py-1 text-xs transition-colors duration-rapida',
              rango === clave
                ? 'border-primario bg-cesped-50 font-medium text-cesped-700'
                : 'border-borde text-tinta-media hover:border-cal-500 hover:text-tinta'
            )}
          >
            {etiqueta}
          </button>
        ))}
      </div>

      {/* --------------------------------------------------- headline figures */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cargando ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonMetrica key={i} />)
        ) : (
          <>
            <MetricCard
              etiqueta="Total facturado"
              valor={eurosCompacto(m.totalFacturado)}
              nota="Reservas confirmadas y completadas"
            />
            <MetricCard
              etiqueta="Total ganado"
              valor={eurosCompacto(m.totalGanado)}
              nota={`Descontada la comisión de IF7SPORTS (${euros(m.comisionIF7)})`}
            />
            <MetricCard
              etiqueta="Reservas"
              valor={numero(totalReservas)}
              nota="Todas las reservas del periodo"
            />
            <MetricCard
              etiqueta="Ocupación global"
              valor={porcentaje(m.ocupacionGlobal)}
              nota="Media de todas las canchas activas"
            />
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ---------------------------------------------------- revenue line */}
        {cargando ? (
          <SkeletonGrafico />
        ) : (
          <PanelGrafico
            titulo="Ingresos"
            descripcion="Facturación acumulada por periodo."
            resumen={`Serie de ingresos con ${serieIngresos.length} puntos, de ${fechaCorta(desde)} a ${fechaCorta(hasta)}.`}
            className="lg:col-span-2"
            acciones={
              <>
                <div className="flex rounded border border-borde-control p-0.5">
                  {(
                    [
                      ['dia', 'Día'],
                      ['semana', 'Semana'],
                      ['mes', 'Mes'],
                    ] as [Granularidad, string][]
                  ).map(([clave, etiqueta]) => (
                    <button
                      key={clave}
                      type="button"
                      onClick={() => setGranularidad(clave)}
                      aria-pressed={granularidad === clave}
                      className={cn(
                        'rounded-sm px-2 py-0.5 text-2xs transition-colors duration-rapida',
                        granularidad === clave
                          ? 'bg-primario font-medium text-white'
                          : 'text-tinta-media hover:text-tinta'
                      )}
                    >
                      {etiqueta}
                    </button>
                  ))}
                </div>
                <AlternarTabla mostrandoTabla={tablaIngresos} onCambio={setTablaIngresos} />
              </>
            }
          >
            {tablaIngresos ? (
              <TablaDatos
                cabeceras={['Periodo', 'Ingresos']}
                filas={serieIngresos.map((p) => [p.fecha, euros(p.valor)])}
              />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={serieIngresos} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                  <CartesianGrid {...REJILLA} />
                  <XAxis
                    dataKey="fecha"
                    {...EJE}
                    tickFormatter={(valor: string) =>
                      granularidad === 'mes' ? valor : valor.slice(8, 10) || valor.slice(-1)
                    }
                    minTickGap={24}
                  />
                  <YAxis {...EJE} width={52} tickFormatter={(valor: number) => `${valor} €`} />
                  <Tooltip
                    cursor={{ stroke: 'var(--cal-400)', strokeWidth: 1 }}
                    content={({ active, payload, label }) =>
                      active && payload?.length ? (
                        <TooltipCaja
                          titulo={String(label)}
                          filas={[
                            {
                              etiqueta: 'Ingresos',
                              valor: euros(Number(payload[0].value)),
                              color: 'var(--grafico-confirmada)',
                            },
                          ]}
                        />
                      ) : null
                    }
                  />
                  {/* One series, so no legend: the panel title names it. */}
                  <Line
                    type="monotone"
                    dataKey="valor"
                    stroke="var(--grafico-confirmada)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--superficie)' }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </PanelGrafico>
        )}

        {/* ------------------------------------------------------ status donut */}
        {cargando ? (
          <SkeletonGrafico />
        ) : (
          <PanelGrafico
            titulo="Reservas por estado"
            descripcion={`${numero(totalReservas)} reservas en el periodo.`}
            resumen={datosDonut
              .map((d) => `${d.nombre}: ${d.valor}`)
              .join('. ')}
            acciones={<AlternarTabla mostrandoTabla={tablaEstados} onCambio={setTablaEstados} />}
          >
            {tablaEstados ? (
              <TablaDatos
                cabeceras={['Estado', 'Reservas', 'Porcentaje']}
                filas={datosDonut.map((d) => [
                  d.nombre,
                  d.valor,
                  porcentaje((d.valor / totalReservas) * 100, 1),
                ])}
              />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={datosDonut}
                      dataKey="valor"
                      nameKey="nombre"
                      innerRadius={52}
                      outerRadius={82}
                      // 2px surface gap between segments, so two steps never
                      // touch and the wrap-around pair stays separable.
                      paddingAngle={2}
                      stroke="var(--superficie)"
                      strokeWidth={2}
                      isAnimationActive={false}
                    >
                      {datosDonut.map((d) => (
                        <Cell key={d.estado} fill={COLOR_GRAFICO[d.estado]} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) =>
                        active && payload?.length ? (
                          <TooltipCaja
                            titulo={String(payload[0].name)}
                            filas={[
                              {
                                etiqueta: 'Reservas',
                                valor: numero(Number(payload[0].value)),
                                color: COLOR_GRAFICO[
                                  (payload[0].payload as { estado: EstadoReserva }).estado
                                ],
                              },
                            ]}
                          />
                        ) : null
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Legend carries the count, so identity never rests on hue. */}
                <Leyenda
                  className="mt-2 justify-center"
                  items={datosDonut.map((d) => ({
                    etiqueta: d.nombre,
                    color: COLOR_GRAFICO[d.estado],
                    valor: numero(d.valor),
                  }))}
                />
              </>
            )}
          </PanelGrafico>
        )}

        {/* -------------------------------------------------- courts bar chart */}
        {cargando ? (
          <SkeletonGrafico />
        ) : (
          <PanelGrafico
            titulo="Campos más utilizados"
            descripcion="Reservas por cancha en el periodo."
            resumen={m.usoPorCancha.map((c) => `${c.canchaNombre}: ${c.reservas}`).join('. ')}
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={m.usoPorCancha}
                layout="vertical"
                margin={{ top: 4, right: 32, bottom: 0, left: 8 }}
                barCategoryGap={6}
              >
                <CartesianGrid {...REJILLA} vertical horizontal={false} />
                <XAxis type="number" {...EJE} />
                <YAxis type="category" dataKey="canchaNombre" {...EJE} width={116} />
                <Tooltip
                  cursor={{ fill: 'var(--cal-100)' }}
                  content={({ active, payload, label }) =>
                    active && payload?.length ? (
                      <TooltipCaja
                        titulo={String(label)}
                        filas={[
                          {
                            etiqueta: 'Reservas',
                            valor: numero(Number(payload[0].value)),
                            color: 'var(--grafico-seq-5)',
                          },
                        ]}
                      />
                    ) : null
                  }
                />
                <Bar
                  dataKey="reservas"
                  fill="var(--grafico-seq-5)"
                  radius={[0, 4, 4, 0]}
                  maxBarSize={18}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </PanelGrafico>
        )}

        {/* ------------------------------------------------------- peak hours */}
        {cargando ? (
          <SkeletonGrafico />
        ) : (
          <PanelGrafico
            titulo="Horas más alquiladas"
            descripcion="Densidad de reservas por hora y día de la semana."
            resumen="Mapa de calor de reservas por hora del día y día de la semana."
          >
            <Heatmap datos={m.usoPorHora} />
          </PanelGrafico>
        )}

        {/* -------------------------------------------------------- occupancy */}
        {cargando ? (
          <SkeletonGrafico />
        ) : (
          <PanelGrafico
            titulo="Ocupación por cancha"
            descripcion={`Media global del ${porcentaje(m.ocupacionGlobal)}.`}
            resumen={m.ocupacionPorCancha
              .map((o) => `${o.canchaNombre}: ${o.porcentaje} por ciento`)
              .join('. ')}
          >
            <div className="flex flex-wrap items-start justify-center gap-x-5 gap-y-4 pt-2">
              {m.ocupacionPorCancha.map((o) => (
                <Medidor key={o.canchaId} etiqueta={o.canchaNombre} valor={o.porcentaje} />
              ))}
            </div>
          </PanelGrafico>
        )}

        {/* ------------------------------------------------- repeat clients */}
        {cargando ? (
          <SkeletonGrafico />
        ) : (
          <PanelGrafico
            titulo="Clientes recurrentes"
            descripcion="Los diez que más reservan en el periodo."
            resumen={m.clientesRecurrentes
              .map((c, i) => `${i + 1}. ${c.nombre}, ${c.totalReservas} reservas`)
              .join('. ')}
          >
            {/* A ranked list of names, not a chart. Reading who they are matters
                more than comparing bar lengths. */}
            <ol className="divide-y divide-borde">
              {m.clientesRecurrentes.map((cliente, indice) => (
                <li
                  key={cliente.clienteId}
                  className="flex items-center gap-3 py-2 first:pt-0 last:pb-0"
                >
                  <span className="w-5 shrink-0 font-mono text-2xs text-apagado numeros-tabulares">
                    {indice + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-tinta">
                    {cliente.nombre}
                  </span>
                  <span className="font-mono text-xs text-tinta-media numeros-tabulares">
                    {cliente.totalReservas}
                  </span>
                </li>
              ))}
            </ol>
          </PanelGrafico>
        )}

        {/* ----------------------------------------------------- cancellations */}
        {cargando ? (
          <SkeletonGrafico />
        ) : (
          <PanelGrafico
            titulo="Reservas canceladas"
            descripcion="Cancelaciones registradas por día."
            resumen={`Serie de cancelaciones diarias con ${m.cancelacionesPorDia.length} puntos.`}
          >
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={m.cancelacionesPorDia} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                <CartesianGrid {...REJILLA} />
                <XAxis
                  dataKey="fecha"
                  {...EJE}
                  tickFormatter={(valor: string) => valor.slice(8, 10)}
                  minTickGap={24}
                />
                <YAxis {...EJE} width={28} allowDecimals={false} />
                <Tooltip
                  cursor={{ stroke: 'var(--cal-400)', strokeWidth: 1 }}
                  content={({ active, payload, label }) =>
                    active && payload?.length ? (
                      <TooltipCaja
                        titulo={fechaCorta(String(label))}
                        filas={[
                          {
                            etiqueta: 'Canceladas',
                            valor: numero(Number(payload[0].value)),
                            color: 'var(--grafico-cancelada)',
                          },
                        ]}
                      />
                    ) : null
                  }
                />
                <Line
                  type="monotone"
                  dataKey="valor"
                  stroke="var(--grafico-cancelada)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--superficie)' }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </PanelGrafico>
        )}

        {/* -------------------------------------------------------- refunds */}
        {cargando ? (
          <SkeletonGrafico />
        ) : (
          <PanelGrafico
            titulo="Devoluciones realizadas"
            descripcion="Importe devuelto por día."
            resumen={`Serie de devoluciones diarias con ${m.devolucionesPorDia.length} puntos.`}
          >
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={m.devolucionesPorDia} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                <CartesianGrid {...REJILLA} />
                <XAxis
                  dataKey="fecha"
                  {...EJE}
                  tickFormatter={(valor: string) => valor.slice(8, 10)}
                  minTickGap={24}
                />
                <YAxis {...EJE} width={48} tickFormatter={(valor: number) => `${valor} €`} />
                <Tooltip
                  cursor={{ stroke: 'var(--cal-400)', strokeWidth: 1 }}
                  content={({ active, payload, label }) =>
                    active && payload?.length ? (
                      <TooltipCaja
                        titulo={fechaCorta(String(label))}
                        filas={[
                          {
                            etiqueta: 'Devuelto',
                            valor: euros(Number(payload[0].value)),
                            color: 'var(--grafico-pendiente)',
                          },
                        ]}
                      />
                    ) : null
                  }
                />
                <Line
                  type="monotone"
                  dataKey="valor"
                  stroke="var(--grafico-pendiente)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--superficie)' }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </PanelGrafico>
        )}
      </div>
    </>
  )
}
