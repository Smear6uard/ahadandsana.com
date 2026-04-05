import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { parties } from "@/db/schema";
import { ApiError, handleRouteError, parseRouteId } from "@/lib/api";

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
