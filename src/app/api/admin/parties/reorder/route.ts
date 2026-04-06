import { eq, inArray, notInArray } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { parties } from "@/db/schema";
import { ApiError, handleRouteError, parseJsonBody } from "@/lib/api";
import { reorderPartiesSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request, reorderPartiesSchema);

    if (body.party_ids.length === 0) {
      return NextResponse.json({ success: true });
    }

    const existingParties = await db
      .select({ id: parties.id })
      .from(parties)
      .where(inArray(parties.id, body.party_ids));

    if (existingParties.length !== body.party_ids.length) {
      throw new ApiError(400, "One or more party_ids are invalid.");
    }

    await db.transaction(async (tx) => {
      for (const [index, partyId] of body.party_ids.entries()) {
        await tx
          .update(parties)
          .set({ sortOrder: index })
          .where(eq(parties.id, partyId));
      }

      const [maxIndex] = [...body.party_ids.keys()].slice(-1);
      const omittedParties = await tx
        .select({
          id: parties.id,
        })
        .from(parties)
        .where(notInArray(parties.id, body.party_ids))
        .orderBy(parties.sortOrder, parties.createdAt, parties.id);

      for (const [offset, party] of omittedParties.entries()) {
        await tx
          .update(parties)
          .set({ sortOrder: (maxIndex ?? -1) + 1 + offset })
          .where(eq(parties.id, party.id));
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
