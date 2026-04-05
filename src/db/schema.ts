import { relations } from "drizzle-orm";
import {
  date,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

export const invitationStatuses = ["invited", "attending", "declined"] as const;

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  date: date("date", { mode: "string" }).notNull(),
  time: varchar("time", { length: 20 }).notNull().default(""),
  venueName: varchar("venue_name", { length: 255 }).notNull(),
  venueAddress: text("venue_address").notNull(),
  googleMapsUrl: text("google_maps_url").notNull().default(""),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const parties = pgTable("parties", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const guests = pgTable("guests", {
  id: serial("id").primaryKey(),
  partyId: integer("party_id")
    .notNull()
    .references(() => parties.id, { onDelete: "cascade" }),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zip: varchar("zip", { length: 10 }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const invitations = pgTable(
  "invitations",
  {
    id: serial("id").primaryKey(),
    guestId: integer("guest_id")
      .notNull()
      .references(() => guests.id, { onDelete: "cascade" }),
    eventId: integer("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 20, enum: invitationStatuses })
      .notNull()
      .default("invited"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .notNull()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [unique("invitations_guest_id_event_id_unique").on(table.guestId, table.eventId)],
);

export const eventsRelations = relations(events, ({ many }) => ({
  invitations: many(invitations),
}));

export const partiesRelations = relations(parties, ({ many }) => ({
  guests: many(guests),
}));

export const guestsRelations = relations(guests, ({ one, many }) => ({
  party: one(parties, {
    fields: [guests.partyId],
    references: [parties.id],
  }),
  invitations: many(invitations),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  guest: one(guests, {
    fields: [invitations.guestId],
    references: [guests.id],
  }),
  event: one(events, {
    fields: [invitations.eventId],
    references: [events.id],
  }),
}));

export type InvitationStatus = (typeof invitationStatuses)[number];
