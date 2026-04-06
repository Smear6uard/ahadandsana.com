import { NextResponse } from "next/server";
import { and, eq, notInArray } from "drizzle-orm";

import { db } from "@/db";
import { guests, invitations, parties } from "@/db/schema";
import { ApiError, handleRouteError, parseJsonBody, parseRouteId } from "@/lib/api";
import { assertEventIdsExist, getAdminGuestById } from "@/lib/queries";
import { updateGuestSchema } from "@/lib/validations";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const guestId = parseRouteId(id, "guest id");
    const body = await parseJsonBody(request, updateGuestSchema);

    const existingGuest = await db.query.guests.findFirst({
      where: eq(guests.id, guestId),
      columns: {
        id: true,
        partyId: true,
      },
    });

    if (!existingGuest) {
      throw new ApiError(404, "Guest not found.");
    }

    if (body.event_ids) {
      await assertEventIdsExist(body.event_ids);
    }

    await db.transaction(async (tx) => {
      const guestUpdates: Partial<typeof guests.$inferInsert> = {};

      if (body.first_name !== undefined) {
        guestUpdates.firstName = body.first_name;
      }

      if (body.last_name !== undefined) {
        guestUpdates.lastName = body.last_name;
      }

      if (body.email !== undefined) {
        guestUpdates.email = body.email ?? null;
      }

      if (body.phone !== undefined) {
        guestUpdates.phone = body.phone ?? null;
      }

      if (body.address !== undefined) {
        guestUpdates.address = body.address ?? null;
      }

      if (body.city !== undefined) {
        guestUpdates.city = body.city ?? null;
      }

      if (body.state !== undefined) {
        guestUpdates.state = body.state ?? null;
      }

      if (body.zip !== undefined) {
        guestUpdates.zip = body.zip ?? null;
      }

      const hasGuestUpdates = Object.keys(guestUpdates).length > 0;

      if (hasGuestUpdates) {
        await tx
          .update(guests)
          .set(guestUpdates)
          .where(eq(guests.id, guestId));
      }

      if (body.side !== undefined) {
        await tx
          .update(parties)
          .set({ side: body.side })
          .where(eq(parties.id, existingGuest.partyId));
      }

      if (body.event_ids) {
        const desiredEventIds = [...new Set(body.event_ids)];
        const existingInvitations = await tx
          .select({
            id: invitations.id,
            eventId: invitations.eventId,
          })
          .from(invitations)
          .where(eq(invitations.guestId, guestId));

        const existingEventIds = new Set(
          existingInvitations.map((invitation) => invitation.eventId),
        );
        const eventIdsToInsert = desiredEventIds.filter(
          (eventId) => !existingEventIds.has(eventId),
        );

        if (eventIdsToInsert.length > 0) {
          await tx.insert(invitations).values(
            eventIdsToInsert.map((eventId) => ({
              guestId,
              eventId,
              status: "invited" as const,
            })),
          );
        }

        if (desiredEventIds.length === 0) {
          await tx.delete(invitations).where(eq(invitations.guestId, guestId));
        } else {
          await tx
            .delete(invitations)
            .where(
              and(
                eq(invitations.guestId, guestId),
                notInArray(invitations.eventId, desiredEventIds),
              ),
            );
        }
      }
    });

    const updatedGuest = await getAdminGuestById(guestId);

    if (!updatedGuest) {
      throw new ApiError(404, "Guest not found.");
    }

    return NextResponse.json(updatedGuest);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const guestId = parseRouteId(id, "guest id");

    const deleted = await db
      .delete(guests)
      .where(eq(guests.id, guestId))
      .returning({ id: guests.id });

    if (deleted.length === 0) {
      throw new ApiError(404, "Guest not found.");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
