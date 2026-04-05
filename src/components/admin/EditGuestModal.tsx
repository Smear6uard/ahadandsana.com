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

export default function EditGuestModal({
  guest,
  events,
  onClose,
  onSaved,
}: {
  guest: GuestData;
  events: EventOption[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [firstName, setFirstName] = useState(guest.first_name);
  const [lastName, setLastName] = useState(guest.last_name);
  const [email, setEmail] = useState(guest.email || "");
  const [phone, setPhone] = useState(guest.phone || "");
  const [address, setAddress] = useState(guest.address || "");
  const [city, setCity] = useState(guest.city || "");
  const [state, setState] = useState(guest.state || "");
  const [zip, setZip] = useState(guest.zip || "");
  const [eventIds, setEventIds] = useState<number[]>(
    guest.invitations.map((inv) => inv.event_id)
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");

  function toggleEvent(eventId: number) {
    setEventIds((prev) =>
      prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId]
    );
  }

  const handleSave = useCallback(async () => {
    setError("");
    if (!firstName.trim() || !lastName.trim()) {
      setError("First and last name are required.");
      return;
    }
    if (eventIds.length === 0) {
      setError("Guest must be invited to at least one event.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/guests/${guest.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null,
          address: address.trim() || null,
          city: city.trim() || null,
          state: state.trim() || null,
          zip: zip.trim() || null,
          event_ids: eventIds,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }, [firstName, lastName, email, phone, address, city, state, zip, eventIds, guest.id, onSaved, onClose]);

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/guests/${guest.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      onSaved();
      onClose();
    } catch {
      setError("Failed to delete guest.");
    } finally {
      setDeleting(false);
    }
  }, [guest.id, onSaved, onClose]);

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gold/10">
          <h2 className="font-display text-xl text-charcoal">Edit Guest</h2>
          <button
            onClick={onClose}
            className="text-stone-warm/40 hover:text-stone-warm transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-blush/40 border border-blush-deep/30 text-charcoal-light text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-caps block mb-2">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="admin-input"
              />
            </div>
            <div>
              <label className="label-caps block mb-2">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="admin-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-caps block mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Optional"
                className="admin-input"
              />
            </div>
            <div>
              <label className="label-caps block mb-2">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Optional"
                className="admin-input"
              />
            </div>
          </div>

          {/* Event checkboxes */}
          <div>
            <label className="label-caps block mb-2">Invited to</label>
            <div className="flex gap-5">
              {events.map((event) => (
                <label
                  key={event.id}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={eventIds.includes(event.id)}
                    onChange={() => toggleEvent(event.id)}
                    className="admin-checkbox"
                  />
                  <span className="text-sm text-charcoal-light group-hover:text-charcoal transition-colors">
                    {event.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Address */}
          <div className="border-t border-gold/8 pt-4">
            <label className="label-caps block mb-2">Address</label>
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

          {/* Delete section */}
          <div className="border-t border-gold/8 pt-4">
            {confirmDelete ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-red-400">Are you sure?</span>
                <button
                  onClick={handleDelete}
                  className="px-4 py-1.5 text-sm font-medium text-white bg-red-400 rounded-full hover:bg-red-500 transition-colors disabled:opacity-50"
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Yes, delete"}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-sm text-stone-warm hover:text-charcoal transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-sm text-red-300 hover:text-red-400 transition-colors"
              >
                Delete this guest
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-5 border-t border-gold/10">
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
