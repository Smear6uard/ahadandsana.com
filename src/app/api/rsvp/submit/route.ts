import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { events, guests, invitations, parties } from "@/db/schema";
import { ApiError, handleRouteError, parseJsonBody } from "@/lib/api";
import { sendRsvpNotification } from "@/lib/email";
import { getGuestDisplayName } from "@/lib/guest-names";
import { getPublicPartyById } from "@/lib/queries";
import { rsvpSubmitSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request, rsvpSubmitSchema);
    const invitationIds = body.responses.map((response) => response.invitation_id);

    const party = await db.query.parties.findFirst({
      where: eq(parties.id, body.party_id),
      columns: { id: true, name: true },
    });

    if (!party) {
      throw new ApiError(404, "Party not found.");
    }

    const partyInvitations = await db
      .select({
        invitationId: invitations.id,
        guestFirstName: guests.firstName,
        guestLastName: guests.lastName,
        eventName: events.name,
      })
      .from(invitations)
      .innerJoin(guests, eq(invitations.guestId, guests.id))
      .innerJoin(events, eq(invitations.eventId, events.id))
      .where(
        and(
          eq(guests.partyId, body.party_id),
          inArray(invitations.id, invitationIds),
        ),
      );

    if (partyInvitations.length !== invitationIds.length) {
      throw new ApiError(
        400,
        "One or more invitation_ids do not belong to the specified party.",
      );
    }

    await db.transaction(async (tx) => {
      for (const response of body.responses) {
        await tx
          .update(invitations)
          .set({
            status: response.status,
            updatedAt: new Date(),
          })
          .where(eq(invitations.id, response.invitation_id));
      }
    });

    // Build email notifications from the response data
    const invitationMap = new Map(
      partyInvitations.map((inv) => [inv.invitationId, inv]),
    );

    const notifications = body.responses
      .filter((r) => r.status === "attending" || r.status === "declined")
      .map((r) => {
        const inv = invitationMap.get(r.invitation_id)!;
        return {
          guestName: getGuestDisplayName({
            firstName: inv.guestFirstName,
            lastName: inv.guestLastName,
          }),
          partyName: party.name,
          eventName: inv.eventName,
          status: r.status as "attending" | "declined",
        };
      });

    // Fire-and-forget — don't block the response on email delivery
    sendRsvpNotification(notifications);

    const updatedParty = await getPublicPartyById(body.party_id);

    if (!updatedParty) {
      throw new ApiError(404, "Party not found.");
    }

    return NextResponse.json(updatedParty);
  } catch (error) {
    return handleRouteError(error);
  }
}
