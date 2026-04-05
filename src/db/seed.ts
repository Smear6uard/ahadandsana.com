import "dotenv/config";

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
    venueName: "The Canvas Venue",
    venueAddress: "97 East Marquardt Drive, Wheeling, IL 60090",
    googleMapsUrl: "https://maps.google.com/?q=97+East+Marquardt+Drive+Wheeling+IL+60090",
  },
  {
    name: "Shadi",
    date: "2026-07-17",
    time: "5:30 PM",
    venueName: "Chicago Cultural Center",
    venueAddress: "78 East Washington Street, Chicago, IL 60602",
    googleMapsUrl: "https://maps.google.com/?q=78+East+Washington+Street+Chicago+IL+60602",
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
