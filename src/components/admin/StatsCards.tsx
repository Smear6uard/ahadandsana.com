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
          <div
            key={i}
            className="bg-white rounded-xl p-5 border border-gray-100 animate-pulse"
          >
            <div className="h-3 bg-gray-100 rounded w-20 mb-3" />
            <div className="h-7 bg-gray-100 rounded w-12" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Summary cards */}
      <StatCard label="Total Guests" value={stats.total_guests} />
      <StatCard label="Total Parties" value={stats.total_parties} />

      {/* Per-event cards */}
      {stats.by_event.map((event) => (
        <div
          key={event.event_id}
          className="bg-white rounded-xl p-5 border border-gray-100 col-span-1"
        >
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
            {event.event_name}
          </p>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-semibold text-gray-900">
              {event.attending}
            </span>
            <span className="text-xs text-gray-400">attending</span>
          </div>
          <div className="flex gap-3 mt-2 text-xs text-gray-500">
            <span>{event.pending} pending</span>
            <span>·</span>
            <span>{event.declined} declined</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
        {label}
      </p>
      <p className="text-3xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}
