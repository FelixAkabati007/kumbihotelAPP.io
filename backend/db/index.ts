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
  `Initializing DB connection (SSL: ${
    process.env.NODE_ENV === "production" ||
    (process.env.DATABASE_URL && process.env.DATABASE_URL.includes("neon.tech"))
      ? "true"
      : "false"
  })`,
);

// Fallback to a dummy connection string if missing, to prevent crash on startup.
// This allows the app to boot, and queries will fail (and be caught) at runtime.
const connectionString =
  process.env.DATABASE_URL || "postgres://user:pass@localhost:5432/db";

export const pool = new Pool({
  connectionString,
  max: process.env.PGPOOL_MAX ? parseInt(process.env.PGPOOL_MAX, 10) : 20, // Default to 20 for serverless
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000, // Fail fast if connection hangs
  ssl:
    process.env.NODE_ENV === "production" ||
    connectionString.includes("neon.tech")
      ? { rejectUnauthorized: false }
      : undefined,
});

// Unexpected errors on idle clients should be handled to prevent the process from crashing
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  // Don't exit process in serverless; just log. The pool will try to reconnect or create new clients.
});

export const db = drizzle(pool, { schema });
