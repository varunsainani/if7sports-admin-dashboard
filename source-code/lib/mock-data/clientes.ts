import type { Cliente } from '@/lib/types'
import { personas, fechaAlta } from './personas'
import { reservas } from './reservas'

/**
 * Clients, with every counter derived from the actual booking records rather
 * than typed in. The total on the clients table and the number of rows on the
 * client detail screen therefore always agree.
 *
 * Terminology note from the brief: anyone who has booked at this polideportivo
 * appears here as a customer, even though in the wider IF7SPORTS ecosystem the
 * same person is a user.
 */

function construirClientes(): Cliente[] {
  return personas
    .map((persona) => {
      const suyas = reservas.filter((reserva) => reserva.clienteId === persona.id)
      const fechas = suyas.map((reserva) => reserva.fecha).sort()

      const pagadas = suyas.filter((reserva) => reserva.estadoPago === 'pagado')

      return {
        id: persona.id,
        nombre: persona.nombre,
        correo: persona.correo,
        telefono: persona.telefono,
        // Falls back to the signup date for someone who has not booked yet.
        fechaPrimeraReserva: fechas[0] ?? fechaAlta(persona),
        fechaUltimaReserva: fechas[fechas.length - 1] ?? fechaAlta(persona),
        totalReservas: suyas.length,
        importeTotalPagado: pagadas.reduce((suma, reserva) => suma + reserva.importe, 0),
        reservasActivas: suyas.filter(
          (reserva) => reserva.estado === 'confirmada' || reserva.estado === 'pendiente'
        ).length,
        reservasCanceladas: suyas.filter((reserva) => reserva.estado === 'cancelada').length,
        reservasCompletadas: suyas.filter((reserva) => reserva.estado === 'completada').length,
      }
    })
    // Someone with no bookings is not a customer of this facility yet.
    .filter((cliente) => cliente.totalReservas > 0)
    .sort((a, b) => b.fechaUltimaReserva.localeCompare(a.fechaUltimaReserva))
}

export const clientes: Cliente[] = construirClientes()

export function clientePorId(id: string): Cliente | undefined {
  return clientes.find((cliente) => cliente.id === id)
}

/** Top 10 by booking volume, for the recurring clients panel on Métricas. */
export const clientesRecurrentes = [...clientes]
  .sort((a, b) => b.totalReservas - a.totalReservas)
  .slice(0, 10)
