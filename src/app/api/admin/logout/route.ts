import { NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE_NAME,
  getClearedAdminSessionCookieOptions,
} from "@/lib/auth";
import { handleRouteError } from "@/lib/api";

export async function POST() {
  try {
    const response = NextResponse.json({ success: true });
    response.cookies.set(
      ADMIN_SESSION_COOKIE_NAME,
      "",
      getClearedAdminSessionCookieOptions(),
    );

    return response;
  } catch (error) {
    return handleRouteError(error);
  }
}
