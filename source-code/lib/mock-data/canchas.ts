import type { Cancha } from '@/lib/types'

/**
 * Eight courts across five types. Prices follow what a Valencian municipal
 * facility actually charges: pádel and tenis by the hour and a half, fútbol by
 * the hour, with evening and weekend rules pushing the price up because that is
 * when demand sits.
 *
 * One court is deactivated on purpose, so the estado filter on the courts list
 * has something real to filter.
 */
export const canchas: Cancha[] = [
  {
    id: 'can-1',
    nombre: 'Pádel 1',
    tipo: 'padel',
    descripcion:
      'Pista de pádel panorámica con muro de cristal en los cuatro lados. Césped artificial de 12 mm renovado en 2025.',
    precioBase: 24,
    estado: 'activa',
    imagenes: ['/imagenes/padel-1.jpg', '/imagenes/padel-1-detalle.jpg'],
    diasAbiertos: [1, 2, 3, 4, 5, 6, 7],
    horaApertura: '08:00',
    horaCierre: '23:00',
    reglasPrecio: [
      {
        id: 'rp-1',
        descripcion: 'Franja de tarde entre semana',
        dias: [1, 2, 3, 4, 5],
        horaInicio: '18:00',
        horaFin: '23:00',
        precio: 32,
      },
      {
        id: 'rp-2',
        descripcion: 'Fin de semana completo',
        dias: [6, 7],
        horaInicio: '09:00',
        horaFin: '22:00',
        precio: 30,
      },
      {
        id: 'rp-3',
        descripcion: 'Temporada alta de verano',
        dias: [],
        horaInicio: '08:00',
        horaFin: '23:00',
        temporada: 'Junio a septiembre',
        precio: 28,
      },
    ],
  },
  {
    id: 'can-2',
    nombre: 'Pádel 2',
    tipo: 'padel',
    descripcion: 'Pista de pádel cubierta, disponible con lluvia. Iluminación LED regulable.',
    precioBase: 26,
    estado: 'activa',
    imagenes: ['/imagenes/padel-2.jpg'],
    diasAbiertos: [1, 2, 3, 4, 5, 6, 7],
    horaApertura: '08:00',
    horaCierre: '23:00',
    reglasPrecio: [
      {
        id: 'rp-4',
        descripcion: 'Franja de tarde entre semana',
        dias: [1, 2, 3, 4, 5],
        horaInicio: '18:00',
        horaFin: '23:00',
        precio: 34,
      },
      {
        id: 'rp-5',
        descripcion: 'Fin de semana completo',
        dias: [6, 7],
        horaInicio: '09:00',
        horaFin: '22:00',
        precio: 32,
      },
    ],
  },
  {
    id: 'can-3',
    nombre: 'Fútbol 7 - Norte',
    tipo: 'futbol_7',
    descripcion:
      'Campo de fútbol 7 con césped artificial de última generación y porterías reglamentarias.',
    precioBase: 45,
    estado: 'activa',
    imagenes: ['/imagenes/futbol7-norte.jpg'],
    diasAbiertos: [1, 2, 3, 4, 5, 6, 7],
    horaApertura: '09:00',
    horaCierre: '23:00',
    reglasPrecio: [
      {
        id: 'rp-6',
        descripcion: 'Franja nocturna con iluminación',
        dias: [1, 2, 3, 4, 5],
        horaInicio: '19:00',
        horaFin: '23:00',
        precio: 60,
      },
      {
        id: 'rp-7',
        descripcion: 'Sábado y domingo por la mañana',
        dias: [6, 7],
        horaInicio: '09:00',
        horaFin: '14:00',
        precio: 55,
      },
    ],
  },
  {
    id: 'can-4',
    nombre: 'Fútbol 7 - Sur',
    tipo: 'futbol_7',
    descripcion: 'Campo de fútbol 7 gemelo al norte. Comparte vestuarios con el campo principal.',
    precioBase: 45,
    estado: 'activa',
    imagenes: ['/imagenes/futbol7-sur.jpg'],
    diasAbiertos: [1, 2, 3, 4, 5, 6, 7],
    horaApertura: '09:00',
    horaCierre: '23:00',
    reglasPrecio: [
      {
        id: 'rp-8',
        descripcion: 'Franja nocturna con iluminación',
        dias: [1, 2, 3, 4, 5],
        horaInicio: '19:00',
        horaFin: '23:00',
        precio: 60,
      },
    ],
  },
  {
    id: 'can-5',
    nombre: 'Campo principal',
    tipo: 'futbol_11',
    descripcion:
      'Campo de fútbol 11 reglamentario con gradas para 400 espectadores. Requiere reserva con 48 horas de antelación.',
    precioBase: 95,
    estado: 'activa',
    imagenes: ['/imagenes/campo-principal.jpg', '/imagenes/campo-principal-gradas.jpg'],
    diasAbiertos: [1, 2, 3, 4, 5, 6, 7],
    horaApertura: '09:00',
    horaCierre: '22:00',
    excepcionHorario: 'Cierra a las 22:00 aunque el polideportivo siga abierto, por normativa de ruido.',
    reglasPrecio: [
      {
        id: 'rp-9',
        descripcion: 'Franja nocturna con iluminación',
        dias: [1, 2, 3, 4, 5],
        horaInicio: '19:00',
        horaFin: '22:00',
        precio: 130,
      },
      {
        id: 'rp-10',
        descripcion: 'Jornada de competición de fin de semana',
        dias: [6, 7],
        horaInicio: '09:00',
        horaFin: '22:00',
        precio: 120,
      },
    ],
  },
  {
    id: 'can-6',
    nombre: 'Tenis 1',
    tipo: 'tenis',
    descripcion: 'Pista de tenis de resina acrílica con iluminación nocturna.',
    precioBase: 18,
    estado: 'activa',
    imagenes: ['/imagenes/tenis-1.jpg'],
    diasAbiertos: [1, 2, 3, 4, 5, 6, 7],
    horaApertura: '08:00',
    horaCierre: '22:00',
    reglasPrecio: [
      {
        id: 'rp-11',
        descripcion: 'Franja de tarde entre semana',
        dias: [1, 2, 3, 4, 5],
        horaInicio: '17:00',
        horaFin: '22:00',
        precio: 24,
      },
    ],
  },
  {
    id: 'can-7',
    nombre: 'Tenis 2',
    tipo: 'tenis',
    descripcion:
      'Pista de tenis de tierra batida. Cerrada temporalmente por renovación de la superficie.',
    precioBase: 20,
    estado: 'desactivada',
    imagenes: ['/imagenes/tenis-2.jpg'],
    diasAbiertos: [1, 2, 3, 4, 5, 6],
    horaApertura: '08:00',
    horaCierre: '21:00',
    reglasPrecio: [],
  },
  {
    id: 'can-8',
    nombre: 'Pabellón cubierto',
    tipo: 'basquet',
    descripcion:
      'Pista polivalente de parqué para básquet y fútbol sala, con marcador electrónico y gradas retráctiles.',
    precioBase: 38,
    estado: 'activa',
    imagenes: ['/imagenes/pabellon.jpg'],
    diasAbiertos: [1, 2, 3, 4, 5, 6, 7],
    horaApertura: '08:00',
    horaCierre: '23:00',
    reglasPrecio: [
      {
        id: 'rp-12',
        descripcion: 'Franja de tarde entre semana',
        dias: [1, 2, 3, 4, 5],
        horaInicio: '18:00',
        horaFin: '23:00',
        precio: 48,
      },
      {
        id: 'rp-13',
        descripcion: 'Temporada de liga escolar',
        dias: [6],
        horaInicio: '09:00',
        horaFin: '14:00',
        temporada: 'Octubre a mayo',
        precio: 42,
      },
    ],
  },
]

/** Only these appear as bookable options in the calendar and booking forms. */
export const canchasActivas = canchas.filter((cancha) => cancha.estado === 'activa')

export function canchaPorId(id: string): Cancha | undefined {
  return canchas.find((cancha) => cancha.id === id)
}
