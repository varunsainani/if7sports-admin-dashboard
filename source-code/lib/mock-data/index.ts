/**
 * Single entry point for the mock dataset.
 *
 * Screens import from '@/lib/mock-data' rather than reaching into individual
 * files, so swapping this layer for a real API later means changing one module
 * boundary instead of touching fifteen screens.
 */

export { HOY, desplazarDias, diaSemana, marcaTiempo, sumarHoras } from './base'

export { polideportivo } from './polideportivo'
export { canchas, canchasActivas, canchaPorId } from './canchas'
export { instructores, instructorPorId } from './instructores'
export { personas, personaPorId, fechaAlta } from './personas'

export {
  reservas,
  reservaPorId,
  reservasDeCliente,
  reservasDeFecha,
  reservasEntre,
  reservasDeHoy,
  ultimasReservas,
} from './reservas'

export { clientes, clientePorId, clientesRecurrentes } from './clientes'

export {
  bloqueos,
  bloqueosDeFecha,
  bloqueosEntre,
  bloqueosDeInstructor,
} from './bloqueos'

export {
  usuarios,
  usuarioActual,
  usuarioPorId,
  resumirPermisos,
  permisos,
  TODOS_LOS_PERMISOS,
  SIN_PERMISOS,
} from './usuarios'

export { tickets, ticketPorId } from './tickets'

export {
  metricas,
  calcularMetricas,
  resumenDashboard,
  RANGOS,
  COMISION_IF7,
  type Granularidad,
  type RangoFechas,
} from './metricas'

export { notificaciones, notificacionesSinLeer } from './notificaciones'
