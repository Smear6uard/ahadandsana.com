import { config } from "dotenv";
config({ path: ".env.local" });

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { events } from "@/db/schema";

const seedEvents: Array<{
  name: string;
  date: string;
  time: string;
  venueName: string;
  venueAddress: string;
  googleMapsUrl: string;
}> = [
  {
    name: "Mehndi",
    date: "2026-07-16",
    time: "6:00 PM",
    venueName: "Canvas Venue",
    venueAddress: "97 East Marquardt Drive, Wheeling, IL 60090",
    googleMapsUrl: "https://maps.google.com/?q=97+East+Marquardt+Drive+Wheeling+IL+60090",
  },
  {
    name: "Shadi",
    date: "2026-07-17",
    time: "7:00 PM",
    venueName: "Chicago Cultural Center",
    venueAddress: "78 East Washington Street, Chicago, IL 60602",
    googleMapsUrl: "https://maps.google.com/?q=78+East+Washington+Street+Chicago+IL+60602",
  },
];

async function main() {
  const existing = await db.select({ id: events.id }).from(events);

  if (existing.length === 0) {
    await db.insert(events).values(seedEvents);
    console.log(`Inserted ${seedEvents.length} event records.`);
  } else {
    console.log("Events already exist. Skipping inserts and syncing event times.");
  }

  await db
    .update(events)
    .set({ time: "6:00 PM", venueName: "Canvas Venue" })
    .where(eq(events.name, "Mehndi"));

  await db
    .update(events)
    .set({ time: "7:00 PM" })
    .where(eq(events.name, "Shadi"));
}

main()
  .catch((error) => {
    console.error("Failed to seed database.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$client.end();
  });
