"use client";

import { useCallback, useMemo, useState } from "react";
import StatusBadge, { NotInvitedBadge } from "./StatusBadge";
import EditGuestModal from "./EditGuestModal";

interface GuestInvitation {
  id: number;
  event_id: number;
  event_name: string;
  status: "attending" | "invited" | "declined";
}

interface GuestData {
  id: number;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  invitations: GuestInvitation[];
}

interface Party {
  id: number;
  name: string;
  guests: GuestData[];
}

interface EventOption {
  id: number;
  name: string;
}

interface GroupedParty {
  partyId: number;
  partyName: string;
  guests: GuestData[];
}

export default function GuestTable({
  parties,
  events,
  onRefresh,
}: {
  parties: Party[];
  events: EventOption[];
  onRefresh: () => void;
}) {
  const [search, setSearch] = useState("");
  const [editingGuest, setEditingGuest] = useState<GuestData | null>(null);

  const groupedParties = useMemo<GroupedParty[]>(() => {
    if (!search.trim()) {
      return parties.map((p) => ({
        partyId: p.id,
        partyName: p.name,
        guests: p.guests,
      }));
    }
    const q = search.toLowerCase();
    const result: GroupedParty[] = [];
    for (const party of parties) {
      const matchingGuests = party.guests.filter(
        (g) =>
          g.first_name.toLowerCase().includes(q) ||
          g.last_name.toLowerCase().includes(q) ||
          party.name.toLowerCase().includes(q)
      );
      if (matchingGuests.length > 0) {
        result.push({
          partyId: party.id,
          partyName: party.name,
          guests: matchingGuests,
        });
      }
    }
    return result;
  }, [parties, search]);

  const totalGuests = groupedParties.reduce(
    (sum, p) => sum + p.guests.length,
    0
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
        // silently fail — status will revert on next refresh
      }
    },
    [onRefresh]
  );

  function getInvitation(guest: GuestData, eventName: string) {
    return guest.invitations.find((inv) => inv.event_name === eventName);
  }

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

  return (
    <div className="admin-card overflow-hidden">
      {/* Search Bar */}
      <div className="px-5 py-4 border-b border-gold/8">
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

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Party</th>
              <th>Guest</th>
              {events.map((e) => (
                <th key={e.id}>{e.name}</th>
              ))}
              <th>Contact</th>
              <th className="w-20">Actions</th>
            </tr>
          </thead>
          <tbody>
            {groupedParties.map((party) =>
              party.guests.map((guest, gi) => {
                const isFirst = gi === 0;
                const isLast = gi === party.guests.length - 1;
                const isMulti = party.guests.length > 1;

                let rowClass = "";
                if (isMulti) {
                  if (isFirst) rowClass = "party-group party-group-first";
                  else if (isLast) rowClass = "party-group party-group-last";
                  else rowClass = "party-group party-group-middle";
                }

                return (
                  <tr
                    key={guest.id}
                    className={rowClass}
                    onClick={() => setEditingGuest(guest)}
                  >
                    <td className="text-stone-warm">
                      {isMulti && <div className="party-group-bar" />}
                      {isFirst ? (
                        <span className="font-medium text-charcoal-light text-[13px]">
                          {party.partyName}
                        </span>
                      ) : (
                        <span className="text-transparent select-none text-[13px]">
                          {party.partyName}
                        </span>
                      )}
                    </td>
                    <td className="font-medium text-charcoal">
                      {guest.first_name} {guest.last_name}
                    </td>
                    {events.map((event) => {
                      const inv = getInvitation(guest, event.name);
                      return (
                        <td
                          key={event.id}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {inv ? (
                            <StatusBadge
                              status={inv.status}
                              onChange={(newStatus) =>
                                handleStatusChange(inv.id, newStatus)
                              }
                            />
                          ) : (
                            <NotInvitedBadge />
                          )}
                        </td>
                      );
                    })}
                    <td className="text-stone-warm text-xs">
                      {guest.email || guest.phone || "—"}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {isFirst && (
                        <button
                          onClick={() => handleDeleteParty(party.partyId)}
                          className="text-stone-warm/40 hover:text-red-400 text-xs transition-colors"
                          title="Delete party"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        {totalGuests === 0 && (
          <div className="px-4 py-16 text-center text-sm text-stone-warm">
            {search ? "No guests match your search." : "No guests added yet."}
          </div>
        )}
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden">
        {groupedParties.map((party) => (
          <div key={party.partyId} className="border-b border-gold/8 last:border-b-0">
            {/* Party header */}
            <div className="px-4 pt-3 pb-1 flex items-center justify-between">
              <p className="label-caps text-[10px]">{party.partyName}</p>
              <button
                onClick={() => handleDeleteParty(party.partyId)}
                className="text-stone-warm/30 hover:text-red-400 text-[10px] transition-colors"
              >
                Delete
              </button>
            </div>
            {/* Guests in party */}
            {party.guests.map((guest) => (
              <div
                key={guest.id}
                className="px-4 py-3 ml-3 border-l-2 border-gold/15 active:bg-gold/5 transition-colors"
                onClick={() => setEditingGuest(guest)}
              >
                <div className="flex items-start justify-between">
                  <p className="font-medium text-charcoal text-sm">
                    {guest.first_name} {guest.last_name}
                  </p>
                  <div className="flex gap-1.5">
                    {events.map((event) => {
                      const inv = getInvitation(guest, event.name);
                      return inv ? (
                        <StatusBadge key={event.id} status={inv.status} />
                      ) : null;
                    })}
                  </div>
                </div>
                {(guest.email || guest.phone) && (
                  <p className="text-xs text-stone-warm/60 mt-1">
                    {guest.email || guest.phone}
                  </p>
                )}
              </div>
            ))}
          </div>
        ))}
        {totalGuests === 0 && (
          <div className="p-12 text-center text-sm text-stone-warm">
            {search ? "No guests match your search." : "No guests added yet."}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingGuest && (
        <EditGuestModal
          guest={editingGuest}
          events={events}
          onClose={() => setEditingGuest(null)}
          onSaved={onRefresh}
        />
      )}
    </div>
  );
}
