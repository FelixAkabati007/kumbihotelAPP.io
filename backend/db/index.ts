import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import * as dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set in environment variables");
  throw new Error("DATABASE_URL is missing");
}

console.log(
  `Initializing DB connection (SSL: ${process.env.NODE_ENV === "production"})`,
);

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: process.env.PGPOOL_MAX
    ? parseInt(process.env.PGPOOL_MAX, 10)
    : undefined,
  idleTimeoutMillis: process.env.PGPOOL_IDLE_TIMEOUT_MS
    ? parseInt(process.env.PGPOOL_IDLE_TIMEOUT_MS, 10)
    : undefined,
  ssl:
    process.env.NODE_ENV === "production" ||
    process.env.DATABASE_URL?.includes("neon.tech")
      ? { rejectUnauthorized: false }
      : undefined,
});

export const db = drizzle(pool, { schema });
