"use client";

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

export default function StatsCards({ stats }: { stats: Stats | null }) {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="admin-card p-6 animate-pulse">
            <div className="h-2.5 bg-gold/10 rounded w-20 mb-4" />
            <div className="h-8 bg-gold/10 rounded w-14" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Total Guests" value={stats.total_guests} />
      <StatCard label="Total Parties" value={stats.total_parties} />

      {stats.by_event.map((event) => (
        <div key={event.event_id} className="admin-card p-6">
          <p className="label-caps mb-4">{event.event_name}</p>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl text-charcoal">
              {event.attending}
            </span>
            <span className="text-xs text-stone-warm tracking-wide">
              attending
            </span>
          </div>
          <div className="flex gap-3 mt-3 text-xs text-stone-warm">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gold/50" />
              {event.pending} pending
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blush-deep/50" />
              {event.declined} declined
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="admin-card p-6">
      <p className="label-caps mb-3">{label}</p>
      <p className="font-display text-4xl text-charcoal">{value}</p>
    </div>
  );
}
