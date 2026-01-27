import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import * as dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set in environment variables");
  // Do not throw error here to avoid crashing the entire app on import.
  // Instead, allow the app to start so that routes can handle DB failures gracefully (e.g., fallback to mock data).
}

console.log(
  `Initializing DB connection (SSL: ${process.env.NODE_ENV === "production"})`,
);

// Fallback to a dummy connection string if missing, to prevent crash on startup.
// This allows the app to boot, and queries will fail (and be caught) at runtime.
const connectionString = process.env.DATABASE_URL || "postgres://user:pass@localhost:5432/db";

export const pool = new Pool({
  connectionString,
  max: process.env.PGPOOL_MAX
    ? parseInt(process.env.PGPOOL_MAX, 10)
    : undefined,
  idleTimeoutMillis: process.env.PGPOOL_IDLE_TIMEOUT_MS
    ? parseInt(process.env.PGPOOL_IDLE_TIMEOUT_MS, 10)
    : undefined,
  ssl:
    process.env.NODE_ENV === "production" ||
    connectionString.includes("neon.tech")
      ? { rejectUnauthorized: false }
      : undefined,
});

export const db = drizzle(pool, { schema });
