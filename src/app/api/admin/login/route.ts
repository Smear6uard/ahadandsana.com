import { NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE_NAME,
  createAdminSessionToken,
  getAdminSessionCookieOptions,
  verifyAdminPassword,
} from "@/lib/auth";
import { handleRouteError, parseJsonBody } from "@/lib/api";
import { loginSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const { password } = await parseJsonBody(request, loginSchema);
    const isValid = await verifyAdminPassword(password);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 },
      );
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(
      ADMIN_SESSION_COOKIE_NAME,
      await createAdminSessionToken(),
      getAdminSessionCookieOptions(),
    );

    return response;
  } catch (error) {
    return handleRouteError(error);
  }
}
