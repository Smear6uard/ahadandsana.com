import { z } from "zod";

import { invitationStatuses } from "@/db/schema";

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

const eventIdsSchema = z
  .array(positiveInt)
  .refine((ids) => new Set(ids).size === ids.length, {
    message: "event_ids must not contain duplicates.",
  });

const guestBaseSchema = z.object({
  first_name: z.string().trim().min(1).max(100),
  last_name: z.string().trim().min(1).max(100),
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
  party_name: z.string().trim().min(1).max(255),
  guests: z
    .array(
      guestBaseSchema.extend({
        event_ids: eventIdsSchema.min(1, "Each guest must have at least one event."),
      }),
    )
    .min(1, "At least one guest is required."),
});

export const updateGuestSchema = guestBaseSchema
  .partial()
  .extend({
    event_ids: eventIdsSchema.optional(),
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

export const rsvpLookupSchema = z.object({
  first_name: z.string().trim().min(1, "first_name is required."),
  last_name: z.string().trim().min(1, "last_name is required."),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreatePartyInput = z.infer<typeof createPartySchema>;
export type UpdateGuestInput = z.infer<typeof updateGuestSchema>;
export type UpdateInvitationInput = z.infer<typeof updateInvitationSchema>;
export type RsvpSubmitInput = z.infer<typeof rsvpSubmitSchema>;
export type RsvpLookupInput = z.infer<typeof rsvpLookupSchema>;
