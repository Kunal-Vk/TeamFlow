import postgres from "postgres";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

async function applyMigration() {
  const client = postgres(process.env.DATABASE_URL!, { max: 1 });

  const sqlFile = path.join(__dirname, "migrations", "0003_elite_vermin.sql");
  const sql = fs.readFileSync(sqlFile, "utf-8");

  // Drizzle migration files use "--> statement-breakpoint" as a separator
  const statements = sql
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean);

  console.log(`Applying ${statements.length} statements from 0003_elite_vermin.sql...`);

  for (const statement of statements) {
    console.log(`  → ${statement.slice(0, 80).replace(/\n/g, " ")}...`);
    await client.unsafe(statement);
  }

  console.log("Migration 0003 applied successfully.");
  await client.end();
  process.exit(0);
}

applyMigration().catch((err) => {
  console.error("Migration failed:", err.message ?? err);
  process.exit(1);
});
