import Link from 'next/link'

/** Minimal, as the brief asks: version, help link, copyright. */
export function Footer() {
  return (
    // Extra bottom room so the floating review panel never covers the
    // copyright, which the brief requires to be present.
    <footer className="mt-auto border-t border-borde px-6 pb-16 pt-4">
      <div className="flex flex-wrap items-center justify-between gap-3 text-2xs text-apagado">
        <p>
          Panel de polideportivo{' '}
          <span className="font-mono numeros-tabulares">v2.4.1</span>
        </p>

        <Link href="/soporte" className="transition-colors hover:text-tinta">
          Centro de ayuda y documentación
        </Link>

        <p>© 2026 IF7SPORTS. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}
