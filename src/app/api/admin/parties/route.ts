import { NextResponse } from "next/server";

import { db } from "@/db";
import { guests, invitations, parties } from "@/db/schema";
import { handleRouteError, ApiError, parseJsonBody } from "@/lib/api";
import {
  assertEventIdsExist,
  getAdminParties,
  getAdminPartyById,
} from "@/lib/queries";
import { createPartySchema } from "@/lib/validations";

export async function GET() {
  try {
    const results = await getAdminParties();
    return NextResponse.json(results);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request, createPartySchema);
    const allEventIds = body.guests.flatMap((guest) => guest.event_ids);

    await assertEventIdsExist(allEventIds);

    const partyName =
      body.party_name || `The ${body.guests[0].last_name} Family`;

    const createdPartyId = await db.transaction(async (tx) => {
      const [createdParty] = await tx
        .insert(parties)
        .values({
          name: partyName,
        })
        .returning({ id: parties.id });

      for (const guest of body.guests) {
        const [createdGuest] = await tx
          .insert(guests)
          .values({
            partyId: createdParty.id,
            firstName: guest.first_name,
            lastName: guest.last_name,
            email: guest.email ?? null,
            phone: guest.phone ?? null,
            address: guest.address ?? null,
            city: guest.city ?? null,
            state: guest.state ?? null,
            zip: guest.zip ?? null,
          })
          .returning({ id: guests.id });

        await tx.insert(invitations).values(
          guest.event_ids.map((eventId) => ({
            guestId: createdGuest.id,
            eventId,
            status: "invited" as const,
          })),
        );
      }

      return createdParty.id;
    });

    const createdParty = await getAdminPartyById(createdPartyId);

    if (!createdParty) {
      throw new ApiError(500, "Created party could not be loaded.");
    }

    return NextResponse.json(createdParty, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
