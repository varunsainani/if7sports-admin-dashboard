'use client'

import * as React from 'react'
import { useSearchParams } from 'next/navigation'
import { Copy, LogOut, Save, ShieldCheck, Smartphone } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useDemo } from '@/lib/demo-context'
import { ROL } from '@/lib/estados'
import { Button } from '@/components/ui/button'
import { Avatar, CheckboxCampo, Switch } from '@/components/ui/controls'
import { Campo, Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PageHeader, Section } from '@/components/ui/page'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/components/ui/toast'

/**
 * Mi perfil: personal data, password, two-factor and notification preferences.
 *
 * Role is read-only here. Someone changing their own role would be a privilege
 * escalation, so it is stated as a fact with a note on who can change it.
 */

const EVENTOS_NOTIFICACION = [
  {
    id: 'reservas-nuevas',
    etiqueta: 'Reservas nuevas',
    descripcion: 'Cada vez que un cliente reserva una cancha.',
    activo: true,
  },
  {
    id: 'reservas-pendientes',
    etiqueta: 'Reservas pendientes de confirmar',
    descripcion: 'Resumen diario de las que llevan más de 24 horas esperando.',
    activo: true,
  },
  {
    id: 'cancelaciones',
    etiqueta: 'Cancelaciones',
    descripcion: 'Cuando se cancela una reserva ya confirmada.',
    activo: true,
  },
  {
    id: 'devoluciones',
    etiqueta: 'Devoluciones procesadas',
    descripcion: 'Cuando se devuelve el importe de una reserva.',
    activo: false,
  },
  {
    id: 'soporte',
    etiqueta: 'Respuestas de IF7SPORTS',
    descripcion: 'Cuando el equipo responde a una solicitud de soporte.',
    activo: true,
  },
  {
    id: 'ocupacion',
    etiqueta: 'Alertas de ocupación',
    descripcion: 'Cuando una cancha baja del umbral que hayas fijado.',
    activo: false,
  },
]

/** Recovery codes, shown once when two-factor is enabled. */
const CODIGOS_RECUPERACION = [
  '4F7K-92QD',
  'M3XR-8PLV',
  'B6TN-41WZ',
  'K9HD-73CJ',
  'R2VY-58GM',
  'T8QF-16NB',
]

/** QR stand-in, drawn rather than fetched so the page stays self-contained. */
function CodigoQR() {
  const celdas = Array.from({ length: 25 * 25 }, (_, i) => {
    const x = i % 25
    const y = Math.floor(i / 25)
    // Deterministic pattern: no Math.random, so server and client agree.
    return (x * 7 + y * 13 + ((x * y) % 5)) % 3 === 0
  })

  return (
    <svg viewBox="0 0 25 25" className="size-40 rounded border border-borde bg-white p-1" aria-label="Código QR de configuración">
      {celdas.map((lleno, i) => {
        const x = i % 25
        const y = Math.floor(i / 25)
        const enEsquina =
          (x < 7 && y < 7) || (x > 17 && y < 7) || (x < 7 && y > 17)
        if (enEsquina || !lleno) return null
        return <rect key={i} x={x} y={y} width="1" height="1" fill="var(--cal-900)" />
      })}
      {/* finder patterns */}
      {[
        [0, 0],
        [18, 0],
        [0, 18],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={x} y={y} width="7" height="7" fill="var(--cal-900)" />
          <rect x={x + 1} y={y + 1} width="5" height="5" fill="#ffffff" />
          <rect x={x + 2} y={y + 2} width="3" height="3" fill="var(--cal-900)" />
        </g>
      ))}
    </svg>
  )
}

const SECCIONES = ['datos', 'password', '2fa', 'notificaciones'] as const

function Perfil() {
  const { usuario } = useDemo()
  const searchParams = useSearchParams()
  const [dosFactores, setDosFactores] = React.useState(true)

  // The header menu links straight to a section, so the tab has to follow the
  // URL rather than always opening on the first one.
  const seccionUrl = searchParams.get('seccion')
  const inicial = SECCIONES.includes(seccionUrl as (typeof SECCIONES)[number])
    ? (seccionUrl as (typeof SECCIONES)[number])
    : 'datos'
  const [seccion, setSeccion] = React.useState<string>(inicial)

  React.useEffect(() => setSeccion(inicial), [inicial])

  return (
    <>
      <PageHeader
        titulo="Mi perfil"
        descripcion="Tus datos, tu contraseña y cómo quieres recibir los avisos."
      />

      <Tabs value={seccion} onValueChange={setSeccion}>
        <TabsList>
          <TabsTrigger value="datos">Datos personales</TabsTrigger>
          <TabsTrigger value="password">Contraseña</TabsTrigger>
          <TabsTrigger value="2fa">Verificación en dos pasos</TabsTrigger>
          <TabsTrigger value="notificaciones">Notificaciones</TabsTrigger>
        </TabsList>

        {/* --------------------------------------------------- personal data */}
        <TabsContent value="datos">
          <Card>
            <CardContent className="pt-5">
              <div className="mb-6 flex items-center gap-4">
                <Avatar nombre={usuario.nombre} size="xl" />
                <div>
                  <Button variant="secundario" size="sm">
                    Cambiar foto
                  </Button>
                  <p className="mt-1.5 text-2xs text-apagado">
                    Sin foto se muestran tus iniciales.
                  </p>
                </div>
              </div>

              <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
                <Campo etiqueta="Nombre" htmlFor="perfil-nombre" requerido>
                  <Input id="perfil-nombre" defaultValue={usuario.nombre} />
                </Campo>

                <Campo etiqueta="Correo electrónico" htmlFor="perfil-correo" requerido>
                  <Input id="perfil-correo" type="email" defaultValue={usuario.correo} />
                </Campo>

                <Campo
                  etiqueta="Rol"
                  htmlFor="perfil-rol"
                  ayuda="Solo el admin principal puede cambiar roles, desde Usuarios y permisos."
                >
                  <Input id="perfil-rol" value={ROL[usuario.rol].etiqueta} readOnly disabled />
                </Campo>
              </div>

              <div className="mt-6">
                <Button onClick={() => toast.exito('Cambios guardados')}>
                  <Save aria-hidden />
                  Guardar cambios
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ------------------------------------------------------- password */}
        <TabsContent value="password">
          <Card className="max-w-xl">
            <CardContent className="space-y-4 pt-5">
              <Campo etiqueta="Contraseña actual" htmlFor="password-actual" requerido>
                <Input id="password-actual" type="password" autoComplete="current-password" />
              </Campo>

              <Campo
                etiqueta="Nueva contraseña"
                htmlFor="password-nueva"
                requerido
                ayuda="Al menos 10 caracteres, con una mayúscula y un número."
              >
                <Input id="password-nueva" type="password" autoComplete="new-password" />
              </Campo>

              <Campo etiqueta="Repite la nueva contraseña" htmlFor="password-repetir" requerido>
                <Input id="password-repetir" type="password" autoComplete="new-password" />
              </Campo>

              <Button onClick={() => toast.exito('Contraseña cambiada')}>
                Cambiar contraseña
              </Button>
            </CardContent>
          </Card>

          <Section titulo="Sesiones" className="mt-8">
            <Card className="max-w-xl">
              <CardContent className="pt-5">
                <p className="text-base text-tinta-media">
                  Si has entrado desde un ordenador que ya no usas, cierra la sesión en todos los
                  dispositivos. Tendrás que volver a entrar también en este.
                </p>
                <Button
                  variant="peligro-suave"
                  className="mt-4"
                  onClick={() => toast.exito('Sesiones cerradas en todos los dispositivos')}
                >
                  <LogOut aria-hidden />
                  Cerrar sesión en todos los dispositivos
                </Button>
              </CardContent>
            </Card>
          </Section>
        </TabsContent>

        {/* ------------------------------------------------------------ 2FA */}
        <TabsContent value="2fa">
          <Card className="max-w-3xl">
            <CardHeader>
              <div>
                <CardTitle className="text-base">Verificación en dos pasos</CardTitle>
                <CardDescription>
                  Añade un código de un solo uso al entrar, además de la contraseña.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2.5">
                <Switch
                  checked={dosFactores}
                  onCheckedChange={(valor) => {
                    setDosFactores(valor)
                    toast.exito(
                      valor ? 'Verificación en dos pasos activada' : 'Verificación en dos pasos desactivada'
                    )
                  }}
                  aria-label="Verificación en dos pasos"
                />
                <span className="text-sm text-tinta-media">
                  {dosFactores ? 'Activada' : 'Desactivada'}
                </span>
              </div>
            </CardHeader>

            {dosFactores && (
              <CardContent className="border-t border-borde pt-5">
                <div className="grid gap-6 sm:grid-cols-[auto_1fr]">
                  <div>
                    <CodigoQR />
                  </div>

                  <div>
                    <p className="flex items-center gap-2 text-base font-medium text-tinta">
                      <Smartphone className="size-4 text-primario" aria-hidden />
                      Escanea el código con tu aplicación de autenticación
                    </p>
                    <p className="mt-1.5 text-sm text-apagado">
                      Google Authenticator, Authy o cualquier aplicación compatible con TOTP.
                      También puedes introducir la clave a mano.
                    </p>

                    <div className="mt-3 flex items-center gap-2">
                      <code className="rounded border border-borde bg-superficie-alt px-2.5 py-1.5 text-xs">
                        K7QM 4RXP 92LD 8TVB
                      </code>
                      <Button
                        variant="fantasma"
                        size="icono-sm"
                        aria-label="Copiar la clave"
                        onClick={() => toast.exito('Clave copiada')}
                      >
                        <Copy aria-hidden />
                      </Button>
                    </div>

                    <div className="mt-6">
                      <p className="flex items-center gap-2 text-base font-medium text-tinta">
                        <ShieldCheck className="size-4 text-primario" aria-hidden />
                        Códigos de recuperación
                      </p>
                      <p className="mt-1.5 text-sm text-apagado">
                        Guárdalos en un lugar seguro. Cada uno sirve una sola vez y son la única
                        forma de entrar si pierdes el teléfono.
                      </p>

                      <ul className="mt-3 grid max-w-md grid-cols-2 gap-1.5 sm:grid-cols-3">
                        {CODIGOS_RECUPERACION.map((codigo) => (
                          <li
                            key={codigo}
                            className={cn(
                              'rounded border border-borde bg-superficie-alt px-2 py-1.5',
                              'text-center font-mono text-2xs text-tinta numeros-tabulares'
                            )}
                          >
                            {codigo}
                          </li>
                        ))}
                      </ul>

                      <Button
                        variant="secundario"
                        size="sm"
                        className="mt-3"
                        onClick={() => toast.exito('Códigos copiados')}
                      >
                        <Copy aria-hidden />
                        Copiar todos
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>

        {/* ----------------------------------------------- notifications */}
        <TabsContent value="notificaciones">
          <Card className="max-w-2xl">
            <CardHeader>
              <div>
                <CardTitle className="text-base">Avisos que quieres recibir</CardTitle>
                <CardDescription>
                  Los avisos aparecen en la campana del panel y se envían a {usuario.correo}.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-3.5 border-t border-borde pt-5">
              {EVENTOS_NOTIFICACION.map((evento) => (
                <CheckboxCampo
                  key={evento.id}
                  id={evento.id}
                  etiqueta={evento.etiqueta}
                  descripcion={evento.descripcion}
                  defaultChecked={evento.activo}
                />
              ))}

              <div className="pt-2">
                <Button onClick={() => toast.exito('Preferencias guardadas')}>
                  <Save aria-hidden />
                  Guardar preferencias
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}

export default function PerfilPage() {
  return (
    <React.Suspense fallback={null}>
      <Perfil />
    </React.Suspense>
  )
}
