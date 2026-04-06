import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { parties } from "@/db/schema";
import {
  ApiError,
  handleRouteError,
  parseJsonBody,
  parseRouteId,
} from "@/lib/api";
import { getAdminPartyById } from "@/lib/queries";
import { updatePartySchema } from "@/lib/validations";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const partyId = parseRouteId(id, "party id");
    const body = await parseJsonBody(request, updatePartySchema);

    const updated = await db
      .update(parties)
      .set({ name: body.name })
      .where(eq(parties.id, partyId))
      .returning({ id: parties.id });

    if (updated.length === 0) {
      throw new ApiError(404, "Party not found.");
    }

    const party = await getAdminPartyById(partyId);

    if (!party) {
      throw new ApiError(404, "Party not found.");
    }

    return NextResponse.json(party);
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
    const partyId = parseRouteId(id, "party id");

    const deleted = await db
      .delete(parties)
      .where(eq(parties.id, partyId))
      .returning({ id: parties.id });

    if (deleted.length === 0) {
      throw new ApiError(404, "Party not found.");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
