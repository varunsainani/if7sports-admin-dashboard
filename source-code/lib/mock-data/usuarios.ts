import type { Modulo, Permisos, Usuario } from '@/lib/types'
import { HOY, desplazarDias } from './base'

/** Every module granted. What an admin principal always holds. */
export const TODOS_LOS_PERMISOS: Permisos = {
  reservas: true,
  canchas: true,
  clientes: true,
  configuracion: true,
  metricas: true,
  bloqueos: true,
  instructores: true,
  soporte: true,
}

export const SIN_PERMISOS: Permisos = {
  reservas: false,
  canchas: false,
  clientes: false,
  configuracion: false,
  metricas: false,
  bloqueos: false,
  instructores: false,
  soporte: false,
}

export function permisos(...concedidos: Modulo[]): Permisos {
  const salida = { ...SIN_PERMISOS }
  for (const modulo of concedidos) salida[modulo] = true
  return salida
}

/**
 * The facility's staff.
 *
 * The colaboradores deliberately hold different permission sets, because the
 * sidebar filters itself by permission and a demo where everyone sees
 * everything cannot show that. Switching to Rubén hides Configuración and
 * Métricas; switching to Lidia leaves only the front-desk modules.
 */
export const usuarios: Usuario[] = [
  {
    id: 'usr-1',
    nombre: 'María Belenguer',
    correo: 'maria@ciutatdellevant.es',
    rol: 'admin_principal',
    permisos: TODOS_LOS_PERMISOS,
    ultimoLogin: `${HOY}T08:12:00`,
    estado: 'activo',
    requiereCambioPassword: false,
  },
  {
    id: 'usr-2',
    nombre: 'Rubén Ferrer',
    correo: 'ruben@ciutatdellevant.es',
    rol: 'colaborador',
    permisos: permisos('reservas', 'clientes', 'bloqueos', 'canchas', 'instructores', 'soporte'),
    ultimoLogin: `${desplazarDias(HOY, -1)}T19:45:00`,
    estado: 'activo',
    requiereCambioPassword: false,
  },
  {
    id: 'usr-3',
    nombre: 'Lidia Ochoa',
    correo: 'lidia@ciutatdellevant.es',
    rol: 'colaborador',
    permisos: permisos('reservas', 'clientes'),
    ultimoLogin: `${desplazarDias(HOY, -3)}T16:20:00`,
    estado: 'activo',
    requiereCambioPassword: false,
  },
  {
    id: 'usr-4',
    nombre: 'Pau Estellés',
    correo: 'pau@ciutatdellevant.es',
    rol: 'colaborador',
    permisos: permisos('bloqueos', 'instructores', 'canchas'),
    ultimoLogin: `${desplazarDias(HOY, -12)}T11:05:00`,
    estado: 'activo',
    requiereCambioPassword: false,
  },
  {
    id: 'usr-5',
    nombre: 'Cristina Alabau',
    correo: 'cristina@ciutatdellevant.es',
    rol: 'colaborador',
    permisos: permisos('metricas', 'clientes'),
    // Never logged in: the temporary password mailed on creation is unused, so
    // this row is what the "resetear contraseña" action produces.
    ultimoLogin: null,
    estado: 'activo',
    requiereCambioPassword: true,
  },
  {
    id: 'usr-6',
    nombre: 'Joan Mompó',
    correo: 'joan@ciutatdellevant.es',
    rol: 'colaborador',
    permisos: permisos('reservas'),
    ultimoLogin: `${desplazarDias(HOY, -74)}T09:30:00`,
    estado: 'desactivado',
    requiereCambioPassword: false,
  },
]

/** The signed-in user. The demo role switcher swaps this out. */
export const usuarioActual: Usuario = usuarios[0]

export function usuarioPorId(id: string): Usuario | undefined {
  return usuarios.find((usuario) => usuario.id === id)
}

/** Human-readable summary for the permisos column on the users table. */
export function resumirPermisos(usuario: Usuario): string {
  if (usuario.rol === 'admin_principal') return 'Todos los módulos'

  const concedidos = (Object.keys(usuario.permisos) as Modulo[]).filter(
    (modulo) => usuario.permisos[modulo]
  )

  if (concedidos.length === 0) return 'Sin módulos asignados'
  if (concedidos.length === 8) return 'Todos los módulos'
  return `${concedidos.length} de 8 módulos`
}
