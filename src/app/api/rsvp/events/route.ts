import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/api";
import { getPublicEvents } from "@/lib/queries";

export async function GET() {
  try {
    const results = await getPublicEvents();
    return NextResponse.json(results);
  } catch (error) {
    return handleRouteError(error);
  }
}
