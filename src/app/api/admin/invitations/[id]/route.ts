import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { invitations } from "@/db/schema";
import { ApiError, handleRouteError, parseJsonBody, parseRouteId } from "@/lib/api";
import { updateInvitationSchema } from "@/lib/validations";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const invitationId = parseRouteId(id, "invitation id");
    const { status } = await parseJsonBody(request, updateInvitationSchema);

    const [updatedInvitation] = await db
      .update(invitations)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(invitations.id, invitationId))
      .returning();

    if (!updatedInvitation) {
      throw new ApiError(404, "Invitation not found.");
    }

    return NextResponse.json(updatedInvitation);
  } catch (error) {
    return handleRouteError(error);
  }
}
