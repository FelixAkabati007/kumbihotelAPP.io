# Hotel Management System (HMS)

A comprehensive, full-stack Hotel Management System built with modern web technologies. This application manages the entire hotel lifecycle including room management, booking handling, guest services, payment processing, and audit logging.

## 🚀 Features

### Core Functionality

- **Room Management**: Create, update, and track room status (available, maintenance, occupied).
- **Booking System**:
  - Real-time availability checks with date-overlap prevention.
  - Idempotency support for booking creation.
  - Lifecycle management (Pending -> Confirmed -> Checked In -> Checked Out -> Cancelled).
- **User Roles**:
  - **Guests**: Register, view availability, book rooms, view booking history, cancel bookings.
  - **Managers/Receptionists**: Manage rooms, oversee all bookings, update statuses, view audit logs.
- **Payments**:
  - Payment record creation and status tracking.
  - Integration readiness for payment gateways.
- **Audit Logging**: Comprehensive tracking of critical actions (booking changes, payment updates, user profile modifications) for security and accountability.

### Technical Highlights

- **Architecture**: RESTful API with distinct layers (Routes, Middleware, Validation, DB).
- **Security**:
  - JWT-based authentication with role-based access control (RBAC).
  - Rate limiting on sensitive endpoints.
  - Helmet for security headers.
  - Input validation using Zod.
- **Reliability**:
  - Robust error handling and logging (Pino).
  - Transactional integrity with Drizzle ORM.
  - Extensive test coverage (>80%) with Vitest and Supertest.

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL (via Neon or local), Drizzle ORM
- **Frontend**: React, Vite, Tailwind CSS (in `client` directory)
- **Testing**: Vitest, Supertest
- **DevOps**: GitHub Actions (CI/CD), Docker ready

## 📦 Installation & Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd trae-project
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:

   ```env
   DATABASE_URL=postgresql://user:password@host:port/dbname
   JWT_SECRET=your_secure_secret
   CORS_ORIGIN=http://localhost:5173
   RATE_LIMIT_WINDOW=60
   RATE_LIMIT_MAX=100
   ```

4. **Database Setup**

   ```bash
   npm run db:generate
   npm run db:push
   npm run seed  # Optional: Seed initial data
   ```

5. **Run the Application**
   ```bash
   npm run dev
   ```

   - Client: `http://localhost:5173`
   - API: `http://localhost:3001`

## 🧪 Testing

The project maintains strict code quality standards with >80% code coverage.

- **Run all tests**:
  ```bash
  npm test
  ```
- **Run with coverage**:
  ```bash
  npx vitest run --coverage
  ```
- **Linting**:
  ```bash
  npm run lint
  ```

## 🏗 CI/CD

Automated workflows via GitHub Actions:

- **CI**: Runs linting, type checking, and unit tests on every push/PR.
- **CD**: Production migrations require manual approval for safety.

## 📂 Project Structure

```
api/
  ├── routes/         # API endpoints (bookings, rooms, auth, etc.)
  ├── middleware/     # Auth, Rate Limit, Error Handling
  ├── db/             # Drizzle schema and connection
  ├── validation/     # Zod schemas
  └── services/       # Business logic (where applicable)
tests/
  ├── api/            # Integration tests for routes
  └── unit/           # Unit tests
```

## 🔒 Security Notes

- Rate limiting is relaxed in `test` environment for CI stability.
- Passwords are hashed using `bcryptjs`.
- All inputs are sanitized and validated before processing.
