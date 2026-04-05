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

interface FlatGuest {
  partyId: number;
  partyName: string;
  guest: GuestData;
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

  const flatGuests = useMemo<FlatGuest[]>(() => {
    const result: FlatGuest[] = [];
    for (const party of parties) {
      for (const guest of party.guests) {
        result.push({
          partyId: party.id,
          partyName: party.name,
          guest,
        });
      }
    }
    return result;
  }, [parties]);

  const filtered = useMemo(() => {
    if (!search.trim()) return flatGuests;
    const q = search.toLowerCase();
    return flatGuests.filter(
      (fg) =>
        fg.guest.first_name.toLowerCase().includes(q) ||
        fg.guest.last_name.toLowerCase().includes(q) ||
        fg.partyName.toLowerCase().includes(q)
    );
  }, [flatGuests, search]);

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
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Search Bar */}
      <div className="px-4 py-3 border-b border-gray-100">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search guests or parties…"
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-3">Party</th>
              <th className="px-4 py-3">Guest</th>
              {events.map((e) => (
                <th key={e.id} className="px-4 py-3">
                  {e.name}
                </th>
              ))}
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3 w-20">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((fg) => (
              <tr
                key={fg.guest.id}
                className="hover:bg-blue-50/30 cursor-pointer transition-colors"
                onClick={() => setEditingGuest(fg.guest)}
              >
                <td className="px-4 py-3 text-gray-700">{fg.partyName}</td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {fg.guest.first_name} {fg.guest.last_name}
                </td>
                {events.map((event) => {
                  const inv = getInvitation(fg.guest, event.name);
                  return (
                    <td
                      key={event.id}
                      className="px-4 py-3"
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
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {fg.guest.email || fg.guest.phone || "—"}
                </td>
                <td
                  className="px-4 py-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleDeleteParty(fg.partyId)}
                    className="text-gray-400 hover:text-red-500 text-xs"
                    title="Delete party"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="px-4 py-12 text-center text-sm text-gray-400">
            {search ? "No guests match your search." : "No guests added yet."}
          </div>
        )}
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden divide-y divide-gray-100">
        {filtered.map((fg) => (
          <div
            key={fg.guest.id}
            className="p-4 active:bg-blue-50/30"
            onClick={() => setEditingGuest(fg.guest)}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  {fg.guest.first_name} {fg.guest.last_name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{fg.partyName}</p>
              </div>
              <div className="flex gap-1.5">
                {events.map((event) => {
                  const inv = getInvitation(fg.guest, event.name);
                  return inv ? (
                    <StatusBadge key={event.id} status={inv.status} />
                  ) : null;
                })}
              </div>
            </div>
            {(fg.guest.email || fg.guest.phone) && (
              <p className="text-xs text-gray-400 mt-2">
                {fg.guest.email || fg.guest.phone}
              </p>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-gray-400">
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
