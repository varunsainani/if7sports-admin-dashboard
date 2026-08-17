'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'

/**
 * Time picker built on the project's own select rather than `<input type="time">`.
 *
 * The native control renders in the *browser's* locale, not the document's, so
 * on an English-locale machine every opening hour in this Spanish product read
 * "08:00 AM" and midnight read "12:00 AM", while every other time in the app is
 * 24-hour. It also brings its own font and its own clock glyph, so it never
 * matched the inputs beside it.
 *
 * A select also fits the domain better: a facility opens on the hour or the
 * half hour, not at 08:37.
 */

const HORAS = Array.from({ length: 24 * 2 }, (_, i) => {
  const hora = Math.floor(i / 2)
  const minuto = i % 2 === 0 ? '00' : '30'
  return `${String(hora).padStart(2, '0')}:${minuto}`
})

interface SelectorHoraProps {
  valor: string
  onCambio: (valor: string) => void
  /** Accessible name, since the control shows only a time. */
  etiqueta: string
  id?: string
  className?: string
}

export function SelectorHora({ valor, onCambio, etiqueta, id, className }: SelectorHoraProps) {
  // A stored time that is not on the half hour still has to be selectable.
  const opciones = HORAS.includes(valor) ? HORAS : [...HORAS, valor].sort()

  return (
    <Select value={valor} onValueChange={onCambio}>
      <SelectTrigger
        id={id}
        size="sm"
        aria-label={etiqueta}
        className={cn('w-24 font-mono numeros-tabulares', className)}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-64">
        {opciones.map((hora) => (
          <SelectItem key={hora} value={hora} className="font-mono numeros-tabulares">
            {hora}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
