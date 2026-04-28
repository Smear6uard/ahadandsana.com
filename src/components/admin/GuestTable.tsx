"use client";

import { useCallback, useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import StatusBadge, { NotInvitedBadge } from "./StatusBadge";
import EditPartyModal from "./EditPartyModal";

interface GuestInvitation {
  id: number;
  event_id: number;
  event_name: string;
  status: "attending" | "invited" | "declined";
}

interface GuestData {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  invitations: GuestInvitation[];
}

type PartySide = "ahad" | "sana" | null;

interface Party {
  id: number;
  name: string;
  side: PartySide;
  guests: GuestData[];
}

interface EventOption {
  id: number;
  name: string;
}

interface EventStat {
  event_id: number;
  event_name: string;
  invited: number;
}

type SideFilter = "all" | "ahad" | "sana";
type EventFilter = "all" | number;
type StatusFilter = "all" | "invited" | "attending" | "declined";

function partyHasStatus(
  party: Party,
  eventFilter: EventFilter,
  status: Exclude<StatusFilter, "all">,
) {
  return party.guests.some((guest) =>
    guest.invitations.some((inv) => {
      if (eventFilter !== "all" && inv.event_id !== eventFilter) {
        return false;
      }
      return inv.status === status;
    }),
  );
}

function guestDisplayName(g: GuestData): string {
  const name = [g.first_name, g.last_name].filter(Boolean).join(" ").trim();
  return name || "Plus One";
}

function getGuestsForEvent(party: Party, eventFilter: EventFilter) {
  if (eventFilter === "all") {
    return party.guests;
  }

  return party.guests.filter((guest) =>
    guest.invitations.some((inv) => inv.event_id === eventFilter)
  );
}

function getPartyStatusSummary(party: Party, eventFilter: EventFilter) {
  let attending = 0;
  let pending = 0;
  let declined = 0;

  for (const g of getGuestsForEvent(party, eventFilter)) {
    for (const inv of g.invitations) {
      if (eventFilter !== "all" && inv.event_id !== eventFilter) {
        continue;
      }

      if (inv.status === "attending") attending++;
      else if (inv.status === "invited") pending++;
      else if (inv.status === "declined") declined++;
    }
  }
  return { attending, pending, declined };
}

function DragHandle() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="text-stone-warm/30 group-hover:text-stone-warm/60 transition-colors shrink-0 cursor-grab active:cursor-grabbing touch-manipulation"
    >
      <circle cx="5" cy="3" r="1.2" fill="currentColor" />
      <circle cx="11" cy="3" r="1.2" fill="currentColor" />
      <circle cx="5" cy="8" r="1.2" fill="currentColor" />
      <circle cx="11" cy="8" r="1.2" fill="currentColor" />
      <circle cx="5" cy="13" r="1.2" fill="currentColor" />
      <circle cx="11" cy="13" r="1.2" fill="currentColor" />
    </svg>
  );
}

function SortablePartyCard({
  party,
  events,
  eventFilter,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  party: Party;
  events: EventOption[];
  eventFilter: EventFilter;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (invitationId: number, newStatus: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: party.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.9 : 1,
  };

  const status = getPartyStatusSummary(party, eventFilter);
  const visibleGuests = getGuestsForEvent(party, eventFilter);
  const visibleEvents =
    eventFilter === "all"
      ? events
      : events.filter((event) => event.id === eventFilter);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`admin-card overflow-hidden transition-shadow ${isDragging ? "shadow-xl" : ""}`}
    >
      {/* Party Header */}
      <div className="flex items-center gap-3 px-4 py-3.5 sm:px-5 sm:py-4 group">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="p-1 -ml-1 touch-manipulation"
          aria-label="Drag to reorder"
        >
          <DragHandle />
        </div>

        {/* Party Info */}
        <div className="flex-1 flex items-start sm:items-center flex-col sm:flex-row gap-1 sm:gap-3 min-w-0">
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <h3 className={`font-display text-base sm:text-lg text-charcoal truncate ${!party.name ? "italic text-stone-warm/50" : ""}`}>
              {party.name || "Unnamed Party"}
            </h3>
            {party.side && (
              <span
                className="inline-flex items-center gap-1 rounded-full border border-gold/25 bg-gold/8 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-gold-dark shrink-0"
                title={party.side === "ahad" ? "Ahad's Side" : "Sana's Side"}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                {party.side === "ahad" ? "Ahad" : "Sana"}
              </span>
            )}
            <span className="text-xs text-stone-warm shrink-0">
              {visibleGuests.length} {visibleGuests.length === 1 ? "guest" : "guests"}
            </span>
          </div>
          <div className="flex gap-1.5 shrink-0">
            {status.attending > 0 && (
              <span className="status-badge status-attending text-[11px] py-0.5 px-2">
                {status.attending} attending
              </span>
            )}
            {status.pending > 0 && (
              <span className="status-badge status-invited text-[11px] py-0.5 px-2">
                {status.pending} pending
              </span>
            )}
            {status.declined > 0 && (
              <span className="status-badge status-declined text-[11px] py-0.5 px-2">
                {status.declined} declined
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onEdit}
            className="admin-btn-secondary text-xs px-3 py-1.5"
          >
            Edit
          </button>
        </div>
      </div>

      {/* Guest List (always expanded) */}
      <div className="border-t border-gold/8">
          {visibleGuests.map((guest) => (
            <div
              key={guest.id}
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-5 py-3 border-b border-gold/5 last:border-b-0 ml-6 sm:ml-8"
            >
              <p className="font-medium text-charcoal text-sm min-w-[140px]">
                {guestDisplayName(guest)}
              </p>
              <div className="flex flex-wrap gap-2 flex-1">
                {visibleEvents.map((event) => {
                  const inv = guest.invitations.find(
                    (i) => i.event_id === event.id
                  );
                  return (
                    <div key={event.id} className="flex items-center gap-1.5">
                      <span className="text-[10px] text-stone-warm/60 uppercase tracking-wider font-medium min-w-[50px]">
                        {event.name}
                      </span>
                      {inv ? (
                        <StatusBadge
                          status={inv.status}
                          onChange={(newStatus) =>
                            onStatusChange(inv.id, newStatus)
                          }
                        />
                      ) : (
                        <NotInvitedBadge />
                      )}
                    </div>
                  );
                })}
              </div>
              {(guest.email || guest.phone) && (
                <span className="text-xs text-stone-warm/50 sm:text-right shrink-0">
                  {guest.email || guest.phone}
                </span>
              )}
            </div>
          ))}

          {/* Delete party button at bottom of guest list */}
          <div className="px-5 py-2.5 border-t border-gold/5 flex justify-end">
            <button
              onClick={onDelete}
              className="text-stone-warm/40 hover:text-red-400 text-xs transition-colors"
            >
              Delete party
            </button>
          </div>
        </div>
    </div>
  );
}

export default function GuestTable({
  parties,
  events,
  eventFilter,
  eventStats,
  totalGuests,
  onEventFilterChange,
  onRefresh,
}: {
  parties: Party[];
  events: EventOption[];
  eventFilter: EventFilter;
  eventStats: EventStat[];
  totalGuests: number;
  onEventFilterChange: (filter: EventFilter) => void;
  onRefresh: () => void;
}) {
  const [search, setSearch] = useState("");
  const [sideFilter, setSideFilter] = useState<SideFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [partyOrder, setPartyOrder] = useState<number[] | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const orderedParties = useMemo(() => {
    if (!partyOrder) return parties;
    const map = new Map(parties.map((p) => [p.id, p]));
    const ordered: Party[] = [];
    for (const id of partyOrder) {
      const p = map.get(id);
      if (p) ordered.push(p);
    }
    // Append any parties not in the order (newly added)
    for (const p of parties) {
      if (!partyOrder.includes(p.id)) ordered.push(p);
    }
    return ordered;
  }, [parties, partyOrder]);

  const filteredParties = useMemo(() => {
    let filtered = orderedParties;

    if (sideFilter !== "all") {
      filtered = filtered.filter((p) => p.side === sideFilter);
    }

    if (eventFilter !== "all") {
      filtered = filtered.filter((p) =>
        p.guests.some((g) =>
          g.invitations.some((inv) => inv.event_id === eventFilter)
        )
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((p) =>
        partyHasStatus(p, eventFilter, statusFilter),
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          getGuestsForEvent(p, eventFilter).some(
            (g) =>
              (g.first_name || "").toLowerCase().includes(q) ||
              (g.last_name || "").toLowerCase().includes(q)
          )
      );
    }

    return filtered;
  }, [orderedParties, sideFilter, eventFilter, statusFilter, search]);

  const statusCounts = useMemo(() => {
    const basis = orderedParties.filter((p) => {
      if (sideFilter !== "all" && p.side !== sideFilter) return false;
      if (
        eventFilter !== "all" &&
        !p.guests.some((g) =>
          g.invitations.some((inv) => inv.event_id === eventFilter),
        )
      ) {
        return false;
      }
      return true;
    });

    return {
      all: basis.length,
      invited: basis.filter((p) => partyHasStatus(p, eventFilter, "invited"))
        .length,
      attending: basis.filter((p) =>
        partyHasStatus(p, eventFilter, "attending"),
      ).length,
      declined: basis.filter((p) => partyHasStatus(p, eventFilter, "declined"))
        .length,
    };
  }, [orderedParties, sideFilter, eventFilter]);

  const hasActiveFilters =
    sideFilter !== "all" ||
    statusFilter !== "all" ||
    eventFilter !== "all" ||
    search.trim().length > 0;

  const clearAllFilters = useCallback(() => {
    setSideFilter("all");
    setStatusFilter("all");
    setSearch("");
    onEventFilterChange("all");
  }, [onEventFilterChange]);

  const sideCounts = useMemo(() => {
    const countVisibleGuests = (party: Party) =>
      getGuestsForEvent(party, eventFilter).length;
    const all = parties.reduce((s, p) => s + countVisibleGuests(p), 0);
    const ahad = parties
      .filter((p) => p.side === "ahad")
      .reduce((s, p) => s + countVisibleGuests(p), 0);
    const sana = parties
      .filter((p) => p.side === "sana")
      .reduce((s, p) => s + countVisibleGuests(p), 0);
    return { all, ahad, sana };
  }, [parties, eventFilter]);

  const eventCounts = useMemo(
    () => new Map(eventStats.map((event) => [event.event_id, event.invited])),
    [eventStats],
  );

  const activeEvent = useMemo(
    () =>
      eventFilter === "all"
        ? null
        : events.find((event) => event.id === eventFilter) ?? null,
    [eventFilter, events],
  );

  const filteredGuestCount = useMemo(
    () =>
      filteredParties.reduce(
        (sum, party) => sum + getGuestsForEvent(party, eventFilter).length,
        0,
      ),
    [eventFilter, filteredParties],
  );

  const handleStatusChange = useCallback(
    async (invitationId: number, newStatus: string) => {
      try {
        const res = await fetch(`/api/admin/invitations/${invitationId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
        if (res.ok) onRefresh();
      } catch {
        // Will revert on next refresh
      }
    },
    [onRefresh]
  );

  const handleDeleteParty = useCallback(
    async (partyId: number) => {
      if (!confirm("Delete this entire party and all its guests?")) return;
      try {
        const res = await fetch(`/api/admin/parties/${partyId}`, {
          method: "DELETE",
        });
        if (res.ok) onRefresh();
      } catch {
        // ignore
      }
    },
    [onRefresh]
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const currentIds = filteredParties.map((p) => p.id);
    const oldIndex = currentIds.indexOf(active.id as number);
    const newIndex = currentIds.indexOf(over.id as number);
    if (oldIndex === -1 || newIndex === -1) return;

    const allIds = orderedParties.map((p) => p.id);
    const newOrder = arrayMove(allIds, allIds.indexOf(active.id as number), allIds.indexOf(over.id as number));
    setPartyOrder(newOrder);

    // Persist to backend
    fetch("/api/admin/parties/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ party_ids: newOrder }),
    }).catch(() => {
      // Revert on failure
      setPartyOrder(null);
    });
  }

  const sortableIds = filteredParties.map((p) => p.id);

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="admin-card p-4 space-y-3">
        {/* Side Filter Tabs */}
        <div className="side-filter-track">
          <button
            className={`side-filter-tab ${sideFilter === "all" ? "side-filter-active" : ""}`}
            onClick={() => setSideFilter("all")}
          >
            All Guests
            <span className="side-filter-count">{sideCounts.all}</span>
          </button>
          <button
            className={`side-filter-tab ${sideFilter === "ahad" ? "side-filter-active" : ""}`}
            onClick={() => setSideFilter("ahad")}
          >
            {"Ahad's List"}
            <span className="side-filter-count">{sideCounts.ahad}</span>
          </button>
          <button
            className={`side-filter-tab ${sideFilter === "sana" ? "side-filter-active" : ""}`}
            onClick={() => setSideFilter("sana")}
          >
            {"Sana's List"}
            <span className="side-filter-count">{sideCounts.sana}</span>
          </button>
        </div>

        {/* Event Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              eventFilter === "all"
                ? "bg-charcoal text-ivory shadow-sm"
                : "text-stone-warm hover:text-charcoal hover:bg-gold/5 border border-gold/15"
            }`}
            onClick={() => onEventFilterChange("all")}
          >
            <span>All Events</span>
            <span
              className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] ${
                eventFilter === "all"
                  ? "bg-ivory/15 text-ivory"
                  : "bg-gold/10 text-stone-warm"
              }`}
            >
              {totalGuests}
            </span>
          </button>
          {events.map((event) => (
            <button
              key={event.id}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                eventFilter === event.id
                  ? "bg-charcoal text-ivory shadow-sm ring-1 ring-charcoal/10"
                  : "text-stone-warm hover:text-charcoal hover:bg-gold/5 border border-gold/15"
              }`}
              onClick={() =>
                onEventFilterChange(eventFilter === event.id ? "all" : event.id)
              }
            >
              <span>{event.name}</span>
              <span
                className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] ${
                  eventFilter === event.id
                    ? "bg-ivory/15 text-ivory"
                    : "bg-gold/10 text-stone-warm"
                }`}
              >
                {eventCounts.get(event.id) ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {(
            [
              {
                key: "all",
                label: "All Statuses",
                dot: null,
                activeClass: "bg-charcoal text-ivory shadow-sm ring-1 ring-charcoal/10",
                count: statusCounts.all,
              },
              {
                key: "invited",
                label: "Pending",
                dot: "bg-gold",
                activeClass:
                  "bg-gold/15 text-gold-dark shadow-sm ring-1 ring-gold/30",
                count: statusCounts.invited,
              },
              {
                key: "attending",
                label: "Attending",
                dot: "bg-forest",
                activeClass:
                  "bg-forest/10 text-forest shadow-sm ring-1 ring-forest/25",
                count: statusCounts.attending,
              },
              {
                key: "declined",
                label: "Declined",
                dot: "bg-red-400",
                activeClass:
                  "bg-red-50 text-red-500 shadow-sm ring-1 ring-red-200",
                count: statusCounts.declined,
              },
            ] as const
          ).map(({ key, label, dot, activeClass, count }) => {
            const isActive = statusFilter === key;
            return (
              <button
                key={key}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? activeClass
                    : "text-stone-warm hover:text-charcoal hover:bg-gold/5 border border-gold/15"
                }`}
                onClick={() =>
                  setStatusFilter(
                    statusFilter === key ? "all" : (key as StatusFilter),
                  )
                }
              >
                {dot && (
                  <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                )}
                <span>{label}</span>
                <span
                  className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] ${
                    isActive
                      ? "bg-charcoal/8 text-current"
                      : "bg-gold/10 text-stone-warm"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {activeEvent ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-gold/10 px-3 py-1 text-charcoal">
              <span className="h-2 w-2 rounded-full bg-gold" />
              {activeEvent.name} filter active
            </span>
          ) : (
            <span className="text-stone-warm">Showing all events</span>
          )}
          <span className="text-stone-warm">
            {filteredParties.length} {filteredParties.length === 1 ? "party" : "parties"} •{" "}
            {filteredGuestCount} {filteredGuestCount === 1 ? "guest" : "guests"}
          </span>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="ml-auto text-gold hover:text-gold-dark underline-offset-4 hover:underline transition-colors font-medium tracking-wide"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/40"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guests or parties..."
            className="admin-input"
            style={{ paddingLeft: 44 }}
          />
        </div>
      </div>

      {/* Party Cards with Drag and Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortableIds}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {filteredParties.map((party) => (
              <SortablePartyCard
                key={party.id}
                party={party}
                events={events}
                eventFilter={eventFilter}
                onEdit={() => setEditingParty(party)}
                onDelete={() => handleDeleteParty(party.id)}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {filteredParties.length === 0 && (
        <div className="admin-card p-12 text-center text-sm text-stone-warm">
          {search
            ? "No parties match your search."
            : activeEvent
              ? `No parties found for ${activeEvent.name}.`
              : "No guests added yet."}
        </div>
      )}

      {/* Edit Party Modal */}
      {editingParty && (
        <EditPartyModal
          party={editingParty}
          events={events}
          onClose={() => setEditingParty(null)}
          onSaved={() => {
            setEditingParty(null);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}
