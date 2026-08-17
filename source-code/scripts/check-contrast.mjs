/**
 * Contrast validator for the design tokens.
 *
 * Reads lib/tokens.css directly so it can never drift from the real palette,
 * resolves var() references, and checks every colour pair the interface
 * actually renders against the WCAG 2.1 thresholds:
 *
 *   4.5:1  normal text
 *   3.0:1  large text (>=18.66px bold or >=24px) and non-text UI boundaries
 *
 * Run with: npm run check:contrast
 * Exits non-zero if any pair regresses, so it works in CI.
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const css = readFileSync(join(here, '..', 'lib', 'tokens.css'), 'utf8')

/* ---------------------------------------------------------------- parsing */

const raw = {}
for (const [, name, value] of css.matchAll(/^\s*--([\w-]+):\s*([^;]+);/gm)) {
  if (!(name in raw)) raw[name] = value.trim() // first wins, ignores the reduced-motion override block
}

/** Resolve var(--x) chains down to a literal colour. */
function resolve(name, seen = new Set()) {
  if (seen.has(name)) throw new Error(`circular token reference at --${name}`)
  seen.add(name)
  const value = raw[name]
  if (value === undefined) throw new Error(`unknown token --${name}`)
  const ref = value.match(/^var\(\s*--([\w-]+)\s*\)$/)
  return ref ? resolve(ref[1], seen) : value
}

/* -------------------------------------------------------------- contrast */

const channel = (c) => {
  const s = c / 255
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}

function luminance(hex) {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16))
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

function contrast(a, b) {
  const [la, lb] = [luminance(a), luminance(b)]
  const [hi, lo] = la > lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

/* ------------------------------------------------------------------ pairs
   Every pair below corresponds to something the interface really renders.
   `min` is the threshold that applies to that use. */

const WHITE = '#ffffff'

const pairs = [
  // body and supporting text
  ['Body text on page ground',        resolve('tinta'),             resolve('fondo'),            4.5],
  ['Body text on surface',            resolve('tinta'),             resolve('superficie'),       4.5],
  ['Secondary text on surface',       resolve('tinta-media'),       resolve('superficie'),       4.5],
  ['Muted text on page ground',       resolve('apagado'),           resolve('fondo'),            4.5],
  ['Muted text on surface',           resolve('apagado'),           resolve('superficie'),       4.5],
  ['Muted text on alt surface',       resolve('apagado'),           resolve('superficie-alt'),   4.5],

  // primary action
  ['Label on primary button',         resolve('sobre-primario'),    resolve('primario'),         4.5],
  ['Label on primary hover',          resolve('sobre-primario'),    resolve('primario-hover'),   4.5],
  ['Primary text on soft primary',    resolve('primario'),          resolve('primario-suave'),   4.5],

  // booking status, tinted treatment (tables and calendar slots)
  ['Pendiente text on tint',          resolve('pendiente-texto'),   resolve('pendiente-bg'),     4.5],
  ['Confirmada text on tint',         resolve('confirmada-texto'),  resolve('confirmada-bg'),    4.5],
  ['Cancelada text on tint',          resolve('cancelada-texto'),   resolve('cancelada-bg'),     4.5],
  ['Completada text on tint',         resolve('completada-texto'),  resolve('completada-bg'),    4.5],

  // booking status, solid treatment (large badge in the booking modal)
  ['White on pendiente solid',        WHITE,                        resolve('pendiente-solido'), 4.5],
  ['White on confirmada solid',       WHITE,                        resolve('confirmada-solido'),4.5],
  ['White on cancelada solid',        WHITE,                        resolve('cancelada-solido'), 4.5],
  ['White on completada solid',       WHITE,                        resolve('completada-solido'),4.5],

  // payment status, the monochrome second axis
  ['Pagado text on tint',             resolve('pago-texto'),        resolve('pago-bg'),          4.5],
  ['Pago pendiente text on tint',     resolve('pago-pendiente-texto'), resolve('pago-pendiente-bg'), 4.5],
  ['Devuelto text on tint',           resolve('pago-devuelto-texto'),  resolve('pago-devuelto-bg'),  4.5],
  ['No aplica text on ground',        resolve('pago-na-texto'),     resolve('fondo'),            4.5],

  // blocked slots
  ['Bloqueo text on bloqueo base',    resolve('bloqueo-texto'),     resolve('bloqueo-base'),     4.5],

  // feedback
  ['Success text on surface',         resolve('exito'),             resolve('superficie'),       4.5],
  ['Warning text on surface',         resolve('aviso'),             resolve('superficie'),       4.5],
  ['Error text on surface',           resolve('error'),             resolve('superficie'),       4.5],
  ['Info text on surface',            resolve('info'),              resolve('superficie'),       4.5],

  // non-text UI boundaries: 3:1 is the bar
  ['Control border on surface',       resolve('borde-control'),     resolve('superficie'),       3.0],
  ['Control border on page ground',   resolve('borde-control'),     resolve('fondo'),            3.0],
]

/* ------------------------------------------------------------------ report */

let failed = 0
const rows = pairs.map(([label, fg, bg, min]) => {
  const ratio = contrast(fg, bg)
  const ok = ratio >= min
  if (!ok) failed++
  return { label, fg, bg, min, ratio, ok }
})

const width = Math.max(...rows.map((r) => r.label.length))
console.log('\nContrast audit - lib/tokens.css\n')
console.log(`${'Pair'.padEnd(width)}  ${'fg'.padEnd(9)} ${'bg'.padEnd(9)} ${'ratio'.padStart(6)}  min   result`)
console.log('-'.repeat(width + 42))

for (const r of rows) {
  console.log(
    `${r.label.padEnd(width)}  ${r.fg.padEnd(9)} ${r.bg.padEnd(9)} ` +
      `${r.ratio.toFixed(2).padStart(6)}  ${r.min.toFixed(1)}   ${r.ok ? 'pass' : 'FAIL'}`
  )
}

console.log('-'.repeat(width + 42))
if (failed === 0) {
  console.log(`\nAll ${rows.length} pairs meet their WCAG threshold.\n`)
} else {
  console.error(`\n${failed} of ${rows.length} pairs are below threshold.\n`)
  process.exit(1)
}
