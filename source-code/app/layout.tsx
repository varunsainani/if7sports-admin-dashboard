import type { Metadata } from 'next'
import { Archivo, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'
import '@/lib/tokens.css'
import './globals.css'

/**
 * Archivo carries a width axis, so headings and metric figures can be set wide
 * and signage-like without loading a second family. Used with restraint: it
 * never appears in body copy or table cells.
 */
const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  display: 'swap',
  variable: '--font-archivo',
})

/** Dense tables at 13px, and full coverage for á é í ó ú ñ ü. */
const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-plex-sans',
})

/** Times, amounts and booking identifiers, so columns align. */
const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-plex-mono',
})

export const metadata: Metadata = {
  title: {
    default: 'Panel de administración | IF7SPORTS',
    template: '%s | IF7SPORTS',
  },
  description:
    'Panel de gestión para polideportivos: reservas, canchas, clientes, bloqueos y métricas.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="es"
      className={`${archivo.variable} ${plexSans.variable} ${plexMono.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}
