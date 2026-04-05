import { NextResponse } from "next/server";

import { handleRouteError, parseSearchParams } from "@/lib/api";
import { getPublicPartiesByLookup } from "@/lib/queries";
import { rsvpLookupSchema } from "@/lib/validations";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const { name } = parseSearchParams(
      { name: url.searchParams.get("name") ?? "" },
      rsvpLookupSchema,
    );

    const results = await getPublicPartiesByLookup(name);
    return NextResponse.json(results);
  } catch (error) {
    return handleRouteError(error);
  }
}
