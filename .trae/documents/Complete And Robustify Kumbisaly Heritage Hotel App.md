## Scope & Objectives
- Complete all functional modules and harden the system for production on Vercel with Neon (PostgreSQL)
- No restaurant features; focus on bookings, rooms, users, admin
- Ensure staging/production separation, automated migrations, observability, security, backups

## Current State Summary
- Stack: Vite + React + TypeScript (client), Express + Drizzle ORM + pg (server), Vercel functions via `api/index.ts`
- Neon database connected via `pg.Pool` with Drizzle; schemas: users, rooms, bookings
- Basic JWT auth, role middleware, core routes for auth/rooms/bookings, health check
- Frontend pages exist (Home/Rooms/Bookings/AdminDashboard/Login/Register) with initial UI

## Backend Enhancements
- Input validation: add zod schema validation for all endpoints (auth, rooms, bookings)
- Availability logic: implement robust overlap checks and constraints to prevent double-booking
- Pagination & filtering: standardize list endpoints with page/limit/sort
- Idempotency: optional idempotency-key for booking creation to avoid duplicates
- Error handling: unify error responses, map known validation/DB errors, include correlation IDs
- Logging: pino structured logging with request IDs
- Rate limiting: express-rate-limit on auth and booking endpoints
- Security headers: refine helmet config, strict CORS allowlist, disable x-powered-by

## Database & Migrations
- Extend schema: add payments table (status, method, amount, currency, booking_id, reference)
- Indexes: `bookings(user_id)`, `bookings(room_id)`, `bookings(check_in_date, check_out_date)`, `rooms(room_number)`
- Constraints: ensure `check_out_date > check_in_date`; unique constraint preventing overlapping bookings per room
- Migrations: standardize via drizzle-kit; create seed scripts for staging
- Connection pooling: keep Neon pooler host; tune pool size via env for serverless usage

## Booking Availability Algorithm
- Query rooms available for a date range where NOT EXISTS bookings overlapping: `(check_in_date < requested_check_out) AND (check_out_date > requested_check_in)`
- Use SQL with proper indexes to keep queries performant

## Payments (Optional if no online payment now)
- Add payments records tied to bookings; support statuses: pending, paid, refunded, failed
- If integrating later: abstract a PaymentService interface (e.g., Stripe) without implementing now

## Frontend Enhancements
- Forms: use react-hook-form + zod for validation on Login/Register/Booking
- Rooms page: filter by type/capacity/price, availability picker
- Booking flow: date range picker, price calc, review step, confirmation
- Admin Dashboard: CRUD for rooms, booking status management, simple metrics
- Auth UX: role-based protected routes; store token securely; auto-refresh on expiry (optional refresh token later)
- Theming and accessibility: Tailwind refinements, focus states, aria labels

## Performance & Caching
- Server-side caching for reference data (room types/amenities) with short TTL; for serverless consider Vercel KV (optional)
- Use ETags/Cache-Control on GET endpoints; client-side SWR pattern for rooms/listings
- Reduce payloads with selective fields; compress responses

## Observability & Monitoring
- Add Sentry (server + client) for error tracking
- Add request metrics (basic Prometheus-like counters or post-logs); integrate Vercel Analytics
- Health & readiness endpoints: enhance `/api/health` to include DB connectivity check

## Security & Compliance
- Secrets: require strong `JWT_SECRET` per env; never default to 'secret'
- JWT hardening: set issuer/audience, short expiry; consider JWKS validation if using Neon Auth
- Access control: enforce role checks server-side for admin operations
- Data protection: parameterized queries (Drizzle already), validate/sanitize inputs
- Backups & DR: use Neon automated PITR; add scheduled logical backups (pg_dump) via GitHub Action nightly

## CI/CD & Environments
- Vercel projects or environments: separate staging and production with distinct env vars
- GitHub Actions: lint, type-check, test on PR; on merge to main run `drizzle-kit push:pg` against production (or manual approval step)
- Preview deployments: use Vercel previews for PRs; staging connects to staging Neon branch

## Testing Strategy
- Unit tests: server services and validation with Vitest
- Integration tests: API routes with Supertest against a test Neon branch or local Postgres
- E2E tests: Playwright for main user flows (search room, register/login, book, admin update)
- Seed data: scripts to seed rooms/users for staging & tests

## Configuration & Docs
- README: usage, env var docs, deployment guide; include `.env.example` fields: DATABASE_URL, JWT_SECRET, NODE_ENV, RATE_LIMITS
- Add `drizzle.config.ts` examples and migration commands
- Document backup and restore steps

## Rollout Plan
1. Implement backend validation, logging, rate limiting, availability logic
2. Extend DB schema with indexes/constraints and payments table; generate migrations
3. Upgrade frontend forms and booking flow; protected routes
4. Add observability (Sentry), health checks
5. Set up CI/CD pipelines, staging/prod envs, automated migrations (manual gate for prod)
6. Write tests (unit/integration/e2e) and seed scripts; verify on staging
7. Promote to production after tests pass

## Deliverables
- Complete, production-ready app with robust endpoints and UI
- Migrations and seed scripts; staging/prod environments configured
- Tests with coverage and CI pipeline
- Monitoring and backup procedures documented

Please confirm, and I will proceed to implement these changes end-to-end.