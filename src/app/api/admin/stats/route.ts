import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";

import { db } from "@/db";
import { guests, invitations, parties } from "@/db/schema";
import { handleRouteError } from "@/lib/api";
import { getPublicEvents } from "@/lib/queries";

type EventCountRow = {
  eventId: number;
  status: string;
  count: number;
};

export async function GET() {
  try {
    const [guestCountResult, partyCountResult, publicEvents, groupedCounts] =
      await Promise.all([
        db.select({ value: sql<number>`count(*)::int` }).from(guests),
        db.select({ value: sql<number>`count(*)::int` }).from(parties),
        getPublicEvents(),
        db
          .select({
            eventId: invitations.eventId,
            status: invitations.status,
            count: sql<number>`count(*)::int`,
          })
          .from(invitations)
          .groupBy(invitations.eventId, invitations.status),
      ]);

    const countMap = new Map<number, { attending: number; declined: number; pending: number }>();

    for (const row of groupedCounts as EventCountRow[]) {
      const current = countMap.get(row.eventId) ?? {
        attending: 0,
        declined: 0,
        pending: 0,
      };

      if (row.status === "attending") {
        current.attending = row.count;
      } else if (row.status === "declined") {
        current.declined = row.count;
      } else {
        current.pending = row.count;
      }

      countMap.set(row.eventId, current);
    }

    const byEvent = publicEvents.map((event) => {
      const counts = countMap.get(event.id) ?? {
        attending: 0,
        declined: 0,
        pending: 0,
      };

      return {
        event_id: event.id,
        event_name: event.name,
        invited: counts.attending + counts.declined + counts.pending,
        attending: counts.attending,
        declined: counts.declined,
        pending: counts.pending,
      };
    });

    return NextResponse.json({
      total_guests: guestCountResult[0]?.value ?? 0,
      total_parties: partyCountResult[0]?.value ?? 0,
      by_event: byEvent,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
