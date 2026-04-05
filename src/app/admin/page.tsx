"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import AddGuestModal from "@/components/admin/AddGuestModal";
import GuestTable from "@/components/admin/GuestTable";
import StatsCards from "@/components/admin/StatsCards";

interface EventStat {
  event_id: number;
  event_name: string;
  invited: number;
  attending: number;
  declined: number;
  pending: number;
}

interface Stats {
  total_guests: number;
  total_parties: number;
  by_event: EventStat[];
}

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
  side: "ahad" | "sana" | null;
  guests: GuestData[];
}

interface EventOption {
  id: number;
  name: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [parties, setParties] = useState<Party[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, partiesRes, eventsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/parties"),
        fetch("/api/rsvp/events"),
      ]);

      if (statsRes.status === 401 || partiesRes.status === 401) {
        router.push("/admin/login");
        return;
      }

      const [statsData, partiesData, eventsData] = await Promise.all([
        statsRes.json(),
        partiesRes.json(),
        eventsRes.json(),
      ]);

      setStats(statsData);
      setParties(partiesData);
      setEvents(
        eventsData.map((e: { id: number; name: string }) => ({
          id: e.id,
          name: e.name,
        }))
      );
    } catch {
      // If fetch fails entirely, might not be authenticated
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  if (loading) {
    return (
      <div className="admin-layout flex items-center justify-center min-h-screen">
        <div className="loading-dots">
          <span />
          <span />
          <span />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Top Bar */}
      <header className="bg-ivory/80 backdrop-blur-md border-b border-gold/10 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-baseline gap-2">
            <h1 className="font-display text-xl sm:text-2xl text-charcoal tracking-wide">
              Ahad &amp; Sana
            </h1>
            <span className="text-stone-warm text-xs tracking-widest uppercase font-medium hidden sm:inline">
              Guest Manager
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="admin-btn-primary"
            >
              + Add Guest
            </button>
            <button
              onClick={handleLogout}
              className="admin-btn-secondary"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <StatsCards stats={stats} />
        <GuestTable parties={parties} events={events} onRefresh={fetchData} />
      </main>

      {/* Add Guest Modal */}
      {showAddModal && (
        <AddGuestModal
          events={events}
          onClose={() => setShowAddModal(false)}
          onSaved={fetchData}
        />
      )}
    </div>
  );
}
