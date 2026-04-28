import { z } from "zod";

import { invitationStatuses, partySides } from "@/db/schema";

const positiveInt = z
  .number()
  .int()
  .positive();

const optionalTrimmedString = (maxLength: number) =>
  z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }

      const trimmed = value.trim();
      return trimmed.length === 0 ? undefined : trimmed;
    },
    z.string().max(maxLength).optional(),
  );

const optionalEmail = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return value;
    }

    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  },
  z.email().max(255).optional(),
);

const optionalNullableTrimmedString = (maxLength: number) =>
  z.preprocess(
    (value) => {
      if (value === null || value === undefined) {
        return value;
      }

      if (typeof value !== "string") {
        return value;
      }

      const trimmed = value.trim();
      return trimmed.length === 0 ? null : trimmed;
    },
    z.string().max(maxLength).nullable().optional(),
  );

const optionalPositiveIntSearchParam = z.preprocess(
  (value) => {
    if (value === null || value === undefined || value === "") {
      return undefined;
    }

    if (typeof value === "string") {
      return Number(value);
    }

    return value;
  },
  positiveInt.optional(),
);

const eventIdsSchema = z
  .array(positiveInt)
  .refine((ids) => new Set(ids).size === ids.length, {
    message: "event_ids must not contain duplicates.",
  });

const guestBaseSchema = z.object({
  first_name: optionalNullableTrimmedString(100),
  last_name: optionalNullableTrimmedString(100),
  email: optionalEmail,
  phone: optionalTrimmedString(20),
  address: optionalTrimmedString(500),
  city: optionalTrimmedString(100),
  state: optionalTrimmedString(50),
  zip: optionalTrimmedString(10),
});

export const loginSchema = z.object({
  password: z.string().min(1, "Password is required."),
});

export const createPartySchema = z.object({
  party_name: optionalTrimmedString(255),
  side: z.enum(partySides).optional(),
  guests: z
    .array(
      guestBaseSchema.extend({
        event_ids: eventIdsSchema.min(1, "Each guest must have at least one event."),
      }),
    )
    .min(1, "At least one guest is required."),
});

export const updateGuestSchema = guestBaseSchema
  .extend({
    event_ids: eventIdsSchema.optional(),
    side: z.enum(partySides).nullable().optional(),
  });

export const updatePartySchema = z.object({
  name: z.string().trim().max(255).optional(),
  side: z.enum(partySides).nullable().optional(),
});

export const addGuestToPartySchema = guestBaseSchema.extend({
  event_ids: eventIdsSchema.min(1, "Guest must have at least one event."),
});

export const reorderPartiesSchema = z.object({
  party_ids: z
    .array(positiveInt)
    .refine((ids) => new Set(ids).size === ids.length, {
      message: "party_ids must not contain duplicates.",
    }),
});

const optionalSideSearchParam = z.preprocess(
  (value) => (value === null || value === undefined || value === "" ? undefined : value),
  z.enum(partySides).optional(),
);

const optionalStatusSearchParam = z.preprocess(
  (value) => (value === null || value === undefined || value === "" ? undefined : value),
  z.enum(invitationStatuses).optional(),
);

export const adminPartiesQuerySchema = z.object({
  event_id: optionalPositiveIntSearchParam,
  side: optionalSideSearchParam,
  status: optionalStatusSearchParam,
});

export const updateInvitationSchema = z.object({
  status: z.enum(invitationStatuses),
});

export const rsvpSubmitSchema = z.object({
  party_id: positiveInt,
  responses: z
    .array(
      z.object({
        invitation_id: positiveInt,
        status: z.enum(invitationStatuses),
      }),
    )
    .min(1, "At least one RSVP response is required."),
});

export const rsvpLookupSchema = z
  .object({
    first_name: optionalTrimmedString(100),
    last_name: optionalTrimmedString(100),
  })
  .refine(
    (value) => Boolean(value.first_name || value.last_name),
    {
      message: "At least one of first_name or last_name is required.",
      path: ["first_name"],
    },
  );

export type LoginInput = z.infer<typeof loginSchema>;
export type CreatePartyInput = z.infer<typeof createPartySchema>;
export type UpdateGuestInput = z.infer<typeof updateGuestSchema>;
export type UpdatePartyInput = z.infer<typeof updatePartySchema>;
export type AddGuestToPartyInput = z.infer<typeof addGuestToPartySchema>;
export type UpdateInvitationInput = z.infer<typeof updateInvitationSchema>;
export type RsvpSubmitInput = z.infer<typeof rsvpSubmitSchema>;
export type RsvpLookupInput = z.infer<typeof rsvpLookupSchema>;
