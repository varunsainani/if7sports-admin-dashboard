# IF7SPORTS Admin Dashboard

**Live review link: https://if7sports-admin-dashboard.vercel.app**

Coded UI design for the IF7SPORTS sports facility booking admin dashboard, built for the
Spanish speaking market. The panel is used by facility owners (dueños de polideportivos) to
manage courts, bookings, prices, blocked slots, clients and metrics.

This is a design deliverable, not a product build: static pages with hardcoded mock data and
no backend.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + CSS custom properties |
| Icons | Lucide React |
| Charts | Recharts |
| Data | Hardcoded mock data, no API, no database |

## Language

The entire interface ships in Spanish. Code, component names and mock data keys stay in
English; only user facing strings are Spanish.

## Scope

15 screens, each in default, loading and empty states, plus 404, 403 and 500 pages.

**Operación**
1. Login (2FA, forced password change, password recovery)
2. Dashboard home
3. Calendario de reservas
4. Booking detail modal
5. Bloqueos / cierres de franjas
6. Lista de clientes
7. Detalle del cliente

**Gestión**

8. Lista de canchas
9. Detalle y edición de cancha
10. Instructores

**Análisis**

11. Métricas

**Configuración**

12. Configuración del polideportivo
13. Usuarios y permisos
14. Soporte con IF7SPORTS
15. Mi perfil

## Roles

| Role | Access |
| --- | --- |
| Admin principal | Facility owner, full permissions |
| Colaborador | Operational admin, permissions delegated per module |
| Instructor | Informational record only, no login, appears attached to blocked slots |

## Responsive

Desktop first at 1440px. Tablet variant (768px to 1024px) for the dashboard, courts list,
bookings calendar, clients list and metrics screens. Mobile is out of scope.

## Repo layout

```
source-code/     the Next.js app, and nothing else
deliverables/    everything handed to the client
  screenshots/     every screen, desktop and tablet
docs/            working notes and decisions
assets/          raw source assets
```

## Getting started

```bash
cd source-code
npm install
npm run dev
```

Then open http://localhost:3000

See `source-code/README.md` for the review panel, the conventions and the
notes for the build team.
