"use client";

import { useCallback, useState } from "react";

interface EventOption {
  id: number;
  name: string;
}

interface GuestInvitation {
  id: number;
  event_id: number;
  event_name: string;
  status: string;
}

type PartySide = "ahad" | "sana" | null;

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

interface Party {
  id: number;
  name: string;
  side: PartySide;
  guests: GuestData[];
}

interface GuestForm {
  id: number | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  event_ids: number[];
  statuses: Record<number, string>;
}

function guestToForm(g: GuestData): GuestForm {
  return {
    id: g.id,
    first_name: g.first_name || "",
    last_name: g.last_name || "",
    email: g.email || "",
    phone: g.phone || "",
    address: g.address || "",
    city: g.city || "",
    state: g.state || "",
    zip: g.zip || "",
    event_ids: g.invitations.map((inv) => inv.event_id),
    statuses: Object.fromEntries(
      g.invitations.map((inv) => [inv.event_id, inv.status])
    ),
  };
}

export default function EditPartyModal({
  party,
  events,
  onClose,
  onSaved,
}: {
  party: Party;
  events: EventOption[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [partyName, setPartyName] = useState(party.name);
  const [side, setSide] = useState<"ahad" | "sana" | "">(party.side || "");
  const [guestForms, setGuestForms] = useState<GuestForm[]>(
    party.guests.map(guestToForm)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deletingGuestId, setDeletingGuestId] = useState<number | null>(null);
  const [confirmDeleteGuest, setConfirmDeleteGuest] = useState<number | null>(null);

  function updateGuestForm(index: number, updates: Partial<GuestForm>) {
    setGuestForms((prev) =>
      prev.map((g, i) => (i === index ? { ...g, ...updates } : g))
    );
  }

  function toggleEvent(guestIndex: number, eventId: number) {
    setGuestForms((prev) =>
      prev.map((g, i) => {
        if (i !== guestIndex) return g;
        const ids = g.event_ids.includes(eventId)
          ? g.event_ids.filter((id) => id !== eventId)
          : [...g.event_ids, eventId];
        return { ...g, event_ids: ids };
      })
    );
  }

  function setGuestStatus(guestIndex: number, eventId: number, status: string) {
    setGuestForms((prev) =>
      prev.map((g, i) => {
        if (i !== guestIndex) return g;
        return { ...g, statuses: { ...g.statuses, [eventId]: status } };
      })
    );
  }

  function addNewGuest() {
    setGuestForms((prev) => [
      ...prev,
      {
        id: null,
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        event_ids: events.map((e) => e.id),
        statuses: {},
      },
    ]);
  }

  const handleDeleteGuest = useCallback(
    async (guestIndex: number) => {
      const guest = guestForms[guestIndex];
      if (guest.id) {
        setDeletingGuestId(guest.id);
        try {
          const res = await fetch(`/api/admin/guests/${guest.id}`, {
            method: "DELETE",
          });
          if (!res.ok) throw new Error("Failed to delete");
        } catch {
          setError("Failed to delete guest.");
          setDeletingGuestId(null);
          return;
        }
        setDeletingGuestId(null);
      }
      setGuestForms((prev) => prev.filter((_, i) => i !== guestIndex));
      setConfirmDeleteGuest(null);
      if (guest.id) onSaved();
    },
    [guestForms, onSaved]
  );

  const handleSave = useCallback(async () => {
    setError("");

    for (const g of guestForms) {
      if (g.event_ids.length === 0) {
        setError("Each guest must be invited to at least one event.");
        return;
      }
    }

    setSaving(true);
    try {
      // Update party name and side
      const partyRes = await fetch(`/api/admin/parties/${party.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: partyName.trim(),
          side: side || null,
        }),
      });
      if (!partyRes.ok) throw new Error("Failed to update party");

      // Update each existing guest and create new ones
      for (const g of guestForms) {
        if (g.id) {
          // Existing guest — update
          const res = await fetch(`/api/admin/guests/${g.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              first_name: g.first_name.trim() || undefined,
              last_name: g.last_name.trim() || undefined,
              email: g.email.trim() || undefined,
              phone: g.phone.trim() || undefined,
              address: g.address.trim() || undefined,
              city: g.city.trim() || undefined,
              state: g.state.trim() || undefined,
              zip: g.zip.trim() || undefined,
              event_ids: g.event_ids,
              side: side || null,
            }),
          });
          if (!res.ok) throw new Error("Failed to update guest");

          // Update invitation statuses
          const original = party.guests.find((og) => og.id === g.id);
          if (original) {
            for (const inv of original.invitations) {
              const newStatus = g.statuses[inv.event_id];
              if (newStatus && newStatus !== inv.status) {
                await fetch(`/api/admin/invitations/${inv.id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ status: newStatus }),
                });
              }
            }
          }
        } else {
          // New guest — add to party via a new party member endpoint
          // We'll create them by posting to the parties endpoint with the guest data
          const res = await fetch(`/api/admin/parties/${party.id}/guests`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              first_name: g.first_name.trim() || undefined,
              last_name: g.last_name.trim() || undefined,
              email: g.email.trim() || undefined,
              phone: g.phone.trim() || undefined,
              address: g.address.trim() || undefined,
              city: g.city.trim() || undefined,
              state: g.state.trim() || undefined,
              zip: g.zip.trim() || undefined,
              event_ids: g.event_ids,
            }),
          });
          if (!res.ok) throw new Error("Failed to add new guest");
        }
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }, [party, partyName, side, guestForms, onSaved, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 backdrop-blur-sm p-4 md:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-ivory rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-gold/10 md:max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gold/10 shrink-0">
          <h2 className="font-display text-xl text-charcoal">Edit Party</h2>
          <button
            onClick={onClose}
            className="text-stone-warm/40 hover:text-stone-warm transition-colors text-xl leading-none w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {error && (
            <div className="bg-blush/40 border border-blush-deep/30 text-charcoal-light text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* Party Name */}
          <div>
            <label className="label-caps block mb-2">Party Name</label>
            <input
              type="text"
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              placeholder="e.g. The Khan Family"
              className="admin-input"
            />
          </div>

          {/* Guest List Side */}
          <div>
            <label className="label-caps block mb-2">Guest List</label>
            <div className="side-picker-track">
              <button
                type="button"
                className={`side-picker-option ${side === "ahad" ? "side-picker-active" : ""}`}
                onClick={() => setSide(side === "ahad" ? "" : "ahad")}
              >
                {"Ahad's Side"}
              </button>
              <button
                type="button"
                className={`side-picker-option ${side === "sana" ? "side-picker-active" : ""}`}
                onClick={() => setSide(side === "sana" ? "" : "sana")}
              >
                {"Sana's Side"}
              </button>
            </div>
          </div>

          {/* Guest Forms */}
          {guestForms.map((guest, gi) => (
            <div
              key={guest.id ?? `new-${gi}`}
              className="bg-ivory-warm/60 rounded-2xl p-5 space-y-3 relative border border-gold/8"
            >
              <div className="flex items-center justify-between">
                <p className="label-caps">
                  {guest.id ? `Guest ${gi + 1}` : "New Guest"}
                  {!guest.first_name && !guest.last_name && guest.id && (
                    <span className="font-normal text-stone-warm/50 ml-1">(Plus One)</span>
                  )}
                </p>
                {guestForms.length > 1 && (
                  <>
                    {confirmDeleteGuest === gi ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-red-400">Sure?</span>
                        <button
                          onClick={() => handleDeleteGuest(gi)}
                          className="text-xs font-medium text-white bg-red-400 rounded-full px-3 py-1 hover:bg-red-500 transition-colors disabled:opacity-50"
                          disabled={deletingGuestId === guest.id}
                        >
                          {deletingGuestId === guest.id ? "..." : "Yes"}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteGuest(null)}
                          className="text-xs text-stone-warm hover:text-charcoal transition-colors"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteGuest(gi)}
                        className="text-stone-warm/40 hover:text-red-400 text-xs transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={guest.first_name}
                  onChange={(e) =>
                    updateGuestForm(gi, { first_name: e.target.value })
                  }
                  placeholder="First Name"
                  className="admin-input"
                />
                <input
                  type="text"
                  value={guest.last_name}
                  onChange={(e) =>
                    updateGuestForm(gi, { last_name: e.target.value })
                  }
                  placeholder="Last Name"
                  className="admin-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="email"
                  value={guest.email}
                  onChange={(e) =>
                    updateGuestForm(gi, { email: e.target.value })
                  }
                  placeholder="Email (optional)"
                  className="admin-input"
                />
                <input
                  type="tel"
                  value={guest.phone}
                  onChange={(e) =>
                    updateGuestForm(gi, { phone: e.target.value })
                  }
                  placeholder="Phone (optional)"
                  className="admin-input"
                />
              </div>

              {/* Event checkboxes + status */}
              <div>
                <label className="label-caps block mb-2">Events</label>
                <div className="space-y-2">
                  {events.map((event) => {
                    const isInvited = guest.event_ids.includes(event.id);
                    const currentStatus = guest.statuses[event.id] || "invited";
                    return (
                      <div key={event.id} className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer group min-w-[100px]">
                          <input
                            type="checkbox"
                            checked={isInvited}
                            onChange={() => toggleEvent(gi, event.id)}
                            className="admin-checkbox"
                          />
                          <span className="text-sm text-charcoal-light group-hover:text-charcoal transition-colors">
                            {event.name}
                          </span>
                        </label>
                        {isInvited && guest.id && (
                          <div className="flex gap-1">
                            {(["invited", "attending", "declined"] as const).map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => setGuestStatus(gi, event.id, s)}
                                className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all ${
                                  currentStatus === s
                                    ? s === "attending"
                                      ? "bg-forest/10 text-forest border border-forest/20"
                                      : s === "declined"
                                        ? "bg-red-50 text-red-400 border border-red-200"
                                        : "bg-gold/10 text-gold-dark border border-gold/20"
                                    : "text-stone-warm/50 hover:text-stone-warm"
                                }`}
                              >
                                {s === "invited" ? "Pending" : s === "attending" ? "Attending" : "Declined"}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Address */}
              <div className="border-t border-gold/8 pt-3">
                <label className="label-caps block mb-2">Address</label>
                <input
                  type="text"
                  value={guest.address}
                  onChange={(e) =>
                    updateGuestForm(gi, { address: e.target.value })
                  }
                  placeholder="Street address"
                  className="admin-input mb-2"
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={guest.city}
                    onChange={(e) =>
                      updateGuestForm(gi, { city: e.target.value })
                    }
                    placeholder="City"
                    className="admin-input"
                  />
                  <input
                    type="text"
                    value={guest.state}
                    onChange={(e) =>
                      updateGuestForm(gi, { state: e.target.value })
                    }
                    placeholder="State"
                    className="admin-input"
                  />
                  <input
                    type="text"
                    value={guest.zip}
                    onChange={(e) =>
                      updateGuestForm(gi, { zip: e.target.value })
                    }
                    placeholder="Zip"
                    className="admin-input"
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Add Guest Button */}
          <button
            onClick={addNewGuest}
            className="text-gold text-sm font-medium hover:text-gold-dark transition-colors"
          >
            + Add guest to this party
          </button>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-5 border-t border-gold/10 shrink-0">
          <button
            onClick={onClose}
            className="admin-btn-secondary"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="admin-btn-primary"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
