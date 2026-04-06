import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { guests, invitations, parties } from "@/db/schema";
import {
  ApiError,
  handleRouteError,
  parseJsonBody,
  parseRouteId,
} from "@/lib/api";
import { assertEventIdsExist, getAdminPartyById } from "@/lib/queries";
import { addGuestToPartySchema } from "@/lib/validations";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const partyId = parseRouteId(id, "party id");
    const body = await parseJsonBody(request, addGuestToPartySchema);

    // Verify party exists
    const existingParty = await db.query.parties.findFirst({
      where: eq(parties.id, partyId),
      columns: { id: true },
    });

    if (!existingParty) {
      throw new ApiError(404, "Party not found.");
    }

    await assertEventIdsExist(body.event_ids);

    await db.transaction(async (tx) => {
      const [createdGuest] = await tx
        .insert(guests)
        .values({
          partyId,
          firstName: body.first_name ?? null,
          lastName: body.last_name ?? null,
          email: body.email ?? null,
          phone: body.phone ?? null,
          address: body.address ?? null,
          city: body.city ?? null,
          state: body.state ?? null,
          zip: body.zip ?? null,
        })
        .returning({ id: guests.id });

      await tx.insert(invitations).values(
        body.event_ids.map((eventId) => ({
          guestId: createdGuest.id,
          eventId,
          status: "invited" as const,
        })),
      );
    });

    const party = await getAdminPartyById(partyId);

    if (!party) {
      throw new ApiError(500, "Party could not be loaded.");
    }

    return NextResponse.json(party, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
