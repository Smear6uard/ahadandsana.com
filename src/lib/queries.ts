import { and, asc, eq, ilike, inArray } from "drizzle-orm";

import { db } from "@/db";
import { events, guests, parties } from "@/db/schema";
import { ApiError } from "@/lib/api";

async function fetchAdminPartiesRaw() {
  return db.query.parties.findMany({
    orderBy: (table, { asc: ascFn }) => [ascFn(table.id)],
    with: {
      guests: {
        orderBy: (table, { asc: ascFn }) => [ascFn(table.id)],
        with: {
          invitations: {
            orderBy: (table, { asc: ascFn }) => [ascFn(table.id)],
            with: {
              event: true,
            },
          },
        },
      },
    },
  });
}

async function fetchAdminPartyRaw(partyId: number) {
  return db.query.parties.findFirst({
    where: eq(parties.id, partyId),
    with: {
      guests: {
        orderBy: (table, { asc: ascFn }) => [ascFn(table.id)],
        with: {
          invitations: {
            orderBy: (table, { asc: ascFn }) => [ascFn(table.id)],
            with: {
              event: true,
            },
          },
        },
      },
    },
  });
}

async function fetchAdminGuestRaw(guestId: number) {
  return db.query.guests.findFirst({
    where: eq(guests.id, guestId),
    with: {
      invitations: {
        orderBy: (table, { asc: ascFn }) => [ascFn(table.id)],
        with: {
          event: true,
        },
      },
    },
  });
}

async function fetchPublicPartiesRaw(partyIds: number[]) {
  if (partyIds.length === 0) {
    return [];
  }

  return db.query.parties.findMany({
    where: inArray(parties.id, partyIds),
    orderBy: (table, { asc: ascFn }) => [ascFn(table.id)],
    with: {
      guests: {
        orderBy: (table, { asc: ascFn }) => [ascFn(table.id)],
        with: {
          invitations: {
            orderBy: (table, { asc: ascFn }) => [ascFn(table.id)],
            with: {
              event: true,
            },
          },
        },
      },
    },
  });
}

type AdminPartyRecord = Awaited<ReturnType<typeof fetchAdminPartiesRaw>>[number];
type AdminGuestRecord = NonNullable<Awaited<ReturnType<typeof fetchAdminGuestRaw>>>;
type PublicPartyRecord = Awaited<ReturnType<typeof fetchPublicPartiesRaw>>[number];

export type AdminPartyResponse = {
  id: number;
  name: string;
  guests: Array<{
    id: number;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    invitations: Array<{
      id: number;
      event_id: number;
      event_name: string;
      status: string;
    }>;
  }>;
};

export type AdminGuestResponse = AdminPartyResponse["guests"][number];

export type PublicPartyResponse = {
  party_id: number;
  party_name: string;
  guests: Array<{
    guest_id: number;
    name: string;
    invitations: Array<{
      invitation_id: number;
      event_id: number;
      event_name: string;
      event_date: string;
      event_time: string;
      venue_name: string;
      venue_address: string;
      google_maps_url: string;
      status: string;
    }>;
  }>;
};

export type PublicEventResponse = {
  id: number;
  name: string;
  date: string;
  time: string;
  venue_name: string;
  venue_address: string;
  google_maps_url: string;
};

function serializeAdminParty(party: AdminPartyRecord): AdminPartyResponse {
  return {
    id: party.id,
    name: party.name,
    guests: party.guests.map((guest) => ({
      id: guest.id,
      first_name: guest.firstName,
      last_name: guest.lastName,
      email: guest.email ?? null,
      phone: guest.phone ?? null,
      address: guest.address ?? null,
      city: guest.city ?? null,
      state: guest.state ?? null,
      zip: guest.zip ?? null,
      invitations: guest.invitations.map((invitation) => ({
        id: invitation.id,
        event_id: invitation.eventId,
        event_name: invitation.event.name,
        status: invitation.status,
      })),
    })),
  };
}

function serializeAdminGuest(guest: AdminGuestRecord): AdminGuestResponse {
  return {
    id: guest.id,
    first_name: guest.firstName,
    last_name: guest.lastName,
    email: guest.email ?? null,
    phone: guest.phone ?? null,
    address: guest.address ?? null,
    city: guest.city ?? null,
    state: guest.state ?? null,
    zip: guest.zip ?? null,
    invitations: guest.invitations.map((invitation) => ({
      id: invitation.id,
      event_id: invitation.eventId,
      event_name: invitation.event.name,
      status: invitation.status,
    })),
  };
}

function serializePublicParty(party: PublicPartyRecord): PublicPartyResponse {
  return {
    party_id: party.id,
    party_name: party.name,
    guests: party.guests.map((guest) => ({
      guest_id: guest.id,
      name: [guest.firstName, guest.lastName].join(" ").trim(),
      invitations: guest.invitations.map((invitation) => ({
        invitation_id: invitation.id,
        event_id: invitation.eventId,
        event_name: invitation.event.name,
        event_date: invitation.event.date,
        event_time: invitation.event.time,
        venue_name: invitation.event.venueName,
        venue_address: invitation.event.venueAddress,
        google_maps_url: invitation.event.googleMapsUrl,
        status: invitation.status,
      })),
    })),
  };
}

export async function assertEventIdsExist(eventIds: number[]) {
  const uniqueEventIds = [...new Set(eventIds)];

  if (uniqueEventIds.length === 0) {
    return;
  }

  const existingEvents = await db
    .select({ id: events.id })
    .from(events)
    .where(inArray(events.id, uniqueEventIds));

  if (existingEvents.length !== uniqueEventIds.length) {
    throw new ApiError(400, "One or more event_ids are invalid.");
  }
}

export async function getAdminParties() {
  const results = await fetchAdminPartiesRaw();
  return results.map(serializeAdminParty);
}

export async function getAdminPartyById(partyId: number) {
  const result = await fetchAdminPartyRaw(partyId);
  return result ? serializeAdminParty(result) : null;
}

export async function getAdminGuestById(guestId: number) {
  const result = await fetchAdminGuestRaw(guestId);
  return result ? serializeAdminGuest(result) : null;
}

export async function getPublicPartyById(partyId: number) {
  const results = await fetchPublicPartiesRaw([partyId]);
  const party = results[0];
  return party ? serializePublicParty(party) : null;
}

export async function getPublicPartiesByLookup(firstName: string, lastName: string) {
  const matchedPartyIds = await db
    .selectDistinct({ partyId: guests.partyId })
    .from(guests)
    .where(
      and(
        ilike(guests.firstName, `%${firstName}%`),
        ilike(guests.lastName, `%${lastName}%`),
      ),
    )
    .orderBy(asc(guests.partyId));

  const results = await fetchPublicPartiesRaw(
    matchedPartyIds.map((match) => match.partyId),
  );

  return results.map(serializePublicParty);
}

export async function getPublicEvents(): Promise<PublicEventResponse[]> {
  const results = await db
    .select({
      id: events.id,
      name: events.name,
      date: events.date,
      time: events.time,
      venue_name: events.venueName,
      venue_address: events.venueAddress,
      google_maps_url: events.googleMapsUrl,
    })
    .from(events)
    .orderBy(asc(events.date), asc(events.id));

  return results;
}
