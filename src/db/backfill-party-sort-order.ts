import { config } from "dotenv";
config({ path: ".env.local" });

import { sql } from "drizzle-orm";

import { db } from "@/db";

async function main() {
  await db.execute(sql`
    WITH ranked_parties AS (
      SELECT
        id,
        ROW_NUMBER() OVER (ORDER BY created_at ASC, id ASC) - 1 AS new_sort_order
      FROM parties
    )
    UPDATE parties
    SET sort_order = ranked_parties.new_sort_order
    FROM ranked_parties
    WHERE parties.id = ranked_parties.id
  `);

  console.log("Backfilled parties.sort_order using created_at order.");
}

main()
  .catch((error) => {
    console.error("Failed to backfill party sort order.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$client.end();
  });
