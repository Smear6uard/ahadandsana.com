import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";

type ErrorDetails = Record<string, unknown> | string[] | undefined;

export class ApiError extends Error {
  status: number;
  details?: ErrorDetails;

  constructor(status: number, message: string, details?: ErrorDetails) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export function jsonError(
  status: number,
  error: string,
  details?: ErrorDetails,
) {
  return NextResponse.json(
    details ? { error, details } : { error },
    { status },
  );
}

export function parseRouteId(value: string, fieldName = "id") {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ApiError(400, `${fieldName} must be a positive integer.`);
  }

  return parsed;
}

export async function parseJsonBody<T>(
  request: Request,
  schema: ZodType<T>,
): Promise<T> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    throw new ApiError(400, "Invalid JSON body.");
  }

  const result = schema.safeParse(body);

  if (!result.success) {
    throw new ApiError(400, "Validation failed.", result.error.flatten());
  }

  return result.data;
}

export function parseSearchParams<T>(
  values: Record<string, unknown>,
  schema: ZodType<T>,
): T {
  const result = schema.safeParse(values);

  if (!result.success) {
    throw new ApiError(400, "Validation failed.", result.error.flatten());
  }

  return result.data;
}

export function handleRouteError(error: unknown) {
  if (error instanceof ApiError) {
    return jsonError(error.status, error.message, error.details);
  }

  if (error instanceof ZodError) {
    return jsonError(400, "Validation failed.", error.flatten());
  }

  console.error(error);
  return jsonError(500, "Internal server error.");
}
