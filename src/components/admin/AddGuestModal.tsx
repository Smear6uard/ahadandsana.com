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

      if (!partyName.trim()) {
        setError("Party name is required.");
        return;
      }

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
            party_name: partyName.trim(),
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
    [partyName, guests, address, city, state, zip, onSaved, onClose]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Add Guest Party
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {/* Party Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Party Name
            </label>
            <input
              type="text"
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              placeholder="e.g. The Khan Family"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Guest Rows */}
          {guests.map((guest, gi) => (
            <div
              key={gi}
              className="bg-gray-50 rounded-xl p-4 space-y-3 relative"
            >
              {guests.length > 1 && (
                <button
                  onClick={() => removeGuestRow(gi)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-sm"
                  title="Remove guest"
                >
                  ×
                </button>
              )}
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Guest {gi + 1}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={guest.first_name}
                  onChange={(e) =>
                    updateGuest(gi, { first_name: e.target.value })
                  }
                  placeholder="First Name"
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <input
                  type="text"
                  value={guest.last_name}
                  onChange={(e) =>
                    updateGuest(gi, { last_name: e.target.value })
                  }
                  placeholder="Last Name"
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="email"
                  value={guest.email}
                  onChange={(e) => updateGuest(gi, { email: e.target.value })}
                  placeholder="Email (optional)"
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <input
                  type="tel"
                  value={guest.phone}
                  onChange={(e) => updateGuest(gi, { phone: e.target.value })}
                  placeholder="Phone (optional)"
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              {/* Event checkboxes */}
              <div className="flex gap-4 mt-2">
                {events.map((event) => (
                  <label
                    key={event.id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={guest.event_ids.includes(event.id)}
                      onChange={() => toggleEvent(gi, event.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{event.name}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={addGuestRow}
            className="text-blue-600 text-sm font-medium hover:text-blue-700"
          >
            + Add another guest to this party
          </button>

          {/* Address */}
          <div className="border-t border-gray-100 pt-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
              Address (shared by party — optional)
            </p>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street address"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 mb-3"
            />
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="State"
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <input
                type="text"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                placeholder="Zip"
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={() => handleSave(true)}
            className="px-4 py-2.5 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
            disabled={saving}
          >
            {saving ? "Saving…" : "Save & Add Another"}
          </button>
          <button
            onClick={() => handleSave(false)}
            className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={saving}
          >
            {saving ? "Saving…" : "Save & Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
