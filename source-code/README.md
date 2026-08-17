# IF7SPORTS Admin Dashboard — source

Coded UI design for the IF7SPORTS sports facility booking panel. Static pages
with hardcoded mock data and no backend.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000

The app opens on the dashboard. There is no authentication: `/login` is a
design screen and its "Entrar" button navigates straight through.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server on port 3000 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run check:contrast` | WCAG contrast audit of the design tokens |

## Reviewing the design

The panel in the bottom right, **Vista de revisión**, exists for this review and
is not part of the product.

- **Estado de la pantalla** switches any screen between its normal, loading and
  empty rendering. Those three states are required for every screen, and with no
  backend there is nothing to be slow and no data to clear, so they are switched
  directly.
- **Usuario y permisos** switches between the admin principal and each
  colaborador. The sidebar filters itself to the modules that person can open,
  so switching to Lidia Ochoa leaves only Reservas and Clientes.

Other things worth trying:

- **Ctrl + K** opens global search. It matches bookings by id, client or court,
  clients by name, email or phone, and courts by name, grouped by type.
- Clicking any calendar slot, dashboard row or client history row opens the same
  booking detail modal.
- In the bookings calendar, clicking a day in month view drills into the week
  view for that day.

## Layout

```
app/
  (panel)/          screens inside the sidebar shell
  login/            login, 2FA, forced password change, recovery
  error.tsx         500
  not-found.tsx     404
components/
  ui/               base components
  shell/            sidebar, header, command palette, footer
  reservas/         booking detail modal
  metricas/         chart furniture
lib/
  tokens.css        design tokens, the single source of colour and type
  types.ts          domain model
  estados.ts        Spanish labels and styling for every domain value
  formato.ts        es-ES money, date and number formatting
  mock-data/        hardcoded data
scripts/
  check-contrast.mjs  runnable WCAG audit
```

## Conventions

**Language.** The interface is entirely Spanish. Framework plumbing is English
(`Button`, `DataTable`, `isLoading`); the domain vocabulary is Spanish and
matches the brief literally, so a booking status is the string `'confirmada'`
with no translation layer between spec, data and UI.

**Tokens.** `lib/tokens.css` is the single source of truth. `tailwind.config.ts`
points every value at a custom property rather than a literal, so the two layers
cannot drift. Changing a token changes both.

**Mock data.** Nothing is random and nothing reads the system clock: Next renders
these screens on the server and again on the client, and a value that differed
between the two would break hydration. Every date derives from the `HOY` anchor
in `lib/mock-data/base.ts`. Change that one constant to move the whole dataset.

Figures are derived rather than typed in. Client counters come from the booking
records and every metric is computed from them, so the numbers on the metrics
screen reconcile with the calendar and the tables.

**Colour.** Hue is reserved for booking status, because the four states have to
be readable at a glance in a dense calendar. Payment status is monochrome and
separated by icon, and court type is carried by icon only, so the three systems
never compete. Each booking status also carries a fill treatment (dashed, solid,
struck, flat) so it survives in greyscale and for colour-blind readers.

Charts use their own status steps, not the badge steps: the badge palette
measured 4.8 ΔE between confirmada and cancelada under deuteranopia. Run
`npm run check:contrast` to audit the tokens.

## Scope

Desktop first at 1440px, with a tablet variant from 768px to 1024px on the
dashboard, courts list, bookings calendar, clients list and metrics. Mobile is
out of scope per the brief.

No dark mode: the brief does not ask for one.

## Notes for the build team

- `next@14.2.35` is the latest patched 14.x. `npm audit` still reports advisories
  that are only resolved in Next 15 or 16; the brief specifies Next.js 14, and
  this build has no backend, no auth and no server actions, so the affected
  surfaces are not in use.
- Three routes are server-rendered on demand (`/canchas/[id]`, `/clientes/[id]`,
  `/soporte/[id]`) because they read their id on the client. Adding
  `generateStaticParams` would make them fully static once the pages move behind
  a server component.
