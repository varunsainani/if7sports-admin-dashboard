/**
 * Domain model for the IF7SPORTS admin panel.
 *
 * Convention used throughout this codebase: framework plumbing is English
 * (Button, DataTable, isLoading), the domain vocabulary is Spanish and matches
 * the brief literally. A booking status really is the string 'confirmada', so
 * there is no translation layer between the spec, the data and the UI, and no
 * chance of the two drifting apart.
 */

/* ------------------------------------------------------------------ estados */

/** The four booking states. Rendered with both a hue and a fill treatment. */
export type EstadoReserva = 'pendiente' | 'confirmada' | 'cancelada' | 'completada'

/** Payment travels on its own axis and is shown as a separate badge. */
export type EstadoPago = 'pagado' | 'pendiente_pago' | 'devuelto' | 'no_aplica'

/* -------------------------------------------------------------------- roles */

/**
 * Instructors are deliberately absent here. They are an informational record
 * attached to blocked franjas and never authenticate, so they are not a role
 * the session can hold.
 */
export type Rol = 'admin_principal' | 'colaborador'

/** The eight modules a colaborador can be granted or denied, per the brief. */
export type Modulo =
  | 'reservas'
  | 'canchas'
  | 'clientes'
  | 'configuracion'
  | 'metricas'
  | 'bloqueos'
  | 'instructores'
  | 'soporte'

export type Permisos = Record<Modulo, boolean>

/* ----------------------------------------------------------------- canchas */

export type TipoCancha = 'futbol_7' | 'futbol_11' | 'tenis' | 'padel' | 'basquet' | 'otro'

export type EstadoCancha = 'activa' | 'desactivada'

/** A pricing rule layered on top of a court's base price. */
export interface ReglaPrecio {
  id: string
  descripcion: string
  /** Day of week this applies to, 1 = Monday through 7 = Sunday. Empty means every day. */
  dias: number[]
  horaInicio: string
  horaFin: string
  temporada?: string
  precio: number
}

export interface Cancha {
  id: string
  nombre: string
  tipo: TipoCancha
  descripcion: string
  precioBase: number
  estado: EstadoCancha
  imagenes: string[]
  /** Opening days, 1 = Monday through 7 = Sunday. */
  diasAbiertos: number[]
  horaApertura: string
  horaCierre: string
  /** Set when this court overrides the facility's general schedule. */
  excepcionHorario?: string
  reglasPrecio: ReglaPrecio[]
}

/* ---------------------------------------------------------------- clientes */

export interface Cliente {
  id: string
  nombre: string
  correo: string
  telefono: string
  fechaPrimeraReserva: string
  /** The most recent booking that has already happened. */
  fechaUltimaReserva: string
  /** The next booking still on the book, if there is one. */
  proximaReserva?: string
  totalReservas: number
  importeTotalPagado: number
  reservasActivas: number
  reservasCanceladas: number
  reservasCompletadas: number
}

/* ---------------------------------------------------------------- reservas */

/** One entry in a booking's state history. Every transition records an actor. */
export interface EventoReserva {
  id: string
  estado: EstadoReserva | 'creada'
  fecha: string
  actor: string
  nota?: string
}

export interface Reserva {
  id: string
  clienteId: string
  clienteNombre: string
  canchaId: string
  canchaNombre: string
  fecha: string
  horaInicio: string
  horaFin: string
  importe: number
  estado: EstadoReserva
  estadoPago: EstadoPago
  /** Manual bookings are created by staff rather than by the client. */
  origen: 'cliente' | 'manual'
  notasInternas: string
  historial: EventoReserva[]
}

/* --------------------------------------------------------------- bloqueos */

export type MotivoBloqueo =
  | 'mantenimiento'
  | 'clase'
  | 'entrenamiento'
  | 'academia'
  | 'evento'
  | 'otro'

export interface Bloqueo {
  id: string
  canchaId: string
  canchaNombre: string
  fecha: string
  horaInicio: string
  horaFin: string
  motivo: MotivoBloqueo
  /** Optional, and the only place an instructor ever appears. */
  instructorId?: string
  instructorNombre?: string
  creadoPor: string
}

/* ------------------------------------------------------------ instructores */

export type TipoInstructor = 'coach' | 'teacher' | 'trainer' | 'monitor' | 'otro'

export interface Instructor {
  id: string
  nombre: string
  tipo: TipoInstructor
  foto: string
  notasInternas: string
}

/* -------------------------------------------------------------- usuarios */

export interface Usuario {
  id: string
  nombre: string
  correo: string
  rol: Rol
  permisos: Permisos
  ultimoLogin: string | null
  estado: 'activo' | 'desactivado'
  /** True until a new admin has replaced the temporary password mailed to them. */
  requiereCambioPassword: boolean
}

/* --------------------------------------------------------------- soporte */

export type TipoTicket = 'tecnico' | 'administrativo' | 'comercial'
export type EstadoTicket = 'abierto' | 'en_curso' | 'cerrado'

export interface MensajeTicket {
  id: string
  autor: string
  esIF7: boolean
  fecha: string
  cuerpo: string
  adjuntos: string[]
}

export interface Ticket {
  id: string
  tipo: TipoTicket
  asunto: string
  descripcion: string
  estado: EstadoTicket
  fecha: string
  ultimaRespuesta: string
  mensajes: MensajeTicket[]
}

/* --------------------------------------------------- polideportivo config */

/** Opening hours for one weekday. `abierto: false` marks a non-operating day. */
export interface HorarioDia {
  dia: number
  abierto: boolean
  apertura: string
  cierre: string
}

export interface Festivo {
  id: string
  fecha: string
  nombre: string
  tipo: 'cerrado' | 'horario_especial'
  apertura?: string
  cierre?: string
}

export interface Polideportivo {
  nombre: string
  direccion: string
  latitud: number
  longitud: number
  telefono: string
  correo: string
  imagenes: string[]
  horarios: HorarioDia[]
  festivos: Festivo[]
  ultimaModificacion: string
}

/* -------------------------------------------------------------- métricas */

export interface PuntoSerie {
  fecha: string
  valor: number
}

export interface OcupacionCancha {
  canchaId: string
  canchaNombre: string
  porcentaje: number
}

export interface UsoHorario {
  hora: number
  dia: number
  reservas: number
}

export interface ClienteRecurrente {
  clienteId: string
  nombre: string
  totalReservas: number
}

export interface Metricas {
  totalFacturado: number
  totalGanado: number
  comisionIF7: number
  reservasPorEstado: Record<EstadoReserva, number>
  ocupacionGlobal: number
  ocupacionPorCancha: OcupacionCancha[]
  usoPorHora: UsoHorario[]
  usoPorCancha: { canchaNombre: string; reservas: number }[]
  clientesRecurrentes: ClienteRecurrente[]
  ingresosPorDia: PuntoSerie[]
  cancelacionesPorDia: PuntoSerie[]
  devolucionesPorDia: PuntoSerie[]
  tendenciaFacturacion: PuntoSerie[]
}

/* ------------------------------------------------------- notificaciones */

export type TipoNotificacion =
  | 'reserva_pendiente'
  | 'respuesta_soporte'
  | 'cancelacion'
  | 'alerta_ocupacion'

export interface Notificacion {
  id: string
  tipo: TipoNotificacion
  titulo: string
  detalle: string
  fecha: string
  leida: boolean
  enlace: string
}

/* --------------------------------------------------------------- sesión */

export interface Sesion {
  usuario: Usuario
  polideportivo: string
}

/**
 * Demo-only. Lets a reviewer see the default, loading and empty rendering of
 * every screen without waiting on a request or clearing data, which is the
 * only practical way to show the three states the brief asks for.
 */
export type EstadoVista = 'default' | 'loading' | 'empty'
