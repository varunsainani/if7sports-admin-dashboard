'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, KeyRound, MailCheck, ShieldCheck } from 'lucide-react'

import { cn } from '@/lib/utils'
import { polideportivo } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import { Campo, Input } from '@/components/ui/input'
import { Marca } from '@/components/shell/sidebar'
import { Toaster, toast } from '@/components/ui/toast'

/**
 * Login, and the three flows that hang off it: the 2FA step revealed after a
 * correct password, the forced password change on a new admin's first entry,
 * and password recovery by email.
 *
 * All four are one screen with a step, rather than four routes. That mirrors
 * how it actually behaves: you never navigate to the 2FA page, you arrive at it
 * by getting the password right.
 *
 * The left panel is the court-marking language at full size. It is the only
 * place in the product with room for it, and it is the first thing anyone sees.
 */

type Paso = 'credenciales' | 'dos_factores' | 'cambio_obligatorio' | 'recuperar' | 'enviado'

function PanelIzquierdo() {
  return (
    <aside className="relative hidden overflow-hidden bg-cesped-800 lg:block">
      {/* A full pitch, drawn in line paint. Same language as the empty states,
          at the one size where it can carry a whole panel. */}
      <svg
        viewBox="0 0 400 600"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 size-full"
        aria-hidden
      >
        <rect width="400" height="600" fill="var(--cesped-800)" />

        {/* mown stripes */}
        {Array.from({ length: 8 }).map((_, i) => (
          <rect
            key={i}
            x="0"
            y={i * 75}
            width="400"
            height="75"
            fill={i % 2 === 0 ? 'var(--cesped-700)' : 'transparent'}
            opacity="0.55"
          />
        ))}

        <g stroke="var(--cesped-200)" strokeWidth="2" fill="none" opacity="0.65">
          <rect x="40" y="40" width="320" height="520" />
          <line x1="40" y1="300" x2="360" y2="300" />
          <circle cx="200" cy="300" r="62" />
          <circle cx="200" cy="300" r="3" fill="var(--cesped-200)" />
          <rect x="120" y="40" width="160" height="90" />
          <rect x="160" y="40" width="80" height="40" />
          <rect x="120" y="470" width="160" height="90" />
          <rect x="160" y="520" width="80" height="40" />
          <path d="M40 60 A20 20 0 0 0 60 40" />
          <path d="M360 60 A20 20 0 0 1 340 40" />
          <path d="M40 540 A20 20 0 0 1 60 560" />
          <path d="M360 540 A20 20 0 0 0 340 560" />
        </g>
      </svg>

      <div className="relative flex h-full flex-col justify-between p-10">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded bg-cal-50">
            <Marca className="size-7" />
          </span>
          <div>
            <p className="font-display text-md font-semibold text-white">IF7SPORTS</p>
            <p className="text-2xs text-cesped-200">Panel de polideportivo</p>
          </div>
        </div>

        <div className="rounded-lg bg-cesped-900/45 p-5 backdrop-blur-[2px]">
          <p className="max-w-[26rem] font-display text-2xl font-semibold leading-tight tracking-display text-white">
            Tus canchas, tus reservas y tus cuentas en una sola pantalla.
          </p>
          <p className="mt-3 max-w-[26rem] text-sm text-cesped-100">
            Gestiona canchas, horarios, precios y clientes del {polideportivo.nombre}.
          </p>
        </div>
      </div>
    </aside>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [paso, setPaso] = React.useState<Paso>('credenciales')
  const [correo, setCorreo] = React.useState('maria@ciutatdellevant.es')
  const [codigo, setCodigo] = React.useState('')

  return (
    <div className="grid min-h-screen grid-rows-1 lg:grid-cols-[minmax(0,440px)_1fr]">
      <main className="flex flex-col justify-center px-6 py-10 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          {/* mark, shown here only when the left panel is hidden */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <Marca className="size-8" />
            <div>
              <p className="font-display text-sm font-semibold text-tinta">IF7SPORTS</p>
              <p className="text-2xs text-apagado">Panel de polideportivo</p>
            </div>
          </div>

          {/* ------------------------------------------------- credentials */}
          {paso === 'credenciales' && (
            <>
              <h1 className="font-display text-2xl font-semibold tracking-display text-tinta">
                Entra en tu panel
              </h1>
              <p className="mt-1.5 text-base text-apagado">
                Accede con el correo con el que gestionas el polideportivo.
              </p>

              <form
                className="mt-7 space-y-4"
                onSubmit={(evento) => {
                  evento.preventDefault()
                  setPaso('dos_factores')
                }}
              >
                <Campo etiqueta="Correo electrónico" htmlFor="login-correo" requerido>
                  <Input
                    id="login-correo"
                    type="email"
                    autoComplete="username"
                    value={correo}
                    onChange={(evento) => setCorreo(evento.target.value)}
                  />
                </Campo>

                <Campo etiqueta="Contraseña" htmlFor="login-password" requerido>
                  <Input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    defaultValue="demo1234"
                  />
                </Campo>

                <Button type="submit" size="lg" className="w-full">
                  Entrar
                </Button>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setPaso('recuperar')}
                    className="text-xs text-primario hover:underline"
                  >
                    Recuperar contraseña
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaso('cambio_obligatorio')}
                    className="text-xs text-apagado hover:text-tinta hover:underline"
                  >
                    Ver el primer acceso
                  </button>
                </div>
              </form>
            </>
          )}

          {/* -------------------------------------------------------- 2FA
              Only reachable after the password step, exactly as the brief
              describes: revealed after the correct password. */}
          {paso === 'dos_factores' && (
            <>
              <span className="mb-4 flex size-10 items-center justify-center rounded-full bg-cesped-50">
                <ShieldCheck className="size-5 text-primario" aria-hidden />
              </span>

              <h1 className="font-display text-2xl font-semibold tracking-display text-tinta">
                Introduce tu código
              </h1>
              <p className="mt-1.5 text-base text-apagado">
                Abre tu aplicación de autenticación y escribe el código de seis dígitos.
              </p>

              <form
                className="mt-7 space-y-4"
                onSubmit={(evento) => {
                  evento.preventDefault()
                  router.push('/')
                }}
              >
                <Campo etiqueta="Código de verificación" htmlFor="login-2fa" requerido>
                  <Input
                    id="login-2fa"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="000000"
                    value={codigo}
                    onChange={(evento) => setCodigo(evento.target.value.replace(/\D/g, ''))}
                    className="text-center font-mono text-lg tracking-[0.5em]"
                  />
                </Campo>

                <Button type="submit" size="lg" className="w-full">
                  Verificar y entrar
                </Button>

                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setPaso('credenciales')}
                    className="flex items-center gap-1.5 text-xs text-apagado hover:text-tinta"
                  >
                    <ArrowLeft className="size-3" aria-hidden />
                    Volver
                  </button>
                  <button
                    type="button"
                    onClick={() => toast.info('Usa uno de tus códigos de recuperación')}
                    className="text-xs text-primario hover:underline"
                  >
                    No tengo el teléfono
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ------------------------------------------- forced change */}
          {paso === 'cambio_obligatorio' && (
            <>
              <span className="mb-4 flex size-10 items-center justify-center rounded-full bg-pendiente-bg">
                <KeyRound className="size-5 text-pendiente-texto" aria-hidden />
              </span>

              <h1 className="font-display text-2xl font-semibold tracking-display text-tinta">
                Crea tu contraseña
              </h1>
              <p className="mt-1.5 text-base text-apagado">
                Has entrado con la contraseña temporal que te enviamos por correo. Elige una propia
                para continuar.
              </p>

              <form
                className="mt-7 space-y-4"
                onSubmit={(evento) => {
                  evento.preventDefault()
                  toast.exito('Contraseña creada')
                  router.push('/')
                }}
              >
                <Campo etiqueta="Contraseña temporal" htmlFor="cambio-temporal" requerido>
                  <Input id="cambio-temporal" type="password" autoComplete="current-password" />
                </Campo>

                <Campo
                  etiqueta="Nueva contraseña"
                  htmlFor="cambio-nueva"
                  requerido
                  ayuda="Al menos 10 caracteres, con una mayúscula y un número."
                >
                  <Input id="cambio-nueva" type="password" autoComplete="new-password" />
                </Campo>

                <Campo etiqueta="Repite la nueva contraseña" htmlFor="cambio-repetir" requerido>
                  <Input id="cambio-repetir" type="password" autoComplete="new-password" />
                </Campo>

                <Button type="submit" size="lg" className="w-full">
                  Guardar y entrar
                </Button>

                <button
                  type="button"
                  onClick={() => setPaso('credenciales')}
                  className="flex items-center gap-1.5 text-xs text-apagado hover:text-tinta"
                >
                  <ArrowLeft className="size-3" aria-hidden />
                  Volver al inicio de sesión
                </button>
              </form>
            </>
          )}

          {/* -------------------------------------------------- recovery */}
          {paso === 'recuperar' && (
            <>
              <h1 className="font-display text-2xl font-semibold tracking-display text-tinta">
                Recuperar contraseña
              </h1>
              <p className="mt-1.5 text-base text-apagado">
                Escribe tu correo y te enviamos un enlace para elegir una contraseña nueva.
              </p>

              <form
                className="mt-7 space-y-4"
                onSubmit={(evento) => {
                  evento.preventDefault()
                  setPaso('enviado')
                }}
              >
                <Campo etiqueta="Correo electrónico" htmlFor="recuperar-correo" requerido>
                  <Input
                    id="recuperar-correo"
                    type="email"
                    autoComplete="username"
                    value={correo}
                    onChange={(evento) => setCorreo(evento.target.value)}
                  />
                </Campo>

                <Button type="submit" size="lg" className="w-full">
                  Enviar enlace
                </Button>

                <button
                  type="button"
                  onClick={() => setPaso('credenciales')}
                  className="flex items-center gap-1.5 text-xs text-apagado hover:text-tinta"
                >
                  <ArrowLeft className="size-3" aria-hidden />
                  Volver al inicio de sesión
                </button>
              </form>
            </>
          )}

          {/* ---------------------------------------------------- sent */}
          {paso === 'enviado' && (
            <>
              <span className="mb-4 flex size-10 items-center justify-center rounded-full bg-confirmada-bg">
                <MailCheck className="size-5 text-confirmada-texto" aria-hidden />
              </span>

              <h1 className="font-display text-2xl font-semibold tracking-display text-tinta">
                Revisa tu correo
              </h1>
              <p className="mt-1.5 text-base text-apagado">
                Si <span className="text-tinta">{correo}</span> tiene una cuenta, encontrarás el
                enlace en unos minutos. Caduca en una hora.
              </p>

              <div className="mt-7 space-y-3">
                <Button variant="secundario" size="lg" className="w-full" onClick={() => setPaso('recuperar')}>
                  Usar otro correo
                </Button>
                <button
                  type="button"
                  onClick={() => setPaso('credenciales')}
                  className={cn(
                    'flex w-full items-center justify-center gap-1.5 text-xs text-apagado',
                    'hover:text-tinta'
                  )}
                >
                  <ArrowLeft className="size-3" aria-hidden />
                  Volver al inicio de sesión
                </button>
              </div>
            </>
          )}

          <p className="mt-10 text-2xs text-apagado">
            ¿Problemas para entrar? Escribe a{' '}
            <Link href="/soporte" className="text-primario hover:underline">
              soporte de IF7SPORTS
            </Link>
            .
          </p>
        </div>
      </main>

      <PanelIzquierdo />
      <Toaster />
    </div>
  )
}
