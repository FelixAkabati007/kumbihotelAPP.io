## Guest Experience
- Availability search with date range, capacity, type, price filters
- Room details pages with gallery, amenities, policies; pulls from rooms schema [schema.ts](file:///d:/Kumresh/api/db/schema.ts#L41-L53)
- Add‑ons at checkout (airport pickup, breakfast, spa, late checkout) with pricing
- Secure checkout: card/mobile money payment, deposits, refunds, invoices; uses /api/payments [payments.ts](file:///d:/Kumresh/api/routes/payments.ts)
- My Account: view/modify/cancel bookings, download invoices, update profile [Register.tsx](file:///d:/Kumresh/src/pages/Register.tsx)
- Loyalty program basics: earn points per stay, tier status, redeem perks
- Multi‑language and currency switcher; currency from payments.currency [schema.ts](file:///d:/Kumresh/api/db/schema.ts#L24-L39)

## Admin Operations
- Rate plans & seasons: weekday/weekend/seasonal pricing, promotional codes
- Inventory management: create/edit rooms, bulk amenities/images, statuses
- Housekeeping module: tasks, room cleanliness states, staff assignments
- Front desk workflows: check‑in/out, upgrades, hold/release deposits, folio management
- Payments & refunds dashboard: settlements, reconciliation, references [payments.ts](file:///d:/Kumresh/api/routes/payments.ts)
- Audit logs UI: filter by entity/action/date [auditLogs.ts](file:///d:/Kumresh/api/routes/auditLogs.ts)
- User management: roles (manager, receptionist, housekeeping, concierge), invite/reset
- Reporting: occupancy, ADR, RevPAR, revenue by method/channel, housekeeping KPIs

## Data Model Extensions
- rate_plans(id, name, description, rules, currency)
- rate_plan_seasons(rate_plan_id, date_range, day_of_week_rules, price)
- addons(id, name, price, taxable)
- booking_addons(booking_id, addon_id, qty, price)
- invoices(id, booking_id, items[], totals, status)
- housekeeping_tasks(id, room_id, status(clean/dirty/inspected), assigned_to, due_at)
- maintenance_tickets(id, room_id, severity, status, description)
- loyalty_accounts(user_id, points, tier)
- promo_codes(code, constraints, discount)

## API Endpoints (RBAC with existing middleware)
- GET/POST/PUT/DELETE /api/rate-plans, /api/rate-plans/:id/seasons [auth.ts](file:///d:/Kumresh/api/middleware/auth.ts)
- CRUD /api/addons, /api/booking-addons
- POST /api/checkin, /api/checkout (updates booking status, audit)
- CRUD /api/housekeeping/tasks, /api/maintenance/tickets
- GET /api/reports/occupancy|adr|revpar|revenue|housekeeping
- POST /api/payments/refund, /api/payments/capture (idempotent)

## Frontend Pages & Navigation
- RoomDetails (gallery, amenities, reviews) [Rooms.tsx](file:///d:/Kumresh/src/pages/Rooms.tsx)
- Checkout (add‑ons selector, summary, payment)
- MyBookings (manage bookings, invoices)
- Admin: RatePlans, Housekeeping, Payments, Reports, Users [AdminDashboard.tsx](file:///d:/Kumresh/src/pages/AdminDashboard.tsx)
- Reuse ProtectedRoute for role access [ProtectedRoute.tsx](file:///d:/Kumresh/src/components/ProtectedRoute.tsx)

## Payments & Invoicing
- Capture payment intents, handle refunds, issue invoices PDF
- Idempotency keys on booking/payment (already present for bookings) [schema.ts](file:///d:/Kumresh/api/db/schema.ts#L55-L74)

## Notifications & Localization
- Email/SMS templates: booking confirmation, reminders, post‑stay survey
- i18n strings for UI; currency formatting per locale

## Housekeeping & Maintenance
- Dashboards: workload view, overdue tasks, room status board
- Quick actions: mark clean/inspected, raise maintenance ticket

## Reporting & Analytics
- KPIs: Occupancy%, ADR, RevPAR, revenue by method, cancellations
- Export CSV and on‑screen charts

## Security & Compliance
- Keep existing login untouched; reuse JWT/roles [auth.ts](file:///d:/Kumresh/api/middleware/auth.ts)
- Input validation via Zod on all new endpoints [auth validation](file:///d:/Kumresh/api/validation/auth.ts)
- Continue rate limiting and Sentry (already present) [app.ts](file:///d:/Kumresh/api/app.ts)

## Testing & Quality
- Unit/integration tests for new modules; target ≥80% coverage
- Smoke tests for critical flows: booking, payment, check‑in/out, refunds

## Rollout Approach
- Phase 1: Rate plans, RoomDetails, Checkout, Add‑ons, Invoices
- Phase 2: Housekeeping & Maintenance modules
- Phase 3: Reports, Loyalty, Notifications & i18n
- Non‑disruptive: no changes to login; additive endpoints & pages

Please confirm this plan. Once approved, I will implement incrementally with strict TypeScript, Zod validation, RBAC, Drizzle migrations, and UI pages matching existing patterns.