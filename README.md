# Kumbisaly Heritage Hotel (Hotel Management System)

Location: Offinso Abofour, Ashanti, Ghana  
Contact: +233535975422 · Email: info@kumbisalyheritagehotel.com

## Overview

Full-stack web app built with React + TypeScript (Vite) and Express + Drizzle ORM on Vercel, using Neon PostgreSQL as primary data storage. Features include room management, bookings, payments records, authentication with roles (guest, receptionist, manager), admin dashboard, and production hardening.

## Tech Stack

- Frontend: React 18, Tailwind CSS, react-hook-form, zod
- Backend: Express, Drizzle ORM, pg Pool (Neon), pino, helmet
- Deployment: Vercel (serverless functions), Neon PostgreSQL (pooler)
- Observability: Sentry (optional)
- CI/CD: GitHub Actions (lint, type-check, tests, migrations), Nightly backups

## Environment Variables

Copy `.env.example` to `.env` (local), and configure in Vercel for staging/production:

- DATABASE_URL
- JWT_SECRET
- JWT_ISSUER
- JWT_AUDIENCE
- CORS_ORIGIN
- RATE_LIMIT_WINDOW
- RATE_LIMIT_MAX
- LOG_LEVEL
- SENTRY_DSN (optional)
- PGPOOL_MAX (optional)
- PGPOOL_IDLE_TIMEOUT_MS (optional)

Client DSN (optional): set `VITE_SENTRY_DSN` in Vercel Environment Variables.

## Running Locally

```bash
npm ci
npm run dev
```

- Client: Vite dev server
- Server: Express via `nodemon` on PORT=3001

## Database \& Migrations

- Define schema in `api/db/schema.ts`
- Generate/push migrations:

```bash
npm run db:generate
npm run db:push
```

- Seed sample data:

```bash
npm run seed
```

## Booking Availability

Bookings prevent double reservations using date-overlap checks:
`existing.check_in < requested.check_out AND existing.check_out > requested.check_in`

## Deployment (Vercel)

1. Create two Vercel projects or environments: `staging` and `production`
2. Set environment variables separately per environment (distinct `DATABASE_URL`)
3. Connect GitHub repository for auto-deployments
4. Optional: Enable previews for pull requests

## CI/CD

- `.github/workflows/ci.yml` runs lint, type-check, tests
- Production migrations require manual approval; set secrets:
  - `DATABASE_URL`
  - `APPROVERS` (GitHub usernames or emails allowed to approve)

## Backups

- `.github/workflows/backup.yml` performs nightly `pg_dump` and uploads artifact
- Configure `DATABASE_URL` secret with Neon pooler URL
- Neon provides PITR (Point-in-Time Restore); use the Neon dashboard for fast restores

## Security

- Strong `JWT_SECRET` per environment
- Issuer/Audience enforced in JWT
- Helmet for secure headers; CORS allowlist via `CORS_ORIGIN`
- Rate limiting on auth/booking endpoints
- Secrets managed in Vercel \& GitHub

## Monitoring

- Sentry (client/server) optional via DSN
- Request logging with pino (structured)
- Health endpoint `/api/health` checks database connectivity

## Admin \& Roles

- Manager/Receptionist: manage rooms, confirm bookings
- Guests: register, login, create bookings, view history

## Notes

- No restaurant features included, per requirements
- Payments service is stubbed for future gateway integration
