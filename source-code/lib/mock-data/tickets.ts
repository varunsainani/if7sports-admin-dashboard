import type { Ticket } from '@/lib/types'
import { HOY, desplazarDias } from './base'

/**
 * Support threads between the polideportivo and IF7SPORTS.
 *
 * Written as the exchanges a facility actually has with its platform provider:
 * a payout that has not landed, a court that will not save, a question about
 * commission on a corporate booking. Filler text here would waste the one
 * screen that shows the relationship between the two businesses.
 */
export const tickets: Ticket[] = [
  {
    id: 'TCK-1042',
    tipo: 'administrativo',
    asunto: 'Liquidación de julio pendiente de abono',
    descripcion:
      'La liquidación correspondiente a julio figura como emitida en el panel pero todavía no se ha abonado en la cuenta. Adjunto el extracto bancario del periodo.',
    estado: 'en_curso',
    fecha: `${desplazarDias(HOY, -5)}T09:14:00`,
    ultimaRespuesta: `${desplazarDias(HOY, -1)}T12:30:00`,
    mensajes: [
      {
        id: 'msg-1',
        autor: 'María Belenguer',
        esIF7: false,
        fecha: `${desplazarDias(HOY, -5)}T09:14:00`,
        cuerpo:
          'La liquidación de julio figura como emitida el día 2 pero no ha entrado en cuenta. Adjunto el extracto del periodo para que lo comprobéis.',
        adjuntos: ['extracto-julio-2026.pdf'],
      },
      {
        id: 'msg-2',
        autor: 'Soporte IF7SPORTS',
        esIF7: true,
        fecha: `${desplazarDias(HOY, -4)}T10:02:00`,
        cuerpo:
          'Gracias, María. Lo hemos localizado: la transferencia se rechazó por un dígito incorrecto en el IBAN registrado. Confírmanos el número completo y la reemitimos.',
        adjuntos: [],
      },
      {
        id: 'msg-3',
        autor: 'María Belenguer',
        esIF7: false,
        fecha: `${desplazarDias(HOY, -2)}T08:45:00`,
        cuerpo: 'Confirmado, el IBAN correcto termina en 4471. Ya lo he actualizado en la configuración.',
        adjuntos: [],
      },
      {
        id: 'msg-4',
        autor: 'Soporte IF7SPORTS',
        esIF7: true,
        fecha: `${desplazarDias(HOY, -1)}T12:30:00`,
        cuerpo:
          'Perfecto. Hemos reemitido la transferencia con el IBAN nuevo, debería estar disponible en un plazo de 48 horas. Dejamos la solicitud abierta hasta que lo confirmes.',
        adjuntos: [],
      },
    ],
  },
  {
    id: 'TCK-1039',
    tipo: 'tecnico',
    asunto: 'No se guardan las reglas de precio de Pádel 2',
    descripcion:
      'Al añadir una regla de precio para la franja de tarde en Pádel 2, el formulario se cierra pero la regla no aparece en el listado.',
    estado: 'cerrado',
    fecha: `${desplazarDias(HOY, -18)}T17:22:00`,
    ultimaRespuesta: `${desplazarDias(HOY, -15)}T11:10:00`,
    mensajes: [
      {
        id: 'msg-5',
        autor: 'Rubén Ferrer',
        esIF7: false,
        fecha: `${desplazarDias(HOY, -18)}T17:22:00`,
        cuerpo:
          'Intento añadir una regla de 18:00 a 23:00 en Pádel 2 y al guardar no se registra. Lo he probado en Chrome y en Firefox con el mismo resultado.',
        adjuntos: ['captura-error.png'],
      },
      {
        id: 'msg-6',
        autor: 'Soporte IF7SPORTS',
        esIF7: true,
        fecha: `${desplazarDias(HOY, -17)}T09:40:00`,
        cuerpo:
          'Reproducido. El fallo se daba cuando la hora de fin coincidía exactamente con el cierre de la cancha. Lo corregimos en el despliegue de esta noche.',
        adjuntos: [],
      },
      {
        id: 'msg-7',
        autor: 'Soporte IF7SPORTS',
        esIF7: true,
        fecha: `${desplazarDias(HOY, -15)}T11:10:00`,
        cuerpo: 'Ya está desplegado. Confírmanos que puedes guardar la regla y cerramos.',
        adjuntos: [],
      },
    ],
  },
  {
    id: 'TCK-1051',
    tipo: 'comercial',
    asunto: 'Comisión aplicable a reservas de empresa',
    descripcion:
      'Una empresa quiere contratar el campo principal de forma recurrente los viernes. Necesitamos saber qué comisión se aplica en ese caso.',
    estado: 'abierto',
    fecha: `${desplazarDias(HOY, -1)}T16:05:00`,
    ultimaRespuesta: `${desplazarDias(HOY, -1)}T16:05:00`,
    mensajes: [
      {
        id: 'msg-8',
        autor: 'María Belenguer',
        esIF7: false,
        fecha: `${desplazarDias(HOY, -1)}T16:05:00`,
        cuerpo:
          'Tenemos una empresa interesada en reservar el campo principal todos los viernes de 19:00 a 21:00 durante la temporada. ¿Se aplica la comisión estándar o hay condiciones para reservas recurrentes de este volumen?',
        adjuntos: [],
      },
    ],
  },
  {
    id: 'TCK-1028',
    tipo: 'tecnico',
    asunto: 'Las notificaciones por correo llegan duplicadas',
    descripcion:
      'Desde hace una semana cada reserva nueva genera dos correos idénticos al administrador.',
    estado: 'cerrado',
    fecha: `${desplazarDias(HOY, -34)}T10:18:00`,
    ultimaRespuesta: `${desplazarDias(HOY, -30)}T14:52:00`,
    mensajes: [
      {
        id: 'msg-9',
        autor: 'María Belenguer',
        esIF7: false,
        fecha: `${desplazarDias(HOY, -34)}T10:18:00`,
        cuerpo: 'Cada reserva nueva nos llega por duplicado al correo de administración.',
        adjuntos: [],
      },
      {
        id: 'msg-10',
        autor: 'Soporte IF7SPORTS',
        esIF7: true,
        fecha: `${desplazarDias(HOY, -30)}T14:52:00`,
        cuerpo:
          'El correo estaba dado de alta dos veces en las preferencias de notificación, una a nivel de usuario y otra a nivel de polideportivo. Hemos eliminado la duplicada.',
        adjuntos: [],
      },
    ],
  },
  {
    id: 'TCK-1055',
    tipo: 'administrativo',
    asunto: 'Alta de un segundo colaborador con acceso a métricas',
    descripcion:
      'Queremos dar acceso solo al módulo de métricas a la persona que lleva la contabilidad.',
    estado: 'abierto',
    fecha: `${HOY}T09:30:00`,
    ultimaRespuesta: `${HOY}T09:30:00`,
    mensajes: [
      {
        id: 'msg-11',
        autor: 'María Belenguer',
        esIF7: false,
        fecha: `${HOY}T09:30:00`,
        cuerpo:
          'He creado el usuario de Cristina con permisos de métricas y clientes, pero no le ha llegado la contraseña temporal. ¿Podéis comprobar el envío?',
        adjuntos: [],
      },
    ],
  },
]

export function ticketPorId(id: string): Ticket | undefined {
  return tickets.find((ticket) => ticket.id === id)
}
