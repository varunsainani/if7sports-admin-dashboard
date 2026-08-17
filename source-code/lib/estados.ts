import {
  Ban,
  Check,
  CheckCircle2,
  CircleDot,
  Clock,
  Dumbbell,
  Goal,
  GraduationCap,
  LandPlot,
  Minus,
  MoreHorizontal,
  PartyPopper,
  RotateCcw,
  Shapes,
  Target,
  Users,
  Volleyball,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

import type {
  EstadoPago,
  EstadoReserva,
  EstadoTicket,
  Modulo,
  MotivoBloqueo,
  Rol,
  TipoCancha,
  TipoInstructor,
  TipoTicket,
} from './types'

/**
 * Every Spanish label the interface renders for a domain value lives here, so
 * a term is spelled one way across all fifteen screens. Nothing downstream
 * hardcodes a status name.
 */

/* ========================================================== estado reserva
   The four states carry a hue AND a fill treatment. Hue alone would fail for a
   colour-blind reviewer and in the greyscale screenshots that go to the client,
   so each state is also structurally different:

     pendiente   dashed border   - visibly unfinished, waiting on someone
     confirmada  solid fill      - the live, settled, normal state
     cancelada   diagonal strike - dead, but still readable
     completada  flat, no border - history, recedes into the background
*/

export interface ConfigEstadoReserva {
  etiqueta: string
  /** Badge inside tables and lists. */
  tint: string
  /** Large badge in the booking detail modal. */
  solido: string
  /** Slot rendering inside the calendar grid. */
  slot: string
  /** Legend dots and chart series. Resolves against :root at paint time. */
  grafico: string
}

export const ESTADO_RESERVA: Record<EstadoReserva, ConfigEstadoReserva> = {
  pendiente: {
    etiqueta: 'Pendiente',
    tint: 'bg-pendiente-bg text-pendiente-texto border border-dashed border-pendiente-borde',
    solido: 'bg-pendiente-solido text-white',
    slot: 'bg-pendiente-bg text-pendiente-texto border border-dashed border-pendiente-borde',
    grafico: 'var(--pendiente-solido)',
  },
  confirmada: {
    etiqueta: 'Confirmada',
    tint: 'bg-confirmada-bg text-confirmada-texto border border-confirmada-borde',
    solido: 'bg-confirmada-solido text-white',
    slot: 'bg-confirmada-solido text-white border border-confirmada-solido',
    grafico: 'var(--confirmada-solido)',
  },
  cancelada: {
    etiqueta: 'Cancelada',
    tint: 'bg-cancelada-bg text-cancelada-texto border border-cancelada-borde line-through decoration-cancelada-borde',
    solido: 'bg-cancelada-solido text-white',
    slot: 'bg-cancelada-bg text-cancelada-texto border border-cancelada-borde trama-cancelada',
    grafico: 'var(--cancelada-solido)',
  },
  completada: {
    etiqueta: 'Completada',
    tint: 'bg-completada-bg text-completada-texto border border-transparent',
    solido: 'bg-completada-solido text-white',
    slot: 'bg-completada-bg text-completada-texto border border-transparent',
    grafico: 'var(--completada-solido)',
  },
}

export const ORDEN_ESTADO_RESERVA: EstadoReserva[] = [
  'pendiente',
  'confirmada',
  'completada',
  'cancelada',
]

/* ============================================================= estado pago
   Monochrome by design. Payment is a second axis shown right next to booking
   status, and giving it its own hues would destroy the at-a-glance reading of
   the four states above. Separated by icon and fill weight instead.
*/

export interface ConfigEstadoPago {
  etiqueta: string
  clases: string
  icono: LucideIcon
}

export const ESTADO_PAGO: Record<EstadoPago, ConfigEstadoPago> = {
  pagado: {
    etiqueta: 'Pagado',
    clases: 'bg-pago-bg text-pago-texto border border-pago-borde',
    icono: CheckCircle2,
  },
  pendiente_pago: {
    etiqueta: 'Pendiente de pago',
    clases: 'bg-pago-pendiente-bg text-pago-pendiente-texto border border-pago-pendiente-borde',
    icono: Clock,
  },
  devuelto: {
    etiqueta: 'Devuelto',
    clases: 'bg-pago-devuelto-bg text-pago-devuelto-texto border border-pago-devuelto-borde',
    icono: RotateCcw,
  },
  no_aplica: {
    etiqueta: 'No aplica',
    clases: 'text-pago-na-texto border border-dashed border-pago-na-borde',
    icono: Minus,
  },
}

export const ORDEN_ESTADO_PAGO: EstadoPago[] = [
  'pagado',
  'pendiente_pago',
  'devuelto',
  'no_aplica',
]

/* ============================================================= tipo cancha
   Court type is carried by icon and label, never by colour. Spending hue here
   would put it in competition with booking status on the same calendar slot.
*/

export const TIPO_CANCHA: Record<TipoCancha, { etiqueta: string; icono: LucideIcon }> = {
  futbol_7: { etiqueta: 'Fútbol 7', icono: Goal },
  futbol_11: { etiqueta: 'Fútbol 11', icono: LandPlot },
  tenis: { etiqueta: 'Tenis', icono: CircleDot },
  padel: { etiqueta: 'Pádel', icono: Target },
  basquet: { etiqueta: 'Básquet', icono: Volleyball },
  otro: { etiqueta: 'Otro', icono: Shapes },
}

export const ORDEN_TIPO_CANCHA: TipoCancha[] = [
  'futbol_7',
  'futbol_11',
  'tenis',
  'padel',
  'basquet',
  'otro',
]

/* =========================================================== motivo bloqueo */

export const MOTIVO_BLOQUEO: Record<MotivoBloqueo, { etiqueta: string; icono: LucideIcon }> = {
  mantenimiento: { etiqueta: 'Mantenimiento', icono: Wrench },
  clase: { etiqueta: 'Clase', icono: GraduationCap },
  entrenamiento: { etiqueta: 'Entrenamiento', icono: Dumbbell },
  academia: { etiqueta: 'Academia', icono: Users },
  evento: { etiqueta: 'Evento', icono: PartyPopper },
  otro: { etiqueta: 'Otro', icono: MoreHorizontal },
}

export const ORDEN_MOTIVO_BLOQUEO: MotivoBloqueo[] = [
  'mantenimiento',
  'clase',
  'entrenamiento',
  'academia',
  'evento',
  'otro',
]

/* ============================================================ instructores
   The brief lists these types in English (coach / teacher / trainer / monitor).
   The keys keep the brief's words so the mapping is traceable, while the
   labels are the natural Spanish equivalents, since the interface is Spanish.
*/

export const TIPO_INSTRUCTOR: Record<TipoInstructor, string> = {
  coach: 'Coach',
  teacher: 'Profesor',
  trainer: 'Entrenador',
  monitor: 'Monitor',
  otro: 'Otro',
}

export const ORDEN_TIPO_INSTRUCTOR: TipoInstructor[] = [
  'coach',
  'teacher',
  'trainer',
  'monitor',
  'otro',
]

/* ================================================================== roles */

export const ROL: Record<Rol, { etiqueta: string; descripcion: string }> = {
  admin_principal: {
    etiqueta: 'Admin principal',
    descripcion: 'Dueño del polideportivo. Permisos totales sobre todos los módulos.',
  },
  colaborador: {
    etiqueta: 'Colaborador',
    descripcion: 'Administrador operativo con permisos delegados por módulo.',
  },
}

/* ================================================================ módulos */

export const MODULO: Record<Modulo, string> = {
  reservas: 'Reservas',
  canchas: 'Canchas',
  clientes: 'Clientes',
  configuracion: 'Configuración',
  metricas: 'Métricas',
  bloqueos: 'Bloqueos',
  instructores: 'Instructores',
  soporte: 'Soporte',
}

export const ORDEN_MODULO: Modulo[] = [
  'reservas',
  'canchas',
  'clientes',
  'bloqueos',
  'instructores',
  'metricas',
  'configuracion',
  'soporte',
]

/* ================================================================ soporte */

export const TIPO_TICKET: Record<TipoTicket, string> = {
  tecnico: 'Técnico',
  administrativo: 'Administrativo',
  comercial: 'Comercial',
}

/**
 * The entity is called "solicitud" throughout the interface, which is feminine,
 * so the state labels agree with it. The keys keep the brief's masculine words
 * (abierto / en_curso / cerrado) so the mapping back to the spec is traceable.
 */
export const ESTADO_TICKET: Record<EstadoTicket, { etiqueta: string; clases: string; icono: LucideIcon }> = {
  abierto: {
    etiqueta: 'Abierta',
    clases: 'bg-pago-pendiente-bg text-pago-pendiente-texto border border-pago-pendiente-borde',
    icono: Clock,
  },
  en_curso: {
    etiqueta: 'En curso',
    clases: 'bg-pago-bg text-pago-texto border border-pago-borde',
    icono: MoreHorizontal,
  },
  cerrado: {
    etiqueta: 'Cerrada',
    clases: 'text-pago-na-texto border border-dashed border-pago-na-borde',
    icono: Check,
  },
}

/* ============================================================ días semana
   ISO order, 1 = Monday, matching the domain types and Spanish convention of
   starting the week on Monday.
*/

export const DIAS_SEMANA = [
  { valor: 1, corto: 'L', largo: 'Lunes' },
  { valor: 2, corto: 'M', largo: 'Martes' },
  { valor: 3, corto: 'X', largo: 'Miércoles' },
  { valor: 4, corto: 'J', largo: 'Jueves' },
  { valor: 5, corto: 'V', largo: 'Viernes' },
  { valor: 6, corto: 'S', largo: 'Sábado' },
  { valor: 7, corto: 'D', largo: 'Domingo' },
] as const

/** Shown on blocked franjas, which have no booking status of their own. */
export const BLOQUEO = {
  etiqueta: 'Bloqueo',
  icono: Ban,
  clases: 'trama-bloqueo text-bloqueo-texto border border-borde-fuerte',
}
