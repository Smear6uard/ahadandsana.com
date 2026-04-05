"use client";

import { useCallback, useState } from "react";

interface EventOption {
  id: number;
  name: string;
}

interface GuestRow {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  event_ids: number[];
}

const emptyGuest = (): GuestRow => ({
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  event_ids: [],
});

export default function AddGuestModal({
  events,
  onClose,
  onSaved,
}: {
  events: EventOption[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [partyName, setPartyName] = useState("");
  const [side, setSide] = useState<"ahad" | "sana" | "">("");
  const [guests, setGuests] = useState<GuestRow[]>([emptyGuest()]);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateGuest(index: number, updates: Partial<GuestRow>) {
    setGuests((prev) =>
      prev.map((g, i) => (i === index ? { ...g, ...updates } : g))
    );
  }

  function toggleEvent(guestIndex: number, eventId: number) {
    setGuests((prev) =>
      prev.map((g, i) => {
        if (i !== guestIndex) return g;
        const ids = g.event_ids.includes(eventId)
          ? g.event_ids.filter((id) => id !== eventId)
          : [...g.event_ids, eventId];
        return { ...g, event_ids: ids };
      })
    );
  }

  function addGuestRow() {
    setGuests((prev) => [...prev, emptyGuest()]);
  }

  function removeGuestRow(index: number) {
    if (guests.length <= 1) return;
    setGuests((prev) => prev.filter((_, i) => i !== index));
  }

  const handleSave = useCallback(
    async (addAnother: boolean) => {
      setError("");

      for (const g of guests) {
        if (!g.first_name.trim() || !g.last_name.trim()) {
          setError("All guests must have a first and last name.");
          return;
        }
        if (g.event_ids.length === 0) {
          setError("Each guest must be invited to at least one event.");
          return;
        }
      }

      setSaving(true);

      try {
        const res = await fetch("/api/admin/parties", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            party_name: partyName.trim() || undefined,
            side: side || undefined,
            guests: guests.map((g) => ({
              first_name: g.first_name.trim(),
              last_name: g.last_name.trim(),
              email: g.email.trim() || undefined,
              phone: g.phone.trim() || undefined,
              address: address.trim() || undefined,
              city: city.trim() || undefined,
              state: state.trim() || undefined,
              zip: zip.trim() || undefined,
              event_ids: g.event_ids,
            })),
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to save");
        }

        onSaved();
        if (addAnother) {
          setPartyName("");
          setSide("");
          setGuests([emptyGuest()]);
          setAddress("");
          setCity("");
          setState("");
          setZip("");
        } else {
          onClose();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setSaving(false);
      }
    },
    [partyName, side, guests, address, city, state, zip, onSaved, onClose]
  );

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gold/10">
          <h2 className="font-display text-xl text-charcoal">
            Add Guest Party
          </h2>
          <button
            onClick={onClose}
            className="text-stone-warm/40 hover:text-stone-warm transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-blush/40 border border-blush-deep/30 text-charcoal-light text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* Party Name */}
          <div>
            <label className="label-caps block mb-2">Party Name <span className="font-normal text-stone-warm/50">(optional)</span></label>
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

          {/* Guest Rows */}
          {guests.map((guest, gi) => (
            <div
              key={gi}
              className="bg-ivory-warm/60 rounded-2xl p-5 space-y-3 relative border border-gold/8"
            >
              {guests.length > 1 && (
                <button
                  onClick={() => removeGuestRow(gi)}
                  className="absolute top-3 right-4 text-stone-warm/40 hover:text-red-400 text-sm transition-colors"
                  title="Remove guest"
                >
                  ×
                </button>
              )}
              <p className="label-caps">Guest {gi + 1}</p>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={guest.first_name}
                  onChange={(e) =>
                    updateGuest(gi, { first_name: e.target.value })
                  }
                  placeholder="First Name"
                  className="admin-input"
                />
                <input
                  type="text"
                  value={guest.last_name}
                  onChange={(e) =>
                    updateGuest(gi, { last_name: e.target.value })
                  }
                  placeholder="Last Name"
                  className="admin-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="email"
                  value={guest.email}
                  onChange={(e) => updateGuest(gi, { email: e.target.value })}
                  placeholder="Email (optional)"
                  className="admin-input"
                />
                <input
                  type="tel"
                  value={guest.phone}
                  onChange={(e) => updateGuest(gi, { phone: e.target.value })}
                  placeholder="Phone (optional)"
                  className="admin-input"
                />
              </div>
              {/* Event checkboxes */}
              <div className="flex gap-5 mt-1">
                {events.map((event) => (
                  <label
                    key={event.id}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={guest.event_ids.includes(event.id)}
                      onChange={() => toggleEvent(gi, event.id)}
                      className="admin-checkbox"
                    />
                    <span className="text-sm text-charcoal-light group-hover:text-charcoal transition-colors">
                      {event.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={addGuestRow}
            className="text-gold text-sm font-medium hover:text-gold-dark transition-colors"
          >
            + Add another guest to this party
          </button>

          {/* Address */}
          <div className="border-t border-gold/8 pt-5">
            <p className="label-caps mb-3">
              Address (shared by party — optional)
            </p>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street address"
              className="admin-input mb-3"
            />
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="admin-input"
              />
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="State"
                className="admin-input"
              />
              <input
                type="text"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                placeholder="Zip"
                className="admin-input"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 px-6 py-5 border-t border-gold/10">
          <button
            onClick={onClose}
            className="admin-btn-secondary"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={() => handleSave(true)}
            className="admin-btn-outline"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save & Add Another"}
          </button>
          <button
            onClick={() => handleSave(false)}
            className="admin-btn-primary"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save & Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
