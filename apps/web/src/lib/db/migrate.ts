import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

const ARG_REQUIRE_URL = "--require-url";
const isRequireUrl = process.argv.includes(ARG_REQUIRE_URL);

const databaseUrl = process.env.DATABASE_URL_UNPOOLED ?? process.env.DB_PG_URL ?? process.env.DATABASE_URL ?? "";
const hasUsableDatabaseUrl = databaseUrl.length > 0 && !databaseUrl.startsWith("op://");

async function runMigrations(url: string) {
  const sql = neon(url);
  const db = drizzle({ client: sql });

  console.log("Running migrations...");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migrations complete.");
}

function exitForMissingDatabaseUrl() {
  const message =
    "Skipping database migrations: no resolved DB URL found in DATABASE_URL_UNPOOLED, DB_PG_URL, or DATABASE_URL.";

  if (isRequireUrl) {
    console.error(`Migration failed: ${message}`);
    process.exit(1);
  }

  console.warn(message);
}

if (!hasUsableDatabaseUrl) {
  exitForMissingDatabaseUrl();
} else {
  runMigrations(databaseUrl).catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
}
