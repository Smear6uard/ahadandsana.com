import { NextResponse } from "next/server";
import { and, eq, notInArray } from "drizzle-orm";

import { db } from "@/db";
import { guests, invitations } from "@/db/schema";
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
      },
    });

    if (!existingGuest) {
      throw new ApiError(404, "Guest not found.");
    }

    if (body.event_ids) {
      await assertEventIdsExist(body.event_ids);
    }

    await db.transaction(async (tx) => {
      const guestUpdates = {
        firstName: body.first_name,
        lastName: body.last_name,
        email: body.email ?? undefined,
        phone: body.phone ?? undefined,
        address: body.address ?? undefined,
        city: body.city ?? undefined,
        state: body.state ?? undefined,
        zip: body.zip ?? undefined,
      };

      const hasGuestUpdates = Object.values(guestUpdates).some(
        (value) => value !== undefined,
      );

      if (hasGuestUpdates) {
        await tx
          .update(guests)
          .set({
            firstName: body.first_name,
            lastName: body.last_name,
            email: body.email ?? null,
            phone: body.phone ?? null,
            address: body.address ?? null,
            city: body.city ?? null,
            state: body.state ?? null,
            zip: body.zip ?? null,
          })
          .where(eq(guests.id, guestId));
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
