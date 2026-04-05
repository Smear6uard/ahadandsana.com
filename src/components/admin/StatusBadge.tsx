"use client";

type Status = "attending" | "invited" | "declined";

const statusConfig: Record<Status, { label: string; className: string }> = {
  attending: { label: "Attending", className: "status-attending" },
  invited: { label: "Pending", className: "status-invited" },
  declined: { label: "Declined", className: "status-declined" },
};

export default function StatusBadge({
  status,
  onChange,
}: {
  status: Status;
  onChange?: (newStatus: Status) => void;
}) {
  const config = statusConfig[status] ?? {
    label: status,
    className: "status-not-invited",
  };

  if (!onChange) {
    return <span className={`status-badge ${config.className}`}>{config.label}</span>;
  }

  return (
    <select
      value={status}
      onChange={(e) => onChange(e.target.value as Status)}
      className={`status-badge ${config.className} cursor-pointer border-0 appearance-none pr-5 bg-[length:12px] bg-[right_4px_center] bg-no-repeat`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath d='M3 5l3 3 3-3' fill='none' stroke='%236B7280' stroke-width='1.5'/%3E%3C/svg%3E")`,
      }}
    >
      <option value="attending">Attending</option>
      <option value="invited">Pending</option>
      <option value="declined">Declined</option>
    </select>
  );
}

export function NotInvitedBadge() {
  return <span className="status-badge status-not-invited">—</span>;
}
