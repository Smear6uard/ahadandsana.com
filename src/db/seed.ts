import "dotenv/config";

import { db } from "@/db";
import { events } from "@/db/schema";

const seedEvents: Array<{
  name: string;
  date: string;
  venueName: string;
  venueAddress: string;
}> = [
  {
    name: "Mehndi",
    date: "2026-07-16",
    venueName: "Canvas Venue",
    venueAddress: "255 W Dundee Rd, Wheeling, IL 60090",
  },
  {
    name: "Shadi",
    date: "2026-07-17",
    venueName: "Chicago Cultural Center",
    venueAddress: "78 E Washington St, Chicago, IL 60602",
  },
];

async function main() {
  const existing = await db.select({ id: events.id }).from(events);

  if (existing.length > 0) {
    console.log("Seed skipped: events table already contains data.");
    return;
  }

  await db.insert(events).values(seedEvents);
  console.log(`Inserted ${seedEvents.length} event records.`);
}

main()
  .catch((error) => {
    console.error("Failed to seed database.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$client.end();
  });
