import type { Polideportivo } from '@/lib/types'
import { HOY, desplazarDias } from './base'

/**
 * The facility this panel administers. A municipal-style polideportivo in
 * Valencia, which fits the court mix in the brief: fútbol 7 and 11, tenis,
 * pádel and básquet under one roof.
 */
export const polideportivo: Polideportivo = {
  nombre: 'Polideportivo Ciutat de Llevant',
  direccion: 'Carrer de l\'Enginyer Fausto Elío 12, 46011 València',
  latitud: 39.4612,
  longitud: -0.3298,
  telefono: '+34 963 45 12 08',
  correo: 'reservas@ciutatdellevant.es',
  imagenes: [
    '/imagenes/polideportivo-entrada.jpg',
    '/imagenes/polideportivo-pistas.jpg',
    '/imagenes/polideportivo-vestuarios.jpg',
  ],

  // Longer hours at the weekend, and a late close on Friday. Facilities like
  // this fill their evenings, which is what makes the occupancy heatmap on the
  // metrics screen worth looking at.
  horarios: [
    { dia: 1, abierto: true, apertura: '08:00', cierre: '23:00' },
    { dia: 2, abierto: true, apertura: '08:00', cierre: '23:00' },
    { dia: 3, abierto: true, apertura: '08:00', cierre: '23:00' },
    { dia: 4, abierto: true, apertura: '08:00', cierre: '23:00' },
    { dia: 5, abierto: true, apertura: '08:00', cierre: '00:00' },
    { dia: 6, abierto: true, apertura: '09:00', cierre: '22:00' },
    { dia: 7, abierto: true, apertura: '09:00', cierre: '15:00' },
  ],

  festivos: [
    { id: 'fes-1', fecha: '2026-01-01', nombre: 'Año Nuevo', tipo: 'cerrado' },
    { id: 'fes-2', fecha: '2026-01-06', nombre: 'Reyes', tipo: 'cerrado' },
    {
      id: 'fes-3',
      fecha: '2026-03-19',
      nombre: 'San José',
      tipo: 'horario_especial',
      apertura: '10:00',
      cierre: '14:00',
    },
    { id: 'fes-4', fecha: '2026-04-03', nombre: 'Viernes Santo', tipo: 'cerrado' },
    {
      id: 'fes-5',
      fecha: '2026-05-01',
      nombre: 'Día del Trabajador',
      tipo: 'horario_especial',
      apertura: '10:00',
      cierre: '15:00',
    },
    { id: 'fes-6', fecha: '2026-08-15', nombre: 'Asunción', tipo: 'cerrado' },
    {
      id: 'fes-7',
      fecha: '2026-10-09',
      nombre: 'Día de la Comunitat Valenciana',
      tipo: 'horario_especial',
      apertura: '10:00',
      cierre: '18:00',
    },
    { id: 'fes-8', fecha: '2026-12-25', nombre: 'Navidad', tipo: 'cerrado' },
    {
      id: 'fes-9',
      fecha: '2026-12-31',
      nombre: 'Nochevieja',
      tipo: 'horario_especial',
      apertura: '09:00',
      cierre: '14:00',
    },
  ],

  ultimaModificacion: `${desplazarDias(HOY, -6)}T17:42:00`,
}
