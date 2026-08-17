import type { Config } from 'tailwindcss'

/**
 * Every value here points at a CSS custom property defined in lib/tokens.css.
 * That file is the single source of truth: Tailwind is the ergonomic surface,
 * not a second place where colours get decided. Changing a token changes both.
 */
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cal: {
          50: 'var(--cal-50)',
          100: 'var(--cal-100)',
          200: 'var(--cal-200)',
          300: 'var(--cal-300)',
          400: 'var(--cal-400)',
          500: 'var(--cal-500)',
          600: 'var(--cal-600)',
          700: 'var(--cal-700)',
          800: 'var(--cal-800)',
          900: 'var(--cal-900)',
        },
        cesped: {
          50: 'var(--cesped-50)',
          100: 'var(--cesped-100)',
          200: 'var(--cesped-200)',
          300: 'var(--cesped-300)',
          400: 'var(--cesped-400)',
          500: 'var(--cesped-500)',
          600: 'var(--cesped-600)',
          700: 'var(--cesped-700)',
          800: 'var(--cesped-800)',
          900: 'var(--cesped-900)',
        },

        fondo: 'var(--fondo)',
        superficie: 'var(--superficie)',
        'superficie-alt': 'var(--superficie-alt)',
        borde: 'var(--borde)',
        'borde-fuerte': 'var(--borde-fuerte)',
        'borde-control': 'var(--borde-control)',
        tinta: 'var(--tinta)',
        'tinta-media': 'var(--tinta-media)',
        apagado: 'var(--apagado)',
        primario: {
          DEFAULT: 'var(--primario)',
          hover: 'var(--primario-hover)',
          suave: 'var(--primario-suave)',
          fg: 'var(--sobre-primario)',
        },

        // Booking status. Used as bg-pendiente-bg, text-pendiente-texto, etc.
        pendiente: {
          bg: 'var(--pendiente-bg)',
          borde: 'var(--pendiente-borde)',
          texto: 'var(--pendiente-texto)',
          solido: 'var(--pendiente-solido)',
        },
        confirmada: {
          bg: 'var(--confirmada-bg)',
          borde: 'var(--confirmada-borde)',
          texto: 'var(--confirmada-texto)',
          solido: 'var(--confirmada-solido)',
        },
        cancelada: {
          bg: 'var(--cancelada-bg)',
          borde: 'var(--cancelada-borde)',
          texto: 'var(--cancelada-texto)',
          solido: 'var(--cancelada-solido)',
        },
        completada: {
          bg: 'var(--completada-bg)',
          borde: 'var(--completada-borde)',
          texto: 'var(--completada-texto)',
          solido: 'var(--completada-solido)',
        },

        // Payment status, deliberately monochrome.
        pago: {
          bg: 'var(--pago-bg)',
          borde: 'var(--pago-borde)',
          texto: 'var(--pago-texto)',
          'pendiente-bg': 'var(--pago-pendiente-bg)',
          'pendiente-borde': 'var(--pago-pendiente-borde)',
          'pendiente-texto': 'var(--pago-pendiente-texto)',
          'devuelto-bg': 'var(--pago-devuelto-bg)',
          'devuelto-borde': 'var(--pago-devuelto-borde)',
          'devuelto-texto': 'var(--pago-devuelto-texto)',
          'na-borde': 'var(--pago-na-borde)',
          'na-texto': 'var(--pago-na-texto)',
        },

        bloqueo: {
          base: 'var(--bloqueo-base)',
          texto: 'var(--bloqueo-texto)',
        },

        exito: 'var(--exito)',
        aviso: 'var(--aviso)',
        error: 'var(--error)',
        info: 'var(--info)',
      },

      fontFamily: {
        display: 'var(--fuente-display)',
        sans: 'var(--fuente-texto)',
        mono: 'var(--fuente-mono)',
      },

      fontSize: {
        '2xs': ['var(--texto-2xs)', { lineHeight: '1.35' }],
        xs: ['var(--texto-xs)', { lineHeight: '1.4' }],
        sm: ['var(--texto-sm)', { lineHeight: '1.45' }],
        base: ['var(--texto-base)', { lineHeight: 'var(--interlineado-base)' }],
        md: ['var(--texto-md)', { lineHeight: 'var(--interlineado-base)' }],
        lg: ['var(--texto-lg)', { lineHeight: '1.4' }],
        xl: ['var(--texto-xl)', { lineHeight: '1.3' }],
        '2xl': ['var(--texto-2xl)', { lineHeight: 'var(--interlineado-ajustado)' }],
        '3xl': ['var(--texto-3xl)', { lineHeight: 'var(--interlineado-ajustado)' }],
        display: ['var(--texto-display)', { lineHeight: '1.05' }],
      },

      letterSpacing: {
        display: 'var(--tracking-display)',
        etiqueta: 'var(--tracking-etiqueta)',
      },

      spacing: {
        1: 'var(--espacio-1)',
        2: 'var(--espacio-2)',
        3: 'var(--espacio-3)',
        4: 'var(--espacio-4)',
        5: 'var(--espacio-5)',
        6: 'var(--espacio-6)',
        8: 'var(--espacio-8)',
        10: 'var(--espacio-10)',
        12: 'var(--espacio-12)',
        16: 'var(--espacio-16)',
        sidebar: 'var(--sidebar-ancho)',
        'sidebar-plegado': 'var(--sidebar-ancho-plegado)',
        header: 'var(--header-alto)',
      },

      borderRadius: {
        sm: 'var(--radio-sm)',
        DEFAULT: 'var(--radio-md)',
        md: 'var(--radio-md)',
        lg: 'var(--radio-lg)',
        xl: 'var(--radio-xl)',
        full: 'var(--radio-full)',
      },

      boxShadow: {
        sm: 'var(--sombra-sm)',
        md: 'var(--sombra-md)',
        lg: 'var(--sombra-lg)',
        modal: 'var(--sombra-modal)',
      },

      maxWidth: {
        contenido: 'var(--contenido-max)',
      },

      transitionDuration: {
        rapida: 'var(--duracion-rapida)',
        base: 'var(--duracion-base)',
        lenta: 'var(--duracion-lenta)',
      },

      transitionTimingFunction: {
        curva: 'var(--curva)',
      },

      keyframes: {
        'aparecer': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'modal-entrar': {
          from: { opacity: '0', transform: 'translate(-50%, -48%) scale(0.98)' },
          to: { opacity: '1', transform: 'translate(-50%, -50%) scale(1)' },
        },
        'brillo': {
          '100%': { transform: 'translateX(100%)' },
        },
      },

      animation: {
        aparecer: 'aparecer var(--duracion-base) var(--curva)',
        'modal-entrar': 'modal-entrar var(--duracion-base) var(--curva)',
        brillo: 'brillo 1.6s infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
