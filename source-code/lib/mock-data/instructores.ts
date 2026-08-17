import type { Instructor } from '@/lib/types'

/**
 * Instructors are an informational record only. They never log in, have no
 * panel of their own, and appear exclusively attached to a blocked franja.
 * The instructors screen carries that note visibly, because the natural
 * assumption on seeing a people list in an admin panel is that these are users.
 */
export const instructores: Instructor[] = [
  {
    id: 'ins-1',
    nombre: 'Álvaro Mendoza',
    tipo: 'coach',
    foto: '/imagenes/instructores/alvaro.jpg',
    notasInternas:
      'Escuela de pádel de los martes y jueves. Contacto directo con las familias del grupo infantil.',
  },
  {
    id: 'ins-2',
    nombre: 'Nerea Company',
    tipo: 'monitor',
    foto: '/imagenes/instructores/nerea.jpg',
    notasInternas: 'Monitora de las actividades dirigidas del pabellón. Turno de tarde.',
  },
  {
    id: 'ins-3',
    nombre: 'Sergio Balaguer',
    tipo: 'trainer',
    foto: '/imagenes/instructores/sergio.jpg',
    notasInternas:
      'Preparador físico del club de fútbol base. Reserva el campo principal los miércoles.',
  },
  {
    id: 'ins-4',
    nombre: 'Marta Piqueras',
    tipo: 'teacher',
    foto: '/imagenes/instructores/marta.jpg',
    notasInternas: 'Clases de tenis para adultos. Solicita siempre la cancha Tenis 1 por la iluminación.',
  },
  {
    id: 'ins-5',
    nombre: 'Iván Sorolla',
    tipo: 'coach',
    foto: '/imagenes/instructores/ivan.jpg',
    notasInternas: 'Academia de básquet del pabellón, categorías alevín y cadete.',
  },
  {
    id: 'ins-6',
    nombre: 'Claudia Bertomeu',
    tipo: 'monitor',
    foto: '/imagenes/instructores/claudia.jpg',
    notasInternas: 'Sustituciones y campus de verano. Disponible en agosto.',
  },
]

export function instructorPorId(id: string): Instructor | undefined {
  return instructores.find((instructor) => instructor.id === id)
}
